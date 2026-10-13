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
    texto:
      'Queda inscrito en el sorteo de su casa. Mientras tanto, cuide su cuerpo: no es del todo suyo.',
  },
  vestal: {
    titulo: 'APTO · Vestal en formación',
    texto:
      'Demuestra aptitud para administrar lo que otros entregan. Se le asigna al Registro. Recuerde: se sella, no se carga.',
  },
  manos: {
    titulo: 'APTO · Manos',
    texto:
      'Se le asignará una Sala en cuanto quede una libre. Se le recuerda que no hablará con el ofrendado ni le verá la cara.',
  },
  elegido: {
    titulo: 'APTO · Elegido voluntario',
    texto:
      'Gracias por su ofrecimiento. Preséntese en las Criptas la víspera de su turno, en ayunas. La dosis se administra allí.',
  },
  ayunante: {
    titulo: 'NO APTO · Expediente abierto',
    texto:
      'Manifiesta voluntad de conservar el cuerpo. Queda clasificado como Ayunante. Su domicilio pasa a la lista de seguimiento del Atrio.',
  },
  rebano: {
    titulo: 'NO APTO · Rebaño Hueco',
    texto:
      'Manifiesta intención de ascender sin permiso del clero. Se le retira cualquier instrumental que posea. Absténgase de acercarse a las Salas.',
  },
  anatomista: {
    titulo: 'APTO · Manos (nota interna)',
    texto:
      'Aptitud técnica notable. (Nota interna: hace demasiadas preguntas. Observar. No dejarle a solas con los manuales.)',
  },
  ojos: {
    titulo: 'SIN CLASIFICAR',
    texto:
      'Usted mira. El formulario no contempla esa casilla. Su consulta se eleva al clero, que, por cierto, ya había preguntado por usted.',
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
      ? 'Es su primera vez en el Examen. Bienvenido.'
      : `Es su ${vez}.ª vez en el Examen. Las anteriores también constan; no hace falta que insista.`,
  );
  lineas.push(
    hora.getHours() >= 22 || hora.getHours() < 6
      ? `Son las ${hh}:${mm}. La Oficina está cerrada a esta hora. Usted, por lo visto, no.`
      : `Son las ${hh}:${mm}. Turno de ${hora.getHours() < 14 ? 'mañana' : 'tarde'}. Gracias por venir en horario.`,
  );
  if (m.capas.length > 0)
    lineas.push(`Consta que ha visitado ${m.capas.length} de las seis capas.`);
  if (m.hitos.includes('manos-anteriores'))
    lineas.push('Consta una visita a la Sala 7. No hace falta que nos cuente lo que vio.');
  if (m.hitos.includes('final'))
    lineas.push('Consta que llegó hasta el final. Consta también quién le miró.');
  if (m.fragmentos.length >= 8)
    lineas.push('Tiene el Códice completo. Es más de lo que corresponde a su rango.');
  const manchas = mancha();
  if (manchas > 0)
    lineas.push(
      `Consta${manchas === 1 ? ' una práctica fallida' : `n ${manchas} prácticas fallidas`} del Sacramento.`,
    );
  if (m.capas.length === 0 && !m.hitos.length)
    lineas.push('No consta ningún descenso a su nombre. Le esperamos.');
  return lineas;
}

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const MESES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Cuántos exámenes constan ya, sin contar este. */
function examenesPrevios(): number {
  try {
    return Number(localStorage.getItem(CLAVE_EXAMENES) ?? '0');
  } catch {
    return 0;
  }
}

/**
 * El Examen es un trámite, así que se rellena en un expediente (#84): una hoja
 * del Registro por pregunta, la respuesta marcada a tinta, la hoja que se
 * levanta como en un legajo y, al final, la resolución con su sello de lacre.
 */
export function renderExamen(contenedor: HTMLElement): () => void {
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
  let temporizador = 0;

  const raiz = elemento(`
    <article>
      <div class="eyebrow">Sacramentos · Examen de Pureza</div>
      <h1>Examen de Pureza</h1>
      <div class="filete"></div>
      <p class="lede">
        Cuestionario de diez preguntas. No hay respuestas correctas ni incorrectas; solo
        respuestas. Al terminar recibirá su clasificación. Se recuerda que el resultado es
        vinculante y que las respuestas se conservan.
      </p>
      <div class="legajo" id="examen"></div>
      <p style="margin-top:16px"><a href="#/sacramentos">← Volver a los Sacramentos</a></p>
    </article>
  `);
  const marco = raiz.querySelector('#examen') as HTMLElement;

  const hoy = new Date();
  const cabecera = (numero: number) => `
    <header class="hoja-exp-cabecera">
      <span>Registro de la Diócesis<br />Oficina del Diezmo</span>
      <span>Expediente ${numero}<br />${hoy.getDate()} · ${MESES[hoy.getMonth()]} · ${hoy.getFullYear()}</span>
    </header>`;
  // Cada presentación abre expediente nuevo. Los números de antes son de otros.
  let numero = 41207 + examenesPrevios() * 37;

  /** Las hojas que quedan debajo se ven por el canto. */
  const canto = (restantes: number) =>
    Array.from({ length: Math.min(4, restantes) }, (_, i) => {
      const d = (i + 1) * 3;
      return `${d}px ${d}px 0 -1px ${i % 2 ? '#c4b28a' : '#d2c29c'}`;
    })
      .concat('0 18px 30px -16px rgba(0, 0, 0, 0.95)', 'inset 0 0 44px rgba(110, 72, 34, 0.3)')
      .join(', ');

  const veredicto = () => {
    const vez = contarExamen();
    // Los ojos ganan solo si de verdad se miró varias veces: es el resultado raro.
    const orden = (Object.keys(puntos) as Perfil[]).sort((a, b) => puntos[b] - puntos[a]);
    let perfil = orden[0];
    if (perfil === 'ojos' && puntos.ojos < 5) perfil = orden[1];
    const v = VEREDICTOS[perfil];

    marco.innerHTML = `
      <section class="hoja-exp veredicto">
        ${cabecera(numero)}
        <div class="hoja-exp-folio">Resolución</div>
        <h3>${html(v.titulo)}</h3>
        <p>${html(v.texto)}</p>
        <div class="lacre" aria-hidden="true"><span>Registro</span></div>
        <div class="eyebrow" style="margin-top:22px">Lo que el Registro ya sabía</div>
        ${loQueSabe(vez)
          .map((l, i) => `<p class="mono a-maquina" style="--i:${i}">${html(l)}</p>`)
          .join('')}
        <footer class="hoja-exp-pie">Resolución vinculante. Archívese.</footer>
        <p style="margin-top:6px"><button type="button" id="repetir">Presentarse otra vez</button></p>
      </section>
    `;
    marco.querySelector('#repetir')?.addEventListener('click', () => {
      for (const clave of Object.keys(puntos) as Perfil[]) puntos[clave] = 0;
      indice = 0;
      numero = 41207 + examenesPrevios() * 37;
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
      <section class="hoja-exp pregunta" style="box-shadow:${canto(PREGUNTAS.length - indice - 1)}">
        ${cabecera(numero)}
        <div class="hoja-exp-folio">Pregunta ${ROMANOS[indice]} de ${ROMANOS[PREGUNTAS.length - 1]}</div>
        <h3>${html(p.texto)}</h3>
        <div class="opciones">
          ${p.opciones
            .map(
              (o, i) =>
                `<button type="button" data-i="${i}"><span class="casilla" aria-hidden="true"></span><span>${html(o.texto)}</span></button>`,
            )
            .join('')}
        </div>
        <footer class="hoja-exp-pie">Rellénese a tinta. No se admiten enmiendas.</footer>
      </section>
    `;
    const hoja = marco.querySelector('.hoja-exp') as HTMLElement;
    const botones = [...marco.querySelectorAll<HTMLButtonElement>('button[data-i]')];
    for (const boton of botones) {
      boton.addEventListener('click', () => {
        // Marcar es definitivo: la tinta no se borra.
        for (const b of botones) b.disabled = true;
        boton.classList.add('marcada');
        const opcion = p.opciones[Number(boton.dataset.i)];
        for (const [perfil, n] of Object.entries(opcion.suma) as [Perfil, number][]) {
          puntos[perfil] += n;
        }
        indice += 1;
        if (QUIETO) {
          temporizador = window.setTimeout(preguntar, 250);
          return;
        }
        temporizador = window.setTimeout(() => {
          hoja.classList.add('pasando-hoja');
          temporizador = window.setTimeout(preguntar, 360);
        }, 480);
      });
    }
  };

  contenedor.append(raiz);
  preguntar();
  return () => window.clearTimeout(temporizador);
}
