// Roteiro Detalhado + Pré-viagem dos destinos sem conteúdo de Terra Santa (Orlando, Chile, Buenos Aires).
// Mesmo desenho e mesmas páginas do PDF de Jerusalém, montadas a partir de um objeto de conteúdo por destino
// (server/pdf/destinos/*.js). Variam só o nome de quem comprou e os valores da simulação (lerValores).
// ATENÇÃO: o conteúdo dos destinos foi escrito de memória; conferir horários, preços e telefones antes de vender.

import { esc, cabeca, qr, linkMaps, MESES, SEMANA, brl, lerValores } from "./comum.js";

const lista = a => "<ul>" + a.map(x => "<li>" + x + "</li>").join("") + "</ul>";
const tabela = (cab, linhas) => '<table class="tb"><thead><tr>' + cab.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" +
  linhas.map(r => "<tr>" + r.map((c, i) => "<td>" + (i === 0 ? "<b>" + c + "</b>" : c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
const aviso = a => (a ? '<div class="warnbox"><b>' + a[0] + "</b><br>" + a[1] + "</div>" : "");

// D: conteúdo do destino (formato em server/pdf/destinos/LEIA-ME.md); slug: pasta das imagens em /roteiros/.
export function montarRoteiro(D, slug, nomeCru, valores = {}) {
  const B = "/roteiros/" + slug + "/";
  const NOME = esc(String(nomeCru || "").trim().replace(/\s+/g, " ").slice(0, 60) || "Viajante");
  const PRIMEIRO = NOME.split(" ")[0];
  const V = lerValores(valores);
  const LOGO_C = '<img src="' + B + 'logo-claro.png" alt="Vai Dar Viagem">', LOGO_E = '<img src="' + B + 'logo-escuro.png" alt="Vai Dar Viagem">';
  const head = (sec, dark) => '<div class="ph">' + (dark ? LOGO_E : LOGO_C) + "<span>" + sec + "</span></div>";
  const foot = () => '<div class="pf"><span>Roteiro de ' + NOME + " · " + D.nome + "</span><span>@@PAG@@</span></div>";
  const ic = i => '<span class="ic"><svg width="15" height="15"><use href="#' + i + '"/></svg></span>';
  const cl = a => '<ul class="cl">' + a.map(x => "<li><span>" + x[0] + (x[1] ? "<small>" + x[1] + "</small>" : "") + "</span></li>").join("") + "</ul>";
  const sec = (rotulo, kick, titulo, corpo, sub) => '<section class="page">' + head(rotulo) + '<div class="in"><div><span class="kick">' + kick + '</span><h2 class="t" style="margin-top:2mm">' + titulo + "</h2>" + (sub ? '<p class="mut" style="margin-top:2mm">' + sub + "</p>" : "") + "</div>" + corpo + "</div>" + foot() + "</section>";
  const card = c => '<div class="card"><h3>' + (c.ic ? ic(c.ic) : "") + c.t + "</h3>" + (c.texto ? "<p>" + c.texto + "</p>" : "") + (c.itens ? lista(c.itens) : "") + "</div>";
  const porQuem = V.dias ? "para " + (V.pessoas > 1 ? V.pessoas + " pessoas" : "1 pessoa") : "por pessoa";

  // Dias: cópia do conteúdo, com data, dia da semana e os avisos que dependem do dia (feira só no domingo, etc.).
  const DAYS = D.dias.map((d, i) => ({ ...d, gasto: V.dias ? brl(V.dias[i]) : d.gasto }));
  if (V.inicio) DAYS.forEach((d, i) => {
    const dt = new Date(V.inicio.getTime() + i * 864e5);
    d.sem = dt.getUTCDay();
    d.d = SEMANA[d.sem] + ", " + String(dt.getUTCDate()).padStart(2, "0") + "/" + String(dt.getUTCMonth() + 1).padStart(2, "0");
    if (d.semana && !d.semana.dias.includes(d.sem)) d.tip = d.semana.senao;
  });
  const mesDaViagem = V.clima ? MESES[V.clima.mes - 1] : V.inicio ? MESES[V.inicio.getUTCMonth()] : "";
  const S = {};

  S.capa = '<section class="page cover"><div class="top">' + LOGO_E + '</div><div class="bot"><span class="tag"><svg width="14" height="14"><use href="#spark"/></svg>Roteiro Detalhado + Pré-viagem</span><h1>' + D.nome + ' em 7 dias</h1><p style="font-size:13pt;opacity:.85;max-width:120mm">' + D.capa.frase + '</p><div class="who"><div><small>Preparado para</small><b>' + NOME + "</b></div>" +
    (V.periodo ? "<div><small>Datas</small><b>" + V.periodo + "</b></div><div><small>Viajantes</small><b>" + V.pessoas + (V.pessoas > 1 ? " pessoas" : " pessoa") + "</b></div>"
      : "<div><small>Duração</small><b>7 dias e 6 noites</b></div><div><small>Ritmo</small><b>" + D.capa.ritmo + "</b></div>") + "</div></div></section>";

  // Cotação da data da compra (R$ por unidade da moeda). Moedas de valor baixo, como os pesos, aparecem ao contrário:
  // "R$ 1 vale cerca de 170 pesos chilenos".
  const cot = !V.cotacao ? "Valores em reais, aproximados, para conferir perto da viagem."
    : V.cotacao < 0.1 ? "Valores em reais, com a cotação da data da compra: R$ 1 vale cerca de " + Math.round(1 / V.cotacao).toLocaleString("pt-BR") + " " + (D.moedaPlural || D.moeda) + "."
    : "Valores em reais, com a cotação da data da compra: R$ " + V.cotacao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " por " + D.moeda + ".";
  S.resumo = '<section class="page">' + head("Resumo da viagem") + '<div class="in"><div><span class="kick">Sua viagem em uma página</span><h2 class="t" style="margin-top:2mm">7 dias, um de cada vez</h2></div><div class="sum"><div class="dl">' +
    DAYS.map((d, i) => '<div class="dr"><img src="' + B + d.img + '.jpg" alt=""><div><b>Dia ' + (i + 1) + " · " + d.t + "</b><small>" + d.d + "</small></div><em>" + d.gasto + "</em></div>").join("") +
    '</div><div style="display:grid;gap:5mm;align-content:start">' +
    (V.total !== null
      ? '<div class="money"><span style="opacity:.75;font-size:9.5pt">Custo previsto da viagem' + (V.pessoas > 1 ? " para " + V.pessoas + " pessoas" : "") + '</span><span class="big">' + brl(V.total) + "</span>" +
        [["Passagens", V.passagens], ["Hotel, " + V.noites + " noites", V.hotel], ["Comida e passeios", V.comidaPasseios], [D.rotuloExtra, V.transporte]].filter(x => x[1] !== null).map(x => '<div class="row"><span>' + x[0] + "</span><b>" + brl(x[1]) + "</b></div>").join("") +
        (V.sobra !== null ? '<div class="row" style="color:var(--gold)"><span>Sobra do orçamento</span><b>' + brl(V.sobra) + "</b></div>" : "") + "</div>"
      : '<div class="money"><span style="opacity:.75;font-size:9.5pt">Gasto previsto no destino, por pessoa</span><span class="big">' + D.referencia.total + '</span><div class="row"><span>Inclui</span><b>' + D.referencia.inclui + '</b></div><div class="row"><span>Por dia, em média</span><b>' + D.referencia.porDia + '</b></div><div class="row" style="color:var(--gold)"><span>Passagens e hotel</span><b>simule no app</b></div></div>') +
    '<div class="how"><b>Como usar este roteiro</b><ul><li>Comece pelo Pré-viagem, na página @@PG:quando@@.</li><li>Marque os quadradinhos conforme for resolvendo.</li><li>Na viagem, abra só a página do dia.</li><li>' + cot + "</li></ul></div></div></div></div>" + foot() + "</section>";

  S.ficha = sec("Antes de embarcar", "Primeira página do aeroporto", "Ficha da viagem",
    '<div class="ficha">' + [["Voo de ida", "Companhia, número, data e horário"], ["Localizador da reserva", "O código de 6 letras da passagem"], ["Voo de volta", "Companhia, número, data e horário"], ["Hotel", "Nome, endereço e telefone"], ["Seguro viagem", "Número da apólice e telefone 24 horas"], D.fichaDoc, ...D.fichaExtra, ["Cartão do banco", "Telefone para bloqueio no exterior"], ["Contato no Brasil", "Nome e telefone de alguém para avisar"]]
      .map(f => "<div><b>" + f[0] + "<small>" + f[1] + "</small></b><span></span></div>").join("") + "</div>" +
    '<div class="warnbox"><b>Dica</b><br>Preencha a lápis antes de sair de casa e tire uma foto desta página. Se perder o celular, a ficha continua no papel.</div>',
    "Preencha com os dados da sua viagem. É a página que você abre no balcão da companhia e no hotel.");

  // Mapa esquemático: áreas, pinos com o número do dia e setas para o que fica fora do desenho.
  const M = D.mapa;
  const pin = p => '<g><circle cx="' + p.x + '" cy="' + p.y + '" r="13" fill="#E2B23F" stroke="#fff" stroke-width="3"/><text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="14" fill="#0D3532">' + p.dia + '</text>' + (p.l ? '<text x="' + (p.x + (p.anc === "end" ? -20 : 20)) + '" y="' + (p.y + 5) + '" text-anchor="' + (p.anc || "start") + '" font-family="Figtree" font-weight="700" font-size="13" fill="#102624">' + p.l + "</text>" : "") + "</g>";
  const MAPA = '<svg viewBox="0 0 720 520" width="100%" role="img" aria-label="' + M.titulo + '"><rect width="720" height="520" rx="16" fill="#F7F8F6"/>' +
    (M.agua || []).map(a => '<path d="' + a.d + '" fill="' + (a.fill ? "#D7E2E0" : "none") + '" stroke="#D7E2E0" stroke-width="' + (a.fill ? 0 : a.w || 30) + '" stroke-linecap="round"/>' + (a.l ? '<text x="' + a.lx + '" y="' + a.ly + '" font-family="Figtree" font-size="12" fill="#557370" font-weight="700">' + a.l + "</text>" : "")).join("") +
    (M.areas || []).map((a, i) => '<rect x="' + a.x + '" y="' + a.y + '" width="' + a.w + '" height="' + a.h + '" rx="10" fill="' + (i % 2 ? "#FBF1D8" : "#E8F0EF") + '"/><text x="' + (a.x + 12) + '" y="' + (a.y + 22) + '" font-family="Figtree" font-weight="700" font-size="11" fill="#557370">' + a.l + "</text>").join("") +
    (M.rotas || []).map(r => '<path d="' + r.d + '" fill="none" stroke="#0E6E6A" stroke-width="4" stroke-dasharray="7 6"/>' + (r.l ? '<text x="' + r.lx + '" y="' + r.ly + '" font-family="Figtree" font-weight="700" font-size="12" fill="#0E6E6A" text-anchor="middle">' + r.l + "</text>" : "")).join("") +
    M.pinos.map(pin).join("") +
    '<g font-family="Figtree" font-weight="700" font-size="12" fill="#0D3532">' + (M.notas || []).map(n => '<text x="' + n[0] + '" y="' + n[1] + '"' + (n[3] ? ' text-anchor="' + n[3] + '"' : "") + ">" + n[2] + "</text>").join("") + "</g></svg>";
  S.mapa = sec("Mapa", "Onde fica cada coisa", M.titulo, MAPA + '<div class="cards">' + M.cards.map(card).join("") + "</div>", M.sub);

  S.quando = sec("Pré-viagem", "Antes de embarcar", "O que fazer e quando",
    '<div class="tl">' + D.quando.map(t => '<div class="tli"><div class="when"><b>' + t[0] + "</b><small>" + t[1] + "</small></div>" + cl(t[2]) + "</div>").join("") + "</div>",
    "Siga a linha do tempo e você chega no aeroporto sem nenhuma pendência.");

  const C = D.clima;
  const climaCard = V.clima
    ? { ic: "sun", t: "Clima em " + mesDaViagem, itens: ["Em média, entre " + V.clima.min + " °C e " + V.clima.max + " °C.", ...(V.clima.min < 5 ? [C.gelado] : V.clima.min < 12 ? [C.frio] : []), ...(V.clima.max >= 28 ? [C.calor] : []), ...(C.chuva.meses.includes(V.clima.mes) ? [C.chuva.texto] : []), C.sempre] }
    : { ic: "sun", t: "Clima", itens: [...C.geral, C.sempre] };
  S.regras = sec("Pré-viagem", "Bom saber", D.regras.titulo,
    '<div class="cards">' + [...D.regras.cards, climaCard].map(card).join("") + "</div>" + D.regras.avisos.map(aviso).join("") +
    '<div class="warnbox" style="background:var(--chip);color:var(--ink)"><b>Segurança e avisos oficiais</b><br>' + D.regras.seguranca + " Os telefones de emergência estão na página @@PG:emergencia@@.</div>");

  S.mala = '<section class="page">' + head("Pré-viagem") + '<div class="in"><div><span class="kick">Lista de mala</span><h2 class="t" style="margin-top:2mm">Para 7 dias' + (mesDaViagem ? " em " + mesDaViagem : "") + '</h2></div><div class="cols3">' +
    D.mala.map(c => '<div class="card"><h3>' + c[0] + "</h3>" + cl(c[1].map(x => [x])) + "</div>").join("") + '</div><div class="card"><h3>Anotações</h3></div><div class="notes"></div></div>' + foot() + "</section>";

  S.ficar = sec("Pré-viagem", "Onde ficar", D.ficar.titulo,
    '<div class="bairros">' + D.ficar.bairros.map(b => '<div class="bairro"><h3>' + b.n + "</h3><div><em>A favor</em>" + lista(b.pro) + "</div><div><em>Contra</em>" + lista(b.contra) + '</div><p class="quem">' + b.quem + "</p></div>").join("") + "</div>" +
    '<div class="estilos">' + D.ficar.estilos.map(e => "<div><small>" + e[0] + "</small><b>" + e[1] + "</b><small>" + e[2] + "</small></div>").join("") + "</div>" +
    '<p class="mut" style="font-size:8.5pt">' + D.ficar.nota + "</p>");

  S.locomover = sec("Pré-viagem", "Como se locomover", D.locomover.titulo,
    tabela(D.locomover.cab, D.locomover.linhas) + '<div class="cards">' + D.locomover.cards.map(card).join("") + "</div>" + aviso(D.locomover.aviso));

  S.horarios = sec("Pré-viagem", "Para não dar com a porta fechada", "Horários e dias fechados",
    tabela(["Lugar", "Quando abre", "Fecha", "Entrada", "Reserva"], D.horarios.linhas) + aviso(D.horarios.aviso));

  S.historia = sec("Para entender", D.historia.kick, D.historia.titulo, '<div class="linha">' + D.historia.linhas.map(l => "<div><b>" + l[0] + "</b>" + l[1] + "</div>").join("") + "</div>");

  S.dias = DAYS.map((d, i) => '<section class="page"><div class="dayhead" style="background-image:url(' + B + d.img + '.jpg)">' + head("Dia " + (i + 1) + " de 7", true) + '<div class="tt"><small>' + d.d + "</small><h2>" + d.t + "</h2></div></div>" +
    '<div class="in" style="padding-top:5mm;gap:4.5mm"><div class="meta"><div><small>' + (V.dias ? "Gasto previsto " + porQuem : "Gasto previsto por pessoa") + "</small><b>" + d.gasto + '</b></div><div><small>Segurança da área</small><b class="stars">' + "★".repeat(d.seg) + '<span style="color:var(--line)">' + "★".repeat(5 - d.seg) + '</span></b></div><div><small>Região</small><b style="font-size:11pt">' + d.bairro + "</b></div></div>" +
    '<div class="read"><span class="kick">' + d.destaque[0] + "</span><p>" + d.destaque[1] + "</p></div>" +
    '<div class="stops">' + d.stops.map(s => '<div class="stop"><div class="h">' + s[0] + '</div><div class="c"><b>' + (s[4] ? '<a class="maps" href="' + esc(linkMaps(s[4])) + '">' + s[1] + " ↗</a>" : s[1]) + "</b><p>" + s[2] + '</p><div class="g">' + s[3].map(g => "<span>" + g + "</span>").join("") + "</div></div>" + (s[4] ? '<a class="qr" href="' + esc(linkMaps(s[4])) + '">' + qr(s[4]) + "</a>" : "<span></span>") + "</div>").join("") + "</div>" +
    '<div class="two2"><div class="mini"><b>Onde comer</b>' + d.comer.map(c => "<p>" + c[0] + "<small>" + c[1] + "</small></p>").join("") + '</div><div class="mini"><b>Se chover</b><p>' + d.chuva + "</p></div></div>" +
    '<span class="kick" style="color:var(--mut)">Anotações do dia</span><div class="notes" style="margin-bottom:0;min-height:0;flex:1 1 0"></div><div class="tip">' + ic("spark") + "<span><b>" + d.tip[0] + "</b>" + d.tip[1] + "</span></div></div>" + foot() + "</section>");

  // Guias de lugar: o mesmo desenho das páginas de lugar sagrado de Jerusalém.
  const G = D.guiasLugar;
  S.lugares = G.itens.map((s, i) => '<section class="page sacro"><div class="dayhead" style="background-image:url(' + B + s.img + '.jpg)">' + head(G.rotulo + " " + (i + 1) + " de " + G.itens.length, true) + '<div class="tt"><small>Dia ' + s.dia + " do roteiro · reserve " + s.tempo + "</small><h2>" + s.t + "</h2></div></div>" +
    '<div class="in" style="padding-top:5mm;gap:4.5mm"><div><span class="kick">' + (s.kickHist || "A história em poucas linhas") + '</span><p class="hist" style="margin-top:2mm">' + s.hist + "</p></div>" +
    '<div><span class="kick">O que fazer, nesta ordem</span><ol class="passos" style="margin-top:2mm">' + s.passos.map(p => "<li><b>" + p[0] + ":</b> " + p[1] + "</li>").join("") + "</ol></div>" +
    '<div class="trio"><div><b>A foto</b>' + s.foto + "</div><div><b>Tempo</b>Reserve " + s.tempo + ".</div><div><b>Bom saber</b>" + s.saber + "</div></div>" +
    '<span class="kick" style="color:var(--mut)">Anotações</span><div class="notes" style="margin-bottom:0;min-height:14mm"></div></div>' + foot() + "</section>");

  // Páginas próprias do destino (parques por idade, roupa de neve, câmbio...).
  S.especiais = D.especiais.map(e => sec(e.rotulo, e.kick, e.titulo, (e.tabela ? tabela(e.tabela.cab, e.tabela.linhas) : "") + (e.cards ? '<div class="cards">' + e.cards.map(card).join("") + "</div>" : "") + (e.avisos || []).map(aviso).join(""), e.sub));

  const somaDias = V.dias ? V.dias.reduce((a, b) => a + b, 0) : null;
  S.orcamento = sec("Na viagem", "O nosso diferencial", "Orçamento dia a dia",
    '<table class="tb"><thead><tr><th>Dia</th><th>Previsto ' + porQuem + "</th><th>Gasto real</th><th>" + D.orcamento.colDinheiro + "</th><th>Onde economizar</th></tr></thead><tbody>" +
    DAYS.map((d, i) => "<tr><td><b>Dia " + (i + 1) + "</b><small>" + d.t + "</small></td><td>" + d.gasto + '</td><td class="vazio"></td><td>' + D.orcamento.dias[i][0] + "</td><td>" + D.orcamento.dias[i][1] + "</td></tr>").join("") +
    "<tr><td><b>Total</b></td><td><b>" + (somaDias !== null ? brl(somaDias) : D.referencia.total) + '</b></td><td class="vazio"></td><td></td><td></td></tr></tbody></table>' +
    (somaDias !== null && V.comidaPasseios !== null && V.transporte !== null && V.comidaPasseios + V.transporte - somaDias > 0
      ? '<p class="mut" style="font-size:8.5pt">Os dias somam o que você gasta em cada dia da viagem. No resumo, comida, passeios e ' + D.rotuloExtra.toLowerCase() + " dão " + brl(V.comidaPasseios + V.transporte) + ": os outros " + brl(V.comidaPasseios + V.transporte - somaDias) + " ficam fora dos dias, " + D.orcamento.fora + ".</p>" : "") +
    (V.sobra !== null ? '<div class="money" style="grid-template-columns:1fr auto;align-items:center"><span>Mesmo seguindo o roteiro, você ainda tem de sobra</span><span class="big">' + brl(V.sobra) + "</span></div>"
      : '<div class="warnbox"><b>Como usar</b><br>Anote o gasto real no fim de cada dia. Se um dia passar do previsto, compense nos dias seguintes com as dicas da última coluna.</div>') +
    '<p class="mut" style="font-size:8.5pt">' + D.orcamento.nota + "</p>");

  S.comida = sec("Na viagem", "Para provar", D.comida.titulo,
    '<div class="pratos">' + D.comida.pratos.map(p => '<div class="prato"><b>' + p[0] + "</b><p>" + p[1] + "</p><small>" + p[2] + "</small></div>").join("") + "</div>" +
    '<div class="cards">' + D.comida.cards.map(card).join("") + "</div>");

  S.golpes = sec("Na viagem", "Para viajar tranquilo", "Cuidados e golpes comuns",
    '<div class="cards">' + D.golpes.itens.map(g => '<div class="card"><h3>' + g[0] + "</h3><p>" + g[1] + "</p></div>").join("") + "</div>" +
    card({ ic: "shield", t: "Se perder o documento", itens: D.golpes.perda }) + aviso(D.golpes.aviso));

  S.fotos = sec("Na viagem", "Dez fotos para não esquecer", "Fotos que você não pode deixar de tirar",
    '<table class="tb"><thead><tr><th></th><th>Onde</th><th>Melhor horário</th><th>Dia do roteiro</th></tr></thead><tbody>' +
    D.fotos.itens.map((f, i) => "<tr><td>☐</td><td><b>" + (i + 1) + ". " + f[0] + "</b></td><td>" + f[1] + "</td><td>Dia " + f[2] + "</td></tr>").join("") + "</tbody></table>" + aviso(D.fotos.aviso));

  // Passeios extras: a sobra do orçamento da simulação, quando existe, mostra quanto cada um usa.
  const usa = (min, max) => {
    if (V.sobra === null || !(V.sobra > 0)) return "";
    const custo = ((min + max) / 2) * (V.dias ? V.pessoas : 1);
    return '<div class="row" style="color:var(--gold)"><span>Usa da sua sobra de ' + brl(V.sobra) + "</span><b>cerca de " + Math.min(100, Math.round((custo / V.sobra) * 100)) + "%</b></div>";
  };
  const extra = x => '<div class="card"><h3>' + x.t + "</h3><p>" + x.o + "</p>" + lista(x.itens) + '<div class="money" style="margin-top:2mm"><div class="row" style="border:0;padding:0"><span>Custo por pessoa</span><b>' + x.preco + "</b></div>" + usa(x.min, x.max) + '</div><p class="mut" style="font-size:8.5pt">' + x.dica + "</p></div>";
  S.extras = D.extras.map(p => sec("Se sobrar tempo ou dinheiro", p.kick, p.titulo, (p.cards.length > 1 ? '<div class="cards">' + p.cards.map(extra).join("") + "</div>" : extra(p.cards[0])) + aviso(p.aviso)));

  S.guias = sec("Guias e passeios", "Para contratar se quiser", "Empresas de passeio mais conhecidas",
    '<table class="gt"><thead><tr><th>Passeio</th><th>Empresas mais conhecidas</th><th>Faixa</th><th>Dia</th></tr></thead><tbody>' +
    D.guias.linhas.map(r => "<tr><td><b>" + r[0] + "</b><small>" + r[1] + "</small></td><td>" + r[2] + '</td><td class="pr">' + r[3] + "</td><td>" + r[4] + "</td></tr>").join("") + "</tbody></table>" +
    aviso(["Como escolher", D.guias.escolher]) + '<p class="mut" style="font-size:8.5pt">$ até R$ 150 por pessoa · $$ de R$ 150 a R$ 600 · $$$ acima de R$ 600 (valores de referência)</p>',
    "Lista feita com IA a partir das empresas mais citadas por viajantes. Não temos parceria com elas. Confira avaliações recentes antes de contratar.");

  const E = D.emergencia;
  S.emergencia = sec("Na viagem", "Guarde esta página", "Emergência e frases úteis",
    '<div class="em" style="grid-template-columns:repeat(' + E.numeros.length + ',1fr)">' + E.numeros.map(n => "<div><b>" + n[0] + "</b>" + n[1] + "</div>").join("") + "</div>" +
    '<div class="card"><h3>' + ic("shield") + E.consulado.t + "</h3>" + E.consulado.p.map(p => "<p>" + p + "</p>").join("") + "</div>" +
    '<table class="phr"><tbody>' + E.frases.map(r => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>").join("") + "</tbody></table>");

  const T = D.cartao;
  S.cartao = sec("Na viagem", T.kick, "Cartão para mostrar",
    '<div class="taxi"><p class="mut">Por favor, me leve para:</p><p class="he">' + T.pedido + '</p><div class="end"></div><p class="mut">Nome e endereço do hotel</p><div class="end"></div></div>' +
    tabela(["Lugar", T.coluna], T.lugares), T.sub);

  S.diario = sec("Para lembrar", "Uma página para depois", "Diário da viagem",
    '<div class="diario">' + DAYS.map((d, i) => "<div><b>Dia " + (i + 1) + '</b><div><p>O melhor momento do dia · o que eu comi · uma pessoa que conheci</p><div class="ln"></div></div></div>').join("") + "</div>");

  S.contracapa = '<section class="page dark back">' + LOGO_E + '<h2 style="font-size:28pt">Boa viagem, ' + PRIMEIRO + '.</h2><p style="opacity:.75;max-width:120mm">Quando voltar, conte para a gente como foi. Sua próxima viagem também pode caber no bolso.</p><p style="opacity:.6;font-size:9pt">vaidarviagem.com.br</p><p style="position:absolute;bottom:10mm;left:16mm;right:16mm;opacity:.45;font-size:7pt">Fotos: Wikimedia Commons. ' + D.creditos + "</p></section>";

  // Ordem do PDF. Cada item: [id, título no sumário, grupo, html].
  const ORDEM = [
    ["capa", null, null, S.capa], ["sumario", null, null, null],
    ["resumo", "Resumo da viagem", "Antes de ir", S.resumo], ["ficha", "Ficha da viagem", "Antes de ir", S.ficha],
    ["mapa", M.sumario, "Antes de ir", S.mapa], ["quando", "O que fazer e quando", "Antes de ir", S.quando],
    ["regras", D.regras.titulo, "Antes de ir", S.regras], ["mala", "Lista de mala", "Antes de ir", S.mala],
    ["ficar", "Onde ficar", "Antes de ir", S.ficar], ["locomover", "Como se locomover", "Antes de ir", S.locomover],
    ["horarios", "Horários e dias fechados", "Antes de ir", S.horarios], ["historia", D.historia.titulo, "Antes de ir", S.historia],
    ...S.dias.map((d, i) => ["dia" + (i + 1), "Dia " + (i + 1) + ": " + DAYS[i].t, "A viagem, dia a dia", d]),
    ...S.lugares.map((d, i) => ["lugar" + (i + 1), G.itens[i].t, G.grupo, d]),
    ...S.especiais.map((d, i) => [D.especiais[i].id, D.especiais[i].sumario, D.especiais[i].grupo || G.grupo, d]),
    ["orcamento", "Orçamento dia a dia", "Na viagem", S.orcamento], ["comida", D.comida.titulo, "Na viagem", S.comida],
    ["golpes", "Cuidados e golpes comuns", "Na viagem", S.golpes], ["fotos", "Fotos para não deixar de tirar", "Na viagem", S.fotos],
    ...S.extras.map((d, i) => ["extras" + (i + 1), "Se sobrar: " + D.extras[i].titulo, "Na viagem", d]),
    ["guias", "Guias e passeios", "Na viagem", S.guias], ["emergencia", "Emergência e frases úteis", "Na viagem", S.emergencia],
    ["cartao", "Cartão para mostrar", "Na viagem", S.cartao], ["diario", "Diário da viagem", "Na viagem", S.diario],
    ["contracapa", null, null, S.contracapa]
  ];
  const TOTAL = ORDEM.length;
  let grupo = "";
  const sumario = ORDEM.map((p, i) => {
    if (!p[1]) return "";
    const g = p[2] !== grupo ? "<h3>" + (grupo = p[2]) + "</h3>" : "";
    return g + '<a href="#' + p[0] + '"><b>' + (i + 1) + "</b><span>" + p[1] + "</span></a>";
  }).join("");
  ORDEM[1][3] = '<section class="page">' + head("Sumário") + '<div class="in" style="gap:2mm"><div><span class="kick">' + TOTAL + ' páginas</span><h2 class="t" style="margin-top:2mm">O que tem neste roteiro</h2><p class="mut" style="margin-top:2mm">Toque no título para ir direto à página.</p></div><div class="sumario">' + sumario + "</div></div>" + foot() + "</section>";
  const paginas = ORDEM.map((p, i) => p[3].replace("<section ", '<section id="' + p[0] + '" ').replace("@@PAG@@", "pág. " + (i + 1) + " de " + TOTAL)).join("");
  const comNumeros = paginas.replace(/@@PG:([a-z0-9-]+)@@/g, (_, id) => String(ORDEM.findIndex(p => p[0] === id) + 1));
  return cabeca(D.nome, B + D.capa.img + ".jpg") + '<div class="doc" id="doc">' + comNumeros + "</div>\n</body></html>";
}
