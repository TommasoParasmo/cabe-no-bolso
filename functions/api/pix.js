// Pix do roteiro completo. Com { pedido, email } cria a cobrança; com { id } diz se já foi paga.
import { pixLigado, criarPix, situacaoPix, guardarPedido, podeCriarPix, PixInvalido } from "../../server/pix.js";

// Corpo máximo: o pedido e a tela da viagem cabem folgados em 20 KB.
const MAX_CORPO = 20_000;
import { EntradaInvalida } from "../../server/veredito.js";

export async function onRequestPost({ request, env }) {
  if (!pixLigado(env)) return json({ erro: "O pagamento ainda não está ligado." }, FALHA);
  let body;
  try {
    const texto = await request.text();
    if (texto.length > MAX_CORPO) return json({ erro: "Pedido grande demais." }, 413);
    body = JSON.parse(texto);
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    if (body?.id) return json(await situacaoPix(body.id, env));
    if (!(await podeCriarPix(request.headers.get("CF-Connecting-IP")))) return json({ erro: "Muitos Pix gerados agora. Espere um pouco e tente de novo." }, 429);
    const pix = await criarPix(body, env);
    // Guarda o pedido 30 dias para recuperar em outro aparelho. Se o KV falhar, o Pix segue valendo.
    await guardarPedido(pix.id, body, env).catch(e => console.error("pix: pedido não guardado", e));
    return json(pix);
  } catch (e) {
    if (e instanceof PixInvalido || e instanceof EntradaInvalida) return json({ erro: e.message }, 400);
    console.error("pix", e);
    return json({ erro: "Não deu para falar com o Mercado Pago agora. Tente de novo." }, FALHA);
  }
}

// Falha do nosso lado ou de quem chamamos (IA, Mercado Pago, prazo): 424, não 5xx. No domínio, a Cloudflare
// troca as respostas 502/503/504 das funções pela página de erro dela, e a mensagem para a pessoa sumia.
const FALHA = 424;

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
