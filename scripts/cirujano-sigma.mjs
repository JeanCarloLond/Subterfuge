/**
 * El Cirujano de Subterfuge Sigma, en tres cuartos y fotograma a fotograma.
 *
 * Provisional hasta que llegue el arte de Mariana, pero hecho para que se
 * juegue como Blasphemous: ~50 px de alto a 640x360 (lo que mide el Penitente),
 * el torso girado hacia la camara y animaciones con anticipacion, un fotograma
 * de smear en el golpe e impacto sostenido.
 *
 * No se dibuja a mano cada fotograma: cada uno es una POSE, un esqueleto
 * (cadera, inclinacion, angulos de los brazos, zancada). Las piezas del cuerpo
 * se rasterizan pixel a pixel en cada pose, sin rotar imagenes, asi que no se
 * emborronan; despues se sombrean por bandas (luz arriba a la izquierda) y se
 * contornean. Una animacion nueva es una lista de poses.
 *
 * Sale a `sigma/arte/cirujano/<animacion>-<n>.png`, mas `animaciones.gd`
 * (cuantos fotogramas tiene cada una: un .gd y no un .json, porque Godot solo
 * exporta los recursos) y `hoja.png` (todas, ampliadas, para revisarlas de un
 * vistazo). Los PNG se suben al repo, como los provisionales.
 *
 * Tambien saca las reliquias (`sigma/arte/reliquias/`), con las mismas piezas.
 *
 * Uso:  npm run sigma:cirujano
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/cirujano');

export const ANCHO = 48;
export const ALTO = 58;
/** La fila de los pies. */
export const SUELO = 56;
/** Donde cae la cadera en reposo: el origen del Sprite2D en x. */
export const CADERA = [21, 39];

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];

/**
 * Carne y oxido, la paleta del canon de Sigma: bata de hueso manchada,
 * escapulario de sangre, cuero y oxido. Base, luz y sombra de cada material.
 */
const PALETA = {
  contorno: hx('#140c0b'),
  habito: trio('#b9a888', '#d9cbb0', '#8a7a60'),
  interior: trio('#3a2420', '#5a3830', '#140c0b'),
  escapulario: trio('#8e2a24', '#b0433a', '#5e1a16'),
  oro: trio('#a8562a', '#c87a45', '#6e3418'),
  capucha: trio('#5a3830', '#7a4e42', '#3a2420'),
  mitra: trio('#8a7a60', '#b9a888', '#5c5040'),
  guante: trio('#4a2e22', '#6a4432', '#2a1812'),
  acero: trio('#c9ced4', '#f2f4f6', '#7f8690'),
  smear: trio('#f2e6d0', '#fffaf0', '#d9cbb0'),
  piel: trio('#c9a88a', '#e3c7a9', '#9a7a60'),
  venda: trio('#d9cbb0', '#efe5d2', '#a8987c'),
  sangre: trio('#8e2a24', '#a8382f', '#5e1a16'),
  vidrio: trio('#9fb3b8', '#d8e6e8', '#5f7378'),
  // Las reliquias: restos de los Primigenios.
  carne: trio('#a8382f', '#c85a4a', '#6e1e18'),
  tendon: trio('#c8907a', '#e2b6a0', '#8a5a48'),
  hueso: trio('#d9cbb0', '#f0e6d2', '#a8987c'),
};

// -- Geometria ----------------------------------------------------------------

/** Gira un vector; positivo: lo de arriba va hacia delante (a la derecha). */
export const rot = ([x, y], a) => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
];
export const mas = (a, b) => [a[0] + b[0], a[1] + b[1]];
/** Un angulo medido desde la vertical hacia abajo; positivo, hacia delante. */
export const hacia = (theta, largo) => [Math.sin(theta) * largo, Math.cos(theta) * largo];

export function poligono(puntos) {
  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    let dentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i, i += 1) {
      const [xi, yi] = puntos[i];
      const [xj, yj] = puntos[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi)
        dentro = !dentro;
    }
    return dentro;
  };
}

export function capsula(a, b, r0, r1 = r0) {
  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2));
    const r = r0 + (r1 - r0) * t;
    return (px - a[0] - t * dx) ** 2 + (py - a[1] - t * dy) ** 2 <= r * r;
  };
}

export function elipse(c, rx, ry) {
  return (x, y) => ((x + 0.5 - c[0]) / rx) ** 2 + ((y + 0.5 - c[1]) / ry) ** 2 <= 1;
}

/**
 * El smear: una corona entre r_in y r_out que va de t0 a t1, gruesa en medio
 * del arco (donde el filo va mas rapido) y fina en las puntas. `porArriba`
 * decide por donde pasa: un tajo de arriba abajo cruza la vertical de la
 * cabeza, uno hacia abajo la de los pies.
 */
export function arco(c, rIn, rOut, t0, t1, porArriba) {
  const norm = (t) => (porArriba ? ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) : t);
  const [lo, hi] = [norm(t0), norm(t1)].sort((a, b) => a - b);
  return (x, y) => {
    const dx = x + 0.5 - c[0];
    const dy = y + 0.5 - c[1];
    const d = Math.hypot(dx, dy);
    if (d < rIn || d > rOut) return false;
    const t = norm(Math.atan2(dx, dy));
    if (t < lo || t > hi) return false;
    const medio = (t - lo) / (hi - lo + 1e-9);
    return d <= rOut - (rOut - rIn) * (1 - Math.sin(medio * Math.PI)) * 0.85;
  };
}

// -- La figura ----------------------------------------------------------------

/** Las piezas de una pose, de atras adelante: [forma, material]. */
function piezas(p) {
  const cadera = p.cadera ?? CADERA;
  const lean = p.lean ?? 0;
  const pecho = mas(mas(cadera, rot([0, -13], lean)), [0, p.bob ?? 0]);
  const cuello = mas(pecho, rot([0, -3], lean));
  const cabeza = mas(cuello, rot([1, -4], lean + (p.cabeceo ?? 0)));
  const cabezaLean = lean + (p.cabeceo ?? 0);
  const hombroCerca = mas(pecho, [-2, 1]);
  const hombroLejos = mas(pecho, [3, 0]);
  const sway = p.sway ?? 0;
  const vuelo = p.vuelo ?? 0;
  const bajo = Math.min(SUELO - 4, cadera[1] + 13);
  const out = [];
  const en = (centro, v, a = cabezaLean) => mas(centro, rot(v, a));

  // Brazo lejano, detras de todo.
  const [l1, l2] = p.lejos ?? [0.15, 0.45];
  const codoL = mas(hombroLejos, hacia(l1, 6));
  const manoL = mas(codoL, hacia(l1 + l2, 5));
  out.push([capsula(hombroLejos, codoL, 1.8, 2), 'interior']);
  out.push([capsula(codoL, manoL, 2, 2.4), 'interior']);
  out.push([elipse(manoL, 1.3, 1.3), 'guante']);

  // Piernas y botas, asomando bajo el habito.
  const piernas = [
    [3, p.zancadaLejos ?? 2, p.alzaLejos ?? 0, 'interior'],
    [-3, p.zancadaCerca ?? -1, p.alzaCerca ?? 0, 'guante'],
  ];
  for (const [lado, zancada, alza, material] of piernas) {
    const pie = [cadera[0] + lado + zancada, Math.min(SUELO - 1.5, cadera[1] + 15.5) - alza];
    out.push([capsula([cadera[0] + lado * 0.6, cadera[1] + 6], pie, 1.6), 'interior']);
    out.push([
      poligono([
        [pie[0] - 2.2, pie[1] - 1.8],
        [pie[0] + 1.5, pie[1] - 1.8],
        [pie[0] + 3.4, pie[1] + 0.2],
        [pie[0] + 3.4, pie[1] + 1.5],
        [pie[0] - 2.4, pie[1] + 1.5],
      ]),
      material,
    ]);
  }

  // El habito: hombros, caida y un bajo que se abre.
  out.push([
    poligono([
      mas(hombroCerca, [-2.5, 0.5]),
      mas(cuello, [-2, 1]),
      mas(cuello, [2.5, 1]),
      mas(hombroLejos, [2.5, 1]),
      [cadera[0] + 6 + sway * 0.5, cadera[1] + 2],
      [cadera[0] + 9 + sway + vuelo, bajo],
      [cadera[0] + 4 + sway, bajo + 1],
      [cadera[0] - 4 + sway, bajo + 1],
      [cadera[0] - 8 + sway - vuelo, bajo],
      [cadera[0] - 5 + sway * 0.5, cadera[1] + 2],
    ]),
    'habito',
  ]);
  // La abertura delantera deja ver el habito de dentro: es lo que hace los
  // tres cuartos, junto con el escapulario de frente.
  out.push([
    poligono([
      [cadera[0] + 3, cadera[1] + 1],
      [cadera[0] + 7.5 + sway + vuelo, bajo],
      [cadera[0] + 2 + sway, bajo + 1],
    ]),
    'interior',
  ]);
  const arribaI = mas(cuello, [0, 2]);
  const arribaD = mas(cuello, [4, 2]);
  const abajoI = [cadera[0] + 1.5 + sway * 0.7, bajo - 1];
  const abajoD = [cadera[0] + 5.5 + sway * 0.7, bajo - 1];
  out.push([poligono([arribaI, arribaD, abajoD, abajoI]), 'escapulario']);
  out.push([capsula(arribaI, abajoI, 0.55), 'oro']);
  out.push([capsula(arribaD, abajoD, 0.55), 'oro']);
  out.push([capsula(mas(cadera, [-5, -1]), mas(cadera, [6, -1.5]), 0.6), 'oro']);

  // El arco del golpe, detras de la cabeza y del brazo: la cara no se tapa.
  if (p.smear) {
    const [t0, t1, rIn, rOut, porArriba = true] = p.smear;
    out.push([arco(hombroCerca, rIn, rOut, t0, t1, porArriba), 'smear']);
  }

  // La cabeza: capucha, la cara en tres cuartos, la venda y el cubrebocas.
  out.push([elipse(mas(cabeza, [-0.5, 0]), 4.3, 4.6), 'capucha']);
  const cara = [
    [0, -3],
    [3.6, -2.6],
    [4.4, -0.6],
    [5.4, 0.6],
    [4.4, 1.4],
    [4.6, 3.4],
    [2.6, 4.6],
    [0, 4],
  ];
  out.push([poligono(cara.map((v) => en(cabeza, v))), 'piel']);
  out.push([capsula(en(cabeza, [-1.5, -1.2]), en(cabeza, [4.6, -1.2]), 1.15), 'venda']);
  out.push([elipse(en(cabeza, [3, -1]), 0.9, 0.8), 'sangre']);
  const boca = [
    [0.5, 1.2],
    [5, 1],
    [4.8, 3.8],
    [2.4, 4.8],
    [0.5, 4.2],
  ];
  out.push([poligono(boca.map((v) => en(cabeza, v))), 'venda']);
  // La mitra, con su banda.
  const mitraLean = cabezaLean * 0.6;
  const mitra = [
    [-4.5, -3],
    [3.8, -3],
    [3.2, -8],
    [1.2, -15.5],
    [-2.6, -9],
  ];
  out.push([poligono(mitra.map((v) => en(cabeza, v, mitraLean))), 'mitra']);
  out.push([
    capsula(en(cabeza, [0, -3.5], mitraLean), en(cabeza, [1, -14], mitraLean), 0.55),
    'oro',
  ]);
  out.push([
    capsula(en(cabeza, [-4, -3.4], mitraLean), en(cabeza, [3.6, -3.4], mitraLean), 0.6),
    'oro',
  ]);

  // Brazo cercano, con el bisturi o el frasco.
  const [c1, c2] = p.cerca ?? [0.25, 0.55];
  const codo = mas(hombroCerca, hacia(c1, 6));
  const angAnte = c1 + c2;
  const mano = mas(codo, hacia(angAnte, 5));
  const angHoja = angAnte + (p.hoja ?? 0.35);
  const mangoFin = mas(mano, hacia(angHoja, 3));
  const punta = mas(mangoFin, hacia(angHoja, 6));
  // La estela de una estocada: una linea de luz detras de la hoja.
  if (p.estela)
    out.push([capsula(mas(hombroCerca, hacia(angHoja, -p.estela)), punta, 0.6, 1.8), 'smear']);
  out.push([capsula(hombroCerca, codo, 2.1, 2.2), 'habito']);
  out.push([capsula(codo, mano, 2.2, 2.7), 'habito']);
  if (p.frasco) {
    const fondo = mas(mano, hacia(angHoja, 4));
    out.push([capsula(mano, fondo, 1.5, 1.7), 'vidrio']);
    out.push([capsula(mas(mano, hacia(angHoja, 1.5)), fondo, 1, 1.2), 'sangre']);
  } else {
    out.push([capsula(mano, mangoFin, 0.7), 'oro']);
    out.push([capsula(mangoFin, punta, 0.85, 0.35), 'acero']);
  }
  out.push([elipse(mano, 1.4, 1.4), 'guante']);
  return out;
}

/** Una pose a pixeles: matriz de [r, g, b, a]. */
export function dibujar(pose, opciones) {
  return rasterizar(piezas(pose), ANCHO, ALTO, PALETA, opciones);
}

/** Un color mas oscuro: el contorno selectivo de cada material. */
const oscurecer = ([r, g, b, a], f) => [Math.round(r * f), Math.round(g * f), Math.round(b * f), a];

/**
 * Piezas a pixeles, con sombreado por bandas y contorno, en `paleta`.
 *
 * Limpio como pixel art dibujado a mano:
 * - contorno SELECTIVO: el borde de cada pieza en su propio color oscurecido,
 *   no en negro (como en Blasphemous); solo el de abajo, el que pisa, casi
 *   negro, para que la figura pese;
 * - sin pixeles sueltos: uno distinto de sus cuatro vecinos, iguales entre si
 *   y de la misma pieza, toma su color.
 *
 * Con `normales`, devuelve tambien el mapa de normales (`img.normal`) para que
 * las luces de Godot modelen la figura: de cada pixel se mide cuanto hay hasta
 * el borde de su pieza en las cuatro direcciones, y eso dice hacia donde mira.
 */
export function rasterizar(lista, ANCHO, ALTO, paleta = PALETA, { normales = false } = {}) {
  const etiqueta = Array.from({ length: ALTO }, () => new Array(ANCHO).fill(-1));
  const materiales = [];
  lista.forEach(([forma, material], i) => {
    materiales.push(material);
    for (let y = 0; y < ALTO; y += 1)
      for (let x = 0; x < ANCHO; x += 1) if (forma(x, y)) etiqueta[y][x] = i;
  });
  const en = (x, y) => (x >= 0 && x < ANCHO && y >= 0 && y < ALTO ? etiqueta[y][x] : -1);
  const img = Array.from({ length: ALTO }, () => new Array(ANCHO).fill([0, 0, 0, 0]));
  const LADOS = [
    [0, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
  ];
  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const e = etiqueta[y][x];
      if (e < 0) {
        // El contorno: del color de la pieza que toca, oscurecido. Si la pieza
        // esta encima (este pixel es su borde de abajo), casi negro.
        const encima = en(x, y - 1);
        const toca = LADOS.map(([dx, dy]) => en(x + dx, y + dy)).find((v) => v >= 0);
        if (toca === undefined) continue;
        img[y][x] = encima >= 0 ? paleta.contorno : oscurecer(paleta[materiales[toca]][2], 0.5);
        continue;
      }
      const [base, luz, sombra] = paleta[materiales[e]];
      // Luz arriba a la izquierda, por pieza y no por silueta: asi se leen los
      // pliegues y los brazos sobre el cuerpo.
      let color = base;
      if (en(x, y - 1) !== e || en(x - 1, y) === -1) color = luz;
      if (en(x, y + 1) !== e || en(x + 1, y) !== e) color = sombra;
      const fino = ['oro', 'acero'].includes(materiales[e]);
      if (fino && en(x, y - 1) === e && en(x + 1, y) === e) color = base;
      img[y][x] = color;
    }
  }
  // Sin pixeles sueltos.
  const igual = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  for (let y = 1; y < ALTO - 1; y += 1) {
    for (let x = 1; x < ANCHO - 1; x += 1) {
      const e = etiqueta[y][x];
      if (e < 0) continue;
      const vecinos = LADOS.map(([dx, dy]) => [img[y + dy][x + dx], etiqueta[y + dy][x + dx]]);
      const [c0] = vecinos[0];
      if (vecinos.every(([c, v]) => v === e && igual(c, c0)) && !igual(img[y][x], c0))
        img[y][x] = c0;
    }
  }
  if (normales) {
    const MAX = 6;
    const hasta = (x, y, dx, dy, e) => {
      for (let k = 1; k <= MAX; k += 1) if (en(x + dx * k, y + dy * k) !== e) return k;
      return MAX + 1;
    };
    img.normal = Array.from({ length: ALTO }, (_, y) =>
      Array.from({ length: ANCHO }, (_, x) => {
        const e = etiqueta[y][x];
        if (e < 0) return [128, 128, 255, 0];
        const izq = hasta(x, y, -1, 0, e);
        const der = hasta(x, y, 1, 0, e);
        const arr = hasta(x, y, 0, -1, e);
        const aba = hasta(x, y, 0, 1, e);
        // Cerca del borde de la derecha, la superficie mira a la derecha.
        const nx = ((izq - der) / (izq + der)) * 0.8;
        const ny = ((arr - aba) / (arr + aba)) * 0.8;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        // En Godot el verde de la normal apunta hacia arriba.
        return [
          Math.round((nx * 0.5 + 0.5) * 255),
          Math.round((-ny * 0.5 + 0.5) * 255),
          Math.round((nz * 0.5 + 0.5) * 255),
          255,
        ];
      }),
    );
  }
  return img;
}

// -- Las animaciones ----------------------------------------------------------
//
// Cada una es una lista de poses. Lo que no se dice queda como en reposo. Los
// angulos de brazo son [hombro, codo] medidos desde la vertical hacia abajo, en
// radianes; positivo es hacia delante. `hoja` es el giro del bisturi sobre el
// antebrazo.

const C = CADERA;
const baja = (dy, dx = 0) => [C[0] + dx, C[1] + dy];

const reposo = [0, 0, 1, 1].map((b) => ({
  lean: 0.05,
  bob: b,
  cerca: [0.25 + 0.04 * b, 0.55],
  lejos: [0.15, 0.45],
}));

// Ocho fotogramas: contacto, bajada, paso, subida, y lo mismo con la otra
// pierna. Los brazos van al contrario que las piernas y el habito se queda
// atras.
const correr = Array.from({ length: 8 }, (_, i) => {
  const fase = (i / 8) * 2 * Math.PI;
  const s = Math.sin(fase);
  const c = Math.cos(fase);
  return {
    cadera: baja(Math.abs(s) > 0.7 ? 1 : 0),
    lean: 0.16,
    zancadaCerca: Math.round(5 * s),
    zancadaLejos: Math.round(-5 * s),
    alzaCerca: c > 0.3 ? 2 : 0,
    alzaLejos: c < -0.3 ? 2 : 0,
    cerca: [0.35 - 0.5 * s, 0.7],
    lejos: [0.15 + 0.5 * s, 0.6],
    sway: -1.5,
  };
});

const salto = [
  {
    cadera: baja(-2),
    lean: 0.05,
    alzaCerca: 4,
    alzaLejos: 2,
    zancadaCerca: 2,
    cerca: [0.9, 0.9],
    lejos: [0.7, 0.6],
  },
];
const caida = [
  {
    lean: 0,
    alzaCerca: 1,
    zancadaCerca: 1,
    zancadaLejos: 2,
    cerca: [1.2, 0.5],
    lejos: [1.0, 0.4],
    vuelo: 1.5,
  },
  {
    lean: -0.04,
    alzaCerca: 1,
    zancadaCerca: 1,
    zancadaLejos: 2,
    cerca: [1.4, 0.4],
    lejos: [1.2, 0.3],
    vuelo: 2.5,
  },
];
const aterrizaje = [
  {
    cadera: baja(3),
    lean: 0.12,
    bob: 1,
    zancadaCerca: -3,
    zancadaLejos: 3,
    cerca: [0.6, 0.4],
    lejos: [0.5, 0.3],
    vuelo: 1,
  },
];
const dash = [
  {
    cadera: baja(2, 1),
    lean: 0.48,
    zancadaCerca: 5,
    zancadaLejos: -5,
    cerca: [-0.9, 0.3],
    lejos: [-0.7, 0.2],
    hoja: 0.1,
    sway: -4,
  },
];
// Colgado del bisturi clavado en la pared (la pared, a la derecha, a ~5 px
// de la cadera): de cara a ella, con la hoja metida en horizontal y la otra
// mano en el mango. Y girado: de espaldas a la pared, colgado del brazo de
// atras, listo para saltar hacia fuera.
const agarre = [
  {
    cadera: baja(0, -1),
    lean: 0.18,
    cabeceo: -0.1,
    alzaCerca: 2,
    alzaLejos: 1,
    zancadaCerca: 3,
    zancadaLejos: 4,
    cerca: [2.5, 0.3],
    hoja: -1.25,
    lejos: [2.3, 0.5],
  },
];
const agarreGirado = [
  {
    cadera: baja(0, 2),
    lean: -0.22,
    cabeceo: 0.1,
    alzaCerca: 2,
    alzaLejos: 3,
    zancadaCerca: -4,
    zancadaLejos: 0,
    cerca: [-2.45, -0.25],
    hoja: 1.15,
    lejos: [0.7, 0.7],
    sway: 1,
  },
];
const herido = [
  {
    cadera: baja(1, -1),
    lean: -0.32,
    cabeceo: -0.2,
    zancadaCerca: -3,
    zancadaLejos: 1,
    cerca: [-1.1, 0.3],
    lejos: [-0.8, 0.2],
    sway: 2,
  },
];
const rezar = [
  {
    cadera: baja(7),
    lean: 0.2,
    cabeceo: 0.25,
    cerca: [1.1, 1.7],
    lejos: [1.0, 1.6],
    frasco: false,
    hoja: -0.2,
    vuelo: 2,
  },
];

// El parry: se recoge y cruza el bisturi en diagonal delante del pecho, sin
// taparse la cara.
const guardia = [
  {
    cadera: baja(1),
    lean: -0.06,
    cerca: [1.2, 1.3],
    hoja: 0.65,
    lejos: [0.5, 0.6],
    zancadaCerca: -2,
    zancadaLejos: 3,
  },
  {
    cadera: baja(2),
    lean: -0.1,
    cerca: [1.25, 1.35],
    hoja: 0.6,
    lejos: [0.55, 0.6],
    zancadaCerca: -2,
    zancadaLejos: 3,
  },
];

// El golpe: anticipacion sostenida, smear, impacto y recuperacion.
const golpe = [
  {
    cadera: baja(1),
    lean: -0.12,
    bob: 1,
    cerca: [-2.2, -0.7],
    hoja: -0.3,
    lejos: [0.5, 0.6],
    zancadaCerca: -2,
    zancadaLejos: 2,
  },
  {
    cadera: baja(1, -1),
    lean: -0.16,
    bob: 1,
    cerca: [-2.45, -0.8],
    hoja: -0.4,
    lejos: [0.6, 0.6],
    zancadaCerca: -2,
    zancadaLejos: 2,
  },
  {
    lean: 0.06,
    cerca: [0.7, 0.2],
    hoja: 0.2,
    lejos: [0.1, 0.3],
    zancadaCerca: 0,
    zancadaLejos: 1,
    smear: [-2.5, 1.35, 11, 20],
  },
  {
    cadera: baja(0, 2),
    lean: 0.2,
    cerca: [1.5, 0.05],
    hoja: 0.05,
    lejos: [-0.4, 0.3],
    zancadaCerca: 3,
    zancadaLejos: -1,
    sway: -1.5,
  },
  {
    cadera: baja(0, 1),
    lean: 0.12,
    cerca: [1.15, 0.3],
    hoja: 0.25,
    lejos: [-0.1, 0.4],
    zancadaCerca: 2,
    zancadaLejos: 0,
    sway: -0.5,
  },
  {
    lean: 0.08,
    cerca: [0.6, 0.5],
    hoja: 0.35,
    lejos: [0.1, 0.45],
    zancadaCerca: 0,
    zancadaLejos: 2,
  },
];

// El cargado: lo mismo con mas recorrido, un arco mas grande y mas peso.
const cargado = [
  {
    cadera: baja(2, -1),
    lean: -0.2,
    bob: 1,
    cerca: [-2.6, -0.9],
    hoja: -0.5,
    lejos: [0.7, 0.6],
    zancadaCerca: -3,
    zancadaLejos: 3,
  },
  {
    cadera: baja(3, -2),
    lean: -0.26,
    bob: 1,
    cerca: [-2.8, -0.9],
    hoja: -0.5,
    lejos: [0.8, 0.6],
    zancadaCerca: -3,
    zancadaLejos: 3,
  },
  {
    cadera: baja(1),
    lean: 0.1,
    cerca: [0.9, 0.2],
    hoja: 0.2,
    lejos: [0, 0.3],
    zancadaCerca: 1,
    zancadaLejos: 1,
    smear: [-2.8, 1.45, 12, 24],
  },
  {
    cadera: baja(2, 3),
    lean: 0.3,
    cerca: [1.55, 0],
    hoja: 0,
    lejos: [-0.6, 0.3],
    zancadaCerca: 4,
    zancadaLejos: -2,
    sway: -2.5,
  },
  {
    cadera: baja(1, 2),
    lean: 0.18,
    cerca: [1.2, 0.3],
    hoja: 0.25,
    lejos: [-0.2, 0.4],
    zancadaCerca: 3,
    zancadaLejos: -1,
    sway: -1,
  },
  {
    lean: 0.1,
    cerca: [0.6, 0.5],
    hoja: 0.35,
    lejos: [0.1, 0.45],
    zancadaCerca: 0,
    zancadaLejos: 2,
  },
];

// Hacia arriba: de abajo delante a por encima de la cabeza.
const arriba = [
  { cadera: baja(2), lean: 0.05, bob: 1, cerca: [-0.5, -0.2], hoja: -0.4, lejos: [0.4, 0.5] },
  { lean: -0.04, cerca: [2.2, 0.2], hoja: 0.1, lejos: [0.3, 0.4], smear: [1.0, 3.3, 10, 19] },
  { cadera: baja(-1), lean: -0.08, cerca: [2.55, 0.15], hoja: 0.25, lejos: [0.2, 0.4] },
  { lean: 0, cerca: [2.0, 0.4], hoja: 0.2, lejos: [0.2, 0.45] },
];

// Hacia abajo, en el aire: las piernas recogidas y el bisturi de punta.
const abajo = [
  {
    cadera: baja(-1),
    lean: 0.05,
    alzaCerca: 4,
    alzaLejos: 3,
    cerca: [2.4, 0.3],
    hoja: 0.2,
    lejos: [0.6, 0.5],
  },
  {
    lean: 0.08,
    alzaCerca: 4,
    alzaLejos: 3,
    cerca: [0.3, 0],
    hoja: 0,
    lejos: [0.6, 0.5],
    smear: [1.6, -0.7, 9, 18, false],
  },
  { lean: 0.06, alzaCerca: 4, alzaLejos: 3, cerca: [0.05, 0], hoja: 0, lejos: [0.6, 0.5] },
];

// El contragolpe: una estocada que se adelanta, con estela.
const contragolpe = [
  {
    cadera: baja(2, -1),
    lean: -0.05,
    cerca: [0.4, 1.2],
    hoja: 0.2,
    lejos: [0.6, 0.6],
    zancadaCerca: -2,
    zancadaLejos: 3,
  },
  {
    cadera: baja(3, 3),
    lean: 0.38,
    cerca: [1.57, 0],
    hoja: 0,
    lejos: [-0.6, 0.2],
    zancadaCerca: 6,
    zancadaLejos: -3,
    sway: -3,
    estela: 10,
  },
  {
    cadera: baja(3, 3),
    lean: 0.36,
    cerca: [1.57, 0],
    hoja: 0,
    lejos: [-0.6, 0.2],
    zancadaCerca: 6,
    zancadaLejos: -3,
    sway: -2,
  },
  {
    cadera: baja(1, 1),
    lean: 0.15,
    cerca: [1.1, 0.4],
    hoja: 0.3,
    lejos: [0, 0.4],
    zancadaCerca: 2,
    zancadaLejos: 0,
    sway: -0.5,
  },
];

// La Pocion: alza el frasco, bebe con la cabeza atras y lo baja.
const bebe = [
  { lean: 0, cerca: [0.9, 1.2], frasco: true, hoja: 0.3, lejos: [0.2, 0.4] },
  { lean: -0.1, cabeceo: -0.3, cerca: [1.2, 2.1], frasco: true, hoja: 0.9, lejos: [0.2, 0.4] },
  { lean: -0.06, cabeceo: -0.15, cerca: [1.0, 1.6], frasco: true, hoja: 0.5, lejos: [0.2, 0.4] },
];

// La ejecucion: alza el bisturi sobre la cabeza, lo sostiene y lo baja entero.
const alza = [
  {
    cadera: baja(-1),
    lean: -0.1,
    cerca: [-2.9, -0.2],
    hoja: -0.1,
    lejos: [0.9, 0.9],
    zancadaCerca: -1,
    zancadaLejos: 3,
  },
  {
    cadera: baja(-2),
    lean: -0.14,
    cerca: [-3.05, -0.15],
    hoja: -0.1,
    lejos: [1.0, 0.9],
    zancadaCerca: -1,
    zancadaLejos: 3,
  },
];
const tajo = [
  {
    cadera: baja(2, 1),
    lean: 0.2,
    cerca: [0.9, 0.1],
    hoja: 0.1,
    lejos: [0.3, 0.3],
    zancadaCerca: 3,
    zancadaLejos: -1,
    smear: [3.2, 0.7, 10, 22],
  },
  {
    cadera: baja(4, 2),
    lean: 0.34,
    cabeceo: 0.15,
    cerca: [0.35, 0.05],
    hoja: 0.05,
    lejos: [0.1, 0.3],
    zancadaCerca: 4,
    zancadaLejos: -2,
    sway: -1.5,
  },
  {
    cadera: baja(4, 2),
    lean: 0.32,
    cabeceo: 0.2,
    cerca: [0.3, 0.1],
    hoja: 0.1,
    lejos: [0.1, 0.3],
    zancadaCerca: 4,
    zancadaLejos: -2,
    sway: -1,
  },
];

// Morir: el golpe lo echa atras, se le doblan las rodillas y cae postrado,
// de rodillas y con la frente hacia el suelo, como quien reza.
const muerte = [
  {
    cadera: baja(1, -1),
    lean: -0.38,
    cabeceo: -0.25,
    zancadaCerca: -3,
    zancadaLejos: 2,
    cerca: [-1.3, 0.3],
    lejos: [-1, 0.2],
    sway: 2,
  },
  {
    cadera: baja(5),
    lean: 0.1,
    cabeceo: 0.25,
    zancadaCerca: 1,
    zancadaLejos: -1,
    cerca: [0.3, 0.2],
    lejos: [0.2, 0.2],
    vuelo: 1.5,
  },
  {
    cadera: baja(8),
    lean: 0.45,
    cabeceo: 0.45,
    cerca: [0.5, 0.1],
    lejos: [0.4, 0.1],
    hoja: 1.2,
    vuelo: 2.5,
  },
  {
    cadera: baja(10),
    lean: 0.75,
    cabeceo: 0.55,
    cerca: [0.9, 0.1],
    lejos: [0.8, 0.1],
    hoja: 1.5,
    vuelo: 3,
  },
];

export const ANIMACIONES = {
  reposo,
  correr,
  salto,
  caida,
  aterrizaje,
  dash,
  agarre,
  'agarre-girado': agarreGirado,
  herido,
  rezar,
  guardia,
  golpe,
  cargado,
  arriba,
  abajo,
  contragolpe,
  bebe,
  alza,
  tajo,
  muerte,
};

// -- Las reliquias ------------------------------------------------------------
//
// Restos que los Primigenios dejan al compactarse: organos sueltos que aun
// funcionan. Cada una da una habilidad (sigma/scripts/reliquia.gd). 20x20.

const RELIQUIAS = {
  // Un pulmon seco que aun respira una vez: el segundo salto.
  pulmon: [
    [capsula([10, 3], [10, 9], 1.2), 'hueso'],
    [elipse([6.5, 11], 4, 6), 'carne'],
    [elipse([13.5, 11], 4, 6), 'carne'],
    [capsula([10, 8], [7, 11], 0.8), 'hueso'],
    [capsula([10, 8], [13, 11], 0.8), 'hueso'],
  ],
  // Un tendon que todavia se contrae: el dash.
  tendon: [
    [capsula([3, 15], [8, 9], 1.6, 2.2), 'tendon'],
    [capsula([8, 9], [13, 11], 2.2), 'tendon'],
    [capsula([13, 11], [17, 4], 2.2, 1.6), 'tendon'],
    [elipse([3, 16], 2.2, 2.2), 'hueso'],
    [elipse([17, 3.5], 2.2, 2.2), 'hueso'],
  ],
};

// -- PNG ----------------------------------------------------------------------

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(datos) {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

export function png(pixeles) {
  const alto = pixeles.length;
  const ancho = pixeles[0].length;
  const crudo = Buffer.alloc(alto * (1 + ancho * 4));
  pixeles.forEach((fila, y) => {
    const inicio = y * (1 + ancho * 4);
    fila.forEach((color, x) => crudo.set(color, inicio + 1 + x * 4));
  });
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0);
  cabecera.writeUInt32BE(alto, 4);
  cabecera.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

/** Todas las animaciones en filas, ampliadas, sobre un fondo como el del Atrio. */
export function hoja(cuadros, k = 4) {
  const fondo = [42, 32, 48, 255];
  const suelo = [90, 70, 80, 255];
  const filas = Object.values(cuadros);
  const columnas = Math.max(...filas.map((f) => f.length));
  const ancho = columnas * (ANCHO + 2) * k;
  const out = [];
  for (const fila of filas) {
    for (let y = 0; y < ALTO; y += 1) {
      const linea = [];
      for (let i = 0; i < columnas; i += 1) {
        for (let x = 0; x < ANCHO + 2; x += 1) {
          const p = fila[i]?.[y]?.[x];
          const color = p && p[3] ? p : y === SUELO + 1 && fila[i] ? suelo : fondo;
          for (let r = 0; r < k; r += 1) linea.push(color);
        }
      }
      for (let r = 0; r < k; r += 1) out.push(linea);
    }
  }
  return out.length ? out : [new Array(ancho).fill(fondo)];
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const cuadros = {};
  const recuento = {};
  for (const [nombre, poses] of Object.entries(ANIMACIONES)) {
    cuadros[nombre] = poses.map((pose) => dibujar(pose, { normales: true }));
    recuento[nombre] = poses.length;
    cuadros[nombre].forEach((img, i) => {
      writeFileSync(join(destino, `${nombre}-${i}.png`), png(img));
      writeFileSync(join(destino, `${nombre}-${i}_n.png`), png(img.normal));
    });
  }
  const lineas = Object.entries(recuento).map(([n, c]) => `\t"${n}": ${c},`);
  writeFileSync(
    join(destino, 'animaciones.gd'),
    [
      '## Generado por scripts/cirujano-sigma.mjs: no se edita a mano.',
      '## Cuantos fotogramas tiene cada animacion del Cirujano.',
      'extends RefCounted',
      '',
      'const RECUENTO := {',
      ...lineas,
      '}',
      '',
    ].join('\n'),
  );
  writeFileSync(join(destino, 'hoja.png'), png(hoja(cuadros)));
  const reliquias = join(raiz, 'sigma/arte/reliquias');
  mkdirSync(reliquias, { recursive: true });
  for (const [nombre, lista] of Object.entries(RELIQUIAS)) {
    writeFileSync(join(reliquias, `${nombre}.png`), png(rasterizar(lista, 20, 20)));
  }
  const total = Object.values(recuento).reduce((a, b) => a + b, 0);
  console.log(
    `${total} fotogramas en ${Object.keys(recuento).length} animaciones -> sigma/arte/cirujano/`,
  );
}
