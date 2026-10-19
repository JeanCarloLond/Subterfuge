import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { EVENTO_MAREA, type EstadoMarea } from '../systems/Marea';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

const T = 16;

/**
 * La Vena Trepadora como compuerta (#101). Una cortina de carne que late con
 * el Latido y cierra un paso.
 *
 * No hiere al tocarla: solo bloquea. En el pico de cada latido se contrae
 * hacia un lado y deja pasar un instante; un golpe seco lo anuncia antes. Con
 * la Marea en marcha el Latido se acelera y la ventana se acorta —la biblia:
 * "las Vestales leen su pulso para anunciar un Hambre"—. Si se insiste en
 * pasar fuera de tiempo, no se pasa.
 */
export class Vena implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'peligro' as const;
  readonly clase = 'vena' as const;
  readonly idFicha = 'vena';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private readonly ctx: ContextoCriatura;
  private readonly cortina: Phaser.GameObjects.TileSprite;
  private acelerada = false;
  private abierta = false;
  private proximoLatido: number;
  private finApertura = 0;
  private avisada = false;

  constructor(ctx: ContextoCriatura, x: number, y: number, altoTiles: number) {
    this.ctx = ctx;
    const alto = altoTiles * T;

    this.cortina = ctx.escena.add
      .tileSprite(x, y, T, alto, 'vena-placeholder')
      .setOrigin(0.5, 1)
      .setDepth(6);

    this.sprite = ctx.escena.physics.add.sprite(x, y - alto / 2, 'vena-placeholder');
    this.sprite.setVisible(false);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);
    cuerpo.setSize(T, alto, true);
    ctx.bloquear(this.sprite);

    this.proximoLatido = ctx.escena.time.now + this.ciclo;

    const alCambiarMarea = (estado: EstadoMarea) => {
      this.acelerada = estado !== 'reposo';
    };
    ctx.escena.events.on(EVENTO_MAREA, alCambiarMarea);
    ctx.escena.events.once('shutdown', () => ctx.escena.events.off(EVENTO_MAREA, alCambiarMarea));
  }

  get estaAbierta(): boolean {
    return this.abierta;
  }

  private get ciclo(): number {
    return this.acelerada ? ESPECIES.vena.cicloMareaMs : ESPECIES.vena.cicloMs;
  }

  private get apertura(): number {
    return this.acelerada ? ESPECIES.vena.abiertaMareaMs : ESPECIES.vena.abiertaMs;
  }

  actualizar(): void {
    const ahora = this.ctx.escena.time.now;

    if (this.abierta) {
      if (ahora >= this.finApertura) this.cerrar(ahora);
      return;
    }

    if (!this.avisada && ahora >= this.proximoLatido - ESPECIES.vena.avisoMs) {
      this.avisada = true;
      // El golpe que avisa: se hincha un instante antes de abrirse.
      this.ctx.escena.tweens.add({ targets: this.cortina, scaleX: 1.25, duration: 90, yoyo: true });
    }
    if (ahora >= this.proximoLatido) this.abrir(ahora);
  }

  private abrir(ahora: number): void {
    this.abierta = true;
    this.finApertura = ahora + this.apertura;
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.ctx.escena.tweens.add({ targets: this.cortina, scaleX: 0.25, duration: 110 });
  }

  private cerrar(ahora: number): void {
    this.abierta = false;
    this.avisada = false;
    this.proximoLatido = ahora + this.ciclo;
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = true;
    this.ctx.escena.tweens.add({ targets: this.cortina, scaleX: 1, duration: 140 });
  }
}
