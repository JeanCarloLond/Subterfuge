/**
 * El expediente del asentamiento (#236): lo que pasa en Subterfuge Sigma,
 * contado como lo contaría la Diócesis.
 *
 * La página reúne dos cosas que antes estaban sueltas: el parte oficial de los
 * avisos y el plano de las seis capas que se juntan. El templo se compacta y la
 * Diócesis lo llama «asentamiento»; la carne no llega y ella dice que «falta
 * camino».
 *
 * Sigue la regla de la issue: pistas, no el giro. Ni la niña ni el papel real
 * del Cirujano se cuentan aquí. El lore propio de Sigma vive en `sigma.ts` y
 * no se mezcla con `src/lore`, que es el del teaser original.
 */

import { elemento, html } from '../texto';
import { avisosOrdenados, fusionar, JUNTAS_SIGMA, NIVELES_SIGMA } from '../sigma';

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function renderAvisos(contenedor: HTMLElement): void {
  const raiz = elemento(`
    <article class="asentamiento">
      <div class="eyebrow">Expediente del asentamiento · capa VII</div>
      <h1>El Asentamiento</h1>
      <p class="pabellon-lema">El templo se mueve. La Diócesis lo llama asentarse.</p>
      <div class="filete"></div>
      <p class="lede">
        Los muros del Vientre se desplazan y la carne no llega a los pabellones. La Diócesis
        informa a los fieles de lo que deben hacer mientras el templo se asienta. Este expediente
        reúne el parte de los avisos y el plano de las seis capas. Lo que no consta aquí está en
        otras manos.
      </p>
      <div class="escena-acciones">
        <a class="boton boton-lleno" href="${import.meta.env.BASE_URL}sigma/">Jugar la demo de Sigma</a>
        <a class="boton" href="#/vientre">Ver el plano del Vientre</a>
        <a class="boton" href="#/doctrina">Leer la doctrina</a>
      </div>
      <p class="asentamiento-nota">
        Demo en desarrollo, con los sprites del juego todavía provisionales. Se juega con teclado o mando. La partida se
        guarda en este navegador.
      </p>

      <nav class="indice indice-asentamiento" aria-label="Expediente del asentamiento">
        <div class="indice-titulo">Índice</div>
        <ol class="indice-lista">
          <li><button type="button" data-ir-a="lo-que-se-mueve">
            <span class="indice-num">I</span>
            <span class="indice-nombre">Lo que se mueve</span>
            <span class="indice-cita">muros, carne y asentamiento</span>
          </button></li>
          <li><button type="button" data-ir-a="el-plano">
            <span class="indice-num">II</span>
            <span class="indice-nombre">El plano que se cierra</span>
            <span class="indice-cita">seis capas y sus juntas</span>
          </button></li>
          <li><button type="button" data-ir-a="avisos">
            <span class="indice-num">III</span>
            <span class="indice-nombre">Avisos a los fieles</span>
            <span class="indice-cita">del más reciente al más antiguo</span>
          </button></li>
        </ol>
      </nav>

      <section class="seccion" id="lo-que-se-mueve" tabindex="-1">
        <div class="eyebrow">Parte oficial</div>
        <h2>Lo que se mueve</h2>
        <div class="rejilla piezas-sigma">
          <article class="documento pieza-sigma">
            <div class="eyebrow">Los muros</div>
            <h3>El templo se asienta</h3>
            <p>
              Los cuerpos de los Mil son las paredes, los ductos y las salas del templo. Llevaban
              milenios quietos; ahora las paredes se desplazan y las capas se juntan. La Diócesis lo llama asentamiento y pide calma.
            </p>
          </article>
          <article class="documento pieza-sigma">
            <div class="eyebrow">El reparto</div>
            <h3>La carne no llega</h3>
            <p>
              El diezmo se retrasa en los pabellones bajos. Carne hay; lo que faltan son Pasillos por
              donde bajarla, cerrados mientras el templo se asienta. La Oficina toma nota de cada
              queja y la archiva por orden de llegada.
            </p>
          </article>
          <article class="documento pieza-sigma">
            <div class="eyebrow">La ley</div>
            <h3>La Mano que mira</h3>
            <p>
              Las Manos del Sacramento operan con la máscara cerrada. La ley se aprende antes que el
              oficio: la Mano que mira se corta. Anoche una Mano dejó su Sala sin turno; se la ha
              visto en los Pasillos, bajando, con la cara descubierta.
            </p>
          </article>
          <article class="documento pieza-sigma">
            <div class="eyebrow">El origen</div>
            <h3>Génesis Vestal</h3>
            <p>
              Antes del Códice estaba Génesis Vestal, una corporación con laboratorios y manuales. Los
              manuales los rezamos hoy. De los laboratorios, sellados, se prefiere no hablar.
            </p>
          </article>
        </div>
      </section>

      <section class="seccion" id="el-plano" tabindex="-1">
        <div class="eyebrow">El plano del asentamiento</div>
        <h2>El plano que se cierra</h2>
        <p>
          El corte vertical tiene seis capas. En el templo no se abren con llaves: el templo se
          asienta y dos capas se juntan. Pulse una junta para ver cómo se cierra el plano. Lo que
          se lee es lo que el Registro apunta; el motivo no se publica.
        </p>
        <div class="plano-sigma">
          <ol class="plano-sigma-capas">
            ${NIVELES_SIGMA.map(
              (nivel, i) => `
              ${
                i > 0
                  ? `<li class="junta-sigma">
                      <button type="button" class="junta" data-junta="${JUNTAS_SIGMA[i - 1].id}" aria-pressed="false" aria-label="Juntar ${html(NIVELES_SIGMA[i - 1].nombre)} y ${html(nivel.nombre)}">
                        <span class="junta-icono" aria-hidden="true"></span>
                        <span class="junta-texto">${html(JUNTAS_SIGMA[i - 1].nota)}</span>
                      </button>
                    </li>`
                  : ''
              }
              <li class="capa-sigma" data-nivel="${nivel.id}">
                <span class="capa-sigma-num" aria-hidden="true">${i + 1}</span>
                <div>
                  <h3>${html(nivel.nombre)}</h3>
                  <p>${html(nivel.que)}</p>
                  <dl class="capa-sigma-datos">
                    <dt>Hito</dt><dd>${html(nivel.hito)}</dd>
                    <dt>Peligro</dt><dd>${html(nivel.peligro)}</dd>
                  </dl>
                </div>
              </li>`,
            ).join('')}
          </ol>
          <div class="plano-sigma-mando" aria-live="polite">
            <b class="plano-cuenta"></b>
            <span class="plano-mensaje"></span>
            <button type="button" class="boton plano-reiniciar">Reiniciar el plano</button>
          </div>
        </div>
      </section>

      <section class="seccion" id="avisos" tabindex="-1">
        <div class="eyebrow">Avisos · capa VII</div>
        <h2>Avisos a los fieles</h2>
        <p>
          Comunicados de la Diócesis sobre el asentamiento del templo. Se publican por orden de
          llegada; el más reciente, arriba.
        </p>
        ${avisosOrdenados()
          .map(
            (a) => `
            <section class="aviso-diocesis" id="aviso-${a.numero}">
              <div class="aviso-numero">Aviso n.º ${a.numero}</div>
              <h2>${html(a.titulo)}</h2>
              ${a.cuerpo}
            </section>`,
          )
          .join('')}
        <p class="aviso-pie">
          Los avisos se retiran cuando dejan de ser necesarios. Ninguno de estos ha sido retirado.
        </p>
      </section>
    </article>
  `);

  // El índice no duplica el texto: lleva a la sección y le pasa el foco para
  // que el teclado siga leyendo desde ahí, como en el Registro.
  for (const boton of raiz.querySelectorAll<HTMLButtonElement>('[data-ir-a]')) {
    boton.addEventListener('click', () => {
      const destino = raiz.querySelector<HTMLElement>(`#${boton.dataset.irA}`);
      if (!destino) return;
      destino.scrollIntoView({ behavior: QUIETO ? 'auto' : 'smooth', block: 'start' });
      destino.focus({ preventScroll: true });
    });
  }

  // -- El plano que se cierra -----------------------------------------------
  const capas = [...raiz.querySelectorAll<HTMLElement>('.capa-sigma')];
  const juntas = [...raiz.querySelectorAll<HTMLButtonElement>('[data-junta]')];
  const cuenta = raiz.querySelector<HTMLElement>('.plano-cuenta');
  const mensaje = raiz.querySelector<HTMLElement>('.plano-mensaje');
  const reiniciar = raiz.querySelector<HTMLButtonElement>('.plano-reiniciar');
  const abiertas = new Set<string>();

  const pintarPlano = () => {
    const grupos = fusionar(abiertas);
    const fusionadas = new Set(
      grupos.filter((grupo) => grupo.length > 1).flatMap((grupo) => grupo.map((nivel) => nivel.id)),
    );
    for (const capa of capas) {
      capa.classList.toggle('fusionada', fusionadas.has(capa.dataset.nivel ?? ''));
    }
    for (const junta of juntas) {
      const activa = abiertas.has(junta.dataset.junta ?? '');
      junta.classList.toggle('abierta', activa);
      junta.setAttribute('aria-pressed', String(activa));
    }
    const pares = grupos.filter((grupo) => grupo.length > 1).length;
    if (cuenta) {
      cuenta.textContent =
        grupos.length === 1
          ? 'Una sola capa'
          : `${grupos.length} de ${NIVELES_SIGMA.length} capas separadas`;
    }
    if (mensaje) {
      mensaje.textContent =
        grupos.length === 1
          ? 'El templo ha quedado compacto.'
          : pares === 0
            ? 'Pulse una junta para ver cómo se asienta el templo.'
            : `${pares} junta${pares === 1 ? '' : 's'} abierta${pares === 1 ? '' : 's'}. Quedan ${grupos.length} capas.`;
    }
  };

  for (const junta of juntas) {
    junta.addEventListener('click', () => {
      const id = junta.dataset.junta ?? '';
      if (abiertas.has(id)) abiertas.delete(id);
      else abiertas.add(id);
      pintarPlano();
    });
  }
  reiniciar?.addEventListener('click', () => {
    abiertas.clear();
    pintarPlano();
  });
  pintarPlano();

  contenedor.append(raiz);
}
