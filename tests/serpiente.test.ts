import { describe, expect, it } from 'vitest';
import { DISTANCIA_ESCUPIR, danoASerpiente, elegirAtaque } from '../src/systems/TacticaSerpiente';
import { COMBATE, ESPECIES } from '../src/config/Sacramento';

/**
 * La Serpiente que examina el parry (#167). Si el filo le entrara, el combate
 * se gana a tajos y el parry no se aprende; si las escamas de la fase 2
 * salieran mas juntas que el enfriamiento del parry, no se podrian devolver.
 */
describe('Serpiente de Tejido', () => {
  it('el filo y el injerto rebotan: solo entra su escama devuelta', () => {
    expect(danoASerpiente(4, 'filo', false)).toBe(0);
    expect(danoASerpiente(6, 'injerto', true)).toBe(0);
    expect(danoASerpiente(4, 'escama', false)).toBe(4);
  });

  it('con la guardia abierta, la escama devuelta entra el doble', () => {
    expect(danoASerpiente(4, 'escama', true)).toBe(8);
  });

  it('de lejos escupe y de cerca embiste; en la fase 2 escupe dos', () => {
    expect(elegirAtaque(DISTANCIA_ESCUPIR + 10, false)).toEqual({ tipo: 'escupir', escamas: 1 });
    expect(elegirAtaque(-(DISTANCIA_ESCUPIR + 10), true)).toEqual({ tipo: 'escupir', escamas: 2 });
    expect(elegirAtaque(30, true)).toEqual({ tipo: 'embestir' });
  });

  it('cada escama de una rafaga se puede parar: salen mas separadas que el parry', () => {
    const parry = COMBATE.parry.ventanaMs + COMBATE.parry.enfriamientoMs;
    expect(ESPECIES.serpiente.rafagaMs).toBeGreaterThan(parry);
  });

  it('el aviso de escupir se puede leer: al menos medio segundo', () => {
    expect(ESPECIES.serpiente.escupirMs).toBeGreaterThanOrEqual(500);
  });

  it('se vence con un numero razonable de escamas devueltas', () => {
    const devoluciones = Math.ceil(ESPECIES.serpiente.vida / ESPECIES.serpiente.danoEscama);
    expect(devoluciones).toBeGreaterThanOrEqual(4);
    expect(devoluciones).toBeLessThanOrEqual(7);
  });
});
