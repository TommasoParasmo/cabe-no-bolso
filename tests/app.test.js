import { test } from "node:test";
import assert from "node:assert/strict";
import { DESTINOS } from "../public/lib/dados.js";
import { custo, acharDestino, noitesQueCabem } from "../public/lib/custo.js";
import { precoVoo } from "../server/precos.js";
import { montarVeredito, EntradaInvalida } from "../server/veredito.js";
import { gerarRoteiro, validarPedido, LimiteAtingido, LIMITE_DIA, foraDaRegiao } from "../server/roteiro.js";

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

test("veredito rejeita entrada inválida", async () => {
  await assert.rejects(montarVeredito({ ...base, orcamento: 10 }), EntradaInvalida);
  await assert.rejects(montarVeredito({ ...base, volta: "2026-11-19" }), EntradaInvalida);
  await assert.rejects(montarVeredito({ ...base, destino: "Atlântida" }), EntradaInvalida);
});

test("roteiro chama o modelo barato com a verba no prompt e devolve dias e dicas", async () => {
  let pedido;
  const client = { messages: { parse: async req => { pedido = req; return { parsed_output: { dias: [{ dia: 1, titulo: "Centro", atividades: [{ periodo: "Manhã", nome: "Pelourinho", custo: 0 }] }], dicas: ["a", "b", "c", "d"] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 5, pessoas: 2, estilo: 0, interesses: ["praia"], verbaPasseios: 724 }, {}, client);
  assert.equal(pedido.model, "claude-haiku-4-5");
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

test("noitesQueCabem considera ficar só 1 noite", () => {
  const f = { ...base, noites: 2, orcamento: 0 };
  const um = custo(rio, { ...f, noites: 1 });
  assert.equal(noitesQueCabem(rio, { ...f, orcamento: um.total }), 1);
});

const resposta = custos => ({ messages: { parse: async () => ({ parsed_output: {
  dias: [{ dia: 1, titulo: "Centro", atividades: custos.map(c => ({ periodo: "Manhã", nome: "X", custo: c })) }], dicas: []
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
    await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 1000 + i * 100 }, {}, resposta([0]), "1.2.3.4");
  }
  await assert.rejects(gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 9000 }, {}, resposta([0]), "1.2.3.4"), LimiteAtingido);
  const repetido = await gerarRoteiro({ destino: "Salvador", noites: 3, verbaPasseios: 1000 }, {}, resposta([0]), "1.2.3.4");
  assert.equal(repetido.cache, true);
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
  const client = { messages: { parse: async req => { pedidos.push(req.messages[0].content); return { parsed_output: { dias: [respostas[pedidos.length - 1]], dicas: [] } }; } } };
  const r = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 2, verbaPasseios: 300 }, {}, client);
  assert.equal(pedidos.length, 2);
  assert.match(pedidos[1], /fora da região do dia.*Farol da Barra, em Barra/);
  assert.equal(r.dias[0].atividades[1].nome, "Igreja de São Francisco");
  // Se já vem certo, não chama de novo.
  let n = 0;
  const certo = { messages: { parse: async () => { n++; return { parsed_output: { dias: [{ ...dia("Farol", "Barra"), regiao: "Pelourinho, Comércio e Barra" }], dicas: [] } }; } } };
  await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 3, verbaPasseios: 300 }, {}, certo);
  assert.equal(n, 1);
  // Se a segunda tentativa for pior, fica a primeira.
  const tentativas = [{ ...dia("Farol da Barra", "Barra"), regiao: "Pelourinho e Comércio" }, dia("Farol da Barra", "Barra")];
  let m = 0;
  const pior = { messages: { parse: async () => ({ parsed_output: { dias: [tentativas[m++]], dicas: [] } }) } };
  const r3 = await gerarRoteiro({ destino: "Salvador", noites: 2, pessoas: 4, verbaPasseios: 300 }, {}, pior);
  assert.equal(m, 2);
  assert.equal(r3.dias[0].regiao, "Pelourinho e Comércio");
});
