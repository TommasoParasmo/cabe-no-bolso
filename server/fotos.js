// Fotos do roteiro completo: só a atração em destaque de cada dia, tirada da Wikipédia (Wikimedia Commons).
// É grátis e sem chave; cada foto leva o autor e a licença, que a licença livre exige mostrar.
import { norm } from "../public/lib/custo.js";

const AGENTE = "VaiDarViagem/1.0 (https://vaidarviagem.com.br; contato@vaidarviagem.com.br)";
const semHtml = s => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
// Palavras que contam para conferir se o artigo achado é mesmo do lugar ("Museu do Amanhã" e "Museum of Tomorrow" não batem, mas a busca em português acha).
const palavras = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length >= 4);

async function pedirJson(url, fetchFn) {
  const r = await fetchFn(url, { headers: { "user-agent": AGENTE, "api-user-agent": AGENTE }, signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`Wikimedia ${r.status}`);
  return r.json();
}

// Foto do lugar: o artigo da Wikipédia (português, depois inglês) com o nome do lugar e da cidade.
// Só aceita imagem do Commons (licença livre), nunca ícone ou mapa em SVG, e só se o título do artigo tiver
// alguma palavra do nome do lugar, para não trazer a foto da cidade inteira.
export async function fotoDoLugar(nome, cidade, fetchFn = globalThis.fetch) {
  const doNome = palavras(nome);
  if (!doNome.length) return null;
  for (const lingua of ["pt", "en"]) {
    try {
      const busca = await pedirJson(`https://${lingua}.wikipedia.org/w/api.php?${new URLSearchParams({
        action: "query", format: "json", formatversion: "2", generator: "search", gsrsearch: `${nome} ${cidade}`, gsrlimit: "1",
        prop: "pageimages|info", piprop: "thumbnail|name", pithumbsize: "800", inprop: "url", origin: "*"
      })}`, fetchFn);
      const pagina = busca?.query?.pages?.[0];
      const thumb = pagina?.thumbnail?.source || "";
      if (!pagina?.pageimage || /\.svg$/i.test(pagina.pageimage) || !thumb.startsWith("https://upload.wikimedia.org/wikipedia/commons/")) continue;
      if (!palavras(pagina.title).some(w => doNome.includes(w))) continue;
      const arquivo = `File:${pagina.pageimage}`;
      const info = await pedirJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
        action: "query", format: "json", formatversion: "2", titles: arquivo, prop: "imageinfo", iiprop: "extmetadata", origin: "*"
      })}`, fetchFn);
      const meta = info?.query?.pages?.[0]?.imageinfo?.[0]?.extmetadata || {};
      const licenca = semHtml(meta.LicenseShortName?.value);
      if (!licenca) continue;
      return {
        url: thumb,
        autor: semHtml(meta.Artist?.value).slice(0, 80) || "Autor desconhecido",
        licenca: licenca.slice(0, 40),
        pagina: `https://commons.wikimedia.org/wiki/${encodeURIComponent(arquivo.replace(/ /g, "_"))}`
      };
    } catch {
      // Sem foto não é erro: o roteiro segue sem ela.
    }
  }
  return null;
}

// Põe a foto na atividade em destaque de cada dia, todas ao mesmo tempo.
export async function comFotos(roteiro, fetchFn = globalThis.fetch) {
  const dias = await Promise.all(roteiro.dias.map(async d => {
    const i = d.atividades.findIndex(a => a.destaque);
    if (i < 0) return d;
    const foto = await fotoDoLugar(d.atividades[i].nome, d.cidade, fetchFn);
    return foto ? { ...d, atividades: d.atividades.map((a, j) => (j === i ? { ...a, foto } : a)) } : d;
  }));
  return { ...roteiro, dias };
}
