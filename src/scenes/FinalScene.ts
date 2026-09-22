import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { recordar } from '../systems/Memoria';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { cursorActivo } from '../ui/Cursor';

/**
 * Cierre del teaser: el gancho.
 *
 * ATENCION AL EQUIPO NARRATIVO: el texto de abajo es un MARCADOR DE POSICION,
 * no lore aprobado. Esta escrito al minimo a proposito para que se note que hay
 * que sustituirlo. El gancho real debe apoyarse en la situacion disparadora del
 * mundo —la nina que se ofrece voluntariamente y el tejido que responde distinto—
 * y lo escribe el equipo, no la herramienta.
 *
 * Restriccion del universo que cualquier texto aqui debe respetar: los
 * Primigenios son ciegos. No pueden "mirar", "observar" ni "ver" nada. Conocen
 * el mundo por tacto e ingesta.
 */
export class FinalScene extends Phaser.Scene {
  private fragmentos = 0;

  constructor() {
    super({ key: 'Final' });
  }

  create(): void {
    recordar('hitos', 'final');
    this.fragmentos = progreso.fragmentosRecogidos;

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(900, 11, 9, 11);

    // El HUD no pinta en una pantalla de cierre, y el Vientre deja de respirar.
    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    sonido.ambienteApagado();
    musica.poner('final');

    // El cierre de la historia va ANTES del recuento: primero se acaba lo que
    // le pasa al Cirujano, y luego se cuenta lo que encontro el jugador. La
    // escena queda en pausa mientras habla, asi que las entradas escalonadas
    // de abajo esperan solas y entran al terminar.
    this.scene.pause();
    this.scene.launch('Dialogo', { escenaJuego: this.scene.key, clave: 'cierre' });

    const centroX = RESOLUCION.ancho / 2;

    // --- MARCADOR DE POSICION: sustituir por el gancho real del equipo ---
    const gancho = this.add
      .text(centroX, 120, 'El descenso apenas ha empezado.', {
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

    // Entradas escalonadas: el cierre debe respirar, no soltarlo todo de golpe.
    this.aparecer(gancho, 700);
    this.aparecer(titulo, 1600);
    this.aparecer(recuento, 2400);
    this.aparecer(reinicio, 3200);

    // Codice completo: el margen tiene una ultima linea que solo aparece
    // cuando se han leido todas las demas. Es el premio de rejugar y el
    // motivo del lore-hunter para volver a bajar. El "no vengas" escondido lo
    // describe el world bible como parte de la campana ARG.
    if (this.fragmentos >= progreso.fragmentosTotales) {
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
    const total = progreso.fragmentosTotales;
    const reliquias = progreso.reliquiasRecogidas;
    const codice =
      this.fragmentos === 0
        ? 'ningun fragmento del Codice'
        : `${this.fragmentos} de ${total} fragmentos del Codice`;
    const relicario =
      reliquias === 0 ? '' : `   ·   ${reliquias} de ${progreso.reliquiasTotales} reliquias`;
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
