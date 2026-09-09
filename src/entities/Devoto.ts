import Phaser from 'phaser';
import { COMBATE, DEVOTO, MOVIMIENTO } from '../config/Sacramento';
import { Vitalidad } from '../systems/Vitalidad';

export type EstadoDevoto =
  | 'patrulla'
  | 'persecucion'
  | 'anticipando'
  | 'atacando'
  | 'aturdido'
  | 'muerto';

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
export class Devoto {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  /** Zona de dano del golpe, activa solo durante la ventana de ataque. */
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly vitalidad: Vitalidad;

  private estado: EstadoDevoto = 'patrulla';
  private mirandoDerecha = true;

  private finAccion = -Infinity;
  private finEnfriamientoAtaque = -Infinity;
  private inicioHitbox = -Infinity;
  private ultimoAvistamiento = -Infinity;
  /** Evita que un mismo golpe hiera dos veces en la misma ventana. */
  private yaGolpeoEnSwing = false;

  private readonly escena: Phaser.Scene;
  private readonly patrulla: RangoPatrulla;

  constructor(escena: Phaser.Scene, x: number, y: number, patrulla: RangoPatrulla) {
    this.escena = escena;
    this.patrulla = patrulla;
    this.vitalidad = new Vitalidad(DEVOTO.vida);

    this.sprite = escena.physics.add.sprite(x, y, 'devoto-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('devoto', this);

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

    this.vitalidad.on('muerte', () => this.morir());
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
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
  }

  private actualizarAnticipacion(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora < this.finAccion) return;

    this.estado = 'atacando';
    this.inicioHitbox = ahora;
    this.finAccion = ahora + DEVOTO.duracionAtaqueMs;
    this.finEnfriamientoAtaque = this.finAccion + DEVOTO.enfriamientoAtaqueMs;
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
    this.destellar(0xe8d9a0);
  }

  /** La hitbox solo hiere una vez por ventana de ataque. */
  consumirGolpe(): boolean {
    if (this.yaGolpeoEnSwing) return false;
    this.yaGolpeoEnSwing = true;
    return true;
  }

  private morir(): void {
    this.estado = 'muerto';
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;

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
    this.hitbox.destroy();
    this.sprite.destroy();
  }
}
