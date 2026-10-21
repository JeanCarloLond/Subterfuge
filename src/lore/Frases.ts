/**
 * Frases cortas que se dicen sin parar el juego (#175): salen sobre la cabeza
 * de quien habla y se van solas. Para lo que no merece abrir un dialogo.
 *
 * La voz es la de siempre (ver Pensamientos.ts): el Cirujano habla de su
 * oficio con frases cortas de hombre cansado, y nunca con palabras de
 * videojuego: no tiene "arma", tiene un bisturi. El texto que se lee va en
 * español correcto; cada frase, de una linea corta: caben sobre la cabeza.
 */

/** Atacar con las manos vacias (#160). El bisturi se quedo en la Sala 7. */
export const SIN_BISTURI: readonly string[] = [
  'El bisturí se quedó en la Sala.',
  'Tengo las manos vacías.',
  'No llevo con qué cortar.',
  'Sin filo, solo puedo apartarlos.',
];

/** Lo mas largo que cabe en una linea sobre la cabeza. */
export const LARGO_MAXIMO_FRASE = 44;
