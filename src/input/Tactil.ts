/**
 * Estado de los controles tactiles, compartido por toda la partida.
 *
 * EL JUEGO NO SE ENTERA DE QUE EXISTE ESTO. `Controles` ya exponia una bandera
 * por accion (`saltarPresionado`, `interactuarPresionado`, ...) y los dedos
 * alimentan ESAS MISMAS banderas: ni las escenas ni el Cirujano cambian una
 * linea. Cualquier otra forma habria significado duplicar la logica de entrada
 * en dos sitios y que se separaran a la primera.
 *
 * Vive fuera de las escenas porque los botones los dibuja una escena de
 * interfaz y quien los lee es otra, la del nivel. Un singleton es la pieza mas
 * simple que las une sin que ninguna conozca a la otra.
 *
 * Los flancos ("recien pulsado", "recien soltado") se calculan aqui, una vez
 * por fotograma, igual que ya se hacia con el raton: asi un boton y una tecla
 * significan exactamente lo mismo para el resto del codigo.
 */

export type AccionTactil =
  | 'izquierda'
  | 'derecha'
  | 'arriba'
  | 'abajo'
  | 'saltar'
  | 'dash'
  | 'atacar'
  | 'parry'
  | 'pocion'
  | 'interactuar'
  | 'injertadora'
  | 'codice'
  | 'pausa';

class Tactil {
  private abajo = new Set<AccionTactil>();
  private antes = new Set<AccionTactil>();
  private ahora = new Set<AccionTactil>();

  /**
   * Si este aparato se maneja con los dedos.
   *
   * No basta con mirar si el navegador entiende de tactil: los portatiles con
   * pantalla tactil tambien dicen que si, y ahi los botones estorbarian encima
   * de un juego que se esta jugando con teclado. Se exige ademas que el puntero
   * principal sea BASTO (un dedo) y que no haya raton fino.
   */
  get esAparatoTactil(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;

    // `?tactil` fuerza el modo dedos en un ordenador. Es para probar la
    // botonera sin tener el telefono delante, que es como se colaron los
    // fallos de #72 a #74; no cambia nada para quien solo juega.
    if (window.location?.search.includes('tactil')) return true;

    const hayTactil = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const punteroBasto = window.matchMedia('(pointer: coarse)').matches;
    const hayRatonFino = window.matchMedia('(any-pointer: fine)').matches;

    return hayTactil && punteroBasto && !hayRatonFino;
  }

  /**
   * Fija de golpe lo que hay pulsado ahora mismo.
   *
   * La botonera no enciende y apaga acciones: cada fotograma mira que dedos
   * hay en la pantalla y manda la lista entera. Un estado que se sustituye no
   * puede quedarse pegado, que era el fallo de raiz del mando tactil (#72).
   */
  fijar(acciones: ReadonlySet<AccionTactil>): void {
    this.abajo = new Set(acciones);
  }

  /**
   * Suelta todo. Al esconder los botones, al perder el foco o al morir el
   * Cirujano no puede quedarse nada pegado.
   */
  soltarTodo(): void {
    this.abajo.clear();
  }

  /** Fija el fotograma. Lo llama `Controles.actualizar()`, una sola vez. */
  actualizar(): void {
    this.antes = this.ahora;
    this.ahora = new Set(this.abajo);
  }

  estaAbajo(accion: AccionTactil): boolean {
    return this.ahora.has(accion);
  }

  recienPulsada(accion: AccionTactil): boolean {
    return this.ahora.has(accion) && !this.antes.has(accion);
  }

  recienSoltada(accion: AccionTactil): boolean {
    return !this.ahora.has(accion) && this.antes.has(accion);
  }
}

export const tactil = new Tactil();
