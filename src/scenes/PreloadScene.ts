import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';

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
    this.crearRectangulo('cirujano-placeholder', 16, 24, 0xd6cfc4);
    this.crearRectangulo('piedra-placeholder', 16, 16, 0x4a4038);
    this.crearRectangulo('altar-placeholder', 16, 20, 0x8c2f2f);
    this.crearRectangulo('devoto-placeholder', 16, 24, 0x7a5c46);
    this.crearRectangulo('codice-placeholder', 8, 10, 0xe8d9a0);
    this.crearRectangulo('chispa-placeholder', 2, 2, 0xffffff);
    this.crearRectangulo('tajo-placeholder', 4, 20, 0xffffff);
    this.crearRectangulo('umbral-placeholder', 20, 34, 0x2a1f28);
  }

  private crearRectangulo(clave: string, ancho: number, alto: number, color: number): void {
    const textura = this.make.graphics({ x: 0, y: 0 }, false);
    textura.fillStyle(color, 1);
    textura.fillRect(0, 0, ancho, alto);
    textura.generateTexture(clave, ancho, alto);
    textura.destroy();
  }
}
