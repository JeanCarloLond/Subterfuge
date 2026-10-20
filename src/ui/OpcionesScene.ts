import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { ajustes, PASOS_VOLUMEN, type NivelEfectos, type VelocidadTexto } from '../systems/Ajustes';
import { sonido } from '../systems/Sonido';
import { alternarCursor, cursorActivo, cursorEncendido } from './Cursor';
import { tactil } from '../input/Tactil';
import { botonTactil } from './BotonTactil';

/** Datos con los que se lanza: a que escena se vuelve al cerrar. */
interface DatosOpciones {
  volverA: string;
}

type Fila = 'efectos' | 'musica' | 'sonido' | 'texto' | 'silencio' | 'cursor' | 'volver';

const FILAS: readonly Fila[] = [
  'efectos',
  'musica',
  'sonido',
  'texto',
  'silencio',
  'cursor',
  'volver',
];

const EFECTOS: readonly NivelEfectos[] = ['normal', 'suaves', 'apagados'];
const TEXTOS: readonly VelocidadTexto[] = ['normal', 'rapido', 'instante'];
const NOMBRE_TEXTO: Readonly<Record<VelocidadTexto, string>> = {
  normal: 'normal',
  rapido: 'rápido',
  instante: 'al instante',
};

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
 * Opciones (issue #151). Se abre desde la pausa y desde la pantalla de inicio,
 * y sale encima de la que la abrio, que queda en pausa debajo.
 *
 * Lo que se cambia se aplica en el acto y se recuerda en este navegador: las
 * sacudidas y destellos, el volumen de la musica y el de los efectos por
 * separado, la velocidad del texto, el silencio y el cursor.
 *
 * W/S o flechas eligen la fila, A/D o flechas cambian el valor, E o clic lo
 * pasa al siguiente. Con el dedo, tocar una fila la cambia.
 */
export class OpcionesScene extends Phaser.Scene {
  private volverA = 'Pausa';
  private indice = 0;
  private filas: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'Opciones' });
  }

  create(datos: DatosOpciones): void {
    this.volverA = datos.volverA;
    this.indice = 0;

    const { ancho, alto } = RESOLUCION;
    this.add.rectangle(0, 0, ancho, alto, COLOR.velo, 0.85).setOrigin(0, 0);
    this.crearPanel();
    this.refrescar();
    this.cameras.main.fadeIn(120, 11, 9, 11);

    const teclado = this.input.keyboard;
    if (!teclado) return;
    teclado.on('keydown-ESC', () => this.cerrar());
    teclado.on('keydown-P', () => this.cerrar());
    teclado.on('keydown-UP', () => this.mover(-1));
    teclado.on('keydown-W', () => this.mover(-1));
    teclado.on('keydown-DOWN', () => this.mover(1));
    teclado.on('keydown-S', () => this.mover(1));
    teclado.on('keydown-LEFT', () => this.cambiar(-1));
    teclado.on('keydown-A', () => this.cambiar(-1));
    teclado.on('keydown-RIGHT', () => this.cambiar(1));
    teclado.on('keydown-D', () => this.cambiar(1));
    teclado.on('keydown-E', () => this.confirmar());
    teclado.on('keydown-ENTER', () => this.confirmar());
    teclado.on('keydown-SPACE', () => this.confirmar());
  }

  private crearPanel(): void {
    const conDedos = tactil.esAparatoTactil;
    const ancho = conDedos ? 320 : 280;
    const separacion = conDedos ? 26 : 18;
    const alto = 46 + FILAS.length * separacion + 24;
    const x = (RESOLUCION.ancho - ancho) / 2;
    const y = (RESOLUCION.alto - alto) / 2;

    const fondo = this.add.graphics();
    fondo.fillStyle(COLOR.panel, 1);
    fondo.fillRect(0, 0, ancho, alto);
    fondo.lineStyle(1, COLOR.borde, 1);
    fondo.strokeRect(0, 0, ancho, alto);

    const titulo = this.add
      .text(ancho / 2, 14, 'OPCIONES', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLOR.titulo,
      })
      .setOrigin(0.5, 0);

    this.filas = FILAS.map((_, i) => {
      const texto = this.add
        .text(ancho / 2, 46 + i * separacion, '', {
          fontFamily: 'monospace',
          fontSize: conDedos ? '10px' : '9px',
          color: COLOR.texto,
        })
        .setOrigin(0.5, 0);
      texto.setInteractive({ cursor: cursorActivo() });
      texto.on('pointerover', () => {
        if (this.indice === i) return;
        this.indice = i;
        sonido.interfazMover();
        this.refrescar();
      });
      texto.on('pointerdown', () => {
        this.indice = i;
        this.confirmar();
      });
      return texto;
    });

    const pie = this.add
      .text(
        ancho / 2,
        alto - 16,
        conDedos ? 'toca una fila para cambiarla' : 'W S  elegir     A D  cambiar     ESC  volver',
        { fontFamily: 'monospace', fontSize: '7px', color: COLOR.tenue },
      )
      .setOrigin(0.5, 0);

    const panel = this.add.container(x, y, [fondo, titulo, ...this.filas, pie]);
    if (conDedos) {
      panel.add(
        botonTactil(this, {
          x: ancho - 14,
          y: 14,
          radio: 12,
          glifo: '×',
          color: COLOR.titulo,
          alPulsar: () => this.cerrar(),
        }),
      );
    }
  }

  private etiqueta(fila: Fila): string {
    // Separados: juntos, cinco cuadros llenos se leian como una sola barra.
    const barra = (paso: number) =>
      [...'■'.repeat(paso), ...'□'.repeat(PASOS_VOLUMEN - paso)].join(' ');
    switch (fila) {
      case 'efectos':
        return `Sacudidas y destellos: ${ajustes.efectos}`;
      case 'musica':
        return `Música   ${barra(ajustes.pasoMusica)}`;
      case 'sonido':
        return `Efectos  ${barra(ajustes.pasoSonido)}`;
      case 'texto':
        return `Texto: ${NOMBRE_TEXTO[ajustes.texto]}`;
      case 'silencio':
        return sonido.estaSilenciado ? 'Sonido: apagado' : 'Sonido: encendido';
      case 'cursor':
        return cursorEncendido() ? 'Cursor: bisturí' : 'Cursor: del sistema';
      default:
        return 'Volver';
    }
  }

  private refrescar(): void {
    const altoZona = tactil.esAparatoTactil ? 24 : 16;
    FILAS.forEach((fila, i) => {
      const activa = i === this.indice;
      const texto = this.filas[i];
      texto.setText(`${activa ? '>  ' : ''}${this.etiqueta(fila)}${activa ? '  <' : ''}`);
      texto.setColor(activa ? COLOR.activo : COLOR.texto);
      texto.input?.hitArea.setSize(260, altoZona);
      texto.input?.hitArea.setPosition(texto.width / 2 - 130, (12 - altoZona) / 2);
    });
  }

  private mover(delta: number): void {
    sonido.interfazMover();
    this.indice = (this.indice + delta + FILAS.length) % FILAS.length;
    this.refrescar();
  }

  /** E o clic: el siguiente valor, dando la vuelta. En "Volver", cierra. */
  private confirmar(): void {
    if (FILAS[this.indice] === 'volver') {
      this.cerrar();
      return;
    }
    this.cambiar(1, true);
  }

  private cambiar(delta: number, daLaVuelta = false): void {
    const fila = FILAS[this.indice];
    const ciclo = <T>(lista: readonly T[], actual: T): T => {
      const i = lista.indexOf(actual) + delta;
      if (daLaVuelta) return lista[(i + lista.length) % lista.length];
      return lista[Phaser.Math.Clamp(i, 0, lista.length - 1)];
    };
    const paso = (actual: number): number => {
      const n = actual + delta;
      if (daLaVuelta) return (n + PASOS_VOLUMEN + 1) % (PASOS_VOLUMEN + 1);
      return Phaser.Math.Clamp(n, 0, PASOS_VOLUMEN);
    };

    switch (fila) {
      case 'efectos':
        ajustes.cambiar('efectos', ciclo(EFECTOS, ajustes.efectos));
        break;
      case 'musica':
        ajustes.cambiar('musica', paso(ajustes.pasoMusica));
        break;
      case 'sonido':
        ajustes.cambiar('sonido', paso(ajustes.pasoSonido));
        break;
      case 'texto':
        ajustes.cambiar('texto', ciclo(TEXTOS, ajustes.texto));
        break;
      case 'silencio':
        sonido.alternarSilencio();
        break;
      case 'cursor':
        alternarCursor();
        break;
      default:
        return;
    }
    // Suena al volumen nuevo: es como se comprueba el de los efectos.
    sonido.interfazMover();
    this.refrescar();
  }

  private cerrar(): void {
    this.input.keyboard?.removeAllListeners();
    sonido.interfazCerrar();
    this.scene.resume(this.volverA);
    this.scene.stop();
  }
}
