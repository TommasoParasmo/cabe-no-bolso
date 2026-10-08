import { test } from "node:test";
import assert from "node:assert/strict";
import { altaTemporada, estimarVoo } from "../public/lib/custo.js";
import { DESTINOS, ORIGENS } from "../public/lib/dados.js";

const d = n => DESTINOS.find(x => x.n === n);

test("alta temporada usa os meses do destino quando ele tem os seus", () => {
  const gramado = d("Gramado"), rio = d("Rio de Janeiro"), campos = d("Campos do Jordão");
  assert.equal(altaTemporada("2027-06-10", gramado), true);
  assert.equal(altaTemporada("2027-11-10", gramado), true);
  assert.equal(altaTemporada("2027-03-10", gramado), false);
  assert.equal(altaTemporada("2027-08-10", campos), true);
  assert.equal(altaTemporada("2027-12-10", campos), false);
  // Sem o campo, continua dezembro, janeiro e julho.
  assert.equal(altaTemporada("2027-07-10", rio), true);
  assert.equal(altaTemporada("2027-06-10", rio), false);
  assert.equal(altaTemporada("2027-12-10"), true);
});

test("voo para Gramado em junho sai com o acréscimo da alta", () => {
  const sp = ORIGENS[0], hoje = new Date("2027-01-01T12:00:00");
  const junho = estimarVoo(sp, d("Gramado"), "2027-06-10", hoje), marco = estimarVoo(sp, d("Gramado"), "2027-03-10", hoje);
  assert.equal(Math.round(junho / marco * 100), 125);
});

test("no roteiro com várias cidades, cada uma usa a temporada do dia em que se chega nela", async () => {
  const { custoMulti } = await import("../public/lib/custo.js");
  const f = { origem: "São Paulo", ida: "2027-05-29", noites: 6, pessoas: 2, estilo: 0, orcamento: 99999, interesses: [] };
  const r = custoMulti([{ dest: d("Rio de Janeiro"), noites: 3 }, { dest: d("Gramado"), noites: 3 }], f);
  const gramado = r.paradas.find(p => p.n === "Gramado");
  assert.equal(gramado.checkin, "2027-06-01");
  assert.equal(gramado.diaria, 250);
  assert.equal(r.paradas.find(p => p.n === "Rio de Janeiro").diaria, 190);
  assert.equal(r.alta, true);
});

test("Natal Luz de Gramado: alta de 22/10 a 17/01, virando o ano", () => {
  const gramado = d("Gramado");
  assert.equal(altaTemporada("2027-10-21", gramado), false);
  assert.equal(altaTemporada("2027-10-22", gramado), true);
  assert.equal(altaTemporada("2028-01-17", gramado), true);
  assert.equal(altaTemporada("2028-01-18", gramado), false);
  assert.equal(altaTemporada("2027-07-15", gramado), true);
});

test("Tel Aviv é destino próprio", () => {
  assert.equal(d("Tel Aviv")?.ap, "TLV");
});

test("Jerusalém e Tel Aviv dividem o TLV: o trecho entre elas é por terra, não voo de R$ 0", async () => {
  const { custoMulti } = await import("../public/lib/custo.js");
  const f = { orcamento: 40000, origem: ORIGENS[0].n, ida: "2027-04-10", noites: 6, pessoas: 2, estilo: 1, interesses: [] };
  const r = custoMulti([{ dest: d("Jerusalém"), noites: 3 }, { dest: d("Tel Aviv"), noites: 3 }], f);
  const meio = r.trechos?.[1] ?? null;
  assert.ok(meio, "trecho Jerusalém → Tel Aviv existe");
  assert.equal(meio.meio, "onibus");
  assert.ok(meio.porPessoa > 0);
  assert.equal(meio.link, null);
  assert.equal(r.trechos[0].meio, "aviao");
});
