// Entrega do PDF comprado: monta o HTML do roteiro (nome e valores guardados na compra) e transforma em PDF
// pelo Browser Rendering da Cloudflare (API REST, o mesmo Chromium dos PDFs de amostra).
// Liga com CF_ACCOUNT_ID e CF_BROWSER_TOKEN (token só com a permissão "Browser Rendering - Edit") na Cloudflare.
// Sem eles, entrega a página do roteiro para a pessoa salvar como PDF pelo navegador (Imprimir > Salvar como PDF).
// O PDF pronto fica no KV (pdf:<ORD>) para baixar de novo sem gastar a cota do Browser Rendering.
import { roteiroJerusalem } from "./pdf/jerusalem.js";
import { roteiroDestino } from "./pdf/destinos/index.js";

export const SITE = "https://vaidarviagem.com.br/";
const GUARDA_PDF_DIAS = 90;
const chavePdf = id => `pdf:${String(id).toUpperCase()}`;

export const pdfLigado = env => Boolean(env?.CF_ACCOUNT_ID && env?.CF_BROWSER_TOKEN);

// HTML do roteiro com os endereços das fotos apontando para o site (o Browser Rendering abre o HTML fora dele).
export function htmlDaCompra({ slug, nome, valores }, comBotao = false) {
  const html = slug === "jerusalem" ? roteiroJerusalem(nome, valores) : roteiroDestino(slug, nome, valores);
  const base = `<base href="${SITE}">`;
  // Na página para salvar como PDF: um botão que some na impressão.
  const botao = comBotao
    ? `<style>@media print{.salvar{display:none!important}}</style><div class="salvar" style="position:sticky;top:0;z-index:9;background:#0D3532;color:#fff;padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;font:600 15px system-ui"><span>Para guardar o seu roteiro, toque em <b>Salvar PDF</b> e escolha "Salvar como PDF".</span><button onclick="print()" style="background:#E2B23F;color:#0D3532;border:0;border-radius:10px;padding:10px 18px;font:700 15px system-ui;cursor:pointer">Salvar PDF</button></div>`
    : "";
  return html.replace(/<head>/i, `<head>${base}`).replace(/<body([^>]*)>/i, `<body$1>${botao}`);
}

// Limite de uso do Browser Rendering (429): espera o que a Cloudflare pede (até 10 s) e tenta mais uma vez,
// para o comprador receber o arquivo e não a página de salvar como PDF.
const ESPERA_MAX_MS = 10000;
export async function gerarPdf(html, env, fetchFn = globalThis.fetch, esperar = ms => new Promise(ok => setTimeout(ok, ms))) {
  let r = await pedirPdf(html, env, fetchFn);
  if (r.status === 429) {
    const seg = Number(r.headers.get("retry-after"));
    await esperar(Math.min(ESPERA_MAX_MS, seg > 0 ? seg * 1000 : 3000));
    r = await pedirPdf(html, env, fetchFn);
  }
  const tipo = r.headers.get("content-type") || "";
  if (!r.ok || !tipo.includes("pdf")) throw new Error(`Browser Rendering ${r.status}`);
  return r.arrayBuffer();
}

function pedirPdf(html, env, fetchFn) {
  return fetchFn(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-run/pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CF_BROWSER_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({
      html,
      gotoOptions: { waitUntil: "networkidle0", timeout: 45000 },
      pdfOptions: { format: "a4", printBackground: true, preferCSSPageSize: true }
    })
  });
}

// O PDF da compra: do KV, ou gerado agora e guardado. Devolve null se o Browser Rendering não estiver ligado.
export async function pdfDaCompra(id, compra, env, fetchFn = globalThis.fetch) {
  if (!pdfLigado(env)) return null;
  const guardado = await env.LEADS?.get(chavePdf(id), "arrayBuffer").catch(() => null);
  if (guardado) return guardado;
  const pdf = await gerarPdf(htmlDaCompra(compra), env, fetchFn);
  await env.LEADS?.put(chavePdf(id), pdf, { expirationTtl: GUARDA_PDF_DIAS * 86400 }).catch(e => console.error("entrega: PDF não guardado", e?.message));
  return pdf;
}

// Nome do arquivo: "roteiro-orlando-maria.pdf" (só letras simples).
export function nomeArquivo({ slug, nome }) {
  const primeiro = String(nome).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)[0] || "viagem";
  return `roteiro-${slug}-${primeiro}.pdf`;
}
