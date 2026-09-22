/**
 * El Vientre: el corte de las seis capas.
 *
 * El topos del bible es un solo edificio, vertical y cerrado: "todo el mundo
 * conocido cabe dentro de esta única estructura sagrada". Se dibuja como lo
 * que es, un corte, y cada capa se oscurece hacia abajo. Las dos últimas no se
 * visitan en el teaser y aparecen cerradas: se sabe que existen, no qué hay.
 */

import { VIENTRE } from '../../../src/lore/Vientre';
import { capaPisada, descensoAbierto } from '../memoria';
import { elemento, html, parrafo } from '../texto';

/** Lo que la web añade a cada capa, sacado del bible. */
const NOTAS: readonly string[] = [
  'La ciudad visible. Aquí viven los Ayunantes, en los márgenes: los que se niegan a pagar diezmo y conservan el cuerpo entero, que en la Diócesis es la marca del paria.',
  'La administración. Oficina del Diezmo, sorteos, Registro. La piedra de arriba, parcheada con chapa: la burocracia arregla lo que se rompe con lo que tiene a mano.',
  'Sedación y espera. Los conductos que mantienen dormidos a los inscritos son los mismos que Genesis Vestal tendió hace tres generaciones. Nadie los ha reparado; siguen funcionando.',
  'Quirófanos convertidos en altares. Aquí ya no queda piedra: la máquina no se disimula, es el altar. La Sala 7 es la de las Manos del Sacramento número siete.',
  'Los Elegidos que no se completaron. La doctrina dice que se les honra; se les guarda donde no haya que verlos. La arquitectura de esta capa ya es carne.',
  'El santuario. Los Mil, sin forma humana reconocible, cada uno colapsado hacia el órgano que ganó: cerebros, corazones, estómagos. Ninguno tiene ojos. El pueblo no los ha visto jamás.',
];

const COLORES = ['#8a7a66', '#6f5d55', '#55414a', '#46303a', '#33212a', '#1b1016'];

export function renderVientre(contenedor: HTMLElement): void {
  const raiz = elemento(`
    <article>
      <div class="eyebrow">Corte del Vientre · capa III</div>
      <h1>Seis capas del mismo edificio</h1>
      <div class="filete"></div>
      <p class="lede">
        Catedral-hospital construida hacia abajo. Descender es entrar en el sacramento; cada capa
        está más lejos de parecer un edificio que la anterior.
      </p>
      <div class="capas">
        <div class="corte" role="tablist" aria-label="Capas del Vientre"></div>
        <div class="capa-detalle" id="capa-detalle" aria-live="polite"></div>
      </div>
    </article>
  `);

  const corte = raiz.querySelector('.corte') as HTMLElement;
  const detalle = raiz.querySelector('#capa-detalle') as HTMLElement;
  const botones: HTMLButtonElement[] = [];

  const mostrar = (i: number) => {
    const capa = VIENTRE[i];
    const cerrada = capa.escena === null;
    const pisada = capa.escena !== null && capaPisada(capa.escena);
    botones.forEach((b, j) => b.classList.toggle('activa', i === j));
    const estado = cerrada
      ? descensoAbierto()
        ? 'No se visita en el teaser. Se sabe que existe.'
        : 'Capa cerrada al fiel.'
      : pisada
        ? 'Pisada en tu descenso.'
        : 'Consta. Aún no la has pisado.';
    detalle.innerHTML = `
      <div class="eyebrow">Capa ${['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</div>
      <h2>${html(capa.nombre)}</h2>
      <p class="estado">${estado}</p>
      ${parrafo(capa.descripcion)}
      ${cerrada && !descensoAbierto() ? '' : `<p style="color:var(--tinta-2)">${html(NOTAS[i])}</p>`}
    `;
  };

  VIENTRE.forEach((capa, i) => {
    const cerrada = capa.escena === null;
    const pisada = capa.escena !== null && capaPisada(capa.escena);
    const boton = elemento<HTMLButtonElement>(`
      <button type="button" class="capa ${cerrada ? 'cerrada' : ''}" role="tab" style="background:${COLORES[i]};padding-block:${12 + i * 3}px">
        ${html(capa.nombre)}
        <small>${cerrada ? 'no se visita' : pisada ? 'pisada' : 'sin pisar'}</small>
      </button>
    `);
    boton.addEventListener('click', () => mostrar(i));
    botones.push(boton);
    corte.append(boton);
  });

  contenedor.append(raiz);
  mostrar(0);
}
