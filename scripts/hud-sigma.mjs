/**
 * La interfaz de Subterfuge Sigma, ornamentada como la de Blasphemous: un
 * medallon con el retrato del Cirujano, un marco de oro viejo para las barras
 * de vida y de Fervor, los frascos, y las cajas de los dialogos y de los avisos.
 *
 * El rostro del medallon es el retrato de Mariana (sigma/arte/retratos), reducido
 * (#253), en dos versiones: antes del laboratorio, sin el ojo rojo ni la sangre,
 * y con el ojo de los Mil (#243). Cuando cambie su retrato, cambia el medallon.
 *
 * Sale a `sigma/arte/hud/`. Las barras son pares lleno/vacio para un
 * TextureProgressBar de Godot. Uso:  npm run sigma:hud
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { capsula, elipse, png, rasterizar } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/hud');

const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];
const trio = (base, luz, sombra) => [hx(base), hx(luz), hx(sombra)];
const NADA = [0, 0, 0, 0];

const PALETA = {
  contorno: hx('#0e0808'),
  oro: trio('#b8862a', '#e8c060', '#6e4a14'),
  oxido: trio('#7a3a1e', '#a0582e', '#4a200e'),
  fondo: trio('#1c1214', '#2a1c1e', '#100a0b'),
  sangre: trio('#a8281f', '#d8483a', '#5e1210'),
  fervor: trio('#c88a2a', '#f0c050', '#7a4e10'),
  gema: trio('#c8281c', '#f05030', '#7a1410'),
  vidrio: trio('#6a8288', '#a8c2c6', '#3e5054'),
  vidrioApagado: trio('#3c4a4e', '#5a6c70', '#242e30'),
  corcho: trio('#8a6a44', '#b08e62', '#54402a'),
  brillo: trio('#f4e8e0', '#f4e8e0', '#f4e8e0'),
};

/** Lee un PNG RGBA de 8 bits, sin entrelazar: los retratos de Mariana. */
function leerPng(ruta) {
  const datos = readFileSync(ruta);
  let ancho = 0;
  let alto = 0;
  const trozos = [];
  for (let i = 8; i < datos.length;) {
    const largo = datos.readUInt32BE(i);
    const tipo = datos.toString('latin1', i + 4, i + 8);
    if (tipo === 'IHDR') {
      ancho = datos.readUInt32BE(i + 8);
      alto = datos.readUInt32BE(i + 12);
      if (datos[i + 16] !== 8 || datos[i + 17] !== 6)
        throw new Error(`${ruta}: no es RGBA de 8 bits`);
    }
    if (tipo === 'IDAT') trozos.push(datos.subarray(i + 8, i + 8 + largo));
    i += 12 + largo;
  }
  const crudo = inflateSync(Buffer.concat(trozos));
  const paso = ancho * 4;
  const filas = [];
  for (let y = 0; y < alto; y += 1) {
    const filtro = crudo[y * (paso + 1)];
    const fila = Buffer.alloc(paso);
    for (let x = 0; x < paso; x += 1) {
      const v = crudo[y * (paso + 1) + 1 + x];
      const a = x >= 4 ? fila[x - 4] : 0;
      const b = y > 0 ? filas[y - 1][x] : 0;
      const c = x >= 4 && y > 0 ? filas[y - 1][x - 4] : 0;
      const pa = Math.abs(b - c);
      const pb = Math.abs(a - c);
      const pc = Math.abs(a + b - 2 * c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      const pred = [0, a, b, (a + b) >> 1, paeth][filtro];
      fila[x] = (v + pred) & 255;
    }
    filas.push(fila);
  }
  return filas.map((f) =>
    Array.from({ length: ancho }, (_, x) => [f[x * 4], f[x * 4 + 1], f[x * 4 + 2], f[x * 4 + 3]]),
  );
}

/** Quita del retrato el ojo rojo y la sangre: lo que tenia antes de ponerselo. */
function sinOjo(retrato) {
  const alto = retrato.length;
  const ancho = retrato[0].length;
  const esSangre = (x, y) => {
    // La gema, arriba, y el rojo del habito, abajo, se quedan.
    if (y < 22 || y > 70) return false;
    const [r, g, b] = retrato[y][x];
    return r > 88 && r > 1.9 * g && r > 1.9 * b;
  };
  const limpio = retrato.map((f) => f.map((c) => [...c]));
  const pendientes = new Set();
  for (let y = 0; y < alto; y += 1)
    for (let x = 0; x < ancho; x += 1) if (esSangre(x, y)) pendientes.add(`${x},${y}`);
  // Se rellena desde fuera, con la media de los vecinos ya limpios.
  while (pendientes.size) {
    let avance = false;
    for (const clave of [...pendientes]) {
      const [x, y] = clave.split(',').map(Number);
      const vecinos = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]
        .filter(([dx, dy]) => limpio[y + dy]?.[x + dx] && !pendientes.has(`${x + dx},${y + dy}`))
        .map(([dx, dy]) => limpio[y + dy][x + dx]);
      if (!vecinos.length) continue;
      limpio[y][x] = [0, 1, 2].map((k) =>
        Math.round(vecinos.reduce((s, v) => s + v[k], 0) / vecinos.length),
      );
      limpio[y][x].push(255);
      pendientes.delete(clave);
      avance = true;
    }
    if (!avance) break;
  }
  // El ojo, como el otro: un trazo oscuro donde estaba el rojo.
  for (let x = 36; x <= 41; x += 1) limpio[40][x] = [26, 14, 10, 255];
  return limpio;
}

/** Reduce por areas: el color de cada pixel nuevo es la media de lo que cubre. */
function reducir(img, ancho, alto, desdeX, desdeY, lado) {
  return Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => {
      const suma = [0, 0, 0];
      let n = 0;
      const x0 = desdeX + (x * lado) / ancho;
      const x1 = desdeX + ((x + 1) * lado) / ancho;
      const y0 = desdeY + (y * lado) / alto;
      const y1 = desdeY + ((y + 1) * lado) / alto;
      for (let j = Math.floor(y0); j < Math.ceil(y1); j += 1) {
        for (let i = Math.floor(x0); i < Math.ceil(x1); i += 1) {
          const c = img[Math.min(j, img.length - 1)]?.[Math.min(i, img[0].length - 1)];
          if (!c) continue;
          for (let k = 0; k < 3; k += 1) suma[k] += c[k];
          n += 1;
        }
      }
      // Tonos contados, como en un pixel art: la media sola queda borrosa.
      return [...suma.map((s) => Math.min(255, Math.round(s / Math.max(n, 1) / 14) * 14)), 255];
    }),
  );
}

/**
 * El medallon: un aro de oro con remaches y, dentro, el retrato de Mariana. Los
 * remaches van fuera de los ejes: cuatro en cruz se leian como una cruz.
 */
function medallon(retrato) {
  const lado = 52;
  const c = [26, 26];
  const remaches = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) * Math.PI) / 4;
    return [elipse([26 + Math.cos(a) * 22.5, 26 + Math.sin(a) * 22.5], 1.5, 1.5), 'oxido'];
  });
  const img = rasterizar(
    [
      [elipse(c, 25, 25), 'oro'],
      [elipse(c, 21, 21), 'oxido'],
      [elipse(c, 19.5, 19.5), 'fondo'],
      ...remaches,
    ],
    lado,
    lado,
    PALETA,
  );
  // De 71x79 a la ventana del aro: la cabeza entera, de la mitra al cuello.
  const ventana = 40;
  const rostro = reducir(retrato, ventana, ventana, 0, 0, 71);
  for (let y = 0; y < ventana; y += 1) {
    for (let x = 0; x < ventana; x += 1) {
      const px = x + 6;
      const py = y + 6;
      if (Math.hypot(px + 0.5 - 26, py + 0.5 - 26) <= 19) img[py][px] = rostro[y][x];
    }
  }
  return img;
}

/** Pinta en `img`, sin salirse. */
const poner = (img, x, y, color) => {
  if (img[y]?.[x] !== undefined) img[y][x] = color;
};

/** Un contorno oscuro alrededor de lo pintado: se lee sobre cualquier fondo. */
function contornear(img) {
  const copia = img.map((f) => [...f]);
  img.forEach((fila, y) =>
    fila.forEach((color, x) => {
      if (color[3]) return;
      const toca = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => img[y + dy]?.[x + dx]?.[3]);
      if (toca) copia[y][x] = PALETA.contorno;
    }),
  );
  return copia;
}

/** Un rombo de `r` en `c`, de oro, con su centro. */
function rombo(img, [cx, cy], r, relleno, centro) {
  for (let dy = -r; dy <= r; dy += 1) {
    for (let dx = -r + Math.abs(dy); dx <= r - Math.abs(dy); dx += 1) {
      const borde = Math.abs(dx) + Math.abs(dy) === r;
      const color = borde ? (dx + dy < 0 ? PALETA.oro[1] : PALETA.oro[2]) : relleno;
      poner(img, cx + dx, cy + dy, color);
    }
  }
  if (centro) poner(img, cx, cy, centro);
}

/**
 * El marco de las barras: dos ranuras con filete de oro y remaches que marcan
 * los golpes, un remate con gema al final de la vida y un rombo en el Fervor.
 */
function marco() {
  const ancho = 148;
  const alto = 24;
  const img = Array.from({ length: alto }, () => new Array(ancho).fill(NADA));
  const [oro, oroLuz, oroSombra] = PALETA.oro;
  // Vida: x 2..121, y 2..12. Fervor: x 2..105, y 15..20.
  for (const [x0, y0, x1, y1, cada] of [
    [1, 1, 122, 13, 20],
    [1, 14, 106, 21, 0],
  ]) {
    for (let x = x0; x <= x1; x += 1) {
      poner(img, x, y0, oro);
      poner(img, x, y1, oroSombra);
    }
    for (let y = y0; y <= y1; y += 1) {
      poner(img, x0, y, oro);
      poner(img, x1, y, oroSombra);
    }
    if (cada) {
      for (let x = x0 + cada; x < x1; x += cada) {
        poner(img, x, y0, oroLuz);
        poner(img, x + 1, y0, oroLuz);
        poner(img, x, y1, oro);
        poner(img, x + 1, y1, oro);
      }
    }
  }
  // El remate de la vida: un cuello, la gema en su rombo y una punta.
  for (let x = 123; x <= 128; x += 1) {
    poner(img, x, 6, oroLuz);
    poner(img, x, 7, oro);
    poner(img, x, 8, oroSombra);
  }
  rombo(img, [134, 7], 6, oro);
  rombo(img, [134, 7], 3, PALETA.gema[0], PALETA.gema[1]);
  for (let i = 0; i < 6; i += 1) {
    poner(img, 141 + i, 7, i < 3 ? oroLuz : oro);
    if (i < 3) {
      poner(img, 141 + i, 6, oro);
      poner(img, 141 + i, 8, oroSombra);
    }
  }
  // El del Fervor.
  rombo(img, [111, 17], 3, oro, oroLuz);
  return contornear(img);
}

/** Un ruido fijo, para que la carne de las barras no sea un color plano. */
const ruido = (x, y) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * Una barra de `ancho`x`alto`, con su volumen: luz arriba, sombra abajo y algo
 * de veta. La de vida, en `segmentos` con un corte biselado: se lee cuantos
 * golpes quedan.
 */
function barra(ancho, alto, [base, luz, sombra], segmentos = 0) {
  const corte = segmentos ? Math.round(ancho / segmentos) : 0;
  return Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => {
      if (corte && x > 0 && x % corte === 0) return PALETA.contorno;
      if (corte && x % corte === 1 && x > 1) return luz;
      if (y === 0) return luz;
      if (y >= alto - 2) return sombra;
      if (y > alto / 2 && ruido(x, y) > 0.72) return sombra;
      if (y < alto / 2 && ruido(x, y) > 0.9) return luz;
      return base;
    }),
  );
}

function frasco(lleno) {
  const piezas = [
    [capsula([5, 1.5], [5, 2.5], 1.4), 'corcho'],
    [capsula([5, 3.5], [5, 5.5], 1.5), lleno ? 'vidrio' : 'vidrioApagado'],
    [elipse([5, 9], 4.1, 4.4), lleno ? 'vidrio' : 'vidrioApagado'],
  ];
  if (lleno) {
    piezas.push([elipse([5, 9.6], 3.1, 3.2), 'sangre']);
    piezas.push([capsula([3.4, 7.4], [3.4, 8.2], 0.5), 'brillo']);
  }
  return rasterizar(piezas, 10, 14, PALETA);
}

/**
 * La caja de los dialogos y de lo que se lee, para un StyleBoxTexture: doble
 * filete, oro y oxido, y una esquina con su rombo. Bordes de 10 px.
 */
function caja() {
  const lado = 30;
  const dentro = [15, 10, 11, 245];
  const img = Array.from({ length: lado }, () => new Array(lado).fill(dentro));
  const [oro, oroLuz, oroSombra] = PALETA.oro;
  for (let i = 0; i < lado; i += 1) {
    for (const [x, y, color] of [
      [i, 0, oroSombra],
      [i, 1, oroLuz],
      [i, lado - 2, oro],
      [i, lado - 1, oroSombra],
      [0, i, oroSombra],
      [1, i, oro],
      [lado - 2, i, oro],
      [lado - 1, i, oroSombra],
      [i, 4, PALETA.oxido[0]],
      [i, lado - 5, PALETA.oxido[2]],
      [4, i, PALETA.oxido[0]],
      [lado - 5, i, PALETA.oxido[2]],
    ])
      poner(img, x, y, color);
  }
  for (const [x, y] of [
    [3, 3],
    [lado - 4, 3],
    [3, lado - 4],
    [lado - 4, lado - 4],
  ])
    rombo(img, [x, y], 3, oro, PALETA.gema[1]);
  return img;
}

/**
 * La placa del nombre y de los avisos: una tira con los extremos en punta, para
 * un StyleBoxTexture con bordes de 6 px.
 */
function placa() {
  const ancho = 20;
  const alto = 13;
  const medio = 6;
  const dentro = [38, 22, 16, 240];
  const [oro, oroLuz, oroSombra] = PALETA.oro;
  const img = Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => {
      if (Math.min(x, ancho - 1 - x) + (medio - Math.abs(y - medio)) < medio) return NADA;
      return dentro;
    }),
  );
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      if (!img[y][x][3]) continue;
      const borde = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => !img[y + dy]?.[x + dx]?.[3]);
      if (borde) img[y][x] = y <= medio ? oroLuz : y === alto - 1 ? oroSombra : oro;
    }
  }
  return contornear(img);
}

/** El filo de la barra del guardian: oro, en punta, con bordes de 6 px. */
function filoGuardian() {
  const ancho = 24;
  const alto = 14;
  const [oro, oroLuz, oroSombra] = PALETA.oro;
  const img = Array.from({ length: alto }, () => new Array(ancho).fill(NADA));
  for (let x = 4; x < ancho - 4; x += 1) {
    poner(img, x, 2, oroLuz);
    poner(img, x, alto - 3, oroSombra);
  }
  for (let y = 2; y < alto - 2; y += 1) {
    poner(img, 4, y, oro);
    poner(img, ancho - 5, y, oroSombra);
  }
  for (const x of [2, ancho - 3]) rombo(img, [x, 6], 2, oro, oroLuz);
  return contornear(img);
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  mkdirSync(destino, { recursive: true });
  const retrato = leerPng(join(raiz, 'sigma/arte/retratos/cirujano.png'));
  const piezas = {
    medallon: medallon(sinOjo(retrato)),
    'medallon-ojo': medallon(retrato),
    marco: marco(),
    'vida-llena': barra(120, 11, PALETA.sangre, 6),
    'vida-vacia': barra(120, 11, PALETA.fondo, 6),
    'fervor-lleno': barra(104, 6, PALETA.fervor),
    'fervor-vacio': barra(104, 6, PALETA.fondo),
    'frasco-lleno': frasco(true),
    'frasco-vacio': frasco(false),
    caja: caja(),
    placa: placa(),
    'filo-guardian': filoGuardian(),
  };
  for (const [nombre, img] of Object.entries(piezas))
    writeFileSync(join(destino, `${nombre}.png`), png(img));
  console.log(`${Object.keys(piezas).length} piezas de la interfaz -> sigma/arte/hud/`);
}
