import Phaser from 'phaser';
import {
  AGARRE,
  COMBATE,
  CONTACTO,
  DASH,
  FERVOR,
  MOVIMIENTO,
  POCION,
  RELIQUIA,
  VITALIDAD,
} from '../config/Sacramento';
import type { Controles } from '../input/Controles';
import { Fervor } from '../systems/Fervor';
import { progreso, type TipoReliquia } from '../systems/Progreso';
import { sonido } from '../systems/Sonido';
import { Vitalidad } from '../systems/Vitalidad';

export type EstadoCirujano =
  | 'suelo'
  | 'aire'
  | 'dash'
  | 'agarre'
  | 'atacando'
  | 'parry'
  | 'bebiendo'
  | 'rezando'
  | 'herido'
  | 'muerto';

/** Resultado de un intento de dano sobre el Cirujano. */
export type ResultadoDano = 'parado' | 'herido' | 'ignorado';

/** Variante de golpe. El cargado gasta Fervor a cambio de dano. */
type TipoAtaque = 'basico' | 'cargado';

/**
 * Hacia donde se dirige el golpe. Se decide al pulsar, segun la direccion que
 * se mantenga: W golpea arriba; S, solo en el aire, golpea abajo.
 */
type DireccionAtaque = 'lateral' | 'arriba' | 'abajo';

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
  private cargasPocionMax: number = POCION.cargasMaximas;
  private cargasPocion: number = POCION.cargasMaximas;

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
  private direccionAtaque: DireccionAtaque = 'lateral';
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

    // Las reliquias recogidas en zonas anteriores siguen contando.
    this.vitalidad = new Vitalidad(VITALIDAD.maxima + progreso.vitalidadExtra);
    this.fervor = new Fervor();
    this.cargasPocionMax = POCION.cargasMaximas + progreso.pocionesExtra;
    this.cargasPocion = this.cargasPocionMax;

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

  get pocionesMaximas(): number {
    return this.cargasPocionMax;
  }

  /**
   * Una reliquia recien recogida cambia al Cirujano aqui mismo. El progreso
   * global ya la tiene apuntada; esto solo aplica su efecto a esta instancia.
   */
  aplicarReliquia(tipo: TipoReliquia): void {
    if (tipo === 'relicario') {
      this.vitalidad.aumentarMaximo(RELIQUIA.vitalidadExtra);
      return;
    }

    this.cargasPocionMax += RELIQUIA.pocionExtra;
    this.cargasPocion = Math.min(this.cargasPocionMax, this.cargasPocion + RELIQUIA.pocionExtra);
    this.eventos.emit('pociones', this.cargasPocion, this.cargasPocionMax);
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
      case 'rezando':
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
      this.estado === 'rezando' ||
      this.estado === 'herido'
    );
  }

  private puedeActuar(): boolean {
    return !this.enAccionBloqueante() && this.estado !== 'dash' && this.estado !== 'muerto';
  }

  private procesarEntradasDeCombate(ahora: number): void {
    // La suelta del boton se evalua ANTES del bloqueo de accion: el golpe
    // cargado se decide al soltar, y eso suele ocurrir durante el enfriamiento
    // del basico. Si se perdiera ahi, el cargado no saldria nunca.
    if (this.controles.ataqueSoltado) {
      const listo = this.cargaCompleta && this.fervor.alcanzaPara(COMBATE.cargado.costeFervor);
      this.inicioCargaAtaque = -Infinity;

      if (listo && this.puedeSoltarCargado()) {
        this.iniciarAtaque(ahora, 'cargado');
        return;
      }
    }

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

    // El golpe sale AL PULSAR, no al soltar: la respuesta tiene que ser
    // inmediata o el jugador cree que la tecla no funciona. Seguir manteniendo
    // el boton acumula carga para un segundo golpe, el cargado.
    if (this.controles.ataquePresionado) {
      this.iniciarAtaque(ahora, 'basico');
      this.inicioCargaAtaque = ahora;
    }
  }

  /** El cargado salta por encima del enfriamiento del basico, pero no de todo. */
  private puedeSoltarCargado(): boolean {
    return (
      this.estado !== 'muerto' &&
      this.estado !== 'dash' &&
      this.estado !== 'agarre' &&
      this.estado !== 'herido' &&
      this.estado !== 'bebiendo' &&
      this.estado !== 'parry' &&
      this.estado !== 'atacando'
    );
  }

  private iniciarAtaque(ahora: number, tipo: TipoAtaque): void {
    const perfil = tipo === 'cargado' ? COMBATE.cargado : COMBATE.ataque;

    if (tipo === 'cargado' && !this.fervor.gastar(COMBATE.cargado.costeFervor)) {
      return;
    }

    const enSuelo = this.cuerpo.blocked.down || this.cuerpo.touching.down;
    // Abajo solo tiene sentido en el aire: en el suelo golpearias la piedra.
    this.direccionAtaque =
      this.controles.abajoMantenido && !enSuelo
        ? 'abajo'
        : this.controles.arribaMantenido
          ? 'arriba'
          : 'lateral';

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
    this.eventos.emit('pociones', this.cargasPocion, this.cargasPocionMax);
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

    // Lateral: delante, a la altura del torso. Arriba: sobre el capirote.
    // Abajo: bajo los pies. En vertical la caja se gira (alto por ancho).
    let ancho: number = perfil.alcance;
    let alto: number = perfil.alto;
    let x = this.sprite.x + direccion * (perfil.alcance / 2 + 4);
    let y = this.sprite.y - 14;

    if (this.direccionAtaque === 'arriba') {
      ancho = perfil.alto;
      alto = perfil.alcance;
      x = this.sprite.x;
      y = this.sprite.y - 32 - perfil.alcance / 2 + 4;
    } else if (this.direccionAtaque === 'abajo') {
      ancho = perfil.alto;
      alto = perfil.alcance;
      x = this.sprite.x;
      y = this.sprite.y + perfil.alcance / 2 - 2;
    }

    this.hitbox.setSize(ancho, alto);
    cuerpoHitbox.setSize(ancho, alto);
    this.hitbox.setPosition(x, y);
    cuerpoHitbox.reset(this.hitbox.x, this.hitbox.y);
    cuerpoHitbox.enable = true;

    if (!this.tajoMostrado) {
      this.tajoMostrado = true;
      this.dibujarTajo(perfil.alcance, perfil.alto, direccion);
    }
  }

  /**
   * Arco visible del golpe: una media luna que barre de arriba abajo por
   * delante del Cirujano, con una estela mas tenue detras.
   *
   * Sin esto el ataque es invisible hasta que toca algo, y el jugador no
   * puede leer ni su alcance ni si el golpe llego a salir. El arco se dibuja
   * SIEMPRE, acierte o falle: la confirmacion de "he golpeado" no puede
   * depender de que hubiera un enemigo delante.
   */
  private dibujarTajo(alcance: number, alto: number, direccion: number): void {
    const cargado = this.ataqueEnCurso === 'cargado';
    const color = cargado ? 0xc94f4f : 0xe8e0d0;
    const radio = alcance + (cargado ? 6 : 2);
    const duracion = cargado ? 200 : 140;

    // La media luna se dibuja abriendo hacia +x; para arriba y abajo se gira
    // el conjunto -90 o +90 grados y el barrido va en el sentido del golpe.
    const giro =
      this.direccionAtaque === 'arriba' ? -90 : this.direccionAtaque === 'abajo' ? 90 : 0;
    const vertical = giro !== 0;
    const origenX = vertical ? this.sprite.x : this.sprite.x + direccion * 2;
    const origenY = vertical
      ? this.direccionAtaque === 'arriba'
        ? this.sprite.y - 30
        : this.sprite.y - 2
      : this.hitbox.y;
    const espejo = vertical ? 1 : direccion;

    // Media luna: borde nitido + relleno translucido, abriendo hacia delante.
    const arco = this.crearMediaLuna(origenX, origenY, radio, alto, color, cargado ? 3 : 2);
    arco.setScale(espejo * 0.55, 0.55);
    arco.setAngle(giro - 38 * espejo);

    // Barre hacia abajo mientras crece y se apaga: lectura de "tajo", no de
    // "rectangulo que aparece".
    this.escena.tweens.add({
      targets: arco,
      scaleX: espejo,
      scaleY: 1,
      angle: giro + 30 * espejo,
      alpha: 0,
      duration: duracion,
      ease: 'Cubic.easeOut',
      onComplete: () => arco.destroy(),
    });

    // Estela: la misma luna, mas fina y con retardo, siguiendo al arco.
    const estela = this.crearMediaLuna(origenX, origenY, radio * 0.85, alto, color, 1);
    estela.setScale(espejo * 0.5, 0.5);
    estela.setAngle(giro - 42 * espejo);
    estela.setAlpha(0.45);

    this.escena.tweens.add({
      targets: estela,
      scaleX: espejo * 0.95,
      scaleY: 0.95,
      angle: giro + 26 * espejo,
      alpha: 0,
      delay: 35,
      duration: duracion,
      ease: 'Cubic.easeOut',
      onComplete: () => estela.destroy(),
    });
  }

  /** Media luna abierta hacia +x. Se voltea con scaleX negativo. */
  private crearMediaLuna(
    x: number,
    y: number,
    radio: number,
    alto: number,
    color: number,
    grosor: number,
  ): Phaser.GameObjects.Graphics {
    const grafico = this.escena.add.graphics({ x, y });
    grafico.setDepth(58);

    // Abertura angular proporcional al alto de la hitbox: un golpe mas alto
    // dibuja un arco mas abierto, para que dibujo y dano coincidan.
    const apertura = Phaser.Math.Clamp(alto / radio, 0.6, 1.4);
    const inicio = -apertura;
    const fin = apertura;

    grafico.fillStyle(color, 0.22);
    grafico.slice(0, 0, radio, inicio, fin, false);
    grafico.fillPath();

    grafico.lineStyle(grosor, color, 1);
    grafico.beginPath();
    grafico.arc(0, 0, radio, inicio, fin, false);
    grafico.strokePath();

    return grafico;
  }

  /**
   * La escena llama a esto cuando la hitbox toca a un enemigo.
   * @returns dano a aplicar, o 0 si ese enemigo ya fue golpeado en este swing.
   */
  registrarGolpe(enemigo: object): number {
    if (this.golpeadosEnSwing.has(enemigo)) return 0;
    this.golpeadosEnSwing.add(enemigo);

    this.fervor.ganar(FERVOR.porGolpeAsestado);
    if (this.direccionAtaque === 'abajo') this.rebotar();

    return this.ataqueEnCurso === 'cargado' ? COMBATE.cargado.dano : COMBATE.ataque.dano;
  }

  /**
   * Rebote tras un golpe hacia abajo que conecta. Devuelve el doble salto y
   * el dash, cierra el golpe en curso y deja un enfriamiento minimo: asi los
   * pogos se encadenan y el aire se convierte en un sitio desde el que pelear.
   */
  private rebotar(): void {
    const ahora = this.escena.time.now;

    this.cuerpo.setVelocityY(-COMBATE.rebote.impulso);
    this.saltosRestantes = 1;
    this.dashesEnAireRestantes = DASH.usosEnAire;

    this.finAccion = ahora;
    this.finEnfriamientoAtaque = ahora + COMBATE.rebote.enfriamientoMs;
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.estado = 'aire';

    sonido.salto();
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

  /**
   * El Cirujano cae.
   *
   * Antes solo se volvia translucido, y eso no se leia como morir: se leia
   * como un fallo de dibujo. Ahora se desploma a la vista — se dobla sobre si
   * mismo hasta quedar hecho un monton en el suelo.
   *
   * Cae distinto a como caen sus enemigos. Un Devoto se va de lado y con
   * limpieza, porque ahi morir es rutina; el Cirujano se hunde de golpe y se
   * queda tenido de carne, porque es el unico cuerpo del Vientre que al
   * jugador le importa.
   *
   * `actualizar()` sale antes de tocar nada cuando el estado es 'muerto', asi
   * que ninguna pose posterior pisa este tween.
   */
  private morir(): void {
    this.estado = 'muerto';
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocityX(0);

    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setTint(0x8c2f2f);

    this.escena.tweens.add({
      targets: this.sprite,
      scaleY: 0.3,
      scaleX: 1.3,
      alpha: 0.35,
      y: this.sprite.y + 3,
      duration: 520,
      ease: 'Quad.easeIn',
    });
  }

  /** Resurreccion en el ultimo Altar: restaura cuerpo, Fervor y pociones. */
  reaparecerEn(x: number, y: number): void {
    this.estado = 'aire';
    this.vitalidad.restaurar();
    this.fervor.reiniciar();
    this.cargasPocion = this.cargasPocionMax;

    // Deshace el desplome de `morir()` por completo. Sin esto el Cirujano
    // reaparece aplastado, tenido de rojo y medio transparente.
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.clearTint();
    this.sprite.setScale(1);
    this.sprite.setAngle(0);
    this.sprite.setOrigin(0.5, 1);

    this.sprite.setAlpha(1);
    this.sprite.setPosition(x, y);
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocity(0, 0);

    this.finInvulnerabilidad = this.escena.time.now + VITALIDAD.invulnerabilidadMs;
    this.inicioCargaAtaque = -Infinity;
    this.eventos.emit('pociones', this.cargasPocion, this.cargasPocionMax);
  }

  /**
   * Rozar el cuerpo de un enemigo. A diferencia de un golpe, NO se puede parar:
   * el parry lee ataques, no evita chocarse. Los i-frames (dash, o los de haber
   * sido herido hace un instante) si lo evitan.
   */
  recibirContacto(origenX: number): ResultadoDano {
    if (this.estado === 'muerto' || this.estado === 'dash') return 'ignorado';
    if (this.esInvulnerable) return 'ignorado';

    const ahora = this.escena.time.now;
    this.vitalidad.recibirDano(CONTACTO.dano);
    if (this.vitalidad.estaMuerto) return 'herido';

    this.estado = 'herido';
    this.finAccion = ahora + 220;
    this.finInvulnerabilidad = ahora + VITALIDAD.invulnerabilidadMs;
    this.inicioCargaAtaque = -Infinity;

    // Empujon que separa los cuerpos: sin el, el contacto se encadenaria en
    // cuanto acabaran los i-frames.
    const direccion = this.sprite.x < origenX ? -1 : 1;
    this.cuerpo.setAllowGravity(true);
    this.cuerpo.setVelocity(direccion * CONTACTO.retrocesoX, -CONTACTO.retrocesoY);

    return 'herido';
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

  /**
   * Rezar: el Cirujano se arrodilla un instante. Es un acto, no un boton.
   * Durante el rezo no se mueve ni pelea, y eso es lo que le da peso.
   */
  rezar(duracionMs: number): void {
    if (this.enAccionBloqueante() || this.estado === 'dash' || this.estado === 'muerto') return;

    this.estado = 'rezando';
    this.finAccion = this.escena.time.now + duracionMs;
    this.inicioCargaAtaque = -Infinity;
    this.cuerpo.setVelocityX(0);
  }

  get estaRezando(): boolean {
    return this.estado === 'rezando';
  }

  /** Rezar en un Altar repone el frasco sin devolver el Fervor gastado. */
  reponerEnAltar(): void {
    this.vitalidad.restaurar();
    this.cargasPocion = this.cargasPocionMax;
    this.eventos.emit('pociones', this.cargasPocion, this.cargasPocionMax);
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
    sonido.salto();
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

    sonido.dash();
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

    if (this.estado === 'rezando') {
      // Arrodillado: mas bajo y un poco mas ancho, quieto.
      escalaX = 1.1;
      escalaY = 0.78;
    } else if (this.estado === 'atacando') {
      // Dos poses: durante la anticipacion se recoge; al soltar el golpe se
      // lanza hacia delante. Es lo que hace que el golpe tenga PESO y no sea
      // solo un dibujo que aparece al lado.
      const ahora = this.escena.time.now;
      if (ahora < this.inicioHitbox) {
        escalaX = 0.9;
        escalaY = 1.08;
      } else {
        const cargado = this.ataqueEnCurso === 'cargado';
        escalaX = cargado ? 1.22 : 1.14;
        escalaY = cargado ? 0.86 : 0.92;
      }
    } else if (this.estado === 'dash') {
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
    this.actualizarImpulsoVisual();
  }

  /**
   * Desplaza el DIBUJO unos pixeles hacia delante durante el golpe, moviendo
   * el origen del sprite en vez de su posicion: el cuerpo fisico se queda
   * donde esta y las colisiones no se enteran. Phaser voltea la textura desde
   * su centro, asi que el desfase del origen vale igual mirando a ambos lados.
   */
  private actualizarImpulsoVisual(): void {
    const anchoFrame = this.sprite.width || 16;
    let desfasePx = 0;

    if (this.estado === 'atacando' && this.direccionAtaque === 'lateral') {
      const ahora = this.escena.time.now;
      const cargado = this.ataqueEnCurso === 'cargado';
      // Se echa atras 2 px al preparar y se lanza 4-6 px al golpear.
      desfasePx = ahora < this.inicioHitbox ? -2 : cargado ? 6 : 4;
    }

    const direccion = this.mirandoDerecha ? 1 : -1;
    this.sprite.setOrigin(0.5 - (desfasePx * direccion) / anchoFrame, 1);
  }

  private actualizarOrientacion(): void {
    this.sprite.setFlipX(!this.mirandoDerecha);
    this.actualizarDeformacion();

    // Legibilidad sin arte definitivo: el color comunica el estado.
    if (this.estado === 'parry' || this.estado === 'rezando') {
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
