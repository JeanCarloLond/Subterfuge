/**
 * Constantes de diseno del teaser.
 *
 * Los nombres siguen el lexico de "La Diocesis de la Carne": el jugador no
 * tiene "stamina" ni "mana", tiene Fervor. No renombrar a terminos genericos.
 */

/**
 * Resolucion interna del lienzo. Todo el arte se produce a 1x contra estas
 * medidas; del escalado a la ventana se encarga Phaser (Scale.FIT), asi que no
 * hay ninguna constante de zoom que mantener sincronizada.
 */
export const RESOLUCION = { ancho: 480, alto: 320 } as const;

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

/**
 * La caida del Cirujano.
 *
 * Los cuatro tiempos van ENCADENADOS y en este orden, que es lo que hace que
 * se entienda: primero el cuerpo se desploma a la vista, despues el Vientre se
 * apaga a su alrededor, y el aviso se queda un momento sobre el negro antes de
 * devolver el control.
 *
 * Si tocas uno, revisa los de al lado:
 *
 *   - `retardoFundidoMs` debe ser MAYOR que `desplomeMs`, o la pantalla se
 *     pone negra antes de que se vea caer el cuerpo.
 *   - `retardoFundidoMs + fundidoMs` debe ser MENOR que `reaparecerMs`, o no
 *     queda ningun instante de negro con el aviso todavia en pantalla.
 */
export const CAIDA = {
  /** Lo que tarda el cuerpo en doblarse hasta quedar hecho un monton. */
  desplomeMs: 900,
  /** Entrada del aviso. Lenta: llega detras del destello, no encima. */
  avisoEntradaMs: 700,
  /** Espera antes de empezar a apagar la zona. */
  retardoFundidoMs: 950,
  /** Lo que tarda el Vientre en apagarse del todo. */
  fundidoMs: 850,
  /** Del ultimo golpe a estar otra vez en pie en el Altar. */
  reaparecerMs: 2200,
} as const;

/**
 * Combate cuerpo a cuerpo.
 *
 * Sobre el alcance: el golpe llega a `alcance + 4` px del centro del Cirujano.
 * Tiene que superar el rango al que los enemigos disparan sus ataques, o no
 * existe ninguna distancia desde la que golpear sin comerse el suyo. Con 34
 * el golpe toca el cuerpo del Reformado (10 px de semiancho) hasta a 48 px de
 * su centro, y el zarpazo del jefe salta a 36: quedan 12 px de banda segura.
 * Si tocas esto, revisa REFORMADO.zarpazo y DEVOTO.rangoAtaque.
 */
export const COMBATE = {
  ataque: {
    dano: 2,
    /** Ventana en la que la hitbox hace dano (ms). */
    duracionMs: 110,
    /** Retardo desde la pulsacion hasta que la hitbox se activa (ms). */
    anticipacionMs: 60,
    enfriamientoMs: 300,
    alcance: 34,
    alto: 22,
  },
  cargado: {
    dano: 6,
    /** Tiempo manteniendo el boton hasta que el golpe queda cargado (ms). */
    tiempoCargaMs: 450,
    costeFervor: 30,
    duracionMs: 150,
    anticipacionMs: 110,
    enfriamientoMs: 520,
    alcance: 42,
    alto: 26,
  },
  /**
   * Golpe hacia abajo en el aire. Al conectar, el Cirujano REBOTA: sale
   * despedido hacia arriba y recupera el doble salto y el dash. Es lo que
   * permite encadenar golpes desde el aire sin tocar el suelo, y castigar a un
   * enemigo desde arriba sin pagar el contacto.
   */
  rebote: {
    impulso: 400,
    /** El enfriamiento tras un rebote es corto: los pogos se encadenan. */
    enfriamientoMs: 90,
  },
  parry: {
    /** Ventana activa. Corta a proposito: es una lectura, no un escudo. */
    ventanaMs: 140,
    enfriamientoMs: 480,
    /** Aturdimiento infligido al enemigo parado (ms). */
    aturdimientoMs: 900,
  },
} as const;

/**
 * Dano por caida, proporcional a la altura.
 *
 * Se mide desde el punto MAS ALTO de la trayectoria hasta el suelo, no desde
 * donde se salto: tirarse desde una repisa cuenta entero. El umbral esta por
 * encima del doble salto (157 px) y de cualquier escalon de la ruta de vuelta
 * (80 px), asi que moverse con normalidad nunca duele; saltarse la escalera de
 * los Pasillos (184 px) cuesta un punto, y bajar dos corredores de golpe
 * (360 px), dos. Es una decision, no una trampa.
 */
export const DANO_POR_CAIDA = {
  /** Caidas hasta aqui no cuestan nada (px). */
  sinDanoHasta: 160,
  /** Un punto de vitalidad por cada tramo de esta altura por encima del umbral. */
  pxPorPunto: 120,
  danoMaximo: 3,
  /** El Cirujano queda clavado un instante tras un golpe contra el suelo (ms). */
  aturdimientoMs: 320,
} as const;

/**
 * Dano por contacto: rozar el cuerpo de un enemigo hiere.
 *
 * Sin esto se podia atravesar a los Devotos sin consecuencia, porque su unica
 * hitbox esta DELANTE de ellos. El contacto no se puede parar con el parry (no
 * es un golpe), pero si atravesar con los i-frames del dash: pasar a traves de
 * un enemigo es una habilidad, no algo gratis.
 */
export const CONTACTO = {
  dano: 1,
  /** Empujon al rozar, para separar los cuerpos y que no se encadene el dano. */
  retrocesoX: 160,
  retrocesoY: 140,
} as const;

/**
 * Ofrendas: lo que deja un enemigo al caer. La recompensa por pelear.
 *
 * La carne cura poco (1) y el sello da Fervor (20): suficiente para que
 * enfrentarse a un Devoto compense frente a rodearlo, sin que matar enemigos
 * sustituya a los Altares como forma de curarse.
 */
export const OFRENDA = {
  curacionCarne: 1,
  fervorSello: 20,
  /** Probabilidades por clase. Lo que no suma 1 es "no suelta nada". */
  devotoCarne: 0.45,
  devotoSello: 0.35,
  vestalCarne: 0.25,
  /** Cuanto dura en el suelo antes de desvanecerse (ms), y cuanto parpadea antes. */
  vidaMs: 11000,
  parpadeoMs: 2400,
} as const;

/**
 * Reliquias: mejoras permanentes escondidas por el Vientre.
 * Son el incentivo de explorar: una ruta opcional siempre guarda algo.
 */
export const RELIQUIA = {
  /** Puntos de vitalidad maxima que anade un Relicario de Carne. */
  vitalidadExtra: 1,
  /** Cargas de Pocion que anade un Frasco Consagrado. */
  pocionExtra: 1,
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

  /**
   * Zarpazo cercano, la unica opcion si el Cirujano se le pega. Se dispara a
   * `alcance + margenDisparo` px: ese margen es lo que deja al Cirujano una
   * distancia desde la que golpear sin activarlo (ver COMBATE).
   */
  zarpazo: {
    anticipacionMs: 380,
    duracionMs: 140,
    alcance: 34,
    margenDisparo: 2,
    enfriamientoMs: 1000,
  },

  /** Cada fase acelera lo anterior: mismo repertorio, menos margen. */
  factorVelocidadFase2: 0.85,
  factorVelocidadFase3: 0.7,

  /**
   * Eleccion de maniobra a distancia, por fase: [embestida, salto, doble].
   * En fase 1 es determinista para que se aprenda; despues deja de serlo para
   * que no se pueda esperar siempre lo mismo en el mismo sitio.
   */
  pesosFase1: [1, 0, 0],
  pesosFase2: [0.6, 0.4, 0],
  pesosFase3: [0.4, 0.35, 0.25],

  /** Embestida doble: vuelve sobre sus pasos con la mitad de aviso. */
  doble: { factorAnticipacionVuelta: 0.5 },

  /**
   * Escombros: al aterrizar de un salto (fase 2+), caen piedras del techo
   * sobre posiciones marcadas. Es la amenaza vertical que le faltaba a una
   * arena plana: obliga a moverse tambien cuando el jefe esta lejos.
   */
  escombros: {
    /** Piedras por aterrizaje, por fase (indice = fase - 1). */
    cantidadPorFase: [0, 2, 3],
    /** Aviso en el suelo antes de la caida (ms). */
    avisoMs: 560,
    dano: 1,
    /** Separacion entre puntos de caida alrededor del Cirujano (px). */
    separacion: 46,
  },

  /** Pausa vulnerable tras fallar una embestida. La ventana de castigo. */
  aturdimientoTrasFalloMs: 1100,
} as const;
