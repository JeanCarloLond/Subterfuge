/**
 * Un PR que cambia lógica tiene que traer sus tests.
 *
 * Mira qué archivos cambia el PR respecto a su base. Si toca lógica que se
 * puede probar sin navegador —los sistemas, la entrada y los módulos del
 * portal— y no toca nada en `tests/`, falla y dice qué hacer.
 *
 * No cuenta lo que hoy no se puede probar con un test unitario: las escenas y
 * las entidades (necesitan Phaser y se prueban jugando y con
 * `npm run probar-tactil`), el arte, los textos del lore ni la configuración
 * de balance.
 *
 * Hay cambios legítimos sin test (un refactor que no cambia nada, un
 * comentario). Para esos, la etiqueta `sin-tests` en el PR, con el motivo en
 * la descripción, deja pasar: el CI la lee y pone SIN_TESTS=1.
 *
 * Uso:   node scripts/exigir-tests.mjs <base>
 *        (en el CI, <base> es el commit de la rama destino del PR)
 */

import { execFileSync } from 'node:child_process';

const base = process.argv[2] ?? process.env.BASE_SHA;
if (!base) {
  console.error('Falta la base con la que comparar: node scripts/exigir-tests.mjs <commit>');
  process.exit(2);
}

/** Lógica que se puede (y se debe) cubrir con tests unitarios. */
const LOGICA = [
  /^src\/systems\/.+\.ts$/,
  /^src\/input\/.+\.ts$/,
  // Los módulos del portal, no sus páginas (que son marcado y se prueban viéndolas).
  /^web\/src\/[^/]+\.ts$/,
];
/** Generados o puro dibujo: no se les pide test. */
const EXENTOS = [
  /^src\/systems\/(ArteProvisional|RetratosProvisionales|CinematicaProvisional)\.ts$/,
];

const cambiados = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=AMR', `${base}...HEAD`],
  {
    encoding: 'utf8',
  },
)
  .split('\n')
  .map((linea) => linea.trim())
  .filter(Boolean);

const logica = cambiados.filter(
  (ruta) =>
    LOGICA.some((patron) => patron.test(ruta)) && !EXENTOS.some((patron) => patron.test(ruta)),
);
const tests = cambiados.filter((ruta) => ruta.startsWith('tests/'));

if (logica.length === 0) {
  console.log('Este PR no cambia lógica con tests unitarios. Nada que exigir.');
  process.exit(0);
}

if (tests.length > 0) {
  console.log(`Cambia lógica (${logica.length} archivos) y trae tests (${tests.length}). Bien.`);
  process.exit(0);
}

if (process.env.SIN_TESTS === '1') {
  console.log('Cambia lógica sin tests, pero lleva la etiqueta `sin-tests`. Pasa.');
  for (const ruta of logica) console.log(`  · ${ruta}`);
  process.exit(0);
}

console.error('Este PR cambia lógica y no añade ni modifica ningún test:\n');
for (const ruta of logica) console.error(`  · ${ruta}`);
console.error(`
Añade o actualiza un test en tests/ que pruebe lo que has cambiado
(mira tests/guardado.test.ts como ejemplo) y comprueba con:

    npm test

Si de verdad no hace falta (un refactor que no cambia nada, un comentario),
pon la etiqueta \`sin-tests\` en el PR y explica el motivo en la descripción.`);
process.exit(1);
