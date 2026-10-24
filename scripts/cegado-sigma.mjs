/**
 * El Cegado de Subterfuge Sigma (#216), provisional y en código, como el resto
 * hasta que Mariana lo pinte: una Mano del Sacramento que miró antes que el
 * Cirujano y se arrancó los ojos para volver a la ley. Lleva la venda con la
 * sangre vieja de las cuencas y la máscara ciega subida a la frente: ya no le
 * hace falta.
 *
 * Saca el retrato de los diálogos (48x48, se pinta al doble) y la figura de la
 * sala, encorvada sobre un bastón. Sale a `sigma/arte/cegado/`.
 * Uso:  npm run sigma:cegado
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/cegado');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#0e0808'),
  // El hábito de hueso del Cirujano, pero gastado: años en la escalera.
  habito: trio('#6a6052', '#8a7e6c', '#463e34'),
  sombra: trio('#2a2220', '#3a302c', '#1a1414'),
  piel: trio('#b8977a', '#d2b294', '#8a6c54'),
  barba: trio('#8c847a', '#b0a89c', '#5e574e'),
  venda: trio('#c8b898', '#e0d4bc', '#968668'),
  sangre: trio('#6e2420', '#8e342c', '#481612'),
  boca: trio('#4a2a24', '#5e3830', '#2e1a16'),
  // La máscara ciega de las Manos: hueso pulido, sin ojos.
  hueso: trio('#d8d0bc', '#f0ead8', '#a8a08a'),
  madera: trio('#5a3a22', '#7a5232', '#3a2414'),
};

/** El retrato: busto de frente, en la capucha, con la máscara en la frente. */
export function retrato() {
  return rasterizar(
    [
      // Los hombros y la capucha.
      [
        poligono([
          [1, 48],
          [7, 38],
          [41, 38],
          [47, 48],
        ]),
        'habito',
      ],
      [
        poligono([
          [9, 46],
          [10, 22],
          [16, 10],
          [24, 6],
          [32, 10],
          [38, 22],
          [39, 46],
        ]),
        'habito',
      ],
      // El hueco de la capucha, en sombra.
      [elipse([24, 27], 11.5, 15), 'sombra'],
      // El rostro, enjuto, y la barba de años sin afeitar.
      [elipse([24, 28], 8.5, 11), 'piel'],
      [
        poligono([
          [16, 31],
          [32, 31],
          [30, 39],
          [24, 42],
          [18, 39],
        ]),
        'barba',
      ],
      [capsula([21, 35], [27, 35], 0.6), 'boca'],
      // La venda sobre las cuencas, con la sangre vieja que bajó.
      [capsula([15, 25], [33, 25], 2.4), 'venda'],
      [elipse([20, 25.5], 1.6, 1.3), 'sangre'],
      [elipse([28, 25.5], 1.6, 1.3), 'sangre'],
      [capsula([20, 27], [20, 31], 0.6), 'sangre'],
      [capsula([28, 27], [28.5, 30], 0.6), 'sangre'],
      // La máscara ciega, subida a la frente: lisa, sin ojos.
      [elipse([24, 17], 8, 4.5), 'hueso'],
    ],
    48,
    48,
    PALETA,
  );
}

/** La figura de la sala: encorvado, de perfil hacia la izquierda, con bastón. */
export function figura() {
  return rasterizar(
    [
      // El bastón, por detrás de la mano.
      [capsula([7, 22], [5, 47], 1), 'madera'],
      // El hábito, largo hasta el suelo, con la espalda curvada.
      [
        poligono([
          [9, 47],
          [10, 30],
          [13, 20],
          [20, 16],
          [26, 20],
          [27, 32],
          [26, 47],
        ]),
        'habito',
      ],
      // La capucha adelantada y el rostro asomando.
      [elipse([15, 15], 6, 6.5), 'habito'],
      [elipse([12, 16.5], 3.6, 4.4), 'sombra'],
      [elipse([11.5, 17], 2.6, 3.4), 'piel'],
      [capsula([9, 16], [13.5, 16], 1), 'venda'],
      [elipse([10, 17.2], 0.7, 0.6), 'sangre'],
      [elipse([11.5, 20.2], 2.2, 1.6), 'barba'],
      // La máscara en la frente.
      [elipse([13, 11.8], 3, 1.5), 'hueso'],
      // El brazo hacia el bastón.
      [capsula([16, 24], [8, 25], 1.8), 'habito'],
      [elipse([7.5, 25], 1.4, 1.4), 'piel'],
    ],
    32,
    48,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, 'retrato.png'), png(retrato()));
  writeFileSync(join(destino, 'figura.png'), png(figura()));
  console.log('el Cegado: retrato y figura -> sigma/arte/cegado/');
}
