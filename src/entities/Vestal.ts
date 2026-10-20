import { esfuerzo } from '../systems/Esfuerzo';
import Phaser from 'phaser';
import { MOVIMIENTO, VESTAL } from '../config/Sacramento';
import type { Enemigo } from './Enemigo';
import { Vitalidad } from '../systems/Vitalidad';
import { BarraVida } from '../ui/BarraVida';

/** Los dos cuadros del lanzamiento (issue #146). Sin pose: quieta. */
type PoseVestal = 'alza' | 'lanza';

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
  private readonly barra: BarraVida;

  /** La escena escucha esto para crear el sello en el sitio correcto. */
  readonly eventos = new Phaser.Events.EventEmitter();

  private estado: EstadoVestal = 'espera';
  private mirandoDerecha = true;

  private finAccion = -Infinity;
  private finEnfriamiento = -Infinity;
  private ultimoAvistamiento = -Infinity;
  private tweenTelegrafia?: Phaser.Tweens.Tween;

  /** 'vestal' o 'vestal-cazadora': de ahi salen las texturas de sus poses. */
  private readonly figura: string;
  private pose: PoseVestal | null = null;
  /** El sello encendiendose en la mano mientras invoca. */
  private resplandor?: Phaser.GameObjects.Image;

  private readonly escena: Phaser.Scene;
  private readonly rango: RangoVestal;

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    rango: RangoVestal,
    /** La cazadora de Mondadores lleva su mascara de caparazon (#99). */
    textura = 'vestal-placeholder',
  ) {
    this.escena = escena;
    this.rango = rango;
    this.vitalidad = new Vitalidad(VESTAL.vida);
    this.figura = textura.replace(/-placeholder$/, '');

    this.sprite = escena.physics.add.sprite(x, y, textura);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('vestal', this);
    this.sprite.setData('enemigo', this);

    const cuerpo = this.cuerpo;
    // Sprite de 22x38 con la caja de siempre, 12x26 pegada al suelo. El tocado
    // y la cruz quedan fuera: no tiene sentido chocar con una insignia.
    cuerpo.setSize(12, 26);
    cuerpo.setOffset((22 - 12) / 2, 38 - 26);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setCollideWorldBounds(true);

    this.barra = new BarraVida(escena, 16);
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

  readonly clase = 'vestal' as const;

  get hiereAlContacto(): boolean {
    return !this.estaMuerto;
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
    this.barra.actualizar(this.sprite.x, this.sprite.y - this.sprite.height - 5);
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

    // Se yergue y alza el sello sobre la mascara, y el sello se enciende en
    // la mano hasta que sale: el aviso esta en el sello, que es lo que hay
    // que parar, no en el cuerpo entero.
    this.posar('alza');
    this.sprite.setTint(0xf2e8c4);
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = this.escena.tweens.add({
      targets: this.sprite,
      scaleY: 1.1,
      duration: VESTAL.anticipacionMs * 0.8,
      ease: 'Quad.easeOut',
    });

    this.resplandor?.destroy();
    const mano = this.manoAlzada();
    this.resplandor = this.escena.add
      .image(mano.x, mano.y, 'brillo-placeholder')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe8d9a0)
      .setScale(0.08)
      .setAlpha(0.3)
      .setDepth(this.sprite.depth + 1);
    this.escena.tweens.add({
      targets: this.resplandor,
      scale: 0.3,
      alpha: 0.95,
      duration: VESTAL.anticipacionMs,
      ease: 'Quad.easeIn',
    });
  }

  /** Donde queda el sello con el brazo en alto (ver VESTAL_ALZA). */
  private manoAlzada(): { x: number; y: number } {
    const lado = this.mirandoDerecha ? 1 : -1;
    return { x: this.sprite.x + lado * 8, y: this.sprite.y - this.sprite.displayHeight + 5 };
  }

  /** Cambia de cuadro. Sin pose vuelve a estar quieta. */
  private posar(pose?: PoseVestal): void {
    if (!this.sprite.active) return;
    this.pose = pose ?? null;
    const clave = pose ? `${this.figura}-${pose}-placeholder` : `${this.figura}-placeholder`;
    this.sprite.setTexture(
      this.escena.textures.exists(clave) ? clave : `${this.figura}-placeholder`,
    );
  }

  private actualizarInvocacion(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (this.resplandor) {
      const mano = this.manoAlzada();
      this.resplandor.setPosition(mano.x, mano.y);
    }
    if (ahora < this.finAccion) return;

    this.limpiarTelegrafia();
    this.finEnfriamiento = ahora + VESTAL.enfriamientoMs;
    this.estado = 'espera';

    // El brazo baja al frente y suelta el sello desde la mano. Se queda
    // tendido un momento: lo justo para ver de donde ha salido.
    this.posar('lanza');
    this.escena.time.delayedCall(260, () => {
      if (this.pose === 'lanza' && !this.estaMuerto) this.posar();
    });

    // La escena crea el sello: la entidad no conoce el grupo de proyectiles.
    esfuerzo.enemigo('vestal', 'ataque');
    this.eventos.emit('lanzar', {
      x: this.sprite.x + (this.mirandoDerecha ? 10 : -10),
      // A la altura de la mano tendida (ver VESTAL_LANZA).
      y: this.sprite.y - 24,
      direccion: this.mirandoDerecha ? 1 : -1,
    });
  }

  private limpiarTelegrafia(): void {
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = undefined;
    this.sprite.setScale(1);
    if (!this.estaMuerto) this.sprite.clearTint();
    this.apagarResplandor();
  }

  /** El sello de la mano se apaga deprisa: ha salido o se ha cortado. */
  private apagarResplandor(): void {
    const resplandor = this.resplandor;
    if (!resplandor) return;
    this.resplandor = undefined;
    this.escena.tweens.killTweensOf(resplandor);
    this.escena.tweens.add({
      targets: resplandor,
      alpha: 0,
      scale: resplandor.scale * 1.4,
      duration: 120,
      onComplete: () => resplandor.destroy(),
    });
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
      this.posar();
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
    this.barra.ocultar();
    this.tweenTelegrafia?.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);
    this.apagarResplandor();
    this.posar();
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
    this.barra.destruir();
    this.eventos.removeAllListeners();
    this.resplandor?.destroy();
    this.sprite.destroy();
  }
}
