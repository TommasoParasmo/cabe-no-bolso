// Partes comuns dos PDFs de roteiro (Jerusalém e os outros destinos): estilo das páginas A4, QR code,
// leitura dos valores da simulação e formatação.

import qrcode from "qrcode-generator";

export const CSS_MAIS = `
.ficha{display:grid;gap:0}
.ficha div{display:grid;grid-template-columns:52mm 1fr;gap:4mm;border-bottom:1px solid var(--line);padding:3.2mm 0;font-size:9.5pt}
.ficha b{color:var(--deep)}
.ficha small{display:block;color:var(--mut);font-size:8pt}
.ficha span{border-bottom:1px dotted var(--line)}
.bairros{display:grid;gap:4mm}
.bairro{background:var(--paper);border-radius:4mm;padding:4.5mm 5mm;display:grid;grid-template-columns:1fr 1fr;gap:2mm 6mm}
.bairro h3{grid-column:1/-1;font-size:13pt}
.bairro .quem{grid-column:1/-1;font-size:9pt;color:var(--acc);font-weight:700}
.bairro ul{margin:0;padding-left:4.5mm;font-size:9pt;display:grid;gap:1mm}
.bairro em{font-style:normal;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.estilos{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.estilos div{background:var(--deep);color:var(--on);border-radius:4mm;padding:4mm 5mm}
.estilos small{display:block;opacity:.7;font-size:8.5pt}
.estilos b{font:800 13pt var(--display);color:var(--gold)}
.tb{width:100%;border-collapse:collapse;font-size:8.8pt}
.tb th{text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);padding:1.8mm 2mm;border-bottom:1.5px solid var(--line)}
.tb td{padding:2.2mm 2mm;border-bottom:1px solid var(--line);vertical-align:top}
.tb td b{display:block}
.tb td small{color:var(--mut)}
.tb .vazio{border-bottom:1px dotted var(--mut);min-width:22mm}
.pratos{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 5mm}
.prato{border-bottom:1px solid var(--line);padding-bottom:2mm;font-size:9pt}
.prato b{font-size:10.5pt;color:var(--deep)}
.prato small{display:block;color:var(--mut)}
.linha{display:grid;gap:0;border-left:3px solid var(--gold);margin-left:20mm;padding-left:6mm}
.linha div{position:relative;padding:1.8mm 0;font-size:9.5pt}
.linha b{position:absolute;left:-30mm;width:22mm;text-align:right;font:800 10pt var(--display);color:var(--acc)}
.linha div::before{content:"";position:absolute;left:-8.4mm;top:3.2mm;width:2.6mm;height:2.6mm;border-radius:50%;background:var(--deep)}
.sacro .dayhead{height:62mm}
.sacro .passos{margin:0;padding-left:5mm;display:grid;gap:1.6mm;font-size:9.5pt}
.sacro .passos b{color:var(--deep)}
.hist{font-size:10pt;line-height:1.55}
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.trio div{background:var(--paper);border-radius:4mm;padding:4mm;font-size:9pt}
.trio b{display:block;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:var(--acc);margin-bottom:1mm}
.carimbos{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.carimbos div{border:1.5px dashed var(--line);border-radius:3mm;height:42mm;padding:2.5mm;font-size:8.5pt;display:flex;flex-direction:column;justify-content:space-between}
.carimbos b{color:var(--deep);font-size:9pt}
.carimbos small{color:var(--mut)}
.taxi{border:2px solid var(--deep);border-radius:5mm;padding:7mm;display:grid;gap:4mm;text-align:center}
.taxi .he,.taxi .ar{font:700 22pt/1.3 "Noto Sans Hebrew","Noto Sans Arabic","Arial",sans-serif;color:var(--deep)}
.taxi .end{border-bottom:1.5px dotted var(--mut);height:12mm}
.dir{direction:rtl;unicode-bidi:isolate;font-family:"Noto Sans Hebrew","Noto Sans Arabic","Arial",sans-serif}
.diario{display:grid;gap:3mm}
.diario>div{border-bottom:1px solid var(--line);padding-bottom:2mm;display:grid;grid-template-columns:18mm 1fr;gap:3mm}
.diario b{font:800 11pt var(--display);color:var(--acc)}
.diario p{font-size:8.5pt;color:var(--mut)}
.diario .ln{height:20mm;background:repeating-linear-gradient(transparent 0 5.2mm,var(--line) 5.2mm 5.5mm)}
.sumario{columns:2;column-gap:8mm}
.sumario a{break-inside:avoid;display:flex;gap:3mm;align-items:baseline;padding:1.6mm 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:9pt}
.sumario a span{flex:1}
.sumario a i{font-style:normal;color:var(--mut);font-size:8.5pt}
.sumario a b{font:800 10pt var(--display);color:var(--acc);min-width:9mm;text-align:right}
.sumario h3{break-after:avoid;font-size:8.5pt;text-transform:uppercase;letter-spacing:.12em;color:var(--mut);margin:4mm 0 1mm}
.maps{color:var(--acc);text-decoration:none;border-bottom:1px solid currentColor}
.stop{grid-template-columns:16mm 1fr 18mm}
.qr{display:block;width:18mm;height:18mm;align-self:start}
.qr svg{width:100%;height:100%;display:block}
#emergencia .phr td{padding:.8mm 3mm;font-size:8.6pt}
#emergencia .in{gap:4mm}
#horarios .tb td{padding:1.5mm 2mm}
`;

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// QR code (SVG) que abre o lugar no Google Maps: no papel, a câmera do celular leva direto ao mapa.
// O QR usa o endereço curto do Maps e correção "L" para ter menos módulos e ler bem impresso.
export const qr = lugar => {
  const q = qrcode(0, "L");
  const url = "https://maps.google.com/?q=" + encodeURIComponent(lugar);
  q.addData(url);
  q.make();
  return q.createSvgTag({ cellSize: 1, margin: 0, scalable: true });
};
export const linkMaps = lugar => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(lugar);
export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
export const num = v => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null);

// "AAAA-MM-DD" do primeiro dia da viagem, para dar data e dia da semana a cada dia (o Shabat muda o roteiro).
export const lerData = t => {
  if (typeof t !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(t + "T12:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
};
// Clima do mês da viagem, como o app já calcula (server/clima.js): { mes: 1 a 12, min, max } em °C.
export const lerClima = c => {
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

export const cabeca = (titulo, capa) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Roteiro Detalhado + Pré-viagem · ${titulo}</title>
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
.cover{background:var(--deep) url(${capa}) center/cover;color:var(--on)}
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
${CSS_MAIS}</style>
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
