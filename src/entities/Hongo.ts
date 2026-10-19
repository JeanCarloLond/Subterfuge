import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import type { ContextoCriatura } from './Criatura';
import type { Habitante } from './Habitante';

/** El verde frio de la bioluminiscencia: lo unico de ese color en el Vientre. */
const LUZ = 0x7ad0a8;

/**
 * El Hongo de Lampara (#96). Da luz y se come.
 *
 * Su luz es la misma que la de las velas y los Altares (un brillo aditivo),
 * pero fria. En el nivel marca el camino seguro y las repisas: alumbra un
 * palmo, no la sala entera.
 *
 * Se cosecha con E y cura un punto: la biblia lo da como alimento ("el Hongo de
 * Lampara, los tuberculos y la Mata de Retazos"). Comido, se apaga, y sigue
 * apagado si se vuelve a la zona. No es una fuente infinita.
 */
export class Hongo implements Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'neutral' as const;
  readonly clase = 'hongo' as const;
  readonly idFicha = 'hongo';
  readonly hiereAlContacto = false;
  readonly estaMuerto = false;

  private readonly ctx: ContextoCriatura;
  private readonly huella: string;
  private readonly aviso: Phaser.GameObjects.Text;
  private luz?: Phaser.GameObjects.Image;
  private cerca = false;
  private comido = false;

  constructor(ctx: ContextoCriatura, x: number, y: number) {
    this.ctx = ctx;
    this.huella = `hongo:${ctx.zona}:${x}:${y}`;

    this.sprite = ctx.escena.physics.add.sprite(x, y, 'hongo-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(5);
    this.sprite.setData('habitante', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);

    this.aviso = ctx.escena.add
      .text(x, y - 20, 'E  cosechar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false);

    if (progreso.hayHuella(this.huella)) {
      this.apagar();
      return;
    }

    this.luz = ctx.escena.add.image(x, y - 10, 'brillo-placeholder');
    this.luz.setDepth(-3);
    this.luz.setBlendMode(Phaser.BlendModes.ADD);
    this.luz.setTint(LUZ);
    this.luz.setScale(0.6);
    this.luz.setAlpha(0.55);
    // Respira mas despacio que una vela: no es una llama.
    ctx.escena.tweens.add({
      targets: this.luz,
      alpha: { from: 0.45, to: 0.6 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.comido) return;
    const ahoraCerca =
      Phaser.Math.Distance.Between(xJugador, yJugador, this.sprite.x, this.sprite.y) <
      ESPECIES.hongo.radio;
    if (ahoraCerca !== this.cerca) {
      this.cerca = ahoraCerca;
      this.aviso.setVisible(ahoraCerca);
    }
    if (this.cerca && this.ctx.jugador.interactuar) {
      this.ctx.curar(ESPECIES.hongo.curacion);
      this.ctx.avisar('Hongo de Lámpara  ·  +1 carne');
      progreso.dejarHuella(this.huella);
      this.apagar();
    }
  }

  private apagar(): void {
    this.comido = true;
    this.cerca = false;
    this.aviso.setVisible(false);
    this.sprite.setTint(0x3a4a3a);
    if (this.luz) {
      const luz = this.luz;
      this.ctx.escena.tweens.killTweensOf(luz);
      this.ctx.escena.tweens.add({
        targets: luz,
        alpha: 0,
        duration: 600,
        onComplete: () => luz.destroy(),
      });
      this.luz = undefined;
    }
  }
}
