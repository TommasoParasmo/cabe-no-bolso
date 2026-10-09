// De onde a pessoa chegou (ex.: anúncio da Meta), para o servidor contar os roteiros por origem.
// Guarda só utm_source e utm_content da chegada, nesta aba (sessionStorage), sem dado pessoal.
// O app manda junto no pedido do roteiro; quem chega sem utm e já tinha uma guardada continua com ela.
(() => {
  try {
    const q = new URLSearchParams(location.search);
    const fonte = q.get("utm_source");
    if (fonte) sessionStorage.setItem("vdv-origem", JSON.stringify({ fonte: fonte.slice(0, 40), anuncio: (q.get("utm_content") || "").slice(0, 40) }));
  } catch {}
})();
