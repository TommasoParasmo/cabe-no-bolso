import { guardarLead, LeadInvalido } from "../../server/lead.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    return json(await guardarLead(body, env, request.headers.get("CF-Connecting-IP")));
  } catch (e) {
    if (e instanceof LeadInvalido) return json({ erro: e.message }, 400);
    console.error("lead", e);
    return json({ erro: "Não deu para salvar agora." }, 502);
  }
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
