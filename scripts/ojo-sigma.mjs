/**
 * El ojo de Subterfuge Sigma (#243), provisional y en código hasta que Mariana
 * lo pinte: el artefacto del laboratorio 7, un ojo de los Mil, el primero que
 * llegó a formarse. Rojo, en su cuenca de carne, con las venas que aún lo
 * alimentan. Y el puente de carne que solo se ve mirando con él: lo que el
 * templo ya está formando.
 *
 * Sale a `sigma/arte/reliquias/ojo.png` (20x20, como las otras reliquias) y a
 * `sigma/arte/mirada/puente.png` (16x8, se repite a lo ancho).
 * Uso:  npm run sigma:ojo
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#140a0a'),
  carne: trio('#8a2a24', '#b04838', '#5a1814'),
  vena: trio('#4a0e10', '#6a1a18', '#2e0808'),
  blanco: trio('#e8dccc', '#f8f0e4', '#b8a898'),
  // El iris: el rojo del ojo del Cirujano y de la venda de la niña.
  iris: trio('#d8401e', '#f06a30', '#9a2410'),
  pupila: trio('#140808', '#241010', '#0a0404'),
};

export function ojo() {
  return rasterizar(
    [
      // La cuenca de carne y las venas que salen de ella.
      [elipse([10, 10.5], 9, 7.5), 'carne'],
      [capsula([2, 6], [5, 8], 0.6), 'vena'],
      [capsula([17, 14], [14.5, 12.5], 0.6), 'vena'],
      [capsula([3, 15], [6, 13], 0.5), 'vena'],
      // El ojo, el iris rojo y la pupila.
      [elipse([10, 10], 6.5, 5), 'blanco'],
      [elipse([10, 10], 3.6, 3.6), 'iris'],
      [elipse([10, 10], 1.6, 2.2), 'pupila'],
    ],
    20,
    20,
    PALETA,
  );
}

/** Un tramo del puente: carne tendida, con su borde y sus venas. */
export function puente() {
  return rasterizar(
    [
      [
        poligono([
          [0, 1],
          [16, 1],
          [16, 6],
          [0, 6],
        ]),
        'carne',
      ],
      [capsula([0, 1.5], [16, 1.5], 0.6), 'iris'],
      [capsula([2, 4], [7, 3.5], 0.5), 'vena'],
      [capsula([9, 4.5], [14, 4], 0.5), 'vena'],
    ],
    16,
    8,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  const reliquias = join(raiz, 'sigma/arte/reliquias');
  const mirada = join(raiz, 'sigma/arte/mirada');
  mkdirSync(reliquias, { recursive: true });
  mkdirSync(mirada, { recursive: true });
  writeFileSync(join(reliquias, 'ojo.png'), png(ojo()));
  writeFileSync(join(mirada, 'puente.png'), png(puente()));
  console.log('el ojo y el puente -> sigma/arte/reliquias/ojo.png, sigma/arte/mirada/puente.png');
}
