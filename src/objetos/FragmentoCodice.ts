import Phaser from 'phaser';

/**
 * Fragmento del Codice de la Carne: coleccionable de lore.
 *
 * Requisito del brief: el lore entra de forma NO intrusiva. Recogerlo no abre
 * ningun modal ni detiene la partida — solo un destello y un contador. El texto
 * se lee despues, fuera de la accion. El contenido narrativo lo escribe el
 * equipo; aqui solo existe el identificador.
 */
export class FragmentoCodice {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly id: string;

  private recogido = false;
  private readonly escena: Phaser.Scene;

  constructor(escena: Phaser.Scene, x: number, y: number, id: string) {
    this.escena = escena;
    this.id = id;

    this.sprite = escena.physics.add.staticSprite(x, y, 'codice-placeholder');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData('fragmento', this);

    // Latido lento: presente sin gritar. No debe parecer un power-up.
    escena.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.55, to: 1 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  get estaRecogido(): boolean {
    return this.recogido;
  }

  /** @returns true si es la primera vez que se recoge. */
  recoger(): boolean {
    if (this.recogido) return false;
    this.recogido = true;

    this.escena.tweens.killTweensOf(this.sprite);
    this.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y - 10,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => this.sprite.destroy(),
    });

    return true;
  }
}
