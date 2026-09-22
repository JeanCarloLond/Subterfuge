import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { tactil, type AccionTactil } from '../input/Tactil';
import { toques } from '../input/Toques';

/**
 * La botonera de los dedos. Solo existe en aparatos tactiles.
 *
 * El teaser no se podia jugar desde un telefono: la pagina cargaba y no habia
 * forma de mover al Cirujano (issue #65). Importa mas de lo que parece porque
 * el portal se difunde con codigos QR, y quien escanea uno lo abre DESDE EL
 * MOVIL: era el peor primer contacto posible con el proyecto.
 *
 * Corre como escena paralela, encima del juego, y no toca ninguna logica: cada
 * boton solo enciende y apaga una bandera en `tactil`, y `Controles` las lee
 * junto a las teclas. Por eso un boton y una tecla son indistinguibles para el
 * resto del codigo.
 *
 * LA ENTRADA SE DERIVA, NO SE ACUMULA (issue #72). Antes cada boton era una
 * `Zone` con sus `pointerdown` y `pointerup`, y el estado vivia en un conjunto
 * que solo se vaciaba cuando llegaba el evento de soltar. Si ese evento no
 * llegaba —el dedo se levantaba con las zonas desactivadas, el navegador
 * cancelaba el toque, el jugador moria con el dedo puesto— la accion se
 * quedaba encendida para siempre y habia que recargar la pagina.
 *
 * Ahora no hay eventos por boton: cada fotograma se miran los punteros que
 * Phaser da por pulsados y se calcula que boton tiene cada uno debajo. Lo que
 * se recalcula no se puede quedar pegado, y arrastrar el pulgar de un boton a
 * otro funciona solo, que es como se juega en un movil.
 *
 * OTRAS DECISIONES QUE SE NOTAN CON EL MOVIL EN LA MANO:
 *
 *   - La cruceta lleva ARRIBA y ABAJO aunque no se camine en vertical. Son los
 *     ataques direccionales y el trepar o soltarse de un borde: sin ellos el
 *     rebote sobre un enemigo —que es medio kit de movimiento— no se puede
 *     hacer con los dedos.
 *   - El tamano sale del ANCHO REAL de la pantalla, no de constantes del
 *     lienzo: 44 px CSS es el minimo de un objetivo tactil, y en un lienzo de
 *     480 px de ancho eso son mas pixeles internos en un telefono pequeno que
 *     en uno grande (issue #73).
 *   - El area que responde es MAS GRANDE que el circulo dibujado. El dibujo
 *     tiene que dejar ver el juego; el dedo no tiene que acertar en el dibujo.
 *   - En vertical no se dibuja nada: se pide girar el aparato. Con 480x320 de
 *     lienzo, en vertical quedan bandas enormes y los botones se comen la
 *     mitad de lo poco que queda.
 */

const COLOR = {
  relleno: 0x231d29,
  borde: 0xc9a44c,
  pulsado: 0x8c2f2f,
  glifo: '#e6ddc8',
  glifoPulsado: '#ffffff',
  aviso: '#e8d9a0',
  velo: 0x0b090b,
} as const;

/**
 * Opacidad en reposo. Subida desde 0,42: el Vientre es negro y sobre piedra
 * oscura unos botones tenues no se distinguian del fondo (issue #73).
 */
const ALPHA = 0.55;
const ALPHA_PULSADO = 0.92;

/** Minimo de un objetivo tactil, en pixeles CSS (unos 9 mm). */
const MINIMO_CSS = 44;

/** Importancia de cada boton: decide su tamano dentro de la botonera. */
type Talla = 'grande' | 'media' | 'pequena';

interface Boton {
  accion: AccionTactil;
  glifo: string;
  talla: Talla;
  /** Donde se ancla, y a que distancia de esa esquina en radios. */
  esquina: 'abajo-izquierda' | 'abajo-derecha' | 'arriba-derecha';
  dx: number;
  dy: number;
}

/**
 * Los botones, en unidades de radio respecto a su esquina. Colocarlos asi y no
 * en pixeles fijos es lo que permite que la botonera entera crezca o encoja
 * con la pantalla sin que nada se solape (issue #73).
 *
 * Dos grupos, uno por pulgar: la cruceta a la izquierda y las acciones a la
 * derecha. Lo que mas se usa —mover, saltar, atacar— es grande y cae donde el
 * pulgar llega sin estirarse; lo que se usa una vez por sala —libro, pausa—
 * es pequeno y se va arriba, fuera del camino.
 */
const BOTONES: readonly Boton[] = [
  // Cruceta, mano izquierda, en rombo: izquierda y derecha a la altura del
  // pulgar, y arriba y abajo por encima y por debajo, donde se buscan.
  { accion: 'abajo', glifo: 'v', talla: 'media', esquina: 'abajo-izquierda', dx: 2.1, dy: 1 },
  { accion: 'izquierda', glifo: '<', talla: 'grande', esquina: 'abajo-izquierda', dx: 1, dy: 2.1 },
  { accion: 'derecha', glifo: '>', talla: 'grande', esquina: 'abajo-izquierda', dx: 3.2, dy: 2.1 },
  { accion: 'arriba', glifo: '^', talla: 'media', esquina: 'abajo-izquierda', dx: 2.1, dy: 3.2 },

  // Acciones, mano derecha. Atacar y saltar son los dos grandes y van abajo,
  // al alcance del pulgar sin estirarlo.
  { accion: 'atacar', glifo: 'X', talla: 'grande', esquina: 'abajo-derecha', dx: 1, dy: 1.1 },
  { accion: 'saltar', glifo: 'A', talla: 'grande', esquina: 'abajo-derecha', dx: 2.6, dy: 1 },
  { accion: 'parry', glifo: 'P', talla: 'media', esquina: 'abajo-derecha', dx: 1.2, dy: 2.9 },
  { accion: 'dash', glifo: '>>', talla: 'media', esquina: 'abajo-derecha', dx: 3.4, dy: 2.5 },
  { accion: 'interactuar', glifo: 'E', talla: 'media', esquina: 'abajo-derecha', dx: 4.4, dy: 1.2 },

  // Consumibles: pequenos, por encima del resto del grupo derecho.
  { accion: 'pocion', glifo: 'Q', talla: 'pequena', esquina: 'abajo-derecha', dx: 5.2, dy: 2.6 },
  { accion: 'injertadora', glifo: 'F', talla: 'pequena', esquina: 'abajo-derecha', dx: 2.4, dy: 4 },

  // Sistema: arriba a la derecha, donde no cae ningun pulgar jugando.
  { accion: 'codice', glifo: 'L', talla: 'pequena', esquina: 'arriba-derecha', dx: 1, dy: 1 },
  { accion: 'pausa', glifo: '||', talla: 'pequena', esquina: 'arriba-derecha', dx: 2.4, dy: 1 },
];

/** Un boton ya colocado, en coordenadas del lienzo interno. */
interface Puesto {
  boton: Boton;
  x: number;
  y: number;
  radio: number;
  /** Radio del area que responde al dedo. Mayor que el dibujo. */
  alcance: number;
  glifo: Phaser.GameObjects.Text;
  activo: boolean;
}

export class TactilScene extends Phaser.Scene {
  private grafico!: Phaser.GameObjects.Graphics;
  private puestos: Puesto[] = [];
  private avisoGiro!: Phaser.GameObjects.Container;
  private enVertical = false;
  private tapado = false;

  constructor() {
    super({ key: 'Tactil' });
  }

  create(): void {
    // Los dedos se leen del navegador, no de Phaser: ver `input/Toques.ts`.
    toques.escuchar(this.game.canvas);

    this.grafico = this.add.graphics().setDepth(10);
    this.puestos = [];
    this.tapado = false;

    for (const boton of BOTONES) {
      const glifo = this.add
        .text(0, 0, boton.glifo, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: COLOR.glifo,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(11);
      this.puestos.push({ boton, glifo, x: 0, y: 0, radio: 16, alcance: 22, activo: false });
    }

    // Pantalla completa al primer toque, si el navegador deja. En movil la
    // barra de direcciones se come una franja y aparece y desaparece al
    // desplazar, moviendo el lienzo en mitad de un salto.
    //
    // Tiene que ser DENTRO de un toque: los navegadores no conceden pantalla
    // completa fuera de un gesto del usuario. Safari en iPhone no la da nunca
    // para un lienzo, asi que esto simplemente no hace nada ahi — y por eso el
    // juego no depende de ello para nada.
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.scale.fullscreen.available && !this.scale.isFullscreen) {
        try {
          this.scale.startFullscreen();
        } catch {
          // Denegada: se sigue jugando en ventana, que funciona igual.
        }
      }
    });

    this.avisoGiro = this.crearAvisoGiro();
    this.colocar();
    this.escalaCambiada();

    const alCambiar = () => {
      this.colocar();
      this.escalaCambiada();
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, alCambiar);
    this.scale.on(Phaser.Scale.Events.ORIENTATION_CHANGE, alCambiar);

    // Si el navegador se lleva el foco (una llamada, cambiar de pestana), no
    // puede quedarse un boton pegado y el Cirujano corriendo solo. Con la
    // entrada derivada esto ya no deberia hacer falta, pero soltar de golpe
    // evita que el ultimo fotograma antes de irse deje algo encendido.
    const alPerderFoco = () => tactil.soltarTodo();
    this.game.events.on(Phaser.Core.Events.BLUR, alPerderFoco);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, alPerderFoco);
      this.scale.off(Phaser.Scale.Events.RESIZE, alCambiar);
      this.scale.off(Phaser.Scale.Events.ORIENTATION_CHANGE, alCambiar);
      tactil.soltarTodo();
    });
  }

  /**
   * Coloca la botonera a partir del tamano REAL de la pantalla.
   *
   * `MINIMO_CSS` son pixeles de pantalla; hay que traducirlos a pixeles del
   * lienzo interno, que es donde se dibuja. En un telefono pequeno el lienzo
   * se ve mas pequeno, asi que un dedo ocupa MAS pixeles internos: por eso los
   * botones salen proporcionalmente mas grandes ahi, que es justo lo que hace
   * falta (issue #73).
   */
  private colocar(): void {
    const { ancho, alto } = RESOLUCION;
    const anchoReal = this.scale.displaySize.width || ancho;
    const porPixelCss = ancho / anchoReal;

    // Radio del boton grande: el minimo tactil, y nunca mas de un sexto de la
    // pantalla (si no, en una tableta la botonera se comeria el juego).
    const grande = Phaser.Math.Clamp((MINIMO_CSS * porPixelCss) / 2, 18, ancho / 12);
    const radioDe = (talla: Talla) =>
      talla === 'grande' ? grande : talla === 'media' ? grande * 0.82 : grande * 0.68;

    // Margen seguro: la muesca y la barra de gestos del aparato. Se leen de
    // las variables que el navegador expone en el documento.
    const seguro = this.margenSeguro(porPixelCss);

    for (const puesto of this.puestos) {
      const { boton } = puesto;
      const radio = radioDe(boton.talla);
      const paso = grande * 1.42;

      const x =
        boton.esquina === 'abajo-izquierda'
          ? seguro.izquierda + radio + (boton.dx - 1) * paso
          : ancho - seguro.derecha - radio - (boton.dx - 1) * paso;
      const y =
        boton.esquina === 'arriba-derecha'
          ? seguro.arriba + radio + (boton.dy - 1) * paso
          : alto - seguro.abajo - radio - (boton.dy - 1) * paso;

      puesto.x = x;
      puesto.y = y;
      puesto.radio = radio;
      // El dedo tapa mucho mas de lo que ve: el area que responde es un 40 %
      // mayor que el circulo, sin que los circulos lleguen a tocarse.
      puesto.alcance = radio * 1.4;
      puesto.glifo.setPosition(x, y);
      puesto.glifo.setFontSize(Math.max(8, Math.round(radio * 0.7)));
    }

    this.dibujar();
  }

  /** Las zonas que el aparato se reserva (muesca, barra de gestos), en px del lienzo. */
  private margenSeguro(porPixelCss: number): {
    izquierda: number;
    derecha: number;
    arriba: number;
    abajo: number;
  } {
    const base = 6;
    if (typeof getComputedStyle === 'undefined') {
      return { izquierda: base, derecha: base, arriba: base, abajo: base };
    }

    const estilo = getComputedStyle(document.documentElement);
    const leer = (nombre: string) => {
      const valor = parseFloat(estilo.getPropertyValue(nombre));
      return Number.isFinite(valor) ? valor * porPixelCss : 0;
    };

    return {
      izquierda: base + leer('--seguro-izquierda'),
      derecha: base + leer('--seguro-derecha'),
      arriba: base + leer('--seguro-arriba'),
      abajo: base + leer('--seguro-abajo'),
    };
  }

  /**
   * El corazon del mando: se mira que dedos hay en la pantalla y se deduce que
   * botones estan pulsados. No se guarda nada entre fotogramas, asi que no hay
   * forma de que una accion se quede encendida sin dedo encima (issue #72).
   */
  update(): void {
    this.comprobarTapado();

    if (this.enVertical || this.tapado) {
      if (this.puestos.some((p) => p.activo)) {
        for (const puesto of this.puestos) puesto.activo = false;
        tactil.soltarTodo();
        this.dibujar();
      }
      return;
    }

    const pulsados = new Set<AccionTactil>();
    for (const punto of toques.activos) {
      const puesto = this.botonBajo(punto.x, punto.y);
      if (puesto) pulsados.add(puesto.boton.accion);
    }

    let cambio = false;
    for (const puesto of this.puestos) {
      const activo = pulsados.has(puesto.boton.accion);
      if (activo === puesto.activo) continue;
      puesto.activo = activo;
      cambio = true;
    }

    tactil.fijar(pulsados);
    if (cambio) this.dibujar();
  }

  /** El boton cuyo centro esta mas cerca del dedo, si cae dentro de su alcance. */
  private botonBajo(x: number, y: number): Puesto | null {
    let mejor: Puesto | null = null;
    let mejorDistancia = Infinity;

    for (const puesto of this.puestos) {
      const distancia = Phaser.Math.Distance.Between(x, y, puesto.x, puesto.y);
      if (distancia <= puesto.alcance && distancia < mejorDistancia) {
        mejor = puesto;
        mejorDistancia = distancia;
      }
    }
    return mejor;
  }

  /**
   * Los botones se esconden cuando hay una pantalla delante.
   *
   * El dialogo, el libro y la pausa tienen su propia forma de tocarse, y la
   * botonera encima solo taparia. Peor: con el dialogo abierto el nivel esta
   * en pausa, asi que pulsar la cruceta no hacia nada y parecia que el juego
   * se habia colgado.
   */
  private comprobarTapado(): void {
    const tapado =
      this.scene.isActive('Dialogo') ||
      this.scene.isActive('Codice') ||
      this.scene.isActive('Pausa');

    if (tapado === this.tapado) return;
    this.tapado = tapado;
    for (const puesto of this.puestos) puesto.glifo.setVisible(!tapado);
    this.dibujar();
  }

  /**
   * En vertical no se juega: el lienzo es apaisado y los botones se comerian
   * la mitad de lo poco que quedaria. Se pide girar y se sueltan las teclas.
   */
  private escalaCambiada(): void {
    const { width, height } = this.scale.displaySize;
    const vertical = height > width;
    if (vertical === this.enVertical) return;

    this.enVertical = vertical;
    this.avisoGiro.setVisible(vertical);
    if (vertical) tactil.soltarTodo();
    for (const puesto of this.puestos) puesto.glifo.setVisible(!vertical && !this.tapado);
    this.dibujar();
  }

  private dibujar(): void {
    this.grafico.clear();
    if (this.enVertical || this.tapado) return;

    for (const puesto of this.puestos) {
      const { x, y, radio, activo } = puesto;

      // Un halo oscuro debajo: sobre la piedra clara del Atrio un boton
      // translucido se perdia, y sobre el negro de las Criptas tambien.
      this.grafico.fillStyle(COLOR.velo, activo ? 0.5 : 0.35);
      this.grafico.fillCircle(x, y, radio + 2);

      this.grafico.fillStyle(
        activo ? COLOR.pulsado : COLOR.relleno,
        activo ? ALPHA_PULSADO : ALPHA,
      );
      this.grafico.fillCircle(x, y, radio);
      this.grafico.lineStyle(activo ? 2 : 1, COLOR.borde, activo ? 1 : 0.7);
      this.grafico.strokeCircle(x, y, radio);

      puesto.glifo.setColor(activo ? COLOR.glifoPulsado : COLOR.glifo);
      puesto.glifo.setAlpha(activo ? 1 : 0.85);
    }
  }

  private crearAvisoGiro(): Phaser.GameObjects.Container {
    const { ancho, alto } = RESOLUCION;

    const velo = this.add.rectangle(0, 0, ancho, alto, COLOR.velo, 0.96).setOrigin(0, 0);
    const texto = this.add
      .text(ancho / 2, alto / 2, 'GIRA EL DISPOSITIVO\n\nel Vientre se baja en horizontal', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLOR.aviso,
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0.5);

    return this.add.container(0, 0, [velo, texto]).setDepth(50).setVisible(false);
  }
}
