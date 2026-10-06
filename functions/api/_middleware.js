// Libera a API para o app de celular (Capacitor), que roda as telas de dentro do aparelho:
// iPhone usa a origem capacitor://localhost e Android usa https://localhost.
const APP_NATIVO = new Set(["capacitor://localhost", "https://localhost", "http://localhost"]);

export async function onRequest({ request, next }) {
  const origem = request.headers.get("Origin");
  const cors = APP_NATIVO.has(origem) ? {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  } : null;
  if (request.method === "OPTIONS") return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
  const resposta = await next();
  if (!cors) return resposta;
  const r = new Response(resposta.body, resposta);
  for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
  return r;
}
