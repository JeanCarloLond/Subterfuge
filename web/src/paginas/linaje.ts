/**
 * Linaje: de dónde viene cada cosa y quién manda sobre quién.
 *
 * Un esquema dibujado en SVG a partir de datos, no una ilustración: cada nodo
 * es una entidad del bible (dioses, clero, oficio, fieles, ofrenda, destinos)
 * y cada arista una relación con su verbo. El eje vertical es el origen —
 * arriba lo que vino primero, abajo adónde va la carne — y la autoridad se
 * dice en cada ficha, porque en la Diócesis las dos cosas no coinciden: los
 * que mandan (las Vestales) no son los que vinieron primero (los Mil), y el
 * que más cuerpo conserva (el Cirujano) no es el que menos vale.
 *
 * Lo que la Diócesis no publica (la corporación, las herejías, la niña, las
 * Manos anteriores) sale como expediente cerrado hasta que el visitante lo
 * gane bajando o presente una clave.
 */

import { descensoAbierto, hitoAbierto } from '../memoria';
import { elemento, html } from '../texto';

type Tipo = 'origen' | 'dios' | 'clero' | 'oficio' | 'fiel' | 'ofrenda' | 'destino' | 'margen';
type Requisito = 'descenso' | 'manos-anteriores' | 'final';

interface Nodo {
  id: string;
  nombre: string;
  /** Nombre que se enseña mientras el expediente está cerrado. */
  nombreCerrado?: string;
  tipo: Tipo;
  rango: string;
  autoridad: string;
  nivel: number;
  x: number;
  descripcion: string;
  requiere?: Requisito;
}

interface Arista {
  de: string;
  a: string;
  verbo: string;
}

const NIVELES = [
  'Origen',
  'Los dioses',
  'El clero',
  'El oficio',
  'Los fieles',
  'La ofrenda',
  'Destino de la carne',
];

const NODOS: readonly Nodo[] = [
  {
    id: 'genesis',
    nombre: 'Genesis Vestal',
    nombreCerrado: 'La Promesa',
    tipo: 'origen',
    rango: 'Corporación biotecnológica',
    autoridad: 'Ninguna hoy: no queda nadie que la entienda.',
    nivel: 0,
    x: 150,
    requiere: 'descenso',
    descripcion:
      'Hace tres generaciones prometió el fin de la muerte por edición genética. Los mil primeros sujetos aceptaron con esperanza real. El experimento no falló del todo: funcionó, pero no como se esperaba. Su tecnología sigue en el Vientre, cubierta de cera y óxido, operada como liturgia por gente que no sabe que es tecnología.',
  },
  {
    id: 'mil',
    nombre: 'Los Mil',
    tipo: 'dios',
    rango: 'Sujetos de prueba · los Primigenios',
    autoridad: 'Absoluta y ciega. No mandan: se les obedece.',
    nivel: 0,
    x: 450,
    descripcion:
      'Los mil sujetos originales. No murieron. Sus células siguieron regenerándose y mutando sin control, fusionándose con el complejo. No pudieron ser destruidos, así que fueron venerados. Ninguno desarrolló ojos: "los dioses no miran, son mirados". Cada uno colapsó hacia el órgano que dominó su mutación.',
  },
  {
    id: 'cientificos',
    nombre: 'Científicos supervivientes',
    nombreCerrado: 'Los primeros fieles',
    tipo: 'origen',
    rango: 'Fundadores de la Diócesis',
    autoridad: 'Fundacional. Escribieron las reglas y murieron.',
    nivel: 0,
    x: 750,
    requiere: 'descenso',
    descripcion:
      'Incapaces de eliminar a los Mil, reinterpretaron el desastre como milagro. No de forma pasiva: reescribieron su propio error científico como escritura sagrada, el Códice de la Carne, usando los manuales técnicos como materia prima doctrinal. Sus sucesores ya no sostienen la doctrina por obligación, sino por fe heredada.',
  },
  {
    id: 'cerebrales',
    nombre: 'Los Cerebrales',
    tipo: 'dios',
    rango: 'Facción-órgano · La Sinapsis Fría',
    autoridad: 'La más alta entre los dioses: manipulan al clero.',
    nivel: 1,
    x: 250,
    descripcion:
      'Masas cerebrales, pliegues y médulas fundidas con el cableado del complejo. Perdieron todo lo humano excepto el intelecto. Solo quieren seguir siendo venerados: la fe de los Devotos es el único estímulo que aún sienten. Mandan "revelaciones" que las Vestales leen como profecía.',
  },
  {
    id: 'cordiales',
    nombre: 'Los Cordiales',
    tipo: 'dios',
    rango: 'Facción-órgano · El Corazón Penitente',
    autoridad: 'Ninguna que quieran ejercer. Quieren morir.',
    nivel: 1,
    x: 450,
    descripcion:
      'Corazones colosales cuyo pulso se oye en los niveles profundos. Conservaron la emoción sin el intelecto: culpa, dolor y compasión a escala inhumana. Saben que son un error y quieren dejar de ser el motor de la carnicería. Cada favor que conceden es un latido que se roban a sí mismos.',
  },
  {
    id: 'viscerales',
    nombre: 'Los Viscerales',
    tipo: 'dios',
    rango: 'Facción-órgano · El Estómago Ciego',
    autoridad: 'Ninguna. Son la razón del diezmo.',
    nivel: 1,
    x: 650,
    descripcion:
      'Estómagos e intestinos fundidos con los ductos del Vientre. Ni buenos ni malos: hambre sin pensamiento. No quieren culto ni muerte, solo comer. Mantenerlos calmados es la excusa económica de todo el sistema, y por eso los diezmos de carne no pueden parar.',
  },
  {
    id: 'vestales',
    nombre: 'Las Vestales',
    tipo: 'clero',
    rango: 'Alto clero',
    autoridad: 'La más alta entre humanos. Interpretan a los dioses.',
    nivel: 2,
    x: 450,
    descripcion:
      'Administran el diezmo, sellan el Registro y leen las revelaciones. Como los dioses no ven, el estatus lo otorga el clero: por eso su poder es político antes que sagrado. Van más transformadas que nadie, porque están más arriba: de cintura para abajo ya no les queda cuerpo.',
  },
  {
    id: 'anatomistas',
    nombre: 'Los Anatomistas',
    nombreCerrado: 'Expediente cerrado',
    tipo: 'margen',
    rango: 'Herejía científica · dentro del clero',
    autoridad: 'La que roban: varios Cirujanos-Sacerdotes lo son en secreto.',
    nivel: 2,
    x: 750,
    requiere: 'descenso',
    descripcion:
      'Descendientes clandestinos de técnicos de Genesis Vestal que conservaron fragmentos de conocimiento real. No quieren destruir a los Primigenios: quieren entenderlos y demostrar que son biología, no divinidad. Su biblia son los manuales que la Diócesis reescribió. Saber la verdad no les da el poder de decirla.',
  },
  {
    id: 'anteriores',
    nombre: 'Las Manos anteriores',
    nombreCerrado: 'Manos anteriores · expediente cerrado',
    tipo: 'oficio',
    rango: 'Manos del Sacramento N.º 7, antes',
    autoridad: 'La tuvieron. Se quedaron en la Sala 7.',
    nivel: 3,
    x: 250,
    requiere: 'manos-anteriores',
    descripcion:
      'El progenitor del Cirujano. Le enseñó a sostener el bisturí y se lo dejó en herencia junto con el número. Fue reformado en acto de servicio, en un sacramento fallido, y no fue trasladado abajo: se le dejó donde fue hecho. Es el jefe del teaser, y el jugador pelea contra el resultado de su propio oficio.',
  },
  {
    id: 'cirujano',
    nombre: 'Manos del Sacramento N.º 7',
    tipo: 'oficio',
    rango: 'Cirujano-Sacerdote · gremio hereditario',
    autoridad: 'Alta en la Sala, ninguna fuera. Ejecuta; no elige.',
    nivel: 3,
    x: 550,
    descripcion:
      'No tiene nombre: tiene número. Entrenado desde niño para heredar el oficio. Cree en la Diócesis porque necesita creer: es lo único que hace soportable lo que hace con sus manos cada día. Es la excepción de la regla del cuerpo: no asciende porque no se ofrenda; vale más entero, cortando. Su habilidad lo hace demasiado valioso para desertar.',
  },
  {
    id: 'devotos',
    nombre: 'Los Devotos',
    tipo: 'fiel',
    rango: 'La base de la Diócesis',
    autoridad: 'Ninguna. Son la mayoría.',
    nivel: 4,
    x: 450,
    descripcion:
      'Los fieles. Cada casa inscribe a los suyos una vez al año y paga su diezmo en carne. Un Devoto conserva casi todo el cuerpo, y por eso está abajo: le falta entregar. Lo que le falta se lo repuso el Sacramento con lo que había a mano.',
  },
  {
    id: 'ayunantes',
    nombre: 'Los Ayunantes',
    nombreCerrado: 'Expediente cerrado',
    tipo: 'margen',
    rango: 'La resistencia moral · márgenes del Atrio',
    autoridad: 'Ninguna. Son los parias.',
    nivel: 4,
    x: 150,
    requiere: 'descenso',
    descripcion:
      'Se niegan a pagar diezmos de carne. No niegan que los dioses existan: niegan que merezcan ser alimentados. Mutilados por elección inversa, conservan el cuerpo íntegro en un mundo que premia la transformación, y eso los convierte en intocados. Esconden a Elegidos fugados.',
  },
  {
    id: 'rebano',
    nombre: 'El Rebaño Hueco',
    nombreCerrado: 'Expediente cerrado',
    tipo: 'margen',
    rango: 'El culto dentro del culto',
    autoridad: 'Ninguna reconocida. Se la toman.',
    nivel: 4,
    x: 750,
    requiere: 'descenso',
    descripcion:
      'Fanáticos que creen que la Diócesis se ha vuelto tibia. Si parecerse a los dioses da estatus, ellos quieren volverse dioses: se automutilan y autoinjertan fuera de todo sacramento, buscando la ascensión sin permiso del clero.',
  },
  {
    id: 'elegidos',
    nombre: 'Los Elegidos',
    tipo: 'ofrenda',
    rango: 'La ofrenda · por sorteo o por deuda',
    autoridad: 'Ninguna. Son lo que se entrega.',
    nivel: 5,
    x: 450,
    descripcion:
      'Quien sale en el sorteo, o quien salda una deuda de casa. Se les seda en las Criptas la víspera del turno y entran dormidos en la Sala. Cada sacramento se vive como una ceremonia solemne y honorable: nadie dentro del mundo lo percibe como violencia.',
  },
  {
    id: 'nina',
    nombre: 'La niña · Los Ojos',
    nombreCerrado: 'Ofrenda sin número',
    tipo: 'ofrenda',
    rango: 'Ofrenda voluntaria · sin sorteo',
    autoridad: 'La que nadie tuvo: puede darles la vista.',
    nivel: 5,
    x: 700,
    requiere: 'final',
    descripcion:
      'No fue seleccionada: se ofreció sola para saldar la deuda de su familia, y firmó de su puño. Durante el sacramento su tejido responde como ningún otro: su cuerpo es compatible con lo que a los dioses les falta. Es la primera ofrenda capaz de darles vista. Los Cerebrales quieren ver por ella; los Cordiales quieren que ella los mire, para morir en paz.',
  },
  {
    id: 'ascendido',
    nombre: 'Ascendido',
    tipo: 'destino',
    rango: 'Sacramento completo',
    autoridad: 'Sería un dios. No ha ocurrido en tres generaciones.',
    nivel: 6,
    x: 300,
    descripcion:
      'El que completa el sacramento asciende y no vuelve: se integra en los Mil. Es lo que la doctrina promete a cada casa. Ningún Elegido ha llegado abajo entero en tres generaciones, y nadie lo dice en voz alta.',
  },
  {
    id: 'reformado',
    nombre: 'Reformado',
    tipo: 'destino',
    rango: 'Sacramento a medias',
    autoridad: 'Ninguna. Se le honra guardándolo abajo.',
    nivel: 6,
    x: 550,
    descripcion:
      'El que sobrevive parcialmente al sacramento sin completarse. La doctrina dice que se le honra; en la práctica se le guarda en los Niveles Reformados, donde no haya que verlo. Un sacramento a medias deja media persona.',
  },
  {
    id: 'diezmado',
    nombre: 'El Diezmado',
    tipo: 'destino',
    rango: 'Animal del Vientre',
    autoridad: 'Ninguna. Está casi extinto.',
    nivel: 6,
    x: 780,
    descripcion:
      'Se alimenta de los restos de carne que el sacramento rechazó, con una boca de bisturís óseos que perforan sin destruir. Su caparazón desarrolla un brillo dorado idéntico al de las reliquias, y cuando muere se usa como ornamento en los altares. Las Vestales lo cazan para hacer máscaras.',
  },
];

const ARISTAS: readonly Arista[] = [
  { de: 'genesis', a: 'mil', verbo: 'el lote' },
  { de: 'genesis', a: 'cientificos', verbo: 'sobrevivieron' },
  { de: 'mil', a: 'cerebrales', verbo: 'colapsaron en' },
  { de: 'mil', a: 'cordiales', verbo: 'colapsaron en' },
  { de: 'mil', a: 'viscerales', verbo: 'colapsaron en' },
  { de: 'cientificos', a: 'vestales', verbo: 'fundaron la Diócesis' },
  { de: 'cientificos', a: 'anatomistas', verbo: 'descendientes clandestinos' },
  { de: 'cerebrales', a: 'vestales', verbo: 'revelaciones' },
  { de: 'cordiales', a: 'cirujano', verbo: 'ayudan, a su costa' },
  { de: 'vestales', a: 'cirujano', verbo: 'ordenan el sacramento' },
  { de: 'vestales', a: 'devotos', verbo: 'administran el diezmo' },
  { de: 'vestales', a: 'diezmado', verbo: 'lo cazan por el caparazón' },
  { de: 'anatomistas', a: 'cirujano', verbo: 'algunos lo son en secreto' },
  { de: 'anteriores', a: 'cirujano', verbo: 'le enseñó el oficio' },
  { de: 'anteriores', a: 'reformado', verbo: 'sacramento fallido' },
  { de: 'devotos', a: 'elegidos', verbo: 'sorteo anual' },
  { de: 'devotos', a: 'viscerales', verbo: 'diezmo de carne' },
  { de: 'devotos', a: 'ayunantes', verbo: 'se niegan al diezmo' },
  { de: 'devotos', a: 'rebano', verbo: 'se automutilan' },
  { de: 'ayunantes', a: 'elegidos', verbo: 'esconden fugados' },
  { de: 'cirujano', a: 'elegidos', verbo: 'opera' },
  { de: 'cirujano', a: 'nina', verbo: 'la mira' },
  { de: 'nina', a: 'cerebrales', verbo: 'quieren ver por ella' },
  { de: 'nina', a: 'cordiales', verbo: 'quieren que los mire' },
  { de: 'elegidos', a: 'ascendido', verbo: 'sacramento completo' },
  { de: 'elegidos', a: 'reformado', verbo: 'sacramento a medias' },
  { de: 'elegidos', a: 'diezmado', verbo: 'restos rechazados' },
  { de: 'ascendido', a: 'mil', verbo: 'se integra' },
];

const ANCHO_NODO = 184;
const ALTO_NODO = 46;
const PASO_NIVEL = 96;
const MARGEN_SUPERIOR = 44;

function abierto(nodo: Nodo): boolean {
  if (!nodo.requiere) return true;
  if (nodo.requiere === 'descenso') return descensoAbierto();
  return hitoAbierto(nodo.requiere);
}

function centro(nodo: Nodo): { x: number; y: number } {
  return { x: nodo.x, y: MARGEN_SUPERIOR + nodo.nivel * PASO_NIVEL + ALTO_NODO / 2 };
}

function etiqueta(nodo: Nodo): string {
  return abierto(nodo) ? nodo.nombre : (nodo.nombreCerrado ?? 'Expediente cerrado');
}

/**
 * Crea un elemento SVG desde texto. No vale un <template>: lo que sale de ahi
 * es HTML, y un <rect> en el espacio de nombres de HTML no se dibuja.
 */
function svg(marcado: string): SVGElement {
  const documento = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${marcado.trim()}</svg>`,
    'image/svg+xml',
  );
  const nodo = documento.documentElement.firstElementChild as SVGElement;
  return document.importNode(nodo, true);
}

export function renderLinaje(contenedor: HTMLElement): void {
  const alto = MARGEN_SUPERIOR + NIVELES.length * PASO_NIVEL;
  const raiz = elemento(`
    <article>
      <div class="eyebrow">Linaje · capa IV</div>
      <h1>De dónde viene cada uno, y quién manda</h1>
      <div class="filete"></div>
      <p class="lede">
        Arriba, lo que vino primero; abajo, adónde va la carne. La autoridad no sigue el mismo
        orden, y eso es lo que hay que leer: los que vinieron primero no mandan, y los que mandan
        no son los que más cuerpo conservan. Pulsa cualquier nombre.
      </p>
      <div class="linaje">
        <div class="linaje-lienzo">
          <svg viewBox="0 0 900 ${alto}" role="img" aria-label="Esquema del linaje de la Diócesis"></svg>
        </div>
        <aside class="linaje-panel" id="linaje-panel" aria-live="polite"></aside>
      </div>
      <div class="leyenda">
        <span class="l-dios">dioses</span>
        <span>Diócesis</span>
        <span class="l-origen">origen (no publicado)</span>
        <span class="l-margen">fuera del sistema</span>
        <span class="l-cerrado">expediente cerrado</span>
      </div>
    </article>
  `);

  const lienzo = raiz.querySelector('svg') as SVGSVGElement;
  const panel = raiz.querySelector('#linaje-panel') as HTMLElement;
  const porId = new Map(NODOS.map((n) => [n.id, n]));

  // Niveles: una línea punteada y su rótulo.
  NIVELES.forEach((nombre, i) => {
    const y = MARGEN_SUPERIOR + i * PASO_NIVEL - 10;
    lienzo.append(svg(`<line class="nivel-linea" x1="0" y1="${y}" x2="900" y2="${y}"></line>`));
    lienzo.append(svg(`<text class="nivel-rotulo" x="8" y="${y - 4}">${html(nombre)}</text>`));
  });

  // Aristas: una curva de un nodo al otro, con el verbo a mitad de camino.
  const aristas = new Map<SVGElement, Arista>();
  const bezier = (a: number, b: number, c: number, d: number, t: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
  ARISTAS.forEach((arista, indice) => {
    const de = porId.get(arista.de);
    const a = porId.get(arista.a);
    if (!de || !a) return;
    const p = centro(de);
    const q = centro(a);
    const sube = q.y < p.y;
    const y1 = sube ? p.y - ALTO_NODO / 2 : p.y + ALTO_NODO / 2;
    const y2 = sube ? q.y + ALTO_NODO / 2 : q.y - ALTO_NODO / 2;
    const mismoNivel = de.nivel === a.nivel;
    const ruta = mismoNivel
      ? `M ${p.x} ${p.y + ALTO_NODO / 2} C ${p.x} ${p.y + 50}, ${q.x} ${q.y + 50}, ${q.x} ${q.y + ALTO_NODO / 2}`
      : `M ${p.x} ${y1} C ${p.x} ${(y1 + y2) / 2}, ${q.x} ${(y1 + y2) / 2}, ${q.x} ${y2}`;
    const camino = svg(
      `<path class="arista" d="${ruta}" data-de="${arista.de}" data-a="${arista.a}"></path>`,
    );
    lienzo.append(camino);
    aristas.set(camino, arista);
    // El rotulo va a distinta altura de la curva segun la arista, para que dos
    // que salen del mismo nodo no se pisen.
    const t = mismoNivel ? 0.5 : [0.3, 0.5, 0.7][indice % 3];
    const mx = mismoNivel ? (p.x + q.x) / 2 : bezier(p.x, p.x, q.x, q.x, t);
    const my = mismoNivel
      ? p.y + ALTO_NODO / 2 + 36
      : bezier(y1, (y1 + y2) / 2, (y1 + y2) / 2, y2, t);
    lienzo.append(
      svg(
        `<text class="arista-rotulo" x="${mx}" y="${my}" text-anchor="middle">${html(arista.verbo)}</text>`,
      ),
    );
  });

  // Nodos encima de las aristas.
  const grupos = new Map<string, SVGElement>();
  for (const nodo of NODOS) {
    const c = centro(nodo);
    const esta = abierto(nodo);
    const g = svg(`
      <g class="nodo ${nodo.tipo} ${esta ? '' : 'cerrado'}" tabindex="0" role="button" data-id="${nodo.id}">
        <rect x="${c.x - ANCHO_NODO / 2}" y="${c.y - ALTO_NODO / 2}" width="${ANCHO_NODO}" height="${ALTO_NODO}" rx="2"></rect>
        <text class="rango" x="${c.x}" y="${c.y - 8}" text-anchor="middle">${html(esta ? nodo.rango.split(' · ')[0] : 'cerrado')}</text>
        <text x="${c.x}" y="${c.y + 11}" text-anchor="middle">${html(etiqueta(nodo))}</text>
      </g>
    `);
    grupos.set(nodo.id, g);
    lienzo.append(g);
  }

  const mostrar = (id: string) => {
    const nodo = porId.get(id);
    if (!nodo) return;
    for (const [gid, g] of grupos) g.classList.toggle('activo', gid === id);
    for (const [camino, arista] of aristas) {
      const toca = arista.de === id || arista.a === id;
      camino.classList.toggle('resaltada', toca);
      camino.classList.toggle('atenuada', !toca);
    }

    if (!abierto(nodo)) {
      const como =
        nodo.requiere === 'final'
          ? 'Se abre al terminar el descenso.'
          : nodo.requiere === 'manos-anteriores'
            ? 'Se abre al entrar en la Sala 7.'
            : 'Se abre al completar el descenso, o con una clave.';
      panel.innerHTML = `
        <h3>${html(etiqueta(nodo))}</h3>
        <div class="rango-texto">Expediente cerrado</div>
        <p>La Diócesis no publica esta entrada. ${como}</p>
      `;
      return;
    }

    const relaciones = ARISTAS.filter((a) => a.de === id || a.a === id).map((a) => {
      const otro = porId.get(a.de === id ? a.a : a.de);
      if (!otro) return '';
      const flecha = a.de === id ? '→' : '←';
      return `<li>${flecha} <b>${html(etiqueta(otro))}</b>: ${html(a.verbo)}</li>`;
    });
    panel.innerHTML = `
      <h3>${html(nodo.nombre)}</h3>
      <div class="rango-texto">${html(nodo.rango)}</div>
      <p>${html(nodo.descripcion)}</p>
      <p><b>Autoridad.</b> ${html(nodo.autoridad)}</p>
      <ul>${relaciones.join('')}</ul>
    `;
  };

  for (const [id, g] of grupos) {
    g.addEventListener('click', () => mostrar(id));
    g.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        mostrar(id);
      }
    });
  }

  contenedor.append(raiz);
  mostrar('vestales');
}
