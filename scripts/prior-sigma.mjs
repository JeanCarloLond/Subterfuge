/**
 * El Prior del Diezmo de Subterfuge Sigma (#219), el primer guardián,
 * provisional y en código hasta que Mariana lo pinte. El clérigo que injerta
 * el metal del diezmo en los fieles: alto, de sotana roja con estola de oro,
 * la máscara ciega de las Manos (hueso, sin ojos) y una mitra sin cruz. Su
 * báculo acaba en la Injertadora, que el Cirujano se queda al vencerlo.
 *
 * Una figura de 48x72 por pose, mirando a la derecha y con los pies abajo.
 * Sale a `sigma/arte/prior/`. Uso:  npm run sigma:prior
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/prior');
const ANCHO = 48;
const ALTO = 72;

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#100808'),
  sotana: trio('#6e1c1a', '#8e2c26', '#4a100e'),
  mitra: trio('#5a1614', '#7a2420', '#3a0c0a'),
  oro: trio('#b8862a', '#e8c060', '#6e4a14'),
  hueso: trio('#d8d0bc', '#f0ead8', '#a8a08a'),
  boca: trio('#3a1a18', '#4e2622', '#241010'),
  hierro: trio('#5a5a60', '#8a8a92', '#34343a'),
  carne: trio('#a8564c', '#c87268', '#7a3a32'),
  brillo: trio('#9cc2dc', '#d8ecf8', '#5e86a4'),
};

/** El cuerpo, igual en casi todas: `bajada` lo hunde (arrodillado). */
function cuerpo(bajada = 0) {
  const y = (v) => v + bajada;
  return [
    // La sotana, ancha abajo.
    [
      poligono([
        [15, y(26)],
        [33, y(26)],
        [41, ALTO - 1],
        [7, ALTO - 1],
      ]),
      'sotana',
    ],
    // La estola de oro.
    [capsula([24, y(28)], [24, ALTO - 4], 1.6), 'oro'],
    // La cabeza: la mascara ciega de las Manos, lisa, con la boca cosida.
    [elipse([24, y(19)], 6, 7), 'hueso'],
    [capsula([21.5, y(23)], [26.5, y(23)], 0.6), 'boca'],
    // La mitra, alta y sin cruz, con su filo de oro.
    [
      poligono([
        [17, y(15)],
        [31, y(15)],
        [28, y(1)],
        [24, y(-2)],
        [20, y(1)],
      ]),
      'mitra',
    ],
    [capsula([17.5, y(14.5)], [30.5, y(14.5)], 1), 'oro'],
  ];
}

/** El baculo de `a` a `b`, rematado en la Injertadora (la aguja y el deposito). */
function baculo(a, b) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const largo = Math.hypot(dx, dy);
  const [ux, uy] = [dx / largo, dy / largo];
  const punta = [b[0] + ux * 6, b[1] + uy * 6];
  return [
    [capsula(a, b, 1.3), 'hierro'],
    [elipse(b, 3.4, 3.4), 'hierro'],
    [elipse(b, 1.8, 1.8), 'carne'],
    [capsula(b, punta, 0.7), 'brillo'],
  ];
}

/** Un brazo de `hombro` a `mano`. */
function brazo(hombro, mano) {
  return [
    [capsula(hombro, mano, 2.6), 'sotana'],
    [elipse(mano, 2.2, 2.2), 'hueso'],
  ];
}

const POSES = {
  // De pie, el baculo plantado a su lado.
  reposo: () => [...baculo([37, 70], [37, 10]), ...cuerpo(), ...brazo([30, 30], [37, 38])],
  // Alza el baculo por detras: el golpe va a venir.
  alza: () => [...cuerpo(), ...baculo([30, 34], [10, 4]), ...brazo([30, 30], [28, 26])],
  // El golpe, de arriba abajo por delante.
  golpe: () => [...cuerpo(), ...baculo([32, 34], [46, 52]), ...brazo([30, 30], [34, 36])],
  // Lanza: el brazo libre por delante, la mano encendida.
  lanza: () => [
    ...baculo([12, 70], [12, 12]),
    ...cuerpo(),
    ...brazo([18, 30], [12, 38]),
    ...brazo([30, 30], [42, 28]),
    [elipse([43, 28], 2.4, 2.4), 'brillo'],
  ],
  // El diezmo: el baculo con las dos manos, por encima de la cabeza.
  diezmo: () => [
    ...cuerpo(),
    ...brazo([18, 30], [10, 6]),
    ...brazo([30, 30], [38, 6]),
    ...baculo([4, 6], [42, 6]),
  ],
  // Aturdido: se le va el cuerpo, el baculo cae.
  aturdido: () => [...baculo([40, 70], [44, 30]), ...cuerpo(2), ...brazo([30, 32], [38, 44])],
  // Vencido: de rodillas, apoyado en el baculo. Se le puede ejecutar.
  arrodillado: () => [...baculo([36, 70], [36, 26]), ...cuerpo(16), ...brazo([30, 46], [36, 50])],
};

/**
 * El retrato del diálogo antes de la pelea (#242): busto de frente, 48x48 (se
 * pinta al doble). La máscara ciega, sin ojos y con la boca cosida, bajo la
 * mitra.
 */
export function retrato() {
  return rasterizar(
    [
      // Los hombros, la sotana y la estola de oro.
      [
        poligono([
          [1, 48],
          [8, 36],
          [40, 36],
          [47, 48],
        ]),
        'sotana',
      ],
      [capsula([18, 38], [16, 48], 1.6), 'oro'],
      [capsula([30, 38], [32, 48], 1.6), 'oro'],
      // La máscara ciega, lisa, y la boca cosida.
      [elipse([24, 27], 9, 11), 'hueso'],
      [capsula([20, 33], [28, 33], 0.6), 'boca'],
      [capsula([21, 32], [21, 34], 0.4), 'boca'],
      [capsula([24, 32], [24, 34], 0.4), 'boca'],
      [capsula([27, 32], [27, 34], 0.4), 'boca'],
      // La mitra, alta y sin cruz, con su filo y su franja de oro.
      [
        poligono([
          [14, 19],
          [34, 19],
          [30, 4],
          [24, -1],
          [18, 4],
        ]),
        'mitra',
      ],
      [capsula([24, 18], [24, 2], 0.7), 'oro'],
      [capsula([14.5, 18.5], [33.5, 18.5], 1.1), 'oro'],
    ],
    48,
    48,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  for (const [nombre, pose] of Object.entries(POSES))
    writeFileSync(join(destino, `${nombre}.png`), png(rasterizar(pose(), ANCHO, ALTO, PALETA)));
  writeFileSync(join(destino, 'retrato.png'), png(retrato()));
  console.log(`el Prior: ${Object.keys(POSES).length} poses y retrato -> sigma/arte/prior/`);
}
