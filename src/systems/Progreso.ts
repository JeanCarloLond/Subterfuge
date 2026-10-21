import { CODICE_EN_JUEGO } from '../lore/Codice';
import { RELIQUIAS } from '../lore/Reliquias';
import { REGISTRO } from '../lore/Registro';
import { VIENTRE, capasPisadas } from '../lore/Vientre';
import { INJERTADORA, RELIQUIA } from '../config/Sacramento';
import { recordar } from './Memoria';

/** Se devuelve al preguntar por una zona en la que no se ha entrado. */
const VACIO: ReadonlySet<string> = new Set();

/** Tipos de reliquia. Cada una mejora algo del Cirujano de forma permanente. */
export type TipoReliquia = 'relicario' | 'frasco';

/** El Progreso en datos planos, tal como se guarda (ver Guardado.ts). */
export interface ProgresoGuardado {
  recogidos: string[];
  leidos: string[];
  huellas: string[];
  reliquias: [string, TipoReliquia][];
  fichas: string[];
  capas: string[];
  casillas: [string, string[]][];
  mundos: [string, { ancho: number; alto: number }][];
  cargaInjertadora: number;
}

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
  /**
   * Cambios que el Cirujano deja en el Vientre y que siguen ahi al volver a una
   * zona: una Zarza cortada no vuelve a crecer en la partida (#102). Solo vive
   * lo que dura la partida; no se recuerda entre visitas a la web.
   */
  private huellas = new Set<string>();
  private reliquias = new Map<string, TipoReliquia>();
  /** Fichas del Registro ya vistas o tocadas. */
  private fichas = new Set<string>();
  /**
   * Zonas que el Cirujano ha pisado, por clave de escena. Se llaman capas por
   * historia: en el Nivel 1 cada zona era una capa. Ahora la capa V son tres
   * zonas, y `capasPisadas` las agrupa.
   */
  private capas = new Set<string>();
  /**
   * Trozos de cada zona por los que ya se ha pasado, para el mapa.
   *
   * Clave: nombre de escena. Valor: casillas "cx,cy" de la rejilla del mapa.
   * Un Set por zona y no uno global porque el mapa se dibuja zona a zona, y
   * mezclarlas obligaria a partir cadenas en el momento de pintar.
   */
  private casillas = new Map<string, Set<string>>();
  /**
   * Tamaño de cada zona, apuntado al construirla.
   *
   * El mapa necesita saber cuanto mide una zona para dibujarla a escala, y esa
   * medida vive en la definicion del nivel. Se registra al entrar en vez de
   * copiarla al libro: una constante duplicada se desincroniza en cuanto
   * alguien alarga un corredor, y el mapa mentiria sin que nada fallara.
   */
  private mundos = new Map<string, { ancho: number; alto: number }>();
  /**
   * Injertos cargados en la Injertadora.
   *
   * Vive aqui y no en el Cirujano porque cada zona construye un Cirujano
   * nuevo: si la carga viviera en la entidad, bajar un piso vaciaria el arma y
   * la munición que costo pelear se perderia en la puerta.
   */
  private cargaInjertadora: number = INJERTADORA.cargaInicial;

  dejarHuella(id: string): void {
    this.huellas.add(id);
  }

  hayHuella(id: string): boolean {
    return this.huellas.has(id);
  }

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

  /** Las hojas que el juego puede dar: las de los niveles que existen. */
  get fragmentosTotales(): number {
    return CODICE_EN_JUEGO.length;
  }

  /**
   * Cuantas hojas de un nivel se han recogido.
   *
   * El cierre de cada nivel cuenta las SUYAS: el Nivel 1 premia sus 8 aunque el
   * Codice entero tenga mas, y no deja de premiarlas cuando lleguen las otras.
   */
  fragmentosDelNivel(nivel: 1 | 2): number {
    return CODICE_EN_JUEGO.filter((f) => f.nivel === nivel && this.recogidos.has(f.id)).length;
  }

  fragmentosTotalesDelNivel(nivel: 1 | 2): number {
    return CODICE_EN_JUEGO.filter((f) => f.nivel === nivel).length;
  }

  get haySinLeer(): boolean {
    return [...this.recogidos].some((id) => !this.leidos.has(id));
  }

  /** Ids recogidos en el orden canonico del Codice, no en el de recogida. */
  get idsRecogidosEnOrden(): string[] {
    return CODICE_EN_JUEGO.map((f) => f.id).filter((id) => this.recogidos.has(id));
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

  /**
   * Fichas vistas de las que se pueden encontrar hasta ese nivel. El cierre del
   * Nivel 1 no cuenta la Zarza ni la Vena: viven abajo, y contarlas dejaria
   * el Registro incompleto sin manera de completarlo.
   */
  fichasHasta(nivel: 1 | 2): number {
    return REGISTRO.filter((f) => (f.nivel ?? 1) <= nivel && this.fichas.has(f.id)).length;
  }

  fichasTotalesHasta(nivel: 1 | 2): number {
    return REGISTRO.filter((f) => (f.nivel ?? 1) <= nivel).length;
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
    return capasPisadas(this.capas);
  }

  get capasTotales(): number {
    return VIENTRE.length;
  }

  // -- El mapa -------------------------------------------------------------

  /**
   * Apunta que el Cirujano ha estado en esta casilla.
   * @returns true si es la primera vez, por si la escena quiere avisar.
   */
  pisarCasilla(escena: string, cx: number, cy: number): boolean {
    let zona = this.casillas.get(escena);
    if (!zona) {
      zona = new Set();
      this.casillas.set(escena, zona);
    }

    const clave = `${cx},${cy}`;
    if (zona.has(clave)) return false;
    zona.add(clave);
    return true;
  }

  registrarMundo(escena: string, ancho: number, alto: number): void {
    this.mundos.set(escena, { ancho, alto });
  }

  /** Cuanto mide una zona, o undefined si no se ha entrado nunca. */
  mundoDe(escena: string): { ancho: number; alto: number } | undefined {
    return this.mundos.get(escena);
  }

  /** Lo explorado de una zona. Vacio si no se ha entrado nunca. */
  casillasDe(escena: string): ReadonlySet<string> {
    return this.casillas.get(escena) ?? VACIO;
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

  /** Cuantas reliquias hay repartidas por el Vientre: las de src/lore/Reliquias.ts. */
  get reliquiasTotales(): number {
    return RELIQUIAS.length;
  }

  /** Las recogidas de un nivel: cada cierre cuenta las suyas, como el Codice. */
  reliquiasDelNivel(nivel: 1 | 2): number {
    return RELIQUIAS.filter((r) => r.nivel === nivel && this.reliquias.has(r.id)).length;
  }

  reliquiasTotalesDelNivel(nivel: 1 | 2): number {
    return RELIQUIAS.filter((r) => r.nivel === nivel).length;
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

  /**
   * El estado entero, en datos planos que caben en un JSON. Es lo que se
   * guarda al rezar en un Altar (#149): todo lo que se gana y se conserva.
   */
  serializar(): ProgresoGuardado {
    return {
      recogidos: [...this.recogidos],
      leidos: [...this.leidos],
      huellas: [...this.huellas],
      reliquias: [...this.reliquias],
      fichas: [...this.fichas],
      capas: [...this.capas],
      casillas: [...this.casillas].map(([zona, casillas]) => [zona, [...casillas]]),
      mundos: [...this.mundos],
      cargaInjertadora: this.cargaInjertadora,
    };
  }

  /** Lo contrario: deja la partida como estaba al guardarla. */
  restaurar(datos: ProgresoGuardado): void {
    this.reiniciar();
    for (const id of datos.recogidos) this.recogidos.add(id);
    for (const id of datos.leidos) this.leidos.add(id);
    for (const id of datos.huellas) this.huellas.add(id);
    for (const [id, tipo] of datos.reliquias) this.reliquias.set(id, tipo);
    for (const id of datos.fichas) this.fichas.add(id);
    for (const id of datos.capas) this.capas.add(id);
    for (const [zona, casillas] of datos.casillas) this.casillas.set(zona, new Set(casillas));
    for (const [zona, medidas] of datos.mundos) this.mundos.set(zona, medidas);
    this.cargaInjertadora = Math.min(
      INJERTADORA.cargaMaxima,
      Math.max(0, Math.round(datos.cargaInjertadora)),
    );
  }

  /** Volver al Atrio desde el cierre empieza una partida limpia. */
  reiniciar(): void {
    this.recogidos.clear();
    this.leidos.clear();
    this.huellas.clear();
    this.reliquias.clear();
    this.fichas.clear();
    this.capas.clear();
    this.casillas.clear();
    this.mundos.clear();
    this.cargaInjertadora = INJERTADORA.cargaInicial;
  }
}

export const progreso = new Progreso();
