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
