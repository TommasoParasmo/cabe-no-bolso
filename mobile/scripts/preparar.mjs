// Copia o site (../public) para www/, que é o que vai dentro do app.
// No app não usamos service worker: os arquivos já estão no aparelho.
import { cpSync, rmSync, writeFileSync, readFileSync } from "node:fs";

const www = new URL("../www/", import.meta.url);
rmSync(www, { recursive: true, force: true });
cpSync(new URL("../../public/", import.meta.url), www, { recursive: true });
rmSync(new URL("sw.js", www), { force: true });

for (const arq of ["app/index.html", "index.html"]) {
  const url = new URL(arq, www);
  const html = readFileSync(url, "utf8").replace(/<script>if \("serviceWorker"[^<]*<\/script>\n?/, "");
  writeFileSync(url, html);
}

// O app abre direto no simulador, sem a página de apresentação.
writeFileSync(new URL("index.html", www), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=app/index.html"><script>location.replace("app/index.html")</script>\n');
console.log("www pronto");
