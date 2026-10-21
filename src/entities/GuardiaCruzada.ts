import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import { cubreEscudo } from '../systems/Escudo';
import { polvo, tajoEnemigo } from '../systems/GolpeEnemigo';
import { sonido } from '../systems/Sonido';
import type { ContextoCriatura } from './Criatura';
import type { RangoPatrulla } from './Devoto';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

type EstadoGuardia =
  | 'ronda'
  | 'alerta'
  | 'girando'
  | 'apuntando'
  | 'estocada'
  | 'agachado'
  | 'barrido'
  | 'aturdido'
  | 'muerto';

/**
 * El guardia de la Cruzada (#166). "Custodian las salas vedadas": alabarda con
 * hoja de bisturi, coraza de placas de quirofano y escudo de autoclave.
 *
 * Enseña a ponerse donde hay que ponerse. El escudo para de frente el tajo, el
 * injerto y lo devuelto (systems/Escudo.ts); hay tres maneras de pasar:
 *
 *   - Parar su estocada: es larga y se anuncia (la alabarda atras, mas de
 *     medio segundo). Parada, se queda aturdido con el escudo caido, y
 *     entonces si le entra de frente.
 *   - Ponerse detras: se gira despacio, y el dash pasa a su espalda antes.
 *   - Caerle encima: el golpe hacia abajo no lo para el escudo.
 *
 * Si se le pega uno, barre corto a la altura de las piernas. Va a por el
 * Cirujano; la niña no existe para el.
 */
export class GuardiaCruzada implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'hostil' as const;
  readonly clase = 'guardia' as const;
  readonly idFicha = 'guardia';

  private readonly ctx: ContextoCriatura;
  private readonly ronda: RangoPatrulla;

  private estado: EstadoGuardia = 'ronda';
  private vida: number = ESPECIES.guardia.vida;
  private haciaDerecha = true;
  private finEstado = 0;
  private golpeoEnEsta = false;

  constructor(ctx: ContextoCriatura, x: number, y: number, ronda: RangoPatrulla) {
    this.ctx = ctx;
    this.ronda = ronda;
    this.sprite = ctx.escena.physics.add.sprite(x, y, 'guardia-placeholder');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.cuerpo;
    cuerpo.setSize(14, 24);
    cuerpo.setOffset(6, 10);
    cuerpo.setCollideWorldBounds(true);
    ctx.escena.physics.add.collider(this.sprite, ctx.suelos);
  }

  private get cuerpo(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get estaMuerto(): boolean {
    return this.estado === 'muerto';
  }

  get estadoActual(): EstadoGuardia {
    return this.estado;
  }

  get hiereAlContacto(): boolean {
    return this.estado !== 'muerto' && this.estado !== 'aturdido';
  }

  /** El escudo para de frente, salvo desde arriba o con la guardia baja. */
  bloquea(origenX: number, desdeArriba: boolean): boolean {
    if (this.estado === 'muerto') return false;
    return cubreEscudo(
      this.sprite.x,
      this.haciaDerecha,
      origenX,
      desdeArriba,
      this.estado === 'aturdido',
    );
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.estado === 'muerto') return;
    const ahora = this.ctx.escena.time.now;
    const c = ESPECIES.guardia;
    const dx = xJugador - this.sprite.x;
    const mismaAltura = Math.abs(yJugador - this.sprite.y) < 30;
    const delante = dx * (this.haciaDerecha ? 1 : -1) > 0;
    const jugadorVivo = !this.ctx.jugador.estaMuerto;

    switch (this.estado) {
      case 'ronda': {
        if (jugadorVivo && mismaAltura && Math.abs(dx) < c.radioVista) {
          this.estado = 'alerta';
          break;
        }
        if (this.sprite.x <= this.ronda.izquierda) this.haciaDerecha = true;
        if (this.sprite.x >= this.ronda.derecha) this.haciaDerecha = false;
        this.cuerpo.setVelocityX((this.haciaDerecha ? 1 : -1) * c.velocidad);
        break;
      }

      case 'alerta': {
        this.cuerpo.setVelocityX(0);
        if (!jugadorVivo || !mismaAltura || Math.abs(dx) > c.radioVista * 1.3) {
          this.estado = 'ronda';
          break;
        }
        if (Math.abs(dx) < c.radioBarrido && ahora >= this.finEstado) {
          this.agacharse(ahora);
        } else if (!delante) {
          // Se gira despacio, con el escudo: es la ventana para la espalda.
          this.estado = 'girando';
          this.finEstado = ahora + c.giroMs;
        } else if (Math.abs(dx) < c.alcanceEstocada && ahora >= this.finEstado) {
          this.apuntar(ahora);
        } else if (Math.abs(dx) >= c.alcanceEstocada) {
          // Avanza tras el escudo, sin prisa.
          this.cuerpo.setVelocityX(Math.sign(dx) * c.velocidad);
        }
        break;
      }

      case 'girando':
        this.cuerpo.setVelocityX(0);
        if (Math.abs(dx) < c.radioBarrido && ahora >= this.finEstado - c.giroMs / 2) {
          this.agacharse(ahora);
        } else if (ahora >= this.finEstado) {
          this.haciaDerecha = dx > 0;
          this.estado = 'alerta';
        }
        break;

      case 'apuntando':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.estocar(ahora);
        break;

      case 'estocada':
        this.cuerpo.setVelocityX(0);
        if (!this.golpeoEnEsta && delante && mismaAltura && Math.abs(dx) <= c.alcanceEstocada) {
          this.golpeoEnEsta = true;
          if (this.ctx.herir(c.dano, this.sprite.x) === 'parado') {
            this.aturdir(ahora);
            break;
          }
        }
        if (ahora >= this.finEstado) this.recuperar(ahora);
        break;

      case 'agachado':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.barrer(ahora);
        break;

      case 'barrido':
        this.cuerpo.setVelocityX(0);
        if (!this.golpeoEnEsta && mismaAltura && Math.abs(dx) <= c.radioBarrido + 6) {
          this.golpeoEnEsta = true;
          if (this.ctx.herir(c.danoBarrido, this.sprite.x) === 'parado') {
            this.aturdir(ahora);
            break;
          }
        }
        if (ahora >= this.finEstado) this.recuperar(ahora);
        break;

      case 'aturdido':
        this.cuerpo.setVelocityX(0);
        if (ahora >= this.finEstado) this.recuperar(ahora);
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
    if (this.vida <= 0) this.morir();
    return true;
  }

  // -- Comportamiento ------------------------------------------------------

  /** La alabarda hacia atras, tenido: lo que se lee para el parry. */
  private apuntar(ahora: number): void {
    const c = ESPECIES.guardia;
    this.estado = 'apuntando';
    this.finEstado = ahora + c.anticipacionEstocadaMs;
    this.posar('alza');
    this.sprite.setTint(0xe58a80);
    sonido.serpienteSilba();
    this.ctx.escena.time.delayedCall(c.anticipacionEstocadaMs - 110, () => {
      if (this.estado === 'apuntando') this.sprite.setTint(0xffffff);
    });
  }

  private estocar(ahora: number): void {
    const c = ESPECIES.guardia;
    this.estado = 'estocada';
    this.finEstado = ahora + c.estocadaMs;
    this.golpeoEnEsta = false;
    this.sprite.clearTint();
    this.posar('estocada');
    const direccion = this.haciaDerecha ? 1 : -1;
    tajoEnemigo(this.ctx.escena, this.sprite.x + direccion * 10, this.sprite.y - 14, direccion, {
      radio: c.alcanceEstocada,
      alto: 8,
      color: 0xfcd038,
      duracionMs: 220,
    });
  }

  private agacharse(ahora: number): void {
    const c = ESPECIES.guardia;
    this.estado = 'agachado';
    this.finEstado = ahora + c.anticipacionBarridoMs;
    this.sprite.setTint(0xe58a80);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      scaleY: 0.88,
      duration: c.anticipacionBarridoMs * 0.8,
      yoyo: true,
    });
  }

  private barrer(ahora: number): void {
    const c = ESPECIES.guardia;
    this.estado = 'barrido';
    this.finEstado = ahora + c.barridoMs;
    this.golpeoEnEsta = false;
    this.sprite.clearTint();
    for (const direccion of [-1, 1]) {
      tajoEnemigo(this.ctx.escena, this.sprite.x, this.sprite.y - 4, direccion, {
        radio: c.radioBarrido + 6,
        alto: 6,
        color: 0xc9d1c4,
        duracionMs: 200,
      });
    }
    polvo(this.ctx.escena, this.sprite.x, this.sprite.y, { cantidad: 6, direccion: 0 });
  }

  /** Parado: el escudo cae y la coraza queda abierta un buen rato. */
  private aturdir(ahora: number): void {
    this.estado = 'aturdido';
    this.finEstado = ahora + ESPECIES.guardia.aturdidoMs;
    this.posar();
    this.sprite.setTint(0xe8d9a0);
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      angle: { from: -5, to: 5 },
      duration: 160,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.sprite.setAngle(0);
        if (this.estado !== 'muerto') this.sprite.clearTint();
      },
    });
  }

  private recuperar(ahora: number): void {
    this.estado = 'alerta';
    this.finEstado = ahora + ESPECIES.guardia.enfriamientoMs;
    this.posar();
  }

  private posar(pose?: 'alza' | 'estocada'): void {
    this.sprite.setTexture(pose ? `guardia-${pose}-placeholder` : 'guardia-placeholder');
  }

  private morir(): void {
    this.estado = 'muerto';
    this.cuerpo.setVelocityX(0);
    this.cuerpo.enable = false;
    this.posar();
    this.ctx.escena.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: this.haciaDerecha ? -90 : 90,
      y: this.sprite.y + 4,
      duration: 700,
      ease: 'Quad.easeIn',
      onComplete: () => this.sprite.setVisible(false),
    });
  }
}
