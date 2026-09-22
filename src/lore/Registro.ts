/**
 * El Registro de la Diocesis: criaturas, oficios y aparatos del Vientre.
 *
 * Por que existe: la entrega original pedia un ArtBook, y el equipo no tiene
 * ilustradores. En vez de un libro aparte, el mundo se ensena DENTRO del juego
 * — y esta es la seccion que cubre lo que el ArtBook llamaria diseno de
 * criaturas y de objetos.
 *
 * La lamina de cada entrada NO es arte nuevo: es el sprite que el jugador acaba
 * de ver moverse. Eso vale mas que una ilustracion aparte, porque lo que
 * cataloga es exactamente lo que le ha pasado por delante.
 *
 * Las fichas estan escritas desde DENTRO del mundo, en la voz de la Diocesis:
 * son el inventario de una institucion, no la enciclopedia de un jugador. Por
 * eso el Devoto no "es un enemigo", sino un fiel con el diezmo ya pagado; y por
 * eso ninguna ficha se horroriza de nada.
 *
 * Invariantes del bible: los Primigenios son ciegos y nunca se ven; fueron mil;
 * el estatus se mide por cuanto cuerpo has entregado. El texto que SE LEE va en
 * español correcto, con tildes y enes; sin tildes van los identificadores y los
 * comentarios.
 */

/** En que apartado del Registro cae cada ficha. */
export type Familia = 'fieles' | 'oficio' | 'aparato';

export interface FichaRegistro {
  id: string;
  familia: Familia;
  nombre: string;
  /** Clave de textura del sprite que sirve de lamina. */
  textura: string;
  /** Fotograma, para las texturas que son hoja de sprites. */
  fotograma?: number;
  /** Como se descubre. Sale en la ficha, en pequeno. */
  hallazgo: string;
  descripcion: readonly string[];
}

export const REGISTRO: readonly FichaRegistro[] = [
  // -- Fieles ---------------------------------------------------------------
  {
    id: 'devoto',
    familia: 'fieles',
    nombre: 'Devoto',
    textura: 'devoto-placeholder',
    hallazgo: 'visto en el Atrio',
    descripcion: [
      'Fiel de la base. Ha pagado su diezmo y conserva casi',
      'todo su cuerpo, que es lo que lo mantiene abajo.',
      'Lo que le falta se lo repuso el Sacramento con lo que',
      'había a mano. No ataca por maldad: cree que estorbas.',
    ],
  },
  {
    id: 'vestal',
    familia: 'fieles',
    nombre: 'Vestal',
    textura: 'vestal-placeholder',
    hallazgo: 'visto en los Pasillos',
    descripcion: [
      'Clero. Sella lo que se cobra y no se ensucia las manos:',
      'por eso lanza el sello en vez de acercarse.',
      'De cintura para abajo ya no le quedan piernas. En la',
      'Diócesis eso no es una pérdida, es un ascenso.',
    ],
  },
  {
    id: 'reformado',
    familia: 'fieles',
    nombre: 'Reformado',
    textura: 'reformado-placeholder',
    hallazgo: 'visto en las Salas',
    descripcion: [
      'Elegido que no completó el sacramento. La doctrina dice',
      'que se le honra por haber llevado la ofrenda a medias.',
      'Honrarlo consiste en dejarlo donde fue hecho.',
      'Este llevaba las Manos de la Sala 7 antes que tú.',
    ],
  },

  // -- El oficio ------------------------------------------------------------
  {
    id: 'cirujano',
    familia: 'oficio',
    nombre: 'Manos del Sacramento',
    textura: 'cirujano-placeholder',
    hallazgo: 'eres tú',
    descripcion: [
      'No tiene nombre: tiene número. Se hereda de un progenitor',
      'y no se deserta, porque la mano entrenada vale demasiado.',
      'La máscara es de oro y no tiene ojos que mirar: mirar al',
      'ofrendado es preguntar, y el Sacramento no admite eso.',
    ],
  },
  {
    id: 'altar',
    familia: 'oficio',
    nombre: 'Altar',
    textura: 'altar-placeholder',
    hallazgo: 'rezado',
    descripcion: [
      'Donde el Cirujano reafirma su fe para poder seguir bajando.',
      'Repone el cuerpo y el frasco, nunca el Fervor: la devoción',
      'no se guarda, se vuelve a ganar con el cuerpo.',
      'Guardar la partida es, aquí dentro, un acto litúrgico.',
    ],
  },
  {
    id: 'sello',
    familia: 'oficio',
    nombre: 'Sello del diezmo',
    textura: 'sello-placeholder',
    hallazgo: 'devuelto con el parry',
    descripcion: [
      'Lacre del Registro. Marca lo cobrado y a quién se le cobró.',
      'Parado en el aire no se rompe: cambia de dueño.',
      'Devolvérselo a un Vestal no es una treta del combate.',
      'Es la única forma que tienes de firmar tú también.',
    ],
  },
  {
    id: 'injertadora',
    familia: 'oficio',
    nombre: 'Injertadora',
    textura: 'injertadora-placeholder',
    hallazgo: 'cargada por primera vez',
    descripcion: [
      'Encajaba las prótesis a presión, en pocos instantes, sin',
      'que al ofrendado le diera tiempo a moverse. Esa prisa era',
      'una piedad: cuanto menos dura, menos se recuerda.',
      'Sigue funcionando. Solo ha cambiado hacia dónde apunta.',
    ],
  },
  {
    id: 'injerto',
    familia: 'oficio',
    nombre: 'Injerto de metal',
    textura: 'injerto-placeholder',
    hallazgo: 'recogido de un cuerpo',
    descripcion: [
      'Lo que el Sacramento le puso a un fiel para reemplazar lo',
      'que se llevó. Se le saca al cuerpo que lo llevaba y se le',
      'mete al siguiente, que es como ha funcionado siempre.',
      'En la Diócesis el metal no se fabrica: se hereda.',
    ],
  },
  {
    id: 'reliquia',
    familia: 'oficio',
    nombre: 'Reliquia',
    textura: 'relicario-placeholder',
    hallazgo: 'recogida en una ruta secreta',
    descripcion: [
      'Relicario de Carne y Frasco Consagrado: carne ajena',
      'guardada en oro para que aguante más quien la lleva.',
      'La Diócesis no las reparte. Están donde alguien las',
      'escondió, que es distinto.',
    ],
  },

  // -- Aparato de Genesis Vestal --------------------------------------------
  {
    id: 'camilla',
    familia: 'aparato',
    nombre: 'Altar-camilla',
    textura: 'camilla-placeholder',
    hallazgo: 'visto en las Criptas',
    descripcion: [
      'Mesa de quirófano con correas y siglos de uso encima.',
      'Es el mueble que mejor explica este sitio: nadie decidió',
      'nunca si era un altar o una camilla, y sigue sin decidirse.',
    ],
  },
  {
    id: 'tanque',
    familia: 'aparato',
    nombre: 'Tanque de cultivo',
    textura: 'tanque-placeholder',
    hallazgo: 'visto en las profundidades',
    descripcion: [
      'Genesis Vestal cultivaba aquí lo que prometió que no moriría.',
      'Cumplió: dentro sigue habiendo algo que no termina de morirse.',
      'El fluido corre desde antes de que existiera la Diócesis.',
      'Nadie sabe apagarlo, y hace mucho que nadie lo intenta.',
    ],
  },
  {
    id: 'pantalla',
    familia: 'aparato',
    nombre: 'Terminal',
    textura: 'pantalla-placeholder',
    hallazgo: 'vista en los Pasillos',
    descripcion: [
      'Sigue escribiendo lo que mide. Hace generaciones que',
      'nadie sabe leerlo, así que se copió a mano lo que parecía',
      'importante y el resto se volvió escritura sagrada.',
      'El Códice está escrito encima de manuales como este.',
    ],
  },
  {
    id: 'holograma',
    familia: 'aparato',
    nombre: 'Proyección médica',
    textura: 'holograma-placeholder',
    hallazgo: 'vista en los Pasillos',
    descripcion: [
      'Un cuerpo humano completo, girando en el aire para nadie.',
      'Es el manual de cómo era la gente antes del sacramento.',
      'Sigue ahí, enseñándolo, delante de fieles que ya no',
      'reconocen esa forma como la suya.',
    ],
  },
  {
    id: 'pila-carne',
    familia: 'aparato',
    nombre: 'Diezmo del día',
    textura: 'pila-carne-placeholder',
    hallazgo: 'visto en el descenso',
    descripcion: [
      'Pesado, anotado y apilado. Para el Registro esto es',
      'contabilidad, y por eso está ahí sin ceremonia ninguna.',
      'Los dioses no ven lo que se les trae: solo lo tocan.',
      'Por eso el hambre no termina nunca.',
    ],
  },
];

export function fichaPorId(id: string): FichaRegistro | undefined {
  return REGISTRO.find((f) => f.id === id);
}

export const FAMILIAS: Readonly<Record<Familia, string>> = {
  fieles: 'LOS FIELES',
  oficio: 'EL OFICIO',
  aparato: 'EL APARATO',
};
