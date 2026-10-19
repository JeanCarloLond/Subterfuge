import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

/**
 * La Mata de Retazos (#104). Un arbusto cuyos frutos son partes humanas.
 *
 * Se cosecha con E. Casi siempre el fruto se come y cura un punto; a veces es
 * amargo; y a veces, entre los frutos, habia un Remedo que muerde. Tiene pocos
 * frutos: es un alivio en el camino, no una fuente de curacion. No ataca ni
 * cierra el paso.
 *
 * Al tocarla, el fruto se encoge —la biblia: "los frutos se contraen al
 * tocarlos, y las manos se cierran por reflejo"—. Es el unico gesto: la planta
 * no es un monstruo, y la escena no tiene por que serlo.
 */
export class Mata implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'mata' as const;
  readonly idFicha = 'mata';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private frutos: number = ESPECIES.mata.frutos;
  private readonly aviso: Phaser.GameObjects.Text;
  private cerca = false;

  private readonly ctx: ContextoCriatura;

  constructor(ctx: ContextoCriatura, x: number, y: number) {
    this.ctx = ctx;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'mata-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(5);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    this.aviso = ctx.escena.add
      .text(x, y - 26, 'E  cosechar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false);
  }

  get frutosRestantes(): number {
    return this.frutos;
  }

  actualizar(xJugador: number, yJugador: number): void {
    const ahoraCerca =
      this.frutos > 0 &&
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) <
        ESPECIES.mata.radio;
    if (ahoraCerca !== this.cerca) {
      this.cerca = ahoraCerca;
      this.aviso.setVisible(ahoraCerca);
    }
    if (this.cerca && this.ctx.jugador.interactuar) this.cosechar();
  }

  private cosechar(): void {
    const c = ESPECIES.mata;
    this.frutos -= 1;

    // El fruto se encoge al tocarlo.
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 0.9,
      scaleX: 1.04,
      duration: 90,
      yoyo: true,
    });

    const tirada = Math.random();
    if (tirada < c.comestible) {
      this.ctx.curar(c.curacion);
      this.ctx.avisar('fruto de la Mata  ·  +1 carne');
    } else if (tirada < c.comestible + c.amargo) {
      this.ctx.avisar('fruto amargo');
    } else {
      this.ctx.herir(c.danoRemedo, this.sprite.x);
      this.ctx.avisar('un Remedo entre los frutos');
    }

    if (this.frutos <= 0) {
      this.cerca = false;
      this.aviso.setVisible(false);
      this.sprite.setTint(0x8a7a74);
    }
  }
}
