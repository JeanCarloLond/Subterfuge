/**
 * Lo que el visitante ya se ha ganado.
 *
 * Dos fuentes, y las dos viven en el navegador:
 *
 *   1. La memoria del descenso, que escribe el juego (`src/systems/Memoria.ts`)
 *      en la misma clave de localStorage. Como el juego y la web se publican
 *      en el mismo dominio, la web ve lo que el jugador descubrió bajando:
 *      fragmentos, fichas, capas, reliquias y los dos hitos (el jefe y el
 *      cierre).
 *   2. Las claves: frases del mundo que abren lo mismo sin haber jugado en
 *      este navegador. Están escondidas donde el bible dice que deben estar.
 *
 * Además guarda lo que la web misma hace: la mancha de un Sacramento fallido.
 */

import { CLAVE_MEMORIA, type Memoria } from '../../src/systems/Memoria';

const CLAVE_CLAVES = 'diocesis.claves';
const CLAVE_MANCHA = 'diocesis.mancha';

/** Normaliza para comparar: sin tildes, sin mayúsculas, sin espacios dobles. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Las claves y lo que abre cada una. */
const CLAVES: Readonly<Record<string, readonly string[]>> = {
  // La del código fuente. Abre todo: es la que encuentra quien hurga.
  'no vengas': ['descenso', 'manos-anteriores', 'final'],
  // La última línea del Cirujano en el cierre del juego.
  'los dioses no miran ella si': ['final'],
  // El lema de la Diócesis. La sabe cualquier fiel: no abre nada secreto,
  // pero responde, para que quien la prueba sepa que el sistema escucha.
  'los dioses no miran son mirados': [],
};

function leerJSON<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function escribirJSON(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento, la web funciona igual: solo no recuerda.
  }
}

export function memoriaDelDescenso(): Memoria {
  const datos = leerJSON<Partial<Memoria>>(CLAVE_MEMORIA, {});
  const lista = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  return {
    fragmentos: lista(datos.fragmentos),
    fichas: lista(datos.fichas),
    capas: lista(datos.capas),
    reliquias: lista(datos.reliquias),
    hitos: lista(datos.hitos),
  };
}

export function clavesPresentadas(): string[] {
  return leerJSON<string[]>(CLAVE_CLAVES, []);
}

/** @returns qué se abrió, o null si la clave no es de la Diócesis. */
export function presentarClave(texto: string): { abre: readonly string[]; nueva: boolean } | null {
  const clave = normalizar(texto);
  const abre = CLAVES[clave];
  if (!abre) return null;
  const previas = clavesPresentadas();
  const nueva = !previas.includes(clave);
  if (nueva) escribirJSON(CLAVE_CLAVES, [...previas, clave]);
  return { abre, nueva };
}

/** Todo lo que las claves presentadas abren, junto. */
function abiertoPorClaves(): Set<string> {
  const abierto = new Set<string>();
  for (const clave of clavesPresentadas())
    for (const cosa of CLAVES[clave] ?? []) abierto.add(cosa);
  return abierto;
}

/** ¿Ha bajado el visitante lo bastante como para leer lo que no es doctrina? */
export function descensoAbierto(): boolean {
  const memoria = memoriaDelDescenso();
  return (
    memoria.hitos.includes('final') ||
    memoria.hitos.includes('manos-anteriores') ||
    abiertoPorClaves().has('descenso')
  );
}

export function hitoAbierto(hito: 'manos-anteriores' | 'final'): boolean {
  return memoriaDelDescenso().hitos.includes(hito) || abiertoPorClaves().has(hito);
}

/** El margen de un fragmento se lee si se recogió, o si el descenso está abierto. */
export function fragmentoAbierto(id: string): boolean {
  return memoriaDelDescenso().fragmentos.includes(id) || descensoAbierto();
}

export function fichaAbierta(id: string): boolean {
  return memoriaDelDescenso().fichas.includes(id) || descensoAbierto();
}

export function capaPisada(escena: string): boolean {
  return memoriaDelDescenso().capas.includes(escena) || descensoAbierto();
}

// -- La mancha --------------------------------------------------------------

/** Cuántos Sacramentos ha fallado el visitante en esta web. */
export function mancha(): number {
  return leerJSON<number>(CLAVE_MANCHA, 0);
}

export function manchar(): number {
  const nueva = Math.min(6, mancha() + 1);
  escribirJSON(CLAVE_MANCHA, nueva);
  return nueva;
}

export function limpiarMancha(): void {
  escribirJSON(CLAVE_MANCHA, 0);
}
