import type { TipoReliquia } from '../systems/Progreso';

/**
 * Las reliquias del juego, una por linea: la fuente unica de cuantas hay.
 *
 * Los niveles las colocan (con sus coordenadas) y esta lista las cuenta. Antes
 * el total era un 7 escrito a mano en Progreso y otro en la portada de la web,
 * y el Nivel 2 traera mas (#94): con la lista, el numero sale solo y el
 * recuento se puede hacer por nivel, como el del Codice. `verificar-rutas`
 * comprueba que esta lista y lo que colocan los niveles coinciden.
 */
export interface ReliquiaLore {
  id: string;
  /** Escena donde esta colocada. */
  zona: string;
  tipo: TipoReliquia;
  nivel: 1 | 2;
}

export const RELIQUIAS: readonly ReliquiaLore[] = [
  { id: 'atrio-relicario', zona: 'Atrio', tipo: 'relicario', nivel: 1 },
  { id: 'atrio-frasco', zona: 'Atrio', tipo: 'frasco', nivel: 1 },
  { id: 'pasillos-relicario', zona: 'Pasillos', tipo: 'relicario', nivel: 1 },
  { id: 'pasillos-frasco', zona: 'Pasillos', tipo: 'frasco', nivel: 1 },
  { id: 'criptas-relicario', zona: 'Criptas', tipo: 'relicario', nivel: 1 },
  { id: 'criptas-frasco', zona: 'Criptas', tipo: 'frasco', nivel: 1 },
  { id: 'salas-frasco', zona: 'Salas', tipo: 'frasco', nivel: 1 },
];
