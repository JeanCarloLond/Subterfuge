import Phaser from 'phaser';
import { VOCES, type ClaveVoz, type Voz } from '../lore/Voces';

/**
 * Un fiel con el que se puede hablar. No ataca, no huye, no avisa.
 *
 * El Vientre solo estaba habitado por enemigos, asi que el mundo se leia como
 * un pasillo de obstaculos (issue #60). Estos cuatro estan trabajando o
 * esperando turno, y esa naturalidad es la que sostiene la tesis del bible:
 * aqui dentro nadie percibe el sacramento como violencia.
 *
 * NO tiene fisica: no colisiona, no empuja y no se le puede golpear. Es un
 * dibujo con un radio de conversacion. Meterlo en el grupo de enemigos por
 * comodidad habria sido un error caro — el Cirujano lo mataria de un tajo sin
 * querer, y el unico civil del juego moriria por accidente.
 *
 * Se apaga en gris hasta que te acercas, como los Altares: el color dice
 * "esto responde" sin necesidad de un icono encima.
 */
export class Fiel {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly clave: ClaveVoz;
  readonly voz: Voz;

  /** Ya se ha hablado con el: el rotulo cambia y deja de insistir. */
  private hablado = false;
  private cerca = false;

  private readonly aviso: Phaser.GameObjects.Text;

  constructor(escena: Phaser.Scene, x: number, y: number, clave: ClaveVoz) {
    this.clave = clave;
    this.voz = VOCES[clave];

    this.sprite = escena.add.sprite(x, y, this.voz.textura).setOrigin(0.5, 1);
    this.sprite.setDepth(8);
    this.sprite.setTint(GRIS);

    this.aviso = escena.add
      .text(x, y - 44, this.voz.rotulo, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  /** @returns true si esta a tiro de hablar, para que la escena ofrezca la E. */
  actualizar(jugadorX: number, jugadorY: number): boolean {
    const distancia = Phaser.Math.Distance.Between(
      jugadorX,
      jugadorY,
      this.sprite.x,
      this.sprite.y - 12,
    );
    const ahoraCerca = distancia < RADIO;

    if (ahoraCerca !== this.cerca) {
      this.cerca = ahoraCerca;
      this.aviso.setVisible(ahoraCerca);
      if (ahoraCerca) this.sprite.clearTint();
      else this.sprite.setTint(GRIS);
    }

    // Al mirarle se gira hacia ti. Es un gesto barato y es lo que separa a
    // alguien que esta ahi de un mueble con texto.
    if (ahoraCerca) this.sprite.setFlipX(jugadorX < this.sprite.x);

    return ahoraCerca;
  }

  /** Marca que ya se hablo. El rotulo pasa a ser mas discreto. */
  marcarHablado(): void {
    if (this.hablado) return;
    this.hablado = true;
    this.aviso.setText('E  volver a oírle');
  }

  get yaHablado(): boolean {
    return this.hablado;
  }
}

/** Distancia a la que ofrece conversacion (px). */
const RADIO = 46;

/** Apagado mientras no te acercas, como los Altares sin encender. */
const GRIS = 0x5e5a56;
