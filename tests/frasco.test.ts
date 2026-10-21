import { describe, expect, it } from 'vitest';
import { destinoDeCura } from '../src/systems/Frasco';

/**
 * La vida y las Pociones viajan entre zonas (#174). Si esto se rompe, o bajar
 * vuelve a curar gratis, o lo recogido con la vida llena se tira.
 */
describe('Lo que cura y sobra va al frasco', () => {
  it('herido, cura', () => {
    expect(destinoDeCura(3, 6, 0, 3)).toBe('vida');
  });

  it('entero, llena una carga si falta alguna', () => {
    expect(destinoDeCura(6, 6, 1, 3)).toBe('frasco');
  });

  it('con todo lleno, no va a ningun sitio', () => {
    expect(destinoDeCura(6, 6, 3, 3)).toBe('nada');
  });
});

describe('La vida y las Pociones entre zonas', () => {
  it('se guardan con el descenso y vuelven al continuar', async () => {
    const { progreso } = await import('../src/systems/Progreso');
    const { guardado } = await import('../src/systems/Guardado');

    progreso.apuntarCirujano(2, 1);
    guardado.guardar('Galeria', 0);
    progreso.reiniciar();
    expect(progreso.vidaDelCirujano).toBeNull();

    progreso.restaurar(guardado.cargar()!.progreso);
    expect(progreso.vidaDelCirujano).toBe(2);
    expect(progreso.pocionesDelCirujano).toBe(1);
  });

  it('un guardado de antes se continua con todo lleno', async () => {
    const { progreso } = await import('../src/systems/Progreso');
    const viejo = progreso.serializar();
    delete viejo.vida;
    delete viejo.pociones;
    progreso.apuntarCirujano(1, 0);
    progreso.restaurar(viejo);
    expect(progreso.vidaDelCirujano).toBeNull();
    expect(progreso.pocionesDelCirujano).toBeNull();
  });
});
