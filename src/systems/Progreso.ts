import { CODICE } from '../lore/Codice';

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

  /** Volver al Atrio desde el cierre empieza una partida limpia. */
  reiniciar(): void {
    this.recogidos.clear();
    this.leidos.clear();
  }
}

export const progreso = new Progreso();
