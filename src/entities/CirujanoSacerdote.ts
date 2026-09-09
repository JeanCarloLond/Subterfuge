import Phaser from 'phaser';
import { AGARRE, COMBATE, DASH, FERVOR, MOVIMIENTO, POCION, VITALIDAD } from '../config/Sacramento';
import type { Controles } from '../input/Controles';
import { Fervor } from '../systems/Fervor';
import { Vitalidad } from '../systems/Vitalidad';

export type EstadoCirujano =
  'suelo' | 'aire' | 'dash' | 'agarre' | 'atacando' | 'parry' | 'bebiendo' | 'herido' | 'muerto';

/** Resultado de un intento de dano sobre el Cirujano. */
export type ResultadoDano = 'parado' | 'herido' | 'ignorado';

/** Variante de golpe. El cargado gasta Fervor a cambio de dano. */
type TipoAtaque = 'basico' | 'cargado';

/**
 * "Manos del Sacramento N.o 7".
 *
 * Fase 2: locomocion + combate cuerpo a cuerpo (ataque, ataque cargado, parry),
 * Fervor, Pocion de Carne y muerte.
 *
 * El sprite sigue siendo un placeholder generado por codigo; el arte definitivo
 * es pixel art hecho a mano en Aseprite por el equipo (ver docs/issues/).
 */
export class CirujanoSacerdote {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  /** Zona de dano del golpe. La escena la cruza con el grupo de enemigos. */
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly vitalidad: Vitalidad;
  readonly fervor: Fervor;
  /** Emite 'pociones' (cargas restantes) cuando el frasco cambia. */
  readonly eventos = new Phaser.Events.EventEmitter();

  private estado: EstadoCirujano = 'aire';
  private mirandoDerecha = true;

  private saltosRestantes = 0;
  private dashesEnAireRestantes = DASH.usosEnAire;
  private cargasPocion = POCION.cargasMaximas;

  /** Marcas de tiempo del reloj de la escena (ms). */
  private ultimoInstanteEnSuelo = -Infinity;
  private instanteSaltoEncolado = -Infinity;
  private finDash = -Infinity;
  private finEnfriamientoDash = -Infinity;
  private finInvulnerabilidad = -Infinity;
  private finBloqueoAgarre = -Infinity;
  private finAccion = -Infinity;
  private finEnfriamientoAtaque = -Infinity;
  private finEnfriamientoParry = -Infinity;
  private finVentanaParry = -Infinity;
  private inicioHitbox = -Infinity;
  private inicioCargaAtaque = -Infinity;

  private ataqueEnCurso: TipoAtaque = 'basico';
  /** El arco del golpe se dibuja una sola vez por swing. */
  private tajoMostrado = false;
  private direccionAgarre: -1 | 1 = 1;
  /** Enemigos ya golpeados por el swing actual: un golpe no cuenta dos veces. */
  private golpeadosEnSwing = new Set<object>();

  private readonly escena: Phaser.Scene;
  private readonly controles: Controles;

  constructor(escena: Phaser.Scene, x: number, y: number, controles: Controles) {
    this.escena = escena;
    this.controles = controles;

    this.vitalidad = new Vitalidad(VITALIDAD.maxima);
    this.fervor = new Fervor();

    this.sprite = escena.physics.add.sprite(x, y, 'cirujano-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setCollideWorldBounds(true);

    const cuerpo = this.cuerpo;
    // El sprite mide 16x32, pero el capirote NO colisiona: la caja empieza a la
    // altura de la mascara. Un cono de 10 px que choque con los techos volveria
    // el salto impredecible sin que el jugador entienda por que.
    cuerpo.setSize(10, 22);
    cuerpo.setOffset(3, 10);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setMaxVelocity(MOVIMIENTO.velocidadCaminar, MOVIMIENTO.velocidadCaidaMax);

    this.hitbox = escena.add.zone(x, y, COMBATE.ataque.alcance, COMBATE.ataque.alto);
    escena.physics.add.existing(this.hitbox);
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    cuerpoHitbox.setAllowGravity(false);
    cuerpoHitbox.enable = false;

    this.vitalidad.on('muerte', () => this.morir());
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  /** Invulnerable durante los i-frames del dash o tras ser herido. */
  get esInvulnerable(): boolean {
    return this.escena.time.now < this.finInvulnerabilidad;
  }

  get estaParando(): boolean {
    return this.escena.time.now < this.finVentanaParry;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  get estadoActual(): EstadoCirujano {
    return this.estado;
  }

  get pociones(): number {
    return this.cargasPocion;
  }

  /** Variante del swing en curso, para que la escena module el impacto. */
  get golpeActualEsCargado(): boolean {
    return this.ataqueEnCurso === 'cargado';
  }

  /** true mientras el golpe cargado esta listo para soltarse. */
  get cargaCompleta(): boolean {
    return (
      this.inicioCargaAtaque > 0 &&
      this.escena.time.now - this.inicioCargaAtaque >= COMBATE.cargado.tiempoCargaMs
    );
  }

  actualizar(): void {
    if (this.estado === 'muerto') {
      this.cuerpo.setAccelerationX(0);
      this.cuerpo.setDragX(MOVIMIENTO.friccionSuelo);
      return;
    }

    const ahora = this.escena.time.now;
    const cuerpo = this.cuerpo;
    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;

    if (enSuelo) {
      this.ultimoInstanteEnSuelo = ahora;
      this.dashesEnAireRestantes = DASH.usosEnAire;
      if (!this.enAccionBloqueante()) this.saltosRestantes = 1;
    }

    if (this.controles.saltoPresionado) this.instanteSaltoEncolado = ahora;

    this.procesarEntradasDeCombate(ahora);
    this.actualizarHitbox(ahora);

    if (this.controles.dashPresionado) this.intentarDash(ahora);

    switch (this.estado) {
      case 'dash':
        this.actualizarDash(ahora);
        break;
      case 'agarre':
        this.actualizarAgarre(ahora);
        break;
      case 'atacando':
      case 'parry':
      case 'bebiendo':
      case 'herido':
        this.actualizarAccion(ahora, enSuelo);
        break;
      default:
        this.actualizarLocomocion(ahora, enSuelo);
    }

    this.actualizarOrientacion();
  }

  // -- Combate -------------------------------------------------------------

  /** Estados en los que la entrada de movimiento queda bloqueada. */
  private enAccionBloqueante(): boolean {
    return (
      this.estado === 'atacando' ||
      this.estado === 'parry' ||
      this.estado === 'bebiendo' ||
      this.estado === 'herido'
    );
  }

  private puedeActuar(): boolean {
    return !this.enAccionBloqueante() && this.estado !== 'dash' && this.estado !== 'muerto';
  }

  private procesarEntradasDeCombate(ahora: number): void {
    if (!this.puedeActuar()) return;

    if (this.controles.parryPresionado && ahora >= this.finEnfriamientoParry) {
      this.iniciarParry(ahora);
      return;
    }

    if (this.controles.pocionPresionada && this.cargasPocion > 0) {
      this.beberPocion(ahora);
      return;
    }

    if (ahora < this.finEnfriamientoAtaque) return;

    // Mantener el boton acumula carga; soltarlo decide que golpe sale.
    if (this.controles.ataquePresionado) {
      this.inicioCargaAtaque = ahora;
      return;
    }

    if (this.controles.ataqueSoltado && this.inicioCargaAtaque > 0) {
      const cargado = this.cargaCompleta && this.fervor.alcanzaPara(COMBATE.cargado.costeFervor);
      this.inicioCargaAtaque = -Infinity;
      this.iniciarAtaque(ahora, cargado ? 'cargado' : 'basico');
    }
  }

  private iniciarAtaque(ahora: number, tipo: TipoAtaque): void {
    const perfil = tipo === 'cargado' ? COMBATE.cargado : COMBATE.ataque;

    if (tipo === 'cargado' && !this.fervor.gastar(COMBATE.cargado.costeFervor)) {
      return;
    }

    this.estado = 'atacando';
    this.ataqueEnCurso = tipo;
    this.golpeadosEnSwing.clear();
    this.tajoMostrado = false;

    this.inicioHitbox = ahora + perfil.anticipacionMs;
    this.finAccion = this.inicioHitbox + perfil.duracionMs;
    this.finEnfriamientoAtaque = this.finAccion + perfil.enfriamientoMs;
  }

  private iniciarParry(ahora: number): void {
    this.estado = 'parry';
    this.finVentanaParry = ahora + COMBATE.parry.ventanaMs;
    this.finAccion = this.finVentanaParry;
    this.finEnfriamientoParry = this.finVentanaParry + COMBATE.parry.enfriamientoMs;
  }

  private beberPocion(ahora: number): void {
    this.cargasPocion -= 1;
    this.estado = 'bebiendo';
    this.finAccion = ahora + POCION.duracionMs;
    this.vitalidad.curar(POCION.curacion);
    this.eventos.emit('pociones', this.cargasPocion);
  }

  /** Coloca y activa/desactiva la zona de dano segun la fase del golpe. */
  private actualizarHitbox(ahora: number): void {
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    const activa =
      this.estado === 'atacando' && ahora >= this.inicioHitbox && ahora < this.finAccion;

    if (!activa) {
      cuerpoHitbox.enable = false;
      return;
    }

    const perfil = this.ataqueEnCurso === 'cargado' ? COMBATE.cargado : COMBATE.ataque;
    const direccion = this.mirandoDerecha ? 1 : -1;

    this.hitbox.setSize(perfil.alcance, perfil.alto);
    cuerpoHitbox.setSize(perfil.alcance, perfil.alto);
    // A la altura del torso, no del capirote.
    this.hitbox.setPosition(
      this.sprite.x + direccion * (perfil.alcance / 2 + 4),
      this.sprite.y - 14,
    );
    cuerpoHitbox.reset(this.hitbox.x, this.hitbox.y);
    cuerpoHitbox.enable = true;

    if (!this.tajoMostrado) {
      this.tajoMostrado = true;
      this.dibujarTajo(perfil.alcance, perfil.alto, direccion);
    }
  }

  /**
   * Arco visible del golpe. Sin esto el ataque es invisible hasta que toca algo,
   * y el jugador no puede leer su propio alcance.
   */
  private dibujarTajo(alcance: number, alto: number, direccion: number): void {
    const cargado = this.ataqueEnCurso === 'cargado';

    const tajo = this.escena.add.sprite(this.hitbox.x, this.hitbox.y, 'tajo-placeholder');
    tajo.setDepth(58);
    tajo.setTint(cargado ? 0xc94f4f : 0xd6cfc4);
    tajo.setDisplaySize(4, alto);
    tajo.setAlpha(0.9);

    // Barrido: el arco se estira a lo ancho del alcance y se desvanece.
    this.escena.tweens.add({
      targets: tajo,
      displayWidth: alcance,
      x: this.sprite.x + direccion * (alcance / 2 + 4),
      alpha: 0,
      duration: cargado ? 190 : 130,
      ease: 'Quad.easeOut',
      onComplete: () => tajo.destroy(),
    });
  }

  /**
   * La escena llama a esto cuando la hitbox toca a un enemigo.
   * @returns dano a aplicar, o 0 si ese enemigo ya fue golpeado en este swing.
   */
  registrarGolpe(enemigo: object): number {
    if (this.golpeadosEnSwing.has(enemigo)) return 0;
    this.golpeadosEnSwing.add(enemigo);

    this.fervor.ganar(FERVOR.porGolpeAsestado);
    return this.ataqueEnCurso === 'cargado' ? COMBATE.cargado.dano : COMBATE.ataque.dano;
  }

  /**
   * Intento de dano sobre el Cirujano.
   * @param origenX x del atacante, para decidir la direccion del retroceso.
   */
  recibirDano(cantidad: number, origenX: number): ResultadoDano {
    if (this.estado === 'muerto') return 'ignorado';

    // El parry tiene prioridad: anula el golpe y premia con Fervor.
    if (this.estaParando) {
      this.fervor.ganar(FERVOR.porParry);
      this.finVentanaParry = -Infinity;
      return 'parado';
    }

    if (this.esInvulnerable) return 'ignorado';

    const ahora = this.escena.time.now;
    this.vitalidad.recibirDano(cantidad);
    // El listener de 'muerte' ya cambio el estado; consultamos la fuente.
    if (this.vitalidad.estaMuerto) return 'herido';

    this.estado = 'herido';
    this.finAccion = ahora + 220;
    this.finInvulnerabilidad = ahora + VITALIDAD.invulnerabilidadMs;
    this.inicioCargaAtaque = -Infinity;

    const direccion = this.sprite.x < origenX ? -1 : 1;
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocity(direccion * VITALIDAD.retrocesoX, -VITALIDAD.retrocesoY);

    return 'herido';
  }

  private morir(): void {
    this.estado = 'muerto';
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocityX(0);
    this.sprite.setAlpha(0.4);
  }

  /** Resurreccion en el ultimo Altar: restaura cuerpo, Fervor y pociones. */
  reaparecerEn(x: number, y: number): void {
    this.estado = 'aire';
    this.vitalidad.restaurar();
    this.fervor.reiniciar();
    this.cargasPocion = POCION.cargasMaximas;

    this.sprite.setAlpha(1);
    this.sprite.setPosition(x, y);
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocity(0, 0);

    this.finInvulnerabilidad = this.escena.time.now + VITALIDAD.invulnerabilidadMs;
    this.inicioCargaAtaque = -Infinity;
    this.eventos.emit('pociones', this.cargasPocion);
  }

  /**
   * Parry logrado contra algo que no es un golpe cuerpo a cuerpo (un sello del
   * diezmo, por ejemplo). Paga el mismo Fervor y consume la ventana.
   */
  premiarParry(): void {
    this.fervor.ganar(FERVOR.porParry);
    this.finVentanaParry = -Infinity;
  }

  /**
   * Caida al vacio: cuesta vitalidad y devuelve al Altar, pero no es muerte.
   * Si el golpe resulta mortal, `morir()` se encarga por el evento de siempre.
   */
  recibirCaida(cantidad: number, x: number, y: number): void {
    if (this.estado === 'muerto') return;

    this.vitalidad.recibirDano(cantidad);
    if (this.vitalidad.estaMuerto) return;

    this.estado = 'aire';
    this.sprite.setPosition(x, y);
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocity(0, 0);
    this.finInvulnerabilidad = this.escena.time.now + VITALIDAD.invulnerabilidadMs;
    this.inicioCargaAtaque = -Infinity;
  }

  /** Rezar en un Altar repone el frasco sin devolver el Fervor gastado. */
  reponerEnAltar(): void {
    this.vitalidad.restaurar();
    this.cargasPocion = POCION.cargasMaximas;
    this.eventos.emit('pociones', this.cargasPocion);
  }

  private actualizarAccion(ahora: number, enSuelo: boolean): void {
    const cuerpo = this.cuerpo;

    // En suelo la accion clava al Cirujano; en el aire conserva la inercia.
    if (enSuelo) {
      cuerpo.setAccelerationX(0);
      cuerpo.setDragX(MOVIMIENTO.friccionSuelo * 2);
    }

    if (ahora >= this.finAccion) {
      this.estado = enSuelo ? 'suelo' : 'aire';
    }
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
    if (this.enAccionBloqueante()) return;

    const enSuelo = this.cuerpo.blocked.down || this.cuerpo.touching.down;
    if (!enSuelo) {
      if (this.dashesEnAireRestantes <= 0) return;
      this.dashesEnAireRestantes -= 1;
    }

    const direccion =
      this.controles.ejeX !== 0 ? Math.sign(this.controles.ejeX) : this.mirandoDerecha ? 1 : -1;

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
      cuerpo.blocked.left || cuerpo.touching.left
        ? -1
        : cuerpo.blocked.right || cuerpo.touching.right
          ? 1
          : 0;

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

  /**
   * Squash y stretch: se estira al subir, se aplasta al aterrizar y cabecea al
   * caminar. Es animacion procedural, no sustituye al spritesheet del equipo,
   * pero quita la rigidez de bloque mientras no lo hay.
   */
  private actualizarDeformacion(): void {
    const cuerpo = this.cuerpo;
    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;

    let escalaX = 1;
    let escalaY = 1;

    if (this.estado === 'dash') {
      // El dash se alarga en la direccion del movimiento.
      escalaX = 1.18;
      escalaY = 0.86;
    } else if (!enSuelo) {
      const vertical = Phaser.Math.Clamp(cuerpo.velocity.y / 620, -1, 1);
      // Subiendo estira; cayendo estira menos, para no parecer de goma.
      const intensidad = vertical < 0 ? 0.14 : 0.09;
      escalaY = 1 + Math.abs(vertical) * intensidad;
      escalaX = 1 - Math.abs(vertical) * intensidad * 0.7;
    } else if (Math.abs(cuerpo.velocity.x) > 20) {
      // Cabeceo al caminar, en fase con el avance recorrido.
      const paso = Math.sin(this.escena.time.now / 90);
      escalaY = 1 + paso * 0.035;
      escalaX = 1 - paso * 0.025;
    }

    this.sprite.setScale(escalaX, escalaY);
  }

  private actualizarOrientacion(): void {
    this.sprite.setFlipX(!this.mirandoDerecha);
    this.actualizarDeformacion();

    // Legibilidad sin arte definitivo: el color comunica el estado.
    if (this.estado === 'parry') {
      this.sprite.setTint(0xe8d9a0);
    } else if (this.estado === 'atacando') {
      this.sprite.setTint(this.ataqueEnCurso === 'cargado' ? 0xc94f4f : 0xffffff);
    } else if (this.cargaCompleta && this.controles.ataqueMantenido) {
      this.sprite.setTint(0xc94f4f);
    } else {
      this.sprite.clearTint();
    }

    this.sprite.setAlpha(
      this.esInvulnerable && !this.estaMuerto ? 0.55 : this.estaMuerto ? 0.4 : 1,
    );
  }
}
