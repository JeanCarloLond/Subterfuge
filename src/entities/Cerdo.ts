import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Habitante } from './Habitante';

type EstadoCerdo = 'paseando' | 'comiendo' | 'huyendo';

/**
 * El Cerdo de Protocolo (#100). Cria de los linajes: pasea, come y se asusta.
 *
 * Es neutral, como dice el sistema de criaturas (#90): el tajo no le llega.
 * #100 propone que se pueda matar y suelte carne; las dos issues se
 * contradicen y aqui manda #90 hasta que el equipo decida. Cambiarlo es poner
 * su contrato en 'hostil' y darle `recibirDano`.
 */
export class Cerdo implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'cerdo' as const;
  readonly idFicha = 'cerdo';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

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
    const cuerpo = this.cuerpo;
    cuerpo.setSize(16, 8);
    cuerpo.setOffset(2, 6);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  actualizar(xJugador: number, yJugador: number): void {
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

  alSerAmenazado(origenX: number): void {
    this.asustarse(origenX);
  }

  private asustarse(origenX: number): void {
    this.estado = 'huyendo';
    this.finEstado = this.ctx.escena.time.now + 1200;
    this.sentido = this.sprite.x >= origenX ? 1 : -1;
  }
}
