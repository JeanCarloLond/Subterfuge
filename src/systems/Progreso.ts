import { CODICE } from '../lore/Codice';
import { RELIQUIA } from '../config/Sacramento';

/** Tipos de reliquia. Cada una mejora algo del Cirujano de forma permanente. */
export type TipoReliquia = 'relicario' | 'frasco';

/**
 * Estado de la partida que sobrevive a los cambios de escena.
 *
 * Hoy solo guarda los fragmentos del Codice; el resto (vida, Fervor, pociones)
 * se reinicia por diseno al bajar de zona. Vive fuera de las escenas para que
 * ninguna tenga que ir pasando el estado a la siguiente por parametros.
 */
class Progreso {
  private recogidos = new Set<string>();
  private leidos = new Set<string>();
  private reliquias = new Map<string, TipoReliquia>();

  /** @returns true si es la primera vez que se recoge este fragmento. */
  recogerFragmento(id: string): boolean {
    if (this.recogidos.has(id)) return false;
    this.recogidos.add(id);
    return true;
  }

  marcarLeido(id: string): void {
    this.leidos.add(id);
  }

  estaRecogido(id: string): boolean {
    return this.recogidos.has(id);
  }

  estaLeido(id: string): boolean {
    return this.leidos.has(id);
  }

  get fragmentosRecogidos(): number {
    return this.recogidos.size;
  }

  get fragmentosTotales(): number {
    return CODICE.length;
  }

  get haySinLeer(): boolean {
    return [...this.recogidos].some((id) => !this.leidos.has(id));
  }

  /** Ids recogidos en el orden canonico del Codice, no en el de recogida. */
  get idsRecogidosEnOrden(): string[] {
    return CODICE.map((f) => f.id).filter((id) => this.recogidos.has(id));
  }

  // -- Reliquias -----------------------------------------------------------

  /** @returns true si es la primera vez que se recoge esta reliquia. */
  recogerReliquia(id: string, tipo: TipoReliquia): boolean {
    if (this.reliquias.has(id)) return false;
    this.reliquias.set(id, tipo);
    return true;
  }

  tieneReliquia(id: string): boolean {
    return this.reliquias.has(id);
  }

  get reliquiasRecogidas(): number {
    return this.reliquias.size;
  }

  /**
   * Cuantas reliquias hay repartidas por el Vientre. Se mantiene a mano: dos en
   * el Atrio, dos en los Pasillos, dos en las Criptas y una en las Salas.
   */
  get reliquiasTotales(): number {
    return 7;
  }

  private contar(tipo: TipoReliquia): number {
    return [...this.reliquias.values()].filter((t) => t === tipo).length;
  }

  /** Vitalidad maxima extra acumulada por Relicarios de Carne. */
  get vitalidadExtra(): number {
    return this.contar('relicario') * RELIQUIA.vitalidadExtra;
  }

  /** Cargas de Pocion extra acumuladas por Frascos Consagrados. */
  get pocionesExtra(): number {
    return this.contar('frasco') * RELIQUIA.pocionExtra;
  }

  /** Volver al Atrio desde el cierre empieza una partida limpia. */
  reiniciar(): void {
    this.recogidos.clear();
    this.leidos.clear();
    this.reliquias.clear();
  }
}

export const progreso = new Progreso();
