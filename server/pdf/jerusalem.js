// Roteiro Detalhado + Pré-viagem de Jerusalém (16 páginas A4), feito pela UI/Ux a partir do protótipo.
// O conteúdo é fixo; a única variável é o nome de quem comprou (capa, rodapé de cada página e contracapa).
// Gera o HTML que o navegador imprime em PDF (A4, sem margem, com fundos). As imagens ficam em /roteiros/jerusalem/.
// ATENÇÃO: horários, regras de entrada, telefones e empresas de guia foram escritos de memória; conferir antes de vender.

import qrcode from "qrcode-generator";
import { CSS_MAIS, paginasMais } from "./jerusalem-mais.js";

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const CABECA0 = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Roteiro Detalhado + Pré-viagem · Jerusalém</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap">
<style>
/* PDF do Roteiro Detalhado + Pré-viagem em páginas A4: antes da viagem, dia a dia, guias e emergência. Logo em todas as páginas. */
:root{
  --paper:#F7F8F6; --surf:#FFFFFF; --ink:#102624; --mut:#557370; --line:#D7E2E0; --chip:#E8F0EF;
  --deep:#0D3532; --acc:#0E6E6A; --gold:#E2B23F; --goldbg:#FBF1D8; --goldink:#7A5A0E; --ok:#1E8A4C; --warn:#A86A00; --on:#FFFFFF;
  --display:"Bricolage Grotesque","Arial Narrow",system-ui,sans-serif;
  --body:"Figtree",system-ui,-apple-system,"Segoe UI",sans-serif;
  color-scheme:light;
}
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:#C9D6D4;color:var(--ink);font:10.5pt/1.5 var(--body);-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--display);font-weight:800;letter-spacing:-.02em;line-height:1.05;margin:0;text-wrap:balance}
p{margin:0}
.bar-x{position:sticky;top:0;z-index:5;background:var(--ink);color:var(--on);font-size:13px;padding:8px 16px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}
.bar-x a{color:var(--deep);background:var(--gold);border-radius:999px;padding:6px 14px;font-weight:700;text-decoration:none}
.doc{display:grid;gap:24px;justify-content:center;padding:24px 0 48px}
.page{width:210mm;height:297mm;background:var(--surf);position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(13,53,50,.18);display:flex;flex-direction:column}
.in{padding:16mm 16mm 0;flex:1;display:flex;flex-direction:column;gap:6mm;min-height:0}
.ph{display:flex;justify-content:space-between;align-items:center;padding:9mm 16mm 0}
.ph img{height:10mm}
.ph span{font-size:8.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}
.pf{display:flex;justify-content:space-between;padding:0 16mm 8mm;font-size:8pt;color:var(--mut)}
.kick{font:700 8.5pt/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.dark{background:var(--deep);color:var(--on)}
.dark .kick{color:var(--gold)}
.mut{color:var(--mut)}

/* Capa */
.cover{background:var(--deep) url(/roteiros/jerusalem/capa.jpg) center/cover;color:var(--on)}
.cover::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,53,50,.55) 0%,rgba(13,53,50,.1) 35%,rgba(13,53,50,.95) 72%)}
.cover>*{position:relative}
.cover .top{padding:14mm 16mm 0}
.cover .top img{height:15mm}
.cover .bot{margin-top:auto;padding:0 16mm 16mm;display:grid;gap:5mm}
.cover .tag{display:inline-flex;gap:2mm;align-items:center;justify-self:start;background:var(--gold);color:var(--deep);border-radius:999px;padding:2mm 4mm;font-weight:700;font-size:9.5pt}
.cover h1{font-size:46pt}
.cover .who{border-top:1px solid rgba(255,255,255,.3);padding-top:5mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.cover .who small{display:block;opacity:.65;font-size:8.5pt}
.cover .who b{font-size:12pt}

/* Resumo */
h2.t{font-size:26pt}
.sum{display:grid;grid-template-columns:1.25fr 1fr;gap:6mm}
.dl{display:grid;gap:2.5mm}
.dr{display:grid;grid-template-columns:18mm 1fr auto;gap:3mm;align-items:center;background:var(--paper);border-radius:3mm;padding:2mm;padding-right:4mm}
.dr img{width:18mm;height:13mm;object-fit:cover;border-radius:2mm;display:block}
.dr .ph0{width:18mm;height:13mm;border-radius:2mm;background:var(--chip);display:grid;place-items:center;font:800 10pt var(--display);color:var(--acc)}
.dr b{display:block;font-size:10pt}
.dr small{color:var(--mut);font-size:8.5pt}
.dr em{font-style:normal;font-weight:700;font-size:9pt;color:var(--acc)}
.money{background:var(--deep);color:var(--on);border-radius:4mm;padding:6mm;display:grid;gap:3mm;align-content:start}
.money .big{font:800 24pt var(--display);color:var(--gold)}
.money .row{display:flex;justify-content:space-between;font-size:9.5pt;border-top:1px solid rgba(255,255,255,.15);padding-top:2mm}
.stack{display:flex;height:3mm;border-radius:2mm;overflow:hidden}
.how{background:var(--goldbg);color:var(--goldink);border-radius:4mm;padding:5mm;display:grid;gap:2mm}
.how b{color:var(--deep)}
.how ul{margin:0;padding-left:4.5mm;display:grid;gap:1mm}

/* Pré-viagem */
.tl{display:grid;gap:4mm}
.tli{display:grid;grid-template-columns:24mm 1fr;gap:4mm}
.tli .when{background:var(--deep);color:var(--on);border-radius:3mm;padding:3mm;text-align:center;align-self:start}
.tli .when b{display:block;font:800 16pt/1 var(--display);color:var(--gold)}
.tli .when small{font-size:8pt;opacity:.8}
.cl{list-style:none;margin:0;padding:0;display:grid;gap:1.6mm}
.cl li{display:grid;grid-template-columns:4.5mm 1fr;gap:2.5mm;align-items:start}
.cl li::before{content:"";width:4mm;height:4mm;border:1.5px solid var(--acc);border-radius:1mm;margin-top:.6mm}
.cl li small{display:block;color:var(--mut);font-size:8.5pt}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.card{background:var(--paper);border-radius:4mm;padding:5mm;display:grid;gap:2mm;align-content:start}
.card h3{font-size:13pt;display:flex;gap:2mm;align-items:center}
.card p,.card li{font-size:9.5pt}
.card ul{margin:0;padding-left:4.5mm;display:grid;gap:1mm}
.ic{width:7mm;height:7mm;border-radius:50%;background:var(--gold);color:var(--deep);display:inline-grid;place-items:center;flex:none}
.warnbox{background:var(--goldbg);border-radius:4mm;padding:4mm 5mm;color:var(--goldink);font-size:9.5pt}
.warnbox b{color:var(--deep)}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}

/* Dia */
.dayhead{height:88mm;background:var(--deep) center/cover;position:relative;color:var(--on);display:flex;flex-direction:column}
.dayhead::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,53,50,.6) 0%,rgba(13,53,50,0) 35%,rgba(13,53,50,.92) 100%)}
.dayhead>*{position:relative}
.dayhead .ph span{color:var(--gold)}
.dayhead .tt{margin-top:auto;padding:0 16mm 6mm;display:grid;gap:1.5mm}
.dayhead small{color:var(--gold);font-weight:700;font-size:10pt}
.dayhead h2{font-size:26pt}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}
.meta div{background:var(--paper);border-radius:3mm;padding:3mm 4mm}
.meta small{display:block;color:var(--mut);font-size:8pt;font-weight:600}
.meta b{font:800 13pt var(--display)}
.stars{color:var(--gold);letter-spacing:.5mm}
.stops{display:grid;gap:3mm}
.stop{display:grid;grid-template-columns:16mm 1fr;gap:4mm}
.stop .h{font:800 12pt var(--display);color:var(--acc)}
.stop .c{border-left:2px solid var(--line);padding-left:4mm;display:grid;gap:1mm}
.stop .c b{font-size:11pt}
.stop .c p{font-size:9.5pt;color:var(--mut)}
.stop .c .g{display:flex;gap:4mm;flex-wrap:wrap;font-size:8.5pt;font-weight:600;color:var(--ink)}
.stop .c .g span{background:var(--chip);border-radius:999px;padding:.6mm 2.5mm}
.tip{margin-top:auto;margin-bottom:6mm;background:var(--goldbg);border-radius:4mm;padding:4mm 5mm;display:grid;grid-template-columns:auto 1fr;gap:3mm;align-items:start;color:var(--goldink);font-size:9.5pt}
.tip b{color:var(--deep);display:block}

.read{border-left:3px solid var(--gold);padding:1mm 0 1mm 4mm;display:grid;gap:1mm}
.read p{font:600 11pt/1.4 var(--display);color:var(--deep)}
.two2{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.mini{background:var(--paper);border-radius:3mm;padding:3.5mm 4mm;display:grid;gap:1.5mm;align-content:start;font-size:9pt}
.mini b{font:700 10.5pt var(--display)}
.mini small{display:block;color:var(--acc);font-weight:700;font-size:8.5pt}
.dayhead{height:72mm}
.stops{gap:2.4mm}
.tip{margin-bottom:5mm}
/* Guias */
.gt{width:100%;border-collapse:collapse;font-size:9.5pt}
.gt th{text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);padding:2mm 3mm;border-bottom:1.5px solid var(--line)}
.gt td{padding:3mm;border-bottom:1px solid var(--line);vertical-align:top}
.gt td b{display:block}
.gt td small{color:var(--mut)}
.pr{font-weight:800;color:var(--acc);white-space:nowrap}

/* Emergência */
.em{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.em div{background:var(--deep);color:var(--on);border-radius:4mm;padding:5mm;text-align:center}
.em b{display:block;font:800 30pt/1 var(--display);color:var(--gold)}
.phr{width:100%;border-collapse:collapse;font-size:10pt}
.phr td{padding:2.2mm 3mm;border-bottom:1px solid var(--line)}
.phr td:first-child{font-weight:700}
.phr td:last-child{color:var(--mut);font-style:italic}
.notes{flex:1;background:repeating-linear-gradient(180deg,transparent 0 8mm,var(--line) 8mm calc(8mm + 1px));min-height:30mm;margin-bottom:6mm}

.back{align-items:center;justify-content:center;text-align:center;gap:6mm}
.back img{height:20mm}

@media screen and (max-width:840px){.doc{zoom:calc(100vw / 840px)}}
@supports not (zoom:1){@media screen and (max-width:840px){.doc{transform-origin:top center}}}
@media print{body{background:none}.bar-x{display:none}.doc{display:block;padding:0}.page{box-shadow:none;break-after:page}}
</style>
</head><body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="spark" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z M14 3v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="shirt" viewBox="0 0 24 24"><path d="M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9L6 10 3 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="shield" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
</svg>

`;

// QR code (SVG) que abre o lugar no Google Maps: no papel, a câmera do celular leva direto ao mapa.
// O QR usa o endereço curto do Maps e correção "L" para ter menos módulos e ler bem impresso.
const qr = lugar => {
  const q = qrcode(0, "L");
  const url = "https://maps.google.com/?q=" + encodeURIComponent(lugar);
  q.addData(url);
  q.make();
  return q.createSvgTag({ cellSize: 1, margin: 0, scalable: true });
};
const linkMaps = lugar => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(lugar);
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const CABECA = CABECA0.replace("</style>", CSS_MAIS + "</style>");
const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const num = v => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null);

// "AAAA-MM-DD" do primeiro dia da viagem, para dar data e dia da semana a cada dia (o Shabat muda o roteiro).
const lerData = t => {
  if (typeof t !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(t + "T12:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
};
// Clima do mês da viagem, como o app já calcula (server/clima.js): { mes: 1 a 12, min, max } em °C.
const lerClima = c => {
  const mes = Math.round(num(c?.mes) || 0), min = Number(c?.min), max = Number(c?.max);
  return mes >= 1 && mes <= 12 && Number.isFinite(min) && Number.isFinite(max) && min <= max && min > -40 && max < 60 ? { mes, min: Math.round(min), max: Math.round(max) } : null;
};

// Valores da simulação, que mudam com o período escolhido. Tudo opcional: sem eles, o PDF usa a referência
// por pessoa. { periodo: "07 a 13 de março de 2027", pessoas: 2, cotacao: 1.52 (R$ por shekel),
//   passagens, hotel, noites, comidaPasseios, transporte, total, sobra, dias: [7 valores, para o grupo],
//   inicio: "2027-03-07", clima: { mes: 3, min: 8, max: 19 } }. A cotação é a do dia da compra, passada por quem gera.
export function lerValores(v = {}) {
  const pessoas = Math.min(20, Math.max(1, Math.round(num(v.pessoas) || 1)));
  const dias = Array.isArray(v.dias) && v.dias.length === 7 && v.dias.every(x => num(x) !== null) ? v.dias.map(Number) : null;
  const itens = ["passagens", "hotel", "comidaPasseios", "transporte"].map(k => num(v[k]));
  const total = num(v.total) ?? (itens.every(x => x !== null) ? itens.reduce((a, b) => a + b, 0) : null);
  const periodo = typeof v.periodo === "string" ? esc(v.periodo.trim().slice(0, 60)) : "";
  return { pessoas, dias, total, periodo, passagens: itens[0], hotel: itens[1], comidaPasseios: itens[2], transporte: itens[3],
    noites: Math.round(num(v.noites) || 6), sobra: num(v.sobra), cotacao: num(v.cotacao) || null,
    inicio: lerData(v.inicio), clima: lerClima(v.clima) };
}

export function roteiroJerusalem(nomeCru, valores = {}) {
  const NOME = esc(String(nomeCru || "").trim().replace(/\s+/g, " ").slice(0, 60) || "Viajante");
  const PRIMEIRO = NOME.split(" ")[0];
  const V = lerValores(valores);
  // Gasto de cada dia: o da simulação (para o grupo) ou o de referência por pessoa.
  const gastoDia = (i, ref) => (V.dias ? brl(V.dias[i]) : ref);
  const LOGO_C='<img src="/roteiros/jerusalem/logo-claro.png" alt="Vai Dar Viagem">',LOGO_E='<img src="/roteiros/jerusalem/logo-escuro.png" alt="Vai Dar Viagem">';
  
  const head=(sec,dark)=>'<div class="ph">'+(dark?LOGO_E:LOGO_C)+'<span>'+sec+'</span></div>';
  const foot=()=>'<div class="pf"><span>Roteiro de '+NOME+' · Jerusalém</span><span>@@PAG@@</span></div>';
  const ic=i=>'<span class="ic"><svg width="15" height="15"><use href="#'+i+'"/></svg></span>';
  const cl=a=>'<ul class="cl">'+a.map(x=>'<li><span>'+x[0]+(x[1]?'<small>'+x[1]+'</small>':'')+'</span></li>').join('')+'</ul>';
  const DAYS=[
   {img:'muro',d:'Chegada · a pé',t:'Chegada, Cidade Antiga e Muro das Lamentações',gasto:gastoDia(0,'R$ 140'),seg:4,bairro:'Cidade Antiga',stops:[
    ['11:00','Aeroporto Ben Gurion → Jerusalém','Trem direto até a estação Yitzhak Navon, no centro.',['Trem','cerca de 25 min']],
    ['14:00','Check-in e almoço leve','Deixe as malas e coma perto do hotel.',['A pé']],
    ['16:00','Portão de Jaffa','Entrada clássica da Cidade Antiga. Caminhe pela rua David até o Bairro Judeu.',['A pé','grátis'],'Jaffa Gate, Jerusalem'],
    ['17:30','Muro das Lamentações ao entardecer','Há áreas separadas para homens e mulheres. Homens cobrem a cabeça (kipá emprestada na entrada).',['A pé','grátis'],'Western Wall, Jerusalem']],
    tip:['Para economizar','Compre o cartão de transporte (Rav-Kav) na estação do aeroporto. Ele serve para trem, ônibus e VLT a semana toda.']},
   {img:'sepulcro',d:'A pé pela Cidade Antiga',t:'Via Dolorosa e Santo Sepulcro',gasto:gastoDia(1,'R$ 160'),seg:4,bairro:'Bairros Muçulmano e Cristão',stops:[
    ['07:30','Via Dolorosa','Comece perto do Portão dos Leões e siga as 14 estações. Cedo, as ruas estão vazias.',['A pé','grátis'],'Via Dolorosa, Jerusalem'],
    ['10:00','Basílica do Santo Sepulcro','Calvário e o túmulo. A fila para o túmulo cresce ao longo da manhã.',['A pé','grátis'],'Church of the Holy Sepulchre, Jerusalem'],
    ['13:00','Almoço no Bairro Cristão','Falafel e homus nas ruas laterais custam bem menos que perto das portas.',['A pé']],
    ['15:00','Torre de Davi','Museu da história de Jerusalém, com a melhor vista das muralhas.',['A pé','ingresso pago'],'Tower of David Museum, Jerusalem']],
    tip:['Atenção','Ombros e joelhos cobertos para entrar nas igrejas. Leve um lenço na bolsa.']},
   {img:'getsemani',d:'Táxi na subida, a pé na descida',t:'Monte das Oliveiras e Getsêmani',gasto:gastoDia(2,'R$ 130'),seg:4,bairro:'Monte das Oliveiras',stops:[
    ['08:00','Mirante do Monte das Oliveiras','A vista da cidade inteira com o Domo da Rocha. Suba de táxi e desça a pé.',['Táxi','cerca de 15 min'],'Mount of Olives Observation Point, Jerusalem'],
    ['09:30','Dominus Flevit','Pequena igreja onde Jesus chorou sobre Jerusalém, no caminho de descida.',['A pé','grátis'],'Dominus Flevit Church, Jerusalem'],
    ['11:00','Jardim do Getsêmani e Igreja de Todas as Nações','As oliveiras antigas e a rocha da agonia.',['A pé','grátis'],'Church of All Nations, Jerusalem'],
    ['15:00','Monte Sião e Cenáculo','A sala da Última Ceia e o túmulo do rei Davi.',['A pé','grátis'],'Cenacle, Mount Zion, Jerusalem']],
    tip:['Para economizar','Peça o táxi pelo aplicativo (Gett) para pagar o preço do taxímetro.']},
   {img:'galileia',d:'Excursão de um dia',t:'Mar da Galileia',gasto:gastoDia(3,'R$ 575'),seg:5,bairro:'Galileia',stops:[
    ['07:00','Saída de Jerusalém','A forma mais simples é um passeio de um dia em grupo. A estrada leva cerca de 2h30.',['Excursão','dia inteiro']],
    ['10:00','Monte das Bem-Aventuranças','Onde foi pregado o Sermão da Montanha, com vista para o lago.',['Excursão'],'Mount of Beatitudes, Israel'],
    ['11:30','Tabgha e Cafarnaum','Igreja da Multiplicação dos Pães e a cidade de Pedro.',['Excursão'],'Capernaum, Israel'],
    ['15:00','Rio Jordão (Yardenit)','Local de batismo com estrutura para visitantes.',['Excursão'],'Yardenit Baptismal Site, Israel']],
    tip:['Guia indicado','Veja na página @@PG:guias@@ as empresas mais conhecidas que fazem este passeio saindo de Jerusalém.']},
   {img:'belem',d:'Bate-volta de ônibus',t:'Belém',gasto:gastoDia(4,'R$ 150'),seg:3,bairro:'Belém (Cisjordânia)',stops:[
    ['08:30','Ônibus para Belém','Sai da estação de ônibus árabe perto do Portão de Damasco.',['Ônibus','cerca de 40 min']],
    ['10:00','Basílica da Natividade','A gruta onde Jesus nasceu. Chegue cedo para pegar menos fila.',['A pé','grátis'],'Church of the Nativity, Bethlehem'],
    ['12:00','Gruta do Leite e centro antigo','Almoço na praça da Manjedoura.',['A pé'],'Milk Grotto, Bethlehem'],
    ['14:30','Campo dos Pastores','Onde os anjos anunciaram o nascimento. Vá de táxi local.',['Táxi'],'Shepherds\' Field, Beit Sahour']],
    tip:['Atenção','Leve o passaporte: há posto de controle na volta para Jerusalém. Volte antes de escurecer.']},
   {img:'mercado',d:'Melhor numa sexta-feira',t:'Mercado e início do Shabat',gasto:gastoDia(5,'R$ 170'),seg:4,bairro:'Centro e Cidade Antiga',stops:[
    ['09:00','Mercado Mahane Yehuda','Na sexta de manhã o mercado fica cheio e animado. Compre pão, frutas e doces.',['VLT','cerca de 15 min'],'Mahane Yehuda Market, Jerusalem'],
    ['12:00','Jardim do Túmulo','Jardim tranquilo, perto do Portão de Damasco, com um túmulo escavado na rocha.',['A pé','grátis'],'Garden Tomb, Jerusalem'],
    ['15:00','Volta ao hotel','Lojas e transporte começam a fechar no meio da tarde.',['A pé']],
    ['17:00','Muro das Lamentações no Shabat','A chegada do Shabat no Muro, com cantos e orações. Não fotografe durante o Shabat.',['A pé','grátis'],'Western Wall, Jerusalem']],
    tip:['Atenção','Do pôr do sol de sexta até a noite de sábado, ônibus, trem e VLT param. Compre o jantar antes.']},
   {img:'capa',d:'Último dia',t:'Manhã livre e volta',gasto:gastoDia(6,'R$ 260'),seg:4,bairro:'Cidade Antiga',stops:[
    ['09:00','Caminhada pelas muralhas','Manhã livre para voltar ao lugar que você mais gostou.',['A pé'],'Ramparts Walk, Jaffa Gate, Jerusalem'],
    ['12:00','Almoço no Bairro Armênio ou Cristão','Os restaurantes desses bairros abrem também no sábado.',['A pé']],
    ['15:00','Ida para o aeroporto','De trem, a partir da estação Yitzhak Navon. No sábado não tem trem: reserve um transfer ou táxi compartilhado (sherut).',['Trem ou transfer','cerca de 30 a 50 min']],
    ['18:00','Chegada no aeroporto','A segurança em Israel é demorada. Chegue 3 horas antes do voo.',['Aeroporto']]],
    tip:['Não esqueça','Guarde os recibos das compras grandes para pedir a devolução do imposto (VAT) no aeroporto.']}
  ];
  const EXTRA=[
   {ler:['Salmo 122','"Alegrei-me quando me disseram: Vamos à casa do Senhor."'],comer:[['Homus no Lina, no Bairro Cristão, perto do Santo Sepulcro','R$ 25 a R$ 40 por pessoa'],['Jantar na rua Ben Yehuda ou em Mamilla','R$ 70 a R$ 110 por pessoa']],chuva:'Troque a caminhada pelo Museu da Torre de Davi, que é coberto, e deixe o Muro para o fim da tarde.'},
   {ler:['João 19','O caminho da cruz, da condenação ao sepulcro.'],comer:[['Homus no Abu Shukri, na Via Dolorosa','R$ 30 a R$ 45 por pessoa'],['Strudel e café no terraço do Hospício Austríaco','R$ 20 a R$ 35 por pessoa']],chuva:'A Via Dolorosa tem trechos cobertos. Faça o Santo Sepulcro primeiro e as estações depois.'},
   {ler:['Mateus 26:36-46','A oração de Jesus no Getsêmani.'],comer:[['Lanche no caminho, leve água e frutas','R$ 20 por pessoa'],['Jantar na Armenian Tavern, no Bairro Armênio','R$ 60 a R$ 100 por pessoa']],chuva:'As pedras da descida ficam escorregadias. Desça de táxi e visite as igrejas por dentro.'},
   {ler:['Mateus 5:1-12','O Sermão da Montanha, as bem-aventuranças.'],comer:[['Peixe de São Pedro em Tiberíades ou no kibutz Ein Gev','R$ 90 a R$ 140 por pessoa'],['Lanche de estrada, a excursão para no caminho','R$ 30 por pessoa']],chuva:'A excursão acontece com chuva. Leve casaco impermeável e troca de roupa para o Jordão.'},
   {ler:['Lucas 2:1-20','O nascimento de Jesus e o anúncio aos pastores.'],comer:[['Falafel e homus no Afteem, na Praça da Manjedoura','R$ 30 a R$ 50 por pessoa'],['Doces árabes no centro antigo','R$ 15 por pessoa']],chuva:'Fique na Basílica e na Gruta do Leite, que são cobertas, e pule o Campo dos Pastores.'},
   {ler:['João 20:1-18','O túmulo vazio na manhã da ressurreição.'],comer:[['Azura, no Mahane Yehuda (cozidos turcos, só almoço)','R$ 50 a R$ 80 por pessoa'],['Rugelach da Marzipan e o jantar do Shabat comprados no mercado','R$ 30 por pessoa']],chuva:'O mercado é quase todo coberto. Deixe o Jardim do Túmulo para outro dia.'},
   {ler:['Salmo 121:8','"O Senhor guardará a tua saída e a tua entrada."'],comer:[['Knafeh no Jafar Sweets, no Bairro Muçulmano','R$ 15 a R$ 25 por pessoa'],['Lanche no aeroporto, mais caro','R$ 60 por pessoa']],chuva:'Troque a caminhada nas muralhas por uma última visita ao Santo Sepulcro.'}
  ];
  // Com a data de início, cada dia ganha data e dia da semana, e o texto se ajusta ao Shabat.
  if (V.inicio) DAYS.forEach((d,i)=>{const dt=new Date(V.inicio.getTime()+i*864e5); d.sem=dt.getUTCDay(); d.d=SEMANA[d.sem]+', '+String(dt.getUTCDate()).padStart(2,'0')+'/'+String(dt.getUTCMonth()+1).padStart(2,'0');});
  DAYS.forEach((d,i)=>{
    if (d.sem===undefined) return;
    const aeroporto = d.sem===6 ? ['Ida para o aeroporto','Hoje é sábado e não tem trem: vá de transfer reservado ou táxi compartilhado (sherut).',['Transfer ou sherut','cerca de 50 min']]
      : d.sem===5 ? ['Ida para o aeroporto','Na sexta os trens param no meio da tarde. Vá cedo de trem ou reserve um transfer.',['Trem ou transfer','25 a 50 min']]
      : ['Ida para o aeroporto','De trem, a partir da estação Yitzhak Navon.',['Trem','cerca de 25 min']];
    d.stops=d.stops.map(st=>st[1]==='Ida para o aeroporto'?[st[0],...aeroporto,st[4]]:st);
    if (d.sem===6 && i!==6) d.tip=['Hoje é Shabat','Trem, VLT e ônibus israelenses não funcionam. Use táxi, transfer ou os ônibus árabes do Portão de Damasco.'];
  });
  const mesDaViagem = V.clima ? MESES[V.clima.mes-1] : V.inicio ? MESES[V.inicio.getUTCMonth()] : '';
  const S={};
  const M = paginasMais({ head, foot, ic, cl, V, brl, DAYS, B: '/roteiros/jerusalem/' });
  // Capa
  S.capa='<section class="page cover"><div class="top">'+LOGO_E+'</div><div class="bot"><span class="tag"><svg width="14" height="14"><use href="#spark"/></svg>Roteiro Detalhado + Pré-viagem</span><h1>Jerusalém em 7 dias</h1><p style="font-size:13pt;opacity:.85;max-width:120mm">Tudo o que você precisa antes de ir e a viagem inteira, um dia de cada vez.</p><div class="who"><div><small>Preparado para</small><b>'+NOME+'</b></div>'+(V.periodo ? '<div><small>Datas</small><b>'+V.periodo+'</b></div><div><small>Viajantes</small><b>'+V.pessoas+(V.pessoas>1?' pessoas':' pessoa')+'</b></div>' : '<div><small>Duração</small><b>7 dias e 6 noites</b></div><div><small>Ritmo</small><b>Tranquilo, quase tudo a pé</b></div>')+'</div></div></section>';
  // Resumo
  S.resumo='<section class="page">'+head('Resumo da viagem')+'<div class="in"><div><span class="kick">Sua viagem em uma página</span><h2 class="t" style="margin-top:2mm">7 dias, um de cada vez</h2></div><div class="sum"><div class="dl">'+DAYS.map((d,i)=>'<div class="dr"><img src="/roteiros/jerusalem/'+d.img+'.jpg" alt=""><div><b>Dia '+(i+1)+' · '+d.t+'</b><small>'+d.d+'</small></div><em>'+d.gasto+'</em></div>').join('')+'</div><div style="display:grid;gap:5mm;align-content:start">'+(V.total !== null ? '<div class="money"><span style="opacity:.75;font-size:9.5pt">Custo previsto da viagem'+(V.pessoas>1?' para '+V.pessoas+' pessoas':'')+'</span><span class="big">'+brl(V.total)+'</span>'+[['Passagens',V.passagens],['Hotel, '+V.noites+' noites',V.hotel],['Comida e passeios',V.comidaPasseios],['Transporte e taxas',V.transporte]].filter(x=>x[1]!==null).map(x=>'<div class="row"><span>'+x[0]+'</span><b>'+brl(x[1])+'</b></div>').join('')+(V.sobra!==null?'<div class="row" style="color:var(--gold)"><span>Sobra do orçamento</span><b>'+brl(V.sobra)+'</b></div>':'')+'</div>' : '<div class="money"><span style="opacity:.75;font-size:9.5pt">Gasto previsto no destino, por pessoa</span><span class="big">R$ 1.585</span><div class="row"><span>Inclui</span><b>comida, passeios e transporte na cidade</b></div><div class="row"><span>Por dia, em média</span><b>cerca de R$ 225</b></div><div class="row" style="color:var(--gold)"><span>Passagens e hotel</span><b>simule no app</b></div></div>')+'<div class="how"><b>Como usar este roteiro</b><ul><li>Comece pelo Pré-viagem, na próxima página.</li><li>Marque os quadradinhos conforme for resolvendo.</li><li>Na viagem, abra só a página do dia.</li><li>'+(V.cotacao ? 'Valores em reais, com a cotação da data da compra: R$ '+V.cotacao.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' por shekel.' : 'Valores em reais, aproximados, para conferir perto da viagem.')+'</li></ul></div></div></div></div>'+foot()+'</section>';
  // Mapa
  const pin=(x,y,n,l,anc)=>'<g><circle cx="'+x+'" cy="'+y+'" r="13" fill="#E2B23F" stroke="#fff" stroke-width="3"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="14" fill="#0D3532">'+n+'</text><text x="'+(x+(anc==='end'?-20:20))+'" y="'+(y+5)+'" text-anchor="'+(anc||'start')+'" font-family="Figtree" font-weight="700" font-size="13" fill="#102624">'+l+'</text></g>';
  const gate=(x,y,l,dy)=>'<g><rect x="'+(x-6)+'" y="'+(y-6)+'" width="12" height="12" rx="2" fill="#0D3532"/><text x="'+x+'" y="'+(y+(dy||-12))+'" text-anchor="middle" font-family="Figtree" font-weight="600" font-size="11" fill="#557370">'+l+'</text></g>';
  const MAP='<svg viewBox="0 0 720 560" width="100%" role="img" aria-label="Mapa esquemático da Cidade Antiga de Jerusalém">'+
   '<rect width="720" height="560" rx="16" fill="#F7F8F6"/>'+
   '<path d="M500 60 C560 140 570 300 520 470" fill="none" stroke="#D7E2E0" stroke-width="40" stroke-linecap="round"/><text x="585" y="70" font-family="Figtree" font-size="12" fill="#557370" font-weight="700">Vale do Cedrom</text>'+
   '<g transform="translate(110 110)"><rect width="340" height="320" rx="6" fill="#fff" stroke="#0D3532" stroke-width="5"/>'+
   '<rect x="0" y="0" width="150" height="170" fill="#E8F0EF"/><rect x="150" y="0" width="190" height="170" fill="#FBF1D8"/><rect x="0" y="170" width="130" height="150" fill="#FBF1D8"/><rect x="130" y="170" width="130" height="150" fill="#E8F0EF"/><rect x="260" y="140" width="80" height="180" fill="#D7E2E0"/>'+
   '<text x="16" y="30" font-family="Figtree" font-weight="700" font-size="12" fill="#557370">BAIRRO CRISTÃO</text><text x="166" y="30" font-family="Figtree" font-weight="700" font-size="12" fill="#7A5A0E">BAIRRO MUÇULMANO</text><text x="16" y="306" font-family="Figtree" font-weight="700" font-size="12" fill="#7A5A0E">BAIRRO ARMÊNIO</text><text x="146" y="306" font-family="Figtree" font-weight="700" font-size="12" fill="#557370">BAIRRO JUDEU</text><text x="300" y="250" font-family="Figtree" font-weight="700" font-size="11" fill="#557370" text-anchor="middle" transform="rotate(-90 300 250)">ESPLANADA</text></g>'+
   gate(110,250,'Portão de Jaffa',-14)+gate(240,110,'Portão de Damasco')+gate(450,190,'Portão dos Leões')+gate(300,430,'Portão do Esterco',22)+
   '<path d="M440 210 C390 205 330 200 250 200" fill="none" stroke="#0E6E6A" stroke-width="4" stroke-dasharray="7 6"/><text x="350" y="194" font-family="Figtree" font-weight="700" font-size="12" fill="#0E6E6A" text-anchor="middle">Via Dolorosa</text>'+
   pin(185,245,'2','Santo Sepulcro',null)+pin(345,345,'1','Muro das Lamentações','end')+pin(150,275,'1','',null)+pin(545,250,'3','Monte das Oliveiras',null)+pin(535,320,'3','Getsêmani',null)+pin(170,480,'3','Monte Sião',null)+pin(255,70,'6','Jardim do Túmulo',null)+
   '<g font-family="Figtree" font-weight="700" font-size="12" fill="#0D3532"><text x="12" y="150">← Mahane Yehuda</text><text x="12" y="168" font-weight="500" fill="#557370">dia 6, 2 km de VLT</text><text x="330" y="535">↓ Belém (dia 5), 10 km</text><text x="20" y="40">↑ Galileia (dia 4), 150 km</text></g>'+
   '</svg>';
  S.mapa='<section class="page">'+head('Mapa')+'<div class="in"><div><span class="kick">Onde fica cada coisa</span><h2 class="t" style="margin-top:2mm">A Cidade Antiga cabe em 1 km²</h2><p class="mut" style="margin-top:2mm">Quase tudo dá para fazer a pé. Os números mostram em que dia você visita cada lugar.</p></div>'+MAP+'<div class="cards"><div class="card"><h3>Como se orientar</h3><ul><li>Entre pelo Portão de Jaffa e use a Torre de Davi como referência.</li><li>Placas em hebraico, árabe e inglês em todas as esquinas.</li><li>Baixe o mapa offline: o sinal cai nos becos.</li></ul></div><div class="card"><h3>Distâncias a pé</h3><ul><li>Portão de Jaffa ao Muro: 15 min</li><li>Muro ao Santo Sepulcro: 10 min</li><li>Getsêmani ao Portão dos Leões: 10 min</li></ul></div></div></div>'+foot()+'</section>';
  // Pré-viagem: linha do tempo
  S.quando='<section class="page">'+head('Pré-viagem')+'<div class="in"><div><span class="kick">Antes de embarcar</span><h2 class="t" style="margin-top:2mm">O que fazer e quando</h2><p class="mut" style="margin-top:2mm">Siga a linha do tempo e você chega no aeroporto sem nenhuma pendência.</p></div><div class="tl">'+
   [['90','dias antes',[['Confira o passaporte','Precisa valer por pelo menos 6 meses depois da volta.'],['Compre as passagens','Simule no vaidarviagem.com.br para achar as datas que cabem no bolso.'],['Avise o banco','Libere o cartão para uso no exterior.']]],
    ['30','dias antes',[['Peça a ETA-IL, a autorização eletrônica de entrada em Israel','Só no site oficial israel-entry.piba.gov.il. Custa 25 shekels por pessoa e a resposta sai em até 72 horas. Guarde a confirmação.'],['Contrate o seguro viagem','Com cobertura médica de pelo menos US$ 30 mil.'],['Reserve o hotel e o passeio da Galileia','Veja as empresas na página @@PG:guias@@.']]],
    ['7','dias antes',[['Compre shekels ou carregue um cartão global','Leve um pouco de dinheiro vivo para mercados e ônibus.'],['Ative o chip ou eSIM de dados',''],['Baixe o mapa offline de Jerusalém','E o aplicativo de táxi (Gett).']]],
    ['1','dia antes',[['Separe documentos impressos','Passaporte, ETA-IL, seguro e reservas.'],['Confira a mala com a lista da página @@PG:mala@@',''],['Reserve o transfer de volta','Se a volta for no sábado, não tem trem para o aeroporto.']]]
   ].map(t=>'<div class="tli"><div class="when"><b>'+t[0]+'</b><small>'+t[1]+'</small></div>'+cl(t[2])+'</div>').join('')+'</div></div>'+foot()+'</section>';
  // Pré-viagem: regras
  S.regras='<section class="page">'+head('Pré-viagem')+'<div class="in"><div><span class="kick">Bom saber</span><h2 class="t" style="margin-top:2mm">Dinheiro, costumes e clima</h2></div><div class="cards">'+
   '<div class="card"><h3>'+ic("i-doc")+'Documentos</h3><ul><li>Brasileiro não precisa de visto para turismo.</li><li>Antes do voo, peça a ETA-IL (25 shekels) em israel-entry.piba.gov.il. Ela vale até 2 anos ou até o passaporte vencer.</li><li>Leve o passaporte sempre com você: há postos de controle.</li></ul></div>'+
   '<div class="card"><h3>'+ic('coin')+'Dinheiro</h3><ul><li>Moeda: shekel (₪). Cartão é aceito quase em todo lugar.</li><li>Tenha notas pequenas para mercado e táxi.</li><li>Gorjeta em restaurante: cerca de 10% a 12%.</li></ul></div>'+
   '<div class="card"><h3>'+ic('shirt')+'Lugares sagrados</h3><ul><li>Ombros e joelhos cobertos em igrejas, no Muro e em mesquitas.</li><li>Homens cobrem a cabeça no Muro.</li><li>Pergunte antes de fotografar pessoas rezando.</li></ul></div>'+
   (V.clima ? '<div class="card"><h3>'+ic('sun')+'Clima em '+mesDaViagem+'</h3><ul><li>Em média, entre '+V.clima.min+' °C e '+V.clima.max+' °C.</li>'+(V.clima.min<12?'<li>Noites frias: leve um casaco quente.</li>':'')+(V.clima.max>=28?'<li>Sol forte: chapéu, protetor e água o dia todo.</li>':'')+([11,12,1,2,3].includes(V.clima.mes)?'<li>Pode chover. Leve guarda-chuva pequeno.</li>':'')+'<li>Use tênis confortável: a Cidade Antiga é toda de pedra.</li></ul></div>' : '<div class="card"><h3>'+ic('sun')+'Clima</h3><ul><li>Verão (junho a setembro): quente e seco. Inverno (dezembro a fevereiro): frio e com chuva.</li><li>Primavera e outono são amenos, com noites frescas.</li><li>Use tênis confortável: a Cidade Antiga é toda de pedra.</li></ul></div>')+
   '</div><div class="warnbox"><b>Shabat: o que muda na sexta e no sábado</b><br>Do pôr do sol de sexta até a noite de sábado, quase todo o transporte público para e muitas lojas fecham. Encaixe o dia 6 numa sexta-feira: ele termina cedo e acaba no Muro na chegada do Shabat. No sábado, abrem os restaurantes dos bairros Cristão e Armênio, e para o aeroporto só de transfer ou táxi.</div>'+
   '<div class="warnbox" style="background:var(--chip);color:var(--ink)"><b>Segurança e avisos oficiais</b><br>Antes de viajar e durante a viagem, confira os avisos do Itamaraty para Israel e se cadastre no consulado. Os telefones de emergência estão na página @@PG:emergencia@@.</div></div>'+foot()+'</section>';
  // Mala
  S.mala='<section class="page">'+head('Pré-viagem')+'<div class="in"><div><span class="kick">Lista de mala</span><h2 class="t" style="margin-top:2mm">Para 7 dias'+(mesDaViagem?' em '+mesDaViagem:'')+'</h2></div><div class="cols3">'+
   [['Documentos',[['Passaporte'],['ETA-IL impressa'],['Seguro viagem impresso'],['Reservas de hotel e passeios'],['Cartões e um pouco de shekel']]],
    ['Roupas',[['Calças e saias abaixo do joelho'],['Blusas que cubram os ombros'],['Casaco leve e um mais quente'],['Lenço ou xale'],['Tênis confortável']]],
    ['Outros',[['Adaptador de tomada'],['Carregador portátil'],['Guarda-chuva pequeno'],['Garrafa de água'],['Remédios de uso pessoal']]]
   ].map(c=>'<div class="card"><h3>'+c[0]+'</h3>'+cl(c[1])+'</div>').join('')+'</div><div class="card"><h3>Anotações</h3></div><div class="notes"></div></div>'+foot()+'</section>';
  // Dias
  S.dias=DAYS.map((d,i)=>{const e=EXTRA[i];
   return '<section class="page"><div class="dayhead" style="background-image:url(/roteiros/jerusalem/'+d.img+'.jpg)">'+head('Dia '+(i+1)+' de 7',true)+'<div class="tt"><small>'+d.d+'</small><h2>'+d.t+'</h2></div></div><div class="in" style="padding-top:5mm;gap:4.5mm"><div class="meta"><div><small>'+(V.dias ? 'Gasto previsto para '+(V.pessoas>1?V.pessoas+' pessoas':'1 pessoa') : 'Gasto previsto por pessoa')+'</small><b>'+d.gasto+'</b></div><div><small>Segurança da área</small><b class="stars">'+'★'.repeat(d.seg)+'<span style="color:var(--line)">'+'★'.repeat(5-d.seg)+'</span></b></div><div><small>Região</small><b style="font-size:11pt">'+d.bairro+'</b></div></div><div class="read"><span class="kick">Leitura do dia · '+e.ler[0]+'</span><p>'+e.ler[1]+'</p></div><div class="stops">'+d.stops.map(s=>'<div class="stop"><div class="h">'+s[0]+'</div><div class="c"><b>'+(s[4]?'<a class="maps" href="'+esc(linkMaps(s[4]))+'">'+s[1]+' ↗</a>':s[1])+'</b><p>'+s[2]+'</p><div class="g">'+s[3].map(g=>'<span>'+g+'</span>').join('')+'</div></div>'+(s[4]?'<a class="qr" href="'+esc(linkMaps(s[4]))+'">'+qr(s[4])+'</a>':'<span></span>')+'</div>').join('')+'</div><div class="two2"><div class="mini"><b>Onde comer</b>'+e.comer.map(c=>'<p>'+c[0]+'<small>'+c[1]+'</small></p>').join('')+'</div><div class="mini"><b>Se chover</b><p>'+e.chuva+'</p></div></div><span class="kick" style="color:var(--mut)">Anotações do dia</span><div class="notes" style="margin-bottom:0;min-height:0;flex:1 1 0"></div><div class="tip">'+ic('spark')+'<span><b>'+d.tip[0]+'</b>'+d.tip[1]+'</span></div></div>'+foot()+'</section>';
  });
  // Guias
  S.guias='<section class="page">'+head('Guias e passeios')+'<div class="in"><div><span class="kick">Para contratar se quiser</span><h2 class="t" style="margin-top:2mm">Empresas de guia e passeio mais conhecidas</h2><p class="mut" style="margin-top:2mm">Lista feita com IA a partir das empresas mais citadas por viajantes. Não temos parceria com elas. Confira avaliações recentes antes de contratar.</p></div><table class="gt"><thead><tr><th>Passeio</th><th>Empresas mais conhecidas</th><th>Faixa</th><th>Dia</th></tr></thead><tbody>'+
   [['Caminhada pela Cidade Antiga','Tour a pé em grupo, com gorjeta no final','Sandemans · Abraham Tours','$','1 ou 2'],
    ['Mar da Galileia em um dia','Saída de Jerusalém, ônibus e guia','Abraham Tours · Bein Harim · Tourist Israel','$$','4'],
    ['Belém com guia local','Evita o transporte e o posto de controle por conta própria','Abraham Tours · Bein Harim','$$','5'],
    ['Guia particular em português','Para grupos de igreja ou família','Busque guias licenciados em GetYourGuide ou Viator','$$$','qualquer'],
    ['Transfer para o aeroporto','Essencial no sábado','Sherut (táxi compartilhado) ou transfer privado','$','7']
   ].map(r=>'<tr><td><b>'+r[0]+'</b><small>'+r[1]+'</small></td><td>'+r[2]+'</td><td class="pr">'+r[3]+'</td><td>'+r[4]+'</td></tr>').join('')+'</tbody></table><div class="warnbox"><b>Como escolher</b><br>Prefira guias com licença do Ministério do Turismo de Israel, avaliações dos últimos 6 meses e cancelamento grátis até 24 horas antes.</div><p class="mut" style="font-size:8.5pt">$ até R$ 150 por pessoa · $$ de R$ 150 a R$ 600 · $$$ acima de R$ 600 (valores de referência)</p></div>'+foot()+'</section>';
  // Emergência
  S.emergencia='<section class="page">'+head('Na viagem')+'<div class="in"><div><span class="kick">Guarde esta página</span><h2 class="t" style="margin-top:2mm">Emergência e frases úteis</h2></div><div class="em" style="grid-template-columns:repeat(4,1fr)"><div><b>100</b>Polícia</div><div><b>101</b>Ambulância</div><div><b>102</b>Bombeiros</div><div><b>104</b>Alertas de segurança</div></div><div class="card"><h3>'+ic('shield')+'Embaixada do Brasil em Tel Aviv</h3><p>Em caso de perda do passaporte ou emergência grave, ligue para o plantão consular: <b>+972 54 803 5858</b>. Endereço: Rua Yehuda Halevi, 23, 30º andar, Tel Aviv, CEP 6513601. Telefone geral: +972 3 797 1500.</p><p>Plantão consular do Itamaraty, em Brasília, 24 horas: <b>+55 61 98260-0610</b>. O 104 é a central do Comando da Frente Interna de Israel, para alertas e abrigos.</p></div><table class="phr"><tbody>'+
   M.frases.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody></table></div>'+foot()+'</section>';
  // Contracapa
  S.contracapa='<section class="page dark back">'+LOGO_E+'<h2 style="font-size:28pt">Boa viagem, '+PRIMEIRO+'.</h2><p style="opacity:.75;max-width:120mm">Quando voltar, conte para a gente como foi. Sua próxima viagem também pode caber no bolso.</p><p style="opacity:.6;font-size:9pt">vaidarviagem.com.br</p><p style="position:absolute;bottom:10mm;left:16mm;right:16mm;opacity:.45;font-size:7pt">Fotos: Wikimedia Commons. Jerusalem-2013(2) View of the Dome of the Rock; Western Wall at night (20063); Catholicon, Church of the Holy Sepulchre, Jerusalem1; Old Olive trees in the Garden of Gethsemane, 10; View of the Sea of Galilee; Mercado Mahane Yehuda Jerusalén 2 (CC BY-SA 3.0/4.0); Interior of the Church of the Nativity, Bethlehem (CC BY-SA 3.0).</p></section>';
  // Ordem do PDF. Cada item: [id, título no sumário, grupo, html]. Os dias e os lugares sagrados são várias páginas.
  const ORDEM = [
    ["capa", null, null, S.capa], ["sumario", null, null, null],
    ["resumo", "Resumo da viagem", "Antes de ir", S.resumo], ["ficha", "Ficha da viagem", "Antes de ir", M.ficha],
    ["mapa", "Mapa da Cidade Antiga", "Antes de ir", S.mapa], ["quando", "O que fazer e quando", "Antes de ir", S.quando],
    ["regras", "Dinheiro, costumes e clima", "Antes de ir", S.regras], ["mala", "Lista de mala", "Antes de ir", S.mala],
    ["ficar", "Onde ficar", "Antes de ir", M.ficar], ["locomover", "Como se locomover", "Antes de ir", M.locomover],
    ["horarios", "Horários e dias fechados", "Antes de ir", M.horarios], ["historia", "Linha do tempo de Jerusalém", "Antes de ir", M.historia],
    ...S.dias.map((d, i) => ["dia" + (i + 1), "Dia " + (i + 1) + ": " + DAYS[i].t, "A viagem, dia a dia", d]),
    ...M.sacros.map((d, i) => ["sacro" + (i + 1), ["Santo Sepulcro", "Muro das Lamentações", "Getsêmani", "Basílica da Natividade", "Cafarnaum", "Rio Jordão"][i], "Lugares sagrados", d]),
    ["leituras", "Leituras da peregrinação", "Lugares sagrados", M.leituras], ["passaporte", "Passaporte do peregrino", "Lugares sagrados", M.passaporte],
    ["orcamento", "Orçamento dia a dia", "Na viagem", M.orcamento], ["comida", "Comida típica", "Na viagem", M.comida],
    ["golpes", "Cuidados e golpes comuns", "Na viagem", M.golpes], ["fotos", "Fotos para não deixar de tirar", "Na viagem", M.fotos],
    ["extras1", "Se sobrar: Mar Morto e Massada", "Na viagem", M.extras1], ["extras2", "Se sobrar: Tel Aviv, Jaffa e Ein Karem", "Na viagem", M.extras2],
    ["guias", "Guias e passeios", "Na viagem", S.guias], ["emergencia", "Emergência e frases úteis", "Na viagem", S.emergencia],
    ["cartao", "Cartão para mostrar ao taxista", "Na viagem", M.cartao], ["diario", "Diário da viagem", "Na viagem", M.diario],
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
  // "Veja a página X": o número vem da ordem do sumário, nunca fixo no texto.
  const comNumeros = paginas.replace(/@@PG:([a-z0-9]+)@@/g, (_, id) => String(ORDEM.findIndex(p => p[0] === id) + 1));
  return CABECA + '<div class="doc" id="doc">' + comNumeros + "</div>\n</body></html>";
}
