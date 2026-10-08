// Visualizações reais do site nos últimos 7 dias, para o contador da página inicial. GET /api/visitas
// Responde { visitas: null } quando não há número confiável (ou ainda é pequeno), e o site não mostra nada.
import { visualizacoesDaSemana } from "../../server/visitas.js";

export async function onRequestGet({ env }) {
  const visitas = await visualizacoesDaSemana(env).catch(() => null);
  return new Response(JSON.stringify({ visitas }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=600" }
  });
}
