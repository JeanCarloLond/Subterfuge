import Phaser from 'phaser';
import './style.css';
import { MOVIMIENTO, RESOLUCION } from './config/Sacramento';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { AtrioScene } from './scenes/AtrioScene';
import { PasillosScene } from './scenes/PasillosScene';
import { SalasScene } from './scenes/SalasScene';
import { FinalScene } from './scenes/FinalScene';
import { HudScene } from './ui/HudScene';

/**
 * Subterfuge - teaser jugable de "La Diocesis de la Carne".
 * Flujo de escenas: Boot -> Preload -> Atrio -> Pasillos -> Salas -> Final,
 * con Hud corriendo en paralelo a los niveles.
 */
const configuracion: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'juego',
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
  scene: [BootScene, PreloadScene, AtrioScene, PasillosScene, SalasScene, FinalScene, HudScene],
};

new Phaser.Game(configuracion);
