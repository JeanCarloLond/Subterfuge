import Phaser from 'phaser';
import { FERVOR } from '../config/Sacramento';

/**
 * Fervor: la devocion como recurso jugable.
 *
 * No se regenera con el tiempo. Solo se gana hiriendo y parando golpes, porque
 * en la Diocesis la fe no se contempla: se demuestra con el cuerpo. Gastarlo en
 * el ataque cargado es, literalmente, gastar devocion.
 */
export class Fervor extends Phaser.Events.EventEmitter {
  private actual: number = FERVOR.inicial;

  get puntos(): number {
    return this.actual;
  }

  get estaLleno(): boolean {
    return this.actual >= FERVOR.maximo;
  }

  alcanzaPara(coste: number): boolean {
    return this.actual >= coste;
  }

  ganar(cantidad: number): void {
    const previo = this.actual;
    this.actual = Math.min(FERVOR.maximo, this.actual + cantidad);
    if (this.actual !== previo) this.emit('cambio', this.actual, FERVOR.maximo);
  }

  /** @returns true si habia suficiente y se consumio. */
  gastar(cantidad: number): boolean {
    if (!this.alcanzaPara(cantidad)) return false;

    this.actual -= cantidad;
    this.emit('cambio', this.actual, FERVOR.maximo);
    return true;
  }

  reiniciar(): void {
    this.actual = FERVOR.inicial;
    this.emit('cambio', this.actual, FERVOR.maximo);
  }
}
