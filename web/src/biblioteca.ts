/**
 * La Cripta de Lectura: los libros que la Diócesis no cuelga en el Atrio.
 *
 * El material de la biblia que antes estaba repartido por Doctrina, el
 * Pabellón, el Vientre, el Registro y el Linaje vive aquí, en libros que se
 * abren de uno en uno. La página de la Cripta solo sabe dibujar estantes y
 * libros; el contenido sigue en `mundo.ts`.
 *
 * El estante reservado no se ve hasta encender la vela: son los otros
 * relatos, el aparato de Génesis y la cronología del clero. La vela no
 * desbloquea nada para siempre: si se apaga, el estante vuelve a la sombra.
 */

import {
  ARTES,
  ARQUITECTURA,
  CALENDARIO,
  CAPUCHA,
  CASA,
  CLASES,
  CRONOLOGIA,
  ESCUELAS,
  HERENCIAS,
  INTEMPERIE,
  LEYES,
  LEYENDAS,
  LIBROS,
  LENGUA,
  MANOS,
  OFICIOS,
  OTROS_RELATOS,
  PARENTESCO,
  TECNOLOGIA,
} from './mundo';

export type SeccionBiblioteca =
  | {
      tipo: 'parrafos';
      titulo?: string;
      texto: readonly string[];
    }
  | {
      tipo: 'lista';
      titulo?: string;
      items: readonly { nombre: string; texto: string }[];
    }
  | {
      tipo: 'tabla';
      titulo?: string;
      columnas: readonly string[];
      filas: readonly (readonly string[])[];
    };

export interface LibroBiblioteca {
  id: string;
  titulo: string;
  subtitulo: string;
  resumen: string;
  /** Estante al que pertenece. */
  estante: string;
  /** Solo se ve con la vela encendida. */
  reservado?: boolean;
  secciones: readonly SeccionBiblioteca[];
}

export interface EstanteBiblioteca {
  id: string;
  titulo: string;
  nota: string;
  reservado?: boolean;
  libros: readonly string[];
}

const lista = (
  titulo: string,
  items: readonly { nombre: string; texto: string }[],
): SeccionBiblioteca => ({ tipo: 'lista', titulo, items });

const tabla = (
  titulo: string,
  columnas: readonly string[],
  filas: readonly (readonly string[])[],
): SeccionBiblioteca => ({ tipo: 'tabla', titulo, columnas, filas });

const parrafos = (titulo: string, texto: readonly string[]): SeccionBiblioteca => ({
  tipo: 'parrafos',
  titulo,
  texto,
});

export const LIBROS_CRIPTA: readonly LibroBiblioteca[] = [
  {
    id: 'codice',
    titulo: 'Los tres Libros',
    subtitulo: 'El Don, la Venda y el Día de la Mirada',
    resumen: 'Lo que el Códice cuenta, y lo que cada Libro responde.',
    estante: 'doctrina',
    secciones: [
      lista(
        'Los Libros',
        LIBROS.map((libro) => ({
          nombre: libro.nombre,
          texto: `«${libro.cita}» ${libro.texto}`,
        })),
      ),
    ],
  },
  {
    id: 'lengua',
    titulo: 'La lengua de la Diócesis',
    subtitulo: 'Registros, reglas, expresiones y glosario',
    resumen: 'Lo que se puede decir, lo que no se dice y lo que se toca.',
    estante: 'doctrina',
    secciones: [
      lista('Los tres registros', LENGUA.registros),
      lista('Cuatro reglas que ordenan el idioma', LENGUA.reglas),
      lista(
        'Cuatro expresiones que mueven el mundo',
        LENGUA.expresiones.map((e) => ({ nombre: e.frase, texto: e.texto })),
      ),
      tabla(
        'Glosario de la Diócesis',
        ['Término', 'Registro', 'Qué significa'],
        LENGUA.glosario.map((t) => [t.termino, t.registro, t.texto]),
      ),
    ],
  },
  {
    id: 'leyes',
    titulo: 'Las leyes de la carne',
    subtitulo: 'El Códice aplicado por los Decanos y la Cruzada',
    resumen: 'No hay cárceles: la deuda es el castigo.',
    estante: 'casa',
    secciones: [
      tabla(
        'Faltas y castigos',
        ['Falta', 'Por qué es falta', 'Castigo'],
        LEYES.map((ley) => [ley.falta, ley.motivo, ley.castigo]),
      ),
    ],
  },
  {
    id: 'calendario',
    titulo: 'El calendario del pabellón',
    subtitulo: 'Los días que se recuerdan',
    resumen: 'El año se mide en Hambres y generaciones.',
    estante: 'casa',
    secciones: [
      lista(
        'Fechas litúrgicas',
        CALENDARIO.map((fecha) => ({ nombre: fecha.nombre, texto: fecha.texto })),
      ),
    ],
  },
  {
    id: 'oficios',
    titulo: 'Los oficios del Atrio',
    subtitulo: 'Lo que cada casa sabe hacer',
    resumen: 'Gremios de aprendices y maestros que se pasan de Mano a Mano.',
    estante: 'casa',
    secciones: [
      tabla(
        'Oficios',
        ['Oficio', 'Qué hace', 'Dónde'],
        OFICIOS.map((oficio) => [oficio.nombre, oficio.texto, oficio.donde]),
      ),
    ],
  },
  {
    id: 'clases',
    titulo: 'La mesa y la casa',
    subtitulo: 'Quién come qué',
    resumen: 'La riqueza se mide en carne, no en monedas.',
    estante: 'casa',
    secciones: [
      tabla(
        'Clases y alimentación',
        ['Clase', 'Dónde vive', 'Qué come', 'Cómo vive'],
        CLASES.map((clase) => [clase.clase, clase.donde, clase.come, clase.vive]),
      ),
    ],
  },
  {
    id: 'artes',
    titulo: 'El arte de los restos',
    subtitulo: 'Lo que se hace con las manos',
    resumen: 'Exvotos, dientes, vidrieras, cera y libros iluminados.',
    estante: 'casa',
    secciones: [
      lista(
        'Las artes',
        ARTES.map((arte) => ({ nombre: arte.nombre, texto: arte.texto })),
      ),
      parrafos('La casa', CASA),
      parrafos('La arquitectura y la ropa', ARQUITECTURA),
    ],
  },
  {
    id: 'leyendas',
    titulo: 'Las figuras del pabellón',
    subtitulo: 'Historias que se cuentan',
    resumen: 'Vecinos que hicieron algo que el pabellón recuerda.',
    estante: 'casa',
    secciones: [
      lista(
        'Leyendas',
        LEYENDAS.map((leyenda) => ({ nombre: leyenda.nombre, texto: leyenda.texto })),
      ),
    ],
  },
  {
    id: 'parentesco',
    titulo: 'Parentesco e identidad',
    subtitulo: 'La casa, la palma y la costura',
    resumen: 'Pertenecer, constar y coserse.',
    estante: 'casa',
    secciones: [parrafos('La casa y el Palmario', PARENTESCO)],
  },
  {
    id: 'intemperie',
    titulo: 'La Intemperie',
    subtitulo: 'La superficie que casi nadie conoce',
    resumen: 'La Baviera apagada, sus Ermitas y su fauna.',
    estante: 'mundo',
    secciones: [
      lista(
        'Lugares',
        INTEMPERIE.lugares.map((lugar) => ({ nombre: lugar.nombre, texto: lugar.texto })),
      ),
      parrafos('Cómo se viaja', INTEMPERIE.viaje),
      lista(
        'Fauna de la Intemperie',
        INTEMPERIE.fauna.map((especie) => ({ nombre: especie.nombre, texto: especie.texto })),
      ),
      lista(
        'Flora de la Intemperie',
        INTEMPERIE.flora.map((especie) => ({ nombre: especie.nombre, texto: especie.texto })),
      ),
    ],
  },
  {
    id: 'herencias',
    titulo: 'Las cuatro herencias',
    subtitulo: 'Sangre, capucha, oficio y Don',
    resumen: 'Lo que se hereda en la Diócesis.',
    estante: 'poder',
    secciones: [
      lista(
        'Herencias',
        HERENCIAS.map((herencia) => ({ nombre: herencia.nombre, texto: herencia.texto })),
      ),
    ],
  },
  {
    id: 'capucha',
    titulo: 'El linaje de la Capucha',
    subtitulo: 'De la Madre Escriba a la Vestal Mayor',
    resumen: 'El Colegio de las Vestales no se hereda por sangre.',
    estante: 'poder',
    secciones: [
      lista(
        'La Capucha',
        CAPUCHA.map((n) => ({ nombre: n.nombre, texto: n.texto })),
      ),
    ],
  },
  {
    id: 'manos',
    titulo: 'Las Manos del Siete',
    subtitulo: 'El gremio y la Sala de Sacramento N.º 7',
    resumen: 'El oficio no se elige ni se abandona.',
    estante: 'poder',
    secciones: [
      lista(
        'Las Manos',
        MANOS.map((n) => ({ nombre: n.nombre, texto: n.texto })),
      ),
    ],
  },
  {
    id: 'escuelas',
    titulo: 'Las escuelas en disputa',
    subtitulo: 'Cuatro maneras de responder',
    resumen: 'La misma pregunta sobre el cuerpo y la persona.',
    estante: 'poder',
    secciones: [
      tabla(
        'Escuelas',
        ['Escuela', 'Qué es real', 'Cómo se conoce', 'Qué es el cuerpo'],
        ESCUELAS.map((e) => [e.escuela, e.real, e.conoce, e.cuerpo]),
      ),
    ],
  },
  {
    id: 'otros-relatos',
    titulo: 'Los otros relatos',
    subtitulo: 'La misma historia, contada de otra manera',
    resumen: 'Anatomistas, Ayunantes, Rebaño Hueco y Reformados.',
    estante: 'reservado',
    reservado: true,
    secciones: [
      lista(
        'Versiones',
        OTROS_RELATOS.map((relato) => ({ nombre: relato.nombre, texto: relato.texto })),
      ),
    ],
  },
  {
    id: 'aparato',
    titulo: 'El aparato de Génesis',
    subtitulo: 'La máquina debajo del templo',
    resumen: 'Quince piezas con su origen real y lo que cree el pueblo.',
    estante: 'reservado',
    reservado: true,
    secciones: [
      tabla(
        'Piezas',
        ['Pieza', 'Origen real', 'Uso en la Diócesis', 'Lo que cree el pueblo'],
        TECNOLOGIA.map((pieza) => [pieza.nombre, pieza.origen, pieza.uso, pieza.creencia]),
      ),
    ],
  },
  {
    id: 'cronologia',
    titulo: 'La cronología de la Carne',
    subtitulo: 'Del complejo al sacramento de hoy',
    resumen: 'Los años del clero, contados desde la Escritura.',
    estante: 'reservado',
    reservado: true,
    secciones: [
      tabla(
        'Cronología',
        ['Fecha', 'Lo que ocurrió', 'Lo que dice el Códice'],
        CRONOLOGIA.map((hito) => [hito.fecha, hito.ocurrio, hito.codice]),
      ),
    ],
  },
];

export const ESTANTES_CRIPTA: readonly EstanteBiblioteca[] = [
  {
    id: 'doctrina',
    titulo: 'Estante I · La doctrina',
    nota: 'Los Libros que la Diócesis lee en voz alta, y la lengua con que los lee.',
    libros: ['codice', 'lengua'],
  },
  {
    id: 'casa',
    titulo: 'Estante II · La casa',
    nota: 'Lo que se vive en el pabellón: la ley, el día, el oficio y la mesa.',
    libros: ['leyes', 'calendario', 'oficios', 'clases', 'artes', 'leyendas', 'parentesco'],
  },
  {
    id: 'mundo',
    titulo: 'Estante III · El mundo',
    nota: 'Lo que queda fuera de la Boca, y lo que casi nadie sabe leer.',
    libros: ['intemperie'],
  },
  {
    id: 'poder',
    titulo: 'Estante IV · El poder',
    nota: 'Quién hereda qué, quién interpreta y quién ejecuta.',
    libros: ['herencias', 'capucha', 'manos', 'escuelas'],
  },
  {
    id: 'reservado',
    titulo: 'Estante V · Lo reservado',
    nota: 'Libros que no se prestan.',
    reservado: true,
    libros: ['otros-relatos', 'aparato', 'cronologia'],
  },
];

export const LIBRO_POR_ID: ReadonlyMap<string, LibroBiblioteca> = new Map(
  LIBROS_CRIPTA.map((libro) => [libro.id, libro]),
);

export const LIBROS_POR_ESTANTE: ReadonlyMap<string, readonly LibroBiblioteca[]> = new Map(
  ESTANTES_CRIPTA.map((estante) => [
    estante.id,
    estante.libros.flatMap((id) => {
      const libro = LIBRO_POR_ID.get(id);
      return libro ? [libro] : [];
    }),
  ]),
);
