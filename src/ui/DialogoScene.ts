import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { pensamiento, type ClavePensamiento, type Pensamiento } from '../lore/Pensamientos';
import { sonido } from '../systems/Sonido';

/**
 * Datos con los que se lanza: a quien hay que reanudar y que se dice.
 *
 * O una `clave` de los pensamientos del Cirujano, o un `dialogo` suelto. Lo
 * segundo es para los fieles con los que se puede hablar (issue #60): su texto
 * no vive en Pensamientos porque no lo piensa el protagonista, lo dice otro.
 */
interface DatosDialogo {
  escenaJuego: string;
  clave?: ClavePensamiento;
  dialogo?: Pensamiento;
}

const COLOR = {
  banda: 0x0b090b,
  oro: 0x9a7a2c,
  quien: '#8c2f2f',
  texto: '#d6cfc4',
  tenue: '#6b5f55',
} as const;

/** Milisegundos por caracter. Un hombre cansado no habla deprisa. */
const MS_POR_LETRA = 28;

/** Alto de la banda inferior (px). */
const ALTO_BANDA = 88;

/**
 * La voz del Cirujano.
 *
 * Una banda baja sobre el juego en pausa, no un panel en mitad de la pantalla:
 * lo que se dice aqui acompana al descenso, no lo interrumpe del todo. El
 * jugador sigue viendo la zona donde esta.
 *
 * El texto se escribe letra a letra porque es un pensamiento formandose, no un
 * cartel que aparece. Pulsar mientras escribe lo termina de golpe; pulsar con
 * la linea entera puesta pasa al siguiente cuadro. Asi el que lee rapido nunca
 * espera, que es la unica forma de que un texto opcional no moleste.
 *
 * ESC lo salta entero. Es deliberado y esta anunciado en pantalla: la ruta
 * Atrio -> Final tiene que poder jugarse sin leer una sola linea.
 */
export class DialogoScene extends Phaser.Scene {
  private escenaJuego = 'Atrio';
  private cuadros: readonly string[] = [];
  private indice = 0;

  private texto!: Phaser.GameObjects.Text;
  private avisoAvance!: Phaser.GameObjects.Text;

  /** Temporizador de la escritura letra a letra; null si ya termino. */
  private maquina: Phaser.Time.TimerEvent | null = null;
  private cerrando = false;

  constructor() {
    super({ key: 'Dialogo' });
  }

  create(datos: DatosDialogo): void {
    this.escenaJuego = datos.escenaJuego;
    const guion = datos.dialogo ?? (datos.clave ? pensamiento(datos.clave) : undefined);
    this.cuadros = guion?.cuadros ?? [];
    this.indice = 0;
    this.cerrando = false;

    const { ancho, alto } = RESOLUCION;
    const bandaY = alto - ALTO_BANDA;

    const banda = this.add.graphics();
    banda.fillStyle(COLOR.banda, 0.95);
    banda.fillRect(0, bandaY, ancho, ALTO_BANDA);
    // Filete de oro liturgico: el mismo que separa las cosas en el Codice.
    banda.lineStyle(1, COLOR.oro, 0.7);
    banda.lineBetween(0, bandaY, ancho, bandaY);

    const quien = guion?.quien;
    if (quien) {
      this.add.text(18, bandaY + 10, quien, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLOR.quien,
      });
    }

    this.texto = this.add.text(18, bandaY + (quien ? 26 : 18), '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: COLOR.texto,
      lineSpacing: 5,
      wordWrap: { width: ancho - 36 },
    });

    this.avisoAvance = this.add
      .text(ancho - 14, alto - 14, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(1, 1);

    this.add.text(14, alto - 14, 'ESC  saltar', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: COLOR.tenue,
    });

    this.escribir();

    this.input.keyboard?.on('keydown-E', () => this.avanzar());
    this.input.keyboard?.on('keydown-SPACE', () => this.avanzar());
    this.input.keyboard?.on('keydown-ENTER', () => this.avanzar());
    this.input.keyboard?.on('keydown-ESC', () => this.cerrar());
    this.input.on('pointerdown', () => this.avanzar());
  }

  /** Escribe el cuadro actual letra a letra. */
  private escribir(): void {
    const linea = this.cuadros[this.indice] ?? '';
    this.texto.setText('');
    this.avisoAvance.setText('');

    let n = 0;
    this.maquina = this.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: linea.length - 1,
      callback: () => {
        n += 1;
        this.texto.setText(linea.slice(0, n));
        if (n >= linea.length) this.terminarCuadro();
      },
    });
  }

  /** Deja el cuadro entero puesto y ofrece seguir. */
  private terminarCuadro(): void {
    this.maquina?.remove();
    this.maquina = null;
    this.texto.setText(this.cuadros[this.indice] ?? '');

    const ultimo = this.indice >= this.cuadros.length - 1;
    this.avisoAvance.setText(ultimo ? 'E  seguir bajando' : 'E  continuar');
  }

  /**
   * Un solo boton para las dos cosas: si aun esta escribiendo, la completa;
   * si ya esta entera, pasa de cuadro. El que lee rapido nunca espera.
   */
  private avanzar(): void {
    if (this.cerrando) return;

    if (this.maquina) {
      this.terminarCuadro();
      return;
    }

    this.indice += 1;
    if (this.indice >= this.cuadros.length) {
      this.cerrar();
      return;
    }

    sonido.interfazMover();
    this.escribir();
  }

  private cerrar(): void {
    if (this.cerrando) return;
    this.cerrando = true;

    this.maquina?.remove();
    this.maquina = null;
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    sonido.interfazCerrar();
    this.scene.resume(this.escenaJuego);
    this.scene.stop();
  }
}
