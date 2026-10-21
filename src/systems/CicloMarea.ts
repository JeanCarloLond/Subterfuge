import { MAREAS } from '../config/Sacramento';

/*
 * La parte de la Marea que no dibuja nada (#163): su region, su cresta y
 * su ciclo. Sin Phaser, para poder probarla (tests/marea.test.ts).
 */

/** Como se declara una Marea en un nivel. Sin ninguna, la zona no tiene marea. */
export interface DefinicionMarea {
  /** y del agua en reposo: el fondo de la sala, donde se queda cuando no sube. */
  suelo: number;
  /** Cuanto sube sobre `suelo` (px). Nunca hasta el Altar ni el umbral. */
  alturaMaxima?: number;
  periodoMs?: number;
  /**
   * De donde a donde llega el agua (#163). Sin indicar, todo el ancho del
   * mundo. Una sala inundable entre dos muros es una region; el resto de la
   * zona sigue seco.
   */
  x0?: number;
  x1?: number;
  /** Cuanto tarda el primer aviso de mas, para que dos mareas no suban a la vez (ms). */
  desfaseMs?: number;
}

export type EstadoMarea = 'reposo' | 'aviso' | 'subiendo' | 'crecida' | 'bajando';

/** Hasta donde llega el agua, en x. */
export function regionDe(def: DefinicionMarea, anchoMundo: number): { x0: number; x1: number } {
  return { x0: def.x0 ?? 0, x1: def.x1 ?? anchoMundo };
}

/** y de la crecida: lo mas alto que sube. Ahi quedan las marcas de sedimento. */
export function crestaDe(def: DefinicionMarea): number {
  return def.suelo - (def.alturaMaxima ?? MAREAS.alturaMaxima);
}

/** Lo que queda del periodo cuando no sube ni baja. */
export function reposoMs(periodo: number): number {
  const ocupado = MAREAS.avisoMs + MAREAS.subidaMs + MAREAS.crecidaMs + MAREAS.bajadaMs;
  return Math.max(2000, periodo - ocupado);
}

/**
 * El ciclo de una Marea, sin Phaser: que estado toca y hasta cuando.
 *
 *   reposo -> aviso -> subiendo -> crecida -> bajando -> reposo
 */
export class CicloMarea {
  private estadoActual: EstadoMarea = 'reposo';
  private fin: number;
  private readonly periodo: number;

  constructor(periodo: number, ahora: number, desfaseMs = 0) {
    this.periodo = periodo;
    this.fin = ahora + reposoMs(periodo) + desfaseMs;
  }

  get estado(): EstadoMarea {
    return this.estadoActual;
  }

  get finEstado(): number {
    return this.fin;
  }

  /** @returns el estado nuevo si toca cambiar, o null si sigue igual. */
  avanzar(ahora: number): EstadoMarea | null {
    if (ahora < this.fin) return null;
    const [siguiente, dura]: [EstadoMarea, number] =
      this.estadoActual === 'reposo'
        ? ['aviso', MAREAS.avisoMs]
        : this.estadoActual === 'aviso'
          ? ['subiendo', MAREAS.subidaMs]
          : this.estadoActual === 'subiendo'
            ? ['crecida', MAREAS.crecidaMs]
            : this.estadoActual === 'crecida'
              ? ['bajando', MAREAS.bajadaMs]
              : ['reposo', reposoMs(this.periodo)];
    this.estadoActual = siguiente;
    this.fin = ahora + dura;
    return siguiente;
  }
}
