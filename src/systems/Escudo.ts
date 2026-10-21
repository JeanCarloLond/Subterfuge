/**
 * El escudo de autoclave del guardia de la Cruzada (#166), sin Phaser.
 *
 * Para de frente lo que entra de frente: el tajo, el injerto, un sello
 * devuelto. No para lo que viene por detras ni desde arriba (el golpe hacia
 * abajo, el rebote), y no para nada con la guardia baja: aturdido tras un
 * parry, el escudo cuelga.
 */

/** Margen (px) por el que un golpe casi encima aun cuenta como de frente. */
const MARGEN_FRENTE = 4;

export function cubreEscudo(
  guardiaX: number,
  haciaDerecha: boolean,
  origenX: number,
  desdeArriba: boolean,
  guardiaBaja: boolean,
): boolean {
  if (guardiaBaja || desdeArriba) return false;
  const delante = (origenX - guardiaX) * (haciaDerecha ? 1 : -1);
  return delante >= -MARGEN_FRENTE;
}
