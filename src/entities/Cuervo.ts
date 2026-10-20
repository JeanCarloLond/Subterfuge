import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { EVENTO_MAREA, type EstadoMarea } from '../systems/Marea';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

/**
 * El Cuervo de Ermita (#101). El mensajero: va de posadero en posadero.
 *
 * Cuando el Cirujano se acerca, salta al siguiente posadero de su lista; quien
 * lo sigue acaba donde el nivel lo haya puesto (una repisa, una salida). En el
 * ultimo se queda. No es obligatorio seguirlo.
 *
 * No se puede matar, que era una de las dos opciones de la issue: si se le
 * ataca, tambien se adelanta al siguiente posadero. Es un heraldo del culto, y
 * la Diocesis no deja que el pueblo lo toque.
 *
 * Cuando la Marea del Hambre empieza a avisar, grazna tres veces seguidas. El
 * aviso de la Serpiente cerca espera a que exista la Serpiente (#98).
 */
export class Cuervo implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'cuervo' as const;
  readonly idFicha = 'cuervo';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private indice = 0;
  private volando = false;
  private proximoGraznido = 0;

  private readonly ctx: ContextoCriatura;
  private readonly posaderos: readonly (readonly [number, number])[];

  constructor(ctx: ContextoCriatura, posaderos: readonly (readonly [number, number])[]) {
    this.ctx = ctx;
    this.posaderos = posaderos;
    const [x, y] = posaderos[0] ?? [0, 0];
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'cuervo-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    const alCambiarMarea = (estado: EstadoMarea) => {
      if (estado !== 'aviso') return;
      for (let i = 0; i < 3; i += 1) ctx.escena.time.delayedCall(i * 260, () => this.graznar());
    };
    ctx.escena.events.on(EVENTO_MAREA, alCambiarMarea);
    ctx.escena.events.once('shutdown', () => ctx.escena.events.off(EVENTO_MAREA, alCambiarMarea));
  }

  /** En que posadero esta, o hacia cual vuela. */
  get posadero(): number {
    return this.indice;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.volando) return;
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.cuervo;

    // Mira hacia el Cirujano mientras espera.
    this.sprite.setFlipX(xJugador < this.sprite.x);

    if (ahora >= this.proximoGraznido) {
      this.proximoGraznido = ahora + c.graznidoCadaMs;
      this.graznar();
    }

    const cerca =
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) <
      c.radioPartida;
    if (cerca) this.adelantarse();
  }

  alSerAmenazado(): void {
    this.adelantarse();
  }

  /** Un pico abierto: estira el cuerpo un instante. */
  private graznar(): void {
    if (this.ctx.oye(this.sprite.x, this.sprite.y)) sonido.cuervoGrazna();
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 1.12,
      duration: 90,
      yoyo: true,
      repeat: 1,
    });
  }

  private adelantarse(): void {
    if (this.volando || this.indice >= this.posaderos.length - 1) return;
    this.volando = true;
    this.indice += 1;

    const [x0, y0] = [this.sprite.x, this.sprite.y];
    const [x1, y1] = this.posaderos[this.indice];
    this.sprite.setFlipX(x1 < x0);

    // Un arco, no una recta: los pajaros suben antes de bajar al posadero.
    const vuelo = { t: 0 };
    this.ctx.escena.tweens.add({
      targets: vuelo,
      t: 1,
      duration: ESPECIES.cuervo.vueloMs,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = vuelo.t;
        this.sprite.setPosition(
          Phaser.Math.Linear(x0, x1, t),
          Phaser.Math.Linear(y0, y1, t) - Math.sin(t * Math.PI) * ESPECIES.cuervo.arco,
        );
      },
      onComplete: () => {
        this.volando = false;
        (this.sprite.body as Phaser.Physics.Arcade.Body).reset(x1, y1);
      },
    });
  }
}
