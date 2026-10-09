// Roteiro Detalhado + Pré-viagem de Orlando (família com filhos, 7 dias, de carro).
// Formato de cada campo em server/pdf/destinos/LEIA-ME.md. Conteúdo escrito de memória.
//
// CONFERIR antes de vender (o QA já conferiu, em 09/10/2026: alturas mínimas, cadeirinha até 5 anos, cota da Receita
// e free shop, *347, 911, Poison Control, I-Ride Trolley, horário e preço da NASA, estacionamento grátis dos parques
// aquáticos da Disney, endereço do consulado em Orlando, plantão do Itamaraty, feira do Lake Eola das 10h às 15h):
// - Plantão do Consulado-Geral em Orlando +1 321 387-9716 (o gov.br chama de plantão 24 h numa página e de "só
//   WhatsApp" em outra) e WhatsApp +1 407 675-0604.
// - Visto: taxa MRV (cerca de US$ 185), taxa extra de US$ 250 (aprovada em 2025, ver se já é cobrada), espera da
//   entrevista (6 a 12 meses em São Paulo e no Rio, fonte não oficial), dispensa só para renovação até 12 meses.
// - IOF de 3,5% em cartão, conta global e compra de dólar em espécie.
// - Imposto: 6,5% em Orlando e 7,5% em Kissimmee; taxa de hotel de cerca de 12,5% e 13,5%.
// - Preços de ingresso nos gastos dos dias (cotação de R$ 5,40): Universal 2 parques 2 dias, Magic Kingdom (QA: cerca
//   de R$ 4.520 para 2 adultos e 2 crianças em julho), NASA (QA: R$ 2.100 a 2.300 para 4), Epic Universe, Volcano Bay
//   (US$ 89 a 139), Typhoon Lagoon, Gatorland, LEGOLAND, Orlando Eye; Lightning Lane e Universal Express.
// - Estacionamento: Disney US$ 35, Universal cerca de US$ 32; Lori Wilson Park grátis; Jetty Park pago.
// - The Orlando Eye: se está aberta (fechada para manutenção em 06/2026, segundo uma revenda).
// - Comida: regra de levar lanche (Disney permite; Universal só lanches pequenos), preços dos pratos, copo de refil.
// - Horários dos parques, outlets e Walmart; feriados americanos do ano da viagem.
// - Franquia de bagagem para os EUA.
// - Empresas da página de guias: Undercover Tourist, Boggy Creek Airboat Adventures, Wild Florida, Kingdom
//   Strollers, BabyQuip.
// - Foto parque2.jpg: sem crédito conhecido, deixou de ser usada.

export default {
  nome: "Orlando",
  moeda: "dólar",
  rotuloExtra: "Parques (3 dias) e carro",
  capa: { img: "capa", frase: "Parques na ordem certa, NASA, praia e compras, com tudo o que fazer antes de ir.", ritmo: "Em família, de carro" },
  referencia: { total: "R$ 5.820", inclui: "3 parques, NASA, comida e gasolina", porDia: "cerca de R$ 830" },
  fichaDoc: ["Visto americano", "Número e validade de cada pessoa"],
  fichaExtra: [["Aluguel de carro", "Locadora, número da reserva e local de retirada"], ["Ingressos dos parques", "Números de confirmação e datas"]],

  mapa: {
    sumario: "Mapa de Orlando",
    titulo: "Orlando e a Costa Espacial",
    sub: "Tudo é de carro. Os números mostram em que dia você vai a cada lugar.",
    agua: [
      { d: "M700 0 C690 180 690 340 705 520", w: 46, l: "Oceano Atlântico", lx: 560, ly: 505 },
      { d: "M618 20 C606 180 610 340 622 500", w: 14 }
    ],
    areas: [
      { x: 28, y: 300, w: 210, h: 160, l: "DISNEY" },
      { x: 240, y: 160, w: 170, h: 140, l: "UNIVERSAL E I-DRIVE" },
      { x: 300, y: 30, w: 170, h: 95, l: "CENTRO (DOWNTOWN)" },
      { x: 430, y: 330, w: 140, h: 90, l: "AEROPORTO MCO" }
    ],
    rotas: [
      { d: "M40 495 L190 345 L300 240 L380 70", l: "I-4", lx: 215, ly: 300 },
      { d: "M345 285 L480 300 L640 300", l: "Beachline (528), com pedágio", lx: 530, ly: 322 }
    ],
    pinos: [
      { x: 335, y: 280, dia: 1, l: "I-Drive e Orlando Eye" },
      { x: 275, y: 215, dia: 2, l: "" },
      { x: 305, y: 215, dia: 3, l: "Universal" },
      { x: 645, y: 190, dia: 4, l: "Kennedy Space Center", anc: "end" },
      { x: 660, y: 350, dia: 5, l: "Cocoa Beach", anc: "end" },
      { x: 400, y: 92, dia: 6, l: "Lake Eola" },
      { x: 275, y: 252, dia: 6, l: "Outlets" },
      { x: 100, y: 345, dia: 7, l: "Magic Kingdom" }
    ],
    notas: [[455, 395, "✈ Saída e volta (dia 7)"], [112, 440, "Disney Springs e Lake Buena Vista"]],
    cards: [
      { t: "Como se orientar", itens: ["A I-4 corta a cidade na diagonal e liga Disney, Universal e o centro.", "A Beachline (528) leva do aeroporto à NASA e à praia, com pedágio.", "Baixe o mapa offline no celular antes de sair do hotel."] },
      { t: "Distâncias de carro", itens: ["I-Drive à Universal: 10 min", "I-Drive ao Magic Kingdom: 30 a 40 min", "I-Drive à NASA ou à praia: cerca de 1h"] }
    ]
  },

  quando: [
    ["6", "meses antes", [
      ["Passaporte e DS-160 de cada pessoa, inclusive bebê", "Confira a validade dos passaportes e preencha o formulário do visto em ceac.state.gov. Guarde o número de confirmação."],
      ["Pague a taxa e agende CASV e entrevista", "Taxa de cerca de US$ 185 por pessoa, agendada em ais.usvisa-info.com. Em São Paulo e no Rio, a espera chega a 6 a 12 meses."],
      ["Vá à entrevista com os filhos", "Leve passaportes, DS-160 e certidão das crianças. Uma taxa extra de US$ 250 foi aprovada em 2025: confira em travel.state.gov."]]],
    ["90", "dias antes", [
      ["Compre as passagens", "Simule no vaidarviagem.com.br para achar as datas que cabem no bolso. Julho, dezembro e janeiro são os meses mais caros."],
      ["Reserve hotel fora dos parques e o carro", "I-Drive ou Lake Buena Vista, com quarto para 4. Peça a cadeirinha na reserva do carro ou planeje comprar lá."],
      ["Escolha os parques pela idade e pela verba", "Use a tabela da página @@PG:parques-idade@@ e compre os ingressos com data, no site oficial ou em revenda autorizada."]]],
    ["30", "dias antes", [
      ["Contrate o seguro viagem", "Nos EUA, médico é muito caro. Escolha cobertura médica de pelo menos US$ 100 mil por pessoa."],
      ["Monte o plano do dólar", "Cartão de crédito e conta global para o dia a dia, e um pouco de dinheiro vivo para gorjetas e emergência."],
      ["Autorização de viagem de menor", "Se a criança viajar com só um dos pais, faça a autorização com firma reconhecida ou registrada no passaporte."]]],
    ["7", "dias antes", [
      ["Baixe os aplicativos", "My Disney Experience, Universal Orlando e o da locadora. Ative o chip ou eSIM de dados."],
      ["Imprima os documentos", "Passaportes com visto, seguro, reservas, ingressos e autorização de menor. Confira a mala na página @@PG:mala@@."],
      ["Meça a altura das crianças", "Anote e compare com a altura mínima dos brinquedos. Evita choro na porta da fila."]]]
  ],

  regras: {
    titulo: "Visto, dólar e clima",
    cards: [
      { ic: "i-doc", t: "Visto e entrada", itens: ["Cada pessoa, inclusive bebê, precisa de passaporte e visto americano válidos.", "Desde 09/2025, só quem renova visto vencido há menos de 12 meses fica sem entrevista.", "Na imigração, diga o hotel e a data da volta. O visto vale até 10 anos."] },
      { ic: "coin", t: "Dólar e impostos", itens: ["A etiqueta vem sem imposto: some 6,5% em Orlando e 7,5% em Kissimmee.", "Gorjeta em restaurante com garçom: 15% a 20%. No balcão, é opcional.", "Cartão, conta global e dólar em espécie pagam IOF de 3,5%. Pague em dólar."] },
      { ic: "spark", t: "Parques com crianças", itens: ["Muitos brinquedos pedem altura mínima, de 97 a 137 cm.", "Combine um ponto de encontro e fotografe a roupa de cada filho de manhã.", "Leve carrinho para quem tem até 5 anos: anda-se 10 a 15 km por dia."] }
    ],
    avisos: [["Furacões e tempestades", "A temporada de furacões vai de junho a novembro, com mais risco de agosto a outubro. Escolha um seguro que cubra atraso e cancelamento por clima. No verão chove forte quase todo fim de tarde, por pouco tempo, e os brinquedos ao ar livre param quando há raios."]],
    seguranca: "As áreas turísticas são tranquilas. Não deixe nada à vista no carro e evite andar a pé à noite fora da I-Drive. Antes de viajar, veja os avisos do Itamaraty."
  },

  clima: {
    geral: ["Verão (junho a setembro): quente e úmido, de 24 °C a 33 °C, com chuva rápida no fim da tarde.", "Inverno (dezembro a fevereiro): ameno, de 10 °C a 23 °C, com dias frios quando passa uma frente fria."],
    sempre: "Leve capa de chuva de plástico: guarda-chuva atrapalha nas filas.",
    gelado: "Pode gear de madrugada: leve casaco quente, gorro e calça comprida para todos.",
    frio: "Manhãs e noites frias: leve casaco e calça para as crianças.",
    calor: "Calor forte: protetor solar, boné e água a cada fila.",
    chuva: { meses: [6, 7, 8, 9], texto: "Pancadas de chuva quase todo fim de tarde. Encaixe a pausa no hotel nesse horário." }
  },

  mala: [
    ["Documentos", ["Passaporte com visto de cada um", "Autorização de menor, se precisar", "Seguro, reservas e ingressos", "CNH e Permissão Internacional", "Cartões e um pouco de dólar"]],
    ["Crianças", ["Garrafinha com o nome", "Remédio de febre e enjoo", "Roupa extra na mochila do parque", "Pulseira com o seu telefone", "Fone e carregador do tablet"]],
    ["Outros", ["Adaptador de tomada americana", "Protetor solar e boné", "Roupa de banho e chinelo", "Bateria portátil", "Mala dobrável para as compras"]]
  ],

  ficar: {
    titulo: "Hotel fora dos parques, em três regiões",
    bairros: [
      { n: "International Drive e Universal", quem: "Combina com: quem quer tudo perto e jantar fora à noite.",
        pro: ["10 a 15 minutos da Universal", "Restaurantes, mercados e outlets na mesma avenida", "Saída fácil para a NASA e a praia"],
        contra: ["Trânsito pesado no fim da tarde", "Muitos hotéis cobram estacionamento"] },
      { n: "Lake Buena Vista, perto de Disney Springs", quem: "Combina com: quem vai fazer mais dias de Disney.",
        pro: ["5 a 15 minutos dos parques da Disney", "Muitos hotéis com quarto para 4 e cozinha", "Disney Springs grátis para passear à noite"],
        contra: ["Mais longe do centro e da Universal", "Diárias sobem nas férias escolares"] },
      { n: "Kissimmee, casas de temporada", quem: "Combina com: famílias grandes e quem quer cozinhar.",
        pro: ["Casa com piscina pelo preço de um quarto", "Cozinha e lavanderia economizam muito", "Perto da Disney"],
        contra: ["Precisa de carro para tudo", "Taxa de limpeza e depósito à parte"] }
    ],
    estilos: [["Econômico", "R$ 500 a 800", "diária do quarto para 4"], ["Confortável", "R$ 900 a 1.500", "diária do quarto para 4"], ["Casa com piscina", "R$ 1.000 a 2.000", "diária da casa inteira"]],
    nota: "Valores de referência. Some a taxa de hotel (cerca de 12,5%, ou 13,5% em Kissimmee), a taxa de resort, quando houver, e o estacionamento. Em julho, dezembro e janeiro as diárias sobem."
  },

  locomover: {
    titulo: "Do aeroporto ao hotel, e pela região",
    cab: ["Do aeroporto MCO", "Tempo até a I-Drive", "Preço", "Para família de 4"],
    linhas: [
      ["Carro alugado", "20 a 30 min", "US$ 40 a 90 por dia, mais seguro", "A melhor opção para o roteiro"],
      ["Uber ou Lyft (categoria XL)", "20 a 30 min", "US$ 40 a 70", "Bom, mas sem cadeirinha"],
      ["Táxi", "20 a 30 min", "US$ 50 a 80", "Mais caro que o aplicativo"],
      ["Shuttle compartilhado", "40 a 90 min, com paradas", "cerca de US$ 20 a 30 por pessoa", "Demora, mas leva as malas"]
    ],
    cards: [
      { ic: "spark", t: "Carro alugado", itens: ["Retire no próprio aeroporto, nos balcões das locadoras.", "Pedágio, seguro e cadeirinha estão na página @@PG:carro@@."] },
      { t: "Uber e Lyft", itens: ["Para 4 pessoas com malas, peça a categoria XL.", "O motorista não leva cadeirinha: leve a sua."] },
      { t: "Transporte dos parques", itens: ["Disney: monotrilho, barco e o teleférico Skyliner ligam parques e hotéis.", "Universal: a pé ou de barco entre hotéis, CityWalk e parques."] },
      { t: "I-Ride Trolley", itens: ["Bonde que percorre a International Drive.", "Bom para jantar sem precisar estacionar."] }
    ],
    aviso: ["Horário de pico", "Entre 16h e 19h a I-4 trava. Saia dos parques antes das 15h para a pausa ou depois do jantar."]
  },

  horarios: {
    linhas: [
      ["Magic Kingdom", "Todos os dias, das 8h ou 9h até a noite", "Não fecha", "Ingresso com data", "Sim"],
      ["EPCOT e Hollywood Studios", "Todos os dias, das 9h até a noite", "Não fecha", "Ingresso com data", "Sim"],
      ["Animal Kingdom", "Todos os dias, das 8h ao fim da tarde", "Não fecha", "Ingresso com data", "Sim"],
      ["Universal Studios e Islands", "Todos os dias, das 9h às 21h ou 22h", "Não fecha", "Ingresso com data", "Sim"],
      ["Epic Universe", "Todos os dias, das 9h às 21h", "Não fecha", "Ingresso com data", "Sim"],
      ["Volcano Bay", "Dias mais quentes, das 10h ao fim da tarde", "Parte do inverno", "Ingresso com data", "Sim"],
      ["Kennedy Space Center", "Todos os dias, das 9h às 17h ou 18h", "Muda em dia de lançamento", "Pago", "Melhor comprar antes"],
      ["The Orlando Eye (ICON Park)", "Todos os dias, da tarde até a noite", "Confira se está aberta", "Pago", "Não"],
      ["SEA LIFE (ICON Park)", "Todos os dias, das 10h à noite", "Não fecha", "Pago", "Não"],
      ["Lake Eola Park", "Todos os dias. Feira: domingo, das 10h às 15h", "Não fecha", "Grátis", "Não"],
      ["Premium Outlets", "Todos os dias, das 10h às 21h", "Domingo fecha mais cedo", "Grátis", "Não"],
      ["Disney Springs", "Todos os dias, das 10h às 23h", "Não fecha", "Grátis", "Não"],
      ["Walmart Supercenter", "Todos os dias, das 6h às 23h", "Não fecha", "Grátis", "Não"],
      ["Cocoa Beach Pier", "Todos os dias, de manhã à noite", "Não fecha", "Grátis, estacionamento pago", "Não"]
    ],
    aviso: ["Confira na semana da viagem", "Os parques mudam o horário conforme a época: veja no aplicativo oficial. Em feriado americano, como o 4 de julho (em 2027, folga na segunda, 05/07), parques e estradas lotam."]
  },

  historia: {
    kick: "De laranjal a capital dos parques",
    titulo: "Linha do tempo de Orlando",
    linhas: [
      ["1838", "O Exército americano ergue o Forte Gatlin, origem da cidade."],
      ["1875", "Orlando vira vila, com menos de cem moradores. É cidade desde 1885."],
      ["1880", "Chega a ferrovia, e a região passa a viver da laranja."],
      ["1895", "Duas geadas seguidas destroem os laranjais."],
      ["1950", "Primeiro lançamento de foguete em Cabo Canaveral, na costa."],
      ["1962", "John Glenn decola de Cabo Canaveral e dá três voltas na Terra."],
      ["1965", "Walt Disney anuncia o projeto de um parque na Flórida."],
      ["1969", "A Apollo 11 parte do Kennedy Space Center rumo à Lua."],
      ["1971", "Abre o Magic Kingdom, em 1º de outubro."],
      ["1981", "Primeiro voo do ônibus espacial, o Columbia."],
      ["1982", "Abre o EPCOT, o segundo parque da Disney."],
      ["1990", "Abre o Universal Studios Florida."],
      ["1999", "Abre o Islands of Adventure."],
      ["2011", "O Atlantis faz o último voo dos ônibus espaciais."],
      ["2025", "Abre o Epic Universe, o parque mais novo da Universal."]
    ]
  },

  dias: [
    { img: "roda", d: "Chegada · de carro", t: "International Drive e roda-gigante", gasto: "R$ 360", seg: 4, bairro: "International Drive",
      destaque: ["Hoje, sem pressa", "O primeiro dia é só para chegar, comprar o básico e ver a cidade do alto."],
      stops: [
        ["Chegada", "Aeroporto MCO e retirada do carro", "Imigração, malas e locadora. Confira cadeirinha e pedágio.", ["Carro", "1h30 a 3h"], "Orlando International Airport MCO"],
        ["Depois", "Check-in no hotel", "Deixe as malas e descanse. Criança cansada hoje estraga amanhã.", ["Carro", "20 a 30 min"]],
        ["Tarde", "Compras do básico no Walmart", "Água, protetor, lanches e capa de chuva para os parques.", ["Carro", "US$ 50 a 100"], "Walmart Supercenter Turkey Lake Road Orlando"],
        ["Noite", "The Orlando Eye, no ICON Park", "Roda de cerca de 120 metros, com a cidade acesa. Confira se está aberta.", ["Carro", "pago"], "The Orlando Eye ICON Park Orlando"]],
      comer: [["Hambúrguer ou pizza na I-Drive", "R$ 80 a R$ 140 por pessoa"], ["Frutas do Walmart para o café", "R$ 30 por pessoa"]],
      chuva: "A roda para com raios. Troque pelo aquário SEA LIFE, ao lado, que é coberto.",
      tip: ["Para economizar", "Protetor, água e capa no Walmart. No parque, tudo custa o dobro."] },

    { img: "capa", d: "Dia inteiro · de carro", t: "Islands of Adventure, na ordem certa", gasto: "R$ 1.380", seg: 5, bairro: "Universal Orlando",
      destaque: ["A ordem certa", "Abertura no brinquedo mais disputado, pausa no meio-dia, volta no fim da tarde."],
      stops: [
        ["07:45", "Estacionamento da Universal", "Chegue 1 hora antes da abertura e fotografe a placa da vaga.", ["Carro", "cerca de US$ 32"], "Universal Orlando Resort parking garage"],
        ["08:30", "O brinquedo mais disputado", "Hagrid's para os maiores. Com pequenos, Seuss Landing primeiro.", ["A pé", "abertura"], "Islands of Adventure Orlando"],
        ["12:30", "Pausa no meio do dia", "Almoço fora do pico e, se der, piscina no hotel.", ["Carro", "2 a 3h"]],
        ["17:00", "Volta ao parque", "As filas caem. Termine em Hogsmeade, com o castelo iluminado.", ["A pé", "até fechar"], "Hogsmeade Islands of Adventure"]],
      comer: [["Three Broomsticks, antes das 11h30", "R$ 110 a R$ 160 por pessoa"], ["Lanche do hotel e Butterbeer para dividir", "R$ 50 por pessoa"]],
      chuva: "Forbidden Journey e Spider-Man são cobertos. As montanhas-russas param com raios.",
      tip: ["Fila virtual", "Alguns brinquedos usam fila virtual no app da Universal. Abra logo na entrada."] },

    { img: "capa", d: "Dia inteiro · de carro", t: "Universal Studios e Hogsmeade, por idade", gasto: "R$ 1.400", seg: 5, bairro: "Universal Orlando",
      destaque: ["Um parque para cada idade", "Pequenos nos Minions e na DreamWorks Land, maiores no Gringotts."],
      stops: [
        ["08:00", "Abertura do Universal Studios", "Minions para os pequenos, Gringotts para os maiores.", ["A pé", "abertura"], "Universal Studios Florida"],
        ["10:30", "Hogwarts Express", "Trem até Hogsmeade, só com ingresso park-to-park.", ["Trem", "park-to-park"], "Hogwarts Express King's Cross Station Universal Studios Florida"],
        ["12:30", "Almoço e pausa", "Divida pratos e encha as garrafas nos bebedouros.", ["A pé", "1h30"]],
        ["17:00", "Jantar no CityWalk", "Restaurantes entre os parques, sem ingresso.", ["A pé", "grátis"], "Universal CityWalk Orlando"]],
      comer: [["Fish and chips no Leaky Cauldron", "R$ 90 a R$ 140 por pessoa"], ["Jantar no CityWalk", "R$ 90 a R$ 150 por pessoa"]],
      chuva: "Quase tudo no Universal Studios é coberto. É o melhor parque para um dia de chuva.",
      tip: ["Troca de pais", "Um adulto espera com o pequeno e depois entra sem pegar a fila de novo."] },

    { img: "nasa", d: "Bate-volta de carro", t: "Kennedy Space Center", gasto: "R$ 760", seg: 5, bairro: "Merritt Island",
      destaque: ["De carro até o espaço", "Chegue na abertura e vá ao Saturn V antes do almoço."],
      stops: [
        ["08:00", "Estrada até a NASA", "Cerca de 1 hora pela Beachline (SR 528), com pedágio.", ["Carro", "cerca de 1h"]],
        ["09:00", "Rocket Garden e Atlantis", "Foguetes de verdade e o ônibus espacial Atlantis.", ["A pé", "no ingresso"], "Kennedy Space Center Visitor Complex"],
        ["11:30", "Apollo/Saturn V Center", "De ônibus. O foguete Saturn V inteiro. Almoce lá.", ["Ônibus", "no ingresso"], "Apollo Saturn V Center Kennedy Space Center"],
        ["15:00", "Planet Play e volta", "Área de brincar de 2 a 12 anos. Saia até 16h30.", ["A pé", "no ingresso"]]],
      comer: [["Moon Rock Café, no Saturn V Center", "R$ 80 a R$ 120 por pessoa"], ["Lanche no carro para a estrada", "R$ 20 por pessoa"]],
      chuva: "Quase tudo é coberto. Deixe o Rocket Garden para quando a chuva parar.",
      tip: ["Lançamento de foguete", "Veja o calendário no site oficial. Se tiver lançamento, troque a ordem dos dias."] },

    { img: "praia", d: "Dia de praia · de carro", t: "Cocoa Beach, dia de descanso", gasto: "R$ 240", seg: 4, bairro: "Cocoa Beach",
      destaque: ["Dia de descanso", "Depois de dois parques e da NASA, areia e mar, sem horário."],
      stops: [
        ["09:00", "Ron Jon Surf Shop", "Loja de surfe gigante. Boia, baldinho e chapéu.", ["Carro", "cerca de 1h"], "Ron Jon Surf Shop Cocoa Beach"],
        ["10:00", "Praia em Lori Wilson Park", "Banheiro, sombra e estacionamento grátis.", ["Carro", "5 min"], "Lori Wilson Park Cocoa Beach"],
        ["13:00", "Cocoa Beach Pier", "Píer de madeira com restaurantes e vista dos surfistas.", ["Carro", "5 min"], "Cocoa Beach Pier"],
        ["16:00", "Jetty Park e os navios", "Navios de cruzeiro saindo para o mar. Depois, volta.", ["Carro", "15 min"], "Jetty Park Port Canaveral"]],
      comer: [["Almoço no píer, com vista para o mar", "R$ 100 a R$ 160 por pessoa"], ["Sorvete na avenida A1A", "R$ 30 por pessoa"]],
      chuva: "Fique no Ron Jon, que é coberto, e volte cedo para a piscina ou para Disney Springs.",
      tip: ["Mar e sol", "Protetor a cada 2 horas. Bandeira vermelha é corrente forte: só pé na água."] },

    { img: "lago", d: "Melhor num domingo · de carro", t: "Feira do Lake Eola e outlets", gasto: "R$ 200", seg: 4, bairro: "Downtown e I-Drive",
      destaque: ["Feira e compras", "Feira de domingo em volta do lago e tarde no outlet, sem passar do limite da Receita."],
      stops: [
        ["10:00", "Feira do Lake Eola", "Comida, flores e artesanato em volta do lago, das 10h às 15h.", ["Carro", "cerca de 25 min"], "Lake Eola Park Orlando"],
        ["11:00", "Pedalinho de cisne", "Barco em forma de cisne, por meia hora.", ["A pé", "pago"], "Lake Eola Swan Boats Orlando"],
        ["14:00", "International Premium Outlets", "Lojas de marca com desconto. Comece pelas infantis.", ["Carro", "cerca de 25 min"], "Orlando International Premium Outlets"],
        ["19:00", "Mala e conta da Receita", "Some as notas por pessoa. Veja a página @@PG:compras@@.", ["Hotel"]]],
      comer: [["Almoço nas barracas da feira", "R$ 50 a R$ 90 por pessoa"], ["Praça de alimentação do outlet", "R$ 60 a R$ 90 por pessoa"]],
      chuva: "A feira acontece com chuva fraca. Com temporal, vá direto ao Florida Mall, que é coberto.",
      tip: ["Para economizar", "Cadastre-se no site do outlet antes e pegue o cupom de desconto no balcão."],
      semana: { dias: [0], alternativa:
        { img: "lago", d: "Centro e compras · de carro", t: "Lake Eola e outlets", gasto: "R$ 200", seg: 4, bairro: "Downtown e I-Drive",
          destaque: ["Compras com conta feita", "Lago de manhã, outlet à tarde, sem passar do limite da Receita."],
          stops: [
            ["09:30", "Lake Eola Park", "Lago com fonte, cisnes e playground.", ["Carro", "cerca de 25 min"], "Lake Eola Park Orlando"],
            ["10:30", "Pedalinho de cisne", "Barco em forma de cisne, por meia hora.", ["A pé", "pago"], "Lake Eola Swan Boats Orlando"],
            ["13:00", "International Premium Outlets", "Lojas de marca com desconto. Comece pelas infantis.", ["Carro", "cerca de 25 min"], "Orlando International Premium Outlets"],
            ["18:00", "Mala e conta da Receita", "Some as notas por pessoa. Veja a página @@PG:compras@@.", ["Hotel"]]],
          comer: [["Cafés e food trucks no Lake Eola", "R$ 50 a R$ 90 por pessoa"], ["Praça de alimentação do outlet", "R$ 60 a R$ 90 por pessoa"]],
          chuva: "Troque o lago pelo Florida Mall, que é coberto. O outlet é ao ar livre.",
          tip: ["Para economizar", "Cadastre-se no site do outlet antes e pegue o cupom de desconto no balcão."] } } },

    { img: "magic", d: "Último dia · de carro", t: "Magic Kingdom e volta para casa", gasto: "R$ 1.480", seg: 5, bairro: "Walt Disney World",
      destaque: ["Último parque", "Da abertura às 15h, com as malas no carro. Depois, aeroporto."],
      stops: [
        ["07:30", "Check-out e malas no carro", "Tudo no porta-malas, fora de vista.", ["Carro"]],
        ["08:15", "Magic Kingdom", "Estacione no Ticket Center e vá de monotrilho ou barco.", ["Carro", "US$ 35"], "Magic Kingdom Park"],
        ["15:00", "Saída e combustível", "Abasteça perto do aeroporto antes de devolver o carro.", ["Carro", "cerca de 40 min"]],
        ["17:00", "Carro e aeroporto MCO", "Devolva o carro e chegue 3 horas antes do voo internacional.", ["Carro", "3h antes"], "Orlando International Airport MCO"]],
      comer: [["Columbia Harbour House, no balcão", "R$ 80 a R$ 120 por pessoa"], ["Lanche no aeroporto", "R$ 60 por pessoa"]],
      chuva: "Vá aos brinquedos cobertos de Fantasyland e Tomorrowland, de capa.",
      tip: ["Plano B", "Voo antes das 18h? Troque o parque pelo Florida Mall, perto do aeroporto."] }
  ],

  guiasLugar: {
    grupo: "Parques e atrações",
    rotulo: "Atração",
    itens: [
      { img: "capa", t: "Islands of Adventure", dia: 2, tempo: "o dia inteiro", kickHist: "O parque em poucas linhas",
        hist: "Aberto em 1999, é o segundo parque da Universal em Orlando. É dividido em ilhas em volta de um lago, cada uma com um tema: super-heróis da Marvel, Jurassic Park, Harry Potter, Dr. Seuss e outros. É o parque das montanhas-russas mais fortes, mas o Seuss Landing e o Camp Jurassic têm brinquedos para os pequenos. O castelo de Hogwarts aparece de quase todo canto do lago.",
        passos: [["Abertura", "Hagrid's ou VelociCoaster, conforme a altura dos filhos. Com pequenos, Seuss Landing primeiro."], ["Hogsmeade", "Forbidden Journey, dentro do castelo, e a Butterbeer. A varinha interativa é cara: decida antes."], ["Jurassic Park", "Camp Jurassic e Pteranodon Flyers para crianças. O River Adventure molha bastante."], ["Marvel Super Hero Island", "Spider-Man para todos. Hulk só a partir de 137 cm."], ["Hogwarts Express", "no dia 3, com park-to-park, o trem liga Hogsmeade ao Universal Studios."]],
        foto: "O lago com o Hulk de um lado e o castelo de Hogwarts ao fundo.",
        saber: "Nas montanhas-russas, bolsa e celular vão para o armário grátis da entrada." },
      { img: "magic", t: "Magic Kingdom", dia: 7, tempo: "da abertura às 15h", kickHist: "O parque em poucas linhas",
        hist: "Primeiro parque da Disney na Flórida, aberto em 1971, e o mais visitado do mundo. O Castelo da Cinderela, no fim da Main Street, é o centro de seis áreas temáticas, de Fantasyland a Tomorrowland. É o melhor parque para crianças de 2 a 10 anos: quase todos os brinquedos de Fantasyland não têm altura mínima. Para chegar, você estaciona no Transportation and Ticket Center e atravessa o lago de barco ou de monotrilho.",
        passos: [["Seven Dwarfs Mine Train", "a fila mais longa do parque. Vá primeiro, logo na abertura (a partir de 97 cm)."], ["Fantasyland", "Peter Pan's Flight, Dumbo e It's a Small World antes das 11h."], ["Tomorrowland", "Space Mountain a partir de 112 cm. Buzz Lightyear para todos."], ["Adventureland e Frontierland", "Piratas do Caribe e Big Thunder no começo da tarde."], ["Lightning Lane", "se a verba deixar, compre para os 2 ou 3 brinquedos de fila mais longa."]],
        foto: "O castelo visto da Main Street, logo na abertura, com a rua ainda vazia.",
        saber: "O parque fecha a noite com fogos, mas hoje você estará no aeroporto. Saia até as 15h." },
      { img: "nasa", t: "Kennedy Space Center", dia: 4, tempo: "6 a 8 horas", kickHist: "A história em poucas linhas",
        hist: "Daqui partiram as missões Apollo que levaram o homem à Lua e os 135 voos dos ônibus espaciais. O centro de visitantes fica ao lado de uma base que continua ativa: foguetes da NASA e de empresas privadas decolam da costa várias vezes por mês. O Rocket Garden, na entrada, reúne foguetes de verdade das primeiras missões americanas.",
        passos: [["Rocket Garden", "na entrada, para a foto da família entre os foguetes."], ["Space Shuttle Atlantis", "o ônibus espacial original e o simulador de lançamento, a partir de 112 cm."], ["Apollo/Saturn V Center", "de ônibus, com o foguete Saturn V inteiro e a sala de controle da Apollo."], ["Gateway e Heroes & Legends", "os foguetes de hoje e a história dos astronautas."], ["Planet Play", "área de brincar para crianças de 2 a 12 anos, boa para o fim do dia."]],
        foto: "A família entre os foguetes do Rocket Garden, de manhã.",
        saber: "Veja o calendário de lançamentos no site oficial. Assistir a um lançamento muda a viagem das crianças." },
      { img: "praia", t: "Cocoa Beach", dia: 5, tempo: "o dia inteiro", kickHist: "A praia em poucas linhas",
        hist: "Cocoa Beach é a praia mais perto de Orlando, a cerca de uma hora de carro. Fica numa ilha estreita entre o oceano Atlântico e uma lagoa, e cresceu nos anos 1960 com os engenheiros e astronautas da corrida espacial. O mar é aberto, com ondas boas para surfe, e o píer de madeira, de 1962, avança cerca de 250 metros sobre a água.",
        passos: [["Ron Jon Surf Shop", "loja enorme de surfe, para boias, chapéus e lembranças."], ["Lori Wilson Park", "areia larga, banheiro e salva-vidas em parte do ano."], ["Cocoa Beach Pier", "almoço com vista e os surfistas embaixo."], ["Jetty Park", "em Port Canaveral, para ver os navios de cruzeiro saindo no fim da tarde."]],
        foto: "O píer visto da areia, com as ondas na frente.",
        saber: "Respeite as bandeiras dos salva-vidas: a corrente de retorno é o maior risco do mar na Flórida." }
    ]
  },

  especiais: [
    { id: "parques-idade", sumario: "Qual parque para cada idade", rotulo: "Parques", kick: "Para escolher sem errar", titulo: "Qual parque para cada idade",
      sub: "Com 3 dias de parque, escolha pela idade das crianças e pela verba. Criança com menos de 3 anos não paga ingresso.",
      tabela: { cab: ["Parque", "Melhor idade", "Destaques", "Bom saber"], linhas: [
        ["Magic Kingdom", "2 a 10 anos", "Castelo, Peter Pan, Dumbo e fogos", "O mais cheio da Disney"],
        ["EPCOT", "6 anos ou mais", "Frozen, Remy, Test Track e países", "Bom para pais e filhos maiores"],
        ["Hollywood Studios", "5 anos ou mais", "Toy Story Land e Star Wars", "Filas longas de manhã"],
        ["Animal Kingdom", "3 anos ou mais", "Safári e Avatar", "Fecha mais cedo"],
        ["Universal Studios", "4 anos ou mais", "Minions, DreamWorks e Gringotts", "Quase tudo coberto"],
        ["Islands of Adventure", "7 anos ou mais", "Hogwarts, Hagrid's e Jurassic Park", "Muitos brinquedos pedem 122 cm"],
        ["Epic Universe", "7 anos ou mais", "Nintendo, Harry Potter e dragões", "Ingresso à parte, muito disputado"],
        ["LEGOLAND Florida", "2 a 10 anos", "Brinquedos pequenos, filas curtas", "A cerca de 1 hora de Orlando"]] },
      cards: [
        { t: "Filhos de até 6 anos", itens: ["Magic Kingdom, Universal Studios e LEGOLAND.", "Deixe Islands para quando tiverem altura."] },
        { t: "Filhos de 7 a 12 anos", itens: ["Islands, Universal Studios e Magic Kingdom.", "Epic Universe se a verba deixar."] },
        { t: "Quando comprar", itens: ["Com 60 a 90 dias, para escolher a data mais barata.", "Ingresso de 2 ou 3 dias sai mais barato por dia."] },
        { t: "Onde comprar", itens: ["Sites oficiais da Disney e da Universal, ou revenda autorizada.", "Nunca de pessoa física: o ingresso é pessoal."] }
      ] },
    { id: "carro", grupo: "Carro e compras", sumario: "Carro, pedágio e cadeirinha", rotulo: "Carro", kick: "Para dirigir sem susto", titulo: "Carro, pedágio e cadeirinha",
      cards: [
        { ic: "i-doc", t: "Para alugar", itens: ["CNH brasileira válida e passaporte. A Permissão Internacional para Dirigir ajuda.", "Cartão de crédito no nome do motorista, para o depósito.", "Motorista com menos de 25 anos paga taxa extra."] },
        { ic: "shield", t: "Seguro do carro", itens: ["Veja se o cartão de crédito ou o seguro viagem já cobre o carro.", "A proteção contra danos (LDW ou CDW) é a mais importante.", "Fotografe o carro todo na retirada e na devolução."] },
        { ic: "coin", t: "Pedágio", itens: ["Muitas praças não aceitam dinheiro: a placa é fotografada e cobrada depois.", "Aceite o plano de pedágio da locadora ou pergunte se dá para usar um SunPass.", "Há pedágio na saída do aeroporto e na Beachline, a caminho da NASA."] },
        { t: "Cadeirinha", itens: ["Na Flórida é obrigatória até 5 anos: cadeirinha até 3, assento de elevação aos 4 e 5.", "Por segurança, use assento de elevação até cerca de 1,45 m.", "Na locadora custa cerca de US$ 15 por dia. Comprar no Walmart pode sair mais barato."] },
        { t: "Estacionamento", itens: ["Disney cobra US$ 35 por dia e a Universal, cerca de US$ 32.", "Hotel na I-Drive também pode cobrar: pergunte antes de reservar.", "Disney Springs e os outlets não cobram."] },
        { t: "Gasolina", itens: ["Preço por galão (3,8 litros). Normalmente, você mesmo abastece.", "Se a bomba pedir ZIP code, pague no caixa da loja.", "Devolva com o tanque cheio: a locadora cobra caro para abastecer."] }
      ],
      avisos: [["Regras que mais pegam brasileiros", "Velocidade em milhas: 65 mph é cerca de 105 km/h. Pode virar à direita no sinal vermelho depois de parar, se não houver placa proibindo. Ônibus escolar parado com a placa de pare aberta: o trânsito para. Mandar mensagem dirigindo dá multa; segurar o celular é proibido em zona escolar e de obras."]] },
    { id: "compras", grupo: "Carro e compras", sumario: "Compras e limite da Receita", rotulo: "Compras", kick: "Para voltar sem susto na alfândega", titulo: "Compras e limite da Receita",
      cards: [
        { ic: "coin", t: "A cota de cada um", itens: ["US$ 1.000 por pessoa, inclusive crianças, para o que vem na mala.", "Não dá para juntar cotas: um produto de US$ 1.500 passa do limite.", "Roupa e objetos de uso pessoal da viagem não entram na conta."] },
        { t: "Free shop na chegada", itens: ["No free shop do aeroporto, no Brasil, há outra cota de US$ 1.000 por pessoa.", "É uma cota separada: vale além da mala, mas o que sobrar não passa para ela.", "Bebida e cigarro têm limite de quantidade."] },
        { ic: "i-doc", t: "Se passar do limite", itens: ["Declare antes, pela internet (e-DBV), e siga pela fila de bens a declarar.", "Paga 50% de imposto sobre o que passou da cota.", "Quem não declara e é pego paga o imposto e uma multa."] },
        { t: "Celular, notebook e relógio", itens: ["Um celular, um relógio e uma câmera, usados e de uso pessoal, ficam fora da cota.", "Notebook, tablet e videogame novos entram na conta.", "Confira as regras no site da Receita antes de comprar."] },
        { t: "Onde comprar mais barato", itens: ["Outlets: Orlando International e Orlando Vineland Premium Outlets.", "Ross, TJ Maxx e Marshalls para roupa infantil.", "Walmart e Target para lanche, protetor e brinquedo."] },
        { t: "Guarde as notas", itens: ["Guarde todas as notas fiscais e some por pessoa.", "O imposto de venda (6,5% em Orlando) só aparece no caixa.", "Fotografe as notas: elas comprovam o valor na alfândega."] }
      ],
      avisos: [["Mala e peso", "A franquia de bagagem para os EUA depende da tarifa: de nenhuma a 2 malas de 23 kg por pessoa. Confira no bilhete e pese as malas no hotel antes de sair. Excesso pago no aeroporto sai caro."]] }
  ],

  orcamento: {
    colDinheiro: "Dinheiro vivo",
    dias: [
      ["US$ 20", "Compras do básico no Walmart, não no hotel"],
      ["US$ 10", "Lanche e garrafinha levados do hotel"],
      ["US$ 10", "Divida pratos: as porções são grandes"],
      ["US$ 10", "Lanche no carro para a estrada"],
      ["US$ 10", "Praia com estacionamento grátis em Lori Wilson"],
      ["US$ 20", "Cupom de desconto do outlet, pego no site"],
      ["US$ 10", "Abasteça antes de devolver o carro"]
    ],
    fora: "como o aluguel do carro, o seguro viagem e o estacionamento do hotel",
    nota: "Dinheiro vivo por pessoa, para gorjetas, máquinas e emergências. Quase tudo aceita cartão. As compras nas lojas não entram nesta tabela."
  },

  comida: {
    titulo: "Comida típica",
    pratos: [
      ["Hambúrguer", "O clássico americano, com batata frita. Porções grandes, dá para dividir.", "US$ 12 a 20 · Five Guys e Shake Shack"],
      ["Churrasco americano (BBQ)", "Costela e peito bovino defumados por horas, com molho.", "US$ 18 a 30 · 4 Rivers Smokehouse"],
      ["Panquecas", "Café da manhã com xarope de bordo, ovos e bacon.", "US$ 10 a 18 · IHOP e Denny's"],
      ["Coxa de peru", "Coxa enorme assada, vendida em carrinhos. Dá para dois.", "US$ 14 a 18 · parques da Disney"],
      ["Butterbeer", "A bebida doce do Harry Potter, gelada ou cremosa.", "US$ 9 a 12 · Hogsmeade e Diagon Alley"],
      ["Dole Whip", "Sorvete cremoso de abacaxi, perfeito no calor.", "US$ 6 a 8 · Aloha Isle, no Magic Kingdom"],
      ["Key lime pie", "Torta de limão típica da Flórida, mais azedinha que a nossa.", "US$ 6 a 9 · restaurantes e mercados"],
      ["Camarão e peixe frito", "Frutos do mar da costa, com vista para o oceano.", "US$ 18 a 30 · Cocoa Beach Pier"],
      ["Sanduíche cubano", "Pão prensado com porco, presunto, queijo e picles.", "US$ 10 a 15 · lanchonetes cubanas"],
      ["Chicken tenders", "Tirinhas de frango empanado. O prato que toda criança aceita.", "US$ 10 a 15 · parques e restaurantes"]
    ],
    cards: [
      { t: "Comer nos parques gastando menos", itens: ["Peça água da torneira grátis nos balcões de lanche.", "A Disney deixa levar lanche e água. Na Universal, só lanches pequenos."] },
      { t: "Mercado e café da manhã", itens: ["Hotel com café incluso economiza uma refeição por dia.", "Publix e Walmart têm frutas, sanduíches e lanches prontos para o carro."] }
    ]
  },

  golpes: {
    itens: [
      ["Ingresso barato demais", "Ingresso da Disney é pessoal e com data. Vendido na rua, em grupo de rede social ou \"usado\" quase sempre é golpe."],
      ["Telefonema no quarto", "Alguém liga dizendo ser da recepção e pede o número do cartão. Desligue e confirme você mesmo, no balcão."],
      ["Ingresso grátis da I-Drive", "Oferecem ingresso ou desconto em troca de \"só 90 minutos\". É venda de multipropriedade, longa e insistente."],
      ["Extras no balcão da locadora", "Seguros, upgrade e gasolina pré-paga aparecem no contrato. Leia antes de assinar e recuse o que não pediu."],
      ["Carro com coisas à vista", "Mochila, sacola de compras e eletrônicos no banco atraem arrombamento. Guarde tudo no porta-malas antes de chegar."],
      ["Criança perdida no parque", "Não é golpe, mas é o maior susto. Fotografe a roupa do dia, ponha seu telefone na pulseira e ensine: procure um funcionário."]
    ],
    perda: ["Faça o boletim de ocorrência na polícia local e guarde o número.", "Procure o Consulado-Geral do Brasil em Orlando (página @@PG:emergencia@@).", "Para voltar, peça a Autorização de Retorno ao Brasil (ARB). Guarde cópia do passaporte e do visto na nuvem."],
    aviso: ["Calor e tempestade", "No verão, o calor passa de 33 °C com umidade alta. Dê água às crianças a cada fila e procure sombra no meio do dia. Com raios, saia da piscina e da praia na hora."]
  },

  fotos: {
    itens: [
      ["A cidade iluminada do alto da Orlando Eye", "Ao anoitecer", 1],
      ["O castelo de Hogwarts, em Hogsmeade", "Fim da tarde, com as luzes", 2],
      ["O globo da Universal, na entrada", "Manhã, na chegada", 3],
      ["O dragão no alto do banco Gringotts", "Qualquer hora, espere o fogo", 3],
      ["O Rocket Garden do Kennedy Space Center", "Manhã", 4],
      ["Embaixo do foguete Saturn V", "Meio do dia", 4],
      ["O píer de Cocoa Beach visto da areia", "Manhã ou fim da tarde", 5],
      ["A fonte do Lake Eola com os prédios ao fundo", "Manhã", 6],
      ["O Castelo da Cinderela da Main Street", "Na abertura, com a rua vazia", 7],
      ["A família com o Mickey", "Logo cedo, com fila menor", 7]
    ],
    aviso: ["Fotos com personagens", "Personagens têm horário e fila. Veja no aplicativo do parque e leve caneta e caderno de autógrafos na mochila."]
  },

  extras: [
    { kick: "Um dia a mais", titulo: "Parque aquático",
      cards: [
        { t: "Volcano Bay (Universal)", o: "O parque aquático da Universal, com um vulcão no meio e fila virtual pela pulseira.", preco: "R$ 480 a 750", min: 480, max: 750,
          itens: ["Ingresso de 1 dia de cerca de US$ 89 a 139, conforme a data.", "Piscina de ondas e rio lento para os pequenos.", "A pulseira avisa a hora de voltar a cada brinquedo."],
          dica: "Fecha em parte do inverno. Confira o calendário antes." },
        { t: "Typhoon Lagoon (Disney)", o: "Parque aquático da Disney, com uma das maiores piscinas de ondas do país.", preco: "R$ 400 a 550", min: 400, max: 550,
          itens: ["Ingresso de cerca de US$ 70 a 90.", "Área rasa só para crianças pequenas.", "Estacionamento grátis."],
          dica: "Chegue na abertura para pegar cadeira na sombra." }
      ],
      aviso: ["Quando encaixar", "Troque o dia 6 se as compras forem poucas, ou faça no lugar do dia 7 se o voo for cedo. Em dia frio, menos de 20 °C, não vale a pena."] },
    { kick: "Mais duas ideias", titulo: "Jacarés e LEGOLAND",
      cards: [
        { t: "Gatorland", o: "Parque antigo com centenas de jacarés e crocodilos, na saída para Kissimmee.", preco: "R$ 180 a 280", min: 180, max: 280,
          itens: ["Shows de jacaré e passarela sobre o pântano.", "Cabe numa manhã, a cerca de 25 minutos da I-Drive.", "Tirolesa opcional, paga à parte."],
          dica: "Bom para a manhã do dia 1, se o voo chegar cedo." },
        { t: "LEGOLAND Florida", o: "Parque feito para crianças de 2 a 12 anos, em Winter Haven, com filas curtas.", preco: "R$ 500 a 750", min: 500, max: 750,
          itens: ["Cerca de 1 hora de carro de Orlando.", "Parque aquático e parque da Peppa Pig ao lado, com ingresso à parte.", "Sai mais barato comprando antes, no site."],
          dica: "Troque um dos dias da Universal se os filhos tiverem menos de 7 anos." }
      ] }
  ],

  guias: {
    linhas: [
      ["Ingressos dos parques", "comprados antes, com data", "Sites oficiais da Disney e da Universal; Undercover Tourist (revenda autorizada)", "$$$", "Dias 2, 3 e 7"],
      ["Aluguel de carro", "retirada no aeroporto MCO", "Alamo, Enterprise, Hertz, Avis e National", "$$$", "Dia 1"],
      ["Kennedy Space Center", "ingresso e experiências extras", "Site oficial do Kennedy Space Center Visitor Complex", "$$", "Dia 4"],
      ["Passeio de airboat", "jacarés nos lagos da região", "Boggy Creek Airboat Adventures, Wild Florida", "$$", "Extra"],
      ["Aluguel de carrinho e cadeirinha", "entrega no hotel", "Kingdom Strollers, BabyQuip", "$", "Dia 1"]
    ],
    escolher: "Compre ingressos só no site oficial ou em revenda autorizada pelo parque. Para carro, compare o preço final, com seguro, pedágio e cadeirinha, e não só a diária. Leia avaliações recentes antes de pagar."
  },

  emergencia: {
    numeros: [["911", "Polícia, ambulância e bombeiros"], ["*347", "Polícia Rodoviária da Flórida, do celular"], ["Seguro", "Ligue antes de ir ao hospital (telefone na página @@PG:ficha@@)"]],
    consulado: { t: "Consulado-Geral do Brasil em Orlando",
      p: ["355 N Orange Ave, Orlando, FL 32801. Atende toda a região do roteiro, inclusive a NASA e Cocoa Beach. Plantão de emergência (morte, internação, prisão): <b>+1 321 387-9716</b>. Dúvidas gerais, só por mensagem escrita no WhatsApp: +1 407 675-0604.",
        "Plantão do Itamaraty, em Brasília, 24 horas: <b>+55 61 98260-0610</b>. Intoxicação de criança (Poison Control): <b>1-800-222-1222</b>."] },
    frases: [
      ["Olá / tchau", "Hi / bye", "rái / bái"], ["Bom dia", "Good morning", "gud mórnin"], ["Obrigado", "Thank you", "fênk iú"],
      ["Por favor", "Please", "plíz"], ["Com licença / desculpe", "Excuse me / sorry", "ekskiúz mi / sóri"], ["Quanto custa?", "How much is it?", "ráu mâtch iz it?"],
      ["Onde fica o banheiro?", "Where is the restroom?", "uér iz dâ réstrum?"], ["Água, por favor", "Water, please", "uóter, plíz"],
      ["A conta, por favor", "The check, please", "dâ tchék, plíz"], ["Mesa para quatro", "A table for four, please", "â têibol for fór, plíz"],
      ["Tem cardápio infantil?", "Do you have a kids menu?", "du iú rév â kids méniu?"], ["Onde começa a fila?", "Where does the line start?", "uér dâz dâ láin stárt?"],
      ["Perdi meu filho / minha filha", "I lost my son / my daughter", "ai lóst mai sân / mai dóter"], ["Socorro!", "Help!", "rélp!"],
      ["Preciso de um médico", "I need a doctor", "ai níd â dóktor"], ["Farmácia", "Pharmacy", "fármassi"],
      ["Posso pagar com cartão?", "Can I pay by card?", "kén ai pêi bai kárd?"], ["Só estou olhando", "I'm just looking", "áim djâst lúkin"],
      ["Pode tirar uma foto nossa?", "Could you take a picture of us?", "kud iú têik â píktcher óv âs?"], ["Onde devolvo o carro?", "Where is the car rental return?", "uér iz dâ kár rental ritârn?"]
    ]
  },

  cartao: {
    kick: "Mostre ao motorista",
    sub: "Escreva o endereço do hotel no espaço e mostre esta página ao motorista de Uber ou táxi, ou a um funcionário do parque ou do hotel.",
    pedido: "Please take me to:",
    coluna: "Em inglês",
    lugares: [
      ["Aeroporto de Orlando", "Orlando International Airport (MCO)"],
      ["Magic Kingdom", "Magic Kingdom Park, Walt Disney World"],
      ["Universal", "Universal Orlando Resort, main parking garage"],
      ["Pronto-socorro mais próximo", "The nearest hospital emergency room"],
      ["Farmácia mais próxima", "The nearest pharmacy (CVS or Walgreens)"],
      ["Outlet", "Orlando International Premium Outlets"]
    ]
  },

  creditos: "<a href='https://commons.wikimedia.org/wiki/File:A_view_of_Universal_Orlando_Resort_in_May_2023.jpg' style='color:inherit'>“A view of Universal Orlando Resort in May 2023”</a>, Benoît Prieur (<a href='https://creativecommons.org/publicdomain/zero/1.0/' style='color:inherit'>CC0</a>); <a href='https://commons.wikimedia.org/wiki/File:Orlando_Eye.jpg' style='color:inherit'>“Orlando Eye”</a>, Steveo89 (<a href='https://creativecommons.org/licenses/by-sa/4.0/' style='color:inherit'>CC BY-SA 4.0</a>); <a href='https://commons.wikimedia.org/wiki/File:Kennedy_Space_Center,_Rocket_Garden,_Power_of_Apollo.jpg' style='color:inherit'>“Kennedy Space Center, Rocket Garden, Power of Apollo”</a>, Michael Rivera (<a href='https://creativecommons.org/licenses/by-sa/4.0/' style='color:inherit'>CC BY-SA 4.0</a>); <a href='https://commons.wikimedia.org/wiki/File:Lake_Eola_and_Orlando_Skyline_seen_in_2024.jpg' style='color:inherit'>“Lake Eola and Orlando Skyline seen in 2024”</a>, JER3L1337 (<a href='https://creativecommons.org/licenses/by/4.0/' style='color:inherit'>CC BY 4.0</a>); <a href='https://commons.wikimedia.org/wiki/File:Cocoa_Beach_Pier_from_the_beach_2023-05-19_(2' style='color:inherit'>“Cocoa Beach Pier from the beach 2023-05-19 (2)”</a>, Benoît Prieur (<a href='https://creativecommons.org/publicdomain/zero/1.0/' style='color:inherit'>CC0</a>); <a href='https://commons.wikimedia.org/wiki/File:Cinderella_Castle_January_2021.jpg' style='color:inherit'>“Cinderella Castle January 2021”</a>, Backattaxk251 (<a href='https://creativecommons.org/licenses/by-sa/4.0/' style='color:inherit'>CC BY-SA 4.0</a>). Endereços: commons.wikimedia.org (cada foto) e creativecommons.org/licenses (cada licença); os nomes acima são links."
};
