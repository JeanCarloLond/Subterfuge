/**
 * Lee el arte provisional de `src/systems/ArteProvisional.ts` sin Phaser: las
 * figuras (mapa de caracteres + paleta) y sus poses, por la clave de textura
 * con la que las usa el juego. Lo usan la web (`exportar-arte.mjs`) y Sigma
 * (`arte-sigma.mjs`), para que las dos lean exactamente lo mismo.
 */

import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Las filas de un bloque `filas: [ ... ]`. Son una expresion JS pura (cadenas,
 * `Array(n).fill(...)`, algun `.slice` o `.map`), asi que se evaluan tal cual
 * en un contexto aislado, quitando antes los tipos de TypeScript. Leerlas con
 * expresiones regulares perdia filas: la columna salia con el fuste de una
 * sola fila, y la cadena con eslabones de mas.
 */
function leerFilas(bloque) {
  const expresion = `[${bloque.replace(/Array<string>/g, 'Array')}]`;
  return runInNewContext(expresion, {}, { timeout: 100 });
}

/**
 * @returns {Record<string, { paleta: Record<string, string>, filas: string[] }>}
 *   clave de textura -> figura, con los colores como `#rrggbb` y `.` transparente.
 */
export function leerArteProvisional() {
  const fuente = readFileSync(join(raiz, 'src/systems/ArteProvisional.ts'), 'utf8');
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

  // Las poses de ataque (issue #146) no repiten la figura: son su base con
  // algunas filas reescritas, `const X = pose(BASE, { 9: '...', ... });`.
  const patronPose = /const (\w+) = pose\((\w+), \{([\s\S]*?)\}\);/g;
  for (const m of fuente.matchAll(patronPose)) {
    const [, nombre, base, cambiosSrc] = m;
    if (!figuras[base]) throw new Error(`La pose ${nombre} parte de ${base}, que no se pudo leer`);
    const filas = [...figuras[base].filas];
    for (const c of cambiosSrc.matchAll(/(\d+): '([^']*)'/g)) filas[Number(c[1])] = c[2];
    figuras[nombre] = { paleta: figuras[base].paleta, filas };
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
  return mapa;
}
