import Anthropic from "@anthropic-ai/sdk";
import { gerarRoteiro, LimiteAtingido, Demorou } from "../../server/roteiro.js";
import { tetoDoDia, TetoAtingido, lerOrigem } from "../../server/uso.js";
import { conferirTurnstile, RoboSuspeito } from "../../server/turnstile.js";
import { EntradaInvalida } from "../../server/veredito.js";
import { pixLigado, liberarDetalhado, contarGeracao, PixInvalido, PixNaoPago, SemGeracoes } from "../../server/pix.js";

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
      // O pedido é o guardado com o pagamento (não o do navegador), e cada pagamento tem gerações contadas.
      const pedido = await liberarDetalhado(body.pagamento, body, env);
      return json(await gerarRoteiro(pedido, env, null, null, globalThis.fetch, { completo: true, antesDeGerar: contarGeracao(body.pagamento, env), origem: lerOrigem(body) }));
    }
    // completoAVenda: o app só oferece o roteiro completo quando o Pix está ligado.
    const ip = request.headers.get("CF-Connecting-IP");
    // Turnstile: só liga quando existir o TURNSTILE_SECRET na Cloudflare.
    await conferirTurnstile(body?.turnstile, ip, env);
    return json({ ...(await gerarRoteiro(body, env, null, ip, globalThis.fetch, { antesDeGerar: tetoDoDia(env), origem: lerOrigem(body) })), completoAVenda: pixLigado(env) });
  } catch (e) {
    if (e instanceof EntradaInvalida || e instanceof PixInvalido) return json({ erro: e.message }, 400);
    if (e instanceof PixNaoPago) return json({ erro: e.message }, 402);
    if (e instanceof SemGeracoes) return json({ erro: e.message }, 429);
    if (e instanceof LimiteAtingido || e instanceof TetoAtingido) return json({ erro: e.message }, 429);
    if (e instanceof RoboSuspeito) return json({ erro: e.message }, 403);
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
