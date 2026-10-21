/** A donde va una cura recogida: al cuerpo, al frasco, o a ningun sitio. */
export type DestinoCura = 'vida' | 'frasco' | 'nada';

/**
 * Lo que cura y sobra va al frasco (#174).
 *
 * La vida ya no se repone sola al cambiar de zona, asi que lo que se recoge
 * importa siempre: con el cuerpo herido, la carne cura; con el cuerpo entero,
 * se guarda como una carga de la Pocion de Carne para la zona siguiente. Solo
 * se pierde con todo lleno.
 */
export function destinoDeCura(
  vida: number,
  vidaMaxima: number,
  cargas: number,
  cargasMaximas: number,
): DestinoCura {
  if (vida < vidaMaxima) return 'vida';
  if (cargas < cargasMaximas) return 'frasco';
  return 'nada';
}
