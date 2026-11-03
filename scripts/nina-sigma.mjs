/**
 * La niña de Subterfuge Sigma (#225, #243), la figura que se le aparece al
 * Cirujano en la sala, provisional y en código hasta que Mariana la pinte. Va
 * como en su diseño: pelo castaño revuelto, ropa blanca y la venda roja sobre
 * los ojos. La venda es su perfección en las visiones: son los ojos de los Mil,
 * que aún no han nacido; al final, cae (ver el canon).
 *
 * El retrato de los diálogos ya no sale de aquí: es el de Mariana, en
 * `sigma/arte/retratos/nina.png` (#244). Sale a `sigma/arte/nina/`.
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

// Los colores del retrato de Mariana.
const PALETA = {
  contorno: hx('#140e12'),
  pelo: trio('#6a3a1e', '#8e5430', '#401e0e'),
  piel: trio('#f0c8a8', '#fadcc4', '#c89c80'),
  vestido: trio('#e8eaee', '#f8f9fb', '#a8b4c4'),
  venda: trio('#d8401e', '#f06a30', '#9a2410'),
};

/** La figura de la sala: de pie, de frente, con las manos juntas. */
export function figura() {
  return rasterizar(
    [
      // El pelo, revuelto, por detrás y por los lados.
      [elipse([12, 10], 7, 8.5), 'pelo'],
      // La ropa, hasta los tobillos.
      [
        poligono([
          [6, 40],
          [8, 18],
          [16, 18],
          [18, 40],
        ]),
        'vestido',
      ],
      [elipse([12, 10.5], 4.5, 5.5), 'piel'],
      // El flequillo, en mechones.
      [
        poligono([
          [7, 10],
          [7.5, 5],
          [12, 2.5],
          [16.5, 5],
          [17, 10],
          [14.5, 8],
          [12, 9],
          [9.5, 8],
        ]),
        'pelo',
      ],
      // La venda roja sobre los ojos.
      [capsula([7.5, 10.5], [16.5, 10.5], 1.3), 'venda'],
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
  writeFileSync(join(destino, 'figura.png'), png(figura()));
  console.log('la niña: figura -> sigma/arte/nina/');
}
