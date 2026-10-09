// Compra do PDF por destino (checkout no site). Ações no corpo:
// { acao: "preco", destino }                        → preço de agora (e o fim da promoção)
// { acao: "criar", destino, nome, email, valores, forma: "pix" | "cartao", cartao?, utm?, meta?, turnstile? } → cria o pagamento
// { acao: "situacao", id, chave }                   → "pago", "esperando" ou "expirado"
// { acao: "recuperar", id, email }                  → chave nova para baixar o PDF em outro aparelho
import { compraLigada, precoDe, criarCompra, situacaoCompra, recuperarCompra, dentroDoLimite, CompraInvalida, NaoPago } from "../../server/compra.js";
import { conferirTurnstile, RoboSuspeito } from "../../server/turnstile.js";

const MAX_CORPO = 8_000;

export async function onRequestPost({ request, env }) {
  if (!compraLigada(env)) return json({ erro: "A compra ainda não está ligada." }, FALHA);
  let body;
  try {
    const texto = await request.text();
    if (texto.length > MAX_CORPO) return json({ erro: "Pedido grande demais." }, 413);
    body = JSON.parse(texto);
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  const ip = request.headers.get("CF-Connecting-IP");
  try {
    switch (body?.acao) {
      case "preco": return json({ ...precoDe(String(body.destino ?? ""), env), chavePublica: env.MP_PUBLIC_KEY || null });
      case "situacao": return json(await situacaoCompra(body.id, body.chave, env));
      case "recuperar":
        if (!(await dentroDoLimite("recuperar-pdf", ip, 10))) return json({ erro: "Muitas tentativas agora. Espere um pouco e tente de novo." }, 429);
        return json(await recuperarCompra(body, env));
      case "criar":
        await conferirTurnstile(body.turnstile, ip, env);
        if (!(await dentroDoLimite("compra", ip))) return json({ erro: "Muitos pagamentos gerados agora. Espere um pouco e tente de novo." }, 429);
        return json(await criarCompra(body, env, globalThis.fetch, { ip, ua: request.headers.get("user-agent") }));
      default: return json({ erro: "Pedido inválido." }, 400);
    }
  } catch (e) {
    if (e instanceof CompraInvalida || e instanceof NaoPago) return json({ erro: e.message }, 400);
    if (e instanceof RoboSuspeito) return json({ erro: e.message }, 403);
    console.error("compra", e?.message);
    return json({ erro: "Não deu para falar com o Mercado Pago agora. Tente de novo." }, FALHA);
  }
}

// Falha nossa ou do Mercado Pago: 424, não 5xx (a Cloudflare troca 502/503/504 pela página de erro dela).
const FALHA = 424;
const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
