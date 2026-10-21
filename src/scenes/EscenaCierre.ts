import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { guardado } from '../systems/Guardado';
import { tactil } from '../input/Tactil';
import { toques } from '../input/Toques';
import { cursorActivo } from '../ui/Cursor';

/** Una salida del cierre: lo que se lee y a donde lleva. */
export interface OpcionCierre {
  etiqueta: string;
  elegir: () => void;
}

const COLOR = { texto: '#4a4038', activo: '#d6cfc4' };

/**
 * Lo comun a los cierres de nivel: el recuento de lo encontrado, las entradas
 * escalonadas y las salidas que se eligen al final.
 *
 * Con el Nivel 2 (#156) el cierre del Nivel 1 dejo de ser el final del juego:
 * ahora ofrece seguir huyendo o volver al Atrio. Cada nivel cuenta lo SUYO
 * —sus hojas, sus reliquias— y el Registro hasta donde se ha podido ver.
 *
 * Restriccion del universo que cualquier texto aqui debe respetar: los
 * Primigenios son ciegos. No pueden "mirar", "observar" ni "ver" nada.
 */
export abstract class EscenaCierre extends Phaser.Scene {
  /**
   * Desde cuando valen los toques y las teclas. El dedo que salta una
   * cinematica manteniendo pulsado no puede, al levantarse, elegir una salida.
   */
  protected listoDesde = Infinity;
  private opciones: OpcionCierre[] = [];
  private textos: Phaser.GameObjects.Text[] = [];
  private indice = 0;
  private eligiendo = false;

  /** Prepara el estado de una visita nueva: Phaser reutiliza la instancia. */
  protected empezarCierre(): void {
    this.listoDesde = Infinity;
    this.opciones = [];
    this.textos = [];
    this.indice = 0;
    this.eligiendo = false;
  }

  /**
   * Las salidas, abajo, una por linea. Se eligen con arriba/abajo y E, Enter o
   * Espacio (el mando entra por las mismas teclas), con el raton, o tocando la
   * linea. R vuelve al Atrio siempre, como antes.
   */
  protected crearSalidas(opciones: OpcionCierre[], retardoMs: number): void {
    this.opciones = opciones;
    const dedos = tactil.esAparatoTactil;
    const paso = dedos ? 24 : 18;
    const y0 = RESOLUCION.alto - 26 - paso * (opciones.length - 1);

    this.textos = opciones.map((opcion, i) => {
      const texto = this.add
        .text(RESOLUCION.ancho / 2, y0 + i * paso, opcion.etiqueta, {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: COLOR.texto,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0);
      if (!dedos) {
        texto.setInteractive({ cursor: cursorActivo() });
        texto.on('pointerover', () => this.seleccionar(i));
        texto.on('pointerdown', () => this.confirmar(i));
      }
      this.aparecer(texto, retardoMs);
      return texto;
    });
    this.refrescar();

    // Con el dedo, la linea entera es el boton: acertar en ocho pixeles de
    // texto no es una forma de cerrar un juego (#75).
    if (dedos) {
      const soltar = toques.alSoltar((punto, inicio) => {
        if (inicio < this.listoDesde) return;
        const i = this.textos.findIndex((t) => Math.abs(punto.y - t.y) <= paso / 2);
        if (i >= 0) this.confirmar(i);
      });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, soltar);
    }

    const teclado = this.input.keyboard;
    teclado?.on('keydown-UP', () => this.mover(-1));
    teclado?.on('keydown-W', () => this.mover(-1));
    teclado?.on('keydown-DOWN', () => this.mover(1));
    teclado?.on('keydown-S', () => this.mover(1));
    for (const tecla of ['E', 'ENTER', 'SPACE']) {
      teclado?.on(`keydown-${tecla}`, () => this.confirmar(this.indice));
    }
    teclado?.on('keydown-R', () => {
      if (this.listo()) this.volverAlAtrio();
    });
  }

  /** Empezar de cero: se pierde lo recogido y el descenso guardado. */
  protected volverAlAtrio(): void {
    this.salir(() => {
      progreso.reiniciar();
      guardado.borrar();
      this.scene.start('Atrio');
    });
  }

  /** Fundido a negro y, al terminar, `alFinal`. Solo una vez por visita. */
  protected salir(alFinal: () => void): void {
    if (this.eligiendo) return;
    this.eligiendo = true;
    this.cameras.main.fade(400, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, alFinal);
  }

  /**
   * Recuento de un nivel. Es la recompensa por explorar y el motivo por el que
   * un lore-hunter vuelve a bajar.
   */
  protected textoRecuento(nivel: 1 | 2): string {
    const fragmentos = progreso.fragmentosDelNivel(nivel);
    const reliquias = progreso.reliquiasDelNivel(nivel);
    const codice =
      fragmentos === 0
        ? 'ningún fragmento del Códice'
        : `${fragmentos} de ${progreso.fragmentosTotalesDelNivel(nivel)} fragmentos del Códice`;
    const relicario =
      reliquias === 0
        ? ''
        : `   ·   ${reliquias} de ${progreso.reliquiasTotalesDelNivel(nivel)} reliquias`;
    // El Registro tambien cuenta: es la mitad del libro, y catalogarlo entero
    // exige haberse cruzado con todo lo que el Vientre tiene dentro.
    const registro = `   ·   ${progreso.fichasHasta(nivel)} de ${progreso.fichasTotalesHasta(nivel)} fichas`;
    return codice + relicario + registro;
  }

  protected aparecer(objeto: Phaser.GameObjects.Text, retardoMs: number): void {
    this.tweens.add({
      targets: objeto,
      alpha: 1,
      delay: retardoMs,
      duration: 900,
      ease: 'Quad.easeOut',
    });
  }

  private listo(): boolean {
    return performance.now() >= this.listoDesde;
  }

  private mover(paso: number): void {
    if (!this.listo() || this.opciones.length < 2) return;
    this.seleccionar((this.indice + paso + this.opciones.length) % this.opciones.length);
  }

  private seleccionar(i: number): void {
    this.indice = i;
    this.refrescar();
  }

  private confirmar(i: number): void {
    if (!this.listo()) return;
    this.opciones[i]?.elegir();
  }

  private refrescar(): void {
    const marcar = this.opciones.length > 1;
    this.textos.forEach((texto, i) => {
      const activa = i === this.indice;
      const etiqueta = this.opciones[i].etiqueta;
      texto.setText(marcar && activa ? `>  ${etiqueta}  <` : etiqueta);
      texto.setColor(activa ? COLOR.activo : COLOR.texto);
    });
  }
}
