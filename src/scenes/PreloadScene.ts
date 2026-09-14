import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { generarArteProvisional } from '../systems/ArteProvisional';

/**
 * Preload: carga de assets y pantalla de espera.
 *
 * Aqui conviven dos cosas distintas:
 *
 *   - La silleria del Vientre (`piedra`, `grieta`, `musgo`) es ARTE DEL EQUIPO,
 *     dibujado a mano. Se carga desde public/assets/tilesets/.
 *   - Todo lo que sigue terminando en `-placeholder` es provisional y se genera
 *     por codigo mientras el equipo produce el sprite definitivo.
 *
 * El arte definitivo es pixel art hecho a mano en Aseprite (ver docs/issues/).
 * No sustituir ningun placeholder por imagenes generadas con IA.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload(): void {
    this.dibujarBarraDeCarga();

    // Silleria del Vientre: arte del equipo, ya no es un placeholder. Sale de
    // las piezas de docs/arte/piezas con scripts/generar-tileset.mjs.
    //
    // Las grietas y el musgo van en hojas aparte a proposito: si se hornearan
    // dentro del tile que se repite, reaparecerian cada 16 px y la pared se
    // leeria como papel pintado en vez de como piedra.
    this.load.spritesheet('piedra', 'assets/tilesets/vientre.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    // La grieta cabe en un tile porque esta DENTRO de la piedra y no puede
    // asomar al vacio; el musgo mide mas porque crece hacia fuera y cuelga por
    // el canto. Si cambias estas medidas, cambialas tambien en
    // scripts/generar-tileset.mjs: `verificar-arte` comprueba que cuadren.
    this.load.spritesheet('grieta', 'assets/tilesets/vientre-grietas.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('musgo', 'assets/tilesets/vientre-musgo.png', {
      frameWidth: 24,
      frameHeight: 24,
    });

    // Cuando existan los demas assets reales, se cargan aqui:
    // this.load.spritesheet('cirujano', 'assets/sprites/cirujano.png', {...});
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
