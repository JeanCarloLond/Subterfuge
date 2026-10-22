/**
 * La silleria de Subterfuge Sigma: la piedra que se pisa, como la de
 * Blasphemous. Lo que la hace leerse no es el sillar, es la LUZ: la cara de
 * arriba (la que se pisa) clara, los cantos con bisel y el interior en sombra.
 *
 * Una baldosa de 16x16 por cada combinacion de lados al aire (columna = la
 * mascara: 1 arriba, 2 derecha, 4 abajo, 8 izquierda) y cuatro variantes por
 * fila, para que no se repita. La sala la viste al cargar segun sus vecinas
 * (sigma/scripts/silleria.gd): el mapa pintado no cambia.
 *
 * Una de cada cuatro variantes lleva vetas de carne en las juntas: los dioses
 * son el templo.
 *
 * Sale a `sigma/arte/silleria/sigma.png` (256x64) y reescribe `vientre.tres` (el
 * TileSet de todas las salas, con su colision) para que apunte a ella. Uso:
 * npm run sigma:silleria
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { png } from './cirujano-sigma.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'sigma/arte/silleria');

const T = 16;
const VARIANTES = 4;
const hx = (c) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
  255,
];

const C = {
  junta: hx('#221a1b'),
  sombra: hx('#2e2425'),
  base: hx('#43363a'),
  medio: hx('#4f4144'),
  luz: hx('#66544f'),
  cara: hx('#8a7468'),
  brillo: hx('#a89082'),
  canto: hx('#5a4a46'),
  carne: hx('#6e2420'),
  carneLuz: hx('#9a3a30'),
};
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Un azar fijo por baldosa: cada variante sale siempre igual. */
function azar(semilla) {
  let s = (semilla * 2654435761) % 4294967296;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** El sillar de dentro: dos hiladas de bloques desfasadas, con juntas. */
function sillar(variante) {
  const r = azar(variante + 7);
  const px = Array.from({ length: T }, () => new Array(T).fill(C.base));
  const corteArriba = 3 + Math.floor(r() * 9);
  const corteAbajo = (corteArriba + 8) % 16;
  for (let y = 0; y < T; y += 1) {
    for (let x = 0; x < T; x += 1) {
      const hilada = y < 8 ? 0 : 1;
      const corte = hilada === 0 ? corteArriba : corteAbajo;
      const junta = y === 7 || y === 15 || x === corte;
      // Cada bloque con un tono algo distinto y un poco de grano tramado.
      const bloque = hilada * 2 + (x < corte ? 0 : 1);
      const tono = [C.base, C.medio, C.base, C.sombra][(bloque + variante) % 4];
      let color = tono;
      if ((BAYER[y % 4][x % 4] + r() * 4) / 20 > 0.86) color = C.sombra;
      // La luz de arriba de cada bloque y la sombra de debajo: volumen.
      if (y === 0 || y === 8) color = C.luz;
      if (y === 6 || y === 14) color = C.sombra;
      px[y][x] = junta ? C.junta : color;
    }
  }
  // Vetas de carne en las juntas, en una de cada cuatro.
  if (variante === 3) {
    for (let x = 2; x < 13; x += 1) px[7][x] = x % 3 === 0 ? C.carneLuz : C.carne;
    px[8][5] = C.carne;
    px[6][9] = C.carne;
  }
  return px;
}

/** La baldosa para una mascara de lados al aire. */
function baldosa(mascara, variante) {
  const px = sillar(variante);
  const arriba = mascara & 1;
  const derecha = mascara & 2;
  const abajo = mascara & 4;
  const izquierda = mascara & 8;
  if (arriba) {
    // La cara que se pisa: una losa clara de 4 px con su brillo y su bisel.
    for (let x = 0; x < T; x += 1) {
      px[0][x] = x % 5 === 2 ? C.brillo : C.cara;
      px[1][x] = C.cara;
      px[2][x] = BAYER[2][x % 4] > 9 ? C.luz : C.cara;
      px[3][x] = C.canto;
      px[4][x] = C.junta;
    }
  }
  if (izquierda) {
    for (let y = arriba ? 1 : 0; y < T; y += 1) {
      px[y][0] = C.luz;
      px[y][1] = y % 8 === 7 ? C.junta : C.canto;
    }
  }
  if (derecha) {
    for (let y = arriba ? 1 : 0; y < T; y += 1) {
      px[y][T - 1] = C.junta;
      px[y][T - 2] = C.sombra;
    }
  }
  if (abajo) {
    for (let x = 0; x < T; x += 1) {
      px[T - 1][x] = C.junta;
      px[T - 2][x] = C.sombra;
    }
  }
  // Las esquinas de arriba se redondean un pixel: la piedra esta gastada.
  if (arriba && izquierda) px[0][0] = [0, 0, 0, 0];
  if (arriba && derecha) px[0][T - 1] = [0, 0, 0, 0];
  return px;
}

function tileset(textura) {
  const lineas = [
    '[gd_resource type="TileSet" format=3]',
    '',
    `[ext_resource type="Texture2D" path="${textura}" id="1_silleria"]`,
    '',
    '[sub_resource type="TileSetAtlasSource" id="TileSetAtlasSource_silleria"]',
    'texture = ExtResource("1_silleria")',
  ];
  for (let v = 0; v < VARIANTES; v += 1) {
    for (let m = 0; m < 16; m += 1) {
      lineas.push(`${m}:${v}/0 = 0`);
      lineas.push(
        `${m}:${v}/0/physics_layer_0/polygon_0/points = PackedVector2Array(-8, -8, 8, -8, 8, 8, -8, 8)`,
      );
    }
  }
  lineas.push(
    '',
    '[resource]',
    'physics_layer_0/collision_layer = 1',
    'sources/0 = SubResource("TileSetAtlasSource_silleria")',
    '',
  );
  return lineas.join('\n');
}

const esPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (esPrincipal) {
  const img = Array.from({ length: T * VARIANTES }, () => new Array(T * 16).fill([0, 0, 0, 0]));
  for (let v = 0; v < VARIANTES; v += 1) {
    for (let m = 0; m < 16; m += 1) {
      const b = baldosa(m, v);
      for (let y = 0; y < T; y += 1)
        for (let x = 0; x < T; x += 1) img[v * T + y][m * T + x] = b[y][x];
    }
  }
  writeFileSync(join(destino, 'sigma.png'), png(img));
  writeFileSync(join(destino, 'vientre.tres'), tileset('res://arte/silleria/sigma.png'));
  console.log(`${16 * VARIANTES} baldosas -> sigma/arte/silleria/sigma.png y vientre.tres`);
}
