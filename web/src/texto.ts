/**
 * Utilidades de texto.
 *
 * Los textos del juego (`src/lore/*`) van sin tildes porque la fuente de
 * píxeles no las tiene. En la web sí hay tildes, así que a las transcripciones
 * se les devuelven las que se pueden devolver sin ambigüedad. Las palabras que
 * podrían ser dos cosas ("esta", "llevo", "completo") se dejan como están:
 * mejor una tilde de menos que una de más.
 */

const TILDES: Readonly<Record<string, string>> = {
  acepto: 'aceptó',
  administracion: 'administración',
  administrara: 'administrará',
  ahi: 'ahí',
  alli: 'allí',
  ano: 'año',
  aparto: 'apartó',
  apunto: 'apuntó',
  arrodillo: 'arrodilló',
  asi: 'así',
  aun: 'aún',
  bisturi: 'bisturí',
  cobro: 'cobró',
  codice: 'códice',
  copio: 'copió',
  cubrira: 'cubrirá',
  cumplio: 'cumplió',
  decia: 'decía',
  decidio: 'decidió',
  devocion: 'devoción',
  devolverselo: 'devolvérselo',
  dia: 'día',
  dias: 'días',
  diocesis: 'diócesis',
  dueno: 'dueño',
  empezo: 'empezó',
  ensenado: 'enseñado',
  ensenandolo: 'enseñándolo',
  ensenaron: 'enseñaron',
  entro: 'entró',
  escondio: 'escondió',
  estan: 'están',
  excepcion: 'excepción',
  firmo: 'firmó',
  gano: 'ganó',
  habia: 'había',
  hablaran: 'hablarán',
  incision: 'incisión',
  inscribira: 'inscribirá',
  inscripcion: 'inscripción',
  jamas: 'jamás',
  linea: 'línea',
  liturgico: 'litúrgico',
  mas: 'más',
  mascara: 'máscara',
  medica: 'médica',
  mia: 'mía',
  mias: 'mías',
  moriria: 'moriría',
  murio: 'murió',
  nina: 'niña',
  ningun: 'ningún',
  numero: 'número',
  optico: 'óptico',
  organo: 'órgano',
  parecia: 'parecía',
  pesara: 'pesará',
  pregunte: 'pregunté',
  preguntaras: 'preguntarás',
  preparacion: 'preparación',
  presion: 'presión',
  prometio: 'prometió',
  protesis: 'prótesis',
  proyeccion: 'proyección',
  puno: 'puño',
  quedo: 'quedó',
  quirofano: 'quirófano',
  quirofanos: 'quirófanos',
  salio: 'salió',
  seran: 'serán',
  tambien: 'también',
  todavia: 'todavía',
  traia: 'traía',
  traves: 'través',
  unica: 'única',
  unico: 'único',
  vacia: 'vacía',
  veran: 'verán',
  vispera: 'víspera',
  volvio: 'volvió',
};

export function acentuar(texto: string): string {
  return texto.replace(/[A-Za-z]+/g, (palabra) => {
    const con = TILDES[palabra.toLowerCase()];
    if (!con) return palabra;
    if (palabra === palabra.toUpperCase()) return con.toUpperCase();
    if (palabra[0] === palabra[0].toUpperCase()) return con[0].toUpperCase() + con.slice(1);
    return con;
  });
}

/** Escapa para meter texto en HTML sin sustos. */
export function html(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Un párrafo por línea, con tildes. */
export function parrafos(lineas: readonly string[], clase = ''): string {
  const atributo = clase ? ` class="${clase}"` : '';
  return lineas.map((l) => `<p${atributo}>${html(acentuar(l))}</p>`).join('');
}

/**
 * Las lineas juntas en un solo parrafo. Las fichas del juego parten el texto
 * donde cabe en la pantalla de 480 px; en la web eso son cortes arbitrarios.
 */
export function parrafo(lineas: readonly string[], clase = ''): string {
  return parrafos([lineas.join(' ')], clase);
}

/** Crea un elemento desde una cadena de HTML. */
export function elemento<T extends HTMLElement = HTMLElement>(marcado: string): T {
  const plantilla = document.createElement('template');
  plantilla.innerHTML = marcado.trim();
  return plantilla.content.firstElementChild as T;
}
