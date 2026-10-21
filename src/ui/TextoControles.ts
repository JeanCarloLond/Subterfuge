import { mando } from '../input/Mando';
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
  'POCIÓN    Q  (+3 vida)',
  'REZAR     E  junto a un Altar',
  'CÓDICE    L  leer lo recogido',
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

/**
 * Con mando (#152). Los nombres son los del mando de Xbox, que es el que
 * imprime la mayoria de los genericos; en uno de PlayStation, A es la cruz.
 */
export const CONTROLES_MOVIMIENTO_MANDO: readonly string[] = [
  'MOVER     stick o cruceta',
  'SALTAR    A',
  '          dos veces: doble salto',
  'DASH      B  (esquiva)',
  'TREPAR    arriba, colgado',
  'SOLTARSE  abajo, colgado',
];

export const CONTROLES_COMBATE_MANDO: readonly string[] = [
  'GOLPEAR   X',
  '          +arriba   +abajo',
  '          abajo y acertar: rebotas',
  'CARGADO   mantener X  (30 Fervor)',
  'PARRY     LB',
  'INJERTAR  RB  lanzar un injerto',
  'POCIÓN    LT o RT  (+3 vida)',
  'REZAR     Y  junto a un Altar',
  'CÓDICE    SELECT  leer lo recogido',
];

export const CONTROLES_SISTEMA_MANDO: readonly string[] = ['START     pausa'];

/** La ayuda que toca: la del mando si hay uno, la de los dedos o la del teclado. */
/**
 * La columna de combate sin bisturi (#160): sin golpear, sin cargado y sin el
 * rebote, que son del filo; y el parry pasa a llamarse por lo que es, un
 * empujon con el antebrazo. No se dice "bloqueado": simplemente no esta.
 */
function sinBisturi(lineas: readonly string[]): string[] {
  const quedan: string[] = [];
  let delFilo = false;
  for (const linea of lineas) {
    // Las lineas que empiezan por espacio continuan la de arriba.
    if (!linea.startsWith(' ')) delFilo = /^(GOLPEAR|CARGADO)\b/.test(linea);
    if (delFilo) continue;
    quedan.push(linea.replace(/^PARRY {5}/, 'EMPUJAR   '));
  }
  return quedan;
}

export function ayudaDeControles(
  conDedos: boolean,
  armado = true,
  injertadora = true,
): {
  movimiento: readonly string[];
  combate: readonly string[];
  sistema: readonly string[];
} {
  const ayuda = mando.conectado
    ? {
        movimiento: CONTROLES_MOVIMIENTO_MANDO,
        combate: CONTROLES_COMBATE_MANDO,
        sistema: CONTROLES_SISTEMA_MANDO,
      }
    : conDedos
      ? {
          movimiento: CONTROLES_MOVIMIENTO_TACTIL,
          combate: CONTROLES_COMBATE_TACTIL,
          sistema: CONTROLES_SISTEMA_TACTIL,
        }
      : {
          movimiento: CONTROLES_MOVIMIENTO,
          combate: CONTROLES_COMBATE,
          sistema: CONTROLES_SISTEMA,
        };
  let combate: readonly string[] = armado ? ayuda.combate : sinBisturi(ayuda.combate);
  // La Injertadora se gana al vencer al primer jefe (#178): antes no existe.
  if (!injertadora) combate = combate.filter((linea) => !linea.startsWith('INJERTAR'));
  return { ...ayuda, combate };
}

// Si alguien alarga una linea, que falle aqui y no en la pantalla del jugador.
for (const linea of [
  ...CONTROLES_MOVIMIENTO,
  ...CONTROLES_COMBATE,
  ...CONTROLES_SISTEMA,
  ...CONTROLES_MOVIMIENTO_TACTIL,
  ...CONTROLES_COMBATE_TACTIL,
  ...CONTROLES_SISTEMA_TACTIL,
  ...CONTROLES_MOVIMIENTO_MANDO,
  ...CONTROLES_COMBATE_MANDO,
  ...CONTROLES_SISTEMA_MANDO,
]) {
  if (linea.length > ANCHO_MAXIMO) {
    throw new Error(
      `Linea de ayuda demasiado larga (${linea.length} > ${ANCHO_MAXIMO}): "${linea}"`,
    );
  }
}
