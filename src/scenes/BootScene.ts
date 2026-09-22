import Phaser from 'phaser';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { toques } from '../input/Toques';

/**
 * Boot: arranque minimo. No carga assets pesados, solo deja el motor listo
 * y cede el paso a Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    // Los navegadores no dejan sonar nada hasta que el usuario interactua, asi
    // que el audio queda a la espera del primer teclazo o clic.
    sonido.vincularActivacion();

    // Un solo AudioContext para todo: los efectos usan el de Phaser, que ya se
    // desbloquea con la primera interaccion del jugador.
    if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
      sonido.adoptarContexto(this.sound.context);
    }
    musica.vincular(this);

    // Los dedos se leen del navegador, no de Phaser (ver input/Toques.ts), y
    // se empieza a escuchar aqui: la pantalla final y los dialogos tambien los
    // usan, y no todos llegan con la botonera en marcha.
    toques.escuchar(this.game.canvas);

    // El filtrado NEAREST lo aplica `pixelArt: true` en la config del juego.
    this.scene.start('Preload');
  }
}
