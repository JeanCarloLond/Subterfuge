/**
 * Fragmentos del Codice de la Carne.
 *
 * DERIVADO DEL WORLD BIBLE (docs/Subterfuge-world-bible.docx). El documento
 * describe el Codice como escritura sagrada que los supervivientes de Genesis
 * Vestal reescribieron ENCIMA de sus propios manuales tecnicos: "los protocolos
 * quirurgicos se volvieron liturgia, los manuales tecnicos se volvieron
 * escritura sagrada, las batas se volvieron vestiduras". Mas una anotacion al
 * margen "hecha por alguien que intento advertir algo".
 *
 * De ahi las dos voces, y ninguna suena a salmo:
 *
 *   - EL VERSICULO es un procedimiento con siglos de incienso encima. Manda,
 *     prohibe, pesa y registra: "se cubrira", "se administrara", "no se
 *     admite otra moneda". Habla de instrumentos y de turnos, no de virtudes.
 *   - EL MARGEN es una persona cansada escribiendo a escondidas. Frases
 *     cortas, concretas, que no cierran la idea. No todas son confesiones:
 *     hay correcciones al texto de arriba, cifras apuntadas a mano y cosas
 *     practicas. Es un cuaderno de trabajo, no un testamento.
 *
 * Al escribir aqui, huye de la simetria. Si tres lineas llevan la misma
 * cadencia, sobra una. El mundo no habla en paralelismos.
 *
 * Lo que NO es negociable, venga de quien venga la version final:
 *
 *   - Los Primigenios son ciegos. Nunca miran, ven ni observan. Conocen el
 *     mundo por tacto e ingesta. Dogma: "los dioses no miran, son mirados".
 *     Cuidado con las metaforas de luz y oscuridad: para ellos no significan
 *     nada.
 *   - Fueron mil. La doctrina lo conserva como numero sagrado.
 *   - La nina no fue sorteada: vino sola a pagar una deuda de su casa, y su
 *     tejido "responde". El Codice insinua, no explica.
 *   - Nadie dentro del mundo percibe el sacramento como violencia. El horror
 *     esta en la distancia entre lo que ellos creen y lo que el jugador lee.
 *   - El fragmento V guarda el gancho del jefe ("Mi padre esta alli. O lo que
 *     quedo."): la Sala de Sacramento lo usa.
 *
 * Formato del folio (src/ui/CodiceScene.ts): versiculo de 3 o 4 lineas de
 * hasta 62 caracteres, margen de hasta 4. El texto va en español correcto: una
 * tilde no ocupa un caracter de mas, asi que no mueve el ajuste.
 *
 * CADA LINEA DE `versiculo` SE NUMERA EN EL FOLIO, asi que cada una tiene que
 * sostenerse sola. Partir una frase entre dos lineas mete un numero en mitad
 * de la oracion, y eso solo se ve al abrir el Codice, nunca leyendo el array.
 */

export interface FragmentoCodice {
  id: string;
  /** Referencia liturgica, al estilo capitulo:versiculo. */
  cita: string;
  titulo: string;
  /** El versiculo, tal como lo ensena la Diocesis. */
  versiculo: readonly string[];
  /** La anotacion al margen. Otra mano, otra tinta. */
  margen: readonly string[];
}

export const CODICE: readonly FragmentoCodice[] = [
  {
    id: 'codice-01',
    cita: 'Códice II, 4',
    titulo: 'De la mirada',
    versiculo: [
      'Se cubrirá el rostro antes de la incisión.',
      'Los Mil no tienen ojos: no se les muestra nada.',
      'Se les entrega. Mirar al dios es pedirle cuentas.',
      'Baja la mirada. Ofrece las manos.',
    ],
    margen: [
      'Donde dice "no tienen ojos", el manual decía:',
      'sin tejido óptico en ninguno de los mil.',
      'Lo tachamos. Nadie ha preguntado nunca.',
    ],
  },
  {
    id: 'codice-02',
    cita: 'Códice III, 1',
    titulo: 'Del diezmo',
    versiculo: [
      'Se pesará la ofrenda. Las dos cifras, al Registro.',
      'El dios solo conoce lo que toca, y solo toca esto.',
      'Quien retiene su diezmo le quita el mundo.',
    ],
    margen: [
      'Peso de hoy: once kilos. El mes pasado, veinte.',
      'Llevo la cuenta yo solo. No se la he enseñado.',
      'Tocan más fuerte cuando llega menos.',
    ],
  },
  {
    id: 'codice-03',
    cita: 'Códice I, 1',
    titulo: 'Del origen',
    versiculo: [
      'Se prometió el fin de la muerte. Se cumplió.',
      'Mil aceptaron. Su carne no murió, ni muere.',
      'Aquel día se arrodillaron y empezó el Códice.',
    ],
    margen: [
      'Mil sujetos. Lote único. Genesis Vestal.',
      'La carne no murió porque no supimos matarla.',
      'Nadie se arrodilló. Se acabaron las ideas.',
    ],
  },
  {
    id: 'codice-04',
    cita: 'Códice IV, 7',
    titulo: 'Del sorteo',
    versiculo: [
      'Cada casa inscribirá a los suyos, una vez al año.',
      'El Registro no elige: sortea. Por eso es justo.',
      'La deuda de una casa se salda con su carne.',
      'No se admite otra moneda.',
    ],
    margen: [
      'Hoy entró una niña sin número. No fue sorteada.',
      'Traía la deuda de su casa escrita de su puño.',
      'El Registro la aceptó igual. No pregunté.',
    ],
  },
  {
    id: 'codice-05',
    cita: 'Códice V, 2',
    titulo: 'De los Elegidos',
    versiculo: [
      'El que completa el sacramento asciende y no vuelve.',
      'Al que no lo completa se le llama Reformado.',
      'Se le honra: llevó la ofrenda a medias y la llevó.',
    ],
    margen: [
      'Honrarlos es guardarlos abajo, donde no estorben.',
      'Un sacramento a medias deja media persona.',
      'Mi padre está allí. O lo que quedó.',
    ],
  },
  {
    id: 'codice-06',
    cita: 'Códice VI, 1',
    titulo: 'De las manos',
    versiculo: [
      'Las Manos no eligen: ejecutan.',
      'Su nombre es su número.',
      'No hablarán con el ofrendado ni le verán la cara.',
      'Mirar es preguntar, y aquí no se pregunta.',
    ],
    margen: [
      'Hoy miré.',
      'El tejido no se apartó del filo. Vino a buscarlo.',
      'Ellos no la rechazaron. La reconocieron.',
      'No apunto más. Aquí no.',
    ],
  },
  {
    id: 'codice-07',
    cita: 'Códice V, 9',
    titulo: 'De la espera',
    versiculo: [
      'La dosis se administrará la víspera del turno.',
      'Nadie entra despierto en la Sala.',
      'La carne serena es carne grata.',
      'Las Criptas guardan lo que aún no se ha entregado.',
    ],
    margen: [
      'Dosis doble desde el jueves. La sencilla no cubre.',
      'No es por ellos. Es por la fila de arriba.',
    ],
  },
  {
    id: 'codice-08',
    cita: 'Códice VII, 3',
    titulo: 'Del silencio',
    versiculo: [
      'No preguntarás dónde moran los dioses nuevos.',
      'Los dioses son mil y mil serán.',
      'La cuenta no es del fiel.',
      'Quien cuenta, duda. Quien duda, ofrece.',
    ],
    margen: [
      'Tres generaciones sin un dios nuevo.',
      'Ningún Elegido ha llegado entero. Ninguno.',
      'Lo dejo escrito porque nadie lo dice en voz alta.',
    ],
  },
];

export function fragmentoPorId(id: string): FragmentoCodice | undefined {
  return CODICE.find((fragmento) => fragmento.id === id);
}
