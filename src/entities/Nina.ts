import Phaser from 'phaser';
import { Rastro } from '../systems/Rastro';

/** A cuantos px de camino va por detras del Cirujano. */
const SEPARACION = 20;
/** Un cuadro de andar cada tantos px recorridos, como el Cirujano. */
const PX_POR_CUADRO = 7;
const CICLO_PASO = [
  'cine-nina-pie',
  'cine-nina-pie-paso-a',
  'cine-nina-pie',
  'cine-nina-pie-paso-b',
] as const;

/** Andando, detras del Cirujano (depth 0) y delante del decorado. */
const PROFUNDIDAD_DETRAS = -1;
/** A cuestas, delante: la capa de el la taparia entera. */
const PROFUNDIDAD_DELANTE = 1;

export type EstadoNina = 'sigue' | 'a-cuestas' | 'espera' | 'escondida';

/** Lo que ella necesita saber de el cada fotograma. */
export interface GuiaNina {
  x: number;
  y: number;
  suelo: boolean;
  /** Hacia donde mira: a cuestas va a su espalda, que es el otro lado. */
  haciaDerecha: boolean;
  muerto: boolean;
}

/**
 * La niña (#157). Huye con el Cirujano por todo el Nivel 2.
 *
 * Reglas fijas del canon (#134): no tiene vida, no recibe daño, no puede
 * fracasar, los enemigos la ignoran y no choca con nadie. No es una escolta:
 * es la razon de la huida. Por eso no tiene cuerpo de fisica ni entra en
 * ningun grupo: no hay nada que pueda tocarla.
 *
 * Se mueve repitiendo el camino del Cirujano (`systems/Rastro.ts`): salta
 * donde el salto y nunca se queda atras. En los tramos marcados (trepas
 * largas, persecuciones) va a su espalda. Si el cae, ella espera donde esta;
 * cuando el vuelve al Altar, el camino empieza de nuevo a su lado.
 *
 * Su arte es provisional y comparte dibujo con la cinematica (#147); el
 * definitivo es #172.
 */
export class Nina {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly rastro = new Rastro(SEPARACION);
  private estado: EstadoNina = 'sigue';
  private recorrido = 0;
  /** La luz del nicho donde se esconde. */
  private luz?: Phaser.GameObjects.Image;
  /**
   * Si ya pisa suelo con el. Al entrar en una zona o reaparecer, el Cirujano
   * suele estar cayendo unos pixeles: hasta que no aterriza, ella no se pone,
   * o se quedaria flotando a la altura de la que el cayo.
   */
  private asentada = false;
  /** Fotogramas seguidos que el lleva en el suelo: el primero aun se recoloca. */
  private enSuelo = 0;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    this.sprite = escena.add.sprite(x, y, 'cine-nina-pie').setOrigin(0.5, 1);
    this.sprite.setDepth(PROFUNDIDAD_DETRAS);
    this.sprite.setVisible(false);
  }

  get estadoActual(): EstadoNina {
    return this.estado;
  }

  /**
   * Corre a un nicho y se queda alli mientras dure el peligro (#167): fuera
   * del alcance de todo y siempre a la vista, con su luz.
   */
  esconderEn(x: number, y: number): void {
    if (this.estado === 'escondida') return;
    this.estado = 'escondida';
    this.sprite.setPosition(x, y).setVisible(true).setDepth(PROFUNDIDAD_DETRAS);
    this.posar('cine-nina-pie');
    this.luz ??= this.sprite.scene.add
      .image(x, y - 10, 'brillo-placeholder')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe8c890)
      .setDepth(-3);
    this.luz
      .setPosition(x, y - 10)
      .setAlpha(0.45)
      .setScale(0.55)
      .setVisible(true);
  }

  /** Pasa el peligro: vuelve a su lado en cuanto el pise suelo. */
  salir(): void {
    if (this.estado !== 'escondida') return;
    this.estado = 'sigue';
    this.luz?.setVisible(false);
    this.asentada = false;
    this.enSuelo = 0;
    this.sprite.setVisible(false);
  }

  actualizar(guia: GuiaNina, aCuestas: boolean): void {
    if (this.estado === 'escondida') {
      // Desde el nicho, hacia el.
      this.sprite.setFlipX(guia.x < this.sprite.x);
      return;
    }

    // Si el cae, ella se queda donde esta. Al volver el al Altar, el rastro
    // se rompe por la distancia y ella vuelve a ponerse a su lado.
    if (guia.muerto) {
      this.estado = 'espera';
      this.posar('cine-nina-pie');
      return;
    }

    if (!this.asentada) {
      // Al aterrizar, la fisica aun lo separa del suelo un par de pixeles en
      // el primer fotograma: se espera a que este quieto encima.
      this.enSuelo = guia.suelo ? this.enSuelo + 1 : 0;
      if (this.enSuelo < 3) return;
      this.rastro.reiniciar(guia.x, guia.y, guia.haciaDerecha);
      this.asentada = true;
      this.sprite.setVisible(true);
    }

    if (this.rastro.grabar(guia.x, guia.y, guia.suelo)) {
      // Aparecio lejos de golpe: hasta que aterrice, nada.
      this.asentada = false;
      this.sprite.setVisible(false);
      return;
    }

    if (aCuestas) {
      this.estado = 'a-cuestas';
      const espalda = guia.haciaDerecha ? -1 : 1;
      // Colgada de los hombros, a su espalda: la cabeza asoma junto a la
      // capucha. Delante de el, o su capa la taparia entera.
      this.sprite.setPosition(guia.x + espalda * 10, guia.y - 12);
      this.sprite.setFlipX(!guia.haciaDerecha);
      this.sprite.setDepth(PROFUNDIDAD_DELANTE);
      this.posar('cine-nina-pie-a-cuestas');
      this.recorrido = 0;
      return;
    }

    this.estado = 'sigue';
    this.sprite.setDepth(PROFUNDIDAD_DETRAS);
    const punto = this.rastro.detras;
    const dx = punto.x - this.sprite.x;
    this.ponerEn(punto.x, punto.y);

    // Mira hacia donde anda; parada, hacia el.
    if (Math.abs(dx) > 0.2) this.sprite.setFlipX(dx < 0);
    else this.sprite.setFlipX(guia.x < this.sprite.x);

    if (!punto.suelo || Math.abs(dx) < 0.2) {
      this.recorrido = 0;
      this.posar('cine-nina-pie');
      return;
    }
    this.recorrido += Math.abs(dx);
    this.posar(CICLO_PASO[Math.floor(this.recorrido / PX_POR_CUADRO) % CICLO_PASO.length]);
  }

  private ponerEn(x: number, y: number): void {
    // Pixeles enteros: a media coordenada el dibujo tiembla al andar.
    this.sprite.setPosition(Math.round(x), Math.round(y));
  }

  private posar(clave: string): void {
    if (this.sprite.texture.key !== clave) this.sprite.setTexture(clave);
  }
}
