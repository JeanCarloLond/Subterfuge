/**
 * Lo que el Cirujano-Sacerdote piensa en los momentos que mueven la historia.
 *
 * El teaser tenia lore —el Codice, las placas del Registro, el jefe— pero no
 * tenia HISTORIA: se podia terminar sin saber que existe la nina, que es el eje
 * de la situacion del world bible. Esto es el hilo, y lo lleva el unico que
 * puede llevarlo: el protagonista, hablando solo mientras baja.
 *
 * La voz, que es lo dificil de acertar:
 *
 *   - Habla de su oficio con la naturalidad de un oficio. Pesa, registra,
 *     cumple turnos. NO se horroriza, porque dentro del mundo nadie percibe el
 *     sacramento como violencia. El horror lo pone el jugador al leerlo.
 *   - No es un rebelde. Cree en la Diocesis porque necesita creer: es lo unico
 *     que hace soportable lo que hace con sus manos cada dia.
 *   - No tiene nombre. Es "Manos del Sacramento N.o 7", y lo dice una sola vez,
 *     al principio, porque nadie mas se lo va a decir al jugador.
 *   - Frases cortas. Es un hombre cansado, no un narrador.
 *
 * La nina se INSINUA y nunca se explica: una linea sin numero en el Registro,
 * una camilla hecha y vacia, un tejido que no se aparta. El teaser acaba justo
 * antes de que el decida, que es donde el bible deja la situacion.
 *
 * Invariantes del bible: los Primigenios son ciegos y nunca se ven; fueron mil;
 * lexico de la Diocesis (Altar, sacramento, diezmo, Registro, Reformado) y
 * nunca terminos de videojuego. El texto que SE LEE EN PANTALLA va en español
 * correcto, con sus tildes y sus enes; lo que no lleva tildes son los
 * identificadores y los comentarios (issue #58).
 *
 * Todo esto es SALTABLE (ver DialogoScene): la ruta Atrio -> Final se juega
 * entera sin leer una sola linea.
 */

import type { ClaveRetrato } from './Retratos';

/** Cada momento del descenso que se detiene a hablar. */
export type ClavePensamiento =
  | 'atrio'
  | 'pasillos'
  | 'criptas'
  | 'salas'
  | 'manos-anteriores'
  | 'desague'
  | 'galeria'
  | 'ductos';

export interface Pensamiento {
  /**
   * Rotulo de quien habla. Solo lo lleva el primero: despues ya sabemos quien
   * es, y repetirlo en cada cuadro lo convertiria en un letrero.
   */
  quien?: string;
  /** Cara que se ve en el dialogo (#145). Sin ella, es el Cirujano. */
  retrato?: ClaveRetrato;
  /**
   * Quien dice cada cuadro, cuando hablan dos (#176): uno por cuadro. Sin
   * esto, todos los dice `retrato`.
   */
  voces?: readonly ClaveRetrato[];
  /** Un cuadro por pantalla. Se avanza con E, clic o espacio. */
  cuadros: readonly string[];
}

export const PENSAMIENTOS: Readonly<Record<ClavePensamiento, Pensamiento>> = {
  // Quien es y por que baja hoy. Todavia no duda: para el este es un buen dia.
  atrio: {
    quien: 'MANOS DEL SACRAMENTO N.o 7',
    cuadros: [
      'Manos del Sacramento número siete. No tengo otro nombre.',
      'Hoy hay una ofrenda de casa. Deuda vieja, se salda en carne.',
      'No salió sorteada. Vino ella sola y firmó de su puño.',
      'Cuadra sin que nadie llore. Esos son los buenos días.',
    ],
  },

  // La burocracia le ensena la primera grieta, y el la anota como una rareza.
  pasillos: {
    cuadros: [
      'El Registro de hoy trae una línea sin número.',
      'Una inscripción voluntaria. No había visto ninguna.',
      'Los turnos se cumplen igual. Bajo.',
    ],
  },

  // La camilla vacia: la nina ya va por delante de el. Sin una palabra de mas.
  criptas: {
    cuadros: [
      'Aquí se espera dormido. La carne serena no se resiste.',
      'Su camilla está hecha y vacía. Ya la han subido.',
      'Voy con retraso.',
    ],
  },

  // Su propia sala, ocupada. El Registro ya le habia dicho por quien.
  salas: {
    cuadros: [
      'Sala 7. La mía.',
      'Manos anteriores: reformadas en acto de servicio.',
      'No las trasladaron. Se dejan donde fueron hechas.',
    ],
  },

  // Tras el jefe. Lo que queda cuando ya no hay nadie delante de ti.
  'manos-anteriores': {
    cuadros: [
      'Enseñaron a las mías a sostener el bisturí.',
      'Ahora sostengo yo, y no queda nadie delante.',
    ],
  },

  // El cierre ya no es un dialogo: es la cinematica del sacramento (#147), y
  // sus pensamientos viven en Cinematicas.ts.

  // -- El Nivel 2: ya no habla solo (#176) ----------------------------------

  // La caida por el desague. Arriba ya saben que la camilla esta vacia.
  desague: {
    voces: ['cirujano', 'nina', 'cirujano', 'nina'],
    cuadros: [
      'El desagüe de la Sala. Por aquí baja lo que no se ofrece.',
      'Entonces yo también bajo por aquí.',
      'No te sueltes. Arriba ya han visto la camilla vacía.',
      'Huele a casa. A la parte de atrás de casa.',
    ],
  },

  // La Galeria: lo que se come abajo es lo que nadie quiere arriba.
  galeria: {
    voces: ['nina', 'cirujano', 'nina', 'cirujano'],
    cuadros: [
      'Aquí hay luz y nadie la ha encendido.',
      'Hongos de Lámpara. Crecen donde se tira lo que los Mil rechazan.',
      'En casa comíamos de esto. De lo que nadie quería.',
      'Si aquí abajo cuentan el instrumental, habrá un bisturí.',
    ],
  },

  // El ducto de subida, a la puerta que nadie vigila.
  ductos: {
    voces: ['cirujano', 'nina', 'cirujano', 'nina', 'cirujano'],
    cuadros: [
      'Desde aquí se sube. Agárrate fuerte.',
      '¿Adónde lleva?',
      'A una puerta que nadie vigila. Solo entran Vestales.',
      'Yo no soy Vestal.',
      'Yo tampoco.',
    ],
  },
};

export function pensamiento(clave: ClavePensamiento): Pensamiento {
  return PENSAMIENTOS[clave];
}
