/**
 * Prueba el mando de los dedos mandando toques DE VERDAD a un navegador.
 *
 * Por qué existe: los fallos del móvil (#72, #75) no los cazaba ningún linter
 * ni se veían en una captura. Eran de comportamiento —un botón que se queda
 * pulsado, un dedo que cuenta como clic de ratón— y solo se notaban con el
 * teléfono en la mano, que es el sitio donde menos veces se prueba.
 *
 * Esto arranca Chrome sin ventana, abre el juego con `?tactil` (que fuerza el
 * modo dedos y expone `window.juego`), manda toques por el protocolo de
 * DevTools y comprueba qué hace el Cirujano.
 *
 * Uso:
 *   npm run build && npx vite preview --port 4173
 *   node scripts/probar-tactil.mjs
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const URL_JUEGO = process.env.URL_JUEGO ?? 'http://localhost:4173/?tactil';
const PUERTO = 9333;

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const navegador = CHROMES.find((ruta) => existsSync(ruta));
if (!navegador) {
  console.error('No encontré Chrome. Define la ruta en CHROMES.');
  process.exit(2);
}

const chrome = spawn(navegador, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--mute-audio',
  `--remote-debugging-port=${PUERTO}`,
  '--window-size=740,360',
  URL_JUEGO,
]);

let socket;
let siguienteId = 1;
const pendientes = new Map();

function mandar(metodo, parametros = {}) {
  const id = siguienteId++;
  socket.send(JSON.stringify({ id, method: metodo, params: parametros }));
  return new Promise((resolver, rechazar) => {
    pendientes.set(id, { resolver, rechazar });
    setTimeout(() => rechazar(new Error(`${metodo}: sin respuesta`)), 10000);
  });
}

/** Evalúa una expresión en la página y devuelve su valor. */
async function evaluar(expresion) {
  const respuesta = await mandar('Runtime.evaluate', {
    expression: expresion,
    returnByValue: true,
    awaitPromise: true,
  });
  if (respuesta.exceptionDetails) {
    throw new Error(respuesta.exceptionDetails.exception?.description ?? 'error al evaluar');
  }
  return respuesta.result.value;
}

/**
 * Coordenadas lógicas (480x320) a píxeles de la ventana. El rectángulo del
 * lienzo se lee CADA VEZ: al entrar en pantalla completa cambia, y un valor
 * guardado hace que los toques caigan al lado del botón (que fue justo lo que
 * despistó a esta prueba la primera vez).
 */
async function aVentana(x, y) {
  const caja =
    await evaluar(`(() => { const c = document.querySelector('canvas').getBoundingClientRect();
    return { x: c.x, y: c.y, w: c.width, h: c.height }; })()`);
  return { x: caja.x + (x / 480) * caja.w, y: caja.y + (y / 320) * caja.h };
}

async function dedo(tipo, puntos) {
  await mandar('Input.dispatchTouchEvent', {
    type: tipo,
    touchPoints: puntos.map((p, i) => ({ x: p.x, y: p.y, id: i })),
  });
}

const fallos = [];
function comprobar(nombre, condicion, detalle = '') {
  console.log(`${condicion ? '  OK  ' : '  MAL '} ${nombre}${detalle ? `  (${detalle})` : ''}`);
  if (!condicion) fallos.push(nombre);
}

/** Dónde cae un botón de la botonera, en coordenadas lógicas. */
async function centroDe(accion) {
  return evaluar(`(() => {
    const t = window.juego.scene.getScene('Tactil');
    const p = t.puestos.find((p) => p.boton.accion === '${accion}');
    return p ? { x: p.x, y: p.y } : null;
  })()`);
}

const estado = () =>
  evaluar(`(() => {
    const n = window.juego.scene.getScenes(true).find((s) => s.cirujano);
    if (!n) return null;
    const c = n.cirujano;
    return {
      x: Math.round(c.sprite.x),
      vx: Math.round(c.sprite.body.velocity.x),
      vy: Math.round(c.sprite.body.velocity.y),
      suelo: c.sprite.body.blocked.down,
      estado: c.estado,
    };
  })()`);

try {
  await espera(3500);
  const objetivos = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json();
  const pagina = objetivos.find((t) => t.type === 'page' && t.url.includes('4173'));
  if (!pagina) throw new Error('no encontré la pestaña del juego');

  socket = new WebSocket(pagina.webSocketDebuggerUrl);
  socket.addEventListener('message', (evento) => {
    const mensaje = JSON.parse(evento.data);
    const pendiente = pendientes.get(mensaje.id);
    if (!pendiente) return;
    pendientes.delete(mensaje.id);
    if (mensaje.error) pendiente.rechazar(new Error(mensaje.error.message));
    else pendiente.resolver(mensaje.result);
  });
  await new Promise((r) => socket.addEventListener('open', r));
  await mandar('Runtime.enable');

  // El diálogo del Atrio se salta con toques hasta que empieza el nivel.
  for (let i = 0; i < 14; i += 1) {
    const centro = await aVentana(240, 120);
    await dedo('touchStart', [centro]);
    await dedo('touchEnd', []);
    await espera(220);
    if (await evaluar(`!window.juego.scene.isActive('Dialogo')`)) break;
  }
  await espera(600);

  const inicial = await estado();
  if (!inicial) throw new Error('el nivel no ha arrancado');
  console.log(`Nivel en marcha. Cirujano en x=${inicial.x}\n`);

  // 1. Mover con la cruceta.
  const derecha = await aVentana(...Object.values(await centroDe('derecha')));
  await dedo('touchStart', [derecha]);
  await espera(500);
  const moviendo = await estado();
  comprobar('la cruceta mueve', moviendo.vx > 40, `vx=${moviendo.vx}`);

  // 2. Un dedo en la cruceta NO es un golpe (el fallo de #75).
  comprobar('mover no ataca', moviendo.estado !== 'atacando', `estado=${moviendo.estado}`);

  // 3. Al soltar, se para.
  await dedo('touchEnd', []);
  await espera(500);
  const parado = await estado();
  comprobar('al soltar se para', Math.abs(parado.vx) < 20, `vx=${parado.vx}`);

  // 4. Un toque cancelado no deja el botón pegado.
  await dedo('touchStart', [derecha]);
  await espera(160);
  await dedo('touchCancel', []);
  await espera(600);
  const traCancelar = await estado();
  comprobar(
    'un toque cancelado no se queda pegado',
    Math.abs(traCancelar.vx) < 20,
    `vx=${traCancelar.vx}`,
  );

  // 5. Dos dedos: correr y saltar a la vez. Se prueba ANTES de atacar, con
  // el Cirujano todavia en la repisa de salida y sin muros cerca.
  const saltar = await aVentana(...Object.values(await centroDe('saltar')));
  await dedo('touchStart', [derecha]);
  await espera(120);
  await dedo('touchStart', [derecha, saltar]);
  await espera(120);
  const enElAire = await evaluar(`(() => {
    const n = window.juego.scene.getScenes(true).find((s) => s.cirujano);
    return { vy: Math.round(n.cirujano.sprite.body.velocity.y), vx: Math.round(n.cirujano.sprite.body.velocity.x) };
  })()`);
  await dedo('touchEnd', []);
  comprobar(
    'corre y salta a la vez',
    enElAire.vy < -100 && enElAire.vx > 40,
    `vy=${enElAire.vy} vx=${enElAire.vx}`,
  );

  // 6. El botón de atacar sí ataca.
  await espera(700);
  const atacar = await aVentana(...Object.values(await centroDe('atacar')));
  await dedo('touchStart', [atacar]);
  await espera(90);
  const golpeando = await estado();
  await dedo('touchEnd', []);
  comprobar(
    'el botón de atacar ataca',
    golpeando.estado === 'atacando',
    `estado=${golpeando.estado}`,
  );

  // 7. El libro se abre y se cierra con el dedo, DOS VECES. La primera vez
  // funcionaba y la segunda no: es el fallo que conto el probador (#75).
  for (const vuelta of [1, 2]) {
    await espera(500);
    const libro = await aVentana(...Object.values(await centroDe('codice')));
    const cruz = await aVentana(444, 30);
    await dedo('touchStart', [libro]);
    await espera(80);
    await dedo('touchEnd', []);
    await espera(500);
    const abierto = await evaluar(`window.juego.scene.isActive('Codice')`);
    comprobar(`el libro se abre (vuelta ${vuelta})`, abierto);

    await dedo('touchStart', [cruz]);
    await espera(80);
    await dedo('touchEnd', []);
    await espera(500);
    const cerrado = await evaluar(`!window.juego.scene.isActive('Codice')`);
    comprobar(`el libro se cierra con la cruz (vuelta ${vuelta})`, cerrado);
  }

  // 8. Morir no deja el mando muerto: tras reaparecer, la cruceta mueve.
  await evaluar(`(() => {
    const n = window.juego.scene.getScenes(true).find((s) => s.cirujano);
    n.cirujano.vitalidad.recibirDano(99);
  })()`);
  for (let i = 0; i < 40; i += 1) {
    await espera(200);
    if (
      await evaluar(`(() => {
      const n = window.juego.scene.getScenes(true).find((s) => s.cirujano);
      return n ? !n.cirujano.estaMuerto && !n.reapareciendo : false;
    })()`)
    )
      break;
  }

  // Se mantiene la cruceta y se muestrea un rato: al reaparecer junto al Altar
  // puede caerle encima un Devoto, y `herido` bloquea el movimiento a
  // proposito. Basta con que en algun momento de esos dos segundos se mueva.
  await dedo('touchStart', [derecha]);
  let movio = null;
  for (let i = 0; i < 12; i += 1) {
    await espera(180);
    const e = await estado();
    if (e && e.vx > 40) {
      movio = e;
      break;
    }
    movio ??= e;
  }
  await dedo('touchEnd', []);
  comprobar(
    'tras morir se puede mover',
    movio !== null && movio.vx > 40,
    `vx=${movio?.vx} estado=${movio?.estado}`,
  );

  // 9. Nada queda pulsado al final.
  await espera(500);
  const limpio = await evaluar(
    `window.juego.scene.getScene('Tactil').puestos.filter((p) => p.activo).length`,
  );
  comprobar('el mando queda limpio', limpio === 0, `${limpio} pulsados`);
} catch (error) {
  console.error('\nLa prueba no pudo terminar:', error.message);
  fallos.push('la prueba no terminó');
} finally {
  socket?.close();
  chrome.kill();
}

console.log(
  fallos.length === 0 ? '\nTodo correcto.' : `\n${fallos.length} fallo(s): ${fallos.join(', ')}`,
);
process.exit(fallos.length === 0 ? 0 : 1);
