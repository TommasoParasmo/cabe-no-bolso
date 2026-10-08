import Anthropic from "@anthropic-ai/sdk";
import { gerarRoteiro, LimiteAtingido } from "../../server/roteiro.js";
import { EntradaInvalida } from "../../server/veredito.js";
import { pixLigado, referencia, previa, roteiroGuardado, conferirPagamento, PixInvalido, PixNaoPago } from "../../server/pix.js";

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) return json({ erro: "O roteiro com IA ainda não está ligado." }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  try {
    if (!pixLigado(env)) return json(await gerarRoteiro(body, env, null, request.headers.get("CF-Connecting-IP")));
    // Pago: entrega o roteiro que a pessoa viu na prévia. Se ele saiu do cache, monta de novo
    // sem contar no limite do dia (ip null), porque a pessoa já pagou.
    if (body?.pagamento) {
      const ref = await conferirPagamento(body.pagamento, body, env);
      return json({ ...(await roteiroGuardado(ref) || await gerarRoteiro(body, env, null, null)), pago: true });
    }
    const roteiro = await gerarRoteiro(body, env, null, request.headers.get("CF-Connecting-IP"));
    return json(await previa(roteiro, await referencia(body)));
  } catch (e) {
    if (e instanceof EntradaInvalida || e instanceof PixInvalido) return json({ erro: e.message }, 400);
    if (e instanceof PixNaoPago) return json({ erro: e.message }, 402);
    if (e instanceof LimiteAtingido) return json({ erro: e.message }, 429);
    if (e instanceof Anthropic.RateLimitError) return json({ erro: "Muitos pedidos agora. Espere um pouco e tente de novo." }, 429);
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("roteiro: chave da Anthropic inválida");
      return json({ erro: "O roteiro com IA está fora do ar no momento." }, 503);
    }
    console.error("roteiro", e);
    return json({ erro: "Algo falhou ao montar o roteiro. Tente de novo." }, 502);
  }
}

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8" } });
