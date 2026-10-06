// Monta o veredito: custo da viagem, se cabe e quais destinos cabem. Sem IA.
import { DESTINOS, INTERESSES } from "../public/lib/dados.js";
import { custo, ranking, pontuar, noitesQueCabem, acharOrigem, acharDestino, norm } from "../public/lib/custo.js";
import { precoVoo } from "./precos.js";

export class EntradaInvalida extends Error {}

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const MAX_FILTRO = 8;

// Cada item do filtro pode ser um país (todas as cidades dele) ou uma cidade.
export function resolverFiltro(nomes) {
  const achados = new Map();
  for (const nome of nomes) {
    const pais = DESTINOS.filter(d => norm(d.p) === norm(nome));
    const lista = pais.length ? pais : [acharDestino(nome)].filter(Boolean);
    if (!lista.length) throw new EntradaInvalida(`Ainda não temos médias de custo para "${nome}". Escolha destinos da lista ou deixe vazio para sugerirmos.`);
    lista.forEach(d => achados.set(d.n, d));
  }
  return [...achados.values()];
}

export function validar(b) {
  const orcamento = Math.round(Number(b?.orcamento));
  if (!(orcamento >= 100)) throw new EntradaInvalida("Informe um orçamento em reais, por exemplo 7.000.");
  if (!DATA.test(b?.ida || "") || !DATA.test(b?.volta || "")) throw new EntradaInvalida("Informe as datas de ida e volta.");
  const noites = Math.round((new Date(b.volta) - new Date(b.ida)) / 864e5);
  if (!(noites >= 1)) throw new EntradaInvalida("A volta precisa ser depois da ida.");
  if (noites > 30) throw new EntradaInvalida("Por enquanto o planejamento vai até 30 noites.");
  return {
    orcamento,
    origem: acharOrigem(b.origem).n,
    destinos: [...(Array.isArray(b.destinos) ? b.destinos : []), b.destino]
      .map(s => String(s || "").trim().slice(0, 80)).filter(Boolean).slice(0, MAX_FILTRO),
    ida: b.ida, volta: b.volta, noites,
    pessoas: Math.min(9, Math.max(1, Math.round(Number(b.pessoas)) || 2)),
    estilo: [0, 1, 2].includes(Number(b.estilo)) ? Number(b.estilo) : 1,
    interesses: (Array.isArray(b.interesses) ? b.interesses : []).filter(i => i in INTERESSES)
  };
}

export async function montarVeredito(body, env = {}, fetchImpl = fetch) {
  const f = validar(body);
  const origem = acharOrigem(f.origem);
  const buscar = dest => precoVoo({
    origem, destino: dest, ida: f.ida, volta: f.volta,
    token: env.TRAVELPAYOUTS_TOKEN, marker: env.TRAVELPAYOUTS_MARKER, fetchImpl
  });

  // Ranqueia pela estimativa e busca preço real só dos melhores candidatos (poucas chamadas de API).
  async function melhores(excluir) {
    const est = ranking(f, { excluir });
    let cand = est.filter(c => c.estado !== "nao_cabe").slice(0, 5);
    if (!cand.length) cand = [...est].sort((a, b) => a.total - b.total).slice(0, 3);
    const dests = cand.map(c => DESTINOS.find(d => d.n === c.destino.n));
    const voos = await Promise.all(dests.map(buscar));
    const recalculados = dests.map((d, i) => custo(d, f, voos[i] || undefined))
      .sort((a, b) => pontuar(b, f) - pontuar(a, f));
    const cabem = recalculados.filter(c => c.estado !== "nao_cabe");
    return cabem.length ? cabem : [...recalculados].sort((a, b) => a.total - b.total);
  }

  if (!f.destinos.length) {
    const opcoes = (await melhores(null)).slice(0, 4);
    return { entrada: f, modo: "sugestao", atual: opcoes[0], opcoes, noitesMax: 0 };
  }

  const filtro = resolverFiltro(f.destinos);
  if (filtro.length > 1) {
    // Compara só os destinos escolhidos; busca preço real dos 6 mais promissores.
    const nomes = new Set(filtro.map(d => d.n));
    const top = ranking(f).filter(c => nomes.has(c.destino.n)).slice(0, 6).map(c => DESTINOS.find(d => d.n === c.destino.n));
    const voos = await Promise.all(top.map(buscar));
    const opcoes = top.map((d, i) => custo(d, f, voos[i] || undefined)).sort((a, b) => pontuar(b, f) - pontuar(a, f));
    return { entrada: f, modo: "comparar", atual: opcoes[0], opcoes, noitesMax: 0 };
  }

  const dest = filtro[0];
  const voo = await buscar(dest);
  const atual = custo(dest, f, voo || undefined);
  if (atual.estado !== "nao_cabe") return { entrada: f, modo: "destino", atual, opcoes: [], noitesMax: 0 };
  const opcoes = (await melhores(dest.n)).filter(c => c.estado !== "nao_cabe").slice(0, 3);
  return { entrada: f, modo: "destino", atual, opcoes, noitesMax: noitesQueCabem(dest, f, voo || undefined) };
}
