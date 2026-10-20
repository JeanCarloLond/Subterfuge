/**
 * Jugar con mando (issue #152).
 *
 * El mando no entra como un tercer sistema de entrada: se hace pasar por el
 * teclado. Cada fotograma se lee con la API de gamepad del navegador y cada
 * boton pulsado se traduce en la tecla que ya hace eso (A es ESPACIO, Start
 * es ESC...). Asi funciona igual en la partida y en TODOS los menus (pausa,
 * opciones, inicio, Codice, dialogos, saltar la cinematica) sin que ninguna
 * escena sepa que existe, que es la misma idea que sostiene los dedos (#65).
 *
 * Mapa del mando estandar (Xbox / PlayStation / generico):
 *
 *   stick izquierdo y cruceta  mover, arriba y abajo (flechas)
 *   A / Cruz         saltar        (ESPACIO)
 *   X / Cuadrado     golpear       (J; mantener, cargado)
 *   B / Circulo      dash          (SHIFT)
 *   Y / Triangulo    rezar, hablar (E)
 *   LB / L1          parry         (K)
 *   RB / R1          Injertadora   (F)
 *   LT / RT          Pocion        (Q)
 *   Select           Codice        (L)
 *   Start            pausa         (ESC)
 *
 * Rezar va en Y y no en la cruceta arriba: arriba ya apunta el golpe y trepa.
 */

/** Tecla que emula cada boton, por indice del mapa estandar. */
const BOTONES: Readonly<Record<number, string>> = {
  0: 'Space',
  1: 'ShiftLeft',
  2: 'KeyJ',
  3: 'KeyE',
  4: 'KeyK',
  5: 'KeyF',
  6: 'KeyQ',
  7: 'KeyQ',
  8: 'KeyL',
  9: 'Escape',
  12: 'ArrowUp',
  13: 'ArrowDown',
  14: 'ArrowLeft',
  15: 'ArrowRight',
};

/** Lo que lleva el evento de cada tecla. Phaser lee `keyCode`. */
const TECLAS: Readonly<Record<string, { key: string; keyCode: number }>> = {
  Space: { key: ' ', keyCode: 32 },
  ShiftLeft: { key: 'Shift', keyCode: 16 },
  KeyJ: { key: 'j', keyCode: 74 },
  KeyE: { key: 'e', keyCode: 69 },
  KeyK: { key: 'k', keyCode: 75 },
  KeyF: { key: 'f', keyCode: 70 },
  KeyQ: { key: 'q', keyCode: 81 },
  KeyL: { key: 'l', keyCode: 76 },
  Escape: { key: 'Escape', keyCode: 27 },
  ArrowUp: { key: 'ArrowUp', keyCode: 38 },
  ArrowDown: { key: 'ArrowDown', keyCode: 40 },
  ArrowLeft: { key: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { key: 'ArrowRight', keyCode: 39 },
};

/** Cuanto hay que inclinar el stick para que cuente, y cuanto para soltarlo. */
const ZONA_MUERTA = 0.5;
const ZONA_SOLTAR = 0.35;
/** Un gatillo analogico cuenta como pulsado a partir de aqui. */
const GATILLO = 0.5;

class Mando {
  /** Teclas que el mando tiene pulsadas ahora mismo, por codigo. */
  private abajo = new Set<string>();
  private arrancado = false;
  private hayMando = false;

  /** Hay un mando conectado: la ayuda enseña sus botones. */
  get conectado(): boolean {
    return this.hayMando;
  }

  /** Empieza a leer el mando. Una vez, al arrancar el juego. */
  arrancar(): void {
    if (this.arrancado || typeof window === 'undefined' || !navigator.getGamepads) return;
    this.arrancado = true;
    window.addEventListener('gamepaddisconnected', () => this.soltarTodo());
    // Cambiar de pestaña con un boton pulsado no puede dejarlo pegado.
    window.addEventListener('blur', () => this.soltarTodo());
    const leer = () => {
      this.muestrear();
      requestAnimationFrame(leer);
    };
    requestAnimationFrame(leer);
  }

  private muestrear(): void {
    const mando = [...navigator.getGamepads()].find((m): m is Gamepad => m !== null && m.connected);
    this.hayMando = mando !== undefined;
    if (!mando) {
      this.soltarTodo();
      return;
    }

    const deseadas = new Set<string>();
    mando.buttons.forEach((boton, i) => {
      const codigo = BOTONES[i];
      if (codigo && (boton.pressed || boton.value > GATILLO)) deseadas.add(codigo);
    });

    // El stick, con un poco de histeresis: entra al pasar la zona muerta y no
    // sale hasta volver casi al centro. Sin eso, en el borde parpadea.
    const [x = 0, y = 0] = mando.axes;
    const eje = (codigo: string, valor: number) => {
      const umbral = this.abajo.has(codigo) ? ZONA_SOLTAR : ZONA_MUERTA;
      if (valor > umbral) deseadas.add(codigo);
    };
    eje('ArrowLeft', -x);
    eje('ArrowRight', x);
    eje('ArrowUp', -y);
    eje('ArrowDown', y);

    for (const codigo of deseadas) if (!this.abajo.has(codigo)) this.emitir('keydown', codigo);
    for (const codigo of [...this.abajo]) if (!deseadas.has(codigo)) this.emitir('keyup', codigo);
  }

  private soltarTodo(): void {
    for (const codigo of [...this.abajo]) this.emitir('keyup', codigo);
  }

  private emitir(tipo: 'keydown' | 'keyup', codigo: string): void {
    const tecla = TECLAS[codigo];
    if (!tecla) return;
    if (tipo === 'keydown') this.abajo.add(codigo);
    else this.abajo.delete(codigo);

    const evento = new KeyboardEvent(tipo, {
      key: tecla.key,
      code: codigo,
      bubbles: true,
      cancelable: true,
    });
    // Phaser identifica las teclas por `keyCode`, que el constructor de
    // KeyboardEvent no deja poner. Se define a mano.
    Object.defineProperty(evento, 'keyCode', { get: () => tecla.keyCode });
    Object.defineProperty(evento, 'which', { get: () => tecla.keyCode });
    window.dispatchEvent(evento);
  }
}

export const mando = new Mando();
