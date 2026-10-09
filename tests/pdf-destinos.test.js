import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DESTINOS, roteiroDestino } from "../server/pdf/destinos/index.js";

const VALORES = { periodo: "08 a 14 de julho de 2027", inicio: "2027-07-08", clima: { mes: 7, min: 3, max: 30 }, pessoas: 4, cotacao: 5.4,
  passagens: 18800, hotel: 4200, noites: 6, comidaPasseios: 6200, transporte: 9800, sobra: 4000, dias: [900, 1400, 1300, 1100, 700, 900, 800] };

for (const slug of Object.keys(DESTINOS)) {
  test("PDF de " + slug + ": só o nome muda e as páginas fecham", () => {
    const z = roteiroDestino(slug, "Zuleica Tavares"), q = roteiroDestino(slug, "Quirino");
    assert.equal(z.replaceAll("Zuleica Tavares", "X").replaceAll("Zuleica", "X"), q.replaceAll("Quirino", "X"));
    const n = (z.match(/<section /g) || []).length;
    assert.ok(n >= 34, n + " páginas");
    assert.match(z, new RegExp("pág\\. " + n + " de " + n + "|pág\\. " + (n - 1) + " de " + n));
    assert.doesNotMatch(z, /@@PG:|@@PAG@@|undefined|NaN|\[object Object\]/);
    assert.doesNotMatch(z, /—/);
  });

  test("PDF de " + slug + ": nome escapado, valores e imagens existentes", () => {
    const h = roteiroDestino(slug, '<img src=x onerror=alert(1)> "Ana"', VALORES);
    assert.doesNotMatch(h, /<img src=x/);
    assert.match(h, /08 a 14 de julho de 2027/);
    assert.match(h, /R\$ 39\.000/);
    assert.match(h, /Quinta, 08\/07/);
    assert.match(h, /Clima em julho/);
    assert.doesNotMatch(h, /undefined|NaN/);
    const imgs = [...h.matchAll(/(?:src="|url\()(\/roteiros\/[^")]+)/g)].map(m => m[1]);
    assert.ok(imgs.length > 10);
    for (const i of new Set(imgs)) {
      assert.ok(i.startsWith("/roteiros/" + slug + "/"), i);
      assert.ok(existsSync("public" + i), i);
    }
    assert.ok((h.match(/<a class="qr"/g) || []).length >= 12);
  });

  test("PDF de " + slug + ": sumário aponta para páginas que existem", () => {
    const h = roteiroDestino(slug, "Ana");
    const ids = new Set([...h.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]));
    const links = [...h.matchAll(/<a href="#([^"]+)"/g)].map(m => m[1]);
    assert.ok(links.length >= 30);
    for (const l of links) assert.ok(ids.has(l), l);
  });
}

test("PDF de Buenos Aires: feira de San Telmo avisa quando o dia não é domingo", () => {
  const dom = roteiroDestino("buenos-aires", "Ana", { inicio: "2027-03-13" }); // dia 2 = domingo
  const qua = roteiroDestino("buenos-aires", "Ana", { inicio: "2027-03-16" });
  const t = DESTINOS["buenos-aires"].dias[1].semana.senao[0];
  assert.doesNotMatch(dom, new RegExp("<b>" + t + "</b>"));
  assert.match(qua, new RegExp("<b>" + t + "</b>"));
});
