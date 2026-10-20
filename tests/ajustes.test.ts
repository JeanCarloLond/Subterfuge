import { describe, expect, it, vi } from 'vitest';

/**
 * Los ajustes de accesibilidad (#151). Que "apagados" apague de verdad no es
 * una preferencia estetica: hay jugadores para los que un destello es una
 * barrera.
 */
async function ajustes() {
  return import('../src/systems/Ajustes');
}

function camaraFalsa() {
  return { shake: vi.fn(), flash: vi.fn() } as unknown as Phaser.Cameras.Scene2D.Camera & {
    shake: ReturnType<typeof vi.fn>;
    flash: ReturnType<typeof vi.fn>;
  };
}

describe('Ajustes', () => {
  it('sin nada guardado, el juego suena y se ve como siempre', async () => {
    const { ajustes: a, PASOS_VOLUMEN } = await ajustes();
    expect(a.efectos).toBe('normal');
    expect(a.pasoMusica).toBe(PASOS_VOLUMEN);
    expect(a.volumenMusica).toBe(1);
    expect(a.volumenSonido).toBe(1);
    expect(a.msPorLetra).toBe(28);
  });

  it('si el sistema pide menos movimiento, empieza en suaves', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { ajustes: a } = await ajustes();
    expect(a.efectos).toBe('suaves');
  });

  it('un valor guardado roto vuelve a uno valido', async () => {
    localStorage.setItem(
      'subterfuge.ajustes',
      JSON.stringify({ efectos: 'brutal', musica: 99, sonido: -3, texto: 'veloz' }),
    );
    const { ajustes: a, PASOS_VOLUMEN } = await ajustes();
    expect(a.efectos).toBe('normal');
    expect(a.pasoMusica).toBe(PASOS_VOLUMEN);
    expect(a.pasoSonido).toBe(0);
    expect(a.texto).toBe('normal');
  });

  it('cambiar un ajuste avisa en el acto y se recuerda al volver', async () => {
    const { ajustes: a } = await ajustes();
    const oyente = vi.fn();
    a.alCambiar(oyente);
    a.cambiar('texto', 'instante');
    expect(oyente).toHaveBeenCalledOnce();
    expect(a.msPorLetra).toBe(0);

    vi.resetModules();
    const otra = await ajustes();
    expect(otra.ajustes.texto).toBe('instante');
  });

  it('apagados: ni sacudidas ni destellos', async () => {
    const { ajustes: a, sacudir, destellar } = await ajustes();
    a.cambiar('efectos', 'apagados');
    const camara = camaraFalsa();
    sacudir(camara, 100, 0.01);
    destellar(camara, 100, 255, 255, 255);
    expect(camara.shake).not.toHaveBeenCalled();
    expect(camara.flash).not.toHaveBeenCalled();
  });

  it('suaves: sacude a un tercio y no destella', async () => {
    const { ajustes: a, sacudir, destellar } = await ajustes();
    a.cambiar('efectos', 'suaves');
    const camara = camaraFalsa();
    sacudir(camara, 100, 0.01);
    destellar(camara, 100, 255, 255, 255);
    expect(camara.shake).toHaveBeenCalledWith(100, expect.closeTo(0.0035, 6));
    expect(camara.flash).not.toHaveBeenCalled();
  });

  it('normal: todo pasa tal cual', async () => {
    const { sacudir, destellar } = await ajustes();
    const camara = camaraFalsa();
    sacudir(camara, 120, 0.006);
    destellar(camara, 90, 140, 40, 40);
    expect(camara.shake).toHaveBeenCalledWith(120, 0.006);
    expect(camara.flash).toHaveBeenCalledWith(90, 140, 40, 40);
  });
});
