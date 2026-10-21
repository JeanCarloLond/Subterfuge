/**
 * Frases que se turnan y no se repiten en bucle (#175).
 *
 * Una frase sobre la cabeza que sale cada vez que se pulsa una tecla deja de
 * ser una voz y pasa a ser ruido. Cada grupo de frases va en orden, y entre una
 * y otra hay un respiro: lo que se pide antes, no se dice.
 *
 * Sin Phaser: se prueba en tests/turnos.test.ts.
 */
export class Turnos {
  private readonly lineas: readonly string[];
  private readonly esperaMs: number;
  private indice = 0;
  private libreDesde = -Infinity;

  constructor(lineas: readonly string[], esperaMs: number) {
    this.lineas = lineas;
    this.esperaMs = esperaMs;
  }

  /** La frase que toca, o null si aun no ha pasado el respiro (o no hay frases). */
  siguiente(ahora: number): string | null {
    if (this.lineas.length === 0 || ahora < this.libreDesde) return null;
    const linea = this.lineas[this.indice % this.lineas.length];
    this.indice += 1;
    this.libreDesde = ahora + this.esperaMs;
    return linea;
  }
}
