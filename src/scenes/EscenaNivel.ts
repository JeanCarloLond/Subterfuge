import Phaser from 'phaser';
import { CirujanoSacerdote } from '../entities/CirujanoSacerdote';
import { Devoto } from '../entities/Devoto';
import { enemigoDe } from '../entities/Enemigo';
import { Reformado } from '../entities/Reformado';
import { Sello } from '../entities/Sello';
import { Vestal } from '../entities/Vestal';
import { Controles } from '../input/Controles';
import { Altar } from '../objetos/Altar';
import { FragmentoCodice } from '../objetos/FragmentoCodice';
import { DEVOTO, REFORMADO, RESOLUCION } from '../config/Sacramento';
import { Impacto } from '../systems/Impacto';
import { EVENTOS_HUD } from '../ui/HudScene';

/** Plataforma: [x, y, anchoEnTiles]. y crece hacia abajo. */
export type Plataforma = readonly [x: number, y: number, anchoTiles: number];

/** Columna de pared para el agarre de bordes: [x, yInicio, yFin]. */
export type Pared = readonly [x: number, yInicio: number, yFin: number];

export interface RondaDevoto {
  x: number;
  y: number;
  izquierda: number;
  derecha: number;
}

/** Umbral de paso a la siguiente zona del descenso. */
export interface Umbral {
  x: number;
  y: number;
  /** Clave de la escena destino. */
  destino: string;
  etiqueta: string;
}

/** Todo lo que distingue a un nivel de otro. La logica es comun. */
export interface DefinicionNivel {
  mundo: { ancho: number; alto: number };
  colorFondo: string;
  inicio: { x: number; y: number };
  plataformas: readonly Plataforma[];
  paredes: readonly Pared[];
  devotos: readonly RondaDevoto[];
  /** Vestales: opcional, no toda zona tiene clero. */
  vestales?: readonly RondaDevoto[];
  /**
   * Jefe de la zona. Duerme hasta que el Cirujano se acerca, y mientras siga
   * vivo el umbral de salida permanece cerrado.
   */
  jefe?: RondaDevoto;
  altares: ReadonlyArray<{ x: number; y: number }>;
  fragmentos: ReadonlyArray<readonly [number, number, string]>;
  umbral?: Umbral;
  /**
   * y por debajo de la cual se considera que el Cirujano cayo al vacio.
   * Sin esto, caerse fuera de las plataformas deja al jugador atrapado contra
   * el limite inferior del mundo, sin forma de volver a subir.
   */
  limiteCaida?: number;
  /** Ayuda de controles. Solo el primer nivel la necesita. */
  mostrarAyuda?: boolean;
}

/** Lado del tile. */
const T = 16;

/** Radio en el que un Altar ofrece la interaccion de rezar (px). */
const RADIO_ALTAR = 26;

/** Radio en el que un Umbral ofrece el descenso (px). */
const RADIO_UMBRAL = 24;

/** Retardo entre morir y reaparecer en el ultimo Altar (ms). */
const RETARDO_REAPARICION = 1100;

/**
 * Logica comun a todos los niveles del descenso.
 *
 * Cada zona del Vientre (Atrio, Pasillos de Preparacion, Salas de Sacramento...)
 * hereda de aqui y solo aporta su `definirNivel()`. Asi anadir una zona nueva es
 * describir su contenido, no reimplementar el combate.
 *
 * Mientras no haya tilesets, la geometria se describe con plataformas y paredes.
 * Cuando lleguen, `construirGeometria()` es el unico punto a sustituir por la
 * carga de un tilemap de Tiled.
 */
export abstract class EscenaNivel extends Phaser.Scene {
  protected cirujano!: CirujanoSacerdote;
  protected controles!: Controles;
  protected impacto!: Impacto;
  protected suelos!: Phaser.Physics.Arcade.StaticGroup;

  private definicion!: DefinicionNivel;
  private devotos: Devoto[] = [];
  private vestales: Vestal[] = [];
  private sellos: Sello[] = [];
  private jefe?: Reformado;
  private jefeDerrotado = false;
  private altares: Altar[] = [];
  private fragmentos: FragmentoCodice[] = [];
  private grupoEnemigos?: Phaser.Physics.Arcade.Group;

  private altarActivo: Altar | null = null;
  private fragmentosRecogidos = 0;
  private reapareciendo = false;
  private descendiendo = false;

  private umbralSprite?: Phaser.GameObjects.Sprite;
  private umbralAviso?: Phaser.GameObjects.Text;
  private fondoLejano?: Phaser.GameObjects.TileSprite;
  private fondoCercano?: Phaser.GameObjects.TileSprite;

  /** Cada zona describe aqui su contenido. */
  protected abstract definirNivel(): DefinicionNivel;

  create(datos?: { fragmentos?: number }): void {
    this.reiniciarEstado();
    this.fragmentosRecogidos = datos?.fragmentos ?? 0;

    this.definicion = this.definirNivel();
    const { mundo, colorFondo, inicio } = this.definicion;

    this.physics.world.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBounds(0, 0, mundo.ancho, mundo.alto);
    this.cameras.main.setBackgroundColor(colorFondo);

    this.crearFondo();
    this.suelos = this.construirGeometria();
    this.controles = new Controles(this);
    this.impacto = new Impacto(this);

    this.crearCirujano(inicio.x, inicio.y);
    this.poblarNivel();

    this.cameras.main.startFollow(this.cirujano.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
    this.cameras.main.fadeIn(360, 11, 9, 11);

    if (!this.scene.isActive('Hud')) this.scene.launch('Hud');
    this.emitirEstadoInicial();

    if (this.definicion.mostrarAyuda) this.crearAyudaControles();
  }

  update(): void {
    this.cirujano.actualizar();

    for (const devoto of this.devotos) {
      devoto.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    for (const vestal of this.vestales) {
      vestal.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
    }

    this.actualizarJefe();

    this.actualizarParallax();
    this.actualizarAltares();
    this.actualizarUmbral();
    this.comprobarCaidaAlVacio();
    this.limpiarDevotosMuertos();
  }

  /**
   * Red de seguridad: caer fuera de las plataformas devuelve al ultimo Altar
   * en vez de dejar al jugador tirado contra el borde del mundo.
   *
   * Cuesta un punto de vitalidad para que la caida tenga consecuencia, pero no
   * es una muerte: quedarse encallado nunca debe ser la respuesta del juego.
   */
  private comprobarCaidaAlVacio(): void {
    const limite = this.definicion.limiteCaida;
    if (limite === undefined || this.reapareciendo) return;
    if (this.cirujano.estaMuerto || this.cirujano.sprite.y < limite) return;

    const destino = this.altarActivo?.puntoReaparicion ?? this.definicion.inicio;

    this.cirujano.recibirCaida(1, destino.x, destino.y);
    this.cameras.main.flash(200, 11, 9, 11);
    this.game.events.emit(EVENTOS_HUD.aviso, 'el Vientre te devuelve');
  }

  private reiniciarEstado(): void {
    this.devotos = [];
    this.vestales = [];
    this.sellos = [];
    this.jefe = undefined;
    this.jefeDerrotado = false;
    this.altares = [];
    this.fragmentos = [];
    this.grupoEnemigos = undefined;
    this.altarActivo = null;
    this.reapareciendo = false;
    this.descendiendo = false;
    this.umbralSprite = undefined;
    this.umbralAviso = undefined;
    this.fondoLejano = undefined;
    this.fondoCercano = undefined;
  }

  // -- Construccion --------------------------------------------------------

  /**
   * Telon de arcadas con parallax.
   *
   * Dos capas a distinta velocidad: la lejana casi no se mueve, la cercana
   * acompaña. Es lo que convierte un plano de plataformas en un sitio con
   * profundidad, y ademas recuerda que el Vientre es una catedral, no cuevas.
   */
  private crearFondo(): void {
    // El telon va fijo a la camara (scrollFactor 0), asi que se dimensiona con
    // la resolucion interna, no con el tamaño del mundo.
    const { ancho, alto } = RESOLUCION;

    const lejano = this.add.tileSprite(0, 0, ancho, alto, 'fondo-arcos');
    lejano.setOrigin(0, 0);
    lejano.setScrollFactor(0);
    lejano.setScale(2);
    lejano.setAlpha(0.5);
    lejano.setDepth(-20);
    this.fondoLejano = lejano;

    const cercano = this.add.tileSprite(0, 0, ancho, alto, 'fondo-arcos');
    cercano.setOrigin(0, 0);
    cercano.setScrollFactor(0);
    cercano.setAlpha(0.75);
    cercano.setDepth(-10);
    this.fondoCercano = cercano;
  }

  /** Desplaza las capas segun la camara, no segun el reloj. */
  private actualizarParallax(): void {
    const camara = this.cameras.main;

    if (this.fondoLejano) {
      this.fondoLejano.tilePositionX = camara.scrollX * 0.08;
      this.fondoLejano.tilePositionY = camara.scrollY * 0.05;
    }

    if (this.fondoCercano) {
      this.fondoCercano.tilePositionX = camara.scrollX * 0.25;
      this.fondoCercano.tilePositionY = camara.scrollY * 0.18;
    }
  }

  private construirGeometria(): Phaser.Physics.Arcade.StaticGroup {
    const suelos = this.physics.add.staticGroup();

    for (const [x, y, anchoTiles] of this.definicion.plataformas) {
      for (let i = 0; i < anchoTiles; i += 1) {
        suelos
          .create(x + i * T, y, 'piedra-placeholder')
          .setOrigin(0, 0)
          .refreshBody();
      }
    }

    for (const [x, yInicio, yFin] of this.definicion.paredes) {
      for (let y = yInicio; y < yFin; y += T) {
        suelos.create(x, y, 'piedra-placeholder').setOrigin(0, 0).refreshBody();
      }
    }

    return suelos;
  }

  private crearCirujano(x: number, y: number): void {
    this.cirujano = new CirujanoSacerdote(this, x, y, this.controles);
    this.physics.add.collider(this.cirujano.sprite, this.suelos);

    this.cirujano.vitalidad.on('cambio', (puntos: number) => {
      this.game.events.emit(EVENTOS_HUD.vitalidad, puntos);
    });
    this.cirujano.fervor.on('cambio', (puntos: number) => {
      this.game.events.emit(EVENTOS_HUD.fervor, puntos);
    });
    this.cirujano.eventos.on('pociones', (cargas: number) => {
      this.game.events.emit(EVENTOS_HUD.pociones, cargas);
    });
    this.cirujano.vitalidad.on('muerte', () => this.alMorir());

    this.physics.add.overlap(
      this.cirujano.hitbox,
      this.obtenerGrupoEnemigos(),
      (_hitbox, spriteEnemigo) => {
        this.resolverGolpeDelCirujano(spriteEnemigo as Phaser.GameObjects.GameObject);
      },
    );
  }

  private obtenerGrupoEnemigos(): Phaser.Physics.Arcade.Group {
    if (!this.grupoEnemigos) this.grupoEnemigos = this.physics.add.group();
    return this.grupoEnemigos;
  }

  private poblarNivel(): void {
    const grupo = this.obtenerGrupoEnemigos();

    for (const ronda of this.definicion.devotos) {
      const devoto = new Devoto(this, ronda.x, ronda.y, {
        izquierda: ronda.izquierda,
        derecha: ronda.derecha,
      });

      this.physics.add.collider(devoto.sprite, this.suelos);
      grupo.add(devoto.sprite);
      this.devotos.push(devoto);

      this.physics.add.overlap(devoto.hitbox, this.cirujano.sprite, () =>
        this.resolverGolpeDeDevoto(devoto),
      );
    }

    for (const ronda of this.definicion.vestales ?? []) {
      const vestal = new Vestal(this, ronda.x, ronda.y, {
        izquierda: ronda.izquierda,
        derecha: ronda.derecha,
      });

      this.physics.add.collider(vestal.sprite, this.suelos);
      grupo.add(vestal.sprite);
      this.vestales.push(vestal);

      // El Vestal no conoce el grupo de proyectiles: solo avisa de que lanza.
      vestal.eventos.on('lanzar', (donde: { x: number; y: number; direccion: number }) => {
        this.lanzarSello(donde.x, donde.y, donde.direccion);
      });
    }

    // Sin collider a proposito: el Altar es decorado atravesable, no un muro.
    for (const punto of this.definicion.altares) {
      this.altares.push(new Altar(this, punto.x, punto.y));
    }

    if (this.altares.length > 0) {
      // El primer Altar arranca encendido: es el punto de partida de la zona.
      this.altares[0].rezar();
      this.altarActivo = this.altares[0];
    }

    for (const [x, y, id] of this.definicion.fragmentos) {
      const fragmento = new FragmentoCodice(this, x, y, id);
      this.fragmentos.push(fragmento);

      this.physics.add.overlap(this.cirujano.sprite, fragmento.sprite, () =>
        this.resolverRecogidaDeFragmento(fragmento),
      );
    }

    if (this.definicion.jefe) this.crearJefe(this.definicion.jefe);
    if (this.definicion.umbral) this.crearUmbral(this.definicion.umbral);
  }

  private crearJefe(datos: RondaDevoto): void {
    const jefe = new Reformado(this, datos.x, datos.y, {
      izquierda: datos.izquierda,
      derecha: datos.derecha,
    });

    this.jefe = jefe;
    this.physics.add.collider(jefe.sprite, this.suelos);
    this.obtenerGrupoEnemigos().add(jefe.sprite);

    this.physics.add.overlap(jefe.hitbox, this.cirujano.sprite, () =>
      this.resolverGolpeDeJefe(jefe),
    );

    jefe.eventos.on('vida', (puntos: number, maximo: number) => {
      this.game.events.emit(EVENTOS_HUD.jefe, puntos, maximo);
    });

    jefe.eventos.on('despierta', () => {
      this.game.events.emit(EVENTOS_HUD.jefe, REFORMADO.vida, REFORMADO.vida);
      this.game.events.emit(EVENTOS_HUD.aviso, 'el Reformado');
    });

    jefe.eventos.on('fase', (fase: number) => {
      this.cameras.main.flash(180, 140, 60, 60);
      this.game.events.emit(EVENTOS_HUD.aviso, `fase ${fase}`);
    });

    // Estrellarse contra el muro: el momento en que se le puede castigar.
    jefe.eventos.on('choque', (x: number, y: number) => {
      this.impacto.golpeAsestado(x, y - 20, 0, true);
      this.cameras.main.shake(220, 0.01);
    });

    jefe.eventos.on('impacto-suelo', (x: number, y: number, alcance: number) => {
      this.resolverOndaDeJefe(x, y, alcance);
    });

    jefe.eventos.on('muerte', () => {
      this.jefeDerrotado = true;
      this.game.events.emit(EVENTOS_HUD.jefe, -1, 1);
      this.abrirUmbral();
    });
  }

  /** La onda barre a ras de suelo: saltar es la respuesta correcta. */
  private resolverOndaDeJefe(x: number, y: number, alcance: number): void {
    this.impacto.ondaSuelo(x, y, alcance);

    if (this.cirujano.estaMuerto) return;

    const cuerpo = this.cirujano.cuerpo;
    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;
    const distancia = Math.abs(this.cirujano.sprite.x - x);
    const mismaAltura = Math.abs(this.cirujano.sprite.y - y) < 40;

    if (!enSuelo || !mismaAltura || distancia > alcance) return;

    const resultado = this.cirujano.recibirDano(REFORMADO.dano, x);
    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private resolverGolpeDeJefe(jefe: Reformado): void {
    if (jefe.estaMuerto || this.cirujano.estaMuerto) return;
    if (!jefe.consumirGolpe()) return;

    const resultado = this.cirujano.recibirDano(REFORMADO.dano, jefe.sprite.x);

    if (resultado === 'parado') {
      jefe.aturdir();
      this.impacto.parryLogrado(
        (this.cirujano.sprite.x + jefe.sprite.x) / 2,
        this.cirujano.sprite.y - 12,
      );
      this.game.events.emit(EVENTOS_HUD.aviso, 'parry');
      return;
    }

    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private crearUmbral(umbral: Umbral): void {
    this.umbralSprite = this.add.sprite(umbral.x, umbral.y, 'umbral-placeholder');
    this.umbralSprite.setOrigin(0.5, 1);
    this.umbralSprite.setDepth(1);

    // Con un jefe en la sala, la salida no existe hasta que cae.
    if (this.definicion.jefe && !this.jefeDerrotado) {
      this.umbralSprite.setVisible(false);
      return;
    }

    // Latido lento: el descenso llama sin gritar.
    this.tweens.add({
      targets: this.umbralSprite,
      alpha: { from: 0.5, to: 1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.umbralAviso = this.add
      .text(umbral.x, umbral.y - 40, `E  ${umbral.etiqueta}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#d6cfc4',
      })
      .setOrigin(0.5, 1)
      .setVisible(false);
  }

  // -- Combate -------------------------------------------------------------

  private resolverGolpeDelCirujano(spriteEnemigo: Phaser.GameObjects.GameObject): void {
    // Da igual si es Devoto, Vestal o el Reformado: todos son Enemigo.
    const enemigo = enemigoDe(spriteEnemigo);
    if (!enemigo || enemigo.estaMuerto) return;

    const dano = this.cirujano.registrarGolpe(enemigo);
    if (dano <= 0) return; // ya golpeado en este swing

    const direccion = enemigo.sprite.x >= this.cirujano.sprite.x ? 1 : -1;
    const puntoX = enemigo.sprite.x;
    const puntoY = enemigo.sprite.y - 12;

    enemigo.recibirDano(dano, this.cirujano.sprite.x);

    if (enemigo.estaMuerto) {
      this.impacto.muerteEnemigo(puntoX, puntoY);
    } else {
      this.impacto.golpeAsestado(puntoX, puntoY, direccion, this.cirujano.golpeActualEsCargado);
    }
  }

  // -- Sellos del diezmo ---------------------------------------------------

  private lanzarSello(x: number, y: number, direccion: number): void {
    const sello = new Sello(this, x, y, direccion);
    this.sellos.push(sello);

    // Contra el escenario se disuelve: no atraviesa muros.
    this.physics.add.collider(sello.sprite, this.suelos, () => sello.destruir());

    this.physics.add.overlap(sello.sprite, this.cirujano.sprite, () =>
      this.resolverSelloContraCirujano(sello),
    );

    // Ya devuelto, el mismo sello puede herir a cualquier enemigo.
    this.physics.add.overlap(sello.sprite, this.obtenerGrupoEnemigos(), (_s, spriteEnemigo) =>
      this.resolverSelloContraEnemigo(sello, spriteEnemigo as Phaser.GameObjects.GameObject),
    );
  }

  private resolverSelloContraCirujano(sello: Sello): void {
    if (!sello.estaVivo || sello.fueDevuelto || this.cirujano.estaMuerto) return;

    // El parry no rompe el sello: se lo queda el Cirujano y sale rebotado.
    if (this.cirujano.estaParando) {
      sello.devolver();
      this.cirujano.premiarParry();
      this.impacto.parryLogrado(sello.sprite.x, sello.sprite.y);
      this.game.events.emit(EVENTOS_HUD.aviso, 'sello devuelto');
      return;
    }

    if (!sello.consumir()) return;

    const resultado = this.cirujano.recibirDano(sello.dano, sello.sprite.x);
    if (resultado === 'herido') this.impacto.danoRecibido();
    sello.destruir();
  }

  private resolverSelloContraEnemigo(
    sello: Sello,
    spriteEnemigo: Phaser.GameObjects.GameObject,
  ): void {
    // Solo hiere a los suyos una vez ha sido parado.
    if (!sello.estaVivo || !sello.fueDevuelto) return;

    const enemigo = enemigoDe(spriteEnemigo);
    if (!enemigo || enemigo.estaMuerto) return;
    if (!sello.consumir()) return;

    enemigo.recibirDano(sello.dano, sello.sprite.x);
    this.impacto.golpeAsestado(enemigo.sprite.x, enemigo.sprite.y - 12, 0, true);
    sello.destruir();
  }

  private resolverGolpeDeDevoto(devoto: Devoto): void {
    if (devoto.estaMuerto || this.cirujano.estaMuerto) return;
    if (!devoto.consumirGolpe()) return;

    const resultado = this.cirujano.recibirDano(DEVOTO.dano, devoto.sprite.x);

    if (resultado === 'parado') {
      devoto.aturdir();
      this.impacto.parryLogrado(
        (this.cirujano.sprite.x + devoto.sprite.x) / 2,
        this.cirujano.sprite.y - 12,
      );
      this.game.events.emit(EVENTOS_HUD.aviso, 'parry');
      return;
    }

    if (resultado === 'herido') this.impacto.danoRecibido();
  }

  private resolverRecogidaDeFragmento(fragmento: FragmentoCodice): void {
    if (!fragmento.recoger()) return;

    this.fragmentosRecogidos += 1;
    this.game.events.emit(EVENTOS_HUD.codice, this.fragmentosRecogidos);
    // Aviso discreto: el lore no interrumpe la partida.
    this.game.events.emit(EVENTOS_HUD.aviso, 'fragmento del Codice');
  }

  // -- Altares, umbral, muerte ---------------------------------------------

  private actualizarAltares(): void {
    if (this.cirujano.estaMuerto) return;

    for (const altar of this.altares) {
      const distancia = Phaser.Math.Distance.Between(
        this.cirujano.sprite.x,
        this.cirujano.sprite.y,
        altar.sprite.x,
        altar.sprite.y,
      );
      altar.marcarProximidad(distancia <= RADIO_ALTAR);

      if (altar.puedeRezar && this.controles.interactuarPresionado) {
        altar.rezar();
        this.altarActivo = altar;
        this.cirujano.reponerEnAltar();
        this.game.events.emit(EVENTOS_HUD.aviso, 'el Altar responde');
      }
    }
  }

  private actualizarUmbral(): void {
    const umbral = this.definicion.umbral;
    if (!umbral || !this.umbralSprite || this.descendiendo) return;
    if (this.cirujano.estaMuerto) return;
    if (this.definicion.jefe && !this.jefeDerrotado) return;

    const distancia = Phaser.Math.Distance.Between(
      this.cirujano.sprite.x,
      this.cirujano.sprite.y,
      this.umbralSprite.x,
      this.umbralSprite.y,
    );
    const cerca = distancia <= RADIO_UMBRAL;
    this.umbralAviso?.setVisible(cerca);

    if (cerca && this.controles.interactuarPresionado) this.descender(umbral);
  }

  private descender(umbral: Umbral): void {
    this.descendiendo = true;

    this.cameras.main.fade(600, 11, 9, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // El contador del Codice viaja con el jugador entre zonas.
      this.scene.start(umbral.destino, { fragmentos: this.fragmentosRecogidos });
    });
  }

  private alMorir(): void {
    if (this.reapareciendo) return;
    this.reapareciendo = true;

    this.cameras.main.shake(240, 0.012);
    this.cameras.main.fade(RETARDO_REAPARICION - 200, 11, 9, 11);
    this.time.delayedCall(RETARDO_REAPARICION, () => this.reaparecer());
  }

  private reaparecer(): void {
    const destino = this.altarActivo?.puntoReaparicion ?? this.definicion.inicio;

    this.cirujano.reaparecerEn(destino.x, destino.y);
    this.cameras.main.fadeIn(320, 11, 9, 11);
    this.reapareciendo = false;
    this.game.events.emit(EVENTOS_HUD.aviso, 'las manos recuerdan');
  }

  /** El jefe duerme hasta que el Cirujano entra de verdad en la sala. */
  private actualizarJefe(): void {
    const jefe = this.jefe;
    if (!jefe || jefe.estaMuerto) return;

    if (jefe.estadoActual === 'dormido') {
      const distancia = Math.abs(this.cirujano.sprite.x - jefe.sprite.x);
      if (distancia < 190) jefe.despertar();
      return;
    }

    jefe.actualizar(this.cirujano.sprite.x, this.cirujano.sprite.y);
  }

  /** Cae el jefe y la salida aparece. */
  private abrirUmbral(): void {
    if (!this.umbralSprite) return;

    this.umbralSprite.setVisible(true);
    this.umbralSprite.setAlpha(0);
    this.tweens.add({
      targets: this.umbralSprite,
      alpha: 1,
      duration: 1200,
      ease: 'Quad.easeOut',
    });
  }

  private limpiarDevotosMuertos(): void {
    this.devotos = this.devotos.filter((devoto) => !devoto.estaMuerto);
    this.vestales = this.vestales.filter((vestal) => !vestal.estaMuerto);
    this.sellos = this.sellos.filter((sello) => sello.estaVivo);
  }

  // -- Presentacion --------------------------------------------------------

  private emitirEstadoInicial(): void {
    // Un frame de margen: el HUD debe existir antes de recibir eventos.
    this.time.delayedCall(0, () => {
      this.game.events.emit(EVENTOS_HUD.vitalidad, this.cirujano.vitalidad.puntos);
      this.game.events.emit(EVENTOS_HUD.fervor, this.cirujano.fervor.puntos);
      this.game.events.emit(EVENTOS_HUD.pociones, this.cirujano.pociones);
      this.game.events.emit(EVENTOS_HUD.codice, this.fragmentosRecogidos);
    });
  }

  /** Ayuda de desarrollo. Se retira antes de cualquier build publica. */
  private crearAyudaControles(): void {
    this.add
      .text(
        6,
        RESOLUCION.alto - 22,
        'A/D mover  ESPACIO saltar  SHIFT dash\nJ atacar (mantener = cargado)  K parry  Q pocion  E interactuar',
        {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#6b5f55',
          lineSpacing: 2,
        },
      )
      .setScrollFactor(0)
      .setDepth(100);
  }
}
