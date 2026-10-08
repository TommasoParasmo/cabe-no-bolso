// Temperatura média do destino no mês da viagem. GET /api/clima?destino=Maceió&mes=11
// Sem dado confiável responde { clima: null } e o app simplesmente não mostra a linha.
import { acharDestinoClima, climaDoMes } from "../../server/clima.js";

export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams;
  const dest = acharDestinoClima(q.get("destino"));
  const mes = Number(q.get("mes"));
  if (!dest || !Number.isInteger(mes) || mes < 1 || mes > 12) return json({ erro: "Pedido inválido." }, 400);
  const clima = await climaDoMes(dest, mes).catch(() => null);
  return json({ clima }, 200, clima ? "public, max-age=86400" : "no-store");
}

const json = (dados, status, cache = "no-store") =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache } });
