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

// Alta temporada: dezembro, janeiro e julho, salvo o destino que tem a sua (dest.alta, meses de 1 a 12).
const ALTA_PADRAO = [12, 1, 7];
export function altaTemporada(ida, dest) {
  const mes = ida ? new Date(ida + "T12:00:00").getMonth() + 1 : 0;
  return (dest?.alta || ALTA_PADRAO).includes(mes);
}

// Passagem ida e volta por pessoa quando não há preço real: fórmula por distância.
export function estimarVoo(origem, dest, ida, hoje = new Date()) {
  const dist = km(origem, dest);
  if (dist < 150) return 0;
  const diasAte = ida ? (new Date(ida + "T12:00:00") - hoje) / 864e5 : 60;
  const fator = (altaTemporada(ida, dest) ? 1.25 : 1) * (diasAte < 21 ? 1.2 : 1);
  return (dest.int ? 900 + 0.42 * dist : 300 + 0.45 * dist) * fator;
}

// Ônibus só ida por pessoa: distância por estrada ≈ 1,3 × linha reta, a ~70 km/h.
// Preço por km: convencional, executivo, leito. null = internacional ou longe demais (mais de ~16 h).
const ONIBUS_KM = [0.25, 0.32, 0.48];
const MAX_HORAS = [12, 8, 5]; // até quantas horas de ônibus cada estilo topa, quando há avião
export function estimarOnibus(de, para, data, estilo = 1) {
  if (de.int || para.int) return null;
  const estrada = km(de, para) * 1.3;
  if (estrada > 1100) return null;
  const porPessoa = Math.max(40, estrada * ONIBUS_KM[estilo]) * (altaTemporada(data, para) ? 1.15 : 1);
  return { porPessoa, horas: Math.max(1, Math.round(estrada / 70)) };
}

// Destino só de estrada que fica longe demais dessa origem não entra nas opções.
export const alcancavel = (de, para) => !para.terrestre || !!estimarOnibus(de, para);

/**
 * Ônibus ou avião para um trecho. aviao = preço por pessoa do avião (real ou estimado) no mesmo sentido.
 * Vai de ônibus quando é o único jeito (sem aeroporto ou muito perto) ou quando é mais barato e cabe no tempo do estilo.
 */
function escolherMeio(de, para, data, estilo, aviao, vezes) {
  const bus = estimarOnibus(de, para, data, estilo);
  if (!bus) return null;
  const obrigatorio = para.terrestre || de.terrestre || km(de, para) < 150;
  if (obrigatorio || (bus.horas <= MAX_HORAS[estilo] && bus.porPessoa * vezes < aviao)) return { ...bus, porPessoa: bus.porPessoa * vezes };
  return null;
}

/**
 * Custo da viagem inteira para o grupo.
 * f: { orcamento, origem, ida, noites, pessoas, estilo (0-2), interesses[] }
 * voo: { porPessoa, fonte: "aviasales" | "estimativa", link? } — opcional; sem ele, usa a estimativa.
 */
export function custo(dest, f, voo) {
  const origem = acharOrigem(f.origem);
  const alta = altaTemporada(f.ida, dest);
  // Arredonda por pessoa e por diária antes de multiplicar, para a conta mostrada bater.
  const mesmaCidade = km(origem, dest) < 30;
  const aviao = voo?.porPessoa ?? estimarVoo(origem, dest, f.ida);
  const onibus = mesmaCidade ? null : escolherMeio(origem, dest, f.ida, f.estilo, aviao, 2);
  const vooPessoa = mesmaCidade ? 0 : r10(onibus ? onibus.porPessoa : aviao);
  const quartos = Math.ceil(f.pessoas / 2);
  const diaria = r10(dest.hotel[f.estilo] * (alta ? 1.25 : 1));
  const dias = f.noites + 1;
  const comida = [70, 130, 250][f.estilo] * dest.idx * f.pessoas * dias;
  const passeios = [30, 80, 180][f.estilo] * dest.idx * (dest.pf || 1) * f.pessoas * f.noites;
  // De ônibus, ele já chega na cidade: sem traslado do aeroporto.
  const traslado = onibus ? 0 : (dest.extra || 0);
  const transp = ([20, 45, 100][f.estilo] * dest.idx * dias + traslado) * f.pessoas;
  const fonteVoo = onibus ? "estimativa" : voo?.fonte || "estimativa";
  const itens = [
    onibus ? {
      categoria: "Passagem de ônibus", valor: vooPessoa * f.pessoas,
      detalhe: `Ida e volta ${origem.n}–${dest.n}, cerca de ${onibus.horas} h por trecho, ${fmt(vooPessoa)} por pessoa, estimativa`
    } : {
      categoria: "Passagem aérea", valor: vooPessoa * f.pessoas,
      detalhe: vooPessoa
        ? `Ida e volta ${origem.ap}–${dest.ap}, ${fmt(vooPessoa)} por pessoa${fonteVoo === "aviasales" ? ", preço encontrado no Aviasales" : ", estimativa"}`
        : "Sem passagem: destino na sua cidade"
    },
    { categoria: "Hospedagem", valor: diaria * quartos * f.noites, detalhe: `${f.noites} ${f.noites > 1 ? "noites" : "noite"}, ${quartos} ${quartos > 1 ? "quartos" : "quarto"} a ${fmt(diaria)}` },
    { categoria: "Alimentação", valor: r10(comida), detalhe: `${fmt(r10(comida / f.pessoas / dias))} por pessoa por dia` },
    { categoria: "Passeios", valor: r10(passeios), detalhe: `${fmt(r10(passeios / f.pessoas / f.noites))} por pessoa por dia` },
    { categoria: "Transporte local", valor: r10(transp), detalhe: traslado ? `Inclui traslado do aeroporto de ${dest.ap}` : "Metrô, ônibus e aplicativos" }
  ];
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const diff = f.orcamento - total;
  const estado = diff >= f.orcamento * 0.1 ? "cabe" : diff >= 0 ? "apertado" : "nao_cabe";
  const match = dest.tags.filter(t => f.interesses.includes(t)).length;
  return {
    destino: { n: dest.n, p: dest.p, ap: dest.ap, iata: dest.iata },
    origem: { n: origem.n, ap: origem.ap, iata: origem.iata },
    itens, total, diff, estado, match, alta,
    diaria, vooPessoa, fonteVoo, linkVoo: onibus ? null : voo?.link || null,
    meio: mesmaCidade ? null : onibus ? "onibus" : "aviao", horasOnibus: onibus?.horas || null
  };
}

// ---- Viagem por várias cidades: origem → cidade 1 → … → cidade N → origem ----

// Divide as noites entre as cidades; as primeiras ficam com a sobra.
export function dividirNoites(total, k) {
  return Array.from({ length: k }, (_, i) => Math.floor(total / k) + (i < total % k ? 1 : 0));
}

const somarDias = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// Trechos só de ida, com a data de cada um.
export function trechosDaViagem(origem, paradas, ida) {
  const pontos = [origem, ...paradas.map(p => p.dest), origem];
  let dia = 0;
  return pontos.slice(1).map((para, i) => {
    const t = { de: pontos[i], para, data: somarDias(ida, dia) };
    dia += paradas[i]?.noites || 0;
    return t;
  });
}

// Só ida por pessoa, quando não há preço real. Trecho curto entre cidades usa a fórmula doméstica.
export function estimarTrecho(de, para, data, hoje = new Date()) {
  const dist = km(de, para);
  if (dist < 150) return 0;
  const diasAte = data ? (new Date(data + "T12:00:00") - hoje) / 864e5 : 60;
  const fator = (altaTemporada(data, para) ? 1.25 : 1) * (diasAte < 21 ? 1.2 : 1);
  const longo = (de.int || para.int) && dist > 3000;
  return (longo ? 900 + 0.42 * dist : 300 + 0.45 * dist) * fator * 0.6;
}

/**
 * Custo da viagem por várias cidades. paradas: [{ dest, noites }] na ordem da viagem.
 * voos: preços reais por trecho (mesma ordem de trechosDaViagem), null onde não houver.
 */
export function custoMulti(paradas, f, voos = []) {
  const origem = acharOrigem(f.origem);
  const quartos = Math.ceil(f.pessoas / 2);
  const trechos = trechosDaViagem(origem, paradas, f.ida).map((t, i) => {
    const real = voos[i];
    const onibus = escolherMeio(t.de, t.para, t.data, f.estilo, real?.porPessoa ?? estimarTrecho(t.de, t.para, t.data), 1);
    if (onibus) return {
      de: t.de.n, para: t.para.n, deNome: t.de.n, paraNome: t.para.n, data: t.data,
      porPessoa: r10(onibus.porPessoa), fonte: "estimativa", link: null, meio: "onibus", horas: onibus.horas
    };
    return {
      de: t.de.ap, para: t.para.ap, deIata: t.de.iata, paraIata: t.para.iata, deNome: t.de.n, paraNome: t.para.n, data: t.data,
      porPessoa: r10(real?.porPessoa ?? estimarTrecho(t.de, t.para, t.data)),
      fonte: real ? "aviasales" : "estimativa", link: real?.link || null, meio: "aviao"
    };
  });
  const vooPessoa = trechos.reduce((s, t) => s + t.porPessoa, 0);
  let hosp = 0, comida = 0, passeios = 0, transp = 0, alta = false;
  const ps = paradas.map((p, i) => {
    const d = p.dest, dias = p.noites + (i === 0 ? 1 : 0);
    // Cada cidade usa a temporada do dia em que se chega nela, não a da partida.
    const checkin = somarDias(f.ida, paradas.slice(0, i).reduce((s, x) => s + x.noites, 0));
    const altaAqui = altaTemporada(checkin, d);
    alta ||= altaAqui;
    const diaria = r10(d.hotel[f.estilo] * (altaAqui ? 1.25 : 1));
    hosp += diaria * quartos * p.noites;
    comida += [70, 130, 250][f.estilo] * d.idx * f.pessoas * dias;
    passeios += [30, 80, 180][f.estilo] * d.idx * (d.pf || 1) * f.pessoas * p.noites;
    // Traslado do aeroporto só quando se chega de avião.
    transp += ([20, 45, 100][f.estilo] * d.idx * dias + (trechos[i].meio === "aviao" ? d.extra || 0 : 0)) * f.pessoas;
    return { n: d.n, p: d.p, ap: d.ap, noites: p.noites, diaria, checkin };
  });
  const dias = f.noites + 1;
  const reais = trechos.filter(t => t.fonte === "aviasales").length;
  const fonteVoo = reais === trechos.length ? "aviasales" : reais ? "misto" : "estimativa";
  const meios = new Set(trechos.map(t => t.meio));
  const itens = [
    { categoria: meios.size > 1 ? "Passagens" : meios.has("onibus") ? "Passagem de ônibus" : "Passagem aérea", valor: vooPessoa * f.pessoas, detalhe: `${trechos.length} trechos só de ida (${trechos.map(t => t.deNome).concat(trechos.at(-1).paraNome).join(" → ")}), ${fmt(vooPessoa)} por pessoa` },
    { categoria: "Hospedagem", valor: hosp, detalhe: ps.map(p => `${p.noites} ${p.noites > 1 ? "noites" : "noite"} em ${p.n}`).join(", ") + `, ${quartos} ${quartos > 1 ? "quartos" : "quarto"}` },
    { categoria: "Alimentação", valor: r10(comida), detalhe: `${fmt(r10(comida / f.pessoas / dias))} por pessoa por dia, em média` },
    { categoria: "Passeios", valor: r10(passeios), detalhe: `${fmt(r10(passeios / f.pessoas / f.noites))} por pessoa por dia, em média` },
    { categoria: "Transporte local", valor: r10(transp), detalhe: "Metrô, ônibus, aplicativos e traslados" }
  ];
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const diff = f.orcamento - total;
  const estado = diff >= f.orcamento * 0.1 ? "cabe" : diff >= 0 ? "apertado" : "nao_cabe";
  const tags = new Set(paradas.flatMap(p => p.dest.tags));
  return {
    destino: { n: ps.map(p => p.n).join(" + "), p: [...new Set(ps.map(p => p.p))].join(", "), ap: ps[0].ap },
    origem: { n: origem.n, ap: origem.ap, iata: origem.iata },
    itens, total, diff, estado, match: f.interesses.filter(t => tags.has(t)).length, alta,
    diaria: ps[0].diaria, vooPessoa, fonteVoo, linkVoo: null, paradas: ps, trechos
  };
}

const PESO = { cabe: 3, apertado: 1, nao_cabe: -10 };
export const pontuar = (c, f) => PESO[c.estado] + c.match * 2 + (c.estado !== "nao_cabe" ? c.total / f.orcamento : 0);

// Ordena destinos do melhor para o pior para esse orçamento. voos: Map nome → voo real (opcional).
export function ranking(f, { excluir = null, voos = new Map() } = {}) {
  const origem = acharOrigem(f.origem);
  return DESTINOS.filter(d => d.n !== excluir && alcancavel(origem, d))
    .map(d => custo(d, f, voos.get(d.n)))
    .sort((a, b) => pontuar(b, f) - pontuar(a, f));
}

// Menos que isso não vale a viagem: não sugerimos encurtar para 1 noite.
export const NOITES_MIN_SUGESTAO = 2;

// Maior número de noites (abaixo do pedido, a partir de NOITES_MIN_SUGESTAO) que cabe no orçamento, ou 0.
export function noitesQueCabem(dest, f, voo) {
  for (let n = f.noites - 1; n >= NOITES_MIN_SUGESTAO; n--) if (custo(dest, { ...f, noites: n }, voo).diff >= 0) return n;
  return 0;
}

function fmt(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
