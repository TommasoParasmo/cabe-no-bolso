import { ORIGENS, DESTINOS, ESTILOS } from "../lib/dados.js";

const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["var(--accent)", "var(--sun)", "#7A8FD6", "#D96C8A", "#6FB58C", "#A58B6F"];
const ESTADO = { cabe: "Cabe no bolso", apertado: "Cabe apertado", nao_cabe: "Não cabe" };

const iso = d => d.toISOString().slice(0, 10);
(function init() {
  $("origem").innerHTML = ORIGENS.map(o => `<option>${esc(o.n)}</option>`).join("");
  $("destinos").innerHTML = DESTINOS.map(d => `<option value="${esc(d.n)}">`).join("");
  const a = new Date(); a.setDate(a.getDate() + 45);
  const b = new Date(a); b.setDate(b.getDate() + 5);
  $("ida").value = iso(a); $("volta").value = iso(b);
})();
$("orcamento").addEventListener("input", e => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = digits ? Number(digits).toLocaleString("pt-BR") : "";
});

function lerForm() {
  return {
    orcamento: Number($("orcamento").value.replace(/\D/g, "")) || 0,
    origem: $("origem").value, destino: $("destino").value.trim(),
    ida: $("ida").value, volta: $("volta").value,
    pessoas: Number($("pessoas").value),
    estilo: Number(document.querySelector('input[name="estilo"]:checked')?.value ?? 1),
    interesses: [...document.querySelectorAll("#interesses input:checked")].map(i => i.value)
  };
}

async function postar(caminho, dados, signal) {
  const r = await fetch(caminho, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(dados), signal });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.erro || "Algo falhou. Tente de novo.");
  return corpo;
}

let state = null;
let pedido = null;

async function calcular() {
  pedido?.abort();
  pedido = new AbortController();
  $("go").disabled = true;
  setStatus("Calculando…");
  try {
    const r = await postar("/api/veredito", lerForm(), pedido.signal);
    state = { ...r, roteiro: null };
    setStatus("");
    render(true);
  } catch (e) {
    if (e.name !== "AbortError") setStatus(e.message, true);
  } finally {
    $("go").disabled = false;
  }
}

function escolher(i) {
  const c = state.opcoes[i];
  if (!c) return;
  state.atual = c; state.roteiro = null;
  render(false);
}

function links(c, f) {
  const flights = c.linkVoo || "https://www.google.com/travel/flights?q=" + encodeURIComponent(`Voos de ${f.origem} para ${c.destino.n} em ${f.ida} até ${f.volta}`);
  const p = new URLSearchParams({ ss: c.destino.n, group_adults: String(f.pessoas), checkin: f.ida, checkout: f.volta });
  return { flights, vooReal: !!c.linkVoo, hotels: "https://www.booking.com/searchresults.pt-br.html?" + p.toString() };
}

function render(fresh) {
  const { entrada: f, atual: c } = state;
  const manchete = c.estado === "cabe" ? `Dá para ir e ainda sobra ${brl(c.diff)}`
    : c.estado === "apertado" ? "Cabe, mas no limite" : `Faltam ${brl(-c.diff)} para essa viagem`;
  const sum = c.itens.reduce((s, i) => s + i.valor, 0) || 1;
  const L = links(c, f);
  const ajuste = state.modo === "destino" && c.estado === "nao_cabe"
    ? (state.noitesMax ? `Com ${state.noitesMax} noites em vez de ${f.noites}, ${esc(c.destino.n)} cabe no orçamento.` : `Mesmo com menos noites, ${esc(c.destino.n)} não cabe nesse valor.`) : "";
  const mostrarOpcoes = state.modo === "sugestao" ? state.opcoes.length > 1 : state.opcoes.length > 0;
  const r = $("result");
  r.className = "result" + (fresh ? " fresh" : "");
  r.innerHTML = `
    <article class="verdict" data-state="${c.estado}">
      <span class="pill">${ESTADO[c.estado]}</span>
      <div class="eyebrow">${state.modo === "sugestao" ? "Nossa sugestão · " : ""}${esc(c.destino.n)}, ${esc(c.destino.p)} · ${f.noites} noites · ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} · ${ESTILOS[f.estilo]}</div>
      <h2>${manchete}</h2>
      ${ajuste ? `<p>${ajuste}</p>` : c.estado === "apertado" ? "<p>Sobra pouco para imprevistos. Vale comprar a passagem logo, antes de o preço subir.</p>" : ""}
      <div class="nums">
        <div><span class="eyebrow">Seu orçamento</span><b>${brl(f.orcamento)}</b></div>
        <div><span class="eyebrow">Custo estimado</span><b>${brl(c.total)}</b></div>
        <div class="diff"><span class="eyebrow">${c.diff >= 0 ? "Sobra" : "Falta"}</span><b>${brl(Math.abs(c.diff))}</b></div>
      </div>
    </article>
    ${mostrarOpcoes ? `
    <section class="card">
      <h3>${state.modo === "sugestao" ? "Outras opções para o seu orçamento" : "Destinos que cabem no seu orçamento"}</h3>
      <div class="options">${state.opcoes.map((o, i) => `
        <button type="button" class="opt" data-i="${i}" aria-current="${o === c}">
          <span class="t">${esc(o.destino.n)}</span><span class="v">${brl(o.total)}</span>
          <small>${ESTADO[o.estado]} · ${o.diff >= 0 ? "sobra " + brl(o.diff) : "falta " + brl(-o.diff)}${o.match ? " · combina com o que vocês curtem" : ""}</small>
        </button>`).join("")}
      </div>
    </section>` : ""}
    <section class="card">
      <h3>Para onde vai o dinheiro</h3>
      <div class="bar" role="img" aria-label="Divisão do custo por categoria">${c.itens.map((it, i) => `<i style="width:${it.valor / sum * 100}%;background:${COLORS[i]}"></i>`).join("")}</div>
      <ul class="legend">${c.itens.map((it, i) => `<li><span class="sw" style="background:${COLORS[i]}"></span><span>${esc(it.categoria)}<small>${esc(it.detalhe)}</small></span><span class="v">${brl(it.valor)}</span></li>`).join("")}</ul>
    </section>
    <div class="two">
      <section class="card">
        <span class="eyebrow">Passagem por pessoa${c.fonteVoo === "aviasales" ? " · preço encontrado" : " · estimativa"}</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${esc(c.origem.n)} (${esc(c.origem.ap)}) → ${esc(c.destino.n)} (${esc(c.destino.ap)}), ida e volta</p></div>
        <a class="link" href="${esc(L.flights)}" target="_blank" rel="noopener sponsored">${L.vooReal ? "Ver essa passagem no Aviasales ↗" : "Ver preços no Google Voos ↗"}</a>
      </section>
      <section class="card">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <div class="kv"><span class="price">${brl(c.diaria)}<small style="font-size:13px;font-weight:500"> /noite por quarto</small></span><p>Média para o estilo ${ESTILOS[f.estilo]}</p></div>
        <a class="link" href="${esc(L.hotels)}" target="_blank" rel="noopener sponsored">Ver hotéis na Booking ↗</a>
      </section>
    </div>
    <section class="card" id="roteiro-card"></section>
  `;
  r.querySelectorAll(".opt").forEach(b => b.onclick = () => escolher(Number(b.dataset.i)));
  renderRoteiro();
}

// ---- Roteiro com IA: só quando a pessoa pede ----
let ctlRoteiro = null;

function renderRoteiro() {
  const card = $("roteiro-card");
  if (!card) return;
  const ro = state.roteiro;
  if (ro?.dias) {
    card.innerHTML = `
      <h3>Roteiro dia a dia em ${esc(state.atual.destino.n)}</h3>
      <div class="days">${ro.dias.map(d => `
        <div class="day"><span class="n">DIA ${esc(d.dia)}</span><div><h4>${esc(d.titulo)}</h4><ul>${(d.atividades || []).map(a => `<li><span class="p">${esc(a.periodo)}</span><span>${esc(a.nome)}</span><span class="c">${Number(a.custo) ? brl(a.custo) : "grátis"}</span></li>`).join("")}</ul></div></div>`).join("")}
      </div>
      ${(ro.dicas || []).length ? `<h3>Como economizar</h3><ul class="tips">${ro.dicas.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}`;
    return;
  }
  const busy = ro?.loading;
  card.innerHTML = `
    <div class="roteiro-cta">
      <h3>Quer o roteiro dia a dia?</h3>
      <p class="hint" style="margin:0">Montamos os passeios dentro da verba de passeios acima.</p>
      <div class="actions"><button type="button" class="primary" id="gerar" ${busy ? "disabled" : ""}>${busy ? "Montando o roteiro…" : "Montar roteiro"}</button>${busy ? '<button type="button" id="parar">Parar</button>' : ""}</div>
      ${ro?.erro ? `<div class="warn-box">${esc(ro.erro)}</div>` : ""}
    </div>`;
  $("gerar")?.addEventListener("click", gerarRoteiro);
  $("parar")?.addEventListener("click", () => ctlRoteiro?.abort());
}

async function gerarRoteiro() {
  const { entrada: f, atual: c } = state;
  const alvo = c;
  ctlRoteiro = new AbortController();
  state.roteiro = { loading: true };
  renderRoteiro();
  try {
    const r = await postar("/api/roteiro", {
      destino: c.destino.n, noites: f.noites, pessoas: f.pessoas, estilo: f.estilo, interesses: f.interesses,
      verbaPasseios: c.itens.find(i => i.categoria === "Passeios").valor
    }, ctlRoteiro.signal);
    if (state.atual !== alvo) return;
    state.roteiro = r;
  } catch (e) {
    if (state.atual !== alvo) return;
    state.roteiro = e.name === "AbortError" ? null : { erro: e.message };
  }
  renderRoteiro();
}

function setStatus(msg, err) { $("status").textContent = msg; $("status").className = "status" + (err ? " err" : ""); }
$("form").addEventListener("submit", e => {
  e.preventDefault();
  calcular().then(() => state && $("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
});
calcular();
