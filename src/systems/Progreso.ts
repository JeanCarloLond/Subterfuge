import { CODICE } from '../lore/Codice';
import { REGISTRO } from '../lore/Registro';
import { VIENTRE } from '../lore/Vientre';
import { INJERTADORA, RELIQUIA } from '../config/Sacramento';
import { recordar } from './Memoria';

/** Tipos de reliquia. Cada una mejora algo del Cirujano de forma permanente. */
export type TipoReliquia = 'relicario' | 'frasco';

/**
 * Estado de la partida que sobrevive a los cambios de escena.
 *
 * Guarda lo que se gana y se conserva: fragmentos, reliquias, lo catalogado y
 * la carga de la Injertadora. El resto (vida, Fervor, pociones) se reinicia por
 * diseno al bajar de zona. Vive fuera de las escenas para que
 * ninguna tenga que ir pasando el estado a la siguiente por parametros.
 */
class Progreso {
  private recogidos = new Set<string>();
  private leidos = new Set<string>();
  private reliquias = new Map<string, TipoReliquia>();
  /** Fichas del Registro ya vistas o tocadas. */
  private fichas = new Set<string>();
  /** Capas del Vientre que el Cirujano ha pisado. */
  private capas = new Set<string>();
  /**
   * Injertos cargados en la Injertadora.
   *
   * Vive aqui y no en el Cirujano porque cada zona construye un Cirujano
   * nuevo: si la carga viviera en la entidad, bajar un piso vaciaria el arma y
   * la munición que costo pelear se perderia en la puerta.
   */
  private cargaInjertadora: number = INJERTADORA.cargaInicial;

  /** @returns true si es la primera vez que se recoge este fragmento. */
  recogerFragmento(id: string): boolean {
    if (this.recogidos.has(id)) return false;
    this.recogidos.add(id);
    recordar('fragmentos', id);
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

  // -- El Registro ----------------------------------------------------------

  /**
   * Da por descubierta una ficha. Se llama en cuanto el jugador VE la cosa, no
   * cuando la mata: el Registro es un catalogo de lo que existe, y ver a un
   * Vestal desde lejos ya cuenta como haberlo encontrado.
   *
   * @returns true si es la primera vez, para que la escena avise.
   */
  descubrir(id: string): boolean {
    if (this.fichas.has(id)) return false;
    this.fichas.add(id);
    recordar('fichas', id);
    return true;
  }

  estaDescubierto(id: string): boolean {
    return this.fichas.has(id);
  }

  get fichasDescubiertas(): number {
    return this.fichas.size;
  }

  get fichasTotales(): number {
    return REGISTRO.length;
  }

  // -- El Vientre -----------------------------------------------------------

  /** @returns true si es la primera vez que se pisa esta capa. */
  pisarCapa(escena: string): boolean {
    if (this.capas.has(escena)) return false;
    this.capas.add(escena);
    recordar('capas', escena);
    return true;
  }

  estaPisada(escena: string): boolean {
    return this.capas.has(escena);
  }

  get capasPisadas(): number {
    return this.capas.size;
  }

  get capasTotales(): number {
    return VIENTRE.length;
  }

  // -- La Injertadora ------------------------------------------------------

  get injertos(): number {
    return this.cargaInjertadora;
  }

  get injertosMaximos(): number {
    return INJERTADORA.cargaMaxima;
  }

  /** @returns true si el injerto entro; false si el arma ya estaba llena. */
  cargarInjerto(cantidad: number): boolean {
    if (this.cargaInjertadora >= INJERTADORA.cargaMaxima) return false;
    this.cargaInjertadora = Math.min(INJERTADORA.cargaMaxima, this.cargaInjertadora + cantidad);
    return true;
  }

  /** @returns true si habia con que disparar. */
  gastarInjerto(): boolean {
    if (this.cargaInjertadora <= 0) return false;
    this.cargaInjertadora -= 1;
    return true;
  }

  // -- Reliquias -----------------------------------------------------------

  /** @returns true si es la primera vez que se recoge esta reliquia. */
  recogerReliquia(id: string, tipo: TipoReliquia): boolean {
    if (this.reliquias.has(id)) return false;
    this.reliquias.set(id, tipo);
    recordar('reliquias', id);
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
    this.fichas.clear();
    this.capas.clear();
    this.cargaInjertadora = INJERTADORA.cargaInicial;
  }
}

export const progreso = new Progreso();
