import { describe, expect, it } from 'vitest';
import { CODICE, CODICE_EN_JUEGO, NIVEL_MAS_HONDO } from '../src/lore/Codice';
import { REGISTRO } from '../src/lore/Registro';
import { RELIQUIAS } from '../src/lore/Reliquias';
import { VIENTRE } from '../src/lore/Vientre';
import { ZONAS_MAPA } from '../src/lore/Mapa';
import { ACTO_II, GANCHO_FINAL, guionDelSacramento } from '../src/lore/Cinematicas';
import { RETRATOS } from '../src/lore/Retratos';
import {
  ANCHO_MAXIMO,
  CONTROLES_COMBATE,
  CONTROLES_COMBATE_MANDO,
  CONTROLES_COMBATE_TACTIL,
  CONTROLES_MOVIMIENTO,
  CONTROLES_MOVIMIENTO_MANDO,
  CONTROLES_MOVIMIENTO_TACTIL,
} from '../src/ui/TextoControles';

/**
 * Integridad de los datos del mundo. El lore vive en listas que leen a la vez
 * el juego, el libro del Codice y la web: un id repetido o una zona mal
 * escrita no da error de tipos, pero rompe un recuento o deja una ficha que
 * nunca se abre.
 */
const unicos = (ids: readonly string[]) => new Set(ids).size === ids.length;
const ZONAS = VIENTRE.flatMap((capa) => capa.escenas);

describe('Codice', () => {
  it('cada hoja tiene un id propio', () => {
    expect(unicos(CODICE.map((f) => f.id))).toBe(true);
  });

  it('el Nivel 1 tiene sus 8 hojas, y el juego solo da las de los niveles que existen', () => {
    expect(CODICE.filter((f) => f.nivel === 1)).toHaveLength(8);
    expect(CODICE_EN_JUEGO.every((f) => f.nivel <= NIVEL_MAS_HONDO)).toBe(true);
  });

  it('con el Nivel 2 construido, el juego da las diez', () => {
    expect(NIVEL_MAS_HONDO).toBe(2);
    expect(CODICE_EN_JUEGO).toHaveLength(CODICE.length);
  });
});

describe('Registro', () => {
  it('cada ficha tiene un id propio', () => {
    expect(unicos(REGISTRO.map((f) => f.id))).toBe(true);
  });
});

describe('Reliquias', () => {
  it('cada reliquia tiene un id propio y esta en una zona que existe', () => {
    expect(unicos(RELIQUIAS.map((r) => r.id))).toBe(true);
    for (const reliquia of RELIQUIAS) expect(ZONAS).toContain(reliquia.zona);
  });
});

describe('El Vientre', () => {
  it('son seis capas: cinco se juegan y la sexta no', () => {
    expect(VIENTRE).toHaveLength(6);
    expect(VIENTRE.slice(0, 5).every((capa) => capa.escenas.length > 0)).toBe(true);
    expect(VIENTRE[5].escenas).toHaveLength(0);
  });

  it('cada zona del mapa esta en una sola capa, y cada capa jugada en el mapa', () => {
    const delMapa = ZONAS_MAPA.map((zona) => zona.escena);
    expect([...ZONAS].sort()).toEqual([...delMapa].sort());
    expect(unicos(ZONAS)).toBe(true);
  });

  it('la capa V son las tres zonas del Nivel 2', () => {
    const nivel2 = ZONAS_MAPA.filter((zona) => zona.nivel === 2).map((zona) => zona.escena);
    expect(VIENTRE[4].escenas).toEqual(nivel2);
  });
});

describe('La cinematica del sacramento', () => {
  it('con el Acto II aprobado cuenta la decision; el gancho la acompaña', () => {
    const guion = guionDelSacramento();
    expect(guion.some((p) => p.acto === 2)).toBe(ACTO_II);
    expect(GANCHO_FINAL === null).toBe(!ACTO_II);
  });

  it('cada plano dura algo, y el subtitulo entra antes de que acabe', () => {
    for (const plano of guionDelSacramento()) {
      expect(plano.ms).toBeGreaterThan(0);
      if (plano.subtitulo) {
        expect(plano.subtitulo.trim()).not.toBe('');
        expect(plano.subtituloEn ?? 0).toBeLessThan(plano.ms);
      }
    }
  });
});

describe('Retratos', () => {
  it('quien no puede mover la boca no la mueve: el Cirujano lleva mascara', () => {
    expect(RETRATOS.cirujano.habla).toHaveLength(0);
  });
});

describe('Ayuda de controles', () => {
  it('ninguna linea pisa la otra columna', () => {
    for (const linea of [
      ...CONTROLES_MOVIMIENTO,
      ...CONTROLES_COMBATE,
      ...CONTROLES_MOVIMIENTO_TACTIL,
      ...CONTROLES_COMBATE_TACTIL,
      ...CONTROLES_MOVIMIENTO_MANDO,
      ...CONTROLES_COMBATE_MANDO,
    ]) {
      expect(linea.length).toBeLessThanOrEqual(ANCHO_MAXIMO);
    }
  });
});
