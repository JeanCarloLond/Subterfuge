/**
 * Lo que el Portal puede publicar de Subterfuge Sigma (#236).
 *
 * Sigma no sustituye al original: el Portal sigue siendo el de la Diócesis y
 * el lore de `src/lore` sigue siendo el del teaser. Este módulo reúne solo el
 * material propio del remake, contado desde dentro y con las reglas de siempre:
 *
 *   - la Diócesis llama «asentamiento» a la compactación y no explica el giro;
 *   - ni la niña ni el papel real del Cirujano se cuentan aquí;
 *   - lo que aún no ha salido en el juego se queda como rumor o como expediente
 *     sellado.
 *
 * Las fuentes son `sigma/docs/canon.md` y `sigma/docs/mapa.md`. Al cambiar el
 * canon, se cambia aquí y las dos páginas del Portal que lo leen —el expediente
 * del asentamiento y los avisos— quedan al día a la vez.
 */

export interface AvisoSigma {
  numero: number;
  titulo: string;
  cuerpo: string;
}

/**
 * Los avisos a los fieles, del más reciente al más antiguo. Los números no se
 * reutilizan: uno retirado deja su hueco, como en la Oficina del Diezmo.
 */
export const AVISOS_SIGMA: readonly AvisoSigma[] = [
  {
    numero: 50,
    titulo: 'Los tres registros de Génesis',
    cuerpo: `
      <p>Para abrir el ala sellada hacen falta los tres registros de Génesis. Uno está en la
      Escribanía, otro en el Archivo, y el tercero no se anuncia.</p>
      <p>Quien encuentre un registro lo entregará sin leerlo. No se copia, no se saca del ala y no
      se comenta en los Pasillos.</p>`,
  },
  {
    numero: 49,
    titulo: 'El metal del diezmo',
    cuerpo: `
      <p>El metal que se injerta en los fieles no se vende ni se hereda. Se administra desde la
      Nave del Libro, y solo el <b>Prior del Diezmo</b> puede tocarlo.</p>
      <p>La herramienta que lo coloca no se expone al público. Si la ve fuera de la Nave, no es
      asunto suyo: cierre los ojos y siga su camino.</p>`,
  },
  {
    numero: 48,
    titulo: 'La Nave del Libro',
    cuerpo: `
      <p>La Nave del Libro tiene un guardián. No recibe visitas ni responde a preguntas. Su oficio
      es el diezmo, y su báculo se apoya en el suelo antes de llamar al orden.</p>
      <p>Los fieles que oigan el golpe del báculo se apartarán de la nave. No es una amenaza: es
      la forma de pedir silencio.</p>`,
  },
  {
    numero: 47,
    titulo: 'Un ejemplo de obediencia',
    cuerpo: `
      <p>En la Escalera de los Ciegos vive una Mano que un día miró. Para volver a la ley, se quitó
      los ojos con sus propias manos. La Diócesis lo propone como ejemplo a todas las Salas.</p>
      <p>No lo visite: no recibe. Y si lo visita, no le pregunte por lo que vio.</p>`,
  },
  {
    numero: 46,
    titulo: 'Ejemplares anotados del Códice',
    cuerpo: `
      <p>Se han encontrado ejemplares del Códice con una anotación a mano en el margen. Siempre la
      misma, siempre con la misma letra:</p>
      <p class="aviso-margen">No vengas.</p>
      <p>Los ejemplares anotados deben entregarse en la Oficina del Diezmo. No intente averiguar a
      quién va dirigida.</p>`,
  },
  {
    numero: 45,
    titulo: 'Sobre lo que se dice en los Pasillos',
    cuerpo: `
      <p>Circula entre los guardias y los Devotos de los Pasillos un nombre: «el Último
      Sacramento». La Diócesis aclara que no existe tal sacramento. El Códice reconoce los
      sacramentos que reconoce, y ninguno es el último.</p>
      <p>Quien repita ese nombre será apartado del turno.</p>`,
  },
  {
    numero: 44,
    titulo: 'Los laboratorios de Génesis Vestal',
    cuerpo: `
      <p>Bajo las Criptas quedan salas de antes del Códice, de cuando la doctrina aún no estaba
      escrita. Se conocen como los laboratorios de Génesis Vestal y permanecen sellados. Nada de
      lo que contienen pertenece a la Diócesis ni a los fieles.</p>
      <ul>
        <li>No se entra.</li>
        <li>No se abre.</li>
        <li>No se mira lo que todavía mira.</li>
      </ul>`,
  },
  {
    numero: 43,
    titulo: 'Recordatorio de la ley de la Mano que mira',
    cuerpo: `
      <p>Las Manos del Sacramento operan con el rostro cubierto y la máscara cerrada. No ven lo
      que cortan, y así debe ser: el sacramento no se mira, se cumple. La ley es antigua y no
      admite excepción: <b>la Mano que mira se corta</b>.</p>
      <p>Se informa de que una Mano ha abandonado su Sala sin turno y desciende por los Pasillos.
      Si la encuentra:</p>
      <ul>
        <li>No le hable.</li>
        <li>No le mire la máscara.</li>
        <li>Cierre los ojos hasta que haya pasado.</li>
      </ul>`,
  },
  {
    numero: 42,
    titulo: 'Sobre el reparto de la carne',
    cuerpo: `
      <p>El reparto de la carne del diezmo a los pabellones se retrasa. No falta carne: falta
      camino. Los Pasillos por los que bajaba están cerrados mientras el templo se asienta.</p>
      <p>Se ruega a las familias que no acudan a la Oficina del Diezmo a reclamar su parte. La
      Oficina no reparte: registra.</p>`,
  },
  {
    numero: 41,
    titulo: 'Sobre el movimiento de los muros',
    cuerpo: `
      <p>Algunos fieles de los pabellones bajos han comunicado que los muros se desplazan. La
      Diócesis confirma que el templo se asienta, como se ha asentado siempre. Los Mil no se
      mueven sin motivo, y su motivo no es asunto del fiel.</p>
      <p>Mientras dure el asentamiento:</p>
      <ul>
        <li>No se apoye en los muros. No los marque. No duerma junto a ellos.</li>
        <li>Si oye el Latido de noche, no cuente los golpes.</li>
        <li>Si un pasillo se cierra, no lo espere: tome otro.</li>
      </ul>`,
  },
];

/** Los avisos, siempre de mayor a menor, aunque alguien los escriba al revés. */
export function avisosOrdenados(): readonly AvisoSigma[] {
  return [...AVISOS_SIGMA].sort((a, b) => b.numero - a.numero);
}

export interface NivelSigma {
  id: string;
  nombre: string;
  /** Qué es, en la voz del Registro. */
  que: string;
  /** Lo que se ve de lejos. */
  hito: string;
  /** Lo que hay que atravesar. */
  peligro: string;
}

/** Las seis capas del corte vertical, de arriba abajo (`sigma/docs/mapa.md`). */
export const NIVELES_SIGMA: readonly NivelSigma[] = [
  {
    id: 'atrio',
    nombre: 'I · El Atrio',
    que: 'La ciudad visible: pabellones, capillas y el Muro de los Dientes. El centro del que se baja.',
    hito: 'La vidriera y el Muro de los Dientes.',
    peligro: 'Alfombra Devota y Remedos.',
  },
  {
    id: 'pasillos',
    nombre: 'II · Pasillos de Preparación',
    que: 'El Registro de Diezmos y la Sala de Sorteos. La administración del turno.',
    hito: 'El Libro de Diezmos, colosal.',
    peligro: 'Guardias y cierres que caen a la espalda.',
  },
  {
    id: 'salas',
    nombre: 'III · Salas de Sacramento',
    que: 'Quirófanos convertidos en altares. Siete salas numeradas y una puerta que se reconoce.',
    hito: 'La puerta de la Sala N.º 7.',
    peligro: 'Remedos entre el instrumental.',
  },
  {
    id: 'criptas',
    nombre: 'IV · Criptas de Espera',
    que: 'Los Elegidos, sedados, esperando turno. Las hileras de durmientes.',
    hito: 'Las hileras de durmientes.',
    peligro: 'Las Mareas del Hambre.',
  },
  {
    id: 'reformados',
    nombre: 'V · Niveles Reformados',
    que: 'Pasillos de hospital vueltos santuario. La arquitectura ya no disimula que es carne.',
    hito: 'El hospital entero, inclinado.',
    peligro: 'Serpiente de Tejido y Zarza.',
  },
  {
    id: 'profundo',
    nombre: 'VI · El Vientre Profundo',
    que: 'El santuario de los Mil, sin forma humana reconocible. No se autorizan visitas.',
    hito: 'El Latido: una pared que late.',
    peligro: 'Oscuridad total y calor.',
  },
];

export interface JuntaSigma {
  id: string;
  /** Las dos capas que se juntan. */
  entre: readonly [string, string];
  /** Cómo lo apunta el Registro al asentarse. */
  nota: string;
}

/**
 * Las juntas entre capas. En Sigma no se abren con llaves: el templo se
 * asienta y dos capas se juntan. Aquí solo se describe el efecto, nunca quién
 * lo provoca (#181 y `sigma/docs/mapa.md`).
 */
export const JUNTAS_SIGMA: readonly JuntaSigma[] = [
  {
    id: 'atrio-pasillos',
    entre: ['atrio', 'pasillos'],
    nota: 'La Escalera de los Ciegos se junta con el umbral de los Pasillos.',
  },
  {
    id: 'pasillos-salas',
    entre: ['pasillos', 'salas'],
    nota: 'El Libro de Diezmos se inclina sobre la puerta de la Sala N.º 7.',
  },
  {
    id: 'salas-criptas',
    entre: ['salas', 'criptas'],
    nota: 'Las camillas de espera entran en el quirófano.',
  },
  {
    id: 'criptas-reformados',
    entre: ['criptas', 'reformados'],
    nota: 'El hospital inclinado se apoya en las Criptas.',
  },
  {
    id: 'reformados-profundo',
    entre: ['reformados', 'profundo'],
    nota: 'La Puerta del Cuerpo queda al descubierto.',
  },
];

/**
 * Agrupa las capas que quedan unidas por las juntas abiertas. Sirve para
 * dibujar el plano y para comprobar que el asentamiento no pierde ninguna
 * capa por el camino.
 */
export function fusionar(juntas: Iterable<string>): readonly (readonly NivelSigma[])[] {
  const abiertas = new Set(juntas);
  const porId = new Map(NIVELES_SIGMA.map((nivel) => [nivel.id, nivel]));
  const grupos: string[][] = NIVELES_SIGMA.map((nivel) => [nivel.id]);

  for (const junta of JUNTAS_SIGMA) {
    if (!abiertas.has(junta.id)) continue;
    const i = grupos.findIndex((grupo) => grupo.includes(junta.entre[0]));
    const j = grupos.findIndex((grupo) => grupo.includes(junta.entre[1]));
    if (i < 0 || j < 0 || i === j) continue;
    const [primero, segundo] = i < j ? [i, j] : [j, i];
    grupos[primero] = [...grupos[primero], ...grupos[segundo]];
    grupos.splice(segundo, 1);
  }

  return grupos.map((ids) =>
    ids.flatMap((id) => {
      const nivel = porId.get(id);
      return nivel ? [nivel] : [];
    }),
  );
}

export interface NombreSigma {
  nombre: string;
  oficio: string;
  estado: 'consta' | 'rumor' | 'sellado';
  nota: string;
}

/**
 * Lo que consta en el Registro del asentamiento. No es la verdad del canon:
 * es lo que la Diócesis escribe de cada nombre, y lo que aún no publica.
 */
export const NOMBRES_SIGMA: readonly NombreSigma[] = [
  {
    nombre: 'El Cegado',
    oficio: 'Mano del Sacramento retirada',
    estado: 'consta',
    nota: 'Miró y, para volver a la ley, se arrancó los ojos. Vive en la Escalera de los Ciegos. No recibe visitas.',
  },
  {
    nombre: 'El Prior del Diezmo',
    oficio: 'Guardián de la Nave del Libro',
    estado: 'consta',
    nota: 'Administra el metal que se injerta. Su báculo avisa antes de llamar al orden.',
  },
  {
    nombre: 'El Primer Ojo',
    oficio: 'Resto de los Mil',
    estado: 'sellado',
    nota: 'Un ojo de los Mil, el primero que llegó a formarse. Está en el laboratorio 7 de Génesis. Quien se lo pone ve lo que los demás no ven; mirar tiene un precio.',
  },
  {
    nombre: 'El Pulmón Vacío',
    oficio: 'Reliquia del Nivel III',
    estado: 'consta',
    nota: 'La reliquia del doble salto, el Impulso cárnico. En la campaña queda para el Nivel III; en el Atrio de demostración sigue disponible.',
  },
  {
    nombre: 'La Injertadora',
    oficio: 'Herramienta del Prior',
    estado: 'rumor',
    nota: 'Coloca el metal del diezmo. No se expone al público.',
  },
  {
    nombre: 'Génesis Vestal',
    oficio: 'Corporación anterior al Códice',
    estado: 'sellado',
    nota: 'Sus manuales se volvieron escritura sagrada. Sus laboratorios siguen cerrados.',
  },
  {
    nombre: 'El Último Sacramento',
    oficio: 'Nombre que se dice en los Pasillos',
    estado: 'rumor',
    nota: 'La Diócesis niega que exista. Quien lo repite es apartado del turno.',
  },
  {
    nombre: 'La Mano que mira',
    oficio: 'Ley de las Manos del Sacramento',
    estado: 'consta',
    nota: 'La Mano que mira se corta. Las Manos operan con la máscara cerrada y no ven lo que cortan.',
  },
];
