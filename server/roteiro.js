// Roteiro dia a dia com IA. Só roda quando a pessoa pede, e roteiros iguais vêm do cache.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ESTILOS, INTERESSES } from "../public/lib/dados.js";
import { acharDestino } from "../public/lib/custo.js";
import { lerCache, gravarCache } from "./cache.js";
import { EntradaInvalida } from "./veredito.js";

// Modelo mais barato da Anthropic, escolhido para manter o custo por roteiro em centavos.
const MODELO = "claude-haiku-4-5";
const SETE_DIAS = 7 * 86400;
// Roteiros novos (que chamam a IA) por IP por dia. Roteiros do cache não contam.
export const LIMITE_DIA = 5;

export class LimiteAtingido extends Error {}

const Roteiro = z.object({
  dias: z.array(z.object({
    dia: z.number().int(),
    titulo: z.string(),
    atividades: z.array(z.object({ periodo: z.string(), nome: z.string(), custo: z.number() }))
  })),
  dicas: z.array(z.string())
});

export function validarPedido(b) {
  const dest = acharDestino(b?.destino);
  if (!dest) throw new EntradaInvalida("Destino desconhecido.");
  const noites = Math.round(Number(b.noites));
  if (!(noites >= 1 && noites <= 30)) throw new EntradaInvalida("Número de noites inválido.");
  return {
    dest,
    dias: Math.min(noites + 1, 7),
    pessoas: Math.min(9, Math.max(1, Math.round(Number(b.pessoas)) || 2)),
    estilo: [0, 1, 2].includes(Number(b.estilo)) ? Number(b.estilo) : 1,
    interesses: (Array.isArray(b.interesses) ? b.interesses : []).filter(i => i in INTERESSES).sort(),
    // Arredonda para baixo em faixas de R$ 100: menos variações de pedido, mais acerto de cache.
    verba: Math.min(50000, Math.max(0, Math.floor(Number(b.verbaPasseios) / 100) * 100 || 0))
  };
}

export function montarPrompt(p) {
  return `Monte um roteiro de viagem curto e prático em português do Brasil.
Destino: ${p.dest.n}, ${p.dest.p}. ${p.dias} dias. ${p.pessoas} pessoa(s). Estilo ${ESTILOS[p.estilo]}.
Interesses: ${p.interesses.map(i => INTERESSES[i]).join(", ") || "variados"}.
Verba total de passeios para o grupo: R$ ${p.verba}. A soma dos custos das atividades não pode passar disso.
Regras: 2 ou 3 atividades por dia, com nomes curtos de atrações reais do destino. Não inclua refeições, bares nem restaurantes: a alimentação tem verba própria. Use o preço real aproximado de cada ingresso, multiplicado pelo número de pessoas. Custo em reais inteiros para o grupo todo (0 se for grátis). Prefira atrações grátis quando o estilo for econômico. Inclua 3 dicas curtas de economia específicas do destino.`;
}

// Contador por IP no cache da Cloudflare. É aproximado (cada data center conta separado),
// então o teto de gasto de verdade fica no limite mensal configurado no console da Anthropic.
async function dentroDoLimite(ip) {
  if (!ip) return true;
  const chave = `https://cache.cabenobolso/limite?${new URLSearchParams({ ip, d: new Date().toISOString().slice(0, 10) })}`;
  const usados = (await lerCache(chave))?.n || 0;
  if (usados >= LIMITE_DIA) return false;
  await gravarCache(chave, { n: usados + 1 }, 86400);
  return true;
}

const somaCustos = dias => dias.reduce((t, d) => t + d.atividades.reduce((s, a) => s + a.custo, 0), 0);

export async function gerarRoteiro(body, env = {}, client = null, ip = null) {
  const p = validarPedido(body);
  const chave = `https://cache.cabenobolso/roteiro/v2?${new URLSearchParams({
    d: p.dest.n, n: p.dias, q: p.pessoas, e: p.estilo, i: p.interesses.join(","), v: p.verba
  })}`;
  const guardado = await lerCache(chave);
  if (guardado) return { ...guardado, cache: true };

  if (!client && !env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");
  if (!(await dentroDoLimite(ip))) throw new LimiteAtingido(`Você já montou ${LIMITE_DIA} roteiros novos hoje. Volte amanhã para montar mais.`);
  const anthropic = client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  // A IA às vezes erra a conta: a soma é conferida aqui e, se passar da verba, pede de novo uma vez.
  let roteiro;
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const resposta = await anthropic.messages.parse({
      model: MODELO,
      max_tokens: 4000,
      messages: [{ role: "user", content: montarPrompt(p) + (tentativa ? `\nAtenção: a soma dos custos tem que ser no máximo R$ ${p.verba}.` : "") }],
      output_config: { format: zodOutputFormat(Roteiro) }
    });
    const r = resposta.parsed_output;
    if (!r || !r.dias.length) throw new Error("Resposta da IA sem roteiro");
    const dias = r.dias.slice(0, 7).map(d => ({
      ...d, atividades: d.atividades.map(a => ({ ...a, custo: Math.max(0, Math.round(a.custo) || 0) }))
    }));
    roteiro = { dias, dicas: r.dicas.slice(0, 3), totalPasseios: somaCustos(dias), verba: p.verba };
    if (roteiro.totalPasseios <= p.verba) {
      await gravarCache(chave, roteiro, SETE_DIAS);
      return { ...roteiro, cache: false };
    }
  }
  // Continuou acima da verba: mostra com aviso e não guarda no cache.
  return { ...roteiro, acimaDaVerba: true, cache: false };
}
