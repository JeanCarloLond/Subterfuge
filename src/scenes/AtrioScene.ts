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

      // Reglas del trazado, para que el descenso SIEMPRE se pueda desandar.
      //
      // Un salto simple sube 92 px (impulso^2 / 2*gravedad), PERO el tiempo que
      // el Cirujano pasa por encima de una altura h es 2*sqrt(impulso^2-2*g*h)/g.
      // Para h = 80 px eso son 0,32 s, y a 130 px/s solo 41 px de avance
      // horizontal. Por eso la ruta de vuelta se traza con tramos que SOLAPAN
      // en x en vez de con huecos: subir nunca debe depender del dash.
      //
      // El reto vive en las rutas opcionales, no en poder volver.
      plataformas: [
        // Suelo inicial: espacio para caminar.
        [0, 288, 22], //           x 0..352

        // Ruta alta opcional, con un fragmento del Códice al final.
        [400, 240, 5], //          x 400..480 — 48 px: salto simple holgado
        [540, 128, 5], //          x 540..620 — 112 px: exige doble salto
        [760, 128, 4], //          x 760..824 — hueco de 140 px: exige dash

        // Descenso hacia los Pasillos. Es también la ruta de vuelta: cada tramo
        // solapa en x con el de arriba, con 80 px de caída entre ellos.
        [330, 368, 6], //          x 330..426  solapa con el suelo en 330..352
        [250, 448, 6], //          x 250..346
        [330, 528, 6], //          x 330..426
        [250, 608, 6], //          x 250..346
        [60, 688, 16], //          x 60..316
        [300, 768, 8], //          x 300..428
        [180, 848, 12], //         x 180..372
        [340, 928, 12], //         x 340..532
        [120, 1008, 20], //        x 120..440 — fondo, umbral al descenso
      ],

      // Superficies para el agarre de bordes.
      paredes: [
        [944, 360, 940],
        [560, 600, 780],
      ],

      devotos: [
        { x: 250, y: 288, izquierda: 180, derecha: 330 },
        { x: 380, y: 528, izquierda: 340, derecha: 420 },
        { x: 150, y: 688, izquierda: 70, derecha: 300 },
        { x: 430, y: 928, izquierda: 360, derecha: 520 },
      ],

      altares: [
        { x: 120, y: 288 },
        { x: 100, y: 688 },
      ],

      // En rutas opcionales: premian explorar, no avanzar.
      fragmentos: [
        [840, 106, 'codice-01'],
        [380, 346, 'codice-02'],
        [180, 986, 'codice-03'],
      ],

      umbral: {
        x: 380,
        y: 1008,
        destino: 'Pasillos',
        etiqueta: 'descender',
      },

      // Por debajo del suelo del fondo: devuelve al Altar en vez de encallar.
      limiteCaida: 1060,
    };
  }
}
