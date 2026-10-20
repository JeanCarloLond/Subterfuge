/**
 * La portada: la fachada institucional.
 *
 * El bible pide que el sitio no se presente como ficción sino como "el portal
 * oficial de la Diócesis": doctrina, horarios de culto, formulario para
 * ofrecer el diezmo. Burocracia religiosa normal hasta que se hurga. Aquí no
 * se hurga todavía: todo lo que dice esta página es lo que la Diócesis diría.
 */

import { CODICE, numeroEnLetras } from '../../../src/lore/Codice';
import { RELIQUIAS } from '../../../src/lore/Reliquias';
import { VIENTRE } from '../../../src/lore/Vientre';
import { memoriaDelDescenso, descensoAbierto, hitoAbierto } from '../memoria';
import { elemento } from '../texto';
import { montarEscena } from '../escena';

export function renderPortada(contenedor: HTMLElement): () => void {
  const m = memoriaDelDescenso();
  const abierto = descensoAbierto();

  contenedor.append(
    elemento(`
    <article>
      <!-- La entrada es el sitio: el Atrio, con los sprites del juego (#80). -->
      <header class="escena">
        <canvas id="escena-atrio" aria-hidden="true"></canvas>
        <div class="escena-texto">
          <div class="eyebrow">Portal oficial · atención al fiel</div>
          <h1>Diócesis de la Carne</h1>
          <p class="escena-lema">Los dioses no miran. Son mirados.</p>
          <div class="escena-acciones">
            <a class="boton boton-lleno" href="${import.meta.env.BASE_URL}">Descender al Vientre</a>
            <a class="boton" href="#/doctrina">Leer la doctrina</a>
          </div>
        </div>
      </header>

      <div class="portada-texto">
      <section class="seccion">
        <h2>Bienvenido. Su diezmo ya está en buenas manos.</h2>
        <div class="filete"></div>
        <p class="lede">
          Desde hace tres generaciones la Diócesis de la Carne custodia a los Mil, atiende sus
          necesidades y transmite su voluntad a las familias del Atrio. En este portal encontrará
          la doctrina, los horarios de la Oficina del Diezmo, el Registro y toda la información
          que un fiel necesita para cumplir con lo suyo sin contratiempos.
        </p>
        <p>
          El portal está en revisión permanente. Si echa en falta algún contenido, no lo busque:
          la Diócesis publica lo que corresponde a cada rango, y lo que no aparece aquí está en
          otras manos.
        </p>
      </section>

      <section class="seccion">
        <div class="eyebrow">Consulta</div>
        <div class="rejilla">
          <!-- El Atrio por dentro (#79): donde vive la gente que paga el diezmo. -->
          <a class="tarjeta" href="#/pabellon">
            <canvas class="lamina" data-figura="fiel" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa I · Atrio</span>
            <h3>Su pabellón</h3>
            <p>El Libro de Diezmos del Pabellón 9, abierto a consulta de sus casas. Cuarenta casas, una cuota.</p>
          </a>
          <a class="tarjeta" href="#/doctrina">
            <canvas class="lamina" data-figura="codice" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa I · superficie</span>
            <h3>Doctrina</h3>
            <p>Los ${numeroEnLetras(CODICE.length)} folios del Códice de la Carne, en edición para el fiel. Se recomienda leer con una vela encendida.</p>
          </a>
          <a class="tarjeta" href="#/registro">
            <canvas class="lamina" data-figura="devoto" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa II · Pasillos</span>
            <h3>Registro</h3>
            <p>Catálogo de fieles, oficio, especies y aparato del Vientre, con lámina. Actualizado según lo que cada visitante haya visto.</p>
          </a>
          <a class="tarjeta" href="#/vientre">
            <canvas class="lamina" data-figura="reja" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa III · Criptas</span>
            <h3>El Vientre</h3>
            <p>Plano por capas del templo. Las dos inferiores no admiten visitas.</p>
          </a>
          <a class="tarjeta" href="#/linaje">
            <canvas class="lamina" data-figura="reformado" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa IV · Salas</span>
            <h3>Linaje</h3>
            <p>Quién es quién en la Diócesis: origen de los Mil, orden del clero y destino de cada ofrenda.</p>
          </a>
          <a class="tarjeta" href="#/sacramentos">
            <canvas class="lamina" data-figura="camilla" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa V · Reformados</span>
            <h3>Sacramentos</h3>
            <p>Trámites para aspirantes: el Examen de Pureza y una práctica del Sacramento. Sin cita previa.</p>
          </a>
          <!-- El Vientre Húmedo (#111): una lámina, no un Mondador en la escena del
               Atrio; la cronología dice que la especie ya no cría arriba. -->
          <a class="tarjeta" href="#/registro">
            <canvas class="lamina" data-figura="mondador" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa V · Vientre Húmedo</span>
            <h3>Bestiario</h3>
            <p>Especies de residuo. No se alimentan a mano. No se espantan.</p>
          </a>
          <a class="tarjeta" href="${import.meta.env.BASE_URL}">
            <canvas class="lamina" data-figura="cirujano" width="72" height="72" aria-hidden="true"></canvas>
            <span class="profundidad">capa VI · el descenso</span>
            <h3>Subterfuge</h3>
            <p>Acompañe a las Manos del Sacramento N.º 7 en una jornada ordinaria de trabajo.</p>
          </a>
        </div>
      </section>

      <section class="seccion">
        <div class="eyebrow">Horarios y trámites</div>
        <table class="tabla">
          <tr><th>Trámite</th><th>Dónde</th><th>Cuándo</th></tr>
          <tr><td>Inscripción anual de diezmo</td><td>Oficina del Diezmo, Pasillos de Preparación</td><td>Turno de mañana. La víspera de sorteo no se atiende.</td></tr>
          <tr><td>Sorteo semanal</td><td>Sala de Registro</td><td>Jueves. Por motivos de aforo, este mes se celebra a puerta cerrada.</td></tr>
          <tr><td>Examen de Pureza</td><td><a href="#/examen">Desde este portal</a></td><td>Sin cita. Se recuerda que el resultado es vinculante.</td></tr>
          <tr><td>Visitas a Reformados</td><td>—</td><td>No se autorizan. Las familias pueden honrarlos desde el Atrio.</td></tr>
          <tr><td>Reclamaciones sobre el peso</td><td>—</td><td>El Registro no admite reclamaciones. Las dos cifras son definitivas.</td></tr>
          <tr><td>Consulta del Libro de Diezmos</td><td>Oficina del Decano de cada pabellón</td><td>Cualquier día. <a href="#/pabellon">Pabellón 9, en línea.</a></td></tr>
          ${
            hitoAbierto('nina')
              ? '<tr><td>Sala de Sacramento N.º 7</td><td>—</td><td>Cerrada hasta nuevo aviso. Los turnos anotados pasan a otras Salas.</td></tr>'
              : ''
          }
        </table>
      </section>

      <section class="seccion" id="expediente">
        <div class="eyebrow">Su expediente</div>
        <div class="expediente">
          <div><b>Capas pisadas</b><span>${m.capas.length} / ${VIENTRE.length}</span></div>
          <div><b>Hojas del Códice</b><span>${m.fragmentos.length} / ${CODICE.length}</span></div>
          <div><b>Fichas</b><span>${m.fichas.length}</span></div>
          <div><b>Reliquias</b><span>${m.reliquias.length} / ${RELIQUIAS.length}</span></div>
        </div>
        <p style="margin-top:12px;font-size:16px;color:var(--tinta-2)">
          ${
            abierto
              ? 'Su descenso consta en el Registro. Tiene acceso a los contenidos reservados.'
              : 'Los contenidos reservados se habilitan a medida que usted desciende (en este mismo navegador) o al presentar una clave al pie de la página. Gracias por su paciencia.'
          }
        </p>
      </section>
      </div>
    </article>
  `),
  );

  const lienzo = contenedor.querySelector<HTMLCanvasElement>('#escena-atrio');
  return lienzo ? montarEscena(lienzo) : () => undefined;
}
