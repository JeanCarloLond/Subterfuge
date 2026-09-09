import Phaser from 'phaser';
import { CirujanoSacerdote } from '../entities/CirujanoSacerdote';
import { Devoto } from '../entities/Devoto';
import { Controles } from '../input/Controles';
import { Altar } from '../objetos/Altar';
import { FragmentoCodice } from '../objetos/FragmentoCodice';
import { DEVOTO, RESOLUCION } from '../config/Sacramento';
import { Impacto } from '../systems/Impacto';
import { EVENTOS_HUD } from '../ui/HudScene';

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
  altares: ReadonlyArray<{ x: number; y: number }>;
  fragmentos: ReadonlyArray<readonly [number, number, string]>;
  umbral?: Umbral;
  /** Ayuda de controles. Solo el primer nivel la necesita. */
  mostrarAyuda?: boolean;
}

/** Lado del tile. */
const T = 16;

/** Radio en el que un Altar ofrece la interaccion de rezar (px). */
const RADIO_ALTAR = 26;

/** Radio en el que un Umbral ofrece el descenso (px). */
const RADIO_UMBRAL = 24;

/** Retardo entre morir y reaparecer en el ultimo Altar (ms). */
const RETARDO_REAPARICION = 1100;

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
  private altares: Altar[] = [];
  private fragmentos: FragmentoCodice[] = [];
  private grupoEnemigos?: Phaser.Physics.Arcade.Group;

  private altarActivo: Altar | null = null;
  private fragmentosRecogidos = 0;
  private reapareciendo = false;
  private descendiendo = false;

  private umbralSprite?: Phaser.GameObjects.Sprite;
  private umbralAviso?: Phaser.GameObjects.Text;

  /** Cada zona describe aqui su contenido. */
  protected abstract definirNivel(): DefinicionNivel;

  create(datos?: { fragmentos?: number }): void {
    this.reiniciarEstado();
    this.fragmentosRecogidos = datos?.fragmentos ?? 0;

    this.definicion = this.definirNivel();
    const { mundo, colorFondo, inicio } = this.definicion;

    this.physics.world.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBackgroundColor(colorFondo);

    this.suelos = this.construirGeometria();
    this.controles = new Controles(this);
    this.impacto = new Impacto(this);

    this.crearCirujano(inicio.x, inicio.y);
    this.poblarNivel();

    this.cameras.main.startFollow(this.cirujano.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
    this.cameras.main.fadeIn(360, 11, 9, 11);

    if (!this.scene.isActive('Hud')) this.scene.launch('Hud');
    this.emitirEstadoInicial();

    if (this.definicion.mostrarAyuda) this.crearAyudaControles();
  }

  update(): void {
    this.cirujano.actualizar();

    for (const devoto of this.devotos) {
      devoto.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    this.actualizarAltares();
    this.actualizarUmbral();
    this.limpiarDevotosMuertos();
  }

  private reiniciarEstado(): void {
    this.devotos = [];
    this.altares = [];
    this.fragmentos = [];
    this.grupoEnemigos = undefined;
    this.altarActivo = null;
    this.reapareciendo = false;
    this.descendiendo = false;
    this.umbralSprite = undefined;
    this.umbralAviso = undefined;
  }

  // -- Construccion --------------------------------------------------------

  private construirGeometria(): Phaser.Physics.Arcade.StaticGroup {
    const suelos = this.physics.add.staticGroup();

    for (const [x, y, anchoTiles] of this.definicion.plataformas) {
      for (let i = 0; i < anchoTiles; i += 1) {
        suelos.create(x + i * T, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
      }
    }

    for (const [x, yInicio, yFin] of this.definicion.paredes) {
      for (let y = yInicio; y < yFin; y += T) {
        suelos.create(x, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
      }
    }

    return suelos;
  }

  private crearCirujano(x: number, y: number): void {
    this.cirujano = new CirujanoSacerdote(this, x, y, this.controles);
    this.physics.add.collider(this.cirujano.sprite, this.suelos);

    this.cirujano.vitalidad.on('cambio', (puntos: number) => {
      this.game.events.emit(EVENTOS_HUD.vitalidad, puntos);
    });
    this.cirujano.fervor.on('cambio', (puntos: number) => {
      this.game.events.emit(EVENTOS_HUD.fervor, puntos);
    });
    this.cirujano.eventos.on('pociones', (cargas: number) => {
      this.game.events.emit(EVENTOS_HUD.pociones, cargas);
    });
    this.cirujano.vitalidad.on('muerte', () => this.alMorir());

    this.physics.add.overlap(
      this.cirujano.hitbox,
      this.obtenerGrupoEnemigos(),
      (_hitbox, spriteEnemigo) => {
        this.resolverGolpeDelCirujano(spriteEnemigo as Phaser.GameObjects.GameObject);
      },
    );
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
      const fragmento = new FragmentoCodice(this, x, y, id);
      this.fragmentos.push(fragmento);

      this.physics.add.overlap(this.cirujano.sprite, fragmento.sprite, () =>
        this.resolverRecogidaDeFragmento(fragmento),
      );
    }

    if (this.definicion.umbral) this.crearUmbral(this.definicion.umbral);
  }

  private crearUmbral(umbral: Umbral): void {
    this.umbralSprite = this.add.sprite(umbral.x, umbral.y, 'umbral-placeholder');
    this.umbralSprite.setOrigin(0.5, 1);
    this.umbralSprite.setDepth(1);

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
    const devoto = spriteEnemigo.getData('devoto') as Devoto | undefined;
    if (!devoto || devoto.estaMuerto) return;

    const dano = this.cirujano.registrarGolpe(devoto);
    if (dano <= 0) return; // ya golpeado en este swing

    const direccion = devoto.sprite.x >= this.cirujano.sprite.x ? 1 : -1;
    const puntoX = devoto.sprite.x;
    const puntoY = devoto.sprite.y - 12;

    devoto.recibirDano(dano, this.cirujano.sprite.x);

    if (devoto.estaMuerto) {
      this.impacto.muerteEnemigo(puntoX, puntoY);
    } else {
      this.impacto.golpeAsestado(puntoX, puntoY, direccion, this.cirujano.golpeActualEsCargado);
    }
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

    this.fragmentosRecogidos += 1;
    this.game.events.emit(EVENTOS_HUD.codice, this.fragmentosRecogidos);
    // Aviso discreto: el lore no interrumpe la partida.
    this.game.events.emit(EVENTOS_HUD.aviso, 'fragmento del Codice');
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

      if (altar.puedeRezar && this.controles.interactuarPresionado) {
        altar.rezar();
        this.altarActivo = altar;
        this.cirujano.reponerEnAltar();
        this.game.events.emit(EVENTOS_HUD.aviso, 'el Altar responde');
      }
    }
  }

  private actualizarUmbral(): void {
    const umbral = this.definicion.umbral;
    if (!umbral || !this.umbralSprite || this.descendiendo) return;
    if (this.cirujano.estaMuerto) return;

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

    this.cameras.main.fade(600, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // El contador del Codice viaja con el jugador entre zonas.
      this.scene.start(umbral.destino, { fragmentos: this.fragmentosRecogidos });
    });
  }

  private alMorir(): void {
    if (this.reapareciendo) return;
    this.reapareciendo = true;

    this.cameras.main.shake(240, 0.012);
    this.cameras.main.fade(RETARDO_REAPARICION - 200, 11, 9, 11);
    this.time.delayedCall(RETARDO_REAPARICION, () => this.reaparecer());
  }

  private reaparecer(): void {
    const destino = this.altarActivo?.puntoReaparicion ?? this.definicion.inicio;

    this.cirujano.reaparecerEn(destino.x, destino.y);
    this.cameras.main.fadeIn(320, 11, 9, 11);
    this.reapareciendo = false;
    this.game.events.emit(EVENTOS_HUD.aviso, 'las manos recuerdan');
  }

  private limpiarDevotosMuertos(): void {
    this.devotos = this.devotos.filter((devoto) => !devoto.estaMuerto);
  }

  // -- Presentacion --------------------------------------------------------

  private emitirEstadoInicial(): void {
    // Un frame de margen: el HUD debe existir antes de recibir eventos.
    this.time.delayedCall(0, () => {
      this.game.events.emit(EVENTOS_HUD.vitalidad, this.cirujano.vitalidad.puntos);
      this.game.events.emit(EVENTOS_HUD.fervor, this.cirujano.fervor.puntos);
      this.game.events.emit(EVENTOS_HUD.pociones, this.cirujano.pociones);
      this.game.events.emit(EVENTOS_HUD.codice, this.fragmentosRecogidos);
    });
  }

  /** Ayuda de desarrollo. Se retira antes de cualquier build publica. */
  private crearAyudaControles(): void {
    this.add
      .text(
        6,
        RESOLUCION.alto - 22,
        'A/D mover  ESPACIO saltar  SHIFT dash\nJ atacar (mantener = cargado)  K parry  Q pocion  E interactuar',
        {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#6b5f55',
          lineSpacing: 2,
        },
      )
      .setScrollFactor(0)
      .setDepth(100);
  }
}
