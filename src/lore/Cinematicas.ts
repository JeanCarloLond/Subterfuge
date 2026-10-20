/**
 * El guion de la cinematica del sacramento (issue #147).
 *
 * Es la primera vez que el jugador ve a la nina. Hasta aqui solo se la
 * insinuaba: una linea sin numero en el Registro, una camilla hecha y vacia.
 * Al caer el Reformado, el juego deja de ser juego un minuto y lo cuenta con
 * planos, cortes y el Latido.
 *
 * Esto es lo que se toca para ajustar la cinematica SIN tocar la escena: el
 * orden de los planos, cuanto dura cada uno, que se lee y cuando, y a que ritmo
 * late el Vientre. Lo que hay DENTRO de cada plano (el encuadre, quien esta, que
 * se mueve) vive en `CinematicaScene`, una funcion por plano.
 *
 * Los subtitulos son los pensamientos del Cirujano que antes salian sobre negro
 * en el dialogo `cierre`. No se escribe nada nuevo: se les pone imagen.
 *
 * Dos invariantes que no se negocian aqui:
 *   - Los Primigenios no aparecen, y nadie dice que "miran" salvo la linea ya
 *     aprobada ("Los dioses no miran. Ella si.").
 *   - La nina no es una elegida obvia: su tejido responde, y eso se VE. No se
 *     explica.
 */

export type ClavePlano =
  | 'negro'
  | 'sala'
  | 'camilla'
  | 'ojos'
  | 'tejido'
  | 'mascara'
  | 'mirada'
  | 'contraluz'
  | 'caida'
  | 'bisturi'
  | 'huida'
  | 'vacia';

export interface Plano {
  plano: ClavePlano;
  /** Lo que dura el plano. Los planos aguantan: mejor un segundo de mas. */
  ms: number;
  /** Acto I: el instante (canon aprobado). Acto II: la decision. */
  acto: 1 | 2;
  /** Pensamiento del Cirujano, en la banda de abajo. */
  subtitulo?: string;
  /** Cuando entra el subtitulo, en ms desde el principio del plano. */
  subtituloEn?: number;
  /**
   * El Latido, en golpes por minuto. Un numero lo deja fijo; un par lo acelera
   * (o lo frena) a lo largo del plano. Sin latido, silencio: se nota mas que
   * cualquier sonido.
   */
  latido?: number | readonly [number, number];
}

/**
 * El Acto II cuenta la decision del Cirujano: baja el bisturi, se lleva a la
 * nina y huyen por el desague de la Sala 7 (acta de canon, #126). Esta
 * aprobado. Si alguna vez hiciera falta volver al final abierto del teaser,
 * basta con poner esto a `false`: la cinematica acaba con el bisturi en alto.
 */
export const ACTO_II = true;

const SACRAMENTO: readonly Plano[] = [
  // -- Acto I: el instante -------------------------------------------------
  { plano: 'negro', ms: 2600, acto: 1, latido: 46 },
  { plano: 'sala', ms: 6200, acto: 1, latido: 46 },
  { plano: 'camilla', ms: 4600, acto: 1, latido: 46 },
  {
    plano: 'ojos',
    ms: 5600,
    acto: 1,
    latido: 52,
    subtitulo: 'Está despierta. Nadie entra despierto.',
    subtituloEn: 2300,
  },
  {
    plano: 'tejido',
    ms: 6400,
    acto: 1,
    latido: 58,
    subtitulo: 'Le pongo la mano encima y el tejido responde. No se aparta.',
    subtituloEn: 1100,
  },
  // Sin latido: el Vientre se calla mientras el la mira.
  { plano: 'mascara', ms: 3600, acto: 1 },
  {
    plano: 'mirada',
    ms: 5200,
    acto: 1,
    latido: 50,
    subtitulo: 'Los dioses no miran. Ella sí.',
    subtituloEn: 1400,
  },
  {
    plano: 'contraluz',
    ms: 6400,
    acto: 1,
    latido: [70, 150],
    subtitulo: 'Levanto el bisturí. Y por primera vez me paro a mirarla.',
    subtituloEn: 1700,
  },

  // -- Acto II: la decision -------------------------------------------------
  // A oscuras. La decision se oye: el metal contra la piedra.
  { plano: 'caida', ms: 2800, acto: 2 },
  { plano: 'bisturi', ms: 3800, acto: 2 },
  { plano: 'huida', ms: 10400, acto: 2, latido: 56 },
  // Alguien va a encontrar la Sala vacia.
  { plano: 'vacia', ms: 5600, acto: 2, latido: [80, 170] },
];

/** Los planos que se ven, segun este aprobado o no el Acto II. */
export function guionDelSacramento(): readonly Plano[] {
  return ACTO_II ? SACRAMENTO : SACRAMENTO.filter((plano) => plano.acto === 1);
}

/**
 * La linea que queda sobre el titulo, en el cierre. Sin Acto II no hay huida
 * que anunciar, y el titulo sale solo.
 */
export const GANCHO_FINAL: string | null = ACTO_II
  ? 'Abajo no hay salida. Solo hacia dentro.'
  : null;
