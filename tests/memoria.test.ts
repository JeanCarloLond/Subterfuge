import { describe, expect, it } from 'vitest';

/**
 * El puente entre el juego y el portal: lo que se descubre bajando y las
 * claves que lo abren sin haber jugado. Si se rompe, la web deja de "saber"
 * lo jugado y nadie lo nota desde el juego.
 */
describe('Memoria del descenso (juego)', () => {
  it('apunta una vez y recuerda', async () => {
    const { recordar, recuerda, CLAVE_MEMORIA } = await import('../src/systems/Memoria');
    expect(recuerda('hitos', 'final')).toBe(false);
    recordar('hitos', 'final');
    recordar('hitos', 'final');
    expect(recuerda('hitos', 'final')).toBe(true);
    const guardado = JSON.parse(localStorage.getItem(CLAVE_MEMORIA) ?? '{}');
    expect(guardado.hitos).toEqual(['final']);
  });

  it('una memoria rota no revienta: se lee vacia', async () => {
    const { recuerda, CLAVE_MEMORIA } = await import('../src/systems/Memoria');
    localStorage.setItem(CLAVE_MEMORIA, '{roto');
    expect(recuerda('fragmentos', 'codice-01')).toBe(false);
  });

  it('la web lee lo que el juego escribe', async () => {
    const { recordar } = await import('../src/systems/Memoria');
    const web = await import('../web/src/memoria');
    recordar('hitos', 'nina');
    recordar('fragmentos', 'codice-02');
    expect(web.hitoAbierto('nina')).toBe(true);
    expect(web.memoriaDelDescenso().fragmentos).toContain('codice-02');
  });
});

describe('Claves del portal', () => {
  it('se comparan sin tildes, mayusculas ni signos', async () => {
    const { normalizar } = await import('../web/src/memoria');
    expect(normalizar('  ¡Los dioses NO miran, ella sí!  ')).toBe('los dioses no miran ella si');
  });

  it('"no vengas" lo abre todo, incluida la Sala vacia', async () => {
    const web = await import('../web/src/memoria');
    expect(web.descensoAbierto()).toBe(false);
    const resultado = web.presentarClave('No vengas.');
    expect(resultado?.nueva).toBe(true);
    expect(resultado?.abre).toEqual(expect.arrayContaining(['descenso', 'final', 'nina']));
    expect(web.descensoAbierto()).toBe(true);
    expect(web.hitoAbierto('nina')).toBe(true);
    expect(web.presentarClave('no vengas')?.nueva).toBe(false);
  });

  it('el lema responde pero no abre nada, y lo inventado no consta', async () => {
    const web = await import('../web/src/memoria');
    expect(web.presentarClave('Los dioses no miran. Son mirados.')?.abre).toEqual([]);
    expect(web.presentarClave('abracadabra')).toBeNull();
    expect(web.descensoAbierto()).toBe(false);
  });
});
