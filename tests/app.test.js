import { test } from "node:test";
import assert from "node:assert/strict";
import { DESTINOS } from "../public/lib/dados.js";
import { custo, acharDestino, noitesQueCabem } from "../public/lib/custo.js";
import { precoVoo, datasMaisBaratas } from "../server/precos.js";
import { montarVeredito as montarVereditoHoje, EntradaInvalida } from "../server/veredito.js";
// "Hoje" fixo: as datas dos testes (ida 20/11/2026) não podem virar passado com o tempo.
const HOJE = "2026-10-08";
const montarVeredito = (b, env, f) => montarVereditoHoje(b, env, f, { hoje: HOJE });
import { gerarRoteiro, validarPedido, LimiteAtingido, LIMITE_DIA, limiteDia, foraDaRegiao } from "../server/roteiro.js";

// Wikimedia falsa sem resultados: os testes do completo não saem para a internet.
const semFotos = async () => new Response("{}");

const base = {
  orcamento: 7000, origem: "São Paulo", destino: "", ida: "2026-11-20", volta: "2026-11-25",
  pessoas: 2, estilo: 1, interesses: ["praia"]
};
// Cache da Cloudflare em memória, só para os testes que precisam dele.
async function comCache(fn) {
  const mapa = new Map();
  globalThis.caches = { default: {
    match: async req => (mapa.has(req.url) ? new Response(mapa.get(req.url)) : undefined),
    put: async (req, res) => { mapa.set(req.url, await res.text()); }
  } };
  try { return await fn(); } finally { delete globalThis.caches; }
}

const rio = DESTINOS.find(d => d.n === "Rio de Janeiro");

// fetch falso da Aviasales: responde com o preço dado (ou nada) e registra as URLs pedidas.
function aviasales(preco, { soMes = false } = {}) {
  const urls = [];
  const fetchImpl = async (url, opts) => {
    urls.push({ url, token: opts?.headers?.["X-Access-Token"] });
    const exato = /departure_at=\d{4}-\d{2}-\d{2}&/.test(url);
    const data = preco && (!soMes || !exato) ? [{ price: preco, link: "/search/SAO2011RIO25111?t=abc" }] : [];
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  };
  return { fetchImpl, urls };
}

test("custo soma os itens e classifica o veredito", () => {
  // Estilo conforto: SP–Rio vai de avião (de ônibus passa do tempo que esse estilo topa).
  const f = { ...base, noites: 5, estilo: 2 };
  const c = custo(rio, f, { porPessoa: 800, fonte: "aviasales" });
  assert.equal(c.itens[0].valor, 1600);
  assert.equal(c.total, c.itens.reduce((s, i) => s + i.valor, 0));
  assert.equal(c.fonteVoo, "aviasales");
  assert.equal(custo(rio, { ...f, orcamento: c.total + 1 }).estado === "nao_cabe", false);
  assert.equal(custo(rio, { ...f, orcamento: 1000 }).estado, "nao_cabe");
});

test("acharDestino ignora acentos e maiúsculas", () => {
  assert.equal(acharDestino("montevideu").n, "Montevidéu");
  assert.equal(acharDestino("xyz"), null);
});

test("precoVoo usa o token no cabeçalho e monta o link de afiliado", async () => {
  const { fetchImpl, urls } = aviasales(950);
  const v = await precoVoo({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, ida: "2026-11-20", volta: "2026-11-25", token: "tok", marker: "786422", fetchImpl });
  assert.equal(v.porPessoa, 950);
  assert.equal(v.link, "https://www.aviasales.com/search/SAO2011RIO25111?t=abc&marker=786422");
  assert.equal(urls[0].token, "tok");
  assert.ok(!urls[0].url.includes("tok"), "token não vai na URL");
});

test("precoVoo cai para o mês quando a data exata não tem preço", async () => {
  const { fetchImpl, urls } = aviasales(700, { soMes: true });
  const v = await precoVoo({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, ida: "2026-11-20", volta: "2026-11-25", token: "tok", fetchImpl });
  assert.equal(v.porPessoa, 700);
  assert.equal(urls.length, 2);
  assert.match(urls[1].url, /departure_at=2026-11&/);
});

test("precoVoo sem token não chama a API", async () => {
  const { fetchImpl, urls } = aviasales(700);
  assert.equal(await precoVoo({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, ida: "2026-11-20", volta: "2026-11-25", fetchImpl }), null);
  assert.equal(urls.length, 0);
});

test("veredito sem destino sugere opções que cabem, usando estimativa sem token", async () => {
  const r = await montarVeredito(base, {}, aviasales(500).fetchImpl);
  assert.equal(r.modo, "sugestao");
  assert.ok(r.opcoes.length >= 1);
  assert.ok(r.opcoes.filter(o => o.grupo === "nacional").every(o => o.estado !== "nao_cabe"));
  assert.notEqual(r.atual.estado, "nao_cabe");
  assert.equal(r.atual.fonteVoo, "estimativa");
});

test("veredito com destino usa o preço real da passagem quando há token", async () => {
  const r = await montarVeredito({ ...base, destino: "rio de janeiro", estilo: 2 }, { TRAVELPAYOUTS_TOKEN: "tok" }, aviasales(600).fetchImpl);
  assert.equal(r.atual.destino.n, "Rio de Janeiro");
  assert.equal(r.atual.vooPessoa, 600);
  assert.equal(r.atual.fonteVoo, "aviasales");
});

test("veredito que não cabe traz noites possíveis e alternativas", async () => {
  const r = await montarVeredito({ ...base, destino: "Paris", orcamento: 9000 }, {}, aviasales(0).fetchImpl);
  assert.equal(r.atual.estado, "nao_cabe");
  assert.ok(r.opcoes.length > 0 && r.opcoes.every(o => o.estado !== "nao_cabe" && o.destino.n !== "Paris"));
});

test("QA P2: ida no passado, origem fora das sugestões e 1 noite no singular", async () => {
  await assert.rejects(montarVeredito({ ...base, destino: "Salvador", ida: "2026-09-01", volta: "2026-09-05" }), /a partir de amanhã/);
  const sug = await montarVeredito({ ...base, orcamento: 1500, pessoas: 1, estilo: 0 }, {}, aviasales(0).fetchImpl);
  assert.ok(sug.opcoes.every(o => o.destino.n !== "São Paulo"));
  const umaNoite = await montarVeredito({ ...base, destino: "Rio de Janeiro", ida: "2026-11-20", volta: "2026-11-21" }, {}, aviasales(0).fetchImpl);
  assert.match(umaNoite.atual.itens.find(i => i.categoria === "Hospedagem").detalhe, /^1 noite,/);
});

test("veredito sem saída: nada perto cabe, mostra os mais perto e o que mudar", async () => {
  const r = await montarVeredito({ ...base, destino: "Maceió", orcamento: 2000, ida: "2026-11-20", volta: "2026-11-25" }, {}, aviasales(0).fetchImpl);
  assert.equal(r.atual.estado, "nao_cabe");
  assert.ok(r.opcoes.length > 0, "nunca lista vazia");
  assert.ok(r.opcoes.every(o => o.estado !== "nao_cabe" || o.perto));
  assert.deepEqual(r.mudancas.map(m => m.texto), ["No estilo Econômico", "Indo 1 pessoa", "1 pessoa no Econômico"]);
  const [eco, um, ambos] = r.mudancas;
  assert.ok(eco.total < r.atual.total && um.total < r.atual.total && ambos.total < Math.min(eco.total, um.total));
  // Já no Econômico com 1 pessoa, não sugere nada a mudar.
  const so = await montarVeredito({ ...base, destino: "Maceió", orcamento: 500, pessoas: 1, estilo: 0 }, {}, aviasales(0).fetchImpl);
  assert.deepEqual(so.mudancas, []);
});

test("veredito rejeita entrada inválida", async () => {
  await assert.rejects(montarVeredito({ ...base, orcamento: 10 }), EntradaInvalida);
  await assert.rejects(montarVeredito({ ...base, volta: "2026-11-19" }), EntradaInvalida);
  await assert.rejects(montarVeredito({ ...base, destino: "Atlântida" }), EntradaInvalida);
});

test("roteiro chama o Sonnet com esforço baixo e a verba no prompt e devolve dias e dicas", async () => {
  let pedido;
  const client = { messages: { parse: async req => { pedido = req; return { parsed_output: { dias: [{ dia: 1, titulo: "Centro", atividades: [{ periodo: "Manhã", nome: "Pelourinho", custo: 0 }] }], dicas: ["a", "b", "c", "d"] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 5, pessoas: 2, estilo: 0, interesses: ["praia"], verbaPasseios: 724 }, {}, client);
  assert.equal(pedido.model, "claude-sonnet-5-5");
  assert.equal(pedido.output_config.effort, "low");
  assert.match(pedido.messages[0].content, /R\$ 700/);
  assert.ok(pedido.output_config?.format);
  assert.equal(r.dias.length, 1);
  assert.equal(r.dicas.length, 3);
});

test("roteiro sem chave configurada falha sem chamar a IA", async () => {
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 3 }, {}), /ANTHROPIC_API_KEY/);
  assert.throws(() => validarPedido({ destino: "Narnia", noites: 3 }), EntradaInvalida);
});

test("precoVoo com data exata vazia no cache ainda usa o preço do mês", () => comCache(async () => {
  const pedido = { origem: { iata: "SAO" }, destino: { iata: "RIO" }, ida: "2026-11-20", volta: "2026-11-25", token: "tok" };
  await precoVoo({ ...pedido, fetchImpl: aviasales(700, { soMes: true }).fetchImpl });
  const { fetchImpl, urls } = aviasales(700, { soMes: true });
  const v = await precoVoo({ ...pedido, fetchImpl });
  assert.equal(v.porPessoa, 700);
  assert.equal(urls.length, 0);
}));

test("noitesQueCabem sugere no mínimo 2 noites", () => {
  const f = { ...base, noites: 5, orcamento: 0 };
  const um = custo(rio, { ...f, noites: 1 });
  const dois = custo(rio, { ...f, noites: 2 });
  assert.equal(noitesQueCabem(rio, { ...f, orcamento: um.total }), 0);
  assert.equal(noitesQueCabem(rio, { ...f, orcamento: dois.total }), 2);
});

// Repete um dia de exemplo para o roteiro ter todos os dias pedidos (noites + 1).
const diasDe = (d, n) => Array.from({ length: n }, (_, i) => ({ ...d, dia: i + 1 }));
// Os dias depois do primeiro vêm sem atividades, para os custos somarem só os do dia 1.
const resposta = (custos, n = 1) => ({ messages: { parse: async () => ({ parsed_output: {
  dias: [{ dia: 1, titulo: "Centro", atividades: custos.map(c => ({ periodo: "Manhã", nome: "X", custo: c })) },
    ...diasDe({ titulo: "Livre", atividades: [] }, n - 1).map(d => ({ ...d, dia: d.dia + 1 }))], dicas: []
} }) } });

test("roteiro acima da verba pede de novo e, se continuar, avisa", async () => {
  let chamadas = 0;
  const client = { messages: { parse: async req => { chamadas++; return resposta([300, 500]).messages.parse(req); } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 500 }, {}, client);
  assert.equal(chamadas, 2);
  assert.equal(r.acimaDaVerba, true);
  assert.equal(r.totalPasseios, 800);
  const ok = await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 500 }, {}, resposta([-50, 200]));
  assert.equal(ok.totalPasseios, 200);
  assert.equal(ok.acimaDaVerba, undefined);
});

test("roteiro novo tem limite por IP por dia", () => comCache(async () => {
  for (let i = 0; i < LIMITE_DIA; i++) {
    await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 1000 + i * 100 }, {}, resposta([0], 4), "1.2.3.4");
  }
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 9000 }, {}, resposta([0]), "1.2.3.4"), LimiteAtingido);
  const repetido = await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 1000 }, {}, resposta([0], 4), "1.2.3.4");
  assert.equal(repetido.cache, true);
}));

test("limite de roteiros por dia pode ser mudado pela variável da Cloudflare", () => comCache(async () => {
  assert.equal(limiteDia({}), LIMITE_DIA);
  assert.equal(limiteDia({ ROTEIRO_LIMITE_DIA: "30" }), 30);
  assert.equal(limiteDia({ ROTEIRO_LIMITE_DIA: "0" }), LIMITE_DIA);
  assert.equal(limiteDia({ ROTEIRO_LIMITE_DIA: "abc" }), LIMITE_DIA);
  assert.equal(limiteDia({ ROTEIRO_LIMITE_DIA: "5000" }), LIMITE_DIA);
  const env = { ROTEIRO_LIMITE_DIA: "2" };
  for (let i = 0; i < 2; i++) await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 1000 + i * 100 }, env, resposta([0]), "5.6.7.8");
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 9000 }, env, resposta([0]), "5.6.7.8"), /montou 2 roteiros/);
}));

test("roteiro usa o interesse livre no prompt, limpo e curto", async () => {
  let pedido;
  const client = { messages: { parse: async req => { pedido = req; return resposta([0]).messages.parse(req); } } };
  const p = validarPedido({ destino: "Tóquio", noites: 5, foco: '  Pokémon\n"Center"  <b>' + "x".repeat(200) });
  assert.equal(p.dest.p, "Japão");
  assert.ok(p.foco.length <= 120);
  assert.doesNotMatch(p.foco, /[\n<>"]/);
  await gerarRoteiro({ destino: "Tóquio", noites: 5, foco: "Pokémon", verbaPasseios: 2000 }, {}, client);
  assert.match(pedido.messages[0].content, /Foco principal.*"Pokémon"/);
});

test("veredito compara vários destinos: país vira todas as cidades dele", async () => {
  const r = await montarVeredito({ ...base, orcamento: 9000, destinos: ["Argentina", "Chile", "Salvador"] });
  assert.equal(r.modo, "comparar");
  // País vira todas as cidades dele; a tela mostra as 6 melhores.
  assert.equal(r.opcoes.length, 6);
  assert.ok(r.opcoes.every(o => ["Argentina", "Chile"].includes(o.destino.p) || o.destino.n === "Salvador"));
  assert.ok(new Set(r.opcoes.map(o => o.destino.p)).size >= 2);
  assert.equal(r.atual, r.opcoes[0]);
  const brasil = await montarVeredito({ ...base, destinos: ["Brasil"] });
  assert.equal(brasil.modo, "comparar");
  assert.ok(brasil.opcoes.length > 1 && brasil.opcoes.every(o => o.destino.p === "Brasil"));
  const um = await montarVeredito({ ...base, destinos: ["Lisboa"] });
  assert.equal(um.modo, "destino");
  await assert.rejects(montarVeredito({ ...base, destinos: ["Salvador", "Atlântida"] }), EntradaInvalida);
});

test("viagem por várias cidades: trechos só de ida, noites divididas e preço real por trecho", async () => {
  const { fetchImpl, urls } = aviasales(1500);
  const r = await montarVeredito({ ...base, orcamento: 30000, ida: "2027-04-10", volta: "2027-04-17", destinos: ["Lisboa", "Paris"], tipo: "viagem" },
    { TRAVELPAYOUTS_TOKEN: "tok" }, fetchImpl);
  assert.equal(r.modo, "viagem");
  assert.deepEqual(r.atual.paradas.map(p => [p.n, p.noites]), [["Lisboa", 4], ["Paris", 3]]);
  assert.deepEqual(r.atual.trechos.map(t => `${t.de}>${t.para} ${t.data}`), ["GRU>LIS 2027-04-10", "LIS>CDG 2027-04-14", "CDG>GRU 2027-04-17"]);
  assert.equal(r.atual.vooPessoa, 4500);
  assert.equal(r.atual.fonteVoo, "aviasales");
  assert.ok(urls.every(u => /one_way=true/.test(u.url) && !/return_at/.test(u.url)));
  await assert.rejects(montarVeredito({ ...base, destinos: ["Portugal", "Paris"], tipo: "viagem" }), /é um país/);
  await assert.rejects(montarVeredito({ ...base, volta: "2026-11-22", destinos: ["Lisboa", "Paris", "Lima"], tipo: "viagem" }), /pelo menos 3 noites/);
});

test("roteiro de várias cidades descreve a ordem e vai até 15 dias", async () => {
  let pedido;
  const client = { messages: { parse: async req => { pedido = req; return resposta([0]).messages.parse(req); } } };
  const p = validarPedido({ paradas: [{ destino: "Lisboa", noites: 5 }, { destino: "Paris", noites: 5 }] });
  assert.equal(p.dias, 11);
  assert.equal(validarPedido({ destino: "Tóquio", noites: 14 }).dias, 15);
  assert.equal(validarPedido({ destino: "Tóquio", noites: 20 }).dias, 15);
  await gerarRoteiro({ paradas: [{ destino: "Lisboa", noites: 4 }, { destino: "Paris", noites: 3 }], verbaPasseios: 2000 }, {}, client);
  assert.match(pedido.messages[0].content, /Lisboa, Portugal \(4 noites\); depois Paris, França \(3 noites\)/);
});

test("sugestão separa as melhores viagens nacionais e internacionais", async () => {
  const r = await montarVeredito({ ...base, orcamento: 20000 });
  assert.equal(r.modo, "sugestao");
  const nac = r.opcoes.filter(o => o.grupo === "nacional"), int = r.opcoes.filter(o => o.grupo === "internacional");
  assert.ok(nac.length >= 1 && nac.length <= 3 && nac.every(o => o.destino.p === "Brasil"));
  assert.ok(int.length >= 1 && int.length <= 3 && int.every(o => o.destino.p !== "Brasil"));
  assert.ok(r.opcoes.includes(r.atual));
  // Valor baixo: nada cabe com 5 noites, mas o app diz com quantas noites caberia.
  const pouco = await montarVeredito({ ...base, orcamento: 1000, pessoas: 1, estilo: 0 });
  assert.ok(pouco.opcoes.every(o => o.estado === "nao_cabe"));
  assert.equal(pouco.opcoes[0].noitesCabem >= 1, true);
  // Nada cabe: a sugestão principal é a que fica mais perto do orçamento.
  assert.equal(pouco.atual.total, Math.min(...pouco.opcoes.map(o => o.total)));
});

test("ônibus: destino sem aeroporto vai de ônibus e não busca passagem aérea", async () => {
  const { fetchImpl, urls } = aviasales(500);
  const r = await montarVeredito({ ...base, origem: "Rio de Janeiro", destino: "Paraty" }, { TRAVELPAYOUTS_TOKEN: "tok" }, fetchImpl);
  assert.equal(r.atual.meio, "onibus");
  assert.equal(r.atual.itens[0].categoria, "Passagem de ônibus");
  assert.ok(r.atual.vooPessoa > 0 && r.atual.vooPessoa < 400);
  assert.equal(urls.length, 0);
});

test("ônibus: perto e mais barato vai de ônibus no econômico; longe vai de avião", () => {
  const f = { ...base, noites: 5, estilo: 0 };
  assert.equal(custo(rio, f).meio, "onibus");
  const salvador = DESTINOS.find(d => d.n === "Salvador");
  assert.equal(custo(salvador, f).meio, "aviao");
  // De ônibus não cobra traslado do aeroporto.
  const gramado = DESTINOS.find(d => d.n === "Gramado");
  const c = custo(gramado, { ...f, origem: "Porto Alegre" });
  assert.equal(c.meio, "onibus");
  assert.equal(c.itens.at(-1).detalhe.includes("aeroporto"), false);
});

test("ônibus: destino só de estrada longe demais dá erro claro e some das sugestões", async () => {
  await assert.rejects(montarVeredito({ ...base, origem: "Manaus", destino: "Paraty" }), /longe demais/);
  const r = await montarVeredito({ ...base, origem: "Manaus", orcamento: 20000 });
  assert.ok(r.opcoes.every(o => o.destino.n !== "Paraty"));
});

test("ônibus: faixa baixa sugere viagem perto de ônibus que cabe", async () => {
  const r = await montarVeredito({ ...base, orcamento: 2000, pessoas: 1, estilo: 0, volta: "2026-11-23" });
  const nac = r.opcoes.filter(o => o.grupo === "nacional");
  assert.ok(nac.some(o => o.meio === "onibus" && o.estado !== "nao_cabe"));
});

test("ônibus: viagem por várias cidades usa ônibus nos trechos perto", async () => {
  const r = await montarVeredito({ ...base, orcamento: 9000, tipo: "viagem", destinos: ["Rio de Janeiro", "Búzios"] });
  assert.ok(r.atual.trechos.some(t => t.meio === "onibus" && t.paraNome === "Búzios"));
});

test("roteiro pede almoço e jantar dentro da verba de comida e devolve as refeições", async () => {
  let pedido;
  const client = { messages: { parse: async req => {
    pedido = req;
    return { parsed_output: { dias: [{ dia: 1, cidade: "Salvador", titulo: "Centro", atividades: [{ periodo: "manhã", nome: "Pelourinho", custo: 0 }],
      almoco: { nome: "Restaurante A", custo: 120.4 }, jantar: { nome: "Restaurante B", custo: -5 } }], dicas: [] } };
  } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 3, pessoas: 2, verbaPasseios: 500, verbaAlimentacao: 1040 }, {}, client);
  // R$ 1.040 em 4 dias = R$ 260/dia, arredondado para baixo em faixas de R$ 50.
  assert.match(pedido.messages[0].content, /Almoço e jantar: todo dia.*R\$ 250 por dia/s);
  assert.equal(r.dias[0].almoco.custo, 120);
  assert.equal(r.dias[0].jantar.custo, 0);
  assert.equal(r.totalRefeicoes, 120);
  assert.equal(r.totalPasseios, 0);
});

test("roteiro organiza cada dia por região, com refeições perto dos passeios e só na cidade", async () => {
  let pedido;
  const client = { messages: { parse: async req => { pedido = req; return { parsed_output: { dias: [{ dia: 1, cidade: "Salvador", regiao: "Barra", titulo: "Barra",
    atividades: [{ periodo: "manhã", nome: "Farol da Barra", bairro: "Barra", custo: 0 }],
    almoco: { nome: "Restaurante A", bairro: "Barra", custo: 80 }, jantar: { nome: "Restaurante B", bairro: "Barra", custo: 90 } }], dicas: [] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 300 }, {}, client);
  const prompt = pedido.messages[0].content;
  assert.match(prompt, /almoço fica no mesmo bairro da atividade da manhã/);
  assert.match(prompt, /jantar no mesmo bairro da atividade da tarde/);
  assert.match(prompt, /cada dia acontece numa região só/);
  assert.match(prompt, /nada de atrações de outras cidades/);
  assert.match(prompt, /Quando o destino é uma região e não uma cidade/);
  const esquema = JSON.stringify(pedido.output_config.format);
  assert.match(esquema, /regiao/);
  assert.match(esquema, /bairro/);
  assert.equal(r.dias[0].regiao, "Barra");
  assert.equal(r.dias[0].almoco.bairro, "Barra");
});

test("roteiro que mistura regiões num dia pede de novo apontando os lugares fora", async () => {
  const dia = (tarde, bairro) => ({ dia: 1, cidade: "Salvador", regiao: "Pelourinho", titulo: "Centro",
    atividades: [{ periodo: "manhã", nome: "Elevador Lacerda", bairro: "Comércio", custo: 0 }, { periodo: "tarde", nome: tarde, bairro, custo: 0 }],
    almoco: { nome: "Restaurante do SENAC", bairro: "Pelourinho", custo: 90 }, jantar: { nome: "Restaurante B", bairro: "Pelourinho", custo: 90 } });
  assert.deepEqual(foraDaRegiao([dia("Farol da Barra", "Barra")]).map(f => f.nome), ["Elevador Lacerda", "Farol da Barra"]);
  assert.deepEqual(foraDaRegiao([{ ...dia("Farol", "Barra"), regiao: "Pelourinho, Comércio e Barra" }]), []);
  assert.deepEqual(foraDaRegiao([{ ...dia("Farol", "Barra"), regiao: "Centro (Pelourinho / Comércio) - Barra" }]), []);
  assert.deepEqual(foraDaRegiao([{ ...dia("Praia", "Barra da Tijuca"), regiao: "Pelourinho, Comércio e Barra" }]).map(f => f.nome), ["Praia"]);
  const pedidos = [];
  const respostas = [dia("Farol da Barra", "Barra"), { ...dia("Igreja de São Francisco", "Pelourinho"), regiao: "Pelourinho e Comércio" }];
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: { dias: diasDe(respostas[pedidos.length - 1], 3), dicas: [] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 300 }, {}, client);
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[1], /fora da região do dia.*Farol da Barra, em Barra/);
  assert.equal(r.dias[0].atividades[1].nome, "Igreja de São Francisco");
  // Se já vem certo, não chama de novo.
  let n = 0;
  const certo = { messages: { parse: async () => { n++; return { parsed_output: { dias: diasDe({ ...dia("Farol", "Barra"), regiao: "Pelourinho, Comércio e Barra" }, 3), dicas: [] } }; } } };
  await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 3, verbaPasseios: 300 }, {}, certo);
  assert.equal(n, 1);
  // Se a segunda tentativa for pior, fica a primeira.
  const tentativas = [{ ...dia("Farol da Barra", "Barra"), regiao: "Pelourinho e Comércio" }, dia("Farol da Barra", "Barra")];
  let m = 0;
  const pior = { messages: { parse: async () => ({ parsed_output: { dias: diasDe(tentativas[m++], 3), dicas: [] } }) } };
  const r3 = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 4, verbaPasseios: 300 }, {}, pior);
  assert.equal(m, 2);
  assert.equal(r3.dias[0].regiao, "Pelourinho e Comércio");
});

test("roteiro cortado no limite de tokens tenta de novo; erro da API não", async () => {
  let n = 0;
  const cortado = { messages: { parse: async req => (++n === 1
    ? { stop_reason: "max_tokens", parsed_output: null }
    : resposta([0]).messages.parse(req)) } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 3, pessoas: 5, verbaPasseios: 400 }, {}, cortado);
  assert.equal(n, 2);
  assert.equal(r.dias.length, 1);
  let m = 0;
  const sempre = { messages: { parse: async () => { m++; throw new SyntaxError("JSON incompleto"); } } };
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 3, pessoas: 6, verbaPasseios: 400 }, {}, sempre), /sem roteiro/);
  assert.equal(m, 2);
});

// Gemini falso: a 1ª chamada (com Google Maps) devolve a lista de lugares, as seguintes devolvem o roteiro em JSON.
const diaGemini = { dia: 1, cidade: "Salvador", regiao: "Pelourinho, Comércio", titulo: "Centro Histórico",
  atividades: [{ periodo: "Manhã", nome: "Igreja de São Francisco", bairro: "Pelourinho", custo: 20 }],
  almoco: { nome: "Restaurante Axego", bairro: "Pelourinho", custo: 120 }, jantar: { nome: "Lugar Inventado", bairro: "Comércio", custo: 100 } };
function geminiFalso(respostas) {
  const pedidos = [];
  const fetchFn = async (url, init) => {
    const corpo = JSON.parse(init.body);
    pedidos.push({ url, corpo, chave: init.headers["x-goog-api-key"] });
    const r = respostas[pedidos.length - 1];
    if (r.status) return new Response("erro", { status: r.status });
    return new Response(JSON.stringify({ candidates: [r] }), { status: 200 });
  };
  return { pedidos, fetchFn };
}
const mapsOk = { content: { parts: [{ text: [1, 2, 3].map(n => `Day ${n} - Salvador - Area: Pelourinho\n- Morning: Igreja de São Francisco | Pelourinho | 10`).join("\n") }] }, finishReason: "STOP",
  groundingMetadata: { groundingChunks: [
    { maps: { title: "Igreja e Convento de São Francisco", uri: "https://maps.google.com/?cid=1" } },
    { maps: { title: "Restaurante Axego - Google Maps", uri: "https://maps.google.com/?cid=2" } },
    { maps: { title: "Lugar Inventado", uri: "javascript:alert(1)" } }
  ] } };
const jsonOk = { content: { parts: [{ text: JSON.stringify({ dias: diasDe(diaGemini, 3), dicas: ["a"] }) }] }, finishReason: "STOP" };

test("roteiro com GEMINI_API_KEY consulta o Google Maps e monta o roteiro só com esses lugares", async () => {
  const { pedidos, fetchFn } = geminiFalso([mapsOk, jsonOk]);
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, fetchFn);
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[0].url, /gemini-3\.8-flash:generateContent$/);
  assert.equal(pedidos[0].chave, "k");
  assert.deepEqual(pedidos[0].corpo.tools, [{ googleMaps: {} }]);
  assert.ok(pedidos[0].corpo.toolConfig.retrievalConfig.latLng.latitude < -12);
  assert.match(pedidos[0].corpo.contents[0].parts[0].text, /Use Google Maps to plan a 3-day trip to Salvador/);
  // 2ª chamada: sem ferramentas, JSON com esquema e a lista do Maps no prompt.
  assert.equal(pedidos[1].corpo.tools, undefined);
  assert.equal(pedidos[1].corpo.generationConfig.responseMimeType, "application/json");
  assert.equal(pedidos[1].corpo.generationConfig.responseJsonSchema.$schema, undefined);
  assert.match(pedidos[1].corpo.contents[0].parts[0].text, /Lista:\nDay 1 - Salvador/);
  assert.equal(r.fonte, "gemini");
  assert.equal(r.dias[0].atividades[0].maps, "https://maps.google.com/?cid=1");
  assert.equal(r.dias[0].almoco.maps, "https://maps.google.com/?cid=2");
  // Link que não é https do Google não entra.
  assert.equal(r.dias[0].jantar.maps, undefined);
});

test("uso de tokens: uma linha por roteiro e soma do dia no KV, sem dados pessoais", async () => {
  const { registrarUso, novoUso, PRECOS } = await import("../server/uso.js");
  const kv = new Map();
  const LEADS = { get: async k => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => { kv.set(k, v); } };
  const respostas = [mapsOk, jsonOk];
  let n = 0;
  const fetchFn = async () => new Response(JSON.stringify({ candidates: [respostas[n++]], usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 200, thoughtsTokenCount: 50 } }));
  const logs = []; const log = console.log; console.log = (...a) => logs.push(a.join(" "));
  try {
    await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 8, verbaPasseios: 300 }, { GEMINI_API_KEY: "k", LEADS }, null, null, fetchFn);
  } finally { console.log = log; }
  const linha = JSON.parse(logs.find(l => l.startsWith("uso: ")).slice(5));
  assert.equal(linha.tipo, "gratis");
  assert.equal(linha.resultado, "ok");
  assert.deepEqual(linha.modelos["gemini-3.8-flash"], { chamadas: 2, entrada: 2000, saida: 500, usd: (2000 * PRECOS["gemini-3.8-flash"].entrada + 500 * PRECOS["gemini-3.8-flash"].saida) / 1e6 });
  assert.ok(!/Salvador|@/.test(logs.find(l => l.startsWith("uso: "))), "sem destino nem e-mail");
  const [chave] = [...kv.keys()].filter(k => k.startsWith("uso:"));
  assert.match(chave, /^uso:\d{4}-\d{2}-\d{2}$/);
  // Claude soma no mesmo dia, separado por modelo.
  const uso = novoUso(); uso.claude("claude-sonnet-5-5", { input_tokens: 3000, output_tokens: 4000 });
  console.log = () => {};
  try { await registrarUso(uso, { tipo: "detalhado", resultado: "ok" }, { LEADS }); } finally { console.log = log; }
  const dia = JSON.parse(kv.get(chave));
  assert.deepEqual(dia.roteiros, { gratis: 1, detalhado: 1 });
  assert.equal(dia.modelos["claude-sonnet-5-5"].saida, 4000);
  assert.ok(Math.abs(dia.usd - (linha.usd + (3000 * 3 + 4000 * 15) / 1e6)) < 1e-9);
});

test("roteiro cai para o Claude quando o Gemini falha", async () => {
  const { pedidos, fetchFn } = geminiFalso([{ status: 429 }]);
  let claude = 0;
  const client = { messages: { parse: async () => { claude++; return { parsed_output: { dias: diasDe(diaGemini, 3), dicas: [] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 3, verbaPasseios: 300 }, { GEMINI_API_KEY: "k", ANTHROPIC_API_KEY: "a" }, client, null, fetchFn);
  assert.equal(pedidos.length, 1);
  assert.equal(claude, 1);
  assert.equal(r.fonte, "claude");
  // Sem a chave do Claude, o erro do Gemini sobe.
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 4, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, geminiFalso([{ status: 500 }]).fetchFn), /Gemini 500/);
});

test("roteiro responde antes do corte da Cloudflare: Gemini parado vira erro claro, Claude tem prazo", async () => {
  const { Demorou, PRAZO_MS } = await import("../server/roteiro.js");
  // Gemini que nunca responde: só termina quando o prazo aborta o fetch.
  // (O timer do AbortSignal.timeout não segura o Node aberto: o setTimeout segura até o abort.)
  const parado = (url, init) => new Promise((_, nao) => {
    const segura = setTimeout(() => {}, 5000);
    init.signal.addEventListener("abort", () => { clearTimeout(segura); nao(init.signal.reason); });
  });
  const t0 = Date.now();
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 6, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, parado, { prazoMs: 200 }), Demorou);
  assert.ok(Date.now() - t0 < 2000, "não espera além do prazo");
  // O Claude recebe o tempo que resta (nunca mais que o prazo) e nenhuma nova tentativa automática do SDK.
  let opcoes;
  const client = { messages: { parse: async (req, o) => { opcoes = o; return { parsed_output: { dias: diasDe(diaGemini, 3), dicas: [] } }; } } };
  await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 7, verbaPasseios: 300 }, {}, client);
  assert.equal(opcoes.maxRetries, 0);
  assert.ok(opcoes.timeout > 0 && opcoes.timeout <= PRAZO_MS);
});

test("roteiro do Gemini cortado ou fora do formato tenta de novo uma vez", async () => {
  const cortado = { content: { parts: [{ text: "{\"dias\": [" }] }, finishReason: "MAX_TOKENS" };
  const { pedidos, fetchFn } = geminiFalso([mapsOk, cortado, jsonOk]);
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 5, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, fetchFn);
  assert.equal(pedidos.length, 3);
  assert.equal(r.dias.length, 3);
});

test("roteiro com dias faltando pede de novo e, se continuar curto, não vai para o cache", () => comCache(async () => {
  const pedidos = [];
  const curto = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return resposta([0], 2).messages.parse(req); } } };
  const pedido = { destino: "Salvador", noites: 5, pessoas: 2, verbaPasseios: 300 };
  const r = await gerarRoteiro(pedido, {}, curto);
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[0], /exatamente 6 dias, do dia 1 ao dia 6/);
  assert.match(pedidos[1], /a tentativa anterior parou no dia 2/);
  assert.equal(r.dias.length, 2);
  const completo = await gerarRoteiro(pedido, {}, resposta([0], 6));
  assert.equal(completo.cache, false);
  assert.equal(completo.dias.length, 6);
  assert.equal((await gerarRoteiro(pedido, {}, resposta([0], 6))).cache, true);
}));

test("Gemini com lista do Maps ou roteiro curto cai para o Claude", async () => {
  const claude = () => { const c = { n: 0, messages: { parse: async () => { c.n++; return { parsed_output: { dias: diasDe(diaGemini, 3), dicas: [] } }; } } }; return c; };
  const env = { GEMINI_API_KEY: "k", ANTHROPIC_API_KEY: "a" };
  // Lista do Maps só com o dia 1 para uma viagem de 3 dias.
  const listaCurta = { ...mapsOk, content: { parts: [{ text: "Day 1 - Salvador - Area: Pelourinho\n- Morning: Igreja de São Francisco | Pelourinho | 10" }] } };
  let c = claude(), g = geminiFalso([listaCurta]);
  let r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 200 }, env, c, null, g.fetchFn);
  assert.equal(g.pedidos.length, 1);
  assert.equal(r.fonte, "claude");
  // Roteiro em JSON com 1 de 3 dias, duas vezes.
  const jsonCurto = { content: { parts: [{ text: JSON.stringify({ dias: [diaGemini], dicas: [] }) }] }, finishReason: "STOP" };
  c = claude(); g = geminiFalso([mapsOk, jsonCurto, jsonCurto]);
  r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 3, verbaPasseios: 200 }, env, c, null, g.fetchFn);
  assert.equal(g.pedidos.length, 3);
  assert.match(g.pedidos[2].corpo.contents[0].parts[0].text, /parou no dia 1/);
  assert.equal(c.n, 1);
  assert.equal(r.fonte, "claude");
  assert.equal(r.dias.length, 3);
});

test("viagem de mais de 15 dias em várias cidades resume em 15 dias passando por todas", async () => {
  const pedidos = [];
  // 1ª tentativa: 15 dias, todos em Lisboa e com número repetido; 2ª: 8 em Lisboa e 7 em "Paris, França".
  const tentativas = [
    diasDe({ cidade: "Lisboa", titulo: "Lisboa", atividades: [] }, 15).map(d => ({ ...d, dia: Math.min(d.dia, 14) })),
    diasDe({ cidade: "Lisboa", titulo: "Lisboa", atividades: [] }, 15).map(d => d.dia > 8 ? { ...d, cidade: "Paris, França" } : d)
  ];
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: { dias: tentativas[pedidos.length - 1], dicas: [] } }; } } };
  const r = await gerarRoteiro({ paradas: [{ destino: "Lisboa", noites: 11 }, { destino: "Paris", noites: 10 }], verbaPasseios: 2000 }, {}, client);
  assert.match(pedidos[0], /15 dias de roteiro no total \(a viagem tem 22 dias, mas o roteiro resume em 15\)\. Distribua os 15 dias entre as cidades nessa proporção, passando por todas/);
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[1], /ficaram sem nenhum dia: Paris/);
  assert.equal(r.dias.length, 15);
  assert.deepEqual(r.dias.map(d => d.dia), Array.from({ length: 15 }, (_, i) => i + 1));
  assert.equal(r.dias[14].cidade, "Paris, França");
  assert.deepEqual(r.resumido, { dias: 15, viagem: 22 });
});

test("cidade do roteiro aceita outra grafia do nome", async () => {
  const { faltaNoRoteiro } = await import("../server/roteiro.js");
  const p = validarPedido({ paradas: [{ destino: "Bangkok", noites: 2 }, { destino: "Seul", noites: 1 }] });
  assert.deepEqual(faltaNoRoteiro(p, [{ cidade: "Bangkok" }, { cidade: "Bangkok" }, { cidade: "Seoul" }, { cidade: "Seoul" }]), []);
  assert.match(faltaNoRoteiro(p, [{ cidade: "Bangkok" }, { cidade: "Bangkok" }, { cidade: "Bangkok" }, { cidade: "Bangkok" }]).join(), /sem nenhum dia: Seul/);
});

test("roteiro do Gemini devolve as fontes do Google Maps e não aceita lista do Maps cortada", async () => {
  const { fetchFn } = geminiFalso([mapsOk, jsonOk]);
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 6, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, fetchFn);
  assert.deepEqual(r.fontes, [
    { nome: "Igreja e Convento de São Francisco", url: "https://maps.google.com/?cid=1" },
    { nome: "Restaurante Axego", url: "https://maps.google.com/?cid=2" }
  ]);
  const cortado = { ...mapsOk, finishReason: "MAX_TOKENS" };
  let claude = 0;
  const client = { messages: { parse: async () => { claude++; return { parsed_output: { dias: diasDe(diaGemini, 3), dicas: [] } }; } } };
  const g = geminiFalso([cortado]);
  await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 7, verbaPasseios: 300 }, { GEMINI_API_KEY: "k", ANTHROPIC_API_KEY: "a" }, client, null, g.fetchFn);
  assert.equal(g.pedidos.length, 1);
  assert.equal(claude, 1);
});

test("link do Maps de rede com várias unidades vai para unidades diferentes", async () => {
  const { linkDoMaps } = await import("../server/gemini.js");
  const lugares = [{ title: "Coco Bambu", uri: "https://maps.google.com/?cid=10" }, { title: "Coco Bambu", uri: "https://maps.google.com/?cid=11" }];
  const usados = new Set();
  assert.equal(linkDoMaps("Coco Bambu", lugares, usados), "https://maps.google.com/?cid=10");
  assert.equal(linkDoMaps("Coco Bambu", lugares, usados), "https://maps.google.com/?cid=11");
  assert.equal(linkDoMaps("Outro Lugar", lugares, usados), undefined);
});

test("restaurante do Gemini que não veio do Google Maps faz o roteiro ser refeito", async () => {
  const inventado = { content: { parts: [{ text: JSON.stringify({ dias: diasDe({ ...diaGemini, almoco: { nome: "Cantina Que Não Existe", bairro: "Pelourinho", custo: 50 } }, 3), dicas: [] }) }] }, finishReason: "STOP" };
  const { pedidos, fetchFn } = geminiFalso([mapsOk, inventado, jsonOk]);
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 8, verbaPasseios: 300 }, { GEMINI_API_KEY: "k" }, null, null, fetchFn);
  assert.match(pedidos[0].corpo.contents[0].parts[0].text, /Look up every lunch and dinner restaurant on Google Maps/);
  assert.equal(pedidos.length, 3);
  assert.match(pedidos[2].corpo.contents[0].parts[0].text, /Cantina Que Não Existe \(dia 1\) não está na lista do Google Maps/);
  assert.equal(r.dias[0].almoco.nome, "Restaurante Axego");
});

test("roteiro do Gemini com restaurante fora do Maps mesmo refeito aparece mas não vai para o cache", async () => {
  await comCache(async () => {
    const inventado = { content: { parts: [{ text: JSON.stringify({ dias: diasDe({ ...diaGemini, almoco: { nome: "Cantina Que Não Existe", bairro: "Pelourinho", custo: 50 } }, 3), dicas: [] }) }] }, finishReason: "STOP" };
    const pedido = { destino: "Salvador", noites: 2, pessoas: 9, verbaPasseios: 300 };
    const r = await gerarRoteiro(pedido, { GEMINI_API_KEY: "k" }, null, null, geminiFalso([mapsOk, inventado, inventado]).fetchFn);
    assert.equal(r.dias[0].almoco.nome, "Cantina Que Não Existe");
    assert.equal(r.semConferir, undefined);
    const g = geminiFalso([mapsOk, jsonOk]);
    const r2 = await gerarRoteiro(pedido, { GEMINI_API_KEY: "k" }, null, null, g.fetchFn);
    assert.equal(r2.cache, false);
    assert.equal(g.pedidos.length, 2);
    assert.equal((await gerarRoteiro(pedido, { GEMINI_API_KEY: "k" }, null, null, g.fetchFn)).cache, true);
  });
});

test("cadastro de e-mail guarda no KV só o necessário e vale a última escolha de novidades", async () => {
  const { guardarLead, LeadInvalido } = await import("../server/lead.js");
  const kv = new Map();
  let opcoes;
  const LEADS = { get: async (k) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v, o) => { kv.set(k, v); opcoes = o; } };
  await assert.rejects(guardarLead({ email: "sem-arroba" }, { LEADS }), LeadInvalido);
  await assert.rejects(guardarLead({ email: "a@b" }, { LEADS }), LeadInvalido);
  assert.deepEqual(await guardarLead({ email: " Ana@Email.com ", novidades: true, destino: "Lima" }, { LEADS }), { ok: true, guardado: true });
  assert.equal(opcoes.expirationTtl, 2 * 365 * 86400);
  await guardarLead({ email: "ana@email.com", novidades: false, destino: "Salvador" }, { LEADS });
  const l = JSON.parse(kv.get("ana@email.com"));
  assert.equal(l.novidades, false);
  assert.deepEqual(l.destinos, ["Lima", "Salvador"]);
  assert.deepEqual(Object.keys(l).sort(), ["destinos", "email", "novidades", "primeiro", "ultimo"]);
  // Sem o KV ligado, o download segue liberado, mas o app pede o e-mail de novo depois.
  assert.deepEqual(await guardarLead({ email: "b@email.com" }, {}), { ok: true, guardado: false });
});

// ---- Pix do roteiro completo (Mercado Pago) ----
const pedidoRio = { destino: "Rio de Janeiro", noites: 3, pessoas: 2, estilo: 1, interesses: ["praia"], verbaPasseios: 800, verbaAlimentacao: 1200 };
// fetch falso do Mercado Pago: guarda os pedidos e responde com a order dada.
function mercadoPago(order, status = 200) {
  const pedidos = [];
  const fetchFn = async (url, opts = {}) => {
    pedidos.push({ url, ...opts, corpo: opts.body && JSON.parse(opts.body) });
    return new Response(JSON.stringify(order), { status });
  };
  return { fetchFn, pedidos };
}

test("pix: cria a order de R$ 9,90 presa ao pedido de roteiro e devolve o copia e cola", async () => {
  const { criarPix, PixInvalido } = await import("../server/pix.js");
  const { fetchFn, pedidos } = mercadoPago({ id: "ORD01ABC123", status: "action_required",
    transactions: { payments: [{ payment_method: { qr_code: "00020126580014br.gov.bcb.pix", qr_code_base64: "iVBOR", ticket_url: "https://mp/t" } }] } });
  const { referencia } = await import("../server/pix.js");
  const ref = await referencia(pedidoRio);
  assert.match(ref, /^[0-9a-f]{40}$/);
  assert.notEqual(ref, await referencia({ ...pedidoRio, noites: 4 }));
  // A ordem das cidades escolhida faz parte do que foi pago.
  const ida = [{ destino: "Rio de Janeiro", noites: 2 }, { destino: "Salvador", noites: 2 }];
  assert.notEqual(await referencia({ ...pedidoRio, paradas: ida }), await referencia({ ...pedidoRio, paradas: [...ida].reverse() }));
  const antes = Date.now();
  const r = await criarPix({ pedido: pedidoRio, email: " Voce@Email.com " }, { MP_ACCESS_TOKEN: "tok" }, fetchFn);
  const { expiraEm, ...resto } = r;
  assert.deepEqual(resto, { id: "ORD01ABC123", copiaECola: "00020126580014br.gov.bcb.pix", qrCode: "iVBOR", link: "https://mp/t", preco: 9.9 });
  // Sem data na resposta do Mercado Pago, a validade conta de antes do pedido (1 hora).
  const ms = Date.parse(expiraEm) - antes;
  assert.ok(ms >= 60 * 60000 && ms <= 60 * 60000 + (Date.now() - antes), `validade de ~1 h: ${ms}`);
  const [p] = pedidos;
  assert.equal(p.url, "https://api.mercadopago.com/v1/orders");
  assert.equal(p.headers.Authorization, "Bearer tok");
  assert.ok(p.headers["X-Idempotency-Key"]);
  assert.equal(p.corpo.total_amount, "9.90");
  assert.equal(p.corpo.external_reference, ref);
  assert.deepEqual(p.corpo.transactions.payments[0].payment_method, { id: "pix", type: "bank_transfer" });
  assert.equal(p.corpo.transactions.payments[0].expiration_time, "PT60M");
  assert.equal(p.corpo.payer.email, "voce@email.com");
  await assert.rejects(criarPix({ pedido: pedidoRio, email: "x" }, { MP_ACCESS_TOKEN: "tok" }, fetchFn), PixInvalido);
  await assert.rejects(criarPix({ pedido: { destino: "Narnia", noites: 3 }, email: "a@b.com" }, { MP_ACCESS_TOKEN: "tok" }, fetchFn), EntradaInvalida);
  assert.equal(pedidos.length, 1, "entrada inválida não chama o Mercado Pago");
});

test("pix: só libera order paga, do valor certo e do mesmo roteiro", async () => {
  const { conferirPagamento, situacaoPix, referencia, PixInvalido, PixNaoPago } = await import("../server/pix.js");
  const env = { MP_ACCESS_TOKEN: "tok" };
  const ref = await referencia(pedidoRio);
  const paga = { id: "ORD01ABC123", status: "processed", status_detail: "accredited", total_amount: "9.90", external_reference: ref };
  assert.equal(await conferirPagamento("ORD01ABC123", pedidoRio, env, mercadoPago(paga).fetchFn), ref);
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago(paga).fetchFn), { status: "pago" });
  await assert.rejects(conferirPagamento("ORD01ABC123", { ...pedidoRio, noites: 5 }, env, mercadoPago(paga).fetchFn), PixInvalido);
  await assert.rejects(conferirPagamento("ORD01ABC123", pedidoRio, env, mercadoPago({ ...paga, total_amount: "1.00" }).fetchFn), PixNaoPago);
  const esperando = { ...paga, status: "action_required", status_detail: "waiting_transfer" };
  await assert.rejects(conferirPagamento("ORD01ABC123", pedidoRio, env, mercadoPago(esperando).fetchFn), PixNaoPago);
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago(esperando).fetchFn), { status: "esperando" });
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago({ ...paga, status: "expired" }).fetchFn), { status: "expirado" });
  // O Mercado Pago demora dias para marcar a order como expirada: o prazo do pagamento já decide.
  const comPrazo = (o, prazo) => ({ ...o, transactions: { payments: [{ date_of_expiration: prazo }] } });
  const agora = Date.parse("2026-10-08T12:00:00Z");
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago(comPrazo(esperando, "2026-10-08T11:59:00.000-00:00")).fetchFn, agora), { status: "expirado" });
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago(comPrazo(esperando, "2026-10-08T12:30:00.000-00:00")).fetchFn, agora), { status: "esperando" });
  assert.deepEqual(await situacaoPix("ORD01ABC123", env, mercadoPago(comPrazo(paga, "2026-10-08T11:59:00.000-00:00")).fetchFn, agora), { status: "pago" }, "pago no limite continua pago");
  const { fetchFn, pedidos } = mercadoPago(paga);
  await assert.rejects(situacaoPix("../payments", env, fetchFn), PixInvalido);
  assert.equal(pedidos.length, 0, "id estranho não vira URL");
});

test("recuperar o roteiro pago: pedido guardado 30 dias, liberado só com número, e-mail e pagamento", async () => {
  const { guardarPedido, recuperarPedido, referencia, GUARDA_DIAS, PixInvalido, PixNaoPago, PedidoNaoGuardado } = await import("../server/pix.js");
  const kv = new Map(); let ttl;
  const LEADS = { get: async (k, tipo) => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v, o) => { kv.set(k, v); ttl = o.expirationTtl; } };
  const env = { MP_ACCESS_TOKEN: "tok", LEADS };
  const viagem = { entrada: { orcamento: 5000 }, atual: { destino: { n: "Rio de Janeiro" } }, modo: "destino" };
  assert.equal(await guardarPedido("ORD01ABC123", { pedido: pedidoRio, viagem, email: "Ana@Email.com" }, env), true);
  assert.equal(ttl, GUARDA_DIAS * 86400);
  assert.ok(!/ana|email\.com/i.test(kv.get("pedido:ORD01ABC123")), "o e-mail não fica no KV, só um código");
  // A consulta da order no Mercado Pago não traz o payer: a conferência é pelo código guardado.
  const paga = { id: "ORD01ABC123", status: "processed", total_amount: "9.90", external_reference: await referencia(pedidoRio) };
  const r = await recuperarPedido({ id: " ord01abc123 ", email: "ana@email.com " }, env, mercadoPago(paga).fetchFn);
  assert.deepEqual(r.viagem, viagem);
  assert.equal(r.pedido.destino, pedidoRio.destino);
  // E-mail diferente e pedido inexistente dão a mesma resposta (não revela se o número existe).
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "outra@email.com" }, env, mercadoPago(paga).fetchFn), PixInvalido);
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "ana@email.com" }, env, mercadoPago({}, 404).fetchFn), PixInvalido);
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "" }, env, mercadoPago(paga).fetchFn), PixInvalido);
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "ana@email.com" }, env, mercadoPago({ ...paga, status: "action_required" }).fetchFn), PixNaoPago);
  // Se o Mercado Pago trouxer o e-mail, ele também precisa bater.
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "ana@email.com" }, env, mercadoPago({ ...paga, payer: { email: "outra@email.com" } }).fetchFn), PixInvalido);
  // Pedido que não está guardado: mesma resposta de e-mail errado; guardado de outro roteiro: avisa.
  await assert.rejects(recuperarPedido({ id: "ORD01ZZZ999", email: "ana@email.com" }, env, mercadoPago({ ...paga, id: "ORD01ZZZ999" }).fetchFn), PixInvalido);
  await assert.rejects(recuperarPedido({ id: "ORD01ABC123", email: "ana@email.com" }, env, mercadoPago({ ...paga, external_reference: "outra" }).fetchFn), PedidoNaoGuardado);
});

test("roteiro completo pede horários, uma dica por lugar e mais dicas, com cache separado do simples", () => comCache(async () => {
  const pedidos = [];
  const lugar = (nome, horario) => ({ nome, bairro: "Centro", custo: 0, horario, dica: `Dica de ${nome}` });
  const client = { messages: { parse: async req => { pedidos.push(req); return { parsed_output: {
    dias: [1, 2].map(dia => ({ dia, cidade: "Salvador", regiao: "Centro", seguranca: 3, titulo: "Centro", atividades: [{ periodo: "Manhã", ...lugar(`Pelourinho ${dia}`, "09:00–11:30") }], almoco: lugar(`Restô ${dia}`, "12:00–13:30"), jantar: lugar(`Bar ${dia}`, "19:30–21:00") })),
    dicas: Array.from({ length: 10 }, (_, i) => `dica ${i}`) } }; } } };
  const pedido = { destino: "Salvador", noites: 1, pessoas: 2, estilo: 1, verbaPasseios: 500 };
  const r = await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos });
  assert.match(pedidos[0].messages[0].content, /horario/);
  assert.match(pedidos[0].messages[0].content, /8 dicas/);
  assert.match(pedidos[0].messages[0].content, /5 ou 6 atividades por dia: 2 de manhã, 2 à tarde e 1 ou 2 à noite/);
  assert.equal(r.dicas.length, 8);
  assert.equal(r.dias[0].almoco.horario, "12:00–13:30");
  assert.equal(r.dias[0].atividades[0].dica, "Dica de Pelourinho 1");
  assert.equal(pedidos.length, 1);
  assert.equal((await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos })).cache, true);
  // O simples do mesmo pedido não vem do cache do completo.
  await gerarRoteiro(pedido, {}, client);
  assert.equal(pedidos.length, 2);
  assert.doesNotMatch(pedidos.at(-1).messages[0].content, /horario/);
}));

test("roteiro completo com menos de 8 dicas pede de novo e não vai para o cache", () => comCache(async () => {
  const pedidos = [];
  const lugar = nome => ({ nome, bairro: "Centro", custo: 0, horario: "09:00–10:00", dica: "x" });
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: {
    dias: [1, 2].map(dia => ({ dia, cidade: "Salvador", regiao: "Centro", seguranca: 3, titulo: "Centro", atividades: [{ periodo: "Manhã", ...lugar(`P${dia}`) }], almoco: lugar(`A${dia}`), jantar: lugar(`J${dia}`) })),
    dicas: ["só uma"] } }; } } };
  const pedido = { destino: "Salvador", noites: 1, pessoas: 3, estilo: 1, verbaPasseios: 500 };
  const r = await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos });
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[1], /inclua 8 dicas da viagem; a tentativa anterior trouxe 1/);
  assert.equal(r.dicas.length, 1);
  await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos });
  assert.equal(pedidos.length, 4);
}));

test("roteiro completo pede ao Google Maps o horário de funcionamento e segue a ordem de cidades escolhida", async () => {
  const { promptMaps } = await import("../server/gemini.js");
  const p = { ...validarPedido({ paradas: [{ destino: "Seul", noites: 3 }, { destino: "Bangkok", noites: 4 }] }), completo: true };
  assert.match(promptMaps(p), /opening hours/);
  assert.match(promptMaps(p), /5 or 6 attractions/);
  assert.match(promptMaps(p), /- Evening: Place name/);
  assert.match(promptMaps(p), /Seul, Coreia do Sul \(3 nights\); then Bangkok/);
  assert.doesNotMatch(promptMaps({ ...p, completo: false }), /opening hours/);
});

test("roteiro completo aproveita o simples do cache: mantém os lugares, acrescenta atividades, horários e dicas", () => comCache(async () => {
  const pedido = { destino: "Salvador", noites: 1, pessoas: 4, estilo: 1, verbaPasseios: 500 };
  const dia = n => ({ dia: n, cidade: "Salvador", regiao: "Centro", titulo: "Centro", atividades: [{ periodo: "Manhã", nome: `Museu ${n}`, bairro: "Centro", custo: 0 }],
    almoco: { nome: `Restô ${n}`, bairro: "Centro", custo: 50 }, jantar: { nome: `Bar ${n}`, bairro: "Centro", custo: 60 } });
  const hora = (horario, dica) => ({ horario, dica, descricao: "Lugar bom", comoChegar: "5 min a pé" });
  const ativ = (nome, periodo, horario, custo = 0) => ({ nome, bairro: "Centro", custo, periodo, horario, dica: `Dica ${nome}`, descricao: `Sobre ${nome}`, comoChegar: "10 min a pé", destaque: false });
  const cheio = n => [ativ(`Museu ${n}`, "manhã", "09:00–10:30"), ativ(`Igreja ${n}`, "manhã", "10:45–11:45"), ativ(`Forte ${n}`, "tarde", "14:00–15:30", 40.4),
    ativ(`Praça ${n}`, "tarde", "16:00–17:00"), ativ(`Mirante ${n}`, "noite", "21:00–22:00")];
  const respostas = [
    { dias: [dia(1), dia(2)], dicas: ["a", "b", "c"] },
    // Atalho no Claude: dias trocados de lugar, não serve.
    { apresentacao: "Oi", dias: [2, 1].map(n => ({ dia: n, sobreRegiao: "x", atividades: cheio(n), almoco: hora("12:00–13:00", "x"), jantar: hora("19:00–20:30", "x") })), dicas: Array(8).fill("d") }
  ];
  const pedidos = [];
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: respostas[pedidos.length - 1] }; } } };
  await gerarRoteiro(pedido, {}, client);
  const g = geminiFalso([{ content: { parts: [{ text: JSON.stringify({ apresentacao: "Ana, Salvador vai te encantar!", dias: [1, 2].map(n => ({ dia: n, sobreRegiao: `Centro histórico ${n}`, seguranca: n === 1 ? 4 : 2, segurancaNota: "Cheio de dia; à noite, carro de aplicativo", atividades: cheio(n), almoco: hora("12:00–13:00", "Peça o prato do dia"), jantar: hora("19:00–20:30", "Reserve") })),
    dicas: Array.from({ length: 8 }, (_, i) => `dica ${i}`) }) }] }, finishReason: "STOP" }]);
  // Gemini responde certo de primeira.
  const r = await gerarRoteiro(pedido, { GEMINI_API_KEY: "k" }, client, null, g.fetchFn, { completo: true, fotosFetch: semFotos });
  assert.equal(pedidos.length, 1);
  assert.equal(g.pedidos.length, 1);
  assert.equal(g.pedidos[0].corpo.tools, undefined);
  assert.match(g.pedidos[0].corpo.contents[0].parts[0].text, /Mantenha todas as atividades/);
  assert.match(g.pedidos[0].corpo.contents[0].parts[0].text, /Museu 2/);
  assert.deepEqual(r.dias[1].atividades.map(a => a.nome), ["Museu 2", "Igreja 2", "Forte 2", "Praça 2", "Mirante 2"]);
  assert.equal(r.dias[1].atividades[4].periodo, "noite");
  assert.equal(r.dias[0].jantar.dica, "Reserve");
  assert.equal(r.dias[0].jantar.nome, "Bar 1");
  assert.equal(r.totalPasseios, 80);
  assert.equal(r.dicas.length, 8);
  // Nota de segurança de 1 a 5 em cada dia; fora disso (ou sem nota), o completo conta como incompleto e é pedido de novo.
  assert.equal(r.dias[0].seguranca, 4);
  assert.equal(r.dias[0].segurancaNota, "Cheio de dia; à noite, carro de aplicativo");
  assert.equal(r.dias[1].seguranca, 2);
  const pc = { dias: 2, paradas: [{ dest: { n: "Salvador" } }], completo: true };
  const { faltaNoRoteiro } = await import("../server/roteiro.js");
  assert.match(faltaNoRoteiro(pc, [{ dia: 1, seguranca: 4 }, { dia: 2, seguranca: 9 }]).join(), /"seguranca".*dias 2/);
  assert.deepEqual(faltaNoRoteiro(pc, [{ dia: 1, seguranca: 4 }, { dia: 2, seguranca: 1 }]), []);
  assert.match(g.pedidos[0].corpo.contents[0].parts[0].text, /"seguranca": nota de 1 a 5/);
  assert.equal((await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos })).cache, true);  // Só com o Claude, a resposta com os dias trocados é recusada e o completo é montado do zero.
  const pedido2 = { ...pedido, pessoas: 7 };
  pedidos.length = 0;
  const so = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: pedidos.length === 2 ? respostas[1] : respostas[0] }; } } };
  await gerarRoteiro(pedido2, {}, so);
  await gerarRoteiro(pedido2, {}, so, null, globalThis.fetch, { completo: true, fotosFetch: semFotos }).catch(() => {});
  assert.match(pedidos[1], /Mantenha todas as atividades/);
  assert.match(pedidos[2], /Este é o roteiro completo\./);
}));

test("roteiro completo monta do zero quando a resposta do atalho não casa com o simples", () => comCache(async () => {
  const pedido = { destino: "Salvador", noites: 1, pessoas: 5, estilo: 1, verbaPasseios: 500 };
  const lugar = (nome, horario) => ({ nome, bairro: "Centro", custo: 0, horario, dica: "x" });
  const completo = { dias: [1, 2].map(dia => ({ dia, cidade: "Salvador", regiao: "Centro", seguranca: 3, titulo: "Centro", atividades: [{ periodo: "Manhã", ...lugar(`P${dia}`, "09:00–10:00") }], almoco: lugar(`A${dia}`, "12:00–13:00"), jantar: lugar(`J${dia}`, "19:00–20:00") })),
    dicas: Array.from({ length: 8 }, (_, i) => `d${i}`) };
  const respostas = [completo, { dias: [], dicas: [] }, completo];
  const pedidos = [];
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: respostas[pedidos.length - 1] }; } } };
  await gerarRoteiro(pedido, {}, client);
  const r = await gerarRoteiro(pedido, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos });
  assert.equal(pedidos.length, 3);
  assert.match(pedidos[2], /Este é o roteiro completo\./);
  assert.equal(r.dias[0].almoco.horario, "12:00–13:00");
}));

// Wikimedia falsa: busca na Wikipédia e licença no Commons.
function wikiFalsa({ titulo = "Elevador Lacerda", imagem = "Elevador_Lacerda.jpg", thumb = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Elevador_Lacerda.jpg/800px-Elevador_Lacerda.jpg", licenca = "CC BY-SA 4.0", resumo = "O elevador liga a Cidade Baixa à Cidade Alta de Salvador." } = {}) {
  const urls = [];
  const fetchFn = async url => {
    urls.push(url);
    if (url.includes("commons.wikimedia.org")) return new Response(JSON.stringify({ query: { pages: [{ imageinfo: [{ extmetadata: { Artist: { value: '<a href="x">Maria Silva</a>' }, LicenseShortName: { value: licenca } } }] }] } }));
    return new Response(JSON.stringify({ query: { pages: [{ title: titulo, pageimage: imagem, extract: resumo, fullurl: "https://pt.wikipedia.org/wiki/x", thumbnail: { source: thumb } }] } }));
  };
  return { fetchFn, urls };
}

test("foto do lugar vem do Commons com autor e licença, e só se o artigo for do lugar", async () => {
  const { fotoDoLugar } = await import("../server/fotos.js");
  const w = wikiFalsa();
  const f = await fotoDoLugar("Elevador Lacerda", "Salvador", w.fetchFn);
  assert.match(w.urls[0], /pt\.wikipedia\.org/);
  assert.deepEqual(f, { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Elevador_Lacerda.jpg/800px-Elevador_Lacerda.jpg",
    autor: "Maria Silva", licenca: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File%3AElevador_Lacerda.jpg" });
  // Artigo de outra coisa (a cidade), imagem fora do Commons ou SVG: sem foto.
  assert.equal(await fotoDoLugar("Elevador Lacerda", "Salvador", wikiFalsa({ titulo: "Salvador (Bahia)" }).fetchFn), null);
  assert.equal(await fotoDoLugar("Elevador Lacerda", "Salvador", wikiFalsa({ thumb: "https://upload.wikimedia.org/wikipedia/en/a/ab/x.jpg" }).fetchFn), null);
  assert.equal(await fotoDoLugar("Elevador Lacerda", "Salvador", wikiFalsa({ imagem: "Mapa.svg" }).fetchFn), null);
  assert.equal(await fotoDoLugar("Elevador Lacerda", "Salvador", async () => { throw new Error("rede"); }), null);
  // Outro museu que só divide a palavra "museu", ou um lugar de mesmo nome em outra cidade: sem foto.
  assert.equal(await fotoDoLugar("Museu do Ipiranga", "São Paulo", wikiFalsa({ titulo: "Museu de Arte de São Paulo", resumo: "Museu em São Paulo." }).fetchFn), null);
  assert.ok(await fotoDoLugar("Museu do Ipiranga", "São Paulo", wikiFalsa({ titulo: "Museu do Ipiranga", resumo: "Museu em São Paulo." }).fetchFn));
  assert.equal(await fotoDoLugar("Catedral Metropolitana", "Brasília", wikiFalsa({ titulo: "Catedral Metropolitana", resumo: "Igreja no centro de Fortaleza." }).fetchFn), null);
});

test("roteiro completo leva o nome da pessoa, um destaque por dia com foto e cache separado por nome", () => comCache(async () => {
  const pedido = { destino: "Salvador", noites: 1, pessoas: 2, estilo: 1, verbaPasseios: 500 };
  const lugar = (nome, horario, destaque) => ({ nome, bairro: "Comércio", custo: 0, horario, dica: "x", descricao: `Sobre ${nome}`, comoChegar: "a pé", ...(destaque === undefined ? {} : { destaque }) });
  const pedidos = [];
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: {
    apresentacao: "Ana, prepare-se!",
    dias: [1, 2].map(dia => ({ dia, cidade: "Salvador", regiao: "Comércio", seguranca: 3, titulo: "Centro", sobreRegiao: "Bairro antigo",
      atividades: [lugar(`Mercado Modelo ${dia}`, "09:00–10:00", true), lugar(`Elevador Lacerda ${dia}`, "10:30–11:00", true)],
      almoco: lugar(`Restô ${dia}`, "12:00–13:00"), jantar: lugar(`Bar ${dia}`, "19:00–20:00") })),
    dicas: Array.from({ length: 8 }, (_, i) => `d${i}`) } }; } } };
  const w = wikiFalsa({ titulo: "Mercado Modelo", resumo: "Mercado em Salvador." });
  const r = await gerarRoteiro({ ...pedido, nome: '  Ana "Maria"\n{x}  ' }, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: w.fetchFn });
  assert.match(pedidos[0], /chamando o viajante pelo nome \("Ana Maria x"/);
  assert.match(pedidos[0], /"descricao"/);
  assert.match(pedidos[0], /"comoChegar"/);
  assert.match(pedidos[0], /"sobreRegiao"/);
  assert.equal(r.apresentacao, "Ana, prepare-se!");
  assert.deepEqual(r.dias[0].atividades.map(a => a.destaque), [true, false]);
  assert.equal(r.dias[0].atividades[0].foto.autor, "Maria Silva");
  assert.equal(r.dias[0].atividades[1].foto, undefined);
  assert.equal(r.dias[0].sobreRegiao, "Bairro antigo");
  // Mesmo pedido com o mesmo nome vem do cache; com outro nome, monta outro.
  assert.equal((await gerarRoteiro({ ...pedido, nome: "Ana Maria x" }, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos })).cache, true);
  await gerarRoteiro({ ...pedido, nome: "João" }, {}, client, null, globalThis.fetch, { completo: true, fotosFetch: semFotos });
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[1], /"João"/);
  // O roteiro grátis não usa o nome.
  await gerarRoteiro({ ...pedido, pessoas: 3, nome: "Ana" }, {}, client);
  assert.doesNotMatch(pedidos.at(-1), /Ana/);
}));

test("o nome não muda a referência do Pix", async () => {
  const { referencia } = await import("../server/pix.js");
  const pedido = { destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 300 };
  assert.equal(await referencia({ ...pedido, nome: "Ana" }), await referencia(pedido));
});

// Aviasales falsa com voos de ida e volta em datas variadas.
function voosDoMes(voos) {
  const urls = [];
  const fetchImpl = async url => {
    urls.push(url);
    const ret = new URL(url).searchParams.get("return_at");
    const data = voos.filter(v => v.return_at.startsWith(ret)).map(v => ({ ...v, link: "/search/x" }));
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  };
  return { fetchImpl, urls };
}

test("datas flexíveis: acha os dias mais baratos com as noites pedidas, inclusive voltando no mês seguinte", async () => {
  const { fetchImpl, urls } = voosDoMes([
    { price: 400, departure_at: "2027-03-02T08:00:00-03:00", return_at: "2027-03-04T10:00:00-03:00" }, // 2 noites: não serve
    { price: 900, departure_at: "2027-03-10T08:00:00-03:00", return_at: "2027-03-15T10:00:00-03:00" },
    { price: 700, departure_at: "2027-03-29T08:00:00-03:00", return_at: "2027-04-03T10:00:00-03:00" },
    { price: 300, departure_at: "2027-02-27T08:00:00-03:00", return_at: "2027-03-04T10:00:00-03:00" } // outro mês
  ]);
  const v = await datasMaisBaratas({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, mes: "2027-03", noites: 5, hoje: "2027-01-01", token: "tok", marker: "786422", fetchImpl });
  assert.deepEqual([v.porPessoa, v.ida, v.volta], [700, "2027-03-29", "2027-04-03"]);
  assert.match(v.link, /marker=786422/);
  assert.equal(urls.length, 2);
  const longa = voosDoMes([]);
  await datasMaisBaratas({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, mes: "2027-01", noites: 30, hoje: "2026-12-01", token: "tok", fetchImpl: longa.fetchImpl });
  assert.deepEqual(longa.urls.map(u => new URL(u).searchParams.get("return_at")), ["2027-01", "2027-02", "2027-03"], "31/01 + 30 noites volta em março");
  assert.ok(urls.every(u => u.includes("departure_at=2027-03&") && u.includes("one_way=false")));
  assert.equal(await datasMaisBaratas({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, mes: "2027-03", noites: 5, hoje: "2027-03-30", token: "tok", fetchImpl }), null, "não sugere data que já passou");
  assert.equal(await datasMaisBaratas({ origem: { iata: "SAO" }, destino: { iata: "RIO" }, mes: "2027-03", noites: 5, fetchImpl }), null, "sem token não busca");
});

test("veredito com datas flexíveis usa os dias mais baratos do destino e cai para datas de exemplo sem preço", async () => {
  const { fetchImpl } = voosDoMes([{ price: 650, departure_at: "2027-05-12T08:00:00-03:00", return_at: "2027-05-17T10:00:00-03:00" }]);
  const pedido = { ...base, ida: "", volta: "", destino: "Salvador", flexivel: { mes: "2027-05", noites: 5 } };
  const r = await montarVeredito(pedido, { TRAVELPAYOUTS_TOKEN: "tok" }, fetchImpl);
  assert.equal(r.entrada.flexivel, true);
  assert.equal(r.entrada.noites, 5);
  assert.deepEqual([r.atual.ida, r.atual.volta], ["2027-05-12", "2027-05-17"]);
  const sem = await montarVeredito(pedido, {}, fetchImpl);
  assert.equal(sem.atual.ida, undefined);
  assert.deepEqual([sem.entrada.ida, sem.entrada.volta], ["2027-05-15", "2027-05-20"]);
  // Sem voo com 3 noites: não usa o preço do mês, que é de outra duração.
  const urls = [];
  const outro = await montarVeredito({ ...pedido, flexivel: { mes: "2027-05", noites: 3 } }, { TRAVELPAYOUTS_TOKEN: "tok" }, async u => { urls.push(u); return fetchImpl(u); });
  assert.equal(outro.atual.ida, undefined);
  assert.ok(!urls.some(u => /departure_at=2027-05&return_at=2027-05&one_way=false&currency=brl&market=br&sorting=price&limit=1$/.test(u)), "não busca o mais barato do mês");
  assert.ok(urls.some(u => u.includes("departure_at=2027-05-15&")), "tenta as datas de exemplo");
  await assert.rejects(montarVeredito({ ...pedido, flexivel: { mes: "2020-01", noites: 5 } }), /daqui para a frente/);
  await assert.rejects(montarVeredito({ ...pedido, flexivel: { mes: "2027-05", noites: 0 } }), /quantas noites/);
});
