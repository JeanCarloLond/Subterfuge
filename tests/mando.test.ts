import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * El mando entra como teclado (#152): cada boton tiene que llegar como la
 * tecla que ya hace eso, con el `keyCode` que lee Phaser, y soltarse cuando
 * se suelta. Un boton que se queda pegado deja al Cirujano corriendo solo.
 */

interface EventoTecla {
  type: string;
  code: string;
  keyCode: number;
}

let eventos: EventoTecla[] = [];
let siguienteFotograma: (() => void) | null = null;
let mando: { connected: boolean; axes: number[]; buttons: { pressed: boolean; value: number }[] };

/** Avanza un fotograma: el modulo lee el mando en cada requestAnimationFrame. */
function fotograma(): void {
  const leer = siguienteFotograma;
  siguienteFotograma = null;
  leer?.();
}

function pulsar(boton: number, pulsado: boolean): void {
  mando.buttons[boton] = { pressed: pulsado, value: pulsado ? 1 : 0 };
}

beforeEach(() => {
  eventos = [];
  mando = {
    connected: true,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
  };
  // Node no tiene KeyboardEvent: basta con un Event que guarde key y code.
  class EventoDeTeclado extends Event {
    readonly code: string;
    constructor(tipo: string, init: { code: string }) {
      super(tipo);
      this.code = init.code;
    }
  }
  vi.stubGlobal('KeyboardEvent', EventoDeTeclado);
  vi.stubGlobal('navigator', { getGamepads: () => [mando] });
  vi.stubGlobal('requestAnimationFrame', (leer: () => void) => {
    siguienteFotograma = leer;
    return 1;
  });
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    dispatchEvent: (evento: Event & { code: string; keyCode: number }) => {
      eventos.push({ type: evento.type, code: evento.code, keyCode: evento.keyCode });
      return true;
    },
  });
});

async function arrancar() {
  const { mando: modulo } = await import('../src/input/Mando');
  modulo.arrancar();
  fotograma();
  return modulo;
}

describe('Mando', () => {
  it('A salta: llega como ESPACIO, con el keyCode que lee Phaser', async () => {
    await arrancar();
    pulsar(0, true);
    fotograma();
    expect(eventos).toEqual([{ type: 'keydown', code: 'Space', keyCode: 32 }]);
  });

  it('mantener no repite la tecla, y soltar la suelta', async () => {
    await arrancar();
    pulsar(2, true);
    fotograma();
    fotograma();
    pulsar(2, false);
    fotograma();
    expect(eventos.map((e) => `${e.type} ${e.code}`)).toEqual(['keydown KeyJ', 'keyup KeyJ']);
  });

  it('Start pausa y Select abre el Codice', async () => {
    await arrancar();
    pulsar(9, true);
    pulsar(8, true);
    fotograma();
    expect(eventos.map((e) => e.code).sort()).toEqual(['Escape', 'KeyL']);
  });

  it('el stick tiene zona muerta y no parpadea en el borde', async () => {
    await arrancar();
    mando.axes[0] = 0.4; // dentro de la zona muerta: nada
    fotograma();
    expect(eventos).toHaveLength(0);

    mando.axes[0] = 0.6; // pasa la zona muerta: derecha
    fotograma();
    mando.axes[0] = 0.45; // baja un poco, pero no hasta soltar: sigue
    fotograma();
    expect(eventos.map((e) => `${e.type} ${e.code}`)).toEqual(['keydown ArrowRight']);

    mando.axes[0] = 0.1; // vuelve casi al centro: se suelta
    fotograma();
    expect(eventos.at(-1)).toMatchObject({ type: 'keyup', code: 'ArrowRight' });
  });

  it('si se desconecta con un boton pulsado, se suelta todo', async () => {
    const modulo = await arrancar();
    pulsar(1, true);
    fotograma();
    expect(modulo.conectado).toBe(true);

    vi.stubGlobal('navigator', { getGamepads: () => [null] });
    fotograma();
    expect(modulo.conectado).toBe(false);
    expect(eventos.at(-1)).toMatchObject({ type: 'keyup', code: 'ShiftLeft' });
  });
});
