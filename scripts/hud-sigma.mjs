/**
 * La interfaz de Subterfuge Sigma, ornamentada como la de Blasphemous: un
 * medallon con el rostro del Cirujano, un marco con remates para las barras
 * de vida y de Fervor, y los frascos. Con la identidad de Sigma: oro viejo,
 * oxido, sangre y la venda.
 *
 * Sale a `sigma/arte/hud/`. Las barras son pares lleno/vacio para un
 * TextureProgressBar de Godot. Uso:  npm run sigma:hud
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/hud');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];
const NADA = [0, 0, 0, 0];

const PALETA = {
  contorno: hx('#0e0808'),
  oro: trio('#b8862a', '#e8c060', '#6e4a14'),
  oxido: trio('#7a3a1e', '#a0582e', '#4a200e'),
  fondo: trio('#1c1214', '#2a1c1e', '#100a0b'),
  piel: trio('#c9a88a', '#e3c7a9', '#9a7a60'),
  venda: trio('#d9cbb0', '#efe5d2', '#a8987c'),
  sangre: trio('#8e2a24', '#b8443a', '#5e1a16'),
  mitra: trio('#8a7a60', '#b9a888', '#5c5040'),
  vidrio: trio('#6a8288', '#a8c2c6', '#3e5054'),
};

/** El medallon: un aro de oro con el rostro vendado dentro. */
function medallon() {
  const c = [18, 18];
  return rasterizar(
    [
      [elipse(c, 17, 17), 'oro'],
      [elipse(c, 14, 14), 'oxido'],
      [elipse(c, 12.5, 12.5), 'fondo'],
      // La mitra, el rostro, la venda con su sangre y el cubrebocas.
      [
        poligono([
          [11, 12],
          [25, 12],
          [23, 6],
          [18, 1.5],
          [13, 6],
        ]),
        'mitra',
      ],
      [elipse([18, 19], 6.5, 8), 'piel'],
      [capsula([11.5, 17], [24.5, 17], 1.8), 'venda'],
      [elipse([21, 17], 1.3, 1.1), 'sangre'],
      [
        poligono([
          [12.5, 21],
          [23.5, 21],
          [22, 26],
          [18, 27.5],
          [14, 26],
        ]),
        'venda',
      ],
      // Cuatro remaches en cruz sobre el aro.
      ...[
        [18, 2],
        [34, 18],
        [18, 34],
        [2, 18],
      ].map((p) => [elipse(p, 1.6, 1.6), 'oxido']),
    ],
    36,
    36,
    PALETA,
  );
}

/**
 * El marco de las barras: dos ranuras (vida y Fervor) con un borde de oro y
 * un remate en punta al final, como un relicario.
 */
function marco() {
  const ancho = 124;
  const alto = 22;
  const img = Array.from({ length: alto }, () => new Array(ancho).fill(NADA));
  const pon = (x, y, color) => {
    if (x >= 0 && x < ancho && y >= 0 && y < alto) img[y][x] = color;
  };
  const [oro, oroLuz, oroSombra] = PALETA.oro;
  // Ranura de vida: x 2..109, y 2..11. Ranura de Fervor: x 2..93, y 13..18.
  for (const [x0, y0, x1, y1] of [
    [1, 1, 110, 12],
    [1, 12, 94, 19],
  ]) {
    for (let x = x0; x <= x1; x += 1) {
      pon(x, y0, x % 6 === 0 ? oroLuz : oro);
      pon(x, y1, oroSombra);
    }
    for (let y = y0; y <= y1; y += 1) {
      pon(x0, y, oro);
      pon(x1, y, oroSombra);
    }
  }
  // El remate: una punta de lanza al final de la barra de vida.
  for (let i = 0; i < 9; i += 1) {
    for (let y = 6 - Math.floor(i / 2); y <= 6 + Math.floor(i / 2); y += 1)
      pon(122 - i, y, i < 2 ? oroLuz : oro);
  }
  for (let x = 110; x < 114; x += 1) pon(x, 6, oro);
  // Una cuenta al final de la de Fervor.
  for (const [x, y] of [
    [96, 15],
    [97, 15],
    [96, 16],
    [97, 16],
  ])
    pon(x, y, oro);
  // El contorno, para que se lea sobre cualquier fondo.
  const contorno = PALETA.contorno;
  const copia = img.map((f) => [...f]);
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      if (img[y][x][3]) continue;
      const toca = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => img[y + dy]?.[x + dx]?.[3]);
      if (toca) copia[y][x] = contorno;
    }
  }
  return copia;
}

/**
 * Una barra (lleno o vacio) de `ancho`x`alto`. La de vida, en `segmentos`
 * separados por una linea oscura: se lee cuantos golpes quedan.
 */
function barra(ancho, alto, [base, luz, sombra], segmentos = 0) {
  return Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => {
      if (segmentos && x > 0 && x % Math.round(ancho / segmentos) === 0) return PALETA.contorno;
      if (y === 0) return luz;
      if (y === alto - 1) return sombra;
      return base;
    }),
  );
}

function frasco(lleno) {
  const piezas = [
    [capsula([4, 2], [4, 3], 1.2), 'oxido'],
    [elipse([4, 7.5], 3.3, 3.8), 'vidrio'],
  ];
  if (lleno) piezas.push([elipse([4, 8.4], 2.4, 2.6), 'sangre']);
  return rasterizar(piezas, 9, 12, PALETA);
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const piezas = {
    medallon: medallon(),
    marco: marco(),
    'vida-llena': barra(108, 10, PALETA.sangre, 6),
    'vida-vacia': barra(108, 10, PALETA.fondo, 6),
    'fervor-lleno': barra(92, 6, trio('#c88a2a', '#f0c050', '#8a5a14')),
    'fervor-vacio': barra(92, 6, PALETA.fondo),
    'frasco-lleno': frasco(true),
    'frasco-vacio': frasco(false),
  };
  for (const [nombre, img] of Object.entries(piezas))
    writeFileSync(join(destino, `${nombre}.png`), png(img));
  console.log(`${Object.keys(piezas).length} piezas de la interfaz -> sigma/arte/hud/`);
}
