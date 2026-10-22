/**
 * Pasa el arte del juego a Subterfuge Sigma (#184).
 *
 * - Las figuras provisionales de `src/systems/ArteProvisional.ts` (pixel art
 *   escrito a mano, caracter a caracter) salen como PNG a
 *   `sigma/arte/provisional/<clave>.png`, una por clave de textura.
 * - La silleria del equipo (`public/assets/tilesets/`) se copia a
 *   `sigma/arte/silleria/`.
 *
 * Los PNG se suben al repo: Godot los necesita para importar, tambien en el
 * CI. Cuando llegue el arte de Mariana, sus PNG sustituyen a estos con el
 * mismo nombre y nada mas cambia.
 *
 * Uso:  npm run sigma:arte
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerArteProvisional } from './leer-arte.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/provisional');
const silleria = join(raiz, 'sigma/arte/silleria');

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(datos) {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

/** Un PNG RGBA de 8 bits a partir de la rejilla de caracteres y su paleta. */
function png({ paleta, filas }) {
  const ancho = filas[0].length;
  const alto = filas.length;
  const crudo = Buffer.alloc(alto * (1 + ancho * 4));
  filas.forEach((fila, y) => {
    const inicio = y * (1 + ancho * 4);
    crudo[inicio] = 0; // sin filtro
    [...fila].forEach((caracter, x) => {
      const color = paleta[caracter];
      if (!color) return; // '.' y lo que no esta en la paleta: transparente
      const p = inicio + 1 + x * 4;
      crudo[p] = parseInt(color.slice(1, 3), 16);
      crudo[p + 1] = parseInt(color.slice(3, 5), 16);
      crudo[p + 2] = parseInt(color.slice(5, 7), 16);
      crudo[p + 3] = 255;
    });
  });

  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0);
  cabecera.writeUInt32BE(alto, 4);
  cabecera[8] = 8; // bits por canal
  cabecera[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(destino, { recursive: true });
const figuras = leerArteProvisional();
for (const [clave, figura] of Object.entries(figuras)) {
  writeFileSync(join(destino, `${clave}.png`), png(figura));
}

mkdirSync(silleria, { recursive: true });
for (const hoja of ['vientre.png', 'vientre-grietas.png', 'vientre-musgo.png']) {
  copyFileSync(join(raiz, 'public/assets/tilesets', hoja), join(silleria, hoja));
}

console.log(`Sigma: ${Object.keys(figuras).length} figuras y 3 hojas de silleria`);
