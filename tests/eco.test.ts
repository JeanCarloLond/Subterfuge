import { describe, expect, it } from 'vitest';
import { Eco, avanzarVuelta } from '../src/systems/Eco';

/**
 * Las persecuciones (#162). Si el perseguidor no repitiera el camino exacto,
 * podria cortar por donde el Cirujano no puede; si los puntos de vuelta
 * retrocedieran, una caida te devolveria al principio.
 */
describe('Eco del camino', () => {
  it('va por donde estuvo el Cirujano, el retraso despues', () => {
    const eco = new Eco(1000);
    for (let t = 0; t <= 2500; t += 100) eco.grabar(t, t / 10, 300);
    expect(eco.donde(2500)).toEqual({ x: 150, y: 300 });
  });

  it('repite tambien los saltos', () => {
    const eco = new Eco(500);
    eco.grabar(0, 0, 300);
    eco.grabar(100, 10, 250);
    eco.grabar(200, 20, 300);
    expect(eco.donde(600)).toEqual({ x: 10, y: 250 });
  });

  it('no aparece hasta que hay camino detras, ni tras reiniciar', () => {
    const eco = new Eco(1500);
    eco.grabar(0, 0, 0);
    eco.grabar(1000, 100, 0);
    expect(eco.donde(1000)).toBeNull();
    eco.reiniciar();
    expect(eco.donde(5000)).toBeNull();
  });

  it('no guarda mas camino del que necesita', () => {
    const eco = new Eco(1500);
    for (let t = 0; t <= 60000; t += 16) eco.grabar(t, t, 0);
    expect(eco.donde(60000)).toEqual({ x: 58500, y: 0 });
  });
});

describe('Puntos de vuelta', () => {
  const vueltas = [
    [100, 300],
    [400, 300],
    [800, 250],
  ] as const;

  it('avanza al pasar por el siguiente, y no retrocede', () => {
    expect(avanzarVuelta(vueltas, 0, 405, 300)).toBe(1);
    expect(avanzarVuelta(vueltas, 1, 100, 300)).toBe(1);
    expect(avanzarVuelta(vueltas, 1, 600, 300)).toBe(1);
    expect(avanzarVuelta(vueltas, 1, 800, 260)).toBe(2);
  });
});
