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

  gravedad: 1000,
  velocidadCaidaMax: 620,

  /** Altura resultante ~92 px (5.7 tiles). Formula: impulso^2 / (2 * gravedad). */
  impulsoSalto: 430,
  /** Segundo salto: mas debil. El Cirujano no es un acrobata, es un tecnico. */
  impulsoDobleSalto: 360,

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

/**
 * Sensacion de impacto. El "hitstop" es la pausa brevisima al conectar un golpe:
 * es lo que hace que un impacto se sienta solido en vez de blando. Subirlo mucho
 * vuelve el combate pastoso; bajarlo lo vuelve intangible.
 */
export const IMPACTO = {
  hitstopGolpeMs: 55,
  hitstopCargadoMs: 90,
  hitstopParryMs: 130,
  hitstopMuerteMs: 110,

  sacudidaGolpe: 0.005,
  sacudidaCargado: 0.01,
  sacudidaRecibir: 0.008,
  sacudidaMuerte: 0.014,

  /** Duracion del destello de tinte sobre el objetivo herido (ms). */
  destelloMs: 90,
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

/**
 * Vestal: clero de la Diocesis, un escalon por encima del Devoto.
 *
 * No se ensucia las manos: mantiene la distancia y lanza sellos del diezmo. Es
 * fragil de cerca, asi que el jugador tiene que decidir entre cerrar la
 * distancia o devolverle sus propios sellos con el parry.
 */
export const VESTAL = {
  vida: 5,
  velocidad: 55,
  rangoDeteccion: 210,
  /** Distancia que intenta mantener con el Cirujano (px). */
  rangoPreferido: 115,
  /** Si el Cirujano entra aqui, retrocede en vez de atacar. */
  rangoHuida: 72,
  /** Telegrafia del lanzamiento. Mas larga que la del Devoto: se ve venir. */
  anticipacionMs: 520,
  enfriamientoMs: 1500,
  retroceso: 90,
  memoriaMs: 2400,
} as const;

/** Sello del diezmo: el proyectil del Vestal. */
export const PROYECTIL = {
  velocidad: 165,
  dano: 1,
  /** Se disuelve solo si no acierta, para no dejar basura volando. */
  vidaMs: 3200,
  /** Al ser parado, sale rebotado mas rapido y hiere a quien lo lanzo. */
  velocidadDevuelto: 260,
  danoDevuelto: 3,
} as const;

/**
 * El Reformado: jefe del teaser.
 *
 * Un Elegido que sobrevivio a medias al sacramento. No es un demonio: es el
 * resultado de lo que el propio Cirujano hace cada dia, y por eso el encuentro
 * es lo que cierra el teaser.
 *
 * Todas sus fases telegrafian largo. Un jefe de este juego se aprende leyendo,
 * no memorizando.
 */
export const REFORMADO = {
  vida: 30,
  dano: 2,

  /** Umbrales de vida en los que cambia de fase. */
  vidaFase2: 20,
  vidaFase3: 10,

  /** Embestida: se planta, se tensa y cruza la sala. */
  embestida: {
    anticipacionMs: 620,
    velocidad: 210,
    duracionMs: 620,
    enfriamientoMs: 1500,
  },

  /** Salto con onda al aterrizar. Entra en fase 2. */
  salto: {
    anticipacionMs: 540,
    impulso: 420,
    /** Alcance de la onda de impacto al tocar suelo (px). */
    alcanceOnda: 90,
    enfriamientoMs: 1900,
  },

  /** Zarpazo cercano, la unica opcion si el Cirujano se le pega. */
  zarpazo: {
    anticipacionMs: 380,
    duracionMs: 140,
    alcance: 34,
    enfriamientoMs: 1000,
  },

  /** Cada fase acelera lo anterior: mismo repertorio, menos margen. */
  factorVelocidadFase2: 0.85,
  factorVelocidadFase3: 0.7,

  /** Pausa vulnerable tras fallar una embestida. La ventana de castigo. */
  aturdimientoTrasFalloMs: 1100,
} as const;
