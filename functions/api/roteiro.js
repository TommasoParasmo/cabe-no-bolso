import Anthropic from "@anthropic-ai/sdk";
import { gerarRoteiro, LimiteAtingido, Demorou } from "../../server/roteiro.js";
import { EntradaInvalida } from "../../server/veredito.js";
import { pixLigado, conferirPagamento, PixInvalido, PixNaoPago } from "../../server/pix.js";

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) return json({ erro: "O roteiro com IA ainda não está ligado." }, FALHA);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    // Roteiro completo: só depois do Pix pago, e do mesmo pedido que foi pago. Não conta no limite do dia
    // (ip null), porque a pessoa já pagou; se a IA falhar, ela tenta de novo com o mesmo pagamento.
    if (body?.completo) {
      if (!pixLigado(env)) return json({ erro: "O Roteiro Detalhado ainda não está à venda." }, FALHA);
      await conferirPagamento(body.pagamento, body, env);
      // O conteúdo do roteiro completo (horários, dicas) é do thread do app; aqui só o pagamento libera.
      return json(await gerarRoteiro(body, env, null, null, globalThis.fetch, { completo: true }));
    }
    // completoAVenda: o app só oferece o roteiro completo quando o Pix está ligado.
    return json({ ...(await gerarRoteiro(body, env, null, request.headers.get("CF-Connecting-IP"))), completoAVenda: pixLigado(env) });
  } catch (e) {
    if (e instanceof EntradaInvalida || e instanceof PixInvalido) return json({ erro: e.message }, 400);
    if (e instanceof PixNaoPago) return json({ erro: e.message }, 402);
    if (e instanceof LimiteAtingido) return json({ erro: e.message }, 429);
    if (e instanceof Demorou) return json({ erro: e.message }, FALHA);
    if (e instanceof Anthropic.RateLimitError) return json({ erro: "Muitos pedidos agora. Espere um pouco e tente de novo." }, 429);
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("roteiro: chave da Anthropic inválida");
      return json({ erro: "O roteiro com IA está fora do ar no momento." }, FALHA);
    }
    console.error("roteiro", e);
    return json({ erro: "Algo falhou ao montar o roteiro. Tente de novo." }, FALHA);
  }
}

// Falha do nosso lado ou de quem chamamos (IA, Mercado Pago, prazo): 424, não 5xx. No domínio, a Cloudflare
// troca as respostas 502/503/504 das funções pela página de erro dela, e a mensagem para a pessoa sumia.
const FALHA = 424;

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
