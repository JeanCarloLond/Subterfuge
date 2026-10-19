import Phaser from 'phaser';
import { ESPECIES } from '../config/Sacramento';
import type { ContextoCriatura } from './Criatura';
import type { Enemigo } from './Enemigo';
import type { Habitante } from './Habitante';

const T = 16;
const ALTO = 6;

/**
 * La Alfombra Devota (#103). Una alfombra liturgica que no lo es.
 *
 * Calmada es identica a las del culto. El tell no es el color: cuando el
 * Cirujano se acerca, RESPIRA —los filamentos se ponen de pie un instante y se
 * vuelven a tumbar—. Quien se fija, lo ve; quien va corriendo, la pisa.
 *
 * Pisarla atrapa: el Cirujano no puede avanzar y pierde un punto cada poco,
 * sin empujon (digiere despacio). Se sale saltando, con el dash o cortando los
 * filamentos a tajos. Al salir hay un margen en el que no vuelve a cerrarse:
 * soltarse no puede ser caer en la misma trampa. Cortada, ya no se cierra.
 *
 * Se puede cruzar sin pisarla, de un salto: no es obligatoria.
 */
export class Alfombra implements Habitante, Enemigo {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly contrato = 'peligro' as const;
  readonly clase = 'alfombra' as const;
  readonly idFicha = 'alfombra';
  readonly hiereAlContacto = false;

  private readonly tapiz: Phaser.GameObjects.TileSprite;
  private readonly izquierda: number;
  private readonly derecha: number;
  private atrapado = false;
  private cortada = false;
  private vida: number = ESPECIES.alfombra.vida;
  private proximoDano = 0;
  private graciaHasta = 0;
  private proximaRespiracion = 0;

  private readonly ctx: ContextoCriatura;
  private readonly y: number;

  constructor(ctx: ContextoCriatura, x: number, y: number, anchoTiles: number) {
    this.ctx = ctx;
    this.y = y;
    const ancho = anchoTiles * T;
    this.izquierda = x - ancho / 2;
    this.derecha = x + ancho / 2;

    this.tapiz = ctx.escena.add
      .tileSprite(x, y, ancho, ALTO, 'alfombra-placeholder')
      .setOrigin(0.5, 1)
      .setDepth(4);

    // Cuerpo invisible: es lo que recibe el tajo. Mas alto que el tapiz, porque
    // el golpe lateral del Cirujano va a la altura del pecho y no llegaria al
    // suelo; cortar filamentos tiene que poder hacerse estando atrapado.
    this.sprite = ctx.escena.physics.add.sprite(x, y - 14, 'alfombra-placeholder');
    this.sprite.setVisible(false);
    this.sprite.setData('habitante', this);
    this.sprite.setData('enemigo', this);
    const cuerpo = this.sprite.body as Phaser.Physics.Arcade.Body;
    cuerpo.setAllowGravity(false);
    cuerpo.setImmovable(true);
    cuerpo.setSize(ancho, 28, true);
  }

  get estaMuerto(): boolean {
    return this.cortada;
  }

  get estaAtrapando(): boolean {
    return this.atrapado;
  }

  actualizar(xJugador: number, yJugador: number): void {
    if (this.cortada) return;
    const ahora = this.ctx.escena.time.now;
    const jugador = this.ctx.jugador;
    const c = ESPECIES.alfombra;

    const encima =
      xJugador >= this.izquierda &&
      xJugador <= this.derecha &&
      Math.abs(yJugador - this.y) <= 3 &&
      jugador.estado === 'suelo';

    if (this.atrapado) {
      // Se sale con el salto o el dash: el Cirujano deja el suelo.
      if (jugador.estado === 'aire' || jugador.estado === 'dash' || jugador.estaMuerto) {
        this.soltar(ahora);
        return;
      }
      this.ctx.frenarJugador();
      if (ahora >= this.proximoDano) {
        this.proximoDano = ahora + c.cadaDanoMs;
        this.ctx.desgastar(1);
      }
      return;
    }

    if (encima && ahora >= this.graciaHasta) {
      this.atrapar(ahora);
      return;
    }

    // Respira cuando hay alguien cerca: el tell que se aprende.
    const cerca =
      Phaser.Math.Distance.Between(
        xJugador,
        yJugador,
        Phaser.Math.Clamp(xJugador, this.izquierda, this.derecha),
        this.y,
      ) < c.radioRespiracion;
    if (cerca && ahora >= this.proximaRespiracion) {
      this.proximaRespiracion = ahora + c.cadaRespiracionMs;
      this.tapiz.setTexture('alfombra-erizada-placeholder');
      this.ctx.escena.time.delayedCall(160, () => {
        if (!this.atrapado && !this.cortada) this.tapiz.setTexture('alfombra-placeholder');
      });
    }
  }

  recibirDano(cantidad: number): boolean {
    if (this.cortada) return false;
    this.vida -= cantidad;
    if (this.vida > 0) return true;

    this.cortada = true;
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.atrapado = false;
    this.tapiz.setTexture('alfombra-placeholder');
    this.tapiz.setTint(0x6a5a5a);
    return true;
  }

  private atrapar(ahora: number): void {
    this.atrapado = true;
    // El primer mordisco no es inmediato: da tiempo a entender que ha pasado.
    this.proximoDano = ahora + ESPECIES.alfombra.cadaDanoMs;
    this.tapiz.setTexture('alfombra-erizada-placeholder');
    this.ctx.frenarJugador();
  }

  private soltar(ahora: number): void {
    this.atrapado = false;
    this.graciaHasta = ahora + ESPECIES.alfombra.graciaMs;
    this.tapiz.setTexture('alfombra-placeholder');
  }
}
