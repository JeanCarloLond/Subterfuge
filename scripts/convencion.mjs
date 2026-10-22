/**
 * La convencion de nombres de los commits y de los titulos de PR (#179).
 *
 *   <gitmoji> <tipo>(<componente>): <descripcion>
 *   ✨ feat(juego): la niña sigue al Cirujano por el Nivel 2
 *
 * Por que asi: el tipo (Conventional Commits) dice QUE clase de cambio es, el
 * componente DONDE, y el gitmoji lo deja ver de un vistazo en la lista de
 * commits. Leyendo la historia se sabe que se arreglo en la web este mes sin
 * abrir un solo diff.
 *
 * Cada tipo tiene UN gitmoji, siempre el mismo: si se pudiera elegir, en un mes
 * habria tres emojis para "arreglo" y ya no servirian para leer nada.
 *
 * Sin dependencias: lo usan el hook `commit-msg` (.githooks), el CI y los
 * tests.
 */

/** Tipo -> gitmoji y para que se usa. */
export const TIPOS = {
  feat: { emoji: '✨', uso: 'algo nuevo para quien juega o lee la web' },
  fix: { emoji: '🐛', uso: 'arreglar un fallo' },
  docs: { emoji: '📝', uso: 'solo documentación' },
  style: { emoji: '🎨', uso: 'formato o estilo del código, sin cambiar lo que hace' },
  refactor: { emoji: '♻️', uso: 'reordenar código sin cambiar lo que hace' },
  perf: { emoji: '⚡️', uso: 'que vaya más rápido o gaste menos' },
  test: { emoji: '✅', uso: 'añadir o arreglar tests' },
  ci: { emoji: '👷', uso: 'el CI y sus comprobaciones' },
  build: { emoji: '📦️', uso: 'el build y las dependencias' },
  chore: { emoji: '🔧', uso: 'mantenimiento y configuración que no cambia el juego' },
  assets: { emoji: '🍱', uso: 'añadir o cambiar arte, audio u otros recursos' },
  revert: { emoji: '⏪️', uso: 'deshacer un commit anterior' },
};

/** Componente -> que parte del repo es. En minusculas y sin tildes: van en la cabecera. */
export const COMPONENTES = {
  juego: 'jugabilidad: escenas, entidades, combate, sistemas del juego',
  niveles: 'diseño de niveles: geometría, zonas y lo que se coloca en ellas',
  ui: 'HUD, menús, diálogos y controles en pantalla',
  lore: 'textos del mundo: Códice, Registro, voces y canon',
  arte: 'arte provisional y sprites',
  audio: 'música y sonido',
  web: 'el portal de la Diócesis',
  sigma: 'Subterfuge Sigma, el remake en Godot (sigma/)',
  tecnico: 'base técnica: guardado, entrada, motor, rendimiento',
  tests: 'los tests',
  ci: 'el CI',
  repo: 'configuración del repositorio, scripts y plantillas',
  docs: 'la documentación',
};

/** Lo mas largo que puede ser la cabecera: lo que cabe en la lista de commits. */
export const LARGO_MAXIMO = 72;

/** El selector de variacion (U+FE0F) es opcional: ♻ y ♻️ son el mismo emoji. */
const sinSelector = (texto) => texto.replace(/️/g, '');

const CABECERA = /^(\S+) ([a-z]+)\(([a-z,]+)\)(!)?: (.+)$/u;

/**
 * Commits que no escribe nadie a mano y no se comprueban: los de fusion que
 * crea Git o GitHub, y los fixup/squash que se aplastan antes de fusionar.
 */
export function esExento(cabecera) {
  return /^(Merge |fixup! |squash! |amend! )/.test(cabecera);
}

/**
 * Comprueba una cabecera (la primera linea de un commit, o el titulo de una PR).
 * @returns la lista de errores, en español y diciendo como arreglarlo. Vacia si esta bien.
 */
export function validarCabecera(cabecera) {
  const linea = (cabecera ?? '').trim();
  if (esExento(linea)) return [];

  const m = CABECERA.exec(linea);
  if (!m) {
    return ['La cabecera no sigue el formato «<gitmoji> <tipo>(<componente>): <descripción>».'];
  }

  const [, emoji, tipo, componentes, , descripcion] = m;
  const errores = [];

  const definicion = TIPOS[tipo];
  if (!definicion) {
    errores.push(`«${tipo}» no es un tipo. Tipos: ${Object.keys(TIPOS).join(', ')}.`);
  } else if (sinSelector(emoji) !== sinSelector(definicion.emoji)) {
    errores.push(`El tipo «${tipo}» lleva el gitmoji ${definicion.emoji}, no ${emoji}.`);
  }

  const lista = componentes.split(',');
  if (lista.length > 2) errores.push('Como mucho dos componentes: si son más, son dos commits.');
  for (const componente of lista) {
    if (!(componente in COMPONENTES)) {
      errores.push(
        `«${componente}» no es un componente. Componentes: ${Object.keys(COMPONENTES).join(', ')}.`,
      );
    }
  }

  if (descripcion.trim().length < 10) {
    errores.push('La descripción es demasiado corta: di qué cambia, en una frase.');
  }
  if (/[.\s]$/.test(descripcion)) errores.push('La descripción no acaba en punto ni en espacio.');

  // Se cuentan caracteres, no unidades UTF-16: un emoji cuenta como uno.
  const largo = [...linea].length;
  if (largo > LARGO_MAXIMO) {
    errores.push(`La cabecera mide ${largo} caracteres; el máximo es ${LARGO_MAXIMO}.`);
  }

  return errores;
}

/**
 * Comprueba un mensaje entero: la cabecera, y que el cuerpo vaya separado por
 * una linea en blanco. Las lineas que empiezan por # las quita Git: no cuentan.
 */
export function validarMensaje(mensaje) {
  const lineas = (mensaje ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((linea) => !linea.startsWith('#'));
  while (lineas.length && lineas[lineas.length - 1].trim() === '') lineas.pop();

  const errores = validarCabecera(lineas[0] ?? '');
  if (lineas.length > 1 && lineas[1].trim() !== '') {
    errores.push('Deja una línea en blanco entre la cabecera y el cuerpo.');
  }
  return errores;
}

/** Ejemplo y chuleta, para cuando algo falla. */
export function ayuda() {
  const tipos = Object.entries(TIPOS)
    .map(([tipo, { emoji, uso }]) => `  ${emoji} ${tipo.padEnd(9)}${uso}`)
    .join('\n');
  const componentes = Object.entries(COMPONENTES)
    .map(([nombre, que]) => `  ${nombre.padEnd(9)}${que}`)
    .join('\n');
  return [
    'Formato:  <gitmoji> <tipo>(<componente>): <descripción>',
    'Ejemplo:  ✨ feat(juego): la niña sigue al Cirujano por el Nivel 2',
    '',
    'Tipos:',
    tipos,
    '',
    'Componentes (uno, o dos separados por coma):',
    componentes,
    '',
    'Detalles en CONTRIBUTING.md.',
  ].join('\n');
}
