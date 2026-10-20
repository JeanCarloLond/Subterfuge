import { progreso, type ProgresoGuardado } from './Progreso';

/**
 * El descenso guardado (issue #149).
 *
 * El Progreso vivia solo en memoria: un F5, o el navegador del movil cerrando
 * la pestaña en segundo plano, se llevaba media hora de partida. Ahora se
 * guarda donde el juego ya dice que se guarda: en los Altares ("descenso
 * guardado · aquí volverás si caes"). Al rezar, y al entrar en una zona, que
 * es cuando su primer Altar se enciende solo.
 *
 * No se guarda la vida, las pociones ni el Fervor. Rezar los repone, y cada
 * zona construye un Cirujano nuevo: al continuar se vuelve como tras caer,
 * entero, delante del Altar.
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
  /** Escena de la zona: 'Atrio', 'Pasillos'... */
  zona: string;
  /** Indice del Altar encendido en la definicion de la zona. */
  altar: number;
  progreso: ProgresoGuardado;
  /** Cuando se guardo, para enseñarlo en la pantalla de inicio. */
  fecha: number;
}

/** Las zonas que se pueden continuar. El cierre no: ahi el descenso ha terminado. */
const ZONAS = new Set(['Atrio', 'Pasillos', 'Criptas', 'Salas']);

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
