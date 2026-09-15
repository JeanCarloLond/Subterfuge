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
      musica: 'pasillos',
      inicio: { x: 60, y: 130 },

      llegada: 'pasillos',

      // Un escalon mas abajo: la misma silleria, de vuelta de todo. Aqui ya se
      // agrieta mas de lo que crece.
      tinte: 0xc8bcc0,
      desgaste: { grietas: 0.07, musgo: 0.025 },

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

        // Archivo cerrado (secreto): un escalon mas alla de la repisa, pegado
        // al muro derecho. Guarda un Relicario.
        [980, 440, 6], //          x 980..1076 — hueco de 60 px desde la repisa

        // Altillo (secreto): sobre el primer corredor, entre el techo y el
        // suelo. Solo se ve si se mira hacia arriba al pasar. Frasco.
        [400, 108, 6], //          x 400..496  — desde 160, 52 px: salto simple

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

      // El clero administra esta zona, así que aquí es donde aparece. Se
      // colocan al fondo de los corredores: obligan a avanzar bajo fuego o a
      // pararles el sello y devolvérselo.
      vestales: [
        { x: 960, y: 160, izquierda: 900, derecha: 1090 },
        { x: 950, y: 344, izquierda: 700, derecha: 1090 },
        { x: 980, y: 520, izquierda: 880, derecha: 1090 },
      ],

      altares: [
        { x: 60, y: 160 },
        { x: 120, y: 520 },
      ],

      fragmentos: [
        [470, 412, 'codice-04'],
        [880, 428, 'codice-05'],
      ],

      reliquias: [
        [1030, 440, 'pasillos-relicario', 'relicario'],
        [448, 108, 'pasillos-frasco', 'frasco'],
      ],

      // Burocracia: columnas como estanterias, cera de archivo, exvotos que
      // cuelgan del techo bajo, y la primera sangre en el suelo del fondo.
      decorado: [
        [100, 160, 'columna'],
        [420, 160, 'columna'],
        [700, 160, 'columna'],
        [1000, 160, 'columna'],
        [40, 160, 'vela'],
        [80, 160, 'vela'],
        [200, 264, 'exvoto'],
        [320, 264, 'exvoto'],
        [520, 264, 'exvoto'],
        [640, 264, 'exvoto'],
        [150, 344, 'vela'],
        [300, 344, 'vela'],
        [720, 344, 'vela'],
        [1000, 344, 'vela'],
        [220, 344, 'columna'],
        [900, 344, 'columna'],
        [100, 520, 'vela'],
        [140, 520, 'vela'],
        [300, 520, 'charco'],
        [640, 520, 'charco'],
        [500, 520, 'columna'],
        [960, 520, 'columna'],
        [1010, 440, 'vela'],
        [1060, 440, 'vela'],
        [424, 108, 'vela'],
        [472, 108, 'vela'],
      ],

      // Fondo lejano: archivo. Columnas como estanterias y cadenas de los
      // ganchos del techo. Las ventanas ya quedan lejos.
      polvo: 0xb8a888,
      fondo: [
        [60, 180, 'columna'],
        [260, 180, 'columna'],
        [500, 180, 'columna'],
        [760, 180, 'columna'],
        [1000, 180, 'columna'],
        [160, 80, 'cadena'],
        [420, 80, 'cadena'],
        [680, 80, 'cadena'],
        [940, 80, 'cadena'],
        [120, 360, 'columna'],
        [380, 360, 'columna'],
        [640, 360, 'columna'],
        [900, 360, 'columna'],
        [300, 264, 'cadena'],
        [560, 264, 'cadena'],
        [820, 264, 'cadena'],
        [200, 540, 'columna'],
        [700, 540, 'columna'],
      ],

      inscripciones: [
        [150, 160, 'OFICINA DEL DIEZMO. Deudas de casa se saldan en carne de casa.'],
        [560, 344, 'Sorteo de hoy: cerrado. Una inscripcion voluntaria. Sin numero.'],
        [820, 520, 'Los Reformados no reciben visitas. Honrenlos desde aqui.'],
      ],

      umbral: {
        x: 1060,
        y: 520,
        destino: 'Criptas',
        etiqueta: 'las Criptas de Espera',
      },

      // Por debajo del corredor del fondo: devuelve al Altar en vez de encallar.
      limiteCaida: 580,
    };
  }
}
