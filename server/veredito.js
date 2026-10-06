// Monta o veredito: custo da viagem, se cabe e quais destinos cabem. Sem IA.
import { DESTINOS, INTERESSES } from "../public/lib/dados.js";
import { custo, custoMulti, dividirNoites, trechosDaViagem, ranking, pontuar, noitesQueCabem, acharOrigem, acharDestino, norm } from "../public/lib/custo.js";
import { precoVoo } from "./precos.js";

export class EntradaInvalida extends Error {}

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const MAX_FILTRO = 8;
const MAX_PARADAS = 5;

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
    interesses: (Array.isArray(b.interesses) ? b.interesses : []).filter(i => i in INTERESSES),
    // "viagem" = visitar todos os destinos em sequência; senão, comparar e escolher um.
    tipo: b.tipo === "viagem" ? "viagem" : "comparar"
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
  // internacional: true/false limita ao grupo; null = todos.
  async function melhores(excluir, internacional = null) {
    const est = ranking(f, { excluir }).filter(c => internacional === null || DESTINOS.find(d => d.n === c.destino.n).int === internacional);
    let cand = est.filter(c => c.estado !== "nao_cabe").slice(0, 5);
    if (!cand.length) cand = [...est].sort((a, b) => a.total - b.total).slice(0, 3);
    const dests = cand.map(c => DESTINOS.find(d => d.n === c.destino.n));
    const voos = await Promise.all(dests.map(buscar));
    const recalculados = dests.map((d, i) => {
      const c = custo(d, f, voos[i] || undefined);
      // Quando não cabe, diz com quantas noites caberia (0 = nem com 1 noite).
      if (c.estado === "nao_cabe") c.noitesCabem = noitesQueCabem(d, f, voos[i] || undefined);
      return c;
    }).sort((a, b) => pontuar(b, f) - pontuar(a, f));
    const cabem = recalculados.filter(c => c.estado !== "nao_cabe");
    // Nada cabe: primeiro o que cabe com mais noites, depois o mais barato.
    return cabem.length ? cabem : [...recalculados].sort((a, b) => (b.noitesCabem || 0) - (a.noitesCabem || 0) || a.total - b.total);
  }

  if (!f.destinos.length) {
    // Sem destino: as melhores viagens nacionais e internacionais para esse valor.
    const [nac, int] = await Promise.all([melhores(null, false), melhores(null, true)]);
    const opcoes = [
      ...nac.slice(0, 3).map(c => ({ ...c, grupo: "nacional" })),
      ...int.slice(0, 3).map(c => ({ ...c, grupo: "internacional" }))
    ];
    const atual = [...opcoes].sort((a, b) => pontuar(b, f) - pontuar(a, f))[0];
    return { entrada: f, modo: "sugestao", atual, opcoes, noitesMax: atual.noitesCabem || 0 };
  }

  if (f.tipo === "viagem" && f.destinos.length > 1) return viagemPorCidades(f, origem, env, fetchImpl);

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

// Uma viagem só passando por várias cidades, na ordem escolhida, com as noites divididas entre elas.
async function viagemPorCidades(f, origem, env, fetchImpl) {
  const dests = f.destinos.map(nome => {
    if (DESTINOS.some(d => norm(d.p) === norm(nome)) && !DESTINOS.some(d => norm(d.n) === norm(nome)))
      throw new EntradaInvalida(`Para uma viagem por vários lugares, escolha cidades. "${nome}" é um país.`);
    const d = acharDestino(nome);
    if (!d) throw new EntradaInvalida(`Ainda não temos médias de custo para "${nome}". Escolha destinos da lista.`);
    return d;
  }).filter((d, i, a) => a.findIndex(x => x.n === d.n) === i);
  if (dests.length > MAX_PARADAS) throw new EntradaInvalida(`Por enquanto a viagem vai até ${MAX_PARADAS} cidades.`);
  if (f.noites < dests.length) throw new EntradaInvalida(`Para ${dests.length} cidades, a viagem precisa de pelo menos ${dests.length} noites.`);
  const noites = dividirNoites(f.noites, dests.length);
  const paradas = dests.map((dest, i) => ({ dest, noites: noites[i] }));
  const voos = await Promise.all(trechosDaViagem(origem, paradas, f.ida).map(t => precoVoo({
    origem: t.de, destino: t.para, ida: t.data,
    token: env.TRAVELPAYOUTS_TOKEN, marker: env.TRAVELPAYOUTS_MARKER, fetchImpl
  })));
  const atual = custoMulti(paradas, f, voos);
  return { entrada: f, modo: "viagem", atual, opcoes: [], noitesMax: 0 };
}
