/**
 * El Devoto de Subterfuge Sigma, en tres cuartos, con el mismo titere que el
 * Cirujano (scripts/cirujano-sigma.mjs): cada fotograma es una pose y las
 * piezas se pintan pixel a pixel en ella.
 *
 * La biblia: los Devotos de los pabellones trabajan, pagan el diezmo y
 * defienden el Vientre como milicia; marcas menores, cicatrices doradas. Casi
 * enteros: "ha pagado un diezmo y sigue siendo reconocible". Mas bajos y mas
 * anchos que el Cirujano (~42 px), con sayo de trabajo, mandil de cuero y la
 * venda en los ojos. Dos variantes, como en el original: a uno le pusieron un
 * APARATO (brazo y pierna de metal) y al otro un brazo de CARNE injertada.
 *
 * Sale a `sigma/arte/devoto/<variante>-<animacion>-<n>.png` y `hoja.png`.
 *
 * Uso:  npm run sigma:devoto
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  arco,
  capsula,
  elipse,
  hacia,
  mas,
  png,
  poligono,
  rasterizar,
  rot,
} from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/devoto');

export const ANCHO = 40;
export const ALTO = 50;
export const SUELO = 48;
export const CADERA = [19, 34];

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

const PALETA = {
  contorno: hx('#140c0b'),
  sayo: trio('#6a4a36', '#8a6448', '#4a3224'),
  cuero: trio('#3a2620', '#54382c', '#22140f'),
  interior: trio('#2e1e18', '#46302a', '#140c0b'),
  piel: trio('#b8977a', '#d2b294', '#86684e'),
  venda: trio('#d9cbb0', '#efe5d2', '#a8987c'),
  oro: trio('#b8862a', '#e0b048', '#7a5418'),
  acero: trio('#8fa3a8', '#c4d4d6', '#56686c'),
  carne: trio('#a8382f', '#c85a4a', '#6e1e18'),
  smearAcero: trio('#d6e6e6', '#f4fbfb', '#a8c0c0'),
  smearCarne: trio('#e8b0a4', '#fbe0d8', '#c8806e'),
};

/** Las piezas de una pose del Devoto, de atras adelante. */
function piezas(p, variante) {
  const cadera = p.cadera ?? CADERA;
  const lean = p.lean ?? 0;
  const pecho = mas(mas(cadera, rot([0, -11], lean)), [0, p.bob ?? 0]);
  const cuello = mas(pecho, rot([0, -2.5], lean));
  const cabeceo = lean + (p.cabeceo ?? 0);
  const cabeza = mas(cuello, rot([1, -3.8], cabeceo));
  const hombroCerca = mas(pecho, [-2.5, 1]);
  const hombroLejos = mas(pecho, [3, 0.5]);
  const bajo = Math.min(SUELO - 7, cadera[1] + 7);
  const en = (v) => mas(cabeza, rot(v, cabeceo));
  const out = [];

  // Brazo lejano.
  const [l1, l2] = p.lejos ?? [0.2, 0.4];
  const codoL = mas(hombroLejos, hacia(l1, 5));
  const manoL = mas(codoL, hacia(l1 + l2, 4.5));
  out.push([capsula(hombroLejos, codoL, 2), 'interior']);
  out.push([capsula(codoL, manoL, 1.9), 'interior']);
  out.push([elipse(manoL, 1.4, 1.4), 'cuero']);

  // Piernas: pantalon y botas; al del aparato, la de delante es de metal.
  const piernas = [
    [2.5, p.zancadaLejos ?? 2, p.alzaLejos ?? 0, 'interior'],
    [-2.5, p.zancadaCerca ?? -1, p.alzaCerca ?? 0, variante === 'aparato' ? 'acero' : 'interior'],
  ];
  for (const [lado, zancada, alza, material] of piernas) {
    const rodilla = [cadera[0] + lado + zancada * 0.5, cadera[1] + 7 - alza * 0.5];
    const pie = [cadera[0] + lado + zancada, Math.min(SUELO - 1.5, cadera[1] + 12.5) - alza];
    out.push([capsula([cadera[0] + lado * 0.6, cadera[1] + 2], rodilla, 2.1), material]);
    out.push([capsula(rodilla, pie, 1.8), material]);
    out.push([
      poligono([
        [pie[0] - 2.3, pie[1] - 1.6],
        [pie[0] + 1.6, pie[1] - 1.6],
        [pie[0] + 3.4, pie[1] + 0.3],
        [pie[0] + 3.4, pie[1] + 1.5],
        [pie[0] - 2.4, pie[1] + 1.5],
      ]),
      'cuero',
    ]);
  }

  // El sayo, hasta la rodilla, y el mandil de cuero por delante (tres cuartos).
  const sway = p.sway ?? 0;
  out.push([
    poligono([
      mas(hombroCerca, [-2.5, 0]),
      mas(cuello, [-2, 1]),
      mas(cuello, [2.5, 1]),
      mas(hombroLejos, [2.8, 0.5]),
      [cadera[0] + 6.5 + sway * 0.4, cadera[1]],
      [cadera[0] + 8 + sway, bajo],
      [cadera[0] - 7 + sway, bajo],
      [cadera[0] - 6 + sway * 0.4, cadera[1]],
    ]),
    'sayo',
  ]);
  out.push([
    poligono([
      mas(cuello, [0.5, 3]),
      mas(cuello, [5, 3]),
      [cadera[0] + 7 + sway * 0.8, bajo - 0.5],
      [cadera[0] + 0.5 + sway * 0.8, bajo - 0.5],
    ]),
    'cuero',
  ]);
  out.push([capsula(mas(cadera, [-6, -1.5]), mas(cadera, [6.5, -2]), 0.7), 'oro']);

  // La cabeza: rapada, la venda en los ojos y una cicatriz de oro (biblia).
  out.push([elipse(mas(cabeza, [0.3, 0]), 3.8, 4.3), 'piel']);
  out.push([capsula(en([-3, -1]), en([4, -0.8]), 1.15), 'venda']);
  out.push([capsula(en([1.5, 1.4]), en([3.4, 3.2]), 0.45), 'oro']);
  out.push([elipse(en([-2.2, 0.8]), 0.9, 1.2), 'piel']); // la oreja

  // El arco del golpe, detras del brazo.
  if (p.smear) {
    const [t0, t1, rIn, rOut] = p.smear;
    out.push([
      arco(hombroCerca, rIn, rOut, t0, t1, true),
      variante === 'aparato' ? 'smearAcero' : 'smearCarne',
    ]);
  }

  // El brazo que golpea: un aparato de metal con garra, o carne injertada.
  const [c1, c2] = p.cerca ?? [0.3, 0.5];
  const codo = mas(hombroCerca, hacia(c1, 5));
  const ang = c1 + c2;
  if (variante === 'aparato') {
    const fin = mas(codo, hacia(ang, 7));
    out.push([capsula(hombroCerca, codo, 2.2), 'sayo']);
    out.push([capsula(codo, fin, 2.2, 1.8), 'acero']);
    out.push([elipse(codo, 1.6, 1.6), 'oro']); // la abrazadera
    for (const abre of [-0.45, 0.45]) {
      out.push([capsula(fin, mas(fin, hacia(ang + abre, 3.5)), 0.7), 'acero']);
    }
  } else {
    const fin = mas(codo, hacia(ang, 6));
    out.push([capsula(hombroCerca, codo, 2.2), 'sayo']);
    out.push([capsula(codo, fin, 2.4, 3.6), 'carne']);
    out.push([elipse(mas(codo, hacia(ang, 3)), 2.2, 2.2), 'carne']);
    out.push([capsula(mas(codo, hacia(ang, 1)), mas(codo, hacia(ang, 4)), 0.5), 'oro']); // la sutura
  }
  return out;
}

// -- Las animaciones ----------------------------------------------------------

const C = CADERA;
const baja = (dy, dx = 0) => [C[0] + dx, C[1] + dy];

const andar = Array.from({ length: 4 }, (_, i) => {
  const s = Math.sin((i / 4) * 2 * Math.PI);
  return {
    cadera: baja(Math.abs(s) > 0.7 ? 1 : 0),
    lean: 0.06,
    zancadaCerca: Math.round(3 * s),
    zancadaLejos: Math.round(-3 * s),
    alzaCerca: s < -0.5 ? 1 : 0,
    alzaLejos: s > 0.5 ? 1 : 0,
    cerca: [0.3 - 0.3 * s, 0.5],
    lejos: [0.2 + 0.3 * s, 0.4],
  };
});

// El aviso: se echa atras y alza el brazo. Es el tell: tiene que leerse.
const aviso = [
  {
    cadera: baja(1),
    lean: -0.12,
    cerca: [-2.2, -0.5],
    lejos: [0.5, 0.5],
    zancadaCerca: -2,
    zancadaLejos: 2,
  },
  {
    cadera: baja(1, -1),
    lean: -0.18,
    cerca: [-2.5, -0.6],
    lejos: [0.6, 0.5],
    zancadaCerca: -2,
    zancadaLejos: 2,
  },
];
const golpe = [
  {
    lean: 0.08,
    cerca: [0.9, 0.2],
    lejos: [0.1, 0.3],
    zancadaCerca: 1,
    zancadaLejos: 1,
    smear: [-2.5, 1.4, 8, 15],
  },
  {
    cadera: baja(1, 2),
    lean: 0.26,
    cerca: [1.45, 0.1],
    lejos: [-0.4, 0.3],
    zancadaCerca: 3,
    zancadaLejos: -1,
    sway: -1,
  },
];
// Aturdido tras el parry: encorvado, la cabeza gacha, el brazo colgando.
const aturdido = [
  {
    cadera: baja(1),
    lean: 0.3,
    cabeceo: 0.35,
    cerca: [0.1, 0.1],
    lejos: [0.1, 0.1],
    zancadaCerca: -1,
    zancadaLejos: 2,
  },
];
// De rodillas, esperando el tajo de la ejecucion.
const ejecutado = [
  {
    cadera: baja(6),
    lean: 0.12,
    cabeceo: 0.4,
    cerca: [0.4, 0.2],
    lejos: [0.3, 0.2],
    zancadaCerca: 2,
    zancadaLejos: -2,
  },
];

export const ANIMACIONES = { andar, aviso, golpe, aturdido, ejecutado };
export const VARIANTES = ['aparato', 'carne'];

export function dibujar(pose, variante) {
  return rasterizar(piezas(pose, variante), ANCHO, ALTO, PALETA);
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const fondo = [42, 32, 48, 255];
  const filas = [];
  let total = 0;
  for (const variante of VARIANTES) {
    const cuadros = [];
    for (const [nombre, poses] of Object.entries(ANIMACIONES)) {
      poses.forEach((pose, i) => {
        const img = dibujar(pose, variante);
        writeFileSync(join(destino, `${variante}-${nombre}-${i}.png`), png(img));
        cuadros.push(img);
        total += 1;
      });
    }
    // Una fila por variante, ampliada x4, para revisar.
    for (let y = 0; y < ALTO; y += 1) {
      const linea = cuadros.flatMap((c) =>
        [...c[y], fondo, fondo].flatMap((p) => Array(4).fill(p[3] ? p : fondo)),
      );
      for (let r = 0; r < 4; r += 1) filas.push(linea);
    }
  }
  writeFileSync(join(destino, 'hoja.png'), png(filas));
  console.log(`${total} fotogramas del Devoto -> sigma/arte/devoto/`);
}
