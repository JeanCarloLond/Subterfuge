import Phaser from 'phaser';
import { OFRENDA } from '../config/Sacramento';
import type { ClaseEnemigo } from '../systems/Sonido';

/** Lo que deja un enemigo al caer. */
export type TipoOfrenda = 'carne' | 'sello';

export const OFRENDAS: Record<TipoOfrenda, { nombre: string; textura: string }> = {
  carne: { nombre: 'carne del diezmo', textura: 'carne-placeholder' },
  sello: { nombre: 'sello del diezmo', textura: 'sello-placeholder' },
};

/**
 * Ofrenda: la recompensa por derrotar a un enemigo.
 *
 * Cae del cuerpo, rebota una vez y se queda en el suelo unos segundos. La
 * carne cura un punto; el sello da Fervor. Es lo que en la Diocesis se le
 * saca a un cuerpo, asi que tiene sentido que sea lo que deja un Devoto.
 *
 * Sin esto los enemigos eran solo obstaculos: pelear no daba nada que no
 * diera rodearlos (issue #27).
 */
export class Ofrenda {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly tipo: TipoOfrenda;

  private recogida = false;
  private readonly escena: Phaser.Scene;

  constructor(escena: Phaser.Scene, x: number, y: number, tipo: TipoOfrenda) {
    this.escena = escena;
    this.tipo = tipo;

    this.sprite = escena.physics.add.sprite(x, y, OFRENDAS[tipo].textura);
    this.sprite.setDepth(28);
    this.sprite.setData('ofrenda', this);

    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setSize(8, 8);
    cuerpo.setBounce(0.45, 0.45);
    cuerpo.setDragX(220);
    // Sale despedida hacia arriba, un poco al azar: que no caiga siempre igual.
    cuerpo.setVelocity(Phaser.Math.Between(-60, 60), -Phaser.Math.Between(140, 200));

    // Parpadea al final y desaparece: no se acumula basura en el suelo.
    escena.time.delayedCall(OFRENDA.vidaMs - OFRENDA.parpadeoMs, () => {
      if (this.recogida || !this.sprite.active) return;
      escena.tweens.add({
        targets: this.sprite,
        alpha: { from: 1, to: 0.2 },
        duration: 160,
        yoyo: true,
        repeat: Math.floor(OFRENDA.parpadeoMs / 320),
      });
    });
    escena.time.delayedCall(OFRENDA.vidaMs, () => this.desvanecer());
  }

  get nombre(): string {
    return OFRENDAS[this.tipo].nombre;
  }

  get estaViva(): boolean {
    return this.sprite.active && !this.recogida;
  }

  /** @returns true si es la primera vez que se recoge. */
  recoger(): boolean {
    if (this.recogida || !this.sprite.active) return false;
    this.recogida = true;

    this.escena.tweens.killTweensOf(this.sprite);
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.escena.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 10,
      alpha: 0,
      scale: 1.5,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => this.sprite.destroy(),
    });

    return true;
  }

  private desvanecer(): void {
    if (this.recogida || !this.sprite.active) return;
    this.recogida = true;
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }

  /** Que ofrenda deja cada clase de enemigo, si deja alguna. */
  static sortear(clase: ClaseEnemigo): TipoOfrenda | null {
    const tirada = Math.random();

    switch (clase) {
      case 'vestal':
        // El clero siempre lleva sellos encima; de vez en cuando, algo mas.
        return tirada < OFRENDA.vestalCarne ? 'carne' : 'sello';
      case 'devoto':
        if (tirada < OFRENDA.devotoCarne) return 'carne';
        if (tirada < OFRENDA.devotoCarne + OFRENDA.devotoSello) return 'sello';
        return null;
      default:
        // El jefe no suelta nada: su recompensa es la salida que se abre.
        return null;
    }
  }
}
