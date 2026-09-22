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
        <div class="eyebrow">Portal de la Diócesis · Vientre, superficie</div>
        <h1>La carne que se ofrece no se pierde: asciende.</h1>
        <div class="filete"></div>
        <p class="lede">
          Hace tres generaciones los Mil aceptaron la promesa y no murieron. Desde entonces la
          Diócesis los guarda, los alimenta y los interpreta. Cada casa inscribe a los suyos; cada
          diezmo se pesa y se registra; cada sacramento se celebra con la solemnidad que merece
          quien está a punto de dejar de ser solo una persona.
        </p>
        <p>
          Este portal reúne la doctrina, el Registro de fieles y aparatos, el corte del Vientre y
          el orden de los que lo habitan. Es de consulta libre. Lo que no está aquí no es que no
          exista: es que no le corresponde al fiel.
        </p>
      </section>

      <section class="seccion">
        <div class="eyebrow">Consulta</div>
        <div class="rejilla">
          <a class="tarjeta" href="#/doctrina">
            <span class="profundidad">capa I · superficie</span>
            <h3>Doctrina</h3>
            <p>Los folios del Códice de la Carne, tal como se enseñan. Léanse con la vela encendida.</p>
          </a>
          <a class="tarjeta" href="#/registro">
            <span class="profundidad">capa II · Pasillos</span>
            <h3>Registro</h3>
            <p>Fieles, oficios y aparato. Cada ficha con su lámina, tomada del natural.</p>
          </a>
          <a class="tarjeta" href="#/vientre">
            <span class="profundidad">capa III · Criptas</span>
            <h3>El Vientre</h3>
            <p>Corte de las seis capas del templo. Dos de ellas no se visitan.</p>
          </a>
          <a class="tarjeta" href="#/linaje">
            <span class="profundidad">capa IV · Salas</span>
            <h3>Linaje</h3>
            <p>De dónde vienen los dioses, quién manda sobre quién, y adónde va cada cuerpo.</p>
          </a>
          <a class="tarjeta" href="#/sacramentos">
            <span class="profundidad">capa V · Reformados</span>
            <h3>Sacramentos</h3>
            <p>El Examen de Pureza y la práctica del Sacramento. Para aspirantes.</p>
          </a>
          <a class="tarjeta" href="${import.meta.env.BASE_URL}">
            <span class="profundidad">capa VI · el descenso</span>
            <h3>Subterfuge</h3>
            <p>El teaser jugable. Un día de trabajo de las Manos del Sacramento N.º 7.</p>
          </a>
        </div>
      </section>

      <section class="seccion">
        <div class="eyebrow">Horarios y trámites</div>
        <table class="tabla">
          <tr><th>Trámite</th><th>Dónde</th><th>Cuándo</th></tr>
          <tr><td>Inscripción de diezmo</td><td>Oficina del Diezmo, Pasillos de Preparación</td><td>Turno de mañana, salvo víspera de sorteo</td></tr>
          <tr><td>Sorteo semanal</td><td>Sala de Registro</td><td>Jueves. Cerrado al público desde este mes.</td></tr>
          <tr><td>Examen de Pureza</td><td><a href="#/examen">En este portal</a></td><td>Sin cita. El resultado es vinculante.</td></tr>
          <tr><td>Visitas a Reformados</td><td>—</td><td>Los Reformados no reciben visitas. Hónrenlos desde arriba.</td></tr>
        </table>
      </section>

      <section class="seccion" id="expediente">
        <div class="eyebrow">Tu expediente</div>
        <div class="expediente">
          <div><b>Capas pisadas</b><span>${m.capas.length} / 6</span></div>
          <div><b>Hojas del Códice</b><span>${m.fragmentos.length} / 8</span></div>
          <div><b>Fichas</b><span>${m.fichas.length}</span></div>
          <div><b>Reliquias</b><span>${m.reliquias.length} / 7</span></div>
        </div>
        <p style="margin-top:12px;font-size:16px;color:var(--tinta-2)">
          ${
            abierto
              ? 'Tu descenso está registrado. Lo que la doctrina calla, aquí ya se lee.'
              : 'El portal enseña la doctrina a cualquiera. Lo demás se abre bajando: juega en este mismo navegador, o presenta una clave al pie de la página.'
          }
        </p>
      </section>
    </article>
  `),
  );
}
