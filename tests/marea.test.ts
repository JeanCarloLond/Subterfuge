import { describe, expect, it } from 'vitest';
import { CicloMarea, crestaDe, regionDe, reposoMs } from '../src/systems/CicloMarea';
import { MAREAS } from '../src/config/Sacramento';

/**
 * La Marea por tramos (#163). Si el ciclo se salta un estado, el agua sube
 * sin aviso; si la region o la cresta mienten, las marcas de sedimento dicen
 * "aqui no llega" donde si llega.
 */
describe('Marea', () => {
  it('sin region inunda todo el ancho; con region, solo lo suyo', () => {
    expect(regionDe({ suelo: 400 }, 1280)).toEqual({ x0: 0, x1: 1280 });
    expect(regionDe({ suelo: 400, x0: 16, x1: 600 }, 1280)).toEqual({ x0: 16, x1: 600 });
  });

  it('la cresta es el suelo menos lo que sube', () => {
    expect(crestaDe({ suelo: 432, alturaMaxima: 56 })).toBe(376);
    expect(crestaDe({ suelo: 432 })).toBe(432 - MAREAS.alturaMaxima);
  });

  it('avisa antes de subir, y vuelve al reposo despues de bajar', () => {
    const ciclo = new CicloMarea(MAREAS.periodoMs, 0);
    const vistos: string[] = [];
    let t = 0;
    while (vistos.length < 5) {
      t = ciclo.finEstado;
      const nuevo = ciclo.avanzar(t);
      if (nuevo) vistos.push(nuevo);
    }
    expect(vistos).toEqual(['aviso', 'subiendo', 'crecida', 'bajando', 'reposo']);
    // Hasta volver al reposo: el reposo del principio y las cuatro fases.
    const fases = MAREAS.avisoMs + MAREAS.subidaMs + MAREAS.crecidaMs + MAREAS.bajadaMs;
    expect(t).toBe(reposoMs(MAREAS.periodoMs) + fases);
  });

  it('no cambia antes de tiempo', () => {
    const ciclo = new CicloMarea(MAREAS.periodoMs, 1000);
    expect(ciclo.avanzar(1000)).toBeNull();
    expect(ciclo.avanzar(ciclo.finEstado - 1)).toBeNull();
    expect(ciclo.estado).toBe('reposo');
  });

  it('dos mareas con desfase no avisan a la vez', () => {
    const una = new CicloMarea(MAREAS.periodoMs, 0);
    const otra = new CicloMarea(MAREAS.periodoMs, 0, 5000);
    expect(otra.finEstado - una.finEstado).toBe(5000);
  });
});
