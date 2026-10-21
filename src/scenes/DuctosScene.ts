import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * Los Ductos: el tramo de subida hasta la Puerta del Cuerpo.
 *
 * Tercera zona del Nivel 2 (#156). Rosa vena: aquí la arquitectura ya es
 * carne. La huida no lleva a la superficie, sino hacia dentro: el ducto sube
 * hasta la puerta de servicio del templo, la única que la Diócesis no vigila.
 *
 * Es la primera zona que se recorre HACIA ARRIBA. Se entra por el fondo y se
 * sube en zigzag de repisa en repisa, cada una a 64 u 80 px de la anterior,
 * hasta el rellano de la Puerta. La hoja X está en el nicho de la izquierda, a
 * media subida; el Relicario, en la repisa pegada al muro derecho.
 *
 * Esta es la estructura. El nido de la Serpiente (#167), la Marea por tramos
 * (#163), la sala del Latido, las paredes de membrana (#161), el guardia de la
 * Cruzada (#166) y la persecución final (#162) se construyen encima en #170.
 */
export class DuctosScene extends EscenaNivel {
  constructor() {
    super({ key: 'Ductos' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 640, alto: 960 },
      colorFondo: '#0d090b',
      musica: 'vientre-humedo',
      inicio: { x: 40, y: 900 },

      // Rosa vena: la piedra ya no se distingue del tejido que la cubre.
      tinte: 0xc89098,
      muro: ['muro-humedo-a-placeholder', 'muro-humedo-b-placeholder'],
      desgaste: { grietas: 0.06, musgo: 0.1 },
      polvo: 0xb07a88,

      plataformas: [
        [0, 32, 40], //            bóveda, x 0..640

        // El rellano de la Puerta. Deja libre el lado derecho para subir.
        [16, 160, 24], //          x 16..400

        // El ducto, de abajo arriba, en zigzag.
        [448, 224, 6], //          x 448..544
        [256, 288, 6], //          x 256..352
        [96, 368, 8], //           x 96..224
        [320, 432, 8], //          x 320..448 — Altar
        [528, 496, 6], //          x 528..624 — Relicario
        [384, 576, 8], //          x 384..512
        [176, 640, 6], //          x 176..272
        [16, 720, 6], //           x 16..112 — nicho de la hoja X
        [192, 784, 8], //          x 192..320
        [416, 848, 6], //          x 416..512

        [0, 928, 40], //           el fondo del ducto, x 0..640
      ],

      paredes: [
        [0, 48, 928],
        [624, 48, 928],
      ],

      devotos: [{ x: 300, y: 928, izquierda: 200, derecha: 520 }],

      vestales: [
        { x: 440, y: 576, izquierda: 392, derecha: 504 },
        { x: 160, y: 368, izquierda: 104, derecha: 216 },
      ],

      altares: [
        { x: 80, y: 928 },
        { x: 384, y: 432 },
      ],

      fragmentos: [[56, 696, 'codice-10']],

      reliquias: [[600, 496, 'ductos-relicario', 'relicario']],

      decorado: [
        [500, 928, 'nido'],
        [250, 928, 'charco-vivo'],
        [140, 928, 'charco'],
        [216, 640, 'pila-carne'],
        [290, 784, 'cadaver'],
        [300, 160, 'conducto'],
        [300, 48, 'goteo'],
        [520, 48, 'goteo'],
        [480, 240, 'raiz'],
        [140, 384, 'raiz'],
        [8, 560, 'membrana'],
        [616, 380, 'membrana'],
        [616, 760, 'membrana'],
      ],

      fondo: [
        [120, 300, 'conducto'],
        [320, 120, 'cadena'],
        [500, 300, 'conducto'],
      ],

      // Lo que crece en los ductos: la Vena al ritmo del Latido, pegada al
      // muro, y una Zarza en el rincón del fondo, fuera del camino.
      criaturas: [
        { tipo: 'vena', x: 600, y: 928, altoTiles: 5 },
        { tipo: 'zarza', x: 560, y: 928, altoTiles: 2 },
      ],

      inscripciones: [[140, 928, 'DUCTOS DE SUBIDA. A la Puerta del Cuerpo. Solo Vestales.']],

      umbral: {
        x: 60,
        y: 160,
        destino: 'FinalNivel2',
        etiqueta: 'la Puerta del Cuerpo',
      },

      limiteCaida: 950,
    };
  }
}
