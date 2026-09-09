import Phaser from 'phaser';
import { sonido } from '../systems/Sonido';

/**
 * Boot: arranque minimo. No carga assets pesados, solo deja el motor listo
 * y cede el paso a Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    // Los navegadores no dejan sonar nada hasta que el usuario interactua, asi
    // que el audio queda a la espera del primer teclazo o clic.
    sonido.vincularActivacion();

    // El filtrado NEAREST lo aplica `pixelArt: true` en la config del juego.
    this.scene.start('Preload');
  }
}
