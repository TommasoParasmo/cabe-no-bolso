import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/_middleware.js";

const ok = async () => new Response("{}", { status: 200 });
const post = (url, headers) => onRequest({ request: new Request(url, { method: "POST", headers, body: "{}" }), next: ok });

test("API: só JSON, só do site ou do app, e nada no pages.dev", async () => {
  const site = "https://vaidarviagem.com.br/api/roteiro";
  assert.equal((await post(site, { "content-type": "application/json", Origin: "https://vaidarviagem.com.br" })).status, 200);
  assert.equal((await post(site, { "content-type": "application/json; charset=utf-8", Origin: "capacitor://localhost" })).status, 200);
  assert.equal((await post(site, { "content-type": "application/json" })).status, 200, "sem Origin (curl) segue");
  // Pedido "simples" de outro site: text/plain não faz pré-voo, e o Origin é de fora.
  assert.equal((await post(site, { "content-type": "text/plain", Origin: "https://vaidarviagem.com.br" })).status, 415);
  assert.equal((await post(site, { "content-type": "application/json", Origin: "https://outro.site" })).status, 403);
  assert.equal((await post(site, { "content-type": "text/plain", Origin: "https://outro.site" })).status, 403);
  // Mesmo endereço (wrangler dev em localhost:8788) passa.
  assert.equal((await post("http://localhost:8788/api/roteiro", { "content-type": "application/json", Origin: "http://localhost:8788" })).status, 200);
  assert.equal((await post("https://vai-dar-viagem.pages.dev/api/roteiro", { "content-type": "application/json", Origin: "https://vai-dar-viagem.pages.dev" })).status, 403);
  assert.equal((await post("https://abc123.vai-dar-viagem.pages.dev/api/pix", { "content-type": "application/json" })).status, 403);
});

test("lerOrder: 400 do Mercado Pago é pedido não encontrado, não falha", async () => {
  const { situacaoPix, recuperarPedido, PixInvalido } = await import("../server/pix.js");
  const mp = status => async () => new Response(JSON.stringify({ errors: [{ code: "invalid_id" }] }), { status });
  await assert.rejects(situacaoPix("ORD01ABCDEF123456", { MP_ACCESS_TOKEN: "t" }, mp(400)), PixInvalido);
  await assert.rejects(recuperarPedido({ id: "ORD123456", email: "outro@exemplo.com" }, { MP_ACCESS_TOKEN: "t" }, mp(400)), PixInvalido);
});
