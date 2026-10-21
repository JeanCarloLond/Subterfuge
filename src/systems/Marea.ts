import Phaser from 'phaser';
import { MAREAS } from '../config/Sacramento';
import { sonido } from './Sonido';
import {
  CicloMarea,
  crestaDe,
  regionDe,
  type DefinicionMarea,
  type EstadoMarea,
} from './CicloMarea';

export type { DefinicionMarea, EstadoMarea } from './CicloMarea';

/** Evento de escena que emite cada cambio de estado, con el estado nuevo. */
export const EVENTO_MAREA = 'marea';

/** Fluido tibio de los ductos: oxido y carne disuelta, no agua limpia. */
const COLOR = 0x5a2a20;
const COLOR_SUPERFICIE = 0xa0583a;
/** La costra que deja el agua donde se para: mas oscura que la piedra. */
const COLOR_SEDIMENTO = 0x3a2418;

/**
 * Las Mareas del Hambre (#91). Un temporizador, no una simulacion de fluido.
 *
 * El aviso dura lo bastante para ganar altura desde el fondo de una sala. El
 * agua sube y baja con tweens de la escena, asi que se para sola con la pausa
 * y con el Codice: nada de setTimeout. Cada cambio se emite en la escena
 * (`EVENTO_MAREA`) para que lo demas reaccione: el Buitre se va del Altar, el
 * Cuervo grazna, la lluvia arrecia.
 *
 * Cada una inunda su region (#163), y deja en la pared una raya de sedimento
 * hasta donde llega: cualquiera sabe que es seguro sin leer nada, y como se
 * dibuja con la misma cresta que sube el agua, no puede mentir.
 *
 * Herir y devolver al Altar es cosa de la escena, que es quien sabe donde esta
 * el Cirujano y cual fue su ultimo Altar. Esto solo dice donde esta el agua.
 */
export class Marea {
  private readonly escena: Phaser.Scene;
  private readonly suelo: number;
  private readonly alturaMaxima: number;
  private readonly ciclo: CicloMarea;
  private readonly cuerpo: Phaser.GameObjects.Rectangle;
  private readonly borde: Phaser.GameObjects.Rectangle;
  private readonly altoMundo: number;
  private readonly x0: number;
  private readonly x1: number;

  private nivel = 0;

  constructor(escena: Phaser.Scene, def: DefinicionMarea, anchoMundo: number, altoMundo: number) {
    this.escena = escena;
    this.suelo = def.suelo;
    this.alturaMaxima = def.alturaMaxima ?? MAREAS.alturaMaxima;
    this.ciclo = new CicloMarea(def.periodoMs ?? MAREAS.periodoMs, escena.time.now, def.desfaseMs);
    this.altoMundo = altoMundo;
    ({ x0: this.x0, x1: this.x1 } = regionDe(def, anchoMundo));
    const ancho = this.x1 - this.x0;

    // Por delante del Cirujano y con transparencia: se le tiene que ver
    // hundirse, no desaparecer detras.
    this.cuerpo = escena.add
      .rectangle(this.x0, this.suelo, ancho, 0, COLOR, 0.5)
      .setOrigin(0, 0)
      .setDepth(15);
    this.borde = escena.add
      .rectangle(this.x0, this.suelo, ancho, 1, COLOR_SUPERFICIE, 0.7)
      .setOrigin(0, 0)
      .setDepth(15)
      .setVisible(false);
    this.dibujarSedimento(crestaDe(def), ancho);
  }

  get estado(): EstadoMarea {
    return this.ciclo.estado;
  }

  /** y de la superficie del agua. En reposo, el suelo. */
  get superficie(): number {
    return this.suelo - this.nivel;
  }

  /** Hay agua por encima del suelo: puede herir. */
  get haySubida(): boolean {
    return this.nivel > 0;
  }

  /** Si esa x esta dentro de lo que inunda. */
  cubre(x: number): boolean {
    return x >= this.x0 && x <= this.x1;
  }

  actualizar(ahora: number): void {
    const nuevo = this.ciclo.avanzar(ahora);
    if (nuevo) this.alCambiar(nuevo);
    this.dibujar();
  }

  private alCambiar(estado: EstadoMarea): void {
    if (estado === 'aviso') sonido.mareaAviso();
    if (estado === 'subiendo') {
      sonido.mareaSube();
      this.mover(this.alturaMaxima, MAREAS.subidaMs, 'Sine.easeIn');
    }
    if (estado === 'bajando') {
      sonido.mareaBaja();
      this.mover(0, MAREAS.bajadaMs, 'Sine.easeOut');
    }
    this.escena.events.emit(EVENTO_MAREA, estado);
  }

  private mover(hasta: number, duracion: number, ease: string): void {
    this.escena.tweens.add({ targets: this, nivel: hasta, duration: duracion, ease });
  }

  /**
   * La raya de la crecida y la costra que gotea por debajo. Puntos fijos, no
   * al azar: la misma pared se ve igual en cada partida.
   */
  private dibujarSedimento(cresta: number, ancho: number): void {
    const marcas = this.escena.add.graphics().setDepth(-3);
    marcas.fillStyle(COLOR_SEDIMENTO, 0.85);
    marcas.fillRect(this.x0, cresta, ancho, 2);
    marcas.fillStyle(COLOR_SEDIMENTO, 0.5);
    for (let x = this.x0 + 3; x < this.x1 - 2; x += 7) {
      const largo = 2 + ((x * 7) % 5);
      marcas.fillRect(x, cresta + 2, 1, largo);
    }
  }

  private dibujar(): void {
    const y = this.superficie;
    this.cuerpo.setPosition(this.x0, y);
    this.cuerpo.setSize(this.x1 - this.x0, Math.max(0, this.altoMundo - y));
    this.cuerpo.setVisible(this.nivel > 0);
    this.borde.setPosition(this.x0, y);
    this.borde.setVisible(this.nivel > 0);
  }
}
