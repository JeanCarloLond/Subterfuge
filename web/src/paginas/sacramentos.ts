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
      <h1>Trámites para aspirantes</h1>
      <div class="filete"></div>
      <p class="lede">
        Gestiones que la Diócesis pone a disposición del fiel sin necesidad de bajar a la Oficina.
        Todas son gratuitas. Los resultados se archivan.
      </p>
      <div class="rejilla">
        <a class="tarjeta" href="#/examen">
          <span class="profundidad">trámite · vinculante</span>
          <h3>Examen de Pureza</h3>
          <p>Diez preguntas para determinar su lugar en la Diócesis. Conteste con sinceridad; el Registro contrastará sus respuestas con lo que ya consta de usted.</p>
        </a>
        <a class="tarjeta" href="#/sacramento">
          <span class="profundidad">práctica · con las manos</span>
          <h3>El Sacramento</h3>
          <p>Práctica guiada en cuatro pasos: cubrir, pesar, incidir y sellar. Se informa de que los errores quedan registrados y son visibles en el resto del portal.</p>
        </a>
        <a class="tarjeta" href="#/doctrina">
          <span class="profundidad">lectura · con vela</span>
          <h3>Vigilia</h3>
          <p>Lectura del Códice con vela. Se recomienda mantenerla encendida durante toda la sesión.</p>
        </a>
      </div>
      ${
        manchas > 0
          ? `<p style="margin-top:28px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--sangre)">
               Consta en su expediente: ${manchas} ${manchas === 1 ? 'práctica fallida' : 'prácticas fallidas'}. La mancha del pie de página no se limpia.
             </p>`
          : ''
      }
    </article>
  `),
  );
}
