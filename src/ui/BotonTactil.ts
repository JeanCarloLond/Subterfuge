import Phaser from 'phaser';

/**
 * Un boton redondo para el dedo, dentro de una pantalla del juego.
 *
 * Las pantallas que se abren sobre el nivel —el libro, el dialogo, la pausa—
 * se escribieron para teclado y raton, y sus salidas eran textos de siete
 * pixeles en una esquina: en un telefono, objetivos de dos milimetros. Quien
 * no acertaba se quedaba encerrado en el libro y tenia que recargar la pagina
 * (issue #74).
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

  const fondo = escena.add.graphics();
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
  contenedor.setSize(radio * 3, radio * 3);
  contenedor.setInteractive(new Phaser.Geom.Circle(0, 0, radio * 1.5), Phaser.Geom.Circle.Contains);

  contenedor.on('pointerdown', () => pintar(true));
  contenedor.on('pointerout', () => pintar(false));
  // Se actua al LEVANTAR el dedo, no al posarlo: asi un toque que empieza mal
  // se puede corregir arrastrando fuera, como en cualquier aplicacion.
  contenedor.on('pointerup', () => {
    pintar(false);
    alPulsar();
  });

  return contenedor;
}
