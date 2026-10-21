import Phaser from 'phaser';
import { ajustes } from './Ajustes';

/**
 * Pistas disponibles. La clave es la que se usa en las escenas; el archivo
 * vive en public/assets/audio/musica/ en .ogg y .mp3 (Safari no reproduce
 * Ogg Vorbis). Autoria y licencias en LICENCIAS.md, en esa misma carpeta.
 */
export const PISTAS = {
  // Con ritmo (revision del equipo: "la musica es sosa"). Se eligieron
  // midiendo el pulso: las de antes estaban entre 0,03 y 0,11 y estas entre
  // 0,3 y 0,8. El descenso va a mas: un redoble en el Atrio, un latido en los
  // Pasillos, un redoble ominoso en las Criptas, urgencia en las Salas y
  // tambores para el jefe.
  atrio: 'atrio-redoble',
  pasillos: 'pasillos-pulso',
  criptas: 'criptas-redoble-ominoso',
  salas: 'salas-urgencia',
  jefe: 'jefe-tambores',
  final: 'final-camara-de-huesos',
  // El Vientre Humedo (#108): viento grave y goteo, la Lluvia Tibia hecha musica.
  'vientre-humedo': 'vientre-humedo-mazmorra',
} as const;

export type Pista = keyof typeof PISTAS;

/**
 * Pistas que todavia no usa ningun nivel y por eso no se precargan: bajarlas
 * al arrancar retrasaria el juego por algo que no suena. Ahora mismo, ninguna:
 * la del Vientre salio de aqui al construirse el Nivel 2 (#156).
 */
export const SIN_PRECARGA: ReadonlySet<Pista> = new Set<Pista>();

/** Volumen de cada pista. La musica acompana; nunca compite con los golpes. */
const VOLUMEN: Record<Pista, number> = {
  atrio: 0.32,
  // Las dos de SRG774 vienen bajas y no se pueden subir mas sin saturar.
  pasillos: 0.48,
  criptas: 0.3,
  salas: 0.48,
  jefe: 0.42,
  final: 0.38,
  'vientre-humedo': 0.3,
};

/**
 * Banda sonora.
 *
 * Una sola pista suena a la vez. Cambiar de pista es un fundido cruzado: la
 * que suena se apaga mientras entra la nueva, para que bajar de zona o que
 * despierte el jefe no sea un corte seco.
 *
 * Trabaja sobre el gestor de sonido de Phaser, que ya se ocupa del desbloqueo
 * del audio en el navegador con la primera interaccion. Si la pista aun no
 * puede sonar (audio bloqueado), Phaser la encola y arranca sola despues.
 */
class Musica {
  private gestor: Phaser.Sound.BaseSoundManager | null = null;
  private escena: Phaser.Scene | null = null;

  private actual: Phaser.Sound.BaseSound | null = null;
  private pistaActual: Pista | null = null;
  private atenuada = false;
  /** Fundidos en curso, por sonido, para poder cancelarlos. */
  private fundidos = new Map<Phaser.Sound.BaseSound, number>();

  private static readonly FUNDIDO_MS = 900;
  /** Factor de volumen mientras el juego esta en pausa. */
  private static readonly ATENUACION = 0.35;

  /**
   * Cualquier escena sirve: el gestor de sonido es del juego, no de la escena.
   * Se vincula una vez en Boot y ya no hace falta volver a llamarlo.
   */
  vincular(escena: Phaser.Scene): void {
    this.escena = escena;
    this.gestor = escena.sound;
  }

  get pista(): Pista | null {
    return this.pistaActual;
  }

  /** Pone una pista en bucle. Si ya suena esa misma, no hace nada. */
  poner(pista: Pista): void {
    if (!this.gestor || !this.escena) return;
    if (this.pistaActual === pista && this.actual?.isPlaying) return;

    const clave = PISTAS[pista];
    if (!this.gestor.get(clave) && !this.escena.cache.audio.exists(clave)) return;

    const saliente = this.actual;
    const entrante = this.gestor.add(clave, { loop: true, volume: 0 });

    this.actual = entrante;
    this.pistaActual = pista;
    entrante.play();

    this.fundir(entrante, this.volumenObjetivo(pista), Musica.FUNDIDO_MS);
    if (saliente) this.apagar(saliente);
  }

  /** Para lo que suene, con fundido. */
  parar(): void {
    if (this.actual) this.apagar(this.actual);
    this.actual = null;
    this.pistaActual = null;
  }

  /** En pausa la musica se queda de fondo, mas baja: no se corta. */
  atenuar(activa: boolean): void {
    if (this.atenuada === activa) return;
    this.atenuada = activa;

    if (this.actual && this.pistaActual) {
      this.fundir(this.actual, this.volumenObjetivo(this.pistaActual), 300);
    }
  }

  private volumenObjetivo(pista: Pista): number {
    return VOLUMEN[pista] * ajustes.volumenMusica * (this.atenuada ? Musica.ATENUACION : 1);
  }

  /** Lleva la pista que suena al volumen nuevo del ajuste de musica (#151). */
  aplicarVolumen(): void {
    if (this.actual && this.pistaActual) {
      this.fundir(this.actual, this.volumenObjetivo(this.pistaActual), 200);
    }
  }

  /**
   * Fundidos con un temporizador propio, NO con tweens de escena: un tween
   * muere cuando su escena se detiene, y cambiar de zona detiene la escena
   * justo mientras la pista saliente se esta apagando. Con tweens, esa pista
   * se quedaria sonando a medio volumen encima de la nueva.
   */
  private fundir(
    sonido: Phaser.Sound.BaseSound,
    volumen: number,
    duracionMs: number,
    alTerminar?: () => void,
  ): void {
    this.detenerFundido(sonido);

    const desde = (sonido as Phaser.Sound.WebAudioSound).volume ?? 0;
    const inicio = performance.now();

    const paso = () => {
      const t = Math.min(1, (performance.now() - inicio) / duracionMs);
      (sonido as Phaser.Sound.WebAudioSound).setVolume(desde + (volumen - desde) * t);

      if (t < 1) {
        this.fundidos.set(sonido, window.requestAnimationFrame(paso));
      } else {
        this.fundidos.delete(sonido);
        alTerminar?.();
      }
    };

    this.fundidos.set(sonido, window.requestAnimationFrame(paso));
  }

  private detenerFundido(sonido: Phaser.Sound.BaseSound): void {
    const id = this.fundidos.get(sonido);
    if (id !== undefined) window.cancelAnimationFrame(id);
    this.fundidos.delete(sonido);
  }

  private apagar(sonido: Phaser.Sound.BaseSound): void {
    this.fundir(sonido, 0, Musica.FUNDIDO_MS, () => {
      sonido.stop();
      sonido.destroy();
    });
  }
}

/** Instancia unica, como `sonido`: la banda sonora no es estado de escena. */
export const musica = new Musica();
ajustes.alCambiar(() => musica.aplicarVolumen());
