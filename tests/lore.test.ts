import { describe, expect, it } from 'vitest';
import { CODICE, CODICE_EN_JUEGO } from '../src/lore/Codice';
import { REGISTRO } from '../src/lore/Registro';
import { RELIQUIAS } from '../src/lore/Reliquias';
import { VIENTRE } from '../src/lore/Vientre';
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
const ZONAS = VIENTRE.flatMap((capa) => (capa.escena ? [capa.escena] : []));

describe('Codice', () => {
  it('cada hoja tiene un id propio', () => {
    expect(unicos(CODICE.map((f) => f.id))).toBe(true);
  });

  it('el Nivel 1 tiene sus 8 hojas, y el juego solo da las de los niveles que existen', () => {
    expect(CODICE.filter((f) => f.nivel === 1)).toHaveLength(8);
    expect(CODICE_EN_JUEGO.every((f) => f.nivel === 1)).toBe(true);
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
  it('son seis capas, y las dos hondas no se juegan', () => {
    expect(VIENTRE).toHaveLength(6);
    expect(VIENTRE.slice(4).every((capa) => capa.escena === null)).toBe(true);
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
