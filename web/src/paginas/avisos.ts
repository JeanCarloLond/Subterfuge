/**
 * Avisos a los fieles: lo que pasa en Subterfuge Sigma (#236), contado como lo
 * contaría la Diócesis. El templo se compacta y ella lo llama "asentamiento";
 * la carne no llega y ella dice que "falta camino". Cada aviso es una pista
 * (los muros, la ley de la Mano que mira, Génesis Vestal, el Último
 * Sacramento, el «No vengas.», el Cegado) y ninguno cuenta el giro: lo que es
 * la niña y lo que es el Cirujano no lo sabe la Diócesis, o no lo publica.
 *
 * Es contenido propio del portal: el lore de Sigma no entra en src/lore, que
 * es el del juego original y sigue siendo suyo.
 */

import { elemento } from '../texto';

interface Aviso {
  numero: number;
  titulo: string;
  cuerpo: string;
}

const AVISOS: readonly Aviso[] = [
  {
    numero: 47,
    titulo: 'Un ejemplo de obediencia',
    cuerpo: `
      <p>En la Escalera de los Ciegos vive una Mano que un día miró. Para volver a la ley, se quitó
      los ojos con sus propias manos. La Diócesis lo propone como ejemplo a todas las Salas.</p>
      <p>No lo visite: no recibe. Y si lo visita, no le pregunte por lo que vio.</p>`,
  },
  {
    numero: 46,
    titulo: 'Ejemplares anotados del Códice',
    cuerpo: `
      <p>Se han encontrado ejemplares del Códice con una anotación a mano en el margen. Siempre la
      misma, siempre con la misma letra:</p>
      <p class="aviso-margen">No vengas.</p>
      <p>Los ejemplares anotados deben entregarse en la Oficina del Diezmo. No intente averiguar a
      quién va dirigida.</p>`,
  },
  {
    numero: 45,
    titulo: 'Sobre lo que se dice en los Pasillos',
    cuerpo: `
      <p>Circula entre los guardias y los Devotos de los Pasillos un nombre: «el Último
      Sacramento». La Diócesis aclara que no existe tal sacramento. El Códice reconoce los
      sacramentos que reconoce, y ninguno es el último.</p>
      <p>Quien repita ese nombre será apartado del turno.</p>`,
  },
  {
    numero: 44,
    titulo: 'Los laboratorios de Génesis Vestal',
    cuerpo: `
      <p>Bajo las Criptas quedan salas de antes del Códice, de cuando la doctrina aún no estaba
      escrita. Se conocen como los laboratorios de Génesis Vestal y permanecen sellados. Nada de
      lo que contienen pertenece a la Diócesis ni a los fieles.</p>
      <ul>
        <li>No se entra.</li>
        <li>No se abre.</li>
        <li>No se toca lo que todavía respira.</li>
      </ul>`,
  },
  {
    numero: 43,
    titulo: 'Recordatorio de la ley de la Mano que mira',
    cuerpo: `
      <p>Las Manos del Sacramento operan con el rostro cubierto y la máscara cerrada. No ven lo
      que cortan, y así debe ser: el sacramento no se mira, se cumple. La ley es antigua y no
      admite excepción: <b>la Mano que mira se corta</b>.</p>
      <p>Se informa de que una Mano ha abandonado su Sala sin turno y desciende por los Pasillos.
      Si la encuentra:</p>
      <ul>
        <li>No le hable.</li>
        <li>No le mire la máscara.</li>
        <li>Cierre los ojos hasta que haya pasado.</li>
      </ul>`,
  },
  {
    numero: 42,
    titulo: 'Sobre el reparto de la carne',
    cuerpo: `
      <p>El reparto de la carne del diezmo a los pabellones se retrasa. No falta carne: falta
      camino. Los Pasillos por los que bajaba están cerrados mientras el templo se asienta.</p>
      <p>Se ruega a las familias que no acudan a la Oficina del Diezmo a reclamar su parte. La
      Oficina no reparte: registra.</p>`,
  },
  {
    numero: 41,
    titulo: 'Sobre el movimiento de los muros',
    cuerpo: `
      <p>Algunos fieles de los pabellones bajos han comunicado que los muros se desplazan. La
      Diócesis confirma que el templo se asienta, como se ha asentado siempre. Los Mil no se
      mueven sin motivo, y su motivo no es asunto del fiel.</p>
      <p>Mientras dure el asentamiento:</p>
      <ul>
        <li>No se apoye en los muros. No los marque. No duerma junto a ellos.</li>
        <li>Si oye el Latido de noche, no cuente los golpes.</li>
        <li>Si un pasillo se cierra, no lo espere: tome otro.</li>
      </ul>`,
  },
];

export function renderAvisos(contenedor: HTMLElement): void {
  contenedor.append(
    elemento(`
    <article>
      <div class="eyebrow">Avisos · superficie</div>
      <h1>Avisos a los fieles</h1>
      <div class="filete"></div>
      <p class="lede">
        Comunicados de la Diócesis sobre el asentamiento del templo. Se publican por orden de
        llegada; el más reciente, arriba.
      </p>
      ${AVISOS.map(
        (a) => `
        <section class="aviso-diocesis" id="aviso-${a.numero}">
          <div class="aviso-numero">Aviso n.º ${a.numero}</div>
          <h2>${a.titulo}</h2>
          ${a.cuerpo}
        </section>`,
      ).join('')}
      <p class="aviso-pie">
        Los avisos se retiran cuando dejan de ser necesarios. Ninguno de estos ha sido retirado.
      </p>
    </article>
  `),
  );
}
