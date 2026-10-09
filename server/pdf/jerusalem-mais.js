// Páginas a mais do Roteiro Detalhado de Jerusalém (ideias do Produto e QA de 09/10/2026, aprovadas pelo Tom).
// Valem para qualquer destino: ficha, onde ficar, locomoção, horários, orçamento, comida, golpes, linha do tempo,
// fotos, passeios extras, cartão do táxi e diário. Só de Terra Santa (RELIGIOSAS): guia de cada lugar sagrado,
// leituras e passaporte do peregrino.
// ATENÇÃO: horários, preços e nomes de restaurantes foram escritos de memória; conferir antes de vender.

export const CSS_MAIS = `
.ficha{display:grid;gap:0}
.ficha div{display:grid;grid-template-columns:52mm 1fr;gap:4mm;border-bottom:1px solid var(--line);padding:3.2mm 0;font-size:9.5pt}
.ficha b{color:var(--deep)}
.ficha small{display:block;color:var(--mut);font-size:8pt}
.ficha span{border-bottom:1px dotted var(--line)}
.bairros{display:grid;gap:4mm}
.bairro{background:var(--paper);border-radius:4mm;padding:4.5mm 5mm;display:grid;grid-template-columns:1fr 1fr;gap:2mm 6mm}
.bairro h3{grid-column:1/-1;font-size:13pt}
.bairro .quem{grid-column:1/-1;font-size:9pt;color:var(--acc);font-weight:700}
.bairro ul{margin:0;padding-left:4.5mm;font-size:9pt;display:grid;gap:1mm}
.bairro em{font-style:normal;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.estilos{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.estilos div{background:var(--deep);color:var(--on);border-radius:4mm;padding:4mm 5mm}
.estilos small{display:block;opacity:.7;font-size:8.5pt}
.estilos b{font:800 13pt var(--display);color:var(--gold)}
.tb{width:100%;border-collapse:collapse;font-size:8.8pt}
.tb th{text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);padding:1.8mm 2mm;border-bottom:1.5px solid var(--line)}
.tb td{padding:2.2mm 2mm;border-bottom:1px solid var(--line);vertical-align:top}
.tb td b{display:block}
.tb td small{color:var(--mut)}
.tb .vazio{border-bottom:1px dotted var(--mut);min-width:22mm}
.pratos{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 5mm}
.prato{border-bottom:1px solid var(--line);padding-bottom:2mm;font-size:9pt}
.prato b{font-size:10.5pt;color:var(--deep)}
.prato small{display:block;color:var(--mut)}
.linha{display:grid;gap:0;border-left:3px solid var(--gold);margin-left:20mm;padding-left:6mm}
.linha div{position:relative;padding:1.8mm 0;font-size:9.5pt}
.linha b{position:absolute;left:-30mm;width:22mm;text-align:right;font:800 10pt var(--display);color:var(--acc)}
.linha div::before{content:"";position:absolute;left:-8.4mm;top:3.2mm;width:2.6mm;height:2.6mm;border-radius:50%;background:var(--deep)}
.sacro .dayhead{height:62mm}
.sacro .passos{margin:0;padding-left:5mm;display:grid;gap:1.6mm;font-size:9.5pt}
.sacro .passos b{color:var(--deep)}
.hist{font-size:10pt;line-height:1.55}
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.trio div{background:var(--paper);border-radius:4mm;padding:4mm;font-size:9pt}
.trio b{display:block;font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:var(--acc);margin-bottom:1mm}
.carimbos{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.carimbos div{border:1.5px dashed var(--line);border-radius:3mm;height:42mm;padding:2.5mm;font-size:8.5pt;display:flex;flex-direction:column;justify-content:space-between}
.carimbos b{color:var(--deep);font-size:9pt}
.carimbos small{color:var(--mut)}
.taxi{border:2px solid var(--deep);border-radius:5mm;padding:7mm;display:grid;gap:4mm;text-align:center}
.taxi .he,.taxi .ar{font:700 22pt/1.3 "Noto Sans Hebrew","Noto Sans Arabic","Arial",sans-serif;color:var(--deep)}
.taxi .end{border-bottom:1.5px dotted var(--mut);height:12mm}
.dir{direction:rtl;unicode-bidi:isolate;font-family:"Noto Sans Hebrew","Noto Sans Arabic","Arial",sans-serif}
.diario{display:grid;gap:3mm}
.diario>div{border-bottom:1px solid var(--line);padding-bottom:2mm;display:grid;grid-template-columns:18mm 1fr;gap:3mm}
.diario b{font:800 11pt var(--display);color:var(--acc)}
.diario p{font-size:8.5pt;color:var(--mut)}
.diario .ln{height:20mm;background:repeating-linear-gradient(transparent 0 5.2mm,var(--line) 5.2mm 5.5mm)}
.sumario{columns:2;column-gap:8mm}
.sumario a{break-inside:avoid;display:flex;gap:3mm;align-items:baseline;padding:1.6mm 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:9pt}
.sumario a span{flex:1}
.sumario a i{font-style:normal;color:var(--mut);font-size:8.5pt}
.sumario a b{font:800 10pt var(--display);color:var(--acc);min-width:9mm;text-align:right}
.sumario h3{break-after:avoid;font-size:8.5pt;text-transform:uppercase;letter-spacing:.12em;color:var(--mut);margin:4mm 0 1mm}
.maps{color:var(--acc);text-decoration:none;border-bottom:1px solid currentColor}
.stop{grid-template-columns:16mm 1fr 18mm}
.qr{display:block;width:18mm;height:18mm;align-self:start}
.qr svg{width:100%;height:100%;display:block}
#emergencia .phr td{padding:.8mm 3mm;font-size:8.6pt}
#emergencia .in{gap:4mm}
#horarios .tb td{padding:1.5mm 2mm}
`;

const ficha = [
  ["Voo de ida", "Companhia, número, data e horário"], ["Localizador da reserva", "O código de 6 letras da passagem"],
  ["Voo de volta", "Companhia, número, data e horário"], ["Hotel", "Nome, endereço e telefone"],
  ["Seguro viagem", "Número da apólice e telefone 24 horas"], ["ETA-IL", "Número da autorização de entrada"],
  ["Passeios contratados", "Empresa, data e ponto de encontro"], ["Cartão do banco", "Telefone para bloqueio no exterior"],
  ["Contato no Brasil", "Nome e telefone de alguém para avisar"], ["Contato na viagem", "Guia, motorista ou amigo no destino"]
];

const bairros = [
  { n: "Perto do Portão de Jaffa e Mamilla", quem: "Combina com: primeira viagem, casais e quem quer fazer tudo a pé.",
    pro: ["5 minutos a pé da Cidade Antiga", "Rua bem iluminada e movimentada à noite", "Restaurantes e lojas abertos até tarde"],
    contra: ["Diárias mais caras da cidade", "Pouca opção econômica"] },
  { n: "Centro: rua Jaffa, Ben Yehuda e o mercado", quem: "Combina com: quem quer economizar e gosta de movimento.",
    pro: ["VLT na porta, que leva à Cidade Antiga", "Hotéis e comida mais baratos", "Perto do Mahane Yehuda"],
    contra: ["15 a 20 minutos a pé até o Muro", "Do pôr do sol de sexta à noite de sábado, quase tudo fecha"] },
  { n: "Dentro da Cidade Antiga (casas de peregrinos)", quem: "Combina com: peregrinos e grupos de igreja.",
    pro: ["Você acorda ao lado dos lugares sagrados", "Clima de peregrinação, com missas e capelas", "Casas cristãs como o Hospício Austríaco e a Casa Nova"],
    contra: ["Ruas com escadas, sem carro na porta", "Quartos simples e portão com horário"] }
];

const horarios = [
  ["Muro das Lamentações", "Todos os dias, 24 horas", "—", "Grátis", "Não"],
  ["Túneis do Muro", "Visitas guiadas ao longo do dia", "Sábado", "Pago", "Sim"],
  ["Esplanada e Domo da Rocha", "Dom a qui, poucas horas de manhã e no começo da tarde", "Sex, sáb e feriados muçulmanos", "Grátis (só por fora)", "Não"],
  ["Basílica do Santo Sepulcro", "Todos os dias, cedo até o começo da noite", "—", "Grátis", "Não"],
  ["Torre de Davi (museu)", "Todos os dias, das 9h ao fim da tarde", "Fecha cedo na sexta", "Pago", "Melhor reservar"],
  ["Dominus Flevit", "Manhã e tarde, fecha no almoço", "—", "Grátis", "Não"],
  ["Getsêmani e Todas as Nações", "Manhã e tarde, fecha no almoço", "—", "Grátis", "Não"],
  ["Cenáculo", "Todos os dias, de manhã ao fim da tarde", "—", "Grátis", "Não"],
  ["Jardim do Túmulo", "Seg a sáb, de manhã ao fim da tarde", "Domingo", "Grátis (doação)", "Não"],
  ["Mercado Mahane Yehuda", "Dom a qui o dia todo, sexta até o meio da tarde", "Sábado", "—", "Não"],
  ["Monte das Bem-Aventuranças", "Manhã e tarde, fecha no almoço", "—", "Taxa pequena", "Não"],
  ["Cafarnaum", "Todos os dias, das 8h às 17h", "—", "Taxa pequena", "Não"],
  ["Yardenit (Rio Jordão)", "Todos os dias, fecha mais cedo na sexta", "—", "Grátis (túnica paga)", "Não"],
  ["Basílica da Natividade", "Todos os dias, cedo até o fim da tarde", "—", "Grátis", "Não"],
  ["Campo dos Pastores", "Manhã e tarde, fecha no almoço", "—", "Grátis", "Não"]
];

const pratos = [
  ["Homus", "Pasta de grão-de-bico com tahine, comida com pão pita.", "₪ 25 a 40 · Lina e Abu Shukri, na Cidade Antiga"],
  ["Falafel", "Bolinhos fritos de grão-de-bico no pão pita.", "₪ 15 a 25 · barracas em toda a cidade"],
  ["Shawarma", "Carne assada no espeto, fatiada no pão ou no laffa.", "₪ 35 a 50 · rua Jaffa e perto do mercado"],
  ["Sabich", "Pita com berinjela frita, ovo cozido e salada.", "₪ 25 a 35 · barracas do centro"],
  ["Shakshuka", "Ovos cozidos no molho de tomate e pimentão. Café da manhã clássico.", "₪ 45 a 60 · cafés do centro"],
  ["Knafeh", "Doce de queijo quente com massa crocante e calda.", "₪ 20 a 30 · Jafar Sweets, no Bairro Muçulmano"],
  ["Ka'ak", "Pão alongado com gergelim, vendido nas portas da Cidade Antiga.", "₪ 5 a 10 · carrinhos no Portão de Damasco"],
  ["Rugelach", "Rolinhos de massa com chocolate.", "₪ 20 a 30 a caixinha · Marzipan, no Mahane Yehuda"],
  ["Peixe de São Pedro", "Tilápia do Mar da Galileia, frita ou grelhada.", "₪ 90 a 130 · Tiberíades e kibutz Ein Gev"],
  ["Malabi", "Pudim de leite com água de rosas e calda.", "₪ 15 a 25 · barracas do mercado"]
];

const golpes = [
  ["Guia \"voluntário\"", "Alguém se oferece para mostrar a igreja ou o caminho e cobra caro no fim. Agradeça e siga."],
  ["Táxi sem taxímetro", "Peça \"moné, bevakashá\" (o taxímetro, por favor) ou use o Gett. Se for preço fechado, combine antes de entrar."],
  ["Câmbio ruim", "Evite trocar no aeroporto. Saque no caixa eletrônico e escolha pagar em shekel, nunca em reais."],
  ["Preço de turista no souk", "Nas lojas da Cidade Antiga o primeiro preço é alto. Comece oferecendo a metade."],
  ["Presente que vira cobrança", "Pulseira, ramo ou foto \"de presente\" quase sempre vira pedido de dinheiro. Não aceite."],
  ["Bolsa e celular", "No Santo Sepulcro, no Muro na sexta e no mercado, leve a mochila na frente."]
];

const linha = [
  ["c. 1000 a.C.", "Davi conquista a cidade e faz dela a capital do reino."], ["c. 960 a.C.", "Salomão constrói o Primeiro Templo."],
  ["586 a.C.", "Os babilônios destroem a cidade e o Templo."], ["516 a.C.", "O Segundo Templo é reconstruído depois do exílio."],
  ["c. 20 a.C.", "Herodes amplia o Templo e a esplanada. O Muro das Lamentações é dessa obra."], ["c. 30 d.C.", "Crucificação e ressurreição de Jesus."],
  ["70 d.C.", "Os romanos destroem o Segundo Templo."], ["335", "É consagrada a Basílica do Santo Sepulcro, de Constantino."],
  ["691", "É construído o Domo da Rocha."], ["1099", "Os cruzados tomam Jerusalém."], ["1187", "Saladino retoma a cidade."],
  ["1538", "Solimão, o Magnífico, ergue as muralhas que você vê hoje."], ["1948", "A cidade fica dividida entre Israel e Jordânia."],
  ["1967", "Na Guerra dos Seis Dias, Israel passa a controlar a Cidade Antiga e Jerusalém Oriental."],
  ["1981", "A Cidade Antiga entra na lista de Patrimônio Mundial da UNESCO."]
];

const fotos = [
  ["O Domo da Rocha do mirante do Monte das Oliveiras", "Manhã, com o sol atrás de você", 3],
  ["O Muro das Lamentações ao entardecer", "Fim da tarde", 1], ["O Portão de Jaffa e a Torre de Davi", "Fim da tarde", 1],
  ["A Edícula do Santo Sepulcro com a luz da cúpula", "Manhã cedo", 2],
  ["Os telhados da Cidade Antiga do terraço do Hospício Austríaco", "Meio do dia", 2],
  ["O mosaico dourado da Igreja de Todas as Nações", "Manhã", 3], ["O Mar da Galileia do Monte das Bem-Aventuranças", "Manhã", 4],
  ["A estrela de prata da Gruta da Natividade, sem flash", "Logo na abertura", 5],
  ["As barracas coloridas do Mahane Yehuda", "Sexta de manhã", 6], ["A Cidade Antiga do alto das muralhas", "Manhã", 7]
];

const frases = [
  ["Olá / tchau", "Shalom", "hebraico"], ["Bom dia", "Boker tov", "hebraico"], ["Obrigado", "Todá", "hebraico"],
  ["Por favor", "Bevakashá", "hebraico"], ["Sim / não", "Ken / lo", "hebraico"], ["Com licença / desculpe", "Slichá", "hebraico"],
  ["Quanto custa?", "Kamá zé olê?", "hebraico"], ["Onde fica…?", "Eifô…?", "hebraico"], ["Banheiro", "Sherutim", "hebraico"],
  ["Água", "Máim", "hebraico"], ["A conta, por favor", "Hacheshbon, bevakashá", "hebraico"], ["Fala inglês?", "Medaber anglit?", "hebraico"],
  ["Socorro!", "Hatsilu!", "hebraico"], ["Hospital", "Beit cholim", "hebraico"], ["Bom Shabat", "Shabat shalom", "hebraico"],
  ["Olá", "Marhaba", "árabe"], ["Obrigado", "Shukran", "árabe"], ["Quanto custa?", "Bikam?", "árabe"],
  ["Sim / não", "Na'am / la", "árabe"], ["Tchau", "Ma'a salama", "árabe"]
];

const lugaresTaxi = [
  ["Cidade Antiga", "העיר העתיקה", "البلدة القديمة"], ["Portão de Jaffa", "שער יפו", "باب الخليل"],
  ["Portão de Damasco", "שער שכם", "باب العامود"], ["Mercado Mahane Yehuda", "שוק מחנה יהודה", "سوق محنيه يهودا"],
  ["Estação de trem Yitzhak Navon", "תחנת יצחק נבון", "محطة يتسحاق نافون"], ["Aeroporto Ben Gurion", "נמל התעופה בן גוריון", "مطار بن غوريون"]
];

const SACROS = [
  { id: "sacro-sepulcro", img: "sepulcro", t: "Basílica do Santo Sepulcro", dia: 2, tempo: "1h30 a 2h",
    hist: "Constantino construiu a primeira basílica no século 4, sobre o lugar que a tradição aponta como o Calvário e o túmulo de Jesus. Ela foi destruída e refeita várias vezes, e o que se vê hoje é em boa parte da época das Cruzadas. A igreja é dividida entre várias comunidades cristãs, entre elas a católica, a grega ortodoxa e a armênia, e há séculos uma família muçulmana guarda a chave da porta.",
    passos: [["Pedra da Unção", "logo na entrada, onde o corpo de Jesus teria sido preparado."], ["Calvário", "suba a escada estreita à direita da entrada até o altar sobre a rocha."], ["Rotunda e Edícula", "o túmulo, sob a cúpula. A fila é aqui."], ["Capela de Santa Helena", "descendo as escadas, com cruzes gravadas nas paredes por peregrinos."], ["Capela de Adão", "embaixo do Calvário, onde aparece a rocha rachada."]],
    foto: "A Edícula vista da porta da rotunda, com a luz que desce da cúpula.", saber: "Dentro da Edícula se fica menos de um minuto, e os padres controlam a fila. Vá antes das 8h ou no fim da tarde." },
  { id: "sacro-muro", img: "muro", t: "Muro das Lamentações", dia: 1, tempo: "45 min, ou 2h com os Túneis",
    hist: "O muro é parte da contenção que Herodes construiu por volta do ano 20 a.C. para ampliar a esplanada do Segundo Templo, destruído pelos romanos no ano 70. É o lugar de oração mais sagrado do judaísmo aberto a visitantes hoje. Os pedidos escritos em papel e colocados nas frestas são recolhidos e enterrados no Monte das Oliveiras.",
    passos: [["Escadaria do Bairro Judeu", "para ver a praça inteira de cima."], ["Área de oração", "homens à esquerda, mulheres à direita, com cabeça e ombros cobertos."], ["Arco de Wilson", "à esquerda da área masculina, coberto e cheio de livros de oração."], ["Túneis do Muro", "visita guiada por baixo da cidade, com reserva."], ["Parque Arqueológico Davidson", "à direita da praça, com as escadas que subiam ao Templo (pago)."]],
    foto: "Da escadaria do Bairro Judeu, a praça com o Domo da Rocha ao fundo.", saber: "Do pôr do sol de sexta à noite de sábado não se fotografa nem se usa celular na praça." },
  { id: "sacro-getsemani", img: "getsemani", t: "Getsêmani", dia: 3, tempo: "1h",
    hist: "Getsêmani quer dizer prensa de azeite. É o jardim ao pé do Monte das Oliveiras onde Jesus orou antes de ser preso. Algumas oliveiras do jardim estão entre as mais antigas conhecidas. A Igreja de Todas as Nações, de 1924, tem esse nome porque foi construída com doações de vários países.",
    passos: [["Jardim das oliveiras", "cercado, visto do caminho em volta."], ["Igreja de Todas as Nações", "com a Rocha da Agonia diante do altar."], ["Túmulo de Maria", "igreja ortodoxa logo abaixo, descendo uma escadaria."], ["Gruta do Getsêmani", "ao lado, onde a tradição diz que os discípulos dormiram."]],
    foto: "A fachada com mosaico dourado da Igreja de Todas as Nações, vista da rua.", saber: "A igreja fecha no almoço. Por dentro é escura de propósito, para lembrar a noite da oração." },
  { id: "sacro-natividade", img: "belem", t: "Basílica da Natividade, em Belém", dia: 5, tempo: "1h30",
    hist: "A primeira igreja foi erguida no século 4, por ordem de Constantino e de sua mãe, Helena. A atual é em boa parte do século 6, do imperador Justiniano, e é uma das igrejas mais antigas em uso no mundo. A entrada, a Porta da Humildade, foi reduzida para ninguém entrar a cavalo. É Patrimônio Mundial da UNESCO.",
    passos: [["Porta da Humildade", "abaixe a cabeça para entrar."], ["Nave", "colunas antigas, mosaicos restaurados e, pelos alçapões no chão, o piso original."], ["Gruta da Natividade", "desça pela direita do altar até a estrela de prata de 14 pontas."], ["Gruta da Manjedoura", "ao lado da estrela."], ["Igreja de Santa Catarina", "a igreja católica ao lado, de onde sai a missa do Galo, com as grutas de São Jerônimo embaixo."]],
    foto: "A estrela de prata da gruta, sem flash.", saber: "Leve o passaporte: o posto de controle na volta para Jerusalém pede documento." },
  { id: "sacro-cafarnaum", img: "galileia", t: "Cafarnaum", dia: 4, tempo: "45 min",
    hist: "Cidade de pescadores na margem norte do Mar da Galileia, onde Jesus morou e pregou e onde chamou Pedro, André, Tiago e João. Restam as ruínas de uma sinagoga de pedra branca, construída séculos depois sobre outra mais antiga, de pedra escura. Sobre a casa que a tradição diz ser de Pedro foi construída uma igreja moderna, suspensa sobre as ruínas.",
    passos: [["Entrada", "com a estátua de São Pedro."], ["Casa de Pedro", "vista pelo piso de vidro da igreja moderna."], ["Sinagoga branca", "repare na base de pedra escura, da sinagoga mais antiga."], ["Jardim", "colunas, prensas de azeite e pedras com entalhes."], ["Margem do lago", "para um momento de silêncio."]],
    foto: "A sinagoga branca com o lago ao fundo.", saber: "Ombros e joelhos cobertos são conferidos na entrada. Há uma taxa pequena." },
  { id: "sacro-jordao", img: "galileia", t: "Rio Jordão, em Yardenit", dia: 4, tempo: "45 min, ou 1h30 com renovação do batismo",
    hist: "Yardenit fica onde o Jordão sai do Mar da Galileia e foi preparado para receber peregrinos que querem renovar o batismo. A tradição põe o batismo de Jesus mais ao sul, em Qasr al-Yahud, perto de Jericó, mas Yardenit tem estrutura para visitantes e fica no caminho da Galileia. Na entrada, o texto de Marcos 1:9-11 aparece em dezenas de línguas.",
    passos: [["Painéis de Marcos 1", "procure o texto em português."], ["Vestiário", "aluguel de túnica branca e toalha."], ["Descida ao rio", "escadas com corrimão, em grupo ou com o seu pastor."], ["Loja e café", "na saída, com água do Jordão engarrafada."]],
    foto: "O painel em português, ou o grupo de branco dentro do rio.", saber: "A túnica é cobrada à parte. Leve roupa de baixo seca e uma sacola para a roupa molhada." }
];

const LEITURAS = [
  ["Salmo 122", "Salmo 84", "Com que expectativa você chega a Jerusalém?"], ["João 19", "Isaías 53", "O que o caminho da cruz diz sobre a sua vida hoje?"],
  ["Mateus 26:36-46", "Lucas 19:41-44", "Que pedido você deixaria no Getsêmani?"], ["Mateus 5:1-12", "Lucas 5:1-11", "Qual bem-aventurança mais falou com você?"],
  ["Lucas 2:1-20", "Miqueias 5:2", "O que significa recomeçar, como num nascimento?"], ["João 20:1-18", "Lucas 24:1-12", "Onde você viu esperança nesta viagem?"],
  ["Salmo 121", "Mateus 28:16-20", "O que você leva de volta para casa?"]
];

const CARIMBOS = ["Muro das Lamentações", "Santo Sepulcro", "Via Dolorosa", "Gruta do Leite", "Monte das Oliveiras", "Dominus Flevit",
  "Getsêmani", "Cenáculo", "Monte das Bem-Aventuranças", "Tabgha", "Cafarnaum", "Yardenit", "Basílica da Natividade",
  "Campo dos Pastores", "Jardim do Túmulo", "Igreja de Santa Catarina"];

// Gasto em dinheiro vivo sugerido por dia (por pessoa) e onde economizar.
const DINHEIRO = [
  ["₪ 100", "Rav-Kav no aeroporto em vez de táxi"], ["₪ 80", "Almoço nas ruas laterais, longe das portas"], ["₪ 80", "Gett para subir o monte, a pé na descida"],
  ["₪ 100", "Excursão em grupo em vez de guia particular"], ["₪ 120", "Ônibus árabe em vez de táxi até Belém"], ["₪ 120", "Jantar do Shabat comprado no mercado"],
  ["₪ 80", "Trem para o aeroporto quando não for sábado"]
];

export function paginasMais({ head, foot, ic, cl, V, brl, gastoDia, DAYS, B }) {
  const P = {};
  const sec = (rotulo, kick, titulo, corpo, sub) => '<section class="page">' + head(rotulo) + '<div class="in"><div><span class="kick">' + kick + '</span><h2 class="t" style="margin-top:2mm">' + titulo + "</h2>" + (sub ? '<p class="mut" style="margin-top:2mm">' + sub + "</p>" : "") + "</div>" + corpo + "</div>" + foot() + "</section>";
  const porQuem = V.dias ? "para " + (V.pessoas > 1 ? V.pessoas + " pessoas" : "1 pessoa") : "por pessoa";

  P.ficha = sec("Antes de embarcar", "Primeira página do aeroporto", "Ficha da viagem",
    '<div class="ficha">' + ficha.map(f => "<div><b>" + f[0] + "<small>" + f[1] + "</small></b><span></span></div>").join("") + "</div>" +
    '<div class="warnbox"><b>Dica</b><br>Preencha a lápis antes de sair de casa e tire uma foto desta página. Se perder o celular, a ficha continua no papel.</div>',
    "Preencha com os dados da sua viagem. É a página que você abre no balcão da companhia e no hotel.");

  P.ficar = sec("Pré-viagem", "Onde ficar", "Três bairros, três jeitos de viajar",
    '<div class="bairros">' + bairros.map(b => '<div class="bairro"><h3>' + b.n + '</h3><div><em>A favor</em><ul>' + b.pro.map(x => "<li>" + x + "</li>").join("") + '</ul></div><div><em>Contra</em><ul>' + b.contra.map(x => "<li>" + x + "</li>").join("") + '</ul></div><p class="quem">' + b.quem + "</p></div>").join("") + "</div>" +
    '<div class="estilos"><div><small>Econômico</small><b>R$ 400 a 700</b><small>diária do quarto duplo</small></div><div><small>Confortável</small><b>R$ 800 a 1.400</b><small>diária do quarto duplo</small></div><div><small>Premium</small><b>R$ 2.000 ou mais</b><small>diária do quarto duplo</small></div></div>' +
    '<p class="mut" style="font-size:8.5pt">Valores de referência. Os preços sobem muito na Páscoa, no Natal e nas festas judaicas de setembro e outubro.</p>');

  P.locomover = sec("Pré-viagem", "Como se locomover", "Do aeroporto ao hotel, e pela cidade",
    '<table class="tb"><thead><tr><th>Do aeroporto Ben Gurion</th><th>Tempo</th><th>Preço</th><th>No Shabat</th></tr></thead><tbody>' +
    [["Trem até a estação Yitzhak Navon", "cerca de 25 min", "cerca de ₪ 20", "Não funciona"], ["Táxi compartilhado (sherut)", "cerca de 1h, deixa no hotel", "cerca de ₪ 70 por pessoa", "Confirme antes"],
      ["Táxi comum", "45 a 60 min", "cerca de ₪ 300 o carro", "Funciona, mais caro"], ["Transfer reservado", "45 a 60 min", "₪ 350 a 450 o carro", "Funciona"]]
      .map(r => "<tr><td><b>" + r[0] + "</b></td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td></tr>").join("") + "</tbody></table>" +
    '<div class="cards"><div class="card"><h3>' + ic("coin") + 'Cartão Rav-Kav</h3><ul><li>Vale para trem, VLT e ônibus israelenses.</li><li>Compre e recarregue nas máquinas das estações.</li><li>Pague a passagem ao entrar e guarde o cartão até sair.</li></ul></div>' +
    '<div class="card"><h3>VLT (linha vermelha)</h3><ul><li>Passa pela rua Jaffa, pelo Mahane Yehuda e pelo Portão de Damasco.</li><li>É o jeito mais fácil de ir do centro à Cidade Antiga.</li></ul></div>' +
    '<div class="card"><h3>Ônibus árabes</h3><ul><li>Saem do Portão de Damasco, inclusive para Belém (linha 231).</li><li>Funcionam no Shabat.</li><li>Pague em dinheiro, em shekel.</li></ul></div>' +
    '<div class="card"><h3>Táxi por aplicativo</h3><ul><li>Use o Gett para pagar o preço do taxímetro.</li><li>No Shabat e à noite a tarifa sobe.</li></ul></div></div>' +
    '<div class="warnbox"><b>O que para no Shabat</b><br>Do fim da tarde de sexta até a noite de sábado param trem, VLT e ônibus israelenses. Ônibus árabes, táxis e transfers continuam.</div>');

  P.horarios = sec("Pré-viagem", "Para não dar com a porta fechada", "Horários e dias fechados",
    '<table class="tb"><thead><tr><th>Lugar</th><th>Quando abre</th><th>Fecha</th><th>Entrada</th><th>Reserva</th></tr></thead><tbody>' +
    horarios.map(r => "<tr><td><b>" + r[0] + "</b></td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td><td>" + r[4] + "</td></tr>").join("") + "</tbody></table>" +
    '<div class="warnbox"><b>Confira na semana da viagem</b><br>Horários mudam com a estação, as festas religiosas e a situação de segurança. Igrejas costumam fechar entre o meio-dia e o meio da tarde.</div>');

  const somaDias = V.dias ? V.dias.reduce((a, b) => a + b, 0) : null;
  P.orcamento = sec("Na viagem", "O nosso diferencial", "Orçamento dia a dia",
    '<table class="tb"><thead><tr><th>Dia</th><th>Previsto ' + porQuem + '</th><th>Gasto real</th><th>Dinheiro vivo</th><th>Onde economizar</th></tr></thead><tbody>' +
    DAYS.map((d, i) => "<tr><td><b>Dia " + (i + 1) + "</b><small>" + d.t + "</small></td><td>" + d.gasto + '</td><td class="vazio"></td><td>' + DINHEIRO[i][0] + "</td><td>" + DINHEIRO[i][1] + "</td></tr>").join("") +
    "<tr><td><b>Total</b></td><td><b>" + (somaDias !== null ? brl(somaDias) : "R$ 1.585") + '</b></td><td class="vazio"></td><td></td><td></td></tr></tbody></table>' +
    (somaDias !== null && V.comidaPasseios !== null && V.transporte !== null && V.comidaPasseios + V.transporte - somaDias > 0
      ? '<p class="mut" style="font-size:8.5pt">Os dias somam comida, passeios e transporte dentro da cidade. No resumo, comida, passeios e transporte dão ' + brl(V.comidaPasseios + V.transporte) + ': os outros ' + brl(V.comidaPasseios + V.transporte - somaDias) + " ficam fora dos dias, como o traslado do aeroporto, o seguro e as taxas.</p>" : "") +
    (V.sobra !== null ? '<div class="money" style="grid-template-columns:1fr auto;align-items:center"><span>Mesmo seguindo o roteiro, você ainda tem de sobra</span><span class="big">' + brl(V.sobra) + "</span></div>"
      : '<div class="warnbox"><b>Como usar</b><br>Anote o gasto real no fim de cada dia. Se um dia passar do previsto, compense nos dias seguintes com as dicas da última coluna.</div>') +
    '<p class="mut" style="font-size:8.5pt">Dinheiro vivo por pessoa, para mercado, ônibus árabe e gorjetas. O resto dá para pagar no cartão.</p>');

  P.comida = sec("Na viagem", "Para provar", "Comida típica",
    '<div class="pratos">' + pratos.map(p => '<div class="prato"><b>' + p[0] + "</b><p>" + p[1] + "</p><small>" + p[2] + "</small></div>").join("") + "</div>" +
    '<div class="cards"><div class="card"><h3>Kosher</h3><ul><li>Carne e leite não se misturam no mesmo prato nem na mesma refeição.</li><li>A maioria dos restaurantes kosher fecha do fim da tarde de sexta à noite de sábado.</li></ul></div>' +
    '<div class="card"><h3>Halal</h3><ul><li>Restaurantes do Bairro Muçulmano e de Jerusalém Oriental abrem na sexta e no sábado.</li><li>Quase nunca servem bebida alcoólica.</li></ul></div></div>');

  P.golpes = sec("Na viagem", "Para viajar tranquilo", "Cuidados e golpes comuns",
    '<div class="cards">' + golpes.map(g => '<div class="card"><h3>' + g[0] + "</h3><p>" + g[1] + "</p></div>").join("") + "</div>" +
    '<div class="card"><h3>' + ic("shield") + 'Se perder o passaporte</h3><ul><li>Registre a ocorrência na polícia (100) e peça o comprovante.</li><li>Ligue para o plantão consular da embaixada (página de emergência).</li><li>Peça a Autorização de Retorno ao Brasil (ARB), que substitui o passaporte na volta. Leve uma cópia do passaporte e uma foto 3x4 na mala.</li></ul></div>' +
    '<div class="warnbox"><b>À noite</b><br>Depois que as lojas fecham, os becos do Bairro Muçulmano ficam vazios: volte pelas ruas principais. Evite manifestações e aglomerações e acompanhe os avisos do Itamaraty.</div>');

  P.historia = sec("Para entender", "3.000 anos em uma página", "Linha do tempo de Jerusalém",
    '<div class="linha">' + linha.map(l => "<div><b>" + l[0] + "</b>" + l[1] + "</div>").join("") + "</div>");

  P.sacros = SACROS.map((s, i) => '<section class="page sacro"><div class="dayhead" style="background-image:url(' + B + s.img + '.jpg)">' + head("Lugar sagrado " + (i + 1) + " de 6", true) + '<div class="tt"><small>Dia ' + s.dia + " do roteiro · reserve " + s.tempo + "</small><h2>" + s.t + "</h2></div></div>" +
    '<div class="in" style="padding-top:5mm;gap:4.5mm"><div><span class="kick">A história em poucas linhas</span><p class="hist" style="margin-top:2mm">' + s.hist + "</p></div>" +
    '<div><span class="kick">O que ver, nesta ordem</span><ol class="passos" style="margin-top:2mm">' + s.passos.map(p => "<li><b>" + p[0] + ":</b> " + p[1] + "</li>").join("") + "</ol></div>" +
    '<div class="trio"><div><b>A foto</b>' + s.foto + "</div><div><b>Tempo</b>Reserve " + s.tempo + ".</div><div><b>Bom saber</b>" + s.saber + "</div></div>" +
    '<span class="kick" style="color:var(--mut)">Anotações</span><div class="notes" style="margin-bottom:0;min-height:14mm"></div></div>' + foot() + "</section>");

  P.leituras = sec("Peregrinação", "Uma leitura para cada dia", "Leituras da peregrinação",
    '<table class="tb"><thead><tr><th>Dia</th><th>Leitura</th><th>Para completar</th><th>Para refletir</th></tr></thead><tbody>' +
    LEITURAS.map((l, i) => "<tr><td><b>Dia " + (i + 1) + "</b><small>" + DAYS[i].t + "</small></td><td><b>" + l[0] + "</b></td><td>" + l[1] + "</td><td>" + l[2] + '<div class="notes" style="min-height:9mm;margin:1.5mm 0 0"></div></td></tr>').join("") + "</tbody></table>" +
    '<p class="mut" style="font-size:8.5pt">Leve a sua Bíblia ou um aplicativo e leia o texto no próprio lugar, antes de entrar.</p>',
    "Leia no lugar do dia, em silêncio, e escreva uma linha de oração ou reflexão.");

  P.passaporte = sec("Peregrinação", "Para guardar de lembrança", "Passaporte do peregrino",
    '<div class="carimbos">' + CARIMBOS.map(c => "<div><b>" + c + "</b><small>Data: ____/____</small></div>").join("") + "</div>",
    "Muitos santuários têm carimbo na sacristia ou na loja. Peça e guarde a data de cada visita.");

  P.fotos = sec("Na viagem", "Dez fotos para não esquecer", "Fotos que você não pode deixar de tirar",
    '<table class="tb"><thead><tr><th></th><th>Onde</th><th>Melhor horário</th><th>Dia do roteiro</th></tr></thead><tbody>' +
    fotos.map((f, i) => "<tr><td>☐</td><td><b>" + (i + 1) + ". " + f[0] + "</b></td><td>" + f[1] + "</td><td>Dia " + f[2] + "</td></tr>").join("") + "</tbody></table>" +
    '<div class="warnbox"><b>Respeito</b><br>Pergunte antes de fotografar pessoas rezando e guarde o celular no Muro durante o Shabat.</div>');

  // Passeios extras: a sobra do orçamento da simulação, quando existe, mostra quanto cada um usa.
  const usa = (min, max) => {
    if (V.sobra === null || !(V.sobra > 0)) return "";
    const custo = ((min + max) / 2) * (V.dias ? V.pessoas : 1);
    return '<div class="row" style="color:var(--gold)"><span>Usa da sua sobra de ' + brl(V.sobra) + "</span><b>cerca de " + Math.min(100, Math.round((custo / V.sobra) * 100)) + "%</b></div>";
  };
  const extra = (t, o, preco, min, max, itens, dica) => '<div class="card"><h3>' + t + "</h3><p>" + o + "</p><ul>" + itens.map(x => "<li>" + x + "</li>").join("") + '</ul><div class="money" style="margin-top:2mm"><div class="row" style="border:0;padding:0"><span>Custo por pessoa</span><b>' + preco + "</b></div>" + usa(min, max) + '</div><p class="mut" style="font-size:8.5pt">' + dica + "</p></div>";
  P.extras1 = sec("Se sobrar tempo ou dinheiro", "Um dia a mais", "Mar Morto e Massada",
    extra("Mar Morto e Massada", "O passeio extra mais pedido de Jerusalém: a fortaleza de Herodes no alto do deserto e o ponto mais baixo da Terra.", "R$ 600 a 900", 600, 900,
      ["Massada: suba de teleférico ou, para ver o nascer do sol, pela Trilha da Serpente.", "Mar Morto: flutue nas praias de Ein Bokek, com chuveiro e vestiário.", "Muitas excursões param também em Qumran, onde acharam os Manuscritos do Mar Morto."],
      "Saída de madrugada, volta no fim da tarde. Leve chinelo e não molhe os olhos: a água arde muito.") +
    '<div class="warnbox"><b>Quando encaixar</b><br>Troque pelo dia 7 se o voo for à noite, ou acrescente um dia antes da volta. Não vá no sábado: as excursões em grupo são mais raras.</div>');
  P.extras2 = sec("Se sobrar tempo ou dinheiro", "Mais duas ideias", "Tel Aviv, Jaffa e Ein Karem",
    '<div class="cards">' +
    extra("Tel Aviv e Jaffa", "Praia, a cidade antiga de Jaffa e o porto onde Pedro teve a visão de Atos 10.", "R$ 150 a 300", 150, 300,
      ["Trem da estação Yitzhak Navon, cerca de 40 minutos.", "Jaffa antiga e o porto pela manhã.", "Mercado Carmel e praia à tarde."], "Bom para um dia mais leve, sem igreja.") +
    extra("Ein Karem", "A vila nas colinas onde a tradição situa o nascimento de João Batista e a visita de Maria a Isabel.", "R$ 50 a 100", 50, 100,
      ["VLT até o Monte Herzl e depois táxi curto.", "Igreja da Visitação, com o Magnificat em dezenas de línguas.", "Igreja de São João Batista."], "Cabe numa tarde livre.") +
    "</div>");

  P.cartao = sec("Na viagem", "Mostre ao taxista", "Cartão para mostrar",
    '<div class="taxi"><p class="mut">Por favor, me leve para:</p><p class="he dir" lang="he">בבקשה, תיקח אותי ל…</p><p class="ar dir" lang="ar">من فضلك، خذني إلى…</p><div class="end"></div><p class="mut">Nome e endereço do hotel</p><div class="end"></div></div>' +
    '<table class="tb"><thead><tr><th>Lugar</th><th>Hebraico</th><th>Árabe</th></tr></thead><tbody>' +
    lugaresTaxi.map(l => "<tr><td><b>" + l[0] + '</b></td><td class="dir" lang="he" style="font-size:12pt">' + l[1] + '</td><td class="dir" lang="ar" style="font-size:12pt">' + l[2] + "</td></tr>").join("") + "</tbody></table>",
    "Escreva o endereço do hotel no espaço e mostre esta página ao taxista ou a quem for pedir informação.");

  P.frases = frases;

  P.diario = sec("Para lembrar", "Uma página para depois", "Diário da viagem",
    '<div class="diario">' + DAYS.map((d, i) => "<div><b>Dia " + (i + 1) + "</b><div><p>O melhor momento do dia · o que eu comi · uma pessoa que conheci</p><div class=\"ln\"></div></div></div>").join("") + "</div>");

  return P;
}

export const RELIGIOSAS = ["sacros", "leituras", "passaporte"];
