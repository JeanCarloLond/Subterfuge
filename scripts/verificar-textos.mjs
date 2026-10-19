/**
 * Revisa los textos que se ven en pantalla, en el juego y en la web (#122).
 *
 * Tres reglas del proyecto que ningun linter mira:
 *
 * 1. Lexico. En textos visibles no se dice "checkpoint", "mana", "HP",
 *    "stamina", "boss" ni "NPC": el mundo tiene sus palabras (Altar, Fervor,
 *    Pocion de Carne, Reformado...). Esto FALLA.
 * 2. Tildes. Desde #58 el texto visible va en español correcto. Hay palabras
 *    que sin tilde no existen ("aqui", "todavia", "codice"...): si aparecen
 *    en una cadena, alguien se la dejo. Esto FALLA.
 * 3. Los dioses no miran. Una frase que junta a los dioses con mirar o ver
 *    puede estar bien ("los dioses no miran, son mirados"), asi que no falla:
 *    se lista para que una persona la lea.
 *
 * Solo mira cadenas entre comillas o acentos graves, y nunca comentarios.
 * Los identificadores van sin tildes a proposito y no son texto visible.
 *
 * Uso:  node scripts/verificar-textos.mjs
 * Sale con codigo 1 si falla el lexico o las tildes.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Donde vive el texto que lee el jugador o el visitante. */
const CARPETAS = ['src/lore', 'src/ui', 'src/scenes', 'src/entities', 'web/src'];

const LEXICO = /\b(checkpoint|mana|hp|stamina|boss|npc)\b/i;

/** Palabras que sin tilde no son español. Se buscan como palabra entera. */
const SIN_TILDE = [
  'aqui',
  'alli',
  'ahi',
  'tambien',
  'despues',
  'ultimo',
  'ultima',
  'todavia',
  'codice',
  'pocion',
  'diocesis',
  'traido',
  'volveras',
  'veras',
  'caeras',
  'jamas',
  'quizas',
  'ningun',
  'algun',
  'dia',
  'dias',
  'facil',
  'dificil',
];
const RE_TILDE = new RegExp(`\\b(${SIN_TILDE.join('|')})\\b`, 'i');

const DIOSES = /\b(dios|dioses|primigenio|primigenios|los mil)\b/i;
const MIRAR = /\b(mir\w*|ve|ven|vio|vieron|observ\w*)\b/i;

function archivos(carpeta) {
  const lista = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) lista.push(...archivos(ruta));
    else if (/\.(ts|mjs|js)$/.test(nombre) && !nombre.endsWith('.d.ts')) lista.push(ruta);
  }
  return lista;
}

/** Las cadenas de una linea de codigo, sin la parte que es comentario. */
function cadenas(linea) {
  const recortada = linea.trim();
  if (recortada.startsWith('//') || recortada.startsWith('*') || recortada.startsWith('/*')) {
    return [];
  }
  return [...linea.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`]*)`/g)].map((m) => m[1] ?? m[2]);
}

/** Lo que no es texto: claves, rutas, selectores, colores, CSS. */
function esTexto(cadena) {
  if (!/\s/.test(cadena)) return false;
  if (/^[#./]|=>|\$\{[^}]*\}$|^[a-z-]+:\s/.test(cadena)) return false;
  return /[a-záéíóúñ]{3}/i.test(cadena);
}

let fallos = 0;
const dudosas = [];

for (const carpeta of CARPETAS) {
  for (const archivo of archivos(join(raiz, carpeta))) {
    const lineas = readFileSync(archivo, 'utf8').split('\n');
    lineas.forEach((linea, i) => {
      for (const cadena of cadenas(linea)) {
        // En el HTML de la web, quitar las etiquetas antes de leer.
        // Y quitar las ${...}: son codigo (CODICE.length), no texto.
        const texto = cadena.replace(/<[^>]+>/g, ' ').replace(/\$\{[^}]*\}/g, ' ');
        if (!esTexto(texto)) continue;
        const donde = `${relative(raiz, archivo)}:${i + 1}`;

        const palabra = texto.match(LEXICO);
        if (palabra) {
          fallos += 1;
          console.log(`LEXICO  ${donde}  «${palabra[1]}» en: ${texto.trim().slice(0, 90)}`);
        }
        const tilde = texto.match(RE_TILDE);
        if (tilde) {
          fallos += 1;
          console.log(`TILDE   ${donde}  «${tilde[1]}» en: ${texto.trim().slice(0, 90)}`);
        }
        if (DIOSES.test(texto) && MIRAR.test(texto)) {
          dudosas.push(`${donde}  ${texto.trim().slice(0, 100)}`);
        }
      }
    });
  }
}

if (dudosas.length) {
  console.log(`\nPara leer (dioses y mirar en la misma frase; no falla): ${dudosas.length}`);
  for (const d of dudosas) console.log(`  ${d}`);
}

console.log(fallos ? `\nTextos: FALLO — ${fallos}` : '\nTextos: OK — léxico y tildes');
process.exit(fallos ? 1 : 0);
