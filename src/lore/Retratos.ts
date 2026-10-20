/**
 * Quien habla en los dialogos, y como se le ve hablar (issue #145).
 *
 * El dialogo era una banda con un rotulo rojo: para saber quien hablaba habia
 * que leerlo. Ahora cada voz tiene cara, como en Stardew Valley, porque en el
 * Vientre el horror lo ponen personas normales hablando con normalidad, y una
 * persona sin cara se lee como un cartel.
 *
 * Esto es lo que NO cambia cuando llegue el arte definitivo: el nombre de la
 * placa y que fotogramas mueve cada uno. El dibujo vive en
 * RetratosProvisionales (o en el PNG que lo sustituya, con la misma clave).
 *
 * Quien no puede mover la boca no la mueve:
 *   - el Cirujano lleva la mascara de pico: no gesticula, solo respira y la
 *     luz le corre por el pico;
 *   - la Vestal de Registro y la auxiliar hablan con la mascarilla;
 *   - el tanteador lleva venda: no parpadea.
 */

export type ClaveRetrato =
  | 'cirujano'
  | 'fiel'
  | 'registradora'
  | 'auxiliar'
  | 'tanteador'
  | 'honguera'
  | 'reformado-sentado';

export interface FichaRetrato {
  /** Lo que dice la placa bajo el retrato. */
  nombre: string;
  /** Fotogramas que se alternan mientras se escribe la linea. Vacio: no habla. */
  habla: readonly string[];
  /** Fotograma de ojos cerrados, si los tiene a la vista. */
  parpadeo?: string;
  /** Fotograma que destella de vez en cuando (el pico del Cirujano). */
  brillo?: string;
  /** Sube y baja un pixel, despacio: respira. */
  respira?: boolean;
}

export const RETRATOS: Readonly<Record<ClaveRetrato, FichaRetrato>> = {
  cirujano: { nombre: 'MANOS DEL SACRAMENTO N.º 7', habla: [], brillo: 'brillo', respira: true },
  fiel: { nombre: 'FIEL EN LA COLA', habla: ['habla1', 'habla2'], parpadeo: 'parpadeo' },
  registradora: { nombre: 'VESTAL DE REGISTRO', habla: ['habla1', 'habla2'], parpadeo: 'parpadeo' },
  auxiliar: { nombre: 'AUXILIAR DE CRIPTAS', habla: ['habla1', 'habla2'], parpadeo: 'parpadeo' },
  tanteador: { nombre: 'TANTEADOR', habla: ['habla1', 'habla2'] },
  honguera: { nombre: 'HONGUERA', habla: ['habla1', 'habla2'], parpadeo: 'parpadeo' },
  'reformado-sentado': {
    nombre: 'REFORMADO',
    habla: ['habla1', 'habla2'],
    parpadeo: 'parpadeo',
    respira: true,
  },
};

/** Clave de textura de un fotograma; sin fotograma, la base. */
export function texturaRetrato(clave: ClaveRetrato, fotograma?: string): string {
  return fotograma ? `retrato-${clave}-${fotograma}` : `retrato-${clave}`;
}
