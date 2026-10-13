/**
 * La vela de la Vigilia, a pixel, en la esquina de la pantalla.
 *
 * Antes era una franja pegada arriba de Doctrina con una vela de tres `div` y
 * un contador de segundos (#82): tapaba el texto y lo que se leía era el
 * número, no la vela. Ahora la vela acompaña la lectura desde la esquina y lo
 * que queda se lee en ella: la llama se va ahogando (se encoge, parpadea)
 * hasta apagarse, y la cera baja con el tiempo que lleva encendida.
 *
 * Avivarla es encender un fósforo: entra, se frota, prende y se acerca al
 * pabilo. Dura menos de un segundo.
 *
 * Es la vela del juego (la misma paleta que el sprite `vela`), más grande.
 * Los fotogramas de la llama están dibujados a mano, fila a fila.
 */

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lo que tarda en ahogarse la llama si nadie la aviva. */
const AHOGO_MS = 75_000;
/** Lo que tarda la cera en gastarse entera, contando solo el tiempo encendida. */
const CERA_MS = 10 * 60_000;
const FOSFORO_MS = 900;

const ANCHO = 36;
const ALTO = 58;
/** El pabilo: la llama se apoya aquí. */
const PABILO_X = 9;
const PLATO_Y = 51;

const COLOR: Readonly<Record<string, string>> = {
  // Del sprite `vela` del juego.
  F: '#f5d78a',
  f: '#e8a03a',
  w: '#d8cdbe',
  W: '#b9a878',
  p: '#4a4038',
  // Lo que el sprite no necesita a su tamaño.
  b: '#fff3c4',
  r: '#8c2f2f',
  a: '#3d4f7a',
  c: '#efe6cf',
  g: '#c9a44c',
  k: '#2a1a1e',
};

/*
 * Fotogramas de la llama, de arriba abajo. La última fila es la base, que
 * apoya justo encima del pabilo. r rojo, f naranja, F amarillo, b blanco,
 * a azul de la base.
 */
const LLAMA_VIVA = [
  ['..r..', '..f..', '.ff..', '.fFf.', '.fFf.', 'fFbFf', 'fFbFf', '.fbf.', '..a..'],
  ['...r.', '..ff.', '..ff.', '.fFf.', '.fFFf', 'fFbFf', 'fFbFf', '.fbf.', '..a..'],
  ['..r..', '..f..', '..f..', '.fFf.', '.fFf.', 'fFbFf', 'fFbFf', '.fbf.', '..a..'],
  ['.r...', '.ff..', '.ff..', '.fFf.', 'fFFf.', 'fFbFf', 'fFbFf', '.fbf.', '..a..'],
  ['.....', '..r..', '..f..', '.fFf.', '.fFf.', 'fFbFf', 'fFbFf', '.fbf.', '..a..'],
];
const LLAMA_FLOJA = [
  ['..r..', '..f..', '.fFf.', '.fbf.', '.fbf.', '..a..'],
  ['...r.', '..ff.', '.fFf.', '.fbf.', '.fbf.', '..a..'],
  ['.r...', '.ff..', '.fFf.', '.fbf.', '.fbf.', '..a..'],
];
const LLAMA_AHOGADA = [
  ['..f..', '.fFf.', '..b..', '..a..'],
  ['..r..', '..f..', '.fF..', '..a..'],
  ['.....', '..r..', '.fF..', '..a..'],
];

const LLAMA_FOSFORO = [
  ['.r.', 'fFf', '.b.'],
  ['..r', '.ff', '.b.'],
  ['r..', 'ff.', '.b.'],
];

interface Humo {
  x: number;
  y: number;
  nacio: number;
}

/** `alCambiar` se llama al apagarse la vela y al volver a encenderse. */
export function montarVela(alCambiar: (apagada: boolean) => void): () => void {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'vela-vigilia';
  boton.setAttribute('aria-label', 'Avivar la vela de la Vigilia');
  boton.innerHTML = `
    <span class="vela-halo" aria-hidden="true"></span>
    <canvas width="${ANCHO}" height="${ALTO}" aria-hidden="true"></canvas>
    <span class="vela-rotulo" aria-hidden="true">Avivar</span>
  `;
  document.body.append(boton);

  const lienzo = boton.querySelector('canvas') as HTMLCanvasElement;
  const halo = boton.querySelector('.vela-halo') as HTMLElement;
  const rotulo = boton.querySelector('.vela-rotulo') as HTMLElement;
  const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;

  const ahora = () => performance.now();
  let avivadaEn = ahora();
  /** Cera gastada antes del último encendido, en ms de llama. */
  let ceraGastada = 0;
  let apagada = false;
  let fosforoDesde = -Infinity;
  let prendio = true;
  let fotograma = 0;
  let cambioDeFotograma = 0;
  let humo: Humo[] = [];
  let ultimoHumo = 0;
  let animacion = 0;
  let vivo = true;

  const pixel = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  /** Pinta un dibujo de filas con su base centrada en (cx, base). */
  const dibujo = (filas: readonly string[], cx: number, base: number) => {
    const ancho = filas[0].length;
    const x0 = cx - Math.floor(ancho / 2);
    const y0 = base - filas.length + 1;
    filas.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x += 1) {
        const color = COLOR[fila[x]];
        if (color) pixel(x0 + x, y0 + y, color);
      }
    });
  };

  /** 1 recién avivada, 0 ahogada. */
  const vigor = (t: number) => (apagada ? 0 : Math.max(0, 1 - (t - avivadaEn) / AHOGO_MS));
  const cera = (t: number) => {
    const encendida = apagada ? 0 : t - avivadaEn;
    return Math.max(0, 1 - (ceraGastada + encendida) / CERA_MS);
  };

  const pintarVela = (alto: number) => {
    const arriba = PLATO_Y - alto;
    // Cuerpo: luz a la izquierda, sombra a la derecha, como el sprite.
    for (let y = arriba; y < PLATO_Y; y += 1) {
      pixel(PABILO_X - 3, y, COLOR.w);
      pixel(PABILO_X - 2, y, COLOR.c);
      pixel(PABILO_X - 1, y, COLOR.w);
      pixel(PABILO_X, y, COLOR.w);
      pixel(PABILO_X + 1, y, COLOR.W);
      pixel(PABILO_X + 2, y, COLOR.W);
    }
    // El borde de arriba, derretido, y dos goterones que bajan.
    pixel(PABILO_X - 3, arriba, COLOR.c);
    pixel(PABILO_X + 2, arriba, COLOR.w);
    for (let y = 1; y <= 3; y += 1) pixel(PABILO_X - 4, arriba + y, COLOR.c);
    pixel(PABILO_X - 4, arriba + 4, COLOR.w);
    for (let y = 1; y <= 5; y += 1) pixel(PABILO_X + 3, arriba + y, COLOR.w);
    pixel(PABILO_X + 3, arriba + 6, COLOR.W);
    // Pabilo.
    pixel(PABILO_X, arriba - 1, COLOR.k);
    pixel(PABILO_X, arriba - 2, apagada ? COLOR.k : COLOR.r);

    // Candelero: el plato del juego, con su asa.
    for (let x = PABILO_X - 6; x <= PABILO_X + 6; x += 1) pixel(x, PLATO_Y, COLOR.p);
    for (let x = PABILO_X - 8; x <= PABILO_X + 8; x += 1) pixel(x, PLATO_Y + 1, COLOR.p);
    for (let x = PABILO_X - 7; x <= PABILO_X + 7; x += 1) pixel(x, PLATO_Y + 2, '#33292a');
    pixel(PABILO_X - 6, PLATO_Y, COLOR.g);
    pixel(PABILO_X + 6, PLATO_Y, COLOR.g);
    pixel(PABILO_X + 9, PLATO_Y, COLOR.p);
    pixel(PABILO_X + 10, PLATO_Y + 1, COLOR.p);
    pixel(PABILO_X + 9, PLATO_Y + 2, COLOR.p);
    // Cera que ya cayó al plato.
    pixel(PABILO_X - 4, PLATO_Y - 1, COLOR.w);
    pixel(PABILO_X + 3, PLATO_Y - 1, COLOR.W);
    pixel(PABILO_X + 4, PLATO_Y - 1, COLOR.w);

    return arriba - 2;
  };

  const pintarLlama = (t: number, pabilo: number) => {
    const v = vigor(t);
    if (v <= 0) return;
    if (!QUIETO && t > cambioDeFotograma) {
      fotograma += 1 + Math.floor(Math.random() * 2);
      cambioDeFotograma = t + 70 + Math.random() * (v < 0.3 ? 60 : 110);
    }
    // Ahogándose: de vez en cuando la llama casi desaparece.
    if (!QUIETO && v < 0.12 && Math.random() < 0.18) {
      pixel(PABILO_X, pabilo, COLOR.r);
      return;
    }
    const juego = v > 0.45 ? LLAMA_VIVA : v > 0.15 ? LLAMA_FLOJA : LLAMA_AHOGADA;
    dibujo(juego[QUIETO ? 0 : fotograma % juego.length], PABILO_X, pabilo - 1);
  };

  const pintarHumo = (t: number, pabilo: number) => {
    if (QUIETO) return;
    if (apagada && t - ultimoHumo > 260) {
      humo.push({ x: PABILO_X, y: pabilo, nacio: t });
      ultimoHumo = t;
    }
    humo = humo.filter((h) => t - h.nacio < 2600);
    for (const h of humo) {
      const edad = (t - h.nacio) / 2600;
      const y = Math.round(h.y - edad * 26);
      const x = Math.round(h.x + Math.sin(edad * 7 + h.nacio) * 2 * edad);
      if (y < 0) continue;
      ctx.globalAlpha = 0.7 * (1 - edad);
      pixel(x, y, '#9a9090');
      ctx.globalAlpha = 1;
    }
  };

  /**
   * El fósforo: entra por la derecha, se frota, prende, se acerca al pabilo y
   * se va. `p` va de 0 a 1.
   */
  const pintarFosforo = (t: number, p: number, pabilo: number) => {
    const suave = (a: number, b: number) => {
      const x = Math.min(1, Math.max(0, (p - a) / (b - a)));
      return x * x * (3 - 2 * x);
    };
    const alturaRascar = pabilo + 8;
    let cabezaX: number;
    let cabezaY: number;
    if (p < 0.2) {
      cabezaX = Math.round(ANCHO + 2 - suave(0, 0.2) * 16);
      cabezaY = alturaRascar;
    } else if (p < 0.42) {
      // Se frota: va y viene dos veces.
      cabezaX = 22 + Math.round(Math.sin(((p - 0.2) / 0.22) * Math.PI * 4) * 2);
      cabezaY = alturaRascar;
    } else if (p < 0.7) {
      const k = suave(0.42, 0.7);
      cabezaX = Math.round(22 + (PABILO_X + 2 - 22) * k);
      cabezaY = Math.round(alturaRascar + (pabilo - alturaRascar) * k);
    } else {
      const k = suave(0.74, 1);
      cabezaX = Math.round(PABILO_X + 2 + k * 30);
      cabezaY = Math.round(pabilo + k * 6);
    }

    // El palo, hacia la derecha y un poco hacia abajo, como se sujeta.
    for (let i = 1; i <= 12; i += 1) {
      const x = cabezaX + i;
      const y = cabezaY + Math.floor(i / 5);
      pixel(x, y, i < 3 && p > 0.38 ? '#3a2a20' : '#c9a46a');
      pixel(x, y + 1, '#8a6a3a');
    }
    // La cabeza.
    pixel(cabezaX, cabezaY, COLOR.r);
    pixel(cabezaX - 1, cabezaY, COLOR.r);
    pixel(cabezaX, cabezaY + 1, '#5a1f1f');
    pixel(cabezaX - 1, cabezaY + 1, '#b5482f');

    // Chispas al frotar.
    if (p > 0.24 && p < 0.42) {
      for (let i = 0; i < 3; i += 1) {
        const x = cabezaX - 2 - Math.floor(Math.random() * 4);
        const y = cabezaY - 1 - Math.floor(Math.random() * 3);
        pixel(x, y, Math.random() < 0.5 ? COLOR.F : COLOR.b);
      }
    }
    // La llama del fósforo, de que prende a que se aleja de la vela.
    if (p > 0.38 && p < 0.86) {
      dibujo(LLAMA_FOSFORO[Math.floor(t / 90) % LLAMA_FOSFORO.length], cabezaX - 1, cabezaY - 1);
    }
  };

  const pintar = (t: number) => {
    if (!vivo) return;
    ctx.clearRect(0, 0, ANCHO, ALTO);
    const v = vigor(t);
    if (!apagada && v <= 0) apagar(t);

    const alto = 6 + Math.round(cera(t) * 22);
    const pabilo = pintarVela(alto);
    pintarHumo(t, pabilo);
    pintarLlama(t, pabilo);

    const p = (t - fosforoDesde) / FOSFORO_MS;
    if (p >= 0 && p <= 1) pintarFosforo(t, p, pabilo);
    // La llama prende (o se aviva) cuando el fósforo llega al pabilo.
    if (!prendio && p >= 0.62) {
      prendio = true;
      encender(t);
    }

    const temblor = QUIETO ? 0 : (Math.random() - 0.5) * 0.08;
    halo.style.opacity = v > 0 ? String(Math.min(1, 0.3 + 0.7 * v + temblor)) : '0';
    halo.style.setProperty('--pabilo', `${((pabilo - 3) / ALTO) * 100}%`);
    rotulo.classList.toggle('visible', apagada || v < 0.3);

    animacion = requestAnimationFrame(pintar);
  };

  const apagar = (t: number) => {
    ceraGastada += t - avivadaEn;
    apagada = true;
    humo = [];
    rotulo.textContent = 'Encender';
    boton.setAttribute('aria-label', 'Encender la vela de la Vigilia');
    alCambiar(true);
  };

  /** Enciende la vela, o la aviva si aún ardía. */
  const encender = (t: number) => {
    if (!apagada) {
      ceraGastada += t - avivadaEn;
      avivadaEn = t;
      return;
    }
    avivadaEn = t;
    apagada = false;
    rotulo.textContent = 'Avivar';
    boton.setAttribute('aria-label', 'Avivar la vela de la Vigilia');
    alCambiar(false);
  };

  boton.addEventListener('click', () => {
    const t = ahora();
    if (t - fosforoDesde < FOSFORO_MS) return;
    if (QUIETO) {
      encender(t);
      return;
    }
    fosforoDesde = t;
    prendio = false;
  });

  // Cuando el pie de la página entra por abajo, la vela se apoya encima en
  // vez de taparlo.
  const pie = document.querySelector<HTMLElement>('footer');
  let pendiente = 0;
  const recolocar = () => {
    cancelAnimationFrame(pendiente);
    pendiente = requestAnimationFrame(() => {
      const borde = pie ? pie.getBoundingClientRect().top : Infinity;
      const encima = Math.max(0, window.innerHeight - borde);
      boton.style.setProperty('--sobre-pie', `${Math.round(encima)}px`);
    });
  };
  window.addEventListener('scroll', recolocar, { passive: true });
  window.addEventListener('resize', recolocar);
  recolocar();

  animacion = requestAnimationFrame(pintar);

  return () => {
    vivo = false;
    cancelAnimationFrame(animacion);
    cancelAnimationFrame(pendiente);
    window.removeEventListener('scroll', recolocar);
    window.removeEventListener('resize', recolocar);
    boton.remove();
  };
}
