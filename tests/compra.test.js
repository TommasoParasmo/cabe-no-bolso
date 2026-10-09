import { test } from "node:test";
import assert from "node:assert/strict";
import { precoDe, criarCompra, situacaoCompra, compraPaga, recuperarCompra, motivoRecusa, CompraInvalida, NaoPago } from "../server/compra.js";
import { htmlDaCompra, pdfDaCompra, nomeArquivo } from "../server/entrega.js";

// KV falso (LEADS): get com "json" e "arrayBuffer", put e o que foi gravado.
function kv() {
  const m = new Map();
  return {
    m,
    async get(k, tipo) { const v = m.get(k); if (v === undefined) return null; return tipo === "json" ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, v); }
  };
}
// Mercado Pago falso: a order criada responde como `criada`; a consulta, como `consultada` (com a mesma referência).
function mercadoPago(criada, consultada = null, status = 200) {
  const pedidos = [];
  let ref = null;
  const fetchFn = async (url, opts = {}) => {
    const corpo = opts.body && JSON.parse(opts.body);
    pedidos.push({ url, ...opts, corpo });
    if (opts.method === "POST") { ref = corpo.external_reference; return new Response(JSON.stringify({ ...criada, external_reference: ref }), { status }); }
    return new Response(JSON.stringify({ ...consultada, external_reference: consultada?.external_reference ?? ref }), { status: 200 });
  };
  return { fetchFn, pedidos };
}
const pixCriado = { id: "ORD01PDF123", status: "action_required", total_amount: "29.90",
  transactions: { payments: [{ date_of_expiration: "2026-10-09T13:00:00Z", payment_method: { qr_code: "000201pix", qr_code_base64: "iVBOR" } }] } };
const pago = { id: "ORD01PDF123", status: "processed", total_amount: "29.90" };
const pedido = { destino: "orlando", nome: "Maria Aparecida", email: " Maria@Email.com ", valores: { pessoas: 4 } };
const OUT = Date.parse("2026-10-09T12:00:00-03:00");

test("compra: preço promocional de outubro até 31/10 e preço cheio depois", () => {
  assert.deepEqual(precoDe("orlando", {}, OUT), { destino: "orlando", promocao: true, ate: "2026-11-01T03:00:00.000Z", pix: 29.9, cartao: 34.9 });
  assert.deepEqual(precoDe("chile", {}, Date.parse("2026-10-31T23:59:59-03:00")).promocao, true);
  assert.deepEqual(precoDe("chile", {}, Date.parse("2026-11-01T00:00:00-03:00")), { destino: "chile", promocao: false, pix: 39.9, cartao: 44.9 });
  // OFERTA_PDF na Cloudflare troca o preço sem mexer no código.
  assert.equal(precoDe("jerusalem", { OFERTA_PDF: '{"pix":"19.90"}' }, OUT).pix, 19.9);
  assert.throws(() => precoDe("narnia", {}), CompraInvalida);
  assert.throws(() => precoDe("__proto__", {}), CompraInvalida);
});

test("compra: Pix com o preço da hora, referência própria e pedido guardado sem o e-mail", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const { fetchFn, pedidos } = mercadoPago(pixCriado);
  const r = await criarCompra(pedido, env, fetchFn);
  assert.equal(r.id, "ORD01PDF123");
  assert.match(r.chave, /^[0-9a-f]{32}$/);
  assert.equal(r.copiaECola, "000201pix");
  const corpo = pedidos[0].corpo;
  assert.equal(corpo.total_amount, precoDe("orlando", {}).pix.toFixed(2));
  assert.deepEqual(corpo.transactions.payments[0].payment_method, { id: "pix", type: "bank_transfer" });
  assert.match(corpo.external_reference, /^pdf_orlando_[0-9a-f]{24}$/);
  assert.equal(corpo.payer.email, "maria@email.com");
  const guardado = env.LEADS.m.get("compra:ORD01PDF123");
  assert.ok(!guardado.includes("maria@email.com"), "o e-mail não fica no KV");
  assert.ok(!guardado.includes(r.chave), "a chave fica só como hash");
  // Dados ruins não chegam ao Mercado Pago.
  await assert.rejects(criarCompra({ ...pedido, email: "x" }, env, fetchFn), CompraInvalida);
  await assert.rejects(criarCompra({ ...pedido, nome: "M" }, env, fetchFn), CompraInvalida);
  await assert.rejects(criarCompra({ ...pedido, destino: "rio" }, env, fetchFn), CompraInvalida);
  // Preço que a pessoa viu diferente do de agora (a promoção acabou com a página aberta): não cobra.
  await assert.rejects(criarCompra({ ...pedido, precoVisto: 1 }, env, fetchFn), /O preço mudou para R\$/);
  assert.equal(pedidos.length, 1);
  await criarCompra({ ...pedido, precoVisto: precoDe("orlando", {}).pix }, env, fetchFn);
  assert.equal(pedidos.length, 2);
});

test("compra: cartão só crédito à vista, com o token do Mercado Pago, e recusa em português", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const aprovado = mercadoPago({ ...pago, total_amount: "34.90" });
  const r = await criarCompra({ ...pedido, forma: "cartao", cartao: { token: "abc123TOKEN", payment_method_id: "master", installments: 12 } }, env, aprovado.fetchFn);
  assert.equal(r.status, "pago");
  const pm = aprovado.pedidos[0].corpo.transactions.payments[0];
  assert.deepEqual(pm.payment_method, { id: "master", type: "credit_card", token: "abc123TOKEN", installments: 1 });
  assert.equal(pm.amount, precoDe("orlando", {}).cartao.toFixed(2));
  const recusado = mercadoPago({ id: "ORD01PDF999", status: "failed", status_detail: "cc_rejected_insufficient_amount" });
  await assert.rejects(criarCompra({ ...pedido, forma: "cartao", cartao: { token: "abc123TOKEN", payment_method_id: "visa" } }, env, recusado.fetchFn), /limite/);
  await assert.rejects(criarCompra({ ...pedido, forma: "cartao", cartao: { token: "<x>", payment_method_id: "visa" } }, env, recusado.fetchFn), CompraInvalida);
  assert.match(motivoRecusa("cc_rejected_bad_filled_security_code"), /código de segurança/);
});

test("compra: libera só com a chave certa, order paga e da mesma compra; conta a venda uma vez", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const mp = mercadoPago(pixCriado, pago);
  const { id, chave } = await criarCompra(pedido, env, mp.fetchFn);
  assert.deepEqual(await situacaoCompra(id, chave, env, mp.fetchFn), { status: "pago" });
  assert.deepEqual(await situacaoCompra(id, chave, env, mp.fetchFn), { status: "pago" });
  assert.deepEqual(JSON.parse(env.LEADS.m.get("vendas:pdf:orlando")).n, 1);
  await assert.rejects(compraPaga(id, "0".repeat(32), env, mp.fetchFn), CompraInvalida);
  await assert.rejects(compraPaga(id, "nada", env, mp.fetchFn), CompraInvalida);
  // Order paga de outra coisa (o Roteiro Detalhado do app, outra referência) não libera o PDF.
  const outra = mercadoPago(pixCriado, { ...pago, external_reference: "a".repeat(40) });
  await assert.rejects(compraPaga(id, chave, env, outra.fetchFn), CompraInvalida);
  const ref = JSON.parse(env.LEADS.m.get("compra:ORD01PDF123")).ref;
  const esperando = mercadoPago(pixCriado, { ...pago, external_reference: ref, status: "action_required" });
  assert.deepEqual(await situacaoCompra(id, chave, env, esperando.fetchFn), { status: "esperando" });
  const venceu = mercadoPago(pixCriado, { ...pago, external_reference: ref, status: "expired" });
  assert.deepEqual(await situacaoCompra(id, chave, env, venceu.fetchFn), { status: "expirado" });
  await assert.rejects(compraPaga(id, chave, env, mercadoPago(pixCriado, { ...pago, external_reference: ref, total_amount: "1.00" }).fetchFn), NaoPago);
  // Pix pendente depois do prazo do pagamento: expirado, mesmo com a order ainda "action_required".
  const vencido = { ...pago, external_reference: ref, status: "action_required", transactions: { payments: [{ date_of_expiration: "2026-10-09T13:00:00Z" }] } };
  assert.deepEqual(await situacaoCompra(id, chave, env, mercadoPago(pixCriado, vencido).fetchFn, Date.parse("2026-10-09T13:00:01Z")), { status: "expirado" });
  assert.deepEqual(await situacaoCompra(id, chave, env, mercadoPago(pixCriado, vencido).fetchFn, Date.parse("2026-10-09T12:59:00Z")), { status: "esperando" });
});

test("compra: a venda paga soma no anúncio de onde a pessoa veio (origem:AAAA-MM-DD), uma vez só", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const mp = mercadoPago(pixCriado, pago);
  const { id, chave } = await criarCompra({ ...pedido, utm: { fonte: "meta", anuncio: "orlando-familia" } }, env, mp.fetchFn);
  assert.equal(JSON.parse(env.LEADS.m.get("compra:ORD01PDF123")).origem, "meta:orlando-familia");
  const dia = () => [...env.LEADS.m.keys()].find(k => k.startsWith("origem:"));
  assert.equal(dia(), undefined, "Pix ainda não pago não conta");
  await situacaoCompra(id, chave, env, mp.fetchFn);
  await situacaoCompra(id, chave, env, mp.fetchFn);
  assert.deepEqual(JSON.parse(env.LEADS.m.get(dia())).pdf, { "meta:orlando-familia": 1 });
  // Sem utm (ou lixo no utm): conta como "direto".
  const env2 = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const c = await criarCompra({ ...pedido, utm: { fonte: "<script>" } }, env2, mp.fetchFn);
  await situacaoCompra(c.id, c.chave, env2, mp.fetchFn);
  assert.deepEqual(JSON.parse([...env2.LEADS.m.entries()].find(([k]) => k.startsWith("origem:"))[1]).pdf, { direto: 1 });
});

test("compra: preço configurado abaixo do da promoção libera a order paga nesse valor", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv(), OFERTA_PDF: '{"pix":"19.90"}' };
  const mp = mercadoPago(pixCriado, { ...pago, total_amount: "19.90" });
  const { id, chave } = await criarCompra(pedido, env, mp.fetchFn);
  assert.equal(mp.pedidos[0].corpo.total_amount, "19.90");
  assert.deepEqual(await situacaoCompra(id, chave, env, mp.fetchFn), { status: "pago" });
});

test("compra: recupera em outro aparelho com o número e o e-mail, e a chave antiga deixa de valer", async () => {
  const env = { MP_ACCESS_TOKEN: "tok", LEADS: kv() };
  const mp = mercadoPago(pixCriado, pago);
  const { id, chave } = await criarCompra(pedido, env, mp.fetchFn);
  await assert.rejects(recuperarCompra({ id, email: "outra@email.com" }, env, mp.fetchFn), CompraInvalida);
  const r = await recuperarCompra({ id: id.toLowerCase(), email: "MARIA@email.com" }, env, mp.fetchFn);
  assert.equal(r.destino, "orlando");
  assert.notEqual(r.chave, chave);
  assert.deepEqual(await situacaoCompra(id, r.chave, env, mp.fetchFn), { status: "pago" });
  await assert.rejects(compraPaga(id, chave, env, mp.fetchFn), CompraInvalida);
});

test("entrega: PDF do destino com o nome, fotos pelo site, guardado no KV e sem Browser Rendering vira página", async () => {
  const compra = { slug: "orlando", nome: "Maria <b>Aparecida</b>", valores: { pessoas: 4 } };
  const html = htmlDaCompra(compra);
  assert.match(html, /<head><base href="https:\/\/vaidarviagem\.com\.br\/">/);
  assert.ok(html.includes("Maria &lt;b&gt;Aparecida&lt;/b&gt;"));
  assert.ok(htmlDaCompra({ slug: "jerusalem", nome: "Ana", valores: {} }).includes("Jerusalém"));
  assert.match(htmlDaCompra(compra, true), /Salvar PDF/);
  assert.equal(nomeArquivo({ slug: "buenos-aires", nome: "José da Silva" }), "roteiro-buenos-aires-jose.pdf");

  const env = { CF_ACCOUNT_ID: "conta", CF_BROWSER_TOKEN: "t", LEADS: kv() };
  let chamadas = 0;
  const fetchFn = async (url, opts) => {
    chamadas++;
    assert.equal(url, "https://api.cloudflare.com/client/v4/accounts/conta/browser-run/pdf");
    assert.equal(JSON.parse(opts.body).pdfOptions.format, "a4");
    return new Response(new Uint8Array([37, 80, 68, 70]), { headers: { "content-type": "application/pdf" } });
  };
  const pdf = await pdfDaCompra("ORD01PDF123", compra, env, fetchFn);
  assert.equal(pdf.byteLength, 4);
  await pdfDaCompra("ORD01PDF123", compra, env, fetchFn);
  assert.equal(chamadas, 1, "a segunda vez vem do KV");
  assert.equal(await pdfDaCompra("ORD01PDF123", compra, { LEADS: kv() }, fetchFn), null);
});
