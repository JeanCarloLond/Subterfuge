/**
 * El Registro: fieles, oficio, fauna, flora y aparato, con su lámina.
 *
 * Las fichas son las mismas del libro del juego (`src/lore/Registro.ts`) y la
 * lámina es el mismo sprite. Lo que el visitante no se ha ganado sale como
 * silueta y con la pista de dónde se encuentra: el Registro cataloga lo que
 * existe, no lo que cada uno ha visto, así que sabe que está, no qué es.
 */

import { REGISTRO, type Familia } from '../../../src/lore/Registro';
import { pintarFigura } from '../arte';
import { fichaAbierta } from '../memoria';
import { acentuar, elemento, html, parrafo } from '../texto';

const FAMILIAS: ReadonlyArray<{ clave: Familia; titulo: string; nota: string }> = [
  {
    clave: 'fieles',
    titulo: 'Fieles',
    nota: 'Ordenados por rango, es decir, por lo que cada uno ha entregado ya.',
  },
  {
    clave: 'oficio',
    titulo: 'El oficio',
    nota: 'Instrumental y enseres de las Manos del Sacramento. Inventario de la Sala.',
  },
  {
    clave: 'fauna',
    titulo: 'La fauna',
    nota: 'Especies que comen de lo que el Sacramento rechaza. No se alimentan a mano.',
  },
  {
    clave: 'flora',
    titulo: 'La flora',
    nota: 'Vegetación de residuo. Se tolera mientras no invada una sala de turno.',
  },
  {
    clave: 'aparato',
    titulo: 'Aparato',
    nota: 'Equipamiento heredado del Vientre. En servicio. No se dispone de manual.',
  },
];

export function renderRegistro(contenedor: HTMLElement): void {
  const abiertas = REGISTRO.filter((f) => fichaAbierta(f.id)).length;

  const raiz = elemento(`
    <article>
      <div class="eyebrow">Registro de la Diócesis · capa II</div>
      <h1>Registro de fieles, especies y aparato</h1>
      <div class="filete"></div>
      <p class="lede">
        Catálogo oficial, con lámina tomada del natural. Su expediente tiene ${abiertas} de
        ${REGISTRO.length} fichas habilitadas. El resto consta, pero por norma del Registro solo se
        muestra a quien ya lo ha visto.
      </p>
      <nav class="indice" aria-label="Índice del Registro">
        <div class="indice-titulo">Índice</div>
        <ol class="indice-lista">
          ${FAMILIAS.map((familia) => {
            const fichas = REGISTRO.filter((f) => f.familia === familia.clave);
            const vistas = fichas.filter((f) => fichaAbierta(f.id)).length;
            return `
            <li><button type="button" data-familia="${familia.clave}">
              <span class="indice-nombre">${html(familia.titulo)}</span>
              <span class="indice-cita">${vistas} de ${fichas.length} habilitadas</span>
            </button></li>`;
          }).join('')}
        </ol>
      </nav>
    </article>
  `);

  for (const familia of FAMILIAS) {
    const seccion = elemento(`
      <section class="seccion" data-seccion="${familia.clave}" tabindex="-1">
        <h2>${familia.titulo}</h2>
        <p style="color:var(--tinta-2);margin:4px 0 16px">${familia.nota}</p>
        <div class="fichas"></div>
      </section>
    `);
    const rejilla = seccion.querySelector('.fichas') as HTMLElement;

    for (const ficha of REGISTRO.filter((f) => f.familia === familia.clave)) {
      const abierta = fichaAbierta(ficha.id);
      const tarjeta = elemento(`
        <div class="ficha ${abierta ? '' : 'cerrada'}">
          <canvas width="96" height="96" aria-label="Lámina: ${html(ficha.nombre)}"></canvas>
          <div>
            <h3>${abierta ? html(ficha.nombre) : 'Pendiente de habilitar'}</h3>
            <div class="hallazgo">${html(acentuar(ficha.hallazgo))}</div>
            ${
              abierta
                ? parrafo(ficha.descripcion)
                : '<p>Consta. La ficha se habilitará cuando lo encuentre en su descenso. No se adelanta información.</p>'
            }
          </div>
        </div>
      `);
      const lienzo = tarjeta.querySelector('canvas') as HTMLCanvasElement;
      const pintada = pintarFigura(
        lienzo,
        ficha.textura,
        abierta ? {} : { silueta: 'rgba(196, 168, 140, 0.22)' },
      );
      // Una ficha cuyo dibujo aún no ha entrado no deja un hueco negro: deja
      // la marca de lámina pendiente, como haría el Registro con una vitrina.
      if (!pintada) marcarLaminaPendiente(lienzo);
      rejilla.append(tarjeta);
    }
    raiz.append(seccion);
  }

  // El índice lleva a la sección y le pasa el foco, para que el teclado siga
  // leyendo desde ahí y no desde arriba. Sin enlaces de ancla: la web va por
  // rutas con almohadilla, y un `#fauna` la sacaría del Registro.
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const boton of raiz.querySelectorAll<HTMLButtonElement>('[data-familia]')) {
    boton.addEventListener('click', () => {
      const destino = raiz.querySelector<HTMLElement>(`[data-seccion="${boton.dataset.familia}"]`);
      if (!destino) return;
      destino.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
      destino.focus({ preventScroll: true });
    });
  }

  contenedor.append(raiz);
}

/** Una cruz tenue en la vitrina: la lámina consta, pero no ha llegado. */
function marcarLaminaPendiente(lienzo: HTMLCanvasElement): void {
  const ctx = lienzo.getContext('2d');
  if (!ctx) return;
  ctx.strokeStyle = 'rgba(196, 168, 140, 0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, lienzo.width - 48, lienzo.height - 48);
  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(lienzo.width - 24, lienzo.height - 24);
  ctx.moveTo(lienzo.width - 24, 24);
  ctx.lineTo(24, lienzo.height - 24);
  ctx.stroke();
}
