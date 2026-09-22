/** El pie de página: el expediente del visitante y la mancha. */

import { descensoAbierto, mancha, memoriaDelDescenso } from './memoria';

/** El expediente del pie: qué ha bajado el visitante, según el juego. */
export function actualizarPie(): void {
  const texto = document.getElementById('pie-expediente');
  if (!texto) return;

  const m = memoriaDelDescenso();
  const partes: string[] = [];
  if (m.capas.length) partes.push(`${m.capas.length} de 6 capas pisadas`);
  if (m.fragmentos.length) partes.push(`${m.fragmentos.length} de 8 hojas del Códice`);
  if (m.fichas.length) partes.push(`${m.fichas.length} fichas del Registro`);
  if (m.hitos.includes('final')) partes.push('descenso completado');
  if (descensoAbierto() && !partes.length) partes.push('expediente abierto por clave');

  texto.textContent = partes.length
    ? `Descenso registrado: ${partes.join(' · ')}.`
    : 'Sin descenso registrado. Lo que bajes en el juego se apunta aquí.';

  const manchaEl = document.getElementById('mancha');
  if (manchaEl) {
    const tamano = mancha() * 90;
    manchaEl.style.width = `${tamano}px`;
    manchaEl.style.height = `${tamano}px`;
  }
}
