import Phaser from 'phaser';

/**
 * Altar: punto de guardado.
 *
 * Narrativamente no es un descanso neutro. Es donde el Cirujano-Sacerdote
 * reafirma su fe para poder seguir bajando. Guardar la partida es, dentro del
 * mundo, un acto liturgico: por eso repone el frasco y la carne, pero NO
 * devuelve el Fervor gastado. La devocion se vuelve a ganar con el cuerpo.
 */
export class Altar {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  /** Punto exacto donde reaparece el Cirujano al morir. */
  readonly puntoReaparicion: { x: number; y: number };

  private activo = false;
  private jugadorCerca = false;

  private readonly escena: Phaser.Scene;
  private readonly aviso: Phaser.GameObjects.Text;

  constructor(escena: Phaser.Scene, x: number, y: number) {
    this.escena = escena;
    this.puntoReaparicion = { x, y: y - 2 };

    this.sprite = escena.physics.add.staticSprite(x, y, 'altar-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.refreshBody();
    this.sprite.setTint(0x4a4038); // apagado: aun no descubierto

    this.aviso = escena.add
      .text(x, y - 30, 'E  rezar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  get estaActivo(): boolean {
    return this.activo;
  }

  /** La escena informa cada frame si el Cirujano esta dentro del radio. */
  marcarProximidad(cerca: boolean): void {
    this.jugadorCerca = cerca;
    this.aviso.setVisible(cerca);
  }

  get puedeRezar(): boolean {
    return this.jugadorCerca;
  }

  /** Enciende el altar. @returns true si era la primera vez. */
  rezar(): boolean {
    const primeraVez = !this.activo;
    this.activo = true;

    this.sprite.clearTint();
    this.escena.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.6, to: 1 },
      duration: 260,
      yoyo: true,
    });

    return primeraVez;
  }
}
