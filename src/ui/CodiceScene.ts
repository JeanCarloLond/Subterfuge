import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { CODICE, fragmentoPorId } from '../lore/Codice';
import { FAMILIAS, REGISTRO, type Familia } from '../lore/Registro';
import { VIENTRE } from '../lore/Vientre';
import { JERARQUIA } from '../lore/Jerarquia';
import { progreso } from '../systems/Progreso';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';

/** Datos con los que se lanza: que escena de juego hay que reanudar al cerrar. */
interface DatosCodice {
  escenaJuego: string;
}

/**
 * Paleta del folio: la del mundo (carne, sangre, oro liturgico, hueso), sobre
 * pergamino y no sobre un panel oscuro. El Codice es un documento del Vientre,
 * no una ventana del juego (issue #35).
 */
const COLOR = {
  velo: 0x0b090b,
  pergamino: 0xc9b892,
  pergaminoSombra: 0x9e8c66,
  cera: 0xe8dcc0,
  sangre: 0x8c2f2f,
  oro: 0x9a7a2c,
  tinta: '#2a1a1e',
  rubrica: '#8c2f2f',
  oroTexto: '#7a5f1e',
  tenue: '#8a7d70',
  /** La otra mano: lapiz, no tinta. Nada en el Codice oficial es gris. */
  lapiz: '#3f3d47',
  palimpsesto: '#2a1a1e',
} as const;

/** Numeros romanos para capitulos y folios. */
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** Ruido entero reproducible: los bordes rotos del folio salen igual cada vez. */
function ruido(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Lectura del Codice de la Carne.
 *
 * Se abre con L sobre la escena de juego, que queda en pausa debajo. Lo que se
 * ve es un FOLIO: una pagina del Codice tal como existe dentro del mundo. El
 * world bible lo describe como escritura sagrada reescrita sobre los manuales
 * tecnicos de Genesis Vestal ("los manuales tecnicos se volvieron escritura
 * sagrada"), con "anotaciones al margen hechas por alguien que intento
 * advertir algo". De ahi las tres capas del folio:
 *
 *   1. Debajo, casi invisible, el manual: una cabecera tecnica y una rejilla
 *      de formulario que asoman a traves del pergamino (palimpsesto).
 *   2. Encima, la escritura: rubrica en rojo, versiculos numerados, inicial
 *      versal, filete de oro. Lo que la Diocesis ensena.
 *   3. Al margen, a lapiz, inclinada y con su corchete: la otra mano. Lo que
 *      el Cirujano piensa (issue #34). Llega un instante despues del
 *      versiculo, para que no se lea como parte de el.
 *
 * Y la materia del mundo sobre el papel: cera de vela en el borde, una mancha
 * de sangre, y el filo roto del folio. Todo dibujado con Graphics: sin arte
 * nuevo que pedir.
 *
 * Recoger un fragmento NO abre esta pantalla: el lore es opcional y no
 * interrumpe la accion. Se lee cuando el jugador quiere.
 */
/** Una fila de cualquiera de las tres secciones nuevas. */
interface EntradaPagina {
  nombre: string;
  descripcion: readonly string[];
  /** Linea pequena bajo el titulo: como se encontro, o si no se llega. */
  pie: string;
  textura?: string;
  fotograma?: number;
  /** Si ya esta descubierta. Se consulta al dibujar, no al crear. */
  abierta: () => boolean;
  /** Separador de familia en el Registro: no se puede seleccionar. */
  cabecera?: boolean;
}

/** Las cuatro secciones del libro, en el orden en que se pasan. */
const SECCIONES = ['codice', 'registro', 'vientre', 'jerarquia'] as const;
type Seccion = (typeof SECCIONES)[number];

const ROTULOS: Readonly<Record<Seccion, string>> = {
  codice: 'CODICE',
  registro: 'REGISTRO',
  vientre: 'EL VIENTRE',
  jerarquia: 'JERARQUIA',
};

const TITULOS: Readonly<Record<Seccion, string>> = {
  codice: 'EL CODICE DE LA CARNE',
  registro: 'REGISTRO DE LA DIOCESIS',
  vientre: 'CORTE DEL VIENTRE',
  jerarquia: 'ORDEN DE LOS FIELES',
};

export class CodiceScene extends Phaser.Scene {
  private escenaJuego = 'Atrio';
  private indice = 0;
  private ids: string[] = [];

  private seccion: Seccion = 'codice';
  private paginas!: Record<Seccion, Phaser.GameObjects.Container>;
  private pestanas: Phaser.GameObjects.Text[] = [];
  private tituloLibro!: Phaser.GameObjects.Text;
  /** Fila elegida dentro de cada seccion, para volver donde lo dejaste. */
  private fila: Record<Seccion, number> = { codice: 0, registro: 0, vientre: 0, jerarquia: 0 };

  private folioTexto!: Phaser.GameObjects.Text;
  private tituloTexto!: Phaser.GameObjects.Text;
  private inicialTexto!: Phaser.GameObjects.Text;
  private versiculoTexto!: Phaser.GameObjects.Text;
  private numerosTextos: Phaser.GameObjects.Text[] = [];
  private margenTexto!: Phaser.GameObjects.Text;
  private margenEtiqueta!: Phaser.GameObjects.Text;
  private margenCorchete!: Phaser.GameObjects.Graphics;
  private indiceTextos: Phaser.GameObjects.Text[] = [];
  private rotuloIndice!: Phaser.GameObjects.Text;

  private cerrando = false;
  private lecturaX = 0;
  private lecturaAncho = 0;

  constructor() {
    super({ key: 'Codice' });
  }

  create(datos: DatosCodice): void {
    this.escenaJuego = datos.escenaJuego;
    this.cerrando = false;
    this.ids = progreso.idsRecogidosEnOrden;

    // Phaser REUTILIZA la instancia de la escena: al abrir el libro por
    // segunda vez, `create()` vuelve a correr sobre el mismo objeto y todo lo
    // que quedo guardado en campos sigue apuntando a objetos ya destruidos.
    // Las pestanas se acumulaban de apertura en apertura, y a la segunda
    // `irASeccion` les pedia setColor a cuatro textos muertos: el render
    // reventaba con `frame.source is null`, la escena moria a medias y el
    // nivel se quedaba pausado para siempre. Eso era el cuelgue al pulsar L.
    this.pestanas = [];
    this.numerosTextos = [];
    this.indiceTextos = [];
    this.indice = this.primerSinLeer();

    const { ancho, alto } = RESOLUCION;

    // Velo sobre el juego en pausa.
    this.add.rectangle(0, 0, ancho, alto, COLOR.velo, 0.86).setOrigin(0, 0);

    const folioX = 20;
    const folioY = 14;
    const folioAncho = ancho - 40;
    const folioAlto = alto - 28;

    this.dibujarFolio(folioX, folioY, folioAncho, folioAlto);
    this.dibujarPalimpsesto(folioX, folioY, folioAncho, folioAlto);

    const separadorX = folioX + 126;
    const filete = this.add.graphics();
    filete.lineStyle(1, COLOR.oro, 0.7);
    filete.lineBetween(separadorX, folioY + 26, separadorX, folioY + folioAlto - 26);

    // Cabecera del folio: el libro, el capitulo y el numero de hoja.
    this.tituloLibro = this.add.text(folioX + 14, folioY + 10, TITULOS.codice, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: COLOR.oroTexto,
    });
    this.folioTexto = this.add
      .text(folioX + folioAncho - 14, folioY + 10, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLOR.oroTexto,
      })
      .setOrigin(1, 0);
    this.dibujarFileteDoble(folioX + 14, folioY + 22, folioAncho - 28);

    this.crearIndice(folioX + 14, folioY + 34);

    this.lecturaX = separadorX + 22;
    this.lecturaAncho = folioX + folioAncho - 16 - this.lecturaX;

    this.tituloTexto = this.add.text(this.lecturaX, folioY + 32, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: COLOR.rubrica,
    });
    this.inicialTexto = this.add.text(this.lecturaX, folioY + 50, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: COLOR.rubrica,
    });
    this.versiculoTexto = this.add.text(this.lecturaX, folioY + 52, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: COLOR.tinta,
      lineSpacing: 4,
      wordWrap: { width: this.lecturaAncho },
    });

    this.margenCorchete = this.add.graphics();
    this.margenEtiqueta = this.add.text(this.lecturaX + 10, 0, 'al margen, a lapiz:', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: COLOR.lapiz,
    });
    this.margenTexto = this.add.text(this.lecturaX + 10, 0, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      fontStyle: 'italic',
      color: COLOR.lapiz,
      lineSpacing: 3,
      wordWrap: { width: this.lecturaAncho - 16 },
    });
    // Inclinada: es una mano, no una imprenta.
    this.margenTexto.setAngle(-2);
    this.margenEtiqueta.setAngle(-2);

    this.add.text(
      folioX + 14,
      folioY + folioAlto - 16,
      'A D  seccion     W S  pasar hoja     L  o  ESC: cerrar',
      { fontFamily: 'monospace', fontSize: '7px', color: COLOR.tenue },
    );

    const cerrar = this.add
      .text(folioX + folioAncho - 14, folioY + folioAlto - 16, '[ cerrar ]', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    cerrar.on('pointerover', () => cerrar.setColor(COLOR.rubrica));
    cerrar.on('pointerout', () => cerrar.setColor(COLOR.tenue));
    cerrar.on('pointerdown', () => this.cerrar());

    // Todo lo del Codice a un contenedor, para poder esconderlo de golpe al
    // pasar de seccion. Se agrupa DESPUES de crearlo para no tocar una linea
    // del folio, que ya estaba afinado.
    this.paginas = {
      codice: this.add.container(0, 0, [
        filete,
        this.rotuloIndice,
        this.folioTexto,
        this.tituloTexto,
        this.inicialTexto,
        this.versiculoTexto,
        this.margenTexto,
        this.margenEtiqueta,
        this.margenCorchete,
        ...this.indiceTextos,
      ]),
      registro: this.crearPaginaRegistro(folioX, folioY, folioAncho, folioAlto),
      vientre: this.crearPaginaVientre(folioX, folioY, folioAncho, folioAlto),
      jerarquia: this.crearPaginaJerarquia(folioX, folioY, folioAncho, folioAlto),
    };

    // La primera fila de cada seccion tiene que ser una ficha de verdad: las
    // cabeceras de familia del Registro son separadores y no tienen nada que
    // ensenar en la pagina derecha.
    for (const clave of SECCIONES) {
      if (clave === 'codice') continue;
      const datos = this.paginas[clave].getData('entradas') as EntradaPagina[];
      this.fila[clave] = Math.max(
        0,
        datos.findIndex((e) => !e.cabecera),
      );
    }

    this.crearPestanas(folioX + 14, folioY + folioAlto - 30);
    // Sin ningun fragmento recogido el Codice esta en blanco, asi que el libro
    // abre por el Registro, que siempre tiene algo. Nada mas frustrante que
    // abrir un libro y que la primera pagina este vacia.
    this.irASeccion(this.ids.length > 0 ? 'codice' : 'registro');

    this.mostrar(this.indice);
    this.cameras.main.fadeIn(180, 11, 9, 11);
    sonido.codice();

    this.input.keyboard?.on('keydown-L', () => this.cerrar());
    this.input.keyboard?.on('keydown-ESC', () => this.cerrar());
    this.input.keyboard?.on('keydown-A', () => this.cambiarSeccion(-1));
    this.input.keyboard?.on('keydown-D', () => this.cambiarSeccion(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.cambiarSeccion(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.cambiarSeccion(1));
    this.input.keyboard?.on('keydown-UP', () => this.mover(-1));
    this.input.keyboard?.on('keydown-W', () => this.mover(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.mover(1));
    this.input.keyboard?.on('keydown-S', () => this.mover(1));
  }

  // -- El folio --------------------------------------------------------------

  /**
   * La hoja: pergamino con el filo derecho e inferior rotos, sombra debajo,
   * los bordes oscurecidos por el uso, cera de vela arriba a la izquierda y
   * una mancha de sangre abajo a la derecha. "Vela de cera humana" y "sangre"
   * son la materia cotidiana del culto segun el world bible; un documento del
   * Vientre las lleva encima.
   */
  private dibujarFolio(x: number, y: number, ancho: number, alto: number): void {
    const g = this.add.graphics();

    // Sombra: la hoja esta sobre algo, no flotando.
    g.fillStyle(0x000000, 0.5);
    g.fillRect(x + 3, y + 4, ancho, alto);

    // Contorno con los filos rotos: el derecho y el de abajo, que son los que
    // se manosean al pasar la hoja.
    const puntos: Phaser.Math.Vector2[] = [];
    puntos.push(new Phaser.Math.Vector2(x, y));
    puntos.push(new Phaser.Math.Vector2(x + ancho, y));
    for (let py = y + 6; py < y + alto; py += 6) {
      puntos.push(new Phaser.Math.Vector2(x + ancho - (ruido(1, py) % 4), py));
    }
    puntos.push(new Phaser.Math.Vector2(x + ancho - 2, y + alto));
    for (let px = x + ancho - 8; px > x; px -= 8) {
      puntos.push(new Phaser.Math.Vector2(px, y + alto - (ruido(px, 2) % 4)));
    }
    puntos.push(new Phaser.Math.Vector2(x, y + alto - 1));

    g.fillStyle(COLOR.pergamino, 1);
    g.fillPoints(puntos, true);

    // Bordes oscurecidos: el mismo degradado radial que usa la vineta del
    // juego, encima del pergamino y recortado a la hoja.
    const uso = this.add.image(x + ancho / 2, y + alto / 2, 'vineta-placeholder');
    uso.setDisplaySize(ancho, alto);
    uso.setAlpha(0.55);
    uso.setTint(COLOR.pergaminoSombra);
    uso.setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Manchas de uso: dedos en las esquinas por donde se pasa la hoja.
    g.fillStyle(COLOR.pergaminoSombra, 0.18);
    g.fillEllipse(x + ancho - 22, y + alto - 30, 40, 28);
    g.fillEllipse(x + 30, y + alto - 18, 44, 18);

    // Cera de vela: gotas que cayeron sobre el borde superior izquierdo.
    g.fillStyle(COLOR.cera, 0.95);
    g.fillEllipse(x + 46, y + 3, 14, 6);
    g.fillEllipse(x + 52, y + 9, 6, 9);
    g.fillEllipse(x + 60, y + 2, 8, 5);
    g.fillEllipse(x + 40, y + 5, 5, 4);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(x + 44, y + 2, 5, 2);

    // Sangre: una huella de pulgar abajo a la derecha, apenas. El documento lo
    // sostiene alguien que viene de trabajar.
    g.fillStyle(COLOR.sangre, 0.22);
    g.fillEllipse(x + ancho - 46, y + alto - 40, 16, 20);
    g.fillStyle(COLOR.sangre, 0.14);
    g.fillEllipse(x + ancho - 52, y + alto - 30, 10, 12);
    g.fillEllipse(x + ancho - 38, y + alto - 52, 7, 8);
  }

  /**
   * El manual debajo de la escritura. "Los manuales tecnicos se volvieron
   * escritura sagrada": lo que la Diocesis reescribio sigue ahi, a traves del
   * pergamino. Casi no se ve, y eso es lo correcto: es para quien mira dos
   * veces, como en el resto del universo.
   */
  private dibujarPalimpsesto(x: number, y: number, ancho: number, alto: number): void {
    const alfa = 0.07;
    const g = this.add.graphics();
    g.lineStyle(1, COLOR.pergaminoSombra, alfa + 0.04);
    // Rejilla de formulario: casillas que la liturgia ya no usa.
    for (let fy = y + 60; fy < y + alto - 30; fy += 22) {
      g.lineBetween(x + ancho - 150, fy, x + ancho - 20, fy);
    }
    g.lineBetween(x + ancho - 150, y + 60, x + ancho - 150, y + alto - 30);
    g.lineBetween(x + ancho - 84, y + 60, x + ancho - 84, y + alto - 30);

    const estilo = {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: COLOR.palimpsesto,
    };
    this.add
      .text(x + ancho - 150, y + 40, 'GENESIS VESTAL  ·  PROTOCOLO  ·  ED. SOMATICA', estilo)
      .setAlpha(alfa + 0.05);
    this.add
      .text(x + ancho - 150, y + 50, 'SUJETO N.o ____   LOTE ____   REV. ____', estilo)
      .setAlpha(alfa + 0.03);
    this.add
      .text(x + 14, y + alto - 40, 'uso interno · no distribuir', estilo)
      .setAlpha(alfa + 0.03)
      .setAngle(90)
      .setOrigin(0, 1);
  }

  /** Filete doble de oro bajo la cabecera, con el remate en el centro. */
  private dibujarFileteDoble(x: number, y: number, ancho: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, COLOR.oro, 0.85);
    g.lineBetween(x, y, x + ancho, y);
    g.lineStyle(1, COLOR.oro, 0.45);
    g.lineBetween(x, y + 2, x + ancho, y + 2);

    // Remate: un rombo con dos puntos, que es lo que se puede hacer a 1 px.
    const cx = x + ancho / 2;
    g.fillStyle(COLOR.oro, 1);
    g.fillPoints(
      [
        new Phaser.Math.Vector2(cx, y - 3),
        new Phaser.Math.Vector2(cx + 3, y + 1),
        new Phaser.Math.Vector2(cx, y + 5),
        new Phaser.Math.Vector2(cx - 3, y + 1),
      ],
      true,
    );
    g.fillRect(cx - 8, y, 2, 2);
    g.fillRect(cx + 7, y, 2, 2);
  }

  // -- Indice ----------------------------------------------------------------

  private crearIndice(x: number, y: number): void {
    this.indiceTextos = [];

    this.rotuloIndice = this.add.text(x, y - 6, 'INDICE', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: COLOR.oroTexto,
    });

    CODICE.forEach((fragmento, i) => {
      const recogido = progreso.estaRecogido(fragmento.id);
      const texto = this.add.text(x, y + 8 + i * 14, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: recogido ? COLOR.tinta : COLOR.tenue,
      });

      // Raton: cada entrada recogida se puede elegir con clic (issue #29).
      if (recogido) {
        texto.setInteractive({ useHandCursor: true });
        texto.on('pointerdown', () => {
          const indice = this.ids.indexOf(fragmento.id);
          if (indice >= 0 && indice !== this.indice) {
            sonido.interfazMover();
            this.mostrar(indice);
          }
        });
      }
      this.indiceTextos.push(texto);
    });

    this.refrescarIndice();
  }

  private refrescarIndice(): void {
    CODICE.forEach((fragmento, i) => {
      const texto = this.indiceTextos[i];
      const recogido = progreso.estaRecogido(fragmento.id);
      const seleccionado = this.ids[this.indice] === fragmento.id;
      const numero = ROMANOS[i] ?? String(i + 1);

      if (!recogido) {
        // Hoja arrancada: se sabe que existe, no donde esta.
        texto.setText(`${numero.padStart(4)}  arrancada`);
        texto.setColor(COLOR.tenue);
        return;
      }

      const sinLeer = !progreso.estaLeido(fragmento.id);
      texto.setText(`${seleccionado ? '>' : ' '}${numero.padStart(3)}  ${fragmento.titulo}`);
      texto.setColor(seleccionado ? COLOR.rubrica : sinLeer ? COLOR.oroTexto : COLOR.tinta);
    });
  }

  // -- Lectura ---------------------------------------------------------------

  private mostrar(indice: number): void {
    this.limpiarLectura();

    if (this.ids.length === 0) {
      this.versiculoTexto.setText('Aun no has recogido ningun fragmento.');
      return;
    }

    this.indice = Phaser.Math.Clamp(indice, 0, this.ids.length - 1);
    const fragmento = fragmentoPorId(this.ids[this.indice]);
    if (!fragmento) return;

    progreso.marcarLeido(fragmento.id);

    const hoja = CODICE.findIndex((f) => f.id === fragmento.id);
    this.folioTexto.setText(`${fragmento.cita}   ·   fol. ${ROMANOS[hoja] ?? hoja + 1}`);
    this.tituloTexto.setText(fragmento.titulo.toUpperCase());

    // Inicial versal en rojo: la primera letra grande, aparte, y el versiculo
    // arranca con hueco para ella.
    const [primera, ...resto] = fragmento.versiculo;
    this.inicialTexto.setText(primera.charAt(0));
    const lineas = [`  ${primera.slice(1)}`, ...resto];
    this.versiculoTexto.setText(lineas.join('\n'));

    // Numeros de versiculo en rojo, a la izquierda, uno por versiculo (no por
    // linea: si un versiculo se parte al ancho, el numero va con la primera).
    const altoLinea = this.versiculoTexto.height / this.versiculoTexto.getWrappedText().length;
    let fila = 0;
    lineas.forEach((linea, i) => {
      const numero = this.add.text(
        this.lecturaX - 12,
        this.versiculoTexto.y + fila * altoLinea + 1,
        String(i + 1),
        { fontFamily: 'monospace', fontSize: '7px', color: COLOR.rubrica },
      );
      this.numerosTextos.push(numero);
      // Nacen aqui, asi que hay que meterlos en la pagina a mano: si no, se
      // quedan pintados encima del Registro al cambiar de seccion.
      this.paginas?.codice.add(numero);
      fila += this.versiculoTexto.getWrappedText(linea).length;
    });

    // El margen: mas abajo, a lapiz, con su corchete. Llega un instante
    // despues, para que primero se lea lo oficial y luego la duda.
    const margenY = this.versiculoTexto.y + this.versiculoTexto.height + 16;
    this.margenEtiqueta.setPosition(this.lecturaX + 10, margenY);
    this.margenTexto.setPosition(this.lecturaX + 10, margenY + 10);
    this.margenTexto.setText(fragmento.margen.join('\n'));

    this.margenCorchete.clear();
    this.margenCorchete.lineStyle(1, 0x3f3d47, 0.9);
    const corcheteAlto = this.margenTexto.height + 12;
    const cx = this.lecturaX + 3;
    this.margenCorchete.lineBetween(cx, margenY, cx - 1, margenY + corcheteAlto);
    this.margenCorchete.lineBetween(cx, margenY, cx + 4, margenY - 1);
    this.margenCorchete.lineBetween(
      cx - 1,
      margenY + corcheteAlto,
      cx + 4,
      margenY + corcheteAlto + 1,
    );

    for (const objeto of [this.margenTexto, this.margenEtiqueta, this.margenCorchete]) {
      objeto.setAlpha(0);
      this.tweens.add({ targets: objeto, alpha: 1, delay: 380, duration: 260 });
    }

    this.refrescarIndice();
  }

  private limpiarLectura(): void {
    this.tweens.killTweensOf([this.margenTexto, this.margenEtiqueta, this.margenCorchete]);
    for (const numero of this.numerosTextos) numero.destroy();
    this.numerosTextos = [];
    this.folioTexto.setText('');
    this.tituloTexto.setText('');
    this.inicialTexto.setText('');
    this.versiculoTexto.setText('');
    this.margenTexto.setText('');
    this.margenEtiqueta.setAlpha(0);
    this.margenCorchete.clear();
  }

  // -- Las cuatro secciones ---------------------------------------------------

  /**
   * Las pestanas del libro. Van abajo, junto a las teclas, y no arriba: el
   * folio ya tiene alli su cabecera y su filete de oro, y meter pestanas
   * encima lo convertiria en una ventana de programa.
   */
  private crearPestanas(x: number, y: number): void {
    let despl = 0;
    for (const clave of SECCIONES) {
      const t = this.add
        .text(x + despl, y, ROTULOS[clave], {
          fontFamily: 'monospace',
          fontSize: '7px',
          color: COLOR.tenue,
        })
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => this.irASeccion(clave));
      this.pestanas.push(t);
      despl += t.width + 12;
    }
  }

  private cambiarSeccion(delta: number): void {
    const i = SECCIONES.indexOf(this.seccion);
    const siguiente = SECCIONES[(i + delta + SECCIONES.length) % SECCIONES.length];
    if (siguiente === this.seccion) return;
    sonido.interfazMover();
    this.irASeccion(siguiente);
  }

  private irASeccion(clave: Seccion): void {
    this.seccion = clave;
    this.tituloLibro.setText(TITULOS[clave]);

    for (const s of SECCIONES) this.paginas[s].setVisible(s === clave);
    this.pestanas.forEach((t, i) => {
      t.setColor(SECCIONES[i] === clave ? COLOR.rubrica : COLOR.tenue);
    });

    if (clave === 'codice') this.mostrar(this.indice);
    else this.refrescarPagina();
  }

  /**
   * Redibuja la seccion abierta. Las tres nuevas comparten forma: una columna
   * de entradas a la izquierda y la ficha elegida a la derecha, igual que el
   * Codice, para que el libro se lea como un solo libro.
   */
  private refrescarPagina(): void {
    const pagina = this.paginas[this.seccion];
    const fila = this.fila[this.seccion];
    const datos = pagina.getData('entradas') as EntradaPagina[];
    const lista = pagina.getData('lista') as Phaser.GameObjects.Text[];
    const titulo = pagina.getData('titulo') as Phaser.GameObjects.Text;
    const cuerpo = pagina.getData('cuerpo') as Phaser.GameObjects.Text;
    const pie = pagina.getData('pie') as Phaser.GameObjects.Text;
    const lamina = pagina.getData('lamina') as Phaser.GameObjects.Image | undefined;

    datos.forEach((e, i) => {
      const abierta = e.abierta();
      lista[i].setText(`${i === fila ? '>' : ' '} ${abierta ? e.nombre : '- - - - -'}`);
      lista[i].setColor(i === fila ? COLOR.rubrica : abierta ? COLOR.tinta : COLOR.tenue);
    });

    const e = datos[fila];
    const abierta = e.abierta();
    titulo.setText(abierta ? e.nombre.toUpperCase() : 'SIN CATALOGAR');
    titulo.setColor(abierta ? COLOR.rubrica : COLOR.tenue);
    cuerpo.setText(abierta ? e.descripcion.join('\n') : 'Nadie ha traido noticia de esto todavia.');
    pie.setText(abierta ? e.pie : '');

    if (!lamina) return;
    if (abierta && e.textura && this.textures.exists(e.textura)) {
      // OJO con el fotograma: casi todas estas texturas las genera
      // ArteProvisional con generateTexture y su unico frame se llama
      // "__BASE". Pedirles el 0 devuelve un frame sin origen, y al pintarlo
      // Phaser revienta con `frame.source is null`. Eso mataba la escena del
      // libro a medias y dejaba el nivel pausado para siempre: el juego se
      // quedaba colgado al pulsar L. Solo se pide fotograma a quien lo tiene.
      if (e.fotograma === undefined) lamina.setTexture(e.textura);
      else lamina.setTexture(e.textura, e.fotograma);
      lamina.setVisible(true);
      // Encajada en su hueco sin deformarse: las laminas son de tamanos muy
      // distintos, desde un sello de 8 px hasta el jefe de 44.
      const escala = Math.min(46 / lamina.width, 46 / lamina.height, 2);
      lamina.setScale(Math.max(1, Math.floor(escala)));
    } else {
      lamina.setVisible(false);
    }
  }

  /** Armazon comun de las tres secciones nuevas. */
  private crearPaginaLista(
    folioX: number,
    folioY: number,
    folioAncho: number,
    folioAlto: number,
    entradas: EntradaPagina[],
    conLamina: boolean,
  ): Phaser.GameObjects.Container {
    const separadorX = folioX + 126;
    const lecturaX = separadorX + 22;
    const ancho = folioX + folioAncho - 16 - lecturaX;

    const filete = this.add.graphics();
    filete.lineStyle(1, COLOR.oro, 0.7);
    filete.lineBetween(separadorX, folioY + 26, separadorX, folioY + folioAlto - 36);

    const lista = entradas.map((_, i) =>
      this.add.text(folioX + 14, folioY + 34 + i * 12, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLOR.tenue,
      }),
    );

    const lamina = conLamina
      ? this.add.image(lecturaX + 24, folioY + 62, 'chispa-placeholder').setOrigin(0.5, 0.5)
      : undefined;

    const titulo = this.add.text(conLamina ? lecturaX + 58 : lecturaX, folioY + 34, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: COLOR.rubrica,
    });
    const pie = this.add.text(conLamina ? lecturaX + 58 : lecturaX, folioY + 48, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: COLOR.tenue,
    });
    const cuerpo = this.add.text(lecturaX, folioY + 92, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: COLOR.tinta,
      lineSpacing: 4,
      wordWrap: { width: ancho },
    });

    const hijos: Phaser.GameObjects.GameObject[] = [filete, ...lista, titulo, pie, cuerpo];
    if (lamina) hijos.push(lamina);

    const pagina = this.add.container(0, 0, hijos);
    pagina.setData('entradas', entradas);
    pagina.setData('lista', lista);
    pagina.setData('titulo', titulo);
    pagina.setData('cuerpo', cuerpo);
    pagina.setData('pie', pie);
    if (lamina) pagina.setData('lamina', lamina);
    return pagina;
  }

  /** Criaturas, oficios y aparato. La lamina es el sprite del propio juego. */
  private crearPaginaRegistro(
    fx: number,
    fy: number,
    fa: number,
    fh: number,
  ): Phaser.GameObjects.Container {
    let familia: Familia | null = null;
    const entradas: EntradaPagina[] = [];

    for (const ficha of REGISTRO) {
      if (ficha.familia !== familia) {
        familia = ficha.familia;
        entradas.push({
          nombre: FAMILIAS[familia],
          descripcion: [],
          pie: '',
          abierta: () => true,
          cabecera: true,
        });
      }
      entradas.push({
        nombre: ficha.nombre,
        descripcion: ficha.descripcion,
        pie: ficha.hallazgo,
        textura: ficha.textura,
        fotograma: ficha.fotograma,
        abierta: () => progreso.estaDescubierto(ficha.id),
      });
    }

    return this.crearPaginaLista(fx, fy, fa, fh, entradas, true);
  }

  /** Corte vertical de las seis capas. Las dos del fondo nunca se pisan. */
  private crearPaginaVientre(
    fx: number,
    fy: number,
    fa: number,
    fh: number,
  ): Phaser.GameObjects.Container {
    const entradas: EntradaPagina[] = VIENTRE.map((capa) => ({
      nombre: capa.nombre,
      descripcion: capa.descripcion,
      pie: capa.escena ? 'pisada' : 'no se llega en el teaser',
      abierta: () => (capa.escena ? progreso.estaPisada(capa.escena) : false),
    }));
    return this.crearPaginaLista(fx, fy, fa, fh, entradas, false);
  }

  /** Los rangos en orden de cuanto cuerpo les queda. Subir es dejar de serlo. */
  private crearPaginaJerarquia(
    fx: number,
    fy: number,
    fa: number,
    fh: number,
  ): Phaser.GameObjects.Container {
    const entradas: EntradaPagina[] = JERARQUIA.map((r) => ({
      nombre: r.nombre,
      descripcion: [...r.descripcion, '', `cuerpo propio: ${r.cuerpo}`],
      pie: '',
      abierta: () => (r.ficha ? progreso.estaDescubierto(r.ficha) : false),
    }));
    return this.crearPaginaLista(fx, fy, fa, fh, entradas, false);
  }

  private mover(delta: number): void {
    if (this.seccion !== 'codice') {
      const datos = this.paginas[this.seccion].getData('entradas') as EntradaPagina[];
      let i = this.fila[this.seccion];
      // Las cabeceras de familia del Registro no son entradas: se saltan.
      do {
        i = Phaser.Math.Clamp(i + delta, 0, datos.length - 1);
      } while (datos[i].cabecera && i > 0 && i < datos.length - 1);
      if (datos[i].cabecera) return;
      if (i === this.fila[this.seccion]) return;
      this.fila[this.seccion] = i;
      sonido.interfazMover();
      this.refrescarPagina();
      return;
    }

    if (this.ids.length === 0) return;
    sonido.interfazMover();
    this.mostrar(this.indice + delta);
  }

  private primerSinLeer(): number {
    const i = this.ids.findIndex((id) => !progreso.estaLeido(id));
    return i >= 0 ? i : Math.max(0, this.ids.length - 1);
  }

  private cerrar(): void {
    if (this.cerrando) return;
    this.cerrando = true;

    this.input.keyboard?.removeAllListeners();
    sonido.interfazCerrar();
    musica.atenuar(false);
    this.scene.resume(this.escenaJuego);
    this.scene.stop();
  }
}
