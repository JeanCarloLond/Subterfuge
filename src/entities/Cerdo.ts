import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

type EstadoCerdo = 'paseando' | 'comiendo' | 'huyendo' | 'muerto';

/**
 * El Cerdo de Protocolo (#100). Cria de los linajes: pasea, come y se asusta.
 *
 * No ataca, pero se puede matar (#100): es ganado de los linajes, "carne
 * engastada para las mesas de los linajes injertados" segun la biblia. Herido,
 * huye; muerto, deja su carne engastada (cura 2) y el HUD recuerda de quien
 * era. Es opcional y no tiene castigo: matarlo no cierra ninguna ruta.
 *
 * #90 lo ponia entre los que no se pueden herir; #100 y #106 (que le pide
 * animacion de muerte) dicen lo contrario, y el equipo eligio esto.
 */
export class Cerdo implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'hostil' as const;
  readonly clase = 'cerdo' as const;
  readonly idFicha = 'cerdo';
  /** No embiste: rozarlo no hiere. */
  readonly hiereAlContacto = false;

  private vida: number = ESPECIES.cerdo.vida;

  private estado: EstadoCerdo = 'paseando';
  private sentido = 1;
  private finEstado = 0;

  private readonly ctx: ContextoCriatura;
  private readonly corral: RangoPatrulla;

  constructor(ctx: ContextoCriatura, x: number, y: number, corral: RangoPatrulla) {
    this.ctx = ctx;
    this.corral = corral;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'cerdo-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.cuerpo;
    cuerpo.setSize(16, 8);
    cuerpo.setOffset(2, 6);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  recibirDano(cantidad: number, origenX: number): boolean {
    if (this.estado === 'muerto') return false;
    this.vida -= cantidad;
    this.sprite.setTint(0xd08080);
    this.ctx.escena.time.delayedCall(90, () => {
      if (this.estado !== 'muerto') this.sprite.clearTint();
    });
    if (this.vida > 0) {
      this.asustarse(origenX);
      return true;
    }

    this.estado = 'muerto';
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.ctx.avisar('propiedad del linaje');
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      angle: this.sentido * 90,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeIn',
      onComplete: () => this.sprite.setVisible(false),
    });
    return true;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.estado === 'muerto') return;
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.cerdo;

    const cerca =
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) < c.radioSusto;
    if (
      this.estado !== 'huyendo' &&
      cerca &&
      Math.abs(this.ctx.jugador.velocidadX) >= c.velocidadQueAsusta
    ) {
      this.asustarse(xJugador);
    }

    if (ahora >= this.finEstado) {
      // Alterna pasear y comer: un animal de corral, no una patrulla.
      if (this.estado === 'comiendo') {
        this.estado = 'paseando';
        this.finEstado = ahora + c.pasoMs;
        this.sentido = Math.random() < 0.5 ? -1 : 1;
      } else {
        this.estado = 'comiendo';
        this.finEstado = ahora + c.comerMs;
        if (this.ctx.oye(this.sprite.x, this.sprite.y)) sonido.cerdoGrune();
      }
    }

    const velocidad =
      this.estado === 'comiendo' ? 0 : this.estado === 'huyendo' ? c.velocidadHuida : c.velocidad;
    // Las vallas del corral: da la vuelta en vez de salirse.
    if (this.sprite.x <= this.corral.izquierda) this.sentido = 1;
    if (this.sprite.x >= this.corral.derecha) this.sentido = -1;
    this.cuerpo.setVelocityX(this.sentido * velocidad);
    if (velocidad > 0) this.sprite.setFlipX(this.sentido < 0);
  }

  private asustarse(origenX: number): void {
    this.estado = 'huyendo';
    this.finEstado = this.ctx.escena.time.now + 1200;
    this.sentido = this.sprite.x >= origenX ? 1 : -1;
  }
}
