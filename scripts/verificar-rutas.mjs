/**
 * Verifica que en cada nivel se pueda VOLVER A SUBIR hasta el punto de partida.
 *
 * Por qué existe: es un error fácil de cometer y difícil de ver leyendo datos.
 * El Atrio se publicó con tramos separados 432 px cuando el salto sube 92 px,
 * lo que dejaba al jugador encallado en el fondo sin forma de regresar.
 *
 * El truco está en el alcance horizontal. Un salto sube 92 px, pero el tiempo
 * que el personaje pasa POR ENCIMA de una altura h es 2*raiz(v^2-2*g*h)/g:
 * subiendo 80 px eso son 0,32 s, o sea unos 41 px de avance. Por eso los tramos
 * de la ruta de vuelta tienen que solapar en x, no separarse.
 *
 * Uso:  node scripts/verificar-rutas.mjs
 * Sale con código 1 si algún nivel tiene zonas sin retorno.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

// Debe coincidir con src/config/Sacramento.ts
const IMPULSO_SALTO = 430;
const IMPULSO_DOBLE = 360;
const GRAVEDAD = 1000;
const VELOCIDAD = 130;
const DASH_VELOCIDAD = 340;
const DASH_DURACION = 0.16;
const TILE = 16;

const alturaSalto = IMPULSO_SALTO ** 2 / (2 * GRAVEDAD);
/** El doble salto encadena, así que la altura total es mayor que la simple. */
const alturaDoble = alturaSalto + IMPULSO_DOBLE ** 2 / (2 * GRAVEDAD);
const avanceDash = DASH_VELOCIDAD * DASH_DURACION;

/** Tiempo que el Cirujano pasa por encima de la altura h durante un salto. */
function tiempoSobre(h, impulso) {
  const disc = impulso ** 2 - 2 * GRAVEDAD * h;
  return disc < 0 ? 0 : (2 * Math.sqrt(disc)) / GRAVEDAD;
}

/** Avance horizontal disponible para subir dy, con y sin dash. */
function alcanceHorizontal(dy) {
  if (dy <= 0) {
    // Travesía a la misma altura o hacia abajo: salto completo.
    const plano = VELOCIDAD * ((2 * IMPULSO_SALTO) / GRAVEDAD);
    return { sinDash: plano, conDash: plano + avanceDash };
  }

  const simple = VELOCIDAD * tiempoSobre(dy, IMPULSO_SALTO);
  // El doble salto da más tiempo en el aire por encima de esa altura.
  const doble = VELOCIDAD * tiempoSobre(dy - alturaSalto, IMPULSO_DOBLE) + simple;
  const mejor = Math.max(simple, doble);
  return { sinDash: mejor, conDash: mejor + avanceDash };
}

/** Extrae las tuplas [x, y, anchoTiles] del bloque `plataformas` de una escena. */
function leerPlataformas(archivo) {
  const src = readFileSync(join(raiz, archivo), 'utf8');
  const bloque = src.match(/plataformas: \[([\s\S]*?)\n {6}\],/);
  if (!bloque) throw new Error(`No encontré 'plataformas' en ${archivo}`);

  return [...bloque[1].matchAll(/\[\s*(-?\d+),\s*(-?\d+),\s*(\d+)\s*\]/g)].map((m) => {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const ancho = Number(m[3]) * TILE;
    return { y, izq: x, der: x + ancho };
  });
}

/** Hueco horizontal entre dos tramos (0 si solapan). */
function hueco(a, b) {
  return Math.max(0, b.izq - a.der, a.izq - b.der);
}

/**
 * ¿Se puede saltar de `desde` a `hacia`?
 * Solo se consideran destinos que estén más arriba o al mismo nivel: bajar
 * siempre se puede, lo que hay que garantizar es la vuelta.
 */
function alcanzable(desde, hacia) {
  const dy = desde.y - hacia.y;
  if (dy < 0) return false; // está más abajo: no es parte de la subida
  if (dy > alturaDoble) return false;

  const { conDash } = alcanceHorizontal(dy);
  return hueco(desde, hacia) <= conDash;
}

function verificar(nombre, archivo) {
  const tramos = leerPlataformas(archivo);
  if (tramos.length === 0) {
    console.log(`${nombre}: sin plataformas que verificar`);
    return true;
  }

  // Partimos del tramo más bajo (donde acaba una caída) y subimos.
  const fondo = tramos.reduce((a, b) => (b.y > a.y ? b : a));
  const cima = tramos.reduce((a, b) => (b.y < a.y ? b : a));

  const alcanzados = new Set([tramos.indexOf(fondo)]);
  const cola = [fondo];

  while (cola.length > 0) {
    const actual = cola.pop();
    tramos.forEach((candidato, i) => {
      if (alcanzados.has(i) || !alcanzable(actual, candidato)) return;
      alcanzados.add(i);
      cola.push(candidato);
    });
  }

  const huerfanos = tramos.filter((_, i) => !alcanzados.has(i));
  const llegaArriba = alcanzados.has(tramos.indexOf(cima));

  if (huerfanos.length === 0 && llegaArriba) {
    console.log(`${nombre}: OK — se puede volver a subir desde el fondo`);
    return true;
  }

  console.log(`${nombre}: FALLO`);
  if (!llegaArriba) {
    console.log(`  no se alcanza el tramo más alto (y=${cima.y})`);
  }
  for (const t of huerfanos) {
    console.log(`  inalcanzable desde abajo: y=${t.y} x=${t.izq}..${t.der}`);
  }
  return false;
}

// -- Decorado sin apoyo -------------------------------------------------------

/**
 * Comprueba que ninguna pieza de decorado quede flotando en el aire.
 *
 * Por qué existe: las piezas se colocan a mano por coordenadas, y basta
 * equivocarse de 50 px para plantar una terminal en mitad del hueco entre dos
 * plataformas. En el código no se ve —es una tupla más en una lista de treinta—
 * y en pantalla canta muchísimo. Pasó con una `pantalla` de los Pasillos y dos
 * `conducto` de las Criptas.
 *
 * Se apoyan las que descansan en el suelo; las que cuelgan del techo o van
 * embutidas en el muro se excluyen a propósito.
 */
/** Se apoyan en el muro, no en el suelo: no se les pide ni techo ni piso. */
const EN_MURO = new Set(['reja', 'ventana', 'durmiente', 'radiografia', 'membrana']);

/**
 * Cuelgan hacia abajo, asi que necesitan algo ARRIBA de donde colgar. Una
 * lampara de quirofano flotando en mitad del aire canta tanto como una
 * terminal levitando, y el primer comprobador no las miraba.
 */
const COLGANTES = new Set(['exvoto', 'cadena', 'luz-hospital', 'goteo', 'raiz']);

/**
 * Extrae el array `nombre: [...]` contando corchetes.
 *
 * Antes se buscaba el cierre por sangría (`\n      ],`) y eso se rompe en
 * cuanto Prettier colapsa un array corto a una línea: el bloque seguía
 * comiéndose el array siguiente y se verificaban tuplas que no eran. Contar
 * corchetes no depende del formato.
 */
function leerTuplas(src, nombre, patron) {
  const inicio = src.indexOf(`${nombre}: [`);
  if (inicio < 0) return [];

  let i = src.indexOf('[', inicio);
  let nivel = 0;
  for (let j = i; j < src.length; j += 1) {
    if (src[j] === '[') nivel += 1;
    else if (src[j] === ']') {
      nivel -= 1;
      if (nivel === 0) return [...src.slice(i + 1, j).matchAll(patron)];
    }
  }
  return [];
}

function verificarDecorado(nombre, archivo) {
  const src = readFileSync(join(raiz, archivo), 'utf8');

  const plataformas = leerTuplas(src, 'plataformas', /\[\s*(-?\d+),\s*(-?\d+),\s*(\d+)\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), ancho: Number(m[3]) * TILE }),
  );
  const paredes = leerTuplas(src, 'paredes', /\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y0: Number(m[2]), y1: Number(m[3]) }),
  );
  const decorado = leerTuplas(src, 'decorado', /\[\s*(-?\d+),\s*(-?\d+),\s*'([a-z-]+)'\s*\]/g).map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), tipo: m[3] }),
  );

  if (decorado.length === 0) {
    console.log(`${nombre}: sin decorado que verificar`);
    return true;
  }

  const sueltas = decorado.filter((d) => {
    if (EN_MURO.has(d.tipo)) return false;

    // Lo que cuelga necesita techo justo encima: el borde inferior de una
    // plataforma esta a su y + TILE.
    if (COLGANTES.has(d.tipo)) {
      return !plataformas.some((p) => d.y === p.y + TILE && d.x >= p.x && d.x < p.x + p.ancho);
    }

    const enSuelo = plataformas.some((p) => d.y === p.y && d.x >= p.x && d.x < p.x + p.ancho);
    const enMuro = paredes.some(
      (p) => d.x >= p.x - 8 && d.x <= p.x + TILE + 8 && d.y > p.y0 && d.y <= p.y1,
    );
    return !enSuelo && !enMuro;
  });

  if (sueltas.length === 0) {
    console.log(`${nombre}: OK — las ${decorado.length} piezas de decorado se apoyan en algo`);
    return verificarInscripciones(nombre, src, plataformas);
  }

  console.log(`${nombre}: FALLO — decorado flotando en el aire`);
  for (const d of sueltas) {
    const queFalta = COLGANTES.has(d.tipo)
      ? 'no hay techo del que colgar'
      : 'no hay suelo ni muro ahí';
    console.log(`  "${d.tipo}" en x=${d.x} y=${d.y}: ${queFalta}`);
  }
  verificarInscripciones(nombre, src, plataformas);
  return false;
}

/**
 * Las placas del Registro también tienen que estar al alcance.
 *
 * No entraban en la comprobación del decorado y se coló una flotando, que el
 * jugador solo podía leer saltando a ciegas (issue #53). Una placa se dibuja
 * con el origen abajo, así que su `y` es la línea donde se apoya: tiene que
 * coincidir con la superficie de una plataforma, igual que el decorado de
 * suelo. Y no basta con que exista el suelo: hay que poder PONERSE delante,
 * así que se comprueba también que quepa el cuerpo del Cirujano (22 px) sin
 * que otra plataforma lo aplaste justo encima.
 */
function verificarInscripciones(nombre, src, plataformas) {
  const placas = leerTuplas(src, 'inscripciones', /\[\s*(-?\d+),\s*(-?\d+),\s*'/g).map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));

  if (placas.length === 0) return true;

  const ALTO_CIRUJANO = 22;

  const malas = placas.filter((c) => {
    const enSuelo = plataformas.some((p) => c.y === p.y && c.x >= p.x && c.x < p.x + p.ancho);
    if (!enSuelo) return true;

    // ¿Hay techo tan bajo que no se puede estar de pie delante de ella?
    return plataformas.some(
      (p) =>
        c.x >= p.x && c.x < p.x + p.ancho && p.y + TILE > c.y - ALTO_CIRUJANO && p.y + TILE <= c.y,
    );
  });

  if (malas.length === 0) {
    console.log(`${nombre}: OK — las ${placas.length} placas se pueden leer de pie`);
    return verificarFieles(nombre, src, plataformas);
  }

  console.log(`${nombre}: FALLO — placas inalcanzables`);
  for (const c of malas) {
    console.log(`  placa en x=${c.x} y=${c.y}: no se apoya en ninguna plataforma o no cabe leerla`);
  }
  verificarFieles(nombre, src, plataformas);
  return false;
}

/**
 * Los fieles con los que se habla tienen que estar de pie en algún sitio.
 *
 * Se dibujan con el origen abajo y sin física: si la `y` no coincide con la
 * superficie de una plataforma, el personaje flota y nadie se da cuenta hasta
 * verlo en pantalla. Misma comprobación que las placas y por el mismo motivo.
 */
function verificarFieles(nombre, src, plataformas) {
  const fieles = leerTuplas(src, 'fieles', /\[\s*(-?\d+),\s*(-?\d+),\s*'/g).map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));

  if (fieles.length === 0) return true;

  const sueltos = fieles.filter(
    (f) => !plataformas.some((p) => f.y === p.y && f.x >= p.x && f.x < p.x + p.ancho),
  );

  if (sueltos.length === 0) {
    console.log(`${nombre}: OK — ${fieles.length} fiel(es) de pie en el suelo`);
    return true;
  }

  console.log(`${nombre}: FALLO — fieles flotando`);
  for (const f of sueltos) console.log(`  fiel en x=${f.x} y=${f.y}: no hay plataforma ahí`);
  return false;
}

// -- Criaturas y Marea (#120) ------------------------------------------------

function leerPlataformasDe(src) {
  return leerTuplas(src, 'plataformas', /\[\s*(-?\d+),\s*(-?\d+),\s*(\d+)\s*\]/g).map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    ancho: Number(m[3]) * TILE,
  }));
}

/** Hay suelo bajo el punto (x, y): y es la cara de arriba de una plataforma. */
function haySuelo(plataformas, x, y) {
  return plataformas.some((p) => y === p.y && x >= p.x && x <= p.x + p.ancho);
}

/** Todo el tramo de x0 a x1 a la altura y es suelo, aunque sean varias plataformas. */
function sueloContinuo(plataformas, x0, x1, y) {
  for (let x = x0; x <= x1; x += TILE / 2) if (!haySuelo(plataformas, x, y)) return false;
  return haySuelo(plataformas, x1, y);
}

/**
 * Las criaturas del Vientre Humedo (src/entities/Criatura.ts) tienen que estar
 * de pie: cada una sobre suelo, los puntos de la ruta del Mondador y los
 * posaderos del Cuervo tambien, la Alfombra entera sobre el suelo, la arena
 * de la Serpiente sin huecos, y el puente de tejido de borde a borde.
 *
 * Se colocan a mano por coordenadas, como el decorado, y una criatura en el
 * aire no se ve leyendo una lista: se ve cuando un Cerdo cae al vacio.
 */
function verificarCriaturas(nombre, src) {
  const bloque = leerTuplas(src, 'criaturas', /\{\s*tipo:\s*'([a-z]+)'((?:[^{}]|\{[^{}]*\})*)\}/g);
  if (bloque.length === 0) return true;

  const plataformas = leerPlataformasDe(src);
  const num = (texto, campo) => {
    const m = texto.match(new RegExp(`\\b${campo}:\\s*(-?\\d+)`));
    return m ? Number(m[1]) : undefined;
  };
  const puntos = (texto) =>
    [...texto.matchAll(/\[\s*(-?\d+),\s*(-?\d+)\s*\]/g)].map((m) => [Number(m[1]), Number(m[2])]);

  const errores = [];
  for (const [, tipo, cuerpo] of bloque) {
    const x = num(cuerpo, 'x');
    const y = num(cuerpo, 'y');
    const donde = `${tipo} en x=${x} y=${y}`;

    if (tipo === 'mondador' || tipo === 'cuervo') {
      for (const [px, py] of puntos(cuerpo)) {
        if (!haySuelo(plataformas, px, py))
          errores.push(`${tipo}: el punto x=${px} y=${py} esta en el aire`);
      }
      continue;
    }
    if (tipo === 'tejido') {
      const fin = x + (num(cuerpo, 'anchoTiles') ?? 0) * TILE;
      if (!plataformas.some((p) => p.y === y && p.x + p.ancho === x)) {
        errores.push(`${donde}: el puente no sale del borde de una plataforma`);
      }
      if (!haySuelo(plataformas, fin, y))
        errores.push(`${donde}: el puente acaba en el aire (x=${fin})`);
      continue;
    }
    if (tipo === 'alfombra') {
      const medio = ((num(cuerpo, 'anchoTiles') ?? 1) * TILE) / 2;
      if (!sueloContinuo(plataformas, x - medio, x + medio, y))
        errores.push(`${donde}: no esta entera sobre el suelo`);
      continue;
    }
    if (!haySuelo(plataformas, x, y)) {
      errores.push(`${donde}: esta en el aire`);
      continue;
    }
    if (tipo === 'serpiente') {
      const izq = num(cuerpo, 'izquierda');
      const der = num(cuerpo, 'derecha');
      if (!sueloContinuo(plataformas, izq, der, y))
        errores.push(`${donde}: la arena ${izq}..${der} tiene huecos`);
    }
  }

  // Las bandejas del conteo (#160): una cada 20 px, todas sobre suelo.
  const conteo = src.match(/conteo: \{\s*x: (\d+), y: (\d+), piezas: (\d+)/);
  if (conteo) {
    const [x, y, piezas] = conteo.slice(1).map(Number);
    if (!sueloContinuo(plataformas, x - 8, x + (piezas - 1) * 20 + 8, y))
      errores.push(`las bandejas del conteo en x=${x} y=${y} no estan enteras sobre el suelo`);
  }

  if (errores.length === 0) {
    console.log(`${nombre}: OK — ${bloque.length} criatura(s) de pie`);
    return true;
  }
  console.log(`${nombre}: FALLO — criaturas mal colocadas`);
  for (const e of errores) console.log(`  ${e}`);
  return false;
}

/**
 * La Marea del Hambre nunca puede llegar al Altar ni al umbral (#91): seria
 * reaparecer debajo del agua, o no poder salir de la zona mientras sube. Cada
 * marea inunda su region en x (#163; sin region, todo el ancho), asi que un
 * Altar solo cuenta si esta dentro de ella y por debajo de la cresta.
 */
function verificarMarea(nombre, src) {
  const mareas = leerTuplas(src, 'mareas', /\{([^{}]*)\}/g).map((m) => {
    const campo = (c, defecto) =>
      Number(m[1].match(new RegExp(`${c}:\\s*(-?\\d+)`))?.[1] ?? defecto);
    return {
      cresta: campo('suelo') - campo('alturaMaxima', 220),
      x0: campo('x0', -Infinity),
      x1: campo('x1', Infinity),
    };
  });
  if (mareas.length === 0) return true;

  const puntos = leerTuplas(src, 'altares', /\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+)\s*\}/g).map((m) => ({
    que: `el Altar de x=${m[1]}`,
    x: Number(m[1]),
    y: Number(m[2]),
  }));
  const umbral = src.match(/umbral:\s*\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+)/);
  if (umbral)
    puntos.push({ que: `el umbral de x=${umbral[1]}`, x: Number(umbral[1]), y: Number(umbral[2]) });

  const errores = [];
  for (const [i, marea] of mareas.entries()) {
    for (const p of puntos) {
      if (p.x >= marea.x0 && p.x <= marea.x1 && p.y > marea.cresta)
        errores.push(`la marea ${i + 1} (cresta y=${marea.cresta}) cubre ${p.que} (y=${p.y})`);
    }
  }
  if (errores.length === 0) {
    console.log(`${nombre}: OK — ${mareas.length} marea(s), ninguna llega a un Altar ni al umbral`);
    return true;
  }
  console.log(`${nombre}: FALLO — la Marea cubre lo que no debe`);
  for (const e of errores) console.log(`  ${e}`);
  return false;
}

/**
 * Las reliquias que colocan los niveles tienen que ser las de
 * src/lore/Reliquias.ts, y en la misma zona (#94). Esa lista es la que cuenta
 * el total del juego y de la web: si un nivel coloca una que no esta, el
 * contador miente; si la lista tiene una que nadie coloca, el 100 % es
 * imposible. Las dos cosas se ven tarde jugando y al instante aqui.
 */
function verificarReliquias(zonas) {
  const lista = readFileSync(join(raiz, 'src/lore/Reliquias.ts'), 'utf8');
  const declaradas = new Map(
    [...lista.matchAll(/id: '([a-z0-9-]+)',\s*zona: '([A-Za-z]+)'/g)].map((m) => [m[1], m[2]]),
  );

  const colocadas = new Map();
  for (const [zona, archivo] of zonas) {
    const src = readFileSync(join(raiz, archivo), 'utf8');
    for (const m of leerTuplas(src, 'reliquias', /\[\s*-?\d+,\s*-?\d+,\s*'([a-z0-9-]+)'/g)) {
      colocadas.set(m[1], zona);
    }
  }

  const errores = [];
  for (const [id, zona] of colocadas) {
    if (!declaradas.has(id)) errores.push(`${id} (en ${zona}) no esta en Reliquias.ts`);
    else if (declaradas.get(id) !== zona)
      errores.push(`${id} esta en ${zona}, pero Reliquias.ts dice ${declaradas.get(id)}`);
  }
  for (const [id, zona] of declaradas) {
    if (!colocadas.has(id))
      errores.push(`${id} (${zona}) esta en Reliquias.ts y ningun nivel la coloca`);
  }

  if (errores.length === 0) {
    console.log(
      `Reliquias: OK — ${declaradas.size} en la lista, las mismas que colocan los niveles`,
    );
    return true;
  }
  console.log('Reliquias: FALLO');
  for (const e of errores) console.log(`  ${e}`);
  return false;
}

/**
 * Esta lista de zonas y la del mapa (src/lore/Mapa.ts, que es tambien la de lo
 * que se puede continuar) tienen que ser la misma: una zona que faltara aqui
 * no se comprobaria, y una que faltara alli no tendria plano ni guardado.
 */
function verificarZonasDelMapa(zonas) {
  const mapa = readFileSync(join(raiz, 'src/lore/Mapa.ts'), 'utf8');
  const delMapa = [...mapa.matchAll(/escena: '([A-Za-z]+)', nombre: '[^']*', nivel: (\d)/g)].map(
    (m) => `${m[1]}:${m[2]}`,
  );
  const aqui = zonas.map(([zona, , nivel]) => `${zona}:${nivel}`);
  if (delMapa.join(',') === aqui.join(',')) {
    console.log(`Zonas: OK — las ${aqui.length} del mapa, en el mismo orden y nivel`);
    return true;
  }
  console.log('Zonas: FALLO — esta lista y la de src/lore/Mapa.ts no coinciden');
  console.log(`  mapa: ${delMapa.join(', ')}`);
  console.log(`  aqui: ${aqui.join(', ')}`);
  return false;
}

/**
 * Cada hoja del Codice de un nivel jugable se coloca una vez, en una zona de
 * su nivel. Una hoja que nadie coloca deja el libro sin completar; una en otro
 * nivel hace que el cierre cuente mal.
 */
function verificarFragmentos(zonas) {
  const codice = readFileSync(join(raiz, 'src/lore/Codice.ts'), 'utf8');
  const hondo = Number(codice.match(/NIVEL_MAS_HONDO = (\d)/)[1]);
  const hojas = new Map(
    [...codice.matchAll(/id: '(codice-\d+)',\s*nivel: (\d)/g)]
      .map((m) => [m[1], Number(m[2])])
      .filter(([, nivel]) => nivel <= hondo),
  );

  const errores = [];
  const colocadas = new Map();
  for (const [zona, archivo, nivel] of zonas) {
    const src = readFileSync(join(raiz, archivo), 'utf8');
    for (const m of leerTuplas(src, 'fragmentos', /'(codice-\d+)'/g)) {
      const id = m[1];
      if (colocadas.has(id)) errores.push(`${id} esta en ${colocadas.get(id)} y en ${zona}`);
      colocadas.set(id, zona);
      if (!hojas.has(id)) errores.push(`${id} (en ${zona}) no es una hoja de un nivel jugable`);
      else if (hojas.get(id) !== nivel)
        errores.push(`${id} es del Nivel ${hojas.get(id)} y esta en ${zona} (Nivel ${nivel})`);
    }
  }
  for (const id of hojas.keys()) {
    if (!colocadas.has(id)) errores.push(`${id} no la coloca ningun nivel`);
  }

  if (errores.length === 0) {
    console.log(`Codice: OK — las ${hojas.size} hojas jugables, cada una en su nivel`);
    return true;
  }
  console.log('Codice: FALLO');
  for (const e of errores) console.log(`  ${e}`);
  return false;
}

/**
 * Lo que una zona deja ver al Registro: las claves entre comillas de su
 * definicion (criaturas, decorado, fieles) y lo que traen ciertos campos. Las
 * apariciones no cuentan: cruzan el fondo y no catalogan nada.
 */
function fichasVisiblesEn(archivo) {
  const src = archivo.replace(/apariciones: \[[^\]]*\]/g, '');
  const vistas = new Set([...src.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]));
  if (/\bflor\b/.test(src)) vistas.add('flor-de-hueso');
  if (/devotos: \[\s*\{/.test(src)) vistas.add('devoto');
  if (/vestales: \[\s*\{/.test(src)) vistas.add('vestal').add('sello');
  if (/\bjefe: \{/.test(src)) vistas.add('reformado');
  if (/altares: \[\s*\{/.test(src)) vistas.add('altar');
  if (/reliquias: \[\s*\[/.test(src)) vistas.add('reliquia');
  return vistas;
}

/** Fichas que no dependen de la zona: las trae el Cirujano consigo. */
const FICHAS_DEL_CIRUJANO = ['cirujano', 'injertadora', 'injerto'];

/**
 * Cada ficha del Registro dice desde que nivel se puede encontrar (#156), y el
 * cierre de cada nivel cuenta solo esas. Si una ficha del Nivel 1 no esta en
 * ninguna zona del Nivel 1, el Registro de ese cierre es imposible de
 * completar; si una marcada del Nivel 2 ya aparece arriba, el cierre del Nivel
 * 1 la deja fuera sin motivo. Las del Nivel 2 que aun no coloca nadie solo se
 * avisan: llegan con sus issues.
 */
function verificarFichas(zonas) {
  const registro = readFileSync(join(raiz, 'src/lore/Registro.ts'), 'utf8');
  const fichas = [...registro.matchAll(/\n {4}id: '([a-z-]+)',([\s\S]*?)\n {2}\}/g)].map((m) => ({
    id: m[1],
    nivel: /\n {4}nivel: 2,/.test(m[2]) ? 2 : 1,
  }));

  const vistasHasta = (nivel) => {
    const vistas = new Set(FICHAS_DEL_CIRUJANO);
    for (const [, archivo, n] of zonas) {
      if (n > nivel) continue;
      for (const id of fichasVisiblesEn(readFileSync(join(raiz, archivo), 'utf8'))) vistas.add(id);
    }
    return vistas;
  };
  const enNivel1 = vistasHasta(1);
  const enNivel2 = vistasHasta(2);

  const errores = [];
  const pendientes = [];
  for (const { id, nivel } of fichas) {
    if (nivel === 1 && !enNivel1.has(id))
      errores.push(`${id} es del Nivel 1 y ninguna zona del Nivel 1 la tiene`);
    if (nivel === 2 && enNivel1.has(id))
      errores.push(`${id} esta marcada del Nivel 2, pero ya se ve en el Nivel 1`);
    if (nivel === 2 && !enNivel2.has(id)) pendientes.push(id);
  }

  if (errores.length === 0) {
    const aviso = pendientes.length ? ` (aun sin colocar: ${pendientes.join(', ')})` : '';
    console.log(`Registro: OK — ${fichas.length} fichas, cada una en su nivel${aviso}`);
    return true;
  }
  console.log('Registro: FALLO');
  for (const e of errores) console.log(`  ${e}`);
  return false;
}

console.log(
  `salto simple ${alturaSalto.toFixed(0)}px · con doble ${alturaDoble.toFixed(0)}px · ` +
    `dash +${avanceDash.toFixed(0)}px`,
);

/** Las zonas jugables y su nivel. Tienen que ser las de src/lore/Mapa.ts. */
const zonas = [
  ['Atrio', 'src/scenes/AtrioScene.ts', 1],
  ['Pasillos', 'src/scenes/PasillosScene.ts', 1],
  ['Criptas', 'src/scenes/CriptasScene.ts', 1],
  ['Salas', 'src/scenes/SalasScene.ts', 1],
  ['Desague', 'src/scenes/DesagueScene.ts', 2],
  ['Galeria', 'src/scenes/GaleriaScene.ts', 2],
  ['Ductos', 'src/scenes/DuctosScene.ts', 2],
];

const resultados = zonas.map(([nombre, archivo]) => verificar(nombre, archivo));

console.log('');
for (const [nombre, archivo] of zonas) {
  resultados.push(verificarDecorado(nombre, archivo));
  const src = readFileSync(join(raiz, archivo), 'utf8');
  resultados.push(verificarCriaturas(nombre, src));
  resultados.push(verificarMarea(nombre, src));
}

console.log('');
resultados.push(verificarZonasDelMapa(zonas));
resultados.push(verificarReliquias(zonas));
resultados.push(verificarFragmentos(zonas));
resultados.push(verificarFichas(zonas));

process.exit(resultados.every(Boolean) ? 0 : 1);
