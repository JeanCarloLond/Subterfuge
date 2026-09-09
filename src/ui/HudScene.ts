import Phaser from 'phaser';
import { FERVOR, POCION, VITALIDAD } from '../config/Sacramento';

/** Nombres de los eventos que la escena de juego emite para el HUD. */
export const EVENTOS_HUD = {
  vitalidad: 'hud-vitalidad',
  fervor: 'hud-fervor',
  pociones: 'hud-pociones',
  codice: 'hud-codice',
  aviso: 'hud-aviso',
} as const;

const COLOR = {
  carne: 0x8c2f2f,
  carneVacia: 0x2e2222,
  fervor: 0xe8d9a0,
  fervorVacio: 0x2f2c24,
  frasco: 0xa8563f,
  frascoVacio: 0x2e2220,
  borde: 0x0b090b,
} as const;

/**
 * HUD del teaser.
 *
 * Corre como escena paralela a la de juego y se alimenta solo de eventos, para
 * que la interfaz no conozca a las entidades. Lexico de la Diocesis: Fervor y
 * Pocion de Carne, nunca "mana" ni "health potion".
 *
 * Los indicadores se distinguen por forma ademas de por color (relleno vs.
 * contorno), para que sigan siendo legibles con daltonismo.
 */
export class HudScene extends Phaser.Scene {
  private grafico!: Phaser.GameObjects.Graphics;
  private textoCodice!: Phaser.GameObjects.Text;
  private textoAviso!: Phaser.GameObjects.Text;

  private vitalidadActual: number = VITALIDAD.maxima;
  private fervorActual: number = FERVOR.inicial;
  private pocionesActuales: number = POCION.cargasMaximas;
  private fragmentos = 0;

  constructor() {
    super({ key: 'Hud' });
  }

  create(): void {
    this.grafico = this.add.graphics();

    this.textoCodice = this.add.text(8, 44, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#6b5f55',
    });

    // Avisos discretos (fragmento recogido, altar). Nunca bloquean la accion.
    this.textoAviso = this.add
      .text(this.scale.width - 8, 8, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.escucharEscenaDeJuego();
    this.redibujar();
  }

  private escucharEscenaDeJuego(): void {
    const juego = this.scene.get('Atrio');
    if (!juego) return;

    juego.events.on(EVENTOS_HUD.vitalidad, (puntos: number) => {
      this.vitalidadActual = puntos;
      this.redibujar();
    });

    juego.events.on(EVENTOS_HUD.fervor, (puntos: number) => {
      this.fervorActual = puntos;
      this.redibujar();
    });

    juego.events.on(EVENTOS_HUD.pociones, (cargas: number) => {
      this.pocionesActuales = cargas;
      this.redibujar();
    });

    juego.events.on(EVENTOS_HUD.codice, (total: number) => {
      this.fragmentos = total;
      this.redibujar();
    });

    juego.events.on(EVENTOS_HUD.aviso, (texto: string) => this.mostrarAviso(texto));

    // Si la escena de juego se reinicia, el HUD deja de escuchar la anterior.
    juego.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      juego.events.off(EVENTOS_HUD.vitalidad);
      juego.events.off(EVENTOS_HUD.fervor);
      juego.events.off(EVENTOS_HUD.pociones);
      juego.events.off(EVENTOS_HUD.codice);
      juego.events.off(EVENTOS_HUD.aviso);
    });
  }

  private redibujar(): void {
    this.grafico.clear();

    this.dibujarVitalidad(8, 8);
    this.dibujarFervor(8, 22);
    this.dibujarPociones(8, 32);

    this.textoCodice.setText(
      this.fragmentos > 0 ? `codice  ${this.fragmentos}` : '',
    );
  }

  /** Carne: un segmento por punto. El cuerpo del Cirujano tambien es moneda. */
  private dibujarVitalidad(x: number, y: number): void {
    const ancho = 9;
    const alto = 8;
    const separacion = 2;

    for (let i = 0; i < VITALIDAD.maxima; i += 1) {
      const lleno = i < this.vitalidadActual;
      const px = x + i * (ancho + separacion);

      this.grafico.fillStyle(lleno ? COLOR.carne : COLOR.carneVacia, 1);
      this.grafico.fillRect(px, y, ancho, alto);
      this.grafico.lineStyle(1, COLOR.borde, 1);
      this.grafico.strokeRect(px, y, ancho, alto);
    }
  }

  /** Fervor: barra continua. Se gana con el cuerpo, no con el tiempo. */
  private dibujarFervor(x: number, y: number): void {
    const ancho = 64;
    const alto = 5;
    const proporcion = Phaser.Math.Clamp(this.fervorActual / FERVOR.maximo, 0, 1);

    this.grafico.fillStyle(COLOR.fervorVacio, 1);
    this.grafico.fillRect(x, y, ancho, alto);

    this.grafico.fillStyle(COLOR.fervor, 1);
    this.grafico.fillRect(x, y, ancho * proporcion, alto);

    this.grafico.lineStyle(1, COLOR.borde, 1);
    this.grafico.strokeRect(x, y, ancho, alto);

    // Marca del umbral del ataque cargado: el jugador debe poder anticiparlo.
    const umbral = x + ancho * 0.3;
    this.grafico.lineStyle(1, COLOR.borde, 1);
    this.grafico.lineBetween(umbral, y, umbral, y + alto);
  }

  private dibujarPociones(x: number, y: number): void {
    const lado = 5;
    const separacion = 3;

    for (let i = 0; i < POCION.cargasMaximas; i += 1) {
      const disponible = i < this.pocionesActuales;
      const px = x + i * (lado + separacion);

      if (disponible) {
        this.grafico.fillStyle(COLOR.frasco, 1);
        this.grafico.fillRect(px, y, lado, lado);
      } else {
        // Vacia: solo contorno. Distinguible sin depender del color.
        this.grafico.fillStyle(COLOR.frascoVacio, 1);
        this.grafico.fillRect(px, y, lado, lado);
        this.grafico.lineStyle(1, COLOR.frasco, 1);
        this.grafico.strokeRect(px, y, lado, lado);
      }
    }
  }

  private mostrarAviso(texto: string): void {
    this.textoAviso.setText(texto);
    this.tweens.killTweensOf(this.textoAviso);
    this.textoAviso.setAlpha(1);

    this.tweens.add({
      targets: this.textoAviso,
      alpha: 0,
      delay: 1600,
      duration: 700,
      ease: 'Quad.easeIn',
    });
  }
}
