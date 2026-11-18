/**
 * Mete en Subterfuge Sigma el arte de Nico Echeverri, hecho a mano.
 *
 * Nico entrega sus sprites ampliados a 10x sobre fondo claro, y las
 * animaciones del Cirujano en GIF. `docs/arte/nico/originales/` guarda lo que
 * entregó tal cual; `docs/arte/nico/1x/` es lo mismo a su tamaño real, con el
 * fondo transparente. Este script parte de `1x/` y deja cada figura donde el
 * juego la busca: los fotogramas del Cirujano (y su `animaciones.gd`), el
 * Prior, el Cegado, la niña, los fieles y sus retratos.
 *
 * Nico dibuja mirando a la izquierda; el juego, a la derecha: se voltea.
 * Nada se suaviza: el Prior va a su tamaño y el resto se reduce (ver ESCALA).
 *
 * Uso:  npm run sigma:nico
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { png } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = join(raiz, 'docs/arte/nico/1x');
const arte = join(raiz, 'sigma/arte');
const VACIO = [0, 0, 0, 0];
/**
 * A cuánto se reducen el Cirujano, la niña, los fieles y Ulpiano. Nico los
 * dibuja a unos 64 px de alto, y al lado de los enemigos (de 38 a 55 px) el
 * Cirujano se veía enorme (feedback de Jean). Al 80 % mide 52, como antes. El
 * Prior se queda a su tamaño: es el jefe, y que sea más alto le sienta bien.
 */
const ESCALA = 0.8;

/** Lee un PNG RGBA de 8 bits, sin entrelazar. */
function leer(ruta) {
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
      fila[x] = (v + [0, a, b, (a + b) >> 1, paeth][filtro]) & 255;
    }
    filas.push(fila);
  }
  return filas.map((f) =>
    Array.from({ length: ancho }, (_, x) => [...f.subarray(x * 4, x * 4 + 4)]),
  );
}

const lienzo = (ancho, alto) =>
  Array.from({ length: alto }, () => Array.from({ length: ancho }, () => VACIO));
const espejo = (img) => img.map((fila) => [...fila].reverse());

/**
 * Reduce un dibujo sin suavizar: cada pixel nuevo toma el color que más área
 * cubre en el original. Así no aparecen colores que Nico no puso, y las piezas
 * de más de un pixel (el ribete, la gema, el filo) sobreviven.
 */
function reducir(img, f) {
  if (f === 1) return img;
  const [alto, ancho] = [img.length, img[0].length];
  const [w, h] = [Math.round(ancho * f), Math.round(alto * f)];
  return Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const [x0, x1, y0, y1] = [x / f, (x + 1) / f, y / f, (y + 1) / f];
      const areas = new Map();
      for (let sy = Math.floor(y0); sy < Math.min(alto, Math.ceil(y1)); sy += 1) {
        for (let sx = Math.floor(x0); sx < Math.min(ancho, Math.ceil(x1)); sx += 1) {
          const a =
            (Math.min(x1, sx + 1) - Math.max(x0, sx)) * (Math.min(y1, sy + 1) - Math.max(y0, sy));
          const clave = img[sy][sx].join(',');
          areas.set(clave, (areas.get(clave) ?? 0) + a);
        }
      }
      let [mejor, mayor] = ['0,0,0,0', -1];
      for (const [clave, a] of areas) if (a > mayor) [mejor, mayor] = [clave, a];
      return mejor.split(',').map(Number);
    }),
  );
}

/** La caja de lo pintado: [x0, y0, x1, y1), con x1 e y1 fuera. */
function caja(img) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -1, -1];
  img.forEach((fila, y) =>
    fila.forEach((p, x) => {
      if (!p[3]) return;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + 1);
      y1 = Math.max(y1, y + 1);
    }),
  );
  return [x0, y0, x1, y1];
}

function recortar(img) {
  const [x0, y0, x1, y1] = caja(img);
  return img.slice(y0, y1).map((fila) => fila.slice(x0, x1));
}

/** El centro del bajo de la ropa: donde la figura pisa, sin contar báculos ni velos. */
function pie(img) {
  const [, , , y1] = caja(img);
  let suma = 0;
  let n = 0;
  for (let y = y1 - 4; y < y1; y += 1) {
    img[y].forEach((p, x) => {
      if (p[3]) {
        suma += x;
        n += 1;
      }
    });
  }
  return [Math.round(suma / n), y1];
}

/** Pega `img` en un lienzo nuevo, desplazada. */
function mover(img, ancho, alto, dx, dy) {
  const out = lienzo(ancho, alto);
  img.forEach((fila, y) =>
    fila.forEach((p, x) => {
      if (p[3] && out[y + dy]?.[x + dx]) out[y + dy][x + dx] = p;
    }),
  );
  return out;
}

const guardar = (ruta, img) => {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, png(img));
};

// ---------------------------------------------------------------- El Cirujano

/** La piel de la cara del Cirujano, en la paleta de Nico. */
const esPiel = (p) => p[3] && p[0] > 130 && p[0] < 190 && p[0] - p[2] > 50 && p[1] < 130;

/** El pelo, casi negro, bajo la mitra. */
const esPelo = (p) => p[3] && p[0] < 50 && p[1] < 50 && p[2] < 50;

/**
 * Las filas de la cara: de la primera de piel bajo el pelo a siete más abajo.
 * Bajo el pelo, porque en algún golpe la mano en alto queda por encima.
 */
function cara(img) {
  let pelo = 0;
  for (let y = 0; y < 30; y += 1) {
    if (img[y].some(esPelo)) pelo = y;
    else if (pelo && img[y].some(esPiel)) return [y, y + Math.round(7 * ESCALA)];
  }
  return [13, 19];
}

/** Donde cae el ojo rojo: dos filas bajo el pelo, en el borde de la cara que mira. */
function ojoDe(img) {
  const [y0] = cara(img);
  const y = y0 + 2;
  let x = -1;
  img[y].forEach((p, i) => {
    if (esPiel(p)) x = i;
  });
  return [Math.max(0, x - 1), y];
}

/** La máscara sin ojos de las Manos, sobre la cara: para la intro, antes de mirar. */
function conMascara(img) {
  const HUESO = [226, 216, 196, 255];
  const SOMBRA = [184, 170, 148, 255];
  const [y0, y1] = cara(img);
  return img.map((fila, y) =>
    fila.map((p, x) => {
      if (y < y0 || y > y1 || !esPiel(p)) return p;
      return esPiel(img[y + 1]?.[x] ?? VACIO) ? HUESO : SOMBRA;
    }),
  );
}

/**
 * Cada animación del juego, con los fotogramas de Nico que la hacen. Los
 * recuentos son los de siempre, para que el código no cambie: donde Nico no
 * dibujó un gesto propio, sale del suyo más cercano.
 */
const ANIMACIONES = {
  reposo: ['correr-0', 'correr-0', 'correr-4', 'correr-4'],
  correr: [
    'correr-0',
    'correr-1',
    'correr-2',
    'correr-3',
    'correr-4',
    'correr-5',
    'correr-6',
    'correr-7',
  ],
  andar: [
    'correr-0',
    'correr-1',
    'correr-2',
    'correr-3',
    'correr-4',
    'correr-5',
    'correr-6',
    'correr-7',
  ],
  salto: ['salto-3'],
  caida: ['salto-4', 'salto-5'],
  aterrizaje: ['salto-7'],
  dash: ['correr-6'],
  agarre: ['salto-4'],
  'agarre-girado': ['salto-4'],
  herido: ['herido-2'],
  rezar: ['rezar-3'],
  guardia: ['guardia-2', 'guardia-3'],
  golpe: ['golpe-0', 'golpe-1', 'golpe-2', 'golpe-3', 'golpe-4', 'golpe-5'],
  cargado: ['golpe-0', 'golpe-1', 'golpe-2', 'golpe-3', 'golpe-4', 'golpe-5'],
  arriba: ['golpe-2', 'golpe-3', 'golpe-3', 'golpe-4'],
  abajo: ['golpe-4', 'golpe-5', 'golpe-5'],
  contragolpe: ['guardia-0', 'guardia-1', 'guardia-1', 'golpe-5'],
  bebe: ['rezar-1', 'rezar-2', 'rezar-3'],
  alza: ['golpe-3', 'golpe-3'],
  tajo: ['golpe-3', 'golpe-4', 'golpe-5'],
  muerte: ['herido-1', 'herido-2', 'herido-3', 'herido-5'],
};

function cirujano() {
  const destino = join(arte, 'cirujano');
  const nico = {};
  for (const archivo of readdirSync(join(fuente, 'cirujano'))) {
    nico[archivo.replace('.png', '')] = reducir(
      espejo(leer(join(fuente, 'cirujano', archivo))),
      ESCALA,
    );
  }
  const muestra = nico['correr-0'];
  const ancho = muestra[0].length;
  const alto = muestra.length;
  // Todos los fotogramas, con los pies en la misma fila: Nico deja alguno a un pixel.
  const fotograma = (nombre) => {
    const img = nico[nombre];
    if (!img) throw new Error(`falta el fotograma de Nico ${nombre}`);
    return mover(img, ancho, alto, 0, alto - caja(img)[3]);
  };
  const [ox] = pie(fotograma('correr-0'));
  const cuadros = {};
  for (const [nombre, lista] of Object.entries(ANIMACIONES)) cuadros[nombre] = lista.map(fotograma);
  cuadros['intro-andar'] = cuadros.andar.map(conMascara);
  cuadros['intro-reposo'] = cuadros.reposo.map(conMascara);
  cuadros['intro-alza'] = cuadros.alza.map(conMascara);

  // Fuera los relieves del Cirujano en código: no casan con el dibujo de Nico.
  for (const archivo of readdirSync(destino)) {
    if (/_n\.png(\.import)?$/.test(archivo)) rmSync(join(destino, archivo));
  }
  for (const [nombre, lista] of Object.entries(cuadros)) {
    lista.forEach((img, i) => guardar(join(destino, `${nombre}-${i}.png`), img));
  }
  const recuento = Object.entries(cuadros).map(([n, l]) => `\t"${n}": ${l.length},`);
  // Las de la intro llevan la máscara: el ojo se busca en la cara sin ella.
  const sinMascara = (n) => cuadros[n.replace('intro-', '')];
  const ojos = Object.entries(cuadros).map(([n]) => {
    const lista = sinMascara(n).map((img) => `Vector2i(${ojoDe(img).join(', ')})`);
    return `\t"${n}": [${lista.join(', ')}],`;
  });
  writeFileSync(
    join(destino, 'animaciones.gd'),
    [
      '## Generado por scripts/nico-sigma.mjs con el arte de Nico: no se edita a mano.',
      '## Cuantos fotogramas tiene cada animacion del Cirujano.',
      'extends RefCounted',
      '',
      `## El pie de la figura dentro del fotograma (${ancho}x${alto}).`,
      `const ORIGEN := Vector2i(${ox}, ${alto})`,
      '',
      'const RECUENTO := {',
      ...recuento,
      '}',
      '',
      '## Donde cae el ojo rojo en cada fotograma, en pixeles del fotograma.',
      'const OJOS := {',
      ...ojos,
      '}',
      '',
    ].join('\n'),
  );
  writeFileSync(join(destino, 'hoja.png'), png(hoja(cuadros, ancho, alto)));
  const total = Object.values(cuadros).reduce((a, l) => a + l.length, 0);
  console.log(`Cirujano: ${total} fotogramas de ${ancho}x${alto}, pie en (${ox}, ${alto})`);
}

/** Todas las animaciones en filas, ampliadas a 3x, para revisarlas de un vistazo. */
function hoja(cuadros, ancho, alto, k = 3) {
  const fondo = [42, 32, 48, 255];
  const filas = Object.values(cuadros);
  const columnas = Math.max(...filas.map((f) => f.length));
  const out = [];
  for (const fila of filas) {
    for (let y = 0; y < alto; y += 1) {
      const linea = [];
      for (let i = 0; i < columnas; i += 1) {
        for (let x = 0; x < ancho; x += 1) {
          const p = fila[i]?.[y]?.[x];
          for (let r = 0; r < k; r += 1) linea.push(p && p[3] ? p : fondo);
        }
      }
      for (let r = 0; r < k; r += 1) out.push(linea);
    }
  }
  return out;
}

// ------------------------------------------------------------- Los demás

/** El Prior: las dos poses de Nico en un lienzo de 96x96, con el pie en (48, 96). */
function prior() {
  const LADO = 96;
  const pose = (nombre, bajada = 0) => {
    const img = espejo(leer(join(fuente, `${nombre}.png`)));
    const [px, py] = pie(img);
    return mover(img, LADO, LADO, LADO / 2 - px, LADO - py + bajada);
  };
  const reposo = pose('prior-reposo');
  const alza = pose('prior-alza');
  const poses = {
    reposo,
    aturdido: reposo,
    arrodillado: pose('prior-reposo', 8),
    alza,
    golpe: alza,
    lanza: alza,
    diezmo: alza,
  };
  for (const [nombre, img] of Object.entries(poses))
    guardar(join(arte, 'prior', `${nombre}.png`), img);
  guardar(join(arte, 'prior/retrato.png'), leer(join(fuente, 'retrato-prior.png')));
  console.log('Prior: 7 poses de 96x96 y su retrato');
}

function sueltos() {
  const figuras = {
    'nina/figura.png': 'nina',
    'cegado/figura.png': 'cegado',
    'fieles/fiel-1.png': 'fiel-1',
    'fieles/fiel-2.png': 'fiel-2',
    'fieles/fiel-3.png': 'fiel-3',
    'fieles/encapuchada-1.png': 'encapuchada-1',
    'fieles/encapuchada-2.png': 'encapuchada-2',
  };
  for (const [destino, nombre] of Object.entries(figuras)) {
    const img = recortar(reducir(leer(join(fuente, `${nombre}.png`)), ESCALA));
    guardar(join(arte, destino), img);
    console.log(`${destino}: ${img[0].length}x${img.length}`);
  }
  guardar(join(arte, 'cegado/retrato.png'), leer(join(fuente, 'retrato-cegado.png')));
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  if (!existsSync(fuente)) throw new Error(`No está el arte de Nico en ${fuente}`);
  cirujano();
  prior();
  sueltos();
}
