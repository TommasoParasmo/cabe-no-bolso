// Roteiro completo (com horários e mais dicas) pago no Pix: Mercado Pago, API de Orders.
// Só liga com MP_ACCESS_TOKEN na Cloudflare; sem ela, o app não oferece o roteiro completo.
// Sem banco: a cobrança leva no external_reference a "impressão digital" do pedido de roteiro,
// e a liberação confere na hora com o Mercado Pago que a order foi paga e é daquele roteiro.
import { validarPedido } from "./roteiro.js";
import { lerCache, gravarCache } from "./cache.js";

export const PRECO = "14.90";
// Menor preço que já vendemos (R$ 9,90 até 08/10/2026). A order paga vale pelo valor com que foi criada:
// só o nosso servidor cria orders (sempre com o PRECO da época), então quem pagou o preço antigo continua liberado
// (Pix pendente reaberto, "Já paguei" depois de falha, recuperação). O piso só barra order de valor estranho.
const PISO = "9.90";
const API = "https://api.mercadopago.com/v1/orders";
// Validade do Pix: o Mercado Pago aceita de 30 minutos a 30 dias (padrão 24 h). Uma hora dá folga e o app mostra o horário.
export const VALIDADE_MIN = 60;
const EMAIL = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]+\.[a-z]{2,}$/i;

export class PixInvalido extends Error {}
export class PixNaoPago extends Error {}

export const pixLigado = env => Boolean(env?.MP_ACCESS_TOKEN);

// Mesmo pedido de roteiro, mesma referência (40 letras, cabe no external_reference do Mercado Pago).
export async function referencia(body) {
  const p = validarPedido(body);
  const chave = JSON.stringify({ ...p, dest: p.dest.n, paradas: p.paradas.map(x => [x.dest.n, x.noites]) });
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(chave));
  return [...new Uint8Array(hash)].slice(0, 20).map(b => b.toString(16).padStart(2, "0")).join("");
}

const cabecalho = token => ({ Authorization: `Bearer ${token}`, "content-type": "application/json" });

// `pedido`: o mesmo corpo que vai para /api/roteiro, já na ordem de cidades escolhida.
export async function criarPix({ pedido, email }, env, fetchFn = globalThis.fetch) {
  const ref = await referencia(pedido);
  email = String(email ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) throw new PixInvalido("Confira o e-mail.");
  const inicio = Date.now();
  const r = await fetchFn(API, {
    method: "POST",
    headers: { ...cabecalho(env.MP_ACCESS_TOKEN), "X-Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      type: "online", processing_mode: "automatic", total_amount: PRECO, external_reference: ref,
      description: "Roteiro Detalhado Vai Dar Viagem",
      transactions: { payments: [{ amount: PRECO, payment_method: { id: "pix", type: "bank_transfer" }, expiration_time: `PT${VALIDADE_MIN}M` }] },
      payer: { email }
    })
  });
  const order = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(order).slice(0, 300)}`);
  const pag = order.transactions?.payments?.[0] || {};
  const pm = pag.payment_method || {};
  if (!pm.qr_code) throw new Error("Mercado Pago sem QR Code do Pix");
  // Sem a data na resposta, conta a partir de antes do pedido: o horário mostrado nunca passa do real.
  const expiraEm = pag.date_of_expiration || new Date(inicio + VALIDADE_MIN * 60000).toISOString();
  return { id: order.id, copiaECola: pm.qr_code, qrCode: pm.qr_code_base64 || null, link: pm.ticket_url || null, preco: Number(PRECO), expiraEm };
}

async function lerOrder(id, env, fetchFn) {
  if (!/^ORD[0-9A-Z]{6,40}$/i.test(String(id))) throw new PixInvalido("Pagamento não encontrado.");
  const r = await fetchFn(`${API}/${id}`, { headers: cabecalho(env.MP_ACCESS_TOKEN) });
  if (r.status === 404) throw new PixInvalido("Pagamento não encontrado.");
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}`);
  return r.json();
}

const pago = o => o.status === "processed" && Number(o.total_amount) >= Number(PISO);

// Pix sem pagamento passado do prazo. O Mercado Pago só muda a order para expirada dias depois,
// então o prazo do próprio pagamento é que decide quando o app oferece um Pix novo.
const venceu = (o, agora) => {
  const prazo = Date.parse(o.transactions?.payments?.[0]?.date_of_expiration);
  return prazo < agora;
};

// Situação para o app: "pago", "esperando" ou "expirado" (expirada, cancelada ou vencida: precisa gerar outro Pix).
export async function situacaoPix(id, env, fetchFn = globalThis.fetch, agora = Date.now()) {
  const o = await lerOrder(id, env, fetchFn);
  if (pago(o)) return { status: "pago" };
  return { status: ["expired", "canceled", "failed"].includes(o.status) || venceu(o, agora) ? "expirado" : "esperando" };
}

// Confere que a order foi paga e é deste roteiro. Devolve a referência.
export async function conferirPagamento(id, body, env, fetchFn = globalThis.fetch) {
  const o = await lerOrder(id, env, fetchFn);
  const ref = await referencia(body);
  if (!pago(o)) throw new PixNaoPago("O pagamento ainda não caiu.");
  if (o.external_reference !== ref) throw new PixInvalido("Esse pagamento é de outro roteiro.");
  return ref;
}

// ---- Recuperar o roteiro pago em outro aparelho ----
// O pedido (e a tela da viagem, para remontar o resultado) fica 30 dias no KV com o número da order.
// Quem pagou e perdeu o roteiro (trocou de aparelho, limpou o navegador) recupera com o número do
// pedido e o e-mail do Pix, conferidos no Mercado Pago. Só o e-mail nunca basta: mostraria a viagem de outra pessoa.
export const GUARDA_DIAS = 30;
const MAX_GUARDADO = 100_000;
const RECUPERAR_IP_DIA = 20;
const chavePedido = id => `pedido:${String(id).toUpperCase()}`;

export class PedidoNaoGuardado extends Error {}

// A consulta da order no Mercado Pago não devolve o e-mail de quem pagou. Guardamos só um código
// (SHA-256 do número do pedido com o e-mail), que confere o e-mail digitado sem permitir descobrir qual é.
async function codigoEmail(id, email) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${String(id).toUpperCase()}:${String(email).trim().toLowerCase()}`));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function guardarPedido(id, { pedido, viagem, email }, env) {
  if (!env?.LEADS) return false;
  const tela = viagem && typeof viagem === "object" ? viagem : null;
  const base = { pedido, conferir: await codigoEmail(id, email), criado: new Date().toISOString() };
  let valor = JSON.stringify({ ...base, viagem: tela });
  // Tela grande demais (não deveria acontecer) não entra; o pedido sozinho ainda refaz o roteiro.
  if (valor.length > MAX_GUARDADO) valor = JSON.stringify({ ...base, viagem: null });
  await env.LEADS.put(chavePedido(id), valor, { expirationTtl: GUARDA_DIAS * 86400 });
  return true;
}

// Freio contra quem tenta adivinhar pedidos: tentativas por IP por dia.
export async function podeRecuperar(ip) {
  if (!ip) return true;
  const chave = `https://cache.cabenobolso/recuperar-limite?${new URLSearchParams({ ip, d: new Date().toISOString().slice(0, 10) })}`;
  const n = (await lerCache(chave))?.n || 0;
  if (n >= RECUPERAR_IP_DIA) return false;
  await gravarCache(chave, { n: n + 1 }, 86400);
  return true;
}

// Devolve { pedido, viagem } só se a order existe, é do e-mail informado, foi paga e é daquele pedido.
export async function recuperarPedido(body, env, fetchFn = globalThis.fetch) {
  const id = String(body?.id ?? "").trim().toUpperCase();
  const email = String(body?.email ?? "").trim().toLowerCase();
  // Mesma resposta para pedido inexistente e e-mail diferente: não revela se um número existe.
  const naoAchou = () => new PixInvalido("Não achamos um pedido com esse número e esse e-mail. Confira os dois ou escreva para contato@vaidarviagem.com.br.");
  if (email.length > 254 || !EMAIL.test(email)) throw naoAchou();
  let o;
  try { o = await lerOrder(id, env, fetchFn); } catch (e) { throw e instanceof PixInvalido ? naoAchou() : e; }
  // Sem o pedido guardado não dá para conferir o e-mail: mesma resposta, para não revelar se o número existe.
  const guardado = await env.LEADS?.get(chavePedido(id), "json").catch(() => null);
  if (!guardado?.pedido || guardado.conferir !== await codigoEmail(id, email)) throw naoAchou();
  // Se o Mercado Pago devolver o e-mail, ele também tem que bater.
  if (o.payer?.email && String(o.payer.email).trim().toLowerCase() !== email) throw naoAchou();
  if (!pago(o)) throw new PixNaoPago("Esse pedido ainda não foi pago. Se você acabou de pagar, espere um minuto e tente de novo.");
  if (await referencia(guardado.pedido).catch(() => null) !== o.external_reference) {
    throw new PedidoNaoGuardado("Achamos o pagamento, mas não o pedido. Escreva para contato@vaidarviagem.com.br com o número do pedido.");
  }
  // valor: o que a pessoa pagou nesse pedido (a tela de confirmação mostra este, não o preço de hoje).
  return { pedido: guardado.pedido, viagem: guardado.viagem || null, valor: Number(o.total_amount) };
}
