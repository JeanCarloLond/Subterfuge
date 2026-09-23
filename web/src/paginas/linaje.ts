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
      'Empresa de biotecnología, hoy sin actividad. Hace tres generaciones anunció el fin de la muerte mediante edición genética y admitió a mil voluntarios en su programa. El programa no fracasó del todo: funcionó, aunque no como estaba previsto. Sus instalaciones siguen en uso; parte del personal actual las considera parte del templo.',
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
      'Los mil voluntarios del programa original. No fallecieron. Su tejido continúa regenerándose y mutando sin control, y en muchos casos se ha integrado con la estructura del edificio. No fue posible retirarlos, por lo que se les venera. Ninguno desarrolló ojos; la doctrina lo recoge así: "los dioses no miran, son mirados". Cada uno tiende hacia el órgano que dominó su transformación.',
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
      'Personal técnico superviviente del programa. Al no poder revertir el resultado, lo reinterpretaron como milagro y lo dejaron por escrito: el Códice de la Carne se redactó sobre los manuales técnicos, que se conservan debajo del texto. Sus sucesores ya no sostienen la doctrina por obligación, sino por fe. Ninguno queda con vida.',
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
      'Advocación cerebral: masas de pliegues y médula integradas con el cableado del complejo. Conservan el intelecto y nada más. Su único estímulo conocido es la devoción de los fieles, por lo que la Diócesis procura que no falte. Transmiten "revelaciones" que el clero interpreta y publica.',
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
      'Advocación cardíaca: corazones de gran tamaño cuyo pulso se percibe en los niveles profundos. Conservan la emoción y no el intelecto. Nota interna: manifiestan culpa y solicitan reiteradamente que se les deje morir. Se recomienda no atender esas peticiones. Colaboran con quien baja, a costa de sí mismos.',
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
      'Advocación digestiva: estómagos e intestinos integrados con los ductos del Vientre. No tienen voluntad conocida más allá del apetito. No exigen culto ni piden nada; solo requieren alimento continuo. Son el motivo por el que el diezmo no puede interrumpirse y, en la práctica, la razón de ser de la Oficina.',
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
      'Alto clero. Administran el diezmo, sellan el Registro e interpretan las revelaciones. Como los Mil no ven, es el clero quien reconoce el rango de cada fiel, y de ahí su autoridad. Son quienes más han entregado: de cintura para abajo no conservan cuerpo. Atienden con cita.',
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
      'Expediente reservado. Descendientes de personal técnico del programa que conservan conocimiento no autorizado. No pretenden dañar a los Mil: pretenden estudiarlos y demostrar que son biología, no divinidad. Actúan dentro del propio clero; varios Cirujanos-Sacerdotes figuran en la lista. Su texto de referencia son los manuales que el Códice reescribió.',
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
      'Manos del Sacramento número siete, titular anterior. Progenitor del titular actual, a quien formó desde niño y a quien transmitió el número. Reformado en acto de servicio en un sacramento fallido. Por norma no fue trasladado a los niveles inferiores: permanece en la Sala 7, donde fue hecho. En el teaser es el jefe: el titular actual se enfrenta a lo que su propio oficio produjo.',
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
      'Titular de la Sala 7. Sin nombre propio; se le identifica por el número de puesto. Formado desde niño para heredar el oficio. Cree en la Diócesis porque lo necesita: es lo único que hace llevadero su trabajo diario. Es la excepción a la regla del cuerpo: no asciende porque no se ofrenda; conserva el cuerpo entero porque así rinde más. Su cualificación lo hace demasiado valioso para autorizar su baja.',
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
      'Base de la Diócesis y mayoría de la población. Cada casa inscribe a los suyos una vez al año y liquida el diezmo en carne. Un Devoto conserva casi todo el cuerpo, y por eso ocupa el rango inferior: todavía le queda por entregar. Lo entregado se le repone con lo que haya disponible.',
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
      'Expediente reservado. Familias que rehúsan inscribir diezmo. No niegan la existencia de los Mil: niegan que deban alimentarse. Conservan el cuerpo íntegro, lo que en la Diócesis los señala como parias. Residen en los márgenes del Atrio. Se sospecha que ocultan a Elegidos fugados. En seguimiento.',
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
      'Expediente reservado. Fieles que consideran tibia a la Diócesis y buscan parecerse a los Mil por su cuenta, mediante mutilación e injerto fuera de sacramento. Persiguen la ascensión sin permiso del clero. Se les retira el instrumental cuando se les localiza.',
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
      'Fieles seleccionados por sorteo o inscritos por deuda de casa. Se les seda en las Criptas la víspera de su turno y entran dormidos en la Sala. La Diócesis celebra cada sacramento como una ceremonia solemne, y así lo viven las familias. No consta ninguna queja.',
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
      'Expediente reservado. Ofrenda voluntaria, sin número de sorteo: se presentó para liquidar la deuda de su casa y firmó de su puño. Durante el sacramento su tejido respondió de forma no documentada; es compatible con lo que a los Mil les falta y podría darles la vista. Los Cerebrales la reclaman para ver; los Cordiales, para ser mirados. La consulta sigue abierta.',
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
      'Resultado previsto del sacramento: el Elegido se integra en los Mil y no regresa. Es lo que la doctrina promete a cada casa. Nota interna: no se registra ninguna integración completa en las últimas tres generaciones. Este dato no se comunica.',
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
      'Resultado parcial del sacramento: el Elegido sobrevive sin completarse. La doctrina establece que se le honra; el procedimiento es alojarlo en los Niveles Reformados, sin visitas. Un sacramento a medias deja media persona, y a esa media se la trata con respeto.',
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
      'Fauna del Vientre. Se alimenta de los restos de carne que el sacramento rechaza; su boca es un conjunto de bisturís óseos que perforan sin destruir. Su caparazón adquiere un brillo dorado idéntico al de las reliquias y se aprovecha como ornamento de altar. Las Vestales lo cazan para hacer máscaras. Especie casi extinta.',
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
        Organigrama de la Diócesis, de arriba abajo: el origen, el clero, el oficio y el destino
        de la ofrenda. Pulse cualquier nombre para ver su ficha, y siga las relaciones para
        recorrerlo. Advertencia del Registro: la autoridad no sigue el orden de antigüedad.
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
  /** Donde cae el rotulo de cada arista, segun el punto del recorrido. */
  const sitios = new Map<Arista, (t: number) => { x: number; y: number }>();
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

    // El verbo NO se dibuja aqui. Con veintiocho relaciones a la vez, los
    // rotulos se cruzaban entre si y con los nodos hasta ser ilegibles
    // (issue #77). Se guarda donde iria, y solo se pintan los de la entrada
    // seleccionada, que como mucho son cinco y salen en direcciones
    // distintas.
    const puntoDe = (t: number) =>
      mismoNivel
        ? { x: (p.x + q.x) / 2, y: p.y + ALTO_NODO / 2 + 34 }
        : {
            x: bezier(p.x, p.x, q.x, q.x, t),
            y: bezier(y1, (y1 + y2) / 2, (y1 + y2) / 2, y2, t),
          };
    sitios.set(arista, puntoDe);
    void indice;
  });

  // Los rotulos de la seleccion van en su propia capa, encima de las
  // aristas y debajo de los nodos.
  const capaRotulos = svg('<g></g>');
  lienzo.append(capaRotulos);

  /**
   * Pinta los verbos de las relaciones de un nodo, probando varios puntos del
   * recorrido hasta dar con uno que no pise a otro rotulo ya puesto.
   */
  const pintarRotulos = (id: string) => {
    capaRotulos.replaceChildren();
    const puestos: { x: number; y: number; ancho: number }[] = [];

    for (const arista of ARISTAS) {
      if (arista.de !== id && arista.a !== id) continue;
      const sitio = sitios.get(arista);
      if (!sitio) continue;

      const ancho = arista.verbo.length * 4.6;
      let mejor = sitio(0.5);
      for (const t of [0.5, 0.36, 0.64, 0.26, 0.74, 0.16]) {
        const punto = sitio(t);
        const choca = puestos.some(
          (otro) =>
            Math.abs(otro.y - punto.y) < 13 &&
            Math.abs(otro.x - punto.x) < (otro.ancho + ancho) / 2,
        );
        if (!choca) {
          mejor = punto;
          break;
        }
      }
      puestos.push({ ...mejor, ancho });
      capaRotulos.append(
        svg(
          `<text class="arista-rotulo" x="${mejor.x}" y="${mejor.y}" text-anchor="middle">${html(arista.verbo)}</text>`,
        ),
      );
    }
  };

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
    pintarRotulos(id);
    for (const [gid, g] of grupos) g.classList.toggle('activo', gid === id);
    for (const [camino, arista] of aristas) {
      const toca = arista.de === id || arista.a === id;
      camino.classList.toggle('resaltada', toca);
      camino.classList.toggle('atenuada', !toca);
    }

    if (!abierto(nodo)) {
      const como =
        nodo.requiere === 'final'
          ? 'Se habilita al completar el descenso.'
          : nodo.requiere === 'manos-anteriores'
            ? 'Se habilita tras visitar la Sala 7.'
            : 'Se habilita al completar el descenso, o presentando una clave.';
      panel.innerHTML = `
        <h3>${html(etiqueta(nodo))}</h3>
        <div class="rango-texto">Expediente cerrado</div>
        <p>Esta entrada no se facilita al público general. ${como}</p>
      `;
      return;
    }

    const relaciones = ARISTAS.filter((a) => a.de === id || a.a === id).map((a) => {
      const otro = porId.get(a.de === id ? a.a : a.de);
      if (!otro) return '';
      const flecha = a.de === id ? '→' : '←';
      return `<button type="button" class="salto" data-ir="${otro.id}">
          <span class="flecha">${flecha}</span><b>${html(etiqueta(otro))}</b>
          <span class="verbo"> · ${html(a.verbo)}</span>
        </button>`;
    });
    panel.innerHTML = `
      <h3>${html(nodo.nombre)}</h3>
      <div class="rango-texto">${html(nodo.rango)}</div>
      <p>${html(nodo.descripcion)}</p>
      <p><b>Autoridad.</b> ${html(nodo.autoridad)}</p>
      <div class="rango-texto" style="margin-top:14px">Relaciones</div>
      <div class="relaciones">${relaciones.join('')}</div>
    `;

    // Cada relacion lleva a su entrada: el linaje se recorre saltando de
    // nombre en nombre, sin volver al diagrama a buscar (issue #78).
    for (const boton of panel.querySelectorAll<HTMLButtonElement>('.salto')) {
      boton.addEventListener('click', () => mostrar(boton.dataset.ir ?? id));
    }
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
