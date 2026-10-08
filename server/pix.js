// Roteiro completo pago no Pix (Mercado Pago, API de Orders). Só liga com MP_ACCESS_TOKEN na Cloudflare;
// sem ela, o roteiro sai inteiro de graça como antes.
// Sem banco: a cobrança leva no external_reference a "impressão digital" do pedido de roteiro,
// e a liberação confere na hora com o Mercado Pago que a order foi paga e é daquele roteiro.
import { validarPedido } from "./roteiro.js";
import { lerCache, gravarCache } from "./cache.js";

export const PRECO = "9.90";
const API = "https://api.mercadopago.com/v1/orders";
const EMAIL = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const DOIS_DIAS = 2 * 86400;

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

// Prévia grátis: o dia 1 inteiro; dos outros dias só o título. As dicas ficam para quem paga.
// O roteiro inteiro fica 2 dias no cache, para quem pagar receber exatamente o que viu na prévia.
export async function previa(roteiro, ref) {
  if (roteiro.dias.length < 2) return roteiro;
  await gravarCache(`https://cache.cabenobolso/pago/${ref}`, roteiro, DOIS_DIAS);
  const [primeiro, ...resto] = roteiro.dias;
  return {
    ...roteiro, dias: [primeiro], dicas: [],
    bloqueado: { ref, preco: Number(PRECO), dias: resto.map(d => ({ dia: d.dia, titulo: d.titulo, cidade: d.cidade })), dicas: roteiro.dicas.length }
  };
}

export const roteiroGuardado = ref => lerCache(`https://cache.cabenobolso/pago/${ref}`);

const cabecalho = token => ({ Authorization: `Bearer ${token}`, "content-type": "application/json" });

export async function criarPix({ ref, email }, env, fetchFn = globalThis.fetch) {
  if (!/^[0-9a-f]{40}$/.test(String(ref))) throw new PixInvalido("Monte o roteiro de novo antes de pagar.");
  email = String(email ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) throw new PixInvalido("Confira o e-mail.");
  const r = await fetchFn(API, {
    method: "POST",
    headers: { ...cabecalho(env.MP_ACCESS_TOKEN), "X-Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      type: "online", processing_mode: "automatic", total_amount: PRECO, external_reference: ref,
      description: "Roteiro completo Vai Dar Viagem",
      transactions: { payments: [{ amount: PRECO, payment_method: { id: "pix", type: "bank_transfer" } }] },
      payer: { email }
    })
  });
  const order = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(order).slice(0, 300)}`);
  const pm = order.transactions?.payments?.[0]?.payment_method || {};
  if (!pm.qr_code) throw new Error("Mercado Pago sem QR Code do Pix");
  return { id: order.id, copiaECola: pm.qr_code, qrCode: pm.qr_code_base64 || null, link: pm.ticket_url || null, preco: Number(PRECO) };
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
