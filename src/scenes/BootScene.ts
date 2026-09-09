import Phaser from 'phaser';

/**
 * Boot: arranque minimo. No carga assets pesados, solo deja el motor listo
 * y cede el paso a Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    // El filtrado NEAREST lo aplica `pixelArt: true` en la config del juego.
    this.scene.start('Preload');
  }
}
