// Tokens gastos em cada roteiro, para o Financeiro saber o custo por roteiro e por venda.
// Uma linha "uso:" no log da Cloudflare por roteiro e a soma do dia no KV (chave uso:AAAA-MM-DD).
// Sem dados pessoais: só data, tipo (grátis ou Detalhado), modelo, tokens e custo estimado.

// US$ por milhão de tokens (entrada, saída), conferidos pelo Financeiro em 08/10/2026
// (ai.google.dev/gemini-api/docs/pricing e a tabela da Anthropic). A saída do Gemini inclui o raciocínio.
// Dá para trocar sem mexer no código pela variável PRECOS_IA na Cloudflare, no mesmo formato JSON.
// Gemini 3.8 Flash: preço introdutório até 31/12/2026; a partir de 01/01/2027 (Brasília), o preço cheio.
const FIM_PROMO_GEMINI = Date.parse("2027-01-01T00:00:00-03:00");
export const precosEm = (agora = new Date()) => ({
  "gemini-3.8-flash": agora.getTime() < FIM_PROMO_GEMINI ? { entrada: 0.75, saida: 3.75 } : { entrada: 1.5, saida: 7.5 },
  "claude-sonnet-5-5": { entrada: 2, saida: 10 },
  // Consultas ao Google Maps feitas pelo Gemini (grounding): cobradas por consulta depois da cota grátis.
  "google-maps": { porMil: 25 }
});
const VALIDADE_KV = 400 * 86400;

const precos = (env, agora) => {
  try { return { ...precosEm(agora), ...(env?.PRECOS_IA ? JSON.parse(env.PRECOS_IA) : {}) }; } catch { return precosEm(agora); }
};

// Acumulador de um roteiro: cada chamada à IA soma aqui.
export function novoUso() {
  const chamadas = [];
  return {
    chamadas,
    // Gemini: usageMetadata da resposta. Os tokens de raciocínio (thoughts) são cobrados como saída.
    gemini(modelo, u) {
      if (u) chamadas.push({ modelo, entrada: u.promptTokenCount || 0, saida: (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0) });
    },
    // Claude: usage da resposta (com o cache de prompt, quando houver, contado como entrada).
    // Google Maps: consultas que o Gemini fez (sem a lista na resposta, conta 1 por pedido com o Maps ligado).
    maps(consultas) {
      if (consultas > 0) chamadas.push({ modelo: "google-maps", entrada: 0, saida: 0, consultas });
    },
    claude(modelo, u) {
      if (u) chamadas.push({ modelo, entrada: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), saida: u.output_tokens || 0 });
    }
  };
}

// Junta por modelo e calcula o custo.
export function resumoUso(uso, env, agora = new Date()) {
  const tabela = precos(env, agora);
  const modelos = {};
  for (const c of uso.chamadas) {
    const m = modelos[c.modelo] ||= { chamadas: 0, entrada: 0, saida: 0, usd: 0 };
    m.chamadas += c.consultas || 1; m.entrada += c.entrada; m.saida += c.saida;
  }
  let usd = 0;
  for (const [nome, m] of Object.entries(modelos)) {
    const p = tabela[nome] || {};
    m.usd = Number((((m.entrada * (p.entrada || 0) + m.saida * (p.saida || 0)) / 1e6) + m.chamadas * (p.porMil || 0) / 1000).toFixed(6));
    usd += m.usd;
  }
  return { modelos, usd: Number(usd.toFixed(6)) };
}

// Grava a linha no log e soma no dia. Falha aqui nunca derruba o roteiro.
export async function registrarUso(uso, { tipo, resultado }, env, agora = new Date()) {
  if (!uso.chamadas.length) return null;
  const { modelos, usd } = resumoUso(uso, env, agora);
  const dia = new Date(agora.getTime() - 3 * 3600e3).toISOString().slice(0, 10); // dia em Brasília
  const linha = { quando: agora.toISOString(), tipo, resultado, modelos, usd };
  console.log("uso: " + JSON.stringify(linha));
  if (!env?.LEADS) return linha;
  try {
    // Soma simples (ler, somar, gravar): dois roteiros no mesmo instante podem perder uma soma; o log tem tudo.
    const chave = `uso:${dia}`;
    const t = (await env.LEADS.get(chave, "json")) || { dia, roteiros: {}, modelos: {}, usd: 0 };
    t.roteiros[tipo] = (t.roteiros[tipo] || 0) + 1;
    for (const [nome, m] of Object.entries(modelos)) {
      const x = t.modelos[nome] ||= { chamadas: 0, entrada: 0, saida: 0, usd: 0 };
      x.chamadas += m.chamadas; x.entrada += m.entrada; x.saida += m.saida; x.usd = Number((x.usd + m.usd).toFixed(6));
    }
    t.usd = Number((t.usd + usd).toFixed(6));
    await env.LEADS.put(chave, JSON.stringify(t), { expirationTtl: VALIDADE_KV });
  } catch (e) { console.error("uso: não somou no KV", e?.message); }
  return linha;
}

// ---- Teto de gasto do dia (roteiro grátis) ----
// Antes de chamar a IA para um roteiro grátis, lê a soma do dia (uso:AAAA-MM-DD) e para se passou do teto.
// O limite por IP sozinho é fácil de furar (rajada, troca de IP); o teto segura o prejuízo de qualquer jeito.
// TETO_USD_DIA na Cloudflare muda o valor sem mexer no código.
export const TETO_USD_DIA = 15;
export class TetoAtingido extends Error {}
export const tetoDoDia = (env, agora = () => new Date()) => async () => {
  if (!env?.LEADS) return;
  const teto = Number(env.TETO_USD_DIA) > 0 ? Number(env.TETO_USD_DIA) : TETO_USD_DIA;
  const dia = new Date(agora().getTime() - 3 * 3600e3).toISOString().slice(0, 10);
  const t = await env.LEADS.get(`uso:${dia}`, "json").catch(() => null);
  if ((t?.usd || 0) >= teto) {
    console.error(`uso: teto do dia atingido (US$ ${t.usd} de ${teto}), roteiro grátis pausado`);
    throw new TetoAtingido("Muita gente montando roteiro hoje. Os roteiros novos voltam amanhã; os já prontos continuam abrindo.");
  }
};
