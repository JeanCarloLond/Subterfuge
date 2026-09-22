import type { Pensamiento } from './Pensamientos';

/**
 * Los fieles con los que se puede hablar. Gente que NO ataca.
 *
 * El Vientre estaba habitado solo por enemigos, asi que el mundo se leia como
 * un pasillo de obstaculos y no como un sitio donde vive gente (issue #60).
 * Faltaba lo que sostiene la tesis del bible: que NADIE aqui dentro percibe el
 * sacramento como violencia. Eso no se demuestra con enemigos — un enemigo
 * ataca porque es un enemigo. Se demuestra con una señora haciendo cola.
 *
 * Por eso ninguno de estos cuatro se defiende, ninguno huye y ninguno avisa de
 * nada. Estan trabajando, esperando turno o cumpliendo. El horror lo pone el
 * jugador al oirlos hablar con esa naturalidad.
 *
 * FUNCIONES. Cada uno hace algo ademas de hablar, que es lo que pedia la
 * issue: el del Atrio orienta, la Vestal informa del Registro, el Reformado
 * entrega metal y el sedante guarda la ultima pieza de la historia. No hay
 * tienda ni misiones: en una ciudad donde la moneda es la carne, un mercader
 * seria de otro juego.
 */

/** Quien puede estar en pie en una zona, y de que habla. */
export type ClaveVoz = 'inscriptor' | 'registradora' | 'reformado-viejo' | 'sedante';

export interface Voz extends Pensamiento {
  /** Lo que se lee flotando sobre el, antes de pulsar. */
  rotulo: string;
  /** Textura del sprite. Reutiliza el arte que ya existe. */
  textura: string;
}

export const VOCES: Readonly<Record<ClaveVoz, Voz>> = {
  // Atrio. Orienta sin saber que orienta: le explica al jugador la regla del
  // mundo creyendo que le esta explicando un tramite.
  inscriptor: {
    rotulo: 'E  hablar',
    textura: 'devoto-placeholder',
    quien: 'FIEL EN LA COLA',
    cuadros: [
      'Buenos días, Manos. Vengo a inscribir a los míos.',
      'Una vez al año, como manda. Somos cuatro en casa.',
      '¿Que si me toca a mí? Ojalá. El que sube no vuelve,',
      'pero sube. Yo llevo once años saliendo en el sorteo',
      'y aquí sigo, entero. Eso tampoco es estar orgulloso.',
    ],
  },

  // Pasillos. Administra. Su funcion en el mundo es contar, y su funcion para
  // el jugador es la misma: le dice cuanto Codice lleva.
  registradora: {
    rotulo: 'E  consultar el Registro',
    textura: 'vestal-placeholder',
    quien: 'VESTAL DE REGISTRO',
    cuadros: [
      'Manos siete. Su sala está anotada para hoy.',
      'Si busca folios sueltos del Códice, hay copias caídas',
      'por todas las capas: el papel viejo se desprende solo.',
      'Recójalos. El Registro no los reclama.',
    ],
  },

  // Criptas. Entrega algo. Es el unico que dice en voz alta lo que le paso, y
  // lo dice sin queja, que es lo que lo vuelve insoportable.
  'reformado-viejo': {
    rotulo: 'E  hablar',
    textura: 'reformado-placeholder',
    quien: 'REFORMADO',
    cuadros: [
      'No se acerque tanto. Ya sé cómo me ve.',
      'Llegué a la mitad. Eso no es fracasar: es llegar a la',
      'mitad, que es más de lo que llega casi nadie.',
      'Tenga. Me sobra metal y a usted le hará falta abajo.',
    ],
  },

  // Salas. La ultima pieza de la historia, dicha por quien la administro sin
  // mirarla. Aqui el jugador se entera de que la niña ya esta arriba.
  sedante: {
    rotulo: 'E  hablar',
    textura: 'devoto-b-placeholder',
    quien: 'AUXILIAR DE CRIPTAS',
    cuadros: [
      'La dosis de la Sala 7 se administró anoche. Doble.',
      'La de la línea sin número, sí. Pesa poco y entró sola.',
      'No preguntamos por qué vienen. Preguntar es de arriba.',
      'Suba ya, Manos. Lleva retraso.',
    ],
  },
};
