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
export const DESTINOS = [
  { n: "Rio de Janeiro", p: "Brasil", lat: -22.81, lon: -43.25, ap: "GIG", iata: "RIO", int: false, hotel: [180, 350, 700], idx: 1.1, tags: ["praia", "cultura", "noite", "gastronomia", "natureza"] },
  { n: "Salvador", p: "Brasil", lat: -12.91, lon: -38.33, ap: "SSA", iata: "SSA", int: false, hotel: [150, 300, 600], idx: 0.9, tags: ["praia", "cultura", "gastronomia", "noite"] },
  { n: "Porto de Galinhas", p: "Brasil", lat: -8.13, lon: -34.92, ap: "REC", iata: "REC", int: false, hotel: [180, 360, 750], idx: 0.95, extra: 80, tags: ["praia", "criancas"] },
  { n: "Fortaleza", p: "Brasil", lat: -3.78, lon: -38.53, ap: "FOR", iata: "FOR", int: false, hotel: [150, 300, 600], idx: 0.9, tags: ["praia", "criancas", "noite"] },
  { n: "Natal", p: "Brasil", lat: -5.77, lon: -35.37, ap: "NAT", iata: "NAT", int: false, hotel: [140, 280, 550], idx: 0.85, tags: ["praia", "natureza", "criancas"] },
  { n: "Maceió", p: "Brasil", lat: -9.51, lon: -35.79, ap: "MCZ", iata: "MCZ", int: false, hotel: [160, 320, 650], idx: 0.95, tags: ["praia", "criancas"] },
  { n: "Florianópolis", p: "Brasil", lat: -27.67, lon: -48.55, ap: "FLN", iata: "FLN", int: false, hotel: [180, 350, 700], idx: 1.05, tags: ["praia", "natureza", "noite", "gastronomia"] },
  { n: "Gramado", p: "Brasil", lat: -29.99, lon: -51.17, ap: "POA", iata: "POA", int: false, hotel: [220, 420, 850], idx: 1.25, extra: 120, tags: ["gastronomia", "criancas", "compras"] },
  { n: "Foz do Iguaçu", p: "Brasil", lat: -25.60, lon: -54.49, ap: "IGU", iata: "IGU", int: false, hotel: [140, 280, 550], idx: 0.95, pf: 1.4, tags: ["natureza", "criancas", "compras"] },
  { n: "Bonito", p: "Brasil", lat: -20.47, lon: -54.67, ap: "CGR", iata: "CGR", int: false, hotel: [180, 350, 700], idx: 1.1, pf: 1.9, extra: 300, tags: ["natureza", "criancas"] },
  { n: "Jericoacoara", p: "Brasil", lat: -2.90, lon: -40.36, ap: "JJD", iata: "JJD", int: false, hotel: [200, 400, 800], idx: 1.15, extra: 150, tags: ["praia", "natureza"] },
  { n: "Porto Seguro", p: "Brasil", lat: -16.44, lon: -39.08, ap: "BPS", iata: "BPS", int: false, hotel: [140, 280, 550], idx: 0.85, tags: ["praia", "noite", "criancas"] },
  { n: "Buenos Aires", p: "Argentina", lat: -34.56, lon: -58.42, ap: "AEP", iata: "BUE", int: true, hotel: [170, 300, 650], idx: 1.0, tags: ["gastronomia", "cultura", "noite", "compras"] },
  { n: "Santiago", p: "Chile", lat: -33.39, lon: -70.79, ap: "SCL", iata: "SCL", int: true, hotel: [200, 380, 750], idx: 1.25, tags: ["natureza", "gastronomia", "compras", "cultura"] },
  { n: "Montevidéu", p: "Uruguai", lat: -34.84, lon: -56.03, ap: "MVD", iata: "MVD", int: true, hotel: [220, 400, 750], idx: 1.4, tags: ["cultura", "gastronomia", "praia"] },
  { n: "Lima", p: "Peru", lat: -12.02, lon: -77.11, ap: "LIM", iata: "LIM", int: true, hotel: [160, 300, 600], idx: 1.0, tags: ["gastronomia", "cultura"] },
  { n: "Cancún", p: "México", lat: 21.04, lon: -86.87, ap: "CUN", iata: "CUN", int: true, hotel: [300, 550, 1200], idx: 1.7, tags: ["praia", "noite", "criancas"] },
  { n: "Lisboa", p: "Portugal", lat: 38.77, lon: -9.13, ap: "LIS", iata: "LIS", int: true, hotel: [350, 600, 1200], idx: 1.8, tags: ["cultura", "gastronomia", "noite"] },
  { n: "Orlando", p: "Estados Unidos", lat: 28.43, lon: -81.31, ap: "MCO", iata: "ORL", int: true, hotel: [400, 700, 1300], idx: 2.2, pf: 2.0, tags: ["criancas", "compras"] },
  { n: "Tóquio", p: "Japão", lat: 35.77, lon: 140.39, ap: "NRT", iata: "TYO", int: true, hotel: [350, 650, 1300], idx: 1.7, tags: ["cultura", "gastronomia", "compras", "noite"] },
  { n: "Paris", p: "França", lat: 49.01, lon: 2.55, ap: "CDG", iata: "PAR", int: true, hotel: [550, 900, 1800], idx: 2.6, tags: ["cultura", "gastronomia", "compras"] }
];

export const ESTILOS = ["econômico", "equilibrado", "conforto"];

export const INTERESSES = {
  praia: "praia", gastronomia: "gastronomia", cultura: "cultura", natureza: "natureza",
  noite: "vida noturna", compras: "compras", criancas: "programas com crianças"
};
