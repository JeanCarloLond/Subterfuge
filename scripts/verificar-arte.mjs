/**
 * Comprueba que las figuras de ArteProvisional.ts sean rectangulares.
 *
 * Por qué existe: el arte provisional se escribe como filas de caracteres, y
 * una sola fila con un carácter de más o de menos desplaza todo el dibujo a
 * partir de ahí. Es invisible leyendo el código y evidente en pantalla, así que
 * conviene que salte en CI y no en la partida de alguien.
 *
 * Uso:  node scripts/verificar-arte.mjs
 * Sale con código 1 si alguna figura está descuadrada.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const archivo = 'src/systems/ArteProvisional.ts';
const src = readFileSync(join(raiz, archivo), 'utf8');

const figuras = [...src.matchAll(/const (\w+): Figura = \{[\s\S]*?filas: \[([^\]]*)\]/g)];

if (figuras.length === 0) {
  console.error(`No encontré ninguna figura en ${archivo}.`);
  console.error('Si el arte definitivo ya entró y el archivo se borró, quita este script del CI.');
  process.exit(1);
}

let fallos = 0;

for (const [, nombre, bloque] of figuras) {
  const filas = [...bloque.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  const anchos = [...new Set(filas.map((f) => f.length))];

  if (anchos.length === 1) {
    console.log(`${nombre}: OK — ${filas.length} filas de ${anchos[0]} px`);
    continue;
  }

  fallos += 1;
  const esperado = anchos.sort(
    (a, b) =>
      filas.filter((f) => f.length === b).length - filas.filter((f) => f.length === a).length,
  )[0];
  console.log(`${nombre}: FALLO — anchos mezclados (${anchos.join(', ')})`);

  filas.forEach((fila, i) => {
    if (fila.length !== esperado) {
      console.log(`  fila ${i}: mide ${fila.length}, se esperaban ${esperado}  '${fila}'`);
    }
  });
}

process.exit(fallos === 0 ? 0 : 1);
