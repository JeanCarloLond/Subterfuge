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
//
// Silueta segun el boceto de la artista: el hombre de la MASCARA DORADA.
// Capirote conico alto en oro, mascara sin ojos y tunica morada con estola
// roja y hombreras doradas.
//
// Blasphemous es referente de TONO, no de diseno de personaje: sirve para el
// horror gotico-religioso y el peso de la silueta, no para copiar al Penitente.
// El Cirujano es oro y morado, no acero.
//
// Tres cosas que no se pueden perder al pasarlo a Aseprite:
//
//   1. Las MANOS palidas asoman a los lados. Son su oficio y su condena, y hay
//      que poder leerlas a 1x sin ampliar.
//   2. El oro de la mascara es su color identitario. Es lo que lo separa de
//      cualquier otra figura encapuchada del genero.
//   3. La mascara no tiene ojos, solo una hendidura. En la Diocesis mirar no es
//      lo que da estatus, y el habito clerical lo refleja.
//
// Es un tecnico, no un guerrero: postura recta y estrecha, sin hombros de heroe.

const CIRUJANO: Figura = {
  paleta: {
    K: 0xf2dc8c, // reflejo del oro
    k: 0xc9a44c, // oro de la mascara y el capirote
    j: 0x8a6a2a, // oro en sombra
    n: 0x171319, // hendidura de la mascara
    P: 0x63456f, // morado claro
    p: 0x4a3358, // morado de la tunica
    s: 0x2e1f38, // sombra de la tunica
    r: 0x8c2f2f, // estola
    m: 0xd8cdbe, // manos
    g: 0x3a2c22, // botas y correas
  },
  // prettier-ignore
  filas: [
    '.......KK.......',
    '.......Kk.......',
    '......jKKk......',
    '......jKKk......',
    '......jKKk......',
    '.....jjKKkk.....',
    '.....jKKKkk.....',
    '.....jKKKkk.....',
    '....jjKKKKkk....',
    '....jKKKKKkk....',
    '...jjKKKKKkkk...',
    '...jKKKKKKkkk...',
    '...jjkkkkkkkj...',
    '...jkkkkkkkkj...',
    '...jknnnnnnkj...',
    '...jkkkkkkkkj...',
    '....kkkkkkkk....',
    '...kppppppppk...',
    '..kkppPPppppkk..',
    '..pppPPrrPPpp...',
    '.mppPPrrrrPPpm..',
    '.mmppPPrrPPppm..',
    '..mpppppppppm...',
    '...pppppppppp...',
    '...ppppspppp....',
    '...pppssppp.....',
    '...ppsssspp.....',
    '..ppssssspp.....',
    '..pssssssspp....',
    '..pss....ssp....',
    '..gss....ssg....',
    '.gggg....gggg...',
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
  // prettier-ignore
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
  // prettier-ignore
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
  // prettier-ignore
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
  // prettier-ignore
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
  // prettier-ignore
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

// -- Vestal ------------------------------------------------------------------
// Clero: erguido, tocado alto y tunica limpia. Se distingue del Devoto por la
// postura, no solo por el color: el Vestal no se dobla, administra.

const VESTAL: Figura = {
  paleta: {
    m: 0xd8cdbe, // tocado
    r: 0x6b6070, // tunica clerical
    s: 0x453d4d, // sombra
    o: 0xe8d9a0, // oro del sello
    p: 0x9a8878, // piel
  },
  // prettier-ignore
  filas: [
    '.......oo.......',
    '......oooo......',
    '......mmmm......',
    '.....mmmmmm.....',
    '.....mppppm.....',
    '.....mppppm.....',
    '......pppp......',
    '.....rrrrrr.....',
    '....rrrrrrrr....',
    '....rrroorrr....',
    '...prrroorrrp...',
    '...prrrrrrrrp...',
    '...prrrrrrrrp...',
    '....rrrrrrrr....',
    '....rrrsrrrr....',
    '....rrsssrrr....',
    '....rsssssrr....',
    '...rsssssssr....',
    '...rsssssssr....',
    '...rsssssssr....',
    '...rsssssssr....',
    '...rsssssssr....',
    '...rrsssssrr....',
    '...rrrsssrrr....',
    '..rrrrrrrrrr....',
    '..rrrrrrrrrr....',
  ],
};

// -- Sello del diezmo --------------------------------------------------------
// El proyectil del Vestal. Es pequeño y gira, asi que necesita contraste alto:
// tiene que verse llegar con tiempo para pararlo.

const SELLO: Figura = {
  paleta: {
    o: 0xe8d9a0, // lacre dorado
    i: 0x7d2b2b, // impronta
    s: 0xb9a878, // sombra
  },
  // prettier-ignore
  filas: [
    '..oooo..',
    '.oooooo.',
    'ooiiiioo',
    'oiiiiiio',
    'oiiiiiio',
    'ooiiiioo',
    '.ssssss.',
    '..ssss..',
  ],
};

// -- El Reformado ------------------------------------------------------------
// Jefe. Masa de carne con restos de instrumental fusionado y vendaje que ya no
// cubre nada. Conserva simetria y dos piernas: tiene que seguir leyendose como
// alguien que fue una persona, o el encuentro pierde su sentido. Donde estaria
// la cara no hay ojos: en la Diocesis, mirar no es cosa de lo que se venera.

const REFORMADO: Figura = {
  paleta: {
    c: 0x8c4f4f, // carne
    o: 0x5c2f33, // carne en sombra
    m: 0xb9c2c9, // instrumental fusionado
    v: 0xc9bda8, // vendaje
    n: 0x2a1a1e, // hueco
  },
  // prettier-ignore
  filas: [
    '.........cccccccc...........',
    '.......cccccccccccc.........',
    '......cccccccccccccc........',
    '.....cccccccccccccccc.......',
    '....cccccnnnnccccccccc......',
    '....ccccnnnnnncccccccc......',
    '....ccccnnnnnncccccccc......',
    '.....cccccnnnnccccccccc.....',
    '.....cccccccccccccccccc.....',
    '....cccccccccccccccccccc....',
    '...mmccccccccccccccccccmm...',
    '..mmmccccccccccccccccccmmm..',
    '..mmccccccccccccccccccccmm..',
    '..mcccccccvvvvcccccccccccm..',
    '..cccccccvvvvvvcccccccccc...',
    '..ccccccvvvvvvvvcccccccc....',
    '...cccccvvvvvvvvcccccccc....',
    '...ccccccvvvvvvcccccccc.....',
    '....cccccccccccccccccc......',
    '....ooccccccccccccccoo......',
    '....ooocccccccccccooo.......',
    '.....ooocccccccccooo........',
    '.....oooooccccooooo.........',
    '.....ooooo..ooooo...........',
    '....ooooo....ooooo..........',
    '....oooo......oooo..........',
    '....oooo......oooo..........',
    '...ooooo......ooooo.........',
    '...ooooo......ooooo.........',
    '..oooooo......oooooo........',
    '..cccccc......cccccc........',
    '.cccccccc....cccccccc.......',
  ],
};

// -- Reliquias ---------------------------------------------------------------
// Relicario de Carne (vitalidad) y Frasco Consagrado (pocion). Mas ricos en
// color que un fragmento del Codice: son un premio de cuerpo, no de lectura.

const RELICARIO: Figura = {
  paleta: {
    o: 0xc9a44c, // oro del relicario
    O: 0xf2dc8c, // reflejo
    c: 0x8c2f2f, // carne dentro
    C: 0xb85454, // carne clara
    s: 0x5c3a1a, // sombra
  },
  // prettier-ignore
  filas: [
    '...oOo...',
    '..oOOOo..',
    '.oOcCcOo.',
    'oOcCCCcOo',
    'oOcCcCcOo',
    'oOscCcsOo',
    '.oOsssOo.',
    '..ooooo..',
    '...sss...',
    '..sssss..',
  ],
};

const FRASCO: Figura = {
  paleta: {
    v: 0x8fa3a8, // vidrio
    V: 0xc2d1d4, // brillo del vidrio
    l: 0xa8563f, // liquido
    L: 0xc9705a, // liquido claro
    t: 0x3a2c22, // tapon
  },
  // prettier-ignore
  filas: [
    '...tt...',
    '...tt...',
    '..vVVv..',
    '..v..v..',
    '.vV..Vv.',
    '.vLllLv.',
    '.vlLLlv.',
    '.vlllLv.',
    '.vVllVv.',
    '..vvvv..',
  ],
};

// -- Decorado ----------------------------------------------------------------
// Piezas de escenografia sin colision. Existen para que cada zona tenga
// puntos de referencia: sin ellos todo son plataformas identicas y el jugador
// no sabe donde ha estado. Ninguna representa a un Primigenio.

const COLUMNA: Figura = {
  paleta: {
    a: 0x51473d,
    b: 0x453c33,
    c: 0x37302a,
    j: 0x241f1b,
  },
  // prettier-ignore
  filas: [
    'jjjjjjjjjjjj',
    'jaaaaaaaaaaj',
    'jaaaaaaaaaaj',
    'jjjjjjjjjjjj',
    '..jbbbbbbj..',
    ...Array<string>(32).fill('..jbbabbcbj.'.slice(0, 12)),
    '..jbbbbbbj..',
    'jjjjjjjjjjjj',
    'jaaaaaaaaaaj',
    'jjjjjjjjjjjj',
  ],
};

const VELA: Figura = {
  paleta: {
    F: 0xf5d78a, // llama clara
    f: 0xe8a03a, // llama
    w: 0xd8cdbe, // cera
    W: 0xb9a878, // cera en sombra
    p: 0x4a4038, // pie
  },
  // prettier-ignore
  filas: [
    '..F..',
    '.FfF.',
    '.fff.',
    '..w..',
    '.wwW.',
    '.wwW.',
    '.wwW.',
    '.wwW.',
    '.ppp.',
    'ppppp',
  ],
};

// Exvoto: ofrenda de agradecimiento colgada de una cadena. Una forma de
// extremidad en cera, como los exvotos reales, sin rostro.
const EXVOTO: Figura = {
  paleta: {
    k: 0x5c5c62, // cadena
    w: 0xd8cdbe, // cera
    W: 0xb9a878, // cera en sombra
    r: 0x8c2f2f, // cinta
  },
  // prettier-ignore
  filas: [
    '....k.....',
    '....k.....',
    '....k.....',
    '...rrr....',
    '...www....',
    '...wwW....',
    '...wwW....',
    '..wwwW....',
    '.wwwwWW...',
    'wwWwwWW...',
    'wWW.wWW...',
    '.....WW...',
    '......W...',
  ],
};

const CHARCO: Figura = {
  paleta: {
    r: 0x5c1f24,
    R: 0x7d2b2b,
  },
  // prettier-ignore
  filas: [
    '......rrrrr.......',
    '...rrrRRRRrrrr....',
    '.rrrRRRRRRRrrrrr..',
    'rrrRRRRrRRRRrrrrrr',
    '.rrrrrrrrrrrrrrr..',
  ],
};

// Altar-camilla: la mesa del sacramento. Metal quirurgico con correas.
const CAMILLA: Figura = {
  paleta: {
    m: 0x8fa3a8, // metal
    M: 0xc2d1d4, // brillo
    d: 0x5c6b70, // metal en sombra
    c: 0x3a2c22, // correas
    r: 0x8c2f2f, // mancha
  },
  // prettier-ignore
  filas: [
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'mmmmcmmmmmmmmmrrmmmmmmmmmcmmmmmm',
    'mmmmcmmmmmmmmrrrrmmmmmmmmcmmmmmm',
    'dddddddddddddddddddddddddddddddd',
    '..dd......................dd....',
    '..dd......................dd....',
    '..dd......................dd....',
    '..dd......................dd....',
    '..dd......................dd....',
    '..dd......................dd....',
    '.dddd....................dddd...',
    '.dddd....................dddd...',
  ],
};

// Placa del Registro: una inscripcion de la Diocesis fijada al muro.
const PLACA: Figura = {
  paleta: {
    m: 0x8fa3a8, // metal
    M: 0xc2d1d4, // brillo
    d: 0x5c6b70, // sombra
    i: 0x2a2428, // grabado
  },
  // prettier-ignore
  filas: [
    'MMMMMMMMMMMMMM',
    'MmiimimiimimmM',
    'Mmmmmmmmmmmmmm',
    'MmiiimiimiimmM',
    'Mmmmmmmmmmmmmm',
    'MmiimiiimimmmM',
    'Mmmmmmmmmmmmmm',
    'dddddddddddddd',
  ],
};

// Durmiente: un Elegido sedado sobre su camilla, esperando turno. Sin rostro,
// cubierto hasta la cabeza: lo que se guarda en las Criptas no se mira.
const DURMIENTE: Figura = {
  paleta: {
    w: 0xd8cdbe, // sabana
    W: 0xb9a878, // sabana en sombra
    p: 0x9a8878, // piel
  },
  // prettier-ignore
  filas: [
    '....wwwwwwwwwwwwww....',
    '..wwwwwwwwwwwwwwwwww..',
    '.wwwwWWWWWWWWWWWWwwwp.',
    'wWWWWWWWWWWWWWWWWWWppp',
    'WWWWWWWWWWWWWWWWWWWWpp',
  ],
};

// Reja: la puerta de una cripta. Deja ver lo que hay detras.
const REJA: Figura = {
  paleta: {
    k: 0x5c5c62, // hierro
    K: 0x8a8a92, // brillo
    d: 0x2e2e33, // sombra
  },
  // prettier-ignore
  filas: [
    'kkkkkkkkkkkkkkkk',
    'Kd.Kd.Kd.Kd.Kd.K',
    ...Array<string>(26).fill('Kd.Kd.Kd.Kd.Kd.K'),
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'Kd.Kd.Kd.Kd.Kd.K',
    'Kd.Kd.Kd.Kd.Kd.K',
    'kkkkkkkkkkkkkkkk',
  ],
};

const FIGURAS: Record<string, Figura> = {
  cirujano: CIRUJANO,
  devoto: DEVOTO,
  vestal: VESTAL,
  sello: SELLO,
  reformado: REFORMADO,
  piedra: PIEDRA,
  altar: ALTAR,
  codice: CODICE,
  umbral: UMBRAL,
  relicario: RELICARIO,
  frasco: FRASCO,
  columna: COLUMNA,
  vela: VELA,
  exvoto: EXVOTO,
  charco: CHARCO,
  camilla: CAMILLA,
  placa: PLACA,
  durmiente: DURMIENTE,
  reja: REJA,
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
