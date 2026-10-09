// Compra para a Meta pela Conversions API (servidor), além do Pixel no navegador. Os dois mandam o mesmo
// event_id (o número do pedido), e a Meta conta a compra uma vez só. Bloqueador de anúncio e navegador que
// corta o Pixel deixam de esconder a venda dos anúncios.
// Vai para todos os compradores, com ou sem cookies aceitos (decisão do Tom, 09/10/2026; a política de privacidade
// e o aviso de cookies dizem isso). Sem cookies, não há _fbp/_fbc: a Meta reconhece pelo e-mail (hash) e pelo IP.
// Liga com META_CAPI_TOKEN na Cloudflare (token do Gerenciador de Eventos, nunca no código).
// Os dados para a Meta reconhecer a pessoa ficam em meta:<ORD> por 2 dias e saem do KV depois do envio.
export const PIXEL_ID = "1648295673479841";
const GUARDA_SEG = 2 * 86400;
const SITE = "https://vaidarviagem.com.br/";
const chave = id => `meta:${String(id).toUpperCase()}`;
const cookieMeta = v => (typeof v === "string" && /^fb\.\d\.\d{10,16}\.[\w.-]{1,200}$/.test(v) ? v : undefined);

async function sha256(texto) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Na criação do pedido: guarda o que a Meta usa para achar a pessoa (e-mail só como hash).
export async function guardarDadosMeta(id, { meta, email }, { ip, ua } = {}, env) {
  if (!meta || typeof meta !== "object" || !env?.LEADS) return;
  const url = typeof meta.url === "string" && meta.url.startsWith(SITE) ? meta.url.slice(0, 300) : SITE + "comprar/";
  const dados = { em: await sha256(String(email).trim().toLowerCase()), fbp: cookieMeta(meta.fbp), fbc: cookieMeta(meta.fbc), url,
    ip: ip ? String(ip).slice(0, 64) : undefined, ua: ua ? String(ua).slice(0, 400) : undefined };
  await env.LEADS.put(chave(id), JSON.stringify(dados), { expirationTtl: GUARDA_SEG });
}

// Quando a venda é contada (uma vez por pedido): manda o Purchase e apaga os dados guardados.
export async function enviarCompraMeta(id, { slug, preco }, env, fetchFn = globalThis.fetch, agora = Date.now()) {
  if (!env?.META_CAPI_TOKEN || !env?.LEADS) return false;
  const d = await env.LEADS.get(chave(id), "json").catch(() => null);
  if (!d) return false;
  const evento = {
    event_name: "Purchase", event_time: Math.floor(agora / 1000), event_id: String(id).toUpperCase(),
    action_source: "website", event_source_url: d.url,
    user_data: { em: [d.em], fbp: d.fbp, fbc: d.fbc, client_ip_address: d.ip, client_user_agent: d.ua },
    custom_data: { value: Number(preco), currency: "BRL", content_name: slug, content_ids: [slug], content_type: "product" }
  };
  const pixel = env.META_PIXEL_ID || PIXEL_ID;
  const r = await fetchFn(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: [evento] })
  });
  if (!r.ok) throw new Error(`Meta ${r.status}`);
  await env.LEADS.delete?.(chave(id));
  return true;
}
