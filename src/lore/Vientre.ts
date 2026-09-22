/**
 * El Vientre por dentro: las seis capas, de la superficie al fondo.
 *
 * Esta es la seccion de TOPOS del libro, y es la que el jugador no puede
 * deducir jugando: baja cuatro zonas y no llega a ver que son seis capas de un
 * mismo edificio, ni donde encaja lo que ha pisado. Un corte vertical se lo
 * dice de un vistazo, que es justo lo que haria una lamina de ArtBook.
 *
 * Las dos ultimas no se visitan en el teaser y salen en sombra a proposito: se
 * sabe que existen y no se sabe que hay. Es el gancho del descenso.
 *
 * Las descripciones son del bible, en la voz de la Diocesis, en español
 * correcto: lo que no lleva tildes son los identificadores y los comentarios.
 */

export interface CapaVientre {
  /** Clave de escena que la desbloquea, o null si no se visita en el teaser. */
  escena: string | null;
  nombre: string;
  descripcion: readonly string[];
}

export const VIENTRE: readonly CapaVientre[] = [
  {
    escena: 'Atrio',
    nombre: 'El Atrio',
    descripcion: [
      'La superficie. La ciudad visible, donde vive casi todo',
      'el mundo y donde cada casa inscribe a los suyos.',
      'Es la única capa que todavía parece arquitectura.',
    ],
  },
  {
    escena: 'Pasillos',
    nombre: 'Pasillos de Preparación',
    descripcion: [
      'La administración. Aquí se registran los diezmos de carne',
      'y se celebran los sorteos.',
      'Techos bajos: la burocracia no deja sitio para maniobrar.',
    ],
  },
  {
    escena: 'Criptas',
    nombre: 'Criptas de Espera',
    descripcion: [
      'Donde se guarda, sedados, a quienes esperan turno.',
      'Nadie grita aquí. Es lo piadoso, dice el Códice:',
      'la carne serena es carne grata.',
    ],
  },
  {
    escena: 'Salas',
    nombre: 'Salas de Sacramento',
    descripcion: [
      'Quirófanos convertidos en altares. Aquí ocurre.',
      'La Sala 7 es la tuya, y las Manos anteriores siguen',
      'dentro porque a los Reformados no se les traslada.',
    ],
  },
  {
    escena: null,
    nombre: 'Niveles Reformados',
    descripcion: [
      'Donde se guarda a los Elegidos que no se completaron.',
      'La doctrina dice que se les honra.',
      'La arquitectura de esta capa ya es carne.',
    ],
  },
  {
    escena: null,
    nombre: 'El Vientre Profundo',
    descripcion: [
      'El santuario. Los Mil, sin forma humana reconocible.',
      'Ninguno tiene ojos, y el pueblo no los ha visto jamás:',
      'existen para el fiel solo a través de la doctrina.',
    ],
  },
];
