import Phaser from 'phaser';

/**
 * ARTE PROVISIONAL de la cinematica del sacramento (issue #147). NO ES EL ARTE
 * FINAL.
 *
 * Como ArteProvisional: pixel art escrito a mano, caracter a caracter. Cada
 * dibujo tiene una base y unos fotogramas que solo reescriben las filas que
 * cambian (los ojos de la nina, el tejido que va hacia el filo, el brillo del
 * pico).
 *
 * Los primeros planos son mas grandes que cualquier sprite del juego porque se
 * ven a x4 y x5: es lo que hace que la cinematica se lea como cine y no como
 * una partida con las manos quietas.
 *
 * Las texturas se llaman `cine-<clave>` y `cine-<clave>-<fotograma>`. Si ya
 * existe una con esa clave porque PreloadScene cargo el PNG del equipo, no se
 * pinta encima. La nina sale del arte conceptual del equipo («La nina
 * ofrenda»): melena corta, tunica blanca, descalza. Sin cruces.
 */

interface Dibujo {
  paleta: Record<string, number>;
  filas: readonly string[];
  /** Fotograma -> filas que cambian respecto a la base. */
  fotogramas: Readonly<Record<string, Readonly<Record<number, string>>>>;
}

// La nina sentada en la camilla, de frente, como en el arte conceptual.
const NINA_SENTADA: Dibujo = {
  paleta: {
    h: 0x2e211c,
    H: 0x55402f,
    s: 0xd9b59c,
    S: 0xb38c76,
    o: 0x6a4a40,
    e: 0x1e1611,
    t: 0xd6cebc,
    T: 0xa69c88,
    r: 0x8c2f2f,
  },
  // prettier-ignore
  filas: [
    '....hhhhhh....',
    '...hHHHHHHh...',
    '..hHhhhhhhhHh.',
    '..hhsssssssh..',
    '..hhsoosooshh.',
    '..hhssssssshh.',
    '..hhhsSSSshhh.',
    '...hhhsssshh..',
    '...htttttth...',
    '..tttttttttt..',
    '.ttTtttrtttTt.',
    '.sTttttttttTs.',
    '.sTttttttttTs.',
    '..sTtssssTts..',
    '..tTttttttTt..',
    '..TTTTTTTTTT..',
    '...tTttttTt...',
    '....ss..ss....',
    '....ss..ss....',
    '....SS..SS....',
  ],
  // prettier-ignore
  fotogramas: {
    'despierta': {
      4: '..hhseeseeshh.',
    },
  },
};

// De pie y de perfil, mirando a la derecha: la que se va con el.
const NINA_PIE: Dibujo = {
  paleta: {
    h: 0x2e211c,
    H: 0x55402f,
    s: 0xd9b59c,
    S: 0xb38c76,
    e: 0x1e1611,
    t: 0xd6cebc,
    T: 0xa69c88,
  },
  // prettier-ignore
  filas: [
    '...hhhh...',
    '..hHHHHh..',
    '.hHhhhhhh.',
    '.hhhhssss.',
    '.hhhhsess.',
    '.hhhhssss.',
    '..hhhsSs..',
    '..hhhss...',
    '...tttt...',
    '..tttttt..',
    '..tTttts..',
    '..tTttts..',
    '..tTtttS..',
    '..tTtttt..',
    '..tTtttt..',
    '..TTtttt..',
    '..TTTttt..',
    '..TTTTTT..',
    '...ss.ss..',
    '...ss.ss..',
    '...ss.ss..',
    '...SS.SSS.',
  ],
  // prettier-ignore
  fotogramas: {
    'paso-a': {
      18: '...ss..ss.',
      19: '..ss...ss.',
      20: '..ss....ss',
      21: '.SS.....SS',
    },
    'paso-b': {
      18: '...sss....',
      19: '....ss....',
      20: '....ss....',
      21: '....SSS...',
    },
  },
};

// Primer plano, se ve a x5. Ojos cerrados, abiertos y mirando hacia arriba.
const NINA_CARA: Dibujo = {
  paleta: {
    h: 0x2e211c,
    H: 0x55402f,
    s: 0xd9b59c,
    S: 0xb38c76,
    b: 0xd99a8a,
    o: 0x6a4a40,
    e: 0x1e1611,
    W: 0xf2e6d6,
    m: 0x9a5a50,
    t: 0xd6cebc,
    T: 0xa69c88,
    r: 0x8c2f2f,
    w: 0xe6dccb,
  },
  // prettier-ignore
  filas: [
    '...................HHHHHHHHHHH..................',
    '................HHHhhhhhhhhhhhHHH...............',
    '...............HhhhhhhhhhhhhhhhhhH..............',
    '.............HHhhhhhhhhhhhhhhhhhhhHH............',
    '............HhhhhhhhhhhhhhhhhhhhhhhhH...........',
    '...........HhhhhhhhhhhhhhhhhhhhhhhhhhH..........',
    '..........HhhhhhhhhhhhhhhhhhhhhhhhhhhhH.........',
    '..........HhhhhhhhhhhhhhhhhhhhhhhhhhhhH.........',
    '.........HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH........',
    '.........HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH........',
    '........HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH.......',
    '........HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH.......',
    '........HhhhhhhhhhhshhhshshhhshhhhhhhhhhH.......',
    '........HhhhhhhhshssshssssshsssSShhhhhhhH.......',
    '........HhhhhhhssssrsssssssssssSSShhhhhhH.......',
    '.......HhhhhhhhssssssssssssssssSSShhhhhhhH......',
    '........HhhhhhhssssssssssssssssSSShhhhhhH.......',
    '........HhhhhhsosssssossssossssSoSShhhhhH.......',
    '........hhhhhhssooooossssssoooooSSShhhhhh.......',
    '........hhhhhhsssssssssssssssssSSSShhhhhh.......',
    '........hhhhhhsssssssssssssssssSSSShhhhhh.......',
    '.........hhhhhsbbbssssssssssssbbbSShhhhh........',
    '.........hhhhhssssssssssSssssssSSSShhhhh........',
    '..........hhhhsssssssssssSsssssSSSShhhh.........',
    '..........hhhhhssssssssssssssssSSShhhhh.........',
    '...........hhhhssssssssssssssssSSShhhh..........',
    '.........hhhhhhsssssssmmmmmssssSSShhhhhh........',
    '.........hhhhhhhsssssssssssssssSShhhhhhh........',
    '.........hhhhhhhhssssssssssssssShhhhhhhh........',
    '.........hhhhhhhhhssssssssssssshhhhhhhhh........',
    '.........hhhhhhhhhhSSSSSSSSSSShhhhhhhhhh........',
    '....................SSSSSSSSS...................',
    '....................SSSSSSSSS...................',
    '............ttttttttSSSSSSSSStttttttt...........',
    '..........ttttttttttSSSSSSSSStttttttttt.........',
    '........ttttttttttttTTTTTTTTTtttttttttttt.......',
  ],
  // prettier-ignore
  fotogramas: {
    'abiertos': {
      16: '........HhhhhhhsooooossssssoooooSShhhhhhH.......',
      17: '........HhhhhhsowWeewossssowWeewoSShhhhhH.......',
      18: '........hhhhhhssweeewssssssweeewSSShhhhhh.......',
    },
    'arriba': {
      15: '.......HhhhhhhhsooooossssssoooooSShhhhhhhH......',
      16: '........HhhhhhhowWeewossssowWeewoShhhhhhH.......',
      17: '........HhhhhhssweeewssssssweeewsSShhhhhH.......',
      18: '........hhhhhhsswwwwwsssssswwwwwSSShhhhhh.......',
    },
  },
};

// Plano detalle: su antebrazo con la correa, y el tejido que va hacia el filo.
const BRAZO: Dibujo = {
  paleta: {
    n: 0x1a1214,
    s: 0xd9b59c,
    S: 0xb38c76,
    t: 0xd6cebc,
    T: 0xa69c88,
    c: 0x8c2f2f,
    C: 0xb03a34,
    R: 0xd4564a,
    u: 0x3a2c22,
  },
  // prettier-ignore
  filas: [
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    '............................................................',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnuuuu.nnnn..........',
    'TttttttttTsssssssssssssssssssssssssssssssuuuunssssnnnnn.....',
    'tttTttttttssssssssssssssssssssssssssssssnuuuussssssssssnn...',
    'ttttttTtttsssssssssssssssssssssssssssssssuuuusssssssssssSn..',
    'tTttttttttsssssssssssssssssssssssssssssssuuuussssssSssssssn.',
    'ttttTtttttSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSuuuuSSSSSSSnSSSSSn.',
    'tttttttTttSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSnuuuuSSSSSSSSnSSSn..',
    'TttttttttTSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSuuuuSSSSSSSSSnnn...',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnuuuunSSSSSSSn......',
    '.........................................uuuu.nnnnnnn.......',
    '............................................................',
  ],
  // prettier-ignore
  fotogramas: {
    'tejido1': {
      10: '......................ccccc.................................',
      11: 'nnnnnnnnnnnnnnnnnnnnnCCCRCCCnnnnnnnnnnnnnuuuu.nnnn..........',
      12: 'TttttttttTsssssssssssssRsRsssssssssssssssuuuunssssnnnnn.....',
    },
    'tejido2': {
      4: '........................R...................................',
      5: '........................C.C.................................',
      6: '......................R.R.R.................................',
      7: '......................C.C.C.................................',
      8: '......................R.R.R.................................',
      9: '......................C.C.C.................................',
      10: '......................ccccc.................................',
      11: 'nnnnnnnnnnnnnnnnnnnnnCCCRCCCnnnnnnnnnnnnnuuuu.nnnn..........',
      12: 'TttttttttTsssssssssssssRsRsssssssssssssssuuuunssssnnnnn.....',
    },
    'tejido3': {
      1: '.........................R..................................',
      2: '........................CCC.................................',
      3: '........................RRR.................................',
      4: '.......................CCCC.................................',
      5: '......................R.R.RR................................',
      6: '......................C.C.C.C...............................',
      7: '.....................R..R.R.R...............................',
      8: '.....................C.C..C.C...............................',
      9: '....................R..R..R..R..............................',
      10: '......................ccccc.................................',
      11: 'nnnnnnnnnnnnnnnnnnnnnCCCRCCCnnnnnnnnnnnnnuuuu.nnnn..........',
      12: 'TttttttttTsssssssssssssRsRsssssssssssssssuuuunssssnnnnn.....',
    },
  },
};

// La mano enguantada con el bisturi de oro. Entra desde arriba a la derecha.
const MANO: Dibujo = {
  paleta: {
    N: 0x211746,
    G: 0x3a2f6a,
    k: 0xe3a940,
    K: 0xfcd038,
    Y: 0xf4ed93,
    j: 0xcb6e2f,
  },
  // prettier-ignore
  filas: [
    '..............................',
    '...................NNNNNNNNNNN',
    '.................NNGGGGNNNNNNN',
    '................NGGGGGGGNNNNNN',
    '...............NGGGNNNGGNNNNNN',
    '..............NGGNNNNNNGNNNNNN',
    '.............NGGNNNNNNNNNNNNN.',
    '............NNGNNNNNNNNNNNN...',
    '...........NNNNNNNNNNNNNNN....',
    '..........kkNNNNNNNNNNNN......',
    '.........kKKkNNNNNNN..........',
    '........kKKKkNNNN.............',
    '.......kKKKk..................',
    '......kKKKk...................',
    '.....jKKKk....................',
    '....jKYKk.....................',
    '...jKYKj......................',
    '..jKYj........................',
    '.jKYj.........................',
    '.jYj..........................',
    'jYj...........................',
    'Yj............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
  ],
  // prettier-ignore
  fotogramas: {},
};

// Primer plano de la mascara de pico, de perfil hacia ella.
const MASCARA: Dibujo = {
  paleta: {
    n: 0x0c081f,
    q: 0x3a2a55,
    p: 0x51356a,
    P: 0x775d91,
    k: 0xe3a940,
    K: 0xfcd038,
    Y: 0xf4ed93,
    j: 0xcb6e2f,
    m: 0x5d3927,
  },
  // prettier-ignore
  filas: [
    '............................PPPPPPPPPPP.........',
    '..........................PPPPPPPPPPPPPPP.......',
    '.........................PPPPPPPPPPPPPPPPq......',
    '........................PPPPPPPPPPPPpPPPPqq.....',
    '.......................PPPPPPPPPpppppppppqqq....',
    '......................PPPPPPPPPpppppppppppqqq...',
    '.....................PPPPPPPPpnpppppppppppppqq..',
    '.....................PPPPPPnnnnnnnpppppppppppq..',
    '....................PPPPPnnnnnnnnnnnpppppppppqq.',
    '....................PPPPnnnnnknnnnnnnpppppppppq.',
    '...................PPPPnnnkkkkkkknnnnnpppppppppq',
    '...................PPPnnnkkkkkkkkknnnnnppppppppq',
    '..................KKKKKKKKKKKnnnkkknnnnppppppppq',
    '...............KKKKKKKKKKKKKnqnnnkkknnnnpppppppp',
    '............KKKKKKKKKKKKKKKKnnnnnkkknnnnpppppppp',
    '.........KKKKKKKKKKKKKYKYKYKnnnnnkkknnnnpppppppp',
    '......KKKKKKYKYKYKYKYKKKKKKKKnnnkkkkknnnpppppppp',
    '...KKKYKYKYKKKKKKKKKKKKKKKKKKKkkkkkknnnnpppppppp',
    '.....KKKKKKKKKKKKKKKKKKKKKKKKKkkkkkknnnnnppppppp',
    '.......kkkkkkkkkkkkkkkkkkkkkkkkkkkkknnnnpppppppp',
    '.........kkkkkkkkkkkkkkkkkkkkkkkkkknnnnnpppppppp',
    '...........kkkkkkkkkkkkkkkkkkkkkkknnnnnnpppppppp',
    '.............jjjjjjjjjjjjjjjjjkkknnnnnnnpppppppp',
    '...............jjjjjjjjjjjjjjjnnnnnnnnnnpppppppp',
    '.................jjjjjjjjjjjjjnnnnnnnnnpppppppp.',
    '...................jjjjjjjjjjjnnnnnnnnnpppppppp.',
    '.....................PPnnnnnnnnnnnnnnnppppppppp.',
    '......................PPnnmmmmmnnnnnnppppppppp..',
    '.......................PPnmmmmmnnnnnppppppppp...',
    '........................PPPnnnnnnnppppppppppp...',
    '.........................PPPPpnppppppppppppp....',
    '..........................PPPPPppppppppppp......',
    '............................PPPPppppppppp.......',
    '.................................P..p...........',
    '................................................',
    '................................................',
  ],
  // prettier-ignore
  fotogramas: {
    'brillo': {
      13: '...............KKKKKKKKKKKKKnYnnnkkknnnnpppppppp',
      14: '............KKKKKKKKKYYYYYYYnnnnnkkknnnnpppppppp',
      15: '.........KKKYYYYYYYYYYYYYYYYnnnnnkkknnnnpppppppp',
      16: '......KKKKYYYYYYYYYYYKKKKKKKKnnnkkkkknnnpppppppp',
      17: '...KKKYKYKYYKKKKKKKKKKKKKKKKKKkkkkkknnnnpppppppp',
    },
  },
};

// El bisturi en el suelo, despues de soltarlo.
const BISTURI: Dibujo = {
  paleta: {
    k: 0xe3a940,
    K: 0xfcd038,
    Y: 0xf4ed93,
    j: 0xcb6e2f,
  },
  // prettier-ignore
  filas: [
    '..............jkkkkkkkkj',
    'YYYYYKKKKKKkkjkKKKKKKKKk',
    '.jjjjjjjjjjjjjjkkkkkkkkj',
  ],
  // prettier-ignore
  fotogramas: {},
};

// La rejilla del desague de servicio, detras de la Sala.
const REJILLA: Dibujo = {
  paleta: {
    n: 0x14100f,
    M: 0x8f9a96,
    S: 0x4a5450,
  },
  // prettier-ignore
  filas: [
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nMSnMSnMSnMSnMSnMSnMSnMSnMSn',
    'nMSnMSnMSnMSnMSnMSnMSnMSnMSn',
    'nMSnMSnMSnMSnMSnMSnMSnMSnMSn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnn',
  ],
  // prettier-ignore
  fotogramas: {},
};

// El desague abierto.
const HUECO: Dibujo = {
  paleta: {
    n: 0x14100f,
    S: 0x4a5450,
  },
  // prettier-ignore
  filas: [
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSS',
    'SnnnnnnnnnnnnnnnnnnnnnnnnnnS',
    'SnnnnnnnnnnnnnnnnnnnnnnnnnnS',
    'SnnnnnnnnnnnnnnnnnnnnnnnnnnS',
    'SSSSSSSSSSSSSSSSSSSSSSSSSSSS',
  ],
  // prettier-ignore
  fotogramas: {},
};

// La camilla despues: las correas abiertas, colgando.
const CAMILLA_VACIA: Dibujo = {
  paleta: {
    m: 0x8fa3a8,
    M: 0xc2d1d4,
    d: 0x5c6b70,
    c: 0x3a2c22,
    r: 0x8c2f2f,
  },
  // prettier-ignore
  filas: [
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'mmmmmmmmmmmmmmrrmmmmmmmmmmmmmmmm',
    'mmmmmmmmmmmmmrrrrmmmmmmmmmmmmmmm',
    'ddddcdddddddddddddddddddddcddddd',
    '..ddc.....................dc....',
    '..ddc.....................dc....',
    '..dd.c....................dd.c..',
    '..dd......................dd....',
    '..dd......................dd....',
    '..dd......................dd....',
    '.dddd....................dddd...',
    '.dddd....................dddd...',
  ],
  // prettier-ignore
  fotogramas: {},
};

const DIBUJOS: Readonly<Record<string, Dibujo>> = {
  'nina-sentada': NINA_SENTADA,
  'nina-pie': NINA_PIE,
  'nina-cara': NINA_CARA,
  brazo: BRAZO,
  mano: MANO,
  mascara: MASCARA,
  bisturi: BISTURI,
  rejilla: REJILLA,
  hueco: HUECO,
  'camilla-vacia': CAMILLA_VACIA,
};

function pintar(
  escena: Phaser.Scene,
  clave: string,
  paleta: Record<string, number>,
  filas: readonly string[],
): void {
  if (escena.textures.exists(clave)) return;
  const lienzo = escena.make.graphics({ x: 0, y: 0 }, false);
  filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x += 1) {
      const color = paleta[fila[x]];
      if (color === undefined) continue;
      lienzo.fillStyle(color, 1);
      lienzo.fillRect(x, y, 1, 1);
    }
  });
  lienzo.generateTexture(clave, filas[0]?.length ?? 0, filas.length);
  lienzo.destroy();
}

/** Pinta la base y cada fotograma de cada dibujo de la cinematica. */
export function generarCinematica(escena: Phaser.Scene): void {
  for (const [clave, dibujo] of Object.entries(DIBUJOS)) {
    pintar(escena, `cine-${clave}`, dibujo.paleta, dibujo.filas);
    for (const [nombre, cambios] of Object.entries(dibujo.fotogramas)) {
      const filas = dibujo.filas.map((fila, y) => cambios[y] ?? fila);
      pintar(escena, `cine-${clave}-${nombre}`, dibujo.paleta, filas);
    }
  }
}
