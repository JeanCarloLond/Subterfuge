import Phaser from 'phaser';

/**
 * Mapa de entrada. Centralizado para poder anadir gamepad y remapeo
 * sin tocar la logica del personaje.
 */
export class Controles {
  private readonly izquierda: Phaser.Input.Keyboard.Key[];
  private readonly derecha: Phaser.Input.Keyboard.Key[];
  private readonly arriba: Phaser.Input.Keyboard.Key[];
  private readonly abajo: Phaser.Input.Keyboard.Key[];
  private readonly saltar: Phaser.Input.Keyboard.Key[];
  private readonly dash: Phaser.Input.Keyboard.Key[];

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
  }

  /** Eje horizontal: -1 izquierda, 0 neutro, 1 derecha. */
  get ejeX(): number {
    const izq = this.algunaAbajo(this.izquierda) ? 1 : 0;
    const der = this.algunaAbajo(this.derecha) ? 1 : 0;
    return der - izq;
  }

  get arribaMantenido(): boolean {
    return this.algunaAbajo(this.arriba);
  }

  get abajoMantenido(): boolean {
    return this.algunaAbajo(this.abajo);
  }

  get saltoMantenido(): boolean {
    return this.algunaAbajo(this.saltar);
  }

  /** true solo en el frame en que se presiona. */
  get saltoPresionado(): boolean {
    return this.algunaRecien(this.saltar);
  }

  get dashPresionado(): boolean {
    return this.algunaRecien(this.dash);
  }

  private algunaAbajo(teclas: Phaser.Input.Keyboard.Key[]): boolean {
    return teclas.some((t) => t.isDown);
  }

  private algunaRecien(teclas: Phaser.Input.Keyboard.Key[]): boolean {
    return teclas.some((t) => Phaser.Input.Keyboard.JustDown(t));
  }
}
