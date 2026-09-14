import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * Las Criptas de Espera: donde se guarda, sedados, a quienes esperan su turno.
 *
 * Cuarto escalon del descenso, entre los Pasillos y las Salas. Es la primera
 * zona que ya no parece arquitectura: celdas con reja, camillas en fila y
 * durmientes cubiertos hasta la cabeza. Nadie grita aqui, y eso es peor.
 *
 * El trazado vuelve a ser vertical, pero en escalera de pozo: se baja de
 * celda en celda por el hueco central, y a cada lado hay criptas cerradas
 * que guardan algo. Los Vestales vigilan desde las repisas; los Devotos
 * hacen la ronda entre camillas.
 *
 * Aqui esta el fragmento del Codice que habla de la sedacion, y el que
 * confiesa que hace tres generaciones no aparece un dios nuevo. Es la zona
 * donde el jugador, si lee, entiende que el sistema ya no funciona ni
 * siquiera en sus propios terminos.
 *
 * Cuando lleguen los tilesets, esta descripcion se sustituye por la carga de
 * public/assets/maps/criptas.tmj.
 */
export class CriptasScene extends EscenaNivel {
  constructor() {
    super({ key: 'Criptas' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo: { ancho: 720, alto: 1040 },
      // Mas oscuro que los Pasillos. Penumbra sedada, casi monocromo.
      colorFondo: '#0b0a0d',
      musica: 'criptas',
      inicio: { x: 60, y: 120 },

      // Penumbra sedada: la piedra pierde el rojo y se queda casi monocroma.
      // Y no crece ni una brizna: a esta profundidad ya no llega nada vivo.
      tinte: 0x9aa0ac,
      desgaste: { grietas: 0.09, musgo: 0 },

      // Escalera de pozo: cada tramo solapa en x con el de arriba (80 px de
      // caida), asi que se puede subir de vuelta sin dash. Las criptas
      // laterales (secretos) cuelgan de los extremos y exigen dash o doble
      // salto.
      plataformas: [
        // Entrada, arriba a la izquierda.
        [0, 160, 12], //           x 0..192

        // Pozo central, en zigzag.
        [140, 240, 8], //          x 140..268
        [290, 320, 8], //          x 290..418
        [180, 400, 8], //          x 180..308
        [330, 480, 8], //          x 330..458
        [200, 560, 9], //          x 200..344
        [360, 640, 8], //          x 360..488
        [220, 720, 9], //          x 220..364
        [380, 800, 9], //          x 380..524
        [0, 880, 45], //           x 0..720 — suelo de las criptas

        // Cripta izquierda (secreto): desde el tramo de 400, saltando al
        // hueco. 120 px de hueco: exige dash.
        [20, 400, 5], //           x 20..100

        // Cripta derecha (secreto): sobre el tramo de 640, 104 px arriba.
        // Exige doble salto, y un Vestal la defiende desde su repisa.
        [560, 536, 8], //          x 560..688

        // Repisa de los Vestales, a media altura del pozo.
        [520, 320, 8], //          x 520..648
      ],

      // Los muros del pozo. Sirven para el agarre de bordes en la bajada.
      paredes: [
        [0, 176, 880],
        [704, 176, 880],
      ],

      devotos: [
        { x: 200, y: 240, izquierda: 150, derecha: 260 },
        { x: 260, y: 560, izquierda: 210, derecha: 330 },
        { x: 150, y: 880, izquierda: 40, derecha: 300 },
        { x: 480, y: 880, izquierda: 400, derecha: 660 },
      ],

      vestales: [
        { x: 580, y: 320, izquierda: 530, derecha: 640 },
        { x: 620, y: 536, izquierda: 570, derecha: 680 },
      ],

      altares: [
        { x: 40, y: 160 },
        { x: 60, y: 880 },
      ],

      fragmentos: [
        [60, 378, 'codice-07'],
        [660, 858, 'codice-08'],
      ],

      reliquias: [
        [640, 536, 'criptas-relicario', 'relicario'],
        [600, 320, 'criptas-frasco', 'frasco'],
      ],

      // Celdas: reja, camilla y durmiente en fila, repetido hasta que deja
      // de parecer una imagen y pasa a ser un inventario. Ninguna vela: aqui
      // no se reza, se espera.
      decorado: [
        [100, 160, 'columna'],
        [16, 240, 'reja'],
        [220, 240, 'camilla'],
        [220, 228, 'durmiente'],
        [360, 320, 'camilla'],
        [360, 308, 'durmiente'],
        [250, 400, 'camilla'],
        [250, 388, 'durmiente'],
        [400, 480, 'camilla'],
        [400, 468, 'durmiente'],
        [280, 560, 'camilla'],
        [280, 548, 'durmiente'],
        [430, 640, 'camilla'],
        [430, 628, 'durmiente'],
        [290, 720, 'camilla'],
        [290, 708, 'durmiente'],
        [450, 800, 'camilla'],
        [450, 788, 'durmiente'],
        // Criptas laterales.
        [60, 400, 'camilla'],
        [60, 388, 'durmiente'],
        [98, 400, 'reja'],
        [620, 536, 'reja'],
        [590, 320, 'reja'],
        // Suelo de las criptas: la fila de espera.
        [120, 880, 'camilla'],
        [120, 868, 'durmiente'],
        [240, 880, 'camilla'],
        [240, 868, 'durmiente'],
        [360, 880, 'camilla'],
        [360, 868, 'durmiente'],
        [560, 880, 'camilla'],
        [560, 868, 'durmiente'],
        [200, 880, 'charco'],
        [500, 880, 'charco'],
        [704, 880, 'columna'],
      ],

      // Placas del Registro. Burocracia hasta aqui abajo.
      inscripciones: [
        [140, 160, 'REGISTRO DE ESPERA. Turno por sorteo. No despertar a los inscritos.'],
        [340, 480, 'Sedacion administrada. Carne serena, carne grata.'],
        [420, 880, 'Entrada a las Salas por orden de Registro. Sin excepciones.'],
      ],

      umbral: {
        x: 680,
        y: 880,
        destino: 'Salas',
        etiqueta: 'las Salas de Sacramento',
      },

      limiteCaida: 940,
    };
  }
}
