import { progreso } from '../systems/Progreso';

/**
 * El mapa del Vientre, dibujado a mano segun se baja.
 *
 * El teaser no tenia forma de saber por donde habias pasado (issue #59). En
 * cuatro zonas verticales con desvios a los lados, eso hace que explorar se
 * sienta como dar vueltas: encuentras una repisa y no sabes si es nueva.
 *
 * POR QUE ES TEXTO Y NO UN DIBUJO. El libro entero es un folio escrito; un
 * minimapa con colores seria una ventana de videojuego pegada encima. Con
 * caracteres en fuente monoespaciada el plano queda cuadriculado y exacto, y
 * se lee como lo que la Diocesis tendria: un croquis a plumilla, hecho por
 * alguien que bajo y fue anotando.
 *
 * Solo se pinta lo pisado. Lo que falta no se insinua siquiera — ni el
 * contorno de la zona —, porque el contorno ya seria informacion: diria cuanto
 * queda. Una zona en la que no se ha entrado no tiene ni plano.
 */

/** Las cuatro capas que se recorren, en orden de descenso. */
export const ZONAS_MAPA: ReadonlyArray<{ escena: string; nombre: string }> = [
  { escena: 'Atrio', nombre: 'El Atrio' },
  { escena: 'Pasillos', nombre: 'Pasillos de Preparación' },
  { escena: 'Criptas', nombre: 'Criptas de Espera' },
  { escena: 'Salas', nombre: 'Salas de Sacramento' },
];

/** Lado de la casilla en el mundo. Tiene que cuadrar con EscenaNivel. */
const CASILLA = 64;

/** Tamaño del croquis, en caracteres. Cabe en el folio sin partirse. */
const COLUMNAS = 18;
const FILAS = 9;

const PISADO = '#';
const VACIO = '·';

/**
 * El croquis de una zona y cuanto se lleva recorrido.
 *
 * La zona real se reescala al tamaño del croquis en vez de dibujar una casilla
 * por caracter: el Atrio mide 15 x 18 casillas y las Salas 17 x 7, y a tamaño
 * fijo una saldria larguisima y la otra achatada. Asi las cuatro se leen con
 * la misma forma de folio.
 */
export function croquisDe(escena: string): { lineas: string[]; recorrido: number } {
  const mundo = progreso.mundoDe(escena);
  const pisadas = progreso.casillasDe(escena);
  if (!mundo || pisadas.size === 0) return { lineas: [], recorrido: 0 };

  const anchoCasillas = Math.max(1, Math.ceil(mundo.ancho / CASILLA));
  const altoCasillas = Math.max(1, Math.ceil(mundo.alto / CASILLA));

  // Se recorre el CROQUIS y se pregunta que trozo de mundo cubre cada celda,
  // no al reves. Al hacerlo al reves aparecian columnas vacias cada seis: el
  // Atrio tiene 15 casillas de ancho y el croquis 18, asi que tres columnas no
  // recibian ninguna y el plano salia a rayas.
  const rejilla: boolean[][] = [];

  for (let fila = 0; fila < FILAS; fila += 1) {
    const linea: boolean[] = [];
    const y0 = Math.floor((fila / FILAS) * altoCasillas);
    const y1 = Math.max(y0 + 1, Math.ceil(((fila + 1) / FILAS) * altoCasillas));

    for (let col = 0; col < COLUMNAS; col += 1) {
      const x0 = Math.floor((col / COLUMNAS) * anchoCasillas);
      const x1 = Math.max(x0 + 1, Math.ceil(((col + 1) / COLUMNAS) * anchoCasillas));

      // Basta con haber pisado UNA casilla de las que cubre: exigirlas todas
      // dejaria el plano casi vacio tras recorrer la zona entera.
      let hay = false;
      for (let cy = y0; cy < y1 && !hay; cy += 1) {
        for (let cx = x0; cx < x1 && !hay; cx += 1) {
          if (pisadas.has(`${cx},${cy}`)) hay = true;
        }
      }
      linea.push(hay);
    }
    rejilla.push(linea);
  }

  const lineas = rejilla.map((f) => f.map((c) => (c ? PISADO : VACIO)).join(''));
  const total = anchoCasillas * altoCasillas;

  return { lineas, recorrido: Math.min(100, Math.round((pisadas.size / total) * 100)) };
}
