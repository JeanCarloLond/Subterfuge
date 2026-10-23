/**
 * Los fondos de Subterfuge Sigma: grandes, oscuros y en capas, como los de
 * Blasphemous y Hollow Knight. Cada capa va a otra profundidad (Parallax2D en
 * `sigma/scripts/nave.gd`), y la diferencia de velocidad se lee como un sitio
 * enorme.
 *
 * Lo que se ve sale del canon: el Vientre es una catedral-hospital y los
 * dioses SON el templo, asi que la boveda son costillas y las columnas tienen
 * venas; la luz viene de las vidrieras-pantalla moribundas (biblia, "Luz").
 *
 * - vidriera.png  lo mas lejano: la vidriera, con sus haces de luz.
 * - boveda.png    costillas que hacen de arcos.
 * - columnas.png  pilares colosales con venas y una jaula colgada.
 * - primer-plano.png  siluetas que pasan por DELANTE del Cirujano.
 *
 * Pixel art: colores planos, sombreado por bandas y trama ordenada (Bayer 4x4)
 * en vez de degradados suaves.
 *
 * Uso:  npm run sigma:fondos
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/fondos');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function lienzo(ancho, alto, fondo = [0, 0, 0, 0]) {
  return { ancho, alto, px: Array.from({ length: alto }, () => new Array(ancho).fill(fondo)) };
}

/**
 * Pinta `forma` con `color` dentro de la caja [x0, y0, x1, y1]. `trama` (0..1)
 * es la proporcion de pixeles que se pintan, con la matriz de Bayer: asi se
 * hacen los velos y los haces de luz sin transparencias.
 */
function pintar(l, forma, color, caja, trama = 1) {
  const [x0, y0, x1, y1] = caja.map(Math.round);
  for (let y = Math.max(0, y0); y < Math.min(l.alto, y1); y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const xr = ((x % l.ancho) + l.ancho) % l.ancho; // las capas se repiten en x
      if (trama < 1 && (BAYER[y % 4][xr % 4] + 0.5) / 16 >= trama) continue;
      if (forma(x, y)) l.px[y][xr] = color;
    }
  }
}

/** Un degradado vertical por bandas, tramado entre una y otra. */
function degradado(l, colores, y0 = 0, y1 = l.alto) {
  for (let y = y0; y < y1; y += 1) {
    const t = ((y - y0) / (y1 - y0)) * (colores.length - 1);
    const i = Math.min(colores.length - 2, Math.floor(t));
    const f = t - i;
    for (let x = 0; x < l.ancho; x += 1) {
      l.px[y][x] = (BAYER[y % 4][x % 4] + 0.5) / 16 < f ? colores[i + 1] : colores[i];
    }
  }
}

/**
 * Un arco apuntado (gotico) que arranca en `arranque` y llega a `clave`: dos
 * circulos de radio `ancho` centrados en los arranques contrarios.
 */
function arcoApuntado(xIzq, ancho, arranque, base) {
  const xDer = xIzq + ancho;
  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    if (px < xIzq || px > xDer || py > base) return false;
    if (py >= arranque) return true;
    return (
      Math.hypot(px - xIzq, py - arranque) <= ancho && Math.hypot(px - xDer, py - arranque) <= ancho
    );
  };
}

const no = (f) => (x, y) => !f(x, y);
const y_ =
  (...fs) =>
  (x, y) =>
    fs.every((f) => f(x, y));

// -- La vidriera --------------------------------------------------------------

function vidriera() {
  const l = lienzo(640, 400);
  degradado(l, [hx('#0c090c'), hx('#120d11'), hx('#100b0e'), hx('#09070a')]);

  // Los haces: caen en diagonal hacia la izquierda, tramados (no hay alfa).
  for (const [x, ancho, trama] of [
    [280, 70, 0.22],
    [330, 40, 0.3],
    [370, 26, 0.18],
  ]) {
    const haz = poligono([
      [x, 120],
      [x + ancho, 120],
      [x + ancho - 190, 400],
      [x - 220, 400],
    ]);
    pintar(l, haz, hx('#2a1d1c'), [0, 120, 640, 400], trama);
  }

  // Dos lancetas pequenas a los lados, apagadas, y la grande en el centro.
  const ventanas = [
    [120, 50, 120, 250, 0.5],
    [470, 50, 120, 250, 0.5],
    [265, 110, 40, 300, 1],
  ];
  for (const [x, ancho, clave, base, viva] of ventanas) {
    const arranque = clave + ancho * 0.87;
    const marco = arcoApuntado(x - 8, ancho + 16, arranque - 6, base + 8);
    pintar(l, marco, hx('#1c1519'), [x - 10, clave - 20, x + ancho + 10, base + 10]);
    const hueco = arcoApuntado(x, ancho, arranque, base);
    // Paneles de vidrio de tres colores apagados; algunos, muertos (negros):
    // son pantallas moribundas, no un vitral entero.
    const colores = [hx('#4a1d1c'), hx('#4a3119'), hx('#1d2b2b'), hx('#0b0809')];
    for (let py = clave; py < base; py += 1) {
      for (let px = x; px < x + ancho; px += 1) {
        if (!hueco(px, py)) continue;
        const panel = Math.floor((px - x) / (ancho / 3)) + 3 * Math.floor((py - clave) / 34);
        let color = colores[(panel * 7 + 3) % 4];
        if (viva < 1 && (panel * 5) % 3 === 0) color = colores[3];
        // Brillo tramado hacia el centro del panel: la luz respira dentro.
        const claro = (BAYER[py % 4][px % 4] + 0.5) / 16 < 0.25 * viva;
        l.px[py][px] = claro ? color.map((c, i) => (i < 3 ? Math.min(255, c + 22) : c)) : color;
      }
    }
    // La traceria: parteluces, travesanos y un rosetón arriba.
    const piedra = hx('#211a1e');
    for (const f of [1, 2]) {
      const mx = x + (ancho * f) / 3;
      pintar(
        l,
        y_(hueco, (px) => Math.abs(px + 0.5 - mx) < 1.6),
        piedra,
        [x, clave, x + ancho, base],
      );
    }
    for (let ty = arranque + 30; ty < base; ty += 34) {
      pintar(
        l,
        y_(hueco, (px, py) => Math.abs(py + 0.5 - ty) < 1.2),
        piedra,
        [x, ty - 3, x + ancho, ty + 3],
      );
    }
    const rosa = [x + ancho / 2, arranque - ancho * 0.25];
    const radio = ancho * 0.28;
    pintar(
      l,
      y_(elipse(rosa, radio + 2, radio + 2), no(elipse(rosa, radio - 1, radio - 1))),
      piedra,
      [rosa[0] - radio - 4, rosa[1] - radio - 4, rosa[0] + radio + 4, rosa[1] + radio + 4],
    );
    for (let k = 0; k < 8; k += 1) {
      const a = (k / 8) * Math.PI * 2;
      const punta = [rosa[0] + Math.cos(a) * radio, rosa[1] + Math.sin(a) * radio];
      pintar(l, capsula(rosa, punta, 0.8), piedra, [
        rosa[0] - radio,
        rosa[1] - radio,
        rosa[0] + radio + 1,
        rosa[1] + radio + 1,
      ]);
    }
  }
  // La niebla de abajo: lo lejano se pierde.
  pintar(l, () => true, hx('#0e0a0d'), [0, 330, 640, 400], 0.5);
  pintar(l, () => true, hx('#0e0a0d'), [0, 370, 640, 400], 0.8);
  return l;
}

// -- La boveda de costillas ---------------------------------------------------

function boveda() {
  const l = lienzo(640, 480, [0, 0, 0, 0]);
  const hueso = [hx('#1d151a'), hx('#2a1f25'), hx('#130d11')]; // base, luz, sombra
  // Dos costillas-arco por baldosa, una mas alta que otra, que se cruzan.
  for (const [x, ancho, clave] of [
    [-40, 360, 30],
    [280, 360, 60],
  ]) {
    const arranque = clave + ancho * 0.87;
    const fuera = arcoApuntado(x, ancho, arranque, 480);
    const dentro = arcoApuntado(x + 16, ancho - 32, arranque + 8, 481);
    const costilla = y_(fuera, no(dentro));
    const caja = [x - 2, clave - 4, x + ancho + 2, 480];
    pintar(l, costilla, hueso[0], caja);
    // Luz en el borde de dentro de arriba, sombra en el de fuera: volumen.
    pintar(l, y_(costilla, no(arcoApuntado(x + 4, ancho - 8, arranque + 2, 481))), hueso[2], caja);
    pintar(l, y_(costilla, arcoApuntado(x + 12, ancho - 24, arranque + 6, 481)), hueso[1], caja);
    // Las vertebras: muescas oscuras a lo largo de la costilla.
    for (let y = clave + 10; y < 470; y += 22) {
      pintar(
        l,
        y_(costilla, (_, py) => py >= y && py < y + 2),
        hueso[2],
        [x, y, x + ancho, y + 2],
      );
    }
  }
  // La imposta: una cornisa de piedra que corta las costillas.
  pintar(l, () => true, hx('#1a1317'), [0, 330, 640, 338]);
  pintar(l, () => true, hx('#251b20'), [0, 330, 640, 331]);
  // Abajo se funde con la oscuridad.
  pintar(l, () => true, hx('#0d090c'), [0, 400, 640, 480], 0.5);
  pintar(l, () => true, hx('#0d090c'), [0, 440, 640, 480], 0.85);
  return l;
}

// -- Las columnas ---------------------------------------------------------------

function columnas() {
  const l = lienzo(400, 640, [0, 0, 0, 0]);
  const [base, luz, sombra] = [hx('#251b20'), hx('#33262c'), hx('#160f13')];
  const cx = 150;
  // Un pilar de haz: tres fustes juntos, el del centro delante.
  for (const [dx, r] of [
    [-22, 14],
    [22, 14],
    [0, 18],
  ]) {
    const fuste = poligono([
      [cx + dx - r, 60],
      [cx + dx + r, 60],
      [cx + dx + r, 640],
      [cx + dx - r, 640],
    ]);
    const caja = [cx + dx - r, 60, cx + dx + r, 640];
    pintar(l, fuste, base, caja);
    pintar(l, (x) => x < cx + dx - r + 4, luz, caja);
    pintar(l, (x) => x >= cx + dx + r - 6, sombra, caja);
    pintar(l, (x) => x === cx + dx + r - 1 || x === cx + dx - r, hx('#0e090c'), caja);
  }
  // El capitel: se abre arriba como una flor de piedra.
  const capitel = poligono([
    [cx - 40, 60],
    [cx + 40, 60],
    [cx + 62, 20],
    [cx - 62, 20],
  ]);
  pintar(l, capitel, base, [cx - 64, 18, cx + 64, 62]);
  pintar(l, (x, y) => capitel(x, y) && y < 26, luz, [cx - 64, 18, cx + 64, 62]);
  pintar(l, () => true, hx('#1c1418'), [cx - 66, 12, cx + 66, 20]);
  // Las venas: suben por el fuste, ondulando. Los dioses son el templo.
  for (const [x0, fase] of [
    [cx - 8, 0],
    [cx + 10, 1.7],
    [cx - 28, 3.1],
  ]) {
    for (let y = 70; y < 640; y += 1) {
      const x = Math.round(x0 + Math.sin(y / 23 + fase) * 4 + Math.sin(y / 7 + fase) * 1.2);
      l.px[y][x] = hx('#3e1716');
      if (y % 5 === 0) l.px[y][x + 1] = hx('#5a201d');
    }
  }
  // Una cadena con una jaula, colgando del otro lado.
  const jx = 310;
  for (let y = 0; y < 300; y += 6) {
    const eslabon = y % 12 === 0 ? elipse([jx, y + 3], 2, 3.5) : elipse([jx, y + 3], 1, 3.5);
    pintar(l, y_(eslabon, no(elipse([jx, y + 3], 0.6, 2))), hx('#2c2226'), [
      jx - 3,
      y - 1,
      jx + 3,
      y + 8,
    ]);
  }
  const jaula = poligono([
    [jx - 22, 320],
    [jx + 22, 320],
    [jx + 18, 380],
    [jx - 18, 380],
  ]);
  pintar(l, jaula, hx('#120c0f'), [jx - 24, 296, jx + 24, 382]);
  pintar(l, elipse([jx, 320], 22, 18), hx('#120c0f'), [jx - 24, 300, jx + 24, 322]);
  for (let bx = jx - 20; bx <= jx + 20; bx += 7) {
    pintar(l, capsula([jx, 302], [bx, 322], 0.7), hx('#2c2226'), [jx - 24, 300, jx + 24, 324]);
    pintar(l, capsula([bx, 322], [bx * 0.85 + jx * 0.15, 380], 0.7), hx('#2c2226'), [
      jx - 24,
      320,
      jx + 24,
      382,
    ]);
  }
  pintar(l, () => true, hx('#2c2226'), [jx - 22, 349, jx + 22, 351]);
  // Abajo, a la niebla.
  pintar(l, () => true, hx('#0d090c'), [0, 540, 400, 640], 0.4);
  pintar(l, () => true, hx('#0d090c'), [0, 590, 400, 640], 0.8);
  return l;
}

// -- El primer plano ----------------------------------------------------------

function primerPlano() {
  const l = lienzo(960, 360, [0, 0, 0, 0]);
  const negro = hx('#060405');
  const borde = hx('#140d0f');
  // Un pilar roto, de suelo a techo, y un sudario que cuelga.
  const pilar = poligono([
    [100, 0],
    [138, 0],
    [135, 360],
    [103, 360],
  ]);
  pintar(l, pilar, negro, [98, 0, 140, 360]);
  pintar(l, (x, y) => pilar(x, y) && !pilar(x - 2, y), borde, [98, 0, 140, 360]);
  const sudario = poligono([
    [560, 0],
    [610, 0],
    [604, 110],
    [596, 150],
    [584, 128],
    [572, 156],
    [566, 96],
  ]);
  pintar(l, sudario, negro, [556, 0, 614, 160]);
  pintar(l, (x, y) => sudario(x, y) && !sudario(x - 2, y), borde, [556, 0, 614, 160]);
  return l;
}

// -- La niebla baja -------------------------------------------------------------

/**
 * Una franja de niebla que se repite en horizontal: tramada, mas densa abajo y
 * con jirones. Se desliza sobre los suelos (sigma/scripts/ambiente.gd).
 */
function niebla() {
  const l = lienzo(256, 32);
  for (let y = 0; y < 32; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      const jiron = 0.5 + 0.5 * Math.sin((x / 256) * Math.PI * 6 + Math.sin(x / 19) * 1.5);
      const densidad = (y / 32) ** 1.6 * (0.45 + 0.4 * jiron);
      if ((BAYER[y % 4][x % 4] + 0.5) / 16 < densidad) l.px[y][x] = [160, 146, 138, 110];
    }
  }
  return l;
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const capas = { vidriera, boveda, columnas, 'primer-plano': primerPlano, niebla };
  for (const [nombre, hacer] of Object.entries(capas)) {
    writeFileSync(join(destino, `${nombre}.png`), png(hacer().px));
  }
  console.log(`${Object.keys(capas).length} fondos -> sigma/arte/fondos/`);
}
