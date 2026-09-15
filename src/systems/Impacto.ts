import Phaser from 'phaser';
import { IMPACTO } from '../config/Sacramento';
import { sonido, type ClaseEnemigo } from './Sonido';

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
  golpeAsestado(
    x: number,
    y: number,
    direccion: number,
    cargado: boolean,
    clase: ClaseEnemigo = 'devoto',
  ): void {
    sonido.golpe(cargado, clase);
    this.congelar(cargado ? IMPACTO.hitstopCargadoMs : IMPACTO.hitstopGolpeMs);
    this.escena.cameras.main.shake(
      cargado ? 140 : 90,
      cargado ? IMPACTO.sacudidaCargado : IMPACTO.sacudidaGolpe,
    );

    // Chispas y anillo en el oro del bisturi, no en blanco: lo que acaba de
    // entrar en el enemigo es SU hoja, y el color es lo que lo dice.
    const oro = cargado ? 0xf4ed93 : 0xfcd038;
    this.chispas(x, y, direccion, cargado ? 14 : 8, oro);
    this.anillo(x, y, cargado ? 26 : 16, oro, 220);
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

  /** El Cirujano se estrella contra el suelo. Mas largo y mas grave que un golpe. */
  danoPorCaida(dano: number): void {
    sonido.danoPorCaida(dano);
    this.congelar(IMPACTO.hitstopCargadoMs);
    this.escena.cameras.main.shake(220, IMPACTO.sacudidaRecibir * 1.4);
    this.escena.cameras.main.flash(120, 140, 40, 40);
  }

  /** Una piedra del techo que se rompe contra el suelo (o contra el Cirujano). */
  escombro(x: number, y: number): void {
    sonido.escombro();
    this.escena.cameras.main.shake(70, IMPACTO.sacudidaGolpe);
    this.chispas(x, y, 0, 8, 0x51473d);
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

  /**
   * Cae el Cirujano. Es el golpe mas fuerte que da la camara en todo el juego,
   * y a proposito: el jugador tiene que saber que ha muerto EL, no que le han
   * hecho dano otra vez. Se distingue de `danoRecibido` en que el destello es
   * mas largo y mas rojo, y en que la sacudida no se parece a ninguna otra.
   */
  muerteCirujano(x: number, y: number): void {
    sonido.muerteJugador();
    this.congelar(IMPACTO.hitstopMuerteMs);

    // El destello es corto a proposito: si dura mas que el desplome, lo unico
    // que se ve es la pantalla ponerse roja y el cuerpo cae sin que nadie lo
    // vea. Primero el golpe, y enseguida el sitio para mirar lo que queda.
    const camara = this.escena.cameras.main;
    camara.flash(260, 120, 20, 24);
    camara.shake(420, IMPACTO.sacudidaMuerte * 1.4);

    this.chispas(x, y - 12, 0, 22, 0x8c2f2f);
    this.anillo(x, y - 12, 46, 0x8c2f2f, 620);
  }

  muerteEnemigo(x: number, y: number, clase: ClaseEnemigo = 'devoto'): void {
    sonido.muerteEnemigo(clase);
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
