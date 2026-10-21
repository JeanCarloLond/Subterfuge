/**
 * El conteo del instrumental (#160), sin Phaser: que pieza es cual.
 *
 * Antes de cada sacramento las Manos cuentan las piezas dos veces, por si
 * alguna es un Remedo: la imitacion es de forma y color, no de temperatura, y
 * "un bisturi tibio es un Remedo". En la bandeja hay un bisturi de verdad
 * entre Remedos; los Remedos tiemblan y el bisturi no.
 *
 * No se puede fracasar. Coger un Remedo cuesta un mordisco: el Remedo huye, la
 * bandeja se vuelve a contar (las piezas cambian de sitio) y queda una menos.
 * Al final, como mucho, solo queda el bisturi.
 */
export type ResultadoConteo = 'bisturi' | 'remedo';

export class Conteo {
  /** Las piezas en la bandeja, de izquierda a derecha. true: el bisturi. */
  private piezas: boolean[];
  private recogido = false;
  /** Inyectable para que los tests no dependan de la suerte. */
  private readonly azar: () => number;

  constructor(cuantas: number, azar: () => number = Math.random) {
    this.azar = azar;
    const n = Math.max(1, Math.floor(cuantas));
    this.piezas = Array.from({ length: n }, () => false);
    this.piezas[Math.floor(this.azar() * n)] = true;
  }

  get cuantas(): number {
    return this.piezas.length;
  }

  get terminado(): boolean {
    return this.recogido;
  }

  /** Si la pieza de ese sitio es un Remedo, y por tanto tiembla. */
  tiembla(i: number): boolean {
    return !this.recogido && this.piezas[i] === false;
  }

  /**
   * Se coge la pieza de ese sitio. Un Remedo sale de la bandeja; el bisturi
   * termina el conteo.
   */
  tomar(i: number): ResultadoConteo | null {
    if (this.recogido || i < 0 || i >= this.piezas.length) return null;
    if (this.piezas[i]) {
      this.recogido = true;
      return 'bisturi';
    }
    this.piezas.splice(i, 1);
    return 'remedo';
  }

  /** Se vuelve a contar: las mismas piezas, en otro orden (Fisher-Yates). */
  recontar(): void {
    for (let i = this.piezas.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.azar() * (i + 1));
      [this.piezas[i], this.piezas[j]] = [this.piezas[j], this.piezas[i]];
    }
  }
}
