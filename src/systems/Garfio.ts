/**
 * El garfio del cazarrecompensas (#164), sin Phaser: hasta donde llega y que
 * pasa cuando alcanza al Cirujano.
 *
 * Sale recto, a la altura del pecho, hasta su alcance, y vuelve. Si toca al
 * Cirujano: parandolo se rompe, con el dash lo atraviesa, y si no, lo engancha
 * y lo arrastra.
 */

export type ResultadoGarfio = 'roto' | 'esquivado' | 'enganchado' | 'nada';

/** Lo que tiene que estar de cerca la punta para tocarle (px). */
export const RADIO_PUNTA = 12;

/** Donde esta la punta del garfio, `ms` despues de soltarlo. Ida y vuelta. */
export function puntaDelGarfio(
  origenX: number,
  direccion: number,
  velocidad: number,
  alcance: number,
  ms: number,
): { x: number; volviendo: boolean; terminado: boolean } {
  const recorrido = (velocidad * ms) / 1000;
  if (recorrido <= alcance)
    return { x: origenX + direccion * recorrido, volviendo: false, terminado: false };
  const vuelta = recorrido - alcance;
  if (vuelta >= alcance) return { x: origenX, volviendo: true, terminado: true };
  return { x: origenX + direccion * (alcance - vuelta), volviendo: true, terminado: false };
}

/** Que pasa si la punta pasa por donde esta el Cirujano. */
export function alcanzaAlCirujano(
  puntaX: number,
  puntaY: number,
  jugadorX: number,
  jugadorPechoY: number,
  estado: string,
): ResultadoGarfio {
  if (Math.abs(puntaX - jugadorX) > RADIO_PUNTA || Math.abs(puntaY - jugadorPechoY) > 16) {
    return 'nada';
  }
  if (estado === 'parry') return 'roto';
  if (estado === 'dash' || estado === 'muerto') return 'esquivado';
  return 'enganchado';
}
