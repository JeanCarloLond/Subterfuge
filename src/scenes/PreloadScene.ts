import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { generarArteProvisional } from '../systems/ArteProvisional';

/**
 * Preload: carga de assets y pantalla de espera.
 *
 * IMPORTANTE: las texturas de aqui son PLACEHOLDERS generados por codigo,
 * no arte. El arte definitivo es pixel art hecho a mano en Aseprite por el
 * equipo y entra por public/assets/ (ver docs/issues/). No sustituir estos
 * placeholders por imagenes generadas con IA.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload(): void {
    this.dibujarBarraDeCarga();
    // Cuando existan los assets reales, se cargan aqui:
    // this.load.spritesheet('cirujano', 'assets/sprites/cirujano.png', {...});
    // this.load.image('tileset-atrio', 'assets/tilesets/atrio.png');
    // this.load.tilemapTiledJSON('mapa-atrio', 'assets/maps/atrio.tmj');
  }

  create(): void {
    this.generarPlaceholders();
    this.scene.start('Atrio');
  }

  private dibujarBarraDeCarga(): void {
    const { ancho, alto } = RESOLUCION;
    const barra = this.add.graphics();

    this.load.on('progress', (valor: number) => {
      barra.clear();
      barra.fillStyle(0x3a2b2b, 1);
      barra.fillRect(ancho * 0.2, alto * 0.5 - 2, ancho * 0.6, 4);
      barra.fillStyle(0x8c2f2f, 1);
      barra.fillRect(ancho * 0.2, alto * 0.5 - 2, ancho * 0.6 * valor, 4);
    });

    this.load.on('complete', () => barra.destroy());
  }

  /**
   * Rectangulos solidos que hacen las veces de sprite mientras no hay arte.
   * Sirven para validar fisicas y colisiones, nada mas.
   */
  private generarPlaceholders(): void {
    generarArteProvisional(this);
  }
}
