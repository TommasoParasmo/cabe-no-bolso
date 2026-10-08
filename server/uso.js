// Tokens gastos em cada roteiro, para o Financeiro saber o custo por roteiro e por venda.
// Uma linha "uso:" no log da Cloudflare por roteiro e a soma do dia no KV (chave uso:AAAA-MM-DD).
// Sem dados pessoais: só data, tipo (grátis ou Detalhado), modelo, tokens e custo estimado.

// US$ por milhão de tokens (entrada, saída). Estimativa: confira na tabela de preços de cada empresa.
// Dá para trocar sem mexer no código pela variável PRECOS_IA na Cloudflare, no mesmo formato JSON.
export const PRECOS = {
  "gemini-3.8-flash": { entrada: 0.5, saida: 3 },
  "claude-sonnet-5-5": { entrada: 3, saida: 15 }
};
const VALIDADE_KV = 400 * 86400;

const precos = env => {
  try { return { ...PRECOS, ...(env?.PRECOS_IA ? JSON.parse(env.PRECOS_IA) : {}) }; } catch { return PRECOS; }
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
    claude(modelo, u) {
      if (u) chamadas.push({ modelo, entrada: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), saida: u.output_tokens || 0 });
    }
  };
}

// Junta por modelo e calcula o custo.
export function resumoUso(uso, env) {
  const tabela = precos(env);
  const modelos = {};
  for (const c of uso.chamadas) {
    const m = modelos[c.modelo] ||= { chamadas: 0, entrada: 0, saida: 0, usd: 0 };
    m.chamadas++; m.entrada += c.entrada; m.saida += c.saida;
  }
  let usd = 0;
  for (const [nome, m] of Object.entries(modelos)) {
    const p = tabela[nome] || { entrada: 0, saida: 0 };
    m.usd = Number(((m.entrada * p.entrada + m.saida * p.saida) / 1e6).toFixed(6));
    usd += m.usd;
  }
  return { modelos, usd: Number(usd.toFixed(6)) };
}

// Grava a linha no log e soma no dia. Falha aqui nunca derruba o roteiro.
export async function registrarUso(uso, { tipo, resultado }, env, agora = new Date()) {
  if (!uso.chamadas.length) return null;
  const { modelos, usd } = resumoUso(uso, env);
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
