import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { pensamiento, type ClavePensamiento, type Pensamiento } from '../lore/Pensamientos';
import { RETRATOS, texturaRetrato, type ClaveRetrato } from '../lore/Retratos';
import { sonido } from '../systems/Sonido';
import { tactil } from '../input/Tactil';
import { botonTactil } from './BotonTactil';
import { toques } from '../input/Toques';

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
  nicho: 0x16110f,
  oro: 0x9a7a2c,
  quien: '#c9544c',
  texto: '#d6cfc4',
  tenue: '#6b5f55',
} as const;

/** Milisegundos por caracter. Un hombre cansado no habla deprisa. */
const MS_POR_LETRA = 28;

/** Alto de la banda inferior (px). Cabe el retrato con su placa. */
const ALTO_BANDA = 100;

/** El retrato se dibuja a 32x32 y se ve al doble: pixel entero. */
const LADO_RETRATO = 64;
const MARCO = 3;

/** Cada cuantas letras cambia la boca mientras habla. */
const LETRAS_POR_GESTO = 2;

/**
 * La voz del Cirujano y de los fieles.
 *
 * Una banda baja sobre el juego en pausa, no un panel en mitad de la pantalla:
 * lo que se dice aqui acompana al descenso, no lo interrumpe del todo. El
 * jugador sigue viendo la zona donde esta.
 *
 * A la derecha, en un nicho con filete de oro, la cara de quien habla, con su
 * nombre en una placa (issue #145, al estilo de Stardew Valley). La boca se
 * mueve solo mientras se escribe la linea y se cierra en los espacios y en los
 * signos, que es lo que hace que parezca que dice lo que se lee. Con la linea
 * entera puesta se queda quieto y parpadea de vez en cuando.
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

  private retrato!: Phaser.GameObjects.Image;
  private claveRetrato: ClaveRetrato = 'cirujano';
  private retratoY = 0;

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
    this.claveRetrato = guion?.retrato ?? 'cirujano';
    const ficha = RETRATOS[this.claveRetrato];

    const { ancho, alto } = RESOLUCION;
    const bandaY = alto - ALTO_BANDA;

    const banda = this.add.graphics();
    banda.fillStyle(COLOR.banda, 0.95);
    banda.fillRect(0, bandaY, ancho, ALTO_BANDA);
    // Filete de oro liturgico: el mismo que separa las cosas en el Codice.
    banda.lineStyle(1, COLOR.oro, 0.7);
    banda.lineBetween(0, bandaY, ancho, bandaY);

    // El nicho del retrato: piedra oscura con doble filete, como un relicario.
    const nichoX = ancho - 16 - LADO_RETRATO - MARCO * 2;
    const nichoY = bandaY + 8;
    const lado = LADO_RETRATO + MARCO * 2;
    banda.fillStyle(COLOR.nicho, 1);
    banda.fillRect(nichoX, nichoY, lado, lado);
    banda.lineStyle(1, COLOR.oro, 0.9);
    banda.strokeRect(nichoX + 0.5, nichoY + 0.5, lado - 1, lado - 1);
    banda.lineStyle(1, COLOR.oro, 0.35);
    banda.strokeRect(nichoX + 2.5, nichoY + 2.5, lado - 5, lado - 5);

    this.retratoY = nichoY + MARCO;
    this.retrato = this.add
      .image(nichoX + MARCO, this.retratoY, texturaRetrato(this.claveRetrato))
      .setOrigin(0, 0)
      .setScale(LADO_RETRATO / 32)
      .setAlpha(0);
    // Entra con un fundido corto: alguien que levanta la vista, no un cartel.
    this.tweens.add({ targets: this.retrato, alpha: 1, duration: 140 });

    // La placa con el nombre, bajo el retrato y alineada a su derecha.
    this.add
      .text(nichoX + lado, nichoY + lado + 4, ficha.nombre, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.quien,
      })
      .setOrigin(1, 0);

    this.texto = this.add.text(18, bandaY + 14, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: COLOR.texto,
      lineSpacing: 5,
      wordWrap: { width: nichoX - 18 - 14 },
    });

    this.avisoAvance = this.add
      .text(nichoX - 14, alto - 22, '', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(1, 1);

    // Saltar con el dedo: encima de la banda, a la derecha, donde no tapa la
    // cara ni el texto.
    const saltarX = ancho - 22;
    const saltarY = bandaY - 18;
    if (tactil.esAparatoTactil) {
      // Con el dedo no habia forma de saltarse la escena: ESC no existe en un
      // telefono y tocar la pantalla solo avanza de cuadro (issue #74).
      botonTactil(this, {
        x: saltarX,
        y: saltarY,
        radio: 13,
        glifo: '»',
        color: '#e8d9a0',
        alPulsar: () => this.cerrar(),
      });
    }

    this.add
      .text(14, alto - 12, tactil.esAparatoTactil ? 'toca  continuar' : 'ESC  saltar', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(0, 1);

    this.vivirRetrato();
    this.escribir();

    this.input.keyboard?.on('keydown-E', () => this.avanzar());
    this.input.keyboard?.on('keydown-SPACE', () => this.avanzar());
    this.input.keyboard?.on('keydown-ENTER', () => this.avanzar());
    this.input.keyboard?.on('keydown-ESC', () => this.cerrar());
    if (tactil.esAparatoTactil) {
      // Con el dedo, avanzar tambien va por los toques en crudo (#75), y se
      // ignora el toque que cae sobre el boton de saltar: si no, saltarse la
      // escena avanzaba un cuadro antes de cerrarla.
      const soltar = toques.alSoltar((punto) => {
        const enSaltar = Phaser.Math.Distance.Between(punto.x, punto.y, saltarX, saltarY) <= 21;
        if (!enSaltar) this.avanzar();
      });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, soltar);
    } else {
      this.input.on('pointerdown', () => this.avanzar());
    }
  }

  // -- El retrato ---------------------------------------------------------------

  /** Pone un fotograma; sin nombre, la cara en reposo. */
  private gesto(fotograma?: string): void {
    const clave = texturaRetrato(this.claveRetrato, fotograma);
    this.retrato.setTexture(
      this.textures.exists(clave) ? clave : texturaRetrato(this.claveRetrato),
    );
  }

  /** Lo que hace la cara cuando nadie habla: respirar, parpadear, el brillo. */
  private vivirRetrato(): void {
    const ficha = RETRATOS[this.claveRetrato];

    if (ficha.respira) {
      // Un pixel del dibujo arriba y abajo. A saltos, no deslizando: el retrato
      // es pixel art y medio pixel lo emborronaria.
      let arriba = false;
      this.time.addEvent({
        delay: 1300,
        loop: true,
        callback: () => {
          arriba = !arriba;
          this.retrato.y = this.retratoY - (arriba ? LADO_RETRATO / 32 : 0);
        },
      });
    }

    const destello = ficha.parpadeo ?? ficha.brillo;
    if (!destello) return;
    const programar = () => {
      this.time.delayedCall(Phaser.Math.Between(2200, 4600), () => {
        // Solo con la boca quieta: el parpadeo es de quien escucha.
        if (!this.maquina && !this.cerrando) {
          this.gesto(destello);
          this.time.delayedCall(ficha.brillo ? 220 : 130, () => {
            if (!this.maquina) this.gesto();
          });
        }
        programar();
      });
    };
    programar();
  }

  // -- El texto -----------------------------------------------------------------

  /** Escribe el cuadro actual letra a letra, moviendo la boca al ritmo. */
  private escribir(): void {
    const linea = this.cuadros[this.indice] ?? '';
    const habla = RETRATOS[this.claveRetrato].habla;
    this.texto.setText('');
    this.avisoAvance.setText('');

    let n = 0;
    this.maquina = this.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: Math.max(0, linea.length - 1),
      callback: () => {
        n += 1;
        this.texto.setText(linea.slice(0, n));
        if (habla.length > 0) {
          // La boca se cierra en los espacios y en los signos.
          const letra = linea[n - 1] ?? ' ';
          const muda = /[\s.,;:¿?¡!«»—-]/.test(letra);
          this.gesto(muda ? undefined : habla[Math.floor(n / LETRAS_POR_GESTO) % habla.length]);
        }
        if (n >= linea.length) this.terminarCuadro();
      },
    });
  }

  /** Deja el cuadro entero puesto, cierra la boca y ofrece seguir. */
  private terminarCuadro(): void {
    this.maquina?.remove();
    this.maquina = null;
    this.texto.setText(this.cuadros[this.indice] ?? '');
    this.gesto();

    const ultimo = this.indice >= this.cuadros.length - 1;
    const tecla = tactil.esAparatoTactil ? '' : 'E  ';
    this.avisoAvance.setText(`${tecla}${ultimo ? 'seguir bajando' : 'continuar'}`);
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
