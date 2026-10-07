// Cidades de origem e destinos atendidos.
// iata = código de cidade usado na busca de passagens (Aviasales); ap = aeroporto mostrado na tela.

export const ORIGENS = [
  { n: "São Paulo", lat: -23.43, lon: -46.47, ap: "GRU", iata: "SAO" },
  { n: "Rio de Janeiro", lat: -22.81, lon: -43.25, ap: "GIG", iata: "RIO" },
  { n: "Belo Horizonte", lat: -19.63, lon: -43.97, ap: "CNF", iata: "BHZ" },
  { n: "Brasília", lat: -15.87, lon: -47.92, ap: "BSB", iata: "BSB" },
  { n: "Curitiba", lat: -25.53, lon: -49.18, ap: "CWB", iata: "CWB" },
  { n: "Porto Alegre", lat: -29.99, lon: -51.17, ap: "POA", iata: "POA" },
  { n: "Salvador", lat: -12.91, lon: -38.33, ap: "SSA", iata: "SSA" },
  { n: "Recife", lat: -8.13, lon: -34.92, ap: "REC", iata: "REC" },
  { n: "Fortaleza", lat: -3.78, lon: -38.53, ap: "FOR", iata: "FOR" },
  { n: "Goiânia", lat: -16.63, lon: -49.22, ap: "GYN", iata: "GYN" },
  { n: "Belém", lat: -1.38, lon: -48.48, ap: "BEL", iata: "BEL" },
  { n: "Manaus", lat: -3.04, lon: -60.05, ap: "MAO", iata: "MAO" }
];

// Médias ESTIMADAS de custo local. hotel = diária por quarto [econômico, equilibrado, conforto];
// idx = nível de custo do dia a dia; pf = peso dos passeios pagos; extra = traslado terrestre por pessoa.
// lat/lon = a cidade em si (a distância de ônibus sai daí). terrestre = sem aeroporto: só se chega de ônibus.
export const DESTINOS = [
  { n: "Rio de Janeiro", p: "Brasil", lat: -22.81, lon: -43.25, ap: "GIG", iata: "RIO", int: false, hotel: [180, 350, 700], idx: 1.1, tags: ["praia", "cultura", "noite", "gastronomia", "natureza"] },
  { n: "Salvador", p: "Brasil", lat: -12.91, lon: -38.33, ap: "SSA", iata: "SSA", int: false, hotel: [150, 300, 600], idx: 0.9, tags: ["praia", "cultura", "gastronomia", "noite"] },
  { n: "Porto de Galinhas", p: "Brasil", lat: -8.50, lon: -35.00, ap: "REC", iata: "REC", int: false, hotel: [180, 360, 750], idx: 0.95, extra: 80, tags: ["praia", "criancas"] },
  { n: "Fortaleza", p: "Brasil", lat: -3.78, lon: -38.53, ap: "FOR", iata: "FOR", int: false, hotel: [150, 300, 600], idx: 0.9, tags: ["praia", "criancas", "noite"] },
  { n: "Natal", p: "Brasil", lat: -5.77, lon: -35.37, ap: "NAT", iata: "NAT", int: false, hotel: [140, 280, 550], idx: 0.85, tags: ["praia", "natureza", "criancas"] },
  { n: "Maceió", p: "Brasil", lat: -9.51, lon: -35.79, ap: "MCZ", iata: "MCZ", int: false, hotel: [160, 320, 650], idx: 0.95, tags: ["praia", "criancas"] },
  { n: "Florianópolis", p: "Brasil", lat: -27.67, lon: -48.55, ap: "FLN", iata: "FLN", int: false, hotel: [180, 350, 700], idx: 1.05, tags: ["praia", "natureza", "noite", "gastronomia"] },
  { n: "Gramado", p: "Brasil", lat: -29.38, lon: -50.87, ap: "POA", iata: "POA", int: false, hotel: [220, 420, 850], idx: 1.25, extra: 120, tags: ["gastronomia", "criancas", "compras"] },
  { n: "Foz do Iguaçu", p: "Brasil", lat: -25.60, lon: -54.49, ap: "IGU", iata: "IGU", int: false, hotel: [140, 280, 550], idx: 0.95, pf: 1.4, tags: ["natureza", "criancas", "compras"] },
  { n: "Bonito", p: "Brasil", lat: -20.47, lon: -54.67, ap: "CGR", iata: "CGR", int: false, hotel: [180, 350, 700], idx: 1.1, pf: 1.9, extra: 300, tags: ["natureza", "criancas"] },
  { n: "Jericoacoara", p: "Brasil", lat: -2.90, lon: -40.36, ap: "JJD", iata: "JJD", int: false, hotel: [200, 400, 800], idx: 1.15, extra: 150, tags: ["praia", "natureza"] },
  { n: "Porto Seguro", p: "Brasil", lat: -16.44, lon: -39.08, ap: "BPS", iata: "BPS", int: false, hotel: [140, 280, 550], idx: 0.85, tags: ["praia", "noite", "criancas"] },
  // Perto das capitais, só de ônibus.
  { n: "Paraty", p: "Brasil", lat: -23.22, lon: -44.71, terrestre: true, int: false, hotel: [200, 380, 750], idx: 1.05, tags: ["praia", "cultura", "natureza", "gastronomia"] },
  { n: "Ubatuba", p: "Brasil", lat: -23.43, lon: -45.07, terrestre: true, int: false, hotel: [160, 320, 650], idx: 1.0, tags: ["praia", "natureza", "criancas"] },
  { n: "Campos do Jordão", p: "Brasil", lat: -22.74, lon: -45.59, terrestre: true, int: false, hotel: [230, 450, 900], idx: 1.25, tags: ["gastronomia", "compras", "natureza"] },
  { n: "Búzios", p: "Brasil", lat: -22.75, lon: -41.88, terrestre: true, int: false, hotel: [220, 420, 850], idx: 1.2, tags: ["praia", "noite", "gastronomia"] },
  { n: "Arraial do Cabo", p: "Brasil", lat: -22.97, lon: -42.03, terrestre: true, int: false, hotel: [160, 320, 650], idx: 1.0, tags: ["praia", "natureza"] },
  { n: "Ouro Preto", p: "Brasil", lat: -20.39, lon: -43.50, terrestre: true, int: false, hotel: [150, 300, 600], idx: 0.9, tags: ["cultura", "gastronomia"] },
  { n: "Pirenópolis", p: "Brasil", lat: -15.85, lon: -48.96, terrestre: true, int: false, hotel: [160, 320, 650], idx: 0.95, tags: ["natureza", "cultura"] },
  { n: "Chapada dos Veadeiros", p: "Brasil", lat: -14.13, lon: -47.51, terrestre: true, int: false, hotel: [170, 340, 700], idx: 1.0, pf: 1.3, tags: ["natureza"] },
  { n: "Balneário Camboriú", p: "Brasil", lat: -26.99, lon: -48.63, terrestre: true, int: false, hotel: [180, 350, 700], idx: 1.05, tags: ["praia", "noite", "criancas", "compras"] },
  { n: "Praia do Forte", p: "Brasil", lat: -12.58, lon: -38.00, terrestre: true, int: false, hotel: [200, 400, 800], idx: 1.1, tags: ["praia", "natureza", "criancas"] },
  { n: "Canoa Quebrada", p: "Brasil", lat: -4.53, lon: -37.69, terrestre: true, int: false, hotel: [130, 260, 500], idx: 0.9, tags: ["praia", "natureza"] },
  { n: "Salinópolis", p: "Brasil", lat: -0.61, lon: -47.36, terrestre: true, int: false, hotel: [130, 260, 500], idx: 0.85, tags: ["praia"] },
  { n: "Presidente Figueiredo", p: "Brasil", lat: -2.05, lon: -60.02, terrestre: true, int: false, hotel: [120, 240, 480], idx: 0.85, tags: ["natureza"] },
  { n: "Buenos Aires", p: "Argentina", lat: -34.56, lon: -58.42, ap: "AEP", iata: "BUE", int: true, hotel: [170, 300, 650], idx: 1.0, tags: ["gastronomia", "cultura", "noite", "compras"] },
  { n: "Santiago", p: "Chile", lat: -33.39, lon: -70.79, ap: "SCL", iata: "SCL", int: true, hotel: [200, 380, 750], idx: 1.25, tags: ["natureza", "gastronomia", "compras", "cultura"] },
  { n: "Montevidéu", p: "Uruguai", lat: -34.84, lon: -56.03, ap: "MVD", iata: "MVD", int: true, hotel: [220, 400, 750], idx: 1.4, tags: ["cultura", "gastronomia", "praia"] },
  { n: "Lima", p: "Peru", lat: -12.02, lon: -77.11, ap: "LIM", iata: "LIM", int: true, hotel: [160, 300, 600], idx: 1.0, tags: ["gastronomia", "cultura"] },
  { n: "Cancún", p: "México", lat: 21.04, lon: -86.87, ap: "CUN", iata: "CUN", int: true, hotel: [300, 550, 1200], idx: 1.7, tags: ["praia", "noite", "criancas"] },
  { n: "Lisboa", p: "Portugal", lat: 38.77, lon: -9.13, ap: "LIS", iata: "LIS", int: true, hotel: [350, 600, 1200], idx: 1.8, tags: ["cultura", "gastronomia", "noite"] },
  { n: "Orlando", p: "Estados Unidos", lat: 28.43, lon: -81.31, ap: "MCO", iata: "ORL", int: true, hotel: [400, 700, 1300], idx: 2.2, pf: 2.0, tags: ["criancas", "compras"] },
  { n: "Tóquio", p: "Japão", lat: 35.77, lon: 140.39, ap: "NRT", iata: "TYO", int: true, hotel: [350, 650, 1300], idx: 1.7, tags: ["cultura", "gastronomia", "compras", "noite"] },
  { n: "Paris", p: "França", lat: 49.01, lon: 2.55, ap: "CDG", iata: "PAR", int: true, hotel: [550, 900, 1800], idx: 2.6, tags: ["cultura", "gastronomia", "compras"] },
  { n: "Madri", p: "Espanha", lat: 40.47, lon: -3.56, ap: "MAD", iata: "MAD", int: true, hotel: [400, 700, 1400], idx: 2.0, tags: ["cultura", "gastronomia", "noite", "compras"] },
  { n: "Barcelona", p: "Espanha", lat: 41.30, lon: 2.08, ap: "BCN", iata: "BCN", int: true, hotel: [450, 800, 1600], idx: 2.1, tags: ["praia", "cultura", "gastronomia", "noite"] },
  { n: "Roma", p: "Itália", lat: 41.80, lon: 12.25, ap: "FCO", iata: "ROM", int: true, hotel: [450, 800, 1600], idx: 2.2, tags: ["cultura", "gastronomia"] },
  { n: "Londres", p: "Reino Unido", lat: 51.47, lon: -0.45, ap: "LHR", iata: "LON", int: true, hotel: [650, 1100, 2200], idx: 2.8, tags: ["cultura", "compras", "noite"] },
  { n: "Nova York", p: "Estados Unidos", lat: 40.64, lon: -73.78, ap: "JFK", iata: "NYC", int: true, hotel: [700, 1200, 2400], idx: 2.9, tags: ["cultura", "compras", "gastronomia", "noite"] },
  { n: "Miami", p: "Estados Unidos", lat: 25.79, lon: -80.29, ap: "MIA", iata: "MIA", int: true, hotel: [500, 850, 1600], idx: 2.3, tags: ["praia", "compras", "noite"] },
  { n: "Bariloche", p: "Argentina", lat: -41.15, lon: -71.16, ap: "BRC", iata: "BRC", int: true, hotel: [220, 400, 800], idx: 1.2, tags: ["natureza", "gastronomia", "criancas"] },
  { n: "Punta Cana", p: "República Dominicana", lat: 18.57, lon: -68.36, ap: "PUJ", iata: "PUJ", int: true, hotel: [400, 700, 1400], idx: 1.8, tags: ["praia", "criancas"] }
];

export const ESTILOS = ["econômico", "equilibrado", "conforto"];

export const INTERESSES = {
  praia: "praia", gastronomia: "gastronomia", cultura: "cultura", natureza: "natureza",
  noite: "vida noturna", compras: "compras", criancas: "programas com crianças"
};
