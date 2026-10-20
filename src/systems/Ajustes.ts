import Phaser from 'phaser';

/**
 * Los ajustes de quien juega (issue #151): se recuerdan en este navegador.
 *
 * El juego tiene muchas sacudidas y destellos (el parry, los golpes, rezar),
 * y para alguien sensible a los destellos o al movimiento eso es una barrera.
 * Tambien se pueden separar los volumenes y acelerar el texto.
 *
 * Todo lo que sacude o destella la pantalla pasa por `sacudir` y `destellar`:
 * asi un ajuste lo cambia en todo el juego, sin que cada sitio tenga que
 * acordarse de preguntar.
 */

export type NivelEfectos = 'normal' | 'suaves' | 'apagados';
export type VelocidadTexto = 'normal' | 'rapido' | 'instante';

/** Los volumenes van en pasos, de 0 (callado) a PASOS_VOLUMEN (como siempre). */
export const PASOS_VOLUMEN = 5;

interface Valores {
  efectos: NivelEfectos;
  musica: number;
  sonido: number;
  texto: VelocidadTexto;
}

const CLAVE = 'subterfuge.ajustes';

/** Milisegundos por letra en los dialogos. */
const MS_POR_LETRA: Readonly<Record<VelocidadTexto, number>> = {
  normal: 28,
  rapido: 12,
  instante: 0,
};

/** Con "suaves" la camara se sigue moviendo, a un tercio. */
const SACUDIDA_SUAVE = 0.35;

function porDefecto(): Valores {
  // Si el sistema pide menos movimiento, se empieza en suave sin preguntar.
  const menosMovimiento =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    efectos: menosMovimiento ? 'suaves' : 'normal',
    musica: PASOS_VOLUMEN,
    sonido: PASOS_VOLUMEN,
    texto: 'normal',
  };
}

function leer(): Valores {
  const base = porDefecto();
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return base;
    const datos = JSON.parse(crudo) as Partial<Valores>;
    const paso = (v: unknown, def: number) =>
      typeof v === 'number' ? Phaser.Math.Clamp(Math.round(v), 0, PASOS_VOLUMEN) : def;
    return {
      efectos: ['normal', 'suaves', 'apagados'].includes(datos.efectos as string)
        ? (datos.efectos as NivelEfectos)
        : base.efectos,
      musica: paso(datos.musica, base.musica),
      sonido: paso(datos.sonido, base.sonido),
      texto: ['normal', 'rapido', 'instante'].includes(datos.texto as string)
        ? (datos.texto as VelocidadTexto)
        : base.texto,
    };
  } catch {
    return base;
  }
}

class Ajustes {
  private valores: Valores = leer();
  private readonly oyentes = new Set<() => void>();

  get efectos(): NivelEfectos {
    return this.valores.efectos;
  }
  get texto(): VelocidadTexto {
    return this.valores.texto;
  }
  /** Paso de volumen de la musica, 0..PASOS_VOLUMEN. */
  get pasoMusica(): number {
    return this.valores.musica;
  }
  get pasoSonido(): number {
    return this.valores.sonido;
  }
  /** Factor por el que se multiplica el volumen de la musica (0..1). */
  get volumenMusica(): number {
    return this.valores.musica / PASOS_VOLUMEN;
  }
  /** Factor por el que se multiplican los efectos y las voces (0..1). */
  get volumenSonido(): number {
    return this.valores.sonido / PASOS_VOLUMEN;
  }
  get msPorLetra(): number {
    return MS_POR_LETRA[this.valores.texto];
  }

  cambiar<K extends keyof Valores>(clave: K, valor: Valores[K]): void {
    this.valores = { ...this.valores, [clave]: valor };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(this.valores));
    } catch {
      // Sin almacenamiento el ajuste dura lo que la partida.
    }
    for (const oyente of this.oyentes) oyente();
  }

  /** Avisa cuando cambia cualquier ajuste. @returns la funcion para dejar de escuchar. */
  alCambiar(oyente: () => void): () => void {
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }
}

export const ajustes = new Ajustes();

/** Sacude la camara, segun el ajuste de sacudidas y destellos. */
export function sacudir(
  camara: Phaser.Cameras.Scene2D.Camera,
  duracion: number,
  intensidad: number,
): void {
  if (ajustes.efectos === 'apagados') return;
  camara.shake(duracion, ajustes.efectos === 'suaves' ? intensidad * SACUDIDA_SUAVE : intensidad);
}

/**
 * Destello a pantalla completa. Solo con el ajuste normal: un destello mas
 * oscuro no es mas suave, oscurece la pantalla de golpe, que es lo mismo.
 */
export function destellar(
  camara: Phaser.Cameras.Scene2D.Camera,
  duracion: number,
  rojo: number,
  verde: number,
  azul: number,
): void {
  if (ajustes.efectos !== 'normal') return;
  camara.flash(duracion, rojo, verde, azul);
}
