// Cálculo do custo da viagem e do veredito. Funções puras: sem IA, sem rede.
import { ORIGENS, DESTINOS } from "./dados.js";

export const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function km(a, b) {
  const R = 6371, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const acharOrigem = nome => ORIGENS.find(o => o.n === nome) || ORIGENS[0];
export const acharDestino = nome => {
  const q = norm(nome);
  if (!q) return null;
  return DESTINOS.find(d => norm(d.n) === q) || DESTINOS.find(d => norm(d.n).includes(q)) || null;
};

const r10 = v => Math.round(v / 10) * 10;

function altaTemporada(ida) {
  const mes = ida ? new Date(ida + "T12:00:00").getMonth() + 1 : 0;
  return [12, 1, 7].includes(mes);
}

// Passagem ida e volta por pessoa quando não há preço real: fórmula por distância.
export function estimarVoo(origem, dest, ida, hoje = new Date()) {
  const dist = km(origem, dest);
  if (dist < 150) return 0;
  const diasAte = ida ? (new Date(ida + "T12:00:00") - hoje) / 864e5 : 60;
  const fator = (altaTemporada(ida) ? 1.25 : 1) * (diasAte < 21 ? 1.2 : 1);
  return (dest.int ? 900 + 0.42 * dist : 300 + 0.45 * dist) * fator;
}

/**
 * Custo da viagem inteira para o grupo.
 * f: { orcamento, origem, ida, noites, pessoas, estilo (0-2), interesses[] }
 * voo: { porPessoa, fonte: "aviasales" | "estimativa", link? } — opcional; sem ele, usa a estimativa.
 */
export function custo(dest, f, voo) {
  const origem = acharOrigem(f.origem);
  const alta = altaTemporada(f.ida);
  const vooPessoa = voo?.porPessoa ?? estimarVoo(origem, dest, f.ida);
  const quartos = Math.ceil(f.pessoas / 2);
  const diaria = dest.hotel[f.estilo] * (alta ? 1.25 : 1);
  const dias = f.noites + 1;
  const comida = [70, 130, 250][f.estilo] * dest.idx * f.pessoas * dias;
  const passeios = [30, 80, 180][f.estilo] * dest.idx * (dest.pf || 1) * f.pessoas * f.noites;
  const transp = ([20, 45, 100][f.estilo] * dest.idx * dias + (dest.extra || 0)) * f.pessoas;
  const fonteVoo = voo?.fonte || "estimativa";
  const itens = [
    {
      categoria: "Passagem aérea", valor: r10(vooPessoa * f.pessoas),
      detalhe: vooPessoa
        ? `Ida e volta ${origem.ap}–${dest.ap}, ${fmt(r10(vooPessoa))} por pessoa${fonteVoo === "aviasales" ? ", preço encontrado no Aviasales" : ", estimativa"}`
        : "Sem voo: destino na sua cidade"
    },
    { categoria: "Hospedagem", valor: r10(diaria * quartos * f.noites), detalhe: `${f.noites} noites, ${quartos} ${quartos > 1 ? "quartos" : "quarto"} a ${fmt(r10(diaria))}` },
    { categoria: "Alimentação", valor: r10(comida), detalhe: `${fmt(r10(comida / f.pessoas / dias))} por pessoa por dia` },
    { categoria: "Passeios", valor: r10(passeios), detalhe: `${fmt(r10(passeios / f.pessoas / f.noites))} por pessoa por dia` },
    { categoria: "Transporte local", valor: r10(transp), detalhe: dest.extra ? `Inclui traslado do aeroporto de ${dest.ap}` : "Metrô, ônibus e aplicativos" }
  ];
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const diff = f.orcamento - total;
  const estado = diff >= f.orcamento * 0.1 ? "cabe" : diff >= 0 ? "apertado" : "nao_cabe";
  const match = dest.tags.filter(t => f.interesses.includes(t)).length;
  return {
    destino: { n: dest.n, p: dest.p, ap: dest.ap },
    origem: { n: origem.n, ap: origem.ap },
    itens, total, diff, estado, match, alta,
    diaria: r10(diaria), vooPessoa: r10(vooPessoa), fonteVoo, linkVoo: voo?.link || null
  };
}

const PESO = { cabe: 3, apertado: 1, nao_cabe: -10 };
export const pontuar = (c, f) => PESO[c.estado] + c.match * 2 + (c.estado !== "nao_cabe" ? c.total / f.orcamento : 0);

// Ordena destinos do melhor para o pior para esse orçamento. voos: Map nome → voo real (opcional).
export function ranking(f, { excluir = null, voos = new Map() } = {}) {
  return DESTINOS.filter(d => d.n !== excluir)
    .map(d => custo(d, f, voos.get(d.n)))
    .sort((a, b) => pontuar(b, f) - pontuar(a, f));
}

// Maior número de noites (abaixo do pedido) que cabe no orçamento, ou 0.
export function noitesQueCabem(dest, f, voo) {
  for (let n = f.noites - 1; n >= 1; n--) if (custo(dest, { ...f, noites: n }, voo).diff >= 0) return n;
  return 0;
}

function fmt(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
