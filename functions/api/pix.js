// Pix do roteiro completo. Com { ref, email } cria a cobrança; com { id } diz se já foi paga.
import { pixLigado, criarPix, situacaoPix, PixInvalido } from "../../server/pix.js";

export async function onRequestPost({ request, env }) {
  if (!pixLigado(env)) return json({ erro: "O pagamento ainda não está ligado." }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    return json(body?.id ? await situacaoPix(body.id, env) : await criarPix(body, env));
  } catch (e) {
    if (e instanceof PixInvalido) return json({ erro: e.message }, 400);
    console.error("pix", e);
    return json({ erro: "Não deu para falar com o Mercado Pago agora. Tente de novo." }, 502);
  }
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
