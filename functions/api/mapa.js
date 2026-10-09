// Download do mapa offline comprado: /api/mapa?id=<ORD>&chave=<chave da compra>.
// Confere no Mercado Pago que a compra foi paga e levou o mapa; entrega o KML do destino para abrir no Organic Maps.
import { compraLigada, mapaDaCompra, CompraInvalida, NaoPago } from "../../server/compra.js";

export async function onRequestGet({ request, env }) {
  if (!compraLigada(env)) return texto("A entrega do mapa está fora do ar no momento. Tente de novo em alguns minutos.", 424);
  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") ?? "").toUpperCase();
  try {
    const { slug, kml } = await mapaDaCompra(id, url.searchParams.get("chave"), env);
    return new Response(kml, { headers: {
      "content-type": "application/vnd.google-earth.kml+xml; charset=utf-8",
      "content-disposition": `attachment; filename="mapa-vai-dar-viagem-${slug}.kml"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex"
    } });
  } catch (e) {
    if (e instanceof NaoPago) return texto("Esse pagamento ainda não foi confirmado. Volte para a página da compra e espere a confirmação.", 402);
    if (e instanceof CompraInvalida) return texto("Não achamos o mapa desse pedido. Use o link da página da compra ou recupere com o número do pedido e o e-mail.", 404);
    console.error("mapa", e?.message);
    return texto("Não deu para conferir o pagamento agora. Tente de novo em alguns minutos.", 424);
  }
}

const texto = (msg, status) => new Response(msg, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
