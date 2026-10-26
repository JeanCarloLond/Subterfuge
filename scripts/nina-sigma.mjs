/**
 * La niña de Subterfuge Sigma (#225), provisional y en código hasta que
 * Mariana la pinte. En las visiones es **perfecta**: una niña normal, sin una
 * marca, y por eso el Cirujano confía en ella (ver el canon). Pelo oscuro con
 * flequillo, piel clara, un vestido blanco sencillo y los ojos claros, muy
 * abiertos: es lo único que tiene de lo que es.
 *
 * Saca el retrato de los diálogos (48x48, se pinta al doble) y la figura que se
 * le aparece al Cirujano en la sala. Sale a `sigma/arte/nina/`.
 * Uso:  npm run sigma:nina
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/nina');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#140e12'),
  pelo: trio('#2a1c1a', '#45302a', '#160e0e'),
  piel: trio('#e8cdb8', '#f6e2d2', '#c4a28c'),
  mejilla: trio('#e6aea0', '#f0c4b6', '#c88c80'),
  vestido: trio('#e4e6ea', '#f8f9fb', '#b0b6c0'),
  // Los ojos: del blanco frio de Genesis, el mismo de sus objetivos.
  ojo: trio('#9cc2dc', '#c8e0f0', '#5e86a4'),
  pupila: trio('#1a2430', '#2a3848', '#0e141c'),
  boca: trio('#b06a66', '#c88080', '#8a4c4a'),
};

/** El retrato: de frente, mirando. */
export function retrato() {
  return rasterizar(
    [
      // El pelo por detras, largo hasta los hombros.
      [elipse([24, 24], 15, 18), 'pelo'],
      // Los hombros y el cuello del vestido.
      [
        poligono([
          [6, 48],
          [12, 40],
          [36, 40],
          [42, 48],
        ]),
        'vestido',
      ],
      [elipse([24, 37], 3.5, 4), 'piel'],
      // La cara, redonda, de nina.
      [elipse([24, 25], 10.5, 12), 'piel'],
      // El flequillo, recto.
      [
        poligono([
          [13, 22],
          [14, 14],
          [19, 10],
          [29, 10],
          [34, 14],
          [35, 22],
          [30, 19],
          [24, 20],
          [18, 19],
        ]),
        'pelo',
      ],
      // Los ojos, grandes y claros, con su pupila.
      [elipse([19.5, 26], 2.6, 2.4), 'ojo'],
      [elipse([28.5, 26], 2.6, 2.4), 'ojo'],
      [elipse([19.8, 26.4], 1.1, 1.3), 'pupila'],
      [elipse([28.8, 26.4], 1.1, 1.3), 'pupila'],
      [elipse([17, 31], 1.8, 1.1), 'mejilla'],
      [elipse([31, 31], 1.8, 1.1), 'mejilla'],
      // Una sonrisa pequena.
      [capsula([22, 33], [26, 33], 0.6), 'boca'],
    ],
    48,
    48,
    PALETA,
  );
}

/** La figura de la sala: de pie, de frente, con las manos juntas. */
export function figura() {
  return rasterizar(
    [
      [elipse([12, 9], 6, 7.5), 'pelo'],
      // El vestido, hasta los tobillos, acampanado.
      [
        poligono([
          [6, 40],
          [8, 18],
          [16, 18],
          [18, 40],
        ]),
        'vestido',
      ],
      [elipse([12, 10], 4.5, 5.5), 'piel'],
      [
        poligono([
          [7.5, 9],
          [8, 5],
          [12, 3],
          [16, 5],
          [16.5, 9],
          [12, 7.5],
        ]),
        'pelo',
      ],
      [elipse([10.2, 10.5], 0.9, 0.9), 'ojo'],
      [elipse([13.8, 10.5], 0.9, 0.9), 'ojo'],
      // Las manos juntas delante.
      [elipse([12, 26], 2, 1.6), 'piel'],
      [capsula([9, 41], [9, 43], 1), 'piel'],
      [capsula([15, 41], [15, 43], 1), 'piel'],
    ],
    24,
    44,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, 'retrato.png'), png(retrato()));
  writeFileSync(join(destino, 'figura.png'), png(figura()));
  console.log('la niña: retrato y figura -> sigma/arte/nina/');
}
