import Phaser from 'phaser';
import { PROYECTIL } from '../config/Sacramento';

/** Quien es dueño del sello ahora mismo. Cambia con el parry. */
export type DuenoSello = 'vestal' | 'cirujano';

/**
 * Sello del diezmo: el proyectil que lanza el Vestal.
 *
 * Se puede parar con el parry, y entonces NO se destruye: cambia de dueño y
 * sale rebotado mas rapido y mas fuerte contra quien lo lanzo. Es la razon de
 * ser del Vestal como enemigo — premia leer el ataque en vez de esquivarlo.
 */
export class Sello {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  private dueno: DuenoSello = 'vestal';
  private consumido = false;
  private readonly escena: Phaser.Scene;
  private readonly temporizador: Phaser.Time.TimerEvent;

  constructor(escena: Phaser.Scene, x: number, y: number, direccion: number) {
    this.escena = escena;

    this.sprite = escena.physics.add.sprite(x, y, 'sello-placeholder');
    this.sprite.setData('sello', this);
    this.sprite.setDepth(30);

    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setSize(8, 8);
    cuerpo.setVelocityX(direccion * PROYECTIL.velocidad);

    // Gira mientras vuela: a este tamaño es lo que lo hace visible.
    escena.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 900,
      repeat: -1,
    });

    this.temporizador = escena.time.delayedCall(PROYECTIL.vidaMs, () => this.destruir());
  }

  get duenoActual(): DuenoSello {
    return this.dueno;
  }

  get fueDevuelto(): boolean {
    return this.dueno === 'cirujano';
  }

  get dano(): number {
    return this.fueDevuelto ? PROYECTIL.danoDevuelto : PROYECTIL.dano;
  }

  /** Un sello solo hiere una vez, aunque el solape dure varios fotogramas. */
  consumir(): boolean {
    if (this.consumido) return false;
    this.consumido = true;
    return true;
  }

  /** El parry no lo rompe: se lo queda el Cirujano y lo manda de vuelta. */
  devolver(): void {
    if (this.fueDevuelto) return;

    this.dueno = 'cirujano';
    this.consumido = false;

    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    const direccion = cuerpo.velocity.x >= 0 ? -1 : 1;
    cuerpo.setVelocityX(direccion * PROYECTIL.velocidadDevuelto);

    // Dorado, como el destello del parry: se lee de quien es de un vistazo.
    this.sprite.setTint(0xe8d9a0);
    this.sprite.setScale(1.25);
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
