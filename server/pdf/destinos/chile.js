// Roteiro Detalhado + Pré-viagem de Santiago do Chile (com neve). Formato em server/pdf/destinos/LEIA-ME.md.
// Conteúdo escrito de memória, para 2 pessoas que querem ver neve pela primeira vez (oferta de junho a setembro).
//
// CONFERIR antes de vender:
// - Entrada com RG: RG com menos de 10 anos de emissão e em bom estado, ou passaporte válido; CNH não vale.
// - Comprovante de entrada da PDI (Tarjeta de Turismo) e a isenção de IVA (19%) no hotel pagando em dólar.
// - Câmbio de referência: cerca de CLP 170 por real (R$ 100 = cerca de CLP 17.000). Preços em CLP e R$ seguem essa conta.
// - Pix no Chile: aceito só por algumas agências e lojas voltadas a brasileiros.
// - Aeroporto: ônibus Centropuerto e Turbus (CLP 2.000 a 4.000), vans Transvip e Delfos, táxi oficial, apps (Uber, Cabify, Didi).
// - Cartão Bip! (preço do cartão e da passagem do metrô).
// - Teleférico e funicular do San Cristóbal: preço e fechamento de segunda para manutenção.
// - Tour de neve: saída 7h, volta 17h30, CLP 30.000 a 45.000 só o transporte; aluguel de roupa CLP 15.000 a 25.000.
// - Estrada de Farellones: horário de subida (até 14h) e descida (depois das 14h) nos dias de controle; corrente obrigatória.
// - Ingressos do dia: Farellones Parque, El Colorado, La Parva, Valle Nevado; preço de aula de esqui.
// - Temporada de neve: meados de junho ao fim de setembro, melhor em julho e agosto.
// - El Yeso: estrada fechada com neve forte; ônibus MB 72 (metrô Las Mercedes até San José de Maipo).
// - Ônibus Turbus (Terminal Alameda) e Pullman (Terminal Pajaritos) para Valparaíso e Viña: tempo e preço.
// - Ascensores de Valparaíso que estão funcionando (Reina Victoria, El Peral) e preço.
// - La Sebastiana e La Chascona fecham na segunda; preço do ingresso.
// - Museo Fonck (moai na porta) e horário; barco no Muelle Prat (CLP 5.000).
// - Concha y Toro em Pirque: preço da visita, endereço (Av. Virginia Subercaseaux 210) e reserva no site.
// - Cerro Santa Lucía: entrada grátis com registro.
// - Sky Costanera: andar, altura e preço; Pueblito Los Dominicos no fim da linha 1.
// - Cota de bebida alcoólica na volta ao Brasil (12 litros) e regra do SAG para comida na mala.
// - Telefones: 131 ambulância, 132 bombeiros, 133 Carabineros, 134 PDI; plantão do Itamaraty +55 61 98260-0610.
// - Endereço e plantão da Embaixada do Brasil em Santiago (não pusemos número: ver gov.br/mre).
// - Clima mês a mês (mínimas e máximas de Santiago) e meses de chuva.
// - Empresas citadas na página de guias (Ski Total, KL, Turistik, Tours 4 Tips) e se ainda operam.
// - Preços de comida e de diárias de hotel por bairro.

export default {
  nome: "Santiago do Chile",
  moeda: "peso chileno",
  moedaPlural: "pesos chilenos",
  rotuloExtra: "Dia na neve e roupa",

  capa: { img: "neve", frase: "Neve pela primeira vez, Santiago, vinícola e litoral, um dia de cada vez.", ritmo: "Tranquilo, com um dia na neve" },

  referencia: { total: "R$ 1.900", inclui: "comida, passeios e neve", porDia: "cerca de R$ 270" },

  fichaDoc: ["RG ou passaporte", "Número e data de emissão do RG"],
  fichaExtra: [["Tour da neve", "Empresa, data, horário e ponto de saída"], ["Outros passeios", "El Yeso e vinícola: empresa e horário"]],

  mapa: {
    sumario: "Mapa de Santiago e arredores",
    titulo: "Do Pacífico à cordilheira em 2 horas",
    sub: "Santiago fica no meio: o litoral a oeste, a neve a leste. Os números mostram o dia de cada passeio.",
    agua: [{ d: "M0 0 H95 C70 140 115 300 80 520 H0 Z", fill: true, l: "Pacífico", lx: 14, ly: 470 }],
    areas: [
      { x: 105, y: 110, w: 170, h: 200, l: "LITORAL" },
      { x: 300, y: 215, w: 190, h: 200, l: "SANTIAGO" },
      { x: 515, y: 40, w: 190, h: 450, l: "CORDILHEIRA DOS ANDES" }
    ],
    rotas: [
      { d: "M375 285 C310 290 230 250 160 235", l: "Ruta 68 · ônibus 1h30", lx: 260, ly: 300 },
      { d: "M395 270 C450 230 520 180 585 150", l: "40 curvas · 1h30", lx: 455, ly: 190 },
      { d: "M395 300 C470 340 560 370 620 380", l: "2h30 de van", lx: 520, ly: 340 },
      { d: "M385 300 L410 375" }
    ],
    pinos: [
      { x: 150, y: 235, dia: 4, l: "Valparaíso", anc: "end" },
      { x: 175, y: 165, dia: 5, l: "Viña del Mar" },
      { x: 375, y: 285, dia: 1, l: "" },
      { x: 405, y: 260, dia: 7, l: "Costanera" },
      { x: 410, y: 385, dia: 6, l: "Concha y Toro" },
      { x: 600, y: 145, dia: 2, l: "Farellones" },
      { x: 630, y: 380, dia: 3, l: "El Yeso" }
    ],
    notas: [[300, 205, "✈ Aeroporto SCL, 20 km"], [355, 320, "Centro", "middle"], [545, 100, "↑ Valle Nevado, 20 km"], [405, 440, "Pirque: metrô + táxi", "middle"]],
    cards: [
      { t: "Como se orientar", itens: ["A cordilheira fica sempre a leste: se a vê de frente, você olha para o leste.", "O metrô cobre o centro, Providencia e Las Condes.", "Baixe o mapa offline: na montanha o sinal cai."] },
      { t: "Distâncias", itens: ["Santiago a Farellones: cerca de 35 km, 1h30 de curvas.", "Santiago a Valparaíso ou Viña: cerca de 120 km de ônibus.", "Santiago a El Yeso: cerca de 95 km, 2h30 de van."] }
    ]
  },

  quando: [
    ["90", "dias antes", [
      ["Confira o RG ou o passaporte", "RG com menos de 10 anos de emissão e em bom estado. Se o seu é mais velho ou está gasto, faça um novo ou tire o passaporte."],
      ["Compre as passagens", "Simule no vaidarviagem.com.br. Julho tem férias escolares e é o mês mais caro."],
      ["Avise o banco", "Libere o cartão para uso no exterior."]]],
    ["30", "dias antes", [
      ["Contrate o seguro viagem", "Não é exigido na entrada, mas uma ida ao hospital no Chile é cara. Confira se cobre a neve (passeio, não esporte radical)."],
      ["Reserve o tour da neve e o hotel", "Escolha um tour que inclua aluguel de roupa. Veja as empresas na página @@PG:guias@@."],
      ["Separe a roupa de frio", "Veja o que levar e o que alugar na página @@PG:roupa@@."]]],
    ["7", "dias antes", [
      ["Veja a previsão de neve", "Acompanhe a previsão e o estado da estrada de Farellones. Neve forte pode fechar a subida no dia."],
      ["Ative o chip ou eSIM de dados", ""],
      ["Baixe os aplicativos", "Mapa offline de Santiago, Uber ou Cabify e o app do seu banco."]]],
    ["1", "dia antes", [
      ["Separe os documentos", "RG ou passaporte, seguro e reservas impressas. Fotocópia do documento na mala."],
      ["Confira a mala com a lista da página @@PG:mala@@", ""],
      ["Não leve comida fresca", "Fruta, carne, queijo e mel são barrados na entrada do Chile. Na dúvida, declare."]]]
  ],

  regras: {
    titulo: "Documentos, dinheiro e clima",
    cards: [
      { ic: "i-doc", t: "Documentos", itens: ["Brasileiro entra sem visto, por até 90 dias.", "Vale o RG com menos de 10 anos de emissão e em bom estado, ou o passaporte. CNH não vale.", "Guarde o papel de entrada da PDI até a saída do país."] },
      { ic: "coin", t: "Dinheiro", itens: ["Moeda: peso chileno (CLP). R$ 100 dão cerca de CLP 17.000.", "Cartão é aceito em quase tudo. Pix só em algumas agências e lojas para brasileiros.", "Troque reais nas casas de câmbio da rua Agustinas, no centro. Gorjeta: 10%."] },
      { ic: "shirt", t: "Neve", itens: ["Não precisa saber esquiar: dá para brincar, andar de trenó e tirar foto.", "Roupa e bota de neve se alugam em Santiago, no caminho da montanha.", "Óculos escuros e protetor solar: o sol na neve queima."] }
    ],
    avisos: [["Comida na mala: declare", "O Chile é rígido com produtos de origem animal e vegetal. Na chegada, a mala passa pelo raio-x do SAG. Fruta, carne, queijo, mel e sementes precisam ser declarados no formulário, e o que não for declarado pode render multa alta. Chocolate e biscoito industrializado, lacrados, costumam passar. Na dúvida, marque que traz e mostre ao fiscal."]],
    seguranca: "Santiago é tranquila, mas furto de celular e bolsa é comum no centro. Antes de viajar, veja os avisos do Itamaraty para o Chile."
  },

  clima: {
    geral: ["Inverno (junho a agosto): mínimas de 0 a 5 °C e máximas de 14 a 18 °C em Santiago.", "Na montanha, abaixo de zero. Chove em Santiago quando neva na cordilheira."],
    sempre: "Vista-se em camadas: de manhã é gelado e à tarde o sol esquenta.",
    gelado: "Frio de verdade de manhã e à noite. Casaco grosso, gorro e luvas.",
    frio: "Noites frias: leve um casaco quente e uma blusa de lã.",
    calor: "Dias de sol forte: protetor solar e água, mesmo no frio da montanha.",
    chuva: { meses: [5, 6, 7, 8], texto: "Pode chover alguns dias. Leve guarda-chuva e um tênis que não encharque." }
  },

  mala: [
    ["Documentos", ["RG ou passaporte", "Cópia do documento", "Seguro viagem impresso", "Reservas de hotel e tour da neve", "Cartões e um pouco de dinheiro"]],
    ["Roupas de inverno", ["Casaco grosso, de preferência impermeável", "Segunda pele (blusa e calça térmica)", "Blusas de lã ou fleece", "Gorro, cachecol e luvas", "Meias grossas e tênis fechado"]],
    ["Neve e outros", ["Óculos escuros", "Protetor solar e labial", "Hidratante: o ar é seco", "Adaptador de tomada (tipo C ou L)", "Carregador portátil"]]
  ],

  ficar: {
    titulo: "Três bairros, três jeitos de viajar",
    bairros: [
      { n: "Providencia", quem: "Combina com: primeira viagem e casais.",
        pro: ["Metrô na porta (linha 1)", "Seguro e cheio de restaurantes", "Perto do teleférico e do Costanera Center"],
        contra: ["Diárias um pouco mais caras que no centro", "Longe dos terminais de ônibus"] },
      { n: "Las Condes (El Golf e Tobalaba)", quem: "Combina com: quem quer conforto e ficar perto da saída para a neve.",
        pro: ["Bairro moderno e muito seguro", "Mais perto da estrada para Farellones", "Shoppings e lojas de aluguel de roupa"],
        contra: ["Hotéis mais caros", "Pouco movimento à noite"] },
      { n: "Centro, Lastarria e Bellavista", quem: "Combina com: quem quer economizar e gosta de sair à noite.",
        pro: ["Hotéis e comida mais baratos", "Perto do Mercado Central e da Plaza de Armas", "Bares e restaurantes em Bellavista"],
        contra: ["Algumas ruas ficam vazias à noite", "Mais furto de celular"] }
    ],
    estilos: [["Econômico", "R$ 300 a 500", "diária do quarto duplo"], ["Confortável", "R$ 550 a 900", "diária do quarto duplo"], ["Premium", "R$ 1.200 ou mais", "diária do quarto duplo"]],
    nota: "Valores de referência. Julho, com férias no Brasil e no Chile, é o mês mais caro. Hotel pago em dólar por estrangeiro pode sair sem o imposto de 19% (IVA): pergunte na reserva."
  },

  locomover: {
    titulo: "Do aeroporto ao hotel, e pela cidade",
    cab: ["Do aeroporto (SCL)", "Tempo", "Preço", "Bom para"],
    linhas: [
      ["Ônibus Centropuerto ou Turbus", "cerca de 40 min até o metrô", "CLP 2.000 a 4.000 (R$ 12 a 25)", "Quem viaja leve"],
      ["Van compartilhada (Transvip, Delfos)", "40 min a 1h, deixa no hotel", "CLP 10.000 a 15.000 por pessoa", "Casal com mala"],
      ["Aplicativo (Uber, Cabify, Didi)", "30 a 45 min", "CLP 18.000 a 30.000 o carro", "Chegada à noite"],
      ["Táxi oficial ou transfer reservado", "30 a 45 min", "CLP 25.000 a 40.000 o carro", "Quem quer tudo pronto"]
    ],
    cards: [
      { ic: "coin", t: "Metrô e cartão Bip!", itens: ["Compre o cartão Bip! nas bilheterias e recarregue nas máquinas.", "Vale para metrô e ônibus. A passagem fica perto de CLP 800 a 900.", "Fuja do horário de pico: 7h a 9h e 18h a 20h."] },
      { t: "Aplicativos", itens: ["Uber, Cabify e Didi funcionam bem e costumam sair mais barato que o táxi.", "No aeroporto, o ponto de encontro dos apps fica indicado na saída."] },
      { t: "Ônibus para o litoral", itens: ["Turbus sai do Terminal Alameda (metrô Universidad de Santiago).", "Pullman sai também do Terminal Pajaritos (metrô Pajaritos).", "Saídas a cada 15 a 30 min. Compre a volta assim que chegar."] },
      { t: "Para a neve e El Yeso", itens: ["Vá de van de tour: a estrada é de montanha e pode exigir corrente no pneu.", "Alugar carro para subir só para quem já dirigiu na neve."] }
    ],
    aviso: ["A estrada da neve", "A subida para Farellones tem 40 curvas fechadas. Em dias de neve, os Carabineros exigem corrente no pneu e controlam o sentido: sobe de manhã, desce à tarde. Quem enjoa deve tomar remédio antes e sentar na frente."]
  },

  horarios: {
    linhas: [
      ["Teleférico do San Cristóbal", "Ter a dom, das 10h ao fim da tarde", "Segunda (manutenção)", "Pago", "Não"],
      ["Funicular do San Cristóbal", "Todos os dias, segunda só à tarde", "Nenhum dia", "Pago", "Não"],
      ["Sky Costanera", "Todos os dias, das 10h às 22h", "Nenhum dia", "Pago", "Melhor comprar online"],
      ["Mercado Central", "Todos os dias, almoço até o meio da tarde", "Nenhum dia", "Grátis", "Não"],
      ["Palácio La Moneda (por dentro)", "Visitas guiadas em dias de semana", "Fim de semana", "Grátis", "Sim, no site"],
      ["Museo de Bellas Artes", "Ter a dom, das 10h às 18h45", "Segunda", "Grátis", "Não"],
      ["La Chascona (Neruda, Santiago)", "Ter a dom, das 10h às 18h", "Segunda", "Pago", "Melhor reservar"],
      ["La Sebastiana (Neruda, Valparaíso)", "Ter a dom, das 10h às 18h", "Segunda", "Pago", "Melhor reservar"],
      ["Museo Fonck (Viña del Mar)", "Seg a sáb, dom só de manhã", "Nenhum dia", "Pago", "Não"],
      ["Concha y Toro (Pirque)", "Todos os dias, visitas com hora marcada", "Feriados maiores", "Pago", "Sim, no site"],
      ["Farellones e centros de esqui", "Todos os dias na temporada, das 8h30 às 16h30", "Fora da temporada", "Pago", "Tour sim"],
      ["Embalse El Yeso", "Depende da estrada e da neve", "Com neve forte", "Grátis", "Tour sim"],
      ["Cerro Santa Lucía", "Todos os dias, das 9h às 19h", "Nenhum dia", "Grátis com registro", "Não"],
      ["Pueblito Los Dominicos", "Ter a dom, das 10h30 às 19h", "Segunda", "Grátis", "Não"]
    ],
    aviso: ["Confira na semana da viagem", "Na segunda, vários museus e as casas de Neruda fecham. Nos dias 18 e 19 de setembro (Fiestas Patrias), muito comércio fecha e as estradas lotam."]
  },

  historia: {
    kick: "500 anos em uma página",
    titulo: "Linha do tempo do Chile",
    linhas: [
      ["Antes de 1500", "Povos como os mapuches vivem no vale. O norte do Chile chega a fazer parte do Império Inca."],
      ["1541", "Pedro de Valdivia funda Santiago aos pés do Cerro Santa Lucía."],
      ["1810", "Em 18 de setembro, a primeira Junta de Governo. A data virou a festa nacional."],
      ["1818", "Independência do Chile, garantida na Batalha de Maipú."],
      ["1879 a 1884", "Guerra do Pacífico: o Chile ganha o norte do deserto, rico em minérios."],
      ["1883", "Começa a funcionar o primeiro ascensor de Valparaíso, o Concepción."],
      ["1906", "Um terremoto destrói boa parte de Valparaíso."],
      ["1914", "O Canal do Panamá abre e Valparaíso perde o movimento de navios."],
      ["1945", "Gabriela Mistral ganha o Nobel de Literatura, a primeira da América Latina."],
      ["1971", "Pablo Neruda ganha o Nobel de Literatura."],
      ["1973", "Golpe militar: La Moneda é bombardeada e Pinochet governa até 1990."],
      ["1988", "Abre Valle Nevado, o maior centro de esqui do país."],
      ["1990", "Volta a democracia."],
      ["2003", "Valparaíso entra na lista de Patrimônio Mundial da UNESCO."],
      ["2010", "Terremoto de magnitude 8,8 no centro-sul do país."]
    ]
  },

  dias: [
    { img: "santiago", d: "Chegada · metrô e teleférico", t: "Santiago e o teleférico do San Cristóbal", gasto: "R$ 220", seg: 4, bairro: "Centro e Providencia",
      destaque: ["Por que começar por aqui", "Do alto do San Cristóbal você vê a cidade inteira e a cordilheira nevada que vai visitar amanhã."],
      stops: [
        ["10:00", "Aeroporto → hotel", "Van, ônibus até o metrô ou aplicativo. Troque pouco dinheiro no aeroporto.", ["Van ou app", "cerca de 40 min"]],
        ["13:00", "Plaza de Armas e Catedral", "O marco zero da cidade. Almoce no Mercado Central, a 3 quadras.", ["Metrô", "grátis"], "Plaza de Armas, Santiago, Chile"],
        ["15:30", "Teleférico do Cerro San Cristóbal", "Sai da estação Oasis, em Providencia. No dia limpo, a cordilheira nevada aparece inteira.", ["Teleférico", "cerca de R$ 30"], "Teleférico Estación Oasis, Santiago"],
        ["18:00", "Pôr do sol e Bellavista", "Desça de funicular até Bellavista, bairro de bares, perto de La Chascona, a casa de Neruda.", ["Funicular", "a pé"], "Barrio Bellavista, Santiago"]],
      comer: [["Mercado Central: caldillo de congrio ou mariscos", "R$ 70 a R$ 120 por pessoa"], ["Jantar em Bellavista ou no Patio Bellavista", "R$ 60 a R$ 110 por pessoa"]],
      chuva: "Troque o teleférico pelo Centro Cultural La Moneda. Depois da chuva o céu limpa e a vista da neve fica melhor.",
      tip: ["Para economizar", "Compre o cartão Bip! na primeira estação de metrô. Ele vale para metrô e ônibus a semana toda."],
      semana: { dias: [0, 2, 3, 4, 5, 6], senao: ["Hoje é segunda", "O teleférico costuma fechar na segunda. Suba de funicular, pela rua Pío Nono."] } },

    { img: "neve", d: "Van saindo do hotel", t: "Dia na neve em Farellones", gasto: "R$ 450", seg: 4, bairro: "Farellones (2.300 m)",
      destaque: ["Para a primeira neve", "Por baixo da roupa alugada: segunda pele, blusa de lã e meia grossa. É isso que esquenta."],
      stops: [
        ["07:00", "Saída de van do hotel", "Reserve o tour na véspera. A van leva corrente para o pneu, se a estrada pedir.", ["Van", "cerca de 1h30"]],
        ["07:30", "Aluguel de roupa no caminho", "A van para numa loja em Las Condes: jaqueta, calça, luvas e bota. Prove tudo.", ["Aluguel", "CLP 15.000 a 25.000"]],
        ["09:30", "Farellones: neve, trenó e foto", "Desça de boia, ande de trenó e faça boneco de neve. Não precisa saber esquiar.", ["A pé", "ingresso à parte"], "Farellones, Lo Barnechea, Chile"],
        ["15:00", "Descida para Santiago", "Em dias de controle, a estrada só desce à tarde. Hotel por volta das 17h30.", ["Van", "cerca de 1h30"]]],
      comer: [["Lanche no restaurante do centro de esqui", "R$ 60 a R$ 110 por pessoa"], ["Leve sanduíche, chocolate e água: lá em cima tudo custa mais", "R$ 25 por pessoa"]],
      chuva: "Chuva em Santiago costuma ser neve na montanha. Se a estrada fechar, a empresa remarca: deixe o dia 3 para trocar.",
      tip: ["Atenção", "Óculos escuros, protetor solar e labial: o sol na neve queima mesmo no frio. Veja a página @@PG:neve@@."] },

    { img: "yeso", d: "Passeio de van, dia inteiro", t: "Cajón del Maipo e Embalse El Yeso", gasto: "R$ 300", seg: 4, bairro: "Cajón del Maipo",
      destaque: ["No inverno", "Com neve forte, a estrada até El Yeso fecha. O tour fica no vale, com paradas na neve mais abaixo."],
      stops: [
        ["07:30", "Saída de van do hotel", "Tour em grupo é o jeito mais simples. A estrada sobe o vale do Maipo até 2.500 m.", ["Van", "cerca de 2h30"]],
        ["09:30", "San José de Maipo", "Vila do vale, com igreja antiga e parada para café e banheiro.", ["Van", "grátis"], "San José de Maipo, Chile"],
        ["12:00", "Embalse El Yeso", "A represa de água turquesa entre montanhas nevadas. Muitos tours servem piquenique com vinho.", ["Van", "incluído no tour"], "Embalse El Yeso, Chile"],
        ["17:30", "Volta a Santiago", "Chegada no fim da tarde. Jante perto do hotel e descanse.", ["Van"]]],
      comer: [["Empanadas em San José de Maipo", "R$ 15 a R$ 30 por pessoa"], ["Piquenique do tour no El Yeso", "incluído na maioria dos tours"]],
      chuva: "Com previsão de neve forte, troque pelo dia 6 (vinícola). A empresa costuma remarcar sem custo.",
      tip: ["Sem tour", "Metrô até Las Mercedes (linha 4) e ônibus 72 até San José de Maipo. El Yeso, só de tour ou 4x4."] },

    { img: "valpo", d: "Bate-volta de ônibus", t: "Valparaíso, cerros e elevadores", gasto: "R$ 200", seg: 3, bairro: "Cerro Alegre",
      destaque: ["Para entender a cidade", "Foi o maior porto do Pacífico até 1914. As casas coloridas e os elevadores são dessa época."],
      stops: [
        ["08:00", "Ônibus para Valparaíso", "Turbus no Terminal Alameda ou Pullman no Terminal Pajaritos. Saídas a cada 15 a 30 min.", ["Ônibus", "1h30 a 2h"], "Terminal Alameda, Santiago, Chile"],
        ["10:30", "Plaza Sotomayor e Muelle Prat", "O centro do porto. No cais, passeio de barco pela baía.", ["A pé", "barco CLP 5.000"], "Plaza Sotomayor, Valparaíso"],
        ["11:30", "Elevadores e Cerro Alegre", "Suba de ascensor (Reina Victoria ou El Peral) e caminhe pelas casas coloridas e grafites.", ["Elevador", "cerca de CLP 300"], "Ascensor Reina Victoria, Valparaíso"],
        ["15:00", "La Sebastiana, casa de Neruda", "A casa do poeta no Cerro Florida, com vista da baía inteira. Fecha na segunda.", ["Táxi ou a pé", "ingresso pago"], "La Sebastiana, Valparaíso"]],
      comer: [["Peixe ou chorrillana num restaurante do Cerro Alegre", "R$ 60 a R$ 100 por pessoa"], ["Empanada de mariscos perto do porto", "R$ 15 a R$ 30 por pessoa"]],
      chuva: "Com chuva as ladeiras escorregam. Fique em La Sebastiana e no Museu Marítimo, e volte mais cedo.",
      tip: ["Para voltar", "Volte antes das 19h: os cerros esvaziam à noite. Compre a passagem da volta assim que chegar."],
      semana: { dias: [0, 2, 3, 4, 5, 6], senao: ["Hoje é segunda", "La Sebastiana fecha. Troque pelo Museo a Cielo Abierto, os murais do Cerro Bellavista, de graça."] } },

    { img: "vina", d: "Bate-volta de ônibus", t: "Viña del Mar e pôr do sol no Pacífico", gasto: "R$ 220", seg: 4, bairro: "Viña del Mar e Reñaca",
      destaque: ["Para voltar", "Há ônibus para Santiago até a noite, mas compre a passagem da volta assim que chegar ao terminal."],
      stops: [
        ["09:00", "Ônibus para Viña del Mar", "Os mesmos ônibus da Turbus e da Pullman param no terminal de Viña.", ["Ônibus", "1h30 a 2h"], "Terminal Rodoviario Viña del Mar"],
        ["11:00", "Relógio de Flores e Castillo Wulff", "O relógio feito de flores e o castelinho de pedra na beira do mar, a 10 min a pé.", ["A pé", "grátis"], "Reloj de Flores, Viña del Mar"],
        ["13:30", "Museo Fonck e almoço", "Museu de arqueologia com um moai verdadeiro da Ilha de Páscoa no jardim.", ["A pé", "ingresso pago"], "Museo Fonck, Viña del Mar"],
        ["17:00", "Pôr do sol em Reñaca ou Cochoa", "Praias ao norte, de ônibus local ou app. O mar é gelado no inverno, mas o pôr do sol vale.", ["Ônibus ou app", "cerca de 20 min"], "Playa Cochoa, Viña del Mar"]],
      comer: [["Completo ou sanduíche de churrasco no centro", "R$ 25 a R$ 40 por pessoa"], ["Peixe e mariscos em Reñaca", "R$ 80 a R$ 140 por pessoa"]],
      chuva: "Troque a praia pelo Museo Fonck e pelo cassino, que é coberto, e volte para Santiago mais cedo.",
      tip: ["Se quiser juntar", "Valparaíso e Viña cabem num dia só: o trem Metro Valparaíso liga as duas em cerca de 20 min. Aí este dia fica livre."] },

    { img: "vinho", d: "Metrô e táxi, sem carro", t: "Vinícola Concha y Toro, em Pirque", gasto: "R$ 280", seg: 5, bairro: "Pirque e centro",
      destaque: ["Sem dirigir", "Vinícola é o passeio ideal para quem não dirige: metrô até perto e táxi curto. Dá para beber sem preocupação."],
      stops: [
        ["10:00", "Metrô até Las Mercedes", "Linha 4 até a estação Las Mercedes, em Puente Alto. Dali, táxi ou app até a vinícola.", ["Metrô", "cerca de 1h"], "Estación Las Mercedes, Puente Alto"],
        ["11:00", "Concha y Toro: visita e degustação", "Vinhedo, a casa antiga e a adega do Casillero del Diablo. Reserve o horário no site.", ["Táxi ou app", "10 a 15 min"], "Viña Concha y Toro, Pirque"],
        ["15:30", "Cerro Santa Lucía", "Morro com escadarias e castelinho no meio do centro, onde Santiago foi fundada.", ["Metrô", "grátis"], "Cerro Santa Lucía, Santiago"],
        ["18:00", "Barrio Lastarria", "Ruas de pedra, cafés e livrarias ao lado do Santa Lucía. Bom para jantar.", ["A pé"], "Barrio Lastarria, Santiago"]],
      comer: [["Almoço no restaurante da vinícola ou em Pirque", "R$ 70 a R$ 120 por pessoa"], ["Jantar no Barrio Lastarria", "R$ 70 a R$ 120 por pessoa"]],
      chuva: "A visita acontece com chuva e a adega é subterrânea. Leve guarda-chuva para o trecho do vinhedo.",
      tip: ["Para economizar", "Compre vinho no supermercado (Jumbo, Líder, Unimarc): os mesmos rótulos saem mais barato que na loja da vinícola."] },

    { img: "santiago", d: "Último dia", t: "Compras e volta para casa", gasto: "R$ 230", seg: 4, bairro: "Providencia e Las Condes",
      destaque: ["Na bagagem", "Vinho vai na mala despachada, embrulhado em roupa. A cota de bebida na volta é de 12 litros por pessoa."],
      stops: [
        ["10:00", "Costanera Center e Sky Costanera", "O maior shopping da cidade. No alto da torre ao lado, o mirante mais alto da América do Sul.", ["Metrô", "mirante pago"], "Costanera Center, Santiago"],
        ["12:30", "Pueblito Los Dominicos", "Vila de artesanato com lápis-lazúli, cobre e lã. Fica no fim da linha 1 do metrô.", ["Metrô", "grátis"], "Pueblito Los Dominicos, Las Condes"],
        ["15:00", "Ida para o aeroporto", "Van compartilhada, app ou ônibus. Reserve a van na véspera e saia com folga.", ["Van ou app", "40 min a 1h"]],
        ["17:00", "Chegada no aeroporto (SCL)", "Voo internacional: chegue 3 horas antes. Na saída, a PDI confere o documento.", ["Aeroporto"], "Aeropuerto Internacional Arturo Merino Benítez"]],
      comer: [["Praça de alimentação do Costanera Center", "R$ 40 a R$ 70 por pessoa"], ["Lanche no aeroporto, mais caro", "R$ 60 a R$ 90 por pessoa"]],
      chuva: "Dia de chuva é dia de shopping. O Costanera Center fica a poucos minutos a pé do metrô Tobalaba.",
      tip: ["Não esqueça", "Gaste ou troque os últimos pesos antes do embarque. Na mala de mão, só líquidos de até 100 ml."] }
  ],

  guiasLugar: {
    grupo: "Lugares e passeios",
    rotulo: "Passeio",
    itens: [
      { img: "neve", t: "Farellones e Valle Nevado", dia: 2, tempo: "o dia inteiro", kickHist: "A montanha em poucas linhas",
        hist: "Farellones é a vila mais baixa e mais perto de Santiago, a cerca de 2.300 m. Os primeiros esquiadores subiram para lá nos anos 1930. Acima dela ficam três centros de esqui: El Colorado, La Parva e Valle Nevado, aberto em 1988 e o maior do Chile. Para quem quer só ver neve, Farellones é a escolha mais simples: tem parque de neve com trenó e boia, e é onde param quase todos os tours saindo de Santiago.",
        passos: [["Loja de aluguel", "prove a bota com a meia grossa que vai usar. Ela tem que ficar firme no calcanhar."], ["Mirante da estrada", "a van costuma parar nas curvas de cima para a primeira foto."], ["Parque de neve", "trenó, boia e área para brincar. O ingresso é à parte do tour."], ["Aula de esqui (opcional)", "1 a 2 horas para iniciantes, na escola de El Colorado ou Valle Nevado."], ["Chocolate quente", "nos cafés da vila, antes da descida."]],
        foto: "Vocês dois de roupa de neve com a cordilheira ao fundo, de manhã cedo.", saber: "O tempo muda rápido. Se a estrada fechar, a empresa remarca: tenha um dia livre." },
      { img: "santiago", t: "Cerro San Cristóbal", dia: 1, tempo: "2 a 3 horas",
        hist: "O San Cristóbal é o morro mais alto da cidade, dentro do Parque Metropolitano, um dos maiores parques urbanos da América do Sul. No topo fica a imagem da Virgem da Imaculada Conceição, de 1908, com 14 metros. O funicular sobe desde 1925, saindo de Bellavista, e o teleférico liga o morro a Providencia. No inverno, depois de um dia de chuva, a vista da cordilheira nevada é a mais bonita do ano.",
        passos: [["Estação Oasis", "suba de teleférico desde Providencia."], ["Topo e Virgem", "escadaria até a imagem, com vista da cidade inteira."], ["Mirante da cordilheira", "olhe para o leste: a neve que você vai visitar no dia 2."], ["Funicular", "desça até Bellavista, na rua Pío Nono."]],
        foto: "A cidade com a cordilheira nevada ao fundo, do terraço da Virgem.", saber: "Em dia de poluição alta a vista fica cinza. Prefira o dia seguinte a uma chuva." },
      { img: "yeso", t: "Cajón del Maipo e El Yeso", dia: 3, tempo: "o dia inteiro",
        hist: "O Cajón del Maipo é o vale do rio Maipo, que desce da cordilheira até Santiago. Ao longo dele há vilas pequenas, como San José de Maipo, e termas na parte alta. O Embalse El Yeso é uma represa construída para abastecer Santiago de água, a cerca de 2.500 m. A cor turquesa vem dos minerais da água de degelo. No inverno a represa fica cercada de neve, e às vezes a própria estrada fecha.",
        passos: [["San José de Maipo", "parada para café, banheiro e empanadas."], ["Estrada do vale", "repare no rio Maipo e nos paredões de pedra."], ["Embalse El Yeso", "caminhe até a beira da água para a foto."], ["Piquenique", "muitos tours servem vinho, queijo e frios ao lado da represa."]],
        foto: "A água turquesa com as montanhas brancas atrás, ao meio-dia.", saber: "Lá em cima não tem banheiro nem loja. Use o de San José de Maipo." },
      { img: "valpo", t: "Valparaíso", dia: 4, tempo: "o dia inteiro",
        hist: "Valparaíso foi o porto mais importante do Pacífico sul no século 19, parada obrigatória dos navios que davam a volta pelo sul do continente. Os comerciantes construíram casas coloridas nos cerros e, para subir as ladeiras, elevadores de trilho: chegaram a ser mais de 30. Com a abertura do Canal do Panamá, em 1914, o porto perdeu movimento. O centro histórico é Patrimônio Mundial da UNESCO desde 2003.",
        passos: [["Plaza Sotomayor", "o centro do porto e o prédio da Marinha."], ["Muelle Prat", "barco pela baía, com vista dos navios."], ["Ascensor", "suba para o Cerro Alegre ou o Concepción."], ["Paseo Gervasoni e Atkinson", "mirantes com a baía embaixo."], ["La Sebastiana", "a casa de Neruda, no Cerro Florida."]],
        foto: "As casas coloridas do Cerro Alegre, com o porto atrás.", saber: "Guarde o celular nas ladeiras e volte antes de escurecer." },
      { img: "vinho", t: "Vinícola Concha y Toro", dia: 6, tempo: "3 horas, com a ida",
        hist: "A Concha y Toro foi fundada em 1883 em Pirque, ao sul de Santiago, e hoje é a maior vinícola da América Latina. A visita passa pelo vinhedo, pelos jardins da casa antiga da família e pela adega do Casillero del Diablo. Diz a lenda que o fundador espalhou que o diabo morava ali para que ninguém roubasse os melhores vinhos. A uva símbolo do Chile é a carménère, que quase sumiu da Europa e sobreviveu aqui.",
        passos: [["Vinhedo", "as variedades plantadas lado a lado, com placa."], ["Casa e jardins", "a casa de verão da família, de 1875."], ["Casillero del Diablo", "a adega subterrânea com o show da lenda."], ["Degustação", "prove um carménère, a uva do Chile."], ["Loja", "compare o preço com o do supermercado."]],
        foto: "As fileiras do vinhedo com a cordilheira ao fundo.", saber: "Compre o ingresso no site com antecedência. Os horários lotam em julho." }
    ]
  },

  especiais: [
    { id: "neve", sumario: "Neve pela primeira vez", rotulo: "Neve", kick: "Para quem nunca viu neve", titulo: "Neve pela primeira vez",
      sub: "Não precisa saber esquiar. O dia na neve é para brincar, tirar foto e, se quiser, fazer uma aula.",
      tabela: { cab: ["Centro", "Distância de Santiago", "Bom para", "Ingresso do dia"], linhas: [
        ["Farellones", "cerca de 35 km, 1h30", "Primeira neve, trenó, boia e foto", "Parque de neve: CLP 15.000 a 30.000"],
        ["El Colorado", "logo acima de Farellones", "Aula de esqui para iniciantes", "Passe de esqui: CLP 50.000 a 70.000"],
        ["La Parva", "cerca de 45 km, 1h45", "Quem já esquia um pouco", "Passe de esqui: CLP 50.000 a 70.000"],
        ["Valle Nevado", "cerca de 60 km, 2h", "Paisagem mais bonita e mais neve", "Passe de esqui: CLP 70.000 a 90.000"]] },
      cards: [
        { ic: "spark", t: "Como subir", itens: ["Tour de van saindo do hotel: cerca de CLP 30.000 a 45.000 por pessoa, só o transporte.", "Muitos tours incluem o aluguel da roupa. Compare antes.", "Sai às 7h e volta por volta das 17h30."] },
        { t: "O que fazer sem esquiar", itens: ["Trenó e boia no parque de neve de Farellones.", "Boneco de neve, guerra de bolas e muita foto.", "Aula de 1 a 2 horas, se der vontade (CLP 50.000 a 80.000)."] },
        { ic: "coin", t: "Quanto custa, por pessoa", itens: ["Só brincar na neve: R$ 350 a 500 (van, roupa, parque e lanche).", "Com aula e equipamento de esqui: R$ 800 a 1.200.", "Estes valores estão na página @@PG:orcamento@@, dia 2."] },
        { t: "Para não passar mal", itens: ["Tome remédio para enjoo antes das curvas.", "Beba água: a altitude e o ar seco desidratam.", "Óculos escuros e protetor solar, sempre."] }
      ] },
    { id: "roupa", sumario: "Roupa de neve: alugar ou levar", rotulo: "Neve", kick: "O que alugar e o que levar", titulo: "Roupa de neve: alugar ou levar",
      sub: "Não compre roupa de neve no Brasil para usar um dia. Alugue lá e leve só o que vai por baixo.",
      cards: [
        { ic: "shirt", t: "Alugue lá", itens: ["Jaqueta e calça impermeáveis.", "Bota de neve (apreski).", "Luvas impermeáveis."] },
        { t: "Leve do Brasil", itens: ["Segunda pele: blusa e calça térmica.", "Meias grossas, de lã ou térmicas.", "Gorro, cachecol e óculos escuros."] },
        { ic: "coin", t: "Quanto custa", itens: ["Roupa e bota: cerca de CLP 15.000 a 25.000 por pessoa no dia (R$ 90 a 150).", "Com esqui ou snowboard: CLP 35.000 a 50.000.", "Leve cartão: algumas lojas pedem caução."] },
        { t: "Onde alugar", itens: ["Lojas em Las Condes, no caminho da montanha. A van para em uma delas.", "Também há aluguel em Farellones, mais caro e com fila.", "Reserve o tamanho na véspera, se puder."] },
        { t: "Na hora de provar", itens: ["Bota firme no calcanhar, com a meia que vai usar.", "Calça sobre a bota, para não entrar neve.", "Confira zíperes e se a luva é impermeável."] },
        { t: "Em Santiago", itens: ["Na cidade não neva. Basta casaco grosso, blusa de lã e tênis fechado.", "Bota de neve é só para a montanha: devolva na volta."] }
      ],
      avisos: [["O erro mais comum", "Ir de calça jeans por baixo. O jeans molha, gela e não seca. Use calça térmica ou de moletom fino e deixe o jeans para a cidade."]] },
    { id: "clima-neve", sumario: "Clima e neve mês a mês", rotulo: "Neve", kick: "Quando ir", titulo: "Clima e neve mês a mês",
      sub: "A temporada vai de meados de junho ao fim de setembro. Julho e agosto têm mais chance de neve.",
      tabela: { cab: ["Mês", "Santiago, mín. e máx.", "Chuva em Santiago", "Neve na montanha"], linhas: [
        ["Junho", "cerca de 3 °C e 15 °C", "Mês mais chuvoso", "Temporada abre no meio do mês; depende do ano"],
        ["Julho", "cerca de 3 °C e 15 °C", "Alguns dias de chuva", "Boa chance, mais cheio (férias)"],
        ["Agosto", "cerca de 4 °C e 17 °C", "Alguns dias de chuva", "A maior chance de neve boa"],
        ["Setembro", "cerca de 6 °C e 19 °C", "Pouca chuva", "Ainda tem neve, mais derretida no fim do mês"]] },
      cards: [
        { ic: "sun", t: "Como é o dia", itens: ["Manhã gelada, perto de 0 °C.", "Tarde de sol, com 15 °C ou mais.", "Na montanha, abaixo de zero o dia todo."] },
        { t: "Poluição no inverno", itens: ["Em dias sem vento, Santiago fica com névoa cinza.", "A vista da cordilheira é melhor depois de uma chuva."] },
        { t: "Para a melhor neve", itens: ["Vá depois de uma frente fria: chove na cidade e neva na montanha.", "Veja a previsão uns dias antes e marque o tour para o dia seguinte."] },
        { t: "Datas cheias", itens: ["Férias de julho no Brasil e no Chile lotam tudo.", "18 e 19 de setembro (Fiestas Patrias): estradas e passeios cheios."] }
      ] }
  ],

  orcamento: {
    colDinheiro: "Dinheiro vivo",
    dias: [
      ["CLP 15.000", "Ônibus até o metrô em vez de táxi"],
      ["CLP 20.000", "Tour que já inclui o aluguel da roupa"],
      ["CLP 15.000", "Tour com piquenique incluído"],
      ["CLP 20.000", "Almoço de menu do dia, longe do cais"],
      ["CLP 15.000", "Completo e empanada em vez de restaurante"],
      ["CLP 15.000", "Metrô e táxi curto em vez de tour"],
      ["CLP 10.000", "Vinho no supermercado, não na vinícola"]
    ],
    fora: "como o seguro, o traslado do aeroporto e o cartão Bip!",
    nota: "Dinheiro vivo por pessoa, para ônibus, feira, gorjeta e lojas pequenas. O resto dá para pagar no cartão."
  },

  comida: {
    titulo: "Comida típica",
    pratos: [
      ["Empanada de pino", "Pastel assado com carne, cebola, ovo e azeitona.", "CLP 2.500 a 4.000 · padarias e Mercado Central"],
      ["Cazuela", "Sopa de carne ou frango com batata, abóbora e milho. Perfeita no frio.", "CLP 7.000 a 10.000 · restaurantes do centro"],
      ["Caldillo de congrio", "Sopa de peixe que Neruda adorava.", "CLP 9.000 a 14.000 · Mercado Central"],
      ["Pastel de choclo", "Torta de milho com carne, frango e um pouco de açúcar por cima.", "CLP 8.000 a 12.000 · restaurantes chilenos"],
      ["Completo", "Cachorro-quente com abacate, tomate e maionese.", "CLP 2.500 a 4.000 · Dominó e lanchonetes"],
      ["Chorrillana", "Batata frita com carne, cebola e ovo, para dividir.", "CLP 10.000 a 16.000 · Valparaíso"],
      ["Machas a la parmesana", "Mariscos gratinados com queijo parmesão.", "CLP 9.000 a 13.000 · litoral e Mercado Central"],
      ["Sopaipillas pasadas", "Bolinho frito de abóbora em calda de rapadura. Doce de dia de chuva.", "CLP 1.500 a 3.000 · carrinhos de rua"],
      ["Pisco sour", "O drinque chileno: pisco, limão e açúcar.", "CLP 4.000 a 7.000 · bares e restaurantes"],
      ["Vinho carménère", "A uva tinta símbolo do Chile, macia e encorpada.", "CLP 4.000 a 10.000 a garrafa · supermercado"]
    ],
    cards: [
      { t: "Horários", itens: ["Almoço das 13h às 15h. Muitos restaurantes têm menu do dia, mais barato.", "Jantar a partir das 20h. No fim da tarde, os chilenos fazem a \"once\", um lanche."] },
      { t: "Na conta", itens: ["A gorjeta de 10% é sugerida: \"¿Desea agregar la propina?\".", "Pode dizer que sim ou pedir para tirar. Em dinheiro ou no cartão."] }
    ]
  },

  golpes: {
    itens: [
      ["Câmbio na rua", "Na rua Agustinas, gente oferece \"cambio, cambio\" na calçada. Troque só dentro das casas de câmbio, contando o dinheiro no balcão."],
      ["Mancha na roupa", "Alguém joga mostarda ou outro líquido na sua roupa e outra pessoa \"ajuda\" a limpar enquanto leva a carteira. Afaste-se e não deixe ninguém tocar."],
      ["Celular na mesa", "Em cafés e na Plaza de Armas, celular na mesa some rápido. Guarde no bolso da frente, inclusive no metrô."],
      ["Táxi do aeroporto", "Na saída, há quem ofereça táxi sem ser oficial. Use os balcões dentro do terminal, a van compartilhada ou o app."],
      ["Tour de neve barato demais", "Desconfie de preço muito abaixo dos outros. Confira se a van leva corrente e se a roupa está incluída."],
      ["Pagar em reais", "Na maquininha, escolha sempre pagar em pesos chilenos. Em reais, a conversão sai mais cara."]
    ],
    perda: [
      "Faça a constância (boletim) nos Carabineros (133) e guarde o comprovante.",
      "Procure o plantão consular da Embaixada do Brasil (página de emergência).",
      "Peça a Autorização de Retorno ao Brasil (ARB). Leve cópia do RG ou do passaporte e uma foto 3x4 na mala."
    ],
    aviso: ["À noite", "O centro e Bellavista ficam vazios em algumas ruas depois que o comércio fecha. Use app para voltar ao hotel e evite manifestações perto da Plaza Baquedano (Plaza Italia)."]
  },

  fotos: {
    itens: [
      ["A primeira neve, vocês dois de roupa de neve", "Manhã", 2],
      ["A cidade e a cordilheira nevada do San Cristóbal", "Fim da tarde", 1],
      ["O boneco de neve ou a descida de trenó", "Meio do dia", 2],
      ["A água turquesa do Embalse El Yeso", "Meio do dia", 3],
      ["As casas coloridas do Cerro Alegre", "Manhã", 4],
      ["A baía do alto de um ascensor", "Fim da manhã", 4],
      ["O Relógio de Flores de Viña del Mar", "Fim da manhã", 5],
      ["O pôr do sol no Pacífico", "Fim da tarde", 5],
      ["A adega do Casillero del Diablo", "Na visita", 6],
      ["Santiago do alto do Sky Costanera", "Manhã, com céu limpo", 7]
    ],
    aviso: ["Na neve", "O frio descarrega a bateria do celular rápido. Leve o carregador portátil no bolso de dentro da jaqueta, perto do corpo."]
  },

  extras: [
    { kick: "Para quem se apaixonou pela neve", titulo: "Um dia em Valle Nevado",
      cards: [{ t: "Valle Nevado com aula de esqui", o: "O maior centro de esqui do Chile, mais alto e com mais neve que Farellones. Bom para um segundo dia na neve.", preco: "R$ 900 a 1.500", min: 900, max: 1500,
        itens: ["Tour de van saindo do hotel, cerca de 2h de estrada.", "Aula de esqui ou snowboard para iniciantes, com equipamento.", "Almoço num dos restaurantes com vista da cordilheira."],
        dica: "Fica mais caro que Farellones, mas a paisagem é outra. Reserve a aula com antecedência em julho." }],
      aviso: ["Quando encaixar", "Troque pelo dia 5 (Viña del Mar), juntando Valparaíso e Viña no dia 4. Deixe um dia entre as duas idas à neve, para descansar das curvas."] },
    { kick: "Mais duas ideias", titulo: "Isla Negra e vale de Casablanca",
      cards: [
        { t: "Isla Negra", o: "A casa de Neruda mais querida, na beira do mar, cheia de objetos de navio.", preco: "R$ 250 a 450", min: 250, max: 450,
          itens: ["Ônibus Pullman desde o Terminal Alameda, cerca de 1h30.", "Visita guiada à casa, fecha na segunda.", "Almoço de peixe em El Quisco."], dica: "Bom para um dia mais calmo, de frente para o Pacífico." },
        { t: "Vale de Casablanca", o: "Vinícolas de vinho branco no caminho do litoral, entre Santiago e Valparaíso.", preco: "R$ 300 a 600", min: 300, max: 600,
          itens: ["Tour de van, ou junto com o passeio de Valparaíso.", "Degustação de sauvignon blanc.", "Almoço em restaurante de vinícola."], dica: "Cabe no caminho do dia 4, se for de tour." }
      ] }
  ],

  guias: {
    linhas: [
      ["Dia na neve", "Van saindo do hotel, com ou sem roupa", "Ski Total · KL Adventure · agências no GetYourGuide e no Viator", "$$", "2"],
      ["Cajón del Maipo e El Yeso", "Van, guia e piquenique", "Turistik · agências no GetYourGuide e no Viator", "$$", "3"],
      ["Valparaíso e Viña del Mar", "Tour de ônibus ou caminhada a pé", "Turistik · Tours 4 Tips (a pé, em Valparaíso)", "$", "4 e 5"],
      ["Vinícola", "Visita e degustação no local", "Concha y Toro e Santa Rita vendem no próprio site", "$", "6"],
      ["Santiago a pé", "Caminhada em grupo, com gorjeta no final", "Tours 4 Tips · Free Tour Santiago", "$", "1"]
    ],
    escolher: "Prefira empresas com avaliações dos últimos 6 meses, que digam o que está incluído (roupa, corrente, almoço) e que remarquem sem custo se a estrada da neve fechar."
  },

  emergencia: {
    numeros: [["131", "Ambulância (SAMU)"], ["132", "Bombeiros"], ["133", "Carabineros (polícia)"], ["134", "PDI (polícia de investigações)"]],
    consulado: { t: "Embaixada do Brasil em Santiago", p: [
      "Em caso de perda do documento ou emergência grave, procure o plantão consular da Embaixada do Brasil em Santiago. O telefone de plantão e o endereço estão no site gov.br/mre, na página da embaixada. Anote antes de viajar.",
      "Se não conseguir falar com a embaixada, ligue para o plantão do Itamaraty em Brasília: <b style='white-space:nowrap'>+55 61 98260-0610</b>."] },
    frases: [
      ["Olá / tchau", "Hola / chao", "espanhol"], ["Bom dia", "Buenos días", "espanhol"], ["Obrigado", "Gracias", "espanhol"],
      ["Por favor", "Por favor", "espanhol"], ["Com licença", "Permiso", "espanhol"], ["Quanto custa?", "¿Cuánto cuesta?", "espanhol"],
      ["Onde fica…?", "¿Dónde queda…?", "espanhol"], ["Banheiro", "Baño", "espanhol"], ["A conta, por favor", "La cuenta, por favor", "espanhol"],
      ["Sem gorjeta, por favor", "Sin propina, por favor", "espanhol"], ["Quero alugar roupa de neve", "Quiero arrendar ropa de nieve", "espanhol"],
      ["Que número de bota?", "¿Qué número de bota?", "espanhol"], ["Socorro!", "¡Ayuda!", "espanhol"], ["Hospital", "Hospital / clínica", "espanhol"],
      ["Sou alérgico a…", "Soy alérgico a…", "espanhol"],
      ["Agora mesmo, já", "Al tiro", "chileno"], ["Entendeu?", "¿Cachai?", "chileno"], ["Mil pesos", "Una luca", "chileno"],
      ["Legal, bacana", "Bacán", "chileno"], ["Cara, amigo", "Weón (só entre amigos)", "chileno"]
    ]
  },

  cartao: {
    kick: "Mostre ao motorista",
    sub: "Escreva o endereço do hotel no espaço e mostre esta página ao motorista ou a quem for pedir informação.",
    pedido: "Por favor, lléveme a:",
    coluna: "Em espanhol",
    lugares: [
      ["Aeroporto", "Aeropuerto Internacional Arturo Merino Benítez (SCL)"],
      ["Terminal de ônibus", "Terminal de Buses Alameda (metro Universidad de Santiago)"],
      ["Teleférico", "Teleférico, Estación Oasis (Pedro de Valdivia Norte)"],
      ["Mercado Central", "Mercado Central de Santiago"],
      ["Costanera Center", "Costanera Center, Avenida Andrés Bello"],
      ["Vinícola", "Viña Concha y Toro, Pirque"]
    ]
  },

  creditos: "Pueblo de Farellones nevado; Santiago en invierno desde el Cerro San Cristóbal; Colorful Valparaiso houses (CC BY-SA 4.0); Playa Cochoa, Viña del Mar (CC BY 4.0); Vineyard, Concha y Toro, Chile (CC BY-SA 3.0); Embalse el Yeso (CC0)."
};
