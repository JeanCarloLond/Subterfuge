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
 * La geometria es deliberadamente simple —un suelo largo y dos repisas— porque
 * el interes tiene que estar en leer al Reformado, no en el plataformeo. Meter
 * obstaculos aqui solo taparia el combate.
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
      inicio: { x: 70, y: 260 },

      plataformas: [
        // Techo: la sala está cerrada. No se sale por arriba.
        [0, 96, 50],

        // Suelo de la sala, continuo: el terreno del combate.
        [0, 288, 50],

        // Dos repisas para romper las embestidas y castigar desde arriba.
        // Están a 80 px del suelo, dentro del salto simple.
        [176, 208, 5],
        [544, 208, 5],
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
