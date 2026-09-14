import Phaser from 'phaser';
import { CirujanoSacerdote } from '../entities/CirujanoSacerdote';
import { Devoto } from '../entities/Devoto';
import { enemigoDe } from '../entities/Enemigo';
import { Reformado } from '../entities/Reformado';
import { Sello } from '../entities/Sello';
import { Vestal } from '../entities/Vestal';
import { Controles } from '../input/Controles';
import { Altar } from '../objetos/Altar';
import { FragmentoCodice } from '../objetos/FragmentoCodice';
import { Ofrenda } from '../objetos/Ofrenda';
import { Reliquia } from '../objetos/Reliquia';
import { CAIDA, DEVOTO, OFRENDA, REFORMADO, RESOLUCION } from '../config/Sacramento';
import { Impacto } from '../systems/Impacto';
import { progreso, type TipoReliquia } from '../systems/Progreso';
import { musica, type Pista } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { EVENTOS_HUD } from '../ui/HudScene';
import { CONTROLES_COMBATE, CONTROLES_MOVIMIENTO } from '../ui/TextoControles';

/** Plataforma: [x, y, anchoEnTiles]. y crece hacia abajo. */
export type Plataforma = readonly [x: number, y: number, anchoTiles: number];

/** Columna de pared para el agarre de bordes: [x, yInicio, yFin]. */
export type Pared = readonly [x: number, yInicio: number, yFin: number];

export interface RondaDevoto {
  x: number;
  y: number;
  izquierda: number;
  derecha: number;
}

/** Pieza de escenografia sin colision: [x, y, tipo]. y es la base. */
export type Decorado = readonly [x: number, y: number, tipo: TipoDecorado];
export type TipoDecorado =
  'columna' | 'vela' | 'exvoto' | 'charco' | 'camilla' | 'durmiente' | 'reja';

/** Placa del Registro: [x, y, texto]. Se lee con E, en una linea. */
export type Inscripcion = readonly [x: number, y: number, texto: string];

/** Reliquia escondida: [x, y, id, tipo]. */
export type ReliquiaDef = readonly [x: number, y: number, id: string, tipo: TipoReliquia];

/** Umbral de paso a la siguiente zona del descenso. */
export interface Umbral {
  x: number;
  y: number;
  /** Clave de la escena destino. */
  destino: string;
  etiqueta: string;
}

/** Todo lo que distingue a un nivel de otro. La logica es comun. */
export interface DefinicionNivel {
  mundo: { ancho: number; alto: number };
  colorFondo: string;
  inicio: { x: number; y: number };
  plataformas: readonly Plataforma[];
  paredes: readonly Pared[];
  devotos: readonly RondaDevoto[];
  /** Vestales: opcional, no toda zona tiene clero. */
  vestales?: readonly RondaDevoto[];
  /**
   * Jefe de la zona. Duerme hasta que el Cirujano se acerca, y mientras siga
   * vivo el umbral de salida permanece cerrado.
   */
  jefe?: RondaDevoto;
  altares: ReadonlyArray<{ x: number; y: number }>;
  fragmentos: ReadonlyArray<readonly [number, number, string]>;
  /** Mejoras permanentes en rutas opcionales. El motivo de explorar. */
  reliquias?: readonly ReliquiaDef[];
  /** Escenografia. Da puntos de referencia a la zona; no colisiona. */
  decorado?: readonly Decorado[];
  /** Placas del Registro: lore de una linea, sin abrir nada. */
  inscripciones?: readonly Inscripcion[];
  umbral?: Umbral;
  /**
   * y por debajo de la cual se considera que el Cirujano cayo al vacio.
   * Sin esto, caerse fuera de las plataformas deja al jugador atrapado contra
   * el limite inferior del mundo, sin forma de volver a subir.
   */
  limiteCaida?: number;
  /** Ayuda de controles. Solo el primer nivel la necesita. */
  mostrarAyuda?: boolean;
  /** Pista de fondo de la zona. Ver Musica.ts. */
  musica?: Pista;
  /**
   * Tinte de la silleria de la zona. La misma piedra baja de tono a medida que
   * el Vientre se cierra: es la regla del descenso aplicada al arte, sin pedir
   * un tileset distinto por nivel.
   */
  tinte?: number;
  /**
   * Cuanta ruina se siembra sobre la piedra, en proporcion de tiles (0 a 1).
   *
   * Va suelto y no dentro del tile a proposito: una grieta horneada en el
   * patron reaparece cada 16 px y la pared se lee como papel pintado.
   */
  desgaste?: { grietas: number; musgo: number };
}

/** Lado del tile. */
const T = 16;

/** Desgaste por defecto: algo de ruina, nada de vegetacion. */
const DESGASTE_POR_DEFECTO = { grietas: 0.06, musgo: 0 } as const;

/** Separacion minima entre dos calcomanias, para que no se apelotonen (px). */
const SEPARACION_DESGASTE = 44;

/**
 * Ruido entero reproducible a partir de una posicion.
 *
 * El desgaste NO puede ser aleatorio en cada partida: el jugador se orienta por
 * la pared agrietada y la mancha de musgo igual que por las columnas, y si
 * cambian al morir pierde sus puntos de referencia. Con esto, la misma piedra
 * sale siempre igual sin tener que guardar nada.
 */
function ruido(x: number, y: number, sal: number): number {
  let n = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(sal, 83492791);
  n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
  n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
  return (n ^ (n >>> 15)) >>> 0;
}

/** El mismo ruido, normalizado a 0..1. */
function azarFijo(x: number, y: number, sal: number): number {
  return ruido(x, y, sal) / 0x100000000;
}

/** Radio en el que un Altar ofrece la interaccion de rezar (px). */
const RADIO_ALTAR = 26;

/** Radio en el que un Umbral ofrece el descenso (px). */
const RADIO_UMBRAL = 24;

/** Radio en el que una placa ofrece leerse (px). */
const RADIO_PLACA = 22;

/**
 * Logica comun a todos los niveles del descenso.
 *
 * Cada zona del Vientre (Atrio, Pasillos de Preparacion, Salas de Sacramento...)
 * hereda de aqui y solo aporta su `definirNivel()`. Asi anadir una zona nueva es
 * describir su contenido, no reimplementar el combate.
 *
 * Mientras no haya tilesets, la geometria se describe con plataformas y paredes.
 * Cuando lleguen, `construirGeometria()` es el unico punto a sustituir por la
 * carga de un tilemap de Tiled.
 */
export abstract class EscenaNivel extends Phaser.Scene {
  protected cirujano!: CirujanoSacerdote;
  protected controles!: Controles;
  protected impacto!: Impacto;
  protected suelos!: Phaser.Physics.Arcade.StaticGroup;

  private definicion!: DefinicionNivel;
  private devotos: Devoto[] = [];
  private vestales: Vestal[] = [];
  private sellos: Sello[] = [];
  private jefe?: Reformado;
  private jefeDerrotado = false;
  private altares: Altar[] = [];
  private fragmentos: FragmentoCodice[] = [];
  private reliquias: Reliquia[] = [];
  private ofrendas: Ofrenda[] = [];
  private placas: {
    sprite: Phaser.GameObjects.Sprite;
    texto: string;
    aviso: Phaser.GameObjects.Text;
  }[] = [];
  private grupoEnemigos?: Phaser.Physics.Arcade.Group;
  /** Esquina superior izquierda de cada tile de piedra, como "x,y". */
  private tilesSolidos = new Set<string>();

  private altarActivo: Altar | null = null;
  private reapareciendo = false;
  private descendiendo = false;
  /** La pista de la Pocion se da una vez por zona, no cada vez que baja la vida. */
  private pistaPocionDada = false;

  private umbralSprite?: Phaser.GameObjects.Sprite;
  private umbralAviso?: Phaser.GameObjects.Text;
  private fondoLejano?: Phaser.GameObjects.TileSprite;
  private fondoCercano?: Phaser.GameObjects.TileSprite;
  private panelAyuda?: Phaser.GameObjects.Container;

  /** Cada zona describe aqui su contenido. */
  protected abstract definirNivel(): DefinicionNivel;

  create(): void {
    this.reiniciarEstado();

    this.definicion = this.definirNivel();
    const { mundo, colorFondo, inicio } = this.definicion;

    this.physics.world.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBackgroundColor(colorFondo);

    this.crearFondo();
    this.crearDecorado();
    this.suelos = this.construirGeometria();
    this.sembrarDesgaste();
    this.controles = new Controles(this);
    this.impacto = new Impacto(this);

    this.crearCirujano(inicio.x, inicio.y);
    this.poblarNivel();

    this.cameras.main.startFollow(this.cirujano.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
    this.cameras.main.fadeIn(360, 11, 9, 11);

    // La banda sonora de la zona entra con fundido sobre la anterior.
    if (this.definicion.musica) musica.poner(this.definicion.musica);

    if (!this.scene.isActive('Hud')) this.scene.launch('Hud');
    this.emitirEstadoInicial();

    this.crearAyudaControles(this.definicion.mostrarAyuda === true);
  }

  update(): void {
    // Antes de que nadie lea la entrada: fija el estado del raton del fotograma.
    this.controles.actualizar();

    if (this.controles.pausaPresionada) this.pausar();
    if (this.controles.ayudaPresionada) this.alternarAyuda();
    if (this.controles.codicePresionado) this.abrirCodice();

    this.cirujano.actualizar();

    for (const devoto of this.devotos) {
      devoto.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    for (const vestal of this.vestales) {
      vestal.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    this.actualizarJefe();

    if (this.controles.silencioPresionado) {
      const silenciado = sonido.alternarSilencio();
      this.game.events.emit(EVENTOS_HUD.aviso, silenciado ? 'sin sonido' : 'con sonido');
    }

    this.actualizarParallax();
    this.actualizarAltares();
    this.actualizarUmbral();
    this.actualizarPlacas();
    this.comprobarCaidaAlVacio();
    this.limpiarDevotosMuertos();
  }

  /**
   * Red de seguridad: caer fuera de las plataformas devuelve al ultimo Altar
   * en vez de dejar al jugador tirado contra el borde del mundo.
   *
   * Cuesta un punto de vitalidad para que la caida tenga consecuencia, pero no
   * es una muerte: quedarse encallado nunca debe ser la respuesta del juego.
   */
  private comprobarCaidaAlVacio(): void {
    const limite = this.definicion.limiteCaida;
    if (limite === undefined || this.reapareciendo) return;
    if (this.cirujano.estaMuerto || this.cirujano.sprite.y < limite) return;

    const destino = this.altarActivo?.puntoReaparicion ?? this.definicion.inicio;

    this.cirujano.recibirCaida(1, destino.x, destino.y);
    this.cameras.main.flash(200, 11, 9, 11);
    this.game.events.emit(EVENTOS_HUD.aviso, 'el Vientre te devuelve');
  }

  private reiniciarEstado(): void {
    this.devotos = [];
    this.vestales = [];
    this.sellos = [];
    this.jefe = undefined;
    this.jefeDerrotado = false;
    this.altares = [];
    this.fragmentos = [];
    this.reliquias = [];
    this.ofrendas = [];
    this.placas = [];
    this.grupoEnemigos = undefined;
    this.tilesSolidos = new Set();
    this.altarActivo = null;
    this.reapareciendo = false;
    this.descendiendo = false;
    this.pistaPocionDada = false;
    this.umbralSprite = undefined;
    this.umbralAviso = undefined;
    this.fondoLejano = undefined;
    this.fondoCercano = undefined;
    this.panelAyuda = undefined;
  }

  // -- Construccion --------------------------------------------------------

  /**
   * Telon de arcadas con parallax.
   *
   * Dos capas a distinta velocidad: la lejana casi no se mueve, la cercana
   * acompaña. Es lo que convierte un plano de plataformas en un sitio con
   * profundidad, y ademas recuerda que el Vientre es una catedral, no cuevas.
   */
  private crearFondo(): void {
    // El telon va fijo a la camara (scrollFactor 0), asi que se dimensiona con
    // el lienzo, no con el tamaño del mundo.
    const ancho = this.scale.width;
    const alto = this.scale.height;

    const lejano = this.add.tileSprite(0, 0, ancho, alto, 'fondo-arcos');
    lejano.setOrigin(0, 0);
    lejano.setScrollFactor(0);
    // setTileScale agranda el PATRON dentro del telon. Con setScale se agrandaba
    // el telon entero y su borde quedaba a la vista sobre el fondo.
    lejano.setTileScale(2);
    lejano.setAlpha(0.5);
    lejano.setDepth(-20);
    this.fondoLejano = lejano;

    const cercano = this.add.tileSprite(0, 0, ancho, alto, 'fondo-arcos');
    cercano.setOrigin(0, 0);
    cercano.setScrollFactor(0);
    cercano.setAlpha(0.75);
    cercano.setDepth(-10);
    this.fondoCercano = cercano;
  }

  /** Desplaza las capas segun la camara, no segun el reloj. */
  private actualizarParallax(): void {
    const camara = this.cameras.main;

    if (this.fondoLejano) {
      this.fondoLejano.tilePositionX = camara.scrollX * 0.08;
      this.fondoLejano.tilePositionY = camara.scrollY * 0.05;
    }

    if (this.fondoCercano) {
      this.fondoCercano.tilePositionX = camara.scrollX * 0.25;
      this.fondoCercano.tilePositionY = camara.scrollY * 0.18;
    }
  }

  /**
   * Escenografia. Va entre el telon de fondo y las plataformas, y algunas
   * piezas tienen vida propia (la llama de la vela, el vaiven del exvoto) para
   * que la zona no parezca una foto.
   */
  private crearDecorado(): void {
    for (const [x, y, tipo] of this.definicion.decorado ?? []) {
      const pieza = this.add.sprite(x, y, `${tipo}-placeholder`);
      pieza.setOrigin(0.5, tipo === 'exvoto' ? 0 : 1);
      pieza.setDepth(-5);

      if (tipo === 'vela') {
        this.tweens.add({
          targets: pieza,
          alpha: { from: 0.75, to: 1 },
          duration: Phaser.Math.Between(260, 420),
          yoyo: true,
          repeat: -1,
        });
      } else if (tipo === 'exvoto') {
        this.tweens.add({
          targets: pieza,
          angle: { from: -3, to: 3 },
          duration: Phaser.Math.Between(1800, 2600),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      } else if (tipo === 'columna') {
        pieza.setAlpha(0.85);
        // Esta tallada en la misma piedra que el muro, asi que se apaga con
        // ella al bajar de zona. Las velas y la sangre no: esas son suyas.
        if (this.definicion.tinte !== undefined) pieza.setTint(this.definicion.tinte);
      } else if (tipo === 'reja') {
        pieza.setAlpha(0.9);
      }
    }
  }

  /**
   * Silleria del nivel.
   *
   * Un tile del tileset es UN ladrillo de ancho por DOS hiladas de alto, asi
   * que la piedra encaja con la rejilla sin que ningun ladrillo quede cortado
   * en los bordes de plataforma. La variante se elige por posicion, no al azar:
   * rompe la repeticion y ademas sale igual en cada partida.
   */
  private construirGeometria(): Phaser.Physics.Arcade.StaticGroup {
    const suelos = this.physics.add.staticGroup();
    const variantes = this.textures.get('piedra').getFrameNames().length;
    const tinte = this.definicion.tinte;

    const poner = (x: number, y: number) => {
      const pieza = suelos
        .create(x, y, 'piedra', ruido(x, y, 1) % variantes)
        .setOrigin(0, 0)
        .refreshBody();
      if (tinte !== undefined) pieza.setTint(tinte);
      this.tilesSolidos.add(`${x},${y}`);
    };

    for (const [x, y, anchoTiles] of this.definicion.plataformas) {
      for (let i = 0; i < anchoTiles; i += 1) poner(x + i * T, y);
    }

    for (const [x, yInicio, yFin] of this.definicion.paredes) {
      for (let y = yInicio; y < yFin; y += T) poner(x, y);
    }

    return suelos;
  }

  /**
   * Ruina sobre la piedra ya colocada: grietas y musgo.
   *
   * Las dos se comportan al reves y por un motivo. La grieta esta DENTRO del
   * muro, asi que nunca puede sobresalir al vacio; el musgo crece hacia fuera y
   * se planta a caballo del canto, colgando por el borde, que es como lo dibujo
   * la artista en su lamina de referencia.
   */
  private sembrarDesgaste(): void {
    const { grietas, musgo } = this.definicion.desgaste ?? DESGASTE_POR_DEFECTO;
    const tinte = this.definicion.tinte;
    const puestas: { x: number; y: number }[] = [];

    const lejosDeOtras = (x: number, y: number) =>
      puestas.every(
        (p) => Math.abs(p.x - x) >= SEPARACION_DESGASTE || Math.abs(p.y - y) >= SEPARACION_DESGASTE,
      );

    const marcar = (clave: string, densidad: number, sal: number, arriba: boolean) => {
      if (densidad <= 0) return;

      const total = this.textures.get(clave).getFrameNames().length;
      for (const casilla of this.tilesSolidos) {
        const [x, y] = casilla.split(',').map(Number);
        if (azarFijo(x, y, sal) >= densidad) continue;

        // El musgo solo prende donde da el aire: si hay piedra justo encima,
        // ese tile es interior de muro y ahi no crece nada.
        if (arriba && this.tilesSolidos.has(`${x},${y - T}`)) continue;

        const cx = x + T / 2;
        const cy = arriba ? y : y + T / 2;
        if (!lejosDeOtras(cx, cy)) continue;
        puestas.push({ x: cx, y: cy });

        const calco = this.add.sprite(cx, cy, clave, ruido(x, y, sal + 1) % total);
        calco.setDepth(0.5);
        if (tinte !== undefined) calco.setTint(tinte);
      }
    };

    marcar('grieta', grietas, 7, false);
    marcar('musgo', musgo, 13, true);
  }

  private crearCirujano(x: number, y: number): void {
    this.cirujano = new CirujanoSacerdote(this, x, y, this.controles);
    this.physics.add.collider(this.cirujano.sprite, this.suelos);

    this.cirujano.vitalidad.on('cambio', (puntos: number, maximo: number) => {
      this.game.events.emit(EVENTOS_HUD.vitalidad, puntos, maximo);

      // Vida baja y frascos sin usar: recordar que existen, una vez por zona.
      if (!this.pistaPocionDada && puntos > 0 && puntos <= 2 && this.cirujano.pociones > 0) {
        this.pistaPocionDada = true;
        this.game.events.emit(EVENTOS_HUD.aviso, 'Q  beber Pocion de Carne  (+3 vida)');
      }
    });
    this.cirujano.fervor.on('cambio', (puntos: number) => {
      this.game.events.emit(EVENTOS_HUD.fervor, puntos);
    });
    this.cirujano.eventos.on('pociones', (cargas: number, maximo: number) => {
      this.game.events.emit(EVENTOS_HUD.pociones, cargas, maximo);
    });
    this.cirujano.eventos.on('caida', (dano: number) => {
      this.impacto.danoRecibido();
      this.cameras.main.shake(200, 0.012);
      this.game.events.emit(EVENTOS_HUD.aviso, `caida: -${dano}`);
    });
    this.cirujano.vitalidad.on('muerte', () => this.alMorir());

    this.physics.add.overlap(
      this.cirujano.hitbox,
      this.obtenerGrupoEnemigos(),
      (_hitbox, spriteEnemigo) => {
        this.resolverGolpeDelCirujano(spriteEnemigo as Phaser.GameObjects.GameObject);
      },
    );

    // Rozar a un enemigo hiere. Sin esto se los atravesaba gratis, porque su
    // hitbox de ataque esta delante de ellos y no cubre su propio cuerpo.
    this.physics.add.overlap(
      this.cirujano.sprite,
      this.obtenerGrupoEnemigos(),
      (_jugador, spriteEnemigo) => {
        this.resolverContacto(spriteEnemigo as Phaser.GameObjects.GameObject);
      },
    );
  }

  private resolverContacto(spriteEnemigo: Phaser.GameObjects.GameObject): void {
    const enemigo = enemigoDe(spriteEnemigo);
    if (!enemigo || !enemigo.hiereAlContacto || this.cirujano.estaMuerto) return;

    const resultado = this.cirujano.recibirContacto(enemigo.sprite.x);
    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private obtenerGrupoEnemigos(): Phaser.Physics.Arcade.Group {
    if (!this.grupoEnemigos) this.grupoEnemigos = this.physics.add.group();
    return this.grupoEnemigos;
  }

  private poblarNivel(): void {
    const grupo = this.obtenerGrupoEnemigos();

    for (const ronda of this.definicion.devotos) {
      const devoto = new Devoto(this, ronda.x, ronda.y, {
        izquierda: ronda.izquierda,
        derecha: ronda.derecha,
      });

      this.physics.add.collider(devoto.sprite, this.suelos);
      grupo.add(devoto.sprite);
      this.devotos.push(devoto);

      this.physics.add.overlap(devoto.hitbox, this.cirujano.sprite, () =>
        this.resolverGolpeDeDevoto(devoto),
      );
    }

    for (const ronda of this.definicion.vestales ?? []) {
      const vestal = new Vestal(this, ronda.x, ronda.y, {
        izquierda: ronda.izquierda,
        derecha: ronda.derecha,
      });

      this.physics.add.collider(vestal.sprite, this.suelos);
      grupo.add(vestal.sprite);
      this.vestales.push(vestal);

      // El Vestal no conoce el grupo de proyectiles: solo avisa de que lanza.
      vestal.eventos.on('lanzar', (donde: { x: number; y: number; direccion: number }) => {
        this.lanzarSello(donde.x, donde.y, donde.direccion);
      });
    }

    // Sin collider a proposito: el Altar es decorado atravesable, no un muro.
    for (const punto of this.definicion.altares) {
      this.altares.push(new Altar(this, punto.x, punto.y));
    }

    if (this.altares.length > 0) {
      // El primer Altar arranca encendido: es el punto de partida de la zona.
      this.altares[0].rezar();
      this.altarActivo = this.altares[0];
    }

    for (const [x, y, id] of this.definicion.fragmentos) {
      // Lo ya recogido no vuelve a aparecer si se regresa a la zona.
      if (progreso.estaRecogido(id)) continue;

      const fragmento = new FragmentoCodice(this, x, y, id);
      this.fragmentos.push(fragmento);

      this.physics.add.overlap(this.cirujano.sprite, fragmento.sprite, () =>
        this.resolverRecogidaDeFragmento(fragmento),
      );
    }

    for (const [x, y, id, tipo] of this.definicion.reliquias ?? []) {
      if (progreso.tieneReliquia(id)) continue;

      const reliquia = new Reliquia(this, x, y, id, tipo);
      this.reliquias.push(reliquia);

      this.physics.add.overlap(this.cirujano.sprite, reliquia.sprite, () =>
        this.resolverRecogidaDeReliquia(reliquia),
      );
    }

    for (const [x, y, texto] of this.definicion.inscripciones ?? []) {
      const sprite = this.add.sprite(x, y, 'placa-placeholder').setOrigin(0.5, 1).setDepth(-4);
      const aviso = this.add
        .text(x, y - 14, 'E  leer', { fontFamily: 'monospace', fontSize: '8px', color: '#d6cfc4' })
        .setOrigin(0.5, 1)
        .setVisible(false);
      this.placas.push({ sprite, texto, aviso });
    }

    if (this.definicion.jefe) this.crearJefe(this.definicion.jefe);
    if (this.definicion.umbral) this.crearUmbral(this.definicion.umbral);
  }

  private crearJefe(datos: RondaDevoto): void {
    const jefe = new Reformado(this, datos.x, datos.y, {
      izquierda: datos.izquierda,
      derecha: datos.derecha,
    });

    this.jefe = jefe;
    this.physics.add.collider(jefe.sprite, this.suelos);
    this.obtenerGrupoEnemigos().add(jefe.sprite);

    this.physics.add.overlap(jefe.hitbox, this.cirujano.sprite, () =>
      this.resolverGolpeDeJefe(jefe),
    );

    jefe.eventos.on('vida', (puntos: number, maximo: number) => {
      this.game.events.emit(EVENTOS_HUD.jefe, puntos, maximo);
    });

    jefe.eventos.on('despierta', () => {
      this.game.events.emit(EVENTOS_HUD.jefe, REFORMADO.vida, REFORMADO.vida);
      this.game.events.emit(EVENTOS_HUD.aviso, 'el Reformado');
      sonido.jefeDespierta();
      musica.poner('jefe');
    });

    jefe.eventos.on('fase', (fase: number) => {
      this.cameras.main.flash(180, 140, 60, 60);
      this.game.events.emit(EVENTOS_HUD.aviso, `fase ${fase}`);
      sonido.jefeFase();
    });

    jefe.eventos.on('escombros', (cantidad: number) => this.soltarEscombros(cantidad));

    // Estrellarse contra el muro: el momento en que se le puede castigar.
    jefe.eventos.on('choque', (x: number, y: number) => {
      this.impacto.golpeAsestado(x, y - 20, 0, true);
      this.cameras.main.shake(220, 0.01);
    });

    jefe.eventos.on('impacto-suelo', (x: number, y: number, alcance: number) => {
      this.resolverOndaDeJefe(x, y, alcance);
    });

    jefe.eventos.on('muerte', () => {
      this.jefeDerrotado = true;
      this.game.events.emit(EVENTOS_HUD.jefe, -1, 1);
      this.abrirUmbral();
      // Campanas, y la musica de la zona vuelve despacio: se acabo el sacramento.
      sonido.victoria();
      if (this.definicion.musica) musica.poner(this.definicion.musica);
    });
  }

  /**
   * Escombros del techo. Primero se marca en el suelo donde van a caer, y
   * medio segundo despues caen. Se apuntan alrededor del Cirujano, no encima:
   * el jugador tiene que moverse, no adivinar. Es lo que convierte una arena
   * plana en un sitio donde hay que mirar hacia arriba.
   */
  private soltarEscombros(cantidad: number): void {
    const { escombros } = REFORMADO;
    const centroX = this.cirujano.sprite.x;
    const sueloY = this.definicion.jefe?.y ?? this.cirujano.sprite.y;
    const techoY = 112;
    const mundoAncho = this.definicion.mundo.ancho;

    // Posiciones: centro, y alternando a los lados a `separacion` px.
    const posiciones: number[] = [];
    for (let i = 0; i < cantidad; i += 1) {
      const lado = i === 0 ? 0 : i % 2 === 1 ? 1 : -1;
      const paso = Math.ceil(i / 2);
      const x = Phaser.Math.Clamp(
        centroX + lado * paso * escombros.separacion,
        32,
        mundoAncho - 32,
      );
      posiciones.push(x);
    }

    for (const x of posiciones) {
      const marca = this.add.graphics({ x, y: sueloY });
      marca.setDepth(2);
      marca.lineStyle(1, 0xe8a03a, 1);
      marca.strokeEllipse(0, 0, 22, 6);
      this.tweens.add({
        targets: marca,
        alpha: { from: 1, to: 0.3 },
        duration: 140,
        yoyo: true,
        repeat: Math.floor(escombros.avisoMs / 280),
        onComplete: () => marca.destroy(),
      });

      this.time.delayedCall(escombros.avisoMs, () => this.dejarCaerPiedra(x, techoY, sueloY));
    }
  }

  private dejarCaerPiedra(x: number, desdeY: number, sueloY: number): void {
    const piedra = this.physics.add.sprite(x, desdeY, 'piedra', 0);
    piedra.setDepth(25);
    if (this.definicion.tinte !== undefined) piedra.setTint(this.definicion.tinte);
    piedra.setAngle(Phaser.Math.Between(-20, 20));
    const cuerpo = piedra.body as Phaser.Physics.Arcade.Body;
    cuerpo.setSize(12, 12);
    cuerpo.setAllowGravity(true);
    cuerpo.setVelocityY(60);

    let resuelta = false;
    const impactar = () => {
      if (resuelta) return;
      resuelta = true;
      this.impacto.escombro(piedra.x, piedra.y);
      piedra.destroy();
    };

    this.physics.add.overlap(piedra, this.cirujano.sprite, () => {
      if (resuelta || this.cirujano.estaMuerto) return;
      const resultado = this.cirujano.recibirDano(REFORMADO.escombros.dano, piedra.x);
      if (resultado === 'herido') this.impacto.danoRecibido();
      impactar();
    });

    // Contra el suelo o cualquier plataforma, se rompe.
    this.physics.add.collider(piedra, this.suelos, impactar);
    // Tope de seguridad por si atraviesa algo.
    this.time.delayedCall(2500, () => {
      if (!resuelta && piedra.active) impactar();
    });
    void sueloY;
  }

  /** La onda barre a ras de suelo: saltar es la respuesta correcta. */
  private resolverOndaDeJefe(x: number, y: number, alcance: number): void {
    this.impacto.ondaSuelo(x, y, alcance);

    if (this.cirujano.estaMuerto) return;

    const cuerpo = this.cirujano.cuerpo;
    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;
    const distancia = Math.abs(this.cirujano.sprite.x - x);
    const mismaAltura = Math.abs(this.cirujano.sprite.y - y) < 40;

    if (!enSuelo || !mismaAltura || distancia > alcance) return;

    const resultado = this.cirujano.recibirDano(REFORMADO.dano, x);
    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private resolverGolpeDeJefe(jefe: Reformado): void {
    if (jefe.estaMuerto || this.cirujano.estaMuerto) return;
    if (!jefe.consumirGolpe()) return;

    const resultado = this.cirujano.recibirDano(REFORMADO.dano, jefe.sprite.x);

    if (resultado === 'parado') {
      jefe.aturdir();
      this.impacto.parryLogrado(
        (this.cirujano.sprite.x + jefe.sprite.x) / 2,
        this.cirujano.sprite.y - 12,
      );
      this.game.events.emit(EVENTOS_HUD.aviso, 'parry');
      return;
    }

    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private crearUmbral(umbral: Umbral): void {
    this.umbralSprite = this.add.sprite(umbral.x, umbral.y, 'umbral-placeholder');
    this.umbralSprite.setOrigin(0.5, 1);
    this.umbralSprite.setDepth(1);

    // Con un jefe en la sala, la salida no existe hasta que cae.
    if (this.definicion.jefe && !this.jefeDerrotado) {
      this.umbralSprite.setVisible(false);
      return;
    }

    // Latido lento: el descenso llama sin gritar.
    this.tweens.add({
      targets: this.umbralSprite,
      alpha: { from: 0.5, to: 1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.umbralAviso = this.add
      .text(umbral.x, umbral.y - 40, `E  ${umbral.etiqueta}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  // -- Combate -------------------------------------------------------------

  private resolverGolpeDelCirujano(spriteEnemigo: Phaser.GameObjects.GameObject): void {
    // Da igual si es Devoto, Vestal o el Reformado: todos son Enemigo.
    const enemigo = enemigoDe(spriteEnemigo);
    if (!enemigo || enemigo.estaMuerto) return;

    const dano = this.cirujano.registrarGolpe(enemigo);
    if (dano <= 0) return; // ya golpeado en este swing

    const direccion = enemigo.sprite.x >= this.cirujano.sprite.x ? 1 : -1;
    const puntoX = enemigo.sprite.x;
    const puntoY = enemigo.sprite.y - 12;

    enemigo.recibirDano(dano, this.cirujano.sprite.x);

    if (enemigo.estaMuerto) {
      this.impacto.muerteEnemigo(puntoX, puntoY, enemigo.clase);
      this.soltarOfrenda(puntoX, puntoY, enemigo.clase);
    } else {
      this.impacto.golpeAsestado(
        puntoX,
        puntoY,
        direccion,
        this.cirujano.golpeActualEsCargado,
        enemigo.clase,
      );
    }
  }

  // -- Ofrendas ------------------------------------------------------------

  /** Un enemigo cae y deja algo, segun su clase y la suerte. */
  private soltarOfrenda(x: number, y: number, clase: 'devoto' | 'vestal' | 'reformado'): void {
    const tipo = Ofrenda.sortear(clase);
    if (!tipo) return;

    const ofrenda = new Ofrenda(this, x, y, tipo);
    this.ofrendas.push(ofrenda);

    this.physics.add.collider(ofrenda.sprite, this.suelos);
    this.physics.add.overlap(this.cirujano.sprite, ofrenda.sprite, () =>
      this.resolverRecogidaDeOfrenda(ofrenda),
    );
  }

  private resolverRecogidaDeOfrenda(ofrenda: Ofrenda): void {
    if (this.cirujano.estaMuerto || !ofrenda.recoger()) return;

    sonido.ofrenda(ofrenda.tipo);

    if (ofrenda.tipo === 'carne') {
      this.cirujano.vitalidad.curar(OFRENDA.curacionCarne);
      this.game.events.emit(
        EVENTOS_HUD.aviso,
        `${ofrenda.nombre}  ·  +${OFRENDA.curacionCarne} vida`,
      );
      return;
    }

    this.cirujano.fervor.ganar(OFRENDA.fervorSello);
    this.game.events.emit(
      EVENTOS_HUD.aviso,
      `${ofrenda.nombre}  ·  +${OFRENDA.fervorSello} Fervor`,
    );
  }

  // -- Sellos del diezmo ---------------------------------------------------

  private lanzarSello(x: number, y: number, direccion: number): void {
    const sello = new Sello(this, x, y, direccion);
    this.sellos.push(sello);

    // Contra el escenario se disuelve: no atraviesa muros.
    this.physics.add.collider(sello.sprite, this.suelos, () => sello.destruir());

    this.physics.add.overlap(sello.sprite, this.cirujano.sprite, () =>
      this.resolverSelloContraCirujano(sello),
    );

    // Ya devuelto, el mismo sello puede herir a cualquier enemigo.
    this.physics.add.overlap(sello.sprite, this.obtenerGrupoEnemigos(), (_s, spriteEnemigo) =>
      this.resolverSelloContraEnemigo(sello, spriteEnemigo as Phaser.GameObjects.GameObject),
    );
  }

  private resolverSelloContraCirujano(sello: Sello): void {
    if (!sello.estaVivo || sello.fueDevuelto || this.cirujano.estaMuerto) return;

    // El parry no rompe el sello: se lo queda el Cirujano y sale rebotado.
    if (this.cirujano.estaParando) {
      sello.devolver();
      this.cirujano.premiarParry();
      this.impacto.parryLogrado(sello.sprite.x, sello.sprite.y);
      sonido.selloDevuelto();
      this.game.events.emit(EVENTOS_HUD.aviso, 'sello devuelto');
      return;
    }

    if (!sello.consumir()) return;

    const resultado = this.cirujano.recibirDano(sello.dano, sello.sprite.x);
    if (resultado === 'herido') this.impacto.danoRecibido();
    sello.destruir();
  }

  private resolverSelloContraEnemigo(
    sello: Sello,
    spriteEnemigo: Phaser.GameObjects.GameObject,
  ): void {
    // Solo hiere a los suyos una vez ha sido parado.
    if (!sello.estaVivo || !sello.fueDevuelto) return;

    const enemigo = enemigoDe(spriteEnemigo);
    if (!enemigo || enemigo.estaMuerto) return;
    if (!sello.consumir()) return;

    enemigo.recibirDano(sello.dano, sello.sprite.x);
    this.impacto.golpeAsestado(enemigo.sprite.x, enemigo.sprite.y - 12, 0, true, enemigo.clase);
    if (enemigo.estaMuerto)
      this.soltarOfrenda(enemigo.sprite.x, enemigo.sprite.y - 12, enemigo.clase);
    sello.destruir();
  }

  private resolverGolpeDeDevoto(devoto: Devoto): void {
    if (devoto.estaMuerto || this.cirujano.estaMuerto) return;
    if (!devoto.consumirGolpe()) return;

    const resultado = this.cirujano.recibirDano(DEVOTO.dano, devoto.sprite.x);

    if (resultado === 'parado') {
      devoto.aturdir();
      this.impacto.parryLogrado(
        (this.cirujano.sprite.x + devoto.sprite.x) / 2,
        this.cirujano.sprite.y - 12,
      );
      this.game.events.emit(EVENTOS_HUD.aviso, 'parry');
      return;
    }

    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private resolverRecogidaDeFragmento(fragmento: FragmentoCodice): void {
    if (!fragmento.recoger()) return;
    if (!progreso.recogerFragmento(fragmento.id)) return;

    sonido.codice();
    this.game.events.emit(EVENTOS_HUD.codice, progreso.fragmentosRecogidos);
    // Aviso discreto: el lore no interrumpe la partida. Se lee cuando se quiera.
    this.game.events.emit(EVENTOS_HUD.aviso, 'fragmento del Codice  ·  L para leer');
  }

  private resolverRecogidaDeReliquia(reliquia: Reliquia): void {
    if (!reliquia.recoger()) return;
    if (!progreso.recogerReliquia(reliquia.id, reliquia.tipo)) return;

    this.cirujano.aplicarReliquia(reliquia.tipo);
    sonido.reliquia();
    this.cameras.main.flash(160, 232, 217, 160);
    this.game.events.emit(EVENTOS_HUD.aviso, `${reliquia.nombre}  ·  ${reliquia.efecto}`);
  }

  /**
   * Pausa. La escena entera se detiene debajo (fisica, temporizadores, entrada)
   * y el menu se lanza encima. No se puede pausar en mitad del descenso a otra
   * zona, para no dejar el fundido a medias.
   */
  private pausar(): void {
    if (this.descendiendo) return;

    sonido.interfazAbrir();
    musica.atenuar(true);
    this.scene.pause();
    this.scene.launch('Pausa', { escenaJuego: this.scene.key });
  }

  /**
   * Abre la lectura del Codice sobre el juego en pausa.
   * Si no hay nada recogido, solo lo dice: no merece una pantalla entera.
   */
  private abrirCodice(): void {
    if (this.cirujano.estaMuerto || this.descendiendo) return;

    if (progreso.fragmentosRecogidos === 0) {
      this.game.events.emit(EVENTOS_HUD.aviso, 'aun no tienes fragmentos del Codice');
      return;
    }

    sonido.interfazAbrir();
    musica.atenuar(true);
    this.scene.pause();
    this.scene.launch('Codice', { escenaJuego: this.scene.key });
  }

  // -- Altares, umbral, muerte ---------------------------------------------

  private actualizarAltares(): void {
    if (this.cirujano.estaMuerto) return;

    for (const altar of this.altares) {
      const distancia = Phaser.Math.Distance.Between(
        this.cirujano.sprite.x,
        this.cirujano.sprite.y,
        altar.sprite.x,
        altar.sprite.y,
      );
      altar.marcarProximidad(distancia <= RADIO_ALTAR);

      if (altar.puedeRezar && this.controles.interactuarPresionado && !this.cirujano.estaRezando) {
        this.rezarEn(altar);
      }
    }
  }

  /** Las placas del Registro se leen de pasada, con E, sin pausar nada. */
  private actualizarPlacas(): void {
    if (this.cirujano.estaMuerto) return;

    for (const placa of this.placas) {
      const distancia = Phaser.Math.Distance.Between(
        this.cirujano.sprite.x,
        this.cirujano.sprite.y,
        placa.sprite.x,
        placa.sprite.y,
      );
      const cerca = distancia <= RADIO_PLACA;
      placa.aviso.setVisible(cerca);

      if (cerca && this.controles.interactuarPresionado) {
        sonido.codice();
        this.game.events.emit(EVENTOS_HUD.inscripcion, placa.texto);
      }
    }
  }

  /**
   * Rezar en un Altar. Tres cosas a la vez, para que no quede duda de que ha
   * pasado algo y de que: el Cirujano se arrodilla, el Altar responde con luz
   * y sonido, y el aviso dice con palabras que ES el punto de guardado.
   */
  private rezarEn(altar: Altar): void {
    const DURACION_REZO_MS = 1100;

    altar.rezar();
    altar.responder();
    this.altarActivo = altar;
    this.cirujano.rezar(DURACION_REZO_MS);
    sonido.altar();
    this.cameras.main.flash(260, 232, 200, 120);

    this.game.events.emit(EVENTOS_HUD.aviso, 'ALTAR: descenso guardado');
    this.time.delayedCall(700, () => {
      this.cirujano.reponerEnAltar();
      this.game.events.emit(
        EVENTOS_HUD.aviso,
        'cuerpo y frasco repuestos  ·  aqui volveras si caes',
      );
    });
  }

  private actualizarUmbral(): void {
    const umbral = this.definicion.umbral;
    if (!umbral || !this.umbralSprite || this.descendiendo) return;
    if (this.cirujano.estaMuerto) return;
    if (this.definicion.jefe && !this.jefeDerrotado) return;

    const distancia = Phaser.Math.Distance.Between(
      this.cirujano.sprite.x,
      this.cirujano.sprite.y,
      this.umbralSprite.x,
      this.umbralSprite.y,
    );
    const cerca = distancia <= RADIO_UMBRAL;
    this.umbralAviso?.setVisible(cerca);

    if (cerca && this.controles.interactuarPresionado) this.descender(umbral);
  }

  private descender(umbral: Umbral): void {
    this.descendiendo = true;
    sonido.descenso();

    this.cameras.main.fade(600, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // El contador del Codice viaja con el jugador entre zonas.
      this.scene.start(umbral.destino);
    });
  }

  /**
   * Muere el Cirujano.
   *
   * Tres cosas a la vez, por el mismo motivo que al rezar: una sola no basta
   * para que el jugador entienda QUE ha pasado. El cuerpo se desploma, la
   * camara pega el golpe mas fuerte de todo el juego y el HUD lo dice con
   * palabras en mitad de la pantalla. Antes solo bajaba la opacidad del
   * sprite y se fundia a negro, y eso se confundia con recibir un golpe mas.
   *
   * El orden importa y esta afinado en `CAIDA`: el cuerpo cae, despues se
   * apaga la zona, y el aviso aguanta un momento sobre el negro.
   */
  private alMorir(): void {
    if (this.reapareciendo) return;
    this.reapareciendo = true;

    this.impacto.muerteCirujano(this.cirujano.sprite.x, this.cirujano.sprite.y);
    this.game.events.emit(EVENTOS_HUD.caida, true);

    // El fundido arranca DESPUES del desplome, y termina ANTES de reaparecer:
    // ese hueco es el instante de negro con el aviso todavia en pantalla.
    this.time.delayedCall(CAIDA.retardoFundidoMs, () => {
      this.cameras.main.fade(CAIDA.fundidoMs, 11, 9, 11);
    });
    this.time.delayedCall(CAIDA.reaparecerMs, () => this.reaparecer());
  }

  private reaparecer(): void {
    const destino = this.altarActivo?.puntoReaparicion ?? this.definicion.inicio;

    this.cirujano.reaparecerEn(destino.x, destino.y);
    this.game.events.emit(EVENTOS_HUD.caida, false);
    this.cameras.main.fadeIn(320, 11, 9, 11);
    this.reapareciendo = false;
    this.game.events.emit(EVENTOS_HUD.aviso, 'vuelves al ultimo Altar donde rezaste');
  }

  /** El jefe duerme hasta que el Cirujano entra de verdad en la sala. */
  private actualizarJefe(): void {
    const jefe = this.jefe;
    if (!jefe || jefe.estaMuerto) return;

    if (jefe.estadoActual === 'dormido') {
      const distancia = Math.abs(this.cirujano.sprite.x - jefe.sprite.x);
      if (distancia < 190) jefe.despertar();
      return;
    }

    jefe.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
  }

  /** Cae el jefe y la salida aparece. */
  private abrirUmbral(): void {
    if (!this.umbralSprite) return;

    this.umbralSprite.setVisible(true);
    this.umbralSprite.setAlpha(0);
    this.tweens.add({
      targets: this.umbralSprite,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeOut',
    });
  }

  private limpiarDevotosMuertos(): void {
    this.devotos = this.devotos.filter((devoto) => !devoto.estaMuerto);
    this.vestales = this.vestales.filter((vestal) => !vestal.estaMuerto);
    this.sellos = this.sellos.filter((sello) => sello.estaVivo);
    this.ofrendas = this.ofrendas.filter((ofrenda) => ofrenda.estaViva);
  }

  // -- Presentacion --------------------------------------------------------

  private emitirEstadoInicial(): void {
    // Un frame de margen: el HUD debe existir antes de recibir eventos.
    this.time.delayedCall(0, () => {
      this.game.events.emit(
        EVENTOS_HUD.vitalidad,
        this.cirujano.vitalidad.puntos,
        this.cirujano.vitalidad.maxima,
      );
      this.game.events.emit(EVENTOS_HUD.fervor, this.cirujano.fervor.puntos);
      this.game.events.emit(
        EVENTOS_HUD.pociones,
        this.cirujano.pociones,
        this.cirujano.pocionesMaximas,
      );
      this.game.events.emit(EVENTOS_HUD.codice, progreso.fragmentosRecogidos);
    });
  }

  /**
   * Panel de controles.
   *
   * Lista TODO lo que se puede hacer, con las teclas y el raton, y describe
   * cada accion tal como funciona de verdad (el cargado cuesta Fervor, el
   * doble salto es pulsar dos veces...). Una ayuda que no coincide con el
   * juego es peor que ninguna: el jugador deja de fiarse de ella.
   *
   * Se muestra al empezar la primera zona, se oculta sola a los segundos, y
   * H o TAB la traen de vuelta en cualquier momento.
   */
  private crearAyudaControles(visibleAlEmpezar: boolean): void {
    // Dos columnas de 220 px: cabe una linea de ANCHO_MAXIMO caracteres en cada una
    // sin pisar a la otra. Antes median 142 px y se solapaban (issue #30).
    const ancho = 464;
    const alto = 128;
    const x = (RESOLUCION.ancho - ancho) / 2;
    const y = RESOLUCION.alto - alto - 14;

    const fondo = this.add.graphics();
    fondo.fillStyle(0x0b090b, 0.86);
    fondo.fillRect(0, 0, ancho, alto);
    fondo.lineStyle(1, 0x4a4038, 1);
    fondo.strokeRect(0, 0, ancho, alto);

    const estilo = {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#d6cfc4',
      lineSpacing: 3,
    };
    const estiloTenue = { ...estilo, color: '#8a7d70' };

    const movimiento = this.add.text(12, 10, CONTROLES_MOVIMIENTO.join('\n'), estilo);

    const combate = this.add.text(236, 10, CONTROLES_COMBATE.join('\n'), estilo);

    const pie = this.add.text(
      10,
      alto - 18,
      'ESC  pausa        H  mostrar u ocultar esta ayuda        M  sonido',
      estiloTenue,
    );

    const panel = this.add.container(x, y, [fondo, movimiento, combate, pie]);
    panel.setScrollFactor(0);
    panel.setDepth(100);
    panel.setVisible(visibleAlEmpezar);
    this.panelAyuda = panel;

    // En la primera zona se retira sola: no hay que taparle el juego a nadie.
    if (visibleAlEmpezar) {
      this.time.delayedCall(9000, () => {
        if (this.panelAyuda?.visible) this.ocultarAyuda();
      });
    }
  }

  private alternarAyuda(): void {
    if (!this.panelAyuda) return;
    if (this.panelAyuda.visible) {
      this.ocultarAyuda();
    } else {
      this.tweens.killTweensOf(this.panelAyuda);
      this.panelAyuda.setVisible(true);
      this.panelAyuda.setAlpha(1);
    }
  }

  private ocultarAyuda(): void {
    const panel = this.panelAyuda;
    if (!panel) return;

    this.tweens.killTweensOf(panel);
    this.tweens.add({
      targets: panel,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeIn',
      onComplete: () => {
        panel.setVisible(false);
        panel.setAlpha(1);
      },
    });
  }
}
