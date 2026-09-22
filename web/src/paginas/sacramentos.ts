/**
 * Sacramentos: la entrada a los minijuegos.
 *
 * Los dos salen del bible (Taller 4, "minijuegos integrados, estilo trámites
 * que se corrompen"): el Examen de Pureza y la práctica del Sacramento. La
 * Vigilia, el tercero, vive en la Doctrina porque es una forma de leer.
 */

import { mancha } from '../memoria';
import { elemento } from '../texto';

export function renderSacramentos(contenedor: HTMLElement): void {
  const manchas = mancha();
  contenedor.append(
    elemento(`
    <article>
      <div class="eyebrow">Sacramentos · capa V</div>
      <h1>Para aspirantes</h1>
      <div class="filete"></div>
      <p class="lede">
        Trámites de la Diócesis que se pueden hacer desde arriba. Ninguno explica la historia:
        cada uno enseña una parte del mundo por dentro, que es como se aprende aquí.
      </p>
      <div class="rejilla">
        <a class="tarjeta" href="#/examen">
          <span class="profundidad">trámite · vinculante</span>
          <h3>Examen de Pureza</h3>
          <p>Diez preguntas que deciden tu lugar en la Diócesis. Responde con sinceridad: el Registro ya sabe algunas cosas de ti.</p>
        </a>
        <a class="tarjeta" href="#/sacramento">
          <span class="profundidad">práctica · con las manos</span>
          <h3>El Sacramento</h3>
          <p>Sigue el Códice paso a paso: cubrir, pesar, incidir, sellar. Fallar tiene consecuencias en el resto del portal.</p>
        </a>
        <a class="tarjeta" href="#/doctrina">
          <span class="profundidad">lectura · con vela</span>
          <h3>Vigilia</h3>
          <p>Mantén la vela encendida mientras lees el Códice. O déjala consumirse y mira lo que hay debajo.</p>
        </a>
      </div>
      ${
        manchas > 0
          ? `<p style="margin-top:28px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--sangre)">
               Sacramentos fallidos en este navegador: ${manchas}. La mancha del pie de página es tuya.
             </p>`
          : ''
      }
    </article>
  `),
  );
}
