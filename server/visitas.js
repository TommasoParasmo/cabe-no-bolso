// Visualizações reais do site nos últimos 7 dias, lidas das estatísticas que a Cloudflare já registra
// (GraphQL Analytics, pageViews da zona). Nada inventado: sem token, sem resposta válida ou abaixo do
// mínimo, devolve null e o site não mostra o contador.
// Variáveis no Pages: CF_ANALYTICS_TOKEN (secret, token só de leitura "Zone Analytics: Read"),
// CF_ZONE_ID (id da zona vaidarviagem.com.br) e, opcional, VISITAS_MINIMO (padrão 300).
import { lerCache, gravarCache } from "./cache.js";

const API = "https://api.cloudflare.com/client/v4/graphql";
const GUARDA_S = 3600; // uma consulta por hora, no máximo
const PRAZO_MS = 6000;
const MINIMO = 300;

const QUERY = `query($zona: string!, $desde: Date!) { viewer { zones(filter: { zoneTag: $zona }) {
  httpRequests1dGroups(limit: 10, filter: { date_geq: $desde }) { sum { pageViews } } } } }`;

// Soma as visualizações da resposta, ou null se vier algo inesperado.
export function somarVisualizacoes(json) {
  const grupos = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups;
  if (json?.errors?.length || !Array.isArray(grupos)) return null;
  const total = grupos.reduce((s, g) => s + (g?.sum?.pageViews || 0), 0);
  return Number.isFinite(total) ? total : null;
}

const diasAtras = (n, hoje) => { const d = new Date(hoje); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

// { semana } com as visualizações dos últimos 7 dias (hoje incluído), ou null.
export async function visualizacoesDaSemana(env = {}, fetchFn = globalThis.fetch, hoje = new Date()) {
  const token = env.CF_ANALYTICS_TOKEN, zona = env.CF_ZONE_ID;
  if (!token || !zona) return null;
  const minimo = Number(env.VISITAS_MINIMO) || MINIMO;
  const chave = `https://cache.cabenobolso/visitas?${new URLSearchParams({ z: zona, v: "1" })}`;
  let semana = (await lerCache(chave))?.semana;
  if (!Number.isFinite(semana)) {
    try {
      const r = await fetchFn(API, {
        method: "POST", signal: AbortSignal.timeout(PRAZO_MS),
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: QUERY, variables: { zona, desde: diasAtras(6, hoje) } })
      });
      semana = r.ok ? somarVisualizacoes(await r.json()) : null;
    } catch {
      semana = null;
    }
    if (semana === null) return null;
    await gravarCache(chave, { semana }, GUARDA_S);
  }
  return semana >= minimo ? { semana } : null;
}
