// Porta de entrada da API.
// 1) vai-dar-viagem.pages.dev (e as prévias *.pages.dev) não servem a API: lá as regras da Cloudflare
//    (limite de pedidos, WAF, Bot Fight Mode) não valem, e as prévias não devem gastar IA nem criar Pix.
// 2) POST só com corpo JSON (415): um "pedido simples" text/plain de outro site não passa pelo pré-voo do CORS.
// 3) Origin só do site, do próprio endereço ou do app de celular (403): outro site não usa o navegador dos
//    visitantes dele para gastar a nossa IA. Sem Origin (curl, servidor) segue: não é ataque pelo navegador.
// Libera a API para o app de celular (Capacitor), que roda as telas de dentro do aparelho:
// iPhone usa a origem capacitor://localhost e Android usa https://localhost.
const APP_NATIVO = new Set(["capacitor://localhost", "https://localhost", "http://localhost"]);
const SITE = new Set(["https://vaidarviagem.com.br", "https://www.vaidarviagem.com.br"]);

const recusa = (erro, status) => new Response(JSON.stringify({ erro }), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname.endsWith(".pages.dev")) return recusa("Use o site vaidarviagem.com.br.", 403);
  const origem = request.headers.get("Origin");
  const cors = APP_NATIVO.has(origem) ? {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  } : null;
  if (request.method === "OPTIONS") return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
  if (request.method === "POST") {
    let mesmoEndereco = false;
    try { mesmoEndereco = origem && new URL(origem).host === url.host; } catch {}
    if (origem && !cors && !SITE.has(origem) && !mesmoEndereco) return recusa("Origem não permitida.", 403);
    if (!/^application\/json\b/i.test(request.headers.get("content-type") || "")) return recusa("Envie o pedido em JSON.", 415);
  }
  const resposta = await next();
  if (!cors) return resposta;
  const r = new Response(resposta.body, resposta);
  for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
  return r;
}
