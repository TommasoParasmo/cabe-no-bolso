import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DESTINOS, roteiroDestino } from "../server/pdf/destinos/index.js";
import { encaixarDias } from "../server/pdf/roteiro.js";

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

test("encaixarDias: troca com um dia do meio, usa o último dia, a alternativa ou o aviso", () => {
  const dia = (t, semana) => ({ t, gasto: t, semana });
  const feira = semana => dia("feira", { dias: [0], ...semana });
  const base = f => [dia("a"), f, dia("c"), dia("d"), dia("e"), dia("f"), dia("g")];
  // Dia 2 cai na terça e o domingo é o dia 6: troca.
  assert.deepEqual(encaixarDias(base(feira()), [1, 2, 3, 4, 5, 0, 1]).map(d => d.t), ["a", "f", "c", "d", "e", "feira", "g"]);
  // Domingo só no último dia: usa a versão de último dia e põe a do meio no lugar.
  const f2 = feira({ ultimo: dia("feira+aeroporto"), meio: dia("recoleta") });
  assert.deepEqual(encaixarDias(base(f2), [1, 2, 3, 4, 5, 6, 0]).map(d => d.t), ["a", "recoleta", "c", "d", "e", "f", "feira+aeroporto"]);
  // Sem domingo na viagem: alternativa; sem alternativa, o aviso.
  assert.equal(encaixarDias(base(feira({ alternativa: dia("outra") })), [1, 2, 3, 4, 5, 6, 1])[1].t, "outra");
  assert.deepEqual(encaixarDias(base(feira({ senao: ["x", "y"] })), [1, 2, 3, 4, 5, 6, 1])[1].tip, ["x", "y"]);
  // Já no dia certo: nada muda.
  assert.equal(encaixarDias(base(feira()), [6, 0, 1, 2, 3, 4, 5])[1].t, "feira");
});

test("PDF de Buenos Aires: a feira de San Telmo cai sempre num domingo", () => {
  const dias = h => [...h.matchAll(/<section id="dia\d"[\s\S]*?<\/section>/g)].map(m => m[0]);
  for (const inicio of ["2027-03-13", "2027-03-15", "2027-03-17"]) {
    const h = roteiroDestino("buenos-aires", "Ana", { inicio });
    const comFeira = dias(h).filter(d => /Feira de San Telmo/.test(d));
    assert.ok(comFeira.length >= 1, inicio);
    for (const d of comFeira) assert.match(d, /Domingo, /, inicio);
  }
  // A página de lugar da feira aponta para o dia em que ela caiu.
  const h = roteiroDestino("buenos-aires", "Ana", { inicio: "2027-03-15" });
  const n = dias(h).findIndex(d => /Feira de San Telmo/.test(d)) + 1;
  assert.match(h, new RegExp("<small>Dia " + n + " do roteiro · reserve [^<]*</small><h2>[^<]*Feira", "i"));
});
