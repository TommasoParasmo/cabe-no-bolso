import { ORIGENS, DESTINOS, ESTILOS } from "../lib/dados.js";

const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["var(--accent)", "var(--sun)", "#7A8FD6", "#D96C8A", "#6FB58C", "#A58B6F"];
const ESTADO = { cabe: "Vai dar viagem", apertado: "Vai dar, no aperto", nao_cabe: "Não vai dar" };

const iso = d => d.toISOString().slice(0, 10);
(function init() {
  $("origem").innerHTML = ORIGENS.map(o => `<option>${esc(o.n)}</option>`).join("");
  const a = new Date(); a.setDate(a.getDate() + 45);
  const b = new Date(a); b.setDate(b.getDate() + 5);
  $("ida").value = iso(a); $("volta").value = iso(b);
})();
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
  ativa = q && visiveis.length ? 0 : -1;
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
  abrirLista();
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
    abrirLista();
  } else if (e.key === "Escape") fecharLista();
});

function lerForm() {
  return {
    orcamento: Number($("orcamento").value.replace(/\D/g, "")) || 0,
    origem: $("origem").value, destinos: [...escolhidos, $("destino").value.trim()].filter(Boolean), tipo,
    ida: $("ida").value, volta: $("volta").value,
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
  if (!r.ok) throw new Error(corpo.erro || "Algo falhou. Tente de novo.");
  return corpo;
}

let state = null;
let pedido = null;

// Eventos do Pixel da Meta, para medir o funil nos anúncios (sem pixel, como no app de celular, não faz nada).
const evento = (nome, dados) => window.fbq?.("trackCustom", nome, dados);

async function calcular() {
  pedido?.abort();
  const meu = pedido = new AbortController();
  $("go").disabled = $("sugerir").disabled = true;
  setStatus(""); // erro da tentativa anterior não fica na tela durante a nova
  const parar = voando($("go"), FRASES_CALCULO);
  try {
    const form = lerForm();
    evento("VerSeVaiDar", { tipo: form.destinos.length ? "destino" : "sugestao", orcamento: form.orcamento });
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
const quase = (o, modo = state?.modo) => modo === "sugestao" && o.estado === "nao_cabe";
const rotulo = (o, modo) => quase(o, modo) ? `com mais ${brl(-o.diff)}` : ESTADO[o.estado];

function opcoesHtml(opcoes, atual, filtro = () => true) {
  return `<div class="options">${opcoes.map((o, i) => filtro(o) ? `
    <button type="button" class="opt" data-i="${i}" aria-current="${o === atual}">
      <span class="t">${esc(o.destino.n)}</span><span class="v">${brl(o.total)}</span>
      <small>${quase(o) ? `com mais ${brl(-o.diff)}` : `${ESTADO[o.estado]} · ${o.diff >= 0 ? "sobra " + brl(o.diff) : "falta " + brl(-o.diff)}`}${o.meio === "onibus" ? " · de ônibus" : ""}${o.noitesCabem ? ` · cabe com ${o.noitesCabem} ${o.noitesCabem > 1 ? "noites" : "noite"}` : ""}${o.match ? " · combina com o que vocês curtem" : ""}</small>
    </button>` : "").join("")}</div>`;
}

function render(fresh) {
  const { entrada: f, atual: c } = state;
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
    ? (state.noitesMax ? `Com ${state.noitesMax} noites em vez de ${f.noites}, ${esc(c.destino.n)} cabe no orçamento.` : `Mesmo com menos noites, ${esc(c.destino.n)} não cabe nesse valor.`) : "";
  const mostrarOpcoes = state.modo === "destino" ? state.opcoes.length > 0 : state.opcoes.length > 1;
  const r = $("result");
  r.className = "result" + (fresh ? " fresh" : "");
  r.innerHTML = `
    <article class="verdict" data-state="${quase(c) ? "quase" : c.estado}">
      <span class="pill">${quase(c) ? "Com mais um pouquinho" : ESTADO[c.estado]}</span>
      <div class="eyebrow">${viagem ? `Viagem por ${c.paradas.length} cidades · ${c.paradas.map(p => `${esc(p.n)} (${p.noites})`).join(" → ")}` : `${quase(c) ? "Mais perto do seu orçamento · " : state.modo === "sugestao" ? "Nossa sugestão · " : comparar ? "Melhor entre os escolhidos · " : ""}${esc(c.destino.n)}, ${esc(c.destino.p)}`} · ${f.noites} noites · ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} · ${ESTILOS[f.estilo]}</div>
      <h2>${manchete}</h2>
      ${ajuste ? `<p>${ajuste}</p>` : c.estado === "apertado" ? "<p>Sobra pouco para imprevistos. Vale comprar a passagem logo, antes de o preço subir.</p>" : ""}
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
      <h3>${comparar ? "Comparando os destinos que você escolheu" : state.modo === "sugestao" ? (state.opcoes.every(quase) ? "Lugares que com mais um pouquinho você iria" : `As melhores viagens para ${brl(f.orcamento)}`) : "Destinos que cabem no seu orçamento"}</h3>
      ${state.modo === "sugestao"
        ? ["nacional", "internacional"].map(g => {
          const doGrupo = state.opcoes.filter(o => o.grupo === g);
          if (!doGrupo.length) return "";
          const titulo = (g === "nacional" ? "No Brasil" : "No exterior") + (doGrupo.every(quase) && !state.opcoes.every(quase) ? " · com mais um pouquinho" : "");
          return `<div class="grupo-titulo">${titulo}</div>${opcoesHtml(state.opcoes, c, o => o.grupo === g)}`;
        }).join("")
        : opcoesHtml(state.opcoes, c)}
    </section>` : ""}
    <section class="card">
      <h3>Para onde vai o dinheiro</h3>
      <div class="bar" role="img" aria-label="Divisão do custo por categoria">${c.itens.map((it, i) => `<i style="width:${it.valor / sum * 100}%;background:${COLORS[i]}"></i>`).join("")}</div>
      <ul class="legend">${c.itens.map((it, i) => `<li><span class="sw" style="background:${COLORS[i]}"></span><span>${esc(it.categoria)}<small>${esc(it.detalhe)}</small></span><span class="v">${brl(it.valor)}</span></li>`).join("")}</ul>
    </section>
    ${viagem ? cartoesViagem(c, f) : `<div class="two">
      <section class="card">${cartaoPassagem(c, f, L)}</section>
      <section class="card">
        <span class="eyebrow">Hospedagem · estimativa</span>
        <div class="kv"><span class="price">${brl(c.diaria)}<small style="font-size:13px;font-weight:500"> /noite por quarto</small></span><p>Média para o estilo ${ESTILOS[f.estilo]}</p></div>
        <a class="link" href="${esc(L.hotels)}" target="_blank" rel="noopener sponsored">Ver hotéis na Booking ↗</a>
      </section>
    </div>`}
    ${noExterior(c) ? cartaoExterior(c) : ""}
    <section class="card" id="roteiro-card"></section>
  `;
  r.querySelectorAll(".opt").forEach(b => b.onclick = () => escolher(Number(b.dataset.i)));
  $("salvar").onclick = salvarViagem;
  $("compartilhar").onclick = compartilhar;
  renderRoteiro();
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
  if (ro?.dias) {
    card.innerHTML = `
      <h3>${ro.completo ? "Roteiro completo" : "Roteiro dia a dia"} em ${esc(ro.ordem?.join(" + ") || state.atual.destino.n)}</h3>
      ${ro.resumido ? `<p class="hint">Sua viagem tem ${esc(ro.resumido.viagem)} dias; o roteiro vai até ${esc(ro.resumido.dias)} dias${new Set(ro.dias.map(d => d.cidade)).size > 1 ? ", divididos entre as cidades" : ", os primeiros da viagem"}.</p>` : ""}
      <div class="days">${ro.dias.map(d => `
        <div class="day"><span class="n">DIA ${esc(d.dia)}</span><div><h4>${esc(d.titulo)}</h4>${regiaoDoDia(d) ? `<small class="hint">${esc(regiaoDoDia(d))}</small>` : ""}<ul>${itensDoDia(d).map(a => `<li${a.refeicao ? ' class="ref"' : ""}><span class="p">${esc(a.horario || String(a.periodo).toLowerCase())}</span><a class="lugar" href="${a.maps ? esc(a.maps) : mapa(a.nome, d.cidade, a.bairro)}" target="_blank" rel="noopener">${esc(a.nome)} ↗</a><span class="c">${Number(a.custo) ? brl(a.custo) : "grátis"}</span>${a.dica ? `<small class="dica">${esc(a.dica)}</small>` : ""}</li>`).join("")}</ul></div></div>`).join("")}
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
  const refeicoes = [["almoço", d.almoco], ["jantar", d.jantar]].filter(([, r]) => r?.nome).map(([periodo, r]) => ({ periodo, nome: r.nome, bairro: r.bairro, custo: r.custo, maps: r.maps, horario: r.horario, dica: r.dica, refeicao: true }));
  const itens = [...(d.atividades || []), ...refeicoes];
  // No roteiro completo, a ordem é a dos horários ("09:00–11:30").
  const porHora = itens.every(a => /^\d{1,2}:\d{2}/.test(a.horario || ""));
  const chave = a => porHora ? a.horario.padStart(5, "0") : posicao(a.periodo);
  return itens.map((a, i) => ({ a, i })).sort((x, y) => (chave(x.a) < chave(y.a) ? -1 : chave(x.a) > chave(y.a) ? 1 : 0) || x.i - y.i).map(x => x.a);
}

// Região do dia (ex.: "Barra"), e a cidade quando a viagem tem várias.
const regiaoDoDia = d => [d.regiao, state.atual.paradas && d.cidade].filter(Boolean).join(" · ");

// Busca o lugar no Google Maps, onde a pessoa vê nota, fotos e avaliações. O bairro ajuda a achar o lugar certo.
function mapa(nome, cidade, bairro) {
  const local = [nome, bairro].filter(Boolean).join(", ");
  // A cidade do dia vale também em bate-volta de viagem com um destino só.
  const q = state.atual.paradas ? `${local}, ${cidade || state.atual.paradas[0].n}` : `${local}, ${cidade || state.atual.destino.n}, ${state.atual.destino.p}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// Pedido de roteiro. `paradas`: a ordem das cidades (no roteiro completo, a que a pessoa escolheu).
function pedidoRoteiro(paradas = state.atual.paradas) {
  const { entrada: f, atual: c } = state;
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
    const r = await postar("/api/roteiro", pedidoRoteiro(), ctlRoteiro.signal);
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
const PRECO_COMPLETO = 9.9;
// brl() arredonda para reais inteiros; o preço precisa dos centavos (R$ 9,90).
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
  if (v.gerando) return `<div class="completo nao-imprimir" id="completo-box"><h3>Roteiro completo</h3><button type="button" class="primary" id="completo-gerando" disabled></button><p class="hint" style="margin:0">Pagamento recebido. Pode levar cerca de 1 minuto, fique nesta tela.</p></div>`;
  return `
    <div class="completo nao-imprimir" id="completo-box">
      <h3>Quer o roteiro completo? ${reais(PRECO_COMPLETO)}</h3>
      <ul class="hint vantagens">
        <li>Horário de cada passeio, almoço e jantar, de acordo com o funcionamento de cada lugar</li>
        <li>Uma dica prática para cada lugar: melhor hora, o que pedir, se precisa reservar</li>
        ${ordem ? "<li>Você escolhe a ordem das cidades</li>" : ""}
        <li>Mais dicas da viagem: transporte, segurança e o que comprar antes</li>
      </ul>
      ${ordem && !v.pix ? `<div class="ordem"><b>Ordem das cidades</b><ol>${ordem.map((p, i) => `<li><span>${esc(p.n)} <small class="hint">${esc(p.noites)} ${p.noites > 1 ? "noites" : "noite"}</small></span><button type="button" class="mover" data-i="${i}" data-d="-1" ${i ? "" : "disabled"} aria-label="Subir ${esc(p.n)}">↑</button><button type="button" class="mover" data-i="${i}" data-d="1" ${i < ordem.length - 1 ? "" : "disabled"} aria-label="Descer ${esc(p.n)}">↓</button></li>`).join("")}</ol><p class="hint" style="margin:0">Os preços acima são da ordem original; a ordem nova vale para o roteiro.</p></div>` : ""}
      ${v.pix ? `
        ${v.pix.qrCode ? `<img class="qr" src="data:image/png;base64,${esc(v.pix.qrCode)}" alt="QR Code do Pix" width="200" height="200">` : ""}
        <div class="actions"><button type="button" class="primary" id="pix-copiar">Copiar código Pix</button><button type="button" id="pix-conferir">Já paguei</button></div>
        <p class="hint" style="margin:0">Abra o app do seu banco, escolha Pix copia e cola (ou leia o QR Code) e pague. O roteiro completo aparece aqui sozinho.</p>` : `
        <form class="lead" id="pix-form" novalidate>
          <label for="pix-email">Seu e-mail (vai no comprovante)</label>
          <input id="pix-email" type="email" required autocomplete="email" inputmode="email" maxlength="254" placeholder="voce@email.com" value="${esc(v.email || "")}">
          <button type="submit" class="primary">Pagar ${reais(PRECO_COMPLETO)} no Pix</button>
        </form>`}
      <div class="status${v.erro ? " err" : ""}" id="pix-status" role="status" aria-live="polite">${esc(v.aviso || "")}</div>
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
    const email = $("pix-email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return aviso("Confira o e-mail.", true);
    // Um Pix por vez: dois cliques gerariam duas cobranças, e a pessoa poderia pagar a que o app não acompanha.
    const botao = $("pix-form").querySelector("button");
    if (botao.disabled) return;
    botao.disabled = true;
    aviso("Gerando o Pix…");
    try {
      // O pedido vai junto: o Pix fica preso a este roteiro, nesta ordem de cidades.
      v.pedido = { ...pedidoRoteiro(v.ordem), completo: true };
      const pix = await postar("/api/pix", { pedido: v.pedido, email });
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
        window.fbq?.("track", "Purchase", { value: PRECO_COMPLETO, currency: "BRL" });
        return montarCompleto(ro);
      }
      if (status === "expirado") {
        pararPix(); v.pix = null; guardarPendente(idViagem());
        v.aviso = "O Pix expirou. Gere outro para pagar."; v.erro = true;
        return renderRoteiro();
      }
      if (manual) aviso("Ainda não recebemos o pagamento. Assim que cair, o roteiro completo aparece aqui.");
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
    state.roteiro = { ...r, completo: true, ordem: v.ordem?.map(p => p.n) };
    evento("RoteiroCompleto", { destino: state.atual.destino?.n });
    renderRoteiro();
    if (salvas.some(x => x.id === idViagem())) salvarViagem();
  } catch (e) {
    if (state.roteiro !== ro) return;
    v.gerando = false;
    v.aviso = `Pagamento recebido, mas o roteiro completo não carregou (${e.message}). Toque em "Já paguei" para tentar de novo.`; v.erro = true;
    renderRoteiro();
  }
}

function setStatus(msg, err) { $("status").textContent = msg; $("status").className = "status" + (err ? " err" : ""); }
const calcularEMostrar = () => calcular().then(() => state && $("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
$("form").addEventListener("submit", e => {
  e.preventDefault();
  // Sem destino, as sugestões só vêm pelo botão "me sugira destinos".
  if (!lerForm().destinos.length) {
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
  const f = state.entrada;
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
    const { entrada: f, atual: c } = v.estado;
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
  const { entrada: f, atual: c } = state;
  const texto = `${c.destino.n}: ${quase(c) ? `com mais ${brl(-c.diff)} vai dar viagem` : ESTADO[c.estado]}. ${f.noites} noites para ${f.pessoas} ${f.pessoas > 1 ? "pessoas" : "pessoa"} por cerca de ${brl(c.total)}. Simule a sua viagem:`;
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
    ...itensDoDia(d).map(a => `- ${a.horario || a.periodo}: ${a.nome}${Number(a.custo) ? ` · ${brl(a.custo)}` : ""}${a.maps ? ` · ${a.maps}` : ""}${a.dica ? `\n  ${a.dica}` : ""}`)].join("\n"));
  const fontes = (ro.fontes || []).length ? `\n\nFontes: Google Maps\n${ro.fontes.map(f => `${f.nome} · Google Maps · ${f.url}`).join("\n")}` : "";
  return `Roteiro em ${state.atual.destino.n} · Vai Dar Viagem\n\n${dias.join("\n\n")}${fontes}\n\nMonte o seu: https://vaidarviagem.com.br/app/`;
}
