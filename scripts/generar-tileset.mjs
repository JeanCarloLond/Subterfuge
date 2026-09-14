/**
 * Convierte las piezas de muro de la artista en el tileset que carga el juego.
 *
 * Por qué existe: las piezas de `docs/arte/piezas/` están dibujadas sobre un
 * módulo de ladrillo de 19 x 10 px (18 de cuerpo + 1 de mortero, y 9 + 1 en
 * vertical). El juego trabaja en una rejilla de 16 px, y 19 no divide a 16: si
 * el ladrillo se pintara a su tamaño original quedaría cortado a media pieza en
 * cada borde de plataforma.
 *
 * La conversión NO reescala. Reescalar pixel art lo emborrona e inventa píxeles
 * que nadie dibujó. Lo que hace es **quitar relleno**: borra tres columnas y dos
 * filas del centro plano de cada ladrillo y deja intactos el brillo superior, la
 * sombra inferior y el mortero, que es donde se lee la forma. El ladrillo pasa a
 * medir 15 + 1 = 16 de ancho y 7 + 1 = 8 de alto, así que **un tile del juego es
 * un ladrillo de ancho por dos hiladas de alto**.
 *
 * Que el módulo encaje no es casualidad: tras la conversión, las piezas de dos
 * hiladas miden exactamente un tile de alto (las plataformas del juego miden
 * eso) y las de cuatro hiladas miden dos.
 *
 * Genera tres cosas:
 *
 *   vientre.png          hilera de tiles 16x16 que embaldosan sin costura
 *   vientre-grietas.png  calcomanías de grieta, con alfa
 *   vientre-musgo.png    calcomanías de musgo, con alfa
 *
 * Las grietas y el musgo van SUELTOS, no horneados dentro del tile que se
 * repite. Es la diferencia entre una pared y un papel pintado: una grieta dentro
 * del patrón reaparece cada 16 px y se lee como estampado. Se pueden separar
 * porque la artista dibujó cada variante sobre la misma base, así que restar la
 * pieza limpia de la agrietada deja exactamente la grieta.
 *
 * Uso:  node scripts/generar-tileset.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { inflateSync, deflateSync } from 'node:zlib';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = join(raiz, 'docs/arte/piezas');
const DESTINO = join(raiz, 'public/assets/tilesets');

/** Módulo de ladrillo tal como lo dibujó la artista. */
const CELDA = { ancho: 19, alto: 10 };
/** Rejilla del juego (debe coincidir con la T de EscenaNivel). */
const TILE = 16;
/** Columnas y filas de RELLENO que se eliminan. Nunca tocan un borde. */
const COLUMNAS_FUERA = [7, 8, 9];
const FILAS_FUERA = [4, 5];

const HILADA = CELDA.alto - FILAS_FUERA.length; // 8
const CUANTOS_TILES = 8;
/** Lo que se le permite desbordar al musgo por encima del canto (px). */
const MUSGO_MAX = 24;

// -- PNG ---------------------------------------------------------------------
// Lector y escritor mínimos. El proyecto no tiene ninguna librería de imagen y
// no merece la pena añadir una dependencia para leer unos PNG de 64x64.

function leerPng(ruta) {
  const buf = readFileSync(ruta);
  let i = 8; // cabecera
  let ancho = 0;
  let alto = 0;
  let tipo = 0;
  const trozos = [];

  while (i < buf.length) {
    const largo = buf.readUInt32BE(i);
    const nombre = buf.toString('ascii', i + 4, i + 8);
    const datos = buf.subarray(i + 8, i + 8 + largo);

    if (nombre === 'IHDR') {
      ancho = datos.readUInt32BE(0);
      alto = datos.readUInt32BE(4);
      const profundidad = datos[8];
      tipo = datos[9];
      if (profundidad !== 8 || (tipo !== 2 && tipo !== 6)) {
        throw new Error(`${ruta}: solo se admite PNG de 8 bits RGB o RGBA`);
      }
      if (datos[12] !== 0) throw new Error(`${ruta}: PNG entrelazado no admitido`);
    } else if (nombre === 'IDAT') {
      trozos.push(datos);
    } else if (nombre === 'IEND') {
      break;
    }

    i += 12 + largo;
  }

  const canales = tipo === 6 ? 4 : 3;
  const crudo = inflateSync(Buffer.concat(trozos));
  const paso = ancho * canales;
  const pixeles = Buffer.alloc(alto * paso);

  // Deshace el filtro por filas (PNG, sección 9).
  for (let y = 0; y < alto; y += 1) {
    const filtro = crudo[y * (paso + 1)];
    const linea = crudo.subarray(y * (paso + 1) + 1, (y + 1) * (paso + 1));
    for (let x = 0; x < paso; x += 1) {
      const a = x >= canales ? pixeles[y * paso + x - canales] : 0;
      const b = y > 0 ? pixeles[(y - 1) * paso + x] : 0;
      const c = x >= canales && y > 0 ? pixeles[(y - 1) * paso + x - canales] : 0;
      let valor = linea[x];

      if (filtro === 1) valor += a;
      else if (filtro === 2) valor += b;
      else if (filtro === 3) valor += (a + b) >> 1;
      else if (filtro === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        valor += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }

      pixeles[y * paso + x] = valor & 0xff;
    }
  }

  const lee = (x, y) => {
    const o = y * paso + x * canales;
    return [pixeles[o], pixeles[o + 1], pixeles[o + 2], canales === 4 ? pixeles[o + 3] : 255];
  };

  return { ancho, alto, lee };
}

function escribirPng(ruta, ancho, alto, pixeles) {
  const paso = ancho * 4;
  const crudo = Buffer.alloc(alto * (paso + 1));
  for (let y = 0; y < alto; y += 1) {
    crudo[y * (paso + 1)] = 0; // sin filtro: comprime de sobra a este tamaño
    pixeles.copy(crudo, y * (paso + 1) + 1, y * paso, (y + 1) * paso);
  }

  const trozo = (nombre, datos) => {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const cuerpo = Buffer.concat([Buffer.from(nombre, 'ascii'), datos]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(cuerpo) >>> 0);
    return Buffer.concat([largo, cuerpo, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA

  writeFileSync(
    ruta,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      trozo('IHDR', ihdr),
      trozo('IDAT', deflateSync(crudo, { level: 9 })),
      trozo('IEND', Buffer.alloc(0)),
    ]),
  );
}

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = TABLA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

// -- Lectura de las piezas ---------------------------------------------------

/** El recorte de WhatsApp dejó el fondo en negro plano en vez de transparente. */
function esFondo([r, g, b, a]) {
  return a === 0 || Math.max(r, g, b) < 26;
}

function esOscuro(p) {
  return !esFondo(p) && (p[0] + p[1] + p[2]) / 3 < 70;
}

function esVerde([r, g, b]) {
  return g > r + 18 && g > b + 18 && g > 60;
}

function cargarPieza(archivo) {
  const { ancho, alto, lee } = leerPng(join(ORIGEN, archivo));
  const px = [];
  for (let y = 0; y < alto; y += 1) {
    const fila = [];
    for (let x = 0; x < ancho; x += 1) fila.push(lee(x, y));
    px.push(fila);
  }

  let x0 = ancho;
  let x1 = -1;
  let y0 = alto;
  let y1 = -1;
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      if (esFondo(px[y][x])) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }

  return { archivo, ancho, alto, px, x0, x1, y0, y1 };
}

/** Columnas de junta de una hilada: la franja oscura entre dos ladrillos. */
function juntasDe(pieza, my) {
  const juntas = [];
  for (let x = pieza.x0; x <= pieza.x1; x += 1) {
    let todas = true;
    for (let y = my + 2; y < my + CELDA.alto - 2; y += 1) {
      if (!esOscuro(pieza.px[y][x])) {
        todas = false;
        break;
      }
    }
    if (todas) juntas.push(x);
  }
  return juntas;
}

// -- Conversión del módulo ---------------------------------------------------

/**
 * Extrae una hilada de 16x8 a partir de la junta `jx` y el mortero `my`.
 * Devuelve null si la celda se sale del dibujo: una celda que toca el vacío
 * mete un agujero negro en mitad de la pared.
 */
function hiladaDesde(pieza, jx, my) {
  if (jx + CELDA.ancho > pieza.ancho || my + CELDA.alto > pieza.alto) return null;

  const salida = [];
  for (let y = 0; y < CELDA.alto; y += 1) {
    if (FILAS_FUERA.includes(y)) continue;
    const fila = [];
    for (let x = 0; x < CELDA.ancho; x += 1) {
      if (COLUMNAS_FUERA.includes(x)) continue;
      const p = pieza.px[my + y][jx + x];
      if (esFondo(p)) return null;
      fila.push(p);
    }
    salida.push(fila);
  }
  return salida;
}

/** Un tile: dos hiladas, la de abajo corrida media pieza (aparejo a soga). */
function tileDe(arriba, abajo) {
  const corrida = abajo.map((f) => f.slice(HILADA).concat(f.slice(0, HILADA)));
  return arriba.concat(corrida);
}

// -- Calcomanías -------------------------------------------------------------

/** Grupos de píxeles pegados entre sí: cada mancha suelta es una calcomanía. */
function manchas(marca, ancho, alto, holgura = 2) {
  const visto = marca.map((f) => f.map(() => false));
  const grupos = [];

  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      if (!marca[y][x] || visto[y][x]) continue;
      const cola = [[x, y]];
      const grupo = [];
      visto[y][x] = true;

      while (cola.length > 0) {
        const [cx, cy] = cola.pop();
        grupo.push([cx, cy]);
        for (let dy = -holgura; dy <= holgura; dy += 1) {
          for (let dx = -holgura; dx <= holgura; dx += 1) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= ancho || ny >= alto) continue;
            if (!marca[ny][nx] || visto[ny][nx]) continue;
            visto[ny][nx] = true;
            cola.push([nx, ny]);
          }
        }
      }
      grupos.push(grupo);
    }
  }

  return grupos;
}

/**
 * Pasa una mancha al ritmo del juego: se quitan las mismas filas y columnas
 * que en el ladrillo, para que la grieta siga cayendo sobre las juntas.
 */
function calcomaniaDe(pieza, grupo, refJunta, refMortero) {
  const dentro = new Set(grupo.map(([x, y]) => `${x},${y}`));
  const fuera = ([x, y]) =>
    COLUMNAS_FUERA.includes((((x - refJunta) % CELDA.ancho) + CELDA.ancho) % CELDA.ancho) ||
    FILAS_FUERA.includes((((y - refMortero) % CELDA.alto) + CELDA.alto) % CELDA.alto);

  const puntos = grupo.filter((p) => !fuera(p));
  if (puntos.length < 6) return null;

  // Coordenadas ya comprimidas: cuántas filas/columnas sobreviven por delante.
  const comprimeX = (x) => {
    let n = 0;
    for (let i = Math.min(...puntos.map((p) => p[0])); i < x; i += 1) {
      if (!COLUMNAS_FUERA.includes((((i - refJunta) % CELDA.ancho) + CELDA.ancho) % CELDA.ancho)) {
        n += 1;
      }
    }
    return n;
  };
  const comprimeY = (y) => {
    let n = 0;
    for (let i = Math.min(...puntos.map((p) => p[1])); i < y; i += 1) {
      if (!FILAS_FUERA.includes((((i - refMortero) % CELDA.alto) + CELDA.alto) % CELDA.alto)) {
        n += 1;
      }
    }
    return n;
  };

  const celdas = puntos.map(([x, y]) => ({ x: comprimeX(x), y: comprimeY(y), o: [x, y] }));
  const ancho = Math.max(...celdas.map((c) => c.x)) + 1;
  const alto = Math.max(...celdas.map((c) => c.y)) + 1;
  if (ancho < 3 || alto < 3) return null;

  const px = Array.from({ length: alto }, () => Array.from({ length: ancho }, () => null));
  for (const c of celdas) {
    if (!dentro.has(`${c.o[0]},${c.o[1]}`)) continue;
    px[c.y][c.x] = pieza.px[c.o[1]][c.o[0]];
  }

  return { ancho, alto, px };
}

// -- Empaquetado -------------------------------------------------------------

function hilera(tiles) {
  const ancho = tiles.length * TILE;
  const buf = Buffer.alloc(ancho * TILE * 4);
  tiles.forEach((t, i) => {
    for (let y = 0; y < TILE; y += 1) {
      for (let x = 0; x < TILE; x += 1) {
        const [r, g, b] = t[y][x];
        const o = (y * ancho + i * TILE + x) * 4;
        buf[o] = r;
        buf[o + 1] = g;
        buf[o + 2] = b;
        buf[o + 3] = 255;
      }
    }
  });
  return { ancho, alto: TILE, buf };
}

/** Rejilla de celdas iguales; cada calcomanía va centrada en la suya. */
function rejilla(calcos, porFila = 8, celdaFija = 0) {
  const lado = Math.max(...calcos.map((c) => Math.max(c.ancho, c.alto)));
  const celda = celdaFija || Math.ceil(lado / 4) * 4;
  const filas = Math.ceil(calcos.length / porFila);
  const ancho = porFila * celda;
  const alto = filas * celda;
  const buf = Buffer.alloc(ancho * alto * 4);

  calcos.forEach((c, i) => {
    const ox = (i % porFila) * celda + ((celda - c.ancho) >> 1);
    const oy = Math.floor(i / porFila) * celda + ((celda - c.alto) >> 1);
    for (let y = 0; y < c.alto; y += 1) {
      for (let x = 0; x < c.ancho; x += 1) {
        const p = c.px[y][x];
        if (!p) continue;
        const o = ((oy + y) * ancho + ox + x) * 4;
        buf[o] = p[0];
        buf[o + 1] = p[1];
        buf[o + 2] = p[2];
        buf[o + 3] = 255;
      }
    }
  });

  return { ancho, alto, buf, celda };
}

// -- Programa ----------------------------------------------------------------

const archivos = readdirSync(ORIGEN)
  .filter((f) => f.endsWith('.png'))
  .sort();

if (archivos.length === 0) {
  console.error(`No hay piezas en ${ORIGEN}.`);
  process.exit(1);
}

const piezas = archivos.map(cargarPieza);

// Hiladas limpias: la base que se repite. Solo de las piezas sin grieta ni
// musgo, y solo celdas que caen enteras dentro del dibujo.
const hiladas = [];
const vistas = new Set();
for (const pieza of piezas.filter((p) => p.archivo.includes('limpio'))) {
  for (let my = pieza.y0; my + CELDA.alto <= pieza.y1 + 1; my += CELDA.alto) {
    for (const jx of juntasDe(pieza, my)) {
      const h = hiladaDesde(pieza, jx, my);
      if (!h) continue;
      const firma = h
        .flat()
        .map((p) => p.join(','))
        .join('|');
      if (vistas.has(firma)) continue;
      vistas.add(firma);
      hiladas.push(h);
    }
  }
}

if (hiladas.length < 2) {
  console.error('No se pudieron extraer hiladas limpias suficientes.');
  process.exit(1);
}

const tiles = [];
for (let i = 0; i < CUANTOS_TILES; i += 1) {
  tiles.push(tileDe(hiladas[i % hiladas.length], hiladas[(i + 1) % hiladas.length]));
}

// Calcomanías de grieta: lo que separa a una pieza agrietada de su base limpia.
// Se agrupan por encuadre porque la artista dibujó cada variante encima de la
// misma base, así que la resta da la grieta y nada más.
const grietas = [];
const musgos = [];

const encuadre = (p) => `${p.x0},${p.y0},${p.x1},${p.y1}`;
const bases = new Map();
for (const p of piezas) {
  if (p.archivo.includes('limpio')) bases.set(encuadre(p), p);
}

for (const pieza of piezas) {
  if (pieza.archivo.includes('limpio')) continue;
  const base = bases.get(encuadre(pieza));
  if (!base) continue;

  const marca = pieza.px.map((fila, y) =>
    fila.map((p, x) => {
      const q = base.px[y][x];
      const dif = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
      return dif >= 30 && !esVerde(p);
    }),
  );

  const mortero = pieza.y0;
  const junta = juntasDe(pieza, mortero)[0] ?? pieza.x0;
  for (const grupo of manchas(marca, pieza.ancho, pieza.alto)) {
    const c = calcomaniaDe(pieza, grupo, junta, mortero);
    if (c) grietas.push(c);
  }
}

// Calcomanías de musgo: el verde se reconoce solo, no hace falta una base.
for (const pieza of piezas.filter((p) => p.archivo.includes('musgo'))) {
  const marca = pieza.px.map((fila) => fila.map((p) => !esFondo(p) && esVerde(p)));
  const mortero = pieza.y0;
  const junta = juntasDe(pieza, mortero)[0] ?? pieza.x0;
  for (const grupo of manchas(marca, pieza.ancho, pieza.alto, 3)) {
    const c = calcomaniaDe(pieza, grupo, junta, mortero);
    if (c) musgos.push(c);
  }
}

if (grietas.length === 0 || musgos.length === 0) {
  console.error('No se extrajo ninguna calcomanía; revisa las piezas de origen.');
  process.exit(1);
}

// Las más grandes primero: son las que se leen, y así el recorte por tamaño
// de rejilla no se come las buenas.
const porArea = (a, b) => b.ancho * b.alto - a.ancho * a.alto;
const cabeEn = (lado) => (c) => c.ancho <= lado && c.alto <= lado;

// Una grieta está DENTRO de la piedra, así que no puede sobresalir de su tile:
// una grieta flotando sobre el vacío delata el truco al instante. Se queda solo
// con las que caben en un tile.
const grietasElegidas = grietas.filter(cabeEn(TILE)).sort(porArea).slice(0, 16);

// El musgo es lo contrario: crece hacia fuera y cuelga por el canto, que es
// justo como lo dibujó la artista en la lámina de referencia. Puede desbordar.
const musgosElegidos = musgos.filter(cabeEn(MUSGO_MAX)).sort(porArea).slice(0, 16);

mkdirSync(DESTINO, { recursive: true });

const base = hilera(tiles);
escribirPng(join(DESTINO, 'vientre.png'), base.ancho, base.alto, base.buf);

const g = rejilla(grietasElegidas, 8, TILE);
escribirPng(join(DESTINO, 'vientre-grietas.png'), g.ancho, g.alto, g.buf);

const m = rejilla(musgosElegidos, 8, MUSGO_MAX);
escribirPng(join(DESTINO, 'vientre-musgo.png'), m.ancho, m.alto, m.buf);

console.log(`piezas leídas:      ${piezas.length}`);
console.log(`hiladas limpias:    ${hiladas.length} distintas`);
console.log(`vientre.png:        ${tiles.length} tiles de ${TILE}x${TILE}`);
console.log(`vientre-grietas.png ${grietasElegidas.length} calcomanías, celda ${g.celda}px`);
console.log(`vientre-musgo.png:  ${musgosElegidos.length} calcomanías, celda ${m.celda}px`);
console.log('');
console.log(`Si cambian las piezas de ${ORIGEN.replace(raiz + '/', '')}, vuelve a ejecutar esto.`);
