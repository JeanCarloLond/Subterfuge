import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { musica, type Pista } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { danoASerpiente, elegirAtaque } from '../systems/TacticaSerpiente';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

type EstadoSerpiente =
  | 'acechando'
  | 'patrulla'
  | 'anticipando'
  | 'embistiendo'
  | 'escupiendo'
  | 'distraida'
  | 'aturdida'
  | 'reteniendo'
  | 'muerta';

/** Evento de escena al vencerla: el nivel abre el ducto que guardaba. */
export const EVENTO_SERPIENTE_VENCIDA = 'serpiente-vencida';

/** Evento de escena al despertar, con (x, y): el Cuervo avisa (#101). */
export const EVENTO_SERPIENTE_DESPIERTA = 'serpiente-despierta';

/** Evento de escena al abrir la boca (fase 2): la niña hace ruido (#167). */
export const EVENTO_SERPIENTE_FASE2 = 'serpiente-fase2';

/** Evento de escena al volver a dormir porque el Cirujano cayo: el combate se reinicia. */
export const EVENTO_SERPIENTE_CALMA = 'serpiente-calma';

/**
 * La Serpiente de Tejido (#98, #167). El mini-jefe de los ductos, que examina
 * el parry.
 *
 * Es un animal, no un dios: no tiene ojos, no habla y no "mira". La biblia la
 * describe sin esqueleto, de escamas duras, con una boca que "se amplia de
 * formas grotescas" rompiendo su propio tejido; depredador cumbre de los
 * ductos y emblema del Rebano Hueco.
 *
 * SUS ESCAMAS NO DEJAN ENTRAR NADA: el bisturi y el injerto rebotan. Lo unico
 * que la hiere es lo suyo: las escamas que escupe, paradas con el parry y
 * devueltas. Es lo que la niña le dice al Cirujano la primera vez que el filo
 * rebota.
 *
 * Duerme hasta que el Cirujano entra en su arena; entonces se presenta y saca
 * su barra. De lejos escupe una escama, con un silbido y la cabeza echada
 * atras; de cerca embiste. Parar la embestida la aturde, pero no la hiere.
 * Aturdida o distraida, la escama devuelta entra el doble.
 *
 * Por debajo de la mitad abre la boca rompiendose: escupe de dos en dos (lo
 * bastante separadas para parar las dos) y la embestida traga. La niña golpea
 * una tuberia una vez: la Serpiente se vuelve hacia el ruido y escupe hacia su
 * nicho, y quien se ponga en medio puede devolverlas.
 *
 * Si el Cirujano muere, el combate se reinicia entero. Al morir suelta dos
 * injertos y avisa al nivel para que abra el ducto.
 */
export class SerpienteDeTejido implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'hostil' as const;
  readonly clase = 'serpiente' as const;
  readonly idFicha = 'serpiente';
  /** Sus golpes los resuelve ella: el roce de costado no hiere. */
  readonly hiereAlContacto = false;
  /** El filo y el injerto rebotan en sus escamas (#167). */
  readonly pielDura = true;

  private readonly ctx: ContextoCriatura;
  private readonly arena: RangoPatrulla;
  private readonly x0: number;
  private readonly y0: number;

  private estado: EstadoSerpiente = 'acechando';
  private vida: number = ESPECIES.serpiente.vida;
  private finEstado = 0;
  private sentido = 1;
  private presentada = false;
  private reiniciarAlVolver = false;
  private golpeoEnEsta = false;
  /** Escamas que le quedan por escupir en esta rafaga, y cuando sale la siguiente. */
  private escamasPendientes = 0;
  private proximaEscama = 0;
  /** La niña solo la distrae una vez por combate. */
  private distraidaYa = false;
  /** La musica que sonaba antes del combate, para devolverla al acabar. */
  private musicaDeLaZona: Pista | null = null;

  constructor(ctx: ContextoCriatura, x: number, y: number, arena: RangoPatrulla) {
    this.ctx = ctx;
    this.arena = arena;
    this.x0 = x;
    this.y0 = y;

    this.sprite = ctx.escena.physics.add.sprite(x, y, 'serpiente-cerrada-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(9);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.cuerpo;
    cuerpo.setSize(34, 10);
    cuerpo.setOffset(3, 3);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerta';
  }

  get estadoActual(): EstadoSerpiente {
    return this.estado;
  }

  get vidaActual(): number {
    return this.vida;
  }

  /** Despierta y viva: la niña se esconde mientras dure. */
  get enCombate(): boolean {
    return this.presentada && this.estado !== 'acechando' && this.estado !== 'muerta';
  }

  private get enFase2(): boolean {
    return this.vida <= ESPECIES.serpiente.vidaFase2;
  }

  /** Con la guardia abierta: lo devuelto entra el doble. */
  private get expuesta(): boolean {
    return this.estado === 'aturdida' || this.estado === 'distraida';
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.estado === 'muerta') return;
    const jugador = this.ctx.jugador;

    // El combate se reintenta desde el principio, no desde donde se dejo.
    if (jugador.estaMuerto) {
      if (this.estado !== 'acechando') this.reiniciarAlVolver = true;
      this.cuerpo.setVelocityX(0);
      return;
    }
    if (this.reiniciarAlVolver) {
      this.reiniciar();
      return;
    }

    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.serpiente;

    switch (this.estado) {
      case 'acechando':
        if (this.enArena(xJugador, yJugador)) this.despertar(ahora);
        return;

      case 'patrulla': {
        const dx = xJugador - this.sprite.x;
        this.sentido = dx >= 0 ? 1 : -1;
        // Se acerca despacio, pero no se pega: necesita sitio para embestir.
        this.cuerpo.setVelocityX(Math.abs(dx) > 70 ? this.sentido * c.velocidad : 0);
        if (ahora >= this.finEstado) this.atacar(ahora, dx);
        break;
      }

      case 'anticipando':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.embestir(ahora);
        break;

      case 'embistiendo':
        this.actualizarEmbestida(ahora, xJugador, yJugador);
        break;

      case 'escupiendo':
      case 'distraida':
        this.cuerpo.setVelocityX(0);
        this.actualizarRafaga(ahora);
        break;

      case 'aturdida':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.patrullar(ahora);
        break;

      case 'reteniendo':
        this.cuerpo.setVelocityX(0);
        this.ctx.frenarJugador();
        if (jugador.estado === 'dash') {
          // Se escapa a tiempo: sale sin dano.
          this.patrullar(ahora);
        } else if (ahora >= this.finEstado) {
          // Lo escupe: el golpe con retroceso es el escupitajo.
          this.ctx.herir(c.dano, this.sprite.x);
          sonido.serpienteTraga();
          this.patrullar(ahora);
        }
        break;
    }

    this.sprite.setFlipX(this.sentido < 0);
  }

  /**
   * Solo llega desde una escama devuelta: el filo y el injerto los para la
   * escena antes, porque `pielDura`. Aun asi se cuenta por la tactica, que es
   * la regla.
   */
  recibirDano(cantidad: number): boolean {
    if (this.estado === 'muerta') return false;
    const c = ESPECIES.serpiente;
    const ahora = this.ctx.escena.time.now;
    if (!this.presentada) this.despertar(ahora);

    const antes = this.vida;
    this.vida = Math.max(0, this.vida - danoASerpiente(cantidad, 'escama', this.expuesta));
    this.ctx.barraDeJefe(this.vida, c.vida, [c.vidaFase2 / c.vida]);

    this.sprite.setTint(0xd08080);
    this.ctx.escena.time.delayedCall(90, () => {
      if (this.estado !== 'muerta') this.sprite.clearTint();
    });

    if (this.vida <= 0) {
      this.morir();
      return true;
    }
    if (antes > c.vidaFase2 && this.vida <= c.vidaFase2) {
      // Fase 2: la boca se abre rompiendose. Body horror, sin gore.
      this.sprite.setTexture('serpiente-placeholder');
      sonido.serpienteBoca();
      this.ctx.escena.events.emit(EVENTO_SERPIENTE_FASE2);
    }
    return true;
  }

  /**
   * Algo ha sonado en x (la niña, contra una tuberia): se vuelve hacia alli y
   * escupe una rafaga hacia el ruido. Una vez por combate.
   */
  distraer(x: number): void {
    if (this.distraidaYa || !this.enCombate || this.estado === 'reteniendo') return;
    this.distraidaYa = true;
    const c = ESPECIES.serpiente;
    const ahora = this.ctx.escena.time.now;
    this.sentido = x >= this.sprite.x ? 1 : -1;
    this.estado = 'distraida';
    this.escamasPendientes = c.rafagaDistraida;
    this.proximaEscama = ahora + c.escupirMs;
    this.amagarEscupir(c.escupirMs);
  }

  // -- Comportamiento ------------------------------------------------------

  private enArena(x: number, y: number): boolean {
    return x >= this.arena.izquierda && x <= this.arena.derecha && Math.abs(y - this.y0) < 90;
  }

  private tocaAlJugador(xJugador: number, yJugador: number): boolean {
    return Math.abs(xJugador - this.sprite.x) < 20 && Math.abs(yJugador - this.sprite.y) < 22;
  }

  private despertar(ahora: number): void {
    const c = ESPECIES.serpiente;
    if (!this.presentada) {
      this.presentada = true;
      this.ctx.presentar('SERPIENTE DE TEJIDO', 'la Tentadora Sin Permiso');
    }
    // La musica del combate, como con el Reformado (#108). Se recuerda la de
    // la zona para devolverla al vencerla o si se reinicia el combate.
    if (musica.pista !== 'jefe') {
      this.musicaDeLaZona = musica.pista;
      musica.poner('jefe');
    }
    this.ctx.escena.events.emit(EVENTO_SERPIENTE_DESPIERTA, this.sprite.x, this.sprite.y);
    this.ctx.barraDeJefe(this.vida, c.vida, [c.vidaFase2 / c.vida]);
    this.patrullar(ahora);
  }

  private patrullar(ahora: number): void {
    this.estado = 'patrulla';
    this.finEstado = ahora + ESPECIES.serpiente.enfriamientoMs;
  }

  private atacar(ahora: number, dx: number): void {
    const ataque = elegirAtaque(dx, this.enFase2);
    if (ataque.tipo === 'embestir') {
      this.anticipar(ahora);
      return;
    }
    const c = ESPECIES.serpiente;
    this.estado = 'escupiendo';
    this.escamasPendientes = ataque.escamas;
    this.proximaEscama = ahora + c.escupirMs;
    this.amagarEscupir(c.escupirMs);
  }

  /**
   * El aviso del escupitajo: la cabeza hacia atras, hinchada, y el silbido.
   * Distinto del temblor de la embestida, para leer cual de los dos viene.
   */
  private amagarEscupir(espera: number): void {
    sonido.serpienteSilba();
    this.sprite.setTint(0xe0b0a0);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 1.18,
      scaleX: 0.92,
      duration: espera * 0.8,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.sprite.setScale(1);
        if (this.estado !== 'muerta') this.sprite.clearTint();
      },
    });
  }

  private actualizarRafaga(ahora: number): void {
    const c = ESPECIES.serpiente;
    if (this.escamasPendientes > 0 && ahora >= this.proximaEscama) {
      this.escamasPendientes -= 1;
      // Desde la boca, a la altura del pecho del Cirujano: se para de pie.
      this.ctx.escupir(
        this.sprite.x + this.sentido * 18,
        this.sprite.y - 12,
        this.sentido,
        c.danoEscama,
      );
      if (this.escamasPendientes > 0) {
        this.proximaEscama = ahora + c.rafagaMs;
        this.amagarEscupir(c.rafagaMs * 0.7);
      } else {
        this.finEstado = ahora + 400;
      }
    }
    if (this.escamasPendientes === 0 && ahora >= this.finEstado) this.patrullar(ahora);
  }

  /** El silbido y el temblor: al menos medio segundo para leerlo. */
  private anticipar(ahora: number): void {
    const c = ESPECIES.serpiente;
    this.estado = 'anticipando';
    const espera = this.enFase2 ? c.anticipacionFase2Ms : c.anticipacionMs;
    this.finEstado = ahora + espera;
    sonido.serpienteSilba();
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -4, to: 4 },
      duration: 70,
      yoyo: true,
      repeat: Math.floor(espera / 140) - 1,
      onComplete: () => this.sprite.setAngle(0),
    });
  }

  private embestir(ahora: number): void {
    this.estado = 'embistiendo';
    this.finEstado = ahora + ESPECIES.serpiente.embestidaMs;
    this.golpeoEnEsta = false;
    sonido.serpienteEmbiste();
  }

  private actualizarEmbestida(ahora: number, xJugador: number, yJugador: number): void {
    const c = ESPECIES.serpiente;
    this.cuerpo.setVelocityX(this.sentido * c.velocidadEmbestida);

    if (!this.golpeoEnEsta && this.tocaAlJugador(xJugador, yJugador)) {
      this.golpeoEnEsta = true;
      if (this.enFase2 && this.ctx.jugador.estado !== 'dash') {
        this.tragar(ahora);
        return;
      }
      const resultado = this.ctx.herir(c.dano, this.sprite.x);
      if (resultado === 'parado') {
        this.aturdir(ahora);
        return;
      }
    }

    const enBorde =
      (this.sentido > 0 && this.sprite.x >= this.arena.derecha) ||
      (this.sentido < 0 && this.sprite.x <= this.arena.izquierda) ||
      this.cuerpo.blocked.left ||
      this.cuerpo.blocked.right;
    if (enBorde) {
      // Fallo y se estrella: queda aturdida. Si acerto, no hay choque.
      if (this.golpeoEnEsta) this.patrullar(ahora);
      else this.aturdir(ahora);
      return;
    }
    if (ahora >= this.finEstado) this.patrullar(ahora);
  }

  private aturdir(ahora: number): void {
    this.estado = 'aturdida';
    this.finEstado = ahora + ESPECIES.serpiente.aturdidaMs;
    this.cuerpo.setVelocityX(0);
    sonido.serpienteAturdida();
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 0.85,
      duration: 120,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.sprite.setScale(1),
    });
  }

  private tragar(ahora: number): void {
    this.estado = 'reteniendo';
    this.finEstado = ahora + ESPECIES.serpiente.retenerMs;
    this.cuerpo.setVelocityX(0);
    sonido.serpienteTraga();
  }

  private morir(): void {
    const c = ESPECIES.serpiente;
    this.estado = 'muerta';
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.ctx.barraDeJefe(-1, 1);
    for (let i = 0; i < c.injertosAlMorir; i += 1) {
      this.ctx.soltarOfrenda(this.sprite.x + (i === 0 ? -6 : 6), this.sprite.y - 10, 'injerto');
    }
    this.ctx.avisar('el ducto queda libre');
    this.devolverMusica();
    this.ctx.escena.events.emit(EVENTO_SERPIENTE_VENCIDA);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleY: 0.3,
      duration: 900,
      ease: 'Quad.easeIn',
      onComplete: () => this.sprite.setVisible(false),
    });
  }

  private reiniciar(): void {
    this.reiniciarAlVolver = false;
    this.vida = ESPECIES.serpiente.vida;
    this.estado = 'acechando';
    this.escamasPendientes = 0;
    this.distraidaYa = false;
    this.cuerpo.reset(this.x0, this.y0);
    this.sprite.setTexture('serpiente-cerrada-placeholder');
    this.sprite.setAngle(0).setScale(1).clearTint();
    this.ctx.barraDeJefe(-1, 1);
    this.devolverMusica();
    this.ctx.escena.events.emit(EVENTO_SERPIENTE_CALMA);
  }

  private devolverMusica(): void {
    if (this.musicaDeLaZona) musica.poner(this.musicaDeLaZona);
    this.musicaDeLaZona = null;
  }
}
