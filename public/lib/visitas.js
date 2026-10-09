// Contador de visualizações reais do site na última semana (estatística da Cloudflare), na página
// inicial e no /app. Sem número (ou abaixo do mínimo), as linhas continuam escondidas.
(async () => {
  const els = document.querySelectorAll("[data-visitas]");
  if (!els.length) return;
  try {
    const r = await fetch("/api/visitas");
    const n = r.ok ? (await r.json())?.visitas?.semana : null;
    if (!Number.isFinite(n)) return;
    for (const el of els) {
      el.querySelector("[data-visitas-n]").textContent = n.toLocaleString("pt-BR");
      el.hidden = false;
    }
  } catch {}
})();
