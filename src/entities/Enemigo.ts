import type Phaser from 'phaser';

/**
 * Lo minimo que la escena necesita de un enemigo para resolver un golpe.
 *
 * Devoto, Vestal y Reformado lo cumplen, asi que `EscenaNivel` no tiene que
 * saber con cual esta tratando: registra un solo overlap contra el grupo de
 * enemigos y despacha por aqui. Anadir un enemigo nuevo no obliga a tocar la
 * escena.
 *
 * Cada uno se registra en su sprite con `setData('enemigo', this)`.
 */
export interface Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly estaMuerto: boolean;
  /** false mientras no suponga amenaza (el jefe dormido, por ejemplo). */
  readonly hiereAlContacto: boolean;

  /** @returns true si el golpe conecto. */
  recibirDano(cantidad: number, origenX: number): boolean;
}

/** Recupera el enemigo asociado a un sprite, si lo hay. */
export function enemigoDe(objeto: Phaser.GameObjects.GameObject): Enemigo | undefined {
  return objeto.getData('enemigo') as Enemigo | undefined;
}
