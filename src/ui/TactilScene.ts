import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { tactil, type AccionTactil } from '../input/Tactil';

/**
 * La botonera de los dedos. Solo existe en aparatos tactiles.
 *
 * El teaser no se podia jugar desde un telefono: la pagina cargaba y no habia
 * forma de mover al Cirujano (issue #65). Importa mas de lo que parece porque
 * el portal se difunde con codigos QR, y quien escanea uno lo abre DESDE EL
 * MOVIL: era el peor primer contacto posible con el proyecto.
 *
 * Corre como escena paralela, encima del juego, y no toca ninguna logica: cada
 * boton solo enciende y apaga una bandera en `tactil`, y `Controles` las lee
 * junto a las teclas. Por eso un boton y una tecla son indistinguibles para el
 * resto del codigo.
 *
 * DECISIONES QUE SE NOTAN CON EL MOVIL EN LA MANO:
 *
 *   - La cruceta lleva ARRIBA y ABAJO aunque no se camine en vertical. Son los
 *     ataques direccionales y el trepar o soltarse de un borde: sin ellos el
 *     rebote sobre un enemigo —que es medio kit de movimiento— no se puede
 *     hacer con los dedos.
 *   - Los botones se quedan pulsados si el dedo se sale arrastrando, y solo se
 *     sueltan al levantarlo. Al reves, un dedo que resbala dos pixeles cortaba
 *     el golpe cargado en mitad de la carga.
 *   - Semitransparentes y en las esquinas: el Vientre es oscuro y estrecho, y
 *     una botonera opaca taparia justo donde caen los enemigos.
 *   - En vertical no se dibuja nada: se pide girar el aparato. Con 480x320 de
 *     lienzo, en vertical quedan bandas enormes y los botones se comen la
 *     mitad de lo poco que queda.
 */

const COLOR = {
  relleno: 0x2a2430,
  borde: 0x9a7a2c,
  pulsado: 0x8c2f2f,
  glifo: '#d6cfc4',
  aviso: '#e8d9a0',
  velo: 0x0b090b,
} as const;

/** Opacidad en reposo. Lo justo para verlos sin tapar el mundo. */
const ALPHA = 0.42;
const ALPHA_PULSADO = 0.85;

interface Boton {
  accion: AccionTactil;
  x: number;
  y: number;
  radio: number;
  glifo: string;
}

/**
 * Los botones, en coordenadas del lienzo interno (480x320).
 *
 * Dos grupos, uno por pulgar: la cruceta a la izquierda y las acciones a la
 * derecha. Lo que mas se usa —saltar y atacar— va mas grande y mas al centro
 * del alcance del pulgar; lo que se usa una vez por sala —libro, pausa— va
 * arriba, fuera del camino.
 */
const BOTONES: readonly Boton[] = [
  // Cruceta.
  { accion: 'izquierda', x: 34, y: 268, radio: 19, glifo: '<' },
  { accion: 'derecha', x: 86, y: 268, radio: 19, glifo: '>' },
  { accion: 'arriba', x: 60, y: 232, radio: 17, glifo: '^' },
  { accion: 'abajo', x: 60, y: 300, radio: 17, glifo: 'v' },

  // Acciones, mano derecha.
  { accion: 'atacar', x: 438, y: 276, radio: 23, glifo: 'X' },
  { accion: 'saltar', x: 388, y: 292, radio: 21, glifo: 'A' },
  { accion: 'parry', x: 428, y: 224, radio: 18, glifo: 'P' },
  { accion: 'dash', x: 376, y: 240, radio: 18, glifo: '>>' },

  // Consumibles y lectura, mas pequenos y arriba.
  { accion: 'pocion', x: 330, y: 214, radio: 15, glifo: 'Q' },
  { accion: 'injertadora', x: 330, y: 258, radio: 15, glifo: 'F' },
  { accion: 'interactuar', x: 286, y: 236, radio: 16, glifo: 'E' },
  { accion: 'codice', x: 438, y: 30, radio: 14, glifo: 'L' },
  { accion: 'pausa', x: 438, y: 68, radio: 14, glifo: '||' },
];

export class TactilScene extends Phaser.Scene {
  private grafico!: Phaser.GameObjects.Graphics;
  private zonas: Array<{ boton: Boton; zona: Phaser.GameObjects.Zone; activo: boolean }> = [];
  private avisoGiro!: Phaser.GameObjects.Container;
  private enVertical = false;
  private tapado = false;
  private glifos: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'Tactil' });
  }

  create(): void {
    // Cada dedo es un puntero. Con uno solo no se puede correr y saltar a la
    // vez, que es el minimo para que esto se pueda jugar.
    this.input.addPointer(3);

    this.grafico = this.add.graphics();
    this.zonas = [];
    this.glifos = [];
    this.tapado = false;

    for (const boton of BOTONES) {
      const zona = this.add
        .zone(boton.x, boton.y, boton.radio * 2.4, boton.radio * 2.4)
        .setOrigin(0.5, 0.5)
        .setInteractive();

      const entrada = { boton, zona, activo: false };

      zona.on('pointerdown', () => this.pulsar(entrada));
      // Soltar SOLO al levantar el dedo, no al salirse arrastrando: un dedo
      // que resbala dos pixeles cortaba el golpe cargado a mitad de carga.
      zona.on('pointerup', () => this.soltar(entrada));
      zona.on('pointerupoutside', () => this.soltar(entrada));

      this.zonas.push(entrada);

      this.glifos.push(
        this.add
          .text(boton.x, boton.y, boton.glifo, {
            fontFamily: 'monospace',
            fontSize: boton.radio >= 20 ? '12px' : '9px',
            color: COLOR.glifo,
          })
          .setOrigin(0.5, 0.5)
          .setAlpha(0.8),
      );
    }

    // Pantalla completa al primer toque, si el navegador deja. En movil la
    // barra de direcciones se come una franja y aparece y desaparece al
    // desplazar, moviendo el lienzo en mitad de un salto.
    //
    // Tiene que ser DENTRO de un toque: los navegadores no conceden pantalla
    // completa fuera de un gesto del usuario. Safari en iPhone no la da nunca
    // para un lienzo, asi que esto simplemente no hace nada ahi — y por eso el
    // juego no depende de ello para nada.
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.scale.fullscreen.available && !this.scale.isFullscreen) {
        try {
          this.scale.startFullscreen();
        } catch {
          // Denegada: se sigue jugando en ventana, que funciona igual.
        }
      }
    });

    this.avisoGiro = this.crearAvisoGiro();
    this.escalaCambiada();
    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.escalaCambiada());
    this.scale.on(Phaser.Scale.Events.ORIENTATION_CHANGE, () => this.escalaCambiada());

    // Si el navegador se lleva el foco (una llamada, cambiar de pestana), no
    // puede quedarse un boton pegado y el Cirujano corriendo solo.
    //
    // Se guarda la funcion para poder quitarla: con una flecha anonima, el
    // `off` no encuentra que quitar y el oyente se acumula en cada zona.
    const alPerderFoco = () => this.soltarTodo();
    this.game.events.on(Phaser.Core.Events.BLUR, alPerderFoco);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, alPerderFoco);
      tactil.soltarTodo();
    });

    this.dibujar();
  }

  private pulsar(entrada: { boton: Boton; activo: boolean }): void {
    if (this.enVertical) return;
    entrada.activo = true;
    tactil.pulsar(entrada.boton.accion);
    this.dibujar();
  }

  private soltar(entrada: { boton: Boton; activo: boolean }): void {
    entrada.activo = false;
    tactil.soltar(entrada.boton.accion);
    this.dibujar();
  }

  private soltarTodo(): void {
    for (const e of this.zonas) e.activo = false;
    tactil.soltarTodo();
    this.dibujar();
  }

  /**
   * En vertical no se juega: el lienzo es apaisado y los botones se comerian
   * la mitad de lo poco que quedaria. Se pide girar y se sueltan las teclas.
   */
  private escalaCambiada(): void {
    const vertical = this.scale.parentSize.height > this.scale.parentSize.width;
    if (vertical === this.enVertical) return;

    this.enVertical = vertical;
    this.avisoGiro.setVisible(vertical);
    if (vertical) this.soltarTodo();
    this.dibujar();
  }

  /**
   * Los botones se esconden cuando hay una pantalla delante.
   *
   * El dialogo, el libro y la pausa tienen su propia forma de tocarse —el
   * dialogo avanza tocando en cualquier sitio, el libro y la pausa tienen sus
   * botones—, y la botonera encima solo taparia. Peor: con el dialogo abierto
   * el nivel esta en pausa, asi que pulsar la cruceta no hacia nada y parecia
   * que el juego se habia colgado.
   */
  update(): void {
    const tapado =
      this.scene.isActive('Dialogo') ||
      this.scene.isActive('Codice') ||
      this.scene.isActive('Pausa');

    if (tapado === this.tapado) return;
    this.tapado = tapado;
    if (tapado) this.soltarTodo();

    for (const { zona } of this.zonas) {
      if (tapado) zona.disableInteractive();
      else zona.setInteractive();
    }
    for (const glifo of this.glifos) glifo.setVisible(!tapado);
    this.dibujar();
  }

  private dibujar(): void {
    this.grafico.clear();
    if (this.enVertical || this.tapado) return;

    for (const { boton, activo } of this.zonas) {
      this.grafico.fillStyle(
        activo ? COLOR.pulsado : COLOR.relleno,
        activo ? ALPHA_PULSADO : ALPHA,
      );
      this.grafico.fillCircle(boton.x, boton.y, boton.radio);
      this.grafico.lineStyle(1, COLOR.borde, activo ? 0.9 : 0.5);
      this.grafico.strokeCircle(boton.x, boton.y, boton.radio);
    }
  }

  private crearAvisoGiro(): Phaser.GameObjects.Container {
    const { ancho, alto } = RESOLUCION;

    const velo = this.add.rectangle(0, 0, ancho, alto, COLOR.velo, 0.96).setOrigin(0, 0);
    const texto = this.add
      .text(ancho / 2, alto / 2, 'GIRA EL DISPOSITIVO\n\nel Vientre se baja en horizontal', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLOR.aviso,
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0.5);

    return this.add.container(0, 0, [velo, texto]).setDepth(50).setVisible(false);
  }
}
