import Phaser from 'phaser';
import { RESOLUCION } from '../config/Sacramento';
import { tactil } from '../input/Tactil';
import { toques } from '../input/Toques';
import { guionDelSacramento, type ClavePlano, type Plano } from '../lore/Cinematicas';
import { recordar, recuerda } from '../systems/Memoria';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';

/** Datos con los que se lanza: a quien hay que devolver el control al acabar. */
interface DatosCinematica {
  escenaJuego: string;
}

const { ancho: ANCHO, alto: ALTO } = RESOLUCION;

/**
 * Las bandas negras del formato panoramico (2,39:1 sobre 480 de ancho). Lo
 * que queda entre ellas, de ARRIBA a ABAJO, es la pantalla de cine.
 */
const BANDA = 60;
const ARRIBA = BANDA;
const ABAJO = ALTO - BANDA;
const CENTRO_X = ANCHO / 2;

/** Cuanto hay que mantener pulsado para saltarla. */
const SALTAR_MS = 1000;
/** La primera vez, el aviso de saltar espera: que no sea lo primero que se lee. */
const AVISO_SALTAR_MS = 4000;

const COLOR = {
  fondo: 0x0f0c0f,
  muro: 0x0b090b,
  suelo: 0x1c1618,
  sueloLinea: 0x2e2428,
  pedestal: 0x2a2226,
  pedestalLinea: 0x3a2e32,
  oro: 0xd8b45a,
  luzQuirofano: 0xcfe9e2,
  silueta: 0x161018,
  subtitulo: '#d6cfc4',
  tenue: '#6b5f55',
  aro: 0xc9b48a,
} as const;

/** Suelo de los planos generales de la Sala: los pies de todos caen aqui. */
const SUELO = 240;

interface OpcionesSala {
  nina: boolean;
  camilla: 'camilla-placeholder' | 'cine-camilla-vacia';
  desague: 'cerrado' | 'abierto';
}

interface Sala {
  nina?: Phaser.GameObjects.Image;
  rejilla?: Phaser.GameObjects.Image;
}

/**
 * La cinematica del sacramento (issue #147): la primera vez que se ve a la nina.
 *
 * No es gameplay. No hay HUD, ni botonera, ni nada que hacer salvo mirar: el
 * juego deja de ser juego un minuto y lo cuenta con planos. Las bandas negras
 * entran deslizandose y son la senal de que ahora no se juega.
 *
 * El guion (orden, duraciones, subtitulos, Latido) vive en `Cinematicas.ts`.
 * Aqui esta lo que hay DENTRO de cada plano: una funcion por plano que monta su
 * encuadre en una capa. Al cambiar de plano la capa se vacia entera: son
 * CORTES, no transiciones, y nada de un plano sobrevive al siguiente.
 *
 * Por que cortes y no zoom: el arte se ve a escala entera (Nitidez), y un zoom
 * fraccionario sobre pixel art hace que el dibujo tiemble. Un plano general es
 * el arte a x2, un primer plano es otro dibujo a x5. Asi se acerca el cine
 * cuando la imagen es de pixel.
 *
 * Se salta MANTENIENDO pulsado (ESC, el raton o el dedo) un segundo: un toque
 * suelto no puede cortar por accidente la escena mas importante del juego.
 */
export class CinematicaScene extends Phaser.Scene {
  private escenaJuego = 'Final';
  private planos: readonly Plano[] = [];
  private indice = -1;
  private terminando = false;

  /** Todo lo que se ve del plano actual. Se vacia en cada corte. */
  private capa!: Phaser.GameObjects.Container;
  private subtitulo!: Phaser.GameObjects.Text;
  /** Temporizadores y tweens del plano: mueren con el corte. */
  private pendientes: Phaser.Time.TimerEvent[] = [];
  private animaciones: Phaser.Tweens.Tween[] = [];

  /** El Latido no se corta con el plano: solo cambia de ritmo. */
  private ritmo: { desde: number; hasta: number; inicio: number; ms: number } | null = null;

  // Saltar.
  private teclaSaltar?: Phaser.Input.Keyboard.Key;
  private sostenido = 0;
  /** Un dedo que ya estaba puesto al empezar no cuenta hasta que se levanta. */
  private dedoLibre = false;
  private aviso!: Phaser.GameObjects.Text;
  private aro!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'Cinematica' });
  }

  create(datos: DatosCinematica): void {
    this.escenaJuego = datos.escenaJuego;
    this.planos = guionDelSacramento();
    this.indice = -1;
    this.terminando = false;
    this.pendientes = [];
    this.animaciones = [];
    this.ritmo = null;
    this.sostenido = 0;
    this.dedoLibre = false;

    this.cameras.main.setBackgroundColor('#000000');
    // La musica se va: aqui manda el Latido. El cierre la pone al volver.
    musica.parar();

    this.capa = this.add.container(0, 0);
    this.crearBandas();
    this.crearSaltar();

    this.subtitulo = this.add
      .text(CENTRO_X, ABAJO + BANDA / 2, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: COLOR.subtitulo,
        align: 'center',
        wordWrap: { width: ANCHO - 60 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(101)
      .setAlpha(0);

    this.latir();
    this.siguiente();
  }

  update(_tiempo: number, delta: number): void {
    if (this.terminando) return;

    const dedos = toques.activos.length;
    if (dedos === 0) this.dedoLibre = true;
    const sosteniendo = (this.teclaSaltar?.isDown ?? false) || (this.dedoLibre && dedos > 0);

    if (sosteniendo) {
      this.sostenido += delta;
      this.mostrarAviso();
    } else {
      // Soltar a medias lo vacia deprisa, pero no de golpe.
      this.sostenido = Math.max(0, this.sostenido - delta * 2);
    }
    this.pintarAro(this.sostenido / SALTAR_MS);
    if (this.sostenido >= SALTAR_MS) this.terminar(true);
  }

  // -- Marco: bandas, subtitulos y saltar ----------------------------------------

  private crearBandas(): void {
    const arriba = this.add.rectangle(0, -BANDA, ANCHO, BANDA, 0x000000).setOrigin(0, 0);
    const abajo = this.add.rectangle(0, ALTO, ANCHO, BANDA, 0x000000).setOrigin(0, 0);
    arriba.setDepth(100);
    abajo.setDepth(100);
    // Entran deslizandose: la pantalla se estrecha y empieza otra cosa.
    this.tweens.add({ targets: arriba, y: 0, duration: 900, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: abajo, y: ABAJO, duration: 900, ease: 'Cubic.easeOut' });
  }

  private crearSaltar(): void {
    this.teclaSaltar = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const texto = tactil.esAparatoTactil ? 'mantén pulsado para saltar' : 'mantén ESC para saltar';
    this.aviso = this.add
      .text(ANCHO - 34, BANDA / 2, texto, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: COLOR.tenue,
      })
      .setOrigin(1, 0.5)
      .setDepth(102)
      .setAlpha(0);
    this.aro = this.add.graphics().setDepth(102).setAlpha(0);

    // Quien ya la ha visto sabe que existe y la puede saltar desde el primer
    // segundo. La primera vez, el aviso espera a que la escena haya empezado.
    if (recuerda('hitos', 'nina')) this.mostrarAviso();
    else this.time.delayedCall(AVISO_SALTAR_MS, () => this.mostrarAviso());
  }

  private mostrarAviso(): void {
    if (this.aviso.alpha > 0 || this.terminando) return;
    this.tweens.add({ targets: [this.aviso, this.aro], alpha: 1, duration: 400 });
  }

  private pintarAro(progreso: number): void {
    const x = ANCHO - 22;
    const y = BANDA / 2;
    this.aro.clear();
    this.aro.lineStyle(1, COLOR.aro, 0.3);
    this.aro.strokeCircle(x, y, 6);
    if (progreso <= 0) return;
    this.aro.lineStyle(2, COLOR.aro, 1);
    this.aro.beginPath();
    this.aro.arc(x, y, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progreso));
    this.aro.strokePath();
  }

  /** El pensamiento del Cirujano, abajo, con fundido. Sin retrato: la cara esta en el plano. */
  private decir(texto: string, duracion: number): void {
    this.subtitulo.setText(texto);
    this.animar({ targets: this.subtitulo, alpha: 1, duration: 350 });
    this.despues(Math.max(400, duracion - 400), () => {
      this.animar({ targets: this.subtitulo, alpha: 0, duration: 300 });
    });
  }

  // -- El Latido -----------------------------------------------------------------

  /**
   * Un solo bucle para toda la cinematica. Cada plano cambia el ritmo, pero el
   * pulso no vuelve a empezar en cada corte: un corazon no se reinicia porque
   * cambie el encuadre.
   */
  private latir(): void {
    if (this.terminando) return;
    const ritmo = this.ritmo;
    if (!ritmo) {
      this.time.delayedCall(200, () => this.latir());
      return;
    }
    const avance = Phaser.Math.Clamp((this.time.now - ritmo.inicio) / ritmo.ms, 0, 1);
    const pulsos = ritmo.desde + (ritmo.hasta - ritmo.desde) * avance;
    // Cuando se acelera, tambien golpea mas fuerte.
    const fuerza = ritmo.hasta > ritmo.desde ? 0.75 + 0.35 * avance : 0.75;
    sonido.latido(fuerza);
    this.time.delayedCall(60000 / pulsos, () => this.latir());
  }

  // -- Planos --------------------------------------------------------------------

  private siguiente(): void {
    if (this.terminando) return;
    this.limpiarPlano();
    this.indice += 1;
    const plano = this.planos[this.indice];
    if (!plano) {
      this.terminar(false);
      return;
    }

    const latido = plano.latido;
    this.ritmo =
      latido === undefined
        ? null
        : {
            desde: typeof latido === 'number' ? latido : latido[0],
            hasta: typeof latido === 'number' ? latido : latido[1],
            inicio: this.time.now,
            ms: plano.ms,
          };

    this.montar(plano.plano, plano.ms);

    if (plano.subtitulo) {
      const entra = plano.subtituloEn ?? 600;
      const texto = plano.subtitulo;
      this.despues(entra, () => this.decir(texto, plano.ms - entra));
    }
    this.despues(plano.ms, () => this.siguiente());
  }

  private montar(clave: ClavePlano, ms: number): void {
    switch (clave) {
      case 'negro':
        this.despues(1300, () => sonido.gota());
        break;
      case 'sala':
        this.planoSala();
        break;
      case 'camilla':
        this.planoCamilla();
        break;
      case 'ojos':
        this.planoOjos();
        break;
      case 'tejido':
        this.planoTejido();
        break;
      case 'mascara':
        this.planoMascara();
        break;
      case 'mirada':
        this.planoMirada();
        break;
      case 'contraluz':
        this.planoContraluz();
        break;
      case 'caida':
        this.despues(700, () => sonido.bisturiCae());
        break;
      case 'bisturi':
        this.planoBisturi();
        break;
      case 'huida':
        this.planoHuida();
        break;
      case 'vacia':
        this.planoVacia(ms);
        break;
    }
  }

  /** 2. Plano general: la Sala despues del combate. Entra el Cirujano. */
  private planoSala(): void {
    this.cameras.main.fadeIn(1100, 0, 0, 0);
    this.montarSala({ nina: true, camilla: 'camilla-placeholder', desague: 'cerrado' });
    // Entra de espaldas a nosotros y pequeno: la Sala es mas grande que el.
    const cirujano = this.imagen(-30, SUELO, 'cirujano-placeholder', 2);
    this.caminar(cirujano, 214, 3800, [
      'cirujano-paso-a-placeholder',
      'cirujano-placeholder',
      'cirujano-paso-b-placeholder',
    ]);
  }

  /** 3. Plano medio: ella en la camilla, como en el arte conceptual. */
  private planoCamilla(): void {
    this.fondoInterior(4, 0.55);
    this.luzCenital(CENTRO_X, 3, 0.22);
    this.anillo(CENTRO_X, 154, 34);
    // Los cables del quirofano, que bajan hasta la camilla.
    const cables = this.add.graphics();
    cables.lineStyle(2, 0x2a2428, 1);
    for (const [x0, x1] of [
      [150, 214],
      [196, 222],
      [300, 264],
      [336, 258],
    ] as const) {
      cables.lineBetween(x0, ARRIBA, x1, 200);
    }
    this.capa.add(cables);
    this.imagen(CENTRO_X, 252, 'camilla-placeholder', 4);
    const nina = this.imagen(CENTRO_X, 216, 'cine-nina-sentada', 4);
    // Respira: un pixel del dibujo, a saltos. Es lo unico que se mueve.
    this.respirar(nina, 4, 1500);
    this.polvo();
  }

  /** 4. Primer plano: abre los ojos. */
  private planoOjos(): void {
    this.fondoCara();
    const cara = this.imagen(CENTRO_X, ABAJO, 'cine-nina-cara', 5);
    this.despues(1900, () => cara.setTexture('cine-nina-cara-abiertos'));
    // Un parpadeo despues: esta despierta de verdad, no es un reflejo.
    this.despues(3900, () => cara.setTexture('cine-nina-cara'));
    this.despues(4030, () => cara.setTexture('cine-nina-cara-abiertos'));
  }

  /** 5. Detalle: el bisturi baja y el tejido va hacia el filo. */
  private planoTejido(): void {
    this.rectangulo(0, ARRIBA, ANCHO, ABAJO - ARRIBA, 0x120e10);
    // La chapa de la camilla bajo el brazo.
    this.rectangulo(0, 238, ANCHO, ABAJO - 238, 0x5c6b70);
    this.rectangulo(0, 238, ANCHO, 4, 0xc2d1d4);
    const brazo = this.imagen(120, 154, 'cine-brazo', 4, 0, 0);
    const mano = this.imagen(330, -60, 'cine-mano', 4, 0, 0);
    this.animar({ targets: mano, x: 222, y: 46, duration: 1400, ease: 'Cubic.easeOut' });
    this.despues(1600, () => brazo.setTexture('cine-brazo-tejido1'));
    this.despues(2500, () => {
      brazo.setTexture('cine-brazo-tejido2');
      sonido.tejidoCrece();
    });
    this.despues(3500, () => {
      brazo.setTexture('cine-brazo-tejido3');
      sonido.tejidoCrece();
    });
    // La mano no se aparta. El tejido tampoco.
    this.despues(4300, () => this.animar({ targets: mano, y: 50, duration: 900 }));
  }

  /** 6. Contraplano: la mascara. Silencio. */
  private planoMascara(): void {
    this.rectangulo(0, ARRIBA, ANCHO, ABAJO - ARRIBA, 0x0c0a0c);
    this.resplandor(110, 160, COLOR.oro, 2.5, 0.16);
    const mascara = this.imagen(440, ABAJO, 'cine-mascara', 5, 1, 1);
    this.despues(1300, () => mascara.setTexture('cine-mascara-brillo'));
    this.despues(1560, () => mascara.setTexture('cine-mascara'));
  }

  /** 7. Primer plano: ella levanta la vista hacia el. */
  private planoMirada(): void {
    this.fondoCara();
    this.imagen(CENTRO_X, ABAJO + 10, 'cine-nina-cara-arriba', 5);
  }

  /** 8. General a contraluz: el bisturi en alto contra la lampara. */
  private planoContraluz(): void {
    this.fondoInterior(3, 0.3);
    this.resplandor(262, 100, COLOR.luzQuirofano, 3.4, 0.55);
    this.imagen(262, ARRIBA, 'luz-hospital-placeholder', 3, 0.5, 0).setTint(0x302830);
    this.imagen(330, 250, 'camilla-placeholder', 3).setTint(0x3a3036);
    this.imagen(330, 216, 'cine-nina-sentada-despierta', 3, 0.5, 51 / 60).setTint(0x8a7a76);
    const cirujano = this.imagen(196, 250, 'cirujano-placeholder', 3).setTint(COLOR.silueta);
    this.rectangulo(0, 250, ANCHO, ABAJO - 250, 0x0e0b0d);
    // El brillo de la hoja: lo unico que no es silueta.
    const filo = this.resplandor(222, 135, COLOR.oro, 0.22, 0);
    this.despues(1100, () => {
      cirujano.setTexture('cirujano-alza-placeholder');
      this.animar({ targets: filo, alpha: 0.95, duration: 500, ease: 'Quad.easeOut' });
      this.animar({
        targets: filo,
        scale: 0.3,
        duration: 700,
        yoyo: true,
        repeat: -1,
        delay: 500,
      });
    });
    this.polvo();
  }

  /** 10. Detalle: el bisturi en el suelo. El oro se apaga. */
  private planoBisturi(): void {
    this.rectangulo(0, ARRIBA, ANCHO, ABAJO - ARRIBA, 0x0c0a0c);
    this.rectangulo(0, 190, ANCHO, ABAJO - 190, 0x221b1e);
    const juntas = this.add.graphics();
    juntas.lineStyle(2, 0x16121a, 1);
    juntas.lineBetween(0, 226, ANCHO, 226);
    for (const x of [60, 170, 300, 410]) juntas.lineBetween(x, 190, x, 226);
    for (const x of [110, 240, 360]) juntas.lineBetween(x, 226, x, ABAJO);
    this.capa.add(juntas);
    const bisturi = this.imagen(CENTRO_X, 206, 'cine-bisturi', 4);
    const brillo = this.resplandor(198, 200, COLOR.oro, 0.5, 0.8);
    this.animar({ targets: brillo, alpha: 0, duration: 2800, ease: 'Quad.easeIn' });
    const apagado = Phaser.Display.Color.ValueToColor(0x8a6a4a);
    const vivo = Phaser.Display.Color.ValueToColor(0xffffff);
    this.animar({
      targets: { t: 0 },
      t: 100,
      duration: 2800,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(
          vivo,
          apagado,
          100,
          tween.getValue() ?? 0,
        );
        bisturi.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      },
    });
  }

  /** 11. General: le tiende la mano, ella baja, y se van por el desague. */
  private planoHuida(): void {
    const sala = this.montarSala({
      nina: true,
      camilla: 'camilla-placeholder',
      desague: 'cerrado',
    });
    const nina = sala.nina as Phaser.GameObjects.Image;
    // Sin el bisturi: se le ha caido en el plano anterior.
    const cirujano = this.imagen(254, SUELO, 'cirujano-sin-bisturi-placeholder', 2);
    this.capa.moveBelow(cirujano, this.capa.getByName('suelo') as Phaser.GameObjects.GameObject);
    this.capa.moveBelow(nina, cirujano);

    this.despues(900, () => nina.setTexture('cine-nina-sentada-despierta'));
    // Baja de la camilla, junto a el.
    this.despues(1800, () => {
      nina.setTexture('cine-nina-pie').setOrigin(0.5, 1).setPosition(300, 196);
      this.animar({ targets: nina, x: 284, duration: 380 });
      this.animar({ targets: nina, y: SUELO, duration: 380, ease: 'Quad.easeIn' });
    });
    // Van juntos hacia la rejilla. El delante, ella pegada.
    const pasosNina = ['cine-nina-pie-paso-a', 'cine-nina-pie', 'cine-nina-pie-paso-b'];
    const pasosCirujano = [
      'cirujano-sin-bisturi-paso-a-placeholder',
      'cirujano-sin-bisturi-placeholder',
      'cirujano-sin-bisturi-paso-b-placeholder',
    ];
    this.despues(2700, () => {
      this.caminar(cirujano, 470, 3400, pasosCirujano);
      this.caminar(nina, 414, 3400, pasosNina);
    });
    // La rejilla se aparta y sube la lluvia de dentro.
    this.despues(6400, () => {
      sonido.rejaAbre();
      if (sala.rejilla) {
        this.animar({ targets: sala.rejilla, x: sala.rejilla.x + 60, alpha: 0, duration: 500 });
      }
    });
    this.despues(6900, () => sonido.lluviaEncendida());
    // Primero baja ella. Despues el.
    this.despues(7300, () => {
      this.animar({ targets: nina, x: 440, duration: 300 });
      this.animar({ targets: nina, y: SUELO + 50, duration: 900, delay: 250, ease: 'Quad.easeIn' });
    });
    this.despues(8600, () => {
      cirujano.setFlipX(true);
      this.animar({ targets: cirujano, x: 440, duration: 300 });
      this.animar({
        targets: cirujano,
        y: SUELO + 84,
        duration: 1100,
        delay: 250,
        ease: 'Quad.easeIn',
      });
    });
  }

  /** 12. General: la Sala vacia. El Latido se dispara. */
  private planoVacia(ms: number): void {
    this.montarSala({ nina: false, camilla: 'cine-camilla-vacia', desague: 'abierto' });
    this.despues(ms - 1700, () => this.cameras.main.fadeOut(1500, 0, 0, 0));
  }

  // -- Piezas de los planos ------------------------------------------------------

  /** La Sala N.º 7 en plano general, a x2: arcos, lampara, pedestal y camilla. */
  private montarSala(opciones: OpcionesSala): Sala {
    this.fondoInterior(2, 0.9);
    const lampara = this.imagen(300, ARRIBA - 4, 'luz-hospital-placeholder', 2, 0.5, 0);
    // La lampara se mece un poco: en esta Sala se acaba de pelear.
    this.animar({
      targets: lampara,
      angle: { from: -2, to: 2 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.resplandor(300, ARRIBA + 22, COLOR.luzQuirofano, 1.6, 0.32);

    this.rectangulo(255, 216, 90, SUELO - 216, COLOR.pedestal);
    this.rectangulo(255, 216, 90, 2, COLOR.pedestalLinea);
    this.imagen(300, 216, opciones.camilla, 2);

    const sala: Sala = {};
    if (opciones.nina) sala.nina = this.imagen(300, 160, 'cine-nina-sentada', 2, 0.5, 0);

    const suelo = this.rectangulo(0, SUELO, ANCHO, ABAJO - SUELO, COLOR.suelo);
    suelo.setName('suelo');
    this.rectangulo(0, SUELO, ANCHO, 2, COLOR.sueloLinea);

    // El desague de servicio, detras de la Sala, a ras de suelo.
    this.imagen(440, SUELO, 'cine-hueco', 2, 0.5, 0);
    if (opciones.desague === 'cerrado')
      sala.rejilla = this.imagen(440, SUELO, 'cine-rejilla', 2, 0.5, 0);

    this.polvo();
    return sala;
  }

  private fondoInterior(escala: number, alfa: number): void {
    this.rectangulo(0, ARRIBA, ANCHO, ABAJO - ARRIBA, COLOR.fondo);
    const arcos = this.add
      .tileSprite(0, ARRIBA, ANCHO, ABAJO - ARRIBA, 'fondo-arcos')
      .setOrigin(0, 0)
      .setTileScale(escala)
      .setAlpha(alfa);
    this.capa.add(arcos);
  }

  /** Detras de su cara: oscuro, con el anillo de luz del arte conceptual. */
  private fondoCara(): void {
    this.rectangulo(0, ARRIBA, ANCHO, ABAJO - ARRIBA, 0x0d0a0c);
    this.resplandor(CENTRO_X, 150, COLOR.oro, 3, 0.26);
    this.anillo(CENTRO_X, 150, 112);
  }

  /**
   * El anillo de luz que tiene detras en el arte conceptual. Rayos cortos y
   * desfasados de los ejes: un sol, nunca una cruz.
   */
  private anillo(x: number, y: number, radio: number): void {
    this.resplandor(x, y, COLOR.oro, radio / 40, 0.22);
    const anillo = this.add.graphics({ x, y });
    anillo.lineStyle(1, COLOR.oro, 0.75);
    anillo.strokeCircle(0, 0, radio);
    anillo.lineStyle(1, COLOR.oro, 0.35);
    anillo.strokeCircle(0, 0, radio - 4);
    anillo.lineStyle(1, COLOR.oro, 0.55);
    for (let i = 0; i < 12; i += 1) {
      const a = ((i * 30 + 15) * Math.PI) / 180;
      anillo.lineBetween(
        Math.cos(a) * (radio + 3),
        Math.sin(a) * (radio + 3),
        Math.cos(a) * (radio + 7),
        Math.sin(a) * (radio + 7),
      );
    }
    this.capa.add(anillo);
    this.animar({
      targets: anillo,
      alpha: { from: 1, to: 0.6 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private luzCenital(x: number, escala: number, alfa: number): void {
    this.resplandor(x, ARRIBA, COLOR.luzQuirofano, escala, alfa);
  }

  /** Polvo cayendo despacio en la luz: la Sala sigue asentandose. */
  private polvo(): void {
    const polvo = this.add.particles(0, ARRIBA, 'chispa-placeholder', {
      x: { min: 0, max: ANCHO },
      speedY: { min: 3, max: 10 },
      speedX: { min: -2, max: 2 },
      lifespan: 9000,
      alpha: { start: 0.45, end: 0 },
      scale: 0.5,
      frequency: 220,
      tint: 0xc9b48a,
    });
    // Que no empiece vacio: un plano nuevo no puede verse "recien encendido".
    polvo.fastForward(6000);
    this.capa.add(polvo);
  }

  private imagen(
    x: number,
    y: number,
    clave: string,
    escala: number,
    origenX = 0.5,
    origenY = 1,
  ): Phaser.GameObjects.Image {
    const imagen = this.add
      .image(Math.round(x), Math.round(y), clave)
      .setOrigin(origenX, origenY)
      .setScale(escala);
    this.capa.add(imagen);
    return imagen;
  }

  private rectangulo(
    x: number,
    y: number,
    ancho: number,
    alto: number,
    color: number,
  ): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, ancho, alto, color).setOrigin(0, 0);
    this.capa.add(rect);
    return rect;
  }

  private resplandor(
    x: number,
    y: number,
    color: number,
    escala: number,
    alfa: number,
  ): Phaser.GameObjects.Image {
    const luz = this.add
      .image(x, y, 'brillo-placeholder')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(color)
      .setScale(escala)
      .setAlpha(alfa);
    this.capa.add(luz);
    return luz;
  }

  /** Sube y baja un pixel del dibujo, a saltos: medio pixel lo emborronaria. */
  private respirar(imagen: Phaser.GameObjects.Image, escala: number, cada: number): void {
    const base = imagen.y;
    let arriba = false;
    const evento = this.time.addEvent({
      delay: cada,
      loop: true,
      callback: () => {
        arriba = !arriba;
        imagen.y = base - (arriba ? escala : 0);
      },
    });
    this.pendientes.push(evento);
  }

  /** Lleva a alguien andando hasta `destinoX`, pasando sus cuadros de paso. */
  private caminar(
    imagen: Phaser.GameObjects.Image,
    destinoX: number,
    duracion: number,
    pasos: readonly string[],
  ): void {
    imagen.setFlipX(destinoX < imagen.x);
    let paso = 0;
    const evento = this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        paso = (paso + 1) % pasos.length;
        imagen.setTexture(pasos[paso]);
      },
    });
    this.pendientes.push(evento);
    this.animar({
      targets: imagen,
      x: destinoX,
      duration: duracion,
      onComplete: () => {
        evento.remove(false);
        imagen.setTexture(pasos[1]);
      },
    });
  }

  // -- Ciclo de vida -------------------------------------------------------------

  private despues(ms: number, accion: () => void): void {
    this.pendientes.push(this.time.delayedCall(ms, accion));
  }

  private animar(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween {
    const tween = this.tweens.add(config);
    this.animaciones.push(tween);
    return tween;
  }

  /** El corte: todo lo del plano anterior desaparece, sin rastro. */
  private limpiarPlano(): void {
    for (const evento of this.pendientes) evento.remove(false);
    this.pendientes = [];
    for (const tween of this.animaciones) tween.remove();
    this.animaciones = [];
    this.capa.removeAll(true);
    this.subtitulo.setAlpha(0);
  }

  /** Acaba (o se salta): devuelve el control al cierre, que pone el titulo. */
  private terminar(saltada: boolean): void {
    if (this.terminando) return;
    this.terminando = true;
    recordar('hitos', 'nina');
    this.ritmo = null;
    sonido.lluviaApagada();

    const volver = () => {
      this.limpiarPlano();
      this.scene.resume(this.escenaJuego);
      this.scene.stop();
    };
    if (!saltada) {
      volver();
      return;
    }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, volver);
  }
}
