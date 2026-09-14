import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { CONTROLES_COMBATE, CONTROLES_MOVIMIENTO, CONTROLES_SISTEMA } from './TextoControles';

/** Datos con los que se lanza: que escena de juego hay que reanudar. */
interface DatosPausa {
  escenaJuego: string;
}

type Opcion = 'continuar' | 'controles' | 'sonido' | 'atrio';

const COLOR = {
  velo: 0x0b090b,
  panel: 0x141014,
  borde: 0x4a4038,
  titulo: '#8c2f2f',
  texto: '#d6cfc4',
  tenue: '#6b5f55',
  activo: '#e8d9a0',
} as const;

/**
 * Menu de pausa.
 *
 * Se abre con ESC o P sobre la escena de juego, que queda en pausa debajo
 * (fisica, temporizadores y entrada incluidos). Cuatro opciones, las justas:
 * continuar, ver los controles, sonido, y volver al Atrio para empezar de
 * nuevo. No hay "salir": es un juego de navegador.
 *
 * Se navega con W/S o flechas y se confirma con E, ENTER o ESPACIO. ESC o P
 * cierran, salvo dentro de los controles, donde vuelven al menu.
 */
export class PausaScene extends Phaser.Scene {
  private escenaJuego = 'Atrio';
  private indice = 0;
  private mostrandoControles = false;

  private opciones: Phaser.GameObjects.Text[] = [];
  private panelControles!: Phaser.GameObjects.Container;
  private panelMenu!: Phaser.GameObjects.Container;

  private static readonly OPCIONES: readonly Opcion[] = [
    'continuar',
    'controles',
    'sonido',
    'atrio',
  ];

  constructor() {
    super({ key: 'Pausa' });
  }

  create(datos: DatosPausa): void {
    this.escenaJuego = datos.escenaJuego;
    this.indice = 0;
    this.mostrandoControles = false;

    const { ancho, alto } = RESOLUCION;

    this.add.rectangle(0, 0, ancho, alto, COLOR.velo, 0.8).setOrigin(0, 0);

    this.panelMenu = this.crearMenu();
    this.panelControles = this.crearControles();
    this.panelControles.setVisible(false);

    this.refrescar();
    this.cameras.main.fadeIn(140, 11, 9, 11);

    const teclado = this.input.keyboard;
    if (!teclado) return;

    teclado.on('keydown-ESC', () => this.cerrarOVolver());
    teclado.on('keydown-P', () => this.cerrarOVolver());
    teclado.on('keydown-UP', () => this.mover(-1));
    teclado.on('keydown-W', () => this.mover(-1));
    teclado.on('keydown-DOWN', () => this.mover(1));
    teclado.on('keydown-S', () => this.mover(1));
    teclado.on('keydown-E', () => this.confirmar());
    teclado.on('keydown-ENTER', () => this.confirmar());
    teclado.on('keydown-SPACE', () => this.confirmar());
  }

  // -- Construccion --------------------------------------------------------

  private crearMenu(): Phaser.GameObjects.Container {
    const ancho = 200;
    const alto = 150;
    const x = (RESOLUCION.ancho - ancho) / 2;
    const y = (RESOLUCION.alto - alto) / 2;

    const fondo = this.add.graphics();
    fondo.fillStyle(COLOR.panel, 1);
    fondo.fillRect(0, 0, ancho, alto);
    fondo.lineStyle(1, COLOR.borde, 1);
    fondo.strokeRect(0, 0, ancho, alto);

    const titulo = this.add.text(ancho / 2, 14, 'PAUSA', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: COLOR.titulo,
    });
    titulo.setOrigin(0.5, 0);

    this.opciones = PausaScene.OPCIONES.map((_, i) =>
      this.add
        .text(ancho / 2, 46 + i * 20, '', {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: COLOR.texto,
        })
        .setOrigin(0.5, 0),
    );

    const pie = this.add
      .text(ancho / 2, alto - 16, 'W S  elegir     E  confirmar', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(0.5, 0);

    return this.add.container(x, y, [fondo, titulo, ...this.opciones, pie]);
  }

  private crearControles(): Phaser.GameObjects.Container {
    const ancho = 464;
    const alto = 172;
    const x = (RESOLUCION.ancho - ancho) / 2;
    const y = (RESOLUCION.alto - alto) / 2;

    const fondo = this.add.graphics();
    fondo.fillStyle(COLOR.panel, 1);
    fondo.fillRect(0, 0, ancho, alto);
    fondo.lineStyle(1, COLOR.borde, 1);
    fondo.strokeRect(0, 0, ancho, alto);

    const estilo = { fontFamily: 'monospace', fontSize: '8px', color: COLOR.texto, lineSpacing: 3 };
    const estiloTenue = { ...estilo, color: COLOR.tenue };

    const titulo = this.add.text(10, 8, 'CONTROLES', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: COLOR.activo,
    });
    const movimiento = this.add.text(12, 26, CONTROLES_MOVIMIENTO.join('\n'), estilo);
    const combate = this.add.text(236, 26, CONTROLES_COMBATE.join('\n'), estilo);
    const sistema = this.add.text(12, 118, CONTROLES_SISTEMA.join('\n'), estiloTenue);
    const pie = this.add.text(10, alto - 16, 'ESC  volver', estiloTenue);

    return this.add.container(x, y, [fondo, titulo, movimiento, combate, sistema, pie]);
  }

  // -- Navegacion ----------------------------------------------------------

  private etiqueta(opcion: Opcion): string {
    switch (opcion) {
      case 'continuar':
        return 'Continuar';
      case 'controles':
        return 'Controles';
      case 'sonido':
        return sonido.estaSilenciado ? 'Sonido: apagado' : 'Sonido: encendido';
      default:
        return 'Volver al Atrio';
    }
  }

  private refrescar(): void {
    PausaScene.OPCIONES.forEach((opcion, i) => {
      const activa = i === this.indice;
      this.opciones[i].setText(
        `${activa ? '>  ' : ''}${this.etiqueta(opcion)}${activa ? '  <' : ''}`,
      );
      this.opciones[i].setColor(activa ? COLOR.activo : COLOR.texto);
    });
  }

  private mover(delta: number): void {
    if (this.mostrandoControles) return;
    sonido.interfazMover();
    const total = PausaScene.OPCIONES.length;
    this.indice = (this.indice + delta + total) % total;
    this.refrescar();
  }

  private confirmar(): void {
    if (this.mostrandoControles) {
      this.ocultarControles();
      return;
    }

    switch (PausaScene.OPCIONES[this.indice]) {
      case 'continuar':
        this.cerrar();
        break;
      case 'controles':
        this.mostrarControles();
        break;
      case 'sonido':
        sonido.alternarSilencio();
        this.refrescar();
        break;
      case 'atrio':
        this.volverAlAtrio();
        break;
    }
  }

  private cerrarOVolver(): void {
    if (this.mostrandoControles) {
      this.ocultarControles();
      return;
    }
    this.cerrar();
  }

  private mostrarControles(): void {
    this.mostrandoControles = true;
    this.panelMenu.setVisible(false);
    this.panelControles.setVisible(true);
  }

  private ocultarControles(): void {
    this.mostrandoControles = false;
    this.panelControles.setVisible(false);
    this.panelMenu.setVisible(true);
  }

  // -- Salidas -------------------------------------------------------------

  private cerrar(): void {
    this.input.keyboard?.removeAllListeners();
    sonido.interfazCerrar();
    musica.atenuar(false);
    this.scene.resume(this.escenaJuego);
    this.scene.stop();
  }

  /** Partida nueva: se olvida el progreso y se vuelve arriba del todo. */
  private volverAlAtrio(): void {
    this.input.keyboard?.removeAllListeners();
    progreso.reiniciar();
    musica.atenuar(false);

    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    this.scene.stop(this.escenaJuego);
    this.scene.stop();
    this.scene.start('Atrio');
  }
}
