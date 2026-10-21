import { describe, expect, it } from 'vitest';
import { Conteo } from '../src/systems/Conteo';
import { ayudaDeControles } from '../src/ui/TextoControles';

/**
 * El conteo del instrumental (#160) y el Nivel 2 sin bisturi. Lo que no puede
 * romperse: que haya siempre un bisturi y uno solo, que no se pueda fracasar,
 * y que el estado del arma sobreviva al guardado.
 */
/** Azar fijo y repetible: los tests no pueden depender de la suerte. */
function azarDe(...valores: number[]): () => number {
  let i = 0;
  return () => valores[i++ % valores.length];
}

/** Cuantas piezas son el bisturi. */
function bisturis(conteo: Conteo): number {
  let n = 0;
  for (let i = 0; i < conteo.cuantas; i += 1) if (!conteo.tiembla(i)) n += 1;
  return n;
}

describe('Conteo del instrumental', () => {
  it('hay un bisturi y uno solo; los demas tiemblan', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const conteo = new Conteo(4, azarDe(r));
      expect(conteo.cuantas).toBe(4);
      expect(bisturis(conteo)).toBe(1);
    }
  });

  it('coger un Remedo cuesta una pieza, y recontar no pierde el bisturi', () => {
    const conteo = new Conteo(4, azarDe(0.9, 0.1, 0.5, 0.7));
    const remedo = [0, 1, 2, 3].find((i) => conteo.tiembla(i))!;
    expect(conteo.tomar(remedo)).toBe('remedo');
    expect(conteo.cuantas).toBe(3);
    conteo.recontar();
    expect(conteo.cuantas).toBe(3);
    expect(bisturis(conteo)).toBe(1);
    expect(conteo.terminado).toBe(false);
  });

  it('no se puede fracasar: cogiendo siempre la primera, se acaba con el bisturi', () => {
    const conteo = new Conteo(5, azarDe(0.95, 0.2, 0.8, 0.4));
    let intentos = 0;
    let resultado = conteo.tomar(0);
    while (resultado === 'remedo') {
      conteo.recontar();
      resultado = conteo.tomar(0);
      intentos += 1;
    }
    expect(resultado).toBe('bisturi');
    expect(intentos).toBeLessThan(5);
    expect(conteo.terminado).toBe(true);
  });

  it('terminado, ya no tiembla nada ni se coge nada', () => {
    const conteo = new Conteo(1);
    expect(conteo.tomar(0)).toBe('bisturi');
    expect(conteo.tiembla(0)).toBe(false);
    expect(conteo.tomar(0)).toBeNull();
  });
});

describe('Sin bisturi', () => {
  it('se suelta, se recupera y sobrevive al guardado', async () => {
    const { progreso } = await import('../src/systems/Progreso');
    const { guardado } = await import('../src/systems/Guardado');
    expect(progreso.tieneBisturi).toBe(true);

    progreso.soltarBisturi();
    guardado.guardar('Desague', 0);
    progreso.restaurar(guardado.cargar()!.progreso);
    expect(progreso.tieneBisturi).toBe(false);

    expect(progreso.recuperarBisturi()).toBe(true);
    expect(progreso.recuperarBisturi()).toBe(false);
    progreso.soltarBisturi();
    progreso.reiniciar();
    expect(progreso.tieneBisturi).toBe(true);
  });

  it('un guardado de antes del Nivel 2 se continua con el bisturi', async () => {
    const { progreso } = await import('../src/systems/Progreso');
    const viejo = progreso.serializar();
    delete (viejo as { bisturi?: boolean }).bisturi;
    progreso.soltarBisturi();
    progreso.restaurar(viejo);
    expect(progreso.tieneBisturi).toBe(true);
  });

  it('la ayuda no enseña a golpear sin bisturi, y el parry se llama empujar', () => {
    for (const conDedos of [false, true]) {
      const armado = ayudaDeControles(conDedos).combate;
      const desarmado = ayudaDeControles(conDedos, false).combate;
      expect(armado.some((l) => l.startsWith('GOLPEAR'))).toBe(true);
      expect(desarmado.some((l) => l.startsWith('GOLPEAR') || l.startsWith('CARGADO'))).toBe(false);
      expect(desarmado.some((l) => l.includes('rebotas'))).toBe(false);
      expect(desarmado.some((l) => l.startsWith('EMPUJAR'))).toBe(true);
      expect(desarmado.some((l) => l.startsWith('PARRY'))).toBe(false);
    }
  });
});
