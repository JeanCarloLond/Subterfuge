import Phaser from 'phaser';
import type { TipoReliquia } from '../systems/Progreso';

/** Nombre en el mundo y efecto, por tipo. */
export const RELIQUIAS: Record<TipoReliquia, { nombre: string; efecto: string; textura: string }> =
  {
    relicario: {
      nombre: 'Relicario de Carne',
      efecto: 'vida maxima +1  ·  te cura',
      textura: 'relicario-placeholder',
    },
    frasco: {
      nombre: 'Frasco Consagrado',
      efecto: 'Pocion de Carne +1  ·  te cura  ·  Q para beber',
      textura: 'frasco-placeholder',
    },
  };

/**
 * Reliquia: mejora permanente escondida en una ruta opcional.
 *
 * Recogerla tambien CURA. Sin eso, el jugador que la coge con la vida baja
 * —que es justo cuando mas la busca— ve subir el maximo y no la barra, y cree
 * que no ha servido para nada (issue #25).
 *
 * Es el incentivo de explorar. A diferencia del Codice, que premia con lore,
 * la reliquia premia con cuerpo: un punto mas de vitalidad, una carga mas del
 * frasco. Nunca esta en el camino principal; siempre hay que desviarse, y
 * casi siempre hay que usar una mecanica (doble salto, dash, agarre) para
 * llegar.
 */
export class Reliquia {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly id: string;
  readonly tipo: TipoReliquia;

  private recogida = false;
  private readonly escena: Phaser.Scene;

  constructor(escena: Phaser.Scene, x: number, y: number, id: string, tipo: TipoReliquia) {
    this.escena = escena;
    this.id = id;
    this.tipo = tipo;

    this.sprite = escena.physics.add.staticSprite(x, y, RELIQUIAS[tipo].textura);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.refreshBody();
    this.sprite.setData('reliquia', this);

    // Un halo lento. Mas presente que un fragmento: esto cambia al Cirujano.
    escena.tweens.add({
      targets: this.sprite,
      y: y - 3,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  get nombre(): string {
    return RELIQUIAS[this.tipo].nombre;
  }

  get efecto(): string {
    return RELIQUIAS[this.tipo].efecto;
  }

  /** @returns true si es la primera vez que se recoge. */
  recoger(): boolean {
    if (this.recogida) return false;
    this.recogida = true;

    this.escena.tweens.killTweensOf(this.sprite);
    this.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 1.8,
      y: this.sprite.y - 14,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => this.sprite.destroy(),
    });

    return true;
  }
}
