/**
 * La Vestal de Subterfuge Sigma, en tres cuartos, con el mismo titere que el
 * Cirujano (scripts/cirujano-sigma.mjs).
 *
 * La biblia: el Colegio de las Vestales, mujeres, herederas del linaje de
 * Genesis Vestal, interpretan el Latido; a las interpretes se les cubren los
 * ojos. Alba larga de hueso, toca alta con velo a la espalda, la venda, una
 * banda de sangre y el sello del diezmo en la mano. Mas alta y estrecha que el
 * Devoto (~46 px): no pelea, administra.
 *
 * Sale a `sigma/arte/vestal/<animacion>-<n>.png`, el sello (`sello.png`) y
 * `hoja.png`. Uso:  npm run sigma:vestal
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, hacia, mas, png, poligono, rasterizar, rot } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/vestal');

export const ANCHO = 40;
export const ALTO = 54;
export const SUELO = 52;
export const CADERA = [19, 35];

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#140c0b'),
  alba: trio('#cdbfa4', '#e6dac2', '#9a8c74'),
  interior: trio('#6a5e4c', '#857660', '#3e3428'),
  toca: trio('#e2d6be', '#f6eedc', '#a8987c'),
  velo: trio('#8a7e6a', '#a89a82', '#5c5244'),
  piel: trio('#c9a88a', '#e3c7a9', '#9a7a60'),
  venda: trio('#7a1e1a', '#9a2e26', '#4e1210'),
  banda: trio('#8e2a24', '#b0433a', '#5e1a16'),
  oro: trio('#b8862a', '#e8c060', '#7a5418'),
  cera: trio('#a8231c', '#d0423a', '#6e1410'),
  guante: trio('#4a2e22', '#6a4432', '#2a1812'),
};

function piezas(p) {
  const cadera = p.cadera ?? CADERA;
  const lean = p.lean ?? 0;
  const pecho = mas(mas(cadera, rot([0, -12], lean)), [0, p.bob ?? 0]);
  const cuello = mas(pecho, rot([0, -3], lean));
  const cabeceo = lean + (p.cabeceo ?? 0);
  const cabeza = mas(cuello, rot([1, -4], cabeceo));
  const en = (v) => mas(cabeza, rot(v, cabeceo));
  const hombroCerca = mas(pecho, [-2, 1]);
  const hombroLejos = mas(pecho, [3, 0.5]);
  const sway = p.sway ?? 0;
  const out = [];

  // El velo cae por la espalda, detras de todo.
  out.push([
    poligono([
      en([-2, -5]),
      en([-4.5, -1]),
      [cuello[0] - 6 + sway, pecho[1] + 10],
      [cuello[0] - 2 + sway, pecho[1] + 12],
      en([0, 2]),
    ]),
    'velo',
  ]);
  // Brazo lejano.
  const [l1, l2] = p.lejos ?? [0.15, 0.6];
  const codoL = mas(hombroLejos, hacia(l1, 5));
  const manoL = mas(codoL, hacia(l1 + l2, 4.5));
  out.push([capsula(hombroLejos, codoL, 1.8), 'interior']);
  out.push([capsula(codoL, manoL, 1.8, 2.3), 'interior']);
  out.push([elipse(manoL, 1.2, 1.2), 'guante']);
  // El alba hasta el suelo: no se le ven los pies, solo la punta del zapato.
  const bajo = SUELO - 1;
  const pasoX = p.paso ?? 0;
  out.push([elipse([cadera[0] + 2 + pasoX, SUELO - 0.5], 2.5, 1.2), 'guante']);
  out.push([
    poligono([
      mas(hombroCerca, [-2, 0]),
      mas(cuello, [-2, 1]),
      mas(cuello, [2.5, 1]),
      mas(hombroLejos, [2.5, 0.5]),
      [cadera[0] + 5 + sway * 0.4, cadera[1]],
      [cadera[0] + 8 + sway, bajo],
      [cadera[0] - 7 + sway, bajo],
      [cadera[0] - 5 + sway * 0.4, cadera[1]],
    ]),
    'alba',
  ]);
  // Los pliegues de delante y la banda de sangre cruzada (tres cuartos).
  out.push([
    capsula([cadera[0] + 2, cadera[1] + 2], [cadera[0] + 3 + sway, bajo - 1], 0.6),
    'interior',
  ]);
  out.push([capsula(mas(cuello, [3, 2]), [cadera[0] - 3, cadera[1] - 1], 1.1), 'banda']);
  out.push([capsula(mas(cadera, [-5, -1]), mas(cadera, [5, -1.5]), 0.7), 'oro']);
  // La cabeza: rostro en tres cuartos, la venda roja y la toca alta.
  out.push([elipse(mas(cabeza, [0.6, 0.4]), 3.3, 4), 'piel']);
  out.push([capsula(en([-2.5, -0.8]), en([4, -0.8]), 1.1), 'venda']);
  out.push([
    poligono([
      en([-4, 0]),
      en([-4.5, -5]),
      en([-2, -10]),
      en([2.5, -9]),
      en([4.2, -4]),
      en([3.6, -2.4]),
      en([-1, -2.6]),
    ]),
    'toca',
  ]);
  out.push([capsula(en([-3.6, -3]), en([3.8, -3.2]), 0.55), 'oro']);
  // Brazo cercano, con el sello del diezmo.
  const [c1, c2] = p.cerca ?? [0.2, 0.7];
  const codo = mas(hombroCerca, hacia(c1, 5));
  const mano = mas(codo, hacia(c1 + c2, 4.5));
  out.push([capsula(hombroCerca, codo, 2), 'alba']);
  out.push([capsula(codo, mano, 2, 2.5), 'alba']);
  if (p.sello !== false) {
    const brillo = p.brillo ?? 0;
    if (brillo) out.push([elipse(mano, 3 + brillo, 3 + brillo), 'toca']);
    out.push([elipse(mano, 2.6, 2.6), 'oro']);
    out.push([elipse(mano, 1.5, 1.5), 'cera']);
  }
  out.push([elipse(mas(mano, [0, 1.6]), 1.1, 1), 'guante']);
  return out;
}

const C = CADERA;
const baja = (dy, dx = 0) => [C[0] + dx, C[1] + dy];

const reposo = [0, 1].map((b) => ({ bob: b, lean: 0.03 }));
const andar = Array.from({ length: 4 }, (_, i) => {
  const s = Math.sin((i / 4) * 2 * Math.PI);
  return {
    cadera: baja(Math.abs(s) > 0.7 ? 1 : 0),
    lean: 0.05,
    paso: Math.round(2 * s),
    sway: -s,
    cerca: [0.2 - 0.2 * s, 0.7],
    lejos: [0.15 + 0.2 * s, 0.6],
  };
});
// Invoca: alza el sello, que se enciende. Es el aviso: largo y claro.
const alza = [
  { lean: -0.06, cerca: [2.3, 0.4], lejos: [0.4, 0.8], brillo: 1 },
  { lean: -0.12, cabeceo: -0.1, cerca: [2.7, 0.3], lejos: [0.5, 0.9], brillo: 2.5 },
];
const lanza = [
  {
    cadera: baja(0, 1),
    lean: 0.18,
    cerca: [1.55, 0.05],
    lejos: [-0.4, 0.4],
    sello: false,
    sway: -1,
  },
];
const aturdido = [
  {
    cadera: baja(1),
    lean: -0.25,
    cabeceo: -0.3,
    cerca: [-0.6, 0.2],
    lejos: [-0.3, 0.2],
    sway: 1.5,
    sello: false,
  },
];
const ejecutado = [
  {
    cadera: baja(7),
    lean: 0.12,
    cabeceo: 0.45,
    cerca: [0.5, 0.6],
    lejos: [0.4, 0.6],
    sello: false,
  },
];

export const ANIMACIONES = { reposo, andar, alza, lanza, aturdido, ejecutado };

export function dibujar(pose) {
  return rasterizar(piezas(pose), ANCHO, ALTO, PALETA);
}

/** El sello del diezmo, el proyectil: oro con su lacre. */
function sello() {
  return rasterizar(
    [
      [elipse([5, 5], 4.2, 4.2), 'oro'],
      [elipse([5, 5], 2.6, 2.6), 'cera'],
      [capsula([3.5, 5], [6.5, 5], 0.5), 'oro'],
    ],
    10,
    10,
    PALETA,
  );
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const fondo = [42, 32, 48, 255];
  const cuadros = [];
  for (const [nombre, poses] of Object.entries(ANIMACIONES)) {
    poses.forEach((pose, i) => {
      const img = dibujar(pose);
      writeFileSync(join(destino, `${nombre}-${i}.png`), png(img));
      cuadros.push(img);
    });
  }
  writeFileSync(join(destino, 'sello.png'), png(sello()));
  const filas = [];
  for (let y = 0; y < ALTO; y += 1) {
    const linea = cuadros.flatMap((c) =>
      [...c[y], fondo, fondo].flatMap((p) => Array(4).fill(p[3] ? p : fondo)),
    );
    for (let r = 0; r < 4; r += 1) filas.push(linea);
  }
  writeFileSync(join(destino, 'hoja.png'), png(filas));
  console.log(`${cuadros.length} fotogramas de la Vestal y el sello -> sigma/arte/vestal/`);
}
