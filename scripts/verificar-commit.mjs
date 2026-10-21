/**
 * Comprueba que los commits y los titulos de PR siguen la convencion (#179).
 * Las reglas estan en scripts/convencion.mjs.
 *
 * Uso:
 *   node scripts/verificar-commit.mjs --archivo .git/COMMIT_EDITMSG   (hook commit-msg)
 *   node scripts/verificar-commit.mjs --titulo "✨ feat(juego): ..."   (titulo de una PR)
 *   node scripts/verificar-commit.mjs --rango origen..destino         (commits de una PR)
 *
 * Sale con codigo 1 si algo no la sigue, y dice como se escribe.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ayuda, validarCabecera, validarMensaje } from './convencion.mjs';

const [modo, valor] = process.argv.slice(2);
const fallos = [];

if (modo === '--archivo' && valor) {
  const errores = validarMensaje(readFileSync(valor, 'utf8'));
  if (errores.length) fallos.push({ que: 'Este commit', errores });
} else if (modo === '--titulo') {
  const errores = validarCabecera(valor ?? '');
  if (errores.length) fallos.push({ que: `El título de la PR («${valor ?? ''}»)`, errores });
} else if (modo === '--rango' && valor) {
  // Uno por commit, sin los de fusion: esos los escribe Git.
  const salida = execFileSync('git', ['log', '--no-merges', '--format=%H%x00%B%x01', valor], {
    encoding: 'utf8',
  });
  for (const bloque of salida.split('\x01')) {
    const [hash, mensaje] = bloque.trim().split('\x00');
    if (!hash) continue;
    const errores = validarMensaje(mensaje ?? '');
    if (errores.length) {
      fallos.push({ que: `El commit ${hash.slice(0, 7)} («${mensaje.split('\n')[0]}»)`, errores });
    }
  }
} else {
  console.error('Uso: verificar-commit.mjs --archivo <ruta> | --titulo <texto> | --rango <a..b>');
  process.exit(2);
}

if (fallos.length === 0) {
  console.log('Convención de commits: OK');
  process.exit(0);
}

for (const { que, errores } of fallos) {
  console.error(`\n${que} no sigue la convención:`);
  for (const e of errores) console.error(`  - ${e}`);
}
console.error(`\n${ayuda()}\n`);
process.exit(1);
