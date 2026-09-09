import Phaser from 'phaser';
import { CirujanoSacerdote } from '../entities/CirujanoSacerdote';
import { Controles } from '../input/Controles';
import { RESOLUCION } from '../config/Sacramento';

/** Dimensiones del mundo de pruebas. Vertical: el Vientre se desciende. */
const MUNDO = { ancho: 960, alto: 1120 } as const;

/** Plataforma de prueba: [x, y, anchoEnTiles]. y crece hacia abajo. */
type Plataforma = readonly [number, number, number];

/**
 * El Atrio: la superficie, la ciudad visible donde vive la mayoria.
 * Es el nivel mas luminoso del juego; cada descenso posterior debe ser mas
 * oscuro, organico y peligroso que este.
 *
 * FASE 1 (prototipo): geometria provisional por codigo para validar el kit de
 * movimiento. Sin combate, sin enemigos, sin lore escrito. En Fase 2 esta
 * geometria se sustituye por un tilemap de Tiled (assets/maps/atrio.tmj).
 */
export class AtrioScene extends Phaser.Scene {
  private cirujano!: CirujanoSacerdote;
  private controles!: Controles;
  private hud!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Atrio' });
  }

  create(): void {
    this.physics.world.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.cameras.main.setBounds(0, 0, MUNDO.ancho, MUNDO.alto);
    this.cameras.main.setBackgroundColor('#141014');

    const suelos = this.construirGeometria();

    this.controles = new Controles(this);
    this.cirujano = new CirujanoSacerdote(this, 80, 200, this.controles);
    this.physics.add.collider(this.cirujano.sprite, suelos);

    this.cameras.main.startFollow(this.cirujano.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);

    this.crearHud();
  }

  update(): void {
    this.cirujano.actualizar();
    this.actualizarHud();
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

  private crearHud(): void {
    this.hud = this.add
      .text(6, 6, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#d6cfc4',
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(6, RESOLUCION.alto - 22, 'A/D mover  ESPACIO saltar  SHIFT dash', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#6b5f55',
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  /** HUD de depuracion de Fase 1. Se retira antes de cualquier build publica. */
  private actualizarHud(): void {
    const v = this.cirujano.cuerpo.velocity;
    this.hud.setText(
      [
        `estado: ${this.cirujano.estadoActual}`,
        `vel: ${v.x.toFixed(0)}, ${v.y.toFixed(0)}`,
        this.cirujano.esInvulnerable ? 'i-frames' : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
}
