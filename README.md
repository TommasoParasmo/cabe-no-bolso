# Vai Dar Viagem

Diga quanto quer gastar. A gente monta a viagem e diz se dá.

## Como funciona

- `public/index.html`: página de apresentação.
- `public/app/`: o app. A pessoa informa orçamento, origem, datas, pessoas, estilo e interesses.
- `functions/api/veredito.js`: calcula o custo e o veredito **sem IA**. A passagem vem da Aviasales Data API (Travelpayouts), com cache de 6 horas; sem preço para a rota, usa uma estimativa por distância. Hospedagem, comida, passeios e transporte usam médias por destino (`public/lib/dados.js`).
- `functions/api/pix.js`: cria o Pix do roteiro completo no Mercado Pago e diz se ele já foi pago (`server/pix.js`). A order leva no `external_reference` a referência do pedido de roteiro (com a ordem das cidades), então cada pagamento libera só o roteiro que foi pago, sem banco de dados. O `/api/roteiro` com `completo: true` só monta o roteiro completo depois de conferir o pagamento.
- `functions/api/roteiro.js`: roteiro dia a dia com IA (Claude Haiku 4.5), só quando a pessoa pede. Roteiros iguais ficam em cache por 7 dias.

## Publicar na Cloudflare Pages (grátis)

1. Em dash.cloudflare.com, vá em **Workers & Pages → Create → Pages → Connect to Git** e escolha este repositório.
2. Project name: `vai-dar-viagem`. Build command: `npm ci` (instala as bibliotecas das funções). Build output directory: `public`.
3. Em **Settings → Variables and Secrets**, adicione como *Secret*:
   - `TRAVELPAYOUTS_TOKEN`: token de API do Travelpayouts (perfil → API token).
   - `TRAVELPAYOUTS_MARKER`: seu marker (ID de parceiro) do Travelpayouts.
   - `ANTHROPIC_API_KEY`: chave da API da Anthropic (console.anthropic.com).
   - `MP_ACCESS_TOKEN`: Access Token **de produção** do Mercado Pago (Suas integrações → aplicação → Credenciais de produção). Liga a venda do roteiro completo no Pix (R$ 14,90): horário de cada lugar, uma dica por lugar, a ordem das cidades escolhida pela pessoa e 8 dicas da viagem. O roteiro simples continua grátis. O token de teste gera um Pix que banco nenhum paga, então em produção use só o de produção. Sem a variável, o app não oferece o roteiro completo.
4. Faça um novo deploy para as variáveis valerem.
5. Em console.anthropic.com → **Settings → Limits**, defina um limite de gasto mensal. O app já limita a 5 roteiros novos por pessoa (IP) por dia, mas esse contador é aproximado; o limite da Anthropic é o teto de verdade.

Sem `TRAVELPAYOUTS_TOKEN`, o app funciona só com estimativas. Sem `ANTHROPIC_API_KEY`, o botão de roteiro mostra que a IA ainda não está ligada.

## Rodar localmente

```sh
npm install
cp .dev.vars.example .dev.vars   # preencha as chaves, se tiver
npx wrangler pages dev public
npm test
```
