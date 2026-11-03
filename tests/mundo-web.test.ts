import { describe, expect, it } from 'vitest';
import {
  ARTES,
  CALENDARIO,
  CAPUCHA,
  CASA,
  CRONOLOGIA,
  CLASES,
  ESCUELAS,
  HERENCIAS,
  INTEMPERIE,
  LEYES,
  LEYENDAS,
  LIBROS,
  LENGUA,
  MANOS,
  OFICIOS,
  OTROS_RELATOS,
  PARENTESCO,
  TECNOLOGIA,
} from '../web/src/mundo';

/**
 * El material de la biblia que el Portal publica fuera de Sigma. Si algo se
 * cae de aquí, la página se queda sin una parte del mundo y nadie lo nota.
 */
describe('El mundo publicado en el Portal', () => {
  it('la Intemperie tiene sus lugares, su viaje, su fauna y su flora', () => {
    expect(INTEMPERIE.lugares).toHaveLength(7);
    expect(INTEMPERIE.viaje.length).toBeGreaterThanOrEqual(4);
    expect(INTEMPERIE.fauna).toHaveLength(4);
    expect(INTEMPERIE.flora).toHaveLength(2);
    expect(new Set(INTEMPERIE.lugares.map((l) => l.nombre)).size).toBe(INTEMPERIE.lugares.length);
  });

  it('los tres Libros y los cuatro relatos están completos', () => {
    expect(LIBROS.map((libro) => libro.nombre)).toEqual([
      'Libro I · El Don y el Silencio',
      'Libro II · La Venda de la Madre',
      'Libro III · El Día de la Mirada',
    ]);
    expect(OTROS_RELATOS).toHaveLength(4);
  });

  it('la lengua conserva los tres registros, las cuatro reglas y el glosario', () => {
    expect(LENGUA.registros).toHaveLength(3);
    expect(LENGUA.reglas).toHaveLength(4);
    expect(LENGUA.expresiones).toHaveLength(4);
    expect(LENGUA.glosario.length).toBeGreaterThanOrEqual(35);
    expect(new Set(LENGUA.glosario.map((t) => t.termino)).size).toBe(LENGUA.glosario.length);
  });

  it('las costumbres, los oficios y las clases no repiten nombres', () => {
    expect(LEYES).toHaveLength(7);
    expect(CALENDARIO).toHaveLength(5);
    expect(OFICIOS).toHaveLength(12);
    expect(CLASES).toHaveLength(5);
    expect(ARTES).toHaveLength(6);
    expect(new Set(OFICIOS.map((o) => o.nombre)).size).toBe(OFICIOS.length);
    expect(new Set(CLASES.map((c) => c.clase)).size).toBe(CLASES.length);
    expect(CASA.length).toBeGreaterThanOrEqual(3);
    expect(PARENTESCO.length).toBeGreaterThanOrEqual(5);
  });

  it('la tecnología, las leyendas, las escuelas y los linajes están', () => {
    expect(TECNOLOGIA).toHaveLength(15);
    expect(LEYENDAS).toHaveLength(5);
    expect(ESCUELAS).toHaveLength(4);
    expect(HERENCIAS).toHaveLength(4);
    expect(CAPUCHA).toHaveLength(5);
    expect(MANOS).toHaveLength(5);
    expect(CRONOLOGIA).toHaveLength(18);
    expect(new Set(TECNOLOGIA.map((t) => t.nombre)).size).toBe(TECNOLOGIA.length);
    expect(new Set(LEYENDAS.map((l) => l.nombre)).size).toBe(LEYENDAS.length);
  });

  it('el vocabulario visible respeta el léxico del mundo', () => {
    const publicado = JSON.stringify({
      INTEMPERIE,
      LIBROS,
      OTROS_RELATOS,
      LENGUA,
      LEYES,
      CALENDARIO,
      OFICIOS,
      CLASES,
      ARTES,
      CASA,
      PARENTESCO,
      CRONOLOGIA,
      TECNOLOGIA,
      LEYENDAS,
      ESCUELAS,
      HERENCIAS,
      CAPUCHA,
      MANOS,
    });
    expect(publicado).not.toMatch(/\b(checkpoint|mana|hp|stamina|boss|npc)\b/i);
  });
});
