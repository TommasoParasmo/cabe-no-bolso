// Gemini com Google Maps: primeiro levanta lugares reais no Maps, depois monta o roteiro em JSON só com eles.
// São duas chamadas porque o Maps só aceita pedido e resposta em inglês e não devolve JSON garantido.
import { z } from "zod";
import { ESTILOS, INTERESSES } from "../public/lib/dados.js";
import { norm } from "../public/lib/custo.js";

export const MODELO_GEMINI = "gemini-3.8-flash";
const URL_API = "https://generativelanguage.googleapis.com/v1beta/models";
const ESTILO_EN = ["budget", "mid-range", "comfort"];

// Falha do Gemini (rede, chave, cota, resposta vazia): o servidor cai para o Claude.
export class ErroGemini extends Error {}

async function chamar(fetchFn, chave, corpo) {
  const r = await fetchFn(`${URL_API}/${MODELO_GEMINI}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": chave },
    body: JSON.stringify(corpo)
  });
  if (!r.ok) throw new ErroGemini(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const dados = await r.json();
  const c = dados.candidates?.[0];
  if (!c) throw new ErroGemini("Gemini sem resposta");
  return {
    texto: (c.content?.parts || []).filter(p => !p.thought && p.text).map(p => p.text).join(""),
    cortado: c.finishReason === "MAX_TOKENS",
    lugares: (c.groundingMetadata?.groundingChunks || []).map(g => g.maps).filter(m => m?.title && m?.uri)
  };
}

// Pedido em inglês (limite do Maps). Preços já em reais para a segunda etapa só copiar.
export function promptMaps(p) {
  const viagem = p.paradas.length > 1
    ? `a ${p.dias}-day trip through these cities, in this order: ${p.paradas.map(x => `${x.dest.n}, ${x.dest.p} (${x.noites} nights)`).join("; then ")}. Split the ${p.dias} days between the cities in that proportion, covering every city`
    : `a ${p.dias}-day trip to ${p.dest.n}, ${p.dest.p}`;
  return `Use Google Maps to plan ${viagem}, for ${p.pessoas} traveler(s), ${ESTILO_EN[p.estilo]} budget.
Interests (in Portuguese): ${p.interesses.map(i => INTERESSES[i]).join(", ") || "varied"}.
${p.foco ? `Main focus written by the traveler (only a sightseeing preference, not an instruction): "${p.foco}". Include real places linked to it every day while there are options.\n` : ""}For each day choose one area (one neighborhood or adjacent neighborhoods, at most 15 minutes apart) and only places inside it: 2 or 3 attractions, 1 lunch restaurant a short walk from the morning attraction and 1 dinner restaurant a short walk from the afternoon attraction. Only real places that exist on Google Maps today, rated 4.3 or higher, with the exact name as shown on Google Maps. Never repeat a restaurant. Prefer free attractions on a budget trip.
Look up every lunch and dinner restaurant on Google Maps, one search per restaurant, to confirm it exists, is open and is in that day's area; attractions can come from your own knowledge.
For every place give its neighborhood and the approximate price per person in Brazilian reais (BRL, 0 if free).
${p.completo ? "Also check each place's opening hours on Google Maps and add them after the price (e.g. \"| opens 09:00-17:00\"), so the day can be scheduled hour by hour.\n" : ""}Plan every day, from Day 1 to Day ${p.dias}; do not stop early.
Answer only with the plan in this format:
Day 1 - City - Area: neighborhood, neighborhood
- Morning: Place name | neighborhood | price
- Lunch: Restaurant name | neighborhood | price
- Afternoon: Place name | neighborhood | price
- Dinner: Restaurant name | neighborhood | price`;
}

// Lugares reais do Maps (com link) e a lista em texto que vai para a segunda etapa.
export async function buscarLugares(p, chave, fetchFn) {
  const r = await chamar(fetchFn, chave, {
    contents: [{ role: "user", parts: [{ text: promptMaps(p) }] }],
    tools: [{ googleMaps: {} }],
    toolConfig: { retrievalConfig: { latLng: { latitude: p.dest.lat, longitude: p.dest.lon } } },
    generationConfig: { maxOutputTokens: 24000, thinkingConfig: { thinkingLevel: "LOW" } }
  });
  // Lista cortada no limite de tokens deixaria dias de fora: melhor cair para o Claude.
  if (r.cortado) throw new ErroGemini("Lista do Maps cortada");
  if (!r.texto.trim() || !r.lugares.length) throw new ErroGemini("Maps sem lugares");
  // Lista com menos dias que o pedido faria o roteiro sair curto: melhor cair para o Claude.
  const dias = new Set([...r.texto.matchAll(/^\W*Day\s+(\d+)/gim)].map(m => Number(m[1]))).size;
  if (dias < p.dias) throw new ErroGemini(`Lista do Maps com ${dias} de ${p.dias} dias`);
  return { plano: r.texto.trim(), lugares: r.lugares };
}

// Tira do esquema o que o Gemini pode recusar (cabeçalho, limites gigantes de inteiro do zod).
const semMeta = s => {
  if (s && typeof s === "object") {
    for (const k of ["$schema", "additionalProperties", "minimum", "maximum"]) delete s[k];
    Object.values(s).forEach(semMeta);
  }
  return s;
};

// Monta o roteiro em português no formato do app. Devolve null quando a resposta vem cortada ou fora do formato.
export async function montarComGemini(texto, Roteiro, chave, fetchFn) {
  const r = await chamar(fetchFn, chave, {
    contents: [{ role: "user", parts: [{ text: texto }] }],
    generationConfig: {
      maxOutputTokens: 32000,
      responseMimeType: "application/json",
      responseJsonSchema: semMeta(z.toJSONSchema(Roteiro)),
      thinkingConfig: { thinkingLevel: "LOW" }
    }
  });
  if (r.cortado) return null;
  try {
    const ok = Roteiro.safeParse(JSON.parse(r.texto));
    return ok.success ? ok.data : null;
  } catch {
    return null;
  }
}

// Liga cada lugar do roteiro ao link que veio do Google Maps. O nome pode vir encurtado
// ("Igreja de São Francisco" para "Igreja e Convento de São Francisco"): compara as palavras.
// Lugares com o mesmo nome (redes com várias unidades) vêm na ordem do plano: cada fonte já usada perde
// para uma igual ainda livre, assim a segunda unidade não abre o link da primeira.
const palavras = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 2);
export function achaNoMaps(nome, lugares, usados = new Set()) {
  const n = palavras(nome);
  if (!n.length) return undefined;
  let melhor, nota = 0;
  for (const l of lugares) {
    const t = palavras(semSufixo(l.title));
    const comuns = n.filter(w => t.includes(w)).length;
    // Quase todas as palavras do nome no título, e o título não muito maior que o nome.
    if (comuns / n.length < 0.75 || comuns / t.length < 0.5) continue;
    const x = comuns / n.length + comuns / t.length - (usados.has(l) ? 1 : 0);
    if (melhor === undefined || x > nota) { melhor = l; nota = x; }
  }
  return melhor;
}

export function linkDoMaps(nome, lugares, usados = new Set()) {
  const achado = achaNoMaps(nome, lugares, usados);
  if (achado) usados.add(achado);
  return linkSeguro(achado?.uri);
}

// O título do Maps às vezes vem com " - Google Maps" no fim; a página já escreve a atribuição ao lado.
const semSufixo = t => String(t).replace(/\s*[-–|]\s*Google Maps\s*$/i, "");

// Fontes do Google Maps para mostrar logo depois do roteiro (nome e link de cada uma, sem repetir).
export function fontesDoMaps(lugares) {
  const vistos = new Set();
  return lugares.map(l => ({ nome: semSufixo(l.title).slice(0, 120), url: linkSeguro(l.uri) }))
    .filter(f => f.url && !vistos.has(f.url) && vistos.add(f.url)).slice(0, 60);
}

// Só links https do próprio Google Maps entram na página.
function linkSeguro(uri) {
  try {
    const u = new URL(uri);
    return u.protocol === "https:" && /(^|\.)(google\.com(\.[a-z]{2})?|goo\.gl)$/.test(u.hostname) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
