// Turnstile da Cloudflare (o "não sou robô" invisível) no roteiro grátis e no Pix.
// Desligado enquanto não existir o secret TURNSTILE_SECRET na Cloudflare; o app manda o token em "turnstile"
// quando a chave do site (TURNSTILE_SITE_KEY em public/app/app.js) estiver preenchida. Ligar os dois juntos.
export class RoboSuspeito extends Error {}

export async function conferirTurnstile(token, ip, env, fetchFn = globalThis.fetch) {
  if (!env?.TURNSTILE_SECRET) return;
  const falhou = () => new RoboSuspeito("Não conseguimos confirmar que é você. Recarregue a página e tente de novo.");
  if (!token || String(token).length > 2048) throw falhou();
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", String(token));
  if (ip) form.append("remoteip", ip);
  const r = await fetchFn("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const d = await r.json().catch(() => ({}));
  if (!d.success) throw falhou();
}
