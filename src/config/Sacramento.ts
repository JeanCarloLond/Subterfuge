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
 * Fervor: recurso de devocion.
 *
 * No se regenera solo. Se gana hiriendo y, sobre todo, parando golpes: la
 * devocion se demuestra con el cuerpo, no se acumula esperando.
 */
export const FERVOR = {
  maximo: 100,
  inicial: 0,
  porGolpeAsestado: 6,
  porParry: 20,
} as const;

/** Vitalidad del Cirujano. Pocos puntos, como en Blasphemous: cada golpe pesa. */
export const VITALIDAD = {
  maxima: 6,
  /** Invulnerabilidad tras recibir dano (ms). */
  invulnerabilidadMs: 700,
  /** Retroceso al ser herido (px/s). */
  retrocesoX: 140,
  retrocesoY: 180,
} as const;

/** Combate cuerpo a cuerpo. */
export const COMBATE = {
  ataque: {
    dano: 2,
    /** Ventana en la que la hitbox hace dano (ms). */
    duracionMs: 110,
    /** Retardo desde la pulsacion hasta que la hitbox se activa (ms). */
    anticipacionMs: 60,
    enfriamientoMs: 300,
    alcance: 22,
    alto: 20,
  },
  cargado: {
    dano: 6,
    /** Tiempo manteniendo el boton hasta que el golpe queda cargado (ms). */
    tiempoCargaMs: 450,
    costeFervor: 30,
    duracionMs: 150,
    anticipacionMs: 110,
    enfriamientoMs: 520,
    alcance: 30,
    alto: 24,
  },
  parry: {
    /** Ventana activa. Corta a proposito: es una lectura, no un escudo. */
    ventanaMs: 140,
    enfriamientoMs: 480,
    /** Aturdimiento infligido al enemigo parado (ms). */
    aturdimientoMs: 900,
  },
} as const;

/** Pocion de Carne: cura consumible. Se repone al rezar en un Altar. */
export const POCION = {
  cargasMaximas: 3,
  curacion: 3,
  /** Duracion del trago. El Cirujano queda quieto y vulnerable. */
  duracionMs: 600,
} as const;

/**
 * Devoto: fiel de la Diocesis, primer enemigo del Atrio.
 * No es un monstruo: es un engranaje mas del sistema. Por eso es humano.
 */
export const DEVOTO = {
  vida: 8,
  dano: 1,
  velocidadPatrulla: 40,
  velocidadPersecucion: 80,
  /** Radio en el que detecta al Cirujano (px). */
  rangoDeteccion: 130,
  /** Distancia a la que se detiene y ataca (px). */
  rangoAtaque: 26,
  /** Telegrafia del golpe: el jugador debe poder leerlo para hacer parry. */
  anticipacionAtaqueMs: 420,
  duracionAtaqueMs: 120,
  enfriamientoAtaqueMs: 1100,
  /** Retroceso al ser herido (px/s). */
  retroceso: 120,
  /** Tiempo que sigue buscando tras perder de vista al Cirujano (ms). */
  memoriaMs: 2000,
} as const;
