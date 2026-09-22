import Phaser from 'phaser';
import './style.css';
import { MOVIMIENTO } from './config/Sacramento';
import {
  LIENZO,
  NitidezPlugin,
  dimensionarContenedor,
  registrarTextoNitido,
} from './systems/Nitidez';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { AtrioScene } from './scenes/AtrioScene';
import { PasillosScene } from './scenes/PasillosScene';
import { CriptasScene } from './scenes/CriptasScene';
import { SalasScene } from './scenes/SalasScene';
import { FinalScene } from './scenes/FinalScene';
import { HudScene } from './ui/HudScene';
import { CodiceScene } from './ui/CodiceScene';
import { DialogoScene } from './ui/DialogoScene';
import { PausaScene } from './ui/PausaScene';
import { TactilScene } from './ui/TactilScene';

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
  // El lienzo mide la resolucion logica (480x320) por una escala entera que
  // depende de la pantalla, y cada camara se acerca esa misma escala: el mundo
  // se ve igual, pero el texto se rasteriza a tamano real (#69, Nitidez.ts).
  width: LIENZO.ancho,
  height: LIENZO.alto,
  backgroundColor: '#141014',
  pixelArt: true,
  roundPixels: true,
  input: {
    // Varios dedos a la vez. Con un solo puntero no se puede correr y saltar
    // al mismo tiempo, que es el minimo para jugar esto en un movil (#65).
    activePointers: 4,
  },
  scale: {
    // FIT ajusta el lienzo a la ventana. Como el lienzo ya viene a la escala
    // de la pantalla, el ajuste que le queda a FIT es pequeno; no usar `zoom`
    // aqui, que se pisa con FIT (la vista quedaba recortada).
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [{ key: 'NitidezPlugin', plugin: NitidezPlugin, mapping: 'nitidez' }],
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
    DialogoScene,
    TactilScene,
  ],
};

registrarTextoNitido();
dimensionarContenedor('juego');
new Phaser.Game(configuracion);

// El lienzo no ocupa toda la pagina (Scale.FIT deja margenes), y un clic
// derecho en ese margen tambien abria el menu. Toda la pagina es el juego, asi
// que se bloquea en el documento entero: aqui el boton derecho es del juego.
document.addEventListener('contextmenu', (evento) => evento.preventDefault());
