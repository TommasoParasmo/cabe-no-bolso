import { test } from "node:test";
import assert from "node:assert/strict";
import { DESTINOS } from "../public/lib/dados.js";
import { custo, acharDestino, noitesQueCabem } from "../public/lib/custo.js";
import { precoVoo } from "../server/precos.js";
import { montarVeredito, EntradaInvalida } from "../server/veredito.js";
import { gerarRoteiro, validarPedido, LimiteAtingido, LIMITE_DIA } from "../server/roteiro.js";

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
  const f = { ...base, noites: 5 };
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
  assert.ok(r.opcoes.every(o => o.estado !== "nao_cabe"));
  assert.equal(r.atual.fonteVoo, "estimativa");
});

test("veredito com destino usa o preço real da passagem quando há token", async () => {
  const r = await montarVeredito({ ...base, destino: "rio de janeiro" }, { TRAVELPAYOUTS_TOKEN: "tok" }, aviasales(600).fetchImpl);
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
  assert.deepEqual(r.opcoes.map(o => o.destino.n).sort(), ["Buenos Aires", "Salvador", "Santiago"]);
  assert.equal(r.atual, r.opcoes[0]);
  const brasil = await montarVeredito({ ...base, destinos: ["Brasil"] });
  assert.equal(brasil.modo, "comparar");
  assert.ok(brasil.opcoes.length > 1 && brasil.opcoes.every(o => o.destino.p === "Brasil"));
  const um = await montarVeredito({ ...base, destinos: ["Lisboa"] });
  assert.equal(um.modo, "destino");
  await assert.rejects(montarVeredito({ ...base, destinos: ["Salvador", "Atlântida"] }), EntradaInvalida);
});
