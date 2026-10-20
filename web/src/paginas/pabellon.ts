/**
 * Pabellón 9: el Libro de Diezmos de un pabellón del Atrio (issue #79).
 *
 * El resto del portal habla del Vientre desde arriba: la doctrina, el Registro,
 * el plano, el organigrama. Aquí se baja al suelo de la gente. Un pabellón son
 * cuarenta casas que comparten cuota y responden juntas por ella, y lo que el
 * bible cuenta de la vida diaria (la dirección de hospital, la vela que se
 * pellizca, la Piedra Tibia, el Muro de los Dientes, la Letanía) se descubre
 * usándolo, no leyéndolo en una lista de "prácticas culturales".
 *
 * Es el pabellón de la niña. Su casa es la camilla 22 y su historia está en el
 * Libro como la escribiría un Decano: en notas secas, con fecha de jornada. La
 * jornada que se recorre es la de Tomás, el cerero de la camilla 14, LA VISPERA
 * del sacramento: lo que él vive de pasada es lo que a la casa de la 22 le
 * cambia la vida.
 *
 * Lo que el visitante ha jugado se nota (Memoria): con el cierre del juego, el
 * Registro asienta el saldo; con la cinematica (hito `nina`), el Colegio lo
 * suspende, la cuota del pabellón entero vuelve a no estar cubierta y llega el
 * aviso de la Sala vacía. Es el ethos del mundo dicho con una consecuencia: si
 * una casa falla, deben todas.
 *
 * Voz: la del Decano y la de la Diócesis, como todo el portal. No explica; anota.
 */

import { descensoAbierto, hitoAbierto } from '../memoria';
import { elemento, html } from '../texto';

type Estado =
  'corriente' | 'decano' | 'deudora' | 'cosida' | 'subio' | 'reformado' | 'seguimiento' | 'vacia';

interface Casa {
  camilla: number;
  oficio: string;
  estado: Estado;
  /** Lo que la casa aporta a la cuota, dicho como lo apunta el Decano. */
  aporte: string;
  /** Notas del Decano. */
  notas: readonly string[];
  /** Quién vive, si el Decano lo apunta. */
  inscritos?: string;
}

/** Lo que el Decano escribe junto al número, en la leyenda y en la ficha. */
const ESTADOS: Readonly<Record<Estado, string>> = {
  corriente: 'al día con la carne',
  decano: 'casa del Decano',
  deudora: 'debe carne',
  cosida: 'casa cosida',
  subio: 'subió uno de los suyos',
  reformado: 'un Reformado en la casa',
  seguimiento: 'en seguimiento',
  vacia: 'sin casa',
};

/**
 * Las casas que tienen algo que contar. Ninguna es inventada por adorno: cada
 * una es una práctica, una ley o un personaje del bible puesta en una
 * dirección. El resto del pabellón está al día y el Decano no escribe nada más.
 */
const CASAS_CON_NOTA: readonly Casa[] = [
  {
    camilla: 1,
    oficio: 'Decano del pabellón',
    estado: 'decano',
    aporte: 'lo que le toca, como todas',
    notas: ['Lleva este Libro. Responde ante el Colegio por las cuarenta casas, la suya incluida.'],
  },
  {
    camilla: 3,
    oficio: 'hongueros',
    estado: 'corriente',
    aporte: 'Hongo de Lámpara para la capilla',
    notas: [
      'Cultivan en las terrazas del Atrio. La capilla cuenta el día por el brillo de su hongo, y este Libro también.',
    ],
  },
  {
    camilla: 6,
    oficio: 'carpinteros',
    estado: 'cosida',
    aporte: 'una cuota, por dos casas',
    notas: [
      'Cosida con la camilla 7 este ciclo. Desde la costura el Libro las escribe con un solo número, el 6, y comparten cuota.',
      'Nadie se cose con una casa que debe carne. Las dos estaban al día.',
    ],
  },
  {
    camilla: 7,
    oficio: 'suturadores',
    estado: 'cosida',
    aporte: 'véase camilla 6',
    notas: ['Véase camilla 6.'],
  },
  {
    camilla: 9,
    oficio: 'herreros-reliquieros',
    estado: 'corriente',
    aporte: 'engaste de oro para la capilla',
    notas: [
      'El menor de la casa pasó el Primer Tacto este ciclo. Diente engastado en el Muro de la capilla, palma tocada. Ya consta.',
    ],
  },
  {
    camilla: 11,
    oficio: 'cereros',
    estado: 'subio',
    aporte: 'perdonado',
    notas: [
      'Subió una hija hace dos Hambres. La casa celebró la Cena de la Ausencia y se le perdonó la deuda; aquel ciclo el pabellón entero comió ración doble.',
      'La silla sigue en la mesa. No se pregunta por qué.',
    ],
  },
  {
    camilla: 14,
    oficio: 'cereros · Tomás',
    estado: 'corriente',
    aporte: 'velas de cera humana para la capilla y las mesas',
    notas: [
      'Tomás el cerero. Funde el sebo de diezmo y entrega las velas por la tarde. Al día con la carne.',
    ],
    inscritos: 'Tomás, los suyos y el abuelo, que nació en esta misma camilla.',
  },
  {
    camilla: 17,
    oficio: 'hongueros',
    estado: 'reformado',
    aporte: 'consta como pagada',
    notas: [
      'Un hijo Reformado en acto de sacramento, hace tres ciclos. No se autorizan visitas: la casa lo honra desde el Atrio.',
    ],
  },
  {
    camilla: 19,
    oficio: 'porteadores',
    estado: 'corriente',
    aporte: 'jornales de porteo',
    notas: [
      'Inscribe a los suyos cada año, el primero de la cola. Once años en el sorteo y nunca le ha tocado. Lo cuenta casi con vergüenza.',
    ],
  },
  {
    camilla: 25,
    oficio: 'siervos de diezmo',
    estado: 'corriente',
    aporte: 'en jornales',
    notas: [
      'Casa sin carne que ofrecer. Paga con trabajo: dos de los suyos sirven en los pabellones altos, cargando y cocinando por otros.',
    ],
  },
  {
    camilla: 28,
    oficio: 'suturadores',
    estado: 'corriente',
    aporte: 'jornadas en las Salas',
    notas: [
      'Cose las heridas del pabellón y ayuda en las Salas los días de turno. Cosió las palmas de las camillas 6 y 7 con un punto de púa de Zarza.',
    ],
  },
  {
    camilla: 31,
    oficio: 'hongueros',
    estado: 'seguimiento',
    aporte: 'al día, por ahora',
    notas: [
      'En la lista de seguimiento del Atrio. Alguien de la casa pronunció en la plaza una palabra que el Códice no admite.',
      'Se le recuerda que quien retiene su diezmo le quita el mundo.',
    ],
  },
  {
    camilla: 33,
    oficio: 'porteadores',
    estado: 'corriente',
    aporte: 'en carga',
    notas: [
      'Media vida en la Senda. Lo que sube de la Intemperie a su espalda se le cuenta como aporte.',
    ],
  },
  {
    camilla: 36,
    oficio: 'tanteadores',
    estado: 'corriente',
    aporte: 'poco y a tiempo',
    notas: [
      'Golpea el suelo con la vara de hierro antes de cada sala. Sabe qué baldosas están tibias.',
    ],
  },
  {
    camilla: 38,
    oficio: 'auxiliares de cripta',
    estado: 'corriente',
    aporte: 'jornadas en las Criptas',
    notas: [
      'Una hija auxiliar en las Criptas de Espera: baja la víspera de cada turno a administrar la dosis. Con el Hambre, esta semana ha bajado tres veces.',
    ],
  },
  {
    camilla: 40,
    oficio: '—',
    estado: 'vacia',
    aporte: '—',
    notas: ['Casa extinguida. La camilla espera a la próxima casa que se cosa.'],
  },
];

/** La casa de la niña. Su ficha se escribe aparte porque cambia. */
const CAMILLA_NINA = 22;

/** Oficios para las casas sin nota, en el orden en que el Decano las lista. */
const OFICIOS = [
  'cereros',
  'hongueros',
  'suturadores',
  'porteadores',
  'carpinteros',
  'herreros-reliquieros',
  'tanteadores',
] as const;

function casa(camilla: number): Casa {
  const conNota = CASAS_CON_NOTA.find((c) => c.camilla === camilla);
  if (conNota) return conNota;
  if (camilla === CAMILLA_NINA) {
    return {
      camilla,
      oficio: 'recolección de Mata de Retazos',
      estado: 'deudora',
      aporte: 'no cubre la cuota',
      notas: [],
      inscritos: 'tres. Una de ellas, hija.',
    };
  }
  return {
    camilla,
    oficio: OFICIOS[camilla % OFICIOS.length],
    estado: 'corriente',
    aporte: 'su parte',
    notas: ['Al corriente.'],
  };
}

// -- La camilla 22 ----------------------------------------------------------------

interface Asiento {
  cuando: string;
  texto: string;
  /** Asiento aun no escrito para este visitante. */
  pendiente?: boolean;
}

/**
 * Lo que el Libro dice de la casa de la niña. Los cuatro primeros asientos son
 * de antes del sacramento y se leen siempre: es lo que cualquier vecino sabe.
 * El quinto lo escribe el Registro al alba y el sexto, el Colegio: se leen
 * cuando el visitante ha llegado ahí jugando.
 */
function asientosDeLaNina(): Asiento[] {
  const asientos: Asiento[] = [
    {
      cuando: 'Tres días antes',
      texto: 'El Colegio declara un Hambre y sube la cuota. La casa no llega a cubrir la suya.',
    },
    {
      cuando: 'Dos días antes',
      texto: 'Se comunica a la casa que debe carne. Entra en el sorteo extraordinario.',
    },
    {
      cuando: 'La víspera',
      texto:
        'La hija se presenta sola en la Oficina del Diezmo, antes del sorteo, y firma la deuda de su casa de su puño. El Registro la acepta sin número de sorteo y la asienta en la hoja de mañana. La casa sale del sorteo.',
    },
    {
      cuando: 'La víspera, a la cena',
      texto: 'Cena de la Ausencia. Flor de Hueso sobre el asiento.',
    },
  ];
  if (descensoAbierto()) {
    asientos.push({
      cuando: 'La mañana',
      texto:
        'El Registro trae la línea sin número: Sala de Sacramento N.º 7. Se da por saldada la deuda de la casa y la parte que el pabellón no cubría.',
    });
  } else {
    asientos.push({
      cuando: 'La mañana',
      texto: 'Pendiente de confirmación del Registro.',
      pendiente: true,
    });
  }
  if (hitoAbierto('nina')) {
    asientos.push({
      cuando: 'Al cierre del turno',
      texto:
        'Por orden del Colegio se suspende el saldo: la ofrenda no consta en la Sala. Se retira la Flor de Hueso del asiento hasta nueva orden.',
    });
  }
  return asientos;
}

// -- La jornada -------------------------------------------------------------------

type ClaveMomento = 'alba' | 'taller' | 'mediodia' | 'entrega' | 'cena' | 'noche';

interface Momento {
  clave: ClaveMomento;
  hora: string;
  titulo: string;
  texto: string;
}

/** La víspera, contada desde la camilla 14. Sale del "día típico" del bible. */
const JORNADA: readonly Momento[] = [
  {
    clave: 'alba',
    hora: 'Al alba',
    titulo: 'El Latido',
    texto:
      'Tomás se despierta con el Latido, un temblor lejano que mueve el agua de los cuencos y marca el principio de la jornada para toda la ciudad. Desde hace tres días va más deprisa: el Colegio ha declarado un Hambre. Se pone la bata de faena y deja el primer bocado del pan en el borde del plato. Ese es para el Hambre.',
  },
  {
    clave: 'taller',
    hora: 'Por la mañana',
    titulo: 'El taller',
    texto:
      'Va al taller por pasillos de azulejo blanco, bajo vidrieras que son pantallas muertas y todavía parpadean. Funde sebo de diezmo, la grasa del tejido que el sacramento rechaza, cuela la cera y moldea velas con la soltura con que otro amasaría pan.',
  },
  {
    clave: 'mediodia',
    hora: 'A mediodía',
    titulo: 'La Piedra Tibia',
    texto:
      'Pasa por la capilla del pabellón. Debajo del Muro de los Dientes está la Piedra Tibia, un ducto cálido que llega hasta el fondo del Vientre. Los dioses no ven: conocen por el tacto. Por eso aquí se viene a que te toquen.',
  },
  {
    clave: 'entrega',
    hora: 'Por la tarde',
    titulo: 'La entrega',
    texto:
      'Lleva las velas a la Oficina, y el Decano anota el aporte. Las velas no son carne y no cubren la cuota, pero constan. En la Oficina solo se habla de una cosa: esta mañana la hija de la camilla 22 ha bajado sola a firmar.',
  },
  {
    clave: 'cena',
    hora: 'A la cena',
    titulo: 'La vela',
    texto:
      'Cena con los suyos a la luz de una vela de cera humana. Los niños cuentan los dientes que se les han caído. El abuelo suele repasar en voz baja quién del pabellón salió en el último sorteo; esta noche no hace falta, porque desde el pasillo se oye la Cena de la Ausencia de la camilla 22. Para acabar la cena hay que apagar la vela.',
  },
  {
    clave: 'noche',
    hora: 'Antes de dormir',
    titulo: 'La Letanía',
    texto: 'Reza la Letanía de los Mil, en voz baja, como cada noche.',
  },
];

const LETANIA = [
  'Coro del Pliegue, que piensas por nosotros, tócanos.',
  'Penitente, que latiendo nos cuentas los días, tócanos.',
  'Gran Hambre, que nunca te sacias, tócanos.',
  'Madre Escriba, que escribiste a ciegas, ruega por nosotros.',
  'Por la carne que dimos y la que deberemos,',
  'por los subidos y por los apagados:',
  'ojos al suelo, palma al frente;',
  'que nos toquen, y seremos.',
];

/** Cuántas velas salen de una mañana de taller. */
const VELAS_DE_LA_JORNADA = 12;

// -- Lo que el visitante hizo en el pabellón ----------------------------------------

interface Huella {
  velas: number;
  entregadas: number;
  soplo: boolean;
}

const CLAVE_HUELLA = 'diocesis.pabellon9';

function leerHuella(): Huella {
  try {
    const crudo = localStorage.getItem(CLAVE_HUELLA);
    const datos = crudo ? (JSON.parse(crudo) as Partial<Huella>) : {};
    return {
      velas: Number(datos.velas) || 0,
      entregadas: Number(datos.entregadas) || 0,
      soplo: datos.soplo === true,
    };
  } catch {
    return { velas: 0, entregadas: 0, soplo: false };
  }
}

function guardarHuella(huella: Huella): void {
  try {
    localStorage.setItem(CLAVE_HUELLA, JSON.stringify(huella));
  } catch {
    // Sin almacenamiento, el pabellón no recuerda. No pasa nada.
  }
}

// -- La cuota -------------------------------------------------------------------------

type EstadoCuota = 'falta' | 'cubierta' | 'suspenso';

function estadoCuota(): EstadoCuota {
  if (hitoAbierto('nina')) return 'suspenso';
  if (descensoAbierto()) return 'cubierta';
  return 'falta';
}

const TEXTO_CUOTA: Readonly<Record<EstadoCuota, string>> = {
  falta:
    'Hambre declarado. Este ciclo la cuota es doble y la cubren las cuarenta casas juntas. Falta la parte de una.',
  cubierta:
    'Cuota cubierta. La camilla 22 saldó la deuda de su casa y la parte que el pabellón no llegaba a pagar. Este ciclo la ración del pabellón va doble.',
  suspenso:
    'Cuota en suspenso. Mientras el Colegio no confirme el sacramento de la camilla 22, el pabellón vuelve a figurar como no cubierto: las cuarenta casas entran en el próximo sorteo.',
};

// -- La página ------------------------------------------------------------------------

export function renderPabellon(contenedor: HTMLElement): () => void {
  const huella = leerHuella();
  const cuota = estadoCuota();
  const alarma = hitoAbierto('nina');
  const temporizadores: number[] = [];

  const celdas = Array.from({ length: 40 }, (_, i) => {
    const n = i + 1;
    const estado = n === CAMILLA_NINA ? 'deudora' : casa(n).estado;
    const deCuota =
      cuota === 'suspenso'
        ? 'suspenso'
        : cuota === 'falta' && n === CAMILLA_NINA
          ? 'falta'
          : 'cubierta';
    return { n, estado, deCuota };
  });

  const raiz = elemento(`
    <article class="pabellon ${alarma ? 'en-alarma' : ''}">
      <div class="eyebrow">Atención al fiel · Libro de Diezmos</div>
      <h1>Pabellón 9</h1>
      <p class="pabellon-lema">Si una casa falla, deben todas.</p>
      <div class="filete"></div>
      <p class="lede">
        Libro del Pabellón 9 del Atrio, abierto a consulta de las casas que lo forman. Cuarenta
        casas, una cuota. El Decano anota lo que aporta cada una y lo que debe, y responde ante el
        Colegio por el total. Las casas se nombran por su dirección: si busca un apellido, aquí no
        lo va a encontrar.
      </p>

      ${
        alarma
          ? `<aside class="aviso-colegio documento" role="note">
        <div class="eyebrow">Aviso del Colegio a todos los pabellones</div>
        <p>
          Al cierre del turno, la Sala de Sacramento N.º 7 se encontró vacía. Ni la ofrenda ni las
          Manos del Sacramento N.º 7 constan en ninguna capa. El Latido se ha acelerado en todo el
          Vientre.
        </p>
        <p>
          El fiel que vea a las Manos fuera de su Sala lo comunicará a su Decano. No se le dirige
          la palabra. Ojos al suelo, palma al frente.
        </p>
        <p class="firma">Por la Vestal Mayor, una Vestal de Registro.</p>
      </aside>`
          : ''
      }

      <section class="seccion cuota cuota-${cuota}">
        <div class="eyebrow">La cuota del ciclo</div>
        <div class="cuota-barra" role="img" aria-label="Cuota del pabellón: ${html(TEXTO_CUOTA[cuota])}">
          ${celdas.map((c) => `<span class="cuota-parte parte-${c.deCuota}" title="camilla ${c.n}"></span>`).join('')}
        </div>
        <p>${html(TEXTO_CUOTA[cuota])}</p>
        <button type="button" class="salto ir-22"><span class="flecha">→</span><b>Pabellón 9, camilla 22</b><span class="verbo"> · ${html(cuota === 'falta' ? 'debe carne' : cuota === 'cubierta' ? 'saldada' : 'en suspenso')}</span></button>
      </section>

      <section class="seccion">
        <div class="eyebrow">El pabellón</div>
        <p class="pabellon-guia">
          Pulse una camilla para leer su línea del Libro. A un extremo, la capilla; al otro, la
          Oficina del Decano.
        </p>
        <div class="linaje pabellon-vista">
          <div class="linaje-lienzo">
            <div class="plano-pabellon" data-momento="alba">
              <button type="button" class="lugar" data-lugar="capilla">
                <span class="lugar-icono" aria-hidden="true"></span>Capilla
              </button>
              <div class="sala-camillas">
                <div class="fila-camillas">
                  ${celdas
                    .slice(0, 20)
                    .map((c) => alveolo(c.n, c.estado))
                    .join('')}
                </div>
                <div class="pasillo" aria-hidden="true"><span>pasillo de azulejo</span></div>
                <div class="fila-camillas">
                  ${celdas
                    .slice(20)
                    .map((c) => alveolo(c.n, c.estado))
                    .join('')}
                </div>
              </div>
              <button type="button" class="lugar" data-lugar="oficina">
                <span class="lugar-icono" aria-hidden="true"></span>Oficina
              </button>
            </div>
          </div>
          <aside class="linaje-panel" id="libro-panel" aria-live="polite"></aside>
        </div>
        <div class="leyenda">
          <span>${ESTADOS.corriente}</span>
          <span class="l-deudora">${ESTADOS.deudora}</span>
          <span class="l-cosida">${ESTADOS.cosida}</span>
          <span class="l-subio">${ESTADOS.subio}</span>
          <span class="l-seguimiento">${ESTADOS.seguimiento}</span>
        </div>
      </section>

      <section class="seccion jornada">
        <div class="eyebrow">Una jornada en el pabellón · la víspera</div>
        <h2>Tomás, camilla 14</h2>
        <div class="momentos" role="tablist" aria-label="Momentos de la jornada">
          ${JORNADA.map(
            (m, i) =>
              `<button type="button" role="tab" class="momento" data-momento="${m.clave}" aria-selected="${i === 0}">
                <span class="momento-hora">${html(m.hora)}</span>${html(m.titulo)}
              </button>`,
          ).join('')}
        </div>
        <div class="momento-cuerpo documento" id="momento-cuerpo" role="tabpanel" aria-live="polite"></div>
      </section>
    </article>
  `);

  const plano = raiz.querySelector('.plano-pabellon') as HTMLElement;
  const panel = raiz.querySelector('#libro-panel') as HTMLElement;
  const cuerpo = raiz.querySelector('#momento-cuerpo') as HTMLElement;

  // -- El Libro ------------------------------------------------------------------

  const marcar = (id: string) => {
    for (const boton of plano.querySelectorAll<HTMLElement>('[data-camilla], [data-lugar]')) {
      const suyo = boton.dataset.camilla === id || boton.dataset.lugar === id;
      boton.classList.toggle('activo', suyo);
      boton.setAttribute('aria-pressed', String(suyo));
    }
  };

  const mostrarCasa = (n: number) => {
    marcar(String(n));
    const c = casa(n);
    const direccion = `Pabellón 9, camilla ${n}`;

    if (n === CAMILLA_NINA) {
      const sello =
        cuota === 'falta'
          ? '<span class="sello-libro deuda">Debe carne</span>'
          : cuota === 'cubierta'
            ? '<span class="sello-libro saldada">Saldada</span>'
            : '<span class="sello-libro saldada tachada">Saldada</span><span class="sello-libro suspenso">En suspenso</span>';
      panel.innerHTML = `
        <div class="eyebrow">Libro de Diezmos</div>
        <h3>${html(direccion)}</h3>
        <div class="rango-texto">${html(c.oficio)}</div>
        <div class="sellos-libro">${sello}</div>
        <p><b>Inscritos.</b> ${html(c.inscritos ?? '')}</p>
        <ol class="asientos">
          ${asientosDeLaNina()
            .map(
              (a) =>
                `<li class="${a.pendiente ? 'pendiente' : ''}"><span class="asiento-cuando">${html(a.cuando)}</span>${html(a.texto)}</li>`,
            )
            .join('')}
        </ol>
        ${
          descensoAbierto()
            ? ''
            : '<p class="rango-texto">El resto del asiento se habilita a quien ha descendido.</p>'
        }
      `;
      return;
    }

    const notas = [...c.notas];
    if (n === 14) {
      if (huella.entregadas > 0) {
        notas.push(`Aporte de la víspera: ${huella.entregadas} velas, entregadas por la tarde.`);
      }
      if (huella.soplo) {
        notas.push(
          'Amonestación: vela de cera humana apagada con el aliento. Cuota extra a la casa.',
        );
      }
    }

    panel.innerHTML = `
      <div class="eyebrow">Libro de Diezmos</div>
      <h3>${html(direccion)}</h3>
      <div class="rango-texto">${html(c.oficio)} · ${html(ESTADOS[c.estado])}</div>
      <p><b>Aporte.</b> ${html(c.aporte)}</p>
      ${c.inscritos ? `<p><b>Inscritos.</b> ${html(c.inscritos)}</p>` : ''}
      ${notas.map((t) => `<p class="nota-decano">${html(t)}</p>`).join('')}
      ${
        c.estado === 'cosida'
          ? `<button type="button" class="salto" data-ir="${n === 6 ? 7 : 6}"><span class="flecha">→</span><b>Camilla ${n === 6 ? 7 : 6}</b><span class="verbo"> · la otra mitad de la costura</span></button>`
          : ''
      }
    `;
    for (const boton of panel.querySelectorAll<HTMLButtonElement>('.salto[data-ir]')) {
      boton.addEventListener('click', () => mostrarCasa(Number(boton.dataset.ir)));
    }
  };

  const mostrarCapilla = () => {
    marcar('capilla');
    const dientes = Array.from({ length: 39 }, (_, i) => {
      const n = i + 1;
      const suyo = n === CAMILLA_NINA;
      return `<span class="diente ${suyo ? 'diente-22' : ''}" title="camilla ${n}"></span>`;
    }).join('');
    panel.innerHTML = `
      <div class="eyebrow">Capilla del pabellón</div>
      <h3>El Muro de los Dientes</h3>
      <div class="muro-dientes" aria-hidden="true">${dientes}</div>
      <p>
        Cada niño del pabellón deja aquí su primer diente, engastado en oro, el día de su Primer
        Tacto. Ese día un Cirujano-Sacerdote le traza en la palma una incisión fina como un cabello
        y le apoya la mano en la Piedra Tibia. Desde entonces está tocado y consta en el Libro.
      </p>
      <p>
        El Muro es archivo, mosaico y árbol de familia. Treinta y nueve casas tienen diente; la 40
        ya no tiene casa.
      </p>
      <p class="nota-decano">El de la camilla 22 está en la tercera fila. Nadie lo ha quitado.</p>
    `;
  };

  const mostrarOficina = () => {
    marcar('oficina');
    const avisos = [
      'Próximo sorteo: el jueves. Por motivos de aforo, a puerta cerrada.',
      ...(huella.soplo ? ['Camilla 14: cuota extra por una vela apagada con el aliento.'] : []),
      ...(alarma ? ['Libro intervenido por el Colegio hasta nueva orden.'] : []),
    ];
    panel.innerHTML = `
      <div class="eyebrow">Oficina del Decano</div>
      <h3>El Libro de Diezmos</h3>
      <p>
        Aquí se lleva la cuenta del pabellón: lo que aporta cada casa, lo que debe y quién entra en
        el sorteo. Las cuarenta casas responden juntas por la cuota. Por eso todos vigilan a todos,
        y nadie se siente verdugo.
      </p>
      <p>
        No hay cárcel. La falta se paga en carne: una cuota extra a la casa, o un turno en el
        sorteo.
      </p>
      <div class="rango-texto" style="margin-top:14px">En el tablón</div>
      <ul>${avisos.map((a) => `<li>${html(a)}</li>`).join('')}</ul>
    `;
  };

  for (const boton of plano.querySelectorAll<HTMLButtonElement>('[data-camilla]')) {
    boton.addEventListener('click', () => mostrarCasa(Number(boton.dataset.camilla)));
  }
  plano.querySelector('[data-lugar="capilla"]')?.addEventListener('click', () => mostrarCapilla());
  plano.querySelector('[data-lugar="oficina"]')?.addEventListener('click', () => mostrarOficina());
  raiz.querySelector('.ir-22')?.addEventListener('click', () => {
    mostrarCasa(CAMILLA_NINA);
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  // -- La jornada ----------------------------------------------------------------

  const limpiarTemporizadores = () => {
    for (const t of temporizadores.splice(0)) window.clearTimeout(t);
  };

  const pintarMomento = (clave: ClaveMomento) => {
    limpiarTemporizadores();
    const momento = JORNADA.find((m) => m.clave === clave) ?? JORNADA[0];
    plano.dataset.momento = clave;
    for (const boton of raiz.querySelectorAll<HTMLButtonElement>('.momento')) {
      boton.setAttribute('aria-selected', String(boton.dataset.momento === clave));
    }

    cuerpo.innerHTML = `
      <div class="eyebrow">${html(momento.hora)}</div>
      <h3>${html(momento.titulo)}</h3>
      <p>${html(momento.texto)}</p>
      <div class="momento-gesto"></div>
    `;
    const gesto = cuerpo.querySelector('.momento-gesto') as HTMLElement;

    switch (clave) {
      case 'alba':
        gesto.innerHTML = `<div class="cuenco" aria-hidden="true"><span></span><span></span></div>
          <p class="gesto-nota">El agua del cuenco, al ritmo del Latido.</p>`;
        break;

      case 'taller': {
        const pintar = () => {
          gesto.innerHTML = `
            <div class="velas-hechas" aria-hidden="true">${'<span class="vela-hecha"></span>'.repeat(huella.velas)}</div>
            <p class="gesto-nota">${huella.velas} de ${VELAS_DE_LA_JORNADA} velas.</p>
            <button type="button" class="boton" ${huella.velas >= VELAS_DE_LA_JORNADA ? 'disabled' : ''}>Moldear una vela</button>`;
          gesto.querySelector('button')?.addEventListener('click', () => {
            huella.velas = Math.min(VELAS_DE_LA_JORNADA, huella.velas + 1);
            guardarHuella(huella);
            pintar();
          });
        };
        pintar();
        break;
      }

      case 'mediodia': {
        gesto.innerHTML = `
          <button type="button" class="boton piedra-tibia"><span class="piedra-calor" aria-hidden="true"></span>Apoyar la palma en la Piedra Tibia</button>
          <p class="gesto-nota">Mantenga la palma apoyada.</p>
          <div class="piedra-respuesta"></div>`;
        const boton = gesto.querySelector('button') as HTMLButtonElement;
        const respuesta = gesto.querySelector('.piedra-respuesta') as HTMLElement;
        let espera = 0;
        const tocado = () => {
          boton.classList.remove('apoyada');
          boton.classList.add('tocada');
          respuesta.innerHTML = `
            <p>«Pabellón 9, camilla 14. Me tocas, luego soy.»</p>
            <p>Al salir se cruza con la vecina de la 6. Enfrentan las palmas:<br>
            —¿Te tocan?<br>—Me tocan.</p>
            <p class="nota-decano">${
              descensoAbierto()
                ? 'La Piedra también ha notado la suya. En su palma se lee que ha bajado.'
                : 'La suya, la Piedra no la reconoce. Una palma lisa es una persona que no consta.'
            }</p>`;
        };
        const apoyar = () => {
          if (boton.classList.contains('tocada')) return;
          boton.classList.add('apoyada');
          espera = window.setTimeout(tocado, 1400);
          temporizadores.push(espera);
        };
        const soltar = () => {
          if (boton.classList.contains('tocada')) return;
          boton.classList.remove('apoyada');
          window.clearTimeout(espera);
        };
        boton.addEventListener('pointerdown', apoyar);
        boton.addEventListener('pointerup', soltar);
        boton.addEventListener('pointerleave', soltar);
        // Con el teclado no se puede "mantener": la tecla vale como palma.
        boton.addEventListener('keydown', (evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            tocado();
          }
        });
        break;
      }

      case 'entrega': {
        const pintar = (mensaje = '') => {
          gesto.innerHTML = `
            <p class="gesto-nota">${
              huella.velas > 0
                ? `Lleva ${huella.velas} velas de la mañana.`
                : huella.entregadas > 0
                  ? `Constan ${huella.entregadas} velas entregadas.`
                  : 'No lleva velas: la mañana se le fue sin pasar por el taller.'
            }</p>
            <button type="button" class="boton" ${huella.velas > 0 ? '' : 'disabled'}>Entregar las velas al Decano</button>
            ${mensaje ? `<p class="nota-decano">${html(mensaje)}</p>` : ''}`;
          gesto.querySelector('button')?.addEventListener('click', () => {
            huella.entregadas += huella.velas;
            huella.velas = 0;
            guardarHuella(huella);
            mostrarCasa(14);
            pintar('Anotado. No es carne, pero consta.');
          });
        };
        pintar();
        break;
      }

      case 'cena': {
        gesto.innerHTML = `
          <div class="mesa" aria-hidden="true"><span class="pan"></span><span class="vela-mesa encendida"></span></div>
          <div class="opciones-cena">
            <button type="button" class="boton" data-gesto="bocado">Dejar el bocado del Hambre</button>
            <button type="button" class="boton" data-gesto="soplar">Soplar la vela</button>
            <button type="button" class="boton" data-gesto="pellizcar">Pellizcarla</button>
          </div>
          <p class="gesto-nota cena-respuesta"></p>`;
        const respuesta = gesto.querySelector('.cena-respuesta') as HTMLElement;
        const vela = gesto.querySelector('.vela-mesa') as HTMLElement;
        const pan = gesto.querySelector('.pan') as HTMLElement;
        for (const boton of gesto.querySelectorAll<HTMLButtonElement>('[data-gesto]')) {
          boton.addEventListener('click', () => {
            const cual = boton.dataset.gesto;
            if (cual === 'bocado') {
              pan.classList.add('mordido');
              respuesta.textContent =
                'El primer bocado, en el borde del plato. Es un diezmo pequeño: para los Viscerales.';
            } else if (cual === 'soplar') {
              huella.soplo = true;
              guardarHuella(huella);
              respuesta.textContent =
                'Nadie apaga una vela de cera humana con el aliento: sería soplar sobre un dios. El Decano lo sabrá por la mañana. Cuota extra a la casa.';
            } else {
              vela.classList.remove('encendida');
              respuesta.textContent = 'Con dos dedos, sin prisa. Así se apaga.';
              for (const b of gesto.querySelectorAll<HTMLButtonElement>('[data-gesto]')) {
                b.disabled = true;
              }
            }
          });
        }
        break;
      }

      case 'noche': {
        gesto.innerHTML = `
          <button type="button" class="boton">Rezar en voz baja</button>
          <div class="letania"></div>`;
        const boton = gesto.querySelector('button') as HTMLButtonElement;
        const letania = gesto.querySelector('.letania') as HTMLElement;
        boton.addEventListener('click', () => {
          boton.remove();
          LETANIA.forEach((verso, i) => {
            temporizadores.push(
              window.setTimeout(() => {
                letania.insertAdjacentHTML('beforeend', `<p class="verso">${html(verso)}</p>`);
              }, i * 1300),
            );
          });
          temporizadores.push(
            window.setTimeout(
              () => {
                letania.insertAdjacentHTML(
                  'beforeend',
                  `<p class="nota-decano">Se acuesta en la camilla donde nació su abuelo. Dos puertas más allá, la hija de la 22 no duerme en casa: esta noche está en las Criptas de Espera, con la dosis doble.</p>`,
                );
                plano.dataset.momento = 'apagado';
              },
              LETANIA.length * 1300 + 600,
            ),
          );
        });
        break;
      }
    }
  };

  for (const boton of raiz.querySelectorAll<HTMLButtonElement>('.momento')) {
    boton.addEventListener('click', () =>
      pintarMomento((boton.dataset.momento as ClaveMomento) ?? 'alba'),
    );
  }

  contenedor.append(raiz);

  // Se puede llegar a una casa concreta: `#/pabellon/22` (desde el Linaje).
  const pedida = Number(location.hash.match(/pabellon\/(\d+)/)?.[1]);
  mostrarCasa(pedida >= 1 && pedida <= 40 ? pedida : 14);
  pintarMomento('alba');

  return limpiarTemporizadores;
}

/** Una camilla del plano. El número y el estado; el resto, en el Libro. */
function alveolo(n: number, estado: Estado): string {
  return `<button type="button" class="alveolo est-${estado} ${n === CAMILLA_NINA ? 'es-22' : ''}" data-camilla="${n}" aria-pressed="false" aria-label="Camilla ${n}: ${ESTADOS[estado]}">
    <span class="alveolo-num">${n}</span><span class="alveolo-luz" aria-hidden="true"></span>
  </button>`;
}
