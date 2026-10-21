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
 * Se distingue de un enemigo por dos cosas, y las dos hacian falta (la
 * revision del equipo los confundia): una figura de civil propia, sin carne
 * abierta ni metal, y un bocadillo de oro que flota sobre la cabeza siempre,
 * de lejos. Antes se apagaba en gris hasta que te acercabas, y en gris se
 * leia como un enemigo dormido. Cuando ya se ha hablado con el, el bocadillo
 * se queda pero mas tenue: sigue ahi si quieres volver a oirle.
 */
export class Fiel {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly clave: ClaveVoz;
  readonly voz: Voz;

  /** Ya se ha hablado con el: el rotulo cambia y deja de insistir. */
  private hablado = false;
  private cerca = false;

  private readonly aviso: Phaser.GameObjects.Text;
  private readonly bocadillo: Phaser.GameObjects.Image;

  constructor(escena: Phaser.Scene, x: number, y: number, clave: ClaveVoz) {
    this.clave = clave;
    this.voz = VOCES[clave];

    this.sprite = escena.add.sprite(x, y, this.voz.textura).setOrigin(0.5, 1);
    this.sprite.setDepth(8);
    const cima = y - this.sprite.height;

    this.bocadillo = escena.add.image(x, cima - 6, 'bocadillo-placeholder').setOrigin(0.5, 1);
    this.bocadillo.setDepth(20);
    escena.tweens.add({
      targets: this.bocadillo,
      y: cima - 9,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.aviso = escena.add
      .text(x, cima - 16, this.voz.rotulo, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  /** Si esta a tiro de hablar: con el al lado, la E es suya. */
  get estaCerca(): boolean {
    return this.cerca;
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
      // De cerca el rotulo dice que hacer; el bocadillo se aparta para no
      // taparlo.
      this.bocadillo.setVisible(!ahoraCerca);
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
    this.bocadillo.setAlpha(0.45);
  }

  get yaHablado(): boolean {
    return this.hablado;
  }
}

/** Distancia a la que ofrece conversacion (px). */
const RADIO = 46;
