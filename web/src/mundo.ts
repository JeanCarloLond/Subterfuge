/**
 * El mundo de Subterfuge que la biblia cuenta y el Portal todavía no había
 * publicado entero.
 *
 * Sigma se propuso después y vive aparte, en `sigma.ts`: aquí no se toca. Lo
 * que sigue es el material de `Subterfuge.docx` que faltaba en el Portal y que
 * no pertenece al asentamiento: la Intemperie, los tres Libros, los otros
 * relatos, la lengua, las leyes, el calendario, los oficios, la tecnología, las
 * leyendas, las escuelas y los linajes.
 *
 * Todo está en la voz de la Diócesis y se puede rastrear hasta la biblia. No se
 * inventan hechos nuevos: se ordenan y se ponen donde el visitante los busca.
 */

// -- La Intemperie ------------------------------------------------------------

export interface LugarMundo {
  nombre: string;
  texto: string;
}

export interface EspecieMundo {
  nombre: string;
  texto: string;
}

export interface Intemperie {
  lugares: readonly LugarMundo[];
  viaje: readonly string[];
  fauna: readonly EspecieMundo[];
  flora: readonly EspecieMundo[];
}

export const INTEMPERIE: Intemperie = {
  lugares: [
    {
      nombre: 'La Boca',
      texto:
        'La única entrada del Vientre, en la ladera del Monte Vestal. Por ella entran los recursos de las Ermitas y salen los porteadores.',
    },
    {
      nombre: 'El Suelo de Arriba',
      texto:
        'Las bóvedas del Atrio. El pueblo no sabe qué hay encima, y no pregunta: la doctrina no tiene una capa para el cielo.',
    },
    {
      nombre: 'La Ciudad Apagada',
      texto:
        'Las ruinas de Múnich. Torres con pantallas muertas que todavía parpadean para nadie. Allí trabajan los chatarreros de pantallas, que bajan vidrio y metal al Vientre.',
    },
    {
      nombre: 'El Isar Seco',
      texto:
        'El antiguo río, reducido a un cauce de charcos. El vector de Génesis Vestal llegó a él por los drenajes del monte; quien bebe de sus charcos tarde o temprano cambia.',
    },
    {
      nombre: 'El Bosque de Ceniza',
      texto: 'Bosque alpino bajo un cielo gris. Es el territorio de los Ciervos Velados.',
    },
    {
      nombre: 'Las Ermitas de montaña',
      texto:
        'Tres templos aislados en los picos, uno por cada advocación. La Ermita del Pliegue, piedras preciosas y cristal. La Ermita del Latido, metales y oro tibio. La Ermita del Hambre, caza, cuero y madera.',
    },
    {
      nombre: 'El Monte Vestal',
      texto: 'La montaña que contiene el Vientre. En su ladera se abre la Boca.',
    },
  ],
  viaje: [
    'No hay vehículos ni bestias de carga: la tecnología que los movía se apagó y ningún animal de este mundo sirve para montar. Todo se mueve a pie.',
    'De la Ciudad Apagada a la Boca hay dos días de camino; de la Boca a la Ermita más lejana, cinco.',
    'Los porteadores recorren la Senda entre las Ermitas y la Boca. Los tanteadores van delante golpeando el suelo.',
    'Los linajes injertados casi nunca salen de casa, y cuando lo hacen los cargan sus siervos de diezmo.',
  ],
  fauna: [
    {
      nombre: 'Ciervo Velado',
      texto:
        'Su carne no se pudre: el vector del Isar Seco lo mantiene en pie aunque esté muerto. Una membrana lechosa le cubre los ojos; es ciego, como los dioses. Avanza en manadas lentas hacia el calor que sale de la Boca. Su cuero es el más duro de la Intemperie.',
    },
    {
      nombre: 'Alondra de Antena',
      texto:
        'Pájaro pequeño que anida en las pantallas muertas de la Ciudad Apagada y trenza cables en el nido y en las plumas. Canta en tonos que imitan el zumbido de las máquinas; los porteadores siguen su canto para orientarse entre las ruinas.',
    },
    {
      nombre: 'Ganado Engastado',
      texto:
        'Cabras y cerdos de cría de las Ermitas, con placas de metal, oro y carne de otras especies injertadas. Se cree que su carne, más parecida a la de los dioses, eleva a quien la come. Es lo que las Ermitas mandan al Atrio para las fiestas de los linajes.',
    },
    {
      nombre: 'Bestias comunes',
      texto:
        'Liebres, ratas, cabras salvajes y truchas de los charcos del Isar. Son la carne de los pobres: carne que no acerca a nadie a los dioses.',
    },
  ],
  flora: [
    {
      nombre: 'Musgo de Pantalla',
      texto:
        'Crece sobre las pantallas muertas y conserva un brillo muy débil, como si recordara la imagen. Los chatarreros lo raspan para hacer mechas que duran toda la noche.',
    },
    {
      nombre: 'Abeto Ceniciento',
      texto:
        'El árbol del Bosque de Ceniza, de agujas grises. Su madera alimenta los talleres de los carpinteros del Vientre.',
    },
  ],
};

// -- Los Libros y los otros relatos ------------------------------------------

export interface LibroMundo {
  nombre: string;
  cita: string;
  texto: string;
}

export const LIBROS: readonly LibroMundo[] = [
  {
    nombre: 'Libro I · El Don y el Silencio',
    cita: 'En el principio fue el Silencio, y el mundo olvidó su propio nombre.',
    texto:
      'Cuenta el origen: la Madre Escriba descendió con mil voluntarios, les ofreció el Don y la Muerte no pudo llevárselos. De ahí salen el Diezmo y el Sacramento. Debajo del relato está el informe de incidentes de Génesis Vestal.',
  },
  {
    nombre: 'Libro II · La Venda de la Madre',
    cita: 'Cubrid vuestros ojos cuando interpretéis, porque el que mira juzga.',
    texto:
      'La Madre quiso mirar a los Mil y no pudo: se vendó con el lienzo del primer sacramento y escribió a ciegas lo que le decían por el tacto. De ahí vienen la capucha de las Vestales y el tabú de mirar.',
  },
  {
    nombre: 'Libro III · El Día de la Mirada',
    cita: 'Llegará una ofrenda con los ojos que a los dioses les fueron negados.',
    texto:
      'Es la escatología del mundo. La Diócesis la predica como una ascensión colectiva; el Coro del Pliegue la espera para ver sin intermediarios; el Penitente, para ser mirado con compasión. Los Ayunantes creen que es una promesa inventada para seguir pagando.',
  },
];

export interface RelatoMundo {
  nombre: string;
  texto: string;
}

export const OTROS_RELATOS: readonly RelatoMundo[] = [
  {
    nombre: 'Los Anatomistas · El Protocolo',
    texto:
      'No hay dioses ni Madre Escriba: hubo un comité, una Fase 3 que falló y una cadena de decisiones para ocultarla. Su versión vive en los manuales técnicos originales, que se copian a escondidas desde hace generaciones.',
  },
  {
    nombre: 'Los Ayunantes · La Rehusada',
    texto:
      'Una de los Mil dijo que no en el último momento y la trataron igual. Para ellos el Don empezó como una violación; por eso los dioses no son divinos sino heridos, y a una herida no se le da de comer: se la cura o se la deja cerrar.',
  },
  {
    nombre: 'El Rebaño Hueco · El Lugar Vacío',
    texto:
      'Dicen que el Don debía heredarse y que los Mil eran solo los primeros: existe un Mil Uno que nunca llegó, y la Diócesis cerró la Puerta del Cuerpo por miedo. Se injertan para llenar el hueco y convertirse en el sucesor que falta.',
  },
  {
    nombre: 'Los Reformados · Los Ojos Prestados',
    texto:
      'Una canción de cuna de los Niveles Reformados, que se canta porque el Latido de los Cordiales les llega en sueños. Dice que los ojos de los dioses fueron el primer diezmo y que algún día llegará una ofrenda capaz de ver por ellos.',
  },
];

// -- La lengua ----------------------------------------------------------------

export interface RegistroLengua {
  nombre: string;
  texto: string;
}

export interface ReglaLengua {
  nombre: string;
  texto: string;
}

export interface ExpresionLengua {
  frase: string;
  texto: string;
}

export interface TerminoGlosario {
  termino: string;
  registro: string;
  texto: string;
}

export interface Lengua {
  registros: readonly RegistroLengua[];
  reglas: readonly ReglaLengua[];
  expresiones: readonly ExpresionLengua[];
  glosario: readonly TerminoGlosario[];
}

export const LENGUA: Lengua = {
  registros: [
    {
      nombre: 'La Lengua del Códice',
      texto:
        'Registro alto. La hablan las Vestales y es la del Códice de la Carne. Mezcla latín litúrgico con el léxico fósil de Génesis Vestal, que ya nadie reconoce como jerga de laboratorio. Se recita en voz alta y nunca se discute.',
    },
    {
      nombre: 'El Habla del Pabellón',
      texto:
        'Registro común. La lengua de la casa, el taller y la cola. Conserva raíces del alemán de antes del Silencio: el diezmo es Zehnt, el Latido es Herzschlag y lo sagrado es lau, tibio. Es una lengua de direcciones de hospital, oficios y deudas.',
    },
    {
      nombre: 'El Palmario',
      texto:
        'Registro táctil. Como los dioses no ven, lo sagrado no se lee con los ojos: se lee con la mano. Es una escritura de cicatrices en relieve que empieza con el Primer Tacto y guarda el pabellón, el oficio y los diezmos pagados.',
    },
  ],
  reglas: [
    {
      nombre: 'Lo que se sabe, se toca',
      texto:
        'Los verbos de ver están vedados para hablar de lo sagrado y se cambian por verbos de tacto. «Lo toqué» significa «lo conocí». Mirar fijamente es grosero en la mesa y herético en la capilla.',
    },
    {
      nombre: 'El sacrificio no tiene sujeto',
      texto:
        'Todo lo que tiene que ver con el diezmo se dice en pasiva o impersonal: «fue subido», «se ofreció carne», «reformadas en acto de servicio». La gramática borra al verdugo.',
    },
    {
      nombre: 'Abajo se dice arriba',
      texto:
        'Ir hacia el sacramento es acercarse a los dioses, así que el idioma invierte la dirección. Se dice «subir» de quien va al sacramento; el Vientre Profundo es Lo Alto. Para cualquier otro movimiento por el edificio se dice bajar.',
    },
    {
      nombre: 'No hay forma de negarse',
      texto:
        'El registro alto no tiene fórmula para negarse. La única palabra es «rehusar», que viene de la Rehusada, la santa herética de los Ayunantes. Decirla en voz alta es tomar partido.',
    },
  ],
  expresiones: [
    {
      frase: '«Fue subido»',
      texto:
        'Así se dice que alguien fue Elegido. La familia lo cuenta con orgullo, como quien cuenta que un hijo se graduó; desde fuera suena a eufemismo de una desaparición.',
    },
    {
      frase: '«Está tibio»',
      texto:
        'Tibio es la palabra para lo sagrado: tibia es la Piedra que toca al niño, tibia la Lluvia que cae de las bóvedas. También es una advertencia: un bisturí tibio es un Remedo.',
    },
    {
      frase: '«Debo carne»',
      texto:
        'La deuda no se mide en dinero sino en cuerpo. «Mi casa debe carne» quiere decir que la cuota del pabellón no está cubierta y que el próximo sorteo puede tocarle.',
    },
    {
      frase: '«Ojos al suelo, palma al frente»',
      texto:
        'La fórmula de respeto para saludar a un clérigo o entrar en una capilla: no se mira, se ofrece la palma para que la lean. Convive con el saludo entre iguales: «¿Te tocan?», «Me tocan».',
    },
  ],
  glosario: [
    {
      termino: 'Advocación',
      registro: 'Códice',
      texto:
        'Título sagrado de cada facción-órgano: el Coro del Pliegue, el Penitente, el Gran Hambre.',
    },
    {
      termino: 'Altar',
      registro: 'Ambos',
      texto:
        'Altar de capa donde se reza para poder seguir bajando. También, el altar-camilla de las Salas.',
    },
    {
      termino: 'Altar-camilla',
      registro: 'Ambos',
      texto: 'La mesa de quirófano con correas en la que se celebra el sacramento.',
    },
    {
      termino: 'Apagarse',
      registro: 'Pabellón',
      texto: 'Morir de muerte natural, como una vela pellizcada: sin aliento y sin ruido.',
    },
    {
      termino: 'Ascendido',
      registro: 'Códice',
      texto:
        'Quien completa el sacramento y se integra en los Mil. No ha ocurrido en tres generaciones.',
    },
    {
      termino: 'Coserse',
      registro: 'Pabellón',
      texto:
        'Casarse. Un suturador une las palmas de los novios con un punto de púa de Zarza que se retira al amanecer.',
    },
    {
      termino: 'Deber carne',
      registro: 'Pabellón',
      texto: 'Estar en deuda con la Diócesis. Lo contrario es «estar al día con la carne».',
    },
    {
      termino: 'Descenso',
      registro: 'Ambos',
      texto:
        'Bajar por el Vientre con turno. En el portal, el descenso abierto es el permiso para leer lo reservado.',
    },
    {
      termino: 'Diezmo',
      registro: 'Ambos',
      texto: 'La carne que cada casa entrega. «No se admite otra moneda.»',
    },
    {
      termino: 'El Don',
      registro: 'Códice',
      texto: 'El tratamiento de Génesis Vestal, visto como gracia.',
    },
    {
      termino: 'Elegido',
      registro: 'Códice',
      texto: 'El fiel que va al sacramento, por sorteo o por deuda. Viene de «sujeto elegible».',
    },
    {
      termino: 'Fervor',
      registro: 'Ambos',
      texto:
        'La devoción que se demuestra con el cuerpo, golpe a golpe. No se guarda: se vuelve a ganar.',
    },
    {
      termino: 'Hambre',
      registro: 'Códice',
      texto:
        'El periodo en que el clero sube la cuota y añade sorteos porque el Latido se acelera.',
    },
    {
      termino: 'Injertadora',
      registro: 'Pabellón',
      texto: 'La herramienta de las Manos que encaja injertos a presión.',
    },
    {
      termino: 'Intemperie',
      registro: 'Pabellón',
      texto:
        'La superficie, fuera de la Boca. De quien viene de fuera se dice que «trae Intemperie».',
    },
    {
      termino: 'Intocado',
      registro: 'Pabellón',
      texto: 'Quien no tiene Primer Tacto o se niega a modificarse. No consta en el Libro.',
    },
    {
      termino: 'Latido',
      registro: 'Ambos',
      texto: 'El temblor rítmico que recorre el Vientre. Marca el comienzo de la jornada.',
    },
    {
      termino: 'Lo Alto',
      registro: 'Códice',
      texto:
        'El Vientre Profundo, donde viven los Primigenios. Está abajo, pero es lo más sagrado.',
    },
    {
      termino: 'Los Mil',
      registro: 'Códice',
      texto: 'Los Primigenios. «Los dioses son mil y mil serán.»',
    },
    {
      termino: 'Manos',
      registro: 'Ambos',
      texto: 'Los Cirujanos-Sacerdotes, y el modo de dirigirse a ellos: «Buenos días, Manos».',
    },
    {
      termino: 'Mano a Mano',
      registro: 'Pabellón',
      texto: 'La transmisión de un oficio de maestro a aprendiz.',
    },
    {
      termino: 'Mareas del Hambre',
      registro: 'Pabellón',
      texto: 'Las crecidas de fluido tibio que inundan lo bajo cuando los Viscerales digieren.',
    },
    {
      termino: 'No vengas',
      registro: '—',
      texto:
        'Lo que aparece al margen, en otra tinta, cuando se han reunido las ocho hojas del Nivel 1.',
    },
    {
      termino: 'Ofrenda',
      registro: 'Códice',
      texto: 'Lo que se entrega en el sacramento, y quien se entrega.',
    },
    {
      termino: 'Ojo-abierto',
      registro: 'Pabellón',
      texto:
        'Curioso, hereje o alguien que pregunta demasiado. Así se llama en voz baja a quien se sospecha Anatomista.',
    },
    {
      termino: 'Palmario',
      registro: 'Táctil',
      texto: 'La escritura de cicatrices en relieve sobre la palma; se lee con el pulgar.',
    },
    {
      termino: 'Poción de Carne',
      registro: 'Ambos',
      texto: 'Carne consagrada que cierra heridas.',
    },
    {
      termino: 'Reformado',
      registro: 'Códice',
      texto:
        'El Elegido que sobrevivió al sacramento sin completarse. Baja por el desagüe a los Niveles Reformados.',
    },
    {
      termino: 'Registro',
      registro: 'Ambos',
      texto:
        'La oficina que pesa, anota y sortea, y el libro donde todo consta. «El Registro no elige: sortea.»',
    },
    {
      termino: 'Rehusar',
      registro: 'Herético',
      texto: 'Negarse. No existe en el registro alto; decirla en público es declararse Ayunante.',
    },
    {
      termino: 'Sacramento',
      registro: 'Códice',
      texto: 'La operación ritual que transforma a un Elegido.',
    },
    {
      termino: 'Sello del diezmo',
      registro: 'Ambos',
      texto: 'El lacre con que el Registro marca lo cobrado.',
    },
    {
      termino: 'Silencio',
      registro: 'Códice',
      texto: 'El colapso tecnológico que borró la memoria del mundo.',
    },
    {
      termino: 'Subir',
      registro: 'Códice',
      texto: 'Ser llevado al sacramento como Elegido. El eufemismo central del culto.',
    },
    {
      termino: 'Suelo de Arriba',
      registro: 'Pabellón',
      texto: 'Las bóvedas del Atrio. El pueblo no sabe qué hay encima.',
    },
    {
      termino: 'Tibio',
      registro: 'Ambos',
      texto: 'Sagrado y peligroso a la vez; cercano a los dioses.',
    },
    {
      termino: 'Umbral',
      registro: 'Pabellón',
      texto:
        'El paso de una capa a otra, siempre con turno. «Las Manos del Sacramento pasan sin turno.»',
    },
    {
      termino: 'Vientre Húmedo',
      registro: 'Pabellón',
      texto: 'La capa V vista como lugar vivo: el bosque de carne donde desaguan las Salas.',
    },
  ],
};

// -- Cultura: leyes, calendario, oficios, clases, arte y casa -----------------

export interface LeyMundo {
  falta: string;
  motivo: string;
  castigo: string;
}

export const LEYES: readonly LeyMundo[] = [
  {
    falta: 'Retener el diezmo',
    motivo: '«Quien retiene su diezmo le quita el mundo» (Códice III, 1).',
    castigo: 'La casa pasa a deber carne y entra en el próximo sorteo.',
  },
  {
    falta: 'Modificarse sin licencia',
    motivo: 'Rompe las leyes suntuarias: es ascender sin permiso.',
    castigo: 'Se retira el injerto y el instrumental; si reincide, se le trata como Rebaño Hueco.',
  },
  {
    falta: 'Mirar a un ofrendado o a un clérigo',
    motivo: '«Mirar es preguntar, y aquí no se pregunta» (Códice VI, 1).',
    castigo: 'Venda de penitencia durante un ciclo de Hambre.',
  },
  {
    falta: 'Soplar una vela de cera humana',
    motivo: 'Es soplar sobre un dios.',
    castigo: 'Cuota extra a la casa.',
  },
  {
    falta: 'Pisar alfombra',
    motivo: 'Riesgo y tabú a la vez.',
    castigo: 'Ninguno: la Alfombra Devota ya castiga.',
  },
  {
    falta: 'Contar los dioses en voz alta',
    motivo: '«Quien cuenta, duda. Quien duda, ofrece» (Códice VII, 3).',
    castigo: 'Inscripción inmediata en el sorteo.',
  },
  {
    falta: 'Decir «rehusar» en público',
    motivo: 'Es declararse Ayunante.',
    castigo: 'El domicilio pasa a la lista de seguimiento del Atrio.',
  },
];

export interface FechaLiturgica {
  nombre: string;
  texto: string;
}

export const CALENDARIO: readonly FechaLiturgica[] = [
  {
    nombre: 'Día de la Escritura',
    texto: 'El aniversario del Libro I. Se lee el Códice en voz alta en todas las capillas.',
  },
  {
    nombre: 'Noche de la Venda',
    texto:
      'En recuerdo de la Madre Escriba, la ciudad entera cena con los ojos vendados y las velas se pellizcan a la vez.',
  },
  {
    nombre: 'El Primer Tacto común',
    texto:
      'Una vez por ciclo, los niños que perdieron su primer diente pasan juntos por la Piedra Tibia.',
  },
  {
    nombre: 'Los jueves de sorteo',
    texto:
      'El sorteo ordinario es semanal. «Por motivos de aforo, este mes se celebra a puerta cerrada.»',
  },
  {
    nombre: 'Los Hambres',
    texto:
      'No tienen fecha: los declara el Colegio cuando el Latido se acelera. Son el verdadero reloj del pueblo.',
  },
];

export interface OficioMundo {
  nombre: string;
  texto: string;
  donde: string;
}

export const OFICIOS: readonly OficioMundo[] = [
  {
    nombre: 'Cereros',
    texto: 'Funden el sebo de diezmo y hacen las velas de cera humana.',
    donde: 'Talleres del Atrio',
  },
  {
    nombre: 'Suturadores',
    texto: 'Cosen heridas, ayudan en los sacramentos y cosen a los novios.',
    donde: 'Salas de Sacramento',
  },
  {
    nombre: 'Hongueros',
    texto: 'Cultivan el Hongo de Lámpara y los tubérculos.',
    donde: 'Terrazas del Atrio',
  },
  {
    nombre: 'Auxiliares de cripta',
    texto: 'Administran la dosis la víspera del turno y vigilan el sueño de los inscritos.',
    donde: 'Criptas de Espera',
  },
  { nombre: 'Porteadores', texto: 'Cargan los recursos por la Senda.', donde: 'La Intemperie' },
  {
    nombre: 'Tanteadores',
    texto: 'Golpean el suelo con varas de hierro antes de cruzar una sala.',
    donde: 'Todo el Vientre',
  },
  {
    nombre: 'Escribanos del Libro',
    texto: 'Copian y custodian el Libro de Diezmos.',
    donde: 'Pasillos de Preparación',
  },
  {
    nombre: 'Herreros-reliquieros',
    texto: 'Engastan dientes en oro y reparan el instrumental y las armas de la Cruzada.',
    donde: 'Talleres del Atrio',
  },
  {
    nombre: 'Carpinteros',
    texto: 'Levantan andamios, camillas y alvéolos con madera del Bosque de Ceniza.',
    donde: 'Atrio',
  },
  {
    nombre: 'Mineros de Ermita',
    texto: 'Sacan metales, oro y piedras preciosas.',
    donde: 'Ermitas de montaña',
  },
  {
    nombre: 'Chatarreros de pantallas',
    texto: 'Rescatan vidrio, cable y metal de la Ciudad Apagada.',
    donde: 'La Intemperie',
  },
  {
    nombre: 'Cazarrecompensas',
    texto: 'Rastrean a Elegidos fugados y a Ayunantes; cobran en diezmo perdonado.',
    donde: 'Atrio e Intemperie',
  },
];

export interface ClaseMundo {
  clase: string;
  donde: string;
  come: string;
  vive: string;
}

export const CLASES: readonly ClaseMundo[] = [
  {
    clase: 'Linajes injertados',
    donde: 'Pabellones altos del Atrio',
    come: 'Carne engastada de Cerdo de Protocolo y Ganado Engastado; pan blanco de micelio',
    vive: 'Rara vez salen de casa. Sus siervos de diezmo cargan, cocinan y cumplen por ellos.',
  },
  {
    clase: 'Casas de oficio',
    donde: 'Pabellones comunes',
    come: 'Pan de micelio, tubérculos pálidos y, en fiestas, carne común',
    vive: 'Trabajan en los gremios y están al día con la carne.',
  },
  {
    clase: 'Casas deudoras',
    donde: 'Pabellones bajos',
    come: 'Pan de micelio y frutos de Mata de Retazos',
    vive: 'Deben carne y viven pendientes del próximo sorteo.',
  },
  {
    clase: 'Siervos de diezmo',
    donde: 'Alvéolos en casas ajenas',
    come: 'Lo que sobra en la mesa del amo',
    vive: 'Pagan con trabajo una carne que no pueden dar.',
  },
  {
    clase: 'Intocados',
    donde: 'Márgenes del Atrio',
    come: 'Liebres, ratas y truchas del Isar; Mata cultivada por los Ayunantes',
    vive: 'No constan en el Libro. Viven de la caridad o de la Intemperie.',
  },
];

export interface ArteMundo {
  nombre: string;
  texto: string;
}

export const ARTES: readonly ArteMundo[] = [
  {
    nombre: 'Los exvotos',
    texto:
      'Figuras de cera, hueso y metal que las familias cuelgan en el Atrio después de un sacramento completo. No hay ninguno nuevo: los que se ven tienen tres generaciones.',
  },
  {
    nombre: 'El Muro de los Dientes',
    texto:
      'Cada capilla tiene el suyo, con los dientes de leche de todos los niños del pabellón engastados en oro. Es a la vez archivo, mosaico y árbol genealógico.',
  },
  {
    nombre: 'Las vidrieras-pantalla',
    texto:
      'Monitores muertos del complejo que los fieles adornan con cera y tela. Se consideran ventanas al cielo de antes.',
  },
  {
    nombre: 'La talla de cera',
    texto:
      'Los cereros hacen velas con forma de mano para las capillas y copias en cera de palmas famosas, como la del Tanteador de las Mil Salas.',
  },
  {
    nombre: 'La música',
    texto:
      'Coros a capela en el Atrio, que cantan la Letanía al ritmo del Latido; más abajo no se canta, porque la fe se reserva para la oración.',
  },
  {
    nombre: 'Los Libros iluminados',
    texto:
      'Las copias del Códice llevan rúbricas rojas, iniciales versales y filetes de oro, y en el fondo se trasluce el manual que reescribieron.',
  },
];

export const CASA: readonly string[] = [
  'La unidad de herencia del pueblo es la casa: una camilla, una bata remendada por capas, un oficio y una línea en el Libro de Diezmos. También se hereda la deuda.',
  'Las casas se nombran por su dirección y no por un apellido. La niña es, para el Libro, «Pabellón 9, camilla 22, hija». Tomás es «Pabellón 9, camilla 14, cerero».',
  'Dos casas que se cosen pasan a compartir camilla de origen y cuota, y el Libro las escribe con un solo número.',
];

export const ARQUITECTURA: readonly string[] = [
  'La Diócesis no construyó su templo: lo heredó y fue cubriéndolo. Arriba quedan columnas, sillería y ventanas ojivales; en los Pasillos, la piedra está parcheada con chapa remachada; en las Criptas ya no hay arquitectura, solo celdas y filas de camillas; en las Salas la máquina no se disimula, es el altar.',
  'Cuanto más abajo, más aparato de Génesis Vestal y menos obra humana. El turquesa, el único color que no es carne, sangre, oro ni piedra, marca todo lo que todavía es de la corporación.',
  'La ropa repite la misma regla. El pueblo lleva bata remendada y sayo; los Devotos que bajan a servir, una venda sobre los ojos. Las Vestales de Registro llevan un aparato de metal con una lente turquesa; las intérpretes, capucha y máscara de cresta de Mondador. Las Manos del Sacramento visten azul noche, capucha y muceta moradas y la máscara de pico dorada, sin ojos.',
];

// -- Tecnología -----------------------------------------------------------------

export interface TecnologiaMundo {
  nombre: string;
  origen: string;
  uso: string;
  creencia: string;
}

export const TECNOLOGIA: readonly TecnologiaMundo[] = [
  {
    nombre: 'El Don',
    origen: 'Vector de edición genética de Génesis Vestal',
    uso: 'Causa de los Primigenios y de la frontera porosa',
    creencia: 'La gracia de los dioses',
  },
  {
    nombre: 'Ductos y Piedra Tibia',
    origen: 'Sistema térmico y de ventilación del complejo',
    uso: 'Llevan calor; la Piedra identifica a cada niño por el tacto',
    creencia: 'El tacto de los dioses',
  },
  {
    nombre: 'Conductos de servicio',
    origen: 'Tubería del complejo que nadie ha cerrado',
    uso: 'Llevan el sedante a las Criptas y el fluido hacia abajo',
    creencia: 'Nada: oficialmente no existen',
  },
  {
    nombre: 'Terminales y vidrieras-pantalla',
    origen: 'Monitores que siguen escribiendo lo que miden',
    uso: 'Ornamento de capillas y pasillos; de ellas se copió el Códice',
    creencia: 'Ventanas al cielo de antes',
  },
  {
    nombre: 'Proyección médica',
    origen: 'Holograma de anatomía humana',
    uso: 'Gira en los Pasillos, para nadie',
    creencia: 'El manual de cómo era la gente antes del sacramento',
  },
  {
    nombre: 'Tanques de cultivo',
    origen: 'Cubas donde se cultivaba el tejido del programa',
    uso: 'Siguen corriendo; nadie sabe apagarlos',
    creencia: 'Que guardan algo que no debe morir',
  },
  {
    nombre: 'Libro de Diezmos',
    origen: 'Base de datos de sujetos, reescrita a mano',
    uso: 'Registro de casas, deudas y sorteos',
    creencia: 'La memoria de los dioses',
  },
  {
    nombre: 'El Palmario',
    origen: 'Ninguno: es un invento del culto',
    uso: 'Escritura de cicatrices: identidad, firma y hoja de vida',
    creencia: 'Escritura sagrada',
  },
  {
    nombre: 'Injertos de metal',
    origen: 'Prótesis del programa',
    uso: 'Reponen lo que el sacramento quita',
    creencia: 'En la Diócesis el metal no se fabrica: se hereda',
  },
  {
    nombre: 'Injertadora',
    origen: 'Pistola que encajaba las prótesis a presión',
    uso: 'Encaja prótesis en el sacramento; en el juego, el Cirujano la usa como arma',
    creencia: 'Una piedad: cuanto menos dura, menos se recuerda',
  },
  {
    nombre: 'Poción de Carne',
    origen: 'Concentrado de tejido del diezmo',
    uso: 'Cierra heridas y repone el cuerpo',
    creencia: 'Carne consagrada que devuelve lo perdido',
  },
  {
    nombre: 'Hongo de Lámpara',
    origen: 'Tecnología viva',
    uso: 'Luz y reloj de la ciudad; sedante en su variedad oscura',
    creencia: 'Un regalo del Latido',
  },
  {
    nombre: 'Velas de cera humana',
    origen: 'Grasa del tejido rechazado',
    uso: 'Iluminación de mesas y capillas',
    creencia: 'Una luz que no se sopla',
  },
  {
    nombre: 'Armería de la Cruzada',
    origen: 'Instrumental y mobiliario hospitalario',
    uso: 'Alabardas con hoja de bisturí, corazas de placas de quirófano y escudos de autoclave',
    creencia: 'Armas bendecidas',
  },
  {
    nombre: 'Manuales técnicos',
    origen: 'Documentación original de Génesis Vestal',
    uso: 'Biblia secreta de los Anatomistas; se trasluce bajo cada copia del Códice',
    creencia: 'Herejía',
  },
];

// -- Mitología: leyendas y figuras ---------------------------------------------

export interface LeyendaMundo {
  nombre: string;
  texto: string;
}

export const LEYENDAS: readonly LeyendaMundo[] = [
  {
    nombre: 'La Primera Mano',
    texto:
      'El primer Cirujano-Sacerdote. En el primer Hambre operó cuarenta días sin dormir; cuando murió, sus manos siguieron cerrando suturas sobre el altar-camilla hasta el amanecer. Están engastadas en oro en la Sala N.º 1.',
  },
  {
    nombre: 'La Decana de la página en blanco',
    texto:
      'Una Decana del Atrio borró del Libro de Diezmos el nombre de un niño sorteado y ofreció su propia mano en su lugar. La Diócesis la cuenta como ejemplo de generosidad; los Ayunantes, como el primer acto de desobediencia.',
  },
  {
    nombre: 'El Tanteador de las Mil Salas',
    texto:
      'Un tanteador que cruzó todas las salas golpeando el suelo con su vara y grabó en el Palmario de su mano dónde crecía la Alfombra Devota. Los tanteadores aprenden los caminos seguros recorriendo una copia de su mano hecha en cera.',
  },
  {
    nombre: 'El Cerero que sopló',
    texto:
      'Un cuento de advertencia para niños. Un cerero apagó de un soplo una vela de cera humana y esa noche el Latido se detuvo en todo su pabellón. A la mañana siguiente, su casa debía carne.',
  },
  {
    nombre: 'Las Manos del Siete',
    texto:
      'El rumor de los suturadores: quien ocupa la Sala N.º 7 termina, tarde o temprano, mirando lo que hace. Dos Manos de esa sala fueron Reformadas en ella y siguen allí. El protagonista es el tercero.',
  },
];

// -- Filosofía: las escuelas en disputa ----------------------------------------

export interface EscuelaMundo {
  escuela: string;
  real: string;
  conoce: string;
  cuerpo: string;
}

export const ESCUELAS: readonly EscuelaMundo[] = [
  {
    escuela: 'La Diócesis',
    real: 'Lo revelado y lo registrado en el Códice y el Libro de Diezmos',
    conoce: 'Por el tacto y la interpretación de las Vestales',
    cuerpo: 'Una ofrenda; propiedad de los dioses',
  },
  {
    escuela: 'Los Anatomistas',
    real: 'La materia: los Primigenios son biología',
    conoce: 'Por observación y experimento, en secreto',
    cuerpo: 'Un mecanismo que se puede entender y reparar',
  },
  {
    escuela: 'Los Ayunantes',
    real: 'El dolor y el consentimiento',
    conoce: 'Por la experiencia propia: lo que duele no puede ser sagrado',
    cuerpo: 'Algo propio que nadie le debe a nadie',
  },
  {
    escuela: 'El Rebaño Hueco',
    real: 'Lo que el cuerpo todavía puede llegar a ser',
    conoce: 'Por la transformación en la carne propia',
    cuerpo: 'Un borrador; un dios sin terminar',
  },
];

// -- Linajes: las cuatro herencias, la Capucha y las Manos ---------------------

export interface HerenciaMundo {
  nombre: string;
  texto: string;
}

export const HERENCIAS: readonly HerenciaMundo[] = [
  {
    nombre: 'La sangre',
    texto:
      'La casa y la deuda. Se pertenece a una casa, a un pabellón y a un oficio, en ese orden.',
  },
  {
    nombre: 'La capucha',
    texto:
      'El derecho a interpretar. Cada Vestal elige en vida a su sucesora y le entrega su capucha.',
  },
  {
    nombre: 'El oficio',
    texto:
      'Se pasa de Mano a Mano, de maestro a aprendiz. La mano entrenada vale demasiado para dejarla marchar.',
  },
  {
    nombre: 'El Don',
    texto:
      'De él descienden a la vez los dioses y los pueblos. Es el origen de todo y la deuda que nadie eligió.',
  },
];

export interface LinajeMundo {
  nombre: string;
  texto: string;
}

export const CAPUCHA: readonly LinajeMundo[] = [
  {
    nombre: 'La Madre Escriba',
    texto:
      'En el Códice, la fundadora y primera Vestal. Solo el Colegio sabe su nombre civil: la doctora Hedda Brandt, última directora del Proyecto Vestal.',
  },
  {
    nombre: 'Las tres primeras',
    texto:
      'Adelheid, la que Interpreta; Gertrud, la que Guarda el Libro; e Ilse, la que Venda, encargada de cubrir los ojos de las intérpretes. Son las «hijas» a las que habla la Madre en el Libro II.',
  },
  {
    nombre: 'La segunda generación',
    texto:
      'Waltraud y Renate, intérpretes; Liesel, custodia del Libro; Mechthild, autora del Libro III; y Brunhild, que fundó las Vestales menores de las Ermitas. Waltraud se apagó sin sucesora y su capucha se da por perdida.',
  },
  {
    nombre: 'La Vestal Mayor Walburga',
    texto:
      'Gran Intérprete en el presente. Es la única que heredó dos capuchas, la de Renate y la de Mechthild, y de esa doble herencia le viene el poder: interpreta el Latido y custodia la profecía del Día de la Mirada.',
  },
  {
    nombre: 'Las Vestales de Registro',
    texto:
      'El escalón más bajo del Colegio: sellan lo que se cobra y no interpretan nada. Son las que el Cirujano se cruza en los Pasillos y en las Criptas.',
  },
];

export const MANOS: readonly LinajeMundo[] = [
  {
    nombre: 'La Primera Mano',
    texto:
      'El primer Cirujano-Sacerdote. Sus manos se conservan engastadas en oro en la Sala N.º 1. Cada cirujano las toca antes de su primer corte.',
  },
  {
    nombre: 'Manos N.º 7 · I, «el que contó dos veces»',
    texto:
      'Contaba el instrumental dos veces antes de cada corte, y la costumbre viene de él. No era de la sangre del protagonista: pasó la sala de Mano a Mano. Fue Reformado en ella en el año 39.',
  },
  {
    nombre: 'Manos N.º 7 · II, «el que se detuvo»',
    texto:
      'El padre del protagonista, que lo formó desde niño. En el año 66 se detuvo en mitad de un sacramento. La placa de la Sala lo dice con las palabras del Registro: «reformadas en acto de servicio, no trasladadas».',
  },
  {
    nombre: 'La Mano Mayor',
    texto:
      'Cuando el padre faltó, el gremio le asignó la formación que quedaba. No es de su sangre: es su maestra de oficio. Algunos suturadores sospechan que es Anatomista.',
  },
  {
    nombre: 'Manos N.º 7 · III',
    texto:
      'El protagonista. «Enseñaron a las mías a sostener el bisturí. Ahora lo sostengo yo, y no queda nadie delante.»',
  },
];

// -- Parentesco y cronología ---------------------------------------------------

export const PARENTESCO: readonly string[] = [
  'Se pertenece a una casa, a un pabellón y a un oficio, en ese orden. El apellido no existe: la casa se nombra por su dirección, y la persona por su lugar en ella («Pabellón 9, camilla 22, hija»).',
  'La identidad se lleva en la mano. El Palmario, la escritura de cicatrices que empieza con el Primer Tacto, guarda el pabellón, el oficio y los diezmos pagados de cada persona; quien sabe leerlo recorre la palma de otro con el pulgar y sabe quién es. Una palma lisa es una persona que no consta.',
  'Casarse se dice coserse. Un suturador une las palmas cicatrizadas de los novios con un solo punto de púa de Zarza, que se retira al amanecer; queda una cicatriz compartida en el mismo lugar de las dos manos. Dos casas cosidas comparten cuota de diezmo, así que el matrimonio es también un contrato de deuda: nadie se cose con una casa que debe carne.',
  'El amor que no se puede coser se vive a escondidas y tiene su propia palabra: «tocarse por debajo», darse la mano con las palmas hacia abajo, sin enseñarse el Palmario.',
  'Las Manos del Sacramento pueden cocerse, pero su sala es lo primero y su casa lo segundo. Las Vestales no se cosen: entregan la capucha, no la mano.',
];

export interface HitoMundo {
  fecha: string;
  ocurrio: string;
  codice: string;
}

export const CRONOLOGIA: readonly HitoMundo[] = [
  {
    fecha: 'Antes del Silencio',
    ocurrio: 'La humanidad delega todo su saber en sistemas que no entiende.',
    codice: '«El mundo olvidó su propio nombre.»',
  },
  {
    fecha: '−15 A.E.',
    ocurrio: 'Génesis Vestal construye su complejo de investigación bajo el Monte Vestal.',
    codice: '—',
  },
  {
    fecha: '−6 A.E.',
    ocurrio: 'Fase 3: mil voluntarios reciben la terapia de edición genética radical. Lote único.',
    codice: '«La Madre Escriba descendió al Vientre con mil voluntarios y les ofreció el Don.»',
  },
  {
    fecha: '−5 A.E.',
    ocurrio:
      'Los sujetos no mueren: mutan y se funden con la estructura. Ninguno conserva tejido óptico. Fuera llega el Silencio.',
    codice: '«La Muerte los tocó y no pudo llevárselos.»',
  },
  {
    fecha: '−4 a −1 A.E.',
    ocurrio:
      'Contención. Protocolo de alimentación: primero cerdos de laboratorio, luego el personal, luego la población refugiada.',
    codice: '«Lo que no muere debe comer.»',
  },
  {
    fecha: '0 A.E.',
    ocurrio:
      'La directora científica reescribe el informe de incidentes como escritura sagrada: el Libro I y la Regla. Nacen la Diócesis y el Colegio de las Vestales.',
    codice: '«Así quedaron instituidos el Diezmo y el Sacramento.»',
  },
  {
    fecha: '3 A.E.',
    ocurrio: 'Primer Hambre. La Primera Mano opera cuarenta días sin dormir.',
    codice: 'Leyenda de la Primera Mano.',
  },
  {
    fecha: '12 A.E.',
    ocurrio: 'Se fundan las tres Ermitas de montaña y la Senda de los porteadores.',
    codice: '—',
  },
  {
    fecha: '20 A.E.',
    ocurrio: 'Muere la Madre Escriba. Sus hijas fijan el Libro II.',
    codice: '«La Venda de la Madre.»',
  },
  {
    fecha: '25 A.E.',
    ocurrio: 'Los manuales técnicos pasan a la clandestinidad. Nacen los Anatomistas.',
    codice: '—',
  },
  {
    fecha: '31 A.E.',
    ocurrio: 'La Decana de la página en blanco. Origen de los Ayunantes.',
    codice: '—',
  },
  {
    fecha: '39 A.E.',
    ocurrio: 'El primer Manos de la Sala 7, «el que contó dos veces», es Reformado en su sala.',
    codice: '—',
  },
  {
    fecha: '40 A.E.',
    ocurrio:
      'Primera Cruzada: los Ciervos Velados y los saqueadores de la Ciudad Apagada cercan la Senda. Se funda la Orden de la Cruzada.',
    codice: '—',
  },
  {
    fecha: '47 A.E.',
    ocurrio: 'La Vestal Mechthild añade el Libro III.',
    codice: '«El Día de la Mirada.»',
  },
  { fecha: '55 A.E.', ocurrio: 'Aparece el Rebaño Hueco.', codice: '«El Lugar Vacío.»' },
  {
    fecha: '62 A.E.',
    ocurrio: 'Nace el último Mondador del Atrio. Desde entonces la especie solo cría abajo.',
    codice: 'Margen de la hoja IX del Códice.',
  },
  {
    fecha: '66 A.E.',
    ocurrio:
      'El segundo Manos de la Sala 7, padre del protagonista, se detiene en pleno sacramento y termina Reformado en su sala.',
    codice: 'Leyenda de las Manos del Siete.',
  },
  {
    fecha: '74 A.E.',
    ocurrio: 'Presente: el sacramento de la niña.',
    codice: 'Margen de la hoja IV: «Hoy entró una niña sin número.»',
  },
];
