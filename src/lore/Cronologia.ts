import { progreso } from '../systems/Progreso';

/**
 * La linea de tiempo del Vientre, de la promesa a hoy.
 *
 * Por que existe: el teaser cuenta su historia por insinuacion — un folio
 * aqui, una placa alla, una frase del Cirujano al bajar — y eso funciona para
 * el tono, pero deja al jugador sin saber EN QUE ORDEN paso nada. Se podia
 * terminar la partida sin tener claro si los dioses son anteriores o
 * posteriores a la Diocesis (issue #61).
 *
 * Puesta en fila, la historia dice lo unico que hace falta entender: NADIE
 * planeo esto. Fue un experimento que no se pudo deshacer, y encima del
 * fracaso se construyo una religion porque era mas facil que admitirlo.
 *
 * SE REVELA JUGANDO. Cada hito se abre cuando el jugador encuentra la pieza
 * que lo cuenta, casi siempre un folio del Codice. Un cuadro cronologico
 * completo desde el primer segundo seria un resumen de la trama regalado; asi
 * es una reconstruccion, que es justo lo que el mundo hace con su pasado.
 *
 * Las fechas no son numeros: la Diocesis no cuenta años, cuenta generaciones.
 * Poner "año 312" convertiria un mundo religioso en una wiki.
 */

export interface Hito {
  /** Cuando, en el lenguaje del mundo. Nunca una fecha. */
  cuando: string;
  titulo: string;
  descripcion: readonly string[];
  /** Que hay que haber encontrado para que se abra. */
  abierto: () => boolean;
}

export const CRONOLOGIA: readonly Hito[] = [
  {
    cuando: 'Antes',
    titulo: 'La promesa',
    descripcion: [
      'Genesis Vestal prometió el fin de la muerte y lo puso',
      'por escrito: edición somática, lote único, mil sujetos.',
      'Era una empresa, y esto era un producto.',
    ],
    abierto: () => progreso.estaRecogido('codice-03'),
  },
  {
    cuando: 'El experimento',
    titulo: 'Los Mil aceptaron',
    descripcion: [
      'Mil personas firmaron. Ninguna murió: esa parte del',
      'contrato se cumplió entera.',
      'La otra parte no la había escrito nadie.',
    ],
    abierto: () => progreso.estaRecogido('codice-03'),
  },
  {
    cuando: 'El fracaso',
    titulo: 'La carne que no para',
    descripcion: [
      'Mutaron sin control y se fundieron con el complejo.',
      'Cada uno colapsó hacia un solo órgano y perdió lo demás,',
      'los ojos incluidos. Ninguno ha vuelto a ver nada.',
    ],
    abierto: () => progreso.estaRecogido('codice-01'),
  },
  {
    cuando: 'La decisión',
    titulo: 'No se pudo deshacer',
    descripcion: [
      'Los científicos que quedaron no supieron matarlos ni',
      'curarlos. Tenían dos salidas: contarlo, o arrodillarse.',
      'Se arrodillaron, y ahí empezó todo lo demás.',
    ],
    abierto: () => progreso.estaRecogido('codice-03'),
  },
  {
    cuando: 'La fundación',
    titulo: 'Nace la Diócesis',
    descripcion: [
      'El informe del fracaso se reescribió como escritura',
      'sagrada: el Códice de la Carne, encima de los manuales.',
      'Lo que era una consecuencia pasó a ser una voluntad.',
    ],
    abierto: () => progreso.estaRecogido('codice-08'),
  },
  {
    cuando: 'Tres generaciones',
    titulo: 'El diezmo y el sorteo',
    descripcion: [
      'El hambre de los dioses no se sacia porque no ven lo que',
      'reciben: solo lo tocan. Así que hubo que organizarla.',
      'Casas inscritas, turnos, registro. Una burocracia.',
    ],
    abierto: () => progreso.estaRecogido('codice-04'),
  },
  {
    cuando: 'Desde entonces',
    titulo: 'Ningún dios nuevo',
    descripcion: [
      'En tres generaciones no ha ascendido nadie. Ni uno.',
      'Los que lo intentan se quedan a medias y bajan al fondo,',
      'donde la doctrina dice que se les honra.',
    ],
    abierto: () => progreso.estaRecogido('codice-08'),
  },
  {
    cuando: 'Hoy',
    titulo: 'Una línea sin número',
    descripcion: [
      'El Registro de esta mañana trae una inscripción que nadie',
      'sorteó: una casa con deuda y alguien que vino sola.',
      'Es la primera vez, y aún nadie ha preguntado por qué.',
    ],
    abierto: () => progreso.estaPisada('Pasillos'),
  },
];
