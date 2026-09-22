/**
 * Doctrina: los folios del Códice, y la Vigilia.
 *
 * La Diócesis publica su escritura: los versículos de las ocho hojas se leen
 * sin haber jugado. Lo que no publica es lo que hay debajo y al margen.
 *
 * La Vigilia es el minijuego del bible: "mantén encendida una vela de cera
 * humana mientras lees el Códice". La vela se consume; si se apaga, la página
 * se queda a oscuras y en la oscuridad se ve lo que la luz tapaba: el margen
 * de la otra mano y, debajo de la escritura, el manual de Genesis Vestal del
 * que se reescribió. Solo en las hojas que el visitante se haya ganado.
 */

import { CODICE } from '../../../src/lore/Codice';
import { fragmentoAbierto } from '../memoria';
import { acentuar, elemento, html, parrafos } from '../texto';

/**
 * Lo que había escrito debajo de cada hoja antes de que la Diócesis la
 * reescribiera. El bible: "los manuales técnicos se volvieron escritura
 * sagrada". Cada línea es el reverso técnico de un versículo, no lore nuevo.
 */
const MANUAL: Readonly<Record<string, readonly string[]>> = {
  'codice-01': [
    'GV·PROT-07 §1  Cubrir el campo y el rostro del sujeto antes de la incisión.',
    '§1.2  Ausencia de tejido óptico en los 1000 sujetos del lote. Causa: no determinada.',
    '§1.3  Respuesta al tacto: sí. Respuesta a estímulo visual: nula.',
  ],
  'codice-02': [
    'GV·PROT-07 §2  Registrar masa del aporte tisular antes y después. Dos cifras.',
    '§2.1  El lote metaboliza únicamente tejido en contacto directo.',
    '§2.4  Reducir el aporte aumenta la actividad motora del lote. Ver incidencias.',
  ],
  'codice-03': [
    'GV·INF-00  Programa de regeneración celular radical. Objetivo: fin de la muerte.',
    'Resultado: supervivencia del 100 % del lote. Mutación descontrolada. Fusión con la estructura.',
    'No se dispone de procedimiento de terminación. Se archiva.',
  ],
  'codice-04': [
    'GV·ADM-03  Aporte tisular por unidad familiar, periodicidad anual.',
    '§3.2  Selección por sorteo para evitar sesgo. Deuda contractual: liquidable en especie.',
    '§3.3  No se aceptan aportes fuera de sorteo. (Tachado.)',
  ],
  'codice-05': [
    'GV·PROT-07 §5  Sujeto integrado: transferencia completa al lote. Sin retorno.',
    '§5.1  Integración parcial: sujeto viable, no funcional. Clasificar como REFORMADO.',
    '§5.2  Alojamiento de reformados en niveles inferiores. Sin visitas.',
  ],
  'codice-06': [
    'GV·PROT-07 §6  El operador actúa por protocolo. Identificación por número de puesto.',
    '§6.1  Sin interacción verbal ni contacto visual con el sujeto durante el procedimiento.',
    '§6.2  Desviaciones del operador: registrar y sustituir.',
  ],
  'codice-07': [
    'GV·PROT-07 §7  Sedación 24 h antes del procedimiento. Sujeto inconsciente al ingreso.',
    '§7.1  Un sujeto sereno no altera la conducta del lote ni la de los sujetos en espera.',
    '§7.3  Área de espera: niveles intermedios. Temperatura y humedad controladas.',
  ],
  'codice-08': [
    'GV·INF-00 §8  Nuevas integraciones completas registradas en las últimas tres generaciones: 0.',
    '§8.1  Este dato no se comunica al personal ni a la población.',
    '§8.2  El lote se mantiene en 1000 unidades. No hay evidencia de que pueda crecer.',
  ],
};

const DURACION_VELA_MS = 75_000;

export function renderDoctrina(contenedor: HTMLElement): () => void {
  const abiertas = CODICE.filter((f) => fragmentoAbierto(f.id)).length;

  const raiz = elemento(`
    <article>
      <div class="eyebrow">Doctrina · capa I</div>
      <h1>El Códice de la Carne</h1>
      <div class="filete"></div>
      <p class="lede">
        Ocho hojas de la escritura, tal como se enseñan en el Atrio. El fiel lee con la vela
        encendida; lo que la luz no alcanza no es para el fiel.
      </p>
      <p style="font-size:16px;color:var(--tinta-2)">
        ${
          abiertas === CODICE.length
            ? 'Tienes las ocho hojas. En la oscuridad se leen enteras.'
            : abiertas > 0
              ? `Has recogido ${abiertas} de las ocho hojas. Solo en esas se ve lo que hay al margen.`
              : 'No has recogido ninguna hoja. Los márgenes están arrancados: se recuperan bajando, o con una clave.'
        }
      </p>

      <div class="vigilia" id="vigilia">
        <div class="vela" id="vela">
          <div class="vela-cuerpo"></div>
          <div class="vela-llama"></div>
          <div class="vela-humo"></div>
        </div>
        <div class="vigilia-texto" id="vigilia-texto"></div>
        <button type="button" id="avivar">Avivar</button>
      </div>

      <div id="folios"></div>
    </article>
  `);

  const folios = raiz.querySelector('#folios') as HTMLElement;
  CODICE.forEach((fragmento, i) => {
    const abierta = fragmentoAbierto(fragmento.id);
    const romano = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i];
    const folio = elemento(`
      <section class="folio" aria-labelledby="folio-${i}">
        <div class="folio-cabecera"><span>${html(acentuar(fragmento.cita))}</span><span>fol. ${romano}</span></div>
        <h3 id="folio-${i}">${html(fragmento.titulo)}</h3>
        <ol class="versiculos">
          ${fragmento.versiculo.map((v) => `<li>${html(acentuar(v))}</li>`).join('')}
        </ol>
        ${
          abierta
            ? `<div class="margen">${parrafos(fragmento.margen)}</div>
               <div class="manual abierto">${(MANUAL[fragmento.id] ?? []).map((l) => `<p>${html(l)}</p>`).join('')}</div>`
            : `<div class="margen arrancado"><p>El margen de esta hoja está arrancado. Se recupera en el descenso.</p></div>`
        }
      </section>
    `);
    folios.append(folio);
  });

  contenedor.append(raiz);

  // -- La Vigilia -----------------------------------------------------------

  const vela = raiz.querySelector('#vela') as HTMLElement;
  const texto = raiz.querySelector('#vigilia-texto') as HTMLElement;
  const avivar = raiz.querySelector('#avivar') as HTMLButtonElement;

  let encendidaDesde = performance.now();
  let apagada = false;
  let temporizador = 0;

  const actualizar = () => {
    const restante = Math.max(0, 1 - (performance.now() - encendidaDesde) / DURACION_VELA_MS);
    vela.style.setProperty('--cera', `${6 + Math.round(restante * 26)}px`);

    if (!apagada && restante === 0) {
      apagada = true;
      raiz.classList.add('apagada');
      texto.innerHTML =
        '<b>La vela se ha apagado.</b> A oscuras, la hoja enseña lo que la luz tapaba. Avívala si quieres volver a leer solo la doctrina.';
      avivar.textContent = 'Encender';
      return;
    }
    if (!apagada) {
      const segundos = Math.ceil((restante * DURACION_VELA_MS) / 1000);
      texto.innerHTML =
        abiertas > 0
          ? `<b>Vigilia.</b> Lee mientras dure la vela. Quedan ${segundos} s de cera; avívala o deja que se consuma.`
          : `<b>Vigilia.</b> Lee mientras dure la vela. Quedan ${segundos} s. Sin hojas recogidas, la oscuridad no enseña nada.`;
    }
  };

  avivar.addEventListener('click', () => {
    encendidaDesde = performance.now();
    apagada = false;
    raiz.classList.remove('apagada');
    avivar.textContent = 'Avivar';
    actualizar();
  });

  actualizar();
  temporizador = window.setInterval(actualizar, 500);
  return () => window.clearInterval(temporizador);
}
