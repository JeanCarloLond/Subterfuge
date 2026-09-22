import { RESOLUCION } from '../config/Sacramento';

/**
 * Los dedos que hay en la pantalla ahora mismo, leidos del navegador.
 *
 * Por que no se usa la entrada de Phaser para esto. Un `Pointer` de Phaser
 * pasa por muchas manos antes de llegar aqui: se reparte entre escenas (y la
 * de arriba puede quedarselo), guarda los limites del lienzo en cache (y al
 * entrar en pantalla completa o al plegarse la barra del navegador esa cache
 * envejece y los toques caen desplazados), y su `isDown` se queda encendido si
 * un `touchend` se pierde. Cada una de esas tres cosas dejo el mando muerto en
 * el movil de un probador (#72, #75).
 *
 * El navegador, en cambio, da una lista AUTORITATIVA en cada evento:
 * `TouchEvent.touches` son los dedos que siguen puestos, sin historia y sin
 * cache. Esa lista se copia entera en cada evento, asi que no hay estado que
 * pueda desincronizarse: si no hay dedos, no hay nada pulsado, y punto.
 *
 * Las coordenadas se entregan en el espacio LOGICO del juego (480x320), que es
 * donde dibujan las escenas de interfaz. La conversion lee el rectangulo del
 * lienzo en el momento del evento, nunca antes: por eso no le afecta un cambio
 * de tamano, un giro ni la pantalla completa.
 */

export interface Punto {
  x: number;
  y: number;
}

/** Un dedo: donde esta y desde cuando. */
interface Dedo extends Punto {
  /** Instante en que se poso. Sirve para no confundir un dedo con otro. */
  inicio: number;
}

type Oyente = (punto: Punto, inicio: number) => void;

class Toques {
  private lienzo: HTMLCanvasElement | null = null;
  private puntos = new Map<number, Dedo>();
  private oyentesSuelta = new Set<Oyente>();

  /** Empieza a escuchar. Se llama una vez, con el lienzo del juego. */
  escuchar(lienzo: HTMLCanvasElement): void {
    if (this.lienzo) return;
    this.lienzo = lienzo;

    lienzo.addEventListener('touchstart', this.alTocar, { passive: false });
    lienzo.addEventListener('touchmove', this.alTocar, { passive: false });
    lienzo.addEventListener('touchend', this.alTerminarToque);
    lienzo.addEventListener('touchcancel', this.alTerminarToque);

    // El raton entra por el mismo sitio para que `?tactil` sirva de verdad
    // como banco de pruebas en un ordenador.
    lienzo.addEventListener('pointerdown', this.alPuntero);
    lienzo.addEventListener('pointermove', this.alPuntero);
    lienzo.addEventListener('pointerup', this.alSoltarPuntero);
    lienzo.addEventListener('pointercancel', this.alSoltarPuntero);
    window.addEventListener('blur', this.alPerderFoco);
  }

  /** Los dedos puestos, en coordenadas logicas (480x320). */
  get activos(): Punto[] {
    return [...this.puntos.values()];
  }

  /**
   * Avisa cuando un dedo se levanta, con el punto donde estaba y con el
   * instante en que se poso. Los botones de las pantallas actuan aqui y no al
   * posarlo: asi un toque que empieza mal se puede corregir arrastrando fuera.
   *
   * El instante importa: un boton recien nacido NO debe hacer caso de un dedo
   * que ya estaba puesto antes que el. Sin eso, abrir el libro con el boton L
   * lo cerraba en el acto, porque la cruz de cerrar aparecia justo debajo del
   * dedo y se quedaba con su suelta (#75).
   *
   * @returns la funcion para dejar de escuchar.
   */
  alSoltar(oyente: Oyente): () => void {
    this.oyentesSuelta.add(oyente);
    return () => this.oyentesSuelta.delete(oyente);
  }

  private convertir(clienteX: number, clienteY: number): Punto | null {
    if (!this.lienzo) return null;
    // El rectangulo se lee AHORA. Guardarlo entre eventos es justo lo que
    // hace que los toques se desplacen tras un giro o al entrar en pantalla
    // completa.
    const caja = this.lienzo.getBoundingClientRect();
    if (caja.width === 0 || caja.height === 0) return null;

    return {
      x: ((clienteX - caja.left) / caja.width) * RESOLUCION.ancho,
      y: ((clienteY - caja.top) / caja.height) * RESOLUCION.alto,
    };
  }

  private readonly alTocar = (evento: TouchEvent): void => {
    // Sin esto el navegador interpreta el arrastre del pulgar como un gesto
    // suyo (desplazar, recargar tirando hacia abajo) y se lleva el toque.
    evento.preventDefault();
    this.copiarDe(evento.touches);
  };

  private readonly alTerminarToque = (evento: TouchEvent): void => {
    for (const toque of Array.from(evento.changedTouches)) {
      const punto = this.convertir(toque.clientX, toque.clientY);
      const inicio = this.puntos.get(toque.identifier)?.inicio ?? performance.now();
      if (punto && evento.type === 'touchend') this.anunciarSuelta(punto, inicio);
    }
    // `touches` ya no incluye los que acaban de terminar: copiarla deja el
    // estado exacto sin tener que acertar que identificadores quitar.
    this.copiarDe(evento.touches);
  };

  private copiarDe(lista: TouchList): void {
    const nuevos = new Map<number, Dedo>();
    for (const toque of Array.from(lista)) {
      const punto = this.convertir(toque.clientX, toque.clientY);
      if (!punto) continue;
      // Un dedo que ya estaba conserva su instante: mover no es volver a posar.
      const inicio = this.puntos.get(toque.identifier)?.inicio ?? performance.now();
      nuevos.set(toque.identifier, { ...punto, inicio });
    }
    this.puntos = nuevos;
  }

  private readonly alPuntero = (evento: PointerEvent): void => {
    // Los toques ya entran por los eventos de arriba; aqui solo el raton.
    if (evento.pointerType === 'touch') return;
    if (evento.buttons === 0) {
      this.puntos.delete(evento.pointerId);
      return;
    }
    const punto = this.convertir(evento.clientX, evento.clientY);
    if (!punto) return;
    const inicio = this.puntos.get(evento.pointerId)?.inicio ?? performance.now();
    this.puntos.set(evento.pointerId, { ...punto, inicio });
  };

  private readonly alSoltarPuntero = (evento: PointerEvent): void => {
    if (evento.pointerType === 'touch') return;
    const inicio = this.puntos.get(evento.pointerId)?.inicio ?? performance.now();
    this.puntos.delete(evento.pointerId);
    const punto = this.convertir(evento.clientX, evento.clientY);
    if (punto && evento.type === 'pointerup') this.anunciarSuelta(punto, inicio);
  };

  /** Cambiar de pestana o recibir una llamada no puede dejar un dedo puesto. */
  private readonly alPerderFoco = (): void => {
    this.puntos.clear();
  };

  private anunciarSuelta(punto: Punto, inicio: number): void {
    for (const oyente of this.oyentesSuelta) oyente(punto, inicio);
  }
}

export const toques = new Toques();
