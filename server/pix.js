// Roteiro completo (com horários e mais dicas) pago no Pix: Mercado Pago, API de Orders.
// Só liga com MP_ACCESS_TOKEN na Cloudflare; sem ela, o app não oferece o roteiro completo.
// Sem banco: a cobrança leva no external_reference a "impressão digital" do pedido de roteiro,
// e a liberação confere na hora com o Mercado Pago que a order foi paga e é daquele roteiro.
import { validarPedido } from "./roteiro.js";

export const PRECO = "9.90";
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

const pago = o => o.status === "processed" && Number(o.total_amount) >= Number(PRECO);

// Situação para o app: "pago", "esperando" ou "expirado" (expirada ou cancelada: precisa gerar outro Pix).
export async function situacaoPix(id, env, fetchFn = globalThis.fetch) {
  const o = await lerOrder(id, env, fetchFn);
  return { status: pago(o) ? "pago" : ["expired", "canceled", "failed"].includes(o.status) ? "expirado" : "esperando" };
}

// Confere que a order foi paga e é deste roteiro. Devolve a referência.
export async function conferirPagamento(id, body, env, fetchFn = globalThis.fetch) {
  const o = await lerOrder(id, env, fetchFn);
  const ref = await referencia(body);
  if (!pago(o)) throw new PixNaoPago("O pagamento ainda não caiu.");
  if (o.external_reference !== ref) throw new PixInvalido("Esse pagamento é de outro roteiro.");
  return ref;
}
