// Roteiro Detalhado + Pré-viagem de Buenos Aires (com bate-volta a Colonia del Sacramento, no Uruguai).
// Conteúdo fixo do destino; o motor está em server/pdf/roteiro.js e o formato em server/pdf/destinos/LEIA-ME.md.
// Escrito de memória. Os preços estão em reais e em faixas porque o câmbio argentino muda rápido.
//
// CONFERIR antes de vender (o QA de 09/10/2026 já confirmou documentos, IOF, cota de bebida, 911/107/100, terminal
// Buquebus, táxi de Ezeiza, restaurantes, Viejo Almacén, La Catedral, La Viruta, dias fechados, Proa, Belas Artes,
// Jardim Japonês, IVA do Uruguai, linha do tempo e os telefones do consulado em Buenos Aires):
// - Plantão do Consulado-Geral em Montevidéu (+598 91 300 301): confiança média-alta; uma página antiga traz +598 99 789 111.
// - 103 como Defesa Civil de Buenos Aires (o QA pediu "o 103"; o rótulo é nosso).
// - Seguro saúde: se a entrada na Argentina já pede o comprovante.
// - Câmbio: cotação dos cartões estrangeiros perto do dólar MEP, Pix nas lojas, casas de câmbio que trocam real.
// - SUBE e cartão por aproximação: quais linhas de ônibus aceitam.
// - Preços de Ezeiza por aplicativo, Tienda León e linha 8; preços e terminal do Seacat; preço do Colonia Express.
// - Casa Rosada: se a visita interna voltou.
// - Gastos de referência por dia (R$ 2.820 por pessoa) e faixas de restaurantes, hotéis, show e extras.
// - Café de los Angelitos, Esquina Carlos Gardel e Rojo Tango; horários de Tortoni, Barolo, Fragata e Pasión Boquense.
// - Empresas da página de guias: BA Free Tour, Free Walks, La Bicicleta Naranja, Biking Buenos Aires, Tienda León.

export default {
  nome: "Buenos Aires",
  moeda: "peso argentino",
  moedaPlural: "pesos argentinos",
  rotuloExtra: "Show de tango e Colonia",
  capa: { img: "capa", frase: "Buenos Aires e Colonia, no Uruguai, com o gasto de cada dia e a viagem inteira no papel.", ritmo: "Tranquilo, a pé e de metrô" },
  referencia: { total: "R$ 2.820", inclui: "comida, passeios, show e barco", porDia: "cerca de R$ 400" },
  fichaDoc: ["RG ou passaporte", "Número e data de emissão do RG"],
  fichaExtra: [["Show de tango", "Casa, data, horário e código da reserva"], ["Barco para Colonia", "Empresa, horários de ida e volta e terminal"]],

  mapa: {
    sumario: "Mapa de Buenos Aires",
    titulo: "Uma cidade de bairros",
    sub: "Desenho fora de escala. Os números mostram em que dia você visita cada lugar.",
    agua: [
      { d: "M585 0 L720 0 L720 520 L500 520 C530 440 545 380 560 300 C575 220 570 120 585 0 Z", fill: true, l: "Rio da Prata", lx: 610, ly: 360 },
      { d: "M230 505 C320 470 400 500 500 470", w: 14, l: "Riachuelo", lx: 200, ly: 490 }
    ],
    areas: [
      { x: 30, y: 40, w: 200, h: 120, l: "PALERMO" },
      { x: 250, y: 70, w: 180, h: 100, l: "RECOLETA" },
      { x: 190, y: 190, w: 230, h: 120, l: "CENTRO" },
      { x: 440, y: 200, w: 100, h: 160, l: "P. MADERO" },
      { x: 230, y: 330, w: 190, h: 80, l: "SAN TELMO" },
      { x: 300, y: 420, w: 170, h: 60, l: "LA BOCA" }
    ],
    rotas: [{ d: "M520 215 C570 190 630 170 700 150", l: "Barco", lx: 625, ly: 200 }],
    pinos: [
      { x: 230, y: 270, dia: 1, l: "Obelisco" },
      { x: 400, y: 235, dia: 1, l: "Plaza de Mayo", anc: "end" },
      { x: 320, y: 375, dia: 2, l: "Plaza Dorrego" },
      { x: 255, y: 380, dia: 5, l: "Tango", anc: "end" },
      { x: 360, y: 455, dia: 3, l: "Caminito" },
      { x: 490, y: 300, dia: 4, l: "Puente de la Mujer", anc: "end" },
      { x: 330, y: 125, dia: 7, l: "Cemitério" },
      { x: 110, y: 105, dia: 7, l: "Jardim Japonês" }
    ],
    notas: [
      [600, 40, "✈ Aeroparque (AEP)"],
      [712, 110, "Colonia, Uruguai →", "end"],
      [712, 128, "dia 6, 1h15 de barco", "end"],
      [20, 510, "↓ Ezeiza (EZE), 35 km, cerca de 50 min"]
    ],
    cards: [
      { t: "Como se orientar", itens: ["A avenida 9 de Julio, com o Obelisco, corta o centro de norte a sul.", "O rio fica a leste: Puerto Madero é a beira d'água.", "Cada quadra tem cerca de 100 m, e a numeração pula de 100 em 100."] },
      { t: "Distâncias", itens: ["Obelisco a Plaza de Mayo: 15 min a pé", "Plaza de Mayo a San Telmo: 15 min a pé", "Centro a Palermo: 20 min de metrô"] }
    ]
  },

  quando: [
    ["60", "dias antes", [
      ["Confira o documento", "RG com menos de 10 anos de emissão e em bom estado vale para Argentina e Uruguai. Se não tiver, use o passaporte."],
      ["Compre as passagens", "Simule no vaidarviagem.com.br para achar as datas que cabem no bolso."],
      ["Avise o banco", "Libere o cartão para uso no exterior e pergunte como ele cobra compras na Argentina."]]],
    ["30", "dias antes", [
      ["Contrate o seguro viagem", "A Argentina pode exigir seguro saúde. Hospitais públicos nacionais cobram consulta de estrangeiro desde 08/2026 (urgência não)."],
      ["Compre o barco para Colonia", "Compare Buquebus, Colonia Express e Seacat. Comprar antes costuma sair mais barato."],
      ["Reserve o hotel e o show de tango", "Veja os bairros na página @@PG:ficar@@ e as casas de tango nas páginas @@PG:lugar4@@ e @@PG:guias@@."]]],
    ["7", "dias antes", [
      ["Decida como pagar", "Compare cartão, Pix e dólar com a cotação da semana, como explica a página @@PG:cambio@@."],
      ["Ative o chip ou eSIM de dados", "Com internet você usa mapa, aplicativo de carro e Pix."],
      ["Baixe os aplicativos", "Uber, Cabify ou DiDi, o mapa offline de Buenos Aires e o BA Cómo Llego, de transporte."]]],
    ["1", "dia antes", [
      ["Separe os documentos", "RG ou passaporte, seguro, reservas e a passagem do barco."],
      ["Confira a mala com a lista da página @@PG:mala@@", ""],
      ["Planeje a chegada", "Como ir de Ezeiza ao hotel está na página @@PG:locomover@@."]]]
  ],

  regras: {
    titulo: "Dinheiro, documentos e clima",
    cards: [
      { ic: "i-doc", t: "Documentos", itens: ["Sem visto: vale o RG com menos de 10 anos de emissão e em bom estado, ou o passaporte. CNH não vale.", "Pode ser exigido seguro saúde. Desde 08/2026, hospital público nacional cobra consulta de estrangeiro (urgência não).", "Menor viajando sem os dois pais precisa de autorização. Veja no site da Polícia Federal."] },
      { ic: "coin", t: "Dinheiro", itens: ["Moeda: peso argentino. Em Colonia, peso uruguaio.", "Cartão, Pix ou dólar: veja como comparar na página @@PG:cambio@@.", "Gorjeta de cerca de 10%, fora da conta. O cubierto é cobrado por pessoa."] },
      { ic: "spark", t: "Costumes", itens: ["Almoço depois das 13h e jantar depois das 21h.", "Cumprimento com um beijo no rosto, até entre homens conhecidos.", "A tomada é diferente da brasileira (três pinos chatos): leve adaptador."] }
    ],
    avisos: [["O câmbio muda rápido", "Os preços em pesos mudam em poucas semanas. Por isso este roteiro mostra valores em reais e em faixas. Na semana da viagem, confira a cotação do dólar e simule a mesma compra no cartão, no Pix e em dinheiro. A página @@PG:cambio@@ explica como comparar."]],
    seguranca: "Antes de viajar, confira os avisos do Itamaraty para a Argentina e o Uruguai e as orientações do consulado em Buenos Aires."
  },

  clima: {
    geral: ["Verão (dezembro a fevereiro): quente e úmido, com pancadas de chuva no fim da tarde.", "Inverno (junho a agosto): frio e seco, entre 5 °C e 15 °C. Primavera e outono são amenos."],
    sempre: "Use tênis confortável: as calçadas têm buracos e pedras soltas.",
    gelado: "Pode gear de madrugada: leve casaco quente, gorro e luvas.",
    frio: "Noites frias: leve um casaco quente e algo contra o vento do rio.",
    calor: "Calor úmido: roupa leve, protetor e água. A sensação é mais quente que o termômetro.",
    chuva: { meses: [1, 2, 3, 10, 11, 12], texto: "Pancadas fortes de chuva são comuns nesta época. Leve guarda-chuva pequeno." }
  },

  mala: [
    ["Documentos", ["RG ou passaporte", "Seguro viagem impresso", "Reservas e passagem do barco", "Cartões e um pouco de dólar", "Cópia do documento, separada"]],
    ["Roupas", ["Roupa leve para o dia", "Casaco para a noite (veja o clima do mês na página @@PG:regras@@)", "Corta-vento para a beira do rio", "Uma roupa arrumada para o tango", "Tênis confortável"]],
    ["Outros", ["Adaptador de tomada (tipo I)", "Carregador portátil", "Guarda-chuva pequeno", "Bolsa pequena, de usar na frente", "Remédios de uso pessoal"]]
  ],

  ficar: {
    titulo: "Três bairros, três jeitos de viajar",
    bairros: [
      { n: "Palermo (Soho e Hollywood)", quem: "Combina com: casais e amigos que querem bares e restaurantes perto.",
        pro: ["Ruas arborizadas e tranquilas", "Muitos restaurantes, cafés e bares", "Perto do Aeroparque"],
        contra: ["Longe de San Telmo e La Boca", "Metrô só em algumas avenidas"] },
      { n: "Recoleta", quem: "Combina com: primeira viagem e quem quer um bairro clássico e seguro.",
        pro: ["Um dos bairros mais seguros", "Entre o centro e Palermo", "Cafés e prédios bonitos"],
        contra: ["Diárias mais caras", "Noite mais calma"] },
      { n: "Centro e San Telmo", quem: "Combina com: quem quer economizar e fazer muita coisa a pé.",
        pro: ["Hotéis mais baratos", "Perto do Obelisco, da Plaza de Mayo e de San Telmo", "Metrô para todo lado"],
        contra: ["Ruas vazias e escuras à noite", "Mais barulho e mais furto"] }
    ],
    estilos: [["Econômico", "R$ 250 a 450", "diária do quarto duplo"], ["Confortável", "R$ 450 a 900", "diária do quarto duplo"], ["Premium", "R$ 1.200 ou mais", "diária do quarto duplo"]],
    nota: "Valores de referência, que mudam com o câmbio. Os preços sobem em janeiro, em julho (férias de inverno) e nos feriados."
  },

  locomover: {
    titulo: "Do aeroporto ao hotel, e pela cidade",
    cab: ["De Ezeiza (EZE)", "Tempo", "Preço", "Bom para"],
    linhas: [
      ["Táxi oficial (balcão no desembarque)", "45 a 60 min", "cerca de R$ 120 a 200 o carro", "Chegada à noite, com malas"],
      ["Uber, Cabify ou DiDi", "45 a 60 min", "cerca de R$ 80 a 150 o carro", "Quem tem internet no celular"],
      ["Ônibus Tienda León", "1h a 1h30 até Puerto Madero", "cerca de R$ 50 a 80 por pessoa", "Quem viaja sozinho"],
      ["Ônibus urbano (linha 8)", "2 horas ou mais", "poucos reais, com SUBE ou cartão por aproximação", "Só com pouca mala"]
    ],
    cards: [
      { ic: "coin", t: "SUBE ou cartão por aproximação", itens: ["O ônibus não aceita dinheiro: pague com o SUBE ou, em muitas linhas, com cartão por aproximação.", "Compre e recarregue o SUBE em quiosques (kioscos), estações e centros de turismo.", "Metrô e trem aceitam os dois."] },
      { t: "Metrô (subte)", itens: ["Linhas de A a H, com estações no Obelisco e na Plaza de Mayo.", "A linha A, de 1913, foi a primeira da América Latina.", "Evite o pico: 8h às 9h30 e 17h às 19h."] },
      { t: "Táxi e aplicativo", itens: ["Táxis pretos e amarelos têm taxímetro.", "Uber, Cabify e DiDi mostram o preço antes.", "À noite, prefira o carro até a porta."] },
      { t: "Barco para Colonia", itens: ["Buquebus: Av. Antártida Argentina 821. Colonia Express: Av. Elvira Rawson de Dellepiane 155.", "Barco rápido: cerca de 1h15. Chegue 1h a 1h30 antes.", "Os terminais estão no cartão da página @@PG:cartao@@."] }
    ],
    aviso: ["Aeroparque (AEP)", "Alguns voos do Brasil chegam e saem do Aeroparque Jorge Newbery, a 15 ou 20 minutos de Palermo de táxi ou aplicativo. Confira na passagem qual é o seu aeroporto."]
  },

  horarios: {
    linhas: [
      ["Feira de San Telmo", "Domingo, das 10h às 17h", "Seg a sáb", "Grátis", "Não"],
      ["Mercado de San Telmo", "Todos os dias, de manhã à noite", "Abre todo dia", "Grátis", "Não"],
      ["Casa Rosada (visita interna)", "Confira em casarosada.gob.ar se está aberta", "Pode estar suspensa", "Grátis", "Sim, no site"],
      ["Café Tortoni", "Todos os dias, de manhã à noite", "Abre todo dia", "Consumo", "Não"],
      ["Teatro Colón (visita guiada)", "Todos os dias, várias por dia", "Dias de evento", "Pago", "Melhor reservar"],
      ["Palacio Barolo", "Visitas guiadas todos os dias", "Abre todo dia", "Pago", "Sim"],
      ["Caminito", "Todos os dias, de dia", "À noite, evite", "Grátis", "Não"],
      ["Museo de la Pasión Boquense", "Todos os dias, das 10h às 18h", "Dias de jogo", "Pago", "Não"],
      ["Fundación Proa", "Qua a dom, das 12h às 19h", "Seg e ter", "Quarta grátis", "Não"],
      ["Reserva Ecológica", "Ter a dom, das 8h ao fim da tarde", "Segunda", "Grátis", "Não"],
      ["Fragata Sarmiento", "Todos os dias, das 10h às 19h", "Abre todo dia", "Barato", "Não"],
      ["Cemitério da Recoleta", "Todos os dias, das 9h às 17h", "Abre todo dia", "Pago (estrangeiro)", "Não"],
      ["Museu Nacional de Belas Artes", "Ter a sex, 11h às 19h30; sáb e dom, 10h às 19h30", "Segunda", "Grátis", "Não"],
      ["MALBA", "Qua a seg, das 12h às 20h", "Terça", "Pago", "Não"],
      ["Jardim Japonês", "Todos os dias, das 10h às 18h45", "Abre todo dia", "Pago (estrangeiro)", "Não"]
    ],
    aviso: ["Confira na semana da viagem", "Horários mudam com a estação e os feriados. Muitos museus fecham na segunda ou na terça. Em Colonia, os museus do bairro histórico abrem quase todos os dias."]
  },

  historia: {
    kick: "500 anos em uma página",
    titulo: "Linha do tempo de Buenos Aires",
    linhas: [
      ["1536", "Pedro de Mendoza funda a primeira Buenos Aires, abandonada poucos anos depois."],
      ["1580", "Juan de Garay funda a cidade de novo, agora para ficar."],
      ["1680", "Os portugueses fundam Colonia do Sacramento, do outro lado do rio."],
      ["1776", "Buenos Aires vira capital do Vice-Reino do Rio da Prata."],
      ["1806 e 1807", "A cidade expulsa duas invasões inglesas."],
      ["1810", "Revolução de Maio: o primeiro governo próprio, na atual Plaza de Mayo."],
      ["1816", "A Argentina declara a independência, em Tucumán."],
      ["1871", "A febre amarela leva as famílias ricas de San Telmo para o norte, para Recoleta."],
      ["1880 a 1914", "Milhões de imigrantes, a maioria italianos e espanhóis, chegam pelo porto."],
      ["1908", "É inaugurado o Teatro Colón."],
      ["1913", "Abre a linha A do metrô, a primeira da América Latina."],
      ["1936", "O Obelisco é erguido nos 400 anos da primeira fundação."],
      ["1946", "Juan Perón chega à presidência, com Evita ao lado."],
      ["1976 a 1983", "Ditadura militar. As Mães da Plaza de Mayo começam suas rondas em 1977."],
      ["2009", "A UNESCO declara o tango Patrimônio Imaterial da Humanidade."]
    ]
  },

  dias: [
    { img: "obelisco", d: "Chegada · a pé e de táxi", t: "Centro, Obelisco e Corrientes", gasto: "R$ 200", seg: 3, bairro: "Centro",
      destaque: ["Para começar", "A avenida Corrientes é a rua das pizzarias e dos teatros. À noite, ela fica cheia."],
      stops: [
        ["10:00", "Aeroporto de Ezeiza → hotel", "Táxi oficial ou aplicativo. Compre o cartão SUBE no caminho.", ["Táxi ou app", "cerca de 50 min"]],
        ["15:00", "Plaza de Mayo e Casa Rosada (por fora)", "A praça da história argentina, com a Catedral e o Cabildo.", ["A pé", "grátis"], "Plaza de Mayo, Buenos Aires"],
        ["17:00", "Café Tortoni", "O café mais antigo da cidade, de 1858. A fila na porta anda rápido.", ["A pé", "café e medialuna"], "Café Tortoni, Buenos Aires"],
        ["19:30", "Obelisco e avenida Corrientes", "Foto no Obelisco iluminado e jantar de pizza portenha.", ["A pé", "pizza"], "Obelisco, Buenos Aires"]],
      comer: [["Güerrín, av. Corrientes 1368", "R$ 40 a R$ 70 por pessoa"], ["El Cuartito, rua Talcahuano", "R$ 45 a R$ 75 por pessoa"]],
      chuva: "Troque a praça pela visita guiada ao Teatro Colón, perto do Obelisco. Reserve no site.",
      tip: ["Para economizar", "Uma pizza grande serve 2 pessoas. No balcão da Güerrín sai mais barato que na mesa."] },

    { img: "telmo", d: "Faça este dia num domingo", t: "San Telmo e a feira de domingo", gasto: "R$ 230", seg: 3, bairro: "San Telmo",
      destaque: ["Só no domingo", "Aos domingos, a rua Defensa vira uma feira de antiguidades, com tango na praça."],
      stops: [
        ["10:00", "Feira de San Telmo (rua Defensa)", "Antiguidades, artesanato e música de rua até a Plaza Dorrego.", ["A pé", "grátis"], "Feria de San Telmo, Defensa, Buenos Aires"],
        ["12:30", "Mercado de San Telmo", "Mercado coberto de 1897, com antiquários e comida. Bom para almoçar.", ["A pé", "almoço"], "Mercado de San Telmo, Buenos Aires"],
        ["15:00", "Plaza Dorrego", "O coração do bairro. No domingo, casais dançam tango por gorjeta.", ["A pé", "grátis"], "Plaza Dorrego, Buenos Aires"],
        ["17:00", "Parque Lezama", "Fim de tarde no parque, ao lado do Museu Histórico Nacional.", ["A pé", "grátis"], "Parque Lezama, Buenos Aires"]],
      comer: [["Choripán na feira ou no mercado", "R$ 20 a R$ 35 por pessoa"], ["Parrilla El Desnivel, rua Defensa", "R$ 60 a R$ 100 por pessoa"]],
      chuva: "O Mercado de San Telmo é coberto. Depois, vá ao Museu de Arte Moderna (MAMBA), na av. San Juan.",
      tip: ["Atenção", "Na feira, celular no bolso da frente e mochila na frente. É onde mais se furta turista."],
      semana: { dias: [0],
        ultimo: { img: "telmo", d: "Último dia", t: "Feira de San Telmo e volta", gasto: "R$ 220", seg: 3, bairro: "San Telmo",
          destaque: ["Domingo de feira", "Hoje a rua Defensa vira uma feira de antiguidades. Deixe a mala pronta no hotel."],
          stops: [
            ["10:00", "Feira de San Telmo (rua Defensa)", "Antiguidades, artesanato e música até a Plaza Dorrego. Fica até 13h30.", ["A pé", "grátis"], "Feria de San Telmo, Defensa, Buenos Aires"],
            ["12:00", "Plaza Dorrego", "O coração do bairro, com tango na praça por gorjeta.", ["A pé", "grátis"], "Plaza Dorrego, Buenos Aires"],
            ["13:30", "Almoço no Mercado de San Telmo", "Mercado coberto de 1897, com barracas de comida e antiquários.", ["A pé", "almoço"], "Mercado de San Telmo, Buenos Aires"],
            ["16:00", "Ida para o aeroporto", "Pegue a mala no hotel. Ezeiza (EZE) ou Aeroparque (AEP), 3h antes do voo.", ["Táxi ou transfer", "50 min a 1h30"]]],
          comer: [["Choripán numa barraca da feira", "R$ 20 a R$ 35 por pessoa"], ["Barracas do Mercado de San Telmo", "R$ 50 a R$ 90 por pessoa"]],
          chuva: "O Mercado de San Telmo é coberto e abre no domingo. Com chuva forte, a feira encolhe: fique no mercado.",
          tip: ["Não esqueça", "Gaste os pesos que sobrarem na feira. Trocar peso argentino de volta no Brasil dá perda grande."] },
        meio: { img: "obelisco", d: "A pé e de aplicativo", t: "Recoleta e Palermo", gasto: "R$ 280", seg: 4, bairro: "Recoleta e Palermo",
          destaque: ["Bairros verdes", "Recoleta e Palermo são tranquilos e bons para andar. A feira de domingo fica para o dia 7."],
          stops: [
            ["09:00", "Cemitério da Recoleta", "Túmulos de mármore e o jazigo de Evita. Pago para estrangeiros.", ["Táxi ou app", "ingresso pago"], "Cementerio de la Recoleta, Buenos Aires"],
            ["11:00", "Floralis Genérica", "A flor gigante de metal, na Plaza de las Naciones Unidas.", ["A pé", "grátis"], "Floralis Genérica, Buenos Aires"],
            ["12:30", "Jardim Japonês e Palermo", "Almoço em Palermo e passeio pelo Jardim Japonês.", ["App", "ingresso pago"], "Jardín Japonés, Buenos Aires"],
            ["17:00", "Palermo Soho", "Ruas de lojas, cafés e bares. Fique para jantar no bairro.", ["A pé", "grátis"], "Plaza Serrano, Buenos Aires"]],
          comer: [["Empanadas ou milanesa em Palermo Soho", "R$ 60 a R$ 100 por pessoa"], ["Medialunas e café na Recoleta", "R$ 20 a R$ 40 por pessoa"]],
          chuva: "Troque o Jardim Japonês pelo Museu Nacional de Belas Artes, grátis e aberto na terça. O MALBA fecha na terça.",
          tip: ["Para economizar", "Os Bosques de Palermo, ao lado do Jardim Japonês, são grátis e ótimos para caminhar."] },
        alternativa: { img: "telmo", d: "A pé pelo bairro antigo", t: "San Telmo, o bairro antigo", gasto: "R$ 200", seg: 3, bairro: "San Telmo",
          destaque: ["Sem feira, com calma", "A feira de domingo não cai na sua viagem, mas os antiquários e o mercado abrem."],
          stops: [
            ["10:00", "Rua Defensa e antiquários", "Lojas de antiguidades e casarões, da Plaza de Mayo até San Telmo.", ["A pé", "grátis"], "Defensa 1000, San Telmo, Buenos Aires"],
            ["12:30", "Mercado de San Telmo", "Mercado coberto de 1897, com antiquários e comida. Bom para almoçar.", ["A pé", "almoço"], "Mercado de San Telmo, Buenos Aires"],
            ["15:00", "Pasaje de la Defensa", "Casarão antigo com pátios internos e lojinhas.", ["A pé", "grátis"], "Pasaje de la Defensa, Buenos Aires"],
            ["17:00", "Plaza Dorrego e Parque Lezama", "Café na praça e fim de tarde no parque.", ["A pé", "grátis"], "Plaza Dorrego, Buenos Aires"]],
          comer: [["Barracas do Mercado de San Telmo", "R$ 40 a R$ 80 por pessoa"], ["Parrilla El Desnivel, rua Defensa", "R$ 60 a R$ 100 por pessoa"]],
          chuva: "O Mercado de San Telmo é coberto e abre todos os dias. Fique por lá e pelos antiquários.",
          tip: ["Atenção", "Celular no bolso da frente e mochila na frente nas ruas mais cheias do bairro."] } } },

    { img: "capa", d: "De táxi na ida e na volta", t: "La Boca e Caminito", gasto: "R$ 300", seg: 2, bairro: "La Boca",
      destaque: ["Vá de dia", "Caminito é colorido e turístico. Fique nas ruas com movimento e saia antes de escurecer."],
      stops: [
        ["10:00", "Caminito", "Casas coloridas e tango. Fique nas 3 ou 4 quadras com turistas.", ["Táxi ou app", "grátis"], "Caminito, La Boca, Buenos Aires"],
        ["11:30", "La Bombonera", "O estádio do Boca Juniors e seu museu. Pago, fecha em dia de jogo.", ["A pé", "ingresso pago"], "La Bombonera, Buenos Aires"],
        ["14:00", "Fundación Proa", "Arte na beira do Riachuelo. Abre de quarta a domingo, das 12h às 19h.", ["A pé", "grátis às quartas"], "Fundación Proa, Buenos Aires"],
        ["16:00", "Volta de táxi ou app", "Peça o carro na frente do Caminito. Não volte a pé até San Telmo.", ["Táxi ou app", "cerca de 15 min"]]],
      comer: [["Restaurante no Caminito, com tango", "R$ 70 a R$ 120 por pessoa"], ["Pizzaria Banchero, av. Almirante Brown", "R$ 40 a R$ 70 por pessoa"]],
      chuva: "Fique no museu do Boca e na Fundación Proa, que são cobertos. Na segunda e na terça, a Proa fecha.",
      tip: ["Segurança", "Nada de celular na mão fora das ruas turísticas. À noite, em La Boca, só de táxi."] },

    { img: "madero", d: "A pé pela beira do rio", t: "Puerto Madero e parrilla", gasto: "R$ 290", seg: 5, bairro: "Puerto Madero",
      destaque: ["O bairro mais novo", "As docas do porto viraram restaurantes e prédios altos. É ótimo para caminhar."],
      stops: [
        ["10:00", "Reserva Ecológica Costanera Sur", "Trilhas planas até a beira do Rio da Prata. Fecha às segundas.", ["A pé", "grátis"], "Reserva Ecológica Costanera Sur, Buenos Aires"],
        ["13:00", "Puente de la Mujer", "A ponte branca de Santiago Calatrava, de 2001. Siga pelas docas.", ["A pé", "grátis"], "Puente de la Mujer, Buenos Aires"],
        ["15:00", "Fragata Sarmiento", "Navio-escola de 1897 que virou museu, na doca 3.", ["A pé", "entrada barata"], "Fragata Presidente Sarmiento, Buenos Aires"],
        ["20:30", "Jantar de parrilla", "Portenho janta tarde. Veja como pedir na página @@PG:parrilla@@.", ["A pé ou app", "reserve"]]],
      comer: [["Parrilla Peña, no Centro", "R$ 80 a R$ 130 por pessoa"], ["Restaurantes das docas (mais caros)", "R$ 150 a R$ 300 por pessoa"]],
      chuva: "Troque a reserva pela Colección Fortabat, museu de arte argentina em Puerto Madero.",
      tip: ["Para economizar", "No almoço, procure o \"menú ejecutivo\": prato, bebida e sobremesa por preço fechado."] },

    { img: "tango", d: "Dia livre e show à noite", t: "Noite de tango", gasto: "R$ 800", seg: 3, bairro: "San Telmo e Almagro",
      destaque: ["Show ou milonga", "O show é um espetáculo. A milonga é o baile dos portenhos. Dá para fazer os dois."],
      stops: [
        ["10:00", "Palacio Barolo", "Prédio de 1923 inspirado na Divina Comédia. Visita guiada com reserva.", ["Metrô", "ingresso pago"], "Palacio Barolo, Buenos Aires"],
        ["15:00", "Aula de tango para iniciantes", "Muitas milongas dão aula em grupo antes do baile.", ["App", "aula barata"]],
        ["20:00", "Show de tango com jantar", "El Viejo Almacén e Café de los Angelitos são clássicos. Compre no site.", ["App", "reserve"], "El Viejo Almacén, Buenos Aires"],
        ["23:30", "Milonga (opção barata)", "La Catedral, em Almagro, ou La Viruta, em Palermo. Baile até tarde.", ["App", "entrada barata"], "La Catedral Club, Buenos Aires"]],
      comer: [["Jantar do show (já está no gasto do dia)", "incluído no show"], ["Empanadas numa rotisería", "R$ 20 a R$ 40 por pessoa"]],
      chuva: "Show e milonga são em salão fechado. De dia, troque o Barolo pela livraria El Ateneo Grand Splendid.",
      tip: ["Sem preço de turista", "Compre no site do próprio show: hotel e agência cobram comissão. Sem jantar, o dia sai uns R$ 300 mais barato."] },

    { img: "colonia", d: "Bate-volta de barco", t: "Colonia del Sacramento, no Uruguai", gasto: "R$ 700", seg: 5, bairro: "Colonia (Uruguai)",
      destaque: ["Leve o documento", "A migração da Argentina e do Uruguai é feita no terminal, na ida e na volta. RG ou passaporte."],
      stops: [
        ["07:30", "Terminal da sua empresa", "Buquebus em Puerto Madero ou Colonia Express. Chegue 1h a 1h30 antes.", ["Táxi ou app", "barco de 1h15"]],
        ["10:00", "Calle de los Suspiros", "Entre pelo Portón de Campo e desça a rua de pedra até o rio.", ["A pé", "grátis"], "Calle de los Suspiros, Colonia del Sacramento"],
        ["11:30", "Farol e Plaza Mayor", "Suba o farol para ver o rio e os telhados. Subida paga.", ["A pé", "entrada barata"], "Faro de Colonia del Sacramento"],
        ["16:30", "Pôr do sol e volta", "Veja o sol cair no rio e embarque. Confira o horário na passagem.", ["A pé", "barco"]]],
      comer: [["Chivito no bairro histórico", "R$ 60 a R$ 110 por pessoa"], ["Lanche na rua General Flores", "R$ 30 a R$ 60 por pessoa"]],
      chuva: "Com chuva fraca o passeio vale. Com temporal o barco pode atrasar: veja as regras de remarcação.",
      tip: ["Pague com cartão", "No Uruguai, restaurante pago com cartão estrangeiro tem desconto do IVA, prorrogado até 04/2027."] },

    { img: "obelisco", d: "Último dia", t: "Recoleta, Palermo e volta", gasto: "R$ 300", seg: 4, bairro: "Recoleta e Palermo",
      destaque: ["Dia de despedida", "Deixe a mala no hotel. Recoleta e Palermo são bairros verdes e bons para andar."],
      stops: [
        ["09:00", "Cemitério da Recoleta", "Túmulos de mármore e o jazigo de Evita. Pago para estrangeiros.", ["Táxi ou app", "ingresso pago"], "Cementerio de la Recoleta, Buenos Aires"],
        ["11:00", "Floralis Genérica", "A flor gigante de metal, na Plaza de las Naciones Unidas.", ["A pé", "grátis"], "Floralis Genérica, Buenos Aires"],
        ["12:30", "Jardim Japonês e Palermo", "Almoço em Palermo e passeio pelo Jardim Japonês.", ["App", "ingresso pago"], "Jardín Japonés, Buenos Aires"],
        ["16:00", "Ida para o aeroporto", "Ezeiza (EZE) ou Aeroparque (AEP). Chegue 3 horas antes do voo.", ["Táxi ou transfer", "50 min a 1h30"]]],
      comer: [["Empanadas ou milanesa em Palermo Soho", "R$ 60 a R$ 100 por pessoa"], ["Medialunas e café na Recoleta", "R$ 20 a R$ 40 por pessoa"]],
      chuva: "Troque o Jardim Japonês pelo Museu Nacional de Belas Artes (grátis, fecha na segunda) ou pelo MALBA (fecha na terça).",
      tip: ["Não esqueça", "Gaste os pesos que sobrarem. Trocar peso argentino de volta no Brasil dá perda grande."] }
  ],

  guiasLugar: {
    grupo: "Bairros e lugares",
    rotulo: "Lugar",
    itens: [
      { img: "telmo", t: "Feira de San Telmo", dia: 2, tempo: "3 a 4 horas",
        hist: "San Telmo é um dos bairros mais antigos de Buenos Aires. As famílias ricas moravam aqui até a febre amarela de 1871, quando se mudaram para o norte, e os casarões viraram cortiços de imigrantes. A feira de antiguidades da Plaza Dorrego começou em 1970 e cresceu até ocupar a rua Defensa. Hoje, todo domingo, são centenas de barracas de antiguidades, artesanato e comida, com música e tango na rua.",
        passos: [["Plaza de Mayo", "comece no início da rua Defensa e desça no sentido sul."], ["Rua Defensa", "artesanato no primeiro trecho, antiguidades perto da praça."], ["Mercado de San Telmo", "entre pela rua Defensa e veja os antiquários lá dentro."], ["Plaza Dorrego", "sifões, discos, talheres de prata e tango no fim da tarde."], ["Pasaje de la Defensa", "casarão antigo com pátios, na própria rua Defensa."]],
        foto: "Os casais de tango na Plaza Dorrego, no fim da tarde.", saber: "A feira vai das 10h até umas 17h, só no domingo. Barganhe com calma e leve pesos em dinheiro." },
      { img: "capa", t: "Caminito", dia: 3, tempo: "2 a 3 horas",
        hist: "La Boca foi o bairro dos imigrantes genoveses que trabalhavam no porto do Riachuelo. Eles pintavam as casas de chapa com a tinta que sobrava dos barcos, por isso as cores misturadas. Nos anos 1950, o pintor Benito Quinquela Martín ajudou a transformar um antigo ramal de trem desativado na rua-museu que hoje se chama Caminito, nome de um tango de 1926.",
        passos: [["Rua Caminito", "a rua curta e torta, com murais e casas coloridas."], ["Conventillos", "entre num dos antigos cortiços, hoje com lojas no pátio."], ["Museu Benito Quinquela Martín", "quadros do pintor do bairro e um terraço com vista."], ["La Bombonera", "a três quadras, com o museu do Boca Juniors."], ["Volta", "peça o táxi ou o app na frente do Caminito."]],
        foto: "As casas coloridas vistas do começo da rua Caminito, de manhã.", saber: "Dançarinos e sósias de Maradona cobram pela foto. Combine o preço antes." },
      { img: "madero", t: "Puerto Madero", dia: 4, tempo: "meio dia",
        hist: "O porto foi inaugurado entre 1889 e 1897, mas logo ficou pequeno para os navios novos e foi abandonado. A partir dos anos 1990, os armazéns de tijolo viraram escritórios, restaurantes e apartamentos, e o bairro ganhou os prédios mais altos da cidade. As ruas têm nomes de mulheres argentinas. O Puente de la Mujer, do arquiteto espanhol Santiago Calatrava, foi inaugurado em 2001 e gira para deixar os barcos passarem.",
        passos: [["Dique 3", "comece pelos armazéns de tijolo e pela Fragata Sarmiento."], ["Puente de la Mujer", "atravesse para o lado dos prédios novos."], ["Costanera Sur", "a antiga avenida da beira do rio, com carrinhos de choripán."], ["Reserva Ecológica", "trilhas até a margem do Rio da Prata (fecha na segunda)."], ["Docas à noite", "volte para o jantar, com a ponte iluminada."]],
        foto: "O Puente de la Mujer ao pôr do sol, com os prédios atrás.", saber: "É o bairro mais tranquilo para andar à noite, mas os restaurantes das docas são os mais caros da cidade." },
      { img: "tango", t: "Show de tango", dia: 5, tempo: "2 a 3 horas",
        hist: "O tango nasceu no fim do século 19, nos subúrbios e cortiços de Buenos Aires e de Montevidéu, misturando a música dos imigrantes europeus, ritmos africanos e a milonga do campo. Carlos Gardel levou o tango cantado para o mundo nos anos 1920 e 1930. Em 2009, a UNESCO declarou o tango Patrimônio Imaterial da Humanidade, junto com o Uruguai. El Viejo Almacén, em San Telmo, é casa de tango desde 1969.",
        passos: [["Escolha o show", "compare no site oficial: só show, com jantar ou com transfer."], ["Reserve", "com 2 ou 3 dias de antecedência, mais nos feriados."], ["Jantar", "o pacote com jantar inclui vinho. Só o show sai bem mais barato."], ["Depois", "se ainda tiver energia, siga para uma milonga."]],
        foto: "O salão antes do show começar. Durante o show, muitas casas proíbem fotos.", saber: "Roupa casual arrumada basta. Chegue 30 minutos antes para pegar uma mesa melhor." },
      { img: "colonia", t: "Colonia del Sacramento", dia: 6, tempo: "o dia inteiro",
        hist: "Os portugueses fundaram Colonia do Sacramento em 1680, bem em frente a Buenos Aires, para disputar o Rio da Prata com a Espanha. A cidade trocou de mãos várias vezes até ficar com a Espanha no fim do século 18. Por isso mistura ruas portuguesas, de pedra e com valeta no meio, com o traçado espanhol. O bairro histórico é Patrimônio Mundial da UNESCO desde 1995.",
        passos: [["Portón de Campo", "a porta da antiga muralha, com a ponte levadiça."], ["Calle de los Suspiros", "a rua de pedra mais antiga, descendo até o rio."], ["Plaza Mayor e farol", "suba o farol para ver os telhados e o rio."], ["Basílica do Santíssimo Sacramento", "uma das igrejas mais antigas do Uruguai."], ["Rambla", "a beira do rio para o pôr do sol, antes do barco."]],
        foto: "A Calle de los Suspiros de manhã, antes dos grupos.", saber: "Os museus do bairro histórico usam um só ingresso barato. Leve o mesmo documento da ida para a migração da volta." },
      { img: "obelisco", t: "Cemitério da Recoleta", dia: 7, tempo: "1h30",
        hist: "O cemitério foi aberto em 1822 na horta de um convento de frades recoletos, que deu nome ao bairro. Quando as famílias ricas fugiram da febre amarela de 1871 e vieram para cá, os túmulos ficaram cada vez maiores. São cerca de 4.800 jazigos, muitos com estátuas de mármore. Ali estão presidentes, escritores e Eva Perón, a Evita, no jazigo da família Duarte.",
        passos: [["Entrada", "pegue o mapa na portaria. A entrada é paga para estrangeiros."], ["Jazigo da família Duarte", "onde está Evita, sempre com flores. Siga as placas."], ["Rufina Cambaceres", "a estátua da jovem que, segundo a lenda, foi enterrada viva."], ["Basílica del Pilar", "a igreja colonial de 1732, ao lado do cemitério."], ["Centro Cultural Recoleta", "o antigo convento, com exposições grátis."]],
        foto: "As ruas de túmulos com as cúpulas ao fundo.", saber: "Abre todos os dias, das 9h às 17h. Tem visita guiada em espanhol e em inglês." }
    ]
  },

  especiais: [
    { id: "cambio", sumario: "Câmbio: como pagar", rotulo: "Dinheiro", kick: "Cartão, Pix, dólar ou real", titulo: "Câmbio: como pagar",
      sub: "O câmbio argentino muda muito. Use esta página para comparar na semana da viagem, não para decidir hoje.",
      tabela: { cab: ["Forma de pagar", "Como funciona", "Atenção"], linhas: [
        ["Cartão de crédito", "Para estrangeiro, a cobrança costuma seguir uma cotação próxima do dólar MEP.", "IOF de 3,5% e cotação do dia do fechamento."],
        ["Conta global ou débito", "Apps como Wise e Nomad convertem na hora e mostram o valor em reais.", "Confira o IOF e a tarifa do app."],
        ["Pix", "Algumas lojas e restaurantes aceitam Pix por QR code, em reais.", "Veja o valor em reais antes de confirmar."],
        ["Dólar em espécie", "Troca por pesos numa casa de câmbio (casa de cambio).", "Notas de 100, novas e sem marca. Nunca na rua."],
        ["Real em espécie", "Algumas casas de câmbio trocam, com cotação pior.", "Use só como reserva."],
        ["Saque no caixa", "Funciona com cartão internacional.", "Taxa alta e limite baixo. Último recurso."]] },
      cards: [
        { ic: "coin", t: "Como comparar no dia", itens: ["Veja o dólar MEP e o dólar blue em sites como Ámbito ou DolarHoy.", "Simule a mesma compra no cartão, no Pix e em pesos e escolha a que custar menos reais.", "Pague sempre em pesos. Recuse a conversão para reais na maquininha."] },
        { ic: "spark", t: "Uma mistura que costuma funcionar", itens: ["Cartão ou conta global para hotel, restaurante e passeios.", "Um pouco de pesos em espécie para gorjeta, feira e táxi.", "Uma reserva em dólar para emergência."] }
      ],
      avisos: [["O câmbio muda rápido", "Na Argentina, a diferença entre as cotações já mudou muitas vezes em poucos meses. O que era melhor no ano passado pode não ser hoje. Confira na semana da viagem."]] },
    { id: "parrilla", sumario: "Parrilla: como pedir", rotulo: "Comida", kick: "Para não errar no pedido", titulo: "Parrilla: como pedir",
      sub: "Na parrilla, a carne vem sozinha no prato. Salada, batata e molho se pedem à parte.",
      tabela: { cab: ["No cardápio", "O que é", "Para quem"], linhas: [
        ["Bife de chorizo", "Contrafilé alto e suculento. O corte mais pedido.", "Primeira vez"],
        ["Ojo de bife", "Miolo do bife ancho, com gordura entremeada.", "Quem gosta de carne macia"],
        ["Vacío", "Fraldinha, com uma capa de gordura crocante.", "Quem gosta de sabor forte"],
        ["Entraña", "Diafragma, fino e muito saboroso.", "Quem quer provar algo diferente"],
        ["Asado de tira", "Costela cortada em tiras, atravessando o osso.", "Para dividir"],
        ["Provoleta", "Queijo provolone grelhado com orégano.", "Entrada para a mesa"],
        ["Mollejas e chinchulines", "Miúdos grelhados: timo e tripa.", "Quem é aventureiro"],
        ["Chimichurri", "Molho de salsinha, alho, orégano, vinagre e azeite.", "Vai bem com tudo"]] },
      cards: [
        { t: "Ponto da carne", itens: ["Jugoso: malpassado. A punto: ao ponto. Bien cocido: bem passado.", "Sem pedir, a carne costuma vir entre jugoso e a punto."] },
        { t: "Quanto pedir", itens: ["Um bife de chorizo tem cerca de 400 g e serve 1 pessoa com fome, ou 2 com entrada.", "Parrillada é a tábua mista para dividir, com linguiça e miúdos."] }
      ] },
    { id: "vinho", sumario: "Vinho argentino", rotulo: "Comida", kick: "Malbec e companhia", titulo: "Vinho argentino: como pedir",
      cards: [
        { t: "Malbec", itens: ["A uva-símbolo da Argentina: tinto encorpado e frutado.", "Combina com bife de chorizo e vacío."] },
        { t: "Torrontés", itens: ["Branco aromático, típico de Salta.", "Bom com empanadas e peixe."] },
        { t: "Outros tintos", itens: ["Cabernet Sauvignon e Bonarda são boas trocas para o Malbec.", "Os cortes (blends) de Mendoza costumam ter bom preço."] },
        { t: "Como pedir", itens: ["Una copa de vino tinto: uma taça. Una botella: a garrafa.", "O vinho da casa costuma ser honesto e barato."] },
        { t: "Preços", itens: ["No restaurante, a garrafa custa 2 a 3 vezes o preço do mercado.", "No supermercado há bons vinhos baratos para tomar no hotel."] },
        { t: "Levar para o Brasil", itens: ["A Receita limita bebida alcoólica a 12 litros por pessoa, dentro da cota.", "Garrafa vai na mala despachada, com roupa em volta."] }
      ],
      avisos: [["Beba com calma", "O vinho é barato e a carne é pesada. Intercale com água sem gás (agua sin gas) e deixe o carro para outro dia."]] }
  ],

  orcamento: {
    colDinheiro: "Dinheiro vivo",
    dias: [
      ["R$ 60 em pesos", "Pizza no balcão em vez de na mesa"],
      ["R$ 80 em pesos", "Lanche de rua em vez de restaurante"],
      ["R$ 40 em pesos", "Almoço fora da rua do Caminito"],
      ["R$ 50 em pesos", "Menú ejecutivo no almoço"],
      ["R$ 50 em pesos", "Show sem jantar, ou só a milonga"],
      ["Cartão", "Colonia Express costuma custar menos"],
      ["R$ 40 em pesos", "Bosques de Palermo"]
    ],
    fora: "como o seguro viagem e o traslado do aeroporto na chegada e na volta",
    nota: "Dinheiro vivo por pessoa, em pesos, para gorjeta, feira e lugares sem cartão. Os valores em reais são de referência: os preços em pesos mudam rápido."
  },

  comida: {
    titulo: "Comida típica",
    pratos: [
      ["Bife de chorizo", "Contrafilé alto na parrilla. Veja os cortes na página @@PG:parrilla@@.", "R$ 60 a 120 · parrillas"],
      ["Empanadas", "Pastéis assados de carne, frango ou queijo. Pede-se por unidade.", "R$ 6 a 12 cada · rotiserías"],
      ["Choripán", "Linguiça na brasa no pão, com chimichurri.", "R$ 15 a 30 · feira e Costanera Sur"],
      ["Milanesa napolitana", "Bife à milanesa com presunto, molho e queijo. Serve 2.", "R$ 50 a 90 · bodegones"],
      ["Pizza com fainá", "Pizza alta e com muito queijo, com uma fatia de grão-de-bico.", "R$ 40 a 70 · av. Corrientes"],
      ["Provoleta", "Provolone grelhado com orégano, entrada de parrilla.", "R$ 30 a 50 · parrillas"],
      ["Medialunas", "Croissants pequenos e doces, com café.", "R$ 10 a 20 · cafés e padarias"],
      ["Alfajor", "Biscoito recheado de doce de leite, coberto ou não.", "R$ 5 a 15 · quiosques e cafés"],
      ["Sorvete de dulce de leche", "O sabor mais argentino da sorveteria.", "R$ 15 a 30 · heladerías"],
      ["Chivito", "Sanduíche uruguaio de filé, ovo, presunto e queijo.", "R$ 50 a 90 · Colonia"]
    ],
    cards: [
      { t: "Horários de comer", itens: ["Almoço entre 13h e 15h. Jantar a partir das 21h.", "Fora desses horários, procure um café (confitería) ou uma rotisería."] },
      { t: "Gorjeta e cubierto", itens: ["Gorjeta (propina) de cerca de 10%, fora da conta. Muitas vezes só em dinheiro.", "O cubierto é uma taxa por pessoa, de pão e mesa. Precisa estar no cardápio."] }
    ]
  },

  golpes: {
    itens: [
      ["Nota falsa no troco", "Confira as notas grandes que receber, principalmente de taxista e de cambista. Prefira pagar no cartão ou no aplicativo."],
      ["Câmbio na rua", "Na rua Florida, cambistas (arbolitos) chamam o turista. O risco é nota falsa ou conta errada. Troque só em casa de câmbio."],
      ["Golpe da mancha", "Alguém suja sua roupa e outra pessoa \"ajuda\" a limpar enquanto leva a bolsa. Recuse a ajuda e saia andando."],
      ["Celular na mão", "Ladrões de moto ou bicicleta puxam o celular na calçada. Use o celular encostado na parede ou dentro de uma loja."],
      ["Táxi", "Use aplicativo (Uber, Cabify, DiDi) ou táxi chamado pelo hotel. No aeroporto, só no balcão oficial ou no app."],
      ["Metrô e feira", "No metrô cheio e na feira de San Telmo, mochila na frente e nada no bolso de trás."]
    ],
    perda: ["Registre a ocorrência (denuncia) na polícia e peça o comprovante.", "Procure o consulado do Brasil (telefones na página @@PG:emergencia@@).", "Sem documento, o consulado emite a Autorização de Retorno ao Brasil (ARB). Leve uma cópia do RG ou do passaporte na mala."],
    aviso: ["Segurança por bairro", "Palermo, Recoleta e Puerto Madero são tranquilos para andar. Centro e San Telmo pedem atenção à noite. Em La Boca, fique nas ruas turísticas de dia e use táxi à noite. Evite as ruas em volta das estações Constitución e Retiro depois que escurece."]
  },

  fotos: {
    itens: [
      ["O Obelisco iluminado na avenida 9 de Julio", "Fim da tarde", 1],
      ["A Casa Rosada vista da Plaza de Mayo", "Manhã", 1],
      ["Os casais de tango na Plaza Dorrego", "Domingo à tarde", 2],
      ["As casas coloridas do Caminito", "Manhã", 3],
      ["O Puente de la Mujer com as docas", "Pôr do sol", 4],
      ["O Rio da Prata da Reserva Ecológica", "Manhã", 4],
      ["O salão da casa de tango, sem flash", "Antes do show", 5],
      ["A Calle de los Suspiros, em Colonia", "Manhã", 6],
      ["O pôr do sol no rio, em Colonia", "Fim da tarde", 6],
      ["A Floralis Genérica aberta", "Meio do dia", 7]
    ],
    aviso: ["Respeito", "Muitas casas de tango proíbem filmar o show. No Caminito, os dançarinos de rua cobram pela foto: combine o preço antes."]
  },

  extras: [
    { kick: "Um dia a mais", titulo: "Tigre e o Delta do Paraná",
      cards: [{ t: "Tigre e o Delta", o: "Cidade na entrada do delta, com rios, ilhas, casas sobre palafitas e o mercado do Puerto de Frutos.", preco: "R$ 100 a 250", min: 100, max: 250,
        itens: ["Trem da linha Mitre a partir de Retiro, cerca de 1 hora, ou o Tren de la Costa.", "Passeio de lancha coletiva (lancha colectiva) pelos rios do delta.", "Puerto de Frutos: artesanato, móveis de vime e comida."],
        dica: "Melhor num dia de sol. No fim de semana fica cheio." }],
      aviso: ["Quando encaixar", "Troque pelo dia 7 se o voo for à noite, ou acrescente um dia antes da volta. Se a sua sobra for pequena, guarde para imprevistos."] },
    { kick: "Mais duas ideias", titulo: "Estância e futebol",
      cards: [
        { t: "Dia de campo numa estância", o: "Passeio a uma estância nos arredores, com cavalos, churrasco e show gaúcho.", preco: "R$ 400 a 800", min: 400, max: 800,
          itens: ["San Antonio de Areco é a cidade gaúcha mais conhecida, a cerca de 1h30.", "O pacote costuma incluir transporte, almoço e bebida.", "Bom para ver o campo argentino."], dica: "Reserve com agência ou direto com a estância." },
        { t: "Jogo de futebol", o: "Ver o Boca na Bombonera ou o River no Monumental é programa disputado.", preco: "R$ 300 a 900", min: 300, max: 900,
          itens: ["Para turista, o ingresso costuma vir em pacote com transporte.", "Carteirinha de sócio vendida na porta é golpe comum.", "Vá e volte com o grupo do pacote."], dica: "Confira o calendário do campeonato perto da viagem." }
      ],
      aviso: ["Escolha um", "Os dois juntos pesam no orçamento. Com sobra pequena, fique com um só, ou com nenhum."] }
  ],

  guias: {
    linhas: [
      ["Caminhada pelo centro e San Telmo", "Tour a pé em grupo, com gorjeta no fim", "BA Free Tour · Free Walks Buenos Aires", "$", "1 ou 2"],
      ["Show de tango", "Com ou sem jantar e transfer", "El Viejo Almacén · Café de los Angelitos · Esquina Carlos Gardel · Rojo Tango", "$$", "5"],
      ["Barco para Colonia", "Ida e volta no mesmo dia", "Buquebus · Colonia Express · Seacat", "$$", "6"],
      ["Passeio de bicicleta", "Em grupo, com guia, por Puerto Madero e La Boca", "La Bicicleta Naranja · Biking Buenos Aires", "$", "4"],
      ["Transfer do aeroporto", "De Ezeiza ao hotel", "Tienda León · táxi oficial do aeroporto · Uber", "$", "1 e 7"]
    ],
    escolher: "Prefira empresas com avaliações dos últimos 6 meses e cancelamento grátis. Para o show de tango e o barco, compare o preço no site oficial antes de comprar em agência."
  },

  emergencia: {
    numeros: [["911", "Polícia (na cidade)"], ["107", "Ambulância (SAME)"], ["100", "Bombeiros"], ["103", "Defesa Civil"]],
    consulado: { t: "Consulado do Brasil e Polícia Turística", p: [
      "<b>Consulado-Geral do Brasil em Buenos Aires</b>: Carlos Pellegrini 1363, 5º andar, perto do Obelisco. Telefone +54 11 4515-6500. <b>Plantão, só emergências: +54 9 11 4199-9668</b>, ligação ou WhatsApp (de celular argentino, 15 4199-9668). A Embaixada, na Cerrito 1350, passa as emergências ao consulado.",
      "Em Colonia: plantão do Consulado-Geral em Montevidéu, <b>+598 91 300 301</b>, 24 horas, com WhatsApp. Itamaraty, em Brasília, fora do horário comercial: <b>+55 61 98260-0610</b>. Polícia Turística: Av. Corrientes 436, 24 horas, WhatsApp +54 9 11 5050-9260." ] },
    frases: [
      ["Olá / tchau", "Hola / chau", "espanhol"], ["Bom dia", "Buen día", "espanhol"], ["Obrigado", "Gracias", "espanhol"],
      ["Com licença / desculpe", "Permiso / disculpe", "espanhol"], ["Quanto custa?", "¿Cuánto sale?", "espanhol"], ["Onde fica…?", "¿Dónde queda…?", "espanhol"],
      ["Banheiro", "Baño", "espanhol"], ["A conta, por favor", "La cuenta, por favor", "espanhol"], ["Taxa de pão e mesa", "Cubierto", "espanhol"],
      ["Gorjeta", "Propina", "espanhol"], ["Posso pagar com cartão?", "¿Puedo pagar con tarjeta?", "espanhol"], ["Ao ponto / bem passada", "A punto / bien cocida", "espanhol"],
      ["Uma taça de vinho tinto", "Una copa de vino tinto", "espanhol"], ["Água sem gás", "Agua sin gas", "espanhol"], ["Socorro!", "¡Ayuda!", "espanhol"],
      ["Hospital / farmácia", "Hospital / farmacia", "espanhol"], ["Ônibus / metrô", "Colectivo / subte", "portenho"], ["Ei (informal, entre amigos)", "Che", "portenho"],
      ["Ótimo, legal", "Bárbaro / joya", "portenho"], ["Entre amigos é \"cara\". Com estranho, ofende", "Boludo (não use)", "portenho"]
    ]
  },

  cartao: {
    kick: "Mostre ao motorista",
    sub: "Escreva o endereço do hotel no espaço e mostre esta página ao taxista ou a quem for pedir informação.",
    pedido: "Por favor, lléveme a:",
    coluna: "Em espanhol",
    lugares: [
      ["Aeroporto de Ezeiza", "Aeropuerto Internacional de Ezeiza"],
      ["Aeroparque", "Aeroparque Jorge Newbery"],
      ["Barco Buquebus", "Terminal Buquebus, Av. Antártida Argentina 821"],
      ["Barco Colonia Express", "Terminal Colonia Express, Av. Elvira Rawson de Dellepiane 155"],
      ["Caminito", "Caminito, La Boca"],
      ["Cemitério da Recoleta", "Cementerio de la Recoleta"]
    ]
  },

  creditos: "\"Buenos Aires - La Boca - Caminito - 200807i\", Luis Argerich (CC BY 2.0); \"San Pedro Telmo (4729482264)\", Jorge Láscar (CC BY 2.0); \"Obelisco de Buenos Aires at sunset\", Dpalma01 (CC BY-SA 4.0); \"Puente de la Mujer, Puerto Madero\", Hernan Pablo (CC BY-SA 4.0); \"El Viejo Almacén de Buenos Aires\", bastique (CC BY-SA 2.0); \"Calle De Los Suspiros, Colonia del Sacramento\", Banfield (CC BY-SA 3.0). Licenças: creativecommons.org/licenses/by/2.0, /by-sa/2.0, /by-sa/3.0 e /by-sa/4.0."
};
