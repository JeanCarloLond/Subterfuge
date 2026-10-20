import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { recordar } from '../systems/Memoria';
import { tactil } from '../input/Tactil';
import { toques } from '../input/Toques';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { cursorActivo } from '../ui/Cursor';
import { GANCHO_FINAL } from '../lore/Cinematicas';

/**
 * Cierre del Nivel 1.
 *
 * Primero la cinematica del sacramento (#147): la nina, el tejido que responde
 * y la decision del Cirujano. Despues, sobre negro, la linea que queda, el
 * titulo y el recuento de lo que encontro el jugador.
 *
 * La escena se queda en pausa mientras dura la cinematica, asi que las
 * entradas escalonadas de abajo esperan solas y empiezan al volver.
 *
 * Restriccion del universo que cualquier texto aqui debe respetar: los
 * Primigenios son ciegos. No pueden "mirar", "observar" ni "ver" nada. Conocen
 * el mundo por tacto e ingesta.
 */
export class FinalScene extends Phaser.Scene {
  private fragmentos = 0;
  /**
   * Desde cuando valen los toques. Hasta que acaba la cinematica, ninguno:
   * el dedo que la salta manteniendo pulsado no puede, al levantarse, devolver
   * al jugador al Atrio.
   */
  private listoDesde = Infinity;

  constructor() {
    super({ key: 'Final' });
  }

  create(): void {
    recordar('hitos', 'final');
    this.fragmentos = progreso.fragmentosDelNivel(1);

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(900, 11, 9, 11);

    // Ni HUD ni botonera en una pantalla de cierre, y el Vientre deja de
    // respirar: en la cinematica solo suena el Latido.
    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    if (this.scene.isActive('Tactil')) this.scene.stop('Tactil');
    sonido.ambienteApagado();

    // El cierre de la historia va ANTES del recuento: primero se acaba lo que
    // le pasa al Cirujano, y luego se cuenta lo que encontro el jugador.
    this.listoDesde = Infinity;
    this.events.once(Phaser.Scenes.Events.RESUME, () => {
      this.listoDesde = performance.now();
      musica.poner('final');
    });
    this.scene.pause();
    this.scene.launch('Cinematica', { escenaJuego: this.scene.key });

    const centroX = RESOLUCION.ancho / 2;

    // La linea que queda despues de la cinematica (ver Cinematicas.ts).
    const gancho = this.add
      .text(centroX, 120, GANCHO_FINAL ?? '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#d6cfc4',
        align: 'center',
        wordWrap: { width: RESOLUCION.ancho - 80 },
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    const titulo = this.add
      .text(centroX, 168, 'SUBTERFUGE', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8c2f2f',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    const recuento = this.add
      .text(centroX, 208, this.textoRecuento(), {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#6b5f55',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    const reinicio = this.add
      .text(centroX, RESOLUCION.alto - 40, 'R  o clic:  volver al Atrio', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#4a4038',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setInteractive({ cursor: cursorActivo() });
    reinicio.on('pointerover', () => reinicio.setColor('#d6cfc4'));
    reinicio.on('pointerout', () => reinicio.setColor('#4a4038'));
    reinicio.on('pointerdown', () => this.volverAlAtrio());

    // Con el dedo, cualquier toque vale: acertar en una linea de ocho pixeles
    // no es una forma de cerrar un juego (#75).
    if (tactil.esAparatoTactil) {
      reinicio.setText('toca para volver al Atrio');
      const soltar = toques.alSoltar((_punto, inicio) => {
        if (inicio >= this.listoDesde) this.volverAlAtrio();
      });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, soltar);
    }

    // Entradas escalonadas: el cierre debe respirar, no soltarlo todo de golpe.
    this.aparecer(gancho, 700);
    this.aparecer(titulo, 1600);
    this.aparecer(recuento, 2400);
    this.aparecer(reinicio, 3200);

    // Codice completo: el margen tiene una ultima linea que solo aparece
    // cuando se han leido todas las demas. Es el premio de rejugar y el
    // motivo del lore-hunter para volver a bajar. El "no vengas" escondido lo
    // describe el world bible como parte de la campana ARG.
    if (this.fragmentos >= progreso.fragmentosTotalesDelNivel(1)) {
      const ultimoMargen = this.add
        .text(centroX, 244, ['al margen, en otra tinta:', '"No vengas."'].join('\n'), {
          fontFamily: 'monospace',
          fontSize: '8px',
          fontStyle: 'italic',
          color: '#c98a8a',
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0);
      this.aparecer(ultimoMargen, 4400);
    }

    this.input.keyboard?.once('keydown-R', () => this.volverAlAtrio());
  }

  private volviendo = false;

  private volverAlAtrio(): void {
    if (this.volviendo) return;
    this.volviendo = true;

    this.cameras.main.fade(400, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      progreso.reiniciar();
      this.scene.start('Atrio');
    });
  }

  /**
   * Recuento del Codice. Es la unica recompensa por explorar, y el motivo por
   * el que un lore-hunter volveria a jugar el teaser.
   */
  private textoRecuento(): string {
    const total = progreso.fragmentosTotalesDelNivel(1);
    const reliquias = progreso.reliquiasDelNivel(1);
    const codice =
      this.fragmentos === 0
        ? 'ningún fragmento del Códice'
        : `${this.fragmentos} de ${total} fragmentos del Códice`;
    const relicario =
      reliquias === 0
        ? ''
        : `   ·   ${reliquias} de ${progreso.reliquiasTotalesDelNivel(1)} reliquias`;
    // El Registro tambien cuenta: es la mitad del libro, y catalogarlo entero
    // exige haberse cruzado con todo lo que el Vientre tiene dentro.
    const registro = `   ·   ${progreso.fichasDescubiertas} de ${progreso.fichasTotales} fichas`;
    return codice + relicario + registro;
  }

  private aparecer(objeto: Phaser.GameObjects.Text, retardoMs: number): void {
    this.tweens.add({
      targets: objeto,
      alpha: 1,
      delay: retardoMs,
      duration: 900,
      ease: 'Quad.easeOut',
    });
  }
}
