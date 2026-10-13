/**
 * La escena de la portada: el Atrio, montado con las piezas del juego.
 *
 * La portada abría con un titular sobre papel claro, como cualquier web
 * institucional, y eso era justo lo que la revisión pedía evitar (#80). Ahora
 * abre con el sitio: la sillería del equipo, las ventanas por las que aún
 * entra luz (es la única capa donde entra), las cadenas, el Altar con sus dos
 * velas, el Cirujano de un lado y un Devoto del otro. Son los mismos sprites
 * que se mueven en el juego, a pixel gordo, sin una sola ilustración nueva.
 *
 * Solo se anima la luz: las velas respiran y los haces de las ventanas
 * tiemblan un poco. Con `prefers-reduced-motion` se pinta una vez y ya.
 */

import { lienzoDe } from './arte';

const ANCHO = 320;
const ALTO = 124;
const SUELO = 102;

const QUIETO =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Pieza {
  figura: string;
  x: number;
  /** Pie de la figura: la fila donde apoya. */
  pie: number;
  volteada?: boolean;
}

/*
 * La escena ocupa la mitad derecha: la izquierda es muro en penumbra, y ahí
 * va el título. En la primera versión el título caía encima del Cirujano.
 */
const PIEZAS: readonly Pieza[] = [
  { figura: 'cadena', x: 196, pie: 50 },
  { figura: 'cadena', x: 296, pie: 44 },
  { figura: 'altar', x: 242, pie: SUELO },
  // Dos velas en el suelo, a los lados del altar; el altar lleva la suya.
  { figura: 'vela', x: 226, pie: SUELO },
  { figura: 'vela', x: 268, pie: SUELO },
  { figura: 'cirujano', x: 190, pie: SUELO },
  { figura: 'devoto', x: 282, pie: SUELO, volteada: true },
];

const VENTANAS: ReadonlyArray<[number, number]> = [
  [168, 14],
  [272, 14],
];

/** Puntos de luz: las dos velas del altar. */
const LLAMAS: ReadonlyArray<[number, number]> = [
  [228.5, SUELO - 9],
  [250, SUELO - 18],
  [270.5, SUELO - 9],
];

export function montarEscena(lienzo: HTMLCanvasElement): () => void {
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return () => undefined;
  ctx.imageSmoothingEnabled = false;

  let fondo: HTMLCanvasElement | null = null;
  let animacion = 0;
  let vivo = true;

  // El fondo (muro, suelo, ventanas, figuras) se compone una vez; cada
  // fotograma solo se pinta la luz encima.
  const componerFondo = (silleria: HTMLImageElement) => {
    const capa = document.createElement('canvas');
    capa.width = ANCHO;
    capa.height = ALTO;
    const c = capa.getContext('2d');
    if (!c) return;
    c.imageSmoothingEnabled = false;

    // Muro: la sillería del equipo en hiladas desplazadas.
    for (let y = 0; y < SUELO; y += 16) {
      const desplazamiento = (y / 16) % 2 === 0 ? 0 : -64;
      for (let x = desplazamiento; x < ANCHO; x += 128) c.drawImage(silleria, x, y);
    }
    // El muro en penumbra: la luz viene de las ventanas y de las velas.
    c.fillStyle = 'rgba(14, 9, 12, 0.58)';
    c.fillRect(0, 0, ANCHO, SUELO);

    // Suelo: la misma piedra, más oscura, con una junta clara arriba.
    for (let x = 0; x < ANCHO; x += 128) c.drawImage(silleria, x, SUELO);
    for (let x = -64; x < ANCHO; x += 128) c.drawImage(silleria, x, SUELO + 16);
    c.fillStyle = 'rgba(8, 5, 7, 0.72)';
    c.fillRect(0, SUELO, ANCHO, ALTO - SUELO);
    c.fillStyle = 'rgba(201, 164, 76, 0.35)';
    c.fillRect(0, SUELO, ANCHO, 1);

    for (const [x, y] of VENTANAS) {
      const ventana = lienzoDe('ventana', 1);
      if (ventana) c.drawImage(ventana, x, y);
    }

    for (const pieza of PIEZAS) {
      const sprite = lienzoDe(pieza.figura, 1);
      if (!sprite) continue;
      const y = pieza.pie - sprite.height;
      if (pieza.volteada) {
        c.save();
        c.translate(pieza.x + sprite.width, y);
        c.scale(-1, 1);
        c.drawImage(sprite, 0, 0);
        c.restore();
      } else {
        c.drawImage(sprite, pieza.x, y);
      }
    }
    fondo = capa;
  };

  const pintar = (t: number) => {
    if (!vivo || !fondo) return;
    ctx.clearRect(0, 0, ANCHO, ALTO);
    ctx.drawImage(fondo, 0, 0);

    // Haces de las ventanas: luz fría y polvorienta, la única que llega de
    // fuera. Tiemblan muy poco.
    const temblor = QUIETO ? 0 : Math.sin(t / 900) * 0.015;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [x] of VENTANAS) {
      const haz = ctx.createLinearGradient(0, 18, 0, SUELO + 8);
      haz.addColorStop(0, `rgba(232, 214, 170, ${0.16 + temblor})`);
      haz.addColorStop(1, 'rgba(232, 214, 170, 0)');
      ctx.fillStyle = haz;
      ctx.beginPath();
      ctx.moveTo(x + 2, 22);
      ctx.lineTo(x + 12, 22);
      ctx.lineTo(x + 34, SUELO + 6);
      ctx.lineTo(x - 2, SUELO + 6);
      ctx.closePath();
      ctx.fill();
    }

    // Las velas del altar: respiran, cada una a su ritmo.
    LLAMAS.forEach(([x, y], i) => {
      const pulso = QUIETO ? 1 : 0.85 + 0.15 * Math.sin(t / (210 + i * 37) + i * 2);
      const brillo = ctx.createRadialGradient(x, y, 0, x, y, 38 * pulso);
      brillo.addColorStop(0, 'rgba(255, 200, 110, 0.34)');
      brillo.addColorStop(0.35, 'rgba(232, 160, 58, 0.16)');
      brillo.addColorStop(1, 'rgba(232, 160, 58, 0)');
      ctx.fillStyle = brillo;
      ctx.fillRect(x - 50, y - 50, 100, 100);
    });
    ctx.restore();

    // La mitad izquierda, en penumbra: ahí va el título.
    const penumbra = ctx.createLinearGradient(0, 0, ANCHO * 0.62, 0);
    penumbra.addColorStop(0, 'rgba(10, 7, 9, 0.9)');
    penumbra.addColorStop(0.55, 'rgba(10, 7, 9, 0.62)');
    penumbra.addColorStop(1, 'rgba(10, 7, 9, 0)');
    ctx.fillStyle = penumbra;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // Viñeta: la escena se funde con la página por los bordes.
    const vineta = ctx.createRadialGradient(
      ANCHO * 0.7,
      ALTO * 0.55,
      ALTO * 0.35,
      ANCHO * 0.7,
      ALTO * 0.55,
      ANCHO * 0.66,
    );
    vineta.addColorStop(0, 'rgba(10, 7, 9, 0)');
    vineta.addColorStop(1, 'rgba(10, 7, 9, 0.92)');
    ctx.fillStyle = vineta;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    if (!QUIETO) animacion = requestAnimationFrame(pintar);
  };

  const silleria = new Image();
  silleria.onload = () => {
    componerFondo(silleria);
    animacion = requestAnimationFrame(pintar);
  };
  silleria.src = `${import.meta.env.BASE_URL}assets/tilesets/vientre.png`;

  return () => {
    vivo = false;
    cancelAnimationFrame(animacion);
  };
}
