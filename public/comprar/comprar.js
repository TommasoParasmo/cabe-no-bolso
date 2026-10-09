// Checkout do Roteiro Detalhado + Pré-viagem por destino: /comprar/?destino=<slug>.
// Os valores da simulação vêm da página de oferta, em sessionStorage "vdv:simulacao" ({ destino, valores })
// ou no endereço (#v=<JSON em base64url>). Sem eles, o PDF sai com o nome e os valores de referência.
// Campos de `valores` (todos opcionais, em reais, para o grupo todo): periodo ("05 a 11 de julho de 2027"),
// inicio ("2027-07-05"), pessoas, noites, passagens, hotel, comidaPasseios, transporte, sobra, cotacao (reais por
// unidade da moeda local), clima ({ mes, min, max }) e dias (7 valores, o gasto de cada dia).
// Pix: QR Code na tela e confirmação automática. Cartão: formulário do Mercado Pago (Card Payment Brick).
const NOMES = { jerusalem: "Jerusalém", orlando: "Orlando", chile: "Santiago do Chile", "buenos-aires": "Buenos Aires" };
const TURNSTILE_SITE_KEY = "0x4AAAAAAFReB_e_h1sYplN2";
const $ = id => document.getElementById(id);
const brl = n => "R$ " + Number(n).toFixed(2).replace(".", ",");
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const ler = (k, area = localStorage) => { try { return JSON.parse(area.getItem(k)); } catch { return null; } };

const slug = new URLSearchParams(location.search).get("destino") || "";
const nomeDestino = NOMES[slug];
let forma = "pix", preco = null, chavePublica = null, pendente = null, consulta = null, relogio = null;

async function postar(dados) {
  const r = await fetch("/api/compra", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(dados) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || "Algo deu errado. Tente de novo.");
  return d;
}

function valoresDaSimulacao() {
  const h = new URLSearchParams(location.hash.slice(1)).get("v");
  if (h) {
    try { return JSON.parse(decodeURIComponent(escape(atob(h.replace(/-/g, "+").replace(/_/g, "/"))))); } catch {}
  }
  const s = ler("vdv:simulacao", sessionStorage);
  return s && s.destino === slug && s.valores ? s.valores : {};
}

function mostrar(passo) {
  for (const p of ["dados", "pix", "cartao", "pronto"]) $("passo-" + p).hidden = p !== passo;
  // No celular, depois dos dados o resumo sai da frente e o pagamento fica no topo.
  document.body.classList.toggle("pagando", passo !== "dados");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
const erro = (id, msg) => { $(id).textContent = msg || ""; $(id).hidden = !msg; };

// ---- Promoção de outubro: cronômetro até o fim real da promoção ----
function cronometroPromo(ate) {
  const fim = Date.parse(ate);
  const tick = () => {
    const s = Math.max(0, Math.floor((fim - Date.now()) / 1000));
    if (!s) { $("promo").hidden = true; return; }
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), seg = s % 60;
    $("falta").textContent = (d ? d + (d > 1 ? " dias " : " dia ") : "") + [h, m, seg].map(n => String(n).padStart(2, "0")).join(":");
    setTimeout(tick, 1000);
  };
  $("promo").hidden = false;
  tick();
}

// ---- Escolha da forma de pagamento ----
function escolher(f) {
  forma = f;
  for (const b of document.querySelectorAll(".forma")) b.setAttribute("aria-pressed", String(b.dataset.forma === f));
  $("continuar").textContent = f === "pix" ? "Gerar o Pix" : "Continuar para o cartão";
}

function dadosDoFormulario() {
  const nome = $("nome").value.replace(/\s+/g, " ").trim(), email = $("email").value.trim();
  if (nome.length < 2) throw new Error("Escreva o nome que vai na capa.");
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) throw new Error("Confira o e-mail.");
  return { destino: slug, nome, email, valores: valoresDaSimulacao() };
}

// Turnstile (o "não sou robô" invisível da Cloudflare), igual ao app.
let turnstilePronto = null;
function tokenTurnstile() {
  turnstilePronto ||= new Promise((ok, falha) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.onload = ok; s.onerror = () => { turnstilePronto = null; falha(new Error("Não deu para carregar a verificação. Recarregue a página.")); };
    document.head.appendChild(s);
  });
  return turnstilePronto.then(() => new Promise((ok, falha) => {
    const caixa = document.createElement("div");
    document.body.appendChild(caixa);
    const id = window.turnstile.render(caixa, {
      sitekey: TURNSTILE_SITE_KEY, appearance: "interaction-only",
      callback: t => { ok(t); setTimeout(() => { window.turnstile.remove(id); caixa.remove(); }, 0); },
      "error-callback": () => { falha(new Error("Não conseguimos confirmar que é você. Tente de novo.")); caixa.remove(); }
    });
  }));
}

// ---- Pix ----
async function gerarPix() {
  const dados = dadosDoFormulario();
  const pix = await postar({ acao: "criar", forma: "pix", ...dados, turnstile: await tokenTurnstile() });
  pendente = { id: pix.id, chave: pix.chave, copiaECola: pix.copiaECola, qrCode: pix.qrCode, expiraEm: pix.expiraEm };
  guardar("vdv:pix:" + slug, pendente);
  telaPix();
}

function telaPix() {
  $("qr").src = pendente.qrCode ? "data:image/png;base64," + pendente.qrCode : "";
  $("qr").hidden = !pendente.qrCode;
  $("codigo").textContent = pendente.copiaECola;
  mostrar("pix");
  clearTimeout(relogio);
  const fim = Date.parse(pendente.expiraEm);
  const tick = () => {
    const s = Math.max(0, Math.floor((fim - Date.now()) / 1000));
    $("tempo").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    if (s) relogio = setTimeout(tick, 1000);
  };
  tick();
  acompanhar();
}

function acompanhar() {
  clearTimeout(consulta);
  const ver = async () => {
    try {
      const { status } = await postar({ acao: "situacao", id: pendente.id, chave: pendente.chave });
      if (status === "pago") return pronto(pendente);
      if (status === "expirado") {
        localStorage.removeItem("vdv:pix:" + slug);
        localStorage.removeItem("vdv:cartao:" + slug);
        $("brick").hidden = false;
        mostrar("dados");
        return erro("erro-dados", pendente.forma === "cartao" ? "O pagamento com cartão não foi aprovado. Tente outro cartão ou o Pix." : "O Pix venceu antes do pagamento. Gere um novo.");
      }
    } catch {}
    consulta = setTimeout(ver, 4000);
  };
  consulta = setTimeout(ver, 4000);
}

// ---- Cartão (Card Payment Brick do Mercado Pago) ----
let brickPronto = null;
function carregarSdk() {
  return new Promise((ok, falha) => {
    if (window.MercadoPago) return ok();
    const s = document.createElement("script");
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.onload = ok; s.onerror = () => falha(new Error("Não deu para abrir o pagamento com cartão. Tente o Pix."));
    document.head.appendChild(s);
  });
}

async function abrirCartao() {
  const dados = dadosDoFormulario();
  if (!chavePublica) throw new Error("O pagamento com cartão ainda não está ligado. Use o Pix.");
  erro("erro-cartao", "");
  mostrar("cartao");
  $("brick").hidden = false;
  await carregarSdk();
  if (brickPronto) { await brickPronto.unmount?.(); brickPronto = null; }
  const mp = new window.MercadoPago(chavePublica, { locale: "pt-BR" });
  brickPronto = await mp.bricks().create("cardPayment", "brick", {
    initialization: { amount: preco.cartao, payer: { email: dados.email } },
    customization: {
      paymentMethods: { maxInstallments: 1, minInstallments: 1, types: { excluded: ["debit_card", "prepaid_card"] } },
      visual: {
        style: { theme: "default", customVariables: { baseColor: "#0D3532", buttonTextColor: "#FFFFFF", borderRadiusLarge: "14px" } },
        // Só crédito: o título padrão do Brick fala em "crédito ou débito".
        texts: { formTitle: "Cartão de crédito", formSubmit: `Pagar ${brl(preco.cartao)}` }
      }
    },
    callbacks: {
      onReady: () => {},
      onError: () => erro("erro-cartao", "Não deu para carregar o formulário do cartão. Recarregue a página ou use o Pix."),
      // O Brick espera a promessa: se ela falhar, ele libera o botão para tentar de novo.
      onSubmit: async formData => {
        erro("erro-cartao", "");
        try {
          const r = await postar({ acao: "criar", forma: "cartao", ...dados, turnstile: await tokenTurnstile(),
            cartao: { token: formData.token, payment_method_id: formData.payment_method_id } });
          if (r.status === "pago") return pronto(r);
          pendente = { id: r.id, chave: r.chave, forma: "cartao" };
          guardar("vdv:cartao:" + slug, pendente);
          emAnalise();
        } catch (e) {
          erro("erro-cartao", e.message);
          throw e;
        }
      }
    }
  });
}

// Cartão em análise: guarda o pedido (para voltar a ele depois de recarregar) e mostra o número logo.
function emAnalise() {
  mostrar("cartao");
  $("brick").hidden = true;
  erro("erro-cartao", `O pagamento está em análise. Esta tela muda sozinha quando for aprovado. Número do pedido: ${pendente.id}`);
  acompanhar();
}

// ---- Pronto: link do PDF ----
function pronto({ id, chave }) {
  clearTimeout(consulta); clearTimeout(relogio);
  localStorage.removeItem("vdv:pix:" + slug);
  localStorage.removeItem("vdv:cartao:" + slug);
  guardar("vdv:compra:" + slug, { id, chave });
  $("baixar").href = "/api/pdf?" + new URLSearchParams({ id, chave });
  $("num-pedido").textContent = id;
  mostrar("pronto");
}

async function recuperar() {
  erro("erro-rec", "");
  try {
    const r = await postar({ acao: "recuperar", id: $("rec-id").value.trim().toUpperCase(), email: $("rec-email").value.trim() });
    if (r.destino !== slug) { guardar("vdv:compra:" + r.destino, r); location.href = "/comprar/?destino=" + r.destino; return; }
    pronto(r);
  } catch (e) { erro("erro-rec", e.message); }
}

// ---- Início ----
async function iniciar() {
  if (!nomeDestino) {
    $("titulo").textContent = "Destino não encontrado";
    $("passo-dados").innerHTML = '<p>Volte para a página do destino e toque em "Garantir meu roteiro".</p><a class="btn" href="/">Ir para o início</a>';
    return;
  }
  document.title = `Roteiro de ${nomeDestino} · Vai Dar Viagem`;
  $("titulo").textContent = `${nomeDestino} em 7 dias`;
  if (!Object.keys(valoresDaSimulacao()).length) $("item-orcamento").textContent = "Orçamento dia a dia, com onde economizar";
  const capa = slug === "chile" ? "neve" : "capa";
  $("foto").style.backgroundImage = `url(/roteiros/${slug}/${capa}.jpg)`;

  // Compra já paga neste aparelho: vai direto para o download.
  const feita = ler("vdv:compra:" + slug);
  if (feita?.id) return pronto(feita);

  for (const b of document.querySelectorAll(".forma")) b.addEventListener("click", () => escolher(b.dataset.forma));
  $("passo-dados").addEventListener("submit", async ev => {
    ev.preventDefault();
    erro("erro-dados", "");
    const botao = $("continuar"), texto = botao.textContent;
    botao.disabled = true; botao.textContent = "Um instante…";
    try { forma === "pix" ? await gerarPix() : await abrirCartao(); }
    catch (e) { mostrar("dados"); erro("erro-dados", e.message); }
    finally { botao.disabled = false; botao.textContent = texto; }
  });
  $("copiar").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(pendente.copiaECola); $("copiar").textContent = "Código copiado. Cole no app do banco."; }
    catch { prompt("Copie o código Pix:", pendente.copiaECola); }
  });
  $("voltar-pix").addEventListener("click", () => { clearTimeout(consulta); mostrar("dados"); });
  $("voltar-cartao").addEventListener("click", () => { clearTimeout(consulta); mostrar("dados"); });
  $("recuperar").addEventListener("click", recuperar);

  try {
    preco = await postar({ acao: "preco", destino: slug });
    chavePublica = preco.chavePublica;
    $("preco-pix").textContent = brl(preco.pix);
    $("preco-cartao").textContent = brl(preco.cartao);
    if (!chavePublica) document.querySelector('[data-forma="cartao"]').hidden = true;
    if (preco.promocao) cronometroPromo(preco.ate);
  } catch (e) { erro("erro-dados", e.message); }

  // Pix gerado e ainda no prazo (a pessoa recarregou a página ou foi pagar no app do banco): volta para ele.
  const pix = ler("vdv:pix:" + slug);
  if (pix?.id && Date.parse(pix.expiraEm) > Date.now()) { pendente = pix; telaPix(); }
  // Cartão que ficou em análise: volta a acompanhar o mesmo pedido.
  const cartao = ler("vdv:cartao:" + slug);
  if (cartao?.id) { pendente = cartao; emAnalise(); }
}

iniciar();
