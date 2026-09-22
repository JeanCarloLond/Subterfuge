/**
 * La portada: la fachada institucional.
 *
 * El bible pide que el sitio no se presente como ficción sino como "el portal
 * oficial de la Diócesis": doctrina, horarios de culto, formulario para
 * ofrecer el diezmo. Burocracia religiosa normal hasta que se hurga. Aquí no
 * se hurga todavía: todo lo que dice esta página es lo que la Diócesis diría.
 */

import { memoriaDelDescenso, descensoAbierto } from '../memoria';
import { elemento } from '../texto';

export function renderPortada(contenedor: HTMLElement): void {
  const m = memoriaDelDescenso();
  const abierto = descensoAbierto();

  contenedor.append(
    elemento(`
    <article>
      <section class="seccion">
        <div class="eyebrow">Portal de la Diócesis · atención al fiel</div>
        <h1>Bienvenido. Su diezmo ya está en buenas manos.</h1>
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
          <a class="tarjeta" href="#/doctrina">
            <span class="profundidad">capa I · superficie</span>
            <h3>Doctrina</h3>
            <p>Los ocho folios del Códice de la Carne, en edición para el fiel. Se recomienda leer con una vela encendida.</p>
          </a>
          <a class="tarjeta" href="#/registro">
            <span class="profundidad">capa II · Pasillos</span>
            <h3>Registro</h3>
            <p>Catálogo de fieles, oficio y aparato del Vientre, con lámina. Actualizado según lo que cada visitante haya visto.</p>
          </a>
          <a class="tarjeta" href="#/vientre">
            <span class="profundidad">capa III · Criptas</span>
            <h3>El Vientre</h3>
            <p>Plano por capas del templo. Las dos inferiores no admiten visitas.</p>
          </a>
          <a class="tarjeta" href="#/linaje">
            <span class="profundidad">capa IV · Salas</span>
            <h3>Linaje</h3>
            <p>Quién es quién en la Diócesis: origen de los Mil, orden del clero y destino de cada ofrenda.</p>
          </a>
          <a class="tarjeta" href="#/sacramentos">
            <span class="profundidad">capa V · Reformados</span>
            <h3>Sacramentos</h3>
            <p>Trámites para aspirantes: el Examen de Pureza y una práctica del Sacramento. Sin cita previa.</p>
          </a>
          <a class="tarjeta" href="${import.meta.env.BASE_URL}">
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
        </table>
      </section>

      <section class="seccion" id="expediente">
        <div class="eyebrow">Su expediente</div>
        <div class="expediente">
          <div><b>Capas pisadas</b><span>${m.capas.length} / 6</span></div>
          <div><b>Hojas del Códice</b><span>${m.fragmentos.length} / 8</span></div>
          <div><b>Fichas</b><span>${m.fichas.length}</span></div>
          <div><b>Reliquias</b><span>${m.reliquias.length} / 7</span></div>
        </div>
        <p style="margin-top:12px;font-size:16px;color:var(--tinta-2)">
          ${
            abierto
              ? 'Su descenso consta en el Registro. Tiene acceso a los contenidos reservados.'
              : 'Los contenidos reservados se habilitan a medida que usted desciende (en este mismo navegador) o al presentar una clave al pie de la página. Gracias por su paciencia.'
          }
        </p>
      </section>
    </article>
  `),
  );
}
