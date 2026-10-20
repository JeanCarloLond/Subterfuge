import Phaser from 'phaser';
import { sonido, type ClaseEnemigo } from './Sonido';

/**
 * Las voces del cuerpo: el gruñido al atacar, el resoplido al saltar, el
 * quejido al recibir un golpe o al caer (revision del equipo). Grabaciones
 * CC0, no sintesis: una voz sintetizada suena a robot, y esto tiene que sonar
 * a alguien. Autoria en public/assets/audio/voces/LICENCIAS.md.
 *
 * Una voz que se repite en cada tajo cansa enseguida, asi que el ataque y el
 * salto no siempre gritan y hay un descanso minimo entre voces. El golpe
 * recibido y la muerte, siempre: son los que el jugador tiene que oir.
 *
 * Los Devotos y las Vestales usan la voz del Cirujano en otro tono; el
 * Reformado, la de las bestias.
 */

/** Las claves de los archivos, sin extension (public/assets/audio/voces/). */
export const VOCES_DE_ESFUERZO = [
  'cirujano-ataque-1',
  'cirujano-ataque-2',
  'cirujano-ataque-3',
  'cirujano-salto-1',
  'cirujano-salto-2',
  'cirujano-salto-3',
  'cirujano-herida-1',
  'cirujano-herida-2',
  'cirujano-herida-3',
  'cirujano-caida-1',
  'cirujano-caida-2',
  'cirujano-muerte',
  'monstruo-ataque-1',
  'monstruo-ataque-2',
  'monstruo-ataque-3',
  'monstruo-herida-1',
  'monstruo-herida-2',
  'monstruo-herida-3',
  'monstruo-muerte-1',
  'monstruo-muerte-2',
] as const;

type Voz = 'ataque' | 'salto' | 'herida' | 'caida' | 'muerte';

/** Cuantas variantes tiene cada voz. */
const VARIANTES: Readonly<Record<string, number>> = {
  'cirujano-ataque': 3,
  'cirujano-salto': 3,
  'cirujano-herida': 3,
  'cirujano-caida': 2,
  'cirujano-muerte': 1,
  'monstruo-ataque': 3,
  'monstruo-herida': 3,
  'monstruo-muerte': 2,
};

/** Tono y voz de cada clase de enemigo. Las bestias no dicen nada. */
const ENEMIGOS: Partial<Record<ClaseEnemigo, { voz: 'cirujano' | 'monstruo'; tono: number }>> = {
  devoto: { voz: 'cirujano', tono: 0.8 },
  vestal: { voz: 'cirujano', tono: 1.3 },
  reformado: { voz: 'monstruo', tono: 0.85 },
  serpiente: { voz: 'monstruo', tono: 0.7 },
};

/** Descanso minimo entre dos voces del mismo cuerpo (ms). */
const DESCANSO_MS = 450;

class Esfuerzo {
  private gestor: Phaser.Sound.BaseSoundManager | null = null;
  private ultima = new Map<string, number>();

  /** Se vincula una vez en Boot, como la musica. */
  vincular(escena: Phaser.Scene): void {
    this.gestor = escena.sound;
  }

  cirujano(voz: Voz): void {
    // El ataque grita uno de cada dos; el salto, uno de cada tres.
    if (voz === 'ataque' && Math.random() > 0.5) return;
    if (voz === 'salto' && Math.random() > 0.35) return;
    this.sonar(
      'cirujano',
      voz === 'muerte' ? 'muerte' : voz,
      1,
      'cirujano',
      voz === 'herida' || voz === 'muerte',
    );
  }

  enemigo(clase: ClaseEnemigo, voz: 'ataque' | 'herida' | 'muerte'): void {
    const perfil = ENEMIGOS[clase];
    if (!perfil) return;
    if (voz === 'ataque' && Math.random() > 0.6) return;
    const disponible = perfil.voz === 'monstruo' || voz !== 'muerte' ? voz : 'herida';
    this.sonar(perfil.voz, disponible, perfil.tono, clase, voz === 'muerte');
  }

  private sonar(
    quien: 'cirujano' | 'monstruo',
    voz: string,
    tono: number,
    cuerpo: string,
    siempre: boolean,
  ): void {
    if (!this.gestor || sonido.estaSilenciado) return;
    const ahora = performance.now();
    if (!siempre && ahora - (this.ultima.get(cuerpo) ?? -Infinity) < DESCANSO_MS) return;
    const base = `${quien}-${voz}`;
    const n = VARIANTES[base] ?? 0;
    if (n === 0) return;
    const clave = n === 1 ? base : `${base}-${Phaser.Math.Between(1, n)}`;
    if (!this.gestor.game.cache.audio.exists(`voz-${clave}`)) return;
    this.ultima.set(cuerpo, ahora);
    // Un poco de variacion de tono en cada toma: dos golpes seguidos no
    // suenan identicos.
    this.gestor.play(`voz-${clave}`, {
      volume: 0.55,
      rate: tono * Phaser.Math.FloatBetween(0.94, 1.06),
    });
  }
}

export const esfuerzo = new Esfuerzo();
