import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

/**
 * La Flor de hueso (#125). El momento humano del nivel.
 *
 * La biblia: en la Cena de la Ausencia, "cuando un miembro es Elegido, la casa
 * celebra un banquete con su lugar vacio; sobre el asiento se deposita una flor
 * de hueso". Quien la encuentra, la encuentra sobre una camilla vacia: alguien
 * de esa casa fue subido y no vuelve.
 *
 * Se recoge con E, da un poco de Fervor y deja una linea. Hay una por nivel y
 * no vuelve a aparecer. No cierra el paso ni hace falta para terminar.
 */
export class FlorDeHueso implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'flor' as const;
  readonly idFicha = 'flor-de-hueso';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private readonly ctx: ContextoCriatura;
  private readonly huella: string;
  private readonly aviso: Phaser.GameObjects.Text;
  private cerca = false;
  private recogida = false;

  constructor(ctx: ContextoCriatura, x: number, y: number) {
    this.ctx = ctx;
    this.huella = `flor:${ctx.zona}:${x}:${y}`;

    this.sprite = ctx.escena.physics.add.sprite(x, y, 'flor-hueso-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(5);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    this.aviso = ctx.escena.add
      .text(x, y - 18, 'E  recoger', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false);

    if (progreso.hayHuella(this.huella)) {
      this.recogida = true;
      this.sprite.setVisible(false);
      cuerpo.enable = false;
    }
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.recogida) return;
    const ahoraCerca =
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) <
      ESPECIES.flor.radio;
    if (ahoraCerca !== this.cerca) {
      this.cerca = ahoraCerca;
      this.aviso.setVisible(ahoraCerca);
    }
    if (this.cerca && this.ctx.jugador.interactuar) this.recoger();
  }

  private recoger(): void {
    this.recogida = true;
    this.aviso.setVisible(false);
    progreso.dejarHuella(this.huella);
    this.ctx.ganarFervor(ESPECIES.flor.fervor);
    // «Fue subido»: asi lo dice la familia, con orgullo (biblia, Lenguaje).
    this.ctx.avisar('una flor de hueso  ·  alguien de esta casa fue subido');
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y - 6,
      duration: 500,
      onComplete: () => this.sprite.setVisible(false),
    });
  }
}
