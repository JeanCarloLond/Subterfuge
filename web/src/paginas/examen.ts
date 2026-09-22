/**
 * El Examen de Pureza.
 *
 * Del bible: "un test vocacional que decide si eres apto como Devoto… y que
 * responde cosas que no deberías saber de ti". Diez preguntas en el tono de un
 * trámite, cada respuesta suma a un perfil, y el veredicto es vinculante. Lo
 * inquietante no está en las preguntas: está en que el Registro sabe cuántas
 * veces lo has hecho, hasta dónde has bajado y qué hora es.
 */

import { mancha, memoriaDelDescenso } from '../memoria';
import { elemento, html } from '../texto';

type Perfil =
  'devoto' | 'vestal' | 'manos' | 'elegido' | 'ayunante' | 'rebano' | 'anatomista' | 'ojos';

interface Opcion {
  texto: string;
  suma: Partial<Record<Perfil, number>>;
}

interface Pregunta {
  texto: string;
  opciones: readonly Opcion[];
}

const PREGUNTAS: readonly Pregunta[] = [
  {
    texto: '¿Cuánto cuerpo está dispuesto a entregar?',
    opciones: [
      { texto: 'Lo que el sorteo diga.', suma: { devoto: 2 } },
      { texto: 'Lo que haga falta, y algo más.', suma: { rebano: 2 } },
      { texto: 'Nada. El cuerpo es mío.', suma: { ayunante: 2 } },
      { texto: 'Depende de qué se haga con él.', suma: { anatomista: 2 } },
    ],
  },
  {
    texto: 'Ante una revelación de las Vestales:',
    opciones: [
      { texto: 'Se obedece.', suma: { devoto: 2 } },
      { texto: 'Se interpreta.', suma: { vestal: 2 } },
      { texto: 'Se anota y se comprueba.', suma: { anatomista: 2 } },
      { texto: 'Se pregunta de dónde salió.', suma: { ayunante: 1, anatomista: 1 } },
    ],
  },
  {
    texto: 'Un dios no mira. ¿Qué hace usted delante de él?',
    opciones: [
      { texto: 'Bajo la mirada y ofrezco las manos.', suma: { devoto: 2 } },
      { texto: 'Le hablo, aunque no oiga.', suma: { elegido: 2 } },
      { texto: 'Lo miro. Alguien tiene que.', suma: { ojos: 2 } },
      { texto: 'Le tomo el pulso.', suma: { anatomista: 2 } },
    ],
  },
  {
    texto: 'Su casa contrae una deuda con la Diócesis.',
    opciones: [
      { texto: 'Se salda en carne, como manda el Códice.', suma: { devoto: 2 } },
      { texto: 'La salda quien la contrajo.', suma: { ayunante: 2 } },
      { texto: 'Me ofrezco yo.', suma: { elegido: 3 } },
      { texto: 'Se negocia con el Registro.', suma: { vestal: 2 } },
    ],
  },
  {
    texto: 'Tiene un bisturí en la mano y un cuerpo dormido delante.',
    opciones: [
      { texto: 'Sigo el Códice paso a paso.', suma: { manos: 3 } },
      { texto: 'Suelto el bisturí.', suma: { ayunante: 2 } },
      { texto: 'Corto sin mirar.', suma: { devoto: 1, manos: 1 } },
      { texto: 'Miro antes.', suma: { ojos: 2, manos: 1 } },
    ],
  },
  {
    texto: '¿Qué prefiere conservar?',
    opciones: [
      { texto: 'Las manos.', suma: { manos: 2 } },
      { texto: 'La fe.', suma: { devoto: 2 } },
      { texto: 'Los ojos.', suma: { ojos: 2 } },
      { texto: 'Nada. Conservar es no ascender.', suma: { rebano: 3 } },
    ],
  },
  {
    texto: 'Alguien cuenta en voz alta cuántos dioses nuevos ha habido.',
    opciones: [
      { texto: 'Lo denuncio.', suma: { vestal: 3 } },
      { texto: 'Le pregunto la cifra.', suma: { anatomista: 2 } },
      { texto: 'Me alejo.', suma: { devoto: 2 } },
      { texto: 'Ya la sabía.', suma: { manos: 2, ojos: 1 } },
    ],
  },
  {
    texto: 'Se le asigna un turno en las Criptas. Hay que dosificar.',
    opciones: [
      { texto: 'La dosis del Códice.', suma: { devoto: 1, manos: 1 } },
      { texto: 'Dosis doble. Que no griten.', suma: { vestal: 2 } },
      { texto: 'La mínima.', suma: { ayunante: 2 } },
      { texto: 'Ninguna, y me quedo a escuchar.', suma: { anatomista: 2, ojos: 1 } },
    ],
  },
  {
    texto: 'Si le ofrecieran lo que a los dioses les falta:',
    opciones: [
      { texto: 'Se lo entregaría.', suma: { devoto: 1, elegido: 2 } },
      { texto: 'Lo guardaría para el clero.', suma: { vestal: 2 } },
      { texto: 'Lo estudiaría antes.', suma: { anatomista: 2 } },
      { texto: 'Me lo quedaría. Es mío.', suma: { rebano: 2, ojos: 1 } },
    ],
  },
  {
    texto: 'Firme.',
    opciones: [
      { texto: 'Con mi número.', suma: { manos: 2 } },
      { texto: 'Con mi nombre.', suma: { ayunante: 2 } },
      { texto: 'Con el de mi casa.', suma: { devoto: 2 } },
      { texto: 'De mi puño, sin número.', suma: { elegido: 3 } },
    ],
  },
];

const VEREDICTOS: Readonly<Record<Perfil, { titulo: string; texto: string }>> = {
  devoto: {
    titulo: 'APTO · Devoto',
    texto: 'Se le inscribe en el sorteo de su casa. Conserve el cuerpo hasta que se le pida.',
  },
  vestal: {
    titulo: 'APTO · Vestal en formación',
    texto: 'Sabe administrar lo que otros entregan. Se le asigna al Registro. Sella, no cargue.',
  },
  manos: {
    titulo: 'APTO · Manos',
    texto:
      'Se le asigna una Sala. Número pendiente. No hablará con el ofrendado ni le verá la cara.',
  },
  elegido: {
    titulo: 'APTO · Elegido voluntario',
    texto:
      'Sin número. Preséntese en las Criptas la víspera del turno. La dosis se administrará allí.',
  },
  ayunante: {
    titulo: 'NO APTO · Expediente abierto',
    texto:
      'Cuerpo íntegro y voluntad de conservarlo. Se le clasifica como Ayunante y se le vigila desde el Atrio.',
  },
  rebano: {
    titulo: 'NO APTO · Rebaño Hueco',
    texto:
      'Busca la ascensión sin permiso del clero. Se le retira el instrumental. No se acerque a las Salas.',
  },
  anatomista: {
    titulo: 'APTO · Manos (nota interna)',
    texto: 'Técnicamente valioso. Pregunta demasiado. Observar. No dejarle solo con los manuales.',
  },
  ojos: {
    titulo: 'SIN CLASIFICAR',
    texto:
      'Mira. El Registro no tiene casilla para esto. Se eleva la consulta al clero, que ya ha preguntado por usted.',
  },
};

const CLAVE_EXAMENES = 'diocesis.examenes';

function contarExamen(): number {
  try {
    const n = Number(localStorage.getItem(CLAVE_EXAMENES) ?? '0') + 1;
    localStorage.setItem(CLAVE_EXAMENES, String(n));
    return n;
  } catch {
    return 1;
  }
}

/** Lo que el Registro sabe del visitante sin haberle preguntado. */
function loQueSabe(vez: number): string[] {
  const m = memoriaDelDescenso();
  const lineas: string[] = [];
  const hora = new Date();
  const hh = String(hora.getHours()).padStart(2, '0');
  const mm = String(hora.getMinutes()).padStart(2, '0');

  lineas.push(
    vez === 1
      ? 'Es la primera vez que se presenta al Examen.'
      : `Es la ${vez}.ª vez que se presenta al Examen. Las anteriores también constan.`,
  );
  lineas.push(
    hora.getHours() >= 22 || hora.getHours() < 6
      ? `Son las ${hh}:${mm}. A esta hora la Oficina está cerrada y usted sigue aquí.`
      : `Son las ${hh}:${mm}. Turno de ${hora.getHours() < 14 ? 'mañana' : 'tarde'}.`,
  );
  if (m.capas.length > 0) lineas.push(`Ha pisado ${m.capas.length} de las seis capas.`);
  if (m.hitos.includes('manos-anteriores'))
    lineas.push('Estuvo en la Sala 7. Sabe lo que había dentro.');
  if (m.hitos.includes('final')) lineas.push('Vio el cierre. Sabe que ella mira.');
  if (m.fragmentos.length >= 8) lineas.push('Tiene las ocho hojas. Nadie debería tener las ocho.');
  const manchas = mancha();
  if (manchas > 0)
    lineas.push(
      `Ha fallado ${manchas} ${manchas === 1 ? 'sacramento' : 'sacramentos'} de práctica.`,
    );
  if (m.capas.length === 0 && !m.hitos.length) lineas.push('No consta ningún descenso. Todavía.');
  return lineas;
}

export function renderExamen(contenedor: HTMLElement): void {
  const puntos: Record<Perfil, number> = {
    devoto: 0,
    vestal: 0,
    manos: 0,
    elegido: 0,
    ayunante: 0,
    rebano: 0,
    anatomista: 0,
    ojos: 0,
  };
  let indice = 0;

  const raiz = elemento(`
    <article>
      <div class="eyebrow">Sacramentos · Examen de Pureza</div>
      <h1>Examen de Pureza</h1>
      <div class="filete"></div>
      <p class="lede">
        Diez preguntas. No hay respuestas correctas: hay respuestas que dicen dónde va cada cuerpo.
        El resultado es vinculante.
      </p>
      <div id="examen"></div>
      <p style="margin-top:16px"><a href="#/sacramentos">← Volver a los Sacramentos</a></p>
    </article>
  `);
  const marco = raiz.querySelector('#examen') as HTMLElement;

  const veredicto = () => {
    const vez = contarExamen();
    // Los ojos ganan solo si de verdad se miró varias veces: es el resultado raro.
    const orden = (Object.keys(puntos) as Perfil[]).sort((a, b) => puntos[b] - puntos[a]);
    let perfil = orden[0];
    if (perfil === 'ojos' && puntos.ojos < 5) perfil = orden[1];
    const v = VEREDICTOS[perfil];

    marco.innerHTML = `
      <div class="veredicto">
        <div class="eyebrow">Veredicto del Registro</div>
        <h3>${html(v.titulo)}</h3>
        <p>${html(v.texto)}</p>
        <div class="eyebrow" style="margin-top:18px">Lo que el Registro ya sabía</div>
        ${loQueSabe(vez)
          .map((l) => `<p class="mono">${html(l)}</p>`)
          .join('')}
        <p style="margin-top:14px"><button type="button" id="repetir">Presentarse otra vez</button></p>
      </div>
    `;
    marco.querySelector('#repetir')?.addEventListener('click', () => {
      for (const clave of Object.keys(puntos) as Perfil[]) puntos[clave] = 0;
      indice = 0;
      preguntar();
    });
  };

  const preguntar = () => {
    if (indice >= PREGUNTAS.length) {
      veredicto();
      return;
    }
    const p = PREGUNTAS[indice];
    marco.innerHTML = `
      <div class="pregunta">
        <div class="progreso-examen">${indice + 1} / ${PREGUNTAS.length}</div>
        <h3>${html(p.texto)}</h3>
        <div class="opciones">
          ${p.opciones.map((o, i) => `<button type="button" data-i="${i}">${html(o.texto)}</button>`).join('')}
        </div>
      </div>
    `;
    for (const boton of marco.querySelectorAll<HTMLButtonElement>('button[data-i]')) {
      boton.addEventListener('click', () => {
        const opcion = p.opciones[Number(boton.dataset.i)];
        for (const [perfil, n] of Object.entries(opcion.suma) as [Perfil, number][]) {
          puntos[perfil] += n;
        }
        indice += 1;
        preguntar();
      });
    }
  };

  contenedor.append(raiz);
  preguntar();
}
