/** Un punto del camino del Cirujano. */
export interface PuntoRastro {
  x: number;
  y: number;
  /** Si iba pisando suelo: ella anda donde el anduvo y salta donde el salto. */
  suelo: boolean;
}

/** Por debajo de esto no se apunta: quieto no deja rastro (px). */
const PASO_MINIMO = 1;
/** Un salto mayor en un fotograma no es andar: es reaparecer en otro sitio (px). */
const SALTO_DE_SITIO = 64;

/**
 * El camino que deja el Cirujano, para que la niña lo repita (#157).
 *
 * Arcade no tiene navegacion, y una IA que decida donde saltar se equivoca
 * justo donde mas se nota. Ella no decide: va por donde el fue, a una
 * distancia fija DE CAMINO por detras. Si el salto, ella salta en el mismo
 * sitio; si el bajo por una repisa, ella baja por la misma. Como esta siempre
 * a esa distancia de camino, no puede quedarse atras ni perderse.
 *
 * Si el Cirujano aparece lejos de golpe (cae y vuelve al Altar, se continua
 * una partida), el camino se rompe y empieza de nuevo a su lado.
 *
 * Sin Phaser: se prueba en tests/rastro.test.ts.
 */
export class Rastro {
  /** Del mas viejo al mas nuevo; el ultimo es donde esta el Cirujano. */
  private puntos: PuntoRastro[] = [];
  private readonly separacion: number;

  constructor(separacion: number) {
    this.separacion = separacion;
  }

  /** Empieza el camino de cero, con ella `separacion` px por detras. */
  reiniciar(x: number, y: number, haciaDerecha = true): void {
    const atras = haciaDerecha ? -1 : 1;
    this.puntos = [
      { x: x + atras * this.separacion, y, suelo: true },
      { x, y, suelo: true },
    ];
  }

  /**
   * Apunta donde esta el Cirujano ahora.
   * @returns true si el camino se rompio (aparecio lejos de golpe).
   */
  grabar(x: number, y: number, suelo: boolean): boolean {
    const ultimo = this.puntos[this.puntos.length - 1];
    if (!ultimo) {
      this.reiniciar(x, y);
      return true;
    }
    const d = Math.hypot(x - ultimo.x, y - ultimo.y);
    if (d > SALTO_DE_SITIO) {
      this.reiniciar(x, y, x >= ultimo.x);
      return true;
    }
    if (d < PASO_MINIMO) {
      ultimo.suelo = suelo;
      return false;
    }
    this.puntos.push({ x, y, suelo });
    this.recortar();
    return false;
  }

  /** Donde va ella: el punto del camino a `separacion` px por detras de el. */
  get detras(): PuntoRastro {
    let falta = this.separacion;
    for (let i = this.puntos.length - 1; i > 0; i -= 1) {
      const a = this.puntos[i - 1];
      const b = this.puntos[i];
      const tramo = Math.hypot(b.x - a.x, b.y - a.y);
      if (tramo >= falta) {
        const t = tramo === 0 ? 0 : falta / tramo;
        return {
          x: b.x + (a.x - b.x) * t,
          y: b.y + (a.y - b.y) * t,
          // Esta en el aire si el tramo lo estaba.
          suelo: a.suelo && b.suelo,
        };
      }
      falta -= tramo;
    }
    return { ...this.puntos[0] };
  }

  /** Cuantos puntos guarda. Solo los que hacen falta para la separacion. */
  get largo(): number {
    return this.puntos.length;
  }

  /** Tira lo que queda mas atras de la separacion: no hace falta recordarlo. */
  private recortar(): void {
    let acumulado = 0;
    for (let i = this.puntos.length - 1; i > 0; i -= 1) {
      const a = this.puntos[i - 1];
      const b = this.puntos[i];
      acumulado += Math.hypot(b.x - a.x, b.y - a.y);
      if (acumulado > this.separacion) {
        // El punto i-1 es el ultimo que hace falta; lo de antes sobra.
        if (i - 1 > 0) this.puntos.splice(0, i - 1);
        return;
      }
    }
  }
}
