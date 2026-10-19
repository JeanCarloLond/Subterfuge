import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

type EstadoRemedo = 'oculto' | 'huyendo' | 'muerto';

/** Gris de instrumental: el color que toma mientras se hace pasar por objeto. */
const TINTE_IMITACION = 0xc8ccd0;

/**
 * El Remedo (#97). Un bicho blando que se queda quieto y parece un objeto.
 *
 * La biblia: "la imitacion es de forma y color, no de temperatura ni de filo",
 * y de ahi el dicho "un bisturi tibio es un Remedo". Aqui no hay temperatura
 * que tocar, asi que el tell es lo que ningun objeto hace: TIEMBLA. Cuando el
 * Cirujano se acerca, cada poco se retuerce un instante. No es un cambio de
 * color, a proposito: tiene que poder aprenderse sin distinguir tonos.
 *
 * Si el Cirujano se le pega, muerde una vez y huye. No persigue ni acosa: es
 * una molestia cotidiana, no un enemigo que haya que despejar. Muere de un tajo
 * y no suelta nada (no debe ser una granja).
 */
export class Remedo implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'hostil' as const;
  readonly clase = 'remedo' as const;
  readonly idFicha = 'remedo';

  private estado: EstadoRemedo = 'oculto';
  private vida: number = ESPECIES.remedo.vida;
  private finEstado = 0;
  private proximoTemblor = 0;
  private haciaX = 1;

  private readonly ctx: ContextoCriatura;
  private readonly ronda?: RangoPatrulla;

  constructor(ctx: ContextoCriatura, x: number, y: number, ronda?: RangoPatrulla) {
    this.ctx = ctx;
    this.ronda = ronda;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'remedo-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setTint(TINTE_IMITACION);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);

    const cuerpo = this.cuerpo;
    cuerpo.setSize(8, 6);
    cuerpo.setOffset(1, 1);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  /** El mordisco se resuelve aqui; rozarlo de lado no hiere. */
  get hiereAlContacto(): boolean {
    return false;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.estado === 'muerto') return;
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.remedo;

    if (this.estado === 'huyendo') {
      let vx = this.haciaX * c.velocidadHuida;
      if (this.ronda) {
        // Dentro de su rincon: no cruza el nivel huyendo.
        if (this.sprite.x <= this.ronda.izquierda) vx = Math.abs(vx);
        if (this.sprite.x >= this.ronda.derecha) vx = -Math.abs(vx);
      }
      this.cuerpo.setVelocityX(vx);
      this.sprite.setFlipX(vx < 0);
      if (ahora >= this.finEstado) this.esconderse(ahora);
      return;
    }

    // Oculto. Mientras reposa tras huir no muerde: muerde una vez, no acosa.
    if (ahora < this.finEstado || this.ctx.jugador.estaMuerto) return;

    const distancia = Phaser.Math.Distance.Between(
      xJugador,
      yJugador,
      this.sprite.x,
      this.sprite.y,
    );
    if (distancia < c.radioMordisco) {
      this.morder(xJugador);
    } else if (distancia < c.radioTemblor && ahora >= this.proximoTemblor) {
      this.proximoTemblor = ahora + c.cadaTemblorMs;
      this.temblar();
    }
  }

  recibirDano(cantidad: number, origenX: number): boolean {
    if (this.estado === 'muerto') return false;
    this.vida -= cantidad;
    if (this.vida <= 0) {
      this.morir();
      return true;
    }
    this.huir(origenX);
    return true;
  }

  // -- Comportamiento ------------------------------------------------------

  /**
   * Un retorcimiento corto. Con el angulo y no con la posicion: la fisica
   * recoloca el sprite cada paso y se comeria un temblor hecho moviendolo.
   */
  private temblar(): void {
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -9, to: 9 },
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.sprite.setAngle(0),
    });
  }

  private morder(xJugador: number): void {
    this.ctx.herir(ESPECIES.remedo.dano, this.sprite.x);
    this.huir(xJugador);
  }

  private huir(origenX: number): void {
    this.estado = 'huyendo';
    this.finEstado = this.ctx.escena.time.now + ESPECIES.remedo.huidaMs;
    this.haciaX = this.sprite.x >= origenX ? 1 : -1;
    this.sprite.clearTint();
    this.cuerpo.setVelocityY(-120);
  }

  private esconderse(ahora: number): void {
    this.estado = 'oculto';
    this.finEstado = ahora + ESPECIES.remedo.reposoMs;
    this.cuerpo.setVelocityX(0);
    this.sprite.setTint(TINTE_IMITACION);
  }

  private morir(): void {
    this.estado = 'muerto';
    this.cuerpo.enable = false;
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleY: 0.4,
      duration: 300,
      onComplete: () => this.sprite.destroy(),
    });
  }
}
