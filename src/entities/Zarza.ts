import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import type { ContextoCriatura } from './Criatura';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

const T = 16;

/**
 * La Zarza Cosedora (#102). Una cortina de tallos que cierra un paso.
 *
 * Es solida: no se atraviesa andando. Rozarla hiere (el golpe con retroceso es
 * el "enganche" de la issue, breve y sin retener). Se puede cortar a tajos, y
 * al abrirse sangra —la biblia: "la planta que sangra en lugar de dar savia"—
 * y da un poco de Fervor. No vuelve a crecer en la partida: queda el tocon.
 *
 * Es un peligro, no un enemigo: el injerto no la toca (#90). Se la gana con el
 * bisturi, que es para lo que la usan los suturadores.
 */
export class Zarza implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'peligro' as const;
  readonly clase = 'zarza' as const;
  readonly idFicha = 'zarza';

  private readonly tallos: Phaser.GameObjects.TileSprite;
  private readonly muro?: Phaser.Physics.Arcade.Collider;
  private readonly huella: string;
  private vida: number;
  private cortada = false;

  private readonly ctx: ContextoCriatura;

  constructor(ctx: ContextoCriatura, x: number, y: number, altoTiles: number, anchoTiles = 1) {
    this.ctx = ctx;
    const ancho = anchoTiles * T;
    const alto = altoTiles * T;
    this.vida = ESPECIES.zarza.vidaPorTile * altoTiles * anchoTiles;
    this.huella = `zarza:${ctx.zona}:${x}:${y}`;

    // (x, y) es el pie de la cortina, como el resto de criaturas.
    this.tallos = ctx.escena.add
      .tileSprite(x, y, ancho, alto, 'zarza-placeholder')
      .setOrigin(0.5, 1)
      .setDepth(6);

    this.sprite = ctx.escena.physics.add.sprite(x, y - alto / 2, 'zarza-placeholder');
    this.sprite.setVisible(false);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);
    cuerpo.setSize(ancho, alto, true);

    if (progreso.hayHuella(this.huella)) {
      this.quedarseEnTocon();
      return;
    }
    this.muro = ctx.bloquear(this.sprite);
  }

  get estaMuerto(): boolean {
    return this.cortada;
  }

  /** El roce se resuelve aqui: con el muro de por medio, no hay solape. */
  get hiereAlContacto(): boolean {
    return false;
  }

  actualizar(): void {
    if (this.cortada) return;
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!cuerpo.touching.none) this.ctx.herir(1, this.sprite.x);
  }

  recibirDano(cantidad: number): boolean {
    if (this.cortada) return false;
    this.vida -= cantidad;
    this.ctx.escena.tweens.add({
      targets: this.tallos,
      x: { from: this.tallos.x - 1, to: this.tallos.x },
      duration: 80,
    });
    this.tallos.setTint(0xd08080);
    this.ctx.escena.time.delayedCall(90, () => {
      if (!this.cortada) this.tallos.clearTint();
    });

    if (this.vida <= 0) {
      progreso.dejarHuella(this.huella);
      this.ctx.ganarFervor(ESPECIES.zarza.fervorAlCortar);
      this.quedarseEnTocon();
    }
    return true;
  }

  /** Lo que queda al cortarla: un palmo de tallos secos, sin muro. */
  private quedarseEnTocon(): void {
    this.cortada = true;
    this.muro?.destroy();
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.tallos.setTint(0x5c3a3a);
    this.ctx.escena.tweens.add({
      targets: this.tallos,
      height: 5,
      duration: 260,
      ease: 'Quad.easeIn',
    });
  }
}
