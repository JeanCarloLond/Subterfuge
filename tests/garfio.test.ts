import { describe, expect, it } from 'vitest';
import { alcanzaAlCirujano, puntaDelGarfio } from '../src/systems/Garfio';
import { ESPECIES } from '../src/config/Sacramento';

/**
 * El garfio del cazarrecompensas (#164). Si no se pudiera parar, el
 * cazarrecompensas seria una trampa; si se le viera venir tarde, no habria
 * manera de leerlo.
 */
describe('Garfio', () => {
  it('va hasta su alcance y vuelve', () => {
    expect(puntaDelGarfio(100, 1, 300, 150, 250).x).toBe(175);
    const ida = puntaDelGarfio(100, -1, 300, 150, 500);
    expect(ida.x).toBe(-50);
    expect(ida.volviendo).toBe(false);
    const vuelta = puntaDelGarfio(100, -1, 300, 150, 750);
    expect(vuelta.x).toBe(25);
    expect(vuelta.volviendo).toBe(true);
    expect(puntaDelGarfio(100, 1, 300, 150, 1000).terminado).toBe(true);
  });

  it('parado se rompe, con el dash se atraviesa, y si no engancha', () => {
    expect(alcanzaAlCirujano(200, 300, 205, 302, 'parry')).toBe('roto');
    expect(alcanzaAlCirujano(200, 300, 205, 302, 'dash')).toBe('esquivado');
    expect(alcanzaAlCirujano(200, 300, 205, 302, 'suelo')).toBe('enganchado');
  });

  it('lejos de la punta, nada', () => {
    expect(alcanzaAlCirujano(200, 300, 240, 300, 'suelo')).toBe('nada');
    expect(alcanzaAlCirujano(200, 300, 200, 340, 'suelo')).toBe('nada');
  });

  it('se ve venir: al menos medio segundo girando la cadena', () => {
    expect(ESPECIES.cazador.anticipacionMs).toBeGreaterThanOrEqual(500);
  });
});
