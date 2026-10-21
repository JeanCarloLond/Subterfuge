import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { nombreDeZona } from '../lore/Mapa';
import { guardado, type Descenso } from '../systems/Guardado';
import { musica } from '../systems/Musica';
import { progreso } from '../systems/Progreso';
import { sonido } from '../systems/Sonido';
import { cursorActivo } from '../ui/Cursor';
import { tactil } from '../input/Tactil';

type Opcion = 'continuar' | 'descender' | 'opciones' | 'portal';

const COLOR = {
  titulo: '#8c2f2f',
  texto: '#d6cfc4',
  tenue: '#6b5f55',
  activo: '#e8d9a0',
  aviso: '#c98a8a',
} as const;

/**
 * La pantalla de inicio (issue #150).
 *
 * Antes el juego te dejaba en el Atrio con el cartel de "activar el sonido"
 * encima de la partida. Ahora se entra por aqui: el Cirujano delante de un
 * Altar encendido, el titulo y tres cosas que hacer.
 *
 *   - Continuar: solo si hay un descenso guardado (#149). Vuelve a ese Altar.
 *   - Descender: partida nueva. Si habia un descenso guardado, pide pulsar
 *     otra vez, porque lo borra.
 *   - Opciones: las mismas de la pausa (#151).
 *
 * Y una cuarta, el portal de la Diocesis, que es la otra mitad de la obra.
 *
 * El primer toque o tecla de esta pantalla es el que desbloquea el audio del
 * navegador: cuando empieza la partida ya suena, sin cartel.
 */
export class InicioScene extends Phaser.Scene {
  private opciones: Opcion[] = [];
  private textos: Phaser.GameObjects.Text[] = [];
  /** La linea pequeña bajo cada opcion: donde se continua, o el aviso de borrar. */
  private detalles: Phaser.GameObjects.Text[] = [];
  private indice = 0;
  private descenso: Descenso | null = null;
  /** Descender con un guardado pide confirmacion: esto dice si ya se pidio. */
  private avisado = false;
  private saliendo = false;

  constructor() {
    super({ key: 'Inicio' });
  }

  create(): void {
    this.descenso = guardado.cargar();
    this.opciones = [
      ...(this.descenso ? (['continuar'] as const) : []),
      'descender',
      'opciones',
      'portal',
    ];
    this.indice = 0;
    this.avisado = false;
    this.saliendo = false;

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(800, 11, 9, 11);
    this.pintarEscena();
    this.pintarMenu();
    this.refrescar();
    musica.poner('atrio');

    const teclado = this.input.keyboard;
    teclado?.on('keydown-UP', () => this.mover(-1));
    teclado?.on('keydown-W', () => this.mover(-1));
    teclado?.on('keydown-DOWN', () => this.mover(1));
    teclado?.on('keydown-S', () => this.mover(1));
    teclado?.on('keydown-E', () => this.confirmar());
    teclado?.on('keydown-ENTER', () => this.confirmar());
    teclado?.on('keydown-SPACE', () => this.confirmar());
  }

  /** El Cirujano ante un Altar encendido, a la izquierda. Es el mismo arte del juego, a x2. */
  private pintarEscena(): void {
    const { ancho, alto } = RESOLUCION;
    this.add
      .tileSprite(0, 0, ancho, alto, 'fondo-arcos')
      .setOrigin(0, 0)
      .setTileScale(2)
      .setAlpha(0.55);

    const suelo = 252;
    this.add.rectangle(0, suelo, ancho, alto - suelo, 0x150f12).setOrigin(0, 0);
    this.add.rectangle(0, suelo, ancho, 2, 0x2e2428).setOrigin(0, 0);

    const luz = this.add
      .image(96, suelo - 34, 'brillo-placeholder')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.6)
      .setAlpha(0.5);
    this.tweens.add({
      targets: luz,
      alpha: { from: 0.42, to: 0.58 },
      scale: { from: 1.55, to: 1.66 },
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.add.image(96, suelo, 'altar-placeholder').setOrigin(0.5, 1).setScale(2);
    this.add.image(150, suelo, 'cirujano-placeholder').setOrigin(0.5, 1).setScale(2).setFlipX(true);

    const polvo = this.add.particles(0, 0, 'chispa-placeholder', {
      x: { min: 0, max: ancho },
      y: 0,
      speedY: { min: 3, max: 9 },
      speedX: { min: -2, max: 2 },
      lifespan: 12000,
      alpha: { start: 0.4, end: 0 },
      scale: 0.5,
      frequency: 260,
      tint: 0xc9b48a,
    });
    polvo.fastForward(8000);
  }

  private pintarMenu(): void {
    const x = 330;
    this.add
      .text(x, 70, 'SUBTERFUGE', { fontFamily: 'monospace', fontSize: '22px', color: COLOR.titulo })
      .setOrigin(0.5, 0.5);
    this.add
      .text(x, 92, 'Diócesis de la Carne', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLOR.tenue,
      })
      .setOrigin(0.5, 0.5);
    this.add.rectangle(x, 106, 150, 1, 0x9a7a2c, 0.6);

    // Cada opcion tiene sitio para su linea pequeña debajo, la use o no: asi
    // no se mueven las demas cuando aparece el aviso de Descender.
    const hueco = tactil.esAparatoTactil ? 34 : 30;
    this.detalles = this.opciones.map((_, i) =>
      this.add
        .text(x, 128 + i * hueco + 14, '', {
          fontFamily: 'monospace',
          fontSize: '7px',
          color: COLOR.tenue,
        })
        .setOrigin(0.5, 0),
    );
    this.textos = this.opciones.map((_, i) => {
      const texto = this.add
        .text(x, 128 + i * hueco, '', {
          fontFamily: 'monospace',
          fontSize: tactil.esAparatoTactil ? '11px' : '10px',
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

    this.add
      .text(
        x,
        RESOLUCION.alto - 26,
        tactil.esAparatoTactil ? 'toca una opción' : 'W S  o ratón  elegir     E  o clic  entrar',
        { fontFamily: 'monospace', fontSize: '7px', color: COLOR.tenue },
      )
      .setOrigin(0.5, 0.5);
  }

  private etiqueta(opcion: Opcion): string {
    switch (opcion) {
      case 'continuar':
        return 'Continuar';
      case 'descender':
        return 'Descender';
      case 'opciones':
        return 'Opciones';
      default:
        return 'El portal de la Diócesis';
    }
  }

  private detalle(opcion: Opcion): string {
    if (opcion === 'continuar') {
      const zona = this.descenso ? nombreDeZona(this.descenso.zona) : '';
      return `${zona} · ${hace(this.descenso?.fecha ?? Date.now())}`;
    }
    if (opcion === 'descender' && this.avisado) {
      return 'se pierde el descenso guardado · otra vez para seguir';
    }
    return '';
  }

  private refrescar(): void {
    const altoZona = tactil.esAparatoTactil ? 30 : 24;
    this.opciones.forEach((opcion, i) => {
      const activa = i === this.indice;
      const texto = this.textos[i];
      texto.setText(`${activa ? '>  ' : ''}${this.etiqueta(opcion)}${activa ? '  <' : ''}`);
      texto.setColor(activa ? COLOR.activo : COLOR.texto);
      // La zona sensible cubre tambien la linea pequeña de debajo.
      texto.input?.hitArea.setSize(220, altoZona);
      texto.input?.hitArea.setPosition(texto.width / 2 - 110, 0);

      const detalle = this.detalles[i];
      detalle.setText(this.detalle(opcion));
      detalle.setColor(opcion === 'descender' && this.avisado ? COLOR.aviso : COLOR.tenue);
    });
  }

  private mover(delta: number): void {
    if (this.saliendo) return;
    sonido.interfazMover();
    this.indice = (this.indice + delta + this.opciones.length) % this.opciones.length;
    if (this.opciones[this.indice] !== 'descender') this.avisado = false;
    this.refrescar();
  }

  private confirmar(): void {
    if (this.saliendo) return;
    const opcion = this.opciones[this.indice];
    switch (opcion) {
      case 'continuar':
        this.continuar();
        break;
      case 'descender':
        if (this.descenso && !this.avisado) {
          this.avisado = true;
          sonido.interfazMover();
          this.refrescar();
          return;
        }
        this.empezar();
        break;
      case 'opciones':
        sonido.interfazAbrir();
        this.scene.launch('Opciones', { volverA: this.scene.key });
        this.scene.pause();
        break;
      case 'portal':
        window.open(`${import.meta.env.BASE_URL}web/`, '_blank', 'noopener');
        break;
    }
  }

  private continuar(): void {
    const descenso = this.descenso;
    if (!descenso) return;
    progreso.restaurar(descenso.progreso);
    this.salirA(descenso.zona, { altar: descenso.altar });
  }

  private empezar(): void {
    progreso.reiniciar();
    guardado.borrar();
    this.salirA('Atrio', {});
  }

  private salirA(escena: string, datos: object): void {
    this.saliendo = true;
    sonido.interfazCerrar();
    this.input.keyboard?.removeAllListeners();
    this.cameras.main.fadeOut(500, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(escena, datos);
    });
  }
}

/** "hace 5 min", "hace 2 h", "hace 3 días": cuanto lleva guardado. */
function hace(fecha: number): string {
  const minutos = Math.max(0, Math.round((Date.now() - fecha) / 60000));
  if (minutos < 1) return 'ahora mismo';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
}
