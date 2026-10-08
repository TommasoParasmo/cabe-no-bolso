import { ORIGENS, DESTINOS, ESTILOS } from "../lib/dados.js";
import { NOITES_MIN_SUGESTAO } from "../lib/custo.js";

const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["var(--accent)", "var(--sun)", "#7A8FD6", "#D96C8A", "#6FB58C", "#A58B6F"];
const ESTADO = { cabe: "Vai dar viagem", apertado: "Vai dar, no aperto", nao_cabe: "Não vai dar" };

const iso = d => d.toISOString().slice(0, 10);
const noitesTxt = n => `${n} ${n > 1 ? "noites" : "noite"}`;
(function init() {
  $("origem").innerHTML = ORIGENS.map(o => `<option>${esc(o.n)}</option>`).join("");
  const a = new Date(); a.setDate(a.getDate() + 45);
  const b = new Date(a); b.setDate(b.getDate() + 5);
  $("ida").value = iso(a); $("volta").value = iso(b);
  // Ida a partir de amanhã (a API também recusa data passada).
  const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
  // Data local (iso() é em UTC e, à noite no Brasil, pularia um dia).
  const local = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  $("ida").min = local(amanha); $("volta").min = local(amanha);
  // Datas flexíveis: os próximos 12 meses, começando pelo mês da ida padrão.
  const meses = Array.from({ length: 12 }, (_, i) => new Date(new Date().getFullYear(), new Date().getMonth() + i, 1));
  $("mes").innerHTML = meses.map(m => {
    const v = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    const nome = m.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return `<option value="${v}">${esc(nome[0].toUpperCase() + nome.slice(1))}</option>`;
  }).join("");
  $("mes").value = iso(a).slice(0, 7);
})();
$("flexivel").onchange = () => {
  const flex = $("flexivel").checked;
  document.querySelectorAll(".datas-fixas").forEach(e => e.hidden = flex);
  document.querySelectorAll(".datas-flex").forEach(e => e.hidden = !flex);
};
// Com datas flexíveis, cada destino traz as datas mais baratas que achamos para ele.
const comDatas = (f, c) => c?.ida ? { ...f, ida: c.ida, volta: c.volta } : f;
// Botões de faixa: só preenchem o valor; o resultado aparece ao clicar em "Ver se vai dar".
const marcarFaixa = () => document.querySelectorAll(".faixas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === $("orcamento").value.replace(/\D/g, ""))));
document.querySelectorAll(".faixas button").forEach(b => b.onclick = () => {
  $("orcamento").value = Number(b.dataset.v).toLocaleString("pt-BR");
  marcarFaixa();
});
$("orcamento").addEventListener("input", marcarFaixa);
$("orcamento").addEventListener("input", e => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = digits ? Number(digits).toLocaleString("pt-BR") : "";
});

// Destinos escolhidos (cidades ou países). O texto ainda no campo também conta.
const escolhidos = [];
const norm = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const PAISES = [...new Set(DESTINOS.map(d => d.p))];
const OPCOES = [
  ...DESTINOS.filter(d => !d.int).map(d => ({ v: d.n, nota: d.terrestre ? "só de ônibus" : d.p, grupo: "No Brasil" })),
  ...DESTINOS.filter(d => d.int).map(d => ({ v: d.n, nota: d.p, grupo: "No exterior" })),
  ...PAISES.map(p => ({ v: p, nota: "todas as cidades", grupo: "Países" }))
];
function addDestino(v) {
  v = OPCOES.find(o => norm(o.v) === norm(v))?.v || v.trim();
  if (!v || escolhidos.includes(v) || escolhidos.length >= 8) return;
  escolhidos.push(v);
  $("destino").value = "";
  renderEscolhidos();
}
// Exemplos do campo "Algo específico" conforme o destino escolhido (o primeiro da lista).
// Só coisas na própria cidade (ou bate-volta curto): o roteiro é gerado para a cidade do app.
const EXEMPLOS = {
  "Rio de Janeiro": "Cristo Redentor, trilha do Morro Dois Irmãos, samba na Lapa",
  "Salvador": "Pelourinho, acarajé, show do Olodum",
  "Porto de Galinhas": "piscinas naturais, passeio de jangada, Praia de Muro Alto",
  "Fortaleza": "Beach Park, Praia do Futuro, forró",
  "Natal": "passeio de buggy nas dunas, Genipabu, Maracajaú",
  "Maceió": "Praia do Gunga, piscinas de Pajuçara, Praia do Francês",
  "Florianópolis": "Lagoa da Conceição, trilha da Lagoinha do Leste, ostras",
  "Gramado": "Snowland, fondue, Lago Negro",
  "Foz do Iguaçu": "Cataratas, Itaipu, compras no Paraguai",
  "Bonito": "flutuação no Rio da Prata, Gruta do Lago Azul, Buraco das Araras",
  "Jericoacoara": "Pedra Furada, pôr do sol na duna, kitesurf",
  "Porto Seguro": "Arraial d'Ajuda, Trancoso, Recife de Fora",
  "Paraty": "centro histórico, passeio de escuna, cachaçarias",
  "Ubatuba": "Praia do Félix, Ilha Anchieta, trilha das 7 praias",
  "Campos do Jordão": "Morro do Elefante, chocolate quente, Amantikir",
  "Búzios": "Rua das Pedras, Praia de Geribá, passeio de barco",
  "Arraial do Cabo": "Prainhas do Pontal do Atalaia, mergulho, Gruta Azul",
  "Ouro Preto": "igrejas barrocas, Mina da Passagem, comida mineira",
  "Pirenópolis": "cachoeiras, Cavalhadas, centro histórico",
  "Chapada dos Veadeiros": "Vale da Lua, Cachoeira Santa Bárbara, trilhas",
  "Balneário Camboriú": "roda-gigante, Unipraias, Beto Carrero",
  "Praia do Forte": "Projeto Tamar, piscinas naturais, Castelo Garcia d'Ávila",
  "Canoa Quebrada": "falésias, passeio de buggy, Broadway",
  "Salinópolis": "Praia do Atalaia, Lago da Coca-Cola, caranguejo",
  "Presidente Figueiredo": "cachoeiras, cavernas, Maroaga",
  "Buenos Aires": "show de tango, parrilla, La Boca e Caminito",
  "Santiago": "Valle Nevado, vinícolas, Cerro San Cristóbal",
  "Montevidéu": "Mercado del Puerto, Ciudad Vieja, Rambla",
  "Lima": "ceviche, Miraflores, Barranco",
  "Cancún": "cenotes, Isla Mujeres, Xcaret",
  "Lisboa": "pastel de Belém, elétrico 28, fado em Alfama",
  "Orlando": "Disney, Universal, outlets",
  "Tóquio": "Akihabara, Shibuya, sushi em Tsukiji",
  "Paris": "Torre Eiffel, Louvre, Disneyland Paris",
  "Madri": "Museu do Prado, Parque del Retiro, tapas no Mercado de San Miguel",
  "Barcelona": "Sagrada Família, Park Güell, jogo no Camp Nou",
  "Roma": "Coliseu, Vaticano, Fontana di Trevi",
  "Londres": "Big Ben, Museu Britânico, estúdio do Harry Potter",
  "Nova York": "Central Park, Times Square, musical na Broadway",
  "Miami": "South Beach, Wynwood, outlets",
  "Bariloche": "Cerro Catedral, Circuito Chico, chocolates",
  "Punta Cana": "Ilha Saona, Hoyo Azul, catamarã",
  "São Paulo": "Avenida Paulista, MASP, Mercadão",
  "Fernando de Noronha": "Baía do Sancho, mergulho, pôr do sol no Forte",
  "Lençóis Maranhenses": "Lagoa Azul, Lagoa Bonita, passeio de voadeira",
  "Manaus": "Teatro Amazonas, Encontro das Águas, botos",
  "Curitiba": "Jardim Botânico, Ópera de Arame, Santa Felicidade",
  "Chapada Diamantina": "Cachoeira da Fumaça, Poço Azul, Morro do Pai Inácio",
  "Marselha": "Vieux-Port, Notre-Dame de la Garde, Calanques",
  "Nice": "Promenade des Anglais, Vieux Nice, Castle Hill",
  "Lyon": "Vieux Lyon, Fourvière, bouchons lioneses",
  "Bordeaux": "Cité du Vin, Place de la Bourse, vinícolas",
  "Sevilha": "Real Alcázar, Plaza de España, show de flamenco",
  "Valência": "Cidade das Artes e Ciências, paella, Praia da Malvarrosa",
  "Málaga": "Museu Picasso, Alcazaba, Praia da Malagueta",
  "Granada": "Alhambra, Albaicín, tapas grátis",
  "Palma de Mallorca": "Catedral de Palma, Caló des Moro, Cuevas del Drach",
  "Ibiza": "Dalt Vila, Cala Comte, festas em Sant Antoni",
  "Milão": "Duomo, Galleria Vittorio Emanuele, Última Ceia",
  "Veneza": "Praça São Marcos, passeio de gôndola, Burano",
  "Florença": "Duomo, Galleria degli Uffizi, Ponte Vecchio",
  "Nápoles": "pizza napolitana, Pompeia, Spaccanapoli",
  "Porto": "Ribeira, caves de vinho do Porto, Livraria Lello",
  "Madeira": "levadas, Pico do Arieiro, Mercado dos Lavradores",
  "Algarve": "Praia da Marinha, Benagil, Lagos",
  "Edimburgo": "Castelo de Edimburgo, Royal Mile, Arthur's Seat",
  "Dublin": "Temple Bar, Guinness Storehouse, Trinity College",
  "Berlim": "Portão de Brandemburgo, Muro de Berlim, Ilha dos Museus",
  "Munique": "Marienplatz, cervejarias, Palácio de Nymphenburg",
  "Amsterdã": "canais, Museu Van Gogh, Casa de Anne Frank",
  "Bruxelas": "Grand-Place, Atomium, waffles e chocolates",
  "Zurique": "Lago de Zurique, Altstadt, Monte Uetliberg",
  "Genebra": "Jet d'Eau, Lago Léman, sede da ONU",
  "Viena": "Palácio de Schönbrunn, concerto clássico, cafés vienenses",
  "Praga": "Ponte Carlos, Castelo de Praga, Relógio Astronômico",
  "Budapeste": "Parlamento, banhos termais Széchenyi, ruin bars",
  "Reykjavík": "aurora boreal, Lagoa Azul, Círculo Dourado",
  "Atenas": "Acrópole, Plaka, Templo de Poseidon",
  "Santorini": "pôr do sol em Oia, praia vermelha, passeio de catamarã",
  "Mykonos": "Little Venice, moinhos, Paradise Beach",
  "Dubrovnik": "muralhas, Cidade Velha, ilha de Lokrum",
  "Istambul": "Santa Sofia, Grande Bazar, passeio no Bósforo",
  "Capadócia": "passeio de balão, Göreme, cidade subterrânea",
  "Dubai": "Burj Khalifa, Dubai Mall, safári no deserto",
  "Cairo": "Pirâmides de Gizé, Museu Egípcio, Khan el-Khalili",
  "Jerusalém": "Muro das Lamentações, Santo Sepulcro, Monte das Oliveiras",
  "Tel Aviv": "praias do Mediterrâneo, Jaffa, Mercado Carmel",
  "Marrakech": "Praça Jemaa el-Fna, Jardim Majorelle, souks",
  "Cidade do Cabo": "Table Mountain, Cabo da Boa Esperança, pinguins de Boulders",
  "Las Vegas": "Strip, show do Cirque du Soleil, Fremont Street",
  "Los Angeles": "Hollywood, Santa Monica, Universal Studios",
  "São Francisco": "Golden Gate, Alcatraz, bondinho",
  "Toronto": "CN Tower, Distillery District, Cataratas do Niágara",
  "Vancouver": "Stanley Park, Granville Island, Capilano",
  "Montreal": "Vieux-Montréal, Mont Royal, poutine",
  "Cidade do México": "Teotihuacán, Museu Frida Kahlo, tacos al pastor",
  "Tulum": "ruínas de Tulum, cenotes, Praia Paraíso",
  "Aruba": "Eagle Beach, flamingos, Arikok",
  "Havana": "Habana Vieja, carro antigo, Malecón",
  "Cidade do Panamá": "Canal do Panamá, Casco Viejo, compras",
  "San José": "vulcão Poás, La Paz Waterfall, cafezais",
  "Mendoza": "vinícolas, Aconcágua, Potrerillos",
  "Ushuaia": "Canal de Beagle, Trem do Fim do Mundo, Parque Tierra del Fuego",
  "El Calafate": "Glaciar Perito Moreno, minitrekking, Lago Argentino",
  "San Pedro de Atacama": "Vale da Lua, Gêiseres del Tatio, lagunas altiplânicas",
  "Cusco": "Machu Picchu, Vale Sagrado, Montanha Colorida",
  "Punta del Este": "La Mano, Casapueblo, Ilha de Lobos",
  "Cartagena": "Cidade Murada, Ilhas do Rosário, Getsemaní",
  "Bogotá": "Monserrate, Museu do Ouro, La Candelaria",
  "Medellín": "Comuna 13, Guatapé, teleférico",
  "San Andrés": "Johnny Cay, Acuario, mar de sete cores",
  "Osaka": "Dotonbori, Universal Studios Japan, Castelo de Osaka",
  "Kyoto": "Fushimi Inari, Kinkaku-ji, Arashiyama",
  "Seul": "Gyeongbokgung, Myeongdong, Bukchon",
  "Pequim": "Grande Muralha, Cidade Proibida, pato laqueado",
  "Xangai": "The Bund, Jardim Yu, Torre de Xangai",
  "Bangkok": "Grande Palácio, Wat Arun, comida de rua",
  "Phuket": "Phi Phi, Patong, Big Buddha",
  "Bali": "Ubud, terraços de arroz, templo Uluwatu",
  "Singapura": "Marina Bay Sands, Gardens by the Bay, hawker centres",
  "Maldivas": "bangalô sobre a água, mergulho, sandbank",
  "Sydney": "Opera House, Bondi Beach, Harbour Bridge",
  "Melbourne": "Great Ocean Road, laneways, cafés",
  "Queenstown": "Milford Sound, bungee jump, Skyline",
  "Brasil": "praias, cachoeiras, comida típica",
  "Argentina": "tango em Buenos Aires, Perito Moreno, vinícolas de Mendoza",
  "Chile": "Valle Nevado, vinícolas, Vale da Lua",
  "Uruguai": "Ciudad Vieja, Casapueblo, Rambla",
  "Peru": "ceviche, Machu Picchu, Miraflores",
  "México": "cenotes, Teotihuacán, tacos al pastor",
  "Portugal": "pastel de Belém, caves do Porto, praias do Algarve",
  "Estados Unidos": "Disney, Times Square, Golden Gate",
  "Japão": "Akihabara, Fushimi Inari, Dotonbori",
  "França": "Torre Eiffel, Louvre, Calanques de Marselha",
  "Espanha": "Sagrada Família, Museu do Prado, Alhambra",
  "Itália": "Coliseu, gôndola em Veneza, Duomo de Florença",
  "Reino Unido": "Big Ben, Museu Britânico, Castelo de Edimburgo",
  "República Dominicana": "Ilha Saona, Hoyo Azul, catamarã",
  "Irlanda": "Temple Bar, Guinness Storehouse, Trinity College",
  "Alemanha": "Portão de Brandemburgo, Marienplatz, cervejarias",
  "Holanda": "canais, Museu Van Gogh, Casa de Anne Frank",
  "Bélgica": "Grand-Place, Atomium, waffles e chocolates",
  "Suíça": "Lago de Zurique, Jet d'Eau, chocolates",
  "Áustria": "Palácio de Schönbrunn, concerto clássico, cafés vienenses",
  "República Tcheca": "Ponte Carlos, Castelo de Praga, Relógio Astronômico",
  "Hungria": "Parlamento, banhos termais, ruin bars",
  "Islândia": "aurora boreal, Lagoa Azul, Círculo Dourado",
  "Grécia": "Acrópole, pôr do sol em Oia, Mykonos",
  "Croácia": "muralhas de Dubrovnik, Cidade Velha, Lokrum",
  "Turquia": "Santa Sofia, Grande Bazar, balão na Capadócia",
  "Emirados Árabes": "Burj Khalifa, Dubai Mall, safári no deserto",
  "Egito": "Pirâmides de Gizé, Museu Egípcio, Khan el-Khalili",
  "Marrocos": "Jemaa el-Fna, Jardim Majorelle, souks",
  "África do Sul": "Table Mountain, Cabo da Boa Esperança, pinguins",
  "Canadá": "CN Tower, Stanley Park, Vieux-Montréal",
  "Cuba": "Habana Vieja, carro antigo, Malecón",
  "Panamá": "Canal do Panamá, Casco Viejo, compras",
  "Costa Rica": "vulcão Poás, cachoeiras, cafezais",
  "Colômbia": "Cidade Murada, Comuna 13, Monserrate",
  "Coreia do Sul": "Gyeongbokgung, Myeongdong, Bukchon",
  "China": "Grande Muralha, Cidade Proibida, The Bund",
  "Tailândia": "Grande Palácio, Phi Phi, comida de rua",
  "Indonésia": "Ubud, terraços de arroz, templo Uluwatu",
  "Austrália": "Opera House, Bondi Beach, Great Ocean Road",
  "Nova Zelândia": "Milford Sound, bungee jump, Skyline"
};
function atualizarExemplo() {
  const alvo = escolhidos[0] || OPCOES.find(o => norm(o.v) === norm($("destino").value))?.v;
  $("foco").placeholder = "Ex.: " + (EXEMPLOS[alvo] || "museus, trilhas, vida noturna");
}
$("destino").addEventListener("input", atualizarExemplo);

let tipo = "comparar";
function renderEscolhidos() {
  $("escolhidos").innerHTML = escolhidos.map((v, i) => `<button type="button" data-i="${i}" aria-label="Tirar ${esc(v)}">${esc(v)} ✕</button>`).join("");
  $("tipo").hidden = escolhidos.length < 2;
  $("escolhidos").querySelectorAll("button").forEach(b => b.onclick = () => { escolhidos.splice(Number(b.dataset.i), 1); renderEscolhidos(); });
  $("destino").placeholder = escolhidos.length ? "Adicionar outro" : "Digite uma cidade ou país";
  atualizarExemplo();
}
document.querySelectorAll('input[name="tipo"]').forEach(r => r.onchange = () => { tipo = r.value; });

// Lista de destinos própria (a do navegador fica estreita e sem estilo).
let visiveis = [], ativa = -1;
function abrirLista() {
  const q = norm($("destino").value);
  visiveis = OPCOES.filter(o => !escolhidos.includes(o.v) && (!q || norm(o.v).includes(q) || norm(o.nota).includes(q)));
  // Nome exato ("Porto") é o escolhido no Enter, não o primeiro que contém o texto ("Porto de Galinhas").
  const exato = visiveis.findIndex(o => norm(o.v) === q);
  ativa = q && visiveis.length ? Math.max(0, exato) : -1;
  let grupo = "";
  $("sugestoes").innerHTML = visiveis.length ? visiveis.map((o, i) => {
    const titulo = o.grupo !== grupo ? `<li class="grupo" role="presentation">${grupo = o.grupo}</li>` : "";
    return `${titulo}<li role="option" id="sug-${i}" data-i="${i}" aria-selected="${i === ativa}"><span>${esc(o.v)}</span><small>${esc(o.nota)}</small></li>`;
  }).join("") : '<li class="vazio" role="presentation">Ainda não temos esse destino. Pressione Enter para tentar mesmo assim.</li>';
  $("sugestoes").hidden = false;
  $("destino").setAttribute("aria-expanded", "true");
  marcarAtiva();
}
function fecharLista() {
  $("sugestoes").hidden = true;
  $("destino").setAttribute("aria-expanded", "false");
  $("destino").removeAttribute("aria-activedescendant");
}
function marcarAtiva() {
  $("sugestoes").querySelectorAll('[role="option"]').forEach(li => li.setAttribute("aria-selected", String(Number(li.dataset.i) === ativa)));
  const li = $("sug-" + ativa);
  if (li) { $("destino").setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
  else $("destino").removeAttribute("aria-activedescendant");
}
$("destino").addEventListener("focus", abrirLista);
$("destino").addEventListener("click", abrirLista);
$("destino").addEventListener("input", abrirLista);
$("destino").addEventListener("blur", () => setTimeout(fecharLista, 120));
$("sugestoes").addEventListener("mousedown", e => {
  const li = e.target.closest('[role="option"]');
  if (!li) return;
  e.preventDefault();
  addDestino(visiveis[Number(li.dataset.i)].v);
  // Fecha a lista: aberta, ela cobria "Comparar / Visitar todos" e "me sugira destinos".
  fecharLista();
});
$("destino").addEventListener("keydown", e => {
  const aberta = !$("sugestoes").hidden;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!aberta) return abrirLista();
    if (!visiveis.length) return;
    ativa = (ativa + (e.key === "ArrowDown" ? 1 : -1) + visiveis.length) % visiveis.length;
    marcarAtiva();
  } else if (e.key === "Enter") {
    const v = aberta && ativa >= 0 ? visiveis[ativa].v : e.target.value.trim();
    if (!v) return;
    e.preventDefault();
    addDestino(v);
    fecharLista();
  } else if (e.key === "Escape") fecharLista();
});

function lerForm() {
  return {
    orcamento: Number($("orcamento").value.replace(/\D/g, "")) || 0,
    origem: $("origem").value, destinos: [...escolhidos, $("destino").value.trim()].filter(Boolean), tipo,
    ida: $("ida").value, volta: $("volta").value,
    ...($("flexivel").checked ? { flexivel: { mes: $("mes").value, noites: Number($("noites").value) } } : {}),
    pessoas: Number($("pessoas").value),
    estilo: Number(document.querySelector('input[name="estilo"]:checked')?.value ?? 1),
    interesses: [...document.querySelectorAll("#interesses input:checked")].map(i => i.value),
    foco: $("foco").value.trim()
  };
}

// No app de celular as telas vêm de dentro do aparelho, então a API é chamada no endereço do site.
const API = window.Capacitor?.isNativePlatform?.() ? "https://vaidarviagem.com.br" : "";
async function postar(caminho, dados, signal) {
  const r = await fetch(API + caminho, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(dados), signal });
  const corpo = await r.json().catch(() => ({}));
  // 524/504 sem JSON: a Cloudflare cortou uma resposta que demorou demais.
  if (!r.ok) throw new Error(corpo.erro || ([504, 524].includes(r.status) ? "Demorou mais que o normal. Tente de novo." : "Algo falhou. Tente de novo."));
  return corpo;
}

// Turnstile (o "não sou robô" invisível da Cloudflare) no roteiro grátis e no Pix. Desligado enquanto a chave
// do site estiver vazia; ligar junto com o TURNSTILE_SECRET na Cloudflare (sem a chave aqui, o servidor recusaria).
const TURNSTILE_SITE_KEY = "";
let turnstilePronto = null;
function tokenTurnstile() {
  if (!TURNSTILE_SITE_KEY) return Promise.resolve(undefined);
  turnstilePronto ||= new Promise((ok, erro) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.onload = ok; s.onerror = () => { turnstilePronto = null; erro(new Error("Não deu para carregar a verificação. Recarregue a página.")); };
    document.head.appendChild(s);
  });
  return turnstilePronto.then(() => new Promise((ok, erro) => {
    const caixa = document.createElement("div");
    document.body.appendChild(caixa);
    const id = window.turnstile.render(caixa, {
      sitekey: TURNSTILE_SITE_KEY, appearance: "interaction-only",
      callback: t => { ok(t); setTimeout(() => { window.turnstile.remove(id); caixa.remove(); }, 0); },
      "error-callback": () => { erro(new Error("Não conseguimos confirmar que é você. Tente de novo.")); caixa.remove(); }
    });
  }));
}

let state = null;
let pedido = null;

// Eventos do Pixel da Meta, para medir o funil nos anúncios (sem pixel, como no app de celular, não faz nada).
const evento = (nome, dados) => window.fbq?.("trackCustom", nome, dados);

// auto: o veredito veio do link do anúncio, sem clique. Vira outro evento, para não inflar o VerSeVaiDar.
async function calcular(auto = false) {
  pedido?.abort();
  const meu = pedido = new AbortController();
  $("go").disabled = $("sugerir").disabled = true;
  setStatus(""); // erro da tentativa anterior não fica na tela durante a nova
  const parar = voando($("go"), FRASES_CALCULO);
  try {
    const form = lerForm();
    evento(auto ? "VerSeVaiDarAuto" : "VerSeVaiDar", { tipo: form.destinos.length ? "destino" : "sugestao", orcamento: form.orcamento });
    const r = await postar("/api/veredito", form, meu.signal);
    // O foco (ex.: "Pokémon") não volta do servidor: guarda o que foi pedido para o roteiro.
    state = { ...r, foco: form.foco, roteiro: null };
    setStatus("");
    render(true);
  } catch (e) {
    if (e.name !== "AbortError") setStatus(e.message, true);
  } finally {
    // Só o pedido mais recente libera os botões.
    if (pedido === meu) { parar(); $("go").disabled = $("sugerir").disabled = false; }
  }
}

function escolher(i) {
  const c = state.opcoes[i];
  if (!c) return;
  state.atual = c; state.roteiro = null;
  render(false);
}

// Links de afiliado (Travelpayouts). O Partner ID não é segredo: vai na própria URL.
const MARKER = "786422";
const KLOOK = "https://klook.tpk.ro/t8LpLDQI";
const ddmm = iso => iso.slice(8, 10) + iso.slice(5, 7);
// Busca no Aviasales pelo código da cidade (pega todos os aeroportos): SAO2011RIO25112 = de GRU em 20/11 para GIG, volta 25/11, 2 adultos.
const linkAviasales = (de, ida, para, volta, pessoas) =>
  `https://www.aviasales.com/search/${de}${ddmm(ida)}${para}${volta ? ddmm(volta) : ""}${Math.min(9, pessoas)}?marker=${MARKER}`;
const noExterior = c => String(c.destino.p || "").split(", ").some(p => p && p !== "Brasil");
const EKTA = "https://ektatraveling.tpk.ro/I21iymDa";
const AIRALO = "https://airalo.tpk.ro/3Dr6HCBJ";
const YESIM = "https://yesim.tpk.ro/UF3inyHx";
// Países do Acordo de Schengen entre os destinos: lá o seguro viagem é exigido na entrada.
const SCHENGEN = new Set(["França", "Portugal", "Espanha", "Itália", "Alemanha", "Holanda", "Suíça", "Grécia", "Áustria", "Bélgica", "República Tcheca", "Hungria", "Croácia", "Islândia"]);

// Seguro e internet para quem vai para fora: links de afiliado, fora do total do orçamento.
function cartaoExterior(c) {
  const paises = String(c.destino.p).split(", ").filter(p => p && p !== "Brasil");
  const exigido = paises.some(p => SCHENGEN.has(p));
  return `
    <section class="card">
      <h3>Antes de embarcar</h3>
      <ul class="extras">
        <li><b>Seguro viagem</b><small>${exigido ? "Obrigatório para entrar na Europa (Schengen): cobertura médica mínima de 30 mil euros." : "Recomendado: uma consulta médica no exterior pode custar mais que a viagem toda."}</small>
          <a class="link" href="${EKTA}" target="_blank" rel="noopener sponsored">Cotar seguro na EKTA ↗</a></li>
        <li><b>Chip de internet (eSIM)</b><small>Funciona assim que o avião pousa, sem roaming da operadora. Compare o pacote do destino nas duas lojas e fique com o mais barato.</small>
          <span class="links"><a class="link" href="${AIRALO}" target="_blank" rel="noopener sponsored">Airalo ↗</a><a class="link" href="${YESIM}" target="_blank" rel="noopener sponsored">Yesim ↗</a></span></li>
      </ul>
      <p class="hint">Esses dois custos não entram no total acima.</p>
    </section>`;
}
const linkKlook = `<a class="link" href="${KLOOK}" target="_blank" rel="noopener sponsored" style="display:block;margin-top:6px">Trem e ônibus por lá na Klook ↗</a>`;

function links(c, f) {
  const google = "https://www.google.com/travel/flights?q=" + encodeURIComponent(`Voos de ${c.origem.ap} para ${c.destino.ap} em ${f.ida} volta ${f.volta}`) + "&curr=BRL&hl=pt-BR";
  const flights = c.linkVoo || linkAviasales(c.origem.iata || c.origem.ap, f.ida, c.destino.iata || c.destino.ap, f.volta, f.pessoas);
  const p = new URLSearchParams({ ss: c.destino.n, group_adults: String(f.pessoas), checkin: f.ida, checkout: f.volta });
  return { flights, google, vooReal: !!c.linkVoo, hotels: "https://www.booking.com/searchresults.pt-br.html?" + p.toString() };
}

const linkOnibus = (de, para) => "https://www.google.com/search?" + new URLSearchParams({ q: `passagem de ônibus ${de} para ${para}` });
const linkGoogle = (de, para, data) => "https://www.google.com/travel/flights?q=" + encodeURIComponent(`Voos só ida de ${de} para ${para} em ${data}`) + "&curr=BRL&hl=pt-BR";
const linkBooking = (cidade, pessoas, checkin, noites) => {
  const d = new Date(checkin + "T12:00:00"); d.setDate(d.getDate() + noites);
  return "https://www.booking.com/searchresults.pt-br.html?" + new URLSearchParams({ ss: cidade, group_adults: String(pessoas), checkin, checkout: d.toISOString().slice(0, 10) });
};
const dataCurta = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);

// Cartões de passagem e hospedagem da viagem por várias cidades: um trecho e uma cidade por linha.
function cartoesViagem(c, f) {
  return `
    <div class="two">
      <section class="card">
        <span class="eyebrow">Passagens por pessoa · ${c.fonteVoo === "aviasales" ? "preços encontrados" : c.fonteVoo === "misto" ? "alguns preços encontrados" : "estimativa"}</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${c.trechos.length} trechos só de ida</p></div>
        <ul class="trechos">${c.trechos.map(t => `<li>
          <span>${esc(t.de)} → ${esc(t.para)} · ${dataCurta(t.data)}${t.meio === "onibus" ? ` · ônibus, ~${t.horas} h` : ""}</span><span class="v">${brl(t.porPessoa)}${t.fonte === "aviasales" ? "" : "*"}</span>
          ${t.meio === "onibus"
            ? `<a class="link" href="${esc(linkOnibus(t.deNome, t.paraNome))}" target="_blank" rel="noopener">Ver ônibus ↗</a>`
            : `<span class="links"><a class="link" href="${esc(t.link || linkAviasales(t.deIata || t.de, t.data, t.paraIata || t.para, null, f.pessoas))}" target="_blank" rel="noopener sponsored">Aviasales ↗</a>
               <a class="link" href="${esc(linkGoogle(t.de, t.para, t.data))}" target="_blank" rel="noopener">Google Voos ↗</a></span>`}</li>`).join("")}</ul>
        ${noExterior(c) ? linkKlook : ""}
        ${c.fonteVoo === "aviasales" ? "" : '<p class="hint">* estimativa: não achamos busca recente desse trecho.</p>'}
      </section>
      <section class="card">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <ul class="trechos">${c.paradas.map(p => `<li>
          <span>${esc(p.n)} · ${p.noites} ${p.noites > 1 ? "noites" : "noite"}</span><span class="v">${brl(p.diaria)}/noite</span>
          <a class="link" href="${esc(linkBooking(p.n, f.pessoas, p.checkin, p.noites))}" target="_blank" rel="noopener sponsored">Booking ↗</a></li>`).join("")}</ul>
        <p class="hint">Média por quarto para o estilo ${ESTILOS[f.estilo]}.</p>
      </section>
    </div>`;
}

// Passagem da viagem para um destino: avião, ônibus ou nenhuma (destino na própria cidade).
function cartaoPassagem(c, f, L) {
  if (!c.meio) return `<span class="eyebrow">Passagem</span><div class="kv"><span class="price">${brl(0)}</span><p>${esc(c.destino.n)} fica na sua cidade.</p></div>`;
  if (c.meio === "onibus") return `
        <span class="eyebrow">Passagem de ônibus por pessoa · estimativa</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${esc(c.origem.n)} → ${esc(c.destino.n)}, ida e volta, cerca de ${c.horasOnibus} h por trecho</p></div>
        <a class="link" href="${esc(linkOnibus(c.origem.n, c.destino.n))}" target="_blank" rel="noopener">Ver horários e preços de ônibus ↗</a>
        ${c.destino.ap ? `<a class="link" href="${esc(L.google)}" target="_blank" rel="noopener" style="display:block;margin-top:6px">Prefere avião? Ver no Google Voos ↗</a>` : ""}`;
  return `
        <span class="eyebrow">Passagem por pessoa${c.fonteVoo === "aviasales" ? " · preço encontrado" : " · estimativa"}</span>
        <div class="kv"><span class="price">${brl(c.vooPessoa)}</span><p>${esc(c.origem.n)} (${esc(c.origem.ap)}) → ${esc(c.destino.n)} (${esc(c.destino.ap)}), ida e volta</p></div>
        <a class="link" href="${esc(L.flights)}" target="_blank" rel="noopener sponsored">${L.vooReal ? "Ver essa passagem no Aviasales ↗" : "Buscar passagens no Aviasales ↗"}</a>
        <a class="link" href="${esc(L.google)}" target="_blank" rel="noopener" style="display:block;margin-top:6px">Comparar no Google Voos ↗</a>
        ${noExterior(c) ? linkKlook : ""}`;
}

// Sugestão que não cabe: o app não diz "não vai dar", mostra quanto falta ("com mais um pouquinho você iria").
// "Com mais um pouquinho": sugestão que não cabe, ou destino alternativo mostrado porque nenhum outro cabe (perto).
const quase = (o, modo = state?.modo) => (modo === "sugestao" || o.perto) && o.estado === "nao_cabe";
const rotulo = (o, modo) => quase(o, modo) ? `com mais ${brl(-o.diff)}` : ESTADO[o.estado];

function opcoesHtml(opcoes, atual, filtro = () => true) {
  return `<div class="options">${opcoes.map((o, i) => filtro(o) ? `
    <button type="button" class="opt" data-i="${i}" aria-current="${o === atual}">
      <span class="t">${esc(o.destino.n)}</span><span class="v">${brl(o.total)}</span>
      <small>${quase(o) ? `com mais ${brl(-o.diff)}` : `${ESTADO[o.estado]} · ${o.diff >= 0 ? "sobra " + brl(o.diff) : "falta " + brl(-o.diff)}`}${o.meio === "onibus" ? " · de ônibus" : ""}${o.ida ? ` · ${dataCurta(o.ida)} a ${dataCurta(o.volta)}` : ""}${o.noitesCabem ? ` · cabe com ${o.noitesCabem} ${o.noitesCabem > 1 ? "noites" : "noite"}` : ""}${o.match ? " · combina com o que vocês curtem" : ""}</small>
    </button>` : "").join("")}</div>`;
}

function render(fresh) {
  const { entrada: e, atual: c } = state; const f = comDatas(e, c);
  const manchete = quase(c) ? `Com mais ${brl(-c.diff)} você vai para ${esc(c.destino.n)}`
    : c.estado === "cabe" ? `Dá para ir e ainda sobra ${brl(c.diff)}`
    : c.estado === "apertado" ? "Cabe, mas no limite" : `Faltam ${brl(-c.diff)} para essa viagem`;
  const sum = c.itens.reduce((s, i) => s + i.valor, 0) || 1;
  const L = links(c, f);
  const comparar = state.modo === "comparar";
  const viagem = state.modo === "viagem";
  const ajuste = viagem && c.estado === "nao_cabe" ? "Tente menos cidades, menos noites ou o estilo econômico."
    : comparar && c.estado === "nao_cabe" ? "Nenhum dos destinos escolhidos cabe nesse valor. Tire o filtro para ver o que cabe no seu orçamento."
    : quase(c)
    ? (c.noitesCabem ? `Ou vá com ${c.noitesCabem} ${c.noitesCabem > 1 ? "noites" : "noite"} em vez de ${f.noites} e fica dentro dos ${brl(f.orcamento)}.` : "Ou tente menos noites ou menos pessoas para caber no valor.")
    : state.modo === "destino" && c.estado === "nao_cabe"
    ? (state.noitesMax ? `Com ${state.noitesMax} ${state.noitesMax > 1 ? "noites" : "noite"} em vez de ${f.noites}, ${esc(c.destino.n)} cabe no orçamento.` : f.noites > NOITES_MIN_SUGESTAO ? `Nem com ${NOITES_MIN_SUGESTAO} noites ${esc(c.destino.n)} cabe nesse valor.` : `${esc(c.destino.n)} não cabe nesse valor.`) : "";
  const mostrarOpcoes = state.modo === "destino" ? state.opcoes.length > 0 : state.opcoes.length > 1;
  const r = $("result");
  r.className = "result" + (fresh ? " fresh" : "");
  r.innerHTML = `
    <article class="verdict" data-state="${quase(c) ? "quase" : c.estado}">
      <span class="pill">${quase(c) ? "Com mais um pouquinho" : ESTADO[c.estado]}</span>
      <div class="eyebrow">${viagem ? `Viagem por ${c.paradas.length} cidades · ${c.paradas.map(p => `${esc(p.n)} (${p.noites})`).join(" → ")}` : `${quase(c) ? "Mais perto do seu orçamento · " : state.modo === "sugestao" ? "Nossa sugestão · " : comparar ? "Melhor entre os escolhidos · " : ""}${esc(c.destino.n)}, ${esc(c.destino.p)}`} · ${noitesTxt(f.noites)} · ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} · ${ESTILOS[f.estilo]}</div>
      <h2>${manchete}</h2>
      ${viagem ? "" : `<p class="clima" id="clima" hidden></p>`}
      ${e.flexivel ? `<p class="datas-achadas">${viagem ? `Datas de exemplo: ${dataCurta(f.ida)} a ${dataCurta(f.volta)}. Na viagem por várias cidades ainda não buscamos os dias mais baratos.` : c.ida ? `Dias mais baratos que achamos: ${dataCurta(c.ida)} a ${dataCurta(c.volta)}` : c.meio === "onibus" ? `De ônibus o preço quase não muda com a data. Usamos ${dataCurta(f.ida)} a ${dataCurta(f.volta)} como exemplo.` : `Ainda não há preço de voo com ${noitesTxt(f.noites)} nesse mês. Usamos ${dataCurta(f.ida)} a ${dataCurta(f.volta)} como exemplo.`}</p>` : ""}
      ${ajuste ? `<p>${ajuste}</p>` : c.estado === "apertado" ? "<p>Sobra pouco para imprevistos. Vale comprar a passagem logo, antes de o preço subir.</p>" : ""}
      ${state.modo === "destino" && c.estado === "nao_cabe" && !c.perto && state.mudancas?.length ? `<ul class="mudancas">${state.mudancas.map(m => `<li>${esc(m.texto)}: ${brl(m.total)} · ${m.estado !== "nao_cabe" ? "<b>cabe</b>" : `ainda faltam ${brl(-m.diff)}`}</li>`).join("")}</ul>` : ""}
      <div class="nums">
        <div><span class="eyebrow">Seu orçamento</span><b>${brl(f.orcamento)}</b></div>
        <div><span class="eyebrow">Custo estimado</span><b>${brl(c.total)}</b></div>
        <div class="diff"><span class="eyebrow">${c.diff >= 0 ? "Sobra" : "Falta"}</span><b>${brl(Math.abs(c.diff))}</b></div>
      </div>
      <div class="acoes-viagem">
        <button type="button" id="salvar">${salvas.some(v => v.id === idViagem()) ? "Salva ✓" : "Salvar viagem"}</button>
        <button type="button" id="compartilhar">Compartilhar</button>
      </div>
    </article>
    ${mostrarOpcoes ? `
    <section class="card">
      <h3>${comparar ? "Comparando os destinos que você escolheu" : state.opcoes.every(quase) ? "Lugares que com mais um pouquinho você iria" : state.modo === "sugestao" ? `As melhores viagens para ${brl(f.orcamento)}` : "Destinos que cabem no seu orçamento"}</h3>
      ${state.modo === "sugestao"
        ? ["nacional", "internacional"].map(g => {
          const doGrupo = state.opcoes.filter(o => o.grupo === g);
          if (!doGrupo.length) return "";
          const titulo = (g === "nacional" ? "No Brasil" : "No exterior") + (doGrupo.every(quase) && !state.opcoes.every(quase) ? " · com mais um pouquinho" : "");
          return `<div class="grupo-titulo">${titulo}</div>${opcoesHtml(state.opcoes, c, o => o.grupo === g)}`;
        }).join("")
        : opcoesHtml(state.opcoes, c)}
    </section>` : ""}
    <section class="card dinheiro">
      <h3>Para onde vai o dinheiro</h3>
      <div class="bar" role="img" aria-label="Divisão do custo por categoria">${c.itens.map((it, i) => `<i style="width:${it.valor / sum * 100}%;background:${COLORS[i]}"></i>`).join("")}</div>
      <ul class="legend">${c.itens.map((it, i) => `<li><span class="sw" style="background:${COLORS[i]}"></span><span>${esc(it.categoria)}<small>${esc(it.detalhe)}</small></span><span class="v">${brl(it.valor)}</span></li>`).join("")}</ul>
    </section>
    ${viagem ? cartoesViagem(c, f) : `<div class="two">
      <section class="card${c.meio ? " bilhete" : ""}">${cartaoPassagem(c, f, L)}</section>
      <section class="card hotel">
        <img class="card-foto" src="/img/hotel.jpg" alt="" loading="lazy">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <div class="kv"><span class="price">${brl(c.diaria)}<small style="font-size:13px;font-weight:500"> /noite por quarto</small></span><p>Média para o estilo ${ESTILOS[f.estilo]}</p></div>
        <a class="link" href="${esc(L.hotels)}" target="_blank" rel="noopener sponsored">Ver hotéis na Booking ↗</a>
      </section>
    </div>`}
    ${noExterior(c) ? cartaoExterior(c) : ""}
    ${c.estado === "nao_cabe" && !quase(c) && !state.roteiro?.dias ? "" : `<section class="card" id="roteiro-card"></section>`}
  `;
  r.querySelectorAll(".opt").forEach(b => b.onclick = () => escolher(Number(b.dataset.i)));
  $("salvar").onclick = salvarViagem;
  $("compartilhar").onclick = compartilhar;
  if (!viagem) mostrarClima(c.destino.n, Number(String(f.ida).slice(5, 7)));
  renderRoteiro();
}

// Temperatura média do destino no mês da ida (normais da NASA, pelo /api/clima). Sem dado, a linha fica escondida.
const climas = new Map();
let climaVez = 0;
async function mostrarClima(destino, mes) {
  const vez = ++climaVez;
  if (!(mes >= 1 && mes <= 12)) return;
  const chave = `${destino}|${mes}`;
  if (!climas.has(chave)) {
    climas.set(chave, fetch(`${API}/api/clima?${new URLSearchParams({ destino, mes })}`)
      .then(r => r.ok ? r.json() : null).then(j => j?.clima || null).catch(() => null));
  }
  const clima = await climas.get(chave);
  if (!clima) { climas.delete(chave); return; }
  const el = $("clima");
  // A tela pode ter mudado (outro destino ou outro mês) enquanto a resposta vinha.
  if (!el || vez !== climaVez) return;
  el.textContent = `Em ${MESES[mes - 1]}, ${destino} costuma ter mínimas de ${clima.min} °C e máximas de ${clima.max} °C.`;
  el.hidden = false;
}

// ---- Botão "voando": avião cruzando o botão e frases que se alternam enquanto espera ----
const FRASES_CALCULO = ["Calculando os melhores preços…", "Procurando passagens…", "Comparando hospedagens…", "Vendo se vai dar…"];
const FRASES_ROTEIRO = ["Montando o melhor roteiro para sua viagem…", "Procurando restaurantes no Google Maps…", "Organizando os passeios por bairro…", "Conferindo a verba de cada dia…", "Quase lá…"];
function voando(botao, frases) {
  if (!botao) return () => {};
  const original = botao.innerHTML;
  let i = 0, t;
  const pintar = () => {
    botao.innerHTML = `<span class="aviao" aria-hidden="true">✈\uFE0E</span><span class="frase" aria-hidden="true">${frases[i]}</span>`;
    // A última frase fica parada até a resposta chegar.
    if (++i >= frases.length) clearInterval(t);
  };
  // Leitor de tela ouve um aviso só (o botão pode estar numa região aria-live), não cada troca de frase.
  botao.setAttribute("aria-label", frases[0]);
  botao.classList.add("voando");
  pintar();
  if (i < frases.length) t = setInterval(pintar, 2400);
  return () => {
    clearInterval(t);
    botao.classList.remove("voando");
    botao.removeAttribute("aria-label");
    if (botao.isConnected) botao.innerHTML = original;
  };
}
let pararRoteiro = null;

// ---- Roteiro com IA: só quando a pessoa pede ----
let ctlRoteiro = null;

function renderRoteiro() {
  pararRoteiro?.(); pararRoteiro = null;
  const card = $("roteiro-card");
  if (!card) return;
  const ro = state.roteiro;
  pararPix();
  if (ro?.dias && ro.completo) {
    card.innerHTML = roteiroTop(ro);
    $("baixar").onclick = () => leadOk() ? baixarRoteiro() : pedirEmail();
    return;
  }
  if (ro?.dias) {
    card.innerHTML = `
      <h3>${ro.completo ? "Roteiro Detalhado" : "Roteiro dia a dia"} em ${esc(ro.ordem?.join(" + ") || state.atual.destino.n)}</h3>
      ${ro.apresentacao ? `<p class="apresentacao">${esc(ro.apresentacao)}</p>` : ""}
      ${ro.resumido ? `<p class="hint">Sua viagem tem ${esc(ro.resumido.viagem)} dias; o roteiro vai até ${esc(ro.resumido.dias)} dias${new Set(ro.dias.map(d => d.cidade)).size > 1 ? ", divididos entre as cidades" : ", os primeiros da viagem"}.</p>` : ""}
      <div class="days">${ro.dias.map(d => `
        <div class="day"><span class="n">DIA ${esc(d.dia)}</span><div><h4>${esc(d.titulo)}</h4>${regiaoDoDia(d) ? `<small class="hint">${esc(regiaoDoDia(d))}</small>` : ""}${ro.completoAVenda && !ro.completo ? `<a class="seg-trava nao-imprimir" href="#completo-box">${ICONE_CADEADO} Segurança desta área, de 1 a 5 estrelas, no Roteiro Detalhado</a>` : ""}${fotoDoDia(d)}${d.sobreRegiao ? `<p class="sobre">${esc(d.sobreRegiao)}</p>` : ""}<ul>${itensDoDia(d).map(a => `<li${a.refeicao ? ' class="ref"' : ""}><span class="p">${esc(a.horario || String(a.periodo).toLowerCase())}</span><a class="lugar" href="${a.maps ? esc(a.maps) : mapa(a.nome, d.cidade, a.bairro)}" target="_blank" rel="noopener">${esc(a.nome)} ↗</a><span class="c">${Number(a.custo) ? brl(a.custo) : "grátis"}</span>${a.descricao ? `<small class="desc">${esc(a.descricao)}</small>` : ""}${a.comoChegar ? `<small class="dica">Como chegar: ${esc(a.comoChegar)}</small>` : ""}${a.dica ? `<small class="dica">${a.descricao ? "Dica: " : ""}${esc(a.dica)}</small>` : ""}</li>`).join("")}</ul>${ro.completo ? `<p class="hint gasto">Gasto previsto no dia: ${brl(gastoDoDia(d))} para o grupo</p>` : ""}</div></div>`).join("")}
      </div>
      ${(ro.fontes || []).length ? `<details class="fontes"><summary class="hint">Fontes: Google Maps (${ro.fontes.length} ${ro.fontes.length > 1 ? "lugares" : "lugar"})</summary><ul class="hint">${ro.fontes.map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nome)}</a> · Google Maps</li>`).join("")}</ul></details>` : ""}
      ${ro.totalPasseios != null ? `<p class="hint">Passeios: ${brl(ro.totalPasseios)} de ${brl(ro.verba)} de verba.${ro.totalRefeicoes ? ` Almoços e jantares sugeridos: cerca de ${brl(ro.totalRefeicoes)} (já contam na alimentação).` : ""}</p>` : ""}
      ${ro.acimaDaVerba ? `<div class="warn-box">Este roteiro passou da verba de passeios. Troque alguma atividade paga por uma grátis.</div>` : ""}
      ${(ro.dicas || []).length ? `<h3>${ro.completo ? "Dicas da viagem" : "Como economizar"}</h3><ul class="tips">${ro.dicas.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${ro.completoAVenda && !ro.completo ? cartaoCompleto() : ""}
      <div class="baixar nao-imprimir" id="baixar-box"><button type="button" class="primary" id="baixar">Baixar roteiro em PDF</button></div>`;
    $("baixar").onclick = () => leadOk() ? baixarRoteiro() : pedirEmail();
    if (ro.completoAVenda && !ro.completo) ligarCompleto();
    return;
  }
  const busy = ro?.loading;
  card.innerHTML = `
    <div class="roteiro-cta">
      <h3>Quer o roteiro dia a dia?</h3>
      <p class="hint" style="margin:0">Montamos passeios, almoço e jantar de cada dia dentro da verba acima.</p>
      <div class="actions"><button type="button" class="primary" id="gerar" ${busy ? "disabled" : ""}>Montar roteiro</button>${busy ? '<button type="button" id="parar">Parar</button>' : ""}</div>
      ${busy ? `<p class="hint" style="margin:0">Pode levar cerca de 1 minuto. Fique nesta tela, o roteiro aparece aqui.</p>` : ""}
      ${ro?.erro ? `<div class="warn-box">${esc(ro.erro)}</div>` : ""}
    </div>`;
  if (busy) pararRoteiro = voando($("gerar"), FRASES_ROTEIRO);
  $("gerar")?.addEventListener("click", gerarRoteiro);
  $("parar")?.addEventListener("click", () => ctlRoteiro?.abort());
}

// Atividades e refeições do dia na ordem: manhã, almoço, tarde, jantar, noite.
const ORDEM = ["manh", "almo", "tard", "jant", "noit"];
const posicao = periodo => { const i = ORDEM.findIndex(o => String(periodo).toLowerCase().startsWith(o)); return i < 0 ? 2 : i; };
function itensDoDia(d) {
  const refeicoes = [["almoço", d.almoco], ["jantar", d.jantar]].filter(([, r]) => r?.nome).map(([periodo, r]) => ({ periodo, nome: r.nome, bairro: r.bairro, custo: r.custo, maps: r.maps, horario: r.horario, dica: r.dica, descricao: r.descricao, comoChegar: r.comoChegar, refeicao: true }));
  const itens = [...(d.atividades || []), ...refeicoes];
  // No roteiro completo, a ordem é a dos horários ("09:00–11:30").
  const porHora = itens.every(a => /^\d{1,2}:\d{2}/.test(a.horario || ""));
  const chave = a => porHora ? a.horario.padStart(5, "0") : posicao(a.periodo);
  return itens.map((a, i) => ({ a, i })).sort((x, y) => (chave(x.a) < chave(y.a) ? -1 : chave(x.a) > chave(y.a) ? 1 : 0) || x.i - y.i).map(x => x.a);
}

// Região do dia (ex.: "Barra"), e a cidade quando a viagem tem várias.
const regiaoDoDia = d => [d.regiao, state.atual.paradas && d.cidade].filter(Boolean).join(" · ");

// Roteiro completo: passeios, almoço e jantar do dia somados.
const gastoDoDia = d => [...(d.atividades || []), d.almoco, d.jantar].reduce((t, a) => t + (Number(a?.custo) || 0), 0);

// Foto da atração em destaque do dia (roteiro completo), com autor e licença do Wikimedia Commons.
const destaqueComFoto = d => (d.atividades || []).find(x => x.foto?.url?.startsWith("https://upload.wikimedia.org/"));
function fotoDoDia(d) {
  const a = destaqueComFoto(d);
  if (!a) return "";
  const f = a.foto;
  return `<figure class="foto"><img src="${esc(f.url)}" alt="${esc(a.nome)}" loading="lazy"><figcaption>${esc(a.nome)} · Foto: <a href="${esc(f.pagina)}" target="_blank" rel="noopener">${esc(f.autor)}, ${esc(f.licenca)}</a>, Wikimedia Commons</figcaption></figure>`;
}

// ---- Roteiro Top (completo, pago): capa, carta com o nome, resumo dos dias, um bloco por dia, dicas e contracapa ----
// Na tela é uma página só; no PDF cada bloco vira uma página A4 (ver @media print em index.html).
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const diaMes = iso => ({ d: Number(iso.slice(8, 10)), m: Number(iso.slice(5, 7)) - 1, a: iso.slice(0, 4) });
const dataBilhete = iso => iso ? `${diaMes(iso).d} ${MESES[diaMes(iso).m].slice(0, 3)}` : "";
function periodoLongo(ida, volta) {
  if (!ida) return "";
  const a = diaMes(ida), b = volta ? diaMes(volta) : null;
  if (!b) return `${a.d} de ${MESES[a.m]} de ${a.a}`;
  if (a.m === b.m && a.a === b.a) return `${a.d} a ${b.d} de ${MESES[b.m]} de ${b.a}`;
  return `${a.d} de ${MESES[a.m]} a ${b.d} de ${MESES[b.m]} de ${b.a}`;
}
const ESTRELA = '<span class="top-estrela" aria-hidden="true">✦</span>';
const ICONE_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ICONE_ROTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
// Segurança da região (1 a 5, mais estrelas = mais tranquila).
const estrelas = n => `<span class="estrelas" role="img" aria-label="Segurança ${n} de 5">${"★".repeat(n)}<span class="apagadas">${"★".repeat(5 - n)}</span></span>`;
const ICONE_CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ICONE_ESCUDO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6l-8-3Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ICONE_AVIAO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5Z" fill="currentColor"/></svg>';

function roteiroTop(ro) {
  const { entrada: e, atual: c } = state; const f = comDatas(e, c);
  const nome = ro.nome || "";
  const de = nome ? `de ${nome}` : ""; // "de Ana": sem artigo, que depende do gênero
  const cidade = ro.ordem?.join(" + ") || c.destino.n;
  const n = ro.dias.length;
  const pessoas = f.pessoas;
  const gastoTotal = ro.dias.reduce((t, d) => t + gastoDoDia(d), 0);
  const lugares = ro.dias.reduce((t, d) => t + itensDoDia(d).length, 0);
  const capaFoto = ro.dias.map(destaqueComFoto).find(Boolean);
  // Bilhete: primeira cidade na ordem escolhida no Pix (a pessoa pode ter trocado a ordem do cálculo).
  const chegada = (ro.ordem && c.paradas?.find(p => p.n === ro.ordem[0])) || c.paradas?.[0] || c.destino;
  const imgFoto = (a, cls) => `<img class="${cls}" src="${esc(a.foto.url)}" alt="${esc(a.nome)}">`;
  const credito = a => `<a href="${esc(a.foto.pagina)}" target="_blank" rel="noopener">Foto: ${esc(a.foto.autor)}, ${esc(a.foto.licenca)}, via Wikimedia Commons</a>`;
  // Logo da marca: a versão escura (texto claro) vai nas páginas de fundo verde ou com foto.
  const logo = escuro => `<img class="top-logo" src="/marca/${escuro ? "logo-escuro" : "logo"}.png" alt="Vai Dar Viagem" width="640" height="223">`;
  const cab = escuro => `<div class="pg-cab"><span>Roteiro ${esc(de || "Detalhado")}, ${esc(cidade)}</span>${logo(escuro)}</div>`;
  const rod = `<div class="pg-rod"><span>${ESTRELA} Roteiro Detalhado${nome ? `, feito para ${esc(nome)}` : ""}</span><span>vaidarviagem.com.br</span></div>`;
  const titulo = nome ? `${esc(nome)}, sua ${esc(cidade)} em ${n} dias` : `Sua ${esc(cidade)} em ${n} dias`;
  const hoje = new Date().toISOString().slice(0, 10);

  const capa = `
    <section class="pg top-capa">
      ${capaFoto ? imgFoto(capaFoto, "top-capa-img") : ""}
      <div class="top-capa-logo">${logo(true)}</div>
      <div class="top-capa-txt">
        <p class="top-kicker">${ESTRELA} Roteiro Detalhado, Vai Dar Viagem</p>
        <h2>${titulo}</h2>
        <p class="top-sub">${esc(periodoLongo(f.ida, f.volta))}${f.ida ? ", " : ""}para ${pessoas} ${pessoas > 1 ? "pessoas" : "pessoa"}</p>
        <div class="top-bilhete">
          <div class="top-trecho"><div><small>${esc(c.origem?.n || "")}</small><b>${esc(c.origem?.ap || c.origem?.iata || "")}</b></div><span class="top-voo">${ICONE_AVIAO}</span><div class="dir"><small>${esc(chegada.n)}</small><b>${esc(chegada.ap || chegada.iata || "")}</b></div></div>
          <div class="top-bilhete-info"><div><small>Ida</small><b>${esc(dataBilhete(f.ida))}</b></div><div><small>Volta</small><b>${esc(dataBilhete(f.volta))}</b></div><div><small>Pessoas</small><b>${pessoas}</b></div><div><small>Previsto</small><b>${brl(c.total)}</b></div></div>
        </div>
        <div class="top-capa-rod"><span>Feito ${nome ? `para ${esc(nome)} ` : ""}em ${esc(periodoLongo(hoje))}</span><span>vaidarviagem.com.br</span></div>
      </div>
    </section>`;

  const carta = `
    <section class="pg top-carta">
      ${cab()}
      <p class="top-kicker">${ESTRELA} Roteiro Detalhado</p>
      <h2 class="top-oi">${nome ? `Oi, ${esc(nome)}` : "Oi!"}</h2>
      ${ro.apresentacao ? `<p class="top-texto">${esc(ro.apresentacao)}</p>` : ""}
      ${ro.resumido ? `<p class="top-texto suave">Sua viagem tem ${esc(ro.resumido.viagem)} dias; este roteiro detalha ${esc(ro.resumido.dias)} deles${new Set(ro.dias.map(d => d.cidade)).size > 1 ? ", divididos entre as cidades" : ", os primeiros da viagem"}.</p>` : ""}
      <p class="top-texto suave">Cada dia tem horário, como chegar de um lugar ao outro e uma dica de quem conhece. Os nomes dos lugares abrem no Google Maps.</p>
      ${ro.dias.some(d => d.seguranca) ? `<p class="top-texto suave">As estrelas de segurança (de 1 a 5, quanto mais, mais tranquila a área) são uma estimativa feita a partir de informações públicas. Vale confirmar com o hotel ao chegar.</p>` : ""}
      <p class="top-assina">Boa viagem,<br>equipe Vai Dar Viagem</p>
      <div class="top-numeros">
        <div><b>${n}</b><small>dias em ${esc(cidade)}</small></div>
        <div><b>${pessoas}</b><small>${pessoas > 1 ? "pessoas" : "pessoa"}</small></div>
        <div><b>${lugares}</b><small>lugares com horário</small></div>
        <div><b>${brl(gastoTotal)}</b><small>previstos para passeios e comida</small></div>
      </div>
      ${rod}
    </section>`;

  const resumo = `
    <section class="pg top-resumo">
      ${cab()}
      <p class="top-kicker">${ESTRELA} Roteiro Detalhado</p>
      <h2>Seus ${n} dias</h2>
      <ol class="top-lista">${ro.dias.map(d => { const a = destaqueComFoto(d); return `
        <li><span class="top-num">${esc(d.dia)}</span><div><b>${esc(d.titulo)}</b><small>${esc(regiaoDoDia(d))}</small>${d.seguranca ? `<small class="top-seg-mini">Segurança ${estrelas(d.seguranca)}</small>` : ""}</div><div class="top-valor"><b>${brl(gastoDoDia(d))}</b><small>previsto</small></div>${a ? imgFoto(a, "top-mini") : `<span class="top-mini vazio">${ICONE_PIN}</span>`}</li>`; }).join("")}
      </ol>
      <div class="top-total"><span>Passeios e comida, para ${pessoas} ${pessoas > 1 ? "pessoas" : "pessoa"}</span><b>${brl(gastoTotal)}</b></div>
      ${ro.acimaDaVerba ? `<div class="warn-box">Este roteiro passou da verba de passeios. Troque alguma atividade paga por uma grátis.</div>` : ""}
      ${rod}
    </section>`;

  const dias = ro.dias.map(d => {
    const a = destaqueComFoto(d);
    const topo = `<p class="top-kicker">Dia ${esc(d.dia)} de ${n}</p><h3>${esc(d.titulo)}</h3>`;
    return `
    <section class="pg top-dia">
      ${a ? `<header class="top-dia-foto">${imgFoto(a, "top-dia-img")}${cab(true)}<div>${topo}<small class="top-credito">${credito(a)}</small></div></header>` : `${cab()}<header class="top-dia-sem">${topo}</header>`}
      <div class="top-dia-info">
        <div>
        ${d.sobreRegiao ? `<div class="top-bairro"><p class="top-rotulo">${ICONE_PIN} O bairro${d.regiao ? `: ${esc(d.regiao)}` : ""}</p><p>${esc(d.sobreRegiao)}</p></div>` : ""}
        ${d.seguranca ? `<div class="top-seg"><p class="top-rotulo">${ICONE_ESCUDO} Segurança da área ${estrelas(d.seguranca)}</p>${d.segurancaNota ? `<p>${esc(d.segurancaNota)}</p>` : ""}</div>` : ""}
        </div>
        <div class="top-gasto"><small>Gasto previsto</small><b>${brl(gastoDoDia(d))}</b><small>para ${pessoas} ${pessoas > 1 ? "pessoas" : "pessoa"}</small></div>
      </div>
      <ol class="top-linha">${itensDoDia(d).map(x => `
        <li class="${x.destaque ? "principal" : ""}${x.refeicao ? " ref" : ""}">
          <div class="top-hora"><b>${esc(String(x.horario || "").split(/[–-]/)[0].trim() || x.periodo)}</b><small>${esc(String(x.periodo || "").toLowerCase())}</small></div>
          <div class="top-item">
            <div class="top-item-cab"><a href="${x.maps ? esc(x.maps) : mapa(x.nome, d.cidade, x.bairro)}" target="_blank" rel="noopener">${esc(x.nome)}</a>${x.destaque ? ` ${ESTRELA}` : ""}<span>${Number(x.custo) ? brl(x.custo) : "grátis"}</span></div>
            ${x.descricao ? `<p>${esc(x.descricao)}</p>` : ""}
            ${x.dica ? `<p class="top-dica">${ICONE_PIN}<span>${esc(x.dica)}</span></p>` : ""}
            ${x.comoChegar ? `<p class="top-chegar">${ICONE_ROTA}<span>${esc(x.comoChegar)}</span></p>` : ""}
          </div>
        </li>`).join("")}
      </ol>
      ${rod}
    </section>`;
  }).join("");

  const dicas = (ro.dicas || []).length ? `
    <section class="pg top-dicas">
      ${cab(true)}
      <p class="top-kicker">${ESTRELA} Roteiro Detalhado</p>
      <h2>${ro.dicas.length} dicas para a sua viagem${nome ? `, ${esc(nome)}` : ""}</h2>
      <ol>${ro.dicas.map((t, i) => `<li><b>${String(i + 1).padStart(2, "0")}</b><p>${esc(t)}</p></li>`).join("")}</ol>
      ${rod}
    </section>` : "";

  const fim = `
    <section class="pg top-fim">
      ${capaFoto ? imgFoto(capaFoto, "top-capa-img") : ""}
      <div>
        <span class="top-voo">${ICONE_AVIAO}</span>
        <h2>Boa viagem${nome ? `, ${esc(nome)}` : ""}.</h2>
        <div class="top-marca">${logo(true)}</div>
        <small>Feito em ${esc(periodoLongo(hoje))}. Preços e horários conferidos nessa data, vale confirmar antes de ir.<br>${ro.pagamento ? `Pedido ${esc(ro.pagamento)} · ` : ""}vaidarviagem.com.br</small>
      </div>
    </section>`;

  const fontes = (ro.fontes || []).length ? `<details class="fontes nao-imprimir"><summary class="hint">Fontes: Google Maps (${ro.fontes.length} ${ro.fontes.length > 1 ? "lugares" : "lugar"})</summary><ul class="hint">${ro.fontes.map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.nome)}</a> · Google Maps</li>`).join("")}</ul></details>` : "";
  // Confirmação do pedido na tela (o e-mail de confirmação vem depois): número, valor e o que foi comprado.
  const confirmacao = ro.pagamento ? `<div class="confirmado nao-imprimir"><b>Pagamento confirmado</b><span>Pedido ${esc(ro.pagamento)}${ro.valor ? ` · ${reais(ro.valor)}` : ""} · Roteiro Detalhado de ${esc(cidade)}</span><small>Guarde o número do pedido: com ele e o e-mail do Pix você recupera este roteiro em outro aparelho por 30 dias.</small></div>` : "";
  return `${confirmacao}<div class="top">${capa}${carta}${resumo}${dias}${dicas}${fim}</div>${fontes}
    <div class="baixar nao-imprimir" id="baixar-box"><button type="button" class="primary" id="baixar">Baixar roteiro em PDF</button></div>`;
}

// Busca o lugar no Google Maps, onde a pessoa vê nota, fotos e avaliações. O bairro ajuda a achar o lugar certo.
function mapa(nome, cidade, bairro) {
  const local = [nome, bairro].filter(Boolean).join(", ");
  // A cidade do dia vale também em bate-volta de viagem com um destino só.
  const q = state.atual.paradas ? `${local}, ${cidade || state.atual.paradas[0].n}` : `${local}, ${cidade || state.atual.destino.n}, ${state.atual.destino.p}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// Pedido de roteiro. `paradas`: a ordem das cidades (no roteiro completo, a que a pessoa escolheu).
function pedidoRoteiro(paradas = state.atual.paradas) {
  const { entrada: e, atual: c } = state; const f = comDatas(e, c);
  return {
    destino: paradas ? paradas[0].n : c.destino.n, noites: f.noites,
    paradas: paradas?.map(p => ({ destino: p.n, noites: p.noites })), pessoas: f.pessoas, estilo: f.estilo, interesses: f.interesses, foco: state.foco,
    verbaPasseios: c.itens.find(i => i.categoria === "Passeios").valor,
    verbaAlimentacao: c.itens.find(i => i.categoria === "Alimentação").valor
  };
}

async function gerarRoteiro() {
  const c = state.atual;
  const alvo = c;
  ctlRoteiro = new AbortController();
  evento("MontarRoteiro", { destino: c.destino?.n, veredito: c.estado });
  state.roteiro = { loading: true };
  renderRoteiro();
  try {
    const r = await postar("/api/roteiro", { ...pedidoRoteiro(), turnstile: await tokenTurnstile() }, ctlRoteiro.signal);
    if (state.atual !== alvo) return;
    state.roteiro = r;
    evento("RoteiroPronto", { destino: c.destino?.n });
    if (salvas.some(v => v.id === idViagem())) salvarViagem();
  } catch (e) {
    if (state.atual !== alvo) return;
    state.roteiro = e.name === "AbortError" ? null : { erro: e.message };
  }
  renderRoteiro();
}

// ---- Roteiro completo (pago no Pix): horários de cada lugar, ordem das cidades escolhida e mais dicas ----
const PRECO_COMPLETO = 14.9;
// brl() arredonda para reais inteiros; o preço precisa dos centavos (R$ 14,90).
const reais = v => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
let timerPix = null;
const pararPix = () => { clearInterval(timerPix); timerPix = null; };
// Pix gerado fica guardado no aparelho por viagem: quem fecha ou recarrega a página antes de liberar
// (pagou ou não) volta, monta o roteiro simples de novo e o mesmo Pix reaparece, já sendo conferido.
const PIX_PENDENTE = "pix-pendente";
const SETE_DIAS_MS = 7 * 86400e3;
function lerPendentes() {
  try {
    const todos = JSON.parse(localStorage.getItem(PIX_PENDENTE) || "{}");
    return Object.fromEntries(Object.entries(todos).filter(([, p]) => Date.now() - p.criado < SETE_DIAS_MS));
  } catch { return {}; }
}
function guardarPendente(id, dados) {
  const todos = lerPendentes();
  if (dados) todos[id] = dados; else delete todos[id];
  try { localStorage.setItem(PIX_PENDENTE, JSON.stringify(todos)); } catch {}
}

// Contato do atendimento: o e-mail já vem com o pedido do Pix, o destino e a data, para achar o pagamento na hora.
const CONTATO = "contato@vaidarviagem.com.br";
function linkAjuda(v) {
  const f = comDatas(state.entrada, state.atual);
  const linhas = [
    v.pix?.id ? `Pedido: ${v.pix.id}` : "",
    `Destino: ${state.atual.destino?.n || ""}`,
    f.ida ? `Ida: ${f.ida.split("-").reverse().join("/")}` : "",
    "", "Conte o que aconteceu:", ""
  ].filter((l, i) => l || i > 2);
  const assunto = `Ajuda com o Roteiro Detalhado${v.pix?.id ? ` (${v.pix.id})` : ""}`;
  const href = `mailto:${CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(linhas.join("\n"))}`;
  return `<p class="hint ajuda"><a href="${esc(href)}">Precisa de ajuda?</a> Escreva para ${CONTATO}.</p>`;
}
// "Pague até 14:35" (com a data se virar o dia). Pix antigo, guardado sem a validade, fica sem a linha.
function prazoPix(pix) {
  const d = new Date(pix?.expiraEm || NaN);
  if (isNaN(d)) return "";
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const hoje = d.toDateString() === new Date().toDateString();
  return `Pague até ${hoje ? hora : `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${hora}`}`;
}

function cartaoCompleto() {
  const ro = state.roteiro;
  if (!ro.venda) {
    const p = lerPendentes()[idViagem()];
    ro.venda = { ordem: state.atual.paradas ? [...state.atual.paradas] : null };
    if (p) Object.assign(ro.venda, { pix: p.pix, pedido: p.pedido, email: p.email,
      ordem: ro.venda.ordem && p.ordem.map(n => ro.venda.ordem.find(x => x.n === n)).filter(Boolean) });
  }
  const v = ro.venda;
  const ordem = v.ordem;
  if (v.gerando) return `<div class="completo nao-imprimir" id="completo-box"><h3>Roteiro Detalhado</h3><button type="button" class="primary" id="completo-gerando" disabled></button><p class="hint" style="margin:0">Pagamento recebido. O Roteiro Detalhado pode levar até 3 minutos, porque está sendo feito personalizado com as suas escolhas. Fique nesta tela, ele aparece aqui.</p>${linkAjuda(v)}</div>`;
  return `
    <div class="completo nao-imprimir" id="completo-box">
      <h3>Quer o Roteiro Detalhado? ${reais(v.pix?.preco || PRECO_COMPLETO)}</h3>
      <ul class="hint vantagens">
        <li>Nota de segurança de cada região, de 1 a 5 estrelas, com o cuidado principal de cada lugar</li>
        <li>Horário de cada passeio, almoço e jantar, de acordo com o funcionamento de cada lugar</li>
        <li>Uma dica prática para cada lugar: melhor hora, o que pedir, se precisa reservar</li>
        ${ordem ? "<li>Você escolhe a ordem das cidades</li>" : ""}
        <li>Mais dicas da viagem: transporte, segurança e o que comprar antes</li>
      </ul>
      ${ordem && !v.pix ? `<div class="ordem"><b>Ordem das cidades</b><ol>${ordem.map((p, i) => `<li><span>${esc(p.n)} <small class="hint">${esc(p.noites)} ${p.noites > 1 ? "noites" : "noite"}</small></span><button type="button" class="mover" data-i="${i}" data-d="-1" ${i ? "" : "disabled"} aria-label="Subir ${esc(p.n)}">↑</button><button type="button" class="mover" data-i="${i}" data-d="1" ${i < ordem.length - 1 ? "" : "disabled"} aria-label="Descer ${esc(p.n)}">↓</button></li>`).join("")}</ol><p class="hint" style="margin:0">Os preços acima são da ordem original; a ordem nova vale para o roteiro.</p></div>` : ""}
      ${v.pix ? `
        ${v.pix.qrCode ? `<img class="qr" src="data:image/png;base64,${esc(v.pix.qrCode)}" alt="QR Code do Pix" width="200" height="200">` : ""}
        <p class="pix-info"><b>${esc(prazoPix(v.pix))}</b>${prazoPix(v.pix) ? " · " : ""}Pedido ${esc(v.pix.id)}</p>
        <div class="actions"><button type="button" class="primary" id="pix-copiar">Copiar código Pix</button><button type="button" id="pix-conferir">Já paguei</button></div>
        <p class="hint" style="margin:0">Abra o app do seu banco, escolha Pix copia e cola (ou leia o QR Code) e pague. O Roteiro Detalhado aparece aqui sozinho.</p>` : `
        <form class="lead" id="pix-form" novalidate>
          <label for="pix-nome">Seu primeiro nome (o roteiro vem personalizado para você)</label>
          <input id="pix-nome" type="text" required autocomplete="given-name" maxlength="40" placeholder="Ana" value="${esc(v.nome || "")}">
          <label for="pix-email">Seu e-mail (vai no comprovante)</label>
          <input id="pix-email" type="email" required autocomplete="email" inputmode="email" maxlength="254" placeholder="voce@email.com" value="${esc(v.email || "")}">
          <p class="hint resumo-compra"><b>Roteiro Detalhado: ${reais(PRECO_COMPLETO)}, pagamento único por Pix.</b> Você recebe na tela, logo depois do pagamento, um roteiro dia a dia em PDF para esta simulação. Os preços são estimativas e podem mudar até a hora de reservar. Se mudar de ideia, devolvemos o valor em até 7 dias, sem perguntas. Ao pagar, você aceita os <a href="/termos.html" target="_blank" rel="noopener">Termos de uso</a>.</p>
          <button type="submit" class="primary">Pagar ${reais(PRECO_COMPLETO)} no Pix</button>
        </form>`}
      <div class="status${v.erro ? " err" : ""}" id="pix-status" role="status" aria-live="polite">${esc(v.aviso || "")}</div>
      ${linkAjuda(v)}
    </div>`;
}

function ligarCompleto() {
  const ro = state.roteiro, v = ro.venda;
  const st = $("pix-status");
  const aviso = (msg, err) => { v.aviso = msg; v.erro = err; st.className = "status" + (err ? " err" : ""); st.textContent = msg; };
  if (v.gerando) { pararRoteiro = voando($("completo-gerando"), FRASES_ROTEIRO); return; }
  document.querySelectorAll("#completo-box .mover").forEach(b => b.onclick = () => {
    const i = Number(b.dataset.i), j = i + Number(b.dataset.d);
    [v.ordem[i], v.ordem[j]] = [v.ordem[j], v.ordem[i]];
    renderRoteiro();
  });
  $("pix-form")?.addEventListener("submit", async ev => {
    ev.preventDefault();
    const nome = $("pix-nome").value.replace(/\s+/g, " ").trim().slice(0, 40);
    const email = $("pix-email").value.trim();
    if (!nome) return aviso("Escreva seu nome.", true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return aviso("Confira o e-mail.", true);
    v.nome = nome;
    // Um Pix por vez: dois cliques gerariam duas cobranças, e a pessoa poderia pagar a que o app não acompanha.
    const botao = $("pix-form").querySelector("button");
    if (botao.disabled) return;
    botao.disabled = true;
    aviso("Gerando o Pix…");
    try {
      // O pedido vai junto: o Pix fica preso a este roteiro, nesta ordem de cidades.
      // O nome não muda a referência do Pix: só personaliza o roteiro.
      v.pedido = { ...pedidoRoteiro(v.ordem), completo: true, nome };
      // A tela da viagem vai junto e fica guardada 30 dias: quem pagar e perder o roteiro remonta tudo em outro aparelho.
      const viagem = { entrada: state.entrada, atual: state.atual, modo: state.modo, noitesMax: state.noitesMax, foco: state.foco };
      const pix = await postar("/api/pix", { pedido: v.pedido, email, viagem, turnstile: await tokenTurnstile() });
      if (state.roteiro !== ro) return;
      v.pix = pix; v.email = email; v.aviso = "";
      guardarPendente(idViagem(), { pix, pedido: v.pedido, email, ordem: v.ordem?.map(p => p.n) || [], criado: Date.now() });
      evento("GerouPix", { destino: state.atual.destino?.n });
      renderRoteiro();
    } catch (e) { botao.disabled = false; aviso(e.message, true); }
  });
  if (!v.pix) return;
  $("pix-copiar").onclick = async () => {
    try { await navigator.clipboard.writeText(v.pix.copiaECola); aviso("Código copiado. Cole no app do banco, em Pix copia e cola."); }
    catch { prompt("Copie o código Pix:", v.pix.copiaECola); }
  };
  let conferindo = false;
  const conferir = async manual => {
    if (conferindo) return;
    conferindo = true;
    try {
      // Já pago antes (o roteiro falhou ao montar): tenta montar de novo.
      if (v.pago) return montarCompleto(ro);
      const { status } = await postar("/api/pix", { id: v.pix.id });
      if (state.roteiro !== ro) return;
      if (status === "pago") {
        v.pago = true;
        // Valor do próprio Pix (quem gerou o Pix no preço antigo paga o antigo).
        window.fbq?.("track", "Purchase", { value: v.pix.preco || PRECO_COMPLETO, currency: "BRL" });
        return montarCompleto(ro);
      }
      if (status === "expirado") {
        pararPix(); v.pix = null; guardarPendente(idViagem());
        v.aviso = "O Pix expirou. Gere outro para pagar."; v.erro = true;
        return renderRoteiro();
      }
      if (manual) aviso("Ainda não recebemos o pagamento. Assim que cair, o Roteiro Detalhado aparece aqui.");
    } catch (e) { if (manual) aviso(e.message, true); }
    finally { conferindo = false; }
  };
  $("pix-conferir").onclick = () => conferir(true);
  if (!v.pago) timerPix = setInterval(() => document.hidden || conferir(false), 4000);
}

async function montarCompleto(ro) {
  pararPix();
  const v = ro.venda;
  v.gerando = true; v.aviso = "";
  renderRoteiro();
  try {
    const r = await postar("/api/roteiro", { ...v.pedido, pagamento: v.pix.id });
    if (state.roteiro !== ro) return;
    // O e-mail do Pix também libera o PDF, sem pedir de novo.
    fetch(`${API}/api/lead`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: v.email, novidades: false, destino: state.atual.destino.n }) })
      .then(x => x.ok && x.json()).then(x => { if (x?.guardado) try { localStorage.setItem(LEAD, "1"); } catch {} }).catch(() => {});
    guardarPendente(idViagem());
    state.roteiro = { ...r, completo: true, nome: v.nome || v.pedido?.nome, ordem: v.ordem?.map(p => p.n), pagamento: v.pix.id, valor: v.pix.preco };
    evento("RoteiroCompleto", { destino: state.atual.destino?.n });
    renderRoteiro();
    if (salvas.some(x => x.id === idViagem())) salvarViagem();
  } catch (e) {
    if (state.roteiro !== ro) return;
    v.gerando = false;
    v.aviso = `Pagamento recebido, mas o Roteiro Detalhado não carregou (${e.message}). Toque em "Já paguei" para tentar de novo.`; v.erro = true;
    renderRoteiro();
  }
}

function setStatus(msg, err) { $("status").textContent = msg; $("status").className = "status" + (err ? " err" : ""); }
const calcularEMostrar = (auto = false) => calcular(auto).then(() => state && $("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
$("form").addEventListener("submit", e => {
  e.preventDefault();
  // Sem destino, as sugestões só vêm pelo botão "me sugira destinos".
  if (!lerForm().destinos.length) {
    evento("TentouSemDestino", { orcamento: lerForm().orcamento });
    return setStatus("Escolha um destino ou toque em “me sugira destinos”.", true);
  }
  calcularEMostrar();
});
$("sugerir").addEventListener("click", () => {
  escolhidos.length = 0;
  $("destino").value = "";
  renderEscolhidos();
  calcularEMostrar();
});

// ---- Minhas viagens: ficam guardadas no aparelho (no app, pelo armazenamento nativo) ----
// Sem bundler: usa o plugin já exposto pela ponte nativa ou registra pelo nome.
const plugin = nome => window.Capacitor?.isNativePlatform?.() ? (Capacitor.Plugins?.[nome] || Capacitor.registerPlugin?.(nome) || null) : null;
const Prefs = plugin("Preferences");
const CHAVE = "minhas-viagens";
let salvas = [];
async function lerSalvas() {
  try {
    const bruto = Prefs ? (await Prefs.get({ key: CHAVE })).value : localStorage.getItem(CHAVE);
    salvas = JSON.parse(bruto || "[]");
  } catch { salvas = []; }
  renderSalvas();
}
async function gravarSalvas() {
  const bruto = JSON.stringify(salvas);
  try { Prefs ? await Prefs.set({ key: CHAVE, value: bruto }) : localStorage.setItem(CHAVE, bruto); } catch {}
  renderSalvas();
}
// Tudo que muda o cálculo entra no id, para uma simulação diferente não apagar a outra.
const idViagem = () => {
  if (!state) return null;
  const f = comDatas(state.entrada, state.atual);
  return [state.atual.destino.n, f.origem, f.ida, f.volta, f.pessoas, f.orcamento, f.estilo, f.tipo, (f.interesses || []).join(","), state.foco || ""].join("|");
};
function salvarViagem() {
  const id = idViagem();
  const copia = { id, salvoEm: new Date().toISOString(), estado: { ...state, roteiro: state.roteiro?.dias ? state.roteiro : null } };
  salvas = [copia, ...salvas.filter(v => v.id !== id)].slice(0, 20);
  gravarSalvas();
  const b = $("salvar"); if (b) b.textContent = "Salva ✓";
}
function renderSalvas() {
  const el = $("minhas");
  if (!el) return;
  el.hidden = !salvas.length;
  el.innerHTML = salvas.length ? `<h3>Minhas viagens</h3><ul class="salvas">${salvas.map((v, i) => {
    const { entrada: e, atual: c } = v.estado; const f = comDatas(e, c);
    return `<li><button type="button" class="abrir" data-i="${i}"><b>${esc(c.destino.n)}</b><small>${dataCurta(f.ida)} a ${dataCurta(f.volta)} · ${brl(c.total)} · ${rotulo(c, v.estado.modo)}${v.estado.roteiro ? " · com roteiro" : ""}</small></button><button type="button" class="tirar" data-i="${i}" aria-label="Apagar ${esc(c.destino.n)}">✕</button></li>`;
  }).join("")}</ul>` : "";
  el.querySelectorAll(".abrir").forEach(b => b.onclick = () => {
    pedido?.abort(); setStatus(""); // um cálculo pendente não pode substituir a viagem aberta
    state = { ...salvas[Number(b.dataset.i)].estado };
    render(false);
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  el.querySelectorAll(".tirar").forEach(b => b.onclick = () => { salvas.splice(Number(b.dataset.i), 1); gravarSalvas(); if (state) render(false); });
}
async function compartilhar() {
  const { entrada: e, atual: c } = state; const f = comDatas(e, c);
  const texto = `${c.destino.n}: ${quase(c) ? `com mais ${brl(-c.diff)} vai dar viagem` : ESTADO[c.estado]}. ${noitesTxt(f.noites)} para ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} por cerca de ${brl(c.total)}. Simule a sua viagem:`;
  const url = "https://vaidarviagem.com.br/app/";
  try {
    const Share = plugin("Share");
    if (Share) return await Share.share({ title: "Vai Dar Viagem", text: texto, url });
    if (navigator.share) return await navigator.share({ title: "Vai Dar Viagem", text: texto, url });
    await navigator.clipboard.writeText(`${texto} ${url}`);
    setStatus("Resumo copiado. É só colar onde quiser.");
  } catch {}
}
lerSalvas();

// ---- Recuperar o Roteiro Detalhado pago em outro aparelho: número do pedido + e-mail do Pix ----
$("rec-form").addEventListener("submit", async ev => {
  ev.preventDefault();
  const st = $("rec-status"), botao = $("rec-ir");
  const aviso = (msg, err) => { st.className = "status" + (err ? " err" : ""); st.textContent = msg; };
  const id = $("rec-id").value.replace(/\s+/g, "").toUpperCase();
  const email = $("rec-email").value.trim();
  if (!/^ORD[0-9A-Z]{6,40}$/.test(id)) return aviso("O número do pedido começa com ORD. Confira.", true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return aviso("Confira o e-mail.", true);
  if (botao.disabled) return;
  botao.disabled = true;
  aviso("Conferindo o pagamento. Se o roteiro precisar ser refeito, pode levar até 2 minutos.");
  const parar = voando(botao, FRASES_ROTEIRO);
  try {
    const r = await postar("/api/recuperar", { id, email });
    if (!r.viagem?.atual) throw new Error(`Achamos o pagamento, mas não a viagem. Escreva para ${CONTATO} com o número do pedido.`);
    pedido?.abort(); setStatus(""); // um cálculo pendente não pode substituir a viagem recuperada
    state = { ...r.viagem, opcoes: [], roteiro: { ...r.roteiro, completo: true, nome: r.pedido.nome, ordem: r.pedido.paradas?.map(p => p.destino), pagamento: r.id, valor: r.valor } };
    render(false);
    salvarViagem(); // fica em "Minhas viagens" neste aparelho
    aviso("");
    $("recuperar").open = false;
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) { aviso(e.message, true); }
  finally { parar(); botao.disabled = false; }
});

// ---- Formulário preenchido pelo link (anúncios): ?destino=Maceió&orcamento=2000&pessoas=1&estilo=economico&noites=4&ida=2026-11-20 ----
// O que cada estilo quer dizer, do jeito que o custo.js calcula: hotel (dados.js), comida e passeios por dia.
const ESTILO_DESC = [
  "Pousadas e hotéis simples bem avaliados, refeições práticas e passeios grátis ou baratos.",
  "Hotéis de preço médio, bons restaurantes e as principais atrações pagas.",
  "Hotéis entre os melhores da cidade, restaurantes melhores e mais verba para passeios pagos."
];
function mostrarEstilo() {
  const v = Number(document.querySelector('input[name="estilo"]:checked')?.value ?? 1);
  $("estilo-desc").textContent = ESTILO_DESC[v] || "";
}
document.querySelectorAll('input[name="estilo"]').forEach(r => r.addEventListener("change", mostrarEstilo));

// destino aceita vários separados por vírgula; estilo aceita 0/1/2 ou economico/equilibrado/conforto; origem é a cidade de saída.
// Com destino e orçamento no link, o resultado já aparece, sem a pessoa precisar rolar até o botão.
(function preencherPeloLink() {
  const q = new URLSearchParams(location.search);
  const orc = Number(String(q.get("orcamento") || "").replace(/\D/g, ""));
  if (orc >= 100) { $("orcamento").value = orc.toLocaleString("pt-BR"); marcarFaixa(); }
  const pessoas = Number(q.get("pessoas"));
  if (Number.isInteger(pessoas) && pessoas >= 1 && pessoas <= 9) $("pessoas").value = String(pessoas);
  const ESTILO_LINK = { "0": 0, "1": 1, "2": 2, economico: 0, equilibrado: 1, conforto: 2 };
  const chaveEstilo = norm(q.get("estilo") || "");
  const estilo = Object.hasOwn(ESTILO_LINK, chaveEstilo) ? ESTILO_LINK[chaveEstilo] : undefined;
  if (estilo !== undefined) document.querySelector(`input[name="estilo"][value="${estilo}"]`).checked = true;
  mostrarEstilo();
  const origem = ORIGENS.find(o => norm(o.n) === norm(q.get("origem") || ""));
  if (origem) $("origem").value = origem.n;
  // noites (1 a 15) e ida (AAAA-MM-DD, a partir de amanhã): a volta é a ida mais as noites. Sem ida, fica a ida padrão.
  const noites = Number(q.get("noites"));
  const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
  const minIda = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, "0")}-${String(amanha.getDate()).padStart(2, "0")}`;
  const ida = /^\d{4}-\d{2}-\d{2}$/.test(q.get("ida") || "") && q.get("ida") >= minIda ? q.get("ida") : null;
  if (ida || (Number.isInteger(noites) && noites >= 1 && noites <= 15)) {
    if (ida) $("ida").value = ida;
    const n = Number.isInteger(noites) && noites >= 1 && noites <= 15 ? noites : Math.round((new Date($("volta").value) - new Date($("ida").value)) / 864e5) || 5;
    const volta = new Date($("ida").value + "T12:00:00"); volta.setDate(volta.getDate() + n);
    $("volta").value = `${volta.getFullYear()}-${String(volta.getMonth() + 1).padStart(2, "0")}-${String(volta.getDate()).padStart(2, "0")}`;
    $("noites").value = String(n);
  }
  // Só destinos que o app conhece: um nome errado no link não vira chip nem veredito sem mensagem.
  const destinos = (q.get("destino") || "").split(",").map(d => OPCOES.find(o => norm(o.v) === norm(d))?.v).filter(Boolean).slice(0, 8);
  destinos.forEach(addDestino);
  if (destinos.length && orc >= 100) calcularEMostrar(true);
})();

// ---- Baixar o roteiro: na primeira vez pede o e-mail (lead), depois baixa direto ----
const LEAD = "lead-ok";
const leadOk = () => { try { return localStorage.getItem(LEAD) === "1"; } catch { return false; } };
function pedirEmail() {
  const box = $("baixar-box");
  box.innerHTML = `
    <form class="lead" id="lead-form" novalidate>
      <label for="lead-email">Seu e-mail para liberar o download</label>
      <input id="lead-email" type="email" required autocomplete="email" inputmode="email" maxlength="254" placeholder="voce@email.com">
      <label class="check"><input type="checkbox" id="lead-novidades"><span>Quero receber dicas e promoções de viagem por e-mail</span></label>
      <p class="fine">Só mandamos novidades se você marcar a opção acima. Veja a <a href="/privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</p>
      <button type="submit" class="primary">Liberar e baixar</button>
      <div class="status" id="lead-status" role="status" aria-live="polite"></div>
    </form>`;
  $("lead-email").focus();
  $("lead-form").onsubmit = async ev => {
    ev.preventDefault();
    const email = $("lead-email").value.trim();
    const st = $("lead-status");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { st.className = "status err"; st.textContent = "Confira o e-mail."; return; }
    st.className = "status"; st.textContent = "Liberando…";
    try {
      const r = await fetch(`${API}/api/lead`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, novidades: $("lead-novidades").checked, destino: state.atual.destino.n }) });
      if (r.status === 400) { st.className = "status err"; st.textContent = (await r.json().catch(() => ({}))).erro || "Confira o e-mail."; return; }
      // Só deixa de pedir o e-mail quando ele foi mesmo salvo.
      if (r.ok && (await r.json().catch(() => ({}))).guardado) {
        try { localStorage.setItem(LEAD, "1"); } catch {}
        window.fbq?.("track", "Lead"); // conversão para os anúncios da Meta
      }
    } catch {} // Falha nossa (rede, servidor) não impede o download.
    $("baixar-box").innerHTML = '<button type="button" class="primary" id="baixar">Baixar roteiro em PDF</button>';
    $("baixar").onclick = baixarRoteiro;
    baixarRoteiro();
  };
}

// No site, abre a janela de impressão só com o roteiro, onde dá para "Salvar como PDF".
// No app de celular a impressão não existe: manda o roteiro em texto pelo compartilhar do aparelho.
async function baixarRoteiro() {
  evento("BaixarRoteiro", { destino: state.atual.destino?.n });
  const Share = plugin("Share");
  if (Share) {
    try { await Share.share({ title: `Roteiro ${state.atual.destino.n}`, text: textoRoteiro() }); } catch {}
    return;
  }
  const det = document.querySelector("#roteiro-card details.fontes");
  const aberto = det?.open;
  if (det) det.open = true;
  const titulo = document.title;
  document.title = `Roteiro ${state.atual.destino.n} - Vai Dar Viagem`;
  document.body.classList.add("so-roteiro");
  const fim = () => {
    document.body.classList.remove("so-roteiro");
    document.title = titulo;
    if (det) det.open = aberto;
    window.removeEventListener("afterprint", fim);
  };
  window.addEventListener("afterprint", fim);
  window.print();
}

function textoRoteiro() {
  const ro = state.roteiro;
  const dias = ro.dias.map(d => [`Dia ${d.dia}: ${d.titulo}${d.regiao ? ` (${d.regiao})` : ""}`,
    ...(d.sobreRegiao ? [d.sobreRegiao] : []),
    ...itensDoDia(d).map(a => `- ${a.horario || a.periodo}: ${a.nome}${Number(a.custo) ? ` · ${brl(a.custo)}` : ""}${a.maps ? ` · ${a.maps}` : ""}${a.descricao ? `\n  ${a.descricao}` : ""}${a.comoChegar ? `\n  Como chegar: ${a.comoChegar}` : ""}${a.dica ? `\n  ${a.dica}` : ""}`)].join("\n"));
  const fontes = (ro.fontes || []).length ? `\n\nFontes: Google Maps\n${ro.fontes.map(f => `${f.nome} · Google Maps · ${f.url}`).join("\n")}` : "";
  return `Roteiro em ${state.atual.destino.n} · Vai Dar Viagem\n\n${ro.apresentacao ? `${ro.apresentacao}\n\n` : ""}${dias.join("\n\n")}${fontes}\n\nMonte o seu: https://vaidarviagem.com.br/app/`;
}
