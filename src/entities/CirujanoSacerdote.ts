import Phaser from 'phaser';
import { AGARRE, DASH, MOVIMIENTO } from '../config/Sacramento';
import type { Controles } from '../input/Controles';

/** Estados de movimiento. El combate (Fase 2) anadira Atacando y Parry. */
export type EstadoCirujano = 'suelo' | 'aire' | 'dash' | 'agarre';

/**
 * "Manos del Sacramento N.o 7".
 *
 * Fase 1: solo locomocion y fisicas. Sin combate, sin dano, sin Fervor gastable.
 * El sprite es un placeholder generado por codigo; el arte definitivo es pixel
 * art hecho a mano en Aseprite por el equipo (ver docs/issues/).
 */
export class CirujanoSacerdote {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  private estado: EstadoCirujano = 'aire';
  private mirandoDerecha = true;

  private saltosRestantes = 0;
  private dashesEnAireRestantes = DASH.usosEnAire;

  /** Marcas de tiempo del reloj de la escena (ms). */
  private ultimoInstanteEnSuelo = -Infinity;
  private instanteSaltoEncolado = -Infinity;
  private finDash = -Infinity;
  private finEnfriamientoDash = -Infinity;
  private finInvulnerabilidad = -Infinity;
  private finBloqueoAgarre = -Infinity;

  private direccionAgarre: -1 | 1 = 1;

  private readonly escena: Phaser.Scene;
  private readonly controles: Controles;

  constructor(escena: Phaser.Scene, x: number, y: number, controles: Controles) {
    this.escena = escena;
    this.controles = controles;

    this.sprite = escena.physics.add.sprite(x, y, 'cirujano-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setCollideWorldBounds(true);

    const cuerpo = this.cuerpo;
    cuerpo.setSize(10, 22);
    cuerpo.setOffset(3, 2);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setMaxVelocity(MOVIMIENTO.velocidadCaminar, MOVIMIENTO.velocidadCaidaMax);
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  /** Invulnerable durante los i-frames del dash. Lo consumira el combate. */
  get esInvulnerable(): boolean {
    return this.escena.time.now < this.finInvulnerabilidad;
  }

  get estadoActual(): EstadoCirujano {
    return this.estado;
  }

  actualizar(): void {
    const ahora = this.escena.time.now;
    const cuerpo = this.cuerpo;
    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;

    if (enSuelo) {
      this.ultimoInstanteEnSuelo = ahora;
      this.dashesEnAireRestantes = DASH.usosEnAire;
      if (this.estado !== 'dash') this.saltosRestantes = 1;
    }

    if (this.controles.saltoPresionado) this.instanteSaltoEncolado = ahora;
    if (this.controles.dashPresionado) this.intentarDash(ahora);

    switch (this.estado) {
      case 'dash':
        this.actualizarDash(ahora);
        break;
      case 'agarre':
        this.actualizarAgarre(ahora);
        break;
      default:
        this.actualizarLocomocion(ahora, enSuelo);
    }

    this.actualizarOrientacion();
  }

  // -- Locomocion ----------------------------------------------------------

  private actualizarLocomocion(ahora: number, enSuelo: boolean): void {
    this.estado = enSuelo ? 'suelo' : 'aire';

    const eje = this.controles.ejeX;
    const cuerpo = this.cuerpo;
    const aceleracion = enSuelo ? MOVIMIENTO.aceleracionSuelo : MOVIMIENTO.aceleracionAire;
    const friccion = enSuelo ? MOVIMIENTO.friccionSuelo : MOVIMIENTO.friccionAire;

    if (eje !== 0) {
      cuerpo.setAccelerationX(eje * aceleracion);
      cuerpo.setDragX(0);
      this.mirandoDerecha = eje > 0;
    } else {
      cuerpo.setAccelerationX(0);
      cuerpo.setDragX(friccion);
    }

    this.resolverSalto(ahora, enSuelo);
    this.recortarSaltoSiSuelta();

    if (!enSuelo) this.intentarAgarre(ahora, eje);
  }

  private resolverSalto(ahora: number, enSuelo: boolean): void {
    const saltoEncolado = ahora - this.instanteSaltoEncolado <= MOVIMIENTO.bufferSaltoMs;
    if (!saltoEncolado) return;

    const enCoyote = ahora - this.ultimoInstanteEnSuelo <= MOVIMIENTO.coyoteMs;

    if (enSuelo || enCoyote) {
      this.ejecutarSalto(MOVIMIENTO.impulsoSalto);
      this.saltosRestantes = 1;
    } else if (this.saltosRestantes > 0) {
      this.ejecutarSalto(MOVIMIENTO.impulsoDobleSalto);
      this.saltosRestantes -= 1;
    }
  }

  private ejecutarSalto(impulso: number): void {
    this.cuerpo.setVelocityY(-impulso);
    this.instanteSaltoEncolado = -Infinity;
    this.ultimoInstanteEnSuelo = -Infinity;
    this.estado = 'aire';
  }

  /** Salto variable: soltar el boton en ascenso recorta la altura. */
  private recortarSaltoSiSuelta(): void {
    const cuerpo = this.cuerpo;
    if (cuerpo.velocity.y < 0 && !this.controles.saltoMantenido) {
      cuerpo.setVelocityY(cuerpo.velocity.y * MOVIMIENTO.factorCorteSalto);
    }
  }

  // -- Dash ----------------------------------------------------------------

  private intentarDash(ahora: number): void {
    if (ahora < this.finEnfriamientoDash) return;
    if (this.estado === 'dash' || this.estado === 'agarre') return;

    const enSuelo = this.cuerpo.blocked.down || this.cuerpo.touching.down;
    if (!enSuelo) {
      if (this.dashesEnAireRestantes <= 0) return;
      this.dashesEnAireRestantes -= 1;
    }

    const direccion = this.controles.ejeX !== 0
      ? Math.sign(this.controles.ejeX)
      : (this.mirandoDerecha ? 1 : -1);

    this.estado = 'dash';
    this.finDash = ahora + DASH.duracionMs;
    this.finInvulnerabilidad = ahora + DASH.invulnerabilidadMs;
    this.finEnfriamientoDash = ahora + DASH.duracionMs + DASH.enfriamientoMs;

    const cuerpo = this.cuerpo;
    cuerpo.setMaxVelocity(DASH.velocidad, MOVIMIENTO.velocidadCaidaMax);
    cuerpo.setAccelerationX(0);
    cuerpo.setDragX(0);
    cuerpo.setVelocityX(direccion * DASH.velocidad);
    // Dash plano: sin gravedad mientras dura.
    cuerpo.setVelocityY(0);
    cuerpo.setAllowGravity(false);
  }

  private actualizarDash(ahora: number): void {
    if (ahora < this.finDash) return;

    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setMaxVelocity(MOVIMIENTO.velocidadCaminar, MOVIMIENTO.velocidadCaidaMax);
    this.estado = 'aire';
  }

  // -- Agarre de bordes ----------------------------------------------------

  private intentarAgarre(ahora: number, eje: number): void {
    if (ahora < this.finBloqueoAgarre) return;
    if (this.cuerpo.velocity.y < 0) return; // solo al caer

    const cuerpo = this.cuerpo;
    const contraPared =
      (cuerpo.blocked.left || cuerpo.touching.left) ? -1 :
      (cuerpo.blocked.right || cuerpo.touching.right) ? 1 : 0;

    if (contraPared === 0) return;
    // Debe empujarse contra la pared para engancharse.
    if (eje !== contraPared) return;

    this.direccionAgarre = contraPared as -1 | 1;
    this.estado = 'agarre';
    cuerpo.setAllowGravity(false);
    cuerpo.setVelocity(0, AGARRE.deslizamiento);
    cuerpo.setAccelerationX(0);
    this.saltosRestantes = 1;
    this.dashesEnAireRestantes = DASH.usosEnAire;
    this.mirandoDerecha = this.direccionAgarre > 0;
  }

  private actualizarAgarre(ahora: number): void {
    const cuerpo = this.cuerpo;
    const saltoEncolado = ahora - this.instanteSaltoEncolado <= MOVIMIENTO.bufferSaltoMs;

    // Trepar: arriba o salto impulsa hacia el borde.
    if (this.controles.arribaMantenido || saltoEncolado) {
      this.soltarAgarre(ahora);
      cuerpo.setVelocityY(-AGARRE.impulsoTrepar);
      cuerpo.setVelocityX(this.direccionAgarre * MOVIMIENTO.velocidadCaminar * 0.6);
      this.instanteSaltoEncolado = -Infinity;
      return;
    }

    // Soltarse: abajo, o dejar de empujar contra la pared.
    if (this.controles.abajoMantenido || this.controles.ejeX === -this.direccionAgarre) {
      this.soltarAgarre(ahora);
      return;
    }

    cuerpo.setVelocity(0, AGARRE.deslizamiento);
  }

  private soltarAgarre(ahora: number): void {
    this.cuerpo.setAllowGravity(true);
    this.finBloqueoAgarre = ahora + AGARRE.bloqueoTrasSoltarMs;
    this.estado = 'aire';
  }

  // -- Presentacion --------------------------------------------------------

  private actualizarOrientacion(): void {
    this.sprite.setFlipX(!this.mirandoDerecha);
    // Parpadeo durante los i-frames: legible sin arte definitivo.
    this.sprite.setAlpha(this.esInvulnerable ? 0.55 : 1);
  }
}
