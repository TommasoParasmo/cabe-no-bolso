// Contador da página inicial: visualizações reais do site na última semana (estatística da Cloudflare).
// Sem número (ou abaixo do mínimo), a linha continua escondida.
(async () => {
  const el = document.getElementById("visitas");
  if (!el) return;
  try {
    const r = await fetch("/api/visitas");
    const n = r.ok ? (await r.json())?.visitas?.semana : null;
    if (!Number.isFinite(n)) return;
    el.textContent = `${n.toLocaleString("pt-BR")} visualizações do site nos últimos 7 dias`;
    el.hidden = false;
  } catch {}
})();
