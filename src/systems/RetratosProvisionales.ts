import Phaser from 'phaser';

/**
 * RETRATOS PROVISIONALES de los dialogos (issue #145). NO SON EL ARTE FINAL.
 *
 * Como ArteProvisional: pixel art escrito a mano, caracter a caracter, en una
 * rejilla de 32x32. Cada retrato tiene una base y unos fotogramas que solo
 * reescriben las filas que cambian (la boca, los ojos, el brillo del pico).
 *
 * Las texturas se llaman `retrato-<clave>` (la base) y
 * `retrato-<clave>-<fotograma>`. Si ya existe una textura con esa clave porque
 * PreloadScene cargo el PNG del equipo, no se pinta encima: el arte de Mariana
 * entra sin tocar este archivo ni el dialogo. Cuando esten todos, se borra.
 */

interface Retrato {
  paleta: Record<string, number>;
  filas: readonly string[];
  /** Fotograma -> filas que cambian respecto a la base. */
  fotogramas: Readonly<Record<string, Readonly<Record<number, string>>>>;
}

const CIRUJANO: Retrato = {
  paleta: {
    n: 0x0c081f,
    N: 0x211746,
    q: 0x3a2a55,
    p: 0x51356a,
    P: 0x775d91,
    L: 0x846d96,
    k: 0xe3a940,
    K: 0xfcd038,
    Y: 0xf4ed93,
    j: 0xcb6e2f,
    m: 0x5d3927,
    o: 0xc9a44c,
  },
  // prettier-ignore
  filas: [
    '................................',
    '..............qqqqqq............',
    '............qqppppppqq..........',
    '...........qpppPPPPpppq.........',
    '..........qppPPPPPPPPppq........',
    '.........qppPPLLLLPPPPppq.......',
    '.........qpPPLLnnnnnnPPpq.......',
    '........qppPLnnkkkkkknPPpq......',
    '........qpPPnkkKKKKKkknPpq......',
    '......jjkkKKKKnnKKKkknPPpq......',
    '....jjkkKKKKKYnnKKKkknPPpq......',
    '...jjjkkKKKKKKKKKKkkkknPpq......',
    '....jjjjkkkKKKKKKkkkkknPpq......',
    '......jjjjjkkkkkkkkkknPPpq......',
    '.........jjjjjkkkkkknnPPpq......',
    '...........mmjjjjjnnqPPPpq......',
    '...........qmmmnnnnqqPPppq......',
    '..........qppqqqqqqqqPPPppq.....',
    '.......qqppPPPPPPPPPPPPPPppq....',
    '.....qqppPPPLLLLLLLLLLPPPPppqq..',
    '....qppPPPLLLLLLLLLLLLLLPPPppq..',
    '....qpppPPPPPPPPPPPPPPPPPpppqq..',
    '.....qqppppppppppppppppppqqq....',
    '......NNNqqqqqqqqqqqqqqqqNNN....',
    '.....NNNNNNNNNNNNoNNNNNNNNNNN...',
    '....NNNNNNNNNNNNNNNNNNNNNNNNN...',
    '....NNNNNNNNNNNNoNNNNNNNNNNNN...',
    '...NNNNNNNNNNNNNNNNNNNNNNNNNNN..',
    '...NNNNNNNNNNNNoNNNNNNNNNNNNNN..',
    '...NNNNNNNNNNNNNNNNNNNNNNNNNNN..',
    '...NNNNNNNNNNNNNNNNNNNNNNNNNNN..',
    '...NNNNNNNNNNNNNNNNNNNNNNNNNNN..',
  ],
  fotogramas: {
    brillo: {
      10: '....jjkkKKKKKKnnYKKkknPPpq......',
      11: '...jjjkkKKKKKKKKKYkkkknPpq......',
    },
  },
};

const FIEL: Retrato = {
  paleta: {
    h: 0x9a7f66,
    H: 0x7e6450,
    n: 0x1e1611,
    m: 0x5a2a2a,
    d: 0x231c18,
    p: 0x4a3426,
    g: 0x7a6440,
    G: 0x9a8458,
    w: 0xe8e0cc,
    l: 0x6a5a48,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '..........dppppppppppd..........',
    '.........dppppppppppppd.........',
    '........dppppppppppppppd........',
    '........dpphhhhhhhhhhppd........',
    '........dphhhhhhhhhhhhpd........',
    '........dhhhppphhppphhhd........',
    '........dhhhhhhhhhhhhhhd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dHhhhhhHHhhhhhHd........',
    '........dHhhhhhhhhhhhhHd........',
    '........dHhhhhnnnnhhhhHd........',
    '.........dHhhhhhhhhhhHd.........',
    '..........dHhhhhhhhhHd..........',
    '...........dHHhhhhHHd...........',
    '............ddHHHHdd............',
    '.............dhhhhd.............',
    '.............dHhhHd.............',
    '.........ddgggdHHdgggdd.........',
    '.......ddggggggddggggggdd.......',
    '.....ddggggGGGGGGGGGGggggdd.....',
    '....dgggGGGGGGGGGGGGGGGGgggd....',
    '...dggGGGGGGGGGGGGGGGGGGGGggd...',
    '...dggGGGGGGwwwwwwGGGGGGGGggd...',
    '..dgggGGGGGGwlllwwGGGGGGGGgggd..',
    '..dgggGGGGGGwwwwwwGGGGGGGGgggd..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggd..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggd..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggd..',
  ],
  fotogramas: {
    habla1: {
      14: '........dHhhhhnmmnhhhhHd........',
      15: '.........dHhhhhnnhhhhHd.........',
    },
    habla2: {
      14: '........dHhhhnmmmmnhhhHd........',
      15: '.........dHhhhnmmnhhhHd.........',
      16: '..........dHhhhnnhhhHd..........',
    },
    parpadeo: {
      10: '........dhhhhhhhhhhhhhhd........',
      11: '........dhhhHHhhhhHHhhhd........',
    },
  },
};

const REGISTRADORA: Retrato = {
  paleta: {
    h: 0x9a7f66,
    H: 0x7e6450,
    n: 0x1e1611,
    m: 0x5a2a2a,
    d: 0x231c18,
    p: 0x3a3446,
    P: 0x4a4458,
    g: 0x4a4458,
    G: 0x5e5870,
    w: 0xe8e0cc,
    W: 0xb8b0a0,
    r: 0x8c2f2f,
    R: 0xb03a34,
    o: 0xc9a44c,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '..........dppppppppppd..........',
    '.........dppppppppppppd.........',
    '........dppppppppppppppd........',
    '........dppPPhhhhhhPPppd........',
    '........dpPhhhhhhhhhhPpd........',
    '........dpPhpphhhhpphPpd........',
    '........dpPhhhhhhhhhhPpd........',
    '........dpPhnnhhhhnnhPpd........',
    '........dpPhnnhhhhnnhPpd........',
    '........dpPwwwwwwwwwwPpd........',
    '........dpPwwwwwwwwwwPpd........',
    '........dpPwwWwwwwWwwPpd........',
    '.........dpPwwwwwwwwPpd.........',
    '..........dpPwwwwwwPpd..........',
    '...........dpPPPPPPpd...........',
    '............ddppppdd............',
    '.............dppppd.............',
    '.............dppppd.............',
    '.........ddgggdppdgggdd.........',
    '.......ddggggggddggggggdd.......',
    '.....ddggggGGGGGGGGGGggggdd.....',
    '....dgggGGGGGGGGGGGGGGGGgggd....',
    '...dggGGGGGGGGGGGGGGGGGGGGggd...',
    '...dggGGGGGGGrrrrrrrGGGGGGggd...',
    '..dgggGGGGGGGrRRoRRrGGGGGGgggd..',
    '..dgggGGGGGGGrRRRRRrGGGGGGgggd..',
    '..dgggGGGGGGGrrrrrrrGGGGGGgggd..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggd..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggd..',
  ],
  fotogramas: {
    habla1: {
      13: '........dpPwwWwwwwWwwPpd........',
      14: '........dpPwwwWWWWwwwPpd........',
    },
    habla2: {
      13: '........dpPwwwwwwwwwwPpd........',
      14: '........dpPwwWWwwWWwwPpd........',
      15: '.........dpPwwwWWwwwPpd.........',
    },
    parpadeo: {
      10: '........dpPhhhhhhhhhhPpd........',
      11: '........dpPhHHhhhhHHhPpd........',
    },
  },
};

const AUXILIAR: Retrato = {
  paleta: {
    h: 0x9a7f66,
    H: 0x7e6450,
    n: 0x1e1611,
    m: 0xd8d0c0,
    d: 0x231c18,
    p: 0x3a2e26,
    g: 0x3a3e40,
    G: 0x4a5052,
    a: 0xb8b4a8,
    A: 0xd8d4c8,
    M: 0x9ca193,
    t: 0x7fc9bd,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '..........dppppppppppd..........',
    '.........dppppppppppppd.........',
    '........dppppppppppppppd........',
    '........dpphhhhhhhhhhppd........',
    '........dphhhhhhhhhhhhpd........',
    '........dhhhppphhppphhhd........',
    '........dhhhhhhhhhhhhhhd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dHhmmmmmmmmmmhHd........',
    '........dHmmmMmmmmMmmmHd........',
    '........dHmmmmmmmmmmmmHd........',
    '.........dHmmmMMMMmmmHd.........',
    '..........dHmmmmmmmmHd..........',
    '...........dHHhhhhHHd...........',
    '............ddHHHHdd............',
    '.............dhhhhd.............',
    '.............dHhhHd.............',
    '.........ddgggdHHdgggdd.........',
    '.......ddggggggddggggggdd.......',
    '.....ddggggaaaaaaaaaaggggdd.....',
    '....dgggGGaAAAAAAAAAAaGGgggd....',
    '...dggGGGGaAAAAAAAAAAaGGGGggd...',
    '...dggGGGGaAAAAAAAAAAaGGGGggd...',
    '..dgggGGGGaAAAAAAAAAAaGGGGtgggd.',
    '..dgggGGGGaAAAAAAAAAAaGGGGtgggd.',
    '..dgggGGGGaAAAAAAAAAAaGGGGgggd..',
    '..dgggGGGGaAAAAAAAAAAaGGGGgggd..',
    '..dgggGGGGaAAAAAAAAAAaGGGGgggd..',
  ],
  fotogramas: {
    habla1: {
      13: '........dHmmmmMmmMmmmmHd........',
      14: '........dHmmmMMMMMMmmmHd........',
    },
    habla2: {
      13: '........dHmmmMmmmmMmmmHd........',
      14: '........dHmmmmMMMMmmmmHd........',
      15: '.........dHmmmmmmmmmmHd.........',
    },
    parpadeo: {
      10: '........dhhhhhhhhhhhhhhd........',
      11: '........dhhhHHhhhhHHhhhd........',
    },
  },
};

const TANTEADOR: Retrato = {
  paleta: {
    h: 0x9a7f66,
    H: 0x7e6450,
    n: 0x1e1611,
    m: 0x5a2a2a,
    d: 0x231c18,
    v: 0xd8cdbe,
    V: 0xb8ab98,
    g: 0x4a4038,
    G: 0x5e5248,
    b: 0x6a5a4a,
    k: 0x6a6e6a,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '..........dhhhhhhhhhhd..........',
    '.........dhhhhhhhhhhhhd.........',
    '........dhhhhhhhhhhhhhhd........',
    '........dhhhhhhhhhhhhhhd........',
    '........dhhhhhhhhhhhhhhd........',
    '........dvvvvvvvvvvvvvvd........',
    '........dvvVvvvvvvvvVvvd........',
    '........dvvvvvvvvvvvvvvd........',
    '........dhhhhhhhhhhhhhhd........',
    '........dHhhhhhHHhhhhhHd........',
    '........dHbhbhhhhhhbhbHd........',
    '........dHbhbhnnnnhbhbHd........',
    '.........dHbbhhhhhhbbHd.........',
    '..........dHbbbbbbbbHd..........',
    '...........dHHhhhhHHd...........',
    '............ddHHHHdd............',
    '.............dhhhhd.............',
    '.............dHhhHd.............',
    '.........ddgggdHHdgggdd.........',
    '.......ddggggggddggggggdd.......',
    '.....ddggggGGGGGGGGGGggggdd.....',
    '....dgggGGGGGGGGGGGGGGGGgggd....',
    '...dggGGGGGGGGGGGGGGGGGGGGggd...',
    '...dggGGGGGGGGGGGGGGGGGGGGggdk..',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggdk.',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggdk.',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggdk.',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggdk.',
    '..dgggGGGGGGGGGGGGGGGGGGGGgggdk.',
  ],
  fotogramas: {
    habla1: {
      14: '........dHbhbhnmmnhbhbHd........',
      15: '.........dHbbhhnnhhbbHd.........',
    },
    habla2: {
      14: '........dHbhbnmmmmnbhbHd........',
      15: '.........dHbbhnmmnhbbHd.........',
      16: '..........dHbbbnnbbbHd..........',
    },
  },
};

const HONGUERA: Retrato = {
  paleta: {
    h: 0x9a7f66,
    H: 0x7e6450,
    n: 0x1e1611,
    m: 0x5a2a2a,
    d: 0x231c18,
    p: 0x5a4a3a,
    P: 0x8c4a32,
    g: 0x4a5040,
    G: 0x5a6250,
    a: 0x9a8a72,
    A: 0xb8a88c,
    l: 0x7ad0a8,
    L: 0xc8f4dc,
    b: 0x6a4a2a,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '..........dPPPPPPPPPPd..........',
    '.........dPPPPPPPPPPPPd.........',
    '........dPPPPPPPPPPPPPPd........',
    '........dPpphhhhhhhhppPd........',
    '........dPphhhhhhhhhhpPd........',
    '........dPhhppphhppphhPd........',
    '........dPhhhhhhhhhhhhPd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dhhhnnhhhhnnhhhd........',
    '........dHhhhhhHHhhhhhHd........',
    '........dHhhhhhhhhhhhhHd........',
    '........dHhhhhnnnnhhhhHd........',
    '.........dHhhhhhhhhhhHd.........',
    '..........dHhhhhhhhhHd..........',
    '...........dHHhhhhHHd...........',
    '............ddHHHHdd............',
    '.............dhhhhd.............',
    '.............dHhhHd.............',
    '.........ddgggdHHdgggdd.........',
    '.......ddggggggddggggggdd.......',
    '.....ddggggaaaaaaaaaaggggdd.....',
    '....dgggGGaAAAAAAAAAAaGGgggd....',
    '...dggGGGGaAAAAAAAAAAaGGGGggd...',
    '...dggGGGGaAAAAAAAAAAaGGGGggd...',
    '..dgggGGGGaAAAAAAAAAAaddddddddd.',
    '..dgggGGGGaAAAAAAAAAAadlLlLlLld.',
    '..dgggGGGGaAAAAAAAAAAadLlLlLlLd.',
    '..dgggGGGGaAAAAAAAAAAadbbbbbbbd.',
    '..dgggGGGGaAAAAAAAAAAaddbbbbbdd.',
  ],
  fotogramas: {
    habla1: {
      14: '........dHhhhhnmmnhhhhHd........',
      15: '.........dHhhhhnnhhhhHd.........',
    },
    habla2: {
      14: '........dHhhhnmmmmnhhhHd........',
      15: '.........dHhhhnmmnhhhHd.........',
      16: '..........dHhhhnnhhhHd..........',
    },
    parpadeo: {
      10: '........dhhhhhhhhhhhhhhd........',
      11: '........dhhhHHhhhhHHhhhd........',
    },
  },
};

const REFORMADO_SENTADO: Retrato = {
  paleta: {
    c: 0x8c4f4f,
    C: 0xa86a66,
    o: 0x5c2f33,
    n: 0x2a1a1e,
    v: 0xc9bda8,
    V: 0x9a8d78,
    s: 0x3a1418,
    m: 0x6a2a2a,
    M: 0x9ca193,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........nnnnnnnnnnn..........',
    '.........nnccCCCCCcccnn.........',
    '........nccCCCCCCCCCcccn........',
    '.......ncCCCCCCCCCCCCCccn.......',
    '.......ncCCCCCCCCCCCCCccn.......',
    '......ncCCCCCCCCCCCCCCCccn......',
    '......ncCCooCCCCvvvvvvvvcn......',
    '......ncCnnoCCCvvVvvvvVvcn......',
    '......ncCnsnCCCvvvvvvvvvcn......',
    '......ncCoooCCCCvvvvvvvccn......',
    '......ncCCCCCCCooCCCCCcccn......',
    '......nccCCCCCCCCCCCCCcccn......',
    '......nccCCCCsssssCCCCcccn......',
    '.......nccCCCCCCCCCCCcccn.......',
    '.......nocccCCCCCCCcccoon.......',
    '........nooccccccccccoon........',
    '.........nnoooooooooonn.........',
    '...........nnccccccnn...........',
    '..........ncccCCCCcccn..........',
    '......nnnccCCCCCCCCCCccnnn......',
    '....nncccCCCCCCCCCCCCCCcccnn....',
    '...nccCCCCCCvvvvvvvvCCCCCCccn...',
    '..ncCCCCCCCvVvvvvvvVvCCCCCCCcn..',
    '..ncCCooCCCvvvVVVVvvvCCCooCCcn..',
    '.ncCCCCCCCCvvvvvvvvvvCCCCCCCCcn.',
    '.ncCCCCCCCCCvvvvvvvvCCCCCCCCCcn.',
    '.nccCCCCCCCCCCCCCCCCCCCCCCCCccn.',
    '.nccCCCCCCCCCCCCCCCCCCCCCCCCccn.',
    '.nccCCCCCCCCCCCCCCCCCCCCCCCCccn.',
    '.nccCCCCCCCCCCCCCCCCCCCCCCCCccn.',
  ],
  fotogramas: {
    habla1: {
      14: '......nccCCCCsmmmsCCCCcccn......',
      15: '.......nccCCCssssCCCcccn........',
    },
    habla2: {
      13: '......nccCCCCsssssCCCCcccn......',
      14: '......nccCCCsmmmmmsCCCcccn......',
      15: '.......nccCCCsmmmsCCcccn........',
      16: '.......nocccCCssCCCcccoon.......',
    },
    parpadeo: {
      9: '......ncCoooCCCvvVvvvvVvcn......',
      10: '......ncCoooCCCvvvvvvvvvcn......',
    },
  },
};

// La niña (#176): pelo oscuro, piel palida, el vestido de la ofrenda. Mira
// de frente: es lo unico que el mundo le prohibe.
const NINA: Retrato = {
  paleta: {
    d: 0x1e1611,
    h: 0x2e211c,
    H: 0x55402f,
    s: 0xd9b59c,
    S: 0xb38c76,
    n: 0x14100f,
    b: 0xe8ddd0,
    m: 0x8a4a40,
    t: 0xd6cebc,
    T: 0xa69c88,
  },
  // prettier-ignore
  filas: [
    '................................',
    '................................',
    '...........dddddddddd...........',
    '.........ddhhhhhhhhhhdd.........',
    '........dhhhHHHHHhhhhhhd........',
    '.......dhhHHHHHhhhhhhhhhd.......',
    '.......dhhhhhhhhhhhhhhhhd.......',
    '......dhhhhhssssssssshhhhd......',
    '......dhhhhsssssssssssshhd......',
    '......dhhhsssssssssssssshd......',
    '......dhhhssSSssssSSssshhd......',
    '......dhhhssnnssssnnssshhd......',
    '......dhhhssnbssssnbssshhd......',
    '......dhhhssssssssssssshhd......',
    '......dhhhsssssSssssssshhd......',
    '......dhhhssssssssssssshhd......',
    '......dhhhssssmmmmssssshhd......',
    '.......dhhsssssssssssshhd.......',
    '.......dhhhSssssssssSshhd.......',
    '........dhhhSSSSSSSShhhd........',
    '........dhhhhdssssdhhhhd........',
    '.........dhhhdSssSdhhhd.........',
    '.........ddddtttttttdddd........',
    '.......ddttttttttttttttdd.......',
    '.....ddttttttttttttttttttdd.....',
    '....dttTttttttttttttttttTttd....',
    '...dtttTttttttttttttttttTtttd...',
    '...dtttTttttttttttttttttTtttd...',
    '...dTttTttttttttttttttttTttTd...',
    '...dtttTttttttttttttttttTtttd...',
    '...dTttTttttttttttttttttTttTd...',
    '...dtttTttttttttttttttttTtttd...',
  ],
  fotogramas: {
    habla1: {
      17: '.......dhhsssssmmsssssshd.......',
    },
    habla2: {
      16: '......dhhhsssmmmmmmsssshhd......',
      17: '.......dhhsssssmmmssssshd.......',
    },
    parpadeo: {
      11: '......dhhhssssssssssssshhd......',
      12: '......dhhhssSSssssSSssshhd......',
    },
  },
};

const RETRATOS: Readonly<Record<string, Retrato>> = {
  cirujano: CIRUJANO,
  fiel: FIEL,
  registradora: REGISTRADORA,
  auxiliar: AUXILIAR,
  tanteador: TANTEADOR,
  honguera: HONGUERA,
  'reformado-sentado': REFORMADO_SENTADO,
  nina: NINA,
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
  lienzo.generateTexture(clave, 32, 32);
  lienzo.destroy();
}

/** Pinta la base y cada fotograma de cada retrato. */
export function generarRetratos(escena: Phaser.Scene): void {
  for (const [clave, retrato] of Object.entries(RETRATOS)) {
    pintar(escena, `retrato-${clave}`, retrato.paleta, retrato.filas);
    for (const [nombre, cambios] of Object.entries(retrato.fotogramas)) {
      const filas = retrato.filas.map((fila, y) => cambios[y] ?? fila);
      pintar(escena, `retrato-${clave}-${nombre}`, retrato.paleta, filas);
    }
  }
}
