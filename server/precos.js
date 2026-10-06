// Preço de passagem ida e volta pela Aviasales Data API (Travelpayouts).
// Os preços vêm de buscas recentes de usuários (cache de até 7 dias), não de cotação ao vivo.
import { lerCache, gravarCache } from "./cache.js";

const API = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
const SEIS_HORAS = 6 * 3600;

/**
 * Devolve { porPessoa, fonte: "aviasales", link } ou null quando não há preço
 * (sem token, rota sem buscas recentes ou erro da API). Quem chama usa a estimativa no lugar.
 */
export async function precoVoo({ origem, destino, ida, volta, token, marker, fetchImpl = fetch }) {
  if (!token || !ida || !volta) return null;
  if (origem.iata === destino.iata) return { porPessoa: 0, fonte: "aviasales", link: null };

  // Primeiro as datas exatas; se ninguém buscou essa combinação, o mais barato do mês.
  const tentativas = [[ida, volta], [ida.slice(0, 7), volta.slice(0, 7)]];
  for (const [dep, ret] of tentativas) {
    const params = new URLSearchParams({
      origin: origem.iata, destination: destino.iata, departure_at: dep, return_at: ret,
      one_way: "false", currency: "brl", market: "br", sorting: "price", limit: "1"
    });
    const chave = `https://cache.cabenobolso/voo?${params}`;
    const guardado = await lerCache(chave);
    if (guardado) return guardado.porPessoa == null ? null : guardado;

    let voo = null;
    try {
      const r = await fetchImpl(`${API}?${params}`, { headers: { "X-Access-Token": token } });
      if (!r.ok) continue;
      const corpo = await r.json();
      const melhor = Array.isArray(corpo?.data) ? corpo.data[0] : null;
      if (melhor && Number(melhor.price) > 0) {
        voo = { porPessoa: Number(melhor.price), fonte: "aviasales", link: linkAfiliado(melhor.link, marker) };
      }
    } catch {
      continue;
    }
    // Guarda também a ausência de preço, para não repetir a mesma busca vazia.
    await gravarCache(chave, voo || { porPessoa: null }, SEIS_HORAS);
    if (voo) return voo;
  }
  return null;
}

function linkAfiliado(caminho, marker) {
  if (!caminho || typeof caminho !== "string" || !caminho.startsWith("/")) return null;
  const url = new URL(caminho, "https://www.aviasales.com");
  if (marker) url.searchParams.set("marker", marker);
  return url.toString();
}
