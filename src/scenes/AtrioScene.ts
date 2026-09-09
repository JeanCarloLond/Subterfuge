import Phaser from 'phaser';
import { CirujanoSacerdote } from '../entities/CirujanoSacerdote';
import { Devoto } from '../entities/Devoto';
import { Controles } from '../input/Controles';
import { Altar } from '../objetos/Altar';
import { FragmentoCodice } from '../objetos/FragmentoCodice';
import { DEVOTO, RESOLUCION } from '../config/Sacramento';
import { EVENTOS_HUD } from '../ui/HudScene';

/** Dimensiones del mundo de pruebas. Vertical: el Vientre se desciende. */
const MUNDO = { ancho: 960, alto: 1120 } as const;

/** Plataforma de prueba: [x, y, anchoEnTiles]. y crece hacia abajo. */
type Plataforma = readonly [number, number, number];

/** Radio en el que un Altar ofrece la interaccion de rezar (px). */
const RADIO_ALTAR = 26;

/** Retardo entre morir y reaparecer en el ultimo Altar (ms). */
const RETARDO_REAPARICION = 1100;

/**
 * El Atrio: la superficie, la ciudad visible donde vive la mayoria.
 * Es el nivel mas luminoso del juego; cada descenso posterior debe ser mas
 * oscuro, organico y peligroso que este.
 *
 * FASE 2 (nucleo jugable): combate, Devotos, Altares y fragmentos del Codice
 * sobre geometria provisional por codigo. Cuando lleguen los tilesets del
 * equipo, `construirGeometria()` se sustituye por un tilemap de Tiled cargado
 * desde public/assets/maps/atrio.tmj.
 */
export class AtrioScene extends Phaser.Scene {
  private cirujano!: CirujanoSacerdote;
  private controles!: Controles;
  private suelos!: Phaser.Physics.Arcade.StaticGroup;

  private devotos: Devoto[] = [];
  private altares: Altar[] = [];
  private fragmentos: FragmentoCodice[] = [];

  private grupoEnemigos?: Phaser.Physics.Arcade.Group;

  private altarActivo: Altar | null = null;
  private fragmentosRecogidos = 0;
  private reapareciendo = false;

  constructor() {
    super({ key: 'Atrio' });
  }

  create(): void {
    this.reiniciarEstado();

    this.physics.world.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.cameras.main.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.cameras.main.setBackgroundColor('#141014');

    this.suelos = this.construirGeometria();
    this.controles = new Controles(this);

    this.crearCirujano(80, 200);
    this.poblarNivel();

    this.cameras.main.startFollow(this.cirujano.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);

    this.scene.launch('Hud');
    this.emitirEstadoInicial();
    this.crearAyudaControles();
  }

  update(): void {
    this.cirujano.actualizar();

    for (const devoto of this.devotos) {
      devoto.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    this.actualizarAltares();
    this.limpiarDevotosMuertos();
  }

  private reiniciarEstado(): void {
    this.devotos = [];
    this.altares = [];
    this.fragmentos = [];
    this.altarActivo = null;
    this.fragmentosRecogidos = 0;
    this.reapareciendo = false;
  }

  // -- Construccion del nivel ----------------------------------------------

  private crearCirujano(x: number, y: number): void {
    this.cirujano = new CirujanoSacerdote(this, x, y, this.controles);
    this.physics.add.collider(this.cirujano.sprite, this.suelos);

    this.cirujano.vitalidad.on('cambio', (puntos: number) => {
      this.events.emit(EVENTOS_HUD.vitalidad, puntos);
    });
    this.cirujano.fervor.on('cambio', (puntos: number) => {
      this.events.emit(EVENTOS_HUD.fervor, puntos);
    });
    this.cirujano.eventos.on('pociones', (cargas: number) => {
      this.events.emit(EVENTOS_HUD.pociones, cargas);
    });
    this.cirujano.vitalidad.on('muerte', () => this.alMorir());

    // El golpe del Cirujano contra los Devotos.
    this.physics.add.overlap(
      this.cirujano.hitbox,
      this.gruposDeSpritesEnemigos(),
      (_hitbox, spriteEnemigo) => {
        this.resolverGolpeDelCirujano(spriteEnemigo as Phaser.GameObjects.GameObject);
      },
    );
  }

  /**
   * Grupo dinamico de sprites de Devotos. Se rellena en poblarNivel(); Phaser
   * necesita el grupo creado antes de registrar el overlap.
   */
  private gruposDeSpritesEnemigos(): Phaser.Physics.Arcade.Group {
    if (!this.grupoEnemigos) {
      this.grupoEnemigos = this.physics.add.group();
    }
    return this.grupoEnemigos;
  }

  private poblarNivel(): void {
    const grupo = this.gruposDeSpritesEnemigos();

    // Devotos: rondas cortas, cada una sobre una plataforma concreta.
    const rondas: ReadonlyArray<{ x: number; y: number; izq: number; der: number }> = [
      { x: 250, y: 288, izq: 180, der: 330 },
      { x: 600, y: 400, izq: 570, der: 690 },
      { x: 150, y: 720, izq: 40, der: 210 },
      { x: 520, y: 848, izq: 440, der: 600 },
    ];

    for (const ronda of rondas) {
      const devoto = new Devoto(this, ronda.x, ronda.y, {
        izquierda: ronda.izq,
        derecha: ronda.der,
      });

      this.physics.add.collider(devoto.sprite, this.suelos);
      grupo.add(devoto.sprite);
      this.devotos.push(devoto);

      // El golpe del Devoto contra el Cirujano.
      this.physics.add.overlap(devoto.hitbox, this.cirujano.sprite, () =>
        this.resolverGolpeDeDevoto(devoto),
      );
    }

    // Altares: uno al inicio (red de seguridad) y otro antes del descenso.
    // Sin collider a proposito: el Altar es decorado atravesable, no un muro.
    this.altares.push(new Altar(this, 120, 288));
    this.altares.push(new Altar(this, 200, 720));

    // El primer Altar arranca encendido: es el punto de partida del teaser.
    this.altares[0].rezar();
    this.altarActivo = this.altares[0];

    // Fragmentos del Codice en rutas opcionales: premian explorar, no avanzar.
    const posiciones: ReadonlyArray<readonly [number, number, string]> = [
      [840, 170, 'codice-01'],
      [620, 375, 'codice-02'],
      [60, 950, 'codice-03'],
    ];

    for (const [x, y, id] of posiciones) {
      const fragmento = new FragmentoCodice(this, x, y, id);
      this.fragmentos.push(fragmento);

      this.physics.add.overlap(this.cirujano.sprite, fragmento.sprite, () =>
        this.resolverRecogidaDeFragmento(fragmento),
      );
    }
  }

  /**
   * Distribucion pensada para ejercitar cada mecanica en orden:
   * caminar -> salto -> doble salto -> dash -> agarre de bordes.
   */
  private construirGeometria(): Phaser.Physics.Arcade.StaticGroup {
    const suelos = this.physics.add.staticGroup();
    const T = 16; // lado del tile

    const plataformas: readonly Plataforma[] = [
      // Suelo inicial: espacio para caminar.
      [0, 288, 22],
      // Escalon corto: salto simple.
      [400, 256, 5],
      // Salto alto: exige doble salto.
      [540, 192, 5],
      // Hueco ancho: exige dash para cruzarlo.
      [760, 192, 4],
      // Repisa suelta para encadenar dash en el aire.
      [560, 400, 6],
      // Muro vertical alto: superficie de agarre de bordes.
      [300, 480, 3],
      [300, 560, 3],
      [300, 640, 3],
      // Descenso hacia los Pasillos de Preparacion (aun sin transicion).
      [0, 720, 14],
      [420, 848, 12],
      [120, 976, 20],
    ];

    for (const [x, y, anchoTiles] of plataformas) {
      for (let i = 0; i < anchoTiles; i += 1) {
        suelos.create(x + i * T, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
      }
    }

    // Paredes laterales para que el agarre tenga contra que engancharse.
    for (let y = 380; y < 700; y += T) {
      suelos.create(0, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
      suelos.create(MUNDO.ancho - T, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
    }

    return suelos;
  }

  // -- Resolucion de combate -----------------------------------------------

  private resolverGolpeDelCirujano(spriteEnemigo: Phaser.GameObjects.GameObject): void {
    const devoto = spriteEnemigo.getData('devoto') as Devoto | undefined;
    if (!devoto || devoto.estaMuerto) return;

    const dano = this.cirujano.registrarGolpe(devoto);
    if (dano <= 0) return; // ya golpeado en este swing

    devoto.recibirDano(dano, this.cirujano.sprite.x);
    this.cameras.main.shake(90, 0.004);
  }

  private resolverGolpeDeDevoto(devoto: Devoto): void {
    if (devoto.estaMuerto || this.cirujano.estaMuerto) return;
    if (!devoto.consumirGolpe()) return;

    const resultado = this.cirujano.recibirDano(DEVOTO.dano, devoto.sprite.x);

    if (resultado === 'parado') {
      // Parry logrado: el Devoto queda expuesto y el Cirujano gana Fervor.
      devoto.aturdir();
      this.cameras.main.flash(90, 232, 217, 160);
      this.events.emit(EVENTOS_HUD.aviso, 'parry');
      return;
    }

    if (resultado === 'herido') {
      this.cameras.main.shake(160, 0.008);
    }
  }

  private resolverRecogidaDeFragmento(fragmento: FragmentoCodice): void {
    if (!fragmento.recoger()) return;

    this.fragmentosRecogidos += 1;
    this.events.emit(EVENTOS_HUD.codice, this.fragmentosRecogidos);
    // Aviso discreto: el lore no interrumpe la partida.
    this.events.emit(EVENTOS_HUD.aviso, 'fragmento del Codice');
  }

  // -- Altares, muerte y reaparicion ---------------------------------------

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

        this.events.emit(EVENTOS_HUD.pociones, this.cirujano.pociones);
        this.events.emit(EVENTOS_HUD.aviso, 'el Altar responde');
      }
    }
  }

  private alMorir(): void {
    if (this.reapareciendo) return;
    this.reapareciendo = true;

    this.cameras.main.shake(240, 0.012);
    this.cameras.main.fade(RETARDO_REAPARICION - 200, 11, 9, 11);

    this.time.delayedCall(RETARDO_REAPARICION, () => this.reaparecer());
  }

  private reaparecer(): void {
    const destino = this.altarActivo?.puntoReaparicion ?? { x: 80, y: 200 };

    this.cirujano.reaparecerEn(destino.x, destino.y);
    this.cameras.main.fadeIn(320, 11, 9, 11);
    this.reapareciendo = false;

    this.events.emit(EVENTOS_HUD.pociones, this.cirujano.pociones);
    this.events.emit(EVENTOS_HUD.aviso, 'las manos recuerdan');
  }

  private limpiarDevotosMuertos(): void {
    this.devotos = this.devotos.filter((devoto) => !devoto.estaMuerto);
  }

  // -- Presentacion --------------------------------------------------------

  private emitirEstadoInicial(): void {
    // Un frame de margen: el HUD debe existir antes de recibir eventos.
    this.time.delayedCall(0, () => {
      this.events.emit(EVENTOS_HUD.vitalidad, this.cirujano.vitalidad.puntos);
      this.events.emit(EVENTOS_HUD.fervor, this.cirujano.fervor.puntos);
      this.events.emit(EVENTOS_HUD.pociones, this.cirujano.pociones);
    });
  }

  /** Ayuda de Fase 2. Se retira antes de cualquier build publica. */
  private crearAyudaControles(): void {
    this.add
      .text(
        6,
        RESOLUCION.alto - 22,
        'A/D mover  ESPACIO saltar  SHIFT dash\nJ atacar (mantener = cargado)  K parry  Q pocion  E rezar',
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
