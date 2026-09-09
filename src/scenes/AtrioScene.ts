import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * El Atrio: la superficie, la ciudad visible donde vive la mayoria.
 *
 * Es el nivel mas luminoso del teaser y el unico que todavia parece
 * arquitectura. Su geometria esta dispuesta para ensenar el kit de movimiento
 * en orden, sin un solo cartel: caminar -> salto -> doble salto -> dash ->
 * agarre de bordes.
 *
 * Cuando lleguen los tilesets, esta descripcion se sustituye por la carga de
 * public/assets/maps/atrio.tmj.
 */
export class AtrioScene extends EscenaNivel {
  constructor() {
    super({ key: 'Atrio' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 960, alto: 1120 },
      colorFondo: '#141014',
      inicio: { x: 80, y: 200 },
      mostrarAyuda: true,

      plataformas: [
        // Suelo inicial: espacio para caminar.
        [0, 288, 22],
        // Escalon corto (48 px): salto simple holgado.
        [400, 240, 5],
        // 112 px por encima: fuera del alcance del salto simple (92 px), exige
        // doble salto. Si tocas MOVIMIENTO.impulsoSalto, recalcula esta altura.
        [540, 128, 5],
        // Hueco de 140 px: exige salto + dash para cruzarlo.
        [760, 128, 4],
        // Repisa suelta para encadenar dash en el aire.
        [560, 400, 6],
        // Muro vertical alto: superficie de agarre de bordes.
        [300, 480, 3],
        [300, 560, 3],
        [300, 640, 3],
        // Descenso hacia los Pasillos de Preparacion.
        [0, 720, 14],
        [420, 848, 12],
        [120, 976, 20],
      ],

      // Paredes laterales para que el agarre tenga contra que engancharse.
      paredes: [
        [0, 380, 700],
        [944, 380, 700],
      ],

      devotos: [
        { x: 250, y: 288, izquierda: 180, derecha: 330 },
        { x: 600, y: 400, izquierda: 570, derecha: 690 },
        { x: 150, y: 720, izquierda: 40, derecha: 210 },
        { x: 520, y: 848, izquierda: 440, derecha: 600 },
      ],

      altares: [
        { x: 120, y: 288 },
        { x: 200, y: 720 },
      ],

      // En rutas opcionales: premian explorar, no avanzar.
      fragmentos: [
        [840, 106, 'codice-01'],
        [620, 375, 'codice-02'],
        [60, 950, 'codice-03'],
      ],

      umbral: {
        x: 380,
        y: 976,
        destino: 'Pasillos',
        etiqueta: 'descender',
      },
    };
  }
}
