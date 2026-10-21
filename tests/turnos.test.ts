import { describe, expect, it } from 'vitest';
import { Turnos } from '../src/systems/Turnos';
import { LARGO_MAXIMO_FRASE, SIN_BISTURI } from '../src/lore/Frases';

/**
 * Las frases sobre la cabeza (#175). Si se repiten en bucle o se salen de la
 * linea, dejan de ser una voz.
 */
describe('Turnos', () => {
  it('van en orden y vuelven a empezar', () => {
    const turnos = new Turnos(['a', 'b'], 0);
    expect([turnos.siguiente(0), turnos.siguiente(1), turnos.siguiente(2)]).toEqual([
      'a',
      'b',
      'a',
    ]);
  });

  it('entre una y otra hay un respiro', () => {
    const turnos = new Turnos(['a', 'b'], 3000);
    expect(turnos.siguiente(0)).toBe('a');
    expect(turnos.siguiente(2999)).toBeNull();
    expect(turnos.siguiente(3000)).toBe('b');
  });

  it('sin frases, no dice nada', () => {
    expect(new Turnos([], 0).siguiente(0)).toBeNull();
  });
});

describe('Frases', () => {
  it('las de las manos vacias caben en una linea', () => {
    expect(SIN_BISTURI.length).toBeGreaterThan(1);
    for (const frase of SIN_BISTURI) expect(frase.length).toBeLessThanOrEqual(LARGO_MAXIMO_FRASE);
  });
});
