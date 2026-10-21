import type { Pensamiento } from './Pensamientos';

/**
 * Lo que hablan la niña y el Cirujano mientras huyen (#176).
 *
 * Hasta el Nivel 2 el vinculo era solo de gestos. Ahora tambien hablan, poco y
 * a ratos, como habla quien huye.
 *
 * LA VOZ DE ELLA. Una niña de una casa con deuda, que vino sola y firmo de su
 * puño. Habla poco y con palabras de casa: la cocina, la deuda, lo que se
 * comia. No sabe la liturgia de memoria y la dice mal a proposito. Pregunta lo
 * que nadie pregunta, y mira lo que nadie mira: es lo unico que el mundo le
 * prohibe ("ojos al suelo, palma al frente"). Nunca es una elegida ni sabe lo
 * que le pasa a su tejido.
 *
 * LA VOZ DE EL. La de siempre (Pensamientos.ts): frases cortas, de oficio, de
 * hombre cansado. No consuela; contesta. Cuando no sabe que decir, manda andar.
 *
 * Invariantes: los Mil son ciegos y nunca miran, ven ni observan; conocen por
 * tacto e ingesta. Lexico de la Diocesis, nunca de videojuego. Lo que se lee va
 * en español correcto.
 */

/** Zonas donde se habla con ella. */
export type ZonaCharla = 'Desague' | 'Galeria' | 'Ductos';

const C = 'cirujano' as const;
const N = 'nina' as const;

/**
 * Las conversaciones que se tienen con E, en orden, unas pocas por zona. Cada
 * una se oye una vez por partida.
 */
export const CHARLAS: Readonly<Record<ZonaCharla, readonly Pensamiento[]>> = {
  Desague: [
    {
      voces: [N, C, N, C],
      cuadros: [
        '¿Cómo te llamas?',
        'Manos del Sacramento, número siete.',
        'Eso es lo que haces. No cómo te llamas.',
        'Aquí abajo es lo mismo.',
      ],
    },
    {
      voces: [N, C, N, C],
      cuadros: [
        'Firmé con mi mano. ¿Eso ya no vale?',
        'Vale para el Registro.',
        '¿Y para ti?',
        'Sigue andando.',
      ],
    },
    {
      voces: [N, C, N],
      cuadros: [
        'En casa decían: ojos al suelo, palma al frente.',
        'Lo dice todo el mundo.',
        'Pues yo miro. Si no, me caigo.',
      ],
    },
  ],
  Galeria: [
    {
      voces: [N, C, N],
      cuadros: [
        'Ese bicho se come lo que tiran.',
        'El Mondador. Es sagrado: no se le estorba.',
        'No le estorbo. Solo lo miro.',
      ],
    },
    {
      voces: [N, C, N, C],
      cuadros: [
        '¿Te duele la cara?',
        'Es una máscara.',
        'Ya. Pero debajo.',
        'Hace años que no me la quito.',
      ],
    },
    {
      voces: [N, C, N, C],
      cuadros: [
        'Mi casa debía. Por eso vine.',
        'Lo sé. Estabas en el Registro, sin número.',
        '¿Y ahora quién paga?',
        'Ahora debo yo.',
      ],
    },
  ],
  Ductos: [
    {
      voces: [N, C, N, C],
      cuadros: [
        'Aquí la pared respira.',
        'Es carne. Lo de más adentro está vivo.',
        '¿Nos oye?',
        'Los Mil no oyen como tú. Tocan.',
      ],
    },
    {
      voces: [N, C, N, C],
      cuadros: [
        'En la Sala te paraste.',
        'Sí.',
        '¿Por qué?',
        'Estabas despierta. Nadie entra despierto.',
      ],
    },
  ],
};

/** Frases sueltas de ella, sobre su cabeza (#175), sin parar el juego. */
export const FRASES_NINA = {
  /** Cuando ya se ha hablado de todo en la zona y se le vuelve a hablar. */
  sinCharla: ['Vamos.', 'Sigo aquí.', 'No me suelto.'],
  /** Al rezar el en un Altar. */
  rezar: ['Yo no rezo. Te espero.', 'Ojos al suelo, palma al frente. ¿Así?'],
  /** Al recuperar el bisturi en el conteo del instrumental. */
  bisturi: ['Ese no tiembla.'],
  /** Si se quedan quietos un rato. */
  quietos: ['¿Oyes eso? Late.', 'Hace calor aquí abajo.', 'Huele a la parte de atrás de casa.'],
} as const;
