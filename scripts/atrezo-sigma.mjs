/**
 * El atrezo de Subterfuge Sigma: lo que hace que una zona parezca habitada.
 * Con el mismo rasterizador que el Cirujano (piezas, sombreado por bandas y
 * contorno). Todo sale del canon del Atrio, "la ciudad visible: pabellones,
 * talleres, terrazas de hongos, capillas con su Piedra Tibia":
 *
 * - muro-dientes   el Muro de los Dientes: en cada capilla, los primeros
 *                  dientes de leche de los ninos tocados, engastados en oro.
 * - piedra-tibia   el ducto calido de la capilla, donde se cumple el Primer Tacto.
 * - candelabro     hierro y tres velas.
 * - hongos         hongos bioluminiscentes: la luz del Vientre, con las velas.
 *
 * Sale a `sigma/arte/atrezo/<nombre>.png`. Uso:  npm run sigma:atrezo
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/atrezo');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#120a0a'),
  piedra: trio('#4a3a3c', '#62504f', '#2e2224'),
  oscuro: trio('#241a1c', '#34282a', '#140c0e'),
  diente: trio('#e2d6be', '#f6eedc', '#b0a28a'),
  oro: trio('#b8862a', '#e0b048', '#7a5418'),
  hierro: trio('#3a3436', '#56504e', '#1e1a1c'),
  cera: trio('#d9cbb0', '#efe5d2', '#a8987c'),
  llama: trio('#f0a040', '#ffe0a0', '#c86020'),
  brasa: trio('#c8541e', '#f08a3a', '#7a2a10'),
  hongo: trio('#3e8a7e', '#7ad0c0', '#24524a'),
  pie: trio('#6a5a4e', '#8a7868', '#4a3e34'),
};

/** El Muro de los Dientes: un panel de piedra en arco con filas de dientes. */
function muroDientes() {
  const piezas = [
    [
      poligono([
        [2, 63],
        [2, 16],
        [8, 6],
        [24, 1],
        [40, 6],
        [46, 16],
        [46, 63],
      ]),
      'piedra',
    ],
    [
      poligono([
        [7, 60],
        [7, 18],
        [12, 11],
        [24, 7],
        [36, 11],
        [41, 18],
        [41, 60],
      ]),
      'oscuro',
    ],
  ];
  for (let fila = 0; fila < 7; fila += 1) {
    const y = 16 + fila * 6;
    const cuantos = fila === 0 ? 4 : 6;
    for (let i = 0; i < cuantos; i += 1) {
      const x = 24 - ((cuantos - 1) * 5) / 2 + i * 5 + (fila % 2) * 1.5;
      piezas.push([elipse([x, y], 2, 2.2), 'oro']);
      piezas.push([elipse([x, y - 0.3], 1.1, 1.6), 'diente']);
    }
  }
  piezas.push([capsula([6, 61], [42, 61], 1.6), 'piedra']);
  return rasterizar(piezas, 48, 64, PALETA);
}

/** La Piedra Tibia: un bloque con la boca del ducto, que brilla por dentro. */
function piedraTibia() {
  const piezas = [
    [
      poligono([
        [2, 31],
        [3, 6],
        [37, 6],
        [38, 31],
      ]),
      'piedra',
    ],
    [capsula([2, 6], [38, 6], 2.5), 'piedra'],
    [elipse([20, 19], 9, 8), 'oscuro'],
    [elipse([20, 20.5], 6.5, 5.5), 'brasa'],
    [elipse([20, 21.5], 3.5, 3), 'llama'],
    [capsula([11, 29], [29, 29], 1.2), 'oro'],
  ];
  return rasterizar(piezas, 40, 32, PALETA);
}

/** Un candelabro de hierro con tres velas. */
function candelabro() {
  const piezas = [
    [capsula([7, 39], [7, 14], 1), 'hierro'],
    [
      poligono([
        [2, 39],
        [12, 39],
        [9, 35],
        [5, 35],
      ]),
      'hierro',
    ],
    [capsula([2, 14], [12, 14], 0.9), 'hierro'],
    [capsula([2, 14], [2, 11], 0.9), 'hierro'],
    [capsula([12, 14], [12, 11], 0.9), 'hierro'],
  ];
  for (const [x, alto] of [
    [2, 6],
    [7, 9],
    [12, 5],
  ]) {
    const base = x === 7 ? 13 : 10;
    piezas.push([capsula([x, base], [x, base - alto], 1.1), 'cera']);
    piezas.push([elipse([x, base - alto - 1.6], 0.9, 1.6), 'llama']);
  }
  return rasterizar(piezas, 14, 40, PALETA);
}

/** Un racimo de hongos de lampara: sombreros que brillan. */
function hongos() {
  const piezas = [];
  for (const [x, alto, r] of [
    [6, 8, 4],
    [13, 12, 5],
    [19, 6, 3],
  ]) {
    piezas.push([capsula([x, 15], [x, 15 - alto], 1), 'pie']);
    piezas.push([
      poligono([
        [x - r, 15 - alto + 1],
        [x - r + 1, 15 - alto - r * 0.6],
        [x, 15 - alto - r * 0.9],
        [x + r - 1, 15 - alto - r * 0.6],
        [x + r, 15 - alto + 1],
      ]),
      'hongo',
    ]);
  }
  return rasterizar(piezas, 24, 16, PALETA);
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const piezas = { 'muro-dientes': muroDientes, 'piedra-tibia': piedraTibia, candelabro, hongos };
  for (const [nombre, hacer] of Object.entries(piezas)) {
    writeFileSync(join(destino, `${nombre}.png`), png(hacer()));
  }
  console.log(`${Object.keys(piezas).length} piezas de atrezo -> sigma/arte/atrezo/`);
}
