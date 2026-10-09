import { test } from "node:test";
import assert from "node:assert/strict";
import { lerOrigem, registrarUso, registrarOrigem, novoUso } from "../server/uso.js";

const kvFalso = () => {
  const kv = new Map();
  return { kv, LEADS: { get: async k => (kv.has(k) ? JSON.parse(kv.get(k)) : null), put: async (k, v) => { kv.set(k, v); } } };
};
const agora = new Date("2026-10-09T15:00:00Z");
const semLog = async fn => { const log = console.log; console.log = () => {}; try { return await fn(); } finally { console.log = log; } };

test("lê a origem do pedido só com valores limpos", () => {
  assert.equal(lerOrigem({}), "direto");
  assert.equal(lerOrigem({ utm: { fonte: "meta", anuncio: "ate-encontrar-isso" } }), "meta:ate-encontrar-isso");
  assert.equal(lerOrigem({ utm: { fonte: "Meta", anuncio: "F3-Santiago-7n" } }), "meta:f3-santiago-7n");
  assert.equal(lerOrigem({ utm: { fonte: "meta", anuncio: "<script>" } }), "meta");
  assert.equal(lerOrigem({ utm: { fonte: "meta", anuncio: "x".repeat(41) } }), "meta");
  assert.equal(lerOrigem({ utm: { fonte: "google" } }), "outro");
  assert.equal(lerOrigem({ utm: { fonte: { a: 1 } } }), "direto");
  assert.equal(lerOrigem({ utm: "meta" }), "direto");
});

test("soma a origem por tipo no dia, incluindo roteiros do cache", async () => {
  const { kv, LEADS } = kvFalso();
  const uso = () => { const u = novoUso(); u.gemini("gemini-3.8-flash", { promptTokenCount: 10, candidatesTokenCount: 10 }); return u; };
  await semLog(() => registrarUso(uso(), { tipo: "gratis", resultado: "ok", origem: "meta:tom-chile" }, { LEADS }, agora));
  await semLog(() => registrarUso(uso(), { tipo: "gratis", resultado: "ok", origem: "direto" }, { LEADS }, agora));
  // Deu erro: o gasto conta, a origem não (a pessoa não recebeu roteiro).
  await semLog(() => registrarUso(uso(), { tipo: "gratis", resultado: "erro", origem: "meta:tom-chile" }, { LEADS }, agora));
  await registrarOrigem({ tipo: "gratis", origem: "meta:tom-chile" }, { LEADS }, agora);
  await registrarOrigem({ tipo: "detalhado", origem: "meta:tom-chile" }, { LEADS }, agora);
  const dia = JSON.parse(kv.get("uso:2026-10-09"));
  assert.deepEqual(dia.origem, { gratis: { "meta:tom-chile": 2, direto: 1 }, detalhado: { "meta:tom-chile": 1 } });
  // O resto do contador não muda: roteiros e gasto só dos que chamaram a IA.
  assert.equal(dia.roteiros.gratis, 3);
  assert.equal(dia.roteiros.detalhado, undefined);
});

test("limita os nomes de origem por dia para não encher o KV", async () => {
  const { kv, LEADS } = kvFalso();
  for (let i = 0; i < 35; i++) await registrarOrigem({ tipo: "gratis", origem: `meta:a${i}` }, { LEADS }, agora);
  await registrarOrigem({ tipo: "gratis", origem: "meta:a0" }, { LEADS }, agora);
  const o = JSON.parse(kv.get("uso:2026-10-09")).origem.gratis;
  assert.equal(Object.keys(o).length, 31);
  assert.equal(o["meta:a0"], 2);
  assert.equal(o.outro, 5);
});
