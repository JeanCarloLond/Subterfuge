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
    return {
      mundo: { ancho: 800, alto: 400 },
      // El nivel más oscuro hasta ahora: metal quirúrgico sobre carne.
      colorFondo: '#0c0a0c',
      musica: 'salas',
      inicio: { x: 70, y: 260 },

      // El unico sitio del descenso donde la piedra vuelve a tirar a rojo, y no
      // por luz: es la sala donde se hace el sacramento. Mas oscura que las
      // Criptas pero mas calida, que es lo que la vuelve incomoda.
      tinte: 0xb08890,
      desgaste: { grietas: 0.11, musgo: 0 },

      plataformas: [
        // Techo: la sala está cerrada. No se sale por arriba.
        [0, 96, 50],

        // Suelo de la sala, continuo: el terreno del combate.
        [0, 288, 50],

        // Dos repisas para romper las embestidas y castigar desde arriba.
        // Están a 80 px del suelo, dentro del salto simple.
        [176, 208, 5], //          x 176..256
        [544, 208, 5], //          x 544..624

        // Pedestal central con la camilla. Está a 56 px del suelo: el cuerpo
        // del Reformado (28 px de alto) pasa POR DEBAJO al embestir, así que no
        // se estrella contra él ni lo usa de muro. Es refugio de la embestida y
        // blanco de los saltos y los escombros: subirse es una decisión.
        [352, 232, 6], //          x 352..448

        // Repisas altas en las esquinas. Desde ahí se ve la arena entera y se
        // puede caer sobre el jefe con el golpe hacia abajo; también son a donde
        // más lejos llega a saltar en fase 2.
        [16, 152, 4], //           x 16..80
        [720, 152, 4], //          x 720..784
      ],

      // Muros laterales: son contra lo que el Reformado se estrella al fallar
      // una embestida, que es la ventana de castigo del combate.
      paredes: [
        [0, 112, 288],
        [784, 112, 288],
      ],

      // Sin escolta: el encuentro es entre el Cirujano y lo que él mismo hace.
      devotos: [],

      jefe: { x: 620, y: 288, izquierda: 40, derecha: 760 },

      // Un Altar justo a la entrada: reintentar el jefe no debe castigar con
      // un paseo de vuelta.
      altares: [{ x: 48, y: 288 }],

      fragmentos: [[350, 180, 'codice-06']],

      // Un Frasco en la repisa derecha, la mas expuesta al jefe: cogerlo en
      // mitad del combate es una decision, no un paseo.
      reliquias: [[568, 208, 'salas-frasco', 'frasco']],

      // El quirofano-altar: la camilla en el centro y la sangre de los
      // sacramentos anteriores. Nada de exvotos aqui: nadie da las gracias.
      decorado: [
        [400, 232, 'camilla'],
        [366, 232, 'vela'],
        [434, 232, 'vela'],
        [300, 288, 'charco'],
        [520, 288, 'charco'],
        [410, 288, 'charco'],
        [60, 288, 'columna'],
        [740, 288, 'columna'],
        [200, 208, 'vela'],
        [232, 208, 'vela'],
        [48, 152, 'vela'],
        [752, 152, 'vela'],
        [40, 288, 'reja'],
        [760, 288, 'reja'],
      ],

      // Fondo lejano: el quirofano-altar visto desde dentro. Ventanas altas
      // ya sin luz, cadenas sobre la camilla, y polvo con algo de rojo.
      polvo: 0xa87a7a,
      fondo: [
        [120, 300, 'ventana'],
        [320, 300, 'ventana'],
        [480, 300, 'ventana'],
        [680, 300, 'ventana'],
        [200, 112, 'cadena'],
        [360, 112, 'cadena'],
        [440, 112, 'cadena'],
        [600, 112, 'cadena'],
        [40, 300, 'columna'],
        [760, 300, 'columna'],
      ],

      inscripciones: [[140, 288, 'SALA DEL SACRAMENTO N.o 7. Manos: una. Ofrendas de hoy: una.']],

      umbral: {
        x: 730,
        y: 288,
        destino: 'Final',
        etiqueta: 'seguir bajando',
      },

      limiteCaida: 360,
    };
  }
}
