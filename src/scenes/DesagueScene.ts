import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * El Desagüe: por donde se va lo que la Sala 7 no ofrece.
 *
 * Primera zona del Nivel 2 (#156) y principio de la huida. El Cirujano baja con
 * la niña por el desagüe de servicio de la Sala y cae a los Niveles
 * Reformados: ocre y óxido, Lluvia Tibia («llueve por dentro») y la Mata junto
 * a los charcos, donde se descarta el tejido.
 *
 * El trazado es una bajada en escalones hacia la derecha, sobre un canal de
 * fondo que recoge todo lo que cae. Caer al canal no mata: desde ahí se vuelve
 * a subir escalón a escalón, y en su rincón izquierdo, donde solo se llega
 * cayendo, espera un Relicario.
 *
 * Esta es la estructura. Lo que hace de la zona una huida —el arranque sin
 * bisturí (#160), los Devotos vendados (#165), la primera persecución (#162) y
 * la primera gatera (#159)— se construye encima en #168.
 */
export class DesagueScene extends EscenaNivel {
  constructor() {
    super({ key: 'Desague' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 1280, alto: 480 },
      colorFondo: '#0d0b09',
      musica: 'vientre-humedo',
      inicio: { x: 60, y: 150 },

      // Ocre y óxido: el agua que baja por aqui lleva hierro y carne disuelta.
      tinte: 0xc0a078,
      muro: ['muro-humedo-a-placeholder', 'muro-humedo-b-placeholder'],
      desgaste: { grietas: 0.1, musgo: 0.06 },
      lluvia: true,
      polvo: 0xa08060,

      // Cada escalón baja 64 px y solapa 32 con el siguiente: se vuelve a
      // subir con el salto simple. El canal del fondo esta a 80 px del escalón
      // mas bajo, tambien al alcance.
      plataformas: [
        // Bóveda: el desagüe es un tubo, no una sala.
        [0, 32, 80], //            x 0..1280

        // La boca del desagüe, por donde se cae desde la Sala 7.
        [0, 160, 12], //           x 0..192
        [224, 224, 8], //          x 224..352
        [384, 288, 10], //         x 384..544
        [576, 352, 12], //         x 576..768
        [800, 304, 6], //          x 800..896
        [928, 352, 22], //         x 928..1280 — salida

        // El canal del fondo.
        [0, 432, 80], //           x 0..1280
      ],

      paredes: [
        [0, 48, 432],
        [1264, 48, 432],
      ],

      devotos: [
        { x: 460, y: 288, izquierda: 400, derecha: 530 },
        { x: 300, y: 432, izquierda: 60, derecha: 540 },
        { x: 1040, y: 352, izquierda: 950, derecha: 1180 },
      ],

      altares: [
        { x: 120, y: 160 },
        { x: 680, y: 352 },
      ],

      fragmentos: [],

      // En el rincón del canal donde solo se llega cayendo.
      reliquias: [[40, 432, 'desague-relicario', 'relicario']],

      decorado: [
        [176, 160, 'conducto'],
        [600, 352, 'pila-carne'],
        [740, 352, 'cadaver'],
        [1200, 352, 'conducto'],
        [200, 432, 'charco'],
        [700, 432, 'charco'],
        [960, 432, 'charco-vivo'],
        [1100, 432, 'charco'],
        [260, 48, 'goteo'],
        [620, 48, 'goteo'],
        [1010, 48, 'goteo'],
        [480, 48, 'raiz'],
        [860, 48, 'raiz'],
        [1264, 300, 'membrana'],
      ],

      fondo: [
        [200, 300, 'conducto'],
        [520, 120, 'cadena'],
        [900, 300, 'conducto'],
        [1150, 300, 'tanque'],
      ],

      // La Mata crece donde se tira el tejido: junto a los charcos.
      criaturas: [
        { tipo: 'mata', x: 850, y: 304 },
        { tipo: 'mata', x: 140, y: 432 },
      ],

      inscripciones: [[60, 160, 'DESAGÜE DE SERVICIO. SALA 7. Lo que no se ofrece, baja.']],

      umbral: {
        x: 1220,
        y: 352,
        destino: 'Galeria',
        etiqueta: 'la Galería de limpieza',
      },

      limiteCaida: 470,
    };
  }
}
