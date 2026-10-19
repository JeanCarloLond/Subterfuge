import Phaser from 'phaser';
import { MAREAS } from '../config/Sacramento';
import { sonido } from './Sonido';

/** Como se declara la Marea en un nivel. Sin esto, la zona no tiene marea. */
export interface DefinicionMarea {
  /** y del agua en reposo: el fondo de la sala, donde se queda cuando no sube. */
  suelo: number;
  /** Cuanto sube sobre `suelo` (px). Nunca hasta el Altar ni el umbral. */
  alturaMaxima?: number;
  periodoMs?: number;
}

export type EstadoMarea = 'reposo' | 'aviso' | 'subiendo' | 'crecida' | 'bajando';

/** Evento de escena que emite cada cambio de estado, con el estado nuevo. */
export const EVENTO_MAREA = 'marea';

/** Fluido tibio de los ductos: oxido y carne disuelta, no agua limpia. */
const COLOR = 0x5a2a20;
const COLOR_SUPERFICIE = 0xa0583a;

/**
 * Las Mareas del Hambre (#91). Un temporizador, no una simulacion de fluido.
 *
 *   reposo -> aviso -> subiendo -> crecida -> bajando -> reposo
 *
 * El aviso dura lo bastante para ganar altura desde el fondo de una sala. El
 * agua sube y baja con tweens de la escena, asi que se para sola con la pausa
 * y con el Codice: nada de setTimeout. Cada cambio se emite en la escena
 * (`EVENTO_MAREA`) para que lo demas reaccione: el Buitre se va del Altar, el
 * Cuervo grazna, la lluvia arrecia.
 *
 * Herir y devolver al Altar es cosa de la escena, que es quien sabe donde esta
 * el Cirujano y cual fue su ultimo Altar. Esto solo dice donde esta el agua.
 */
export class Marea {
  private readonly escena: Phaser.Scene;
  private readonly suelo: number;
  private readonly alturaMaxima: number;
  private readonly periodo: number;
  private readonly cuerpo: Phaser.GameObjects.Rectangle;
  private readonly borde: Phaser.GameObjects.Rectangle;
  private readonly altoMundo: number;
  private readonly anchoMundo: number;

  private estadoActual: EstadoMarea = 'reposo';
  private nivel = 0;
  private finEstado: number;

  constructor(escena: Phaser.Scene, def: DefinicionMarea, anchoMundo: number, altoMundo: number) {
    this.escena = escena;
    this.suelo = def.suelo;
    this.alturaMaxima = def.alturaMaxima ?? MAREAS.alturaMaxima;
    this.periodo = def.periodoMs ?? MAREAS.periodoMs;
    this.altoMundo = altoMundo;
    this.anchoMundo = anchoMundo;
    this.finEstado = escena.time.now + this.reposoMs;

    // Por delante del Cirujano y con transparencia: se le tiene que ver
    // hundirse, no desaparecer detras.
    this.cuerpo = escena.add
      .rectangle(0, this.suelo, anchoMundo, 0, COLOR, 0.5)
      .setOrigin(0, 0)
      .setDepth(15);
    this.borde = escena.add
      .rectangle(0, this.suelo, anchoMundo, 1, COLOR_SUPERFICIE, 0.7)
      .setOrigin(0, 0)
      .setDepth(15)
      .setVisible(false);
  }

  get estado(): EstadoMarea {
    return this.estadoActual;
  }

  /** y de la superficie del agua. En reposo, el suelo. */
  get superficie(): number {
    return this.suelo - this.nivel;
  }

  /** Hay agua por encima del suelo: puede herir. */
  get haySubida(): boolean {
    return this.nivel > 0;
  }

  /** Lo que queda del periodo cuando no sube ni baja. */
  private get reposoMs(): number {
    const ocupado = MAREAS.avisoMs + MAREAS.subidaMs + MAREAS.crecidaMs + MAREAS.bajadaMs;
    return Math.max(2000, this.periodo - ocupado);
  }

  actualizar(ahora: number): void {
    if (ahora >= this.finEstado) this.avanzar(ahora);
    this.dibujar();
  }

  private avanzar(ahora: number): void {
    switch (this.estadoActual) {
      case 'reposo':
        this.cambiar('aviso', ahora + MAREAS.avisoMs);
        sonido.mareaAviso();
        break;
      case 'aviso':
        this.cambiar('subiendo', ahora + MAREAS.subidaMs);
        this.mover(this.alturaMaxima, MAREAS.subidaMs, 'Sine.easeIn');
        break;
      case 'subiendo':
        this.cambiar('crecida', ahora + MAREAS.crecidaMs);
        break;
      case 'crecida':
        this.cambiar('bajando', ahora + MAREAS.bajadaMs);
        this.mover(0, MAREAS.bajadaMs, 'Sine.easeOut');
        break;
      default:
        this.cambiar('reposo', ahora + this.reposoMs);
    }
  }

  private cambiar(estado: EstadoMarea, fin: number): void {
    this.estadoActual = estado;
    this.finEstado = fin;
    this.escena.events.emit(EVENTO_MAREA, estado);
  }

  private mover(hasta: number, duracion: number, ease: string): void {
    this.escena.tweens.add({ targets: this, nivel: hasta, duration: duracion, ease });
  }

  private dibujar(): void {
    const y = this.superficie;
    this.cuerpo.setPosition(0, y);
    this.cuerpo.setSize(this.anchoMundo, Math.max(0, this.altoMundo - y));
    this.cuerpo.setVisible(this.nivel > 0);
    this.borde.setPosition(0, y);
    this.borde.setVisible(this.nivel > 0);
  }
}
