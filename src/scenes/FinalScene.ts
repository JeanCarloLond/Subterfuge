import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';

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
    this.fragmentos = progreso.fragmentosRecogidos;

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(900, 11, 9, 11);

    // El HUD no pinta en una pantalla de cierre, y el Vientre deja de respirar.
    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    sonido.ambienteApagado();
    musica.poner('final');

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
      .text(centroX, RESOLUCION.alto - 40, 'R  volver al Atrio', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#4a4038',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

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

    this.input.keyboard?.once('keydown-R', () => {
      this.cameras.main.fade(400, 11, 9, 11);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        progreso.reiniciar();
        this.scene.start('Atrio');
      });
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
    return codice + relicario;
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
