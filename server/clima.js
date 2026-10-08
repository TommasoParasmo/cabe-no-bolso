// Temperatura média do destino no mês da viagem: normais climatológicas da NASA POWER
// (média de 20 anos por mês, dado público e gratuito). Nada inventado: sem resposta válida, não mostra nada.
// Só a coordenada do destino vai para a NASA, nunca dado de quem usa o app.
import { DESTINOS } from "../public/lib/dados.js";
import { lerCache, gravarCache } from "./cache.js";

const API = "https://power.larc.nasa.gov/api/temporal/climatology/point";
const MESES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const GUARDA_S = 180 * 86400; // a média de 20 anos não muda: meio ano de cache por cidade
const PRAZO_MS = 8000;

export const acharDestinoClima = nome => DESTINOS.find(d => d.n === String(nome ?? "").trim()) || null;

const valido = v => typeof v === "number" && Number.isFinite(v) && v > -60 && v < 60;

// Lê a resposta da NASA e devolve [{ min, max }] para os 12 meses, ou null se vier algo inesperado.
export function lerNormais(json) {
  const p = json?.properties?.parameter;
  const max = p?.T2M_MAX, min = p?.T2M_MIN;
  if (!max || !min) return null;
  const meses = MESES.map(m => ({ min: min[m], max: max[m] }));
  if (!meses.every(m => valido(m.min) && valido(m.max) && m.min <= m.max)) return null;
  return meses.map(m => ({ min: Math.round(m.min), max: Math.round(m.max) }));
}

// { min, max } em °C do destino no mês (1 a 12), ou null.
export async function climaDoMes(dest, mes, fetchFn = globalThis.fetch) {
  if (!dest || !Number.isInteger(mes) || mes < 1 || mes > 12) return null;
  const chave = `https://cache.cabenobolso/clima?${new URLSearchParams({ d: dest.n, v: "1" })}`;
  let normais = await lerCache(chave);
  if (!Array.isArray(normais)) {
    const url = `${API}?${new URLSearchParams({ parameters: "T2M_MAX,T2M_MIN", community: "RE", latitude: String(dest.lat), longitude: String(dest.lon), format: "JSON" })}`;
    try {
      const r = await fetchFn(url, { signal: AbortSignal.timeout(PRAZO_MS) });
      normais = r.ok ? lerNormais(await r.json()) : null;
    } catch {
      normais = null;
    }
    if (!normais) return null;
    await gravarCache(chave, normais, GUARDA_S);
  }
  return normais[mes - 1] || null;
}
