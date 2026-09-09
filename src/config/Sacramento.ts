/**
 * Constantes de diseno del teaser.
 *
 * Los nombres siguen el lexico de "La Diocesis de la Carne": el jugador no
 * tiene "stamina" ni "mana", tiene Fervor. No renombrar a terminos genericos.
 */

/** Resolucion interna. El Vientre es vertical: alto > ancho a proposito. */
export const RESOLUCION = { ancho: 480, alto: 320 } as const;

/** Escala de pixel art. El arte se produce a 1x y se escala en el canvas. */
export const ESCALA_PIXEL = 3;

/** Cinematica del Cirujano-Sacerdote. Valores en px/s y px/s^2. */
export const MOVIMIENTO = {
  velocidadCaminar: 130,
  aceleracionSuelo: 1400,
  aceleracionAire: 700,
  friccionSuelo: 1600,
  friccionAire: 300,

  gravedad: 1100,
  velocidadCaidaMax: 620,

  impulsoSalto: 360,
  /** Segundo salto: mas debil. El Cirujano no es un acrobata, es un tecnico. */
  impulsoDobleSalto: 300,

  /** Margen tras abandonar el suelo en el que el salto aun se acepta (ms). */
  coyoteMs: 90,
  /** Margen previo al aterrizaje en el que el salto queda encolado (ms). */
  bufferSaltoMs: 120,
  /** Corte de altura al soltar el boton: salto variable. */
  factorCorteSalto: 0.45,
} as const;

/** Dash con invulnerabilidad breve (i-frames). */
export const DASH = {
  velocidad: 340,
  duracionMs: 160,
  /** Ventana de invulnerabilidad. Arranca con el dash, termina antes que el. */
  invulnerabilidadMs: 130,
  enfriamientoMs: 420,
  /** Dashes disponibles en el aire antes de tocar suelo. */
  usosEnAire: 1,
} as const;

/** Agarre de bordes: el Cirujano se cuelga con las manos, su unico oficio. */
export const AGARRE = {
  /** Alcance horizontal de deteccion de pared (px). */
  alcancePared: 6,
  /** Altura de la "boca" del borde donde el agarre engancha (px). */
  ventanaBorde: 12,
  /** Deslizamiento mientras esta colgado (px/s). 0 = queda fijo. */
  deslizamiento: 0,
  /** Bloqueo tras soltarse para no re-enganchar al instante (ms). */
  bloqueoTrasSoltarMs: 220,
  impulsoTrepar: 300,
} as const;

/**
 * Fervor: recurso de devocion. En Fase 1 solo existe como contador; el gasto
 * real (ataque cargado, parry) llega en Fase 2 junto con el combate.
 */
export const FERVOR = { maximo: 100, inicial: 0 } as const;
