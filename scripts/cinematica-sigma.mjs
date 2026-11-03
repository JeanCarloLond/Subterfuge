/**
 * Las ilustraciones de las cinematicas de Subterfuge Sigma: primeros planos a
 * pantalla completa (laminas de 704x396, un poco mas que la pantalla), con mas detalle que el juego, como las escenas
 * de Blasphemous. Provisionales hasta que lleguen las de Mariana: sus imagenes,
 * con el mismo nombre, las sustituyen sin tocar codigo.
 *
 * A este tamano no vale el sombreado del titere (un pixel de luz y otro de
 * sombra en el borde): parece un recortable. Aqui cada pieza tiene VOLUMEN:
 * cinco tonos segun lo lejos que esta cada pixel del borde que mira a la luz,
 * con trama de Bayer entre tono y tono. La luz es la de una vela, a la derecha.
 *
 * - manos.png   las manos con el bisturi sobre la sabana, en la manga blanca del
 *               diseño de Mariana (#245).
 *
 * - mascara.png la mascara ciega de las Manos, sobre el rostro (#246): lisa, sin
 *               ojos, con las costuras. En la intro se la quita al «Hoy miro».
 *
 * El rostro ya no sale de aqui (#245): `rostro.png` es el retrato de Mariana
 * (`arte/retratos/cirujano.png`) ampliado x4 sobre la lamina, sin la sangre ni
 * el rojo del ojo, que en la intro aun no tiene. Volver a correr esto no lo toca.
 *
 * Sale a `sigma/arte/cinematica/`. Uso:  npm run sigma:cinematica
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capsula, elipse, png, poligono } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/cinematica');

/** Se dibuja a media resolucion y se amplia x2: cada pixel del dibujo pesa. */
const ESCALA = 2;
/**
 * La lamina es algo mayor que la pantalla (704x396) para poder desplazarla
 * despacio sin que se vea el borde: en pixel art se panea, no se hace zoom (un
 * zoom que no sea entero deforma los pixeles). Las formas se dibujan en
 * coordenadas de pantalla y se centran con este margen.
 */
const MARGEN = [32, 18];
const ANCHO = (640 + MARGEN[0] * 2) / ESCALA;
const ALTO = (360 + MARGEN[1] * 2) / ESCALA;
const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
/** Cinco tonos: hondo, sombra, base, luz, brillo. */
const tonos = (...c) => c.map(hx);

const MATERIALES = {
  fondo: tonos('#07050600', '#0c0809', '#120c0e', '#1c1214', '#2a1a1a'),
  capucha: tonos('#0a0607', '#140c0d', '#1e1415', '#2c1e1e', '#3e2a28'),
  mitra: tonos('#2c2418', '#4a3e2c', '#6e5e44', '#9a866a', '#c8b494'),
  oro: tonos('#3e2408', '#6e4614', '#a8702a', '#d8a448', '#f6d68a'),
  piel: tonos('#3e2a20', '#6a4a3a', '#9a7460', '#c8a084', '#e8c8a8'),
  venda: tonos('#5a4e40', '#8a7c66', '#b8a88c', '#dccdb0', '#f4ead4'),
  sangre: tonos('#2a0806', '#4e100c', '#7a1a14', '#a82a20', '#d04838'),
  habito: tonos('#4a4640', '#7a746c', '#b0aaa2', '#dcd8d0', '#f6f4ee'),
  escapulario: tonos('#2a0a08', '#4a1410', '#6e1e18', '#9a2e24', '#c04434'),
  // Las manos, desnudas: la piel del retrato de Mariana.
  cuero: tonos('#2a1810', '#43291c', '#6a4430', '#8a5c40', '#a87656'),
  acero: tonos('#2a3034', '#4e585e', '#7f8a92', '#bcc6cc', '#f2f6f8'),
  // La mascara ciega de las Manos (#246): hueso pulido.
  hueso: tonos('#4a443a', '#7a7262', '#aea490', '#d8cfba', '#f2ead8'),
  grieta: tonos('#140e0c', '#1e1612', '#2a201a', '#3a2c24', '#4a3a30'),
  sabana: tonos('#4a4438', '#746c5c', '#a49a84', '#cec4ac', '#ece4d0'),
  contorno: tonos('#060404', '#060404', '#060404', '#060404', '#060404'),
};

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Pinta las piezas con volumen. `luz` es hacia donde esta la luz (unitario):
 * de cada pixel se mide cuanto hay hasta el borde de su pieza hacia la luz y
 * hacia la sombra; la proporcion decide el tono.
 */
function pintar(piezas, luz, fondoDe) {
  const etiqueta = new Int16Array(ANCHO * ALTO).fill(-1);
  // Las formas estan en coordenadas de pantalla (640x360): se miran en el
  // centro de cada pixel del dibujo.
  piezas.forEach(([forma, , caja], i) => {
    const [x0, y0, x1, y1] = caja
      ? caja.map((v, k) => (v + MARGEN[k % 2]) / ESCALA)
      : [0, 0, ANCHO, ALTO];
    for (let y = Math.max(0, y0 | 0); y < Math.min(ALTO, y1 + 1); y += 1)
      for (let x = Math.max(0, x0 | 0); x < Math.min(ANCHO, x1 + 1); x += 1)
        if (forma(x * ESCALA + 0.5 - MARGEN[0], y * ESCALA + 0.5 - MARGEN[1]))
          etiqueta[y * ANCHO + x] = i;
  });
  const en = (x, y) =>
    x >= 0 && x < ANCHO && y >= 0 && y < ALTO ? etiqueta[(y | 0) * ANCHO + (x | 0)] : -1;
  const img = Array.from({ length: ALTO }, (_, y) =>
    Array.from({ length: ANCHO }, (_, x) =>
      fondoDe(x * ESCALA - MARGEN[0], y * ESCALA - MARGEN[1]),
    ),
  );
  const MAX = 28;
  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const e = etiqueta[y * ANCHO + x];
      if (e < 0) continue;
      let hastaLuz = MAX;
      let hastaSombra = MAX;
      for (let k = 1; k < MAX; k += 1) {
        if (hastaLuz === MAX && en(x + luz[0] * k, y + luz[1] * k) !== e) hastaLuz = k;
        if (hastaSombra === MAX && en(x - luz[0] * k, y - luz[1] * k) !== e) hastaSombra = k;
        if (hastaLuz < MAX && hastaSombra < MAX) break;
      }
      // 1 = pegado al borde iluminado; 0 = al de sombra.
      let t = hastaSombra / (hastaLuz + hastaSombra);
      // Lo que tiene otra pieza encima por el lado de la luz, mas oscuro: se
      // lee la profundidad entre la venda y la cara, el brazo y la sabana.
      if (hastaLuz < 4 && en(x + luz[0] * hastaLuz, y + luz[1] * hastaLuz) > e) t *= 0.55;
      const paleta = MATERIALES[piezas[e][1]];
      const nivel = t * 4 + ((BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5) * 0.9;
      img[y][x] = paleta[Math.max(0, Math.min(4, Math.round(nivel)))];
    }
  }
  // Contorno de 1 px donde una pieza da al fondo, y una linea fina donde una
  // pieza de delante tapa a otra: el trazo del dibujo.
  const salida = img.map((f) => [...f]);
  for (let y = 1; y < ALTO - 1; y += 1) {
    for (let x = 1; x < ANCHO - 1; x += 1) {
      const e = etiqueta[y * ANCHO + x];
      const vecinos = [en(x + 1, y), en(x - 1, y), en(x, y + 1), en(x, y - 1)];
      if (e < 0 && vecinos.some((v) => v >= 0)) salida[y][x] = MATERIALES.contorno[0];
      else if (
        e >= 0 &&
        vecinos.some((v) => v > e + 0 && v >= 0 && piezas[v][1] !== piezas[e][1] && v - e > 0)
      ) {
        // nada: el de delante ya pone su borde
      } else if (e >= 0 && vecinos.some((v) => v >= 0 && v < e && piezas[v][1] !== piezas[e][1])) {
        salida[y][x] = MATERIALES[piezas[e][1]][0];
      }
    }
  }
  // Ampliado x2 con vecino mas cercano.
  return Array.from({ length: ALTO * ESCALA }, (_, y) =>
    Array.from({ length: ANCHO * ESCALA }, (_, x) => salida[(y / ESCALA) | 0][(x / ESCALA) | 0]),
  );
}

/** Fondo oscuro con el resplandor de la vela (a la derecha), tramado. */
function fondoVela(vela) {
  const f = MATERIALES.fondo;
  return (x, y) => {
    const d = Math.hypot(x - vela[0], (y - vela[1]) * 1.3) / 420;
    const bx = (((x + MARGEN[0]) / ESCALA) | 0) & 3;
    const by = (((y + MARGEN[1]) / ESCALA) | 0) & 3;
    const nivel = Math.max(0, 3.2 - d * 4) + ((BAYER[by % 4][bx % 4] + 0.5) / 16 - 0.5);
    return f[Math.max(1, Math.min(4, Math.round(nivel)))];
  };
}

const sobre = (cx, cy, rx, ry) => [cx - rx - 2, cy - ry - 2, cx + rx + 3, cy + ry + 3];

// -- Las manos ----------------------------------------------------------------

/**
 * Un dedo en dos falanges, de la base `a` al nudillo `b` y de ahi a la punta
 * `c`, que se estrecha (#245: con una capsula recta por dedo, parecian
 * salchichas).
 */
const dedo = (a, b, c, r) => [
  [capsula(a, b, r, r * 0.88), 'cuero'],
  [capsula(b, c, r * 0.88, r * 0.7), 'cuero'],
];

function manos() {
  const piezas = [
    // La sabana, que cubre un cuerpo: una loma larga con pliegues.
    [
      poligono([
        [0, 360],
        [0, 250],
        [120, 228],
        [260, 210],
        [380, 222],
        [520, 206],
        [640, 230],
        [640, 360],
      ]),
      'sabana',
    ],
    ...[
      [80, 250, 220, 238],
      [200, 268, 420, 250],
      [330, 300, 560, 262],
      [60, 320, 300, 300],
    ].map(([x0, y0, x1, y1]) => [capsula([x0, y0], [x1, y1], 3), 'sabana']),
    // La mano de la izquierda, plana sobre la sabana.
    [
      poligono([
        [-10, 170],
        [70, 200],
        [120, 240],
        [60, 260],
        [-10, 230],
      ]),
      'habito',
    ],
    [elipse([142, 238], 26, 14), 'cuero', sobre(142, 238, 26, 14)],
    // Los cuatro dedos, planos y algo abiertos, y el pulgar por encima.
    ...dedo([164, 228], [180, 226], [192, 228], 5.6),
    ...dedo([167, 236], [185, 236], [198, 239], 5.8),
    ...dedo([165, 244], [182, 246], [194, 250], 5.4),
    ...dedo([159, 250], [172, 254], [181, 257], 4.8),
    ...dedo([142, 226], [154, 217], [164, 214], 5.8),
    // El brazo que baja desde arriba y la mano que sostiene el bisturi.
    [
      poligono([
        [300, -10],
        [420, -10],
        [440, 110],
        [380, 140],
        [330, 100],
      ]),
      'habito',
    ],
    // El dorso, y el pulgar que aprieta el mango desde abajo.
    [
      poligono([
        [355, 112],
        [445, 100],
        [462, 140],
        [440, 166],
        [382, 174],
        [352, 150],
      ]),
      'cuero',
    ],
    ...dedo([370, 152], [404, 176], [432, 180], 7),
    // El bisturi: mango de oro y la hoja, con la punta sobre la sabana.
    [capsula([420, 130], [470, 200], 4.5), 'oro'],
    [
      poligono([
        [466, 196],
        [478, 192],
        [520, 252],
        [512, 256],
      ]),
      'acero',
    ],
    [capsula([516, 256], [518, 262], 2.2, 1), 'sangre'],
    // Los dedos sobre el mango: el indice a lo largo, encima; los otros tres,
    // doblados por debajo.
    ...dedo([408, 168], [414, 183], [408, 190], 5.2),
    ...dedo([424, 165], [432, 183], [424, 191], 6),
    ...dedo([440, 158], [452, 179], [444, 189], 6.4),
    ...dedo([450, 128], [466, 150], [473, 166], 6),
  ];
  return pintar(piezas, [0.95, -0.3], fondoVela([620, 80]));
}

/**
 * La mascara ciega, a la medida del rostro de `rostro.png` (el retrato de
 * Mariana a x4): lisa, sin ojos, con dos costuras donde estarian y otra en la
 * boca, como la del Prior. Va sobre transparente: la intro la pone encima del
 * rostro y la retira.
 */
function mascara() {
  const piezas = [
    // Ancha en la frente, estrecha en la barbilla: la cara, no un huevo.
    [
      poligono([
        [258, 172],
        [388, 172],
        [398, 222],
        [384, 268],
        [356, 300],
        [324, 310],
        [292, 300],
        [264, 268],
        [250, 222],
      ]),
      'hueso',
    ],
    // Los parpados, cerrados para siempre, y la boca cosida.
    [capsula([276, 220], [306, 226], 2.2), 'grieta'],
    [capsula([338, 226], [368, 220], 2.2), 'grieta'],
    [capsula([306, 280], [340, 280], 1.6), 'grieta'],
    ...[312, 323, 334].map((x) => [capsula([x, 275], [x, 285], 1.1), 'grieta']),
  ];
  return pintar(piezas, [0.95, -0.3], () => [0, 0, 0, 0]);
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, 'manos.png'), png(manos()));
  writeFileSync(join(destino, 'mascara.png'), png(mascara()));
  console.log('las manos y la máscara -> sigma/arte/cinematica/');
}
