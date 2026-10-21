import type { Pensamiento } from './Pensamientos';
import type { ClaveRetrato } from './Retratos';

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
export type ClaveVoz =
  'inscriptor' | 'registradora' | 'reformado-viejo' | 'sedante' | 'tanteador' | 'honguera';

export interface Voz extends Pensamiento {
  /** Lo que se lee flotando sobre el, antes de pulsar. */
  rotulo: string;
  /** Textura del sprite. Reutiliza el arte que ya existe. */
  textura: string;
  /** Su cara en el dialogo (#145). */
  retrato: ClaveRetrato;
}

export const VOCES: Readonly<Record<ClaveVoz, Voz>> = {
  // Atrio. Orienta sin saber que orienta: le explica al jugador la regla del
  // mundo creyendo que le esta explicando un tramite.
  inscriptor: {
    rotulo: 'E  hablar',
    textura: 'fiel-placeholder',
    retrato: 'fiel',
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
    textura: 'registradora-placeholder',
    retrato: 'registradora',
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
    textura: 'reformado-sentado-placeholder',
    retrato: 'reformado-sentado',
    quien: 'REFORMADO',
    cuadros: [
      'No se acerque tanto. Ya sé cómo me ve.',
      'Llegué a la mitad. Eso no es fracasar: es llegar a la',
      'mitad, que es más de lo que llega casi nadie.',
      'Las Manos de antes llevaban Injertadora. Si llega, tómela.',
    ],
  },

  // Salas. La ultima pieza de la historia, dicha por quien la administro sin
  // mirarla. Aqui el jugador se entera de que la niña ya esta arriba.
  sedante: {
    rotulo: 'E  hablar',
    textura: 'auxiliar-placeholder',
    retrato: 'auxiliar',
    quien: 'AUXILIAR DE CRIPTAS',
    cuadros: [
      'La dosis de la Sala 7 se administró anoche. Doble.',
      'La de la línea sin número, sí. Pesa poco y entró sola.',
      'No preguntamos por qué vienen. Preguntar es de arriba.',
      'Suba ya, Manos. Lleva retraso.',
    ],
  },

  // Vientre Humedo (#87). Un oficio de la biblia: "porteadores que golpean el
  // suelo con varas de hierro antes de cruzar una sala". Explica la Alfombra
  // Devota y la regla de no pisar alfombra, que es por lo que existe.
  tanteador: {
    rotulo: 'E  hablar',
    textura: 'tanteador-placeholder',
    retrato: 'tanteador',
    quien: 'TANTEADOR',
    cuadros: [
      'No pise la alfombra. Ninguna.',
      'La de verdad tiene fleco. La otra respira.',
      'Yo golpeo el suelo antes de cruzar. Usted tiene ojos:',
      'úsemelos, que a mí me quedan las manos.',
      'Si pisa, no tire del pie. Corte los hilos y salte.',
    ],
  },

  // Vientre Humedo (#87). Cultiva Hongo de Lampara y le deja comida al
  // Mondador: habla de el como de un compañero de trabajo. La issue proponia
  // que dijera que el hongo "no debe nada a los dioses"; la biblia dice que
  // crece de sus desechos, y asi lo dice ella.
  honguera: {
    rotulo: 'E  hablar',
    textura: 'honguera-placeholder',
    retrato: 'honguera',
    quien: 'HONGUERA',
    cuadros: [
      'El hongo crece de lo que sueltan los dioses. Todo aquí.',
      'Alumbra y cuenta el tiempo. Por eso lo cultivamos.',
      'El Mondador come lo que el sacramento rechaza.',
      'No lo espante. Mientras coma, la impureza no sube.',
      'Cuando muera el último, alguien tendrá que limpiar.',
    ],
  },
};
