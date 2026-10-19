import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { EVENTO_MAREA, type EstadoMarea } from '../systems/Marea';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

/**
 * El Buitre ritual, el de la Quietud (#100). Se posa y espera.
 *
 * No ataca y no se puede matar. Si el Cirujano llega corriendo o le lanza un
 * tajo cerca, se va volando y vuelve al rato a la misma percha: no bloquea
 * nada y no se pierde nada por espantarlo.
 *
 * Es tambien el presagio: cuando la Marea del Hambre empieza a avisar, se va,
 * y no vuelve hasta que el agua ha bajado. Quien aprende a mirarlo sabe que
 * viene la crecida antes de oirla.
 */
export class Buitre implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'buitre' as const;
  readonly idFicha = 'buitre';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private posado = true;
  /** Se fue por la Marea: no vuelve hasta que el agua baje. */
  private esperaMarea = false;

  private readonly ctx: ContextoCriatura;
  private readonly x: number;
  private readonly y: number;

  constructor(ctx: ContextoCriatura, x: number, y: number) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'buitre-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    const alCambiarMarea = (estado: EstadoMarea) => {
      if (estado === 'aviso') {
        this.esperaMarea = true;
        this.volar();
      } else if (estado === 'reposo' && this.esperaMarea) {
        this.esperaMarea = false;
        if (!this.posado) this.volver();
      }
    };
    ctx.escena.events.on(EVENTO_MAREA, alCambiarMarea);
    ctx.escena.events.once('shutdown', () => ctx.escena.events.off(EVENTO_MAREA, alCambiarMarea));
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (!this.posado) return;
    const c = ESPECIES.buitre;
    const cerca = Phaser.Math.Distance.Between(xJugador, yJugador, this.x, this.y) < c.radioEspanto;
    if (cerca && Math.abs(this.ctx.jugador.velocidadX) >= c.velocidadQueEspanta) {
      this.volar();
    }
  }

  alSerAmenazado(): void {
    this.volar();
  }

  private volar(): void {
    if (!this.posado) return;
    this.posado = false;
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    const escena = this.ctx.escena;

    escena.tweens.add({
      targets: this.sprite,
      y: this.y - 90,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeIn',
      onComplete: () => {
        escena.time.delayedCall(ESPECIES.buitre.ausenciaMs, () => this.volver());
      },
    });
  }

  private volver(): void {
    if (!this.sprite.active || this.esperaMarea || this.posado) return;
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      y: this.y,
      alpha: 1,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.posado = true;
        (this.sprite.body as Phaser.Physics.Arcade.Body).enable = true;
      },
    });
  }
}
