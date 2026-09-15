import Phaser from 'phaser';
import { CURSOR } from '../config/Sacramento';

/**
 * El cursor del raton: el bisturi del Cirujano en vez de la flecha del sistema.
 *
 * Por que no es un sprite dentro del juego: un sprite que persigue al puntero
 * va siempre un fotograma por detras del raton de verdad, y aqui el raton es un
 * arma (clic izquierdo corta, derecho para). Un cursor de CSS lo pinta el
 * navegador, sin latencia y encima de todo, tambien sobre los menus y sobre el
 * margen que Scale.FIT deja fuera del lienzo.
 *
 * El precio es que el navegador no sabe nada del zoom del juego, asi que el
 * escalado hay que hacerlo a mano contra el tamano real del lienzo y rehacerlo
 * cuando la ventana cambia.
 *
 * SE PUEDE APAGAR desde el menu de pausa: quien juega con teclado no llega a
 * mirar el raton nunca, y entonces esto solo es un dibujo que estorba. La
 * preferencia se guarda, porque un ajuste que hay que volver a poner en cada
 * recarga no sirve de nada.
 *
 * Depende solo de las CLAVES de textura, no de como esten dibujadas: cuando
 * entre el sprite definitivo del equipo con las mismas claves, esto sigue
 * funcionando sin tocar una linea.
 */

const CLAVE = 'cursor-placeholder';
const CLAVE_ACTIVO = 'cursor-activo-placeholder';

/**
 * El cursor no se escribe en cada sitio que lo usa: se escribe UNA variable de
 * CSS y todo el mundo apunta a ella con `var()`.
 *
 * Esto no es un adorno, resuelve dos problemas de golpe. Los objetos
 * interactivos de Phaser se quedan con la cadena que se les dio al crearlos,
 * asi que sin la variable un cambio de escala o un apagado desde el menu no
 * llegaria a los que ya existen: el libro seguiria ensenando el cursor viejo
 * hasta que su escena se reconstruyera. Con la variable basta con cambiarla en
 * la raiz y cambia hasta el ultimo.
 */
const VAR_NORMAL = '--cursor-diocesis';
const VAR_ACTIVO = '--cursor-diocesis-activo';

/** Lo que usa el navegador si apagamos el nuestro. */
const SISTEMA = { normal: 'default', activo: 'pointer' } as const;

/** Donde se recuerda la preferencia entre partidas. */
const LLAVE = 'subterfuge:cursor';

/**
 * El valor CSS para `setInteractive({ cursor })`, o sea el cursor de "esto se
 * puede pulsar".
 *
 * Es una CONSTANTE a proposito: apunta a la variable, no al dibujo, asi que
 * sigue siendo valida aunque despues cambie la escala o se apague el cursor.
 *
 * Existe porque `useHandCursor: true` le devuelve al navegador su manita, y esa
 * manita encima de un menu es justo lo que hace que el juego parezca una
 * pagina web.
 */
export function cursorActivo(): string {
  return `var(${VAR_ACTIVO})`;
}

let encendido = leerPreferencia();
let repintar: (() => void) | null = null;

export function cursorEncendido(): boolean {
  return encendido;
}

/** Enciende o apaga el bisturi. Devuelve como queda. */
export function alternarCursor(): boolean {
  encendido = !encendido;
  guardarPreferencia(encendido);
  repintar?.();

  return encendido;
}

export function ponerCursor(escena: Phaser.Scene): void {
  const juego = escena.game;
  const normal = dibujante(escena, CLAVE);
  const resaltado = dibujante(escena, CLAVE_ACTIVO);
  if (!normal) return;

  // Rehacer los PNG en cada evento de redimension seria tirar trabajo: la
  // ventana emite muchos mientras se arrastra el borde y la escala entera solo
  // cambia en unos pocos. Se guarda la ultima y se compara.
  let escalaPuesta = 0;

  const raiz = document.documentElement.style;

  const aplicar = (forzar: boolean): void => {
    if (!encendido) {
      raiz.setProperty(VAR_NORMAL, SISTEMA.normal);
      raiz.setProperty(VAR_ACTIVO, SISTEMA.activo);
      escalaPuesta = 0;
      return;
    }

    const escala = escalaDelLienzo(juego);
    if (!forzar && escala === escalaPuesta) return;

    const valor = normal(escala);
    if (!valor) return;
    escalaPuesta = escala;

    raiz.setProperty(VAR_NORMAL, valor);
    raiz.setProperty(VAR_ACTIVO, resaltado?.(escala) ?? valor);
  };

  // Al body y no solo al lienzo: Scale.FIT deja margenes a los lados, y ahi
  // tambien estas dentro del juego. Es el mismo motivo por el que main.ts
  // bloquea el menu contextual en todo el documento.
  document.body.style.cursor = `var(${VAR_NORMAL})`;

  // Y ademas como cursor por defecto de Phaser, que es el que el motor
  // restaura al salir de un objeto interactivo. Sin esto, la primera vez que
  // el raton sale de una entrada del libro el lienzo se queda con la flecha.
  juego.input.setDefaultCursor(`var(${VAR_NORMAL})`);

  aplicar(true);
  repintar = () => aplicar(true);
  juego.scale.on(Phaser.Scale.Events.RESIZE, () => aplicar(false));
}

/**
 * Prepara una textura para pintarla a cualquier escala.
 *
 * Devuelve una funcion en vez del PNG ya hecho porque la escala no se conoce
 * hasta que hay ventana, y cambia con ella.
 */
function dibujante(
  escena: Phaser.Scene,
  clave: string,
): ((escala: number) => string | null) | null {
  if (!escena.textures.exists(clave)) return null;

  const textura = escena.textures.get(clave);
  const fuente = textura.getSourceImage();
  if (!(fuente instanceof HTMLCanvasElement) && !(fuente instanceof HTMLImageElement)) return null;

  const ancho = textura.source[0].width;
  const alto = textura.source[0].height;

  return (escala: number): string | null => {
    const dibujo = document.createElement('canvas');
    dibujo.width = ancho * escala;
    dibujo.height = alto * escala;

    const ctx = dibujo.getContext('2d');
    if (!ctx) return null;

    // Sin esto el navegador interpola al ampliar y el bisturi sale borroso
    // justo al lado de un juego que se precia de tener el pixel duro.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fuente, 0, 0, dibujo.width, dibujo.height);

    const x = CURSOR.punta.x * escala;
    const y = CURSOR.punta.y * escala;

    // La reserva del final no es decoracion: si el PNG fallara, el jugador se
    // queda con un cursor de verdad y no sin ninguno.
    return `url(${dibujo.toDataURL('image/png')}) ${x} ${y}, ${SISTEMA.normal}`;
  };
}

/**
 * Cuantas veces cabe la resolucion interna en el lienzo que se ve.
 *
 * Se redondea a entero porque un cursor a 2.7x se interpola y pierde el pixel;
 * mejor quedarse en 3 y que sea nitido aunque no case al milimetro con el
 * tamano del personaje.
 */
function escalaDelLienzo(juego: Phaser.Game): number {
  const { displaySize, gameSize } = juego.scale;
  const bruta = gameSize.width > 0 ? displaySize.width / gameSize.width : 1;

  return Phaser.Math.Clamp(Math.round(bruta), CURSOR.escalaMinima, CURSOR.escalaMaxima);
}

// El almacenamiento del navegador puede no estar (modo privado, permisos), y
// ahi lanza en vez de devolver null. Si falla, el ajuste vive lo que dure la
// pestana: es una preferencia de comodidad, no algo por lo que romper el juego.

function leerPreferencia(): boolean {
  try {
    return localStorage.getItem(LLAVE) !== 'apagado';
  } catch {
    return true;
  }
}

function guardarPreferencia(valor: boolean): void {
  try {
    localStorage.setItem(LLAVE, valor ? 'encendido' : 'apagado');
  } catch {
    // Sin sitio donde guardarlo; el ajuste sigue valiendo para esta partida.
  }
}
