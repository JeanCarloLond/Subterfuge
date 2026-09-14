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
  private maxima_: number;
  private actual: number;

  constructor(maxima: number) {
    super();
    this.maxima_ = maxima;
    this.actual = maxima;
  }

  get puntos(): number {
    return this.actual;
  }

  get maxima(): number {
    return this.maxima_;
  }

  /** Una reliquia amplia el maximo y cura esa misma cantidad. */
  aumentarMaximo(cantidad: number): void {
    this.maxima_ += cantidad;
    this.actual = Math.min(this.maxima_, this.actual + cantidad);
    this.emit('cambio', this.actual, this.maxima_);
  }

  get estaMuerto(): boolean {
    return this.actual <= 0;
  }

  /** @returns true si el dano se aplico (false si ya estaba muerto). */
  recibirDano(cantidad: number): boolean {
    if (this.estaMuerto) return false;

    this.actual = Math.max(0, this.actual - cantidad);
    this.emit('cambio', this.actual, this.maxima_);
    this.emit('herido', cantidad);

    if (this.estaMuerto) this.emit('muerte');
    return true;
  }

  curar(cantidad: number): void {
    if (this.estaMuerto) return;

    this.actual = Math.min(this.maxima_, this.actual + cantidad);
    this.emit('cambio', this.actual, this.maxima_);
  }

  restaurar(): void {
    this.actual = this.maxima_;
    this.emit('cambio', this.actual, this.maxima_);
  }
}
