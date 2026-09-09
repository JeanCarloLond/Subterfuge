import Phaser from 'phaser';
import { MOVIMIENTO, VESTAL } from '../config/Sacramento';
import type { Enemigo } from './Enemigo';
import { Vitalidad } from '../systems/Vitalidad';

export type EstadoVestal = 'espera' | 'reposicion' | 'invocando' | 'aturdido' | 'muerto';

/** Limites del tramo por el que se mueve, en coordenadas de mundo. */
export interface RangoVestal {
  izquierda: number;
  derecha: number;
}

/**
 * Vestal: clero de la Diocesis.
 *
 * No pelea, administra. Mantiene la distancia y lanza sellos del diezmo; si el
 * Cirujano se le acerca, retrocede en vez de plantarle cara. Tiene la mitad de
 * vida que un Devoto, asi que el problema no es matarlo sino llegar hasta el.
 *
 * Su lanzamiento se telegrafia 520 ms —mas que el golpe del Devoto— porque la
 * respuesta interesante no es esquivar, es parar el sello y devolverselo.
 */
export class Vestal implements Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly vitalidad: Vitalidad;

  /** La escena escucha esto para crear el sello en el sitio correcto. */
  readonly eventos = new Phaser.Events.EventEmitter();

  private estado: EstadoVestal = 'espera';
  private mirandoDerecha = true;

  private finAccion = -Infinity;
  private finEnfriamiento = -Infinity;
  private ultimoAvistamiento = -Infinity;
  private tweenTelegrafia?: Phaser.Tweens.Tween;

  private readonly escena: Phaser.Scene;
  private readonly rango: RangoVestal;

  constructor(escena: Phaser.Scene, x: number, y: number, rango: RangoVestal) {
    this.escena = escena;
    this.rango = rango;
    this.vitalidad = new Vitalidad(VESTAL.vida);

    this.sprite = escena.physics.add.sprite(x, y, 'vestal-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('vestal', this);
    this.sprite.setData('enemigo', this);

    const cuerpo = this.cuerpo;
    cuerpo.setSize(12, 26);
    cuerpo.setOffset(2, 2);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setCollideWorldBounds(true);

    this.vitalidad.on('muerte', () => this.morir());
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  get estadoActual(): EstadoVestal {
    return this.estado;
  }

  actualizar(objetivoX: number, objetivoY: number): void {
    if (this.estado === 'muerto') return;

    const ahora = this.escena.time.now;

    switch (this.estado) {
      case 'aturdido':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finAccion) this.estado = 'espera';
        break;
      case 'invocando':
        this.actualizarInvocacion(ahora);
        break;
      default:
        this.actualizarPosicion(ahora, objetivoX, objetivoY);
    }

    this.sprite.setFlipX(!this.mirandoDerecha);
  }

  // -- Comportamiento ------------------------------------------------------

  private actualizarPosicion(ahora: number, objetivoX: number, objetivoY: number): void {
    const distancia = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      objetivoX,
      objetivoY,
    );

    if (distancia > VESTAL.rangoDeteccion) {
      // Sin nadie a la vista, se queda quieto: es un funcionario, no patrulla.
      if (ahora - this.ultimoAvistamiento > VESTAL.memoriaMs) {
        this.cuerpo.setVelocityX(0);
        this.estado = 'espera';
        return;
      }
    } else {
      this.ultimoAvistamiento = ahora;
    }

    const haciaElObjetivo = Math.sign(objetivoX - this.sprite.x) || 1;
    this.mirandoDerecha = haciaElObjetivo > 0;

    // Demasiado cerca: retrocede, sin darle la espalda.
    if (distancia < VESTAL.rangoHuida) {
      const retirada = -haciaElObjetivo;
      const destinoX = this.sprite.x + retirada * 10;
      const puedeRetroceder = destinoX > this.rango.izquierda && destinoX < this.rango.derecha;

      this.estado = 'reposicion';
      this.cuerpo.setVelocityX(puedeRetroceder ? retirada * VESTAL.velocidad : 0);
      return;
    }

    // Demasiado lejos: se acerca hasta su distancia de trabajo.
    if (distancia > VESTAL.rangoPreferido + 25) {
      this.estado = 'reposicion';
      this.cuerpo.setVelocityX(haciaElObjetivo * VESTAL.velocidad);
      return;
    }

    this.cuerpo.setVelocityX(0);
    this.estado = 'espera';

    if (ahora >= this.finEnfriamiento) this.iniciarInvocacion(ahora);
  }

  private iniciarInvocacion(ahora: number): void {
    this.estado = 'invocando';
    this.cuerpo.setVelocityX(0);
    this.finAccion = ahora + VESTAL.anticipacionMs;

    // Se yergue y se ilumina: el aviso de que el sello va a salir.
    this.sprite.setTint(0xe8d9a0);
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = this.escena.tweens.add({
      targets: this.sprite,
      scaleY: 1.1,
      duration: VESTAL.anticipacionMs * 0.8,
      ease: 'Quad.easeOut',
    });
  }

  private actualizarInvocacion(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora < this.finAccion) return;

    this.limpiarTelegrafia();
    this.finEnfriamiento = ahora + VESTAL.enfriamientoMs;
    this.estado = 'espera';

    // La escena crea el sello: la entidad no conoce el grupo de proyectiles.
    this.eventos.emit('lanzar', {
      x: this.sprite.x + (this.mirandoDerecha ? 10 : -10),
      y: this.sprite.y - 16,
      direccion: this.mirandoDerecha ? 1 : -1,
    });
  }

  private limpiarTelegrafia(): void {
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = undefined;
    this.sprite.setScale(1);
    if (!this.estaMuerto) this.sprite.clearTint();
  }

  // -- Reacciones ----------------------------------------------------------

  /** @returns true si el golpe conecto. */
  recibirDano(cantidad: number, origenX: number): boolean {
    if (this.estado === 'muerto') return false;

    this.vitalidad.recibirDano(cantidad);
    // El listener de 'muerte' ya cambio el estado; consultamos la fuente.
    if (this.vitalidad.estaMuerto) return true;

    // Recibir un golpe le corta la invocacion a medias.
    if (this.estado === 'invocando') {
      this.limpiarTelegrafia();
      this.finEnfriamiento = this.escena.time.now + VESTAL.enfriamientoMs * 0.6;
    }

    this.estado = 'aturdido';
    this.finAccion = this.escena.time.now + 260;
    this.ultimoAvistamiento = this.escena.time.now;

    const direccion = this.sprite.x < origenX ? -1 : 1;
    this.cuerpo.setVelocityX(direccion * VESTAL.retroceso);

    this.destellar(0xffffff);
    return true;
  }

  private morir(): void {
    this.estado = 'muerto';
    this.tweenTelegrafia?.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;

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
      if (!this.estaMuerto && this.estado !== 'invocando') this.sprite.clearTint();
    });
  }

  destruir(): void {
    this.eventos.removeAllListeners();
    this.sprite.destroy();
  }
}
