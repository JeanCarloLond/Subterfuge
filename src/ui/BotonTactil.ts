import Phaser from 'phaser';
import { toques } from '../input/Toques';

/**
 * Un boton redondo para el dedo, dentro de una pantalla del juego.
 *
 * Las pantallas que se abren sobre el nivel —el libro, el dialogo, la pausa—
 * se escribieron para teclado y raton, y sus salidas eran textos de siete
 * pixeles en una esquina: en un telefono, objetivos de dos milimetros. Quien
 * no acertaba se quedaba encerrado en el libro y tenia que recargar la pagina
 * (issue #74).
 *
 * No usa la entrada de Phaser sino los dedos en crudo (`toques`). La primera
 * version si la usaba y el boton del libro respondia la primera vez y la
 * segunda no (#75): con varias escenas vivas a la vez, la de encima puede
 * quedarse el toque, y los limites del lienzo que Phaser guarda en cache
 * envejecen al entrar en pantalla completa. Leyendo el dedo directamente del
 * navegador no hay nada de eso que pueda fallar.
 *
 * El area que responde es bastante mayor que el circulo que se ve: el dedo
 * tapa mucho mas de lo que apunta, y el dibujo tiene que dejar leer el folio
 * que hay debajo.
 */
export function botonTactil(
  escena: Phaser.Scene,
  opciones: {
    x: number;
    y: number;
    radio: number;
    glifo: string;
    /** Color del glifo y del borde. */
    color: string;
    alPulsar: () => void;
  },
): Phaser.GameObjects.Container {
  const { x, y, radio, glifo, color, alPulsar } = opciones;
  const numero = Phaser.Display.Color.HexStringToColor(color).color;
  const alcance = radio * 1.6;

  const fondo = escena.add.graphics();
  let pulsadoAntes = false;
  const pintar = (pulsado: boolean) => {
    fondo.clear();
    fondo.fillStyle(0x0b090b, pulsado ? 0.9 : 0.72);
    fondo.fillCircle(0, 0, radio);
    fondo.lineStyle(pulsado ? 2 : 1, numero, pulsado ? 1 : 0.85);
    fondo.strokeCircle(0, 0, radio);
  };
  pintar(false);

  const texto = escena.add
    .text(0, 0, glifo, {
      fontFamily: 'monospace',
      fontSize: `${Math.max(9, Math.round(radio * 1.1))}px`,
      color,
    })
    .setOrigin(0.5, 0.5);

  const contenedor = escena.add.container(x, y, [fondo, texto]).setDepth(80);

  const dentro = (punto: { x: number; y: number }) =>
    Phaser.Math.Distance.Between(punto.x, punto.y, x, y) <= alcance;

  // Se actua al LEVANTAR el dedo: un toque que empieza mal se puede corregir
  // arrastrando fuera antes de soltar.
  // Un dedo que ya estaba puesto antes de que este boton existiera no es
  // suyo: abrir el libro con el boton L dejaba el dedo justo encima de la cruz
  // de cerrar, y al levantarlo el libro se cerraba solo (#75).
  const nacido = performance.now();
  const dejarDeEscuchar = toques.alSoltar((punto, inicio) => {
    if (inicio < nacido) return;
    if (!contenedor.visible || !dentro(punto)) return;
    pintar(false);
    pulsadoAntes = false;
    alPulsar();
  });

  // El realce se recalcula cada fotograma a partir de los dedos que hay; no se
  // guarda nada que pueda quedarse encendido.
  const alActualizar = () => {
    const pulsado = contenedor.visible && toques.activos.some(dentro);
    if (pulsado === pulsadoAntes) return;
    pulsadoAntes = pulsado;
    pintar(pulsado);
  };
  escena.events.on(Phaser.Scenes.Events.UPDATE, alActualizar);

  escena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    dejarDeEscuchar();
    escena.events.off(Phaser.Scenes.Events.UPDATE, alActualizar);
  });

  return contenedor;
}
