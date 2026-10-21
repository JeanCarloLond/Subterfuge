import { describe, expect, it } from 'vitest';

/**
 * Dos niveles en una partida (#156). El Nivel 2 se juega con lo recogido en
 * el 1, pero cada cierre cuenta lo suyo: si los recuentos se mezclan, el
 * cierre del Nivel 1 enseña "8 de 10" a quien lo tiene todo, y nada da error.
 */
async function modulos() {
  const { progreso } = await import('../src/systems/Progreso');
  const { guardado } = await import('../src/systems/Guardado');
  const { REGISTRO } = await import('../src/lore/Registro');
  const { CODICE_EN_JUEGO } = await import('../src/lore/Codice');
  const { RELIQUIAS } = await import('../src/lore/Reliquias');
  return { progreso, guardado, REGISTRO, CODICE_EN_JUEGO, RELIQUIAS };
}

describe('Recuentos por nivel', () => {
  it('el cierre del Nivel 1 no cuenta las hojas ni las reliquias de abajo', async () => {
    const { progreso, CODICE_EN_JUEGO, RELIQUIAS } = await modulos();
    for (const hoja of CODICE_EN_JUEGO) progreso.recogerFragmento(hoja.id);
    for (const r of RELIQUIAS) progreso.recogerReliquia(r.id, r.tipo);

    expect(progreso.fragmentosDelNivel(1)).toBe(8);
    expect(progreso.fragmentosTotalesDelNivel(1)).toBe(8);
    expect(progreso.fragmentosDelNivel(2)).toBe(progreso.fragmentosTotalesDelNivel(2));
    expect(progreso.fragmentosTotalesDelNivel(2)).toBeGreaterThan(0);
    expect(progreso.reliquiasDelNivel(1)).toBe(progreso.reliquiasTotalesDelNivel(1));
    expect(progreso.reliquiasDelNivel(1) + progreso.reliquiasDelNivel(2)).toBe(RELIQUIAS.length);
  });

  it('el cierre del Nivel 2 cuenta el descenso entero: las 10 hojas', async () => {
    const { progreso, CODICE_EN_JUEGO, RELIQUIAS } = await modulos();
    for (const hoja of CODICE_EN_JUEGO) progreso.recogerFragmento(hoja.id);
    for (const r of RELIQUIAS) progreso.recogerReliquia(r.id, r.tipo);

    expect(progreso.fragmentosHasta(1)).toBe(8);
    expect(progreso.fragmentosTotalesHasta(1)).toBe(8);
    expect(progreso.fragmentosHasta(2)).toBe(10);
    expect(progreso.fragmentosTotalesHasta(2)).toBe(10);
    expect(progreso.reliquiasHasta(2)).toBe(RELIQUIAS.length);
    expect(progreso.reliquiasTotalesHasta(1)).toBe(progreso.reliquiasTotalesDelNivel(1));
  });

  it('una ficha del Nivel 2 no falta en el Registro del cierre del Nivel 1', async () => {
    const { progreso, REGISTRO } = await modulos();
    const deArriba = REGISTRO.filter((f) => (f.nivel ?? 1) === 1);
    const deAbajo = REGISTRO.filter((f) => f.nivel === 2);
    expect(deAbajo.length).toBeGreaterThan(0);

    for (const ficha of deArriba) progreso.descubrir(ficha.id);
    expect(progreso.fichasHasta(1)).toBe(progreso.fichasTotalesHasta(1));
    expect(progreso.fichasTotalesHasta(1)).toBe(deArriba.length);

    // Abajo, el Registro entero cuenta, y lo de abajo aun falta.
    expect(progreso.fichasTotalesHasta(2)).toBe(REGISTRO.length);
    expect(progreso.fichasHasta(2)).toBe(deArriba.length);
    progreso.descubrir(deAbajo[0].id);
    expect(progreso.fichasHasta(1)).toBe(deArriba.length);
    expect(progreso.fichasHasta(2)).toBe(deArriba.length + 1);
  });

  it('las tres zonas del Nivel 2 son una sola capa del Vientre', async () => {
    const { progreso } = await modulos();
    for (const zona of ['Atrio', 'Pasillos', 'Criptas', 'Salas']) progreso.pisarCapa(zona);
    expect(progreso.capasPisadas).toBe(4);

    progreso.pisarCapa('Desague');
    progreso.pisarCapa('Galeria');
    progreso.pisarCapa('Ductos');
    expect(progreso.capasPisadas).toBe(5);
    // La sexta no se juega: nunca se llega al total.
    expect(progreso.capasPisadas).toBeLessThan(progreso.capasTotales);
  });
});

describe('Guardado en el Nivel 2', () => {
  it('se continua desde un Altar de cualquiera de las tres zonas', async () => {
    const { guardado } = await modulos();
    for (const zona of ['Desague', 'Galeria', 'Ductos']) {
      guardado.guardar(zona, 1);
      expect(guardado.cargar()?.zona).toBe(zona);
    }
  });

  it('el cierre del Nivel 2 no es una zona: no se guarda', async () => {
    const { guardado } = await modulos();
    guardado.guardar('FinalNivel2', 0);
    expect(localStorage.getItem('subterfuge.descenso')).toBeNull();
  });
});
