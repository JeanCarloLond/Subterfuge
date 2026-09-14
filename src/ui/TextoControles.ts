/**
 * Texto de la ayuda de controles, en un solo sitio.
 *
 * Lo usan el panel de ayuda del juego (H) y el menu de pausa. Si una tecla
 * cambia en `Controles.ts`, se cambia aqui una vez y las dos pantallas dicen
 * lo mismo. Una ayuda que no coincide con el juego es peor que ninguna.
 */

export const CONTROLES_MOVIMIENTO: readonly string[] = [
  'MOVER      A D  o flechas',
  'SALTAR     ESPACIO',
  '           dos veces: doble salto',
  'DASH       SHIFT   (esquiva)',
  'TREPAR     W  colgado de un borde',
  'SOLTARSE   S  colgado de un borde',
];

export const CONTROLES_COMBATE: readonly string[] = [
  'GOLPEAR    J  o clic izquierdo',
  '           + W arriba, + S abajo (en el aire)',
  '           abajo y acertar: rebotas',
  'CARGADO    mantener y soltar (30 Fervor)',
  'PARRY      K  o clic derecho',
  'POCION     Q',
  'REZAR      E  junto a un Altar',
  'CODICE     L  leer lo recogido',
];

export const CONTROLES_SISTEMA: readonly string[] = [
  'ESC / P    pausa',
  'H          mostrar u ocultar la ayuda',
  'M          sonido',
];
