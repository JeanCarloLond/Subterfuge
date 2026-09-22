/**
 * El Registro: fieles, oficio y aparato, con su lámina.
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
      <h1>Registro de fieles, oficio y aparato</h1>
      <div class="filete"></div>
      <p class="lede">
        Catálogo oficial, con lámina tomada del natural. Su expediente tiene ${abiertas} de
        ${REGISTRO.length} fichas habilitadas. El resto consta, pero por norma del Registro solo se
        muestra a quien ya lo ha visto.
      </p>
    </article>
  `);

  for (const familia of FAMILIAS) {
    const seccion = elemento(`
      <section class="seccion">
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
      pintarFigura(lienzo, ficha.textura, abierta ? {} : { silueta: 'rgba(60, 40, 48, 0.9)' });
      rejilla.append(tarjeta);
    }
    raiz.append(seccion);
  }

  contenedor.append(raiz);
}
