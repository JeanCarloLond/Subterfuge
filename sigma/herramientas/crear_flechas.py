"""Las flechas de las teclas (#237): una fuente de reserva con ← ↑ → ↓, y los
botones de un mando de PlayStation: ✕ ○ □ △.

VT323 no las tiene. En escritorio Godot las sacaba de las fuentes del sistema;
en la web no hay sistema y salian cajas con el codigo del caracter. Esta fuente
las dibuja pixel a pixel: un pixel del dibujo, uno de pantalla con la letra a 16,
y controles.gd la pone de reserva de las fuentes del juego.

Se corrio UNA vez; vuelve a correrse si se cambian los dibujos:

    python sigma/herramientas/crear_flechas.py      (necesita fonttools)
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

# Un pixel del dibujo es un pixel de pantalla con la letra a 16, el tamano del
# juego: 16 * 64 / 1024 = 1. Con pixeles de 40 sobre 1000 (los de VT323) cada
# uno medía 0,64 de pantalla, y al redondear la flecha se leia como una cruz
# (feedback de Jean, Inventiva).
EM = 1024
PIXEL = 64
ANCHO = 640  # el avance de un caracter de VT323 a 16: 10 pixeles
SALIDA = Path(__file__).resolve().parent.parent / "arte" / "fuentes" / "FlechasSigma.ttf"

# La flecha a la derecha, de arriba abajo, con el astil de dos pixeles.
DERECHA = [
    ".....#...",
    ".....##..",
    ".....###.",
    "#########",
    "#########",
    ".....###.",
    ".....##..",
    ".....#...",
]


def girar(filas):
    """Gira el dibujo 90 grados contra el reloj: de derecha a arriba."""
    alto, ancho = len(filas), len(filas[0])
    return ["".join(filas[f][ancho - 1 - c] for f in range(alto)) for c in range(ancho)]


IZQUIERDA = [fila[::-1] for fila in DERECHA]
ARRIBA = girar(DERECHA)
ABAJO = ARRIBA[::-1]

# Los botones de PlayStation, con trazo de dos pixeles como el astil de las
# flechas, y de la altura de una mayuscula: mas pequenos se perdian.
EQUIS = [
    "##.......##",
    "###.....###",
    ".###...###.",
    "..###.###..",
    "...#####...",
    "....###....",
    "...#####...",
    "..###.###..",
    ".###...###.",
    "###.....###",
    "##.......##",
]
CIRCULO = [
    "...#####...",
    ".#########.",
    ".###...###.",
    "###.....###",
    "##.......##",
    "##.......##",
    "##.......##",
    "###.....###",
    ".###...###.",
    ".#########.",
    "...#####...",
]
CUADRADO = [
    "##########",
    "##########",
    "##......##",
    "##......##",
    "##......##",
    "##......##",
    "##......##",
    "##......##",
    "##########",
    "##########",
]
TRIANGULO = [
    ".....#.....",
    "....###....",
    "....###....",
    "...##.##...",
    "...##.##...",
    "..##...##..",
    "..##...##..",
    ".##.....##.",
    ".#########.",
    "###########",
]

# Caracter -> (dibujo, pixel de abajo sobre la linea base). Todas de pie en la
# base, como una mayuscula.
FLECHAS = {
    "←": (IZQUIERDA, 1),
    "→": (DERECHA, 1),
    "↑": (ARRIBA, 1),
    "↓": (ABAJO, 1),
    "✕": (EQUIS, 1),
    "○": (CIRCULO, 1),
    "□": (CUADRADO, 1),
    "△": (TRIANGULO, 1),
}


def avance(filas):
    """Lo que avanza el glifo: el de VT323, o mas si el dibujo no cabe."""
    return max(ANCHO, (len(filas[0]) + 2) * PIXEL)


def glifo(filas, base):
    pluma = TTGlyphPen(None)
    alto = len(filas)
    margen = (avance(filas) // PIXEL - len(filas[0])) // 2
    for f, fila in enumerate(filas):
        for c, letra in enumerate(fila):
            if letra != "#":
                continue
            x = (margen + c) * PIXEL
            y = (base + alto - 1 - f) * PIXEL
            pluma.moveTo((x, y))
            pluma.lineTo((x, y + PIXEL))
            pluma.lineTo((x + PIXEL, y + PIXEL))
            pluma.lineTo((x + PIXEL, y))
            pluma.closePath()
    return pluma.glyph()


def main():
    nombres = [".notdef", "space"] + [f"uni{ord(c):04X}" for c in FLECHAS]
    fb = FontBuilder(EM, isTTF=True)
    fb.setupGlyphOrder(nombres)
    fb.setupCharacterMap({32: "space", **{ord(c): f"uni{ord(c):04X}" for c in FLECHAS}})
    glifos = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}
    for c, (filas, base) in FLECHAS.items():
        glifos[f"uni{ord(c):04X}"] = glifo(filas, base)
    fb.setupGlyf(glifos)
    metricas = {".notdef": (ANCHO, 0), "space": (ANCHO, 0)}
    for c, (filas, _) in FLECHAS.items():
        metricas[f"uni{ord(c):04X}"] = (avance(filas), 0)
    fb.setupHorizontalMetrics(metricas)
    fb.setupHorizontalHeader(ascent=EM * 4 // 5, descent=-EM // 5)
    fb.setupNameTable({"familyName": "Flechas Sigma", "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=EM * 4 // 5, sTypoDescender=-EM // 5, usWinAscent=EM * 4 // 5, usWinDescent=EM // 5)
    fb.setupPost()
    fb.save(SALIDA)
    print(f"{SALIDA.name}: {', '.join(FLECHAS)}")


main()
