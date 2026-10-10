// Compra do Roteiro Detalhado + Pré-viagem das páginas por destino (PDF com o nome da pessoa e os valores da simulação).
// Checkout no próprio site, pelo Mercado Pago (API de Orders): Pix ou cartão de crédito à vista.
// O cartão é digitado no formulário do Mercado Pago (Card Payment Brick), que devolve um token de uso único:
// o número do cartão nunca passa pelo nosso servidor.
// Preço promocional de outubro de 2026: vale até OFERTA.ate (horário de Brasília) e depois passa ao preço "depois".
// O checkout mostra um cronômetro até essa data, que é real e igual para todo mundo.
// Tudo fica no KV (LEADS): compra:<ORD> (o pedido), vendas:pdf:<destino> (vendas pagas, para acompanhar) e venda:<ORD> (já contada).
// A venda paga também soma em origem:AAAA-MM-DD (tipo "pdf"), com o anúncio de onde a pessoa veio, como os roteiros.
import { lerCache, gravarCache } from "./cache.js";
import { lerOrigem, registrarOrigem } from "./uso.js";
import { guardarDadosMeta, enviarCompraMeta } from "./meta.js";

const API = "https://api.mercadopago.com/v1/orders";
export const DESTINOS_PDF = { jerusalem: "Jerusalém", orlando: "Orlando", chile: "Santiago do Chile", "buenos-aires": "Buenos Aires" };
// Preços em reais (texto com ponto, como o Mercado Pago pede). OFERTA_PDF na Cloudflare troca sem mexer no código,
// no mesmo formato JSON (ex.: {"ate":"2026-11-01T00:00:00-03:00","pix":"29.90","cartao":"34.90","depois":{"pix":"39.90","cartao":"44.90"}}).
export const OFERTA = { ate: "2026-11-01T00:00:00-03:00", pix: "29.90", cartao: "34.90", depois: { pix: "39.90", cartao: "44.90" } };
export const VALIDADE_MIN = 60;
const GUARDA_DIAS = 400;
const EMAIL = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const MAX_VALORES = 4000;
const COMPRAS_IP_HORA = 8;

export class CompraInvalida extends Error {}
export class NaoPago extends Error {}

export const compraLigada = env => Boolean(env?.MP_ACCESS_TOKEN && env?.LEADS);

function oferta(env) {
  try { return env?.OFERTA_PDF ? { ...OFERTA, ...JSON.parse(env.OFERTA_PDF) } : OFERTA; } catch { return OFERTA; }
}
const chaveVendas = slug => `vendas:pdf:${slug}`;
const chaveCompra = id => `compra:${String(id).toUpperCase()}`;
const destinoValido = slug => {
  if (!Object.hasOwn(DESTINOS_PDF, slug)) throw new CompraInvalida("Esse destino ainda não tem roteiro à venda.");
  return slug;
};

// Preço de agora: o que a página de oferta e o checkout mostram. `ate` só vem durante a promoção.
export function precoDe(slug, env, agora = Date.now()) {
  destinoValido(slug);
  const o = oferta(env);
  const fim = Date.parse(o.ate);
  const promocao = fim > agora;
  const p = promocao ? o : o.depois;
  return { destino: slug, promocao, ...(promocao ? { ate: new Date(fim).toISOString() } : {}), pix: Number(p.pix), cartao: Number(p.cartao) };
}

async function hash(texto, letras = 64) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, letras);
}
const aleatorio = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");

function lerPedido(body) {
  const slug = destinoValido(String(body?.destino ?? ""));
  const nome = String(body?.nome ?? "").replace(/\s+/g, " ").trim();
  if (nome.length < 2 || nome.length > 60) throw new CompraInvalida("Escreva o nome que vai na capa (até 60 letras).");
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) throw new CompraInvalida("Confira o e-mail.");
  const valores = body?.valores && typeof body.valores === "object" && !Array.isArray(body.valores) ? body.valores : {};
  if (JSON.stringify(valores).length > MAX_VALORES) throw new CompraInvalida("Simulação grande demais.");
  return { slug, nome, email, valores };
}

const cabecalho = token => ({ Authorization: `Bearer ${token}`, "content-type": "application/json" });

// Cria a order (Pix ou cartão) com o preço da hora e guarda o pedido. `cartao`: o que o Card Payment Brick devolve.
// `contexto`: IP e navegador de quem compra, só para a Meta e só com os cookies aceitos (ver server/meta.js).
export async function criarCompra(body, env, fetchFn = globalThis.fetch, contexto = {}) {
  const { slug, nome, email, valores } = lerPedido(body);
  const forma = body?.forma === "cartao" ? "cartao" : "pix";
  const preco = precoDe(slug, env)[forma].toFixed(2);
  // O preço que a pessoa viu na tela: se mudou nesse meio tempo (fim da promoção), não cobra sem ela ver o novo.
  if (body?.precoVisto != null && Number(body.precoVisto).toFixed(2) !== preco) {
    throw new CompraInvalida(`O preço mudou para R$ ${preco.replace(".", ",")}. Confira e tente de novo.`);
  }
  const chave = aleatorio();
  const ref = `pdf_${slug}_${await hash(chave, 24)}`;
  let pagamento;
  if (forma === "cartao") {
    const c = body?.cartao || {};
    const token = String(c.token ?? ""), metodo = String(c.payment_method_id ?? "");
    if (!/^[A-Za-z0-9]{8,64}$/.test(token) || !/^[a-z_]{2,20}$/.test(metodo)) throw new CompraInvalida("Confira os dados do cartão.");
    // Só crédito à vista: a parcela e o tipo vêm daqui, nunca do navegador.
    pagamento = { amount: preco, payment_method: { id: metodo, type: "credit_card", token, installments: 1 } };
  } else {
    pagamento = { amount: preco, payment_method: { id: "pix", type: "bank_transfer" }, expiration_time: `PT${VALIDADE_MIN}M` };
  }
  const inicio = Date.now();
  const r = await fetchFn(API, {
    method: "POST",
    headers: { ...cabecalho(env.MP_ACCESS_TOKEN), "X-Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      type: "online", processing_mode: "automatic", total_amount: preco, external_reference: ref,
      description: `Roteiro Detalhado + Pré-viagem ${DESTINOS_PDF[slug]}`,
      transactions: { payments: [pagamento] }, payer: { email }
    })
  });
  const order = await r.json().catch(() => ({}));
  // Cartão recusado: o Mercado Pago responde com erro e o motivo. Só o código vai para o log (o corpo pode ter o e-mail).
  if (!r.ok || !order.id) {
    const codigo = order?.errors?.[0]?.code || "";
    if (forma === "cartao" && r.status < 500) throw new CompraInvalida(motivoRecusa(codigo || order?.status_detail));
    throw new Error(`Mercado Pago ${r.status}${codigo ? ` (${codigo})` : ""}`);
  }
  await env.LEADS.put(chaveCompra(order.id), JSON.stringify({
    slug, nome, valores, origem: lerOrigem(body), chave: await hash(chave), ref, forma, preco, conferir: await hash(`${String(order.id).toUpperCase()}:${email}`), criado: new Date().toISOString()
  }), { expirationTtl: GUARDA_DIAS * 86400 });
  await guardarDadosMeta(order.id, { meta: body?.meta, email }, contexto, env).catch(e => console.error("compra: dados da Meta não guardados", e?.message));
  const base = { id: order.id, chave, forma, preco: Number(preco) };
  if (forma === "cartao") {
    // Cartão aprovado na hora: a tela vai direto para o PDF, sem consultar a situação, então a venda conta aqui.
    if (pago(order, preco)) { await registrarVenda(order.id, { slug, origem: lerOrigem(body), preco }, env, fetchFn); return { ...base, status: "pago" }; }
    if (["failed", "canceled"].includes(order.status)) throw new CompraInvalida(motivoRecusa(order.status_detail));
    return { ...base, status: "esperando" };
  }
  const pag = order.transactions?.payments?.[0] || {};
  const pm = pag.payment_method || {};
  if (!pm.qr_code) throw new Error("Mercado Pago sem QR Code do Pix");
  const expiraEm = pag.date_of_expiration || new Date(inicio + VALIDADE_MIN * 60000).toISOString();
  return { ...base, status: "esperando", copiaECola: pm.qr_code, qrCode: pm.qr_code_base64 || null, expiraEm };
}

// Motivos de recusa do cartão em português simples (status_detail ou código de erro do Mercado Pago).
export function motivoRecusa(det = "") {
  const d = String(det);
  if (/insufficient_amount|insufficient/.test(d)) return "O cartão não tem limite para essa compra. Tente outro cartão ou o Pix.";
  if (/bad_filled_security_code|security_code/.test(d)) return "Confira o código de segurança do cartão.";
  if (/bad_filled_date|expiration/.test(d)) return "Confira a validade do cartão.";
  if (/bad_filled|invalid/.test(d)) return "Confira os dados do cartão.";
  if (/call_for_authorize/.test(d)) return "O banco pediu para autorizar a compra. Ligue para o banco e tente de novo, ou pague no Pix.";
  if (/high_risk|blacklist|fraud/.test(d)) return "O pagamento foi recusado pela análise de segurança. Tente outro cartão ou o Pix.";
  if (/duplicated/.test(d)) return "Esse pagamento já foi feito agora há pouco. Confira o seu e-mail ou a fatura antes de tentar de novo.";
  return "O cartão foi recusado. Tente outro cartão ou pague no Pix.";
}

// Paga e no valor com que a order foi criada (guardado na compra): o preço pode mudar depois sem travar quem já pagou.
const pago = (o, preco) => o?.status === "processed" && Number(o.total_amount) >= Number(preco);

// Pix sem pagamento passado do prazo: o Mercado Pago só marca a order como expirada dias depois,
// então o prazo do próprio pagamento decide quando o checkout oferece um Pix novo (como em server/pix.js).
const venceu = (o, agora) => Date.parse(o.transactions?.payments?.[0]?.date_of_expiration) < agora;

async function lerOrder(id, env, fetchFn) {
  if (!/^ORD[0-9A-Z]{6,40}$/i.test(String(id))) throw new CompraInvalida("Pedido não encontrado.");
  const r = await fetchFn(`${API}/${id}`, { headers: cabecalho(env.MP_ACCESS_TOKEN) });
  if (r.status === 404 || r.status === 400) throw new CompraInvalida("Pedido não encontrado.");
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}`);
  return r.json();
}

// Confere a chave da compra (só quem criou o pedido, ou recuperou com o e-mail, tem) e devolve o guardado.
async function compraGuardada(id, chave, env) {
  const g = await env.LEADS.get(chaveCompra(id), "json").catch(() => null);
  if (!g || !/^[0-9a-f]{32}$/.test(String(chave)) || g.chave !== await hash(chave)) throw new CompraInvalida("Pedido não encontrado.");
  return g;
}

// Conta a venda uma vez só por order (venda:<ORD>), na primeira vez que ela aparece paga.
async function contarVenda(id, { slug, origem }, env) {
  const marca = `venda:${String(id).toUpperCase()}`;
  if (await env.LEADS.get(marca)) return;
  await env.LEADS.put(marca, "1", { expirationTtl: GUARDA_DIAS * 86400 });
  const v = (await env.LEADS.get(chaveVendas(slug), "json").catch(() => null)) || { n: 0 };
  await env.LEADS.put(chaveVendas(slug), JSON.stringify({ n: v.n + 1, ultima: new Date().toISOString() }));
  await registrarOrigem({ tipo: "pdf", origem: origem || "direto" }, env);
}

// Venda paga: conta (uma vez) e manda o Purchase para a Meta. O envio para a Meta tem a marca própria (meta:<ORD>,
// apagada só quando a Meta aceita): se falhar, a próxima consulta da compra tenta de novo.
async function registrarVenda(id, g, env, fetchFn) {
  await contarVenda(id, g, env).catch(e => console.error("compra: venda não contada", e?.message));
  await enviarCompraMeta(id, g, env, fetchFn).catch(e => console.error("compra: Purchase não foi para a Meta", e?.message));
}

// Confere no Mercado Pago que a order foi paga e é deste pedido. Devolve o pedido guardado.
export async function compraPaga(id, chave, env, fetchFn = globalThis.fetch, agora = Date.now()) {
  const g = await compraGuardada(id, chave, env);
  const o = await lerOrder(id, env, fetchFn);
  if (o.external_reference !== g.ref) throw new CompraInvalida("Pedido não encontrado.");
  if (!pago(o, g.preco)) throw new NaoPago(["expired", "canceled", "failed"].includes(o.status) || venceu(o, agora) ? "expirado" : "esperando");
  await registrarVenda(id, g, env, fetchFn);
  return g;
}

// Situação para o checkout: "pago" (com o valor pago), "esperando" ou "expirado".
export async function situacaoCompra(id, chave, env, fetchFn = globalThis.fetch, agora = Date.now()) {
  try {
    const g = await compraPaga(id, chave, env, fetchFn, agora);
    // O valor com que o pedido foi criado, para o Pixel (o preço da tela pode ter mudado desde então).
    return { status: "pago", preco: Number(g.preco) };
  } catch (e) {
    if (e instanceof NaoPago) return { status: e.message };
    throw e;
  }
}

// Recuperar o PDF em outro aparelho: número do pedido + e-mail. Devolve uma chave nova (a antiga deixa de valer).
export async function recuperarCompra(body, env, fetchFn = globalThis.fetch) {
  const id = String(body?.id ?? "").trim().toUpperCase();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const naoAchou = () => new CompraInvalida("Não achamos um pedido com esse número e esse e-mail. Confira os dois ou escreva para contato@vaidarviagem.com.br.");
  if (!/^ORD[0-9A-Z]{6,40}$/.test(id) || !EMAIL.test(email)) throw naoAchou();
  const g = await env.LEADS.get(chaveCompra(id), "json").catch(() => null);
  if (!g || g.conferir !== await hash(`${id}:${email}`)) throw naoAchou();
  const o = await lerOrder(id, env, fetchFn);
  if (o.external_reference !== g.ref) throw naoAchou();
  if (!pago(o, g.preco)) throw new NaoPago("Esse pedido ainda não foi pago. Se você acabou de pagar, espere um minuto e tente de novo.");
  const chave = aleatorio();
  await env.LEADS.put(chaveCompra(id), JSON.stringify({ ...g, chave: await hash(chave) }), { expirationTtl: GUARDA_DIAS * 86400 });
  return { id, chave, destino: g.slug };
}

// Freio por IP para criar compras e tentar recuperar pedidos (um robô não enche o Mercado Pago nem o KV).
export async function dentroDoLimite(tipo, ip, porHora = COMPRAS_IP_HORA) {
  if (!ip) return true;
  const chave = `https://cache.cabenobolso/${tipo}-limite?${new URLSearchParams({ ip, h: new Date().toISOString().slice(0, 13) })}`;
  const n = (await lerCache(chave))?.n || 0;
  if (n >= porHora) return false;
  await gravarCache(chave, { n: n + 1 }, 3600);
  return true;
}
