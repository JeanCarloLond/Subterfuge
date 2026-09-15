import Phaser from 'phaser';
import { INJERTADORA } from '../config/Sacramento';

/**
 * El injerto lanzado: el proyectil de la Injertadora.
 *
 * Es literalmente la protesis que otro fiel llevaba puesta. Sale a la presion
 * con la que se encajaba en un cuerpo, asi que vuela recto y rapido y no le
 * afecta la gravedad: no es un objeto que se tira, es un objeto que se dispara.
 *
 * A diferencia del sello del Vestal, esto NO se puede parar con el parry.
 * El parry es una lectura de un ataque telegrafiado; el injerto no se
 * telegrafia, por eso le sale caro al Cirujano en munición y no en riesgo.
 */
export class Injerto {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  private consumido = false;
  private readonly escena: Phaser.Scene;
  private readonly temporizador: Phaser.Time.TimerEvent;

  constructor(escena: Phaser.Scene, x: number, y: number, direccion: number) {
    this.escena = escena;

    this.sprite = escena.physics.add.sprite(x, y, 'injerto-placeholder');
    this.sprite.setData('injerto', this);
    this.sprite.setDepth(30);
    this.sprite.setFlipX(direccion < 0);

    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setSize(9, 5);
    cuerpo.setVelocityX(direccion * INJERTADORA.velocidad);

    this.temporizador = escena.time.delayedCall(INJERTADORA.vidaMs, () => this.destruir());
  }

  get dano(): number {
    return INJERTADORA.dano;
  }

  /** Un injerto solo hiere una vez, aunque el solape dure varios fotogramas. */
  consumir(): boolean {
    if (this.consumido) return false;
    this.consumido = true;
    return true;
  }

  /**
   * Se clava y se queda: al tocar piedra frena en seco y se apaga ahi mismo.
   *
   * Es un detalle barato que dice mucho — el metal no rebota ni se disuelve,
   * se queda clavado en la pared como se quedaba clavado en la gente.
   */
  clavar(): void {
    if (!this.sprite.active) return;

    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setVelocity(0, 0);
    cuerpo.enable = false;
    this.consumido = true;

    this.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 420,
      delay: 360,
      onComplete: () => this.destruir(),
    });
  }

  destruir(): void {
    this.temporizador.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }

  get estaVivo(): boolean {
    return this.sprite.active;
  }
}
