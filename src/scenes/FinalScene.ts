import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { progreso } from '../systems/Progreso';
import { guardado } from '../systems/Guardado';
import { recordar } from '../systems/Memoria';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { GANCHO_FINAL } from '../lore/Cinematicas';
import { EscenaCierre } from './EscenaCierre';

/**
 * Cierre del Nivel 1.
 *
 * Primero la cinematica del sacramento (#147): la nina, el tejido que responde
 * y la decision del Cirujano. Despues, sobre negro, la linea que queda, el
 * titulo, el recuento de lo que encontro el jugador y las dos salidas: huir
 * por el desague al Nivel 2 con todo lo recogido (#156), o volver al Atrio y
 * empezar de cero.
 *
 * La escena se queda en pausa mientras dura la cinematica, asi que las
 * entradas escalonadas de abajo esperan solas y empiezan al volver.
 */
export class FinalScene extends EscenaCierre {
  constructor() {
    super({ key: 'Final' });
  }

  create(): void {
    this.empezarCierre();
    recordar('hitos', 'final');
    // En la cinematica el Cirujano suelta el bisturi: baja al Nivel 2 sin el
    // (#160). Volver al Atrio lo devuelve, porque empieza otra partida.
    progreso.soltarBisturi();
    // El Nivel 1 ha terminado, el descenso no: si se cierra la pestaña aqui,
    // Continuar lleva al principio de la huida con lo recogido (#149, #156).
    guardado.guardar('Desague', 0);
    const fragmentos = progreso.fragmentosDelNivel(1);

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(900, 11, 9, 11);

    // Ni HUD ni botonera en una pantalla de cierre, y el Vientre deja de
    // respirar: en la cinematica solo suena el Latido.
    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    if (this.scene.isActive('Tactil')) this.scene.stop('Tactil');
    sonido.ambienteApagado();

    // El cierre de la historia va ANTES del recuento: primero se acaba lo que
    // le pasa al Cirujano, y luego se cuenta lo que encontro el jugador.
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
      .text(centroX, 196, this.textoRecuento(1), {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#6b5f55',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    // Entradas escalonadas: el cierre debe respirar, no soltarlo todo de golpe.
    this.aparecer(gancho, 700);
    this.aparecer(titulo, 1600);
    this.aparecer(recuento, 2400);

    // Codice completo: el margen tiene una ultima linea que solo aparece
    // cuando se han leido todas las demas. Es el premio de rejugar y el
    // motivo del lore-hunter para volver a bajar. El "no vengas" escondido lo
    // describe el world bible como parte de la campana ARG.
    if (fragmentos >= progreso.fragmentosTotalesDelNivel(1)) {
      const ultimoMargen = this.add
        .text(centroX, 228, ['al margen, en otra tinta:', '"No vengas."'].join('\n'), {
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

    this.crearSalidas(
      [
        { etiqueta: 'Huir por el desagüe', elegir: () => this.huir() },
        { etiqueta: 'Volver al Atrio', elegir: () => this.volverAlAtrio() },
      ],
      3200,
    );
  }

  /** Al Nivel 2 con todo lo recogido: la huida sigue a la decision. */
  private huir(): void {
    this.salir(() => this.scene.start('Desague'));
  }
}
