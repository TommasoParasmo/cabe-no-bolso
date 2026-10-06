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
    verba: Math.max(0, Math.round(Number(b.verbaPasseios) / 10) * 10 || 0)
  };
}

export function montarPrompt(p) {
  return `Monte um roteiro de viagem curto e prático em português do Brasil.
Destino: ${p.dest.n}, ${p.dest.p}. ${p.dias} dias. ${p.pessoas} pessoa(s). Estilo ${ESTILOS[p.estilo]}.
Interesses: ${p.interesses.map(i => INTERESSES[i]).join(", ") || "variados"}.
Verba total de passeios para o grupo: R$ ${p.verba}. A soma dos custos das atividades não pode passar disso.
Regras: 2 ou 3 atividades por dia, com nomes curtos de atrações reais do destino. Custo em reais inteiros para o grupo todo (0 se for grátis). Prefira atrações grátis quando o estilo for econômico. Inclua 3 dicas curtas de economia específicas do destino.`;
}

export async function gerarRoteiro(body, env = {}, client = null) {
  const p = validarPedido(body);
  const chave = `https://cache.cabenobolso/roteiro?${new URLSearchParams({
    d: p.dest.n, n: p.dias, q: p.pessoas, e: p.estilo, i: p.interesses.join(","), v: p.verba
  })}`;
  const guardado = await lerCache(chave);
  if (guardado) return { ...guardado, cache: true };

  if (!client && !env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada");
  const anthropic = client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const resposta = await anthropic.messages.parse({
    model: MODELO,
    max_tokens: 4000,
    messages: [{ role: "user", content: montarPrompt(p) }],
    output_config: { format: zodOutputFormat(Roteiro) }
  });
  const r = resposta.parsed_output;
  if (!r || !r.dias.length) throw new Error("Resposta da IA sem roteiro");
  const roteiro = { dias: r.dias.slice(0, 7), dicas: r.dicas.slice(0, 3) };
  await gravarCache(chave, roteiro, SETE_DIAS);
  return { ...roteiro, cache: false };
}
