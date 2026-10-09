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

test("PDF de Jerusalém: valores da simulação entram quando vêm, senão a referência por pessoa", () => {
  const v = { periodo: "07 a 13 de março de 2027", pessoas: 2, cotacao: 1.52, passagens: 11780, hotel: 3534, noites: 6, comidaPasseios: 3220, transporte: 1060, sobra: 5406, dias: [280, 320, 260, 1150, 300, 340, 520] };
  const h = roteiroJerusalem("Ana", v);
  assert.match(h, /R\$ 19\.594/);
  assert.match(h, /07 a 13 de março de 2027/);
  assert.match(h, /Gasto previsto para 2 pessoas<\/small><b>R\$ 1\.150/);
  assert.match(h, /R\$ 1,52 por shekel/);
  assert.match(h, /Sobra do orçamento<\/span><b>R\$ 5\.406/);
  const g = roteiroJerusalem("Ana");
  assert.match(g, /R\$ 1\.585/);
  assert.match(g, /Gasto previsto por pessoa<\/small><b>R\$ 575/);
  // Valor estranho não quebra o PDF: volta para a referência.
  assert.match(roteiroJerusalem("Ana", { dias: [1, 2], total: -5, periodo: "<b>x</b>" }), /Gasto previsto por pessoa/);
  assert.doesNotMatch(roteiroJerusalem("Ana", { periodo: "<b>x</b>", pessoas: 1 }), /<b>x<\/b>/);
});

test("PDF de Jerusalém: todas as imagens apontam para /roteiros/jerusalem/", () => {
  const h = roteiroJerusalem("Ana");
  const caminhos = [...h.matchAll(/(?:src="|url\()([^")]+\.(?:jpg|png))/g)].map(m => m[1]);
  assert.ok(caminhos.length > 10);
  for (const c of caminhos) assert.match(c, /^\/roteiros\/jerusalem\/[a-z-]+\.(jpg|png)$/, c);
});
