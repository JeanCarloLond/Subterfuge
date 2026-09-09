import Phaser from 'phaser';
import './style.css';
import { ESCALA_PIXEL, MOVIMIENTO, RESOLUCION } from './config/Sacramento';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { AtrioScene } from './scenes/AtrioScene';
import { PasillosScene } from './scenes/PasillosScene';
import { FinalScene } from './scenes/FinalScene';
import { HudScene } from './ui/HudScene';

/**
 * Subterfuge - teaser jugable de "La Diocesis de la Carne".
 * Flujo de escenas: Boot -> Preload -> Atrio.
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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: ESCALA_PIXEL,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: MOVIMIENTO.gravedad },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, AtrioScene, PasillosScene, FinalScene, HudScene],
};

new Phaser.Game(configuracion);
