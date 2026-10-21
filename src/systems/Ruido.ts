/** Algo con posicion: quien hace el ruido o quien lo oye. */
interface Punto {
  x: number;
  y: number;
}

/**
 * Mas desnivel que esto y el suelo de por medio se traga el ruido (px). Es
 * algo menos que lo que separa dos repisas: el vendado de abajo no oye al que
 * anda por la de arriba.
 */
export const DESNIVEL_MAXIMO = 80;

/**
 * Si un ruido llega a quien escucha (#165). Lo usa la escena con los Devotos
 * vendados: el radio lo pone lo que suena (RUIDO en config/Sacramento.ts).
 */
export function seOye(origen: Punto, oyente: Punto, radio: number): boolean {
  if (Math.abs(origen.y - oyente.y) > DESNIVEL_MAXIMO) return false;
  return Math.hypot(origen.x - oyente.x, origen.y - oyente.y) <= radio;
}
