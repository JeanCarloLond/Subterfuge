import { describe, expect, it } from 'vitest';
import {
  ESTANTES_CRIPTA,
  LIBRO_POR_ID,
  LIBROS_CRIPTA,
  LIBROS_POR_ESTANTE,
} from '../web/src/biblioteca';
import { LENGUA } from '../web/src/mundo';

/**
 * La Cripta de Lectura: estantes, libros y el estante reservado. Si un libro
 * queda sin estante, o un estante apunta a un id que no existe, la página
 * enseña un hueco y nadie lo nota.
 */
describe('La Cripta de Lectura', () => {
  it('tiene libros con id único y estante asignado', () => {
    expect(LIBROS_CRIPTA.length).toBeGreaterThanOrEqual(15);
    expect(new Set(LIBROS_CRIPTA.map((libro) => libro.id)).size).toBe(LIBROS_CRIPTA.length);
    for (const libro of LIBROS_CRIPTA) {
      expect(libro.titulo.trim()).not.toBe('');
      expect(libro.subtitulo.trim()).not.toBe('');
      expect(libro.secciones.length).toBeGreaterThan(0);
      expect(LIBROS_POR_ESTANTE.has(libro.estante)).toBe(true);
    }
  });

  it('cada estante apunta a libros existentes y no repite', () => {
    expect(ESTANTES_CRIPTA).toHaveLength(5);
    for (const estante of ESTANTES_CRIPTA) {
      const libros = LIBROS_POR_ESTANTE.get(estante.id) ?? [];
      expect(libros).toHaveLength(estante.libros.length);
      expect(new Set(estante.libros).size).toBe(estante.libros.length);
      for (const id of estante.libros) expect(LIBRO_POR_ID.has(id)).toBe(true);
    }
  });

  it('solo el estante reservado guarda libros reservados', () => {
    const reservados = LIBROS_CRIPTA.filter((libro) => libro.reservado);
    expect(reservados.length).toBeGreaterThan(0);
    for (const libro of reservados) expect(libro.estante).toBe('reservado');
    for (const estante of ESTANTES_CRIPTA) {
      if (estante.reservado) continue;
      for (const id of estante.libros) expect(LIBRO_POR_ID.get(id)?.reservado).not.toBe(true);
    }
  });

  it('el glosario de la lengua llega entero a la Cripta', () => {
    const lengua = LIBRO_POR_ID.get('lengua');
    const tablas = lengua?.secciones.filter((seccion) => seccion.tipo === 'tabla') ?? [];
    expect(tablas).toHaveLength(1);
    if (tablas[0]?.tipo === 'tabla') {
      expect(tablas[0].filas).toHaveLength(LENGUA.glosario.length);
    }
  });

  it('los libros reservados no se pueden leer sin vela', () => {
    // La página es la que lo impone; aquí se vigila que el dato lo declare.
    for (const id of ['otros-relatos', 'aparato', 'cronologia']) {
      expect(LIBRO_POR_ID.get(id)?.reservado).toBe(true);
    }
  });
});
