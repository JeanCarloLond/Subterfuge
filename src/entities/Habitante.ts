import type Phaser from 'phaser';
import type { ClaseEnemigo } from '../systems/Sonido';

/**
 * Lo que vive en un nivel y no es el Cirujano (issue #90).
 *
 * El Vientre Humedo trae once especies, y casi ninguna es un enemigo: al
 * Mondador no se le debe poder matar, el Cuervo solo mira desde su posadero y
 * la Mata es comida. Si todo entrara en el grupo de enemigos, un tajo al aire
 * mataria al animal sagrado por accidente. Por eso cada criatura dice a que
 * contrato pertenece, y la escena la mete en un grupo distinto segun eso:
 *
 *   - 'hostil':  entra en el ataque, en el injerto y en el dano por contacto.
 *                Ademas cumple `Enemigo` (se registra con setData('enemigo')).
 *   - 'neutral': no recibe el ataque. Si reacciona al Cirujano (huir, picotear
 *                lo que suelta), lo resuelve ella con su propio overlap.
 *   - 'peligro': quieto, hiere al contacto. Si se puede cortar (la Zarza, los
 *                filamentos de la Alfombra), cumple tambien `Enemigo` y la
 *                escena le deja recibir el tajo, pero no el injerto: no se
 *                gasta municion contra una planta.
 *
 * Cada criatura se registra en su sprite con `setData('habitante', this)`.
 */
export type Contrato = 'hostil' | 'neutral' | 'peligro';

export interface Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato: Contrato;
  /** De que esta hecha, para que suene distinto. Ver Sonido.ts. */
  readonly clase: ClaseEnemigo;
  /** false mientras no suponga amenaza: la Alfombra hasta que se la pisa. */
  readonly hiereAlContacto: boolean;
  /** La ficha del Registro que abre al verla. */
  readonly idFicha: string;
  /** Las que no se pueden matar devuelven siempre false. */
  readonly estaMuerto: boolean;

  actualizar(xJugador: number, yJugador: number): void;

  /**
   * El tajo del Cirujano le ha pasado cerca. Solo para neutrales: no reciben
   * dano, pero si se dan cuenta (el Mondador huye, el Cuervo se va).
   */
  alSerAmenazado?(origenX: number): void;
}

/** Recupera el habitante asociado a un sprite, si lo hay. */
export function habitanteDe(objeto: Phaser.GameObjects.GameObject): Habitante | undefined {
  return objeto.getData('habitante') as Habitante | undefined;
}
