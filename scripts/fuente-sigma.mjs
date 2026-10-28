/**
 * La fuente del santo de Subterfuge Sigma (#238), provisional y en código hasta
 * que Mariana la pinte. Es el Altar: rezar en ella cura, guarda y llena el
 * frasco, porque la Poción de Carne sale de aquí. Un santo de piedra con el
 * nimbo de oro sostiene un corazón abierto, y de él cae la carne a la pila.
 *
 * Feedback de Jean: el Altar de antes (una peana con una llama) no se leía como
 * el sitio donde se guarda. Esta se ve de lejos: es alta y tiene su luz.
 *
 * Sale a `sigma/arte/fuente/fuente.png`, de 40x64, con la base abajo en el
 * centro. Uso:  npm run sigma:fuente
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/fuente');
const ANCHO = 40;
const ALTO = 64;

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#120c0c'),
  // La piedra del templo, gastada; el santo, algo más claro que la pila.
  piedra: trio('#6e6660', '#8e867e', '#4a4440'),
  santo: trio('#8a8278', '#aaa298', '#5e5852'),
  oro: trio('#b8862a', '#e8c060', '#6e4a14'),
  carne: trio('#a8382f', '#d0584a', '#6e1e18'),
};

export function fuente() {
  return rasterizar(
    [
      // El nimbo, detrás de la cabeza.
      [elipse([20, 10], 7.5, 7.5), 'oro'],
      // El santo: el manto hasta la pila y la cabeza velada.
      [
        poligono([
          [14, 17],
          [26, 17],
          [30, 45],
          [10, 45],
        ]),
        'santo',
      ],
      [elipse([20, 11], 5.5, 6), 'santo'],
      [elipse([20, 12.5], 3, 3.5), 'piedra'],
      // La carne rebosa por los dos lados de las manos y baja abierta hasta la
      // pila. Nada de un chorro recto bajo el corazón: con las manos, hacía
      // una cruz, y en este mundo no hay cruces.
      [capsula([24.5, 29], [26.5, 47], 0.8), 'carne'],
      [capsula([15.5, 29], [13.5, 47], 0.7), 'carne'],
      // El corazón, redondo, en las manos hechas cuenco.
      [elipse([20, 24.5], 3.4, 3.6), 'carne'],
      [
        poligono([
          [14.5, 27],
          [25.5, 27],
          [23, 31],
          [17, 31],
        ]),
        'santo',
      ],
      // La pila, con su borde y la carne que la llena.
      [
        poligono([
          [3, 46],
          [37, 46],
          [33, 56],
          [7, 56],
        ]),
        'piedra',
      ],
      [elipse([20, 47.5], 15, 2.2), 'carne'],
      [capsula([3, 46], [37, 46], 1.1), 'piedra'],
      // El pie.
      [
        poligono([
          [14, 56],
          [26, 56],
          [28, 63],
          [12, 63],
        ]),
        'piedra',
      ],
    ],
    ANCHO,
    ALTO,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, 'fuente.png'), png(fuente()));
  console.log('la fuente del santo -> sigma/arte/fuente/');
}
