/**
 * Fragmentos del Codice de la Carne.
 *
 * BORRADOR DERIVADO DEL WORLD BIBLE (docs/Subterfuge-world-bible.docx). Cada
 * fragmento sigue la estructura que el propio documento describe para el
 * Codice: versiculos de la escritura que los cientificos de Genesis Vestal
 * reescribieron sobre su fracaso, mas una anotacion al margen "hecha por
 * alguien que intento advertir algo". Leidos en orden, los margenes dejan ver
 * la verdad debajo de la doctrina.
 *
 * Es texto de trabajo para que el equipo narrativo lo apruebe, corrija o
 * reescriba. Lo que NO es negociable, venga de quien venga la version final:
 *
 *   - Los Primigenios son ciegos. Nunca miran, ven ni observan. Conocen el
 *     mundo por tacto e ingesta. Dogma: "los dioses no miran, son mirados".
 *   - Fueron mil. La doctrina lo conserva como numero sagrado.
 *   - La nina no fue sorteada: vino sola a pagar una deuda de su casa, y su
 *     tejido "responde". El Codice insinua, no explica.
 *   - Nadie dentro del mundo percibe el sacramento como violencia. El horror
 *     esta en la distancia entre lo que ellos creen y lo que el jugador lee.
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
    cita: 'Codice II, 4',
    titulo: 'De la mirada',
    versiculo: [
      'Los dioses no miran: son mirados.',
      'Quien alce los ojos hacia el Vientre Profundo peca de soberbia,',
      'pues la vista es un don que los Primigenios no quisieron para si.',
      'Baja la mirada. Ofrece las manos.',
    ],
    margen: [
      'No la quisieron. No la tuvieron.',
      'Ninguno de los mil desarrollo tejido optico.',
      'Lo escribimos asi para que nadie preguntara por que.',
    ],
  },
  {
    id: 'codice-02',
    cita: 'Codice III, 1',
    titulo: 'Del diezmo',
    versiculo: [
      'Lo que se ofrece es lo unico que el dios conoce.',
      'Por la carne entregada sabe que existe el mundo;',
      'por el tacto de la ofrenda sabe que existe el fiel.',
      'Quien retiene su diezmo condena a los dioses al vacio.',
    ],
    margen: [
      'Cierto, a su manera. Sin ojos solo conocen lo que tocan',
      'y lo que tragan. Por eso el hambre no termina nunca.',
      'Por eso lo llamamos diezmo y no lo que es.',
    ],
  },
  {
    id: 'codice-03',
    cita: 'Codice I, 1',
    titulo: 'Del origen',
    versiculo: [
      'En el principio fue la promesa: que la muerte tendria fin.',
      'Mil aceptaron la promesa con esperanza verdadera,',
      'y la carne de los mil no murio.',
      'Y los sabios, al ver que la carne no moria, se arrodillaron.',
    ],
    margen: [
      'Genesis Vestal. Mil sujetos de prueba.',
      'La carne no murio porque no pudimos matarla.',
      'No nos arrodillamos: reescribimos el manual.',
    ],
  },
  {
    id: 'codice-04',
    cita: 'Codice IV, 7',
    titulo: 'Del sorteo',
    versiculo: [
      'Cada casa del Atrio inscribira a los suyos en el Registro,',
      'y el Registro sera justo, porque el Registro no elige: sortea.',
      'La deuda de una casa se salda con carne de esa casa.',
      'No hay otra moneda.',
    ],
    margen: [
      'Hoy inscribieron a una nina. No salio sorteada.',
      'Vino sola, a pagar lo que debia su familia.',
      'El Registro la acepto sin sortear nada.',
    ],
  },
  {
    id: 'codice-05',
    cita: 'Codice V, 2',
    titulo: 'De los Elegidos',
    versiculo: [
      'El Elegido que completa el sacramento asciende y ya no vuelve.',
      'El que no lo completa es Reformado, y el Reformado es honrado,',
      'pues llevo la ofrenda a medias y aun asi la llevo.',
    ],
    margen: [
      'Honrado. Los guardamos en los niveles de abajo',
      'para que nadie tenga que verlos.',
      'Un sacramento a medias es una persona a medias.',
      'Mi padre esta alli. O lo que quedo.',
    ],
  },
  {
    id: 'codice-06',
    cita: 'Codice VI, 1',
    titulo: 'De las manos',
    versiculo: [
      'El Cirujano no elige: ejecuta.',
      'Sus manos son del Sacramento y su nombre es su numero.',
      'No mirara al ofrendado. Mirar es preguntar,',
      'y el Sacramento no admite preguntas.',
    ],
    margen: [
      'Hoy mire.',
      'El tejido de la nina respondio como ningun otro.',
      'No la rechazaron: la reconocieron. Tiene lo que a ellos les falta.',
      'Que nadie lea esto antes de tiempo.',
    ],
  },
];

export function fragmentoPorId(id: string): FragmentoCodice | undefined {
  return CODICE.find((fragmento) => fragmento.id === id);
}
