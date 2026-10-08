// Pix do roteiro completo. Com { pedido, email } cria a cobrança; com { id } diz se já foi paga.
import { pixLigado, criarPix, situacaoPix, guardarPedido, PixInvalido } from "../../server/pix.js";
import { EntradaInvalida } from "../../server/veredito.js";

export async function onRequestPost({ request, env }) {
  if (!pixLigado(env)) return json({ erro: "O pagamento ainda não está ligado." }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    if (body?.id) return json(await situacaoPix(body.id, env));
    const pix = await criarPix(body, env);
    // Guarda o pedido 30 dias para recuperar em outro aparelho. Se o KV falhar, o Pix segue valendo.
    await guardarPedido(pix.id, body, env).catch(e => console.error("pix: pedido não guardado", e));
    return json(pix);
  } catch (e) {
    if (e instanceof PixInvalido || e instanceof EntradaInvalida) return json({ erro: e.message }, 400);
    console.error("pix", e);
    return json({ erro: "Não deu para falar com o Mercado Pago agora. Tente de novo." }, 502);
  }
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
