/**
 * La jerarquia de la Diocesis, de abajo arriba.
 *
 * Esta es la seccion de ETHOS, y existe para hacer explicita la regla que el
 * juego solo insinuaba en las siluetas. El bible la enuncia asi: "el estatus
 * social se mide por cuanto te pareces fisicamente a un dios-carne".
 *
 * Puestos en fila y en orden, los cinco rangos dicen de golpe lo que hace falta
 * entender de este mundo: SUBIR ES DEJAR DE SER PERSONA. El Devoto conserva
 * casi todo su cuerpo y esta abajo; el Primigenio no conserva ninguno y es un
 * dios. Nadie dentro lo vive como una perdida.
 *
 * Cada rango se descubre al encontrarselo. El ultimo no se encuentra en el
 * teaser: nadie ha visto nunca a un Primigenio, y esa es precisamente la regla.
 */

export interface Rango {
  /** Ficha del Registro que lo desbloquea, o null si no se ve en el teaser. */
  ficha: string | null;
  nombre: string;
  /** Cuanto cuerpo propio le queda. Es la medida del estatus. */
  cuerpo: string;
  descripcion: readonly string[];
}

export const JERARQUIA: readonly Rango[] = [
  {
    ficha: 'devoto',
    nombre: 'Devoto',
    cuerpo: 'casi entero',
    descripcion: ['Ha pagado un diezmo y sigue siendo reconocible.', 'Por eso está abajo.'],
  },
  {
    ficha: 'cirujano',
    nombre: 'Manos del Sacramento',
    cuerpo: 'intacto',
    descripcion: [
      'La excepción de la regla: no asciende porque no se',
      'ofrenda. Vale más entero, cortando.',
    ],
  },
  {
    ficha: 'vestal',
    nombre: 'Vestal',
    cuerpo: 'de cintura para arriba',
    descripcion: [
      'Ha entregado bastante como para administrar lo que',
      'otros entregan. Sella, no carga.',
    ],
  },
  {
    ficha: 'reformado',
    nombre: 'Reformado',
    cuerpo: 'a medias',
    descripcion: [
      'Se quedó en mitad del sacramento. La doctrina lo honra',
      'y lo guarda abajo, donde no haya que verlo.',
    ],
  },
  {
    ficha: null,
    nombre: 'Primigenio',
    cuerpo: 'ninguno',
    descripcion: [
      'De los Mil no queda cuerpo, solo el órgano que ganó.',
      'Es la cima: no le queda nada que entregar.',
    ],
  },
];
