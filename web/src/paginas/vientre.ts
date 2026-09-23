/**
 * El Vientre: el mapa del edificio, no la lista de sus pisos.
 *
 * Antes esta página era un corte con seis capas apiladas, una debajo de otra,
 * y se pulsaba cada una como quien elige un nivel en un menú. Eso dejó de
 * describir el juego: el Vientre ya no se recorre por niveles, se recorre
 * como un sitio — salas conectadas entre sí, atajos que saltan una capa
 * entera, rutas que vuelven hacia arriba.
 *
 * La diferencia no es de dibujo, es de qué se puede afirmar. Una pila dice
 * "hay seis pisos y se bajan en orden". Un mapa dice "hay una forma de llegar
 * ahí, y probablemente más de una". El bible pide lo segundo: un solo edificio
 * cerrado donde "todo el mundo conocido cabe dentro de esta única estructura
 * sagrada", no un edificio con ascensor.
 *
 * SIGUE SIENDO VERTICAL. Las capas están, y bajar sigue siendo el eje: el eje
 * Y es la profundidad y los rótulos de capa se mantienen a la izquierda. Lo
 * que se añade es el eje X — salas al lado de otras salas — y los pasos que
 * no respetan el orden: un pozo del campanario al archivo, un conducto de
 * Genesis Vestal que baja tres capas de una vez.
 *
 * ESOS ATAJOS SON EL ARGUMENTO, no un adorno de diseño. La Diócesis cree que
 * el descenso es un sacramento ordenado, con turnos y registro. El edificio
 * dice otra cosa: está lleno de agujeros por los que se puede saltar el
 * trámite, y casi todos son tubería de la corporación que nadie ha cerrado en
 * tres generaciones.
 *
 * Lo que el visitante no se ha ganado bajando sale como sala sin nombre. El
 * Registro cataloga lo que existe, no lo que cada uno ha visto.
 */

import { VIENTRE } from '../../../src/lore/Vientre';
import { capaPisada, descensoAbierto } from '../memoria';
import { elemento, html } from '../texto';

type TipoSala = 'principal' | 'desvio' | 'sellada';
type Glifo =
  | 'cola'
  | 'ayuno'
  | 'campana'
  | 'sello'
  | 'terminal'
  | 'bombo'
  | 'camilla'
  | 'tuberia'
  | 'exvoto'
  | 'placa'
  | 'altar'
  | 'instrumental'
  | 'medio-cuerpo'
  | 'organo';
type TipoPaso = 'umbral' | 'escalera' | 'conducto' | 'pozo' | 'grieta';

interface Sala {
  id: string;
  nombre: string;
  /** Qué se dibuja dentro del cuadro. Ver GLIFOS. */
  glifo: Glifo;
  /** Índice en VIENTRE: de qué capa forma parte. */
  capa: number;
  tipo: TipoSala;
  x: number;
  ancho: number;
  descripcion: string;
}

interface Paso {
  de: string;
  a: string;
  tipo: TipoPaso;
  /** Qué es, dicho en una línea. Sale al pulsar cualquiera de sus dos salas. */
  nota: string;
}

/** Cómo se llama cada clase de paso en la leyenda y en el panel. */
const PASOS: Readonly<Record<TipoPaso, string>> = {
  umbral: 'umbral de turno',
  escalera: 'escalera',
  conducto: 'conducto de Genesis Vestal',
  pozo: 'pozo',
  grieta: 'grieta',
};

/**
 * Las salas.
 *
 * Nada inventado por conveniencia: los márgenes de los Ayunantes, el archivo
 * médico, los conductos de la corporación, el pozo de exvotos y la Sala 7 ya
 * estaban en el bible o en el propio juego. Lo nuevo es DÓNDE está cada una
 * respecto a las demás.
 */
const SALAS: readonly Sala[] = [
  // -- Capa I: el Atrio -----------------------------------------------------
  {
    id: 'plaza',
    glifo: 'cola',
    nombre: 'Plaza de inscripción',
    capa: 0,
    tipo: 'principal',
    x: 300,
    ancho: 150,
    descripcion:
      'Donde cada casa apunta a los suyos, una vez al año. Es la cara que la Diócesis enseña: mostrador, turnos y una cola que avanza sola. Todo lo demás del edificio está debajo de esta sala.',
  },
  {
    id: 'margenes',
    glifo: 'ayuno',
    nombre: 'Los márgenes',
    capa: 0,
    tipo: 'desvio',
    x: 90,
    ancho: 140,
    descripcion:
      'Donde viven los Ayunantes: los que se niegan a pagar diezmo y conservan el cuerpo entero, que aquí es la marca del paria. No están fuera del Vientre —no hay fuera—, están en el borde de la capa que menos vigila.',
  },
  {
    id: 'campanario',
    glifo: 'campana',
    nombre: 'El campanario',
    capa: 0,
    tipo: 'desvio',
    x: 520,
    ancho: 130,
    descripcion:
      'Arriba del todo, y por eso nadie sube: el sacramento va hacia abajo. Desde aquí cae un pozo de servicio que se salta la Oficina del Diezmo entera. Quien lo conoce no pasa por el mostrador.',
  },

  // -- Capa II: Pasillos de Preparación -------------------------------------
  {
    id: 'oficina',
    glifo: 'sello',
    nombre: 'Oficina del Diezmo',
    capa: 1,
    tipo: 'principal',
    x: 300,
    ancho: 150,
    descripcion:
      'La administración. Las deudas de una casa se saldan en carne de esa casa, y aquí se hace la cuenta. Piedra de arriba parcheada con chapa: la burocracia arregla lo que se rompe con lo que tiene a mano.',
  },
  {
    id: 'archivo',
    glifo: 'terminal',
    nombre: 'Archivo médico',
    capa: 1,
    tipo: 'desvio',
    x: 520,
    ancho: 140,
    descripcion:
      'Terminales que llevan generaciones escribiendo lo que miden, para nadie. De aquí se copió a mano lo que parecía importante; el resto se volvió escritura sagrada. El Códice está escrito encima de manuales como estos.',
  },
  {
    id: 'sorteos',
    glifo: 'bombo',
    nombre: 'Sala de sorteos',
    capa: 1,
    tipo: 'desvio',
    x: 90,
    ancho: 140,
    descripcion:
      'El Registro no elige: sortea, y por eso es justo. La sala está hecha para que se vea el bombo desde la puerta. Hoy hay una línea sin número, y nadie ha preguntado por qué.',
  },

  // -- Capa III: Criptas de Espera ------------------------------------------
  {
    id: 'espera',
    glifo: 'camilla',
    nombre: 'Galería de espera',
    capa: 2,
    tipo: 'principal',
    x: 300,
    ancho: 150,
    descripcion:
      'Filas de camillas con sus correas y su gotero. Nadie grita aquí: la dosis se administra la víspera. El Códice lo llama piedad, y en cierto modo lo es.',
  },
  {
    id: 'conductos',
    glifo: 'tuberia',
    nombre: 'Conductos',
    capa: 2,
    tipo: 'desvio',
    x: 540,
    ancho: 150,
    descripcion:
      'La tubería que Genesis Vestal tendió hace tres generaciones, y que sigue funcionando porque nadie sabe apagarla. Sedante hacia arriba, fluido hacia abajo. Atraviesa el edificio entero: por dentro se baja sin pasar por ningún turno.',
  },
  {
    id: 'exvotos',
    glifo: 'exvoto',
    nombre: 'Pozo de exvotos',
    capa: 2,
    tipo: 'desvio',
    x: 80,
    ancho: 150,
    descripcion:
      'Ofrendas de sacramentos completos, colgadas por los que subieron. Al fondo del pozo no hay más exvotos: hay una boca que da a los quirófanos en desuso, dos capas más abajo.',
  },

  // -- Capa IV: Salas de Sacramento -----------------------------------------
  {
    id: 'antesala',
    glifo: 'placa',
    nombre: 'Antesala',
    capa: 3,
    tipo: 'principal',
    x: 300,
    ancho: 150,
    descripcion:
      'Las placas del Registro están aquí, antes de entrar, para que se lean de pie y no en mitad del sacramento. Entrada por orden. Sin excepciones.',
  },
  {
    id: 'sala7',
    glifo: 'altar',
    nombre: 'Sala 7',
    capa: 3,
    tipo: 'principal',
    x: 520,
    ancho: 140,
    descripcion:
      'Quirófano convertido en altar. Aquí ya no queda piedra: la máquina no se disimula, es el altar. Es la sala de las Manos del Sacramento número siete, y las Manos anteriores siguen dentro.',
  },
  {
    id: 'quirofanos',
    glifo: 'instrumental',
    nombre: 'Quirófanos en desuso',
    capa: 3,
    tipo: 'desvio',
    x: 90,
    ancho: 160,
    descripcion:
      'Salas que se cerraron cuando dejó de haber Manos para todas. El instrumental sigue puesto. Es el sitio por donde se entra a la capa sin pasar por la antesala, y por tanto sin turno.',
  },

  // -- Capas V y VI: lo que no se visita ------------------------------------
  {
    id: 'reformados',
    glifo: 'medio-cuerpo',
    nombre: 'Niveles Reformados',
    capa: 4,
    tipo: 'sellada',
    x: 300,
    ancho: 200,
    descripcion:
      'Donde se guarda a los Elegidos que no se completaron. La doctrina dice que se les honra; la arquitectura dice dónde. De esta capa hacia abajo el edificio ya es carne.',
  },
  {
    id: 'santuario',
    glifo: 'organo',
    nombre: 'El Santuario',
    capa: 5,
    tipo: 'sellada',
    x: 300,
    ancho: 200,
    descripcion:
      'Los Mil, sin forma humana reconocible, cada uno colapsado hacia el órgano que ganó. Ninguno tiene ojos y el pueblo no los ha visto jamás: existen para el fiel solo a través de la doctrina.',
  },
];

/**
 * Los pasos.
 *
 * Hay más de un camino a casi todo, y tres de ellos —el pozo del campanario,
 * el conducto y la boca del pozo de exvotos— se saltan capas enteras. Esa es
 * la diferencia entre un edificio y una lista de pisos.
 */
const CAMINOS: readonly Paso[] = [
  {
    de: 'plaza',
    a: 'margenes',
    tipo: 'grieta',
    nota: 'Un boquete que la Diócesis no ha tapado porque no reconoce que exista.',
  },
  {
    de: 'plaza',
    a: 'campanario',
    tipo: 'escalera',
    nota: 'Escalera de servicio. Sube, y el sacramento va hacia abajo: por eso está vacía.',
  },
  {
    de: 'plaza',
    a: 'oficina',
    tipo: 'umbral',
    nota: 'El umbral con turno. El camino que la Diócesis publica.',
  },
  {
    de: 'margenes',
    a: 'sorteos',
    tipo: 'grieta',
    nota: 'Los Ayunantes bajan por aquí cuando les toca mirar el bombo.',
  },
  {
    de: 'campanario',
    a: 'archivo',
    tipo: 'pozo',
    nota: 'Pozo de servicio: salta la Oficina del Diezmo entera. Quien lo conoce no pasa por el mostrador.',
  },
  { de: 'oficina', a: 'archivo', tipo: 'escalera', nota: 'Dos puertas del mismo pasillo.' },
  {
    de: 'oficina',
    a: 'sorteos',
    tipo: 'escalera',
    nota: 'La cola del sorteo desemboca en el mostrador.',
  },
  {
    de: 'oficina',
    a: 'espera',
    tipo: 'umbral',
    nota: 'Descenso solo con turno. Las Manos del Sacramento pasan sin turno.',
  },
  {
    de: 'archivo',
    a: 'conductos',
    tipo: 'conducto',
    nota: 'La tubería entra en el archivo por detrás de los terminales. Nadie la ha cerrado.',
  },
  {
    de: 'sorteos',
    a: 'exvotos',
    tipo: 'pozo',
    nota: 'Los exvotos se dejan caer desde arriba; el pozo baja con ellos.',
  },
  {
    de: 'espera',
    a: 'conductos',
    tipo: 'conducto',
    nota: 'El sedante llega a las camillas por aquí.',
  },
  {
    de: 'espera',
    a: 'exvotos',
    tipo: 'grieta',
    nota: 'La pared cedió hace años. Se tapó con una cortina.',
  },
  {
    de: 'espera',
    a: 'antesala',
    tipo: 'umbral',
    nota: 'Entrada a las Salas por orden de Registro.',
  },
  {
    de: 'conductos',
    a: 'sala7',
    tipo: 'conducto',
    nota: 'La tubería alimenta el altar directamente: entra en la Sala 7 sin pasar por la antesala.',
  },
  {
    de: 'exvotos',
    a: 'quirofanos',
    tipo: 'pozo',
    nota: 'Al fondo del pozo hay una boca que da a los quirófanos cerrados.',
  },
  { de: 'antesala', a: 'sala7', tipo: 'umbral', nota: 'La puerta de la sala. Se cruza una vez.' },
  {
    de: 'quirofanos',
    a: 'sala7',
    tipo: 'escalera',
    nota: 'Las salas cerradas comunican entre sí por dentro.',
  },
  {
    de: 'sala7',
    a: 'reformados',
    tipo: 'pozo',
    nota: 'Lo que no se completa baja. No hay puerta: hay desagüe.',
  },
  {
    de: 'conductos',
    a: 'reformados',
    tipo: 'conducto',
    nota: 'La tubería sigue bajando. Tres capas de una vez.',
  },
  {
    de: 'reformados',
    a: 'santuario',
    tipo: 'conducto',
    nota: 'Del fondo no vuelve nada, así que nadie sabe cómo es este tramo.',
  },
];

/**
 * El pictograma de cada sala, en un cuadro de 24 x 24.
 *
 * Por qué dibujados y no iconos de una librería: el portal entero es tinta
 * sobre folio y una librería de iconos mete otro idioma visual — esquinas
 * redondeadas, grosores parejos, geometría de aplicación. Estos son trazos de
 * plumilla, como el resto del sitio, y además pesan cero.
 *
 * Cada uno dice el OFICIO de la sala, no su decoración: la plaza es una cola,
 * la oficina es un sello, los conductos son tubería. Quien mira el plano tiene
 * que saber para qué sirve cada cuarto sin leer el nombre — que es justo lo que
 * necesita quien todavía no se lo ha ganado y lo ve como "sala sin nombre".
 */
const GLIFOS: Readonly<Record<Glifo, string>> = {
  // Un mostrador con alguien a cada lado. Antes eran tres puntos sobre una
  // linea y se leia "ooo", no una cola.
  cola: '<path d="M2 13h20M5 13v7M19 13v7"/><circle cx="7" cy="6" r="2.2"/><path d="M7 8.5v4"/><circle cx="17" cy="6" r="2.2"/><path d="M17 8.5v4"/>',
  // Un cuenco boca abajo: el que no acepta lo que se le da. Antes era una
  // figura tachada y se leia "prohibido".
  ayuno: '<path d="M4 9h16a8 8 0 01-16 0z"/><path d="M12 9V4"/><path d="M4 20h16"/>',
  // Campana con badajo.
  campana:
    '<path d="M6 17c0-6 1-10 6-10s6 4 6 10z"/><path d="M4 17h16"/><circle cx="12" cy="20" r="1.6"/><path d="M12 7V4"/>',
  // Una balanza: "se pesara la ofrenda", que es lo que se hace en esa
  // oficina. Antes un sello que parecia una lampara.
  sello:
    '<path d="M12 4v16M8 20h8"/><path d="M4 8h16"/><path d="M4 8l-2 5a2.5 2.5 0 004 0zM20 8l-2 5a2.5 2.5 0 004 0z"/>',
  // Pantalla con una linea que sigue midiendo.
  terminal:
    '<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M6 12l3-4 2.5 5 2.5-7 2 6H18"/><path d="M9 21h6M12 17v4"/>',
  // Urna con papeletas. Antes un circulo con manivela que no decia nada.
  bombo:
    '<rect x="4" y="10" width="16" height="11" rx="1"/><path d="M8 10V6l3 1 1-3 1 3 3-1v4"/><path d="M10 15h4"/>',
  // Camilla con correa y gotero.
  camilla:
    '<path d="M2 13h16M4 13v6M16 13v6"/><rect x="5" y="9" width="10" height="4" rx="1"/><path d="M21 3v8M21 11a2 2 0 01-2 2"/>',
  // Dos tubos con su brida.
  tuberia:
    '<path d="M2 8h20M2 16h20"/><rect x="8" y="5" width="3" height="6"/><rect x="14" y="13" width="3" height="6"/>',
  // Ofrendas colgadas de una barra.
  exvoto:
    '<path d="M2 4h20"/><path d="M7 4v6M12 4v9M17 4v5"/><circle cx="7" cy="12" r="2"/><path d="M12 13l-2.5 4h5z"/><rect x="15" y="9" width="4" height="4"/>',
  // Placa atornillada a la pared.
  placa:
    '<rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="6" cy="9" r="0.9"/><circle cx="18" cy="9" r="0.9"/><path d="M7 13h10M7 16h6"/>',
  // Mesa de quirofano bajo la lampara.
  altar:
    '<circle cx="12" cy="4" r="2.4"/><path d="M12 6.5v3"/><path d="M3 14h18M6 14v6M18 14v6"/><rect x="7" y="10" width="10" height="4"/>',
  // Bisturi y pinzas cruzados.
  instrumental: '<path d="M4 20L16 6l3 2-11 14z"/><path d="M20 20l-6-8"/><path d="M14 4l3 3"/>',
  // Media figura: el sacramento que se quedo a la mitad.
  'medio-cuerpo':
    '<circle cx="12" cy="6" r="2.6"/><path d="M12 9v8M12 12l-5 3M12 17l-3 5"/><path d="M12 9v13" stroke-dasharray="2 2"/><path d="M12 12l5 3" stroke-dasharray="2 2"/>',
  // Una masa con su pulso: el organo que gano.
  organo:
    '<path d="M12 20s-8-5-8-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5-8 10-8 10z"/><path d="M4 12h4l1.5-3 2 6 1.5-3h7"/>',
};

/**
 * Lo que se dibuja cuando la sala aún no se ha ganado: un candado de folio.
 *
 * No se enseña su pictograma real. Diría para qué sirve el cuarto, y eso es
 * justo lo que la página no cuenta a quien no ha bajado.
 */
const GLIFO_SELLADO =
  '<rect x="6" y="10" width="12" height="9" rx="1"/><path d="M9 10V7a3 3 0 016 0v3"/>';

/**
 * El fondo de cada capa. Baja de la piedra del Atrio a la carne del fondo.
 *
 * La página anterior lo hacía y era su mejor idea: el sitio se oscurece según
 * se desciende, así que la profundidad se nota antes de leer un solo rótulo.
 * Se conserva tal cual — cambia el dibujo, no lo que el dibujo dice.
 */
const FONDO_CAPA = ['#5c4a3c', '#4a3a3a', '#3a2a33', '#2c1e2a', '#1e141f', '#140c16'];

const ANCHO = 760;
const ALTO_SALA = 58;
const MARGEN_SUPERIOR = 60;
const PASO_CAPA = 104;

function centro(sala: Sala): { x: number; y: number } {
  return { x: sala.x + sala.ancho / 2, y: MARGEN_SUPERIOR + sala.capa * PASO_CAPA };
}

/** Una sala se conoce si se pisó su capa, o si el descenso está abierto. */
function conocida(sala: Sala): boolean {
  if (descensoAbierto()) return true;
  const capa = VIENTRE[sala.capa];
  return capa?.escena !== null && capa?.escena !== undefined && capaPisada(capa.escena);
}

function svg(marca: string): SVGElement {
  const molde = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  molde.innerHTML = marca;
  return molde.firstElementChild as SVGElement;
}

export function renderVientre(contenedor: HTMLElement): void {
  const alto = MARGEN_SUPERIOR + VIENTRE.length * PASO_CAPA;
  const raiz = elemento(`
    <article>
      <div class="eyebrow">Corte del Vientre · capa III</div>
      <h1>Un solo edificio, y más de un camino</h1>
      <div class="filete"></div>
      <p class="lede">
        Plano informativo del templo, que se construyó hacia abajo. Recoge también los conductos,
        pozos y grietas de la instalación original que no se han cerrado; se ruega no utilizarlos.
        Pulse cualquier sala para ver su ficha, y sus salidas para moverse por el plano.
      </p>
      <div class="linaje">
        <div class="linaje-lienzo">
          <svg viewBox="0 0 ${ANCHO} ${alto}" role="img" aria-label="Mapa del Vientre"></svg>
        </div>
        <aside class="linaje-panel" id="sala-panel" aria-live="polite"></aside>
      </div>
      <div class="leyenda">
        <span>ruta con turno</span>
        <span class="l-origen">desvío</span>
        <span class="l-cerrado">no se visita</span>
        <span class="l-dios">conducto · pozo · grieta: se salta el trámite</span>
      </div>
    </article>
  `);

  const lienzo = raiz.querySelector('svg') as SVGSVGElement;
  const panel = raiz.querySelector('#sala-panel') as HTMLElement;
  const porId = new Map(SALAS.map((s) => [s.id, s]));

  // Las capas siguen ahí: una línea y su rótulo. El eje vertical es la
  // profundidad, y eso no lo cambia que ahora haya atajos.
  VIENTRE.forEach((capa, i) => {
    const y = MARGEN_SUPERIOR + i * PASO_CAPA - ALTO_SALA / 2 - 14;
    lienzo.append(
      svg(`<line class="nivel-linea" x1="0" y1="${y}" x2="${ANCHO}" y2="${y}"></line>`),
    );
    lienzo.append(
      svg(
        `<text class="nivel-rotulo" x="8" y="${y - 4}">${html(`${['I', 'II', 'III', 'IV', 'V', 'VI'][i]} · ${capa.nombre}`)}</text>`,
      ),
    );
  });

  // Los caminos, debajo de las salas. Los que saltan capa se dibujan aparte
  // para que se vean como lo que son: la excepción.
  const lineas = new Map<SVGElement, Paso>();
  for (const paso of CAMINOS) {
    const de = porId.get(paso.de);
    const a = porId.get(paso.a);
    if (!de || !a) continue;

    const p = centro(de);
    const q = centro(a);
    const salta = Math.abs(de.capa - a.capa) > 1;
    const mismaCapa = de.capa === a.capa;

    // Las que bajan salen por el canto de abajo y entran por el de arriba; las
    // de la misma capa se curvan por debajo para no cruzar los rótulos.
    const y1 = mismaCapa ? p.y : p.y + Math.sign(q.y - p.y) * (ALTO_SALA / 2);
    const y2 = mismaCapa ? q.y : q.y - Math.sign(q.y - p.y) * (ALTO_SALA / 2);
    const ruta = mismaCapa
      ? `M ${p.x} ${p.y + ALTO_SALA / 2} C ${p.x} ${p.y + 40}, ${q.x} ${q.y + 40}, ${q.x} ${q.y + ALTO_SALA / 2}`
      : `M ${p.x} ${y1} C ${p.x} ${(y1 + y2) / 2}, ${q.x} ${(y1 + y2) / 2}, ${q.x} ${y2}`;

    const linea = svg(
      `<path class="arista ${salta || paso.tipo === 'conducto' ? 'atajo' : ''}" d="${ruta}" data-de="${paso.de}" data-a="${paso.a}"></path>`,
    );
    lienzo.append(linea);
    lineas.set(linea, paso);
  }

  // Las salas, encima de los caminos.
  const grupos = new Map<string, SVGElement>();
  for (const sala of SALAS) {
    const c = centro(sala);
    const esta = conocida(sala);
    const g = svg(`
      <g class="nodo ${sala.tipo === 'desvio' ? 'origen' : sala.tipo === 'sellada' ? 'margen' : ''} ${esta ? '' : 'cerrado'}" tabindex="0" role="button" data-id="${sala.id}">
        <rect x="${sala.x}" y="${c.y - ALTO_SALA / 2}" width="${sala.ancho}" height="${ALTO_SALA}" rx="2" style="fill:${FONDO_CAPA[sala.capa]}"></rect>
        <g class="glifo" transform="translate(${c.x - 12}, ${c.y - ALTO_SALA / 2 + 6})">${esta ? GLIFOS[sala.glifo] : GLIFO_SELLADO}</g>
        <text x="${c.x}" y="${c.y + ALTO_SALA / 2 - 8}" text-anchor="middle">${html(esta ? sala.nombre : 'sala sin nombre')}</text>
      </g>
    `);
    grupos.set(sala.id, g);
    lienzo.append(g);
  }

  const mostrar = (id: string) => {
    const sala = porId.get(id);
    if (!sala) return;

    for (const [gid, g] of grupos) g.classList.toggle('activo', gid === id);
    for (const [linea, paso] of lineas) {
      const suya = paso.de === id || paso.a === id;
      linea.classList.toggle('resaltada', suya);
      linea.classList.toggle('atenuada', !suya);
    }

    const esta = conocida(sala);
    const capa = VIENTRE[sala.capa];
    // Cada salida es un boton: pulsarla lleva a esa sala. Recorrer el plano
    // deja de ser subir y bajar por la pagina (issue #78).
    const salidas = CAMINOS.filter((p) => p.de === id || p.a === id).map((p) => {
      const otra = porId.get(p.de === id ? p.a : p.de);
      const nombreOtra = otra && conocida(otra) ? otra.nombre : 'sala sin nombre';
      return `<button type="button" class="salto" data-ir="${otra?.id ?? ''}">
          <span class="flecha">${p.de === id ? '→' : '←'}</span><b>${html(nombreOtra)}</b>
          <span class="verbo"> · ${html(PASOS[p.tipo])}. ${html(p.nota)}</span>
        </button>`;
    });

    panel.innerHTML = `
      <div class="eyebrow">Capa ${['I', 'II', 'III', 'IV', 'V', 'VI'][sala.capa]} · ${html(capa?.nombre ?? '')}</div>
      <h3>${html(esta ? sala.nombre : 'Sala sin nombre')}</h3>
      <p class="rango-texto">${
        sala.tipo === 'sellada'
          ? 'Consta en el plano. Sin acceso.'
          : esta
            ? 'Visitada. Consta en su expediente.'
            : 'Consta en el plano. Sin visita registrada.'
      }</p>
      <p>${html(esta ? sala.descripcion : 'El Registro tiene constancia de esta sala y de su ubicación. La descripción se facilita únicamente a quien la ha visitado.')}</p>
      <p class="rango-texto">${salidas.length} ${salidas.length === 1 ? 'salida' : 'salidas'}</p>
      <div class="relaciones">${salidas.join('')}</div>
    `;

    for (const boton of panel.querySelectorAll<HTMLButtonElement>('.salto')) {
      const destino = boton.dataset.ir;
      if (destino) boton.addEventListener('click', () => mostrar(destino));
    }
  };

  for (const [id, g] of grupos) {
    g.addEventListener('click', () => mostrar(id));
    g.addEventListener('keydown', (evento) => {
      const tecla = (evento as KeyboardEvent).key;
      if (tecla === 'Enter' || tecla === ' ') {
        evento.preventDefault();
        mostrar(id);
      }
    });
  }

  contenedor.append(raiz);
  mostrar('plaza');
}
