import { progreso, type ProgresoGuardado } from './Progreso';
import { ZONAS_MAPA } from '../lore/Mapa';

/**
 * El descenso guardado (issue #149).
 *
 * El Progreso vivia solo en memoria: un F5, o el navegador del movil cerrando
 * la pestaña en segundo plano, se llevaba media hora de partida. Ahora se
 * guarda donde el juego ya dice que se guarda: en los Altares ("descenso
 * guardado · aquí volverás si caes"). Al rezar, y al entrar en una zona, que
 * es cuando su primer Altar se enciende solo.
 *
 * La vida y las Pociones van dentro del Progreso (#174): se continua con las
 * que se tenian. El Fervor no se guarda: cada zona empieza sin el.
 *
 * Es otra cosa que `Memoria`: aquello es lo descubierto alguna vez, para la
 * web, y no se borra nunca. Esto es UNA partida, y se borra al empezar otra.
 * Si el navegador no deja guardar (modo privado), el juego sigue igual.
 */

const CLAVE = 'subterfuge.descenso';
/** Si cambia la forma de lo guardado, se sube y los guardados viejos se ignoran. */
const VERSION = 1;

export interface Descenso {
  version: number;
  /** Escena de la zona: 'Atrio', 'Pasillos', 'Desague'... */
  zona: string;
  /** Indice del Altar encendido en la definicion de la zona. */
  altar: number;
  progreso: ProgresoGuardado;
  /** Cuando se guardo, para enseñarlo en la pantalla de inicio. */
  fecha: number;
}

/**
 * Las zonas que se pueden continuar: las del mapa. Los cierres no, porque no
 * tienen Altar; el del Nivel 1 guarda el principio del Nivel 2 (FinalScene).
 */
const ZONAS = new Set(ZONAS_MAPA.map((zona) => zona.escena));

export const guardado = {
  guardar(zona: string, altar: number): void {
    if (!ZONAS.has(zona)) return;
    const descenso: Descenso = {
      version: VERSION,
      zona,
      altar,
      progreso: progreso.serializar(),
      fecha: Date.now(),
    };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(descenso));
    } catch {
      // Sin almacenamiento no hay guardado. La partida sigue.
    }
  },

  cargar(): Descenso | null {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return null;
      const datos = JSON.parse(crudo) as Partial<Descenso>;
      if (datos.version !== VERSION || !datos.zona || !ZONAS.has(datos.zona)) return null;
      if (typeof datos.altar !== 'number' || !datos.progreso) return null;
      return datos as Descenso;
    } catch {
      return null;
    }
  },

  get hay(): boolean {
    return this.cargar() !== null;
  },

  borrar(): void {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // Nada que borrar.
    }
  },
};
