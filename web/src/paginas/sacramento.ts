/**
 * El Sacramento: práctica quirúrgica, litúrgica.
 *
 * Del bible: "minijuego de precisión quirúrgica, tipo Operation pero
 * litúrgico: sigue las instrucciones del Códice paso a paso; fallar tiene
 * consecuencias visuales en el resto del sitio". Seis pasos, cada uno con un
 * versículo del Códice: cubrir el rostro, pesar la ofrenda, abrir el esternón,
 * separar las costillas, injertar sobre el corazón entre latido y latido, y
 * sellar. Fallar deja una mancha en el portal que no se va.
 *
 * Era una mesa de formas vectoriales lisas, lo único del portal que no estaba
 * hecho con el pixel del juego, y la incisión se quedaba en una raya sobre la
 * piel (#81). Ahora todo es pixel a 160×100, el pecho se abre y dentro late
 * el corazón: el horror corporal del mundo ("quirófanos convertidos en
 * altares") sin gore realista. El rostro va cubierto: aquí nadie mira.
 *
 * Y el final, salga como salga, es el del mundo: al sellar, el tejido sale a
 * buscar el injerto ("El tejido no se apartó del filo. Vino a buscarlo") y el
 * ofrendado queda a medias. Ningún Elegido ha llegado entero en tres
 * generaciones. Hacerlo todo bien también termina en Reformado.
 */

import { lienzoDe } from '../arte';
import { manchar } from '../memoria';
import { actualizarPie } from '../pie';
import { elemento } from '../texto';

const ANCHO = 160;
const ALTO = 100;

type Paso = 'cubrir' | 'pesar' | 'incidir' | 'abrir' | 'injertar' | 'sellar' | 'fin';
const PASOS: readonly Paso[] = ['cubrir', 'pesar', 'incidir', 'abrir', 'injertar', 'sellar'];

interface Punto {
  x: number;
  y: number;
}

const C = {
  suelo: '#120c10',
  junta: '#1a1216',
  losa: '#3b2f35',
  losaLuz: '#6b5a62',
  losaSombra: '#2a2126',
  carne: '#a86a66',
  carneLuz: '#c08a7e',
  carneSombra: '#7a4a48',
  costilla: '#9a5e5a',
  pelo: '#2a1a1e',
  tela: '#cfc4a8',
  telaPliegue: '#b9ad8f',
  oro: '#c9a44c',
  sangre: '#8c2f2f',
  sangreClara: '#b5482f',
  sangreHonda: '#5a1f1f',
  cavidad: '#2a0e12',
  hueso: '#e6ddc8',
  turquesa: '#4fc1ba',
  metal: '#8a8a92',
  metalOscuro: '#4a4038',
  metalBorde: '#6b5a50',
  vena: '#4a2a4a',
  injerto: '#6a4a5a',
} as const;

/** Paleta de los dibujos hechos fila a fila. */
const PALETA: Readonly<Record<string, string>> = {
  d: C.sangreHonda,
  r: C.sangre,
  R: C.sangreClara,
  l: '#d9776a',
  v: C.vena,
  a: C.carne,
};

/* El corazón, en reposo y en el latido (se encoge y se aclara). Dibujado a mano. */
const CORAZON_REPOSO = [
  '....aa...aa....',
  '...aRRa.aRRa...',
  '..dRRRRaRRRRd..',
  '.dRRlRRRRRRRRd.',
  'dRRllRRRRRvRRRd',
  'dRRlRRRRRRvRRRd',
  'dRRRRRRRRvRRRRd',
  'dRRRRRRRvRRRRRd',
  '.dRRRRRRvRRRRd.',
  '..dRRRRRvRRRd..',
  '...dRRRRRRRd...',
  '....dRRRRRd....',
  '.....dRRRd.....',
  '......dRd......',
  '.......d.......',
];
const CORAZON_LATIDO = [
  '...aa..aa...',
  '..aRRaaRRa..',
  '.dlRRRRRRRd.',
  'dRllRRRRvRRd',
  'dRlRRRRRvRRd',
  'dRRRRRRvRRRd',
  '.dRRRRRvRRd.',
  '..dRRRRvRd..',
  '...dRRRRd...',
  '....dRRd....',
  '.....dd.....',
];

/** Cifras de 3×5 para la báscula. */
const CIFRAS: Readonly<Record<string, string>> = {
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '111001111100111',
  '3': '111001111001111',
  '4': '101101111001001',
  '5': '111100111001111',
  '6': '111100111101111',
  '7': '111001010010010',
  '8': '111101111101111',
  '9': '111101111001111',
  '.': '000000000000010',
  K: '101101110101101',
  G: '111100101101111',
};

// -- Geometría de la mesa --------------------------------------------------

const ROSTRO: Punto = { x: 80, y: 15 };
const TELA_EN_BANDEJA: Punto = { x: 22, y: 30 };
/** El esternón: donde se corta y por donde se abre. */
const ESTERNON = { desde: 30, hasta: 58 };
const CORAZON: Punto = { x: 80, y: 44 };
const SELLO_META: Punto = { x: 80, y: 44 };
const BASCULA = { x: 133, arriba: 24, abajo: 84 };
const BANDA_PESO = { desde: 0.58, hasta: 0.72 };
/** Apertura del pecho, en pixeles: lo que basta y lo que rompe. */
const APERTURA = { basta: 18, rompe: 27, tras: 21 };

/** La línea del esternón: baja recta, con una curva leve. */
function centroEsternon(y: number): number {
  const t = (y - ESTERNON.desde) / (ESTERNON.hasta - ESTERNON.desde);
  return 80 + Math.round(Math.sin(t * Math.PI) * 1.5);
}

const INCISION: Punto[] = [];
for (let y = ESTERNON.desde; y <= ESTERNON.hasta; y += 1) {
  INCISION.push({ x: centroEsternon(y), y });
}

function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function renderSacramento(contenedor: HTMLElement): () => void {
  const raiz = elemento(`
    <article>
      <div class="eyebrow">Sacramentos · práctica</div>
      <h1>El Sacramento</h1>
      <div class="filete"></div>
      <p class="lede">
        Práctica guiada para aspirantes a Manos. Seis pasos, cada uno con su versículo. Puede
        usar el ratón o el dedo. Lea la instrucción y hágala tal cual; el Códice no admite
        preguntas y esta práctica tampoco.
      </p>
      <div class="juego-marco">
        <canvas id="lienzo" class="lienzo-pixel" width="${ANCHO}" height="${ALTO}" aria-label="Mesa del sacramento"></canvas>
        <div class="juego-instruccion" id="instruccion"></div>
        <div class="juego-estado" id="estado"></div>
        <p style="margin:12px 0 0"><button type="button" id="reiniciar">Empezar de nuevo</button></p>
      </div>
      <p style="margin-top:16px"><a href="#/sacramentos">← Volver a los Sacramentos</a></p>
    </article>
  `);
  contenedor.append(raiz);

  const lienzo = raiz.querySelector('#lienzo') as HTMLCanvasElement;
  const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  const instruccion = raiz.querySelector('#instruccion') as HTMLElement;
  const estado = raiz.querySelector('#estado') as HTMLElement;
  const reiniciar = raiz.querySelector('#reiniciar') as HTMLButtonElement;
  const vela = lienzoDe('vela', 1);

  // -- Estado -----------------------------------------------------------------
  let paso: Paso = 'cubrir';
  const resultados: Partial<Record<Paso, boolean>> = {};
  let puntero: Punto | null = null;
  let pulsado = false;
  let animacion = 0;

  // Cubrir: la tela se arrastra de la bandeja al rostro.
  let tela: Punto = { ...TELA_EN_BANDEJA };
  let arrastrandoTela = false;
  let telaColocada = false;

  // Pesar: la aguja sube mientras se mantiene pulsado.
  let aguja = 0;
  let pesoFijado = false;

  // Incidir: se sigue la línea sin salirse.
  let avance = 0;
  let cortando = false;
  let desvio = 0;
  let cortado: Punto[] = [];

  // Abrir: se arrastra el separador hacia un lado.
  let apertura = 0;
  let abriendo: number | null = null;
  let costillaRota = false;

  // Injertar: tres puntos entre latido y latido.
  let puntos: Punto[] = [];
  let latidoDesde = 0;
  let proximoLatido = 0;

  // Sellar: el sello deriva; hay que soltarlo cuando pasa por la marca.
  let selloFase = 0;
  let selloPuesto: Punto | null = null;
  let cerrandoDesde = 0;

  // El final: el tejido sale a buscar el injerto.
  let finDesde = 0;
  let zarcillos: Punto[][] = [];

  const mensajes: Record<Paso, string> = {
    cubrir:
      'Códice II, 4 · "Se cubrirá el rostro antes de la incisión."  Arrastra la tela de la bandeja sobre el rostro.',
    pesar:
      'Códice III, 1 · "Se pesará la ofrenda. Las dos cifras, al Registro."  Mantén pulsado para subir la aguja de la báscula y suelta dentro de la banda.',
    incidir:
      'Códice VI, 1 · "Las Manos no eligen: ejecutan."  Sigue la línea del esternón con el bisturí, de arriba abajo, sin salirte.',
    abrir:
      'Códice III, 1 · "El dios solo conoce lo que toca."  Arrastra el separador hacia un lado hasta abrir el pecho. Sin romper hueso.',
    injertar:
      'Códice V, 9 · "La carne serena es carne grata."  Da tres puntos al injerto sobre el corazón, entre latido y latido. Nunca mientras late.',
    sellar:
      'Códice IV, 7 · "No se admite otra moneda."  El sello deriva sobre el pecho cerrado. Pulsa cuando pase por la marca.',
    fin: '',
  };

  function avanzar(exito: boolean): void {
    resultados[paso] = exito;
    const i = PASOS.indexOf(paso);
    paso = i >= 0 && i < PASOS.length - 1 ? PASOS[i + 1] : 'fin';
    if (paso === 'sellar') cerrandoDesde = performance.now();
    if (paso === 'fin') terminar();
    else pintarEstado();
    lienzo.style.cursor = paso === 'incidir' || paso === 'injertar' ? 'none' : '';
  }

  function pintarEstado(): void {
    if (paso !== 'fin') instruccion.textContent = mensajes[paso];
    estado.innerHTML = PASOS.map((p) => {
      const r = resultados[p];
      const marca = r === undefined ? (p === paso ? '▸' : '·') : r ? '✓' : '✗';
      return `<span>${marca} ${p}</span>`;
    }).join('');
  }

  function terminar(): void {
    finDesde = performance.now();
    zarcillos = brotar();
    pintarEstado();
    const fallos = PASOS.filter((p) => resultados[p] === false).length;
    if (fallos > 0) {
      manchar();
      actualizarPie();
      instruccion.textContent = `Práctica no superada (${fallos} ${fallos === 1 ? 'paso incorrecto' : 'pasos incorrectos'}). Se anota en su expediente. La mancha del portal es suya.`;
    } else {
      instruccion.textContent =
        'Práctica superada. Resultado del ofrendado: integración parcial. Clasificar como Reformado. — No se preocupe: lo ha hecho todo bien. Siempre acaba así.';
    }
  }

  function reiniciarTodo(): void {
    paso = 'cubrir';
    for (const p of PASOS) delete resultados[p];
    tela = { ...TELA_EN_BANDEJA };
    arrastrandoTela = false;
    telaColocada = false;
    aguja = 0;
    pesoFijado = false;
    avance = 0;
    cortando = false;
    desvio = 0;
    cortado = [];
    apertura = 0;
    abriendo = null;
    costillaRota = false;
    puntos = [];
    selloFase = 0;
    selloPuesto = null;
    zarcillos = [];
    lienzo.style.cursor = '';
    pintarEstado();
  }

  /** Los zarcillos del final: nacen en la incisión y salen hacia fuera. */
  function brotar(): Punto[][] {
    const lista: Punto[][] = [];
    for (let i = 0; i < 9; i += 1) {
      const y0 =
        ESTERNON.desde + 2 + Math.floor(Math.random() * (ESTERNON.hasta - ESTERNON.desde - 4));
      const lado = i % 2 === 0 ? -1 : 1;
      let x = centroEsternon(y0);
      let y = y0;
      const camino: Punto[] = [];
      const largo = 16 + Math.floor(Math.random() * 22);
      for (let k = 0; k < largo; k += 1) {
        if (Math.random() < 0.75) x += lado;
        y += Math.floor(Math.random() * 3) - 1;
        camino.push({ x, y });
      }
      lista.push(camino);
    }
    return lista;
  }

  // -- Latido -------------------------------------------------------------------

  /** ¿Está el corazón en pleno latido? Irregular, como debe ser. */
  function enLatido(t: number): boolean {
    if (t >= proximoLatido) {
      latidoDesde = proximoLatido;
      proximoLatido = t + 760 + Math.random() * 520;
    }
    return t - latidoDesde < 280;
  }

  // -- Entrada ---------------------------------------------------------------
  function coordenadas(e: PointerEvent): Punto {
    const r = lienzo.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ANCHO,
      y: ((e.clientY - r.top) / r.height) * ALTO,
    };
  }

  /**
   * Tolerancia en pixeles del lienzo: nunca menos de `minimo`, ni menos de lo
   * que ocupan `css` pixeles en pantalla. En un teléfono el lienzo mide la
   * mitad y el dedo tapa la línea; sin esto, cortar con el dedo era imposible.
   */
  function holgura(minimo: number, css: number): number {
    return Math.max(minimo, css / (lienzo.getBoundingClientRect().width / ANCHO));
  }

  const alPulsar = (e: PointerEvent) => {
    e.preventDefault();
    lienzo.setPointerCapture(e.pointerId);
    const p = coordenadas(e);
    puntero = p;
    pulsado = true;
    const t = performance.now();

    if (paso === 'cubrir' && distancia(p, tela) < 10) arrastrandoTela = true;
    if (paso === 'incidir' && distancia(p, INCISION[0]) < holgura(5, 22)) {
      cortando = true;
      avance = 0;
      desvio = 0;
      cortado = [];
    }
    if (
      paso === 'abrir' &&
      Math.abs(p.x - 80) < 10 &&
      p.y > ESTERNON.desde - 3 &&
      p.y < ESTERNON.hasta + 3
    ) {
      abriendo = p.x;
    }
    if (paso === 'injertar' && distancia(p, CORAZON) < 9) {
      if (enLatido(t)) {
        avanzar(false);
        return;
      }
      puntos.push({ x: Math.round(p.x), y: Math.round(p.y) });
      if (puntos.length >= 3) avanzar(true);
    }
    if (paso === 'sellar' && t - cerrandoDesde > 600) {
      const pos = posicionSello();
      selloPuesto = { x: Math.round(pos.x), y: Math.round(pos.y) };
      avanzar(distancia(pos, SELLO_META) < holgura(4, 12));
    }
  };

  const alMover = (e: PointerEvent) => {
    const p = coordenadas(e);
    puntero = p;
    if (arrastrandoTela) tela = p;
    if (abriendo !== null) {
      apertura = Math.min(24, Math.abs(p.x - abriendo));
      if (apertura >= APERTURA.rompe) {
        // Se oye el hueso.
        abriendo = null;
        costillaRota = true;
        apertura = APERTURA.tras;
        avanzar(false);
      }
    }
    if (cortando) {
      // ¿Cuál es el punto de la línea más cercano al bisturí, por delante?
      let mejor = avance;
      let mejorD = Infinity;
      for (let i = avance; i < Math.min(INCISION.length, avance + 5); i += 1) {
        const d = distancia(p, INCISION[i]);
        if (d < mejorD) {
          mejorD = d;
          mejor = i;
        }
      }
      avance = mejor;
      cortado.push({ x: Math.round(p.x), y: Math.round(p.y) });
      const margen = holgura(3.5, 14);
      if (mejorD > margen) desvio += mejorD - margen;
      if (avance >= INCISION.length - 1) {
        cortando = false;
        avanzar(desvio < 30);
      }
    }
  };

  const alSoltar = (e: PointerEvent) => {
    pulsado = false;
    if (arrastrandoTela) {
      arrastrandoTela = false;
      telaColocada = distancia(tela, ROSTRO) < 7;
      if (telaColocada) tela = { ...ROSTRO };
      avanzar(telaColocada);
    }
    if (paso === 'pesar' && !pesoFijado && aguja > 0) {
      pesoFijado = true;
      avanzar(aguja >= BANDA_PESO.desde && aguja <= BANDA_PESO.hasta);
    }
    if (cortando) {
      cortando = false;
      avanzar(false);
    }
    if (abriendo !== null) {
      abriendo = null;
      const bien = apertura >= APERTURA.basta;
      // Si no cede, otras manos terminan de abrir: el sacramento sigue.
      apertura = Math.max(apertura, APERTURA.tras);
      avanzar(bien);
    }
    if (e.pointerType !== 'mouse') puntero = null;
    lienzo.releasePointerCapture(e.pointerId);
  };

  const alSalir = () => {
    if (!pulsado) puntero = null;
  };

  lienzo.addEventListener('pointerdown', alPulsar);
  lienzo.addEventListener('pointermove', alMover);
  lienzo.addEventListener('pointerup', alSoltar);
  lienzo.addEventListener('pointercancel', alSoltar);
  lienzo.addEventListener('pointerleave', alSalir);
  reiniciar.addEventListener('click', reiniciarTodo);

  function posicionSello(): Punto {
    // Deriva en un ocho lento alrededor de la marca.
    return {
      x: SELLO_META.x + Math.sin(selloFase) * 16,
      y: SELLO_META.y + Math.sin(selloFase * 2) * 8,
    };
  }

  // -- Pixel ---------------------------------------------------------------------

  const px = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  };
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  /** Elipse rellena, fila a fila, sin suavizado. */
  const elipse = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    for (let y = -ry; y <= ry; y += 1) {
      const dx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)));
      rect(cx - dx, cy + y, dx * 2 + 1, 1, color);
    }
  };
  /** Un dibujo de filas centrado en (cx, cy); `dentro` decide qué pixel se ve. */
  const dibujo = (
    filas: readonly string[],
    cx: number,
    cy: number,
    dentro: (x: number, y: number) => boolean = () => true,
  ) => {
    const x0 = cx - Math.floor(filas[0].length / 2);
    const y0 = cy - Math.floor(filas.length / 2);
    filas.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x += 1) {
        const color = PALETA[fila[x]];
        if (color && dentro(x0 + x, y0 + y)) px(x0 + x, y0 + y, color);
      }
    });
  };
  const texto = (cadena: string, x: number, y: number, color: string) => {
    let cx = x;
    for (const letra of cadena) {
      const forma = CIFRAS[letra];
      if (forma) {
        for (let i = 0; i < 15; i += 1)
          if (forma[i] === '1') px(cx + (i % 3), y + Math.floor(i / 3), color);
      }
      cx += 4;
    }
  };

  // -- Dibujo ----------------------------------------------------------------

  /** Media anchura de la abertura del pecho en la fila y. */
  const abertura = (y: number, a: number) => {
    if (y <= ESTERNON.desde || y >= ESTERNON.hasta) return -1;
    const t = (y - ESTERNON.desde) / (ESTERNON.hasta - ESTERNON.desde);
    return Math.round((a / 2) * Math.sin(t * Math.PI)) - 1;
  };

  function pintarSala(t: number): void {
    rect(0, 0, ANCHO, ALTO, C.suelo);
    for (let y = 0; y < ALTO; y += 16) rect(0, y, ANCHO, 1, C.junta);
    for (let y = 0; y < ALTO; y += 16) {
      const desplazado = (y / 16) % 2 === 0 ? 0 : 8;
      for (let x = desplazado; x < ANCHO; x += 16) rect(x, y, 1, 16, C.junta);
    }
    // La losa del altar.
    rect(46, 2, 69, 97, C.losa);
    rect(46, 2, 69, 1, C.losaLuz);
    rect(46, 2, 1, 97, C.losaLuz);
    rect(114, 3, 1, 96, C.losaSombra);
    rect(47, 98, 68, 1, C.losaSombra);
    // Dos velas del juego, a la cabecera. La llama respira.
    if (vela) {
      for (const vx of [39, 117]) {
        ctx.drawImage(vela, vx, 3);
        const brillo = 0.5 + 0.5 * Math.sin(t / 140 + vx);
        if (brillo > 0.7) px(vx + 2, 3, '#fff3c4');
      }
    }
  }

  function pintarBandeja(): void {
    rect(6, 20, 32, 58, C.metalOscuro);
    rect(6, 20, 32, 1, C.metalBorde);
    rect(6, 20, 1, 58, C.metalBorde);
    rect(37, 21, 1, 57, '#2c2522');
    rect(7, 77, 31, 1, '#2c2522');
    // El bisturí, de mango dorado grabado, si no está en la mano.
    if (paso !== 'incidir' && resultados.incidir === undefined) {
      rect(13, 48, 4, 1, C.hueso);
      px(12, 48, C.turquesa);
      rect(17, 48, 9, 1, C.oro);
      px(19, 47, C.oro);
      px(23, 47, C.oro);
    }
    // El separador, hasta que se usa.
    if (resultados.abrir === undefined && paso !== 'abrir') {
      rect(14, 59, 2, 6, C.metal);
      rect(26, 59, 2, 6, C.metal);
      rect(14, 61, 14, 1, C.metal);
    }
    // La aguja curva y su hilo.
    if (paso !== 'injertar' && resultados.injertar === undefined) {
      px(14, 71, C.metal);
      px(15, 70, C.metal);
      px(16, 70, C.metal);
      px(17, 71, C.metal);
      rect(18, 72, 8, 1, C.turquesa);
    }
  }

  function pintarBascula(): void {
    const { x, arriba, abajo } = BASCULA;
    rect(x - 9, abajo, 26, 4, C.metalOscuro);
    rect(x - 9, abajo, 26, 1, C.metalBorde);
    rect(x, arriba, 9, abajo - arriba, C.losa);
    rect(x, arriba, 1, abajo - arriba, C.losaLuz);
    // Marcas cada décimo.
    for (let i = 1; i < 10; i += 1)
      rect(x + 1, abajo - Math.round(((abajo - arriba) * i) / 10), 2, 1, C.losaLuz);
    // La banda que acepta el Registro.
    if (paso === 'pesar') {
      const yb = abajo - Math.round(BANDA_PESO.hasta * (abajo - arriba));
      const hb = Math.round((BANDA_PESO.hasta - BANDA_PESO.desde) * (abajo - arriba));
      ctx.globalAlpha = 0.45;
      rect(x + 1, yb, 8, hb, C.turquesa);
      ctx.globalAlpha = 1;
    }
    // La aguja.
    const ya = abajo - Math.round(aguja * (abajo - arriba));
    rect(x - 2, ya, 13, 1, C.oro);
    // El cuenco con la ofrenda, arriba, hasta que se injerta.
    rect(x - 3, arriba - 4, 15, 4, C.metal);
    rect(x - 2, arriba - 1, 13, 1, C.metalOscuro);
    if (resultados.injertar === undefined && paso !== 'injertar') {
      elipse(x + 4, arriba - 5, 4, 2, C.injerto);
      px(x + 3, arriba - 6, C.vena);
      px(x + 6, arriba - 5, C.vena);
    }
    // Las cifras, para el Registro.
    texto(`${(aguja * 20).toFixed(1)}KG`, x - 8, abajo + 7, paso === 'pesar' ? C.hueso : C.metal);
  }

  function pintarOfrendado(t: number, latiendo: boolean): void {
    const a =
      paso === 'sellar' || paso === 'fin'
        ? Math.max(0, APERTURA.tras * (1 - (t - cerrandoDesde) / 500))
        : apertura;

    // Brazos, a los lados.
    for (const bx of [58, 97]) {
      rect(bx, 28, 6, 40, C.carne);
      rect(bx, 28, 1, 40, C.carneLuz);
      rect(bx + 5, 28, 1, 40, C.carneSombra);
      elipse(bx + 3, 69, 3, 2, C.carneLuz);
    }
    // Torso, con los hombros redondeados contra la losa.
    rect(64, 24, 33, 46, C.carne);
    rect(67, 23, 27, 1, C.carne);
    rect(64, 26, 1, 44, C.carneLuz);
    rect(96, 26, 1, 44, C.carneSombra);
    for (const [x, y] of [
      [64, 24],
      [65, 24],
      [64, 25],
      [96, 24],
      [95, 24],
      [96, 25],
    ]) {
      px(x, y, C.losa);
    }
    // Las costillas se adivinan bajo la piel.
    for (const y of [33, 38, 43, 48]) {
      rect(68, y, 8, 1, C.costilla);
      rect(85, y, 8, 1, C.costilla);
    }
    px(80, 62, C.carneSombra);
    // El latido se ve a través de la piel antes de abrir.
    if (latiendo && a < 2) elipse(CORAZON.x, CORAZON.y, 4, 4, '#b0706a');
    // Cuello y cabeza; los ojos cerrados: nadie entra despierto.
    rect(77, 21, 7, 3, C.carneSombra);
    elipse(ROSTRO.x, ROSTRO.y, 6, 7, C.carne);
    elipse(ROSTRO.x, ROSTRO.y - 4, 6, 3, C.pelo);
    rect(77, 15, 2, 1, C.carneSombra);
    rect(82, 15, 2, 1, C.carneSombra);
    rect(79, 19, 3, 1, C.carneSombra);
    // La sábana, de la cintura abajo, con su filete de oro.
    rect(55, 64, 51, 35, C.tela);
    rect(55, 64, 51, 1, C.oro);
    for (const x of [62, 71, 88, 97]) rect(x, 66, 1, 33, C.telaPliegue);

    // La incisión: la guía, lo cortado, o la herida.
    if (paso === 'incidir') {
      for (let i = 0; i < INCISION.length; i += 2) px(INCISION[i].x, INCISION[i].y, '#d9b8a8');
      px(INCISION[0].x, INCISION[0].y, C.turquesa);
    }
    for (const p of cortado) px(p.x, p.y, C.sangre);
    if (resultados.incidir !== undefined && a < 1) {
      for (const p of INCISION) px(p.x, p.y, C.sangreHonda);
      if (paso === 'sellar' || paso === 'fin') {
        for (let i = 2; i < INCISION.length - 1; i += 3) {
          px(INCISION[i].x - 1, INCISION[i].y, C.turquesa);
          px(INCISION[i].x + 1, INCISION[i].y, C.turquesa);
        }
      }
    }

    // El pecho abierto: la cavidad, las costillas cortadas y el corazón.
    if (a >= 1) {
      for (let y = ESTERNON.desde; y <= ESTERNON.hasta; y += 1) {
        const w = abertura(y, a);
        if (w < 0) continue;
        const cx = centroEsternon(y);
        // En el latido, la cavidad entera se enciende: es la señal de no tocar.
        rect(cx - w, y, w * 2 + 1, 1, latiendo ? '#3e1418' : C.cavidad);
        px(cx - w - 1, y, latiendo ? C.sangreClara : C.sangreHonda);
        px(cx + w + 1, y, latiendo ? C.sangreClara : C.sangreHonda);
      }
      for (const y of [33, 38, 43, 48, 53]) {
        const w = abertura(y, a);
        if (w < 1) continue;
        const cx = centroEsternon(y);
        px(cx - w - 1, y, C.hueso);
        px(cx + w + 1, y, C.hueso);
        if (costillaRota && y === 43) {
          px(cx + w, y + 1, C.hueso);
          px(cx + w - 1, y + 2, C.hueso);
        }
      }
      const dentro = (x: number, y: number) => {
        const w = abertura(y, a);
        return w >= 0 && Math.abs(x - centroEsternon(y)) <= w;
      };
      dibujo(latiendo ? CORAZON_LATIDO : CORAZON_REPOSO, CORAZON.x, CORAZON.y, dentro);
      // El injerto, cosido arriba a la derecha, donde salen los vasos.
      if (paso === 'injertar' || resultados.injertar !== undefined) {
        const gx = CORAZON.x + 4;
        const gy = CORAZON.y - 4;
        for (const [dx, dy, color] of [
          [0, 0, C.injerto],
          [1, 0, C.injerto],
          [2, 0, C.vena],
          [-1, 1, C.vena],
          [0, 1, C.injerto],
          [1, 1, C.injerto],
          [2, 1, C.injerto],
          [0, 2, C.vena],
          [1, 2, C.vena],
        ] as const) {
          if (dentro(gx + dx, gy + dy)) px(gx + dx, gy + dy, color);
        }
      }
      for (const p of puntos) {
        px(p.x - 1, p.y - 1, C.turquesa);
        px(p.x, p.y, C.turquesa);
        px(p.x + 1, p.y + 1, C.turquesa);
      }
      // El separador, agarrado a los dos bordes.
      if (paso === 'abrir' || resultados.abrir !== undefined) {
        const w = abertura(44, a);
        rect(80 - w - 3, 42, 2, 5, C.metal);
        rect(80 + w + 2, 42, 2, 5, C.metal);
        rect(80 - w - 9, 44, 6, 1, C.metal);
        rect(80 + w + 4, 44, 6, 1, C.metal);
      }
    }
    // El separador en la mano, antes de abrir.
    if (paso === 'abrir' && a < 1) {
      rect(77, 42, 2, 5, C.metal);
      rect(82, 42, 2, 5, C.metal);
      rect(77, 44, 7, 1, C.metal);
    }
  }

  function pintarTela(): void {
    const x = Math.round(tela.x) - 7;
    const y = Math.round(tela.y) - 5;
    rect(x, y, 14, 10, C.tela);
    rect(x, y + 9, 14, 1, C.telaPliegue);
    rect(x + 13, y, 1, 10, C.telaPliegue);
    rect(x + 2, y + 2, 10, 1, C.oro);
    rect(x + 2, y + 7, 10, 1, C.oro);
    rect(x + 2, y + 2, 1, 6, C.oro);
    rect(x + 11, y + 2, 1, 6, C.oro);
  }

  function pintarSello(): void {
    if (paso !== 'sellar' && resultados.sellar === undefined) return;
    // La marca, en punteado de oro.
    for (let i = 0; i < 16; i += 2) {
      const ang = (i / 16) * Math.PI * 2;
      px(
        SELLO_META.x + Math.round(Math.cos(ang) * 4),
        SELLO_META.y + Math.round(Math.sin(ang) * 4),
        C.oro,
      );
    }
    const pos = selloPuesto ?? posicionSello();
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    elipse(x, y, 3, 3, C.sangre);
    px(x - 1, y - 2, C.sangreClara);
    px(x - 2, y - 1, C.sangreClara);
    // Un anillo de oro: el sello del Registro, sin más emblema.
    for (const [dx, dy] of [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ]) {
      px(x + dx, y + dy, C.oro);
    }
  }

  function pintarHerramienta(): void {
    if (!puntero) return;
    const x = Math.round(puntero.x);
    const y = Math.round(puntero.y);
    if (paso === 'incidir') {
      // El bisturí: la punta en el puntero, el mango hacia arriba a la derecha.
      px(x, y, C.turquesa);
      for (let i = 1; i < 4; i += 1) px(x + i, y - i, C.hueso);
      for (let i = 4; i < 11; i += 1) px(x + i, y - i, C.oro);
      px(x + 6, y - 5, C.oro);
    }
    if (paso === 'injertar') {
      px(x, y, C.metal);
      px(x + 1, y - 1, C.metal);
      px(x + 2, y - 1, C.metal);
      px(x + 3, y, C.metal);
      for (let i = 0; i < 6; i += 1) px(x + 4 + i, y + 1 + Math.floor(i / 3), C.turquesa);
    }
  }

  function pintarFinal(t: number): void {
    if (paso !== 'fin' || !zarcillos.length) return;
    const k = Math.min(1, (t - finDesde) / 3500);
    for (const camino of zarcillos) {
      const hasta = Math.floor(camino.length * k);
      for (let i = 0; i < hasta; i += 1) {
        px(camino[i].x, camino[i].y, i % 5 === 0 ? C.sangreHonda : C.vena);
      }
    }
    // Late otra cosa bajo la piel, y no al ritmo de antes.
    if (Math.sin(t / 110) > 0.6) elipse(CORAZON.x, CORAZON.y, 3, 3, C.injerto);
  }

  function dibujar(t: number): void {
    const latiendo = enLatido(t);
    if (paso === 'pesar' && pulsado && !pesoFijado) aguja = Math.min(1, aguja + 0.006);
    if (paso === 'sellar') selloFase += 0.022;

    pintarSala(t);
    pintarBandeja();
    pintarBascula();
    pintarOfrendado(t, latiendo);
    pintarTela();
    pintarSello();
    pintarFinal(t);
    pintarHerramienta();

    animacion = requestAnimationFrame(dibujar);
  }

  pintarEstado();
  proximoLatido = performance.now() + 400;
  animacion = requestAnimationFrame(dibujar);

  return () => {
    cancelAnimationFrame(animacion);
    lienzo.removeEventListener('pointerdown', alPulsar);
    lienzo.removeEventListener('pointermove', alMover);
    lienzo.removeEventListener('pointerup', alSoltar);
    lienzo.removeEventListener('pointercancel', alSoltar);
    lienzo.removeEventListener('pointerleave', alSalir);
  };
}
