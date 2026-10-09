# Conteúdo de um destino do Roteiro Detalhado + Pré-viagem

Cada arquivo `server/pdf/destinos/<slug>.js` exporta por padrão (`export default { ... }`) o conteúdo fixo
de um destino. O motor (`server/pdf/roteiro.js`, função `montarRoteiro`) monta as páginas A4 com o mesmo
desenho do PDF de Jerusalém. Variam só o nome de quem comprou e os valores da simulação.

Regras de texto: português do Brasil simples, frases curtas, sem travessão, sem dados inventados apresentados
como reais (preços são "cerca de" ou faixas). Pode usar `<b>` dentro de textos. Os comprimentos abaixo são
o limite para caber na página; o teste de rodapé confere.

Em `@@PG:<id>@@` o motor põe o número da página (ids: `quando`, `mala`, `guias`, `emergencia`, `orcamento`,
`lugar1`…, ids de `especiais`).

| Campo | Formato |
|---|---|
| `nome` | "Orlando" (aparece na capa "<nome> em 7 dias" e no rodapé) |
| `moeda` | nome da moeda no singular, para "R$ 5,40 por dólar"; `moedaPlural` (opcional) para moedas abaixo de R$ 0,10: "R$ 1 vale cerca de 170 pesos chilenos" |
| `rotuloExtra` | rótulo do 4º item do custo, igual ao `extraNome` da página de oferta (ex.: "Parques (3 dias) e carro") |
| `capa` | `{ img, frase, ritmo }`: imagem da capa (nome do .jpg em `public/roteiros/<slug>/`), frase de até 90 caracteres, ritmo de até 30 |
| `referencia` | sem valores da simulação: `{ total: "R$ 2.400", inclui: "até 45 caracteres", porDia: "cerca de R$ 340" }`, por pessoa no destino (comida, passeios, transporte) |
| `fichaDoc` | `[título, dica]` do documento de entrada (ex.: `["Visto americano", "Número e validade"]`) |
| `fichaExtra` | 2 linhas `[título, dica]` (ex.: aluguel de carro, passeios contratados) |
| `mapa` | ver abaixo |
| `quando` | 4 blocos `["90", "dias antes", [[tarefa, detalhe], ...3]]`, como em Jerusalém (90/30/7/1 ou o que fizer sentido); detalhe até 140 caracteres |
| `regras` | `{ titulo: "Dinheiro, documentos e clima", cards: [3 × { ic, t, itens: [3 itens de até 120 caracteres] }], avisos: [0 ou 1 × [título, texto até 380]], seguranca: "texto até 200 caracteres" }`; ícones: `i-doc`, `coin`, `shirt`, `shield`, `sun`, `spark` |
| `clima` | `{ geral: [2 itens], sempre: "item sempre presente", gelado: "se mínima < 5 °C", frio: "se mínima < 12 °C", calor: "se máxima ≥ 28 °C", chuva: { meses: [números 1–12], texto } }` |
| `mala` | 3 colunas `[título, [5 itens curtos]]` |
| `ficar` | `{ titulo, bairros: [3 × { n, quem, pro: [3], contra: [2] }], estilos: [3 × [faixa, "R$ 400 a 700", "diária do quarto duplo"]], nota }` |
| `locomover` | `{ titulo, cab: [4 colunas], linhas: [4 × 4 células], cards: [4 × { ic?, t, itens: [2–3] }], aviso: [título, texto] ou null }` |
| `horarios` | `{ linhas: [12 a 15 × [lugar, quando abre, fecha, entrada, reserva]], aviso: [título, texto] }` |
| `historia` | `{ kick, titulo, linhas: [13 a 15 × [ano, fato de até 110 caracteres]] }` |
| `dias` | 7 dias, ver abaixo |
| `guiasLugar` | `{ grupo: "Parques e atrações" (título do grupo no sumário), rotulo: "Atração" (cabeçalho "Atração 1 de 5"), itens: [4 a 6 × { img, t, dia, tempo, kickHist?, hist: até 520 caracteres, passos: [4–5 × [nome, até 100 caracteres]], foto, saber }] }` |
| `especiais` | 1 a 3 páginas próprias do destino: `{ id, sumario, grupo? (título do grupo no sumário; sem ele, o de guiasLugar), rotulo, kick, titulo, sub?, tabela?: { cab, linhas }, cards?: [ { ic?, t, itens? , texto? } ], avisos?: [[título, texto]] }`. Uma página cabe uma tabela de até 8 linhas + 4 cards, ou 6 cards + 1 aviso |
| `orcamento` | `{ colDinheiro: "Dinheiro vivo", dias: [7 × [valor curto, onde economizar até 55 caracteres]], fora: "como o seguro e o traslado do aeroporto", nota }` |
| `comida` | `{ titulo: "Comida típica", pratos: [10 × [nome, descrição até 80, "preço · onde"]], cards: [2 × { t, itens: [2] }] }` |
| `golpes` | `{ itens: [6 × [título, texto até 170]], perda: [3 itens], aviso: [título, texto] }` |
| `fotos` | `{ itens: [10 × [onde, melhor horário, número do dia]], aviso: [título, texto] }` |
| `extras` | 2 páginas `{ kick, titulo, cards: [1 ou 2 × { t, o, preco: "R$ 300 a 500", min: 300, max: 500, itens: [3], dica }], aviso?: [título, texto] }`; min/max por pessoa em reais |
| `guias` | `{ linhas: [5 × [passeio, subtítulo, empresas, "$"/"$$"/"$$$", dia]], escolher: "texto" }`; empresas reais e conhecidas, sem chamar de recomendadas |
| `emergencia` | `{ numeros: [3 ou 4 × [número, rótulo]], consulado: { t, p: [1–2 parágrafos] }, frases: [20 × [português, idioma local, idioma]] }` |
| `cartao` | `{ kick: "Mostre ao motorista", sub, pedido: "Please take me to:", coluna: "Em inglês", lugares: [6 × [lugar, nome local]] }` |
| `creditos` | créditos das fotos (Wikimedia Commons) |

## `mapa`

Desenho esquemático numa área de 720 × 520 (coordenadas SVG). `{ sumario: "Mapa de Orlando", titulo, sub,
areas: [{ x, y, w, h, l }], agua: [{ d, fill?, w?, l?, lx, ly }], rotas: [{ d, l?, lx, ly }],
pinos: [{ x, y, dia, l, anc?: "end" }], notas: [[x, y, texto, anchor?]], cards: [2 × { t, itens: [3] }] }`.
Pinos com raio 13; o rótulo fica 20 à direita (ou à esquerda com `anc: "end"`). Use notas com setas (← ↑ ↓ →)
para o que fica fora do desenho.

## `dias`

7 × `{ img, d: "Chegada · de carro" (até 35), t: título até 45, gasto: "R$ 280" (referência por pessoa),
seg: 1–5, bairro: até 28, destaque: [kick até 40, frase até 110], stops: [4 × [hora, lugar, texto até 75 (uma linha),
[2 chips curtos], busca no Maps em inglês ou espanhol, ou omitida para paradas sem lugar]], comer: [2 × [lugar
até 70, "R$ 40 a R$ 70 por pessoa"]], chuva: até 140, tip: [título, texto até 150], semana?: { dias: [0–6],
senao: [título, texto] } }`.

`semana` serve para o que só acontece em certos dias (0 = domingo): quando a data da viagem não cai nesses
dias, a dica do dia vira o texto de `senao`. O dia 7 termina com a ida ao aeroporto.
