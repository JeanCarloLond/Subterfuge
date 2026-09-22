/**
 * El Sacramento: práctica quirúrgica, litúrgica.
 *
 * Del bible: "minijuego de precisión quirúrgica, tipo Operation pero
 * litúrgico: sigue las instrucciones del Códice paso a paso; fallar tiene
 * consecuencias visuales en el resto del sitio". Cuatro pasos, cada uno un
 * versículo del Códice: cubrir el rostro, pesar la ofrenda, seguir la línea
 * con el bisturí, sellar. Fallar deja una mancha en el portal que no se va.
 *
 * Y el final, salga como salga, es el del mundo: ningún Elegido ha llegado
 * entero en tres generaciones. Hacerlo todo bien también termina en Reformado.
 */

import { manchar } from '../memoria';
import { actualizarPie } from '../pie';
import { elemento } from '../texto';

const ANCHO = 640;
const ALTO = 400;

type Paso = 'cubrir' | 'pesar' | 'incidir' | 'sellar' | 'fin';

interface Punto {
  x: number;
  y: number;
}

const COLOR = {
  fondo: '#120c10',
  camilla: '#3b2f35',
  camillaBorde: '#6b5a62',
  carne: '#a86a66',
  carneSombra: '#7a4a48',
  hueso: '#e6ddc8',
  tela: '#cfc4a8',
  oro: '#c9a44c',
  sangre: '#8c2f2f',
  turquesa: '#4fc1ba',
  guia: 'rgba(230, 221, 200, 0.55)',
  texto: '#e6ddc8',
} as const;

/** La línea de la incisión: una curva muestreada en puntos. */
function trazarIncision(): Punto[] {
  const puntos: Punto[] = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = i / 60;
    // Cúbica de Bézier a mano: baja por el torso con una curva.
    const p0 = { x: 250, y: 150 };
    const p1 = { x: 330, y: 190 };
    const p2 = { x: 300, y: 280 };
    const p3 = { x: 400, y: 320 };
    const u = 1 - t;
    puntos.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return puntos;
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
        Práctica guiada para aspirantes a Manos. Cuatro pasos, cada uno con su versículo. Puede
        usar el ratón o el dedo. Lea la instrucción y hágala tal cual; el Códice no admite
        preguntas y esta práctica tampoco.
      </p>
      <div class="juego-marco">
        <canvas id="lienzo" width="${ANCHO}" height="${ALTO}" aria-label="Mesa del sacramento"></canvas>
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
  const instruccion = raiz.querySelector('#instruccion') as HTMLElement;
  const estado = raiz.querySelector('#estado') as HTMLElement;
  const reiniciar = raiz.querySelector('#reiniciar') as HTMLButtonElement;

  const incision = trazarIncision();
  const ROSTRO: Punto = { x: 250, y: 105 };
  const SELLO_META: Punto = { x: 330, y: 230 };

  // -- Estado -----------------------------------------------------------------
  let paso: Paso = 'cubrir';
  const resultados: Partial<Record<Paso, boolean>> = {};
  let puntero: Punto = { x: -100, y: -100 };
  let pulsado = false;
  let animacion = 0;
  let inicio = performance.now();

  // Cubrir: la tela se arrastra.
  let tela: Punto = { x: 520, y: 90 };
  let arrastrandoTela = false;
  let telaColocada = false;

  // Pesar: la aguja sube mientras se mantiene pulsado.
  let aguja = 0;
  const bandaPeso = { desde: 0.58, hasta: 0.72 };
  let pesoFijado: number | null = null;

  // Incidir: se sigue la línea sin salirse.
  let avance = 0; // índice del punto alcanzado
  let cortando = false;
  let desvio = 0;
  let cortado: Punto[] = [];

  // Sellar: el sello deriva; hay que soltarlo cuando pasa por la marca.
  let selloFase = 0;
  let selloPuesto: Punto | null = null;

  const mensajes: Record<Paso, string> = {
    cubrir:
      'Códice II, 4 · "Se cubrirá el rostro antes de la incisión."  Arrastra la tela sobre el rostro.',
    pesar:
      'Códice III, 1 · "Se pesará la ofrenda."  Mantén pulsado para subir la aguja y suelta dentro de la banda.',
    incidir:
      'Códice VI, 1 · "Las Manos no eligen: ejecutan."  Sigue la línea con el bisturí sin salirte, de arriba abajo.',
    sellar:
      'Códice IV, 7 · "No se admite otra moneda."  El sello deriva. Pulsa cuando pase por la marca.',
    fin: '',
  };

  const pasos: Paso[] = ['cubrir', 'pesar', 'incidir', 'sellar'];

  function avanzar(exito: boolean): void {
    resultados[paso] = exito;
    const i = pasos.indexOf(paso);
    paso = i >= 0 && i < pasos.length - 1 ? pasos[i + 1] : 'fin';
    if (paso === 'fin') terminar();
    pintarEstado();
  }

  function pintarEstado(): void {
    instruccion.textContent = mensajes[paso];
    estado.innerHTML = pasos
      .map((p) => {
        const r = resultados[p];
        const marca = r === undefined ? (p === paso ? '▸' : '·') : r ? '✓' : '✗';
        return `<span>${marca} ${p}</span>`;
      })
      .join('');
  }

  function terminar(): void {
    const fallos = pasos.filter((p) => resultados[p] === false).length;
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
    for (const p of pasos) delete resultados[p];
    tela = { x: 520, y: 90 };
    arrastrandoTela = false;
    telaColocada = false;
    aguja = 0;
    pesoFijado = null;
    avance = 0;
    cortando = false;
    desvio = 0;
    cortado = [];
    selloFase = 0;
    selloPuesto = null;
    inicio = performance.now();
    pintarEstado();
  }

  // -- Entrada ---------------------------------------------------------------
  function coordenadas(e: PointerEvent): Punto {
    const r = lienzo.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ANCHO,
      y: ((e.clientY - r.top) / r.height) * ALTO,
    };
  }

  const alPulsar = (e: PointerEvent) => {
    e.preventDefault();
    lienzo.setPointerCapture(e.pointerId);
    puntero = coordenadas(e);
    pulsado = true;

    if (paso === 'cubrir' && distancia(puntero, tela) < 40) arrastrandoTela = true;
    if (paso === 'incidir' && distancia(puntero, incision[0]) < 18) {
      cortando = true;
      avance = 0;
      desvio = 0;
      cortado = [];
    }
    if (paso === 'sellar') {
      const selloPos = posicionSello();
      selloPuesto = selloPos;
      avanzar(distancia(selloPos, SELLO_META) < 16);
    }
  };

  const alMover = (e: PointerEvent) => {
    puntero = coordenadas(e);
    if (arrastrandoTela) tela = { ...puntero };
    if (cortando) {
      // ¿Cuál es el punto de la línea más cercano al bisturí, por delante?
      let mejor = avance;
      let mejorD = Infinity;
      for (let i = avance; i < Math.min(incision.length, avance + 8); i += 1) {
        const d = distancia(puntero, incision[i]);
        if (d < mejorD) {
          mejorD = d;
          mejor = i;
        }
      }
      avance = mejor;
      cortado.push({ ...puntero });
      if (mejorD > 14) desvio += mejorD - 14;
      if (avance >= incision.length - 1) {
        cortando = false;
        avanzar(desvio < 120);
      }
    }
  };

  const alSoltar = (e: PointerEvent) => {
    pulsado = false;
    if (arrastrandoTela) {
      arrastrandoTela = false;
      telaColocada = distancia(tela, ROSTRO) < 34;
      if (telaColocada) tela = { ...ROSTRO };
      avanzar(telaColocada);
    }
    if (paso === 'pesar' && pesoFijado === null && aguja > 0) {
      pesoFijado = aguja;
      avanzar(aguja >= bandaPeso.desde && aguja <= bandaPeso.hasta);
    }
    if (cortando) {
      cortando = false;
      avanzar(false);
    }
    lienzo.releasePointerCapture(e.pointerId);
  };

  lienzo.addEventListener('pointerdown', alPulsar);
  lienzo.addEventListener('pointermove', alMover);
  lienzo.addEventListener('pointerup', alSoltar);
  lienzo.addEventListener('pointercancel', alSoltar);
  reiniciar.addEventListener('click', reiniciarTodo);

  function posicionSello(): Punto {
    // Deriva en un ocho lento alrededor de la marca.
    return {
      x: SELLO_META.x + Math.sin(selloFase) * 70,
      y: SELLO_META.y + Math.sin(selloFase * 2) * 34,
    };
  }

  // -- Dibujo ----------------------------------------------------------------
  function dibujar(ahora: number): void {
    const t = (ahora - inicio) / 1000;
    ctx.fillStyle = COLOR.fondo;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // Camilla-altar.
    ctx.fillStyle = COLOR.camilla;
    ctx.fillRect(150, 60, 220, 320);
    ctx.strokeStyle = COLOR.camillaBorde;
    ctx.lineWidth = 2;
    ctx.strokeRect(150, 60, 220, 320);
    // Velas en las esquinas: la llama parpadea.
    for (const vx of [140, 380]) {
      ctx.fillStyle = COLOR.hueso;
      ctx.fillRect(vx - 3, 40, 6, 20);
      ctx.fillStyle = `rgba(232, 160, 58, ${0.7 + Math.sin(t * 9 + vx) * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(vx, 34, 3, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // El ofrendado: cuerpo en sombra, rostro, torso.
    ctx.fillStyle = COLOR.carneSombra;
    ctx.beginPath();
    ctx.roundRect(200, 130, 120, 220, 40);
    ctx.fill();
    ctx.fillStyle = COLOR.carne;
    ctx.beginPath();
    ctx.roundRect(212, 140, 96, 200, 34);
    ctx.fill();
    // Latido: el pecho sube y baja. El dios no mira, pero late.
    const latido = 1 + Math.max(0, Math.sin(t * 2.6)) * 0.04;
    ctx.save();
    ctx.translate(260, 220);
    ctx.scale(latido, latido);
    ctx.fillStyle = 'rgba(140, 47, 47, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Rostro.
    ctx.fillStyle = COLOR.carne;
    ctx.beginPath();
    ctx.arc(ROSTRO.x, ROSTRO.y, 26, 0, Math.PI * 2);
    ctx.fill();
    if (!telaColocada) {
      // Ojos cerrados: dos líneas. Nadie entra despierto.
      ctx.strokeStyle = COLOR.carneSombra;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(240, 102);
      ctx.lineTo(248, 102);
      ctx.moveTo(252, 102);
      ctx.lineTo(260, 102);
      ctx.stroke();
    }

    // Incisión: la guía y lo cortado.
    if (paso === 'incidir' || resultados.incidir !== undefined) {
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = COLOR.guia;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      incision.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLOR.turquesa;
      ctx.beginPath();
      ctx.arc(incision[0].x, incision[0].y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (cortado.length > 1) {
      ctx.strokeStyle = COLOR.sangre;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      cortado.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }

    // La tela.
    ctx.fillStyle = COLOR.tela;
    ctx.beginPath();
    ctx.roundRect(tela.x - 34, tela.y - 26, 68, 52, 6);
    ctx.fill();
    ctx.strokeStyle = COLOR.oro;
    ctx.lineWidth = 1;
    ctx.strokeRect(tela.x - 30, tela.y - 22, 60, 44);

    // Báscula del Registro.
    if (paso === 'pesar' || resultados.pesar !== undefined) {
      if (paso === 'pesar' && pulsado && pesoFijado === null) aguja = Math.min(1, aguja + 0.009);
      const bx = 470;
      const by = 120;
      const bh = 220;
      ctx.fillStyle = COLOR.camilla;
      ctx.fillRect(bx, by, 40, bh);
      ctx.fillStyle = 'rgba(79, 193, 186, 0.28)';
      ctx.fillRect(
        bx,
        by + bh - bandaPeso.hasta * bh,
        40,
        (bandaPeso.hasta - bandaPeso.desde) * bh,
      );
      ctx.fillStyle = COLOR.oro;
      const ay = by + bh - aguja * bh;
      ctx.fillRect(bx - 6, ay - 1, 52, 3);
      ctx.fillStyle = COLOR.texto;
      ctx.font = '12px "IBM Plex Mono", monospace';
      ctx.fillText(`${(aguja * 20).toFixed(1)} kg`, bx - 4, by + bh + 18);
      ctx.fillText('Registro', bx - 4, by - 8);
    }

    // El sello.
    if (paso === 'sellar' || resultados.sellar !== undefined) {
      ctx.strokeStyle = COLOR.oro;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(SELLO_META.x, SELLO_META.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const pos = selloPuesto ?? posicionSello();
      if (paso === 'sellar') selloFase += 0.026;
      ctx.fillStyle = COLOR.sangre;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLOR.oro;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // El bisturí sigue al puntero cuando toca cortar.
    if (paso === 'incidir') {
      ctx.strokeStyle = COLOR.hueso;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(puntero.x, puntero.y);
      ctx.lineTo(puntero.x + 18, puntero.y - 26);
      ctx.stroke();
      ctx.strokeStyle = COLOR.turquesa;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(puntero.x, puntero.y);
      ctx.lineTo(puntero.x + 6, puntero.y - 9);
      ctx.stroke();
    }

    // Rótulo del paso, en la mesa.
    ctx.fillStyle = COLOR.oro;
    ctx.font = '11px Cinzel, serif';
    ctx.fillText(
      paso === 'fin' ? 'SACRAMENTO N.º 7' : `PASO ${pasos.indexOf(paso) + 1} DE 4`,
      20,
      380,
    );

    animacion = requestAnimationFrame(dibujar);
  }

  pintarEstado();
  animacion = requestAnimationFrame(dibujar);

  return () => {
    cancelAnimationFrame(animacion);
    lienzo.removeEventListener('pointerdown', alPulsar);
    lienzo.removeEventListener('pointermove', alMover);
    lienzo.removeEventListener('pointerup', alSoltar);
    lienzo.removeEventListener('pointercancel', alSoltar);
  };
}
