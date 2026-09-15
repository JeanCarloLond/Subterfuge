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
// EL MEDICO DE LA PESTE DE LA DIOCESIS, segun el diseno del equipo: capucha y
// mozeta moradas, mascara de pico en oro con la cuenca en negro, y sobretodo
// azul noche con botones y hebilla de oro. La paleta sale del propio boceto,
// no esta inventada.
//
// Tres cosas que no se pueden perder al pasarlo a Aseprite:
//
//   1. El PICO dorado. Es la silueta, y lo unico brillante que lleva encima.
//      Se tiene que reconocer a contraluz, que es como se le vera media
//      partida.
//   2. El morado contra el azul noche. La mozeta es lo que le da volumen de
//      hombros sin darle hombros de heroe: sigue siendo un tecnico.
//   3. La cuenca negra del ojo. En la Diocesis mirar es preguntar, y el habito
//      clerical lo tapa.
//
// Mira a la derecha; el codigo voltea la textura.

const CIRUJANO: Figura = {
  paleta: {
    n: 0x0c081f, // negro del hueco de la capucha y el contorno
    N: 0x211746, // sobretodo, azul noche
    q: 0x3a2a55, // morado en sombra
    p: 0x51356a, // morado de la capucha y la mozeta
    P: 0x775d91, // morado iluminado
    L: 0x846d96, // morado, luz alta
    k: 0xe3a940, // oro medio
    K: 0xfcd038, // oro del pico
    Y: 0xf4ed93, // oro palido, reflejo
    j: 0xcb6e2f, // ambar: el pico en sombra
    m: 0x5d3927, // la barbilla que asoma bajo la mascara
  },
  // prettier-ignore
  filas: [
    '......qppppppq..........',
    '....qppPPPPPPppq........',
    '...qppPPPPPPPPppq.......',
    '..qppPPPPPPPPPPppq......',
    '..qppPPPnnnnnPPppq......',
    '..qppPPnkkkkknPppq......',
    '..qppPPnkKKKKkkjq.......',
    '..qppPPnkKYnKKkkjj......',
    '..qppPPnkKKnKKkkkjj.....',
    '..qppPPnkkKKkkkkjjj.....',
    '..qppPPnnkkkkkjjjj......',
    '..qppPPnnmkkkjjj........',
    '..qppPPqnmmkjj..........',
    '..qppPPq.mmjj...........',
    '.qppppppppq.............',
    'qppPPPPPPPPppq..........',
    'qppPPPPPPPPPPPppq.......',
    '.qppPPPPPPPPPPppq.......',
    '..qppppppppppppq........',
    '...qppPPPPPPPPpq........',
    '..qppPPPPPPPPPPpq.......',
    '..qpppppppppppppq.......',
    '....NNNNNNKNNNNN........',
    '....NNNNNNnNNNNN........',
    '....NNNNNNKNNNNN........',
    '....NNNNNNnNNNNN........',
    '....NNNNNNKNNNNN........',
    '...NpppppppppppN........',
    '...NpkKYKkppppppN.......',
    '...NpppppppppppN........',
    '...NNNNNNNNNNNNN........',
    '...NNNNNNNNNNNNN........',
    '...NNNNNnNNNNNNN........',
    '...NNNNNnnNNNNNN........',
    '..NNNNNnnnNNNNNNN.......',
    '..NNNNnnnnnNNNNNN.......',
    '..NNNNnnnnnNNNNNN.......',
    '..NNNnnn...nnnNNNN......',
    '..nnnnn.....nnnnnn......',
    '..nnnn.......nnnnn......',
  ],
};

// -- Devoto ------------------------------------------------------------------
//
// Fiel de abajo. El ethos del bible manda: "el estatus social se mide por
// cuanto te pareces fisicamente a un dios-carne". El Devoto esta en la base,
// asi que aun se le reconoce la persona debajo — y eso es lo que da miedo.
//
// Pero el diezmo que ya pago se VE: la carne le sale por donde el sacramento
// no cerro, al rojo vivo, y lo que le faltaba se lo repusieron con aparato de
// Genesis Vestal. Carne y maquina a partes desiguales, como en las laminas.
//
// DOS VARIANTES, y el motivo no es decorativo: con una sola, una ronda de
// cuatro Devotos parecia el mismo hombre copiado cuatro veces. El sacramento
// no falla dos veces igual, asi que a cada uno le falta otra cosa.
//
//   A: placa en la sien, brazo derecho de aparato, la carne le sube del pecho.
//   B: mandibula de metal, pierna izquierda entera sustituida, la carne le
//      revienta el costado derecho.
//
// La venda sobre los ojos en los dos: aqui mirar no da estatus.

const DEVOTO: Figura = {
  paleta: {
    h: 0x9a7f66, // piel
    v: 0xd8cdbe, // vendas
    g: 0x5c4636, // sayo
    G: 0x715847, // sayo iluminado
    d: 0x2e231b, // sombra y contorno
    c: 0x8c2f2f, // carne
    C: 0xb03a34, // carne viva
    R: 0xd4564a, // carne al rojo, lo que ya no cierra
    t: 0x7fc9bd, // fluido de Genesis Vestal
    M: 0x9ca193, // metal
    S: 0x5b5c57, // metal en sombra
    n: 0x1e1611, // negro
  },
  // prettier-ignore
  filas: [
    '.......dddddd.........',
    '......dhhhhhhd........',
    '.....dhhhhhhhhd.......',
    '.....dvvvvvvMMd.......',
    '.....dvvvvvvMSd.......',
    '.....dhhhhhhMSd.......',
    '......dccccctSd.......',
    '.....dcCCccctSd.......',
    '....dcCCCccccSSd......',
    '...dcCCRRCccccSMd.....',
    '...dcCRRRRCcccMMMd....',
    '...dcCRRRRCccMMttMd...',
    '..vdcCRRRRCcMMttMMd...',
    '..vdcCCRRCccMttttMd...',
    '...dccCCCccccMMttMd...',
    '...dgccCCcccccMMMd....',
    '...dggcccccccgMMd.....',
    '...dgggcccccggd.......',
    '...dggggcgggggd.......',
    '...ddgggcggggd........',
    '..ddgggcccgggd........',
    '..dggccccccggd........',
    '..dgcc....ccgd........',
    '..dgcc....ccgd........',
    '..dgdd....ccgd........',
    '..dggd....ccgd........',
    '..dggd....cSSd........',
    '..dggd....dSSd........',
    '..dggd....dSSd........',
    '.ddggd....dSSdd.......',
    '.nnggd....dSSnn.......',
    '.nnnn......nnnn.......',
    '..nn........nn........',
    '......................',
  ],
};

const DEVOTO_B: Figura = {
  paleta: {
    h: 0x9a7f66, // piel
    v: 0xd8cdbe, // vendas
    g: 0x5c4636, // sayo
    G: 0x715847, // sayo iluminado
    d: 0x2e231b, // sombra y contorno
    c: 0x8c2f2f, // carne
    C: 0xb03a34, // carne viva
    R: 0xd4564a, // carne al rojo, lo que ya no cierra
    t: 0x7fc9bd, // fluido de Genesis Vestal
    M: 0x9ca193, // metal
    S: 0x5b5c57, // metal en sombra
    n: 0x1e1611, // negro
  },
  // prettier-ignore
  filas: [
    '.......dddddd.........',
    '......dhhhhhhd........',
    '.....dhhhhhhhhd.......',
    '.....dvvvvvvvhd.......',
    '.....dvvvvvvvhd.......',
    '.....dMMMMMMMSd.......',
    '......dMSSSSMd........',
    '.......dttSMd.........',
    '.....ddgggggtd........',
    '....dggGGGGggtd.......',
    '...dggGGGGGGgcd.......',
    '...dgGGGGGGgcCCd......',
    '..vdgGGGGGGcCRRCd.....',
    '..vdggGGGGcCRRRRCd....',
    '...dgggGGGcCRRRRCd....',
    '...dggggGGcCRRRCcd....',
    '...dgggggggcCCCccd....',
    '...dggggggggcccdd.....',
    '...dggggdgggccd.......',
    '...ddgggddggccd.......',
    '..ddggdddddgccd.......',
    '..dgddddddddgcd.......',
    '..dMMd....ddgd........',
    '..dMSd....ddgd........',
    '..dMSd....ddgd........',
    '..dMSd....dggd........',
    '..dMSd....dggd........',
    '..dMSd....dggd........',
    '..dMSd....dggd........',
    '.ddMSd....dggdd.......',
    '.nnMSd....dggnn.......',
    '.nnMMn.....nnnn.......',
    '..nnn.......nn........',
    '......................',
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
//
// Alto clero, y por tanto MAS carne y MAS maquina: por el mismo ethos que deja
// al Devoto casi entero, subir en la Diocesis significa parecerse mas a un
// dios-carne y conservar menos cuerpo propio.
//
// Aqui la carne ya no es una herida, es el cuerpo: le desborda el habito y se
// derrama hasta el suelo, al rojo vivo. Del hombre queda un aparato de metal
// que le cubre la cara entera, con una lente turquesa por unico rasgo, y una
// costilla de metal con su respiradero en mitad de la masa.
//
// El sello del diezmo en el pecho, en oro, es su cargo: el que sella lo que se
// cobra. Erguido, nunca encorvado. El Devoto se dobla; el Vestal administra.

const VESTAL: Figura = {
  paleta: {
    o: 0xcda058, // oro del sello y el collar
    O: 0xe7ce9f, // oro, reflejo
    r: 0x5d5466, // lo que queda del habito
    R: 0xd4564a, // carne al rojo
    s: 0x342f3e, // sombra
    p: 0x9a8878, // piel
    c: 0x8c2f2f, // carne en sombra
    C: 0xb03a34, // carne
    t: 0x7fc9bd, // lente y respiradero
    T: 0xc9dcc8, // brillo de la lente
    n: 0x1e1611, // impronta del sello
    M: 0x9ca193, // metal
    S: 0x3f4a4e, // metal en sombra
  },
  // prettier-ignore
  filas: [
    '.........oo...........',
    '........oOOo..........',
    '........oOOo..........',
    '.........oo...........',
    '.......MMMMMM.........',
    '......MMSSSSMM........',
    '.....MMSSSSSSMM.......',
    '.....MSSttttSSM.......',
    '.....MSTtTTtTSSM......',
    '.....MSSttttSSMt......',
    '.....MMSSSSSSMtt......',
    '......MMSSSSMMt.......',
    '......oocccccot.......',
    '.....oocCCCCCcoo......',
    '....rrcCRRRRRCcrr.....',
    '...rrrcCRRRRRCcrrr....',
    '..prrRcCRRRRRCcRrrp...',
    '..prrRRoooooooRRrrp...',
    '..prrRRoOnnnOoRRrrp...',
    '..prrRRoOnnnOoRRrrp...',
    '..prrRRoooooooRRrrp...',
    '...rrRcCRRRRRCcRrr....',
    '...rrcCRRRRRRRCcrr....',
    '...ocCRRRRRRRRRCco....',
    '....cCRRRRRRRRRCc.....',
    '....cCRRRRRRRRRCc.....',
    '...cCRRRRRRRRRRRCc....',
    '...cCRRRRRRRRRRRCc....',
    '..cCRRRRRRRRRRRRRCc...',
    '..cCRRRRRMMRRRRRRCc...',
    '..cCRRRRMttMRRRRRCc...',
    '..cCRRRRRMMRRRRRRCc...',
    '..ccCRRRRRRRRRRRCcc...',
    '...ccCRRRRRRRRRCcc....',
    '....ccCCRRRRRCCcc.....',
    '.....cccCCCCCccc......',
    '...ccc.cccccc.ccc.....',
    '..ccc....cccc....cc...',
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

// El Reformado: un Elegido que sobrevivio a medias al sacramento. Es el
// jefe, asi que tiene que leerse distinto de todo lo demas a primera vista
// (issue #31): mas grande que un Devoto (44x40 frente a 16x32), a cuatro
// patas, y con las tres cosas que cuentan lo que es. Una joroba de carne con
// el instrumental del quirofano todavia fundido dentro (el retractor del
// lomo, la pinza del flanco). La cabeza vendada y SIN OJOS: lo que la
// doctrina santifica en los dioses aqui es solo lo que el sacramento le quito.
// Y el sello dorado del Elegido en el pecho: la Diocesis lo marco como
// bendecido antes de hacerle esto.
//
// Dos cuadros: en el segundo la joroba se hincha y la cabeza cae un pixel.
// Es la respiracion. Un jefe quieto parecia un mueble.
const REFORMADO: Figura = {
  paleta: {
    c: 0x8c4f4f, // carne
    C: 0xa86a66, // carne a la luz
    o: 0x5c2f33, // carne en sombra y pliegues
    n: 0x2a1a1e, // hueco
    m: 0xb9c2c9, // instrumental fundido
    M: 0xe4e9ee, // brillo del metal
    v: 0xc9bda8, // vendaje
    V: 0x9a8d78, // vendaje sucio
    s: 0x3a1418, // sutura
    r: 0xc03a3a, // herida abierta
    h: 0xe6ddc8, // hueso
    g: 0xc9a44c, // sello del Elegido
    G: 0xf2dc8c, // reflejo del sello
  },
  // prettier-ignore
  filas: [
    '........M........M..........................',
    '........mMmmmmmmmM..........................',
    '.........m.oooo.m...........................',
    '.......ccmccccccmcc.........................',
    '......ccCmccccccmcccc.......................',
    '.....ccCCCcccscccccccccc....................',
    '....ccCCccccscscsccccccccc..................',
    '....ccCccccccccscccccccccccc......vvvv......',
    '...cccccccccccccscccccccccccccoo.vvvvvv.....',
    '...ccccccccccccscscsccccccccccoovVvvvvVv....',
    '.M.cccccccccccccccscccccccccccovvvvvvvvvv...',
    '.mmmcccccccccccccccsccccccccccoVvvvvvvvvV...',
    '.mmcccccccccccccccscscscccccccocVVVVVVVVc...',
    '.mmccccccccccccccccccccccccccccccccccccCc...',
    '.mmccccccccccccccccccccrrcccccccchnhnhncc...',
    '.mmcccccccccccccccccccrnrcccccccccnnnnncc...',
    '.mmmccccccccccccccccccrnnrccccccoccccccco...',
    '..mccccccccccccccccccccrnrcccccccoooooo.....',
    '...cccccccccccccccccccccrcccccooooccccc.....',
    '...ccccooooocccccccccccccccccccggccccccc....',
    '...cccooocccooocccccccccccccccgGGgccccccc...',
    '...ccccccccccccoooccccccccccccgGggccccccc...',
    '....ccccccccccccccccoooooocooccggcccccccc...',
    '....oocccooooccccccccccccccccccccoooccccc...',
    '.....ooooccccccccccccccccccccccccccccccc....',
    '.....ooooccccccccccccccccccccccccccccccc....',
    '.....ooooooooooooooooooooooooooooooooooo....',
    '......cccccc.....cccccc..........ccccccc....',
    '......cccccc.....cccccc...........ccccccc...',
    '......cccccc.....cccccc............cccccc...',
    '......cccccc.....cccccc............cccccc...',
    '.......cccco......cccco.............ccccc...',
    '.......cccco......cccco.............ccccc...',
    '.......cccco......cccco.............cccccc..',
    '.......cccco......cccco.............cccccc..',
    '.......cccco......cccco............ccccccc..',
    '.......cccco......cccco...........ccccccccc.',
    '.....occccccc...ccccccco.........occcccccc..',
    '....ooccccccc..occcccccc........hhchchchchhh',
    '....oooooooo...oooooooo.........h..h..h..h.h',
  ],
};

const REFORMADO_RESPIRA: Figura = {
  paleta: {
    c: 0x8c4f4f, // carne
    C: 0xa86a66, // carne a la luz
    o: 0x5c2f33, // carne en sombra y pliegues
    n: 0x2a1a1e, // hueco
    m: 0xb9c2c9, // instrumental fundido
    M: 0xe4e9ee, // brillo del metal
    v: 0xc9bda8, // vendaje
    V: 0x9a8d78, // vendaje sucio
    s: 0x3a1418, // sutura
    r: 0xc03a3a, // herida abierta
    h: 0xe6ddc8, // hueso
    g: 0xc9a44c, // sello del Elegido
    G: 0xf2dc8c, // reflejo del sello
  },
  // prettier-ignore
  filas: [
    '........M........M..........................',
    '........mMmmmmmmmM..........................',
    '.........m.oooo.m...........................',
    '......ccCmccccccmccc........................',
    '.....cccCmccccccmccccc......................',
    '....cccCCCcccsccccccccccc...................',
    '...cccCCccccscscscccccccccc.................',
    '...cccCccccccccsccccccccccccc...............',
    '..ccccccccccccccscccccccccccccoo..vvvv......',
    '...ccccccccccccscscsccccccccccoo.vvvvvv.....',
    '.M.cccccccccccccccscccccccccccocvVvvvvVv....',
    '.mmmcccccccccccccccsccccccccccovvvvvvvvvv...',
    '.mmcccccccccccccccscscscccccccoVvvvvvvvvV...',
    '.mmcccccccccccccccccccccccccccccVVVVVVVVc...',
    '.mmccccccccccccccccccccrrccccccccccccccCc...',
    '.mmcccccccccccccccccccrnrrccccccchnhnhncc...',
    '.mmmccccccccccccccccccrnnrrcccccccnnnnncc...',
    '..mccccccccccccccccccccrnrccccccoccccccco...',
    '...cccccccccccccccccccccrcccccooooooooo.....',
    '...ccccooooooccccccccccccccccccggccccccc....',
    '...cccooocccooocccccccccccccccgGGgccccccc...',
    '...ccccccccccccoooccccccccccccgGggccccccc...',
    '....ccccccccccccccccoooooocooccggcccccccc...',
    '....oocccooooccccccccccccccccccccoooccccc...',
    '.....ooooccccccccccccccccccccccccccccccc....',
    '.....ooooccccccccccccccccccccccccccccccc....',
    '.....ooooooooooooooooooooooooooooooooooo....',
    '......cccccc.....cccccc..........ccccccc....',
    '......cccccc.....cccccc...........ccccccc...',
    '......cccccc.....cccccc............cccccc...',
    '......cccccc.....cccccc............cccccc...',
    '.......cccco......cccco.............ccccc...',
    '.......cccco......cccco.............ccccc...',
    '.......cccco......cccco.............cccccc..',
    '.......cccco......cccco.............cccccc..',
    '.......cccco......cccco............ccccccc..',
    '.......cccco......cccco...........ccccccccc.',
    '.....occccccc...ccccccco.........occcccccc..',
    '....ooccccccc..occcccccc........hhchchchchhh',
    '....oooooooo...oooooooo.........h..h..h..h.h',
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

// La columna comparte paleta con la silleria del equipo a proposito: esta
// tallada en la misma piedra del Vientre. Con los grises de antes se leia como
// otro material distinto plantado en mitad del muro.
const COLUMNA: Figura = {
  paleta: {
    a: 0x805454,
    b: 0x6c4444,
    c: 0x603c3c,
    j: 0x2c1c1c,
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

// Carne del diezmo: lo que deja un Devoto al caer. Un pedazo, sin mas.
const CARNE: Figura = {
  paleta: {
    c: 0x8c2f2f,
    C: 0xb85454,
    o: 0x5c1f24,
  },
  // prettier-ignore
  filas: [
    '..cCc..',
    '.cCCCc.',
    'cCCCCcc',
    'cCCccco',
    '.ccooo.',
    '..ooo..',
  ],
};

// Ventana ojival: para el fondo lejano. Un resto de luz de arriba que ya no
// ilumina nada. Es lo que dice que esto fue una catedral antes que un pozo.
const VENTANA: Figura = {
  paleta: {
    m: 0x2a2230, // marco
    v: 0x3a3048, // vidrio
    V: 0x4a3d5c, // vidrio con algo de luz
  },
  // prettier-ignore
  filas: [
    '......mm......',
    '.....mvvm.....',
    '....mvVVvm....',
    '...mvVVVVvm...',
    '..mvVVVVVVvm..',
    '..mvVVVVVVvm..',
    '.mvvVVmmVVvvm.',
    '.mvvVVmmVVvvm.',
    ...Array<string>(22).fill('.mvvvvmmvvvvm.'),
    '.mvvvvmmvvvvm.',
    '.mmmmmmmmmmmm.',
    '.mmmmmmmmmmmm.',
  ],
};

// Cadena colgando del techo. Hay ganchos en todo el Vientre; lo que colgaba de
// ellos no se muestra.
const CADENA: Figura = {
  paleta: {
    k: 0x4a4a52,
    K: 0x6a6a72,
  },
  // prettier-ignore
  filas: [
    'kKk',
    'k.k',
    'kKk',
    '.k.',
    ...Array<string>(40).fill('.k.').map((f, i) => (i % 4 === 1 ? 'kKk' : i % 4 === 3 ? 'k.k' : f)),
    'kKk',
    'k.k',
    'kKk',
  ],
};

// -- La capa de debajo: Genesis Vestal ---------------------------------------
//
// El world bible describe el mundo como un "futuro sedimentado": "la maquinaria
// avanzada sigue ahi, pero cubierta de siglos de cera, oxido, tela y hueso". El
// juego era todo piedra, cera y oro — puro medievo, sin el otro lado.
//
// Estas tres piezas son ese otro lado asomando. Van en turquesa frio, el unico
// color del juego que no es carne, sangre, oro ni piedra, y por eso se leen
// como algo que NO pertenece a la Diocesis aunque la Diocesis viva encima.
//
// Cuanto mas abajo, mas maquina: en el Atrio apenas una terminal muerta; en el
// Vientre Profundo la arquitectura ya seria esto.

// Terminal de Genesis Vestal. Nadie sabe leerla desde hace generaciones.
const PANTALLA: Figura = {
  paleta: {
    n: 0x1e1611, // contorno
    M: 0x9ca193, // carcasa
    a: 0x333e42, // cristal apagado
    T: 0x7fc9bd, // lo que aun parpadea
    d: 0x5b5c57, // soporte
  },
  // prettier-ignore
  filas: [
    'nnnnnnnnnnnnnnnn',
    'nMMMMMMMMMMMMMMn',
    'nMaaaaaaaaaaaaMn',
    'nMaTTaaaaTTTaaMn',
    'nMaaaaaaaaaaaaMn',
    'nMaaTTTaaaaaTaMn',
    'nMaaaaaaaaaaaaMn',
    'nMaTaaaTTaaaaaMn',
    'nMaaaaaaaaaaaaMn',
    'nMMMMMMMMMMMMMMn',
    'nnddddddddddddnn',
    '..d..........d..',
  ],
};

// Conducto. Lo que lleva por dentro ya no se distingue de una vena.
const CONDUCTO: Figura = {
  paleta: {
    n: 0x1e1611,
    M: 0x9ca193, // abrazaderas
    t: 0x487b84, // fluido
    T: 0x7fc9bd, // fluido, brillo
    d: 0x5b5c57,
  },
  // prettier-ignore
  filas: [
    'ndddddddn',
    'dMMMMMMMd',
    'dMttttttM',
    'dMtTTttTM',
    'dMttttttM',
    'dMMMMMMMd',
    'ndddddddn',
    '.n.....n.',
    'ndddddddn',
    'dMMMMMMMd',
    'dMttTtttM',
    'dMttttTtM',
    'dMttttttM',
    'dMMMMMMMd',
    'ndddddddn',
  ],
};

// La maquina del sacramento: carcasa de Genesis Vestal fundida con la carne que
// lleva siglos procesando. Es la lamina del world bible hecha sprite.
const MAQUINA: Figura = {
  paleta: {
    n: 0x1e1611,
    M: 0x9ca193, // carcasa
    a: 0x333e42, // cristal
    T: 0x7fc9bd, // senal
    t: 0x487b84, // tubos
    c: 0x8c4f4f, // carne
    C: 0xb06a5c, // carne, luz
  },
  // prettier-ignore
  filas: [
    '......nnnnnnnn........',
    '....nnMMMMMMMMnn......',
    '...nMMMMMMMMMMMMn.....',
    '..nMMaaaaaaaaMMMMn....',
    '..nMMaTTaaaTaaMMMMn...',
    '..nMMaaaaaaaaaMMMMn...',
    '..nMMMMMMMMMMMMMMMn...',
    '..nMMMMMMMMMMMMMMMn...',
    '...nMMMMMMMMMMMMMn....',
    '..t.nnMMMMMMMMnn.t....',
    '..t..cccccccccc..t....',
    '..tttcCccccccCcttt....',
    '...ccccccccccccccc....',
    '..ccCccccccccccCccc...',
    '.ccccccccccccccccccc..',
    'cccCcccccccccccccCccc.',
    'ccccccccccccccccccccc.',
    '.ccccccccccccccccccc..',
    '..nccccccccccccccnn...',
    '...nnnccccccccnnn.....',
  ],
};

const FIGURAS: Record<string, Figura> = {
  cirujano: CIRUJANO,
  devoto: DEVOTO,
  'devoto-b': DEVOTO_B,
  vestal: VESTAL,
  sello: SELLO,
  reformado: REFORMADO,
  'reformado-2': REFORMADO_RESPIRA,
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
  pantalla: PANTALLA,
  conducto: CONDUCTO,
  maquina: MAQUINA,
  carne: CARNE,
  ventana: VENTANA,
  cadena: CADENA,
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
  resplandor(escena, 'brillo-placeholder', 96);
  vineta(escena, 'vineta-placeholder', 480, 320);
}

/**
 * Resplandor radial para velas y Altares. Se dibuja con el canvas del
 * navegador porque Graphics no sabe de degradados; en modo ADD sobre la escena
 * funciona como una luz. Es lo que hace que una vela parezca ENCENDIDA y no
 * solo pintada.
 */
function resplandor(escena: Phaser.Scene, clave: string, diametro: number): void {
  if (escena.textures.exists(clave)) return;
  const lienzo = escena.textures.createCanvas(clave, diametro, diametro);
  if (!lienzo) return;

  const ctx = lienzo.getContext();
  const centro = diametro / 2;
  const grad = ctx.createRadialGradient(centro, centro, 0, centro, centro, centro);
  grad.addColorStop(0, 'rgba(255, 214, 140, 0.55)');
  grad.addColorStop(0.35, 'rgba(232, 160, 58, 0.22)');
  grad.addColorStop(1, 'rgba(232, 160, 58, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, diametro, diametro);
  lienzo.refresh();
}

/**
 * Vineta: oscurece los bordes de la pantalla. Fija a la camara, encima de
 * todo. Concentra la mirada en el centro y hace que el Vientre parezca mas
 * hondo de lo que es.
 */
function vineta(escena: Phaser.Scene, clave: string, ancho: number, alto: number): void {
  if (escena.textures.exists(clave)) return;
  const lienzo = escena.textures.createCanvas(clave, ancho, alto);
  if (!lienzo) return;

  const ctx = lienzo.getContext();
  const grad = ctx.createRadialGradient(
    ancho / 2,
    alto / 2,
    alto * 0.35,
    ancho / 2,
    alto / 2,
    Math.max(ancho, alto) * 0.72,
  );
  grad.addColorStop(0, 'rgba(11, 9, 11, 0)');
  grad.addColorStop(1, 'rgba(11, 9, 11, 0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ancho, alto);
  lienzo.refresh();
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
