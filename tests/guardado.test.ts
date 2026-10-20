import { describe, expect, it, vi } from 'vitest';

/**
 * El descenso guardado (#149). Si esto se rompe, alguien pierde media hora de
 * partida al recargar, y no da ningun error: simplemente no hay "Continuar".
 *
 * Cada test importa los modulos de nuevo (preparar.ts los descarga entre
 * tests): `progreso` es un singleton y no puede arrastrar lo del anterior.
 */
async function modulos() {
  const { progreso } = await import('../src/systems/Progreso');
  const { guardado } = await import('../src/systems/Guardado');
  const { INJERTADORA } = await import('../src/config/Sacramento');
  return { progreso, guardado, INJERTADORA };
}

describe('Guardado', () => {
  it('lo que se gana sobrevive a guardar, recargar y continuar', async () => {
    const antes = await modulos();
    antes.progreso.recogerFragmento('codice-01');
    antes.progreso.marcarLeido('codice-01');
    antes.progreso.recogerReliquia('atrio-frasco', 'frasco');
    antes.progreso.dejarHuella('hongo:Atrio:200:848');
    antes.progreso.descubrir('devoto');
    antes.progreso.pisarCapa('Atrio');
    antes.progreso.pisarCasilla('Atrio', 3, 4);
    antes.progreso.registrarMundo('Atrio', 800, 1100);
    antes.progreso.cargarInjerto(1);
    const injertos = antes.progreso.injertos;
    antes.guardado.guardar('Pasillos', 1);

    // Recargar la pagina: modulos nuevos, memoria vacia, solo queda lo guardado.
    vi.resetModules();
    const despues = await modulos();
    expect(despues.progreso.fragmentosRecogidos).toBe(0);

    const descenso = despues.guardado.cargar();
    expect(descenso).not.toBeNull();
    expect(descenso?.zona).toBe('Pasillos');
    expect(descenso?.altar).toBe(1);

    despues.progreso.restaurar(descenso!.progreso);
    expect(despues.progreso.estaRecogido('codice-01')).toBe(true);
    expect(despues.progreso.estaLeido('codice-01')).toBe(true);
    expect(despues.progreso.tieneReliquia('atrio-frasco')).toBe(true);
    expect(despues.progreso.hayHuella('hongo:Atrio:200:848')).toBe(true);
    expect(despues.progreso.estaDescubierto('devoto')).toBe(true);
    expect(despues.progreso.estaPisada('Atrio')).toBe(true);
    expect(despues.progreso.casillasDe('Atrio').has('3,4')).toBe(true);
    expect(despues.progreso.mundoDe('Atrio')).toEqual({ ancho: 800, alto: 1100 });
    expect(despues.progreso.injertos).toBe(injertos);
  });

  it('el cierre y las zonas que no existen no se guardan', async () => {
    const { guardado } = await modulos();
    guardado.guardar('Final', 0);
    guardado.guardar('NoExiste', 0);
    // Ni siquiera se escribe: no basta con que luego no se pueda cargar.
    expect(localStorage.getItem('subterfuge.descenso')).toBeNull();
    expect(guardado.hay).toBe(false);
  });

  it('ignora lo guardado por otra version, lo roto y lo incompleto', async () => {
    const { guardado } = await modulos();
    const valido = { version: 1, zona: 'Atrio', altar: 0, progreso: {}, fecha: 0 };

    localStorage.setItem('subterfuge.descenso', JSON.stringify({ ...valido, version: 99 }));
    expect(guardado.cargar()).toBeNull();
    localStorage.setItem('subterfuge.descenso', 'esto no es json');
    expect(guardado.cargar()).toBeNull();
    localStorage.setItem('subterfuge.descenso', JSON.stringify({ ...valido, altar: 'uno' }));
    expect(guardado.cargar()).toBeNull();
    localStorage.setItem('subterfuge.descenso', JSON.stringify({ ...valido, progreso: undefined }));
    expect(guardado.cargar()).toBeNull();
  });

  it('borrar deja la pantalla de inicio sin "Continuar"', async () => {
    const { guardado } = await modulos();
    guardado.guardar('Criptas', 2);
    expect(guardado.hay).toBe(true);
    guardado.borrar();
    expect(guardado.hay).toBe(false);
  });

  it('si el navegador no deja guardar (modo privado), el juego sigue', async () => {
    const { guardado } = await modulos();
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
      removeItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(() => guardado.guardar('Atrio', 0)).not.toThrow();
    expect(guardado.cargar()).toBeNull();
    expect(() => guardado.borrar()).not.toThrow();
  });

  it('un guardado manipulado no llena la Injertadora por encima del maximo', async () => {
    const { progreso, INJERTADORA } = await modulos();
    progreso.restaurar({
      recogidos: [],
      leidos: [],
      huellas: [],
      reliquias: [],
      fichas: [],
      capas: [],
      casillas: [],
      mundos: [],
      cargaInjertadora: 999,
    });
    expect(progreso.injertos).toBe(INJERTADORA.cargaMaxima);
  });
});
