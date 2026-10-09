// Download do PDF comprado: /api/pdf?id=<ORD>&chave=<chave da compra>.
// Confere no Mercado Pago que a compra foi paga; entrega o PDF (Browser Rendering) ou, sem ele, a página para salvar como PDF.
import { compraLigada, compraPaga, CompraInvalida, NaoPago } from "../../server/compra.js";
import { pdfDaCompra, htmlDaCompra, nomeArquivo } from "../../server/entrega.js";

export async function onRequestGet({ request, env }) {
  if (!compraLigada(env)) return texto("A entrega do roteiro está fora do ar no momento. Tente de novo em alguns minutos.", 424);
  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") ?? "").toUpperCase();
  try {
    const compra = await compraPaga(id, url.searchParams.get("chave"), env);
    const pdf = await pdfDaCompra(id, compra, env).catch(e => { console.error("pdf", e?.message); return null; });
    if (pdf) {
      return new Response(pdf, { headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${nomeArquivo(compra)}"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex"
      } });
    }
    return new Response(htmlDaCompra(compra, true), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-robots-tag": "noindex" } });
  } catch (e) {
    if (e instanceof NaoPago) return texto("Esse pagamento ainda não foi confirmado. Volte para a página da compra e espere a confirmação.", 402);
    if (e instanceof CompraInvalida) return texto("Não achamos esse pedido. Use o link da página da compra ou recupere com o número do pedido e o e-mail.", 404);
    console.error("pdf", e?.message);
    return texto("Não deu para conferir o pagamento agora. Tente de novo em alguns minutos.", 424);
  }
}

const texto = (msg, status) => new Response(msg, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
