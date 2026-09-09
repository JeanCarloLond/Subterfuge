import Phaser from 'phaser';
import { IMPACTO } from '../config/Sacramento';
import { sonido } from './Sonido';

/**
 * Sensacion de impacto: hitstop, sacudida de camara, chispas y destellos.
 *
 * Todo el "game feel" del combate vive aqui para que ajustarlo no obligue a
 * tocar la logica. El ingrediente principal es el hitstop: una pausa de decenas
 * de milisegundos en el momento del golpe. Es casi imperceptible como pausa,
 * pero es lo que separa un impacto solido de uno blando.
 */
export class Impacto {
  private readonly escena: Phaser.Scene;
  private finCongelacion = 0;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
  }

  /**
   * Congela la simulacion fisica sin detener el reloj de la escena, para que
   * los temporizadores de combate sigan corriendo y nada quede colgado.
   */
  private congelar(duracionMs: number): void {
    const ahora = this.escena.time.now;
    // Un hitstop mas largo tiene prioridad; los cortos no lo acortan.
    if (ahora + duracionMs <= this.finCongelacion) return;

    this.finCongelacion = ahora + duracionMs;
    this.escena.physics.world.pause();

    this.escena.time.delayedCall(duracionMs, () => {
      if (this.escena.time.now >= this.finCongelacion - 8) {
        this.escena.physics.world.resume();
      }
    });
  }

  /** Golpe del Cirujano conectando sobre un enemigo. */
  golpeAsestado(x: number, y: number, direccion: number, cargado: boolean): void {
    sonido.golpe(cargado);
    this.congelar(cargado ? IMPACTO.hitstopCargadoMs : IMPACTO.hitstopGolpeMs);
    this.escena.cameras.main.shake(
      cargado ? 140 : 90,
      cargado ? IMPACTO.sacudidaCargado : IMPACTO.sacudidaGolpe,
    );

    this.chispas(x, y, direccion, cargado ? 14 : 8, cargado ? 0xc94f4f : 0xd6cfc4);
    this.anillo(x, y, cargado ? 26 : 16, cargado ? 0xc94f4f : 0xd6cfc4, 220);
  }

  /** Parry logrado: el momento mas legible de todo el combate. */
  parryLogrado(x: number, y: number): void {
    sonido.parry();
    this.congelar(IMPACTO.hitstopParryMs);

    const camara = this.escena.cameras.main;
    camara.flash(120, 232, 217, 160);
    camara.shake(120, 0.006);

    // Doble anillo dorado: se distingue de un golpe normal de un vistazo.
    this.anillo(x, y, 34, 0xe8d9a0, 300);
    this.anillo(x, y, 20, 0xffffff, 200);
    this.chispas(x, y, 0, 16, 0xe8d9a0);
  }

  /** El Cirujano encaja un golpe. */
  danoRecibido(): void {
    sonido.dano();
    this.congelar(IMPACTO.hitstopGolpeMs);
    this.escena.cameras.main.shake(160, IMPACTO.sacudidaRecibir);
    this.escena.cameras.main.flash(90, 140, 40, 40);
  }

  /** Onda de la caida del Reformado: sacude y barre el suelo. */
  ondaSuelo(x: number, y: number, alcance: number): void {
    sonido.ondaJefe();
    this.congelar(IMPACTO.hitstopCargadoMs);
    this.escena.cameras.main.shake(260, IMPACTO.sacudidaMuerte);

    this.anillo(x, y, alcance, 0xe8a03a, 420);
    this.chispas(x, y - 4, 1, 10, 0x8c4f4f);
    this.chispas(x, y - 4, -1, 10, 0x8c4f4f);
  }

  muerteEnemigo(x: number, y: number): void {
    sonido.muerteEnemigo();
    this.congelar(IMPACTO.hitstopMuerteMs);
    this.escena.cameras.main.shake(180, IMPACTO.sacudidaMuerte);
    this.chispas(x, y, 0, 18, 0x8c2f2f);
  }

  /**
   * Chispas de impacto. Se emiten en abanico hacia donde iba el golpe.
   * `explode` las suelta de una vez y el emisor se autodestruye al acabar.
   */
  private chispas(x: number, y: number, direccion: number, cantidad: number, color: number): void {
    const angulo =
      direccion === 0
        ? { min: 0, max: 360 }
        : direccion > 0
          ? { min: -55, max: 55 }
          : { min: 125, max: 235 };

    const emisor = this.escena.add.particles(x, y, 'chispa-placeholder', {
      speed: { min: 60, max: 190 },
      angle: angulo,
      lifespan: { min: 160, max: 340 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: 260,
      tint: color,
      emitting: false,
    });

    emisor.setDepth(60);
    emisor.explode(cantidad);
    this.escena.time.delayedCall(400, () => emisor.destroy());
  }

  /** Anillo que se expande y desvanece en el punto de impacto. */
  private anillo(x: number, y: number, radio: number, color: number, duracionMs: number): void {
    const grafico = this.escena.add.graphics({ x, y });
    grafico.setDepth(59);
    grafico.lineStyle(2, color, 1);
    grafico.strokeCircle(0, 0, 4);

    this.escena.tweens.add({
      targets: grafico,
      scale: radio / 4,
      alpha: 0,
      duration: duracionMs,
      ease: 'Quad.easeOut',
      onComplete: () => grafico.destroy(),
    });
  }
}
