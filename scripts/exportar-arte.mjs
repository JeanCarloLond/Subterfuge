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

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { leerArteProvisional } from './leer-arte.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapa = leerArteProvisional();

const destino = join(raiz, 'web/generado');
mkdirSync(destino, { recursive: true });
writeFileSync(join(destino, 'arte.json'), JSON.stringify(mapa));
console.log(`arte.json: ${Object.keys(mapa).length} figuras exportadas`);
