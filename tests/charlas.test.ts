import { describe, expect, it } from 'vitest';
import { CHARLAS, FRASES_NINA } from '../src/lore/Charlas';
import { PENSAMIENTOS, type Pensamiento } from '../src/lore/Pensamientos';
import { RETRATOS } from '../src/lore/Retratos';
import { LARGO_MAXIMO_FRASE } from '../src/lore/Frases';

/**
 * Lo que hablan la niña y el Cirujano (#176). Un cuadro sin voz, o una voz sin
 * retrato, no da error de tipos: sale una cara equivocada en mitad del dialogo.
 */
const conVoces = (p: Pensamiento) => (p.voces ? [p] : []);
const todos = [
  ...Object.values(PENSAMIENTOS).flatMap(conVoces),
  ...Object.values(CHARLAS).flatMap((charlas) => charlas.flatMap(conVoces)),
];

describe('Charlas', () => {
  it('cada cuadro tiene quien lo diga, y esa voz tiene cara', () => {
    expect(todos.length).toBeGreaterThan(0);
    for (const p of todos) {
      expect(p.voces).toHaveLength(p.cuadros.length);
      for (const voz of p.voces ?? []) expect(RETRATOS[voz]).toBeDefined();
    }
  });

  it('en cada zona del Nivel 2 se puede hablar con ella', () => {
    for (const zona of ['Desague', 'Galeria', 'Ductos'] as const) {
      expect(CHARLAS[zona].length).toBeGreaterThan(0);
    }
  });

  it('las conversaciones de llegada son de los dos', () => {
    for (const clave of ['desague', 'galeria', 'ductos'] as const) {
      const voces = new Set(PENSAMIENTOS[clave].voces);
      expect(voces).toEqual(new Set(['cirujano', 'nina']));
    }
  });

  it('sus frases sueltas caben en una linea', () => {
    for (const frase of Object.values(FRASES_NINA).flat()) {
      expect(frase.length).toBeLessThanOrEqual(LARGO_MAXIMO_FRASE);
    }
  });
});
