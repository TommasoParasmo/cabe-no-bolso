import { montarVeredito, EntradaInvalida } from "../../server/veredito.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    return json(await montarVeredito(body, env));
  } catch (e) {
    if (e instanceof EntradaInvalida) return json({ erro: e.message }, 400);
    console.error("veredito", e);
    return json({ erro: "Algo falhou ao calcular. Tente de novo." }, 500);
  }
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
