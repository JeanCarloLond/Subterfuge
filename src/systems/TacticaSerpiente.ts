/**
 * Lo que decide la Serpiente de Tejido en su nido (#167), sin Phaser.
 *
 * Es el mini-jefe que examina el parry. Sus escamas no dejan entrar ni el
 * bisturi ni el injerto: lo unico que la hiere es lo que ella misma escupe,
 * devuelto con el parry. Por eso escupe de lejos y embiste de cerca, y quien
 * se queda a distancia esperando a que se acerque solo recibe escamas.
 */

export type Ataque = { tipo: 'escupir'; escamas: number } | { tipo: 'embestir' };

/** A partir de esta distancia (px), escupe en vez de embestir. */
export const DISTANCIA_ESCUPIR = 90;

/**
 * El siguiente ataque. De lejos escupe (una escama; dos en la fase 2, con la
 * boca rota); de cerca embiste.
 */
export function elegirAtaque(distancia: number, fase2: boolean): Ataque {
  if (Math.abs(distancia) >= DISTANCIA_ESCUPIR) {
    return { tipo: 'escupir', escamas: fase2 ? 2 : 1 };
  }
  return { tipo: 'embestir' };
}

/** De donde viene un golpe: el filo y el injerto rebotan; la escama devuelta entra. */
export type OrigenGolpe = 'filo' | 'injerto' | 'escama';

/**
 * Cuanto le quita un golpe. Aturdida o distraida, con la guardia abierta,
 * la escama devuelta entra el doble.
 */
export function danoASerpiente(base: number, origen: OrigenGolpe, expuesta: boolean): number {
  if (origen !== 'escama') return 0;
  return expuesta ? base * 2 : base;
}
