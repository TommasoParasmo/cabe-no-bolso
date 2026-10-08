// Recupera o Roteiro Detalhado pago em outro aparelho: número do pedido + e-mail do Pix.
// Confere no Mercado Pago e refaz o roteiro com o pedido guardado (vem do cache se ainda estiver lá).
import { gerarRoteiro, Demorou } from "../../server/roteiro.js";
import { EntradaInvalida } from "../../server/veredito.js";
import { pixLigado, recuperarPedido, podeRecuperar, PixInvalido, PixNaoPago, PedidoNaoGuardado } from "../../server/pix.js";

export async function onRequestPost({ request, env }) {
  if (!pixLigado(env) || (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY)) return json({ erro: "A recuperação do roteiro está fora do ar no momento." }, FALHA);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    if (!(await podeRecuperar(request.headers.get("CF-Connecting-IP")))) return json({ erro: "Muitas tentativas hoje. Tente amanhã ou escreva para contato@vaidarviagem.com.br." }, 429);
    const { pedido, viagem, valor } = await recuperarPedido(body, env);
    const roteiro = await gerarRoteiro(pedido, env, null, null, globalThis.fetch, { completo: true });
    return json({ id: String(body.id).trim().toUpperCase(), pedido, viagem, roteiro, valor });
  } catch (e) {
    if (e instanceof PixInvalido || e instanceof EntradaInvalida) return json({ erro: e.message }, 400);
    if (e instanceof PixNaoPago) return json({ erro: e.message }, 402);
    if (e instanceof PedidoNaoGuardado) return json({ erro: e.message }, 404);
    if (e instanceof Demorou) return json({ erro: e.message }, FALHA);
    console.error("recuperar", e);
    return json({ erro: "Algo falhou ao recuperar o roteiro. Tente de novo." }, FALHA);
  }
}

// Falha do nosso lado ou de quem chamamos (IA, Mercado Pago, prazo): 424, não 5xx. No domínio, a Cloudflare
// troca as respostas 502/503/504 das funções pela página de erro dela, e a mensagem para a pessoa sumia.
const FALHA = 424;

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
