// Cadastro de e-mail para baixar o roteiro. Fica no KV da Cloudflare (binding LEADS), uma chave por e-mail.
// Guarda só o necessário: e-mail, se aceitou novidades, destinos e datas. Nada de IP.
import { lerCache, gravarCache } from "./cache.js";

export class LeadInvalido extends Error {}

const EMAIL = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const LIMITE_IP_DIA = 10;

export async function guardarLead(body, env = {}, ip = null) {
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) throw new LeadInvalido("Confira o e-mail.");
  const destino = String(body?.destino ?? "").replace(/[\u0000-\u001f<>"]/g, " ").trim().slice(0, 80);
  if (!env.LEADS) {
    // Sem o banco ligado, a pessoa baixa mesmo assim; o aviso fica no log.
    console.error("lead: KV LEADS não configurado");
    return { ok: true };
  }
  // Freio contra robô enchendo o banco (o KV grátis tem limite de gravações por dia).
  if (ip) {
    const chave = `https://cache.cabenobolso/lead-limite?${new URLSearchParams({ ip, d: new Date().toISOString().slice(0, 10) })}`;
    const n = (await lerCache(chave))?.n || 0;
    if (n >= LIMITE_IP_DIA) return { ok: true };
    await gravarCache(chave, { n: n + 1 }, 86400);
  }
  const agora = new Date().toISOString();
  const antigo = await env.LEADS.get(email, "json").catch(() => null);
  await env.LEADS.put(email, JSON.stringify({
    email,
    // Vale a última escolha: quem desmarca deixa de receber.
    novidades: body?.novidades === true,
    destinos: [...new Set([...(antigo?.destinos || []), destino].filter(Boolean))].slice(-20),
    primeiro: antigo?.primeiro || agora,
    ultimo: agora
  }));
  return { ok: true };
}
