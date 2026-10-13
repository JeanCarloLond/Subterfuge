/**
 * Las láminas: los sprites del juego pintados en un canvas de la web.
 *
 * Vienen de `web/generado/arte.json`, que `scripts/exportar-arte.mjs` saca del
 * mismo código que dibuja el juego. Así la ficha del Registro enseña
 * exactamente lo que el jugador vio moverse, y cuando el arte definitivo
 * sustituya al provisional, cambiará aquí solo.
 */

import arte from '../generado/arte.json';

interface Figura {
  paleta: Record<string, string>;
  filas: string[];
}

const FIGURAS = arte as Record<string, Figura>;

/** La clave de textura del juego ('devoto-placeholder') a la figura. */
export function figura(textura: string): Figura | undefined {
  return FIGURAS[textura.replace(/-placeholder$/, '')];
}

/**
 * Pinta una figura centrada en el canvas, a la escala entera más grande que
 * quepa. `silueta` la pinta de un solo color: es la lámina de una ficha que
 * el visitante aún no se ha ganado.
 */
export function pintarFigura(
  lienzo: HTMLCanvasElement,
  textura: string,
  opciones: { silueta?: string; escalaMaxima?: number } = {},
): boolean {
  const fig = figura(textura);
  const ctx = lienzo.getContext('2d');
  if (!fig || !ctx) return false;

  const alto = fig.filas.length;
  const ancho = Math.max(...fig.filas.map((f) => f.length));
  const escala = Math.max(
    1,
    Math.min(
      opciones.escalaMaxima ?? 6,
      Math.floor(lienzo.width / ancho),
      Math.floor(lienzo.height / alto),
    ),
  );
  const x0 = Math.floor((lienzo.width - ancho * escala) / 2);
  const y0 = Math.floor((lienzo.height - alto * escala) / 2);

  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.imageSmoothingEnabled = false;
  fig.filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x += 1) {
      const color = fig.paleta[fila[x]];
      if (!color) continue;
      ctx.fillStyle = opciones.silueta ?? color;
      ctx.fillRect(x0 + x * escala, y0 + y * escala, escala, escala);
    }
  });
  return true;
}

/**
 * Pinta una figura en un canvas nuevo a una escala entera y devuelve el canvas.
 * Sirve para componer texturas y escenas: el pixel del juego se agranda sin
 * suavizar, que es lo que lo mantiene reconocible.
 */
export function lienzoDe(textura: string, escala = 1): HTMLCanvasElement | null {
  const fig = figura(textura);
  if (!fig) return null;
  const alto = fig.filas.length;
  const ancho = Math.max(...fig.filas.map((f) => f.length));
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho * escala;
  lienzo.height = alto * escala;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;
  fig.filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x += 1) {
      const color = fig.paleta[fila[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * escala, y * escala, escala, escala);
    }
  });
  return lienzo;
}

/**
 * Rellena todos los `<canvas class="lamina" data-figura="...">` de un nodo con
 * su sprite. Así las páginas declaran la lámina en el marcado y no tienen que
 * saber pintar nada.
 */
export function pintarLaminas(raiz: ParentNode): void {
  for (const lienzo of raiz.querySelectorAll<HTMLCanvasElement>('canvas.lamina[data-figura]')) {
    pintarFigura(lienzo, lienzo.dataset.figura ?? '', { escalaMaxima: 8 });
  }
}
