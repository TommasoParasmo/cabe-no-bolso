// Preço de passagem ida e volta pela Aviasales Data API (Travelpayouts).
// Os preços vêm de buscas recentes de usuários (cache de até 7 dias), não de cotação ao vivo.
import { lerCache, gravarCache } from "./cache.js";

const API = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
const SEIS_HORAS = 6 * 3600;

/**
 * Sem `volta`, busca só ida (trechos da viagem por várias cidades).
 * Devolve { porPessoa, fonte: "aviasales", link } ou null quando não há preço
 * (sem token, rota sem buscas recentes ou erro da API). Quem chama usa a estimativa no lugar.
 */
export async function precoVoo({ origem, destino, ida, volta, token, marker, fetchImpl = fetch }) {
  if (!token || !ida) return null;
  const soIda = !volta;
  if (origem.iata === destino.iata) return { porPessoa: 0, fonte: "aviasales", link: null };

  // Primeiro as datas exatas; se ninguém buscou essa combinação, o mais barato do mês.
  const tentativas = soIda ? [[ida], [ida.slice(0, 7)]] : [[ida, volta], [ida.slice(0, 7), volta.slice(0, 7)]];
  for (const [dep, ret] of tentativas) {
    const params = new URLSearchParams({
      origin: origem.iata, destination: destino.iata, departure_at: dep,
      ...(soIda ? {} : { return_at: ret }),
      one_way: String(soIda), currency: "brl", market: "br", sorting: "price", limit: "1"
    });
    const chave = `https://cache.cabenobolso/voo?${params}`;
    const guardado = await lerCache(chave);
    if (guardado) {
      if (guardado.porPessoa != null) return guardado;
      continue; // busca vazia já conhecida: tenta o mês
    }

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

const dia = s => String(s || "").slice(0, 10);
const somarDias = (iso, n) => new Date(Date.parse(iso + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const mesSeguinte = mes => { const [a, m] = mes.split("-").map(Number); return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`; };

/**
 * Datas flexíveis: as datas de ida e volta mais baratas do mês, com o número de noites pedido.
 * A volta pode cair no mês seguinte. Devolve { porPessoa, fonte, link, ida, volta } ou null
 * (sem token ou nenhuma busca recente com essa duração); quem chama usa datas padrão no lugar.
 */
export async function datasMaisBaratas({ origem, destino, mes, noites, hoje = new Date().toISOString().slice(0, 10), token, marker, fetchImpl = fetch }) {
  if (!token || !/^\d{4}-\d{2}$/.test(mes || "") || !(noites >= 1)) return null;
  if (origem.iata === destino.iata) return null;
  const listas = await Promise.all([mes, mesSeguinte(mes)].map(async ret => {
    const params = new URLSearchParams({
      origin: origem.iata, destination: destino.iata, departure_at: mes, return_at: ret,
      one_way: "false", currency: "brl", market: "br", sorting: "price", limit: "300"
    });
    const chave = `https://cache.cabenobolso/voos-mes?${params}`;
    const guardado = await lerCache(chave);
    if (guardado) return guardado.lista || [];
    let lista = [];
    try {
      const r = await fetchImpl(`${API}?${params}`, { headers: { "X-Access-Token": token } });
      if (!r.ok) return [];
      const corpo = await r.json();
      lista = (Array.isArray(corpo?.data) ? corpo.data : [])
        .map(v => ({ preco: Number(v.price), ida: dia(v.departure_at), volta: dia(v.return_at), link: v.link }))
        .filter(v => v.preco > 0 && /^\d{4}-\d{2}-\d{2}$/.test(v.ida) && /^\d{4}-\d{2}-\d{2}$/.test(v.volta));
    } catch {
      return [];
    }
    await gravarCache(chave, { lista }, SEIS_HORAS);
    return lista;
  }));
  // Só voos ainda por vir, saindo no mês escolhido e com a duração pedida.
  const certos = listas.flat()
    .filter(v => v.ida > hoje && v.ida.startsWith(mes) && v.volta === somarDias(v.ida, noites))
    .sort((a, b) => a.preco - b.preco || a.ida.localeCompare(b.ida));
  const melhor = certos[0];
  if (!melhor) return null;
  return { porPessoa: melhor.preco, fonte: "aviasales", link: linkAfiliado(melhor.link, marker), ida: melhor.ida, volta: melhor.volta };
}
