import type Phaser from 'phaser';
import type { RangoPatrulla } from './Devoto';
import type { Contrato, Habitante } from './Habitante';

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
  | { tipo: 'remedo'; x: number; y: number; ronda?: RangoPatrulla }
  | { tipo: 'serpiente'; x: number; y: number; arena: RangoPatrulla }
  | { tipo: 'mondador'; ruta: readonly (readonly [number, number])[] }
  | { tipo: 'buitre'; x: number; y: number }
  | { tipo: 'cerdo'; x: number; y: number; ronda: RangoPatrulla }
  | { tipo: 'cuervo'; posaderos: readonly (readonly [number, number])[] }
  | { tipo: 'zarza'; x: number; y: number; altoTiles: number; anchoTiles?: number }
  | { tipo: 'alfombra'; x: number; y: number; anchoTiles: number }
  | { tipo: 'mata'; x: number; y: number }
  | { tipo: 'vena'; x: number; y: number; altoTiles: number }
  | { tipo: 'hongo'; x: number; y: number };

export type TipoCriatura = CriaturaDef['tipo'];

/**
 * A que contrato pertenece cada especie. Esta aqui, y no solo en la clase,
 * para que se lea de un vistazo quien se puede matar y quien no.
 *
 * Remedo y Serpiente son las unicas que mueren. La Zarza y la Alfombra son
 * peligros: se cortan, no se matan. El resto no se toca, y el Mondador menos
 * que nadie (el culto lo tiene por sagrado y casi no quedan).
 */
export const CONTRATO: Readonly<Record<TipoCriatura, Contrato>> = {
  remedo: 'hostil',
  serpiente: 'hostil',
  mondador: 'neutral',
  buitre: 'neutral',
  cerdo: 'neutral',
  cuervo: 'neutral',
  mata: 'neutral',
  hongo: 'neutral',
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
};

/** Lo que una fabrica necesita del nivel para colocar su criatura. */
export interface ContextoCriatura {
  escena: Phaser.Scene;
  /** La piedra, para las que andan o se posan. */
  suelos: Phaser.Physics.Arcade.StaticGroup;
}

type Fabrica<T extends TipoCriatura> = (
  contexto: ContextoCriatura,
  def: Extract<CriaturaDef, { tipo: T }>,
) => Habitante;

/**
 * Una fabrica por especie. Vacio a proposito: cada especie entra con su issue
 * (#97 a #104), y con ella su fabrica.
 */
const FABRICAS: { readonly [T in TipoCriatura]?: Fabrica<T> } = {};

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
