/**
 * La memoria del descenso: lo que el jugador ha descubierto ALGUNA VEZ.
 *
 * `Progreso` es el estado de una partida y se limpia al volver al Atrio. Esto
 * es otra cosa: la union de todas las partidas, guardada en el navegador, y
 * nunca se borra desde el juego. Existe para la web de la Diocesis (`web/`),
 * que vive en el mismo dominio y lee esta clave para abrir lo que el jugador
 * ya se gano bajando: los margenes del Codice, las fichas, las capas pisadas.
 *
 * Es de solo anadir: aqui no hay nada que perder. Y si el navegador no deja
 * escribir (modo privado, almacenamiento bloqueado), el juego sigue igual: la
 * memoria es un regalo para la web, no una dependencia.
 */

export type CategoriaMemoria = 'fragmentos' | 'fichas' | 'capas' | 'reliquias' | 'hitos';

export type Memoria = Readonly<Record<CategoriaMemoria, readonly string[]>>;

/** La misma clave la lee la web. Cambiarla rompe el enlace entre las dos. */
export const CLAVE_MEMORIA = 'diocesis.memoria';

const VACIA: Memoria = { fragmentos: [], fichas: [], capas: [], reliquias: [], hitos: [] };

function leer(): Memoria {
  try {
    const crudo = localStorage.getItem(CLAVE_MEMORIA);
    if (!crudo) return VACIA;
    const datos = JSON.parse(crudo) as Partial<Record<CategoriaMemoria, unknown>>;
    const lista = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    return {
      fragmentos: lista(datos.fragmentos),
      fichas: lista(datos.fichas),
      capas: lista(datos.capas),
      reliquias: lista(datos.reliquias),
      hitos: lista(datos.hitos),
    };
  } catch {
    return VACIA;
  }
}

/** Apunta un descubrimiento. Idempotente y silencioso si no se puede guardar. */
export function recordar(categoria: CategoriaMemoria, id: string): void {
  try {
    const memoria = leer();
    if (memoria[categoria].includes(id)) return;
    const nueva = { ...memoria, [categoria]: [...memoria[categoria], id] };
    localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(nueva));
  } catch {
    // Sin almacenamiento no hay memoria, y no pasa nada.
  }
}
