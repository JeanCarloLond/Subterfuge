import Phaser from 'phaser';

/** Eventos emitidos al cambiar la vitalidad. */
export type EventoVitalidad = 'cambio' | 'herido' | 'muerte';

/**
 * Vitalidad de una criatura: puntos de vida, dano y curacion.
 *
 * Deliberadamente agnostico de Phaser salvo por el emisor de eventos, para que
 * lo usen tanto el Cirujano como los enemigos sin duplicar logica.
 */
export class Vitalidad extends Phaser.Events.EventEmitter {
  readonly maxima: number;
  private actual: number;

  constructor(maxima: number) {
    super();
    this.maxima = maxima;
    this.actual = maxima;
  }

  get puntos(): number {
    return this.actual;
  }

  get estaMuerto(): boolean {
    return this.actual <= 0;
  }

  /** @returns true si el dano se aplico (false si ya estaba muerto). */
  recibirDano(cantidad: number): boolean {
    if (this.estaMuerto) return false;

    this.actual = Math.max(0, this.actual - cantidad);
    this.emit('cambio', this.actual, this.maxima);
    this.emit('herido', cantidad);

    if (this.estaMuerto) this.emit('muerte');
    return true;
  }

  curar(cantidad: number): void {
    if (this.estaMuerto) return;

    this.actual = Math.min(this.maxima, this.actual + cantidad);
    this.emit('cambio', this.actual, this.maxima);
  }

  restaurar(): void {
    this.actual = this.maxima;
    this.emit('cambio', this.actual, this.maxima);
  }
}
