// Aviso de cookies e Pixel da Meta (guia de cookies da ANPD): o Pixel só carrega depois de "Aceitar";
// "Recusar" tem o mesmo destaque, nada vem marcado e a escolha fica guardada no aparelho.
// O link "Cookies" do rodapé (data-cookies) reabre o aviso para mudar de ideia.
// No app de celular (Capacitor) o Pixel fica de fora: rastreio ali exige outro consentimento.
(() => {
  if (window.Capacitor) return;
  const CHAVE = "vdv-cookies";
  const ler = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };
  const gravar = v => { try { localStorage.setItem(CHAVE, v); } catch {} };

  function carregarPixel() {
    if (window.fbq) return;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1648295673479841');
    fbq('track', 'PageView');
  }

  function mostrarAviso() {
    if (document.getElementById("cookies-aviso")) return;
    const css = document.createElement("style");
    css.textContent = `
#cookies-aviso{position:fixed;left:0;right:0;bottom:0;z-index:1000;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(16,38,36,.96);color:#E4EFED;font:13px/1.35 "Segoe UI",system-ui,sans-serif;display:flex;gap:8px 12px;align-items:center;justify-content:center}
#cookies-aviso p{margin:0;flex:0 1 auto}
#cookies-aviso a{color:#7FD8CF}
#cookies-aviso .botoes{display:flex;gap:6px;flex:none}
#cookies-aviso button{font:inherit;font-weight:600;padding:5px 12px;border-radius:6px;border:1.5px solid #7FD8CF;background:transparent;color:#E4EFED;cursor:pointer}
@media print{#cookies-aviso{display:none}}`;
    const aviso = document.createElement("div");
    aviso.id = "cookies-aviso";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML = `<p>Usamos cookies para medir nossos anúncios. <a href="/privacidade.html">Saiba mais</a></p>
<div class="botoes"><button type="button" data-escolha="sim">Aceitar</button><button type="button" data-escolha="nao">Recusar</button></div>`;
    aviso.addEventListener("click", ev => {
      const escolha = ev.target.closest("button")?.dataset.escolha;
      if (!escolha) return;
      // Quem aceitou e depois recusou: o Pixel já carregado só sai ao recarregar a página.
      // Confere o Pixel na página, não o que foi gravado: sem localStorage, ler() volta vazio.
      if (window.fbq && escolha === "nao") { gravar(escolha); location.reload(); return; }
      gravar(escolha);
      aviso.remove();
      if (escolha === "sim") carregarPixel();
    });
    document.head.append(css);
    document.body.append(aviso);
  }

  const escolha = ler();
  if (escolha === "sim") carregarPixel();

  const iniciar = () => {
    if (escolha !== "sim" && escolha !== "nao") mostrarAviso();
    document.addEventListener("click", ev => {
      if (!ev.target.closest("[data-cookies]")) return;
      ev.preventDefault();
      mostrarAviso();
    });
  };
  if (document.body) iniciar(); else document.addEventListener("DOMContentLoaded", iniciar);
})();
