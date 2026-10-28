"""Las flechas de las teclas (#237): una fuente de reserva con solo ← ↑ → ↓.

VT323 no las tiene. En escritorio Godot las sacaba de las fuentes del sistema;
en la web no hay sistema y salian cajas con el codigo del caracter. Esta fuente
las dibuja en la cuadricula de VT323 (pixeles de 40 unidades, mayusculas de 14)
y controles.gd la pone de reserva de las fuentes del juego.

Se corrio UNA vez; vuelve a correrse si se cambian los dibujos:

    python sigma/herramientas/crear_flechas.py      (necesita fonttools)
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

PIXEL = 40
ANCHO = 400  # el avance de VT323: 10 pixeles
SALIDA = Path(__file__).resolve().parent.parent / "arte" / "fuentes" / "FlechasSigma.ttf"

# La flecha a la derecha, de arriba abajo. El astil, de dos pixeles como el
# guion de VT323 y a su altura.
DERECHA = [
    "....#....",
    "....##...",
    "....###..",
    "#########",
    "#########",
    "....###..",
    "....##...",
    "....#....",
]


def girar(filas):
    """Gira el dibujo 90 grados contra el reloj: de derecha a arriba."""
    alto, ancho = len(filas), len(filas[0])
    return ["".join(filas[f][ancho - 1 - c] for f in range(alto)) for c in range(ancho)]


IZQUIERDA = [fila[::-1] for fila in DERECHA]
ARRIBA = girar(DERECHA)
ABAJO = ARRIBA[::-1]

# Caracter -> (dibujo, pixel de abajo sobre la linea base). Las horizontales,
# con el astil donde el guion (pixeles 6 y 7); las verticales, de pie en la base.
FLECHAS = {
    "←": (IZQUIERDA, 3),
    "→": (DERECHA, 3),
    "↑": (ARRIBA, 1),
    "↓": (ABAJO, 1),
}


def glifo(filas, base):
    pluma = TTGlyphPen(None)
    alto = len(filas)
    margen = (ANCHO // PIXEL - len(filas[0])) // 2
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
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(nombres)
    fb.setupCharacterMap({32: "space", **{ord(c): f"uni{ord(c):04X}" for c in FLECHAS}})
    glifos = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}
    for c, (filas, base) in FLECHAS.items():
        glifos[f"uni{ord(c):04X}"] = glifo(filas, base)
    fb.setupGlyf(glifos)
    fb.setupHorizontalMetrics({n: (ANCHO, 0) for n in nombres})
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupNameTable({"familyName": "Flechas Sigma", "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
    fb.setupPost()
    fb.save(SALIDA)
    print(f"{SALIDA.name}: {', '.join(FLECHAS)}")


main()
