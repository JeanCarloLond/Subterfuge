import { describe, expect, it } from 'vitest';
import { cubreEscudo } from '../src/systems/Escudo';
import { COMBATE, ESPECIES } from '../src/config/Sacramento';

/**
 * El guardia de la Cruzada (#166). Si el escudo parara por detras o desde
 * arriba, no habria manera de vencerlo sin el parry; si no parara de frente,
 * seria un Devoto con otro dibujo.
 */
describe('Escudo de autoclave', () => {
  it('para de frente', () => {
    expect(cubreEscudo(100, true, 130, false, false)).toBe(true);
    expect(cubreEscudo(100, false, 70, false, false)).toBe(true);
  });

  it('no para por detras', () => {
    expect(cubreEscudo(100, true, 70, false, false)).toBe(false);
    expect(cubreEscudo(100, false, 130, false, false)).toBe(false);
  });

  it('no para desde arriba ni con la guardia baja', () => {
    expect(cubreEscudo(100, true, 130, true, false)).toBe(false);
    expect(cubreEscudo(100, true, 130, false, true)).toBe(false);
  });

  it('la estocada se lee: al menos medio segundo de aviso', () => {
    expect(ESPECIES.guardia.anticipacionEstocadaMs).toBeGreaterThanOrEqual(500);
  });

  it('tras parar la estocada hay tiempo de golpear antes de que levante el escudo', () => {
    expect(ESPECIES.guardia.aturdidoMs).toBeGreaterThan(COMBATE.parry.aturdimientoMs);
  });

  it('se gira despacio: hay tiempo de ponerse detras con el dash', () => {
    expect(ESPECIES.guardia.giroMs).toBeGreaterThanOrEqual(500);
  });
});
