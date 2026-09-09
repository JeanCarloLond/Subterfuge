import Phaser from 'phaser';

/**
 * ARTE PROVISIONAL - NO ES EL ARTE FINAL DEL JUEGO.
 *
 * Pixel art escrito a mano aqui, en codigo, con un mapa de caracteres. No hay
 * ninguna imagen generada: cada pixel esta puesto a proposito. Existe solo para
 * que el prototipo deje de ser cubos de colores mientras el equipo produce el
 * arte definitivo en Aseprite.
 *
 * Cuando lleguen los .png del equipo, se cargan en PreloadScene con las MISMAS
 * claves de textura y este archivo se borra entero. Nada mas depende de el.
 *
 * Cada entrada es una rejilla de caracteres; cada caracter es un color de su
 * paleta y '.' es transparente. Todas las filas de una figura deben medir lo
 * mismo: `pintar()` lo verifica y avisa por consola si no cuadra.
 */

/** Paleta del Vientre. Cada figura usa un subconjunto. */
type Paleta = Record<string, number>;

interface Figura {
  filas: readonly string[];
  paleta: Paleta;
}

// -- Cirujano-Sacerdote ------------------------------------------------------
// Silueta encapuchada de tecnico, no de guerrero. Las manos palidas asoman a
// los lados a proposito: son su oficio y su condena, y deben leerse a 1x.

const CIRUJANO: Figura = {
  paleta: {
    c: 0x241c22, // capucha
    t: 0x342a32, // tunica
    s: 0x1d171c, // sombra de la tunica
    p: 0xd8cdbe, // manos
    r: 0x7d2b2b, // estola
  },
  filas: [
    '......cccc......',
    '.....cccccc.....',
    '....cccccccc....',
    '....cc....cc....',
    '...cc......cc...',
    '...cc......cc...',
    '...cccccccccc...',
    '...cttttttttc...',
    '..cttttttttttc..',
    '..cttrrrrrrttc..',
    '.pcttrrrrrrttcp.',
    '.ppttrrrrrrttpp.',
    '.pptttttttttpp..',
    '..ttttttttttt...',
    '..tttttsttttt...',
    '..ttttsssttt....',
    '..tttssssttt....',
    '..tttsssssttt...',
    '..ttsssssssttt..',
    '..ttsssssssttt..',
    '..tts.....sttt..',
    '..tts.....sttt..',
    '..ttt.....sttt..',
    '.tttt.....ttttt.',
  ],
};

// -- Devoto ------------------------------------------------------------------
// Encorvado y vendado. Es un fiel, no un monstruo: sigue siendo claramente una
// persona, y ahi esta el horror.

const DEVOTO: Figura = {
  paleta: {
    h: 0x9a7f66, // piel
    v: 0xc9bda8, // vendas
    g: 0x5c4636, // ropa
    d: 0x3a2c22, // sombra
  },
  filas: [
    '.....hhhh.......',
    '....hhhhhh......',
    '....hvvvhh......',
    '....hvvvhh......',
    '.....hhhh.......',
    '.....gggg.......',
    '....gggggg......',
    '...gggggggg.....',
    '..vgggggggg.....',
    '..vvgggggggv....',
    '...vggggggvv....',
    '...ggggggggv....',
    '...gggggggg.....',
    '...ggggdggg.....',
    '...gggddgg......',
    '...ggdddgg......',
    '...gddddgg......',
    '..gddddddg......',
    '..gddddddg......',
    '..gdd...ddg.....',
    '..gdd...ddg.....',
    '..ggd...dgg.....',
    '..ggd...dgg.....',
    '.gggg...gggg....',
  ],
};

// -- Piedra ------------------------------------------------------------------
// Silleria con junta marcada arriba y abajo, para que al repetirse se lea la
// hilada en vez de una masa uniforme.

const PIEDRA: Figura = {
  paleta: {
    a: 0x51473d,
    b: 0x453c33,
    c: 0x37302a,
    j: 0x241f1b, // junta
  },
  filas: [
    'jjjjjjjjjjjjjjjj',
    'jaaaaaaabaaaaaaj',
    'jaaabaaaaaaabaaj',
    'jaaaaaaaaabaaaaj',
    'jbaaaaaabaaaaaaj',
    'jaaaaaaaaaaabaaj',
    'jaaabaaaaaaaaaaj',
    'jjjjjjjjjjjjjjjj',
    'jbbbbbbbcbbbbbbj',
    'jbbbcbbbbbbbcbbj',
    'jbbbbbbbbbcbbbbj',
    'jcbbbbbbcbbbbbbj',
    'jbbbbbbbbbbbcbbj',
    'jbbbcbbbbbbbbbbj',
    'jbbbbbbbbbbbbbbj',
    'jjjjjjjjjjjjjjjj',
  ],
};

// -- Altar -------------------------------------------------------------------
// Pila de sillar con un cuenco encendido. Apagado se tinta en gris desde el
// codigo, asi que la forma debe leerse igual con y sin color.

const ALTAR: Figura = {
  paleta: {
    p: 0x4a4038,
    s: 0x2e2822,
    f: 0xe8a03a, // llama
    F: 0xf5d78a, // llama clara
    r: 0x8c2f2f,
  },
  filas: [
    '................',
    '.......F........',
    '......FfF.......',
    '.....FfffF......',
    '.....fffff......',
    '......fff.......',
    '...pppppppp.....',
    '...psssssp......',
    '....pppppp......',
    '.....pppp.......',
    '.....prrp.......',
    '.....prrp.......',
    '.....pppp.......',
    '.....pssp.......',
    '.....pssp.......',
    '....pppppp......',
    '...pppppppp.....',
    '..pppssssppp....',
    '..pppppppppp....',
    '.pppppppppppp...',
  ],
};

// -- Fragmento del Codice ----------------------------------------------------

const CODICE: Figura = {
  paleta: {
    v: 0xe8d9a0, // pergamino
    i: 0x5c4a2a, // tinta
    s: 0xb9a878, // sombra
  },
  filas: [
    '.vvvvvv.',
    'vvvvvvvv',
    'viiivvvv',
    'vvvvvvvv',
    'viiiivvv',
    'vvvvvvvv',
    'viiivvvv',
    'vvvvvvsv',
    'vsssssss',
    '.ssssss.',
  ],
};

// -- Umbral ------------------------------------------------------------------
// Arco de paso al siguiente nivel del descenso. El hueco es negro puro: lo que
// hay abajo no se enseña todavia.

const UMBRAL: Figura = {
  paleta: {
    m: 0x3a2f38, // marco
    o: 0x0d0a0d, // oscuridad
  },
  filas: [
    '......mmmmmmmm......',
    '....mmmmmmmmmmmm....',
    '...mmoooooooooomm...',
    '..mmoooooooooooomm..',
    '.mmoooooooooooooomm.',
    ...Array<string>(27).fill('.mmoooooooooooooomm.'),
    '.mmmmmmmmmmmmmmmmmm.',
    'mmmmmmmmmmmmmmmmmmmm',
  ],
};

const FIGURAS: Record<string, Figura> = {
  cirujano: CIRUJANO,
  devoto: DEVOTO,
  piedra: PIEDRA,
  altar: ALTAR,
  codice: CODICE,
  umbral: UMBRAL,
};

/**
 * Genera todas las texturas provisionales.
 *
 * Las claves terminan en `-placeholder` a proposito: mientras ese sufijo siga
 * apareciendo en el codigo, es que el arte definitivo aun no ha entrado.
 */
export function generarArteProvisional(escena: Phaser.Scene): void {
  for (const [nombre, figura] of Object.entries(FIGURAS)) {
    pintar(escena, `${nombre}-placeholder`, figura);
  }

  // Piezas sin forma propia: se tintan y escalan desde el codigo.
  rectangulo(escena, 'chispa-placeholder', 2, 2, 0xffffff);
  rectangulo(escena, 'tajo-placeholder', 4, 20, 0xffffff);

  fondoArcos(escena, 'fondo-arcos');
}

/** Dibuja una figura pixel a pixel y la registra como textura. */
function pintar(escena: Phaser.Scene, clave: string, figura: Figura): void {
  const { filas, paleta } = figura;
  const alto = filas.length;
  const ancho = filas[0]?.length ?? 0;

  // Una fila descuadrada desplaza todo el dibujo: mejor avisar que renderizar mal.
  const descuadrada = filas.findIndex((fila) => fila.length !== ancho);
  if (descuadrada >= 0) {
    console.warn(
      `[ArteProvisional] "${clave}": la fila ${descuadrada} mide ` +
        `${filas[descuadrada].length} y se esperaban ${ancho}.`,
    );
  }

  const lienzo = escena.make.graphics({ x: 0, y: 0 }, false);

  for (let y = 0; y < alto; y += 1) {
    const fila = filas[y];
    for (let x = 0; x < fila.length; x += 1) {
      const color = paleta[fila[x]];
      if (color === undefined) continue; // '.' y desconocidos: transparente

      lienzo.fillStyle(color, 1);
      lienzo.fillRect(x, y, 1, 1);
    }
  }

  lienzo.generateTexture(clave, ancho, alto);
  lienzo.destroy();
}

function rectangulo(
  escena: Phaser.Scene,
  clave: string,
  ancho: number,
  alto: number,
  color: number,
): void {
  const lienzo = escena.make.graphics({ x: 0, y: 0 }, false);
  lienzo.fillStyle(color, 1);
  lienzo.fillRect(0, 0, ancho, alto);
  lienzo.generateTexture(clave, ancho, alto);
  lienzo.destroy();
}

/**
 * Telon de fondo repetible: arcadas lejanas.
 *
 * Se usa como tileSprite con scrollFactor bajo, asi que solo necesita insinuar
 * profundidad. Es arquitectura, no decorado: el Atrio es una ciudad dentro de
 * una catedral, y el fondo tiene que recordarlo.
 */
function fondoArcos(escena: Phaser.Scene, clave: string): void {
  const ancho = 96;
  const alto = 96;
  const lienzo = escena.make.graphics({ x: 0, y: 0 }, false);

  lienzo.fillStyle(0x0f0c0f, 1);
  lienzo.fillRect(0, 0, ancho, alto);

  // Dos arcadas por baldosa, desfasadas para que la repeticion no salte.
  for (const [centroX, base, radio] of [
    [24, 74, 15],
    [72, 82, 19],
  ] as const) {
    lienzo.fillStyle(0x181320, 1);
    lienzo.fillRect(centroX - radio, base - radio, radio * 2, radio);
    lienzo.fillCircle(centroX, base - radio, radio);

    // Hueco del arco: mas oscuro que el muro.
    lienzo.fillStyle(0x0b090e, 1);
    lienzo.fillRect(centroX - radio + 4, base - radio, radio * 2 - 8, radio);
    lienzo.fillCircle(centroX, base - radio, radio - 4);
  }

  // Linea de imposta: ancla las arcadas y da una horizontal que leer.
  lienzo.fillStyle(0x1d1726, 1);
  lienzo.fillRect(0, 86, ancho, 2);

  lienzo.generateTexture(clave, ancho, alto);
  lienzo.destroy();
}
