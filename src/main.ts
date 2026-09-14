import Phaser from 'phaser';
import './style.css';
import { MOVIMIENTO, RESOLUCION } from './config/Sacramento';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { AtrioScene } from './scenes/AtrioScene';
import { PasillosScene } from './scenes/PasillosScene';
import { CriptasScene } from './scenes/CriptasScene';
import { SalasScene } from './scenes/SalasScene';
import { FinalScene } from './scenes/FinalScene';
import { HudScene } from './ui/HudScene';
import { CodiceScene } from './ui/CodiceScene';
import { PausaScene } from './ui/PausaScene';

/**
 * Subterfuge - teaser jugable de "La Diocesis de la Carne".
 * Flujo de escenas: Boot -> Preload -> Atrio -> Pasillos -> Criptas -> Salas
 * -> Final,
 * con Hud corriendo en paralelo a los niveles.
 */
const configuracion: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'juego',
  // El clic derecho es el parry. Sin esto, cada parry con raton abria el menu
  // del navegador encima del juego. Esto lo bloquea en el lienzo en TODAS las
  // escenas; el contenedor de la pagina se bloquea mas abajo.
  disableContextMenu: true,
  width: RESOLUCION.ancho,
  height: RESOLUCION.alto,
  backgroundColor: '#141014',
  pixelArt: true,
  roundPixels: true,
  scale: {
    // FIT ya escala el lienzo de 480x320 para llenar la ventana. Combinarlo con
    // `zoom` hacia que se pisaran: la vista quedaba recortada, el telon de fondo
    // no llegaba a los bordes y el texto de ayuda se salia por abajo.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: MOVIMIENTO.gravedad },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    AtrioScene,
    PasillosScene,
    CriptasScene,
    SalasScene,
    FinalScene,
    HudScene,
    CodiceScene,
    PausaScene,
  ],
};

new Phaser.Game(configuracion);

// El lienzo no ocupa toda la pagina (Scale.FIT deja margenes), y un clic
// derecho en ese margen tambien abria el menu. Toda la pagina es el juego, asi
// que se bloquea en el documento entero: aqui el boton derecho es del juego.
document.addEventListener('contextmenu', (evento) => evento.preventDefault());
