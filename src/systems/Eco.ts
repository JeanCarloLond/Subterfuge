/**
 * El camino del Cirujano, repetido con retraso (#162), sin Phaser.
 *
 * En las persecuciones, lo que viene detras no piensa: va exactamente por
 * donde fue el Cirujano, un rato despues (como la sombra de Celeste). Es
 * justo, porque si el pudo pasar, el perseguidor tambien; y no necesita
 * navegacion, que Arcade no tiene.
 */
interface Muestra {
  t: number;
  x: number;
  y: number;
}

export class Eco {
  private muestras: Muestra[] = [];
  private readonly retrasoMs: number;

  constructor(retrasoMs: number) {
    this.retrasoMs = retrasoMs;
  }

  /** Empieza de cero: el perseguidor no aparece hasta que haya camino detras. */
  reiniciar(): void {
    this.muestras = [];
  }

  grabar(t: number, x: number, y: number): void {
    this.muestras.push({ t, x, y });
    // Lo que queda mas atras que el retraso ya no lo va a necesitar nadie.
    const limite = t - this.retrasoMs - 200;
    while (this.muestras.length > 2 && this.muestras[1].t < limite) this.muestras.shift();
  }

  /** Donde va el perseguidor en `t`: donde estaba el Cirujano hace `retrasoMs`. */
  donde(t: number): { x: number; y: number } | null {
    const objetivo = t - this.retrasoMs;
    const m = this.muestras;
    if (m.length === 0 || objetivo < m[0].t) return null;
    for (let i = 1; i < m.length; i += 1) {
      if (m[i].t >= objetivo) {
        const a = m[i - 1];
        const b = m[i];
        const f = b.t === a.t ? 0 : (objetivo - a.t) / (b.t - a.t);
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      }
    }
    const ultima = m[m.length - 1];
    return { x: ultima.x, y: ultima.y };
  }
}

/** El ultimo punto de vuelta por el que ha pasado: el siguiente al que ya tenia, si lo toca. */
export function avanzarVuelta(
  vueltas: ReadonlyArray<readonly [number, number]>,
  actual: number,
  x: number,
  y: number,
  radio = 28,
): number {
  for (let i = vueltas.length - 1; i > actual; i -= 1) {
    const [vx, vy] = vueltas[i];
    if (Math.abs(vx - x) <= radio && Math.abs(vy - y) <= radio) return i;
  }
  return actual;
}
