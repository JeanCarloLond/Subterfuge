import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * La Galería de limpieza: donde se come lo que los dioses rechazan.
 *
 * Segunda zona del Nivel 2 (#156). Verde enfermo, y los Hongos de Lámpara como
 * única luz. El Mondador recorre el suelo comiendo; desde una repisa, una
 * Vestal con máscara de caparazón lo acecha, y se entiende sin decirlo por qué
 * casi no quedan.
 *
 * Es una galería larga en dos alturas: el suelo, por donde va el Mondador, y
 * una hilera de repisas que suben y bajan bajo la bóveda. Todas se alcanzan
 * desde el suelo. La hoja IX está sobre la repisa más alta del centro; el
 * Frasco, en la del fondo.
 *
 * Esta es la estructura. El conteo del instrumental, donde se recupera el
 * bisturí (#160), los Reformados que sirven y el secreto del Mondador se
 * construyen encima en #169.
 */
export class GaleriaScene extends EscenaNivel {
  constructor() {
    super({ key: 'Galeria' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 1440, alto: 400 },
      telon: 'fondo-bovedas',
      colorFondo: '#090c0a',
      musica: 'vientre-humedo',
      nina: true,
      llegada: 'galeria',
      inicio: { x: 40, y: 300 },

      // Verde enfermo: la piedra coge el color de lo que crece encima.
      tinte: 0x98a888,
      muro: ['muro-humedo-a-placeholder', 'muro-humedo-b-placeholder'],
      desgaste: { grietas: 0.08, musgo: 0.14 },
      lluvia: true,
      polvo: 0x8a9a78,

      plataformas: [
        [0, 64, 90], //            bóveda, x 0..1440
        [0, 320, 90], //           suelo, x 0..1440

        // Repisas bajo la bóveda. Ninguna pasa de 144 px sobre el suelo: con
        // el doble salto se sube a cualquiera directamente.
        [160, 256, 6], //          x 160..256
        [320, 192, 6], //          x 320..416
        [496, 240, 8], //          x 496..624 — la de la Vestal
        [704, 176, 6], //          x 704..800 — la hoja IX
        [880, 240, 8], //          x 880..1008
        [1072, 176, 5], //         x 1072..1152 — el Frasco
        [1216, 256, 6], //         x 1216..1312
      ],

      paredes: [
        [0, 80, 320],
        [1424, 80, 320],
      ],

      devotos: [{ x: 1000, y: 320, izquierda: 900, derecha: 1180 }],

      // La cazadora de Mondadores (#99), en su repisa sobre el suelo de paso.
      vestales: [{ x: 540, y: 240, izquierda: 504, derecha: 616, cazadora: true }],

      altares: [
        { x: 80, y: 320 },
        { x: 760, y: 320 },
      ],

      fragmentos: [[752, 150, 'codice-09']],

      // El conteo del instrumental (#160): al principio de la galeria, antes
      // de la Vestal, para que el resto de la zona ya se pelee.
      conteo: { x: 280, y: 320, piezas: 4 },

      reliquias: [[1112, 176, 'galeria-frasco', 'frasco']],

      decorado: [
        [300, 320, 'charco'],
        [860, 320, 'charco'],
        [460, 320, 'pila-carne'],
        [600, 320, 'bandeja'],
        [700, 320, 'cadaver'],
        [1180, 320, 'pila-carne'],
        [1300, 320, 'nido'],
        [240, 80, 'goteo'],
        [820, 80, 'goteo'],
        [1260, 80, 'goteo'],
        [560, 80, 'raiz'],
        [1000, 80, 'raiz'],
        [1424, 200, 'membrana'],
      ],

      fondo: [
        [180, 300, 'columna'],
        [420, 300, 'tanque'],
        [760, 300, 'columna'],
        [1060, 300, 'tanque'],
        [1340, 300, 'columna'],
      ],

      criaturas: [
        // Antes de los Ductos, otro cazarrecompensas (#164).
        { tipo: 'cazador', x: 1320, y: 320, ronda: { izquierda: 1200, derecha: 1380 } },
        {
          tipo: 'mondador',
          ruta: [
            [220, 320],
            [640, 320],
          ],
        },
        { tipo: 'hongo', x: 350, y: 192 },
        { tipo: 'hongo', x: 390, y: 192 },
        { tipo: 'hongo', x: 930, y: 240 },
        // La Flor de Hueso crece sobre el hueso que el Mondador ya ha limpiado.
        { tipo: 'flor', x: 1250, y: 256 },
        // Zona inundable: alfombra viva sobre el suelo de paso.
        { tipo: 'alfombra', x: 1100, y: 320, anchoTiles: 3 },
      ],

      inscripciones: [
        [
          140,
          320,
          'GALERÍA DE LIMPIEZA. Lo que los Mil rechazan es del Mondador. No se le estorba.',
        ],
        // La pista del conteo, en la voz de la Diócesis y con el dicho de la biblia.
        [
          236,
          320,
          'CONTEO DEL INSTRUMENTAL. Cada pieza, dos veces. Un bisturí tibio es un Remedo.',
        ],
      ],

      umbral: {
        x: 1390,
        y: 320,
        destino: 'Ductos',
        etiqueta: 'los Ductos',
      },

      limiteCaida: 380,
    };
  }
}
