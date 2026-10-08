import test from "node:test";
import assert from "node:assert/strict";
import { lerNormais, climaDoMes, acharDestinoClima } from "../server/clima.js";
import { onRequestGet } from "../functions/api/clima.js";

const MESES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const resposta = (max, min) => ({
  properties: { parameter: {
    T2M_MAX: Object.fromEntries([...MESES.map((m, i) => [m, max + i * 0.1]), ["ANN", max]]),
    T2M_MIN: Object.fromEntries([...MESES.map((m, i) => [m, min + i * 0.1]), ["ANN", min]])
  } }
});

test("lerNormais devolve os 12 meses arredondados", () => {
  const n = lerNormais(resposta(29.6, 22.4));
  assert.equal(n.length, 12);
  assert.deepEqual(n[0], { min: 22, max: 30 });
  assert.deepEqual(n[10], { min: 23, max: 31 });
});

test("lerNormais recusa resposta incompleta ou com valor de preenchimento", () => {
  assert.equal(lerNormais({}), null);
  const r = resposta(30, 22);
  r.properties.parameter.T2M_MAX.NOV = -999;
  assert.equal(lerNormais(r), null);
});

test("climaDoMes busca a coordenada do destino e devolve o mês pedido", async () => {
  const dest = acharDestinoClima("Salvador");
  let url;
  const c = await climaDoMes(dest, 11, async u => { url = u; return { ok: true, json: async () => resposta(29.6, 22.4) }; });
  assert.deepEqual(c, { min: 23, max: 31 });
  assert.match(url, /latitude=-12\.91/);
  assert.match(url, /T2M_MAX%2CT2M_MIN/);
});

test("climaDoMes sem resposta válida não inventa nada", async () => {
  const dest = acharDestinoClima("Salvador");
  assert.equal(await climaDoMes(dest, 11, async () => ({ ok: false })), null);
  assert.equal(await climaDoMes(dest, 11, async () => { throw new Error("rede"); }), null);
  assert.equal(await climaDoMes(dest, 13, async () => ({ ok: true, json: async () => resposta(30, 22) })), null);
});

test("/api/clima recusa destino desconhecido ou mês fora de 1 a 12", async () => {
  for (const q of ["destino=Atlantida&mes=5", "destino=Salvador&mes=0", "destino=Salvador&mes=x"]) {
    const r = await onRequestGet({ request: new Request(`https://vaidarviagem.com.br/api/clima?${q}`) });
    assert.equal(r.status, 400);
  }
});
