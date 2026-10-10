// Páginas de oferta por destino: cada endereço de _redirects tem dados na página e existe no checkout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const redirects = readFileSync("public/_redirects", "utf8").split("\n").filter(l => l.startsWith("/")).map(l => l.split(/\s+/));
const oferta = readFileSync("public/oferta/oferta.js", "utf8");
const comprar = readFileSync("public/comprar/comprar.js", "utf8");

test("cada página de oferta reescreve para /oferta/ e tem destino nos dados e no checkout", () => {
  assert.ok(redirects.length >= 4);
  for (const [de, para, status] of redirects) {
    assert.equal(para, "/oferta/");
    assert.equal(status, "200");
    const slug = de.slice(1);
    assert.match(oferta, new RegExp(`^'?${slug}'?:\\{nome:`, "m"), slug + " sem dados na página");
    assert.match(comprar, new RegExp(`"?${slug}"?: "`), slug + " sem checkout");
    for (const f of ["pdf1", "sp1"]) {
      const img = oferta.match(new RegExp(`^'?${slug}'?:\\{[\\s\\S]*?img:'(\\w+)'`, "m"))[1];
      assert.ok(existsSync(`public/oferta/img/${img}/${f}.jpg`), `${slug}: falta ${f}.jpg`);
    }
  }
});

test("cada destino tem erros caros, bônus próprios, roteiro modular e âncora de preço", () => {
  const n = (oferta.match(/^'?[\w-]+'?:\{nome:/gm) || []).length;
  for (const campo of ["erros:\\[", "bonus:\\[", "modular:'", "barato:'"])
    assert.equal((oferta.match(new RegExp("^  " + campo, "gm")) || []).length, n, campo + " faltando em algum destino");
});
