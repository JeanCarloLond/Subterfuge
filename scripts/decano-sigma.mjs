/**
 * El Decano de las Manos de Subterfuge Sigma (#256), provisional y en codigo
 * hasta que Mariana lo pinte. Es el Cirujano de otro tiempo, a proposito: el
 * mismo titere, el mismo oficio, una pelea de espejo. Mas gris y mas viejo, con
 * la mascara ciega puesta, sin ojos, que el Cirujano se quito.
 *
 * Sale a `sigma/arte/decano/<pose>.png` y `retrato.png`.
 *
 * Uso:  npm run sigma:decano
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ANIMACIONES,
  capsula,
  dibujar,
  elipse,
  PALETA,
  png,
  poligono,
  rasterizar,
} from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/decano');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const GRIS = {
  ...PALETA,
  habito: trio('#a39c8e', '#c4bdae', '#6e6858'),
  capucha: trio('#8e8878', '#aaa494', '#5e5848'),
  mitra: trio('#b6b0a2', '#d2ccbe', '#7c7668'),
  escapulario: trio('#2e2220', '#46342e', '#160e0c'),
  oro: trio('#8e7838', '#b49c54', '#5a4a1c'),
  gema: trio('#4a3a34', '#6a564c', '#2a1e1a'),
};

/** Las poses, sacadas de las del Cirujano: pelean igual. */
const POSES = {
  reposo: ANIMACIONES.reposo[0],
  andar: ANIMACIONES.correr[1],
  alza: ANIMACIONES.golpe[1],
  tajo: ANIMACIONES.golpe[2],
  estocada: ANIMACIONES.contragolpe[2],
  guardia: ANIMACIONES.guardia[0],
  aturdido: ANIMACIONES.herido[0],
  arrodillado: ANIMACIONES.rezar[0],
};

/** Su retrato para la caja de los dialogos: 48 px, como el del Prior. */
function retrato() {
  return rasterizar(
    [
      [
        poligono([
          [10, 22],
          [38, 22],
          [44, 46],
          [4, 46],
        ]),
        'capucha',
      ],
      [elipse([24, 28], 11, 13), 'mascara'],
      [capsula([16, 25], [22, 26], 0.5), 'pliegue'],
      [capsula([26, 26], [32, 25], 0.5), 'pliegue'],
      [capsula([24, 30], [24, 36], 0.5), 'pliegue'],
      [
        poligono([
          [13, 18],
          [35, 18],
          [41, 9],
          [34, 3],
          [24, 1],
          [14, 3],
          [7, 9],
        ]),
        'mitra',
      ],
      [capsula([14, 18], [34, 18], 1), 'oro'],
      [capsula([24, 17], [12, 5], 0.6), 'oro'],
      [capsula([24, 17], [36, 5], 0.6), 'oro'],
      [elipse([24, 8], 2.5, 3), 'oro'],
      [elipse([24, 8], 1.3, 1.6), 'gema'],
    ],
    48,
    48,
    GRIS,
  );
}

mkdirSync(destino, { recursive: true });
for (const [nombre, pose] of Object.entries(POSES)) {
  writeFileSync(
    join(destino, `${nombre}.png`),
    png(dibujar({ ...pose, mascara: true }, { paleta: GRIS })),
  );
}
writeFileSync(join(destino, 'retrato.png'), png(retrato()));
console.log(`${Object.keys(POSES).length} poses del Decano -> sigma/arte/decano/`);
