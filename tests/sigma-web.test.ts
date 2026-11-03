import { describe, expect, it } from 'vitest';
import {
  AVISOS_SIGMA,
  JUNTAS_SIGMA,
  NIVELES_SIGMA,
  NOMBRES_SIGMA,
  avisosOrdenados,
  fusionar,
} from '../web/src/sigma';

/**
 * El expediente del asentamiento (#236). Es contenido propio del Portal y no
 * del lore del teaser: se prueba aquí para que el plano, los avisos y los
 * nombres sigan contando lo mismo que Sigma sin adelantar el giro.
 */
describe('El plano de Sigma', () => {
  it('tiene las seis capas del corte vertical, en orden y sin huecos', () => {
    expect(NIVELES_SIGMA).toHaveLength(6);
    expect(new Set(NIVELES_SIGMA.map((nivel) => nivel.id)).size).toBe(6);
    for (const nivel of NIVELES_SIGMA) {
      expect(nivel.nombre.trim()).not.toBe('');
      expect(nivel.que.trim()).not.toBe('');
      expect(nivel.hito.trim()).not.toBe('');
      expect(nivel.peligro.trim()).not.toBe('');
    }
  });

  it('las juntas unen capas consecutivas y no se repiten', () => {
    expect(JUNTAS_SIGMA).toHaveLength(NIVELES_SIGMA.length - 1);
    expect(new Set(JUNTAS_SIGMA.map((junta) => junta.id)).size).toBe(JUNTAS_SIGMA.length);
    JUNTAS_SIGMA.forEach((junta, i) => {
      expect(junta.entre).toEqual([NIVELES_SIGMA[i].id, NIVELES_SIGMA[i + 1].id]);
    });
  });

  it('fusionar agrupa sin perder ninguna capa ni cambiar el orden', () => {
    const suelto = fusionar([]);
    expect(suelto).toHaveLength(6);
    expect(suelto.flat().map((nivel) => nivel.id)).toEqual(NIVELES_SIGMA.map((n) => n.id));

    const primera = fusionar(['atrio-pasillos']);
    expect(primera).toHaveLength(5);
    expect(primera[0].map((nivel) => nivel.id)).toEqual(['atrio', 'pasillos']);

    const compacto = fusionar(JUNTAS_SIGMA.map((junta) => junta.id));
    expect(compacto).toHaveLength(1);
    expect(compacto[0].map((nivel) => nivel.id)).toEqual(NIVELES_SIGMA.map((n) => n.id));

    expect(fusionar(['junta-que-no-existe'])).toHaveLength(6);
  });
});

describe('Los avisos y los nombres del asentamiento', () => {
  it('los avisos se leen del más reciente al más antiguo, sin repetir número', () => {
    const numeros = avisosOrdenados().map((aviso) => aviso.numero);
    expect(numeros).toEqual([...numeros].sort((a, b) => b - a));
    expect(new Set(numeros).size).toBe(numeros.length);
    expect(numeros[0]).toBeGreaterThan(numeros[numeros.length - 1]);
  });

  it('los nombres usan los tres estados del Registro', () => {
    expect(new Set(NOMBRES_SIGMA.map((nombre) => nombre.estado))).toEqual(
      new Set(['consta', 'rumor', 'sellado']),
    );
    expect(new Set(NOMBRES_SIGMA.map((nombre) => nombre.nombre)).size).toBe(NOMBRES_SIGMA.length);
  });

  it('lo que se publica no adelanta el giro de Sigma', () => {
    const publicado = JSON.stringify({ AVISOS_SIGMA, NOMBRES_SIGMA });
    expect(publicado).not.toMatch(/niña|villano|ojos de los dioses|manipula/i);
  });
});
