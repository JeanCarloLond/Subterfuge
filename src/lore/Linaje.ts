import { progreso } from '../systems/Progreso';

/**
 * De donde sale cada uno. La genealogia del Vientre.
 *
 * El libro ya decia QUE RANGO tiene cada cual (seccion Jerarquia), pero no de
 * donde viene ninguno ni que tiene que ver con los demas (issue #62). Sin eso,
 * los dioses, el clero y los enemigos parecen tres inventos sueltos en el
 * mismo edificio.
 *
 * Puesto en orden de descendencia, se ve lo que el mundo esconde: TODO sale
 * del mismo sitio. Una empresa, un lote de prueba y un accidente que nadie
 * supo deshacer. Los dioses, la Iglesia, el oficio del protagonista y la niña
 * de hoy son ramas de ese mismo tronco.
 *
 * Cada entrada dice de quien viene y a quien da lugar, porque una genealogia
 * que solo enumera no es una genealogia. Se abre segun el jugador encuentra la
 * pieza correspondiente, como el resto del libro.
 */

export interface Rama {
  nombre: string;
  /** De donde sale. Vacio solo en la raiz. */
  viene: string;
  descripcion: readonly string[];
  abierto: () => boolean;
}

export const LINAJE: readonly Rama[] = [
  {
    nombre: 'Genesis Vestal',
    viene: '',
    descripcion: [
      'La raíz de todo. Una empresa que vendía el fin de la',
      'muerte y tenía un complejo para fabricarlo.',
      'De ella salen los dioses, el edificio y la doctrina.',
    ],
    abierto: () => progreso.estaRecogido('codice-03'),
  },
  {
    nombre: 'Los Mil',
    viene: 'de Genesis Vestal',
    descripcion: [
      'Lote único, mil sujetos, un contrato firmado.',
      'Eran personas y son el origen de todo lo que hoy se',
      'adora. No se les eligió por santos: se apuntaron.',
    ],
    abierto: () => progreso.estaRecogido('codice-03'),
  },
  {
    nombre: 'Los Primigenios',
    viene: 'de los Mil',
    descripcion: [
      'Lo que quedó de ellos. Cada uno colapsó hacia un solo',
      'órgano y perdió el resto, los ojos incluidos.',
      'Son los dioses, y no han visto nunca a nadie.',
    ],
    abierto: () => progreso.estaRecogido('codice-01'),
  },
  {
    nombre: 'Las advocaciones',
    viene: 'de los Primigenios',
    descripcion: [
      'La Diócesis lee cada dios por el órgano que le quedó, y',
      'de ahí saca sus órdenes: a quién se reza, quién cobra,',
      'quién sella. La teología es una lista de vísceras.',
    ],
    abierto: () => progreso.estaDescubierto('vestal'),
  },
  {
    nombre: 'La Diócesis',
    viene: 'de los que sobrevivieron',
    descripcion: [
      'No la fundaron creyentes: la fundaron los científicos que',
      'no pudieron arreglarlo. Es un informe de fracaso al que',
      'se le cambió el tiempo verbal.',
    ],
    abierto: () => progreso.estaRecogido('codice-08'),
  },
  {
    nombre: 'Las Vestales',
    viene: 'de la Diócesis',
    descripcion: [
      'El clero que administra el diezmo. Han entregado bastante',
      'cuerpo como para cobrárselo a otros.',
      'Sellan lo que se cobra; no lo cargan.',
    ],
    abierto: () => progreso.estaDescubierto('vestal'),
  },
  {
    nombre: 'Las Manos',
    viene: 'de padre a hijo',
    descripcion: [
      'El oficio no se elige ni se deserta: se hereda de un',
      'progenitor, porque la mano entrenada vale demasiado.',
      'El Cirujano es el séptimo de su sala, no de su casa.',
    ],
    abierto: () => progreso.estaDescubierto('cirujano'),
  },
  {
    nombre: 'Los Devotos',
    viene: 'de las casas inscritas',
    descripcion: [
      'El pueblo. De aquí sale la carne, de aquí salen los',
      'Elegidos y de aquí sale todo el que baja.',
      'Cada casa inscribe a los suyos una vez al año.',
    ],
    abierto: () => progreso.estaDescubierto('devoto'),
  },
  {
    nombre: 'Los Reformados',
    viene: 'de los Elegidos que no llegaron',
    descripcion: [
      'Hijos a medias del sacramento. La doctrina los honra y la',
      'arquitectura los guarda abajo, donde no haya que verlos.',
      'Las Manos anteriores de la Sala 7 están entre ellos.',
    ],
    abierto: () => progreso.estaDescubierto('reformado'),
  },
  {
    nombre: 'La ofrenda de hoy',
    viene: 'de una casa con deuda',
    descripcion: [
      'La última rama, y la que no encaja: nadie la sorteó.',
      'Vino sola y firmó de su puño para saldar lo que debía',
      'su casa. Su tejido no se aparta del filo.',
    ],
    abierto: () => progreso.estaPisada('Criptas'),
  },
];
