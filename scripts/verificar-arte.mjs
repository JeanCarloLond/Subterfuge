/**
 * Comprueba el arte que ningún linter puede mirar. Son dos cosas:
 *
 * 1. Que las figuras de ArteProvisional.ts sean rectangulares. El arte
 *    provisional se escribe como filas de caracteres, y una sola fila con un
 *    carácter de más o de menos desplaza todo el dibujo a partir de ahí.
 *
 * 2. Que los tilesets de public/assets/tilesets/ se dividan en un número entero
 *    de fotogramas del tamaño que declara PreloadScene. Si no cuadra, Phaser no
 *    protesta: recorta los fotogramas donde le parece y la pared sale partida en
 *    mitad de un ladrillo. Pasó una vez al cambiar el tamaño de celda en el
 *    generador sin tocar el cargador, y es invisible leyendo el código.
 *
 * Las dos son errores evidentes en pantalla e imposibles de ver en un diff, así
 * que conviene que salten en CI y no en la partida de alguien.
 *
 * Uso:  node scripts/verificar-arte.mjs
 * Sale con código 1 si algo no cuadra.
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

// -- Tilesets contra lo que declara el cargador -------------------------------

/** Ancho y alto de un PNG: están en el IHDR, justo detrás de la cabecera. */
function medirPng(ruta) {
  const buf = readFileSync(ruta);
  return { ancho: buf.readUInt32BE(16), alto: buf.readUInt32BE(20) };
}

const preload = readFileSync(join(raiz, 'src/scenes/PreloadScene.ts'), 'utf8');
const hojas = [
  ...preload.matchAll(
    /this\.load\.spritesheet\(\s*'([^']+)',\s*'([^']+)',\s*\{\s*frameWidth:\s*(\d+),\s*frameHeight:\s*(\d+),?\s*\}/g,
  ),
];

if (hojas.length === 0) {
  console.log('\nsin tilesets declarados en PreloadScene');
} else {
  console.log('');
}

for (const [, clave, ruta, ancho, alto] of hojas) {
  const archivoPng = join(raiz, 'public', ruta);
  let medida;

  try {
    medida = medirPng(archivoPng);
  } catch {
    fallos += 1;
    console.log(`${clave}: FALLO — falta public/${ruta}`);
    console.log('  ¿has ejecutado "node scripts/generar-tileset.mjs"?');
    continue;
  }

  const fw = Number(ancho);
  const fh = Number(alto);
  const sobraX = medida.ancho % fw;
  const sobraY = medida.alto % fh;

  if (sobraX === 0 && sobraY === 0) {
    const cuantos = (medida.ancho / fw) * (medida.alto / fh);
    console.log(`${clave}: OK — ${cuantos} fotogramas de ${fw}x${fh}`);
    continue;
  }

  fallos += 1;
  console.log(`${clave}: FALLO — ${ruta} mide ${medida.ancho}x${medida.alto},`);
  console.log(`  que no se divide en fotogramas de ${fw}x${fh} (sobran ${sobraX}x${sobraY} px)`);
}

process.exit(fallos === 0 ? 0 : 1);
