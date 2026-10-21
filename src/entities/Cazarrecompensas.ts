import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { alcanzaAlCirujano, puntaDelGarfio } from '../systems/Garfio';
import { tajoEnemigo } from '../systems/GolpeEnemigo';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

type EstadoCazador =
  'ronda' | 'girando' | 'lanzando' | 'arrastrando' | 'acuchillando' | 'aturdido' | 'muerto';

/**
 * El cazarrecompensas de Elegidos (#164). "Rastrean a Elegidos fugados y a
 * Ayunantes; cobran en diezmo perdonado." Ella es una Elegida fugada, y el va
 * a por quien se la ha llevado: a la niña no la toca.
 *
 * Es un rastreador, no un soldado. Su arma es el garfio: hace girar la cadena
 * (el aviso, mas de medio segundo) y lo lanza recto. Si engancha, arrastra al
 * Cirujano hasta el y le da un tajo. El parry rompe el garfio y lo deja
 * aturdido; el dash lo atraviesa. De cerca es flojo.
 *
 * En las persecuciones (#162) es tambien el que viene detras repitiendo el
 * camino: eso lo hace la escena con su figura.
 */
export class Cazarrecompensas implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'hostil' as const;
  readonly clase = 'cazador' as const;
  readonly idFicha = 'cazador';

  private readonly ctx: ContextoCriatura;
  private readonly ronda: RangoPatrulla;
  private readonly cadena: Phaser.GameObjects.Graphics;
  private readonly garfio: Phaser.GameObjects.Image;

  private estado: EstadoCazador = 'ronda';
  private vida: number = ESPECIES.cazador.vida;
  private haciaDerecha = true;
  private finEstado = 0;
  private inicioLanzamiento = 0;
  private golpeoEnEsta = false;

  constructor(ctx: ContextoCriatura, x: number, y: number, ronda: RangoPatrulla) {
    this.ctx = ctx;
    this.ronda = ronda;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'cazador-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.cuerpo;
    cuerpo.setSize(10, 22);
    cuerpo.setOffset(5, 10);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);

    this.cadena = ctx.escena.add.graphics().setDepth(8);
    this.garfio = ctx.escena.add.image(x, y, 'garfio-placeholder').setDepth(9).setVisible(false);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  get estadoActual(): EstadoCazador {
    return this.estado;
  }

  get hiereAlContacto(): boolean {
    return this.estado !== 'muerto' && this.estado !== 'aturdido';
  }

  private get pechoY(): number {
    return this.sprite.y - 14;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.estado === 'muerto') return;
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.cazador;
    const dx = xJugador - this.sprite.x;
    const mismaAltura = Math.abs(yJugador - this.sprite.y) < 30;
    const jugador = this.ctx.jugador;

    switch (this.estado) {
      case 'ronda':
        if (
          !jugador.estaMuerto &&
          mismaAltura &&
          Math.abs(dx) < c.alcanceGarfio &&
          ahora >= this.finEstado
        ) {
          this.haciaDerecha = dx > 0;
          if (Math.abs(dx) < c.alcanceCuchillo) this.acuchillar(ahora);
          else this.girar(ahora);
          break;
        }
        if (this.sprite.x <= this.ronda.izquierda) this.haciaDerecha = true;
        if (this.sprite.x >= this.ronda.derecha) this.haciaDerecha = false;
        this.cuerpo.setVelocityX((this.haciaDerecha ? 1 : -1) * c.velocidad);
        break;

      case 'girando':
        this.cuerpo.setVelocityX(0);
        this.dibujarGiro(ahora);
        if (ahora >= this.finEstado) this.lanzar(ahora);
        break;

      case 'lanzando':
        this.cuerpo.setVelocityX(0);
        this.actualizarGarfio(ahora, xJugador, yJugador);
        break;

      case 'arrastrando': {
        // Tira de la cadena: el Cirujano viene hacia el, a su pesar.
        const cerca = Math.abs(dx) <= c.alcanceCuchillo;
        this.dibujarCadena(xJugador, yJugador - 14);
        if (cerca || jugador.estado === 'dash' || ahora >= this.finEstado) {
          this.recogerGarfio();
          this.acuchillar(ahora);
        } else {
          this.ctx.arrastrarJugador(-Math.sign(dx) * c.velocidadArrastre);
        }
        break;
      }

      case 'acuchillando':
        this.cuerpo.setVelocityX(0);
        if (!this.golpeoEnEsta && ahora >= this.finEstado - c.cuchilladaMs) {
          this.golpeoEnEsta = true;
          this.sprite.clearTint();
          const direccion = this.haciaDerecha ? 1 : -1;
          tajoEnemigo(this.ctx.escena, this.sprite.x + direccion * 4, this.pechoY, direccion, {
            radio: c.alcanceCuchillo + 4,
            alto: 14,
            color: 0xc9d1c4,
            duracionMs: 200,
          });
          if (mismaAltura && Math.abs(dx) <= c.alcanceCuchillo + 4 && dx * direccion >= 0) {
            if (this.ctx.herir(c.dano, this.sprite.x) === 'parado') {
              this.aturdir(ahora);
              break;
            }
          }
        }
        if (ahora >= this.finEstado) this.descansar(ahora);
        break;

      case 'aturdido':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.descansar(ahora);
        break;
    }

    this.sprite.setFlipX(!this.haciaDerecha);
  }

  recibirDano(cantidad: number): boolean {
    if (this.estado === 'muerto') return false;
    this.vida -= cantidad;
    this.sprite.setTint(0xffffff);
    this.ctx.escena.time.delayedCall(90, () => {
      if (this.estado !== 'muerto') this.sprite.clearTint();
    });
    // Herido, suelta lo que tuviera en la mano.
    if (this.estado === 'lanzando' || this.estado === 'arrastrando') {
      this.recogerGarfio();
      this.descansar(this.ctx.escena.time.now);
    }
    if (this.vida <= 0) this.morir();
    return true;
  }

  // -- Comportamiento ------------------------------------------------------

  /** La cadena girando sobre la cabeza: el aviso del garfio. */
  private girar(ahora: number): void {
    this.estado = 'girando';
    this.finEstado = ahora + ESPECIES.cazador.anticipacionMs;
    this.sprite.setTexture('cazador-gira-placeholder');
    this.sprite.setTint(0xe58a80);
    sonido.cadena();
  }

  private dibujarGiro(ahora: number): void {
    const angulo = (ahora / 70) % (Math.PI * 2);
    const cx = this.sprite.x + (this.haciaDerecha ? 4 : -4);
    const cy = this.sprite.y - 30;
    const px = cx + Math.cos(angulo) * 9;
    const py = cy + Math.sin(angulo) * 3;
    this.cadena.clear().lineStyle(1, 0x9ca193, 1).lineBetween(cx, cy, px, py);
    this.garfio.setVisible(true).setPosition(px, py);
  }

  private lanzar(ahora: number): void {
    this.estado = 'lanzando';
    this.inicioLanzamiento = ahora;
    this.sprite.clearTint();
    this.sprite.setTexture('cazador-placeholder');
    sonido.cadena();
  }

  private actualizarGarfio(ahora: number, xJugador: number, yJugador: number): void {
    const c = ESPECIES.cazador;
    const direccion = this.haciaDerecha ? 1 : -1;
    const origenX = this.sprite.x + direccion * 6;
    const punta = puntaDelGarfio(
      origenX,
      direccion,
      c.velocidadGarfio,
      c.alcanceGarfio,
      ahora - this.inicioLanzamiento,
    );
    this.garfio.setVisible(true).setPosition(punta.x, this.pechoY).setFlipX(!this.haciaDerecha);
    this.cadena
      .clear()
      .lineStyle(1, 0x9ca193, 1)
      .lineBetween(origenX, this.pechoY, punta.x, this.pechoY);

    if (punta.terminado) {
      this.recogerGarfio();
      this.descansar(ahora);
      return;
    }
    if (punta.volviendo) return;

    const resultado = alcanzaAlCirujano(
      punta.x,
      this.pechoY,
      xJugador,
      yJugador - 14,
      this.ctx.jugador.estado,
    );
    if (resultado === 'roto') {
      // Parado: el garfio se parte y el cazarrecompensas se queda con la cadena.
      this.ctx.herir(0, punta.x);
      sonido.selloDevuelto();
      this.recogerGarfio();
      this.aturdir(ahora);
    } else if (resultado === 'enganchado') {
      sonido.cadena();
      this.estado = 'arrastrando';
      this.finEstado = ahora + c.arrastreMaxMs;
    }
  }

  private dibujarCadena(xJugador: number, yJugador: number): void {
    const origenX = this.sprite.x + (this.haciaDerecha ? 6 : -6);
    this.garfio.setPosition(xJugador, yJugador);
    this.cadena
      .clear()
      .lineStyle(1, 0x9ca193, 1)
      .lineBetween(origenX, this.pechoY, xJugador, yJugador);
  }

  private recogerGarfio(): void {
    this.cadena.clear();
    this.garfio.setVisible(false);
  }

  /** El tajo de cerca: corto aviso, se para como el de un Devoto. */
  private acuchillar(ahora: number): void {
    const c = ESPECIES.cazador;
    this.estado = 'acuchillando';
    this.golpeoEnEsta = false;
    this.finEstado = ahora + c.anticipacionCuchilloMs + c.cuchilladaMs;
    this.sprite.setTint(0xe58a80);
  }

  private aturdir(ahora: number): void {
    this.estado = 'aturdido';
    this.finEstado = ahora + ESPECIES.cazador.aturdidoMs;
    this.sprite.setTexture('cazador-placeholder');
    this.sprite.setTint(0xe8d9a0);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -6, to: 6 },
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.setAngle(0);
        if (this.estado !== 'muerto') this.sprite.clearTint();
      },
    });
  }

  private descansar(ahora: number): void {
    this.estado = 'ronda';
    this.finEstado = ahora + ESPECIES.cazador.enfriamientoMs;
    this.sprite.setTexture('cazador-placeholder');
    this.sprite.clearTint();
  }

  private morir(): void {
    this.estado = 'muerto';
    this.recogerGarfio();
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: this.haciaDerecha ? -90 : 90,
      y: this.sprite.y + 4,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => this.sprite.setVisible(false),
    });
  }
}
