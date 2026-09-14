import Phaser from 'phaser';
import { MOVIMIENTO, REFORMADO } from '../config/Sacramento';
import type { Enemigo } from './Enemigo';
import { Vitalidad } from '../systems/Vitalidad';

export type EstadoReformado =
  | 'dormido'
  | 'acecho'
  | 'anticipando'
  | 'embistiendo'
  | 'saltando'
  | 'zarpazo'
  | 'aturdido'
  | 'muerto';

/** Ataque que el Reformado esta preparando o ejecutando. */
type Maniobra = 'embestida' | 'salto' | 'zarpazo' | 'doble';

/**
 * El Reformado: jefe del teaser.
 *
 * Un Elegido que sobrevivio a medias al sacramento. No es un demonio ni una
 * bestia: es exactamente el resultado de lo que el Cirujano-Sacerdote hace con
 * sus manos cada dia. Por eso es el encuentro que cierra el teaser — el jugador
 * pelea contra su propio oficio.
 *
 * Diseño del combate: tres fases con el MISMO repertorio, cada vez mas rapido.
 * Se aprende leyendo, no memorizando. Todas las maniobras telegrafian largo, y
 * fallar una embestida lo deja aturdido: esa es la ventana de castigo, y es lo
 * que convierte la pelea en un ritmo en vez de un intercambio de golpes.
 */
export class Reformado implements Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  /** Zona de dano, activa solo durante la ventana de cada maniobra. */
  readonly hitbox: Phaser.GameObjects.Zone;
  readonly vitalidad: Vitalidad;
  readonly eventos = new Phaser.Events.EventEmitter();

  private estado: EstadoReformado = 'dormido';
  private maniobra: Maniobra = 'embestida';
  private mirandoDerecha = false;
  private fase = 1;

  private finAccion = -Infinity;
  private finEnfriamiento = -Infinity;
  private yaGolpeoEnSwing = false;
  private tweenTelegrafia?: Phaser.Tweens.Tween;
  /** Tras la primera embestida de una doble, queda la vuelta pendiente. */
  private vueltaPendiente = false;

  private readonly escena: Phaser.Scene;
  private readonly limites: { izquierda: number; derecha: number };

  /**
   * Presencia (issue #31). Lo que hace que el jefe no parezca un Devoto
   * grande: un latido de luz en el pecho que se acelera con las fases, la
   * sombra que lo pega al suelo, y la carne que gotea mientras esta despierto.
   * Van aparte del sprite para no pelearse con los tintes y escalas de la
   * telegrafia.
   */
  private readonly latido: Phaser.GameObjects.Image;
  private readonly sombra: Phaser.GameObjects.Ellipse;
  private readonly goteo: Phaser.GameObjects.Particles.ParticleEmitter;
  private tweenLatido?: Phaser.Tweens.Tween;
  private readonly sueloY: number;

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    limites: { izquierda: number; derecha: number },
  ) {
    this.escena = escena;
    this.limites = limites;
    this.vitalidad = new Vitalidad(REFORMADO.vida);

    this.sprite = escena.physics.add.sprite(x, y, 'reformado-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('enemigo', this);
    this.sprite.setDepth(20);

    // El dibujo es 44x40 pero el cuerpo fisico sigue siendo el de siempre
    // (20x28, anclado abajo): la banda segura del zarpazo y el paso bajo el
    // pedestal estan afinados sobre esas medidas, no sobre el dibujo.
    const cuerpo = this.cuerpo;
    cuerpo.setSize(20, 28);
    cuerpo.setOffset(12, 12);
    cuerpo.setGravityY(MOVIMIENTO.gravedad);
    cuerpo.setCollideWorldBounds(true);

    this.hitbox = escena.add.zone(x, y, REFORMADO.zarpazo.alcance, 30);
    escena.physics.add.existing(this.hitbox);
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    cuerpoHitbox.setAllowGravity(false);
    cuerpoHitbox.enable = false;

    this.sueloY = y;
    this.sombra = escena.add.ellipse(x, y + 1, 44, 8, 0x000000, 0.4);
    this.sombra.setDepth(19);

    this.latido = escena.add.image(x, y - 18, 'brillo-placeholder');
    this.latido.setDepth(21);
    this.latido.setBlendMode(Phaser.BlendModes.ADD);
    this.latido.setTint(0xc03a3a);
    this.latido.setScale(0.5);
    this.latido.setAlpha(0.18);
    this.ajustarLatido(2200);

    this.goteo = escena.add.particles(0, 0, 'chispa-placeholder', {
      lifespan: { min: 380, max: 620 },
      speedY: { min: 40, max: 90 },
      speedX: { min: -8, max: 8 },
      gravityY: 400,
      scale: { start: 0.9, end: 0.4 },
      alpha: { start: 0.9, end: 0 },
      tint: [0x8c2f2f, 0x5c1f27],
      frequency: 420,
      emitting: false,
    });
    this.goteo.setDepth(19);
    this.goteo.startFollow(this.sprite, 0, -10);

    // Respira: dos cuadros, despacio. Dormido no respira: se lee como un bulto
    // mas del quirofano hasta que el Cirujano se acerca.
    if (!escena.anims.exists('reformado-respira')) {
      escena.anims.create({
        key: 'reformado-respira',
        frames: [{ key: 'reformado-placeholder' }, { key: 'reformado-2-placeholder' }],
        frameRate: 1.4,
        repeat: -1,
      });
    }

    this.vitalidad.on('muerte', () => this.morir());
    this.vitalidad.on('cambio', (puntos: number) => {
      this.eventos.emit('vida', puntos, REFORMADO.vida);
      this.revisarFase(puntos);
    });
  }

  /** El latido del pecho: un pulso de luz cuyo ritmo dice la fase. */
  private ajustarLatido(periodoMs: number): void {
    this.tweenLatido?.remove();
    this.tweenLatido = this.escena.tweens.add({
      targets: this.latido,
      alpha: { from: 0.18, to: 0.62 },
      scale: { from: 0.46, to: 0.62 },
      duration: periodoMs * 0.35,
      hold: 0,
      yoyo: true,
      repeat: -1,
      repeatDelay: periodoMs * 0.3,
      ease: 'Quad.easeOut',
    });
  }

  /** Luz, sombra y goteo siguen al cuerpo; se llama cada frame, este como este. */
  private seguirPresencia(): void {
    const direccion = this.mirandoDerecha ? 1 : -1;
    this.latido.setPosition(this.sprite.x + direccion * 8, this.sprite.y - 18);

    // La sombra se queda en el suelo y se encoge cuando el jefe salta: es lo
    // que hace que el salto se lea como altura y no como un cambio de escala.
    const altura = Phaser.Math.Clamp((this.sueloY - this.sprite.y) / 120, 0, 1);
    this.sombra.setPosition(this.sprite.x, this.sueloY + 1);
    this.sombra.setScale(1 - altura * 0.5, 1);
    this.sombra.setAlpha(0.4 * (1 - altura * 0.7));
  }

  get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  readonly clase = 'reformado' as const;

  get hiereAlContacto(): boolean {
    return this.estado !== 'dormido' && this.estado !== 'muerto';
  }

  get estadoActual(): EstadoReformado {
    return this.estado;
  }

  get faseActual(): number {
    return this.fase;
  }

  /** Sigue quieto hasta que el jugador entra en la sala. */
  despertar(): void {
    if (this.estado !== 'dormido') return;

    this.estado = 'acecho';
    this.finEnfriamiento = this.escena.time.now + 700;

    // Se yergue: la masa se incorpora y la carne empieza a gotear.
    this.sprite.play('reformado-respira');
    this.escena.tweens.add({
      targets: this.sprite,
      scaleY: { from: 0.86, to: 1 },
      duration: 520,
      ease: 'Back.easeOut',
    });
    this.ajustarLatido(1400);
    this.goteo.start();

    this.eventos.emit('despierta');
  }

  actualizar(objetivoX: number, objetivoY: number): void {
    this.seguirPresencia();
    if (this.estado === 'dormido' || this.estado === 'muerto') return;

    const ahora = this.escena.time.now;

    switch (this.estado) {
      case 'anticipando':
        this.actualizarAnticipacion(ahora, objetivoX);
        break;
      case 'embistiendo':
        this.actualizarEmbestida(ahora);
        break;
      case 'saltando':
        this.actualizarSalto(ahora);
        break;
      case 'zarpazo':
        this.actualizarZarpazo(ahora);
        break;
      case 'aturdido':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finAccion) this.estado = 'acecho';
        break;
      default:
        this.actualizarAcecho(ahora, objetivoX, objetivoY);
    }

    this.actualizarHitbox(ahora);
    this.sprite.setFlipX(!this.mirandoDerecha);
  }

  // -- Decision ------------------------------------------------------------

  /** Cada fase recorta los tiempos: mismo repertorio, menos margen. */
  private get factorVelocidad(): number {
    if (this.fase >= 3) return REFORMADO.factorVelocidadFase3;
    if (this.fase === 2) return REFORMADO.factorVelocidadFase2;
    return 1;
  }

  private revisarFase(puntos: number): void {
    const nuevaFase = puntos <= REFORMADO.vidaFase3 ? 3 : puntos <= REFORMADO.vidaFase2 ? 2 : 1;
    if (nuevaFase === this.fase) return;

    this.fase = nuevaFase;
    // El corazon se acelera y gotea mas: la fase se ve en el cuerpo, no solo
    // en el cartel.
    this.ajustarLatido(this.fase >= 3 ? 620 : 950);
    this.goteo.setFrequency(this.fase >= 3 ? 180 : 280);
    this.eventos.emit('fase', this.fase);
  }

  private actualizarAcecho(ahora: number, objetivoX: number, objetivoY: number): void {
    const distancia = Math.abs(objetivoX - this.sprite.x);
    this.mirandoDerecha = objetivoX > this.sprite.x;

    // Se mueve poco: pesa demasiado. La presion la ponen sus maniobras.
    this.cuerpo.setVelocityX(0);

    if (ahora < this.finEnfriamiento) return;

    // Cerca: zarpazo. Lejos y a distinta altura: salto, para no dejar que el
    // jugador lo espere desde una repisa. Lejos y en llano: se sortea entre
    // embestida, salto y embestida doble segun la fase.
    if (distancia <= REFORMADO.zarpazo.alcance + REFORMADO.zarpazo.margenDisparo) {
      this.iniciarManiobra(ahora, 'zarpazo');
      return;
    }

    const desnivel = Math.abs(objetivoY - this.sprite.y);
    if (this.fase >= 2 && desnivel > 40) {
      this.iniciarManiobra(ahora, 'salto');
      return;
    }

    this.iniciarManiobra(ahora, this.sortearManiobraADistancia());
  }

  /** Azar ponderado por fase. Fase 1 es fija a proposito: se aprende. */
  private sortearManiobraADistancia(): Maniobra {
    const pesos =
      this.fase >= 3
        ? REFORMADO.pesosFase3
        : this.fase === 2
          ? REFORMADO.pesosFase2
          : REFORMADO.pesosFase1;

    const tirada = Math.random() * (pesos[0] + pesos[1] + pesos[2]);
    if (tirada < pesos[0]) return 'embestida';
    if (tirada < pesos[0] + pesos[1]) return 'salto';
    return 'doble';
  }

  private iniciarManiobra(ahora: number, maniobra: Maniobra): void {
    const base =
      maniobra === 'embestida' || maniobra === 'doble'
        ? REFORMADO.embestida.anticipacionMs
        : maniobra === 'salto'
          ? REFORMADO.salto.anticipacionMs
          : REFORMADO.zarpazo.anticipacionMs;

    // La vuelta de una doble avisa la mitad: ya se ha visto la ida.
    const anticipacion =
      base *
      this.factorVelocidad *
      (this.vueltaPendiente ? REFORMADO.doble.factorAnticipacionVuelta : 1);

    this.maniobra = maniobra;
    this.estado = 'anticipando';
    this.yaGolpeoEnSwing = false;
    this.finAccion = ahora + anticipacion;
    this.cuerpo.setVelocityX(0);

    this.telegrafiar(anticipacion, maniobra);
  }

  /**
   * Aviso de la maniobra. Cada una tiene su color y su gesto: el jugador debe
   * poder distinguirlas a la primera, no aprenderlas a base de morir.
   */
  private telegrafiar(duracion: number, maniobra: Maniobra): void {
    const color =
      maniobra === 'embestida'
        ? 0xc94f4f
        : maniobra === 'doble'
          ? 0x8c1f3f
          : maniobra === 'salto'
            ? 0xe8a03a
            : 0xd88a8a;

    this.sprite.setTint(color);
    this.tweenTelegrafia?.remove();

    const direccion = this.mirandoDerecha ? 1 : -1;
    this.tweenTelegrafia = this.escena.tweens.add({
      targets: this.sprite,
      // La embestida se echa atras; el salto se agacha.
      x:
        maniobra === 'embestida' || maniobra === 'doble'
          ? this.sprite.x - direccion * 6
          : this.sprite.x,
      scaleY: maniobra === 'salto' ? 0.82 : 1.1,
      scaleX: maniobra === 'salto' ? 1.15 : 1,
      duration: duracion * 0.8,
      ease: 'Quad.easeOut',
    });
  }

  private actualizarAnticipacion(ahora: number, objetivoX: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora < this.finAccion) return;

    this.limpiarTelegrafia();
    const direccion = this.mirandoDerecha ? 1 : -1;

    switch (this.maniobra) {
      case 'embestida':
      case 'doble':
        this.estado = 'embistiendo';
        this.finAccion = ahora + REFORMADO.embestida.duracionMs * this.factorVelocidad;
        this.cuerpo.setVelocityX(direccion * REFORMADO.embestida.velocidad);
        break;

      case 'salto':
        this.estado = 'saltando';
        this.finAccion = ahora + 2000; // tope de seguridad si no aterriza
        this.cuerpo.setVelocityY(-REFORMADO.salto.impulso);
        this.cuerpo.setVelocityX(Math.sign(objetivoX - this.sprite.x) * 90);
        break;

      default:
        this.estado = 'zarpazo';
        this.finAccion = ahora + REFORMADO.zarpazo.duracionMs;
        break;
    }
  }

  private actualizarEmbestida(ahora: number): void {
    const cuerpo = this.cuerpo;
    const contraMuro =
      cuerpo.blocked.left ||
      cuerpo.blocked.right ||
      this.sprite.x <= this.limites.izquierda ||
      this.sprite.x >= this.limites.derecha;

    // Estrellarse contra la pared lo deja abierto: esa es la ventana de castigo.
    if (contraMuro) {
      this.vueltaPendiente = false;
      this.quedarAturdido(ahora, REFORMADO.aturdimientoTrasFalloMs);
      this.eventos.emit('choque', this.sprite.x, this.sprite.y);
      return;
    }

    if (ahora >= this.finAccion) {
      this.cuerpo.setVelocityX(0);

      // Embestida doble: la ida acaba y la vuelta arranca sin pausa. El
      // jugador que esquivo saltando por encima se encuentra al jefe volviendo.
      if (this.maniobra === 'doble' && !this.vueltaPendiente) {
        this.vueltaPendiente = true;
        this.mirandoDerecha = !this.mirandoDerecha;
        this.iniciarManiobra(ahora, 'doble');
        return;
      }

      this.vueltaPendiente = false;
      this.finEnfriamiento = ahora + REFORMADO.embestida.enfriamientoMs * this.factorVelocidad;
      this.estado = 'acecho';
    }
  }

  private actualizarSalto(ahora: number): void {
    const enSuelo = this.cuerpo.blocked.down || this.cuerpo.touching.down;

    if (enSuelo && this.cuerpo.velocity.y >= 0) {
      this.cuerpo.setVelocityX(0);
      this.finEnfriamiento = ahora + REFORMADO.salto.enfriamientoMs * this.factorVelocidad;
      this.estado = 'acecho';
      // La escena convierte esto en onda de impacto y sacudida.
      this.eventos.emit('impacto-suelo', this.sprite.x, this.sprite.y, REFORMADO.salto.alcanceOnda);

      // Y en fase 2+ el techo se viene abajo a trozos: amenaza vertical.
      const cantidad = REFORMADO.escombros.cantidadPorFase[this.fase - 1] ?? 0;
      if (cantidad > 0) this.eventos.emit('escombros', cantidad);
      return;
    }

    if (ahora >= this.finAccion) this.estado = 'acecho';
  }

  private actualizarZarpazo(ahora: number): void {
    this.cuerpo.setVelocityX(0);
    if (ahora < this.finAccion) return;

    this.finEnfriamiento = ahora + REFORMADO.zarpazo.enfriamientoMs * this.factorVelocidad;
    this.estado = 'acecho';
  }

  private actualizarHitbox(ahora: number): void {
    const cuerpoHitbox = this.hitbox.body as Phaser.Physics.Arcade.Body;
    const activa =
      (this.estado === 'zarpazo' || this.estado === 'embistiendo' || this.estado === 'saltando') &&
      ahora < this.finAccion + 200;

    if (!activa) {
      cuerpoHitbox.enable = false;
      return;
    }

    const direccion = this.mirandoDerecha ? 1 : -1;
    // Embistiendo el cuerpo entero hiere; el zarpazo solo por delante.
    const alcance = this.estado === 'zarpazo' ? REFORMADO.zarpazo.alcance : 30;
    const desplazamiento = this.estado === 'zarpazo' ? direccion * (alcance / 2 + 8) : 0;

    this.hitbox.setSize(alcance, 30);
    cuerpoHitbox.setSize(alcance, 30);
    this.hitbox.setPosition(this.sprite.x + desplazamiento, this.sprite.y - 17);
    cuerpoHitbox.reset(this.hitbox.x, this.hitbox.y);
    cuerpoHitbox.enable = true;
  }

  private limpiarTelegrafia(): void {
    this.tweenTelegrafia?.remove();
    this.tweenTelegrafia = undefined;
    this.sprite.setScale(1);
    if (!this.estaMuerto) this.sprite.clearTint();
  }

  private quedarAturdido(ahora: number, duracion: number): void {
    this.estado = 'aturdido';
    this.finAccion = ahora + duracion;
    this.finEnfriamiento = this.finAccion;
    this.cuerpo.setVelocityX(0);
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;

    this.limpiarTelegrafia();
    this.sprite.setTint(0xe8d9a0);
    this.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -4, to: 4 },
      duration: 200,
      yoyo: true,
      repeat: Math.floor(duracion / 400),
      onComplete: () => {
        this.sprite.setAngle(0);
        if (!this.estaMuerto) this.sprite.clearTint();
      },
    });
  }

  // -- Reacciones ----------------------------------------------------------

  /** El parry tambien lo abre, igual que estrellarse contra un muro. */
  aturdir(): void {
    if (this.estaMuerto || this.estado === 'dormido') return;
    this.quedarAturdido(this.escena.time.now, REFORMADO.aturdimientoTrasFalloMs * 0.8);
  }

  consumirGolpe(): boolean {
    if (this.yaGolpeoEnSwing) return false;
    this.yaGolpeoEnSwing = true;
    return true;
  }

  recibirDano(cantidad: number, origenX: number): boolean {
    if (this.estaMuerto || this.estado === 'dormido') return false;

    this.vitalidad.recibirDano(cantidad);
    if (this.vitalidad.estaMuerto) return true;

    // No retrocede: pesa demasiado. Solo destella, para que se lea el impacto
    // sin regalar al jugador el control del espacio.
    this.sprite.setTint(0xffffff);
    this.escena.time.delayedCall(90, () => {
      if (!this.estaMuerto && this.estado !== 'anticipando' && this.estado !== 'aturdido') {
        this.sprite.clearTint();
      }
    });

    void origenX;
    return true;
  }

  private morir(): void {
    this.estado = 'muerto';
    this.tweenTelegrafia?.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);
    this.sprite.setAngle(0);
    (this.hitbox.body as Phaser.Physics.Arcade.Body).enable = false;
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;

    this.eventos.emit('muerte');

    // Se desploma despacio. Sin fanfarria: era una persona. El latido se
    // apaga con el, y deja de respirar.
    this.sprite.stop();
    this.goteo.stop();
    this.tweenLatido?.remove();
    this.escena.tweens.add({
      targets: this.latido,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeIn',
    });
    this.escena.tweens.add({
      targets: this.sprite,
      alpha: 0.15,
      scaleY: 0.4,
      y: this.sprite.y + 6,
      duration: 1400,
      ease: 'Quad.easeIn',
    });
  }

  destruir(): void {
    this.eventos.removeAllListeners();
    this.tweenLatido?.remove();
    this.tweenTelegrafia?.remove();
    this.escena.tweens.killTweensOf(this.sprite);
    this.escena.tweens.killTweensOf(this.latido);
    this.latido.destroy();
    this.sombra.destroy();
    this.goteo.destroy();
    this.hitbox.destroy();
    this.sprite.destroy();
  }
}
