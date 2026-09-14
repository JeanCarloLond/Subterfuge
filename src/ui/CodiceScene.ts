import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { CODICE, fragmentoPorId } from '../lore/Codice';
import { progreso } from '../systems/Progreso';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';

/** Datos con los que se lanza: que escena de juego hay que reanudar al cerrar. */
interface DatosCodice {
  escenaJuego: string;
}

const COLOR = {
  fondo: 0x0b090b,
  panel: 0x141014,
  borde: 0x4a4038,
  pergamino: '#e8d9a0',
  texto: '#d6cfc4',
  tenue: '#6b5f55',
  margen: '#c98a8a',
  sinLeer: '#e8d9a0',
} as const;

/**
 * Lectura del Codice de la Carne.
 *
 * Se abre con L sobre la escena de juego, que queda en pausa debajo. A la
 * izquierda, el indice de fragmentos recogidos (los que faltan aparecen como
 * huecos: el jugador sabe cuantos hay sin saber donde). A la derecha, el
 * versiculo y, en otra tinta, la anotacion al margen.
 *
 * Recoger un fragmento NO abre esta pantalla: el lore es opcional y no
 * interrumpe la accion. Se lee cuando el jugador quiere.
 */
export class CodiceScene extends Phaser.Scene {
  private escenaJuego = 'Atrio';
  private indice = 0;
  private ids: string[] = [];

  private tituloTexto!: Phaser.GameObjects.Text;
  private citaTexto!: Phaser.GameObjects.Text;
  private versiculoTexto!: Phaser.GameObjects.Text;
  private margenTexto!: Phaser.GameObjects.Text;
  private indiceTextos: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'Codice' });
  }

  create(datos: DatosCodice): void {
    this.escenaJuego = datos.escenaJuego;
    this.ids = progreso.idsRecogidosEnOrden;
    this.indice = this.primerSinLeer();

    const { ancho, alto } = RESOLUCION;

    // Velo sobre el juego en pausa.
    this.add.rectangle(0, 0, ancho, alto, COLOR.fondo, 0.82).setOrigin(0, 0);

    const panelX = 24;
    const panelY = 20;
    const panelAncho = ancho - 48;
    const panelAlto = alto - 40;

    const panel = this.add.graphics();
    panel.fillStyle(COLOR.panel, 1);
    panel.fillRect(panelX, panelY, panelAncho, panelAlto);
    panel.lineStyle(1, COLOR.borde, 1);
    panel.strokeRect(panelX, panelY, panelAncho, panelAlto);
    // Separador entre indice y lectura.
    panel.lineBetween(panelX + 118, panelY + 8, panelX + 118, panelY + panelAlto - 8);

    this.add.text(panelX + 10, panelY + 8, 'EL CODICE DE LA CARNE', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: COLOR.pergamino,
    });

    this.crearIndice(panelX + 10, panelY + 26);

    const lecturaX = panelX + 130;
    this.citaTexto = this.add.text(lecturaX, panelY + 8, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: COLOR.tenue,
    });
    this.tituloTexto = this.add.text(lecturaX, panelY + 20, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: COLOR.pergamino,
    });
    this.versiculoTexto = this.add.text(lecturaX, panelY + 42, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: COLOR.texto,
      lineSpacing: 4,
      wordWrap: { width: panelAncho - 150 },
    });
    this.margenTexto = this.add.text(lecturaX, panelY + 42, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'italic',
      color: COLOR.margen,
      lineSpacing: 4,
      wordWrap: { width: panelAncho - 150 },
    });

    this.add.text(
      panelX + 10,
      panelY + panelAlto - 16,
      'W S  o  flechas: cambiar        L  o  ESC: cerrar',
      { fontFamily: 'monospace', fontSize: '8px', color: COLOR.tenue },
    );

    this.mostrar(this.indice);
    this.cameras.main.fadeIn(180, 11, 9, 11);
    sonido.codice();

    this.input.keyboard?.on('keydown-L', () => this.cerrar());
    this.input.keyboard?.on('keydown-ESC', () => this.cerrar());
    this.input.keyboard?.on('keydown-UP', () => this.mover(-1));
    this.input.keyboard?.on('keydown-W', () => this.mover(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.mover(1));
    this.input.keyboard?.on('keydown-S', () => this.mover(1));
  }

  private crearIndice(x: number, y: number): void {
    this.indiceTextos = [];

    CODICE.forEach((fragmento, i) => {
      const recogido = progreso.estaRecogido(fragmento.id);
      const texto = this.add.text(x, y + i * 14, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: recogido ? COLOR.texto : COLOR.tenue,
      });
      this.indiceTextos.push(texto);
    });

    this.refrescarIndice();
  }

  private refrescarIndice(): void {
    CODICE.forEach((fragmento, i) => {
      const texto = this.indiceTextos[i];
      const recogido = progreso.estaRecogido(fragmento.id);
      const seleccionado = this.ids[this.indice] === fragmento.id;

      if (!recogido) {
        // Hueco: se sabe que existe, no donde esta.
        texto.setText(`   ${'- - - - - -'}`);
        texto.setColor(COLOR.tenue);
        return;
      }

      const sinLeer = !progreso.estaLeido(fragmento.id);
      texto.setText(`${seleccionado ? '>' : ' '} ${fragmento.titulo}${sinLeer ? ' *' : ''}`);
      texto.setColor(seleccionado ? COLOR.pergamino : sinLeer ? COLOR.sinLeer : COLOR.texto);
    });
  }

  private mostrar(indice: number): void {
    if (this.ids.length === 0) {
      this.tituloTexto.setText('');
      this.citaTexto.setText('');
      this.versiculoTexto.setText('Aun no has recogido ningun fragmento.');
      this.margenTexto.setText('');
      return;
    }

    this.indice = Phaser.Math.Clamp(indice, 0, this.ids.length - 1);
    const fragmento = fragmentoPorId(this.ids[this.indice]);
    if (!fragmento) return;

    progreso.marcarLeido(fragmento.id);

    this.citaTexto.setText(fragmento.cita);
    this.tituloTexto.setText(fragmento.titulo.toUpperCase());
    this.versiculoTexto.setText(fragmento.versiculo.join('\n'));

    // El margen va debajo del versiculo, con un hueco: otra mano, otra tinta.
    const alturaVersiculo = this.versiculoTexto.height;
    this.margenTexto.setY(this.versiculoTexto.y + alturaVersiculo + 14);
    this.margenTexto.setText(fragmento.margen.map((linea) => `  ${linea}`).join('\n'));

    this.refrescarIndice();
  }

  private mover(delta: number): void {
    if (this.ids.length === 0) return;
    sonido.interfazMover();
    this.mostrar(this.indice + delta);
  }

  private primerSinLeer(): number {
    const i = this.ids.findIndex((id) => !progreso.estaLeido(id));
    return i >= 0 ? i : Math.max(0, this.ids.length - 1);
  }

  private cerrar(): void {
    this.input.keyboard?.removeAllListeners();
    sonido.interfazCerrar();
    musica.atenuar(false);
    this.scene.resume(this.escenaJuego);
    this.scene.stop();
  }
}
