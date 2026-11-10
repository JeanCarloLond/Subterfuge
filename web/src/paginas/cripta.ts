/**
 * La Cripta de Lectura: una biblioteca dentro de las Criptas de Espera.
 *
 * El visitante no recibe la explicación del mundo de golpe. Encuentra un
 * estante, abre un libro y lee. La vela de cera humana enciende el estante
 * reservado; sin ella, los otros relatos, el aparato y la cronología siguen
 * en la sombra.
 */

import {
  ESTANTES_CRIPTA,
  LIBRO_POR_ID,
  LIBROS_POR_ESTANTE,
  type LibroBiblioteca,
  type SeccionBiblioteca,
} from '../biblioteca';
import { elemento, html } from '../texto';

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function seccionHTML(seccion: SeccionBiblioteca): string {
  const titulo = seccion.titulo ? `<h4>${html(seccion.titulo)}</h4>` : '';

  if (seccion.tipo === 'parrafos') {
    return `<div class="libro-seccion">${titulo}${seccion.texto
      .map((linea) => `<p>${html(linea)}</p>`)
      .join('')}</div>`;
  }

  if (seccion.tipo === 'lista') {
    return `<div class="libro-seccion">${titulo}<ul class="lista-mundo">${seccion.items
      .map((item) => `<li><b>${html(item.nombre)}.</b> ${html(item.texto)}</li>`)
      .join('')}</ul></div>`;
  }

  return `<div class="libro-seccion">${titulo}<div class="tabla-scroll"><table class="tabla">
    <thead><tr>${seccion.columnas.map((columna) => `<th>${html(columna)}</th>`).join('')}</tr></thead>
    <tbody>${seccion.filas
      .map((fila) => `<tr>${fila.map((celda) => `<td>${html(celda)}</td>`).join('')}</tr>`)
      .join('')}</tbody>
  </table></div></div>`;
}

function libroHTML(libro: LibroBiblioteca): string {
  return `
    <button
      type="button"
      class="lomo"
      data-libro="${libro.id}"
      aria-expanded="false"
      aria-controls="lectura"
    >
      <span class="lomo-cinta" aria-hidden="true"></span>
      <span class="lomo-titulo">${html(libro.titulo)}</span>
      <span class="lomo-sub">${html(libro.subtitulo)}</span>
    </button>`;
}

function estanteHTML(id: string): string {
  const estante = ESTANTES_CRIPTA.find((e) => e.id === id);
  if (!estante) return '';
  const libros = LIBROS_POR_ESTANTE.get(estante.id) ?? [];
  return `
    <section class="seccion estante ${estante.reservado ? 'estante-reservado oculto' : ''}"
      data-estante="${estante.id}" ${estante.reservado ? 'hidden aria-hidden="true"' : ''}>
      <div class="eyebrow">${html(estante.titulo)}</div>
      <p class="estante-nota">${html(estante.nota)}</p>
      <div class="libros">${libros.map(libroHTML).join('')}</div>
    </section>`;
}

export function renderCripta(contenedor: HTMLElement): () => void {
  const raiz = elemento(`
    <article class="cripta">
      <div class="eyebrow">Criptas de Espera · anexo I</div>
      <h1>La Cripta de Lectura</h1>
      <p class="pabellon-lema">La Cripta no presta: deja leer.</p>
      <div class="filete"></div>
      <p class="lede">
        Detrás de las camillas de espera hay una sala que el Registro no numera. Aquí se guardan
        los libros que la Diócesis no cuelga en el Atrio: la doctrina, la lengua, la ley, el
        calendario, los oficios, la Intemperie y los linajes. Se leen de pie, con una vela
        de cera humana, y se devuelven a su estante.
      </p>

      <div class="cripta-vela">
        <button type="button" class="vela-cripta" aria-pressed="false">
          <span class="vela-icono" aria-hidden="true">
            <span class="vela-cera"></span>
            <span class="vela-llama"></span>
          </span>
          <span class="vela-texto">Encender la vela</span>
        </button>
        <p class="cripta-aviso">Una vela de cera humana. La Cripta no presta.</p>
      </div>

      <div class="estantes">
        ${ESTANTES_CRIPTA.filter((estante) => !estante.reservado)
          .map((estante) => estanteHTML(estante.id))
          .join('')}
        ${estanteHTML('reservado')}
      </div>

      <section class="lectura documento" id="lectura" tabindex="-1" aria-live="polite" hidden>
        <div class="lectura-cabeza">
          <div class="eyebrow lectura-estante"></div>
          <h2 class="lectura-titulo"></h2>
          <button type="button" class="lectura-cerrar boton">Cerrar el libro</button>
        </div>
        <div class="lectura-cuerpo"></div>
      </section>
    </article>
  `);

  const vela = raiz.querySelector<HTMLButtonElement>('.vela-cripta');
  const velaTexto = raiz.querySelector<HTMLElement>('.vela-texto');
  const reservado = raiz.querySelector<HTMLElement>('[data-estante="reservado"]');
  const lectura = raiz.querySelector<HTMLElement>('#lectura');
  const lecturaEstante = raiz.querySelector<HTMLElement>('.lectura-estante');
  const lecturaTitulo = raiz.querySelector<HTMLElement>('.lectura-titulo');
  const lecturaCuerpo = raiz.querySelector<HTMLElement>('.lectura-cuerpo');
  const cerrarBoton = raiz.querySelector<HTMLButtonElement>('.lectura-cerrar');
  const lomos = [...raiz.querySelectorAll<HTMLButtonElement>('.lomo')];

  let encendida = false;
  let abierto: string | null = null;

  const cerrarLibro = (devolverFoco = true) => {
    if (!lectura) return;
    const libro = abierto ? LIBRO_POR_ID.get(abierto) : undefined;
    abierto = null;
    lectura.hidden = true;
    if (lecturaCuerpo) lecturaCuerpo.replaceChildren();
    raiz.classList.remove('leyendo');
    for (const lomo of lomos) lomo.setAttribute('aria-expanded', 'false');
    if (devolverFoco && libro) {
      raiz.querySelector<HTMLButtonElement>(`.lomo[data-libro="${libro.id}"]`)?.focus();
    }
  };

  const abrirLibro = (id: string) => {
    const libro = LIBRO_POR_ID.get(id);
    if (!libro || !lectura || !lecturaCuerpo) return;
    if (libro.reservado && !encendida) return;

    if (abierto === id) {
      cerrarLibro();
      return;
    }

    abierto = id;
    if (lecturaEstante) lecturaEstante.textContent = `Cripta de Lectura · ${libro.estante}`;
    if (lecturaTitulo) lecturaTitulo.textContent = libro.titulo;
    lecturaCuerpo.innerHTML = libro.secciones.map(seccionHTML).join('');
    lectura.hidden = false;
    raiz.classList.add('leyendo');
    for (const lomo of lomos) {
      lomo.setAttribute('aria-expanded', String(lomo.dataset.libro === id));
    }
    lectura.scrollIntoView({ behavior: QUIETO ? 'auto' : 'smooth', block: 'start' });
    lectura.focus({ preventScroll: true });
  };

  const alternarVela = () => {
    encendida = !encendida;
    vela?.setAttribute('aria-pressed', String(encendida));
    if (velaTexto) {
      velaTexto.textContent = encendida ? 'Apagar la vela' : 'Encender la vela';
    }
    raiz.classList.toggle('iluminada', encendida);
    if (reservado) {
      reservado.hidden = !encendida;
      reservado.classList.toggle('oculto', !encendida);
      reservado.setAttribute('aria-hidden', String(!encendida));
    }
    if (!encendida && abierto) {
      const libro = LIBRO_POR_ID.get(abierto);
      if (libro?.reservado) cerrarLibro();
    }
  };

  vela?.addEventListener('click', alternarVela);
  for (const lomo of lomos) {
    lomo.addEventListener('click', () => abrirLibro(lomo.dataset.libro ?? ''));
  }
  cerrarBoton?.addEventListener('click', () => cerrarLibro());

  const alTeclear = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape' && abierto) cerrarLibro();
  };
  document.addEventListener('keydown', alTeclear);

  contenedor.append(raiz);

  return () => {
    document.removeEventListener('keydown', alTeclear);
  };
}
