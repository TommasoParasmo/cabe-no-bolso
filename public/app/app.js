import { ORIGENS, DESTINOS, ESTILOS } from "../lib/dados.js";

const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["var(--accent)", "var(--sun)", "#7A8FD6", "#D96C8A", "#6FB58C", "#A58B6F"];
const ESTADO = { cabe: "Vai dar viagem", apertado: "Vai dar, no aperto", nao_cabe: "Não vai dar" };

const iso = d => d.toISOString().slice(0, 10);
(function init() {
  $("origem").innerHTML = ORIGENS.map(o => `<option>${esc(o.n)}</option>`).join("");
  const a = new Date(); a.setDate(a.getDate() + 45);
  const b = new Date(a); b.setDate(b.getDate() + 5);
  $("ida").value = iso(a); $("volta").value = iso(b);
})();
// Botões de faixa: preenchem o valor e já calculam.
const marcarFaixa = () => document.querySelectorAll(".faixas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === $("orcamento").value.replace(/\D/g, ""))));
document.querySelectorAll(".faixas button").forEach(b => b.onclick = () => {
  $("orcamento").value = Number(b.dataset.v).toLocaleString("pt-BR");
  marcarFaixa();
  calcular();
});
$("orcamento").addEventListener("input", marcarFaixa);
$("orcamento").addEventListener("input", e => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = digits ? Number(digits).toLocaleString("pt-BR") : "";
});

// Destinos escolhidos (cidades ou países). O texto ainda no campo também conta.
const escolhidos = [];
const norm = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const PAISES = [...new Set(DESTINOS.map(d => d.p))];
const OPCOES = [
  ...DESTINOS.filter(d => !d.int).map(d => ({ v: d.n, nota: d.terrestre ? "só de ônibus" : d.p, grupo: "No Brasil" })),
  ...DESTINOS.filter(d => d.int).map(d => ({ v: d.n, nota: d.p, grupo: "No exterior" })),
  ...PAISES.map(p => ({ v: p, nota: "todas as cidades", grupo: "Países" }))
];
function addDestino(v) {
  v = OPCOES.find(o => norm(o.v) === norm(v))?.v || v.trim();
  if (!v || escolhidos.includes(v) || escolhidos.length >= 8) return;
  escolhidos.push(v);
  $("destino").value = "";
  renderEscolhidos();
}
let tipo = "comparar";
function renderEscolhidos() {
  $("escolhidos").innerHTML = escolhidos.map((v, i) => `<button type="button" data-i="${i}" aria-label="Tirar ${esc(v)}">${esc(v)} ✕</button>`).join("");
  $("tipo").hidden = escolhidos.length < 2;
  $("escolhidos").querySelectorAll("button").forEach(b => b.onclick = () => { escolhidos.splice(Number(b.dataset.i), 1); renderEscolhidos(); });
  $("destino").placeholder = escolhidos.length ? "Adicionar outro" : "Vazio = sugerimos";
}
document.querySelectorAll('input[name="tipo"]').forEach(r => r.onchange = () => { tipo = r.value; });

// Lista de destinos própria (a do navegador fica estreita e sem estilo).
let visiveis = [], ativa = -1;
function abrirLista() {
  const q = norm($("destino").value);
  visiveis = OPCOES.filter(o => !escolhidos.includes(o.v) && (!q || norm(o.v).includes(q) || norm(o.nota).includes(q)));
  ativa = q && visiveis.length ? 0 : -1;
  let grupo = "";
  $("sugestoes").innerHTML = visiveis.length ? visiveis.map((o, i) => {
    const titulo = o.grupo !== grupo ? `<li class="grupo" role="presentation">${grupo = o.grupo}</li>` : "";
    return `${titulo}<li role="option" id="sug-${i}" data-i="${i}" aria-selected="${i === ativa}"><span>${esc(o.v)}</span><small>${esc(o.nota)}</small></li>`;
  }).join("") : '<li class="vazio" role="presentation">Ainda não temos esse destino. Pressione Enter para tentar mesmo assim.</li>';
  $("sugestoes").hidden = false;
  $("destino").setAttribute("aria-expanded", "true");
  marcarAtiva();
}
function fecharLista() {
  $("sugestoes").hidden = true;
  $("destino").setAttribute("aria-expanded", "false");
  $("destino").removeAttribute("aria-activedescendant");
}
function marcarAtiva() {
  $("sugestoes").querySelectorAll('[role="option"]').forEach(li => li.setAttribute("aria-selected", String(Number(li.dataset.i) === ativa)));
  const li = $("sug-" + ativa);
  if (li) { $("destino").setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
  else $("destino").removeAttribute("aria-activedescendant");
}
$("destino").addEventListener("focus", abrirLista);
$("destino").addEventListener("click", abrirLista);
$("destino").addEventListener("input", abrirLista);
$("destino").addEventListener("blur", () => setTimeout(fecharLista, 120));
$("sugestoes").addEventListener("mousedown", e => {
  const li = e.target.closest('[role="option"]');
  if (!li) return;
  e.preventDefault();
  addDestino(visiveis[Number(li.dataset.i)].v);
  abrirLista();
});
$("destino").addEventListener("keydown", e => {
  const aberta = !$("sugestoes").hidden;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!aberta) return abrirLista();
    if (!visiveis.length) return;
    ativa = (ativa + (e.key === "ArrowDown" ? 1 : -1) + visiveis.length) % visiveis.length;
    marcarAtiva();
  } else if (e.key === "Enter") {
    const v = aberta && ativa >= 0 ? visiveis[ativa].v : e.target.value.trim();
    if (!v) return;
    e.preventDefault();
    addDestino(v);
    abrirLista();
  } else if (e.key === "Escape") fecharLista();
});

function lerForm() {
  return {
    orcamento: Number($("orcamento").value.replace(/\D/g, "")) || 0,
    origem: $("origem").value, destinos: [...escolhidos, $("destino").value.trim()].filter(Boolean), tipo,
    ida: $("ida").value, volta: $("volta").value,
    pessoas: Number($("pessoas").value),
    estilo: Number(document.querySelector('input[name="estilo"]:checked')?.value ?? 1),
    interesses: [...document.querySelectorAll("#interesses input:checked")].map(i => i.value),
    foco: $("foco").value.trim()
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
  const google = "https://www.google.com/travel/flights?q=" + encodeURIComponent(`Voos de ${c.origem.ap} para ${c.destino.ap} em ${f.ida} volta ${f.volta}`) + "&curr=BRL&hl=pt-BR";
  const flights = c.linkVoo || google;
  const p = new URLSearchParams({ ss: c.destino.n, group_adults: String(f.pessoas), checkin: f.ida, checkout: f.volta });
  return { flights, google, vooReal: !!c.linkVoo, hotels: "https://www.booking.com/searchresults.pt-br.html?" + p.toString() };
}

const linkOnibus = (de, para) => "https://www.google.com/search?" + new URLSearchParams({ q: `passagem de ônibus ${de} para ${para}` });
const linkGoogle = (de, para, data) => "https://www.google.com/travel/flights?q=" + encodeURIComponent(`Voos só ida de ${de} para ${para} em ${data}`) + "&curr=BRL&hl=pt-BR";
const linkBooking = (cidade, pessoas, checkin, noites) => {
  const d = new Date(checkin + "T12:00:00"); d.setDate(d.getDate() + noites);
  return "https://www.booking.com/searchresults.pt-br.html?" + new URLSearchParams({ ss: cidade, group_adults: String(pessoas), checkin, checkout: d.toISOString().slice(0, 10) });
};
const dataCurta = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);

// Cartões de passagem e hospedagem da viagem por várias cidades: um trecho e uma cidade por linha.
function cartoesViagem(c, f) {
  return `
    <div class="two">
      <section class="card">
        <span class="eyebrow">Passagens por pessoa · ${c.fonteVoo === "aviasales" ? "preços encontrados" : c.fonteVoo === "misto" ? "alguns preços encontrados" : "estimativa"}</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${c.trechos.length} trechos só de ida</p></div>
        <ul class="trechos">${c.trechos.map(t => `<li>
          <span>${esc(t.de)} → ${esc(t.para)} · ${dataCurta(t.data)}${t.meio === "onibus" ? ` · ônibus, ~${t.horas} h` : ""}</span><span class="v">${brl(t.porPessoa)}${t.fonte === "aviasales" ? "" : "*"}</span>
          ${t.meio === "onibus"
            ? `<a class="link" href="${esc(linkOnibus(t.deNome, t.paraNome))}" target="_blank" rel="noopener">Ver ônibus ↗</a>`
            : `<a class="link" href="${esc(t.link || linkGoogle(t.de, t.para, t.data))}" target="_blank" rel="noopener sponsored">${t.link ? "Aviasales ↗" : "Google Voos ↗"}</a>`}</li>`).join("")}</ul>
        ${c.fonteVoo === "aviasales" ? "" : '<p class="hint">* estimativa: não achamos busca recente desse trecho.</p>'}
      </section>
      <section class="card">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <ul class="trechos">${c.paradas.map(p => `<li>
          <span>${esc(p.n)} · ${p.noites} ${p.noites > 1 ? "noites" : "noite"}</span><span class="v">${brl(p.diaria)}/noite</span>
          <a class="link" href="${esc(linkBooking(p.n, f.pessoas, p.checkin, p.noites))}" target="_blank" rel="noopener sponsored">Booking ↗</a></li>`).join("")}</ul>
        <p class="hint">Média por quarto para o estilo ${ESTILOS[f.estilo]}.</p>
      </section>
    </div>`;
}

// Passagem da viagem para um destino: avião, ônibus ou nenhuma (destino na própria cidade).
function cartaoPassagem(c, f, L) {
  if (!c.meio) return `<span class="eyebrow">Passagem</span><div class="kv"><span class="price">${brl(0)}</span><p>${esc(c.destino.n)} fica na sua cidade.</p></div>`;
  if (c.meio === "onibus") return `
        <span class="eyebrow">Passagem de ônibus por pessoa · estimativa</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${esc(c.origem.n)} → ${esc(c.destino.n)}, ida e volta, cerca de ${c.horasOnibus} h por trecho</p></div>
        <a class="link" href="${esc(linkOnibus(c.origem.n, c.destino.n))}" target="_blank" rel="noopener">Ver horários e preços de ônibus ↗</a>
        ${c.destino.ap ? `<a class="link" href="${esc(L.google)}" target="_blank" rel="noopener" style="display:block;margin-top:6px">Prefere avião? Ver no Google Voos ↗</a>` : ""}`;
  return `
        <span class="eyebrow">Passagem por pessoa${c.fonteVoo === "aviasales" ? " · preço encontrado" : " · estimativa"}</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${esc(c.origem.n)} (${esc(c.origem.ap)}) → ${esc(c.destino.n)} (${esc(c.destino.ap)}), ida e volta</p></div>
        <a class="link" href="${esc(L.flights)}" target="_blank" rel="noopener sponsored">${L.vooReal ? "Ver essa passagem no Aviasales ↗" : "Ver preços no Google Voos ↗"}</a>
        ${L.vooReal ? `<a class="link" href="${esc(L.google)}" target="_blank" rel="noopener" style="display:block;margin-top:6px">Comparar no Google Voos ↗</a>` : ""}`;
}

function opcoesHtml(opcoes, atual, filtro = () => true) {
  return `<div class="options">${opcoes.map((o, i) => filtro(o) ? `
    <button type="button" class="opt" data-i="${i}" aria-current="${o === atual}">
      <span class="t">${esc(o.destino.n)}</span><span class="v">${brl(o.total)}</span>
      <small>${ESTADO[o.estado]} · ${o.diff >= 0 ? "sobra " + brl(o.diff) : "falta " + brl(-o.diff)}${o.meio === "onibus" ? " · de ônibus" : ""}${o.noitesCabem ? ` · cabe com ${o.noitesCabem} ${o.noitesCabem > 1 ? "noites" : "noite"}` : ""}${o.match ? " · combina com o que vocês curtem" : ""}</small>
    </button>` : "").join("")}</div>`;
}

function render(fresh) {
  const { entrada: f, atual: c } = state;
  const manchete = c.estado === "cabe" ? `Dá para ir e ainda sobra ${brl(c.diff)}`
    : c.estado === "apertado" ? "Cabe, mas no limite" : `Faltam ${brl(-c.diff)} para essa viagem`;
  const sum = c.itens.reduce((s, i) => s + i.valor, 0) || 1;
  const L = links(c, f);
  const comparar = state.modo === "comparar";
  const viagem = state.modo === "viagem";
  const ajuste = viagem && c.estado === "nao_cabe" ? "Tente menos cidades, menos noites ou o estilo econômico."
    : comparar && c.estado === "nao_cabe" ? "Nenhum dos destinos escolhidos cabe nesse valor. Tire o filtro para ver o que cabe no seu orçamento."
    : state.modo === "sugestao" && c.estado === "nao_cabe"
    ? (c.noitesCabem ? `Com ${c.noitesCabem} ${c.noitesCabem > 1 ? "noites" : "noite"} em vez de ${f.noites}, ${esc(c.destino.n)} cabe no orçamento.` : "Com esse valor, nenhuma viagem cabe nessas datas. Tente menos noites ou menos pessoas.")
    : state.modo === "destino" && c.estado === "nao_cabe"
    ? (state.noitesMax ? `Com ${state.noitesMax} noites em vez de ${f.noites}, ${esc(c.destino.n)} cabe no orçamento.` : `Mesmo com menos noites, ${esc(c.destino.n)} não cabe nesse valor.`) : "";
  const mostrarOpcoes = state.modo === "destino" ? state.opcoes.length > 0 : state.opcoes.length > 1;
  const r = $("result");
  r.className = "result" + (fresh ? " fresh" : "");
  r.innerHTML = `
    <article class="verdict" data-state="${c.estado}">
      <span class="pill">${ESTADO[c.estado]}</span>
      <div class="eyebrow">${viagem ? `Viagem por ${c.paradas.length} cidades · ${c.paradas.map(p => `${esc(p.n)} (${p.noites})`).join(" → ")}` : `${state.modo === "sugestao" ? "Nossa sugestão · " : comparar ? "Melhor entre os escolhidos · " : ""}${esc(c.destino.n)}, ${esc(c.destino.p)}`} · ${f.noites} noites · ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} · ${ESTILOS[f.estilo]}</div>
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
      <h3>${comparar ? "Comparando os destinos que você escolheu" : state.modo === "sugestao" ? `As melhores viagens para ${brl(f.orcamento)}` : "Destinos que cabem no seu orçamento"}</h3>
      ${state.modo === "sugestao"
        ? ["nacional", "internacional"].map(g => `<div class="grupo-titulo">${g === "nacional" ? "No Brasil" : "No exterior"}</div>${opcoesHtml(state.opcoes, c, o => o.grupo === g)}`).join("")
        : opcoesHtml(state.opcoes, c)}
    </section>` : ""}
    <section class="card">
      <h3>Para onde vai o dinheiro</h3>
      <div class="bar" role="img" aria-label="Divisão do custo por categoria">${c.itens.map((it, i) => `<i style="width:${it.valor / sum * 100}%;background:${COLORS[i]}"></i>`).join("")}</div>
      <ul class="legend">${c.itens.map((it, i) => `<li><span class="sw" style="background:${COLORS[i]}"></span><span>${esc(it.categoria)}<small>${esc(it.detalhe)}</small></span><span class="v">${brl(it.valor)}</span></li>`).join("")}</ul>
    </section>
    ${viagem ? cartoesViagem(c, f) : `<div class="two">
      <section class="card">${cartaoPassagem(c, f, L)}</section>
      <section class="card">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <div class="kv"><span class="price">${brl(c.diaria)}<small style="font-size:13px;font-weight:500"> /noite por quarto</small></span><p>Média para o estilo ${ESTILOS[f.estilo]}</p></div>
        <a class="link" href="${esc(L.hotels)}" target="_blank" rel="noopener sponsored">Ver hotéis na Booking ↗</a>
      </section>
    </div>`}
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
        <div class="day"><span class="n">DIA ${esc(d.dia)}</span><div><h4>${esc(d.titulo)}</h4>${state.atual.paradas && d.cidade ? `<small class="hint">${esc(d.cidade)}</small>` : ""}<ul>${(d.atividades || []).map(a => `<li><span class="p">${esc(a.periodo)}</span><a class="lugar" href="${mapa(a.nome, d.cidade)}" target="_blank" rel="noopener">${esc(a.nome)} ↗</a><span class="c">${Number(a.custo) ? brl(a.custo) : "grátis"}</span></li>`).join("")}</ul></div></div>`).join("")}
      </div>
      ${ro.totalPasseios != null ? `<p class="hint">Passeios: ${brl(ro.totalPasseios)} de ${brl(ro.verba)} de verba.</p>` : ""}
      ${ro.acimaDaVerba ? `<div class="warn-box">Este roteiro passou da verba de passeios. Troque alguma atividade paga por uma grátis.</div>` : ""}
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

// Busca o lugar no Google Maps, onde a pessoa vê nota, fotos e avaliações.
function mapa(nome, cidade) {
  const q = state.atual.paradas ? `${nome}, ${cidade || state.atual.paradas[0].n}` : `${nome}, ${state.atual.destino.n}, ${state.atual.destino.p}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

async function gerarRoteiro() {
  const { entrada: f, atual: c } = state;
  const alvo = c;
  ctlRoteiro = new AbortController();
  state.roteiro = { loading: true };
  renderRoteiro();
  try {
    const r = await postar("/api/roteiro", {
      destino: c.paradas ? c.paradas[0].n : c.destino.n, noites: f.noites,
      paradas: c.paradas?.map(p => ({ destino: p.n, noites: p.noites })), pessoas: f.pessoas, estilo: f.estilo, interesses: f.interesses, foco: f.foco,
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
