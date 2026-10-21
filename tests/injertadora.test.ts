import { describe, expect, it } from 'vitest';
import { ayudaDeControles } from '../src/ui/TextoControles';

/**
 * La Injertadora se gana al vencer al primer jefe (#178). Si esto se rompe, o
 * se tiene desde el Atrio, o se gana vacia y el Nivel 2 empieza indefenso.
 */
async function modulos() {
  const { progreso } = await import('../src/systems/Progreso');
  const { guardado } = await import('../src/systems/Guardado');
  const { INJERTADORA } = await import('../src/config/Sacramento');
  return { progreso, guardado, INJERTADORA };
}

describe('La Injertadora', () => {
  it('no se tiene al empezar, y sin ella no se carga ni se dispara', async () => {
    const { progreso } = await modulos();
    expect(progreso.tieneInjertadora).toBe(false);
    expect(progreso.cargarInjerto(1)).toBe(false);
    expect(progreso.gastarInjerto()).toBe(false);
  });

  it('se gana llena, con sus tres disparos, una sola vez', async () => {
    const { progreso, INJERTADORA } = await modulos();
    expect(INJERTADORA.cargaMaxima).toBe(3);
    expect(progreso.ganarInjertadora()).toBe(true);
    expect(progreso.injertos).toBe(3);
    expect(progreso.ganarInjertadora()).toBe(false);
    expect(progreso.gastarInjerto()).toBe(true);
    expect(progreso.injertos).toBe(2);
  });

  it('se guarda con el descenso, y otra partida empieza sin ella', async () => {
    const { progreso, guardado } = await modulos();
    progreso.ganarInjertadora();
    guardado.guardar('Desague', 0);
    progreso.reiniciar();
    expect(progreso.tieneInjertadora).toBe(false);
    progreso.restaurar(guardado.cargar()!.progreso);
    expect(progreso.tieneInjertadora).toBe(true);
  });

  it('un guardado de antes se continua con ella, como se tenia entonces', async () => {
    const { progreso } = await modulos();
    const viejo = progreso.serializar();
    delete viejo.injertadora;
    progreso.restaurar(viejo);
    expect(progreso.tieneInjertadora).toBe(true);
  });

  it('la ayuda no la nombra hasta tenerla', () => {
    const sin = ayudaDeControles(false, true, false).combate;
    const con = ayudaDeControles(false, true, true).combate;
    expect(sin.some((l) => l.startsWith('INJERTAR'))).toBe(false);
    expect(con.some((l) => l.startsWith('INJERTAR'))).toBe(true);
  });
});
