import Phaser from 'phaser';
import { tactil } from './Tactil';

/**
 * Mapa de entrada. Centralizado para poder anadir gamepad y remapeo
 * sin tocar la logica del personaje.
 *
 * Teclado, raton y DEDOS conviven: clic izquierdo golpea y clic derecho para,
 * igual que J y K, y los botones tactiles alimentan estas mismas banderas. Los
 * tres se muestrean una vez por fotograma en `actualizar()`, que la escena
 * llama al principio de su `update`, para que "recien pulsado" y "recien
 * soltado" signifiquen lo mismo venga de donde venga.
 *
 * Que los dedos entren POR AQUI y no por otro sitio es la decision que sostiene
 * todo el soporte movil (issue #65): ni las escenas ni el Cirujano saben que
 * existen los botones.
 */
export class Controles {
  private readonly izquierda: Phaser.Input.Keyboard.Key[];
  private readonly derecha: Phaser.Input.Keyboard.Key[];
  private readonly arriba: Phaser.Input.Keyboard.Key[];
  private readonly abajo: Phaser.Input.Keyboard.Key[];
  private readonly saltar: Phaser.Input.Keyboard.Key[];
  private readonly dash: Phaser.Input.Keyboard.Key[];
  private readonly atacar: Phaser.Input.Keyboard.Key[];
  private readonly parry: Phaser.Input.Keyboard.Key[];
  private readonly pocion: Phaser.Input.Keyboard.Key[];
  private readonly injertadora: Phaser.Input.Keyboard.Key[];
  private readonly interactuar: Phaser.Input.Keyboard.Key[];
  private readonly silenciar: Phaser.Input.Keyboard.Key[];
  private readonly ayuda: Phaser.Input.Keyboard.Key[];
  private readonly codice: Phaser.Input.Keyboard.Key[];
  private readonly pausa: Phaser.Input.Keyboard.Key[];

  private readonly puntero: Phaser.Input.Pointer;

  /** Estado del raton en este fotograma y en el anterior, para sacar flancos. */
  private izqAhora = false;
  private izqAntes = false;
  private derAhora = false;
  private derAntes = false;

  constructor(escena: Phaser.Scene) {
    const teclado = escena.input.keyboard;
    if (!teclado) throw new Error('Teclado no disponible en esta escena.');

    const K = Phaser.Input.Keyboard.KeyCodes;
    const tecla = (codigo: number) => teclado.addKey(codigo, true, false);

    this.izquierda = [tecla(K.A), tecla(K.LEFT)];
    this.derecha = [tecla(K.D), tecla(K.RIGHT)];
    this.arriba = [tecla(K.W), tecla(K.UP)];
    this.abajo = [tecla(K.S), tecla(K.DOWN)];
    this.saltar = [tecla(K.SPACE), tecla(K.Z)];
    this.dash = [tecla(K.SHIFT), tecla(K.X)];
    this.atacar = [tecla(K.J), tecla(K.C)];
    this.parry = [tecla(K.K), tecla(K.V)];
    this.pocion = [tecla(K.Q)];
    // F y R: las dos caen cerca de WASD sin pisar nada de lo que ya hay.
    this.injertadora = [tecla(K.F), tecla(K.R)];
    this.interactuar = [tecla(K.E)];
    this.silenciar = [tecla(K.M)];
    this.ayuda = [tecla(K.H), tecla(K.TAB)];
    this.codice = [tecla(K.L)];
    this.pausa = [tecla(K.ESC), tecla(K.P)];

    this.puntero = escena.input.activePointer;
  }

  /** Muestrea el raton. Llamar UNA vez por fotograma, antes de leer nada. */
  actualizar(): void {
    tactil.actualizar();
    this.izqAntes = this.izqAhora;
    this.derAntes = this.derAhora;

    // EN UN MOVIL EL RATON NO EXISTE, Y ESO HAY QUE DECIRLO AQUI. Phaser marca
    // `buttons = 1` en cada toque, asi que para `leftButtonDown()` cualquier
    // dedo en la pantalla —la cruceta incluida— era el boton de atacar: el
    // Cirujano encadenaba golpes solo, el estado `atacando` le bloqueaba el
    // movimiento y parecia que el juego se habia colgado (#75). Con los dedos
    // solo manda la botonera.
    const conDedos = tactil.esAparatoTactil;
    this.izqAhora = !conDedos && this.puntero.leftButtonDown();
    this.derAhora = !conDedos && this.puntero.rightButtonDown();
  }

  /** Eje horizontal: -1 izquierda, 0 neutro, 1 derecha. */
  get ejeX(): number {
    const izq = this.algunaAbajo(this.izquierda) || tactil.estaAbajo('izquierda') ? 1 : 0;
    const der = this.algunaAbajo(this.derecha) || tactil.estaAbajo('derecha') ? 1 : 0;
    return der - izq;
  }

  get arribaMantenido(): boolean {
    return this.algunaAbajo(this.arriba) || tactil.estaAbajo('arriba');
  }

  get abajoMantenido(): boolean {
    return this.algunaAbajo(this.abajo) || tactil.estaAbajo('abajo');
  }

  get saltoMantenido(): boolean {
    return this.algunaAbajo(this.saltar) || tactil.estaAbajo('saltar');
  }

  /** true solo en el fotograma en que se presiona. */
  get saltoPresionado(): boolean {
    return this.algunaRecien(this.saltar) || tactil.recienPulsada('saltar');
  }

  get dashPresionado(): boolean {
    return this.algunaRecien(this.dash) || tactil.recienPulsada('dash');
  }

  /** J, C o clic izquierdo. */
  get ataquePresionado(): boolean {
    return (
      this.algunaRecien(this.atacar) ||
      (this.izqAhora && !this.izqAntes) ||
      tactil.recienPulsada('atacar')
    );
  }

  /** Mantener el boton carga el golpe: gasta Fervor a cambio de dano. */
  get ataqueMantenido(): boolean {
    return this.algunaAbajo(this.atacar) || this.izqAhora || tactil.estaAbajo('atacar');
  }

  get ataqueSoltado(): boolean {
    return (
      this.algunaSoltada(this.atacar) ||
      (!this.izqAhora && this.izqAntes) ||
      tactil.recienSoltada('atacar')
    );
  }

  /** K, V o clic derecho. */
  get parryPresionado(): boolean {
    return (
      this.algunaRecien(this.parry) ||
      (this.derAhora && !this.derAntes) ||
      tactil.recienPulsada('parry')
    );
  }

  get pocionPresionada(): boolean {
    return this.algunaRecien(this.pocion) || tactil.recienPulsada('pocion');
  }

  get interactuarPresionado(): boolean {
    return this.algunaRecien(this.interactuar) || tactil.recienPulsada('interactuar');
  }

  get silencioPresionado(): boolean {
    return this.algunaRecien(this.silenciar);
  }

  get ayudaPresionada(): boolean {
    return this.algunaRecien(this.ayuda);
  }

  /** Lanzar un injerto con la Injertadora. */
  get injertadoraPresionada(): boolean {
    return this.algunaRecien(this.injertadora) || tactil.recienPulsada('injertadora');
  }

  /** Abrir el Codice de la Carne para leer lo recogido. */
  get codicePresionado(): boolean {
    return this.algunaRecien(this.codice) || tactil.recienPulsada('codice');
  }

  get pausaPresionada(): boolean {
    return this.algunaRecien(this.pausa) || tactil.recienPulsada('pausa');
  }

  private algunaAbajo(teclas: Phaser.Input.Keyboard.Key[]): boolean {
    return teclas.some((t) => t.isDown);
  }

  private algunaRecien(teclas: Phaser.Input.Keyboard.Key[]): boolean {
    return teclas.some((t) => Phaser.Input.Keyboard.JustDown(t));
  }

  private algunaSoltada(teclas: Phaser.Input.Keyboard.Key[]): boolean {
    return teclas.some((t) => Phaser.Input.Keyboard.JustUp(t));
  }
}
