import Phaser from 'phaser';
import { COMBATE, DEVOTO, MOVIMIENTO } from '../config/Sacramento';
import type { Enemigo } from './Enemigo';
import { Vitalidad } from '../systems/Vitalidad';
import { BarraVida } from '../ui/BarraVida';

export type EstadoDevoto =
  'patrulla' | 'persecucion' | 'anticipando' | 'atacando' | 'aturdido' | 'muerto';

/** Limites de la ronda de patrulla, en coordenadas de mundo. */
export interface RangoPatrulla {
  izquierda: number;
  derecha: number;
}

/**
 * Devoto: fiel de la Diocesis. Primer enemigo del Atrio.
 *
 * No es un monstruo. Es un engranaje del sistema, y por eso da mas miedo: ataca
 * al Cirujano porque cree que esta interrumpiendo un sacramento, no por maldad.
 * Su golpe se telegrafia a proposito (420 ms) para que el parry sea una lectura
 * justa y no un reflejo imposible.
 */
export class Devoto implements Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  /** Zona de dano del golpe, activa solo durante la ventana de ataque. */
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly vitalidad: Vitalidad;
  private readonly barra: BarraVida;

  private estado: EstadoDevoto = 'patrulla';
  private mirandoDerecha = true;

  private finAccion = -Infinity;
  private finEnfriamientoAtaque = -Infinity;
  private inicioHitbox = -Infinity;
  private ultimoAvistamiento = -Infinity;
  /** Evita que un mismo golpe hiera dos veces en la misma ventana. */
  private yaGolpeoEnSwing = false;
  private tweenTelegrafia?: Phaser.Tweens.Tween;

  private readonly escena: Phaser.Scene;
  private readonly patrulla: RangoPatrulla;

  constructor(escena: Phaser.Scene, x: number, y: number, patrulla: RangoPatrulla) {
    this.escena = escena;
    this.patrulla = patrulla;
    this.vitalidad = new Vitalidad(DEVOTO.vida);

    this.sprite = escena.physics.add.sprite(x, y, 'devoto-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('devoto', this);
    this.sprite.setData('enemigo', this);

    const cuerpo = this.cuerpo;
    cuerpo.setSize(12, 22);
    cuerpo.setOffset(2, 2);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setCollideWorldBounds(true);

    this.hitbox = escena.add.zone(x, y, DEVOTO.rangoAtaque, 20);
    escena.physics.add.existing(this.hitbox);
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    cuerpoHitbox.setAllowGravity(false);
    cuerpoHitbox.enable = false;

    this.barra = new BarraVida(escena, 18);
    this.vitalidad.on('cambio', (puntos: number, maximo: number) => {
      this.barra.registrar(puntos, maximo);
    });
    this.vitalidad.on('muerte', () => this.morir());
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  get hiereAlContacto(): boolean {
    return !this.estaMuerto;
  }

  get estadoActual(): EstadoDevoto {
    return this.estado;
  }

  actualizar(objetivoX: number, objetivoY: number): void {
    if (this.estado === 'muerto') return;

    const ahora = this.escena.time.now;

    switch (this.estado) {
      case 'aturdido':
        this.actualizarAturdido(ahora);
        break;
      case 'anticipando':
        this.actualizarAnticipacion(ahora);
        break;
      case 'atacando':
        this.actualizarAtaque(ahora);
        break;
      case 'persecucion':
        this.actualizarPersecucion(ahora, objetivoX, objetivoY);
        break;
      default:
        this.actualizarPatrulla(ahora, objetivoX, objetivoY);
    }

    this.actualizarHitbox(ahora);
    this.sprite.setFlipX(!this.mirandoDerecha);
    this.barra.actualizar(this.sprite.x, this.sprite.y - this.sprite.height - 5);
  }

  // -- Comportamiento ------------------------------------------------------

  private detecta(objetivoX: number, objetivoY: number): boolean {
    const distancia = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      objetivoX,
      objetivoY,
    );
    return distancia <= DEVOTO.rangoDeteccion;
  }

  private actualizarPatrulla(ahora: number, objetivoX: number, objetivoY: number): void {
    if (this.detecta(objetivoX, objetivoY)) {
      this.ultimoAvistamiento = ahora;
      this.estado = 'persecucion';
      return;
    }

    // Rebote en los extremos de la ronda.
    if (this.sprite.x <= this.patrulla.izquierda) this.mirandoDerecha = true;
    if (this.sprite.x >= this.patrulla.derecha) this.mirandoDerecha = false;

    const direccion = this.mirandoDerecha ? 1 : -1;
    this.cuerpo.setVelocityX(direccion * DEVOTO.velocidadPatrulla);
  }

  private actualizarPersecucion(ahora: number, objetivoX: number, objetivoY: number): void {
    if (this.detecta(objetivoX, objetivoY)) {
      this.ultimoAvistamiento = ahora;
    } else if (ahora - this.ultimoAvistamiento > DEVOTO.memoriaMs) {
      this.estado = 'patrulla';
      return;
    }

    const distanciaX = objetivoX - this.sprite.x;
    this.mirandoDerecha = distanciaX > 0;

    if (Math.abs(distanciaX) <= DEVOTO.rangoAtaque && ahora >= this.finEnfriamientoAtaque) {
      this.iniciarAnticipacion(ahora);
      return;
    }

    this.cuerpo.setVelocityX(Math.sign(distanciaX) * DEVOTO.velocidadPersecucion);
  }

  private iniciarAnticipacion(ahora: number): void {
    this.estado = 'anticipando';
    this.cuerpo.setVelocityX(0);
    this.finAccion = ahora + DEVOTO.anticipacionAtaqueMs;
    this.yaGolpeoEnSwing = false;
    this.telegrafiarGolpe();
  }

  /**
   * Aviso visible de que el golpe viene.
   *
   * Sin esto el parry es adivinar, no leer: la ventana de 140 ms solo es justa
   * si el jugador puede ver la intencion durante los 420 ms previos. El Devoto
   * se tensa hacia atras y se tine de rojo antes de descargar.
   */
  private telegrafiarGolpe(): void {
    const direccion = this.mirandoDerecha ? 1 : -1;

    this.sprite.setTint(0xc94f4f);

    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = this.escena.tweens.add({
      targets: this.sprite,
      // Se echa hacia atras: la clasica anticipacion antes del golpe.
      x: this.sprite.x - direccion * 3,
      scaleY: 1.12,
      duration: DEVOTO.anticipacionAtaqueMs * 0.75,
      ease: 'Quad.easeOut',
      yoyo: false,
    });

    // Destello de aviso justo antes de que la hitbox exista.
    this.escena.time.delayedCall(DEVOTO.anticipacionAtaqueMs - 110, () => {
      if (this.estado !== 'anticipando') return;
      this.sprite.setTint(0xffffff);
    });
  }

  private limpiarTelegrafia(): void {
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = undefined;
    this.sprite.setScale(1);
    if (!this.estaMuerto) this.sprite.clearTint();
  }

  private actualizarAnticipacion(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora < this.finAccion) return;

    this.estado = 'atacando';
    this.inicioHitbox = ahora;
    this.finAccion = ahora + DEVOTO.duracionAtaqueMs;
    this.finEnfriamientoAtaque = this.finAccion + DEVOTO.enfriamientoAtaqueMs;

    // Descarga: la tension acumulada se suelta de golpe hacia delante.
    this.limpiarTelegrafia();
    const direccion = this.mirandoDerecha ? 1 : -1;
    this.escena.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + direccion * 5,
      duration: DEVOTO.duracionAtaqueMs,
      ease: 'Quad.easeOut',
    });
  }

  private actualizarAtaque(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora >= this.finAccion) this.estado = 'persecucion';
  }

  private actualizarAturdido(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora >= this.finAccion) this.estado = 'persecucion';
  }

  private actualizarHitbox(ahora: number): void {
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    const activa =
      this.estado === 'atacando' && ahora >= this.inicioHitbox && ahora < this.finAccion;

    if (!activa) {
      cuerpoHitbox.enable = false;
      return;
    }

    const direccion = this.mirandoDerecha ? 1 : -1;
    this.hitbox.setPosition(
      this.sprite.x + direccion * (DEVOTO.rangoAtaque / 2 + 4),
      this.sprite.y - 11,
    );
    cuerpoHitbox.reset(this.hitbox.x, this.hitbox.y);
    cuerpoHitbox.enable = true;
  }

  // -- Reacciones ----------------------------------------------------------

  /** @returns true si el golpe conecto. */
  recibirDano(cantidad: number, origenX: number): boolean {
    if (this.estado === 'muerto') return false;

    this.vitalidad.recibirDano(cantidad);
    // El listener de 'muerte' ya cambio el estado; consultamos la fuente.
    if (this.vitalidad.estaMuerto) return true;

    const direccion = this.sprite.x < origenX ? -1 : 1;
    this.cuerpo.setVelocityX(direccion * DEVOTO.retroceso);

    // Recibir un golpe lo pone en alerta aunque no hubiera visto al Cirujano.
    this.ultimoAvistamiento = this.escena.time.now;
    if (this.estado === 'patrulla') this.estado = 'persecucion';

    this.destellar(0xffffff);
    return true;
  }

  /** El parry del Cirujano interrumpe el golpe y deja al Devoto expuesto. */
  aturdir(): void {
    if (this.estado === 'muerto') return;

    this.estado = 'aturdido';
    this.finAccion = this.escena.time.now + COMBATE.parry.aturdimientoMs;
    this.finEnfriamientoAtaque = this.finAccion;
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setVelocityX(0);
    this.limpiarTelegrafia();

    // Aturdido: se tambalea y queda tintado hasta recuperarse. El jugador debe
    // ver de un vistazo que esta abierto.
    this.sprite.setTint(0xe8d9a0);
    this.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -6, to: 6 },
      duration: 160,
      yoyo: true,
      repeat: Math.floor(COMBATE.parry.aturdimientoMs / 320),
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.sprite.setAngle(0);
        if (!this.estaMuerto) this.sprite.clearTint();
      },
    });
  }

  /** La hitbox solo hiere una vez por ventana de ataque. */
  consumirGolpe(): boolean {
    if (this.yaGolpeoEnSwing) return false;
    this.yaGolpeoEnSwing = true;
    return true;
  }

  private morir(): void {
    this.estado = 'muerto';
    this.barra.ocultar();
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.tweenTelegrafia?.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);

    // Se desploma. Sin fanfarria: aqui morir es rutina.
    this.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: this.mirandoDerecha ? 90 : -90,
      y: this.sprite.y + 4,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => this.destruir(),
    });
  }

  private destellar(color: number): void {
    this.sprite.setTint(color);
    this.escena.time.delayedCall(120, () => {
      if (!this.estaMuerto) this.sprite.clearTint();
    });
  }

  destruir(): void {
    this.barra.destruir();
    this.hitbox.destroy();
    this.sprite.destroy();
  }
}
