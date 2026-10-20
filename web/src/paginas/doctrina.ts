/**
 * Doctrina: los folios del Códice, y la Vigilia.
 *
 * La Diócesis publica su escritura: los versículos de todas las hojas se leen
 * sin haber jugado. Lo que no publica es lo que hay debajo y al margen.
 *
 * La Vigilia es el minijuego del bible: "mantén encendida una vela de cera
 * humana mientras lees el Códice". La vela se consume; si se apaga, la página
 * se queda a oscuras y en la oscuridad se ve lo que la luz tapaba: el margen
 * de la otra mano y, debajo de la escritura, el manual de Genesis Vestal del
 * que se reescribió. Solo en las hojas que el visitante se haya ganado.
 */

import { CODICE, ROMANOS, numeroEnLetras } from '../../../src/lore/Codice';
import { type Folio, montarLibro } from '../libro';
import { fragmentoAbierto } from '../memoria';
import { acentuar, elemento, html, parrafos } from '../texto';
import { montarVela } from '../vela';

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
  'codice-09': [
    'GV·RES-04 §9  Residuo tisular no apto: retirar de la sala y evacuar por el desagüe inferior.',
    '§9.1  No se registra el destino final del residuo. No es competencia del operador.',
  ],
  'codice-10': [
    'GV·PROT-07 §5.2  Alojamiento de reformados en niveles inferiores. Sin visitas.',
    '§5.3  El nivel inferior no requiere limpieza: el lote se encarga. (Sin datos posteriores.)',
  ],
};

/** El ejemplar de la web es el Códice entero: aquí las hojas son doctrina, no botín. */
const HOJAS = numeroEnLetras(CODICE.length);

export function renderDoctrina(contenedor: HTMLElement): () => void {
  const abiertas = CODICE.filter((f) => fragmentoAbierto(f.id)).length;

  const raiz = elemento(`
    <article>
      <div class="eyebrow">Doctrina · capa I</div>
      <h1>El Códice de la Carne</h1>
      <div class="filete"></div>
      <p class="lede">
        Edición para el fiel de las ${HOJAS} hojas del Códice, tal como se enseñan en el Atrio. La
        Diócesis recomienda leerlas con una vela encendida y no prolongar la lectura más de lo
        que dure la cera.
      </p>
      <p style="font-size:16px;color:var(--tinta-2)">
        ${
          abiertas === CODICE.length
            ? 'Su ejemplar está completo. Le rogamos que no lo lea a oscuras.'
            : abiertas > 0
              ? `Su ejemplar tiene ${abiertas} de las ${HOJAS} hojas completas. Las demás llegaron sin margen.`
              : 'Su ejemplar llegó sin márgenes. Es normal: los márgenes se reponen en el descenso, o presentando una clave.'
        }
      </p>

      <p class="vigilia-nota" id="vigilia-nota" aria-live="polite"></p>

      <div id="libro"></div>
    </article>
  `);

  // Cada folio es una doble página: la escritura, y enfrente lo que la otra
  // mano dejó al margen (o el hueco donde lo arrancaron).
  const folios: Folio[] = CODICE.map((fragmento, i) => {
    const abierta = fragmentoAbierto(fragmento.id);
    const romano = ROMANOS[i] ?? String(i + 1);
    return {
      romano,
      ganada: abierta,
      izquierda: `
        <div class="folio-cabecera"><span>${html(acentuar(fragmento.cita))}</span><span>fol. ${romano}</span></div>
        <h3>${html(fragmento.titulo)}</h3>
        <ol class="versiculos">
          ${fragmento.versiculo.map((v) => `<li>${html(acentuar(v))}</li>`).join('')}
        </ol>`,
      derecha: abierta
        ? `<div class="margen">${parrafos(fragmento.margen)}</div>
           <div class="manual abierto">${(MANUAL[fragmento.id] ?? []).map((l) => `<p>${html(l)}</p>`).join('')}</div>`
        : `<div class="desgarro" aria-hidden="true"><i></i></div>
           <div class="margen arrancado"><p>Margen no disponible en esta edición.</p></div>`,
    };
  });
  const cerrarLibro = montarLibro(raiz.querySelector('#libro') as HTMLElement, folios);

  contenedor.append(raiz);

  // -- La Vigilia -----------------------------------------------------------
  // La vela vive en la esquina (`vela.ts`); aquí solo se oscurece la página.

  const nota = raiz.querySelector('#vigilia-nota') as HTMLElement;
  const avisar = (apagada: boolean) => {
    raiz.classList.toggle('apagada', apagada);
    nota.innerHTML = apagada
      ? '<b>La vela se ha apagado.</b> Le recomendamos encenderla de nuevo. La Diócesis no se hace responsable de lo que se lea a oscuras.'
      : abiertas > 0
        ? '<b>Vigilia.</b> La vela de la esquina se ahoga sola. Puede avivarla cuantas veces quiera.'
        : '<b>Vigilia.</b> La vela de la esquina se ahoga sola. Con un ejemplar sin márgenes, dejar que se apague no tiene consecuencias.';
  };
  avisar(false);
  const cerrarVela = montarVela(avisar);

  return () => {
    cerrarVela();
    cerrarLibro();
  };
}
