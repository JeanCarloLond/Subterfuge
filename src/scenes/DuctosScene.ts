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
      telon: 'fondo-costillas',
      colorFondo: '#0d090b',
      musica: 'vientre-humedo',
      inicio: { x: 100, y: 900 },
      nina: true,
      llegada: 'ductos',
      // La trepa entera, del primer escalon a la Puerta: ella va a su espalda.
      aCuestas: [[0, 0, 640, 880]],

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
        [576, 224, 2], //          x 576..608 — junto a lo alto de la membrana
        [256, 288, 6], //          x 256..352
        [96, 368, 8], //           x 96..224
        [320, 432, 8], //          x 320..448 — Altar
        [528, 496, 6], //          x 528..624 — Relicario
        [384, 576, 8], //          x 384..512
        [176, 640, 6], //          x 176..272
        [16, 720, 6], //           x 16..112 — nicho de la hoja X
        [192, 784, 8], //          x 192..320
        [416, 848, 6], //          x 416..512

        // El nicho alto donde se esconde ella mientras pelea la Serpiente.
        [16, 864, 3], //           x 16..64

        [0, 928, 40], //           el nido: el fondo del ducto, x 0..640
      ],

      paredes: [
        [0, 48, 928],
        [624, 48, 240],
        [624, 480, 928],
      ],

      // La membrana del muro derecho (#161): con el bisturi, desde la repisa
      // del Relicario se trepa clavandolo hasta arriba.
      membranas: [[624, 240, 480]],

      // El nido es solo de la Serpiente (#167): nada mas pelea en el fondo, o se
      // comeria las escamas devueltas.
      devotos: [],

      vestales: [
        { x: 440, y: 576, izquierda: 392, derecha: 504 },
        { x: 160, y: 368, izquierda: 104, derecha: 216 },
      ],

      altares: [
        { x: 80, y: 928 },
        { x: 384, y: 432 },
      ],

      fragmentos: [[56, 696, 'codice-10']],

      reliquias: [[592, 496, 'ductos-relicario', 'relicario']],

      // El nido de la Serpiente (#167): el fondo del ducto. Mientras viva, un
      // tapon de tejido cierra la subida; ella se esconde en el nicho.
      nicho: { x: 40, y: 864 },
      cierreDelNido: [16, 800, 38],

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

      // La Serpiente en su nido, y lo que crece en la subida: la Vena al
      // ritmo del Latido guardando el Relicario, y una Zarza en una repisa.
      criaturas: [
        { tipo: 'serpiente', x: 440, y: 928, arena: { izquierda: 150, derecha: 600 } },
        { tipo: 'vena', x: 548, y: 496, altoTiles: 3 },
        { tipo: 'zarza', x: 110, y: 368, altoTiles: 2 },
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
