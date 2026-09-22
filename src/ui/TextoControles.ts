/**
 * Texto de la ayuda de controles, en un solo sitio.
 *
 * Lo usan el panel de ayuda del juego (H) y el menu de pausa. Si una tecla
 * cambia en `Controles.ts`, se cambia aqui una vez y las dos pantallas dicen
 * lo mismo. Una ayuda que no coincide con el juego es peor que ninguna.
 *
 * Ninguna linea supera `ANCHO_MAXIMO` caracteres: los paneles reservan dos
 * columnas de 220 px y la fuente monoespaciada de 8 px ocupa unos 6 px por
 * caracter. Mas largo, y una columna pisa a la otra (issue #30).
 */

export const ANCHO_MAXIMO = 34;

/**
 * La misma ayuda, contada para dedos.
 *
 * Un panel que dice "SALTAR ESPACIO" en un telefono es peor que no tener
 * ayuda: nombra teclas que ahi no existen (issue #65). Los glifos son los que
 * llevan escritos los botones en pantalla, para que se encuentren mirando.
 */
export const CONTROLES_MOVIMIENTO_TACTIL: readonly string[] = [
  'MOVER     < >  cruceta izquierda',
  'SALTAR    A',
  '          dos veces: doble salto',
  'DASH      >>  (esquiva)',
  'TREPAR    ^  colgado de un borde',
  'SOLTARSE  v  colgado de un borde',
];

export const CONTROLES_COMBATE_TACTIL: readonly string[] = [
  'GOLPEAR   X',
  '          +^ arriba   +v abajo',
  '          abajo y acertar: rebotas',
  'CARGADO   mantener X  (30 Fervor)',
  'PARRY     P',
  'INJERTAR  F  lanzar un injerto',
  'POCION    Q  (+3 vida)',
  'REZAR     E  junto a un Altar',
  'CODICE    L  leer lo recogido',
];

export const CONTROLES_SISTEMA_TACTIL: readonly string[] = [
  '||        pausa',
  'gira el aparato: es horizontal',
];

export const CONTROLES_MOVIMIENTO: readonly string[] = [
  'MOVER     A D  o flechas',
  'SALTAR    ESPACIO',
  '          dos veces: doble salto',
  'DASH      SHIFT  (esquiva)',
  'TREPAR    W  colgado de un borde',
  'SOLTARSE  S  colgado de un borde',
];

export const CONTROLES_COMBATE: readonly string[] = [
  'GOLPEAR   J  o clic izquierdo',
  '          +W arriba  +S abajo',
  '          abajo y acertar: rebotas',
  'CARGADO   mantener J  (30 Fervor)',
  'PARRY     K  o clic derecho',
  'INJERTAR  F  lanzar un injerto',
  'POCIÓN    Q  (+3 vida)',
  'REZAR     E  junto a un Altar',
  'CÓDICE    L  leer lo recogido',
];

export const CONTROLES_SISTEMA: readonly string[] = [
  'ESC / P   pausa',
  'H         mostrar u ocultar ayuda',
  'M         sonido',
];

// Si alguien alarga una linea, que falle aqui y no en la pantalla del jugador.
for (const linea of [
  ...CONTROLES_MOVIMIENTO,
  ...CONTROLES_COMBATE,
  ...CONTROLES_SISTEMA,
  ...CONTROLES_MOVIMIENTO_TACTIL,
  ...CONTROLES_COMBATE_TACTIL,
  ...CONTROLES_SISTEMA_TACTIL,
]) {
  if (linea.length > ANCHO_MAXIMO) {
    throw new Error(
      `Linea de ayuda demasiado larga (${linea.length} > ${ANCHO_MAXIMO}): "${linea}"`,
    );
  }
}
