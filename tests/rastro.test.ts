import { describe, expect, it } from 'vitest';
import { Rastro } from '../src/systems/Rastro';

/**
 * El rastro que repite la niña (#157). Si esto falla, ella se queda atras,
 * se mete dentro de una pared o salta donde el no salto: justo lo que el
 * jugador no perdona en un acompañante.
 */
describe('Rastro', () => {
  it('ella va a la separacion justa por detras, en llano', () => {
    const rastro = new Rastro(20);
    rastro.reiniciar(100, 300);
    for (let x = 102; x <= 200; x += 2) rastro.grabar(x, 300, true);
    const ella = rastro.detras;
    expect(ella.x).toBeCloseTo(180);
    expect(ella.y).toBe(300);
    expect(ella.suelo).toBe(true);
  });

  it('repite el salto: pasa por el aire donde el paso por el aire', () => {
    const rastro = new Rastro(20);
    rastro.reiniciar(100, 300);
    // Sube 30 px en el sitio y vuelve a bajar.
    for (let y = 298; y >= 270; y -= 2) rastro.grabar(100, y, false);
    for (let y = 272; y <= 300; y += 2) rastro.grabar(100, y, y === 300);
    // 20 px de camino por detras de el es, de vuelta en el salto, en el aire.
    const ella = rastro.detras;
    expect(ella.x).toBe(100);
    expect(ella.y).toBeCloseTo(280);
    expect(ella.suelo).toBe(false);
  });

  it('quieto no deja rastro ni la acerca', () => {
    const rastro = new Rastro(20);
    rastro.reiniciar(100, 300);
    for (let i = 0; i < 50; i += 1) rastro.grabar(100, 300, true);
    expect(rastro.detras.x).toBeCloseTo(80);
    expect(rastro.largo).toBe(2);
  });

  it('si el aparece lejos de golpe, el camino empieza de nuevo a su lado', () => {
    const rastro = new Rastro(20);
    rastro.reiniciar(100, 300);
    expect(rastro.grabar(600, 120, true)).toBe(true);
    expect(rastro.detras).toEqual({ x: 580, y: 120, suelo: true });
  });

  it('no guarda mas camino del que necesita', () => {
    const rastro = new Rastro(20);
    rastro.reiniciar(0, 0);
    for (let x = 1; x <= 2000; x += 1) rastro.grabar(x, 0, true);
    expect(rastro.largo).toBeLessThanOrEqual(23);
    expect(rastro.detras.x).toBeCloseTo(1980);
  });
});
