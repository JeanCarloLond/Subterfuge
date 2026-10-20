/**
 * El ambiente del portal: lo que hace que una página web se sienta como el
 * Vientre y no como un folleto (issue #80).
 *
 * Todo sale del juego, no de un banco de imágenes:
 *
 *   - LOS MUROS son los del propio juego. La sillería del Atrio es el tileset
 *     del equipo (`vientre.png`); la chapa de los Pasillos, la vena de las
 *     Criptas y la máquina de las Salas son las mismas figuras que pinta el
 *     juego en cada zona. Al cambiar de sección cambia el muro: descender es
 *     degradarse, y aquí se ve en la pared, igual que jugando.
 *   - EL POLVO es el del juego: motas que caen despacio, del color de la capa
 *     (cálido arriba, gris en las Criptas, rojizo en las Salas).
 *   - LA LUZ es una vela que acompaña al puntero. El Vientre está a oscuras y
 *     el visitante lee con lo que lleva en la mano, como en la Vigilia.
 *   - LA MÚSICA son las pistas CC0 del juego, una por capa, y no suena hasta
 *     que el visitante la pide: un portal que grita al abrirse se cierra.
 *
 * Con `prefers-reduced-motion` el polvo se queda quieto, la vela no sigue al
 * puntero y no hay transiciones: la página se lee igual.
 */

import { lienzoDe } from './arte';

const BASE = import.meta.env.BASE_URL;
const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const CON_DEDOS = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

/** Tamaño de cada pixel del arte en la pared, en px de pantalla. */
const PIXEL_MURO = 3;

interface Capa {
  /** De qué está hecho el muro: el tileset del equipo o un par de figuras. */
  muro: 'silleria' | readonly [string, string];
  /** Color de las motas de polvo. */
  polvo: string;
  /** Pista de música (sin extensión). */
  musica: string;
}

/** Una entrada por profundidad, de la portada (0) a los Sacramentos (5). */
const CAPAS: readonly Capa[] = [
  { muro: 'silleria', polvo: '201, 180, 138', musica: 'atrio-redoble' },
  { muro: 'silleria', polvo: '201, 180, 138', musica: 'atrio-redoble' },
  {
    muro: ['muro-pasillos-a', 'muro-pasillos-b'],
    polvo: '184, 170, 150',
    musica: 'pasillos-pulso',
  },
  {
    muro: ['muro-criptas-a', 'muro-criptas-b'],
    polvo: '150, 150, 160',
    musica: 'criptas-redoble-ominoso',
  },
  { muro: ['muro-salas-a', 'muro-salas-b'], polvo: '168, 122, 122', musica: 'salas-urgencia' },
  {
    muro: ['muro-salas-b', 'muro-salas-a'],
    polvo: '178, 108, 104',
    musica: 'jefe-tambores',
  },
];

// -- Muros -------------------------------------------------------------------

const cacheMuros = new Map<string, string>();

/** Mosaico de dos figuras en damero: una sola baldosa repetida se lee como papel pintado. */
function muroDeFiguras(a: string, b: string): string {
  const clave = `${a}|${b}`;
  const guardado = cacheMuros.get(clave);
  if (guardado) return guardado;

  const ta = lienzoDe(a, 1);
  const tb = lienzoDe(b, 1);
  if (!ta || !tb) return '';
  const lado = ta.width;
  const lienzo = document.createElement('canvas');
  lienzo.width = lado * 4;
  lienzo.height = lado * 2;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return '';
  // Damero con la segunda fila desplazada, como la sillería del juego.
  const orden = [ta, tb, tb, ta, tb, ta, ta, tb];
  orden.forEach((pieza, i) => ctx.drawImage(pieza, (i % 4) * lado, Math.floor(i / 4) * lado));
  const url = lienzo.toDataURL('image/png');
  cacheMuros.set(clave, url);
  return url;
}

/**
 * La sillería del Atrio es el tileset del equipo: ocho ladrillos en tira.
 * Se compone en dos hiladas, la segunda desplazada medio ladrillo, para que
 * no se vean columnas de juntas alineadas.
 */
function muroDeSilleria(alTerminar: (url: string) => void): void {
  const guardado = cacheMuros.get('silleria');
  if (guardado) {
    alTerminar(guardado);
    return;
  }
  const imagen = new Image();
  imagen.onload = () => {
    const lienzo = document.createElement('canvas');
    lienzo.width = imagen.width;
    lienzo.height = imagen.height * 2;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imagen, 0, 0);
    const mitad = imagen.width / 2;
    ctx.drawImage(imagen, mitad, 0, mitad, imagen.height, 0, imagen.height, mitad, imagen.height);
    ctx.drawImage(imagen, 0, 0, mitad, imagen.height, mitad, imagen.height, mitad, imagen.height);
    const url = lienzo.toDataURL('image/png');
    cacheMuros.set('silleria', url);
    alTerminar(url);
  };
  imagen.src = `${BASE}assets/tilesets/vientre.png`;
}

function ponerMuro(profundidad: number): void {
  const capa = CAPAS[profundidad] ?? CAPAS[0];
  const raiz = document.documentElement.style;

  const aplicar = (url: string, ancho: number, alto: number) => {
    raiz.setProperty('--muro', `url(${url})`);
    raiz.setProperty('--muro-tamano', `${ancho * PIXEL_MURO}px ${alto * PIXEL_MURO}px`);
  };

  if (capa.muro === 'silleria') {
    muroDeSilleria((url) => aplicar(url, 128, 32));
  } else {
    const url = muroDeFiguras(capa.muro[0], capa.muro[1]);
    if (url) aplicar(url, 64, 32);
  }
}

// -- Polvo -------------------------------------------------------------------

interface Mota {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fase: number;
}

let colorPolvo = CAPAS[0].polvo;

function arrancarPolvo(): void {
  const lienzo = document.getElementById('polvo') as HTMLCanvasElement | null;
  const ctx = lienzo?.getContext('2d');
  if (!lienzo || !ctx) return;

  let ancho = 0;
  let alto = 0;
  const motas: Mota[] = [];
  const ajustar = () => {
    ancho = lienzo.width = window.innerWidth;
    alto = lienzo.height = window.innerHeight;
  };
  ajustar();
  window.addEventListener('resize', ajustar);

  const cantidad = Math.round(Math.min(70, (ancho * alto) / 26000));
  for (let i = 0; i < cantidad; i += 1) {
    motas.push({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      vx: (Math.random() - 0.5) * 0.12,
      vy: 0.05 + Math.random() * 0.18,
      r: Math.random() < 0.8 ? 1 : 2,
      fase: Math.random() * Math.PI * 2,
    });
  }

  const pintar = (t: number) => {
    ctx.clearRect(0, 0, ancho, alto);
    for (const m of motas) {
      if (!QUIETO) {
        m.x += m.vx + Math.sin(t / 2400 + m.fase) * 0.06;
        m.y += m.vy;
        if (m.y > alto + 4) {
          m.y = -4;
          m.x = Math.random() * ancho;
        }
        if (m.x < -4) m.x = ancho + 4;
        if (m.x > ancho + 4) m.x = -4;
      }
      // Parpadeo lento: el polvo entra y sale de la luz.
      const alfa = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t / 1700 + m.fase));
      ctx.fillStyle = `rgba(${colorPolvo}, ${alfa})`;
      // Cuadrado, no círculo: es una mota del juego, no una partícula de anuncio.
      ctx.fillRect(Math.round(m.x), Math.round(m.y), m.r * 2, m.r * 2);
    }
    if (!QUIETO) requestAnimationFrame(pintar);
  };
  requestAnimationFrame(pintar);
}

// -- La vela del visitante ----------------------------------------------------

function arrancarLuz(): void {
  const luz = document.getElementById('luz');
  if (!luz) return;
  if (QUIETO || CON_DEDOS) {
    // Sin puntero que seguir, la luz se queda arriba: la que entra por el Atrio.
    luz.classList.add('fija');
    return;
  }

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 3;
  let objetivoX = x;
  let objetivoY = y;
  window.addEventListener('pointermove', (evento) => {
    objetivoX = evento.clientX;
    objetivoY = evento.clientY;
  });

  const seguir = () => {
    // La llama va un poco por detrás de la mano: es una vela, no un cursor.
    x += (objetivoX - x) * 0.09;
    y += (objetivoY - y) * 0.09;
    luz.style.setProperty('--luz-x', `${x}px`);
    luz.style.setProperty('--luz-y', `${y}px`);
    requestAnimationFrame(seguir);
  };
  requestAnimationFrame(seguir);
}

// -- Música --------------------------------------------------------------------

const CLAVE_MUSICA = 'diocesis.musica';
let pistaActual = '';
let sonando: HTMLAudioElement | null = null;
let encendida = false;

function leerPreferencia(): boolean {
  try {
    return localStorage.getItem(CLAVE_MUSICA) === 'si';
  } catch {
    return false;
  }
}

function guardarPreferencia(valor: boolean): void {
  try {
    localStorage.setItem(CLAVE_MUSICA, valor ? 'si' : 'no');
  } catch {
    // Sin almacenamiento la preferencia dura lo que la pestaña.
  }
}

/** Funde de una pista a otra en un segundo largo, sin cortes. */
function ponerPista(nombre: string): void {
  if (!encendida || nombre === pistaActual) return;
  pistaActual = nombre;

  const anterior = sonando;
  const nueva = new Audio();
  const prueba = nueva.canPlayType('audio/ogg; codecs="vorbis"');
  nueva.src = `${BASE}assets/audio/musica/${nombre}.${prueba ? 'ogg' : 'mp3'}`;
  nueva.loop = true;
  nueva.volume = 0;
  void nueva.play().catch(() => undefined);
  sonando = nueva;

  const inicio = performance.now();
  const fundir = (t: number) => {
    const k = Math.min(1, (t - inicio) / 1400);
    nueva.volume = 0.32 * k;
    if (anterior) anterior.volume = 0.32 * (1 - k);
    if (k < 1) requestAnimationFrame(fundir);
    else anterior?.pause();
  };
  requestAnimationFrame(fundir);
}

function apagarMusica(): void {
  const actual = sonando;
  sonando = null;
  pistaActual = '';
  if (!actual) return;
  const inicio = performance.now();
  const desde = actual.volume;
  const fundir = (t: number) => {
    const k = Math.min(1, (t - inicio) / 700);
    actual.volume = desde * (1 - k);
    if (k < 1) requestAnimationFrame(fundir);
    else actual.pause();
  };
  requestAnimationFrame(fundir);
}

let profundidadActual = 0;

function prepararMusica(): void {
  const boton = document.getElementById('boton-musica') as HTMLButtonElement | null;
  if (!boton) return;

  const pintar = () => {
    boton.setAttribute('aria-pressed', String(encendida));
    boton.title = encendida ? 'Silenciar el Vientre' : 'Escuchar el Vientre';
    boton.classList.toggle('encendida', encendida);
  };

  boton.addEventListener('click', () => {
    encendida = !encendida;
    guardarPreferencia(encendida);
    if (encendida) ponerPista(CAPAS[profundidadActual]?.musica ?? CAPAS[0].musica);
    else apagarMusica();
    pintar();
  });

  // Si la dejó encendida la última vez, se le avisa con el botón pero no se
  // le pone a sonar sin tocar nada: los navegadores no lo permiten, y aunque
  // lo hicieran, no sería de recibo.
  if (leerPreferencia()) {
    boton.classList.add('recordada');
    const alPrimerGesto = () => {
      if (!encendida) {
        encendida = true;
        ponerPista(CAPAS[profundidadActual]?.musica ?? CAPAS[0].musica);
        pintar();
      }
    };
    window.addEventListener('pointerdown', alPrimerGesto, { once: true });
  }
  pintar();
}

// -- El riel de profundidad ------------------------------------------------------

function prepararRiel(): void {
  const riel = document.getElementById('riel');
  if (!riel) return;
  const paradas: ReadonlyArray<[string, string, string]> = [
    ['', 'Portal', '0'],
    ['doctrina', 'Doctrina', 'I'],
    ['registro', 'Registro', 'II'],
    ['vientre', 'El Vientre', 'III'],
    ['linaje', 'Linaje', 'IV'],
    ['sacramentos', 'Sacramentos', 'V'],
  ];
  riel.innerHTML = `
    <span class="riel-cadena" aria-hidden="true"></span>
    ${paradas
      .map(
        ([ruta, nombre, numero], i) =>
          `<a class="riel-parada" href="#/${ruta}" data-profundidad="${i}" title="${nombre}">
             <span class="riel-numero">${numero}</span><span class="riel-nombre">${nombre}</span>
           </a>`,
      )
      .join('')}
    <span class="riel-cota" id="riel-cota">0 m</span>
  `;
}

// -- Lo que se llama desde fuera ----------------------------------------------

/** Una vez, al cargar la página. */
export function arrancarAmbiente(): void {
  arrancarPolvo();
  arrancarLuz();
  prepararMusica();
  prepararRiel();
  pintarMarca();
}

/** En cada cambio de sección. */
export function ambienteDe(profundidad: number): void {
  profundidadActual = profundidad;
  const capa = CAPAS[profundidad] ?? CAPAS[0];
  colorPolvo = capa.polvo;
  ponerMuro(profundidad);
  ponerPista(capa.musica);

  for (const parada of document.querySelectorAll<HTMLElement>('.riel-parada')) {
    const n = Number(parada.dataset.profundidad);
    parada.classList.toggle('actual', n === profundidad);
    parada.classList.toggle('pasada', n < profundidad);
  }
  const cota = document.getElementById('riel-cota');
  // Cuarenta metros por capa: el número no está en el bible, es del plano.
  if (cota) cota.textContent = `−${profundidad * 40} m`;
}

/** La vela de la cabecera: el sprite del juego, a escala de pixel gordo. */
function pintarMarca(): void {
  const lienzo = document.getElementById('marca-vela') as HTMLCanvasElement | null;
  const vela = lienzoDe('vela', 1);
  const ctx = lienzo?.getContext('2d');
  if (!lienzo || !vela || !ctx) return;
  ctx.imageSmoothingEnabled = false;
  const escala = Math.floor(Math.min(lienzo.width / vela.width, lienzo.height / vela.height));
  const x = Math.floor((lienzo.width - vela.width * escala) / 2);
  const y = lienzo.height - vela.height * escala;
  ctx.drawImage(vela, x, y, vela.width * escala, vela.height * escala);
}
