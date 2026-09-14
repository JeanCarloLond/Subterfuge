import Phaser from 'phaser';
import { CAIDA, FERVOR, POCION, VITALIDAD } from '../config/Sacramento';
import { CODICE } from '../lore/Codice';
import { sonido } from '../systems/Sonido';

/** Nombres de los eventos que la escena de juego emite para el HUD. */
export const EVENTOS_HUD = {
  vitalidad: 'hud-vitalidad',
  fervor: 'hud-fervor',
  pociones: 'hud-pociones',
  codice: 'hud-codice',
  aviso: 'hud-aviso',
  /** Vida del jefe: (puntos, maximo). Con puntos < 0 la barra se oculta. */
  jefe: 'hud-jefe',
  /** Texto de una placa del Registro: se muestra unos segundos, centrado abajo. */
  inscripcion: 'hud-inscripcion',
  /** Cae el Cirujano: (true) lo anuncia, (false) lo retira al reaparecer. */
  caida: 'hud-caida',
} as const;

const COLOR = {
  carne: 0x8c2f2f,
  carneVacia: 0x2e2222,
  fervor: 0xe8d9a0,
  fervorVacio: 0x2f2c24,
  frasco: 0xa8563f,
  frascoVacio: 0x2e2220,
  borde: 0x0b090b,
} as const;

/**
 * HUD del teaser.
 *
 * Corre como escena paralela a la de juego y se alimenta solo de eventos, para
 * que la interfaz no conozca a las entidades. Lexico de la Diocesis: Fervor y
 * Pocion de Carne, nunca "mana" ni "health potion".
 *
 * Los indicadores se distinguen por forma ademas de por color (relleno vs.
 * contorno), para que sigan siendo legibles con daltonismo.
 */
export class HudScene extends Phaser.Scene {
  private grafico!: Phaser.GameObjects.Graphics;
  private textoCodice!: Phaser.GameObjects.Text;
  private textoPocion!: Phaser.GameObjects.Text;
  private textoAviso!: Phaser.GameObjects.Text;
  private textoInscripcion!: Phaser.GameObjects.Text;
  private avisoAudio!: Phaser.GameObjects.Text;
  private textoCaida!: Phaser.GameObjects.Text;

  private vitalidadActual: number = VITALIDAD.maxima;
  private vitalidadMaxima: number = VITALIDAD.maxima;
  private fervorActual: number = FERVOR.inicial;
  private pocionesActuales: number = POCION.cargasMaximas;
  private pocionesMaximas: number = POCION.cargasMaximas;
  private fragmentos = 0;
  /** Negativo mientras no hay jefe en escena: la barra no se dibuja. */
  private jefeVida = -1;
  private jefeMaximo = 1;

  constructor() {
    super({ key: 'Hud' });
  }

  create(): void {
    this.grafico = this.add.graphics();

    // La tecla junto a los frascos: sin ella nadie sabia que se bebian (issue #26).
    this.textoPocion = this.add.text(8, 31, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#8a7d70',
    });

    this.textoCodice = this.add.text(8, 44, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#6b5f55',
    });

    // Avisos discretos (fragmento recogido, altar). Nunca bloquean la accion.
    this.textoAviso = this.add
      .text(this.scale.width - 8, 8, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(1, 0)
      .setAlpha(0);

    // Inscripciones del Registro: una linea, centrada, en cursiva. Se lee de
    // pasada y desaparece. No abre nada.
    this.textoInscripcion = this.add
      .text(this.scale.width / 2, this.scale.height - 34, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        fontStyle: 'italic',
        color: '#c9bda8',
        align: 'center',
        wordWrap: { width: this.scale.width - 80 },
      })
      .setOrigin(0.5, 1)
      .setAlpha(0);

    // La caida se anuncia en el centro, no en la esquina de los avisos: es el
    // unico mensaje del juego que el jugador NO puede permitirse pasar por
    // alto, y en la esquina se confunde con "has recogido un fragmento".
    this.textoCaida = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 12, 'LA CARNE CEDE', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8c2f2f',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    // Los navegadores no dejan sonar nada hasta el primer clic o tecla. Si el
    // jugador no lo sabe, cree que el juego no tiene sonido: se le dice.
    this.avisoAudio = this.add
      .text(this.scale.width / 2, 8, 'pulsa cualquier tecla para activar el sonido', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#8a7d70',
      })
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.escucharEscenaDeJuego();
    this.redibujar();
  }

  update(): void {
    // Barato: una comparacion de estado por fotograma.
    this.avisoAudio.setVisible(!sonido.estaActivo && !sonido.estaSilenciado);
  }

  private mostrarInscripcion(texto: string): void {
    this.textoInscripcion.setText(texto);
    this.tweens.killTweensOf(this.textoInscripcion);
    this.textoInscripcion.setAlpha(0);

    this.tweens.add({
      targets: this.textoInscripcion,
      alpha: 1,
      duration: 260,
      hold: 4200,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * Escucha el bus global del juego, no el de una escena concreta.
   *
   * El teaser cambia de escena en cada zona del descenso (Atrio, Pasillos...) y
   * el HUD sobrevive a esos cambios, asi que atarlo a una escena por nombre
   * dejaria el HUD sordo en cuanto el jugador bajase un nivel.
   */
  private escucharEscenaDeJuego(): void {
    const bus = this.game.events;

    const alVitalidad = (puntos: number, maximo?: number) => {
      this.vitalidadActual = puntos;
      if (maximo !== undefined) this.vitalidadMaxima = maximo;
      this.redibujar();
    };
    const alFervor = (puntos: number) => {
      this.fervorActual = puntos;
      this.redibujar();
    };
    const alPociones = (cargas: number, maximo?: number) => {
      this.pocionesActuales = cargas;
      if (maximo !== undefined) this.pocionesMaximas = maximo;
      this.redibujar();
    };
    const alCodice = (total: number) => {
      this.fragmentos = total;
      this.redibujar();
    };
    const alAviso = (texto: string) => this.mostrarAviso(texto);
    const alInscripcion = (texto: string) => this.mostrarInscripcion(texto);
    const alCaida = (cae: boolean) => this.mostrarCaida(cae);
    const alJefe = (puntos: number, maximo: number) => {
      this.jefeVida = puntos;
      this.jefeMaximo = maximo;
      this.redibujar();
    };

    bus.on(EVENTOS_HUD.vitalidad, alVitalidad);
    bus.on(EVENTOS_HUD.fervor, alFervor);
    bus.on(EVENTOS_HUD.pociones, alPociones);
    bus.on(EVENTOS_HUD.codice, alCodice);
    bus.on(EVENTOS_HUD.aviso, alAviso);
    bus.on(EVENTOS_HUD.jefe, alJefe);
    bus.on(EVENTOS_HUD.inscripcion, alInscripcion);
    bus.on(EVENTOS_HUD.caida, alCaida);

    // El bus global sobrevive a la escena: hay que soltar estos listeners a
    // mano o se acumularian en cada relanzamiento del HUD.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EVENTOS_HUD.vitalidad, alVitalidad);
      bus.off(EVENTOS_HUD.fervor, alFervor);
      bus.off(EVENTOS_HUD.pociones, alPociones);
      bus.off(EVENTOS_HUD.codice, alCodice);
      bus.off(EVENTOS_HUD.aviso, alAviso);
      bus.off(EVENTOS_HUD.jefe, alJefe);
      bus.off(EVENTOS_HUD.inscripcion, alInscripcion);
      bus.off(EVENTOS_HUD.caida, alCaida);
    });
  }

  private redibujar(): void {
    this.grafico.clear();

    this.dibujarVitalidad(8, 8);
    this.dibujarFervor(8, 22);
    this.dibujarPociones(8, 32);
    // A la derecha del ultimo frasco, con el nombre del recurso y su tecla.
    this.textoPocion.setX(8 + this.pocionesMaximas * 8 + 4);
    this.textoPocion.setText(this.pocionesActuales > 0 ? 'Q  Pocion de Carne' : 'sin Pocion');
    if (this.jefeVida >= 0) this.dibujarJefe();

    this.textoCodice.setText(
      this.fragmentos > 0 ? `codice  ${this.fragmentos}/${CODICE.length}   L` : '',
    );
  }

  /** Carne: un segmento por punto. El cuerpo del Cirujano tambien es moneda. */
  private dibujarVitalidad(x: number, y: number): void {
    const ancho = 9;
    const alto = 8;
    const separacion = 2;

    for (let i = 0; i < this.vitalidadMaxima; i += 1) {
      const lleno = i < this.vitalidadActual;
      const px = x + i * (ancho + separacion);

      this.grafico.fillStyle(lleno ? COLOR.carne : COLOR.carneVacia, 1);
      this.grafico.fillRect(px, y, ancho, alto);
      this.grafico.lineStyle(1, COLOR.borde, 1);
      this.grafico.strokeRect(px, y, ancho, alto);
    }
  }

  /** Fervor: barra continua. Se gana con el cuerpo, no con el tiempo. */
  private dibujarFervor(x: number, y: number): void {
    const ancho = 64;
    const alto = 5;
    const proporcion = Phaser.Math.Clamp(this.fervorActual / FERVOR.maximo, 0, 1);

    this.grafico.fillStyle(COLOR.fervorVacio, 1);
    this.grafico.fillRect(x, y, ancho, alto);

    this.grafico.fillStyle(COLOR.fervor, 1);
    this.grafico.fillRect(x, y, ancho * proporcion, alto);

    this.grafico.lineStyle(1, COLOR.borde, 1);
    this.grafico.strokeRect(x, y, ancho, alto);

    // Marca del umbral del ataque cargado: el jugador debe poder anticiparlo.
    const umbral = x + ancho * 0.3;
    this.grafico.lineStyle(1, COLOR.borde, 1);
    this.grafico.lineBetween(umbral, y, umbral, y + alto);
  }

  private dibujarPociones(x: number, y: number): void {
    const lado = 5;
    const separacion = 3;

    for (let i = 0; i < this.pocionesMaximas; i += 1) {
      const disponible = i < this.pocionesActuales;
      const px = x + i * (lado + separacion);

      if (disponible) {
        this.grafico.fillStyle(COLOR.frasco, 1);
        this.grafico.fillRect(px, y, lado, lado);
      } else {
        // Vacia: solo contorno. Distinguible sin depender del color.
        this.grafico.fillStyle(COLOR.frascoVacio, 1);
        this.grafico.fillRect(px, y, lado, lado);
        this.grafico.lineStyle(1, COLOR.frasco, 1);
        this.grafico.strokeRect(px, y, lado, lado);
      }
    }
  }

  /**
   * Barra del jefe: abajo y a lo ancho, separada del resto del HUD.
   * Que ocupe el pie de pantalla es la señal de que este combate es distinto.
   */
  private dibujarJefe(): void {
    const margen = 40;
    const ancho = this.scale.width - margen * 2;
    const alto = 6;
    const x = margen;
    const y = this.scale.height - 18;
    const proporcion = Phaser.Math.Clamp(this.jefeVida / this.jefeMaximo, 0, 1);

    this.grafico.fillStyle(0x1d1418, 1);
    this.grafico.fillRect(x, y, ancho, alto);

    this.grafico.fillStyle(0x8c4f4f, 1);
    this.grafico.fillRect(x, y, ancho * proporcion, alto);

    this.grafico.lineStyle(1, COLOR.borde, 1);
    this.grafico.strokeRect(x, y, ancho, alto);

    // Marcas de las fases: el jugador ve venir el cambio de ritmo.
    this.grafico.lineStyle(1, COLOR.borde, 1);
    for (const corte of [1 / 3, 2 / 3]) {
      const px = x + ancho * corte;
      this.grafico.lineBetween(px, y, px, y + alto);
    }
  }

  /**
   * Anuncio de la caida. Entra despacio, porque llega junto al destello rojo y
   * a la sacudida y no debe competir con ellos, y se retira de golpe cuando el
   * Cirujano vuelve a estar en pie.
   */
  private mostrarCaida(cae: boolean): void {
    this.tweens.killTweensOf(this.textoCaida);

    // Al volver en pie se va desvaneciendo mientras la zona reaparece, en vez
    // de desaparecer de golpe: cortado en seco delataba que era un cartel.
    if (!cae) {
      this.tweens.add({
        targets: this.textoCaida,
        alpha: 0,
        duration: 320,
        ease: 'Quad.easeIn',
      });
      return;
    }

    this.textoCaida.setAlpha(0);
    this.tweens.add({
      targets: this.textoCaida,
      alpha: 1,
      duration: CAIDA.avisoEntradaMs,
      ease: 'Quad.easeOut',
    });
  }

  private mostrarAviso(texto: string): void {
    this.textoAviso.setText(texto);
    this.tweens.killTweensOf(this.textoAviso);
    this.textoAviso.setAlpha(1);

    this.tweens.add({
      targets: this.textoAviso,
      alpha: 0,
      delay: 1600,
      duration: 700,
      ease: 'Quad.easeIn',
    });
  }
}
