// Cache de respostas no Cloudflare (Cache API). Fora da Cloudflare (testes), não guarda nada.

const store = () => (typeof caches !== "undefined" && caches.default) || null;

export async function lerCache(chave) {
  const c = store();
  if (!c) return null;
  try {
    const r = await c.match(new Request(chave));
    return r ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function gravarCache(chave, valor, segundos) {
  const c = store();
  if (!c) return;
  try {
    await c.put(new Request(chave), new Response(JSON.stringify(valor), {
      headers: { "content-type": "application/json", "cache-control": `public, max-age=${segundos}` }
    }));
  } catch {
    // Cache é só economia: se falhar, segue sem ele.
  }
}
