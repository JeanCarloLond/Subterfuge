/**
 * Un libro que se hojea: dos caras abiertas y una hoja que gira sobre el lomo.
 *
 * Doctrina enseñaba los ocho folios del Códice apilados en una columna, como
 * la lista de cualquier web (#83). El Códice es un libro, y en el juego ya lo
 * es; aquí también. Cada folio es una doble página: la escritura a la
 * izquierda, el margen de la otra mano enfrente.
 *
 * La hoja que gira es un elemento aparte con dos caras (la que se va y la que
 * llega) y `backface-visibility: hidden`; debajo, las caras ya cambiaron. En
 * una pantalla estrecha las dos caras van una encima de otra y la hoja que gira
 * es el folio entero, sobre su borde izquierdo.
 *
 * Se pasa con las flechas, con el teclado y deslizando el dedo. Con
 * `prefers-reduced-motion`, la página cambia sin girar.
 */

import { html } from './texto';

export interface Folio {
  /** El número del folio en romanos, para las cintas y el pie. */
  romano: string;
  izquierda: string;
  derecha: string;
  /** El visitante tiene esta hoja completa: su cinta es de oro. */
  ganada: boolean;
}

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const DOBLE = '(min-width: 721px)';
const GIRO_MS = 620;

/** Chevrón a pixel: Silkscreen dibuja `‹ ›` del tamaño de un punto. */
const CHEVRON =
  '<svg viewBox="0 0 3 5" width="9" height="15" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h1v1H2zM1 1h1v1H1zM0 2h1v1H0zM1 3h1v1H1zM2 4h1v1H2z"/></svg>';

export function montarLibro(nodo: HTMLElement, folios: readonly Folio[]): () => void {
  nodo.classList.add('libro');
  nodo.innerHTML = `
    <div class="libro-tapa">
      <div class="libro-hojas">
        <section class="hoja hoja-izq"></section>
        <section class="hoja hoja-der"></section>
      </div>
    </div>
    <nav class="libro-nav" aria-label="Folios del Códice">
      <button type="button" class="libro-paso" data-paso="-1" aria-label="Folio anterior">${CHEVRON}</button>
      <ol class="libro-cintas">
        ${folios
          .map(
            (f, i) =>
              `<li><button type="button" data-folio="${i}" class="${f.ganada ? 'ganada' : ''}" aria-label="Folio ${html(f.romano)}">${html(f.romano)}</button></li>`,
          )
          .join('')}
      </ol>
      <span class="libro-cuenta" aria-hidden="true"></span>
      <button type="button" class="libro-paso" data-paso="1" aria-label="Folio siguiente">${CHEVRON}</button>
    </nav>
  `;

  const hojas = nodo.querySelector('.libro-hojas') as HTMLElement;
  const izq = nodo.querySelector('.hoja-izq') as HTMLElement;
  const der = nodo.querySelector('.hoja-der') as HTMLElement;
  const anterior = nodo.querySelector('[data-paso="-1"]') as HTMLButtonElement;
  const siguiente = nodo.querySelector('[data-paso="1"]') as HTMLButtonElement;
  const cintas = [...nodo.querySelectorAll<HTMLButtonElement>('[data-folio]')];
  const cuenta = nodo.querySelector('.libro-cuenta') as HTMLElement;

  let actual = 0;
  let girando = false;

  const caraIzq = (i: number) => `${folios[i].izquierda}<div class="hoja-pie">${2 * i + 1}</div>`;
  const caraDer = (i: number) => `${folios[i].derecha}<div class="hoja-pie">${2 * i + 2}</div>`;

  const pintarNav = () => {
    anterior.disabled = actual === 0;
    siguiente.disabled = actual === folios.length - 1;
    cuenta.textContent = `fol. ${folios[actual].romano} / ${folios[folios.length - 1].romano}`;
    cintas.forEach((c, i) => {
      if (i === actual) c.setAttribute('aria-current', 'page');
      else c.removeAttribute('aria-current');
    });
  };

  const poner = (i: number) => {
    izq.innerHTML = caraIzq(i);
    der.innerHTML = caraDer(i);
  };

  /** Una hoja suelta con dos caras, encima de las que hay. */
  const hojaVolando = (
    clase: string,
    frente: string,
    dorso: string,
    claseFrente: string,
    claseDorso: string,
  ) => {
    const hoja = document.createElement('div');
    hoja.className = `hoja-volando ${clase}`;
    hoja.setAttribute('aria-hidden', 'true');
    hoja.innerHTML = `
      <section class="hoja ${claseFrente} cara-frente">${frente}<i class="hoja-sombra"></i></section>
      <section class="hoja ${claseDorso} cara-dorso">${dorso}<i class="hoja-sombra"></i></section>
    `;
    hojas.append(hoja);
    return hoja;
  };

  /** Oscurece la cara que se aleja de la luz mientras gira. */
  const sombrear = (hoja: HTMLElement) => {
    const [frente, dorso] = hoja.querySelectorAll<HTMLElement>('.hoja-sombra');
    frente.animate([{ opacity: 0 }, { opacity: 0.55 }], {
      duration: GIRO_MS / 2,
      fill: 'forwards',
    });
    dorso.animate([{ opacity: 0.55 }, { opacity: 0 }], {
      duration: GIRO_MS / 2,
      delay: GIRO_MS / 2,
      fill: 'both',
    });
  };

  const ir = (destino: number) => {
    if (girando || destino === actual || destino < 0 || destino >= folios.length) return;
    const adelante = destino > actual;
    const antes = actual;
    actual = destino;
    pintarNav();

    if (QUIETO) {
      poner(destino);
      return;
    }
    girando = true;
    const terminar = (hoja: HTMLElement) => {
      poner(destino);
      hoja.remove();
      girando = false;
    };

    if (matchMedia(DOBLE).matches) {
      // Doble página: gira la hoja derecha hacia la izquierda, o al revés.
      if (adelante) {
        const hoja = hojaVolando(
          'desde-der',
          caraDer(antes),
          caraIzq(destino),
          'hoja-der',
          'hoja-izq',
        );
        der.innerHTML = caraDer(destino);
        sombrear(hoja);
        hoja
          .animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], {
            duration: GIRO_MS,
            easing: 'cubic-bezier(0.45, 0.05, 0.3, 1)',
          })
          .finished.then(
            () => terminar(hoja),
            () => terminar(hoja),
          );
      } else {
        const hoja = hojaVolando(
          'desde-izq',
          caraIzq(antes),
          caraDer(destino),
          'hoja-izq',
          'hoja-der',
        );
        izq.innerHTML = caraIzq(destino);
        sombrear(hoja);
        hoja
          .animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], {
            duration: GIRO_MS,
            easing: 'cubic-bezier(0.45, 0.05, 0.3, 1)',
          })
          .finished.then(
            () => terminar(hoja),
            () => terminar(hoja),
          );
      }
      return;
    }

    // Una sola columna: el folio entero gira sobre su borde izquierdo. Hacia
    // delante se va el que había y deja ver el nuevo; hacia atrás vuelve.
    const viejo = `<div class="hoja hoja-izq">${caraIzq(antes)}</div><div class="hoja hoja-der">${caraDer(antes)}</div>`;
    const nuevo = `<div class="hoja hoja-izq">${caraIzq(destino)}</div><div class="hoja hoja-der">${caraDer(destino)}</div>`;
    const hoja = document.createElement('div');
    hoja.className = 'hoja-volando entera';
    hoja.setAttribute('aria-hidden', 'true');
    hoja.innerHTML = adelante ? viejo : nuevo;
    if (adelante) poner(destino);
    hojas.append(hoja);
    const fotogramas = [
      { transform: 'rotateY(0deg)', opacity: 1 },
      { transform: 'rotateY(-100deg)', opacity: 0.2 },
    ];
    hoja
      .animate(adelante ? fotogramas : [...fotogramas].reverse(), {
        duration: GIRO_MS * 0.8,
        easing: adelante ? 'cubic-bezier(0.5, 0, 0.75, 0.4)' : 'cubic-bezier(0.25, 0.6, 0.5, 1)',
      })
      .finished.then(
        () => terminar(hoja),
        () => terminar(hoja),
      );
  };

  anterior.addEventListener('click', () => ir(actual - 1));
  siguiente.addEventListener('click', () => ir(actual + 1));
  for (const c of cintas) c.addEventListener('click', () => ir(Number(c.dataset.folio)));

  // Teclado: las flechas pasan página salvo que el foco esté en un campo.
  const alTeclear = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const objetivo = e.target as HTMLElement | null;
    if (objetivo?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') ir(actual + 1);
    else if (e.key === 'ArrowLeft') ir(actual - 1);
  };
  document.addEventListener('keydown', alTeclear);

  // Dedo: deslizar en horizontal. El vertical se deja para el scroll.
  let inicio: { x: number; y: number } | null = null;
  hojas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') inicio = { x: e.clientX, y: e.clientY };
  });
  hojas.addEventListener('pointerup', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) ir(actual + (dx < 0 ? 1 : -1));
  });
  hojas.addEventListener('pointercancel', () => {
    inicio = null;
  });

  poner(0);
  pintarNav();
  return () => document.removeEventListener('keydown', alTeclear);
}
