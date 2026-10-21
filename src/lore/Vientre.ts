/**
 * El Vientre por dentro: las seis capas, de la superficie al fondo.
 *
 * Esta es la seccion de TOPOS del libro, y es la que el jugador no puede
 * deducir jugando: recorre zonas sueltas y no llega a ver que son seis capas
 * de un mismo edificio, ni donde encaja lo que ha pisado. Un corte vertical se
 * lo dice de un vistazo, que es justo lo que haria una lamina de ArtBook.
 *
 * Cada capa del Nivel 1 es una zona. La quinta son las tres del Nivel 2 (#156):
 * la huida cruza los Niveles Reformados entera. La sexta no se juega y sale en
 * sombra a proposito: se sabe que existe y no se sabe que hay.
 *
 * Las descripciones son del bible, en la voz de la Diocesis, en español
 * correcto: lo que no lleva tildes son los identificadores y los comentarios.
 */

export interface CapaVientre {
  /**
   * Escenas que forman la capa. Pisar una cualquiera la descubre. Vacia si la
   * capa no se juega.
   */
  escenas: readonly string[];
  nombre: string;
  descripcion: readonly string[];
}

export const VIENTRE: readonly CapaVientre[] = [
  {
    escenas: ['Atrio'],
    nombre: 'El Atrio',
    descripcion: [
      'La superficie. La ciudad visible, donde vive casi todo',
      'el mundo y donde cada casa inscribe a los suyos.',
      'Es la única capa que todavía parece arquitectura.',
    ],
  },
  {
    escenas: ['Pasillos'],
    nombre: 'Pasillos de Preparación',
    descripcion: [
      'La administración. Aquí se registran los diezmos de carne',
      'y se celebran los sorteos.',
      'Techos bajos: la burocracia no deja sitio para maniobrar.',
    ],
  },
  {
    escenas: ['Criptas'],
    nombre: 'Criptas de Espera',
    descripcion: [
      'Donde se guarda, sedados, a quienes esperan turno.',
      'Nadie grita aquí. Es lo piadoso, dice el Códice:',
      'la carne serena es carne grata.',
    ],
  },
  {
    escenas: ['Salas'],
    nombre: 'Salas de Sacramento',
    descripcion: [
      'Quirófanos convertidos en altares. Aquí ocurre.',
      'La Sala 7 es la tuya, y las Manos anteriores siguen',
      'dentro porque a los Reformados no se les traslada.',
    ],
  },
  {
    escenas: ['Desague', 'Galeria', 'Ductos'],
    // El acta, §6: el bioma y la capa van juntos en la interfaz.
    nombre: 'El Vientre Húmedo · Niveles Reformados',
    descripcion: [
      'Donde se guarda a los Elegidos que no se completaron.',
      'La doctrina dice que se les honra.',
      'La arquitectura de esta capa ya es carne.',
    ],
  },
  {
    escenas: [],
    nombre: 'El Vientre Profundo',
    descripcion: [
      'El santuario. Los Mil, sin forma humana reconocible.',
      'Ninguno tiene ojos, y el pueblo no los ha visto jamás:',
      'existen para el fiel solo a través de la doctrina.',
    ],
  },
];

/**
 * Cuantas capas se han pisado, dadas las zonas por las que se ha pasado.
 *
 * Lo que se apunta al jugar son zonas, no capas: el mapa las necesita una a
 * una. Contarlas sin mas daria siete capas de seis en cuanto se baja al Nivel
 * 2, asi que el juego y la web cuentan por aqui.
 */
export function capasPisadas(zonas: Iterable<string>): number {
  const pisadas = new Set(zonas);
  return VIENTRE.filter((capa) => capa.escenas.some((escena) => pisadas.has(escena))).length;
}
