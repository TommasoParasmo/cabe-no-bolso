import { test } from "node:test";
import assert from "node:assert/strict";
import { roteiroJerusalem } from "../server/pdf/jerusalem.js";

test("PDF de Jerusalém: 16 páginas e só o nome muda", () => {
  const a = roteiroJerusalem("Maria Aparecida");
  assert.equal((a.match(/<section class="page/g) || []).length, 16);
  assert.match(a, /<b>Maria Aparecida<\/b>/);
  assert.match(a, /Boa viagem, Maria\./);
  assert.match(a, /Roteiro de Maria Aparecida · Jerusalém/);
  const z = roteiroJerusalem("Zuleica Tavares"), q = roteiroJerusalem("Quirino");
  assert.equal(z.replaceAll("Zuleica Tavares", "X").replaceAll("Zuleica", "X"), q.replaceAll("Quirino", "X"));
});

test("PDF de Jerusalém: nome escapado e sem os dados do exemplo", () => {
  const h = roteiroJerusalem('<img src=x onerror=alert(1)> "Ana"');
  assert.ok(!h.includes("<img src=x"));
  assert.match(roteiroJerusalem("   "), /<b>Viajante<\/b>/);
  assert.doesNotMatch(h, /07\/03|13\/03|2 pessoas|19\.594|Ana Souza|março/);
});
