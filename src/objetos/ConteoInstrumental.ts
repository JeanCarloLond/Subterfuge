import Phaser from 'phaser';
import { Conteo, type ResultadoConteo } from '../systems/Conteo';
import { sonido } from '../systems/Sonido';

/** Separacion entre bandejas (px): cada una es un objetivo para la E. */
const PASO = 20;
/** Altura de la superficie de la bandeja sobre el suelo (px). */
const ALTO_BANDEJA = 7;
/** A esta distancia de una pieza, la E la coge (px). */
const ALCANCE = 11;
/** Desde aqui tiemblan los Remedos: el mismo tell que en el resto del Vientre. */
const RADIO_TEMBLOR = 72;

interface Pieza {
  bandeja: Phaser.GameObjects.Image;
  sprite: Phaser.GameObjects.Image;
  proximoTemblor: number;
}

/**
 * El conteo del instrumental en la Galeria (#160): las bandejas, las piezas y
 * lo que pasa al coger una. La logica de que pieza es cual vive en
 * `systems/Conteo.ts`; aqui solo se dibuja y se anima.
 *
 * Todas las piezas son el mismo dibujo, porque los Remedos imitan forma y
 * color. Lo que delata a uno es que tiembla cuando el Cirujano se acerca.
 */
export class ConteoInstrumental {
  private readonly conteo: Conteo;
  private readonly piezas: Pieza[] = [];
  private readonly aviso: Phaser.GameObjects.Text;
  private ocupado = false;
  private readonly escena: Phaser.Scene;
  private readonly y: number;
  /** Coger un Remedo: la escena decide cuanto muerde. */
  private readonly alMorder: (x: number) => void;
  /** El bisturi de verdad, de vuelta en la mano. */
  private readonly alRecuperar: (x: number, y: number) => void;

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    cuantas: number,
    alMorder: (x: number) => void,
    alRecuperar: (x: number, y: number) => void,
  ) {
    this.escena = escena;
    this.y = y;
    this.alMorder = alMorder;
    this.alRecuperar = alRecuperar;
    this.conteo = new Conteo(cuantas);
    for (let i = 0; i < cuantas; i += 1) {
      const px = x + i * PASO;
      const bandeja = escena.add.image(px, y, 'bandeja-placeholder').setOrigin(0.5, 1);
      bandeja.setDepth(-3);
      const sprite = escena.add
        .image(px, y - ALTO_BANDEJA, 'bisturi-placeholder')
        .setOrigin(0.5, 1)
        .setDepth(-2);
      this.piezas.push({ bandeja, sprite, proximoTemblor: 0 });
    }
    this.aviso = escena.add
      .text(x, y - 22, 'E  tomar', { fontFamily: 'monospace', fontSize: '8px', color: '#d6cfc4' })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  get terminado(): boolean {
    return this.conteo.terminado;
  }

  /**
   * La E se pide con `leerE`, y solo con una pieza al alcance: leer la tecla
   * la consume (JustDown), y leerla siempre dejaba sin ella al umbral, a las
   * placas y a los fieles de toda la zona (#173).
   *
   * @returns true si la E se uso aqui.
   */
  actualizar(jx: number, jy: number, leerE: () => boolean, ahora: number): boolean {
    if (this.conteo.terminado || this.ocupado) {
      this.aviso.setVisible(false);
      return false;
    }

    const cerca = Math.abs(jy - this.y) < 30;
    let elegida = -1;
    let mejor = ALCANCE;
    this.piezas.forEach((pieza, i) => {
      const dx = Math.abs(jx - pieza.sprite.x);
      if (cerca && dx <= mejor) {
        mejor = dx;
        elegida = i;
      }
      if (
        this.conteo.tiembla(i) &&
        Math.abs(jx - pieza.sprite.x) < RADIO_TEMBLOR &&
        cerca &&
        ahora >= pieza.proximoTemblor
      ) {
        // Cada uno a su ritmo: si tiemblan a la vez parece la bandeja entera.
        pieza.proximoTemblor = ahora + 1100 + Math.random() * 1300;
        this.temblar(pieza);
      }
    });

    this.aviso.setVisible(elegida >= 0);
    if (elegida < 0) return false;
    this.aviso.setX(this.piezas[elegida].sprite.x);
    if (!leerE()) return false;

    this.resolver(elegida, this.conteo.tomar(elegida));
    return true;
  }

  private resolver(i: number, resultado: ResultadoConteo | null): void {
    const pieza = this.piezas[i];
    if (resultado === 'bisturi') {
      this.aviso.setVisible(false);
      this.alRecuperar(pieza.sprite.x, pieza.sprite.y);
      pieza.sprite.destroy();
      // Los que quedan ya no tienen a quien imitar: se delatan y se van.
      this.piezas.forEach((otra, j) => {
        if (j !== i) this.huir(otra.sprite, j < i ? -1 : 1);
      });
      return;
    }
    if (resultado !== 'remedo') return;

    // El Remedo muerde y huye; la bandeja se vuelve a contar.
    this.ocupado = true;
    this.piezas.splice(i, 1);
    this.alMorder(pieza.sprite.x);
    sonido.remedoMuerde();
    this.huir(pieza.sprite, Math.random() < 0.5 ? -1 : 1);
    this.escena.time.delayedCall(500, () => this.recontar(pieza.bandeja));
  }

  /** Las piezas se reparten otra vez por las bandejas que quedan. */
  private recontar(bandejaVacia: Phaser.GameObjects.Image): void {
    this.conteo.recontar();
    sonido.remedoTiembla();
    // La bandeja del Remedo se queda vacia al final de la fila.
    const bandejas = [...this.piezas.map((p) => p.bandeja), bandejaVacia].sort((a, b) => a.x - b.x);
    this.piezas.forEach((pieza, j) => {
      pieza.bandeja = bandejas[j];
      this.escena.tweens.add({
        targets: pieza.sprite,
        x: bandejas[j].x,
        y: { from: this.y - ALTO_BANDEJA - 6, to: this.y - ALTO_BANDEJA },
        duration: 260,
        ease: 'Quad.easeOut',
      });
    });
    this.escena.time.delayedCall(300, () => {
      this.ocupado = false;
    });
  }

  private temblar(pieza: Pieza): void {
    sonido.remedoTiembla();
    this.escena.tweens.add({
      targets: pieza.sprite,
      angle: { from: -9, to: 9 },
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => pieza.sprite.setAngle(0),
    });
  }

  /** Deja de imitar: se vuelve lo que es y se escabulle por el suelo. */
  private huir(sprite: Phaser.GameObjects.Image, sentido: number): void {
    sprite.setTexture('remedo-placeholder').setTint(0xc8ccd0).setAngle(0);
    this.escena.tweens.add({
      targets: sprite,
      x: sprite.x + sentido * 90,
      y: this.y,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeIn',
      onComplete: () => sprite.destroy(),
    });
  }
}
