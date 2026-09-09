import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * Los Pasillos de Preparacion: la zona administrativa donde se registran los
 * diezmos de carne y se celebran los sorteos.
 *
 * Segundo escalon del descenso, y por tanto mas oscuro y mas cerrado que el
 * Atrio. El cambio de forma es intencionado: el Atrio es abierto y vertical, un
 * lugar donde uno puede moverse; los Pasillos son corredores con techo bajo,
 * donde el combate no se puede esquivar tanto como resolverse. La burocracia no
 * deja sitio para maniobrar.
 *
 * Cuando lleguen los tilesets, esta descripcion se sustituye por la carga de
 * public/assets/maps/pasillos.tmj.
 */
export class PasillosScene extends EscenaNivel {
  constructor() {
    super({ key: 'Pasillos' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 1120, alto: 720 },
      // Mas apagado que el Atrio: luz de archivo, no luz de dia.
      colorFondo: '#0f0c0c',
      inicio: { x: 60, y: 130 },

      // Como en el Atrio: los corredores están a 176-184 px entre sí, muy por
      // encima del salto (92 px), así que el retorno va por escalones que
      // solapan en x. Bajar es directo; subir es la escalera del lado derecho.
      plataformas: [
        // Techo del primer corredor: comprime el espacio desde el primer paso.
        [0, 64, 34], //            x 0..544
        [640, 64, 30], //          x 640..1120

        // Corredor 1: tramos interrumpidos, se cruzan con salto y dash.
        [0, 160, 12], //           x 0..192
        [280, 160, 14], //         x 280..504
        [600, 160, 12], //         x 600..792
        [880, 160, 15], //         x 880..1120

        // Techo del segundo corredor. Acaba en 784 para dejar libre la escalera.
        [80, 248, 44], //          x 80..784

        // Escalera de retorno del corredor 2 al 1.
        [800, 256, 5], //          x 800..880
        [800, 168, 4], //          x 800..864

        // Corredor 2: mas largo, con un hueco central que obliga al dash.
        [100, 344, 26], //         x 100..516
        [660, 344, 28], //         x 660..1108

        // Escalón de retorno del corredor 3 al 2.
        [420, 432, 6], //          x 420..516

        // Repisa de archivo: ruta alta opcional con un fragmento.
        [840, 448, 5], //          x 840..920

        // Corredor 3 (fondo): suelo continuo hasta el umbral.
        [0, 520, 70], //           x 0..1120
      ],

      // Paredes de los corredores: sitio para el agarre de bordes.
      // La interior arranca en 420 para no partir el hueco del dash (y = 344).
      paredes: [
        [0, 180, 520],
        [1104, 180, 520],
        [560, 420, 520],
      ],

      // Mas apretados que en el Atrio: aqui hay que pelear, no rodear.
      devotos: [
        { x: 340, y: 160, izquierda: 290, derecha: 490 },
        { x: 660, y: 160, izquierda: 610, derecha: 780 },
        { x: 200, y: 344, izquierda: 120, derecha: 480 },
        { x: 760, y: 344, izquierda: 680, derecha: 1080 },
        { x: 300, y: 520, izquierda: 60, derecha: 520 },
        { x: 820, y: 520, izquierda: 620, derecha: 1040 },
      ],

      altares: [
        { x: 60, y: 160 },
        { x: 120, y: 520 },
      ],

      fragmentos: [
        [470, 412, 'codice-04'],
        [880, 428, 'codice-05'],
      ],

      umbral: {
        x: 1060,
        y: 520,
        destino: 'Final',
        etiqueta: 'las Salas de Sacramento',
      },

      // Por debajo del corredor del fondo: devuelve al Altar en vez de encallar.
      limiteCaida: 580,
    };
  }
}
