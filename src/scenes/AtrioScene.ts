import { EscenaNivel, type DefinicionNivel } from './EscenaNivel';

/**
 * El Atrio: la superficie, la ciudad visible donde vive la mayoria.
 *
 * Es el nivel mas luminoso del teaser y el unico que todavia parece
 * arquitectura. Su geometria esta dispuesta para ensenar el kit de movimiento
 * en orden, sin un solo cartel: caminar -> salto -> doble salto -> dash ->
 * agarre de bordes.
 *
 * Ademas del camino principal (el descenso en zigzag) tiene TRES desvios, y
 * cada uno guarda algo:
 *   - la ruta alta, a la derecha de la entrada: un fragmento del Codice
 *   - el campanario, arriba a la izquierda: un Relicario (hay que verlo)
 *   - la capilla lateral, a media bajada: un Frasco (exige dash)
 *   - el nicho del fondo, a la derecha: otro fragmento (exige dash)
 * Sin desvios que guarden algo no hay motivo para mirar a los lados.
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
      musica: 'atrio',
      inicio: { x: 80, y: 200 },

      llegada: 'atrio',
      mostrarAyuda: true,

      // La zona mas alta y la unica que todavia parece arquitectura: la piedra
      // va casi a su color, apenas enfriada. Es el punto de comparacion con el
      // que el jugador medira lo oscuro que se pone todo mas abajo.
      tinte: 0xe8e4e0,
      // Aqui aun entra humedad, asi que es la zona donde mas musgo prende.
      desgaste: { grietas: 0.05, musgo: 0.05 },

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

        // Campanario (secreto): arriba a la izquierda, pegado al muro.
        // La repisa alta NO cuelga sobre la baja (si lo hiciera te darias con
        // su techo) y esta a 80 px, al alcance del salto simple: el secreto es
        // VERLA, no el salto. A 104 px "exigia doble salto" y en la practica
        // era una prueba de precision, porque el segundo salto fija la
        // velocidad en vez de sumarla y solo rinde 157 px con timing perfecto.
        [48, 200, 4], //           x 48..112
        [0, 120, 3], //            x 0..48     — 80 px: salto simple

        // Ruta alta opcional, con un fragmento del Codice al final.
        [400, 240, 5], //          x 400..480 — 48 px: salto simple holgado
        [540, 128, 5], //          x 540..620 — 112 px: exige doble salto
        [760, 128, 4], //          x 760..824 — hueco de 140 px: exige dash

        // Descenso hacia los Pasillos. Es tambien la ruta de vuelta: cada tramo
        // solapa en x con el de arriba, con 80 px de caida entre ellos.
        [330, 368, 6], //          x 330..426  solapa con el suelo en 330..352
        [250, 448, 6], //          x 250..346
        [330, 528, 6], //          x 330..426
        [250, 608, 6], //          x 250..346
        [60, 688, 16], //          x 60..316
        [300, 768, 8], //          x 300..428
        [180, 848, 12], //         x 180..372
        [340, 928, 12], //         x 340..532
        [120, 1008, 20], //        x 120..440 — fondo, umbral al descenso

        // Capilla lateral (secreto): a media bajada, cruzando un hueco con dash.
        [560, 528, 7], //          x 560..672 — hueco de 134 px desde 426

        // Nicho del fondo (secreto): tras un hueco de 150 px, solo con dash.
        [590, 1008, 7], //         x 590..702
      ],

      // Superficies para el agarre de bordes. La del campanario es la que se
      // trepa para llegar arriba; la del nicho lo cierra por detras.
      paredes: [
        [944, 360, 940],
        [560, 600, 780],
        [0, 136, 200],
        [704, 940, 1010],
      ],

      devotos: [
        { x: 250, y: 288, izquierda: 180, derecha: 330 },
        { x: 380, y: 528, izquierda: 340, derecha: 420 },
        { x: 150, y: 688, izquierda: 70, derecha: 300 },
        { x: 430, y: 928, izquierda: 360, derecha: 520 },
        // Guardia de la capilla: el desvio no sale gratis.
        { x: 610, y: 528, izquierda: 570, derecha: 660 },
      ],

      altares: [
        { x: 120, y: 288 },
        { x: 100, y: 688 },
      ],

      // En rutas opcionales: premian explorar, no avanzar.
      fragmentos: [
        [840, 106, 'codice-01'],
        [380, 346, 'codice-02'],
        [650, 986, 'codice-03'],
      ],

      reliquias: [
        [24, 120, 'atrio-relicario', 'relicario'],
        [640, 528, 'atrio-frasco', 'frasco'],
      ],

      // Puntos de referencia. El Atrio aun es arquitectura: columnas, cera,
      // exvotos de sacramentos "exitosos" colgando. La carne solo asoma en los
      // charcos que dejan las rondas de los Devotos.
      decorado: [
        // Sangre y carne por todas partes: esto lleva generaciones
        // cobrando cuerpo y no lo limpia nadie.
        [590, 528, 'charco'],
        [799, 128, 'charco'],
        [299, 448, 'charco'],
        [24, 120, 'pila-carne'],
        [206, 704, 'goteo'],
        // La capa de Genesis Vestal apenas asoma aqui arriba: una terminal
        // muerta que nadie sabe leer desde hace generaciones.
        [232, 288, 'pantalla'],
        // Entrada: columnata y la cera del primer Altar.
        [40, 288, 'columna'],
        [200, 288, 'columna'],
        [340, 288, 'columna'],
        [104, 288, 'vela'],
        [136, 288, 'vela'],
        [262, 288, 'charco'],
        // Exvotos colgando bajo la ruta alta y bajo el campanario.
        [556, 144, 'exvoto'],
        [596, 144, 'exvoto'],
        [16, 136, 'exvoto'],
        [36, 136, 'exvoto'],
        // Segundo Altar.
        [84, 688, 'vela'],
        [116, 688, 'vela'],
        [130, 688, 'columna'],
        [300, 688, 'columna'],
        // Capilla lateral: cera y una columna que la cierra.
        [576, 528, 'vela'],
        [604, 528, 'vela'],
        [664, 528, 'columna'],
        // Fondo, junto al umbral.
        [160, 1008, 'columna'],
        [400, 1008, 'columna'],
        [300, 1008, 'charco'],
        [620, 1008, 'vela'],
        [680, 1008, 'vela'],
      ],

      // Fondo lejano: la ciudad-catedral. Ventanas ojivales altas y columnas
      // que se pierden hacia arriba. Es el unico sitio donde aun entra luz.
      polvo: 0xc9b48a,
      fondo: [
        [180, 250, 'ventana'],
        [420, 210, 'ventana'],
        [700, 260, 'ventana'],
        [880, 230, 'ventana'],
        [100, 300, 'columna'],
        [300, 300, 'columna'],
        [520, 300, 'columna'],
        [760, 300, 'columna'],
        [240, 640, 'ventana'],
        [560, 600, 'ventana'],
        [80, 720, 'columna'],
        [460, 720, 'columna'],
        [660, 720, 'columna'],
        [360, 980, 'ventana'],
        [620, 1000, 'columna'],
        [200, 1040, 'columna'],
      ],

      // Placas del Registro: la burocracia del diezmo empieza en la calle.
      inscripciones: [
        [170, 288, 'CASA POR CASA. Inscriban a los suyos. El Registro no elige: sortea.'],
        [250, 688, 'Los exvotos de arriba son de sacramentos completos. Den gracias.'],
        [220, 1008, 'Descenso solo con turno. Las Manos del Sacramento pasan sin turno.'],
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
