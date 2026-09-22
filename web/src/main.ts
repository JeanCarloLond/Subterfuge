/**
 * Portal de la Diócesis de la Carne.
 *
 * Una sola página con rutas por hash. Cada sección es una capa: la navegación
 * es un descenso, y el sitio se oscurece y se desordena al bajar
 * (`data-profundidad` en <body>, ver estilo.css). Es la idea del bible para la
 * web como obra madre: "la estructura misma del sitio es el Vientre".
 *
 * Las secciones son módulos en `paginas/`. Cada uno recibe el contenedor
 * vacío y puede devolver una función de limpieza (temporizadores, canvas).
 */

import { renderPortada } from './paginas/portada';
import { renderDoctrina } from './paginas/doctrina';
import { renderRegistro } from './paginas/registro';
import { renderVientre } from './paginas/vientre';
import { renderLinaje } from './paginas/linaje';
import { renderSacramentos } from './paginas/sacramentos';
import { renderExamen } from './paginas/examen';
import { renderSacramento } from './paginas/sacramento';
import { presentarClave } from './memoria';
import { actualizarPie } from './pie';

type Limpieza = void | (() => void);
type Pagina = (contenedor: HTMLElement) => Limpieza;

interface Ruta {
  pagina: Pagina;
  profundidad: number;
  titulo: string;
  ancha?: boolean;
}

const RUTAS: Readonly<Record<string, Ruta>> = {
  '': { pagina: renderPortada, profundidad: 0, titulo: 'Diócesis de la Carne' },
  doctrina: { pagina: renderDoctrina, profundidad: 1, titulo: 'Doctrina' },
  registro: { pagina: renderRegistro, profundidad: 2, titulo: 'Registro', ancha: true },
  vientre: { pagina: renderVientre, profundidad: 3, titulo: 'El Vientre', ancha: true },
  linaje: { pagina: renderLinaje, profundidad: 4, titulo: 'Linaje', ancha: true },
  sacramentos: { pagina: renderSacramentos, profundidad: 5, titulo: 'Sacramentos' },
  examen: { pagina: renderExamen, profundidad: 5, titulo: 'Examen de Pureza' },
  sacramento: { pagina: renderSacramento, profundidad: 5, titulo: 'El Sacramento' },
};

let limpieza: Limpieza;

function rutaActual(): string {
  return location.hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, '');
}

/**
 * Una clave puede venir en la URL (`#/doctrina?clave=...`): es lo que llevaría
 * un código QR pegado en un pasillo. Se presenta una vez y se quita de la
 * barra, para que el enlace no la enseñe a quien mire por encima del hombro.
 */
function presentarClaveDeLaUrl(): void {
  const consulta = location.hash.split('?')[1];
  if (!consulta) return;
  const clave = new URLSearchParams(consulta).get('clave');
  if (clave) presentarClave(clave);
  history.replaceState(null, '', `#/${rutaActual()}`);
}

function navegar(): void {
  presentarClaveDeLaUrl();
  const clave = rutaActual();
  const ruta = RUTAS[clave] ?? RUTAS[''];
  const contenedor = document.getElementById('pagina');
  if (!contenedor) return;

  if (typeof limpieza === 'function') limpieza();
  contenedor.replaceChildren();
  contenedor.classList.toggle('ancha', ruta.ancha === true);
  document.body.dataset.profundidad = String(ruta.profundidad);
  document.title = clave ? `${ruta.titulo} · Diócesis de la Carne` : ruta.titulo;

  for (const enlace of document.querySelectorAll<HTMLAnchorElement>('.nav a[data-ruta]')) {
    const activa =
      enlace.dataset.ruta === clave ||
      (clave.startsWith('sacr') && enlace.dataset.ruta === 'sacramentos') ||
      (clave === 'examen' && enlace.dataset.ruta === 'sacramentos');
    enlace.classList.toggle('activa', activa);
  }

  limpieza = ruta.pagina(contenedor);
  window.scrollTo({ top: 0 });
  contenedor.focus({ preventScroll: true });
  actualizarPie();
}

function prepararClave(): void {
  const forma = document.getElementById('forma-clave') as HTMLFormElement | null;
  const campo = document.getElementById('campo-clave') as HTMLInputElement | null;
  const respuesta = document.getElementById('clave-respuesta');
  if (!forma || !campo || !respuesta) return;

  forma.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const resultado = presentarClave(campo.value);
    if (!resultado) {
      respuesta.textContent = 'El Registro no reconoce esa clave.';
      return;
    }
    if (resultado.abre.length === 0) {
      respuesta.textContent = 'Correcto. Eso lo sabe cualquier fiel.';
      return;
    }
    respuesta.textContent = resultado.nueva
      ? 'Clave aceptada. El expediente se abre.'
      : 'Esa clave ya está presentada.';
    campo.value = '';
    navegar();
  });
}

function prepararEnlaceAlJuego(): void {
  const enlace = document.getElementById('enlace-juego') as HTMLAnchorElement | null;
  if (enlace) enlace.href = import.meta.env.BASE_URL;
}

window.addEventListener('hashchange', navegar);
prepararClave();
prepararEnlaceAlJuego();
navegar();
