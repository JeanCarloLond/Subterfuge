/**
 * Verifica que en cada nivel se pueda VOLVER A SUBIR hasta el punto de partida.
 *
 * Por qué existe: es un error fácil de cometer y difícil de ver leyendo datos.
 * El Atrio se publicó con tramos separados 432 px cuando el salto sube 92 px,
 * lo que dejaba al jugador encallado en el fondo sin forma de regresar.
 *
 * El truco está en el alcance horizontal. Un salto sube 92 px, pero el tiempo
 * que el personaje pasa POR ENCIMA de una altura h es 2*raiz(v^2-2*g*h)/g:
 * subiendo 80 px eso son 0,32 s, o sea unos 41 px de avance. Por eso los tramos
 * de la ruta de vuelta tienen que solapar en x, no separarse.
 *
 * Uso:  node scripts/verificar-rutas.mjs
 * Sale con código 1 si algún nivel tiene zonas sin retorno.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

// Debe coincidir con src/config/Sacramento.ts
const IMPULSO_SALTO = 430;
const IMPULSO_DOBLE = 360;
const GRAVEDAD = 1000;
const VELOCIDAD = 130;
const DASH_VELOCIDAD = 340;
const DASH_DURACION = 0.16;
const TILE = 16;

const alturaSalto = IMPULSO_SALTO ** 2 / (2 * GRAVEDAD);
/** El doble salto encadena, así que la altura total es mayor que la simple. */
const alturaDoble = alturaSalto + IMPULSO_DOBLE ** 2 / (2 * GRAVEDAD);
const avanceDash = DASH_VELOCIDAD * DASH_DURACION;

/** Tiempo que el Cirujano pasa por encima de la altura h durante un salto. */
function tiempoSobre(h, impulso) {
  const disc = impulso ** 2 - 2 * GRAVEDAD * h;
  return disc < 0 ? 0 : (2 * Math.sqrt(disc)) / GRAVEDAD;
}

/** Avance horizontal disponible para subir dy, con y sin dash. */
function alcanceHorizontal(dy) {
  if (dy <= 0) {
    // Travesía a la misma altura o hacia abajo: salto completo.
    const plano = VELOCIDAD * ((2 * IMPULSO_SALTO) / GRAVEDAD);
    return { sinDash: plano, conDash: plano + avanceDash };
  }

  const simple = VELOCIDAD * tiempoSobre(dy, IMPULSO_SALTO);
  // El doble salto da más tiempo en el aire por encima de esa altura.
  const doble = VELOCIDAD * tiempoSobre(dy - alturaSalto, IMPULSO_DOBLE) + simple;
  const mejor = Math.max(simple, doble);
  return { sinDash: mejor, conDash: mejor + avanceDash };
}

/** Extrae las tuplas [x, y, anchoTiles] del bloque `plataformas` de una escena. */
function leerPlataformas(archivo) {
  const src = readFileSync(join(raiz, archivo), 'utf8');
  const bloque = src.match(/plataformas: \[([\s\S]*?)\n {6}\],/);
  if (!bloque) throw new Error(`No encontré 'plataformas' en ${archivo}`);

  return [...bloque[1].matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(\d+)\s*\]/g)].map((m) => {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const ancho = Number(m[3]) * TILE;
    return { y, izq: x, der: x + ancho };
  });
}

/** Hueco horizontal entre dos tramos (0 si solapan). */
function hueco(a, b) {
  return Math.max(0, b.izq - a.der, a.izq - b.der);
}

/**
 * ¿Se puede saltar de `desde` a `hacia`?
 * Solo se consideran destinos que estén más arriba o al mismo nivel: bajar
 * siempre se puede, lo que hay que garantizar es la vuelta.
 */
function alcanzable(desde, hacia) {
  const dy = desde.y - hacia.y;
  if (dy < 0) return false; // está más abajo: no es parte de la subida
  if (dy > alturaDoble) return false;

  const { conDash } = alcanceHorizontal(dy);
  return hueco(desde, hacia) <= conDash;
}

function verificar(nombre, archivo) {
  const tramos = leerPlataformas(archivo);
  if (tramos.length === 0) {
    console.log(`${nombre}: sin plataformas que verificar`);
    return true;
  }

  // Partimos del tramo más bajo (donde acaba una caída) y subimos.
  const fondo = tramos.reduce((a, b) => (b.y > a.y ? b : a));
  const cima = tramos.reduce((a, b) => (b.y < a.y ? b : a));

  const alcanzados = new Set([tramos.indexOf(fondo)]);
  const cola = [fondo];

  while (cola.length > 0) {
    const actual = cola.pop();
    tramos.forEach((candidato, i) => {
      if (alcanzados.has(i) || !alcanzable(actual, candidato)) return;
      alcanzados.add(i);
      cola.push(candidato);
    });
  }

  const huerfanos = tramos.filter((_, i) => !alcanzados.has(i));
  const llegaArriba = alcanzados.has(tramos.indexOf(cima));

  if (huerfanos.length === 0 && llegaArriba) {
    console.log(`${nombre}: OK — se puede volver a subir desde el fondo`);
    return true;
  }

  console.log(`${nombre}: FALLO`);
  if (!llegaArriba) {
    console.log(`  no se alcanza el tramo más alto (y=${cima.y})`);
  }
  for (const t of huerfanos) {
    console.log(`  inalcanzable desde abajo: y=${t.y} x=${t.izq}..${t.der}`);
  }
  return false;
}

// -- Decorado sin apoyo -------------------------------------------------------

/**
 * Comprueba que ninguna pieza de decorado quede flotando en el aire.
 *
 * Por qué existe: las piezas se colocan a mano por coordenadas, y basta
 * equivocarse de 50 px para plantar una terminal en mitad del hueco entre dos
 * plataformas. En el código no se ve —es una tupla más en una lista de treinta—
 * y en pantalla canta muchísimo. Pasó con una `pantalla` de los Pasillos y dos
 * `conducto` de las Criptas.
 *
 * Se apoyan las que descansan en el suelo; las que cuelgan del techo o van
 * embutidas en el muro se excluyen a propósito.
 */
const COLGANTES = new Set(['exvoto', 'cadena', 'reja', 'ventana', 'durmiente']);

function leerTuplas(src, nombre, patron) {
  const bloque = src.match(new RegExp(`${nombre}: \\[([\\s\\S]*?)\\n {6}\\],`));
  return bloque ? [...bloque[1].matchAll(patron)] : [];
}

function verificarDecorado(nombre, archivo) {
  const src = readFileSync(join(raiz, archivo), 'utf8');

  const plataformas = leerTuplas(src, 'plataformas', /\[\s*(-?\d+),\s*(-?\d+),\s*(\d+)\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), ancho: Number(m[3]) * TILE }),
  );
  const paredes = leerTuplas(src, 'paredes', /\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y0: Number(m[2]), y1: Number(m[3]) }),
  );
  const decorado = leerTuplas(src, 'decorado', /\[\s*(-?\d+),\s*(-?\d+),\s*'([a-z]+)'\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), tipo: m[3] }),
  );

  if (decorado.length === 0) {
    console.log(`${nombre}: sin decorado que verificar`);
    return true;
  }

  const sueltas = decorado.filter((d) => {
    if (COLGANTES.has(d.tipo)) return false;
    const enSuelo = plataformas.some((p) => d.y === p.y && d.x >= p.x && d.x < p.x + p.ancho);
    const enMuro = paredes.some(
      (p) => d.x >= p.x - 8 && d.x <= p.x + TILE + 8 && d.y > p.y0 && d.y <= p.y1,
    );
    return !enSuelo && !enMuro;
  });

  if (sueltas.length === 0) {
    console.log(`${nombre}: OK — las ${decorado.length} piezas de decorado se apoyan en algo`);
    return true;
  }

  console.log(`${nombre}: FALLO — decorado flotando en el aire`);
  for (const d of sueltas) {
    console.log(`  "${d.tipo}" en x=${d.x} y=${d.y}: no hay suelo ni muro ahí`);
  }
  return false;
}

console.log(
  `salto simple ${alturaSalto.toFixed(0)}px · con doble ${alturaDoble.toFixed(0)}px · ` +
    `dash +${avanceDash.toFixed(0)}px`,
);

const zonas = [
  ['Atrio', 'src/scenes/AtrioScene.ts'],
  ['Pasillos', 'src/scenes/PasillosScene.ts'],
  ['Criptas', 'src/scenes/CriptasScene.ts'],
  ['Salas', 'src/scenes/SalasScene.ts'],
];

const resultados = zonas.map(([nombre, archivo]) => verificar(nombre, archivo));

console.log('');
for (const [nombre, archivo] of zonas) {
  resultados.push(verificarDecorado(nombre, archivo));
}

process.exit(resultados.every(Boolean) ? 0 : 1);
