import type Phaser from 'phaser';
import type { TipoOfrenda } from '../objetos/Ofrenda';
import type { EstadoCirujano, ResultadoDano } from './CirujanoSacerdote';
import type { RangoPatrulla } from './Devoto';
import type { DestinoCura } from '../systems/Frasco';
import { Alfombra } from './Alfombra';
import { Buitre } from './Buitre';
import { Cerdo } from './Cerdo';
import { Cuervo } from './Cuervo';
import { FlorDeHueso } from './FlorDeHueso';
import { GuardiaCruzada } from './GuardiaCruzada';
import { Cazarrecompensas } from './Cazarrecompensas';
import type { Contrato, Habitante } from './Habitante';
import { Hongo } from './Hongo';
import { Mata } from './Mata';
import { Mondador } from './Mondador';
import { PuenteTejido } from './PuenteTejido';
import { Remedo } from './Remedo';
import { SerpienteDeTejido } from './SerpienteDeTejido';
import { Vena } from './Vena';
import { Zarza } from './Zarza';

/**
 * Como declara un nivel lo que lo habita (issue #90).
 *
 * Una sola lista de definiciones con un `tipo` en vez de un campo por especie
 * en `DefinicionNivel`: con once especies, la interfaz del nivel se volveria
 * una lista interminable y cada bicho nuevo obligaria a tocar `EscenaNivel`.
 * Anadir una especie es esto:
 *
 *   1. Su entrada en `CriaturaDef`, con lo que necesita para colocarse.
 *   2. Su clase, que cumpla `Habitante` (y `Enemigo` si se puede herir).
 *   3. Su fabrica en `FABRICAS`.
 *
 * La escena no cambia.
 */
export type CriaturaDef =
  | { tipo: 'remedo'; x: number; y: number; ronda?: RangoPatrulla; huyendo?: boolean }
  | { tipo: 'serpiente'; x: number; y: number; arena: RangoPatrulla }
  | { tipo: 'mondador'; ruta: readonly (readonly [number, number])[] }
  | { tipo: 'buitre'; x: number; y: number }
  | { tipo: 'cerdo'; x: number; y: number; ronda: RangoPatrulla }
  | { tipo: 'cuervo'; posaderos: readonly (readonly [number, number])[] }
  | {
      tipo: 'zarza';
      x: number;
      y: number;
      altoTiles: number;
      anchoTiles?: number;
      /** Un Remedo escondido entre las puas: sale al cortarla (#102). */
      remedo?: boolean;
    }
  | { tipo: 'alfombra'; x: number; y: number; anchoTiles: number }
  | { tipo: 'mata'; x: number; y: number }
  | { tipo: 'vena'; x: number; y: number; altoTiles: number }
  | { tipo: 'hongo'; x: number; y: number }
  | { tipo: 'flor'; x: number; y: number }
  /** (x, y): borde izquierdo del hueco, a la altura del suelo; crece a la derecha. */
  | { tipo: 'tejido'; x: number; y: number; anchoTiles: number }
  | { tipo: 'guardia'; x: number; y: number; ronda: RangoPatrulla }
  | { tipo: 'cazador'; x: number; y: number; ronda: RangoPatrulla };

export type TipoCriatura = CriaturaDef['tipo'];

/**
 * A que contrato pertenece cada especie. Esta aqui, y no solo en la clase,
 * para que se lea de un vistazo quien se puede matar y quien no.
 *
 * Mueren el Remedo, la Serpiente y el Cerdo; el Cerdo no ataca, pero es ganado
 * y se puede matar (#100). La Zarza y la Alfombra son peligros: se cortan, no se
 * matan. El resto no se toca, y el Mondador menos que nadie (el culto lo tiene
 * por sagrado y casi no quedan).
 */
export const CONTRATO: Readonly<Record<TipoCriatura, Contrato>> = {
  remedo: 'hostil',
  serpiente: 'hostil',
  mondador: 'neutral',
  buitre: 'neutral',
  // Se puede matar (#100): es ganado de los linajes. No ataca ni hiere al rozarlo.
  cerdo: 'hostil',
  cuervo: 'neutral',
  mata: 'neutral',
  hongo: 'neutral',
  flor: 'neutral',
  tejido: 'neutral',
  guardia: 'hostil',
  cazador: 'hostil',
  zarza: 'peligro',
  alfombra: 'peligro',
  vena: 'peligro',
};

/**
 * La ficha del Registro de cada especie. Por defecto el id es el propio tipo;
 * se escribe entero para que cambiar uno no dependa de una regla implicita.
 */
export const FICHA_DE_CRIATURA: Readonly<Record<TipoCriatura, string>> = {
  remedo: 'remedo',
  serpiente: 'serpiente',
  mondador: 'mondador',
  buitre: 'buitre',
  cerdo: 'cerdo',
  cuervo: 'cuervo',
  zarza: 'zarza',
  alfombra: 'alfombra',
  mata: 'mata',
  vena: 'vena',
  hongo: 'hongo',
  flor: 'flor-de-hueso',
  // Sin ficha: es la Injertadora haciendo su oficio, no una especie. El id no
  // existe en el Registro, asi que verlo no cataloga nada.
  tejido: 'tejido',
  guardia: 'guardia',
  cazador: 'cazador',
};

/**
 * Lo que una criatura puede saber del Cirujano. Solo lectura: la criatura
 * reacciona a el, no lo mueve (salvo la Alfombra, por `frenarJugador`).
 */
export interface VistaJugador {
  readonly x: number;
  readonly y: number;
  readonly velocidadX: number;
  readonly estado: EstadoCirujano;
  readonly estaMuerto: boolean;
  /** Ha pulsado E este fotograma. */
  readonly interactuar: boolean;
}

/** Lo que una fabrica necesita del nivel para colocar su criatura. */
export interface ContextoCriatura {
  escena: Phaser.Scene;
  /** La piedra, para las que andan o se posan. */
  suelos: Phaser.Physics.Arcade.StaticGroup;
  jugador: VistaJugador;
  /**
   * Hiere al Cirujano como un golpe: respeta la invulnerabilidad, el dash y el
   * parry. Dice como acabo, para que quien embiste sepa si se lo pararon.
   */
  herir(cantidad: number, origenX: number): ResultadoDano;
  /** Deja una ofrenda en el suelo, como al caer un enemigo. */
  soltarOfrenda(x: number, y: number, tipo: TipoOfrenda): void;
  /** La barra de vida de un jefe: con puntos < 0 se oculta. */
  barraDeJefe(puntos: number, maximo: number, cortes?: readonly number[]): void;
  /** El nombre de un jefe, en grande y una vez. */
  presentar(titulo: string, subtitulo: string): void;
  /** Cura, o si el cuerpo esta entero, llena el frasco (#174). */
  curar(cantidad: number): DestinoCura;
  ganarFervor(cantidad: number): void;
  /**
   * Pone otra criatura en el nivel, ya en marcha: el Remedo que sale de la
   * Zarza al cortarla. Entra en su grupo como las del principio.
   */
  crear(def: CriaturaDef): void;
  /** Un aviso en el HUD, como los del Registro. */
  avisar(texto: string): void;
  /** Hace solido un objeto para el Cirujano: la Zarza cierra el paso. */
  bloquear(objeto: Phaser.GameObjects.GameObject): Phaser.Physics.Arcade.Collider;
  /**
   * Quita vida sin empujon ni aturdimiento: la Alfombra digiere despacio, y un
   * golpe con retroceso soltaria al Cirujano al primer mordisco.
   */
  desgastar(cantidad: number): void;
  /**
   * Un proyectil que se para con el parry y vuelve contra quien lo lanzo
   * (#167). Devuelto quita `danoDevuelto`.
   */
  escupir(x: number, y: number, direccion: number, danoDevuelto: number): void;
  /** Tira del Cirujano en horizontal a esa velocidad (px/s): el garfio (#164). */
  arrastrarJugador(velocidadX: number): void;
  /**
   * Gasta un injerto de la Injertadora. Si no hay, avisa y devuelve false:
   * pulsar y que no pase nada se lee como un boton roto.
   */
  gastarInjerto(): boolean;
  /** Anula el avance horizontal del Cirujano este fotograma. */
  frenarJugador(): void;
  /**
   * El Cirujano esta lo bastante cerca para oir esto. Los sonidos que se
   * repiten solos (graznidos, ronroneos, el pulso de la Vena) solo suenan asi:
   * si no, el nivel entero seria un coro.
   */
  oye(x: number, y: number): boolean;
  /** Clave de la escena, para que lo que se corta siga cortado al volver. */
  readonly zona: string;
}

type Fabrica<T extends TipoCriatura> = (
  contexto: ContextoCriatura,
  def: Extract<CriaturaDef, { tipo: T }>,
) => Habitante;

/** Una fabrica por especie. Cada especie entra con su issue (#96 a #104, #125). */
const FABRICAS: { readonly [T in TipoCriatura]?: Fabrica<T> } = {
  remedo: (ctx, d) => new Remedo(ctx, d.x, d.y, d.ronda, d.huyendo),
  mondador: (ctx, d) => new Mondador(ctx, d.ruta),
  buitre: (ctx, d) => new Buitre(ctx, d.x, d.y),
  cerdo: (ctx, d) => new Cerdo(ctx, d.x, d.y, d.ronda),
  cuervo: (ctx, d) => new Cuervo(ctx, d.posaderos),
  zarza: (ctx, d) => new Zarza(ctx, d.x, d.y, d.altoTiles, d.anchoTiles, d.remedo),
  serpiente: (ctx, d) => new SerpienteDeTejido(ctx, d.x, d.y, d.arena),
  vena: (ctx, d) => new Vena(ctx, d.x, d.y, d.altoTiles),
  alfombra: (ctx, d) => new Alfombra(ctx, d.x, d.y, d.anchoTiles),
  mata: (ctx, d) => new Mata(ctx, d.x, d.y),
  hongo: (ctx, d) => new Hongo(ctx, d.x, d.y),
  flor: (ctx, d) => new FlorDeHueso(ctx, d.x, d.y),
  tejido: (ctx, d) => new PuenteTejido(ctx, d.x, d.y, d.anchoTiles),
  guardia: (ctx, d) => new GuardiaCruzada(ctx, d.x, d.y, d.ronda),
  cazador: (ctx, d) => new Cazarrecompensas(ctx, d.x, d.y, d.ronda),
};

/**
 * Crea la criatura que describe `def`.
 *
 * Una especie declarada en un nivel pero sin clase todavia FALLA al cargar, y
 * no en silencio: un nivel al que le falta su depredador sin que nadie se de
 * cuenta es peor que uno que no arranca.
 */
export function crearCriatura(contexto: ContextoCriatura, def: CriaturaDef): Habitante {
  const fabrica = FABRICAS[def.tipo] as Fabrica<typeof def.tipo> | undefined;
  if (!fabrica) {
    throw new Error(`La criatura "${def.tipo}" esta en el nivel pero aun no tiene clase.`);
  }
  return fabrica(contexto, def as never);
}
