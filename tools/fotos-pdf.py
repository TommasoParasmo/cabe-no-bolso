# Gera as fotos do PDF comprado em public/roteiros/<destino>/pdf/ (rodar de novo ao trocar uma foto do roteiro).
# O Chromium do Browser Rendering grava cada uso de uma imagem no PDF descomprimida (Flate), não o JPEG original:
# o tamanho do PDF segue os pixels. Por isso cada uso tem a sua versão no tamanho em que aparece na página.
#   <foto>.jpg       faixa do topo dos dias (210 mm de largura, ~100 dpi)
#   <foto>-mini.jpg  miniatura do resumo (18 x 13 mm)
#   <foto>-capa.jpg  capa em página inteira A4 (só a foto da capa: capa.img em server/pdf/destinos/<destino>.js)
#   logo-*.png       logo do cabeçalho (10 mm de altura), repetido em todas as páginas
# Uso: python3 tools/fotos-pdf.py   (precisa do Pillow)
import re
from pathlib import Path
from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
RAIZ = REPO / "public" / "roteiros"

def foto_da_capa(destino):
    js = REPO / "server" / "pdf" / "destinos" / (destino + ".js")
    achou = js.exists() and re.search(r'capa:\s*\{\s*img:\s*"([a-z-]+)"', js.read_text())
    return achou.group(1) if achou else "capa"

def salvar_jpg(im, destino):
    im.convert("RGB").save(destino, "JPEG", quality=80, optimize=True, progressive=False)

for pasta in sorted(p for p in RAIZ.iterdir() if p.is_dir()):
    saida = pasta / "pdf"
    saida.mkdir(exist_ok=True)
    capa = foto_da_capa(pasta.name)
    for foto in sorted(pasta.glob("*.jpg")):
        im = Image.open(foto)
        salvar_jpg(im.resize((800, round(im.height * 800 / im.width)), Image.LANCZOS), saida / foto.name)
        salvar_jpg(ImageOps.fit(im, (170, 123), Image.LANCZOS), saida / (foto.stem + "-mini.jpg"))
        if foto.stem == capa:
            salvar_jpg(ImageOps.fit(im, (640, 905), Image.LANCZOS), saida / (foto.stem + "-capa.jpg"))
    for logo in sorted(pasta.glob("logo-*.png")):
        im = Image.open(logo)
        im.resize((180, round(im.height * 180 / im.width)), Image.LANCZOS).save(saida / logo.name, optimize=True)
