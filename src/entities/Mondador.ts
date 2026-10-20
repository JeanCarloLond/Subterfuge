import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

type EstadoMondador = 'caminando' | 'comiendo' | 'huyendo' | 'oculto';

/**
 * El Mondador (#99). El limpiador sagrado: un felino dorado que recorre su ruta
 * y se para a comer lo que el sacramento rechazo.
 *
 * No hiere y no se puede matar: es neutral, el tajo no le llega. Pero se entera
 * de el. Si el Cirujano le lanza un golpe cerca, huye y no vuelve en esta
 * visita: quien lo asusta pierde lo que el animal le habria ensenado (el paso
 * seguro, la repisa). Es la unica consecuencia, y es la que importa.
 *
 * Anda solo en horizontal, de punto a punto de su ruta y de vuelta: la ruta se
 * dibuja sobre suelo que conoce. La altura de cada punto se ignora a proposito;
 * es un animal de suelo y no salta.
 */
export class Mondador implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'mondador' as const;
  readonly idFicha = 'mondador';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private estado: EstadoMondador = 'caminando';
  private destino = 1;
  private sentido = 1;
  private finEstado = 0;

  private readonly ctx: ContextoCriatura;
  private readonly ruta: readonly (readonly [number, number])[];

  constructor(ctx: ContextoCriatura, ruta: readonly (readonly [number, number])[]) {
    this.ctx = ctx;
    this.ruta = ruta;
    const [x, y] = ruta[0] ?? [0, 0];
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'mondador-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);

    const cuerpo = this.cuerpo;
    cuerpo.setSize(24, 12);
    cuerpo.setOffset(4, 6);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);

    if (ruta.length < 2) this.empezarAComer(0);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  actualizar(): void {
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.mondador;

    switch (this.estado) {
      case 'oculto':
        return;
      case 'huyendo':
        if (ahora >= this.finEstado) this.desaparecer();
        return;
      case 'comiendo':
        if (ahora >= this.finEstado && this.ruta.length >= 2) this.estado = 'caminando';
        return;
      default: {
        const objetivo = this.ruta[this.destino][0];
        const dx = objetivo - this.sprite.x;
        if (Math.abs(dx) <= c.margen) {
          this.siguientePunto();
          this.empezarAComer(ahora);
          return;
        }
        this.cuerpo.setVelocityX(Math.sign(dx) * c.velocidad);
        this.sprite.setFlipX(dx < 0);
      }
    }
  }

  alSerAmenazado(origenX: number): void {
    if (this.estado === 'huyendo' || this.estado === 'oculto') return;
    this.estado = 'huyendo';
    this.finEstado = this.ctx.escena.time.now + 1600;
    sonido.mondadorHuye();
    const lejos = this.sprite.x >= origenX ? 1 : -1;
    this.cuerpo.setVelocityX(lejos * ESPECIES.mondador.velocidadHuida);
    this.sprite.setFlipX(lejos < 0);
    this.ctx.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);
  }

  // -- Comportamiento ------------------------------------------------------

  /** Ida y vuelta por la ruta: al llegar al final, da media vuelta. */
  private siguientePunto(): void {
    if (this.destino + this.sentido < 0 || this.destino + this.sentido >= this.ruta.length) {
      this.sentido = -this.sentido;
    }
    this.destino += this.sentido;
  }

  /** Baja la cabeza a comer: un cabeceo lento, no un ataque. */
  private empezarAComer(ahora: number): void {
    this.estado = 'comiendo';
    this.finEstado = ahora + ESPECIES.mondador.comerMs;
    if (this.ctx.oye(this.sprite.x, this.sprite.y)) sonido.mondadorRonronea();
    this.cuerpo.setVelocityX(0);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 0.92,
      duration: 260,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.sprite.setScale(1),
    });
  }

  private desaparecer(): void {
    this.estado = 'oculto';
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => this.sprite.setVisible(false),
    });
  }
}
