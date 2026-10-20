import Phaser from 'phaser';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

const T = 16;
const GROSOR = 8;
const RADIO = 26;
const CRECER_MS = 700;

/**
 * Un puente de tejido (#95): la Injertadora como llave del Vientre Humedo.
 *
 * Al borde de un hueco late un nodulo. Con E, si queda algun injerto, se gasta
 * uno y del nodulo crece carne tendida hasta el otro lado. Sin injertos, el HUD
 * lo dice y no se gasta nada. Es la herramienta volviendo a su oficio: la
 * Injertadora se fabrico para poner tejido a presion, no para disparar.
 *
 * El puente pasa a ser suelo de verdad (entra en `suelos`), asi que se pisa, se
 * choca con el y cuenta para los muros del tajo. Dura lo que la escena: si el
 * Cirujano muere y vuelve del Altar sigue ahi; si se recarga la zona, hay que
 * volver a hacerlo.
 *
 * Tiene que ser OPCIONAL: un atajo o una reliquia, nunca la ruta principal.
 * `verificar-rutas` lee los niveles como codigo y no lo ve, a proposito.
 */
export class PuenteTejido implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'tejido' as const;
  readonly idFicha = 'tejido';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private readonly ctx: ContextoCriatura;
  private readonly x: number;
  private readonly y: number;
  private readonly ancho: number;
  private readonly aviso: Phaser.GameObjects.Text;
  private cerca = false;
  private hecho = false;

  constructor(ctx: ContextoCriatura, x: number, y: number, anchoTiles: number) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.ancho = anchoTiles * T;

    this.sprite = ctx.escena.physics.add.sprite(x - 5, y, 'nodulo-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(5);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    // Late: es lo que dice "esto esta vivo y espera algo".
    ctx.escena.tweens.add({
      targets: this.sprite,
      scale: { from: 0.94, to: 1.06 },
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.aviso = ctx.escena.add
      .text(x - 5, y - 16, 'E  injertar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false);
  }

  get estaHecho(): boolean {
    return this.hecho;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.hecho) return;
    const ahoraCerca =
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) < RADIO;
    if (ahoraCerca !== this.cerca) {
      this.cerca = ahoraCerca;
      this.aviso.setVisible(ahoraCerca);
    }
    if (this.cerca && this.ctx.jugador.interactuar && this.ctx.gastarInjerto()) this.crecer();
  }

  private crecer(): void {
    this.hecho = true;
    this.aviso.setVisible(false);
    sonido.tejidoCrece();
    const escena = this.ctx.escena;
    escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);

    const carne = escena.add
      .tileSprite(this.x, this.y, 1, GROSOR, 'puente-tejido-placeholder')
      .setOrigin(0, 0)
      .setDepth(4);

    escena.tweens.add({
      targets: carne,
      width: this.ancho,
      duration: CRECER_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        // El cuerpo entra al terminar de crecer: no se pisa un puente a medias.
        const losa = this.ctx.suelos.create(this.x, this.y, 'puente-tejido-placeholder');
        losa.setOrigin(0, 0).setDisplaySize(this.ancho, GROSOR).setVisible(false).refreshBody();
      },
    });
  }
}
