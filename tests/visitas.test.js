import { test } from "node:test";
import assert from "node:assert/strict";
import { visualizacoesDaSemana, somarVisualizacoes } from "../server/visitas.js";

const resposta = (...views) => ({ data: { viewer: { zones: [{ httpRequests1dGroups: views.map(pageViews => ({ sum: { pageViews } })) }] } } });
const fetchDe = (json, ok = true, pedidos = []) => async (url, init) => { pedidos.push({ url, init }); return { ok, json: async () => json }; };
const env = { CF_ANALYTICS_TOKEN: "t", CF_ZONE_ID: "z" };

test("soma as visualizações dos dias e recusa resposta com erro", () => {
  assert.equal(somarVisualizacoes(resposta(100, 250, 50)), 400);
  assert.equal(somarVisualizacoes({ errors: [{ message: "x" }], data: null }), null);
  assert.equal(somarVisualizacoes({}), null);
});

test("sem token ou zona não consulta nada e não mostra contador", async () => {
  let chamou = false;
  assert.equal(await visualizacoesDaSemana({}, async () => { chamou = true; }), null);
  assert.equal(chamou, false);
});

test("consulta os últimos 7 dias com o token e só mostra acima do mínimo", async () => {
  const pedidos = [];
  const r = await visualizacoesDaSemana(env, fetchDe(resposta(200, 150), true, pedidos), new Date("2026-10-08T12:00:00Z"));
  assert.deepEqual(r, { semana: 350 });
  assert.equal(pedidos[0].init.headers.authorization, "Bearer t");
  assert.deepEqual(JSON.parse(pedidos[0].init.body).variables, { zona: "z", desde: "2026-10-02" });
  assert.equal(await visualizacoesDaSemana(env, fetchDe(resposta(120))), null);
  assert.deepEqual(await visualizacoesDaSemana({ ...env, VISITAS_MINIMO: "100" }, fetchDe(resposta(120))), { semana: 120 });
});

test("falha da Cloudflare não mostra número", async () => {
  assert.equal(await visualizacoesDaSemana(env, fetchDe({}, false)), null);
  assert.equal(await visualizacoesDaSemana(env, async () => { throw new Error("rede"); }), null);
});
