import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * Las Salas de Sacramento: quirofanos convertidos en altares.
 *
 * Tercer escalon del descenso y final del teaser. Aqui es donde ocurre el
 * horror corporal central del mundo, asi que el espacio cambia de forma otra
 * vez: ni el vertical del Atrio ni los corredores de los Pasillos, sino una
 * sala unica, ancha y sin salida. No hay a donde ir hasta que el encuentro
 * termine.
 *
 * Antes de la arena hay una antesala con el Altar de reintento y, entre las
 * dos, una reja que cae cuando el Reformado despierta. Morir dentro devuelve
 * a la antesala con el jefe entero al otro lado (issue #32).
 *
 * La arena tiene tres alturas —suelo, repisas y esquinas altas— y un pedestal
 * central que la embestida pasa por debajo. Cada altura cambia lo que el jefe
 * hace: en llano embiste (y en fase 3, ida y vuelta); si el Cirujano se sube,
 * salta hacia el y al aterrizar caen escombros del techo. No hay sitio donde
 * quedarse quieto, que es lo que una arena plana permitia.
 */
export class SalasScene extends EscenaNivel {
  constructor() {
    super({ key: 'Salas' });
  }

  protected definirNivel(): DefinicionNivel {
    // La arena esta desplazada 240 px a la derecha de la antesala. Todo lo
    // que hay dentro se mide desde x = 240, que es donde cae la reja.
    return {
      mundo: { ancho: 1040, alto: 400 },
      // El nivel más oscuro hasta ahora: metal quirúrgico sobre carne.
      colorFondo: '#0c0a0c',
      musica: 'salas',
      inicio: { x: 70, y: 260 },
      llegada: 'salas',

      // El unico sitio del descenso donde la piedra vuelve a tirar a rojo, y no
      // por luz: es la sala donde se hace el sacramento. Mas oscura que las
      // Criptas pero mas calida, que es lo que la vuelve incomoda.
      tinte: 0xb08890,
      muro: ['muro-salas-a-placeholder', 'muro-salas-b-placeholder'],
      desgaste: { grietas: 0.11, musgo: 0 },

      plataformas: [
        // Techo: la sala está cerrada. No se sale por arriba.
        [0, 96, 65],

        // Suelo continuo: antesala y arena son el mismo terreno. Lo que las
        // separa es la reja, no un desnivel.
        [0, 288, 65],

        // -- Arena (desde x 240) --

        // Dos repisas para romper las embestidas y castigar desde arriba.
        // Están a 80 px del suelo, dentro del salto simple.
        [416, 208, 5], //          x 416..496
        [784, 208, 5], //          x 784..864

        // Pedestal central con la camilla. Está a 56 px del suelo: el cuerpo
        // del Reformado (28 px de alto) pasa POR DEBAJO al embestir, así que no
        // se estrella contra él ni lo usa de muro. Es refugio de la embestida y
        // blanco de los saltos y los escombros: subirse es una decisión.
        [592, 232, 6], //          x 592..688

        // Repisas altas en las esquinas. Desde ahí se ve la arena entera y se
        // puede caer sobre el jefe con el golpe hacia abajo; también son a donde
        // más lejos llega a saltar en fase 2.
        [256, 152, 4], //          x 256..320
        [960, 152, 4], //          x 960..1024
      ],

      // Muros: el de la izquierda cierra la antesala; el de la derecha es
      // contra lo que el Reformado se estrella al fallar una embestida hacia
      // ese lado. Hacia el otro lado se estrella contra la reja.
      paredes: [
        [0, 112, 288],
        [1024, 112, 288],
      ],

      // La reja de la arena: cae al despertar el jefe y sube cuando muere, o
      // cuando el Cirujano muere y hay que volver a entrar (issue #32).
      reja: { x: 240, yInicio: 112, yFin: 288 },

      // Sin escolta: el encuentro es entre el Cirujano y lo que él mismo hace.
      devotos: [],

      // Quien es (issue #33): lo que queda de las Manos que tuvieron esta
      // Sala antes que el Cirujano, reformadas en un sacramento fallido. La
      // biblia deja al progenitor "muerto, o reformado": aqui es lo segundo.
      // No se le pone nombre porque nadie lo tiene: se le llama por su cargo.
      jefe: {
        x: 860,
        y: 288,
        izquierda: 280,
        derecha: 1000,
        presentacion: { titulo: 'MANOS DEL SACRAMENTO N.o 7', subtitulo: 'las anteriores' },
        alDespertar: 'reconozco esas manos: ensenaron a las mias',
        alCaer: 'manos-anteriores',
      },

      // El Altar esta en la antesala, ANTES de la reja: es el punto de
      // reintento. Morir dentro devuelve aqui, con el jefe entero al otro lado.
      altares: [{ x: 120, y: 288 }],

      fragmentos: [[590, 180, 'codice-06']],

      // Un Frasco en la repisa derecha, la mas expuesta al jefe: cogerlo en
      // mitad del combate es una decision, no un paseo.
      reliquias: [[808, 208, 'salas-frasco', 'frasco']],

      // Antesala: el Altar entre dos velas y las columnas que enmarcan la reja.
      // Arena: el quirofano-altar, la camilla en el centro y la sangre de los
      // sacramentos anteriores. Nada de exvotos aqui: nadie da las gracias.
      decorado: [
        // Sangre y carne por todas partes: esto lleva generaciones
        // cobrando cuerpo y no lo limpia nadie.
        [798, 96, 'charco'],
        [663, 232, 'charco'],
        [833, 288, 'charco'],
        [1009, 96, 'charco'],
        [647, 288, 'charco'],
        [928, 288, 'pila-carne'],
        [284, 152, 'pila-carne'],
        [208, 288, 'pila-carne'],
        [828, 208, 'pila-carne'],
        [456, 288, 'bandeja'],
        [983, 96, 'bandeja'],
        [631, 232, 'cadaver'],
        [837, 208, 'cadaver'],
        [448, 208, 'tanque'],
        [992, 288, 'tanque'],
        [802, 224, 'goteo'],
        [457, 224, 'goteo'],
        [288, 168, 'goteo'],
        // El quirofano: la vela y la lampara sobre la misma camilla.
        [301, 168, 'luz-hospital'],
        [845, 224, 'luz-hospital'],
        [520, 288, 'cadaver'],
        [180, 288, 'pila-carne'],
        [620, 232, 'holograma'],
        [784, 288, 'radiografia'],
        // Aqui la maquina ya no se disimula: es el altar.
        [640, 288, 'maquina'],
        [120, 288, 'pantalla'],
        [16, 288, 'conducto'],
        [784, 208, 'conducto'],
        [40, 288, 'columna'],
        [96, 288, 'vela'],
        [144, 288, 'vela'],
        [224, 288, 'columna'],

        [640, 232, 'camilla'],
        [606, 232, 'vela'],
        [674, 232, 'vela'],
        [540, 288, 'charco'],
        [760, 288, 'charco'],
        [650, 288, 'charco'],
        [300, 288, 'columna'],
        [980, 288, 'columna'],
        [440, 208, 'vela'],
        [472, 208, 'vela'],
        [288, 152, 'vela'],
        [992, 152, 'vela'],
        [1000, 288, 'reja'],
      ],

      // Fondo lejano: el quirofano-altar visto desde dentro. Ventanas altas
      // ya sin luz, cadenas sobre la camilla, y polvo con algo de rojo.
      polvo: 0xa87a7a,
      fondo: [
        [70, 300, 'ventana'],
        [190, 300, 'ventana'],
        [360, 300, 'ventana'],
        [560, 300, 'ventana'],
        [720, 300, 'ventana'],
        [920, 300, 'ventana'],
        [440, 112, 'cadena'],
        [600, 112, 'cadena'],
        [680, 112, 'cadena'],
        [840, 112, 'cadena'],
        [130, 300, 'columna'],
        [280, 300, 'columna'],
        [1000, 300, 'columna'],
      ],

      // Las placas estan en la antesala: se leen antes de entrar, no en mitad
      // de la pelea. La segunda dice, en el tono del Registro, lo que hay al
      // otro lado de la reja y por que sigue ahi.
      inscripciones: [
        [60, 288, 'SALA DEL SACRAMENTO N.o 7. Manos: una. Ofrendas de hoy: una.'],
        [
          180,
          288,
          'REGISTRO. Manos anteriores de esta Sala: reformadas en acto de servicio. ' +
            'No trasladadas. Se dejan donde fueron hechas.',
        ],
      ],

      umbral: {
        x: 970,
        y: 288,
        destino: 'Final',
        etiqueta: 'seguir bajando',
      },

      limiteCaida: 360,
    };
  }
}
