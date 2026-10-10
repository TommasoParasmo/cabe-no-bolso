// Página de oferta por destino: dados de cada destino, calculadora (mesmo cálculo do app, /api/veredito) e a oferta
// do Roteiro Detalhado + Pré-viagem. O botão de compra leva a /comprar/?destino=<slug> com a simulação em sessionStorage.
import { ORIGENS } from "/lib/dados.js";

export const DEST={
jerusalem:{nome:'Jerusalém',paginas:38,thumbs:5,sph:'Uma amostra do que vem nas 38 páginas',
  spoilers:[['sp1','Dia 2 de 7','Cada dia com horário, QR code do mapa e segurança da área','"Comece perto do Portão dos Leões e siga as 14 estações. Cedo, as ruas estão vazias."'],
    ['sp2','O nosso diferencial','Orçamento dia a dia, com onde economizar','Quanto gastar em cada dia, quanto levar em dinheiro vivo e quanto ainda sobra do seu orçamento.'],
    ['sp3','Lugar sagrado 1 de 6','Guia do Santo Sepulcro, na ordem certa','"Dentro da Edícula se fica menos de um minuto. Vá antes das 8h ou no fim da tarde."'],
    ['sp4','Para guardar de lembrança','Passaporte do peregrino','Um espaço para o carimbo e a data de cada santuário, do Muro à Basílica da Natividade.'],
    ['sp5','Mostre ao taxista','Cartão em hebraico e árabe','"Por favor, me leve para…" e os principais lugares escritos nas duas línguas.'],
    ['sp6','Para viajar tranquilo','Cuidados e golpes comuns','"Alguém se oferece para mostrar a igreja e cobra caro no fim. Agradeça e siga."']],
  sumario:['Onde ficar','Como se locomover','Horários e dias fechados','Linha do tempo de 3.000 anos','Leituras da peregrinação','Comida típica','10 fotos para não esquecer','Mar Morto e Massada','Tel Aviv, Jaffa e Ein Karem','Diário da viagem'],
  checks:['Os 7 dias, com horários, QR code do mapa e segurança da área','Guia de 6 lugares sagrados: história e o que ver, na ordem','Orçamento dia a dia e onde economizar','Onde ficar, como se locomover e o que fecha no Shabat','Leituras bíblicas e passaporte do peregrino','Cuidados e golpes comuns, comida típica e cartão para o taxista','Empresas de guia mais conhecidas e passeios extras, como Mar Morto e Massada'],
  art:'Jerusalém já está escolhida',img:'jer',api:'Jerusalém',mesPadrao:'2027-03',capa:'capa',pos:'center 40%',
  kick:'Terra Santa · 7 dias',anc:'Há caravanas para a Terra Santa a partir de R$ 9 mil. O roteiro é o companheiro da viagem, também para quem vai com a igreja: entenda cada lugar e aproveite o tempo livre em Jerusalém.',h1:'Caminhe onde Jesus caminhou. Descubra se Jerusalém cabe no seu bolso.',
  lead:'Coloque quanto você tem e quantas pessoas vão. A gente acha os 7 dias mais baratos do mês e mostra, em reais, se a viagem fecha.',
  proof:[['7 dias','Jerusalém, Belém e Galileia'],['Em reais','voo, hotel e dia a dia'],['Na hora','sem cadastro para simular']],
  orc:28000,quick:[20000,25000,28000,35000],pes:2,
  painh:'O sonho é antigo. O que trava é o medo de não dar conta.',
  pains:[['"Excursão é cara demais."','Pacotes em grupo costumam custar bem mais do que a viagem por conta própria.','Você vê o preço real e paga direto, sem intermediário.'],
    ['"Tenho medo de estourar o orçamento."','Shekel, taxas, comida, ônibus. Fica difícil saber quanto vai gastar lá.','O roteiro mostra o gasto previsto de cada dia, em reais.'],
    ['"Não sei por onde começar."','Documentos, entrada no país, o que abre no sábado, o que vestir nos lugares sagrados.','O Pré-viagem resolve tudo isso em uma lista só.'],
    ['"Será que é seguro?"','Ninguém quer descobrir na hora que entrou na rua errada.','Cada dia traz a segurança da área e os cuidados do bairro.']],
  roth:'7 dias nos lugares que você leu a vida inteira',
  days:[['muro','Cidade Antiga e Muro das Lamentações','Chegada, primeira caminhada e o Muro ao entardecer.'],
    ['sepulcro','Via Dolorosa e Santo Sepulcro','As 14 estações, cedo, antes das filas.'],
    ['getsemani','Monte das Oliveiras e Getsêmani','A vista mais bonita da cidade e as oliveiras antigas.'],
    ['galileia','Mar da Galileia','Como ir e voltar no mesmo dia gastando pouco.'],
    ['belem','Belém','Basílica da Natividade e o caminho de ida.'],
    ['mercado','Mercado e Jardim do Túmulo','Comer bem e barato antes do Shabat.']],
  more:['Dia 7: manhã livre e volta','Horários reais de cada lugar','Gasto previsto por dia'],
  pics:[['galileia','Mar da Galileia ao pôr do sol'],['mercado','Padaria no mercado Mahane Yehuda']],
  pre:['Passaporte e entrada no país','Seguro viagem: o que exigir','Câmbio: shekel, cartão e Pix','O que vestir nos lugares sagrados','O que fecha no Shabat','Checklist de 30 dias antes','Lista de mala','Onde ver os avisos oficiais'],
  faq:[['É seguro ir para Jerusalém agora?','Antes de comprar a passagem, confira os avisos do Itamaraty para Israel. No Pré-viagem mostramos onde acompanhar, e cada dia do roteiro traz a segurança da área.'],
    ['Brasileiro precisa de visto?','Para turismo, não precisa de visto, mas é preciso fazer a autorização eletrônica de entrada antes de embarcar. O passo a passo está no Pré-viagem.'],
    ['Dá para ir em grupo, com a igreja ou a família?','Dá. A calculadora aceita até 9 pessoas e o roteiro funciona para grupos.']],
  erros:[['Barra você no embarque','Viajar sem a ETA-IL','A autorização eletrônica de Israel é pedida antes do voo, no site oficial, por 25 shekels. Sem ela, você não embarca.'],
    ['Erro comum','Fila do Santo Sepulcro no pico','A fila para o túmulo cresce ao longo da manhã. Antes das 8h ou no fim da tarde, ela é bem menor.'],
    ['Pode acontecer','Ficar na porta dos lugares sagrados','Ombros e joelhos são conferidos na entrada. Sem cobrir, não entra.'],
    ['Pode acontecer','Voltar no sábado sem transfer','No Shabat não tem trem para o aeroporto. Se a volta cair no sábado, o transfer precisa estar reservado.']],
  bonus:[['🧭','Guia dos 6 lugares sagrados','História e o que ver em cada um, na ordem certa, do Santo Sepulcro à Basílica da Natividade.',47],
    ['📖','Leituras da peregrinação','As passagens bíblicas de cada lugar, para ler onde tudo aconteceu.',27],
    ['🕊️','Passaporte do peregrino','Um espaço para o carimbo e a data de cada santuário, para guardar de lembrança.',27]],
  modular:'Vai ficar menos dias? Siga os 3 primeiros: eles já cobrem o Muro das Lamentações, a Via Dolorosa, o Santo Sepulcro e o Monte das Oliveiras.',
  barato:'O roteiro custa menos do que um almoço para dois em Jerusalém.',
  cred:'"Jerusalem-2013(2) View of the Dome of the Rock", "Western Wall at night (20063)", "Catholicon, Church of the Holy Sepulchre, Jerusalem1", "Old Olive trees in the Garden of Gethsemane, 10", "View of the Sea of Galilee", "Mercado Mahane Yehuda Jerusalén 2" (CC BY-SA 3.0/4.0) e "Interior of the Church of the Nativity, Bethlehem" (CC BY-SA 3.0)'},

orlando:{nome:'Orlando',paginas:37,thumbs:5,sph:'Uma amostra do que vem nas 37 páginas',
  spoilers:[['sp1','Dia 2 de 7','Cada dia com horários, QR code do mapa e segurança','"Chegue 1 hora antes da abertura e fotografe a placa da vaga."'],
    ['sp2','Para escolher sem errar','Qual parque para cada idade','Os parques comparados por idade, com o que vale para filhos até 6 anos e de 7 a 12.'],
    ['sp3','Para voltar sem susto','Compras e limite da Receita','"US$ 1.000 por pessoa, inclusive crianças, para o que vem na mala."'],
    ['sp4','Para dirigir sem susto','Carro, pedágio e cadeirinha','"Muitas praças não aceitam dinheiro: a placa é fotografada e cobrada depois."'],
    ['sp5','O nosso diferencial','Orçamento dia a dia, com onde economizar','Quanto gastar em cada dia, quanto levar em dólar e onde economizar.'],
    ['sp6','Para viajar tranquilo','Cuidados e golpes comuns','"Ingresso vendido na rua ou em grupo de rede social quase sempre é golpe."']],
  sumario:['Mapa de Orlando','Visto, dólar e clima','Onde ficar','Como se locomover','Linha do tempo de Orlando','Guia do Magic Kingdom','Kennedy Space Center','Comida típica','Parque aquático','Jacarés e LEGOLAND','Diário da viagem'],
  checks:['Os 7 dias, com horários, QR code do mapa e segurança da área','Guia de cada parque, na ordem certa para pegar menos fila','Qual parque para cada idade','Orçamento dia a dia e onde economizar','Carro, pedágio, cadeirinha e limite de compras da Receita','Cuidados e golpes comuns e frases úteis','Empresas de guia mais conhecidas e passeios extras, como parque aquático e LEGOLAND'],
  img:'orl',api:'Orlando',mesPadrao:'2027-05',capa:'roda',pos:'center 60%',
  kick:'Férias em família · 7 dias',anc:'Há guias de Orlando em PDF vendidos por R$ 97. Aqui são 37 páginas direto ao ponto, dizendo quando vale pagar a Lightning Lane.',h1:'A viagem que seus filhos vão lembrar para sempre. Será que cabe no seu bolso?',
  lead:'Coloque quanto a família tem e quantas pessoas vão. A gente acha os 7 dias mais baratos do mês e mostra, em reais, se Orlando fecha.',
  proof:[['7 dias','3 dias de parque, praia e NASA'],['Em reais','voo, hotel, comida e passeios'],['Na hora','sem cadastro para simular']],
  orc:55000,quick:[40000,50000,55000,70000],pes:4,
  painh:'Todo mundo quer levar os filhos. O que trava é a conta em dólar.',
  pains:[['"Orlando é só para rico."','Muita gente desiste sem nem fazer a conta de verdade.','Com as datas certas e hotel fora dos parques, sai bem mais barato do que parece.'],
    ['"Vou estourar o cartão em dólar."','Ingresso, comida no parque, carro, gasolina. A conta cresce sem a gente ver.','O roteiro mostra o gasto previsto de cada dia, em reais.'],
    ['"Não sei quais parques valem a pena."','São muitos parques e ingressos caros. Errar a escolha custa caro.','Escolhemos os parques pela idade das crianças e pela verba.'],
    ['"Fila e calor com criança pequena."','Ninguém quer passar o dia em fila com criança chorando.','Cada dia traz a ordem certa das atrações e a hora de parar.']],
  roth:'7 dias de parque, praia e foguete, sem correria',
  days:[['roda','International Drive e roda-gigante','Chegada, compras do básico e a cidade iluminada à noite.'],
    ['parque2','Islands of Adventure','A ordem certa das atrações para pegar menos fila.'],
    ['capa','Universal Studios e Hogsmeade','Os brinquedos para cada idade e onde comer gastando menos.'],
    ['nasa','Kennedy Space Center','Foguetes de verdade e como chegar de carro.'],
    ['praia','Cocoa Beach','Um dia de praia para descansar dos parques.'],
    ['lago','Lake Eola e outlets','Passeio leve e compras com o limite da Receita na cabeça.']],
  more:['Dia 7: Magic Kingdom e volta','Horário de abertura de cada parque','Gasto previsto por dia'],
  pics:[['praia','Pier de Cocoa Beach'],['nasa','Foguete no Kennedy Space Center']],
  pre:['Visto americano: passo a passo e prazos','Seguro viagem nos EUA','Dólar: cartão, conta global e espécie','Aluguel de carro e cadeirinha','Ingressos: quando e onde comprar','Limite de compras da Receita','Checklist de 90 dias antes','Mala para crianças'],
  faq:[['Preciso de visto?','Sim. Brasileiro precisa de visto americano, e a entrevista pode demorar meses. O Pré-viagem mostra o passo a passo e quando começar.'],
    ['Dá para ir com criança pequena?','Dá. O roteiro escolhe os parques e as atrações pela idade das crianças e deixa pausas no meio do dia.'],
    ['Vale alugar carro?','Para família, quase sempre vale. A simulação já conta o carro e o Pré-viagem explica como alugar e o que levar.']],
  erros:[['Barra você no embarque','Deixar o visto para depois','A taxa é de cerca de US$ 185 por pessoa, e em São Paulo e no Rio a espera pela entrevista chega a 6 a 12 meses.'],
    ['Erro comum','Pagar estacionamento todo dia','A Disney cobra US$ 35 por dia e a Universal, cerca de US$ 32. Em uma semana de parques, a conta pesa.'],
    ['Pode acontecer','Pedágio sem dinheiro','Muitas praças não aceitam dinheiro: a placa é fotografada e a cobrança chega depois.'],
    ['Pode acontecer','Passar do limite da Receita','São US$ 1.000 por pessoa e não dá para juntar cotas: um produto de US$ 1.500 passa do limite.']],
  bonus:[['🎢','Guia de cada parque','A ordem certa das atrações para pegar menos fila e a altura mínima dos brinquedos.',47],
    ['👨‍👩‍👧','Qual parque para cada idade','Os parques comparados para filhos até 6 anos e de 7 a 12.',37],
    ['🚗','Carro, pedágio e cadeirinha','Como alugar, o que conferir na locadora e como funciona o pedágio sem dinheiro.',27]],
  modular:'Vai ficar menos dias? Siga os 3 primeiros: eles já cobrem a International Drive, o Islands of Adventure e o Universal Studios.',
  barato:'O roteiro custa menos do que um dia de estacionamento na Disney (US$ 35).',
  cred:'"Orlando Eye", "Kennedy Space Center, Rocket Garden, Power of Apollo" (CC BY-SA 4.0), "Lake Eola and Orlando Skyline seen in 2024" (CC BY 4.0), "A view of Universal Orlando Resort in May 2023" e "Cocoa Beach Pier from the beach 2023-05-19" (CC0)'},

chile:{nome:'Santiago do Chile',paginas:38,thumbs:5,sph:'Uma amostra do que vem nas 38 páginas',
  spoilers:[['sp1','Dia 2 de 7','Dia na neve, com horários e preços','"Por baixo da roupa alugada: segunda pele, blusa de lã e meia grossa. É isso que esquenta."'],
    ['sp2','Para quem nunca viu neve','Neve pela primeira vez','Os 4 centros de neve comparados: distância, para quem é e quanto custa o dia.'],
    ['sp3','O que alugar e o que levar','Roupa de neve: alugar ou levar','"Não compre roupa de neve no Brasil para usar um dia. Alugue lá."'],
    ['sp4','Quando ir','Clima e neve mês a mês','"A temporada vai de meados de junho ao fim de setembro. Julho e agosto têm mais chance de neve."'],
    ['sp5','O nosso diferencial','Orçamento dia a dia, com onde economizar','Quanto gastar em cada dia, quanto levar em pesos e onde economizar.'],
    ['sp6','Para viajar tranquilo','Cuidados e golpes comuns','"Troque dinheiro só dentro das casas de câmbio, contando no balcão."']],
  sumario:['Mapa de Santiago','Documentos, dinheiro e clima','Onde ficar','Como se locomover','Linha do tempo do Chile','Guia de Valparaíso','Vinícola Concha y Toro','Comida típica','Um dia em Valle Nevado','Isla Negra e Casablanca','Diário da viagem'],
  checks:['Os 7 dias, com horários, QR code do mapa e segurança da área','Dia na neve completo: centros, preços e como subir','Roupa de neve: o que alugar e o que levar','Clima e neve mês a mês','Orçamento dia a dia e onde economizar','Cuidados e golpes comuns e cartão para o taxista','Empresas de guia mais conhecidas e passeios extras, como Valle Nevado'],
  img:'chi',api:'Santiago',mesPadrao:'2027-08',mesesOk:[6,7,8,9],capa:'neve',pos:'center 55%',
  kick:'Neve pela primeira vez · 7 dias',anc:'Há guias de Santiago em PDF vendidos por R$ 79. Aqui são 38 páginas direto ao ponto, com o dia na neve planejado.',h1:'Ver neve pela primeira vez, a 4 horas de voo. Cabe no seu bolso?',
  lead:'Coloque quanto você tem e quantas pessoas vão. A gente acha os 7 dias mais baratos do mês e mostra, em reais, se a viagem fecha.',
  proof:[['7 dias','Santiago, neve, vinícola e litoral'],['Em reais','voo, hotel e passeios'],['Na hora','sem cadastro para simular']],
  orc:13000,quick:[8000,10000,13000,18000],pes:2,
  painh:'Todo mundo quer ver neve. O que trava é não saber como fazer.',
  pains:[['"Neve é longe e caro."','Parece coisa de Europa, mas a neve mais perto do Brasil fica a 4 horas de voo.','Você vê o preço real e paga direto, sem pacote.'],
    ['"Não sei que roupa levar."','Comprar roupa de neve para usar um dia não faz sentido.','O Pré-viagem mostra onde alugar roupa e bota lá mesmo.'],
    ['"Como chego na montanha?"','A estrada tem curvas e às vezes exige corrente no pneu.','O roteiro mostra as vans e transfers, com preço e horário.'],
    ['"Não sei quando tem neve."','Ir no mês errado é chegar e não ver neve nenhuma.','Mostramos os meses com mais chance de neve e os dias mais baratos.']],
  roth:'7 dias entre a cordilheira, o vinho e o mar',
  days:[['santiago','Santiago e o mirante Sky Costanera','Chegada e a cidade com a cordilheira nevada ao fundo.'],
    ['neve','Dia na neve em Farellones','Como subir, onde alugar roupa e o que fazer sem saber esquiar.'],
    ['yeso','Cajón del Maipo','Lagoa turquesa no meio dos Andes, com van saindo de Santiago.'],
    ['valpo','Valparaíso','As casas coloridas e os elevadores antigos.'],
    ['vina','Viña del Mar','Praia, relógio de flores e pôr do sol no Pacífico.'],
    ['vinho','Vinícola Concha y Toro, em Pirque','Degustação perto de Santiago, sem precisar de carro.']],
  more:['Dia 7: teleférico do San Cristóbal e volta','Horários reais de cada lugar','Gasto previsto por dia'],
  pics:[['yeso','Embalse El Yeso no Cajón del Maipo'],['valpo','Casas coloridas de Valparaíso']],
  pre:['RG ou passaporte: o que vale','Seguro viagem: o que exigir','Peso chileno, cartão e Pix','Onde alugar roupa de neve','Como subir para a neve','Clima: o que esperar em cada mês','Checklist de 30 dias antes','Lista de mala de inverno'],
  faq:[['Preciso de passaporte?','Não precisa. Brasileiro entra no Chile com RG em bom estado. O Pré-viagem explica quais documentos valem.'],
    ['Quando tem neve?','A temporada costuma ir de junho a setembro, com mais neve em julho e agosto. A calculadora só mostra esses meses.'],
    ['Preciso saber esquiar?','Não. Dá para brincar na neve, andar de trenó e tirar foto. Quem quiser pode fazer uma aula.']],
  erros:[['Erro comum','Comprar roupa de neve no Brasil','Para usar um dia, não compensa. Lá, roupa e bota saem cerca de CLP 20.000 a 30.000 por pessoa (R$ 100 a 155).'],
    ['Erro comum','Ir no mês errado','A neve vai de meados de junho ao fim de setembro. Fora disso, você chega e não vê neve.'],
    ['Pode acontecer','Alugar a roupa lá em cima','Em Farellones o aluguel é mais caro e tem fila. O certo é alugar em Santiago, antes de subir.'],
    ['Pode acontecer','Pagar 19% a mais no hotel','Hotel pago em dólar por estrangeiro pode sair sem o IVA de 19%. Vale perguntar na reserva.']],
  bonus:[['🏔️','Guia do dia na neve','Os 4 centros de neve comparados, como subir e quanto custa o dia.',47],
    ['🧥','Roupa de neve: alugar ou levar','O que alugar, o que levar por baixo e onde sai mais barato.',27],
    ['🍷','Guia de Valparaíso e da vinícola','As casas coloridas, os elevadores antigos e a degustação na Concha y Toro.',37]],
  modular:'Vai ficar menos dias? Siga os 3 primeiros: eles já cobrem Santiago, o dia na neve e o Cajón del Maipo.',
  barato:'O roteiro custa menos do que alugar uma roupa de neve (R$ 100 a 155).',
  cred:'"Pueblo de Farellones nevado", "Santiago en invierno desde el Cerro San Cristóbal", "Colorful Valparaiso houses" (CC BY-SA 4.0), "Playa Cochoa, Viña del Mar" (CC BY 4.0), "Vineyard, Concha y Toro, Chile" (CC BY-SA 3.0) e "Embalse el Yeso" (CC0)'},

'buenos-aires':{nome:'Buenos Aires',paginas:39,thumbs:5,sph:'Uma amostra do que vem nas 39 páginas',
  spoilers:[['sp1','Dia 3 de 7','Cada dia com horários, QR code do mapa e segurança','"Caminito é colorido e turístico. Fique nas ruas com movimento e saia antes de escurecer."'],
    ['sp2','Cartão, Pix, dólar ou real','Câmbio: como pagar','Cada forma de pagar comparada, com o que conferir na semana da viagem.'],
    ['sp3','Para não errar no pedido','Parrilla: como pedir','"Bife de chorizo: contrafilé alto e suculento. O corte mais pedido."'],
    ['sp4','Malbec e companhia','Vinho argentino: como pedir','Malbec, Torrontés e como pedir a taça ou a garrafa sem errar.'],
    ['sp5','O nosso diferencial','Orçamento dia a dia, com onde economizar','Quanto gastar em cada dia, quanto levar em pesos e onde economizar.'],
    ['sp6','Para viajar tranquilo','Cuidados e golpes comuns','"Na rua Florida, cambistas chamam o turista. O risco é nota falsa ou conta errada."']],
  sumario:['Mapa de Buenos Aires','Onde ficar','Como se locomover','Linha do tempo','Feira de San Telmo','Cemitério da Recoleta','Show de tango','Comida típica','Tigre e o Delta','Estância e futebol','Diário da viagem'],
  checks:['Os 7 dias, com horários, QR code do mapa e segurança da área','Câmbio: como pagar menos','Parrilla e vinho: como pedir sem errar','Guias de San Telmo, Caminito, Recoleta e Colonia','Orçamento dia a dia e onde economizar','Cuidados e golpes comuns e cartão para o taxista','Empresas de guia mais conhecidas e passeios extras, como Tigre'],
  img:'bue',api:'Buenos Aires',mesPadrao:'2027-03',capa:'capa',pos:'center 45%',
  kick:'Tango, vinho e parrilla · 7 dias',anc:'Há guias de Buenos Aires em PDF vendidos por R$ 79,90. Aqui são 39 páginas direto ao ponto, com câmbio e Pix explicados.',h1:'Buenos Aires em 7 dias, com o câmbio a seu favor. Cabe no seu bolso?',
  lead:'Coloque quanto você tem e quantas pessoas vão. A gente acha os 7 dias mais baratos do mês e mostra, em reais, se a viagem fecha.',
  proof:[['7 dias','Buenos Aires e Colonia, no Uruguai'],['Em reais','voo, hotel e dia a dia'],['Na hora','sem cadastro para simular']],
  orc:11000,quick:[7000,9000,11000,15000],pes:2,
  painh:'Está pertinho. O que trava é não entender o dinheiro de lá.',
  pains:[['"Com o peso mudando, não sei quanto vou gastar."','O preço muda de uma semana para outra e a conta fica uma incógnita.','O roteiro mostra o gasto previsto de cada dia, em reais.'],
    ['"Levo real, dólar ou cartão?"','Cada um fala uma coisa e ninguém quer perder dinheiro no câmbio.','O Pré-viagem explica qual pagamento vale mais a pena hoje.'],
    ['"Medo de cair em restaurante de turista."','Pagar caro por uma parrilla ruim estraga o dia.','Indicamos onde comer bem, com o preço médio de cada lugar.'],
    ['"Será que é seguro?"','Alguns bairros pedem mais cuidado, como La Boca à noite.','Cada dia traz a segurança da área e os cuidados do bairro.']],
  roth:'7 dias de tango, parrilla e ruas para caminhar',
  days:[['obelisco','Centro, Obelisco e Corrientes','Chegada, pizza portenha e o centro à noite.',1],
    ['capa','La Boca e Caminito','As casas coloridas, de dia e com os cuidados certos.',3],
    ['madero','Puerto Madero','Caminhada na beira do rio e parrilla para o jantar.',4],
    ['tango','Noite de tango','Como escolher o show certo sem pagar preço de turista.',5],
    ['colonia','Colonia del Sacramento','Bate e volta de barco para o Uruguai.',6],
    ['telmo','Feira de San Telmo e volta','A feira de domingo e o bairro mais antigo da cidade.',7]],
  more:['Dia 2: Recoleta e Palermo','Horários reais de cada lugar','Gasto previsto por dia'],
  pics:[['madero','Puente de la Mujer em Puerto Madero'],['colonia','Rua de pedra em Colonia del Sacramento']],
  pre:['RG ou passaporte: o que vale','Seguro viagem: o que exigir','Câmbio: cartão, Pix e dólar','Gorjeta e couvert: quanto deixar','Barco para Colonia: como comprar','Cartão SUBE para ônibus e metrô','Checklist de 30 dias antes','Lista de mala por estação'],
  faq:[['Preciso de passaporte?','Não precisa. Brasileiro entra na Argentina e no Uruguai com RG em bom estado. O Pré-viagem explica quais documentos valem.'],
    ['Vale levar real, dólar ou cartão?','Depende do câmbio do momento. O Pré-viagem mostra a forma mais vantajosa de pagar na época da sua viagem.'],
    ['Buenos Aires é segura?','É tranquila nos bairros turísticos, com os cuidados de qualquer cidade grande. Cada dia do roteiro traz a segurança da área.']],
  erros:[['Erro comum','Pagar em reais na maquininha','A conversão da maquininha sai mais cara. Recuse e pague sempre em pesos.'],
    ['Erro comum','Comprar o tango pelo hotel','Hotel e agência cobram comissão. Comprando no site do próprio show, sai mais barato.'],
    ['Pode acontecer','Trocar dinheiro com cambista','Na rua Florida, cambistas chamam o turista. O risco é nota falsa ou conta errada.'],
    ['Pode acontecer','Trazer pesos de volta','Trocar peso argentino no Brasil dá perda grande. Gaste o que sobrar na feira.']],
  bonus:[['💱','Guia do câmbio','Cartão, Pix, dólar ou real: como comparar na semana da viagem e pagar menos.',47],
    ['🥩','Parrilla e vinho: como pedir','Os cortes, o Malbec e como pedir a taça ou a garrafa sem errar.',27],
    ['⛴️','Guia de Colonia del Sacramento','Como comprar o barco e o que ver no bate e volta para o Uruguai.',37]],
  modular:'Vai ficar menos dias? Siga os 3 primeiros: eles já cobrem o centro, Recoleta, Palermo e o Caminito.',
  barato:'O roteiro custa menos do que um jantar para dois em Buenos Aires.',
  cred:'"Buenos Aires, La Boca, Caminito 200807i", "San Pedro Telmo (4729482264)" (CC BY 2.0), "Obelisco de Buenos Aires at sunset", "Puente de la Mujer, Puerto Madero" (CC BY-SA 4.0), "El Viejo Almacén de Buenos Aires" (CC BY-SA 2.0) e "Calle De Los Suspiros, Colonia del Sacramento" (CC BY-SA 3.0)'}
};

// Promoção: datas e preços vêm do servidor (POST /api/compra {acao:"preco"}); estes são só o valor inicial.
let promo={promocao:true,ate:'2026-11-01T00:00:00-03:00',pix:29.9,cartao:34.9};
const brl=n=>'R$ '+Number(n).toFixed(2).replace('.',',');
const restante=()=>promo.promocao?Math.max(0,Date.parse(promo.ate)-Date.now()):0;
function cdTxt(){const t=restante(),d=Math.floor(t/864e5),h=Math.floor(t/36e5)%24;return t?'Termina em '+(d?d+'d ':'')+h+'h':''}
function cdTick(){const t=restante(),z=n=>String(n).padStart(2,'0');
  if(!t&&promo.promocao){promo.promocao=false;mostrarPreco();return}
  const v=[Math.floor(t/864e5),Math.floor(t/36e5)%24,Math.floor(t/6e4)%60,Math.floor(t/1e3)%60];
  ['d','h','m','s'].forEach((k,i)=>{$('cd-'+k).textContent=z(v[i])});
  document.querySelectorAll('.t-cd').forEach(e=>{e.textContent=cdTxt().toLowerCase()});
  if(!$('result').dataset.ok)$('mbar-b').textContent=promo.promocao?cdTxt():'Roteiro + Pré-viagem';}
setInterval(cdTick,1000);
function mostrarPreco(){
  $('preco-pix').textContent=brl(promo.pix);$('preco-cartao').textContent=brl(promo.cartao)+' no cartão de crédito';
  document.querySelectorAll('.so-promo').forEach(e=>e.hidden=!promo.promocao);document.querySelectorAll('.so-normal').forEach(e=>e.hidden=promo.promocao);
  $('mbar-s').textContent=promo.promocao?'Promoção de outubro':'Oferta';
  if(!promo.promocao)$('mbar-b').textContent='Roteiro + Pré-viagem';
}
// Bônus que todo destino tem; os 3 primeiros de cada destino ficam em DEST[x].bonus.
const BONUS_COMUM=[['🧳','Pré-viagem','Tudo pronto antes de embarcar:',47,'pre'],
  ['💰','Orçamento dia a dia, em reais','Quanto gastar em cada dia, quanto levar em dinheiro vivo e onde economizar.',37],
  ['🛡️','Cuidados e golpes comuns','Os golpes mais comuns com turista e como evitar, com a segurança da área de cada dia.',27]];
const COMUM=[['Os preços da simulação são reais?','A passagem vem da busca dos nossos parceiros para as datas encontradas (ou de uma média, quando não há preço). Hotel, comida e passeios são médias que conferimos para cada cidade. É uma estimativa: os preços mudam todo dia.'],['Como recebo o roteiro?','Logo depois do pagamento, na própria página, em PDF com o seu nome na capa. Com o número do pedido e o e-mail, você baixa de novo em qualquer aparelho.'],['Funciona sem internet?','Sim. Baixe o PDF no celular e ele abre sem internet. Só os QR codes do mapa precisam de conexão.'],['Posso imprimir?','Pode. O PDF é em A4 e fica bom impresso.'],['E se os preços mudarem?','O roteiro mostra a data da última atualização, outubro de 2026. Os valores são estimativas em reais para o período escolhido.'],['E se eu não gostar?','Você tem 7 dias para pedir o dinheiro de volta, sem perguntas.']];

const $=id=>document.getElementById(id),fmt=n=>Math.round(n).toLocaleString('pt-BR');
const ck='<svg width="18" height="18"><use href="#check"/></svg>',lk='<svg width="14" height="14"><use href="#lock"/></svg>';
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
let D,slug,pessoas=2,simulacao=null,pedido=0;
function num(){return parseInt($('valor').value.replace(/\D/g,''))||0}
function setVal(n){$('valor').value=n?fmt(n):'';document.querySelectorAll('#quick button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===n)))}
function setP(n){pessoas=Math.max(1,Math.min(9,n));$('pessoas').textContent=pessoas}

// Os próximos 12 meses (a partir do mês que vem); o Chile só mostra os meses de neve.
function meses(){
  const h=new Date(),out=[];
  for(let i=1;i<=12;i++){const d=new Date(h.getFullYear(),h.getMonth()+i,1),m=d.getMonth()+1;
    if(D.mesesOk&&!D.mesesOk.includes(m))continue;
    const v=d.getFullYear()+'-'+String(m).padStart(2,'0');
    out.push([v,MESES[m-1][0].toUpperCase()+MESES[m-1].slice(1)+' '+d.getFullYear()]);}
  return out;
}

// /orlando, /chile... (ou /oferta/?destino=orlando).
function slugDaPagina(){
  const p=location.pathname.replace(/^\/|\/$|\.html$/g,'').replace(/^oferta\/?/,'');
  return DEST[p]?p:(new URLSearchParams(location.search).get('destino')||'');
}

function render(s){
  slug=DEST[s]?s:'jerusalem';D=DEST[slug];const im=f=>'/oferta/img/'+D.img+'/'+f+'.jpg';
  document.title=D.nome+': cabe no seu bolso? · Vai Dar Viagem';
  const h=$('hero');h.style.backgroundImage='url('+im(D.capa)+')';h.style.backgroundPosition=D.pos;
  $('kick').textContent=D.kick;$('h1').textContent=D.h1;$('anc').innerHTML=D.anc+' <b>Atualizado em outubro de 2026.</b>';$('lead').textContent=D.lead;
  $('proof').innerHTML=D.proof.map(p=>'<div><strong>'+p[0]+'</strong><span>'+p[1]+'</span></div>').join('');
  document.querySelectorAll('.t-nome').forEach(e=>e.textContent=D.nome);
  $('quick').innerHTML=D.quick.map(v=>'<button type="button" data-v="'+v+'">'+(v/1000)+' mil</button>').join('');setVal(D.orc);setP(D.pes);
  const ms=meses(),padrao=ms.some(m=>m[0]===D.mesPadrao)?D.mesPadrao:ms[0][0];
  $('mes').innerHTML=ms.map(m=>'<option value="'+m[0]+'"'+(m[0]===padrao?' selected':'')+'>'+m[1]+'</option>').join('');
  $('painh').textContent=D.painh;
  $('pains').innerHTML=D.pains.map(p=>'<div class="pain"><span class="q">'+p[0]+'</span><p>'+p[1]+'</p><span class="a">'+ck+p[2]+'</span></div>').join('');
  $('erros').innerHTML=D.erros.map(e=>'<div class="erro"><small>'+e[0]+'</small><b>'+e[1]+'</b><p>'+e[2]+'</p></div>').join('');
  $('modular').textContent='🧩 '+D.modular;$('barato').textContent=D.barato;
  const bs=D.bonus.concat(BONUS_COMUM),vl=v=>'<span class="vl"><s>De R$ '+v+'</s> por <em>R$ 0</em></span>',n=i=>'Bônus '+String(i+1).padStart(2,'0');
  $('bonus-cards').innerHTML=bs.map((b,i)=>'<div class="bn"><span class="ic">'+b[0]+'</span><small>'+n(i)+'</small><b>'+b[1]+'</b><p>'+b[2]+'</p>'+(b[4]?'<ul class="checks pre">'+D.pre.map(p=>'<li>'+ck+p+'</li>').join('')+'</ul>':'')+vl(b[3])+'</div>').join('');
  $('stack').innerHTML=bs.map((b,i)=>'<li><span>'+n(i)+': '+b[1]+'</span>'+vl(b[3])+'</li>').join('');
  $('roth').textContent=D.roth;
  $('days').innerHTML=D.days.map((d,i)=>'<div class="day'+(i>2?' lock':'')+'" style="background-image:url('+im(d[0])+')">'+(i>2?'<span class="lk">'+lk+'No roteiro completo</span>':'')+'<div><small>Dia '+(d[3]||i+1)+'</small><h3>'+d[1]+'</h3><p>'+d[2]+'</p></div></div>').join('');
  $('daysmore').innerHTML=D.more.map(m=>'<span>'+m+'</span>').join('');
  $('pics').innerHTML=D.pics.map(p=>'<img src="'+im(p[0])+'" alt="'+p[1]+'" loading="lazy">').join('');
  $('tr').innerHTML=Array.from({length:D.thumbs},(_,i)=>'<img src="/oferta/img/'+D.img+'/pdf'+(i+1)+'.jpg" alt="" loading="lazy">').join('');$('tp').textContent='PDF com '+D.paginas+' páginas, com o seu nome na capa';
  $('checks').innerHTML=D.checks.map(c=>'<li><svg width="20" height="20"><use href="#check"/></svg>'+c+'</li>').join('');
  $('sph').textContent=D.sph;
  $('spg').innerHTML=D.spoilers.map(x=>'<article class="sp"><div class="pg"><img src="/oferta/img/'+D.img+'/'+x[0]+'.jpg" alt="Página do roteiro: '+x[2]+'" loading="lazy"><span>Continua no PDF</span></div><div class="tx"><small>'+x[1]+'</small><b>'+x[2]+'</b><p>'+x[3]+'</p></div></article>').join('');
  $('sumario').innerHTML='<b>E mais <em>'+D.sumario.length+' seções</em> no PDF de '+D.paginas+' páginas</b><div>'+D.sumario.map(x=>'<span>'+x+'</span>').join('')+'</div>';
  $('faq').innerHTML=D.faq.concat(COMUM).map(f=>'<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>').join('');
  $('credits').textContent='Fotos: Wikimedia Commons. '+D.cred+'.';
  const comprar='/comprar/?destino='+slug;
  document.querySelectorAll('.buy').forEach(b=>{b.textContent='Quero meu roteiro de '+D.nome;b.href=comprar});
}

// "05/03 a 11/03" e, para o PDF, "05 a 11 de março de 2027".
const dm=iso=>iso.slice(8,10)+'/'+iso.slice(5,7);
function periodo(ida,volta){
  const [a,b]=[ida,volta].map(x=>new Date(x+'T12:00:00Z'));
  const dia=d=>String(d.getUTCDate()).padStart(2,'0'),mes=d=>MESES[d.getUTCMonth()];
  if(a.getUTCMonth()===b.getUTCMonth())return dia(a)+' a '+dia(b)+' de '+mes(b)+' de '+b.getUTCFullYear();
  return dia(a)+' de '+mes(a)+(a.getUTCFullYear()!==b.getUTCFullYear()?' de '+a.getUTCFullYear():'')+' a '+dia(b)+' de '+mes(b)+' de '+b.getUTCFullYear();
}

async function calc(){
  const btn=$('form').querySelector('button[type=submit]'),meu=++pedido,org=$('origem').value;
  btn.disabled=true;btn.textContent='Calculando…';$('ferro').hidden=true;
  try{
    const r=await fetch('/api/veredito',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({orcamento:num(),origem:org,destino:D.api,flexivel:{mes:$('mes').value,noites:6},pessoas,estilo:1})});
    const v=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(v.erro||'Algo falhou ao calcular. Tente de novo.');
    if(meu===pedido)mostrar(v,org);
  }catch(e){if(meu===pedido){$('ferro').textContent=e.message;$('ferro').hidden=false}}
  finally{if(meu===pedido){btn.disabled=false;btn.textContent='Ver se cabe no meu bolso'}}
}

function mostrar(v,org){
  const a=v.atual,total=a.total,sobra=a.diff,ok=a.estado!=='nao_cabe';
  const ida=a.ida||v.entrada.ida,volta=a.volta||v.entrada.volta;
  const val=c=>a.itens.filter(i=>c.test(i.categoria)).reduce((s,i)=>s+i.valor,0);
  const passagens=val(/^Passagem|^Ônibus/),hotel=val(/^Hospedagem/),comida=val(/^Alimenta|^Passeio/),transp=total-passagens-hotel-comida;
  $('pill').className='pill '+(ok?'ok':'no');$('pill').textContent=a.estado==='cabe'?'Cabe no seu bolso':a.estado==='apertado'?'Cabe, mas apertado':'Ainda não cabe';
  $('vtitle').textContent=ok?(sobra>0?'Dá para ir e ainda sobram R$ '+fmt(sobra):'Dá para ir, no limite do orçamento'):'Faltam R$ '+fmt(-sobra)+' para fechar a viagem';
  $('vctx').textContent=pessoas+(pessoas>1?' pessoas':' pessoa')+', saindo de '+org+', 7 dias em '+D.nome+'. Custo total estimado: R$ '+fmt(total)+'.'+(ok?'':' Guardando R$ '+fmt(Math.ceil(-sobra/6/50)*50)+' por mês, dá em 6 meses.');
  $('vdates').textContent=dm(ida)+' a '+dm(volta);
  $('vmes').textContent=a.fonteVoo==='estimativa'?'Passagem pela média do mês':'Passagem pelo preço dos parceiros';
  const parts=[['Passagens',passagens,'#0D3532'],['Hotel, 6 noites',hotel,'#0E6E6A'],['Comida e passeios',comida,'#E2B23F'],['Transporte local',transp,'#9BB5B2']].filter(p=>p[1]>0);
  $('bar').innerHTML=parts.map(p=>'<span style="width:'+(p[1]/total*100)+'%;background:'+p[2]+'"></span>').join('');
  $('rows').innerHTML=parts.map(p=>'<div class="rw"><small><i style="background:'+p[2]+'"></i>'+p[0]+'</small><b class="num">R$ '+fmt(p[1])+'</b></div>').join('');
  // O checkout lê isto para montar o PDF com os valores da pessoa (ver o topo de /comprar/comprar.js).
  simulacao={destino:slug,valores:{periodo:periodo(ida,volta),inicio:ida,pessoas,noites:6,passagens,hotel,comidaPasseios:comida,transporte:transp,total,...(sobra>=0?{sobra}:{})}};
  try{sessionStorage.setItem('vdv:simulacao',JSON.stringify(simulacao))}catch{}
  const r=$('result');r.hidden=false;r.dataset.ok='1';r.scrollIntoView({block:'start'});
  $('mbar-s').textContent=promo.promocao?'Promoção por tempo limitado 🔥':'Simulação pronta';
  $('mbar-b').textContent='Quero me preparar para a viagem';
  $('mbar-a').textContent='Quero o roteiro';$('mbar-a').setAttribute('href','#oferta');
}

$('quick').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setVal(+b.dataset.v)});
$('valor').addEventListener('input',()=>setVal(num()));
$('menos').onclick=()=>setP(pessoas-1);$('mais').onclick=()=>setP(pessoas+1);
$('form').addEventListener('submit',e=>{e.preventDefault();calc()});
document.addEventListener('click',e=>{const a=e.target.closest('[data-scroll]');if(a){e.preventDefault();$(a.getAttribute('href').slice(1)).scrollIntoView({block:'start'})}});
$('origem').innerHTML=ORIGENS.map(o=>'<option>'+o.n+'</option>').join('');
render(slugDaPagina());cdTick();mostrarPreco();
fetch('/api/compra',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({acao:'preco',destino:slug})})
  .then(r=>r.ok?r.json():null).then(p=>{if(p&&p.pix){promo=p;mostrarPreco();cdTick()}}).catch(()=>{});
