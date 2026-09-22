import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { tactil } from '../input/Tactil';

/**
 * Nitidez: el juego se dibuja a la resolucion de la pantalla, no a 480x320.
 *
 * El problema (issue #69): el lienzo media 480x320 pixeles de verdad y
 * Scale.FIT lo estiraba con CSS. Todo lo que se pintaba en el, texto incluido,
 * se ampliaba x3 o x4 con pixel gordo. El pixel art esta pensado para eso; la
 * tipografia no, y los dialogos se leian como bloques.
 *
 * La solucion es la clasica de los juegos de pixel art en Phaser 3: un lienzo
 * `ESCALA` veces mas grande y TODAS las camaras con `setZoom(ESCALA)`. El
 * mundo se sigue viendo exactamente igual, 480x320 logicos, y las escenas
 * siguen colocando todo en ese espacio. Lo que cambia es el framebuffer: el
 * arte se amplia con vecino mas cercano (igual que antes) y el texto, con
 * `resolution = ESCALA`, se rasteriza a tamano real.
 *
 * `ESCALA` es entera para que cada pixel del arte mida un numero exacto de
 * pixeles de pantalla, y se calcula una vez al arrancar: cuantas veces cabe
 * 480x320 en la ventana, contando la densidad de pixeles del dispositivo.
 *
 * Dos detalles de la camara de Phaser que hay que saber para tocar esto:
 *
 *   - Con zoom, la camara escala alrededor de su CENTRO. Una escena de
 *     interfaz (HUD, pausa, libro) que coloca todo en 480x320 logicos necesita
 *     `centerOn(240, 160)` para que el (0,0) logico caiga en la esquina.
 *   - Los objetos con `scrollFactor 0` ignoran el desplazamiento de la camara
 *     pero NO el zoom desde el centro. En un nivel, para que uno de ellos
 *     aparezca en el (x, y) logico hay que colocarlo en `fijo(x, y)`.
 */

function calcularEscala(): number {
  if (typeof window === 'undefined') return 1;
  const densidad = window.devicePixelRatio || 1;
  const horizontal = (window.innerWidth * densidad) / RESOLUCION.ancho;
  const vertical = (window.innerHeight * densidad) / RESOLUCION.alto;
  return Phaser.Math.Clamp(Math.floor(Math.min(horizontal, vertical)), 1, 6);
}

/** Cuantas veces cabe la resolucion logica en la pantalla. Entera. */
export const ESCALA = calcularEscala();

/** Tamano real del lienzo. */
export const LIENZO = {
  ancho: RESOLUCION.ancho * ESCALA,
  alto: RESOLUCION.alto * ESCALA,
} as const;

/**
 * Donde hay que colocar un objeto fijo a la camara (`scrollFactor 0`) de un
 * nivel para que se vea en el (x, y) logico. Con ESCALA 1 no desplaza nada.
 */
export function fijo(x: number, y: number): { x: number; y: number } {
  return {
    x: x + (LIENZO.ancho - RESOLUCION.ancho) / 2,
    y: y + (LIENZO.alto - RESOLUCION.alto) / 2,
  };
}

/**
 * Deja el contenedor del juego EXACTAMENTE del tamano del lienzo en pixeles
 * de pantalla. Scale.FIT ajusta el lienzo a su contenedor; si el contenedor es
 * la ventana entera, FIT lo estira un poco (1440 -> 1620 en una pantalla
 * 1080p) y ese resto no entero vuelve a emborronar el texto y desiguala los
 * pixeles del arte. Con el contenedor a medida, FIT no tiene nada que escalar
 * y cada pixel del lienzo cae en un pixel del monitor.
 *
 * Los maximos en CSS son la red: si la ventana se encoge despues de arrancar,
 * FIT vuelve a hacer su trabajo y el juego sigue cabiendo.
 */
export function dimensionarContenedor(id: string): void {
  if (typeof document === 'undefined') return;
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  // En un aparato tactil manda llenar la pantalla: los controles de dedo
  // necesitan sitio y nadie mira el pixel de cerca. El lienzo ya viene a 2x o
  // 3x, asi que lo que FIT estira de mas es poco (#70).
  //
  // Y hay que decirlo con medidas EXPLICITAS: el contenedor es un elemento de
  // una rejilla centrada, asi que sin tamano propio se encoge hasta el del
  // lienzo y Scale.FIT se queda midiendo su propia salida. El juego acababa
  // pequeno y centrado en vez de llenar el telefono (#73). `dvh` y no `vh`
  // porque en moviles `vh` cuenta la barra de direcciones que luego se retira.
  if (tactil.esAparatoTactil) {
    contenedor.style.width = '100dvw';
    contenedor.style.height = '100dvh';
    return;
  }

  const densidad = window.devicePixelRatio || 1;
  contenedor.style.width = `${LIENZO.ancho / densidad}px`;
  contenedor.style.height = `${LIENZO.alto / densidad}px`;
  contenedor.style.maxWidth = '100vw';
  contenedor.style.maxHeight = '100vh';
  enmarcar(densidad);
}

/**
 * El marco: lo que rodea al lienzo cuando la pantalla no es un multiplo
 * exacto de 480x320. Negro plano se leia como un fallo. Ahora es la silleria
 * del Vientre (la del equipo), repetida a la misma escala que el juego,
 * oscurecida con una vineta para que no compita con la escena, y un filete
 * de oro alrededor del lienzo: el juego dentro de un nicho de piedra.
 */
function enmarcar(densidad: number): void {
  const pixel = ESCALA / densidad;
  const raiz = document.documentElement.style;
  raiz.setProperty('--silleria', `url(${import.meta.env.BASE_URL}assets/tilesets/vientre.png)`);
  raiz.setProperty('--silleria-ancho', `${128 * pixel}px`);
  raiz.setProperty('--silleria-alto', `${16 * pixel}px`);
  raiz.setProperty('--filete', `${Math.max(1, Math.round(pixel))}px`);
  document.body.classList.add('enmarcado');
}

/**
 * Plugin de escena: al arrancar cada escena, acerca su camara. Va como plugin
 * para no tener que acordarse de una linea en cada `create()`; una escena que
 * se la olvidara se veria a un tercio, en una esquina.
 */
export class NitidezPlugin extends Phaser.Plugins.ScenePlugin {
  boot(): void {
    this.systems?.events.on(Phaser.Scenes.Events.START, this.acercarCamara, this);
  }

  private acercarCamara(): void {
    const camara = this.scene?.cameras.main;
    if (!camara) return;
    camara.setZoom(ESCALA);
    camara.centerOn(RESOLUCION.ancho / 2, RESOLUCION.alto / 2);
  }
}

/**
 * Registra `this.add.text` para que todo texto nazca con `resolution = ESCALA`.
 * Es la API de extension de Phaser: se quita la fabrica de serie y se registra
 * la nuestra (`register` no pisa una existente, asi que hay que quitarla
 * antes). Se hace una vez, antes de crear el juego, y ninguna escena tiene
 * que saberlo.
 */
export function registrarTextoNitido(): void {
  Phaser.GameObjects.GameObjectFactory.remove('text');
  Phaser.GameObjects.GameObjectFactory.register(
    'text',
    function (
      this: Phaser.GameObjects.GameObjectFactory,
      x: number,
      y: number,
      texto: string | string[],
      estilo?: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
      const objeto = new Phaser.GameObjects.Text(this.scene, x, y, texto, {
        resolution: ESCALA,
        ...estilo,
      });
      this.displayList.add(objeto);
      return objeto;
    },
  );
}
