/**
 * Exporta el arte provisional del juego a JSON para la web de la Diócesis.
 *
 * Por qué existe: las láminas del Registro en la web son los mismos sprites
 * que el jugador ve moverse, y la única fuente de esos sprites es
 * `src/systems/ArteProvisional.ts`. Ese archivo depende de Phaser, así que la
 * web no puede importarlo; en su lugar se leen las figuras del código fuente
 * (mapa de caracteres + paleta) y se escriben a `web/generado/arte.json`.
 *
 * Se ejecuta antes de `vite` (ver package.json). El JSON no se versiona.
 *
 * Uso:  node scripts/exportar-arte.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = readFileSync(join(raiz, 'src/systems/ArteProvisional.ts'), 'utf8');

/** Lee las filas de un bloque `filas: [ ... ]`, expandiendo los `Array(n).fill`. */
function leerFilas(bloque) {
  const filas = [];
  const patron = /\.\.\.Array(?:<string>)?\((\d+)\)\.fill\('([^']*)'\)|'([^']*)'/g;
  for (const m of bloque.matchAll(patron)) {
    if (m[1] !== undefined) {
      for (let i = 0; i < Number(m[1]); i += 1) filas.push(m[2]);
    } else {
      filas.push(m[3]);
    }
  }
  return filas;
}

const figuras = {};
const patronFigura =
  /const (\w+): Figura = \{\s*paleta: \{([\s\S]*?)\},\s*(?:\/\/ prettier-ignore\s*)?filas: \[([\s\S]*?)\],\s*\};/g;

for (const m of fuente.matchAll(patronFigura)) {
  const [, nombre, paletaSrc, filasSrc] = m;
  const paleta = {};
  for (const p of paletaSrc.matchAll(/(\w): (0x[0-9a-fA-F]{6})/g)) {
    paleta[p[1]] = `#${p[2].slice(2)}`;
  }
  figuras[nombre] = { paleta, filas: leerFilas(filasSrc) };
}

// El mapa de claves de textura -> figura, tal como lo usa el juego.
const mapa = {};
const bloqueMapa = fuente.match(/const FIGURAS: Record<string, Figura> = \{([\s\S]*?)\n\};/);
if (!bloqueMapa) throw new Error('No encontré el mapa FIGURAS en ArteProvisional.ts');
for (const m of bloqueMapa[1].matchAll(/^\s*'?([\w-]+)'?: (\w+),/gm)) {
  const [, clave, nombre] = m;
  if (!figuras[nombre]) throw new Error(`La figura ${nombre} (clave ${clave}) no se pudo leer`);
  mapa[clave] = figuras[nombre];
}

const destino = join(raiz, 'web/generado');
mkdirSync(destino, { recursive: true });
writeFileSync(join(destino, 'arte.json'), JSON.stringify(mapa));
console.log(`arte.json: ${Object.keys(mapa).length} figuras exportadas`);
