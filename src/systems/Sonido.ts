import { ajustes } from './Ajustes';
/**
 * Audio del teaser, sintetizado en tiempo real con la Web Audio API.
 *
 * No hay ni un solo archivo de audio en el proyecto, y es a proposito:
 *
 *   - Licencias: todo lo que suena es original del equipo. Cero riesgo de
 *     arrastrar un sample con condiciones raras a un proyecto que se publica.
 *   - Peso: el build ya carga 1,2 MB de Phaser. Unos cuantos .ogg de golpes y
 *     ambiente sumarian varios MB mas para un teaser que se juega en el
 *     navegador.
 *   - Ajuste: los sonidos se afinan cambiando numeros, igual que el resto del
 *     game feel, sin volver a exportar nada.
 *
 * Cuando el equipo grabe audio propio en Audacity, se sustituye llamada por
 * llamada: la interfaz publica (golpe, parry, altar...) puede quedarse igual y
 * cargar samples por dentro.
 *
 * Paleta sonora del Vientre: nada brillante ni alegre. Graves de carne, metal
 * quirurgico para el parry y campana liturgica para los Altares.
 */

/** Tipos de onda que usamos. Sin `custom`, que necesita tablas. */
type Onda = 'sine' | 'square' | 'sawtooth' | 'triangle';

/** Quien recibe el golpe. Cada uno suena distinto: carne, tela y hueso. */
/**
 * De que esta hecho lo que se golpea. Las especies del Vientre Humedo (#90)
 * ya tienen su clase, aunque de momento suenan como un Devoto: su voz propia
 * llega con el sonido de la fase 4 (#108).
 */
export type ClaseEnemigo =
  | 'devoto'
  | 'vestal'
  | 'reformado'
  | 'remedo'
  | 'serpiente'
  | 'mondador'
  | 'buitre'
  | 'cerdo'
  | 'cuervo'
  | 'zarza'
  | 'alfombra'
  | 'mata'
  | 'vena'
  | 'hongo'
  | 'flor'
  | 'tejido';

/** Volumen de la Lluvia Tibia en calma y cuando arrecia con la Marea. */
const LLUVIA_CALMA = 0.018;
const LLUVIA_FUERTE = 0.045;

class Sonido {
  private ctx: AudioContext | null = null;
  private maestro: GainNode | null = null;
  private bufferRuido: AudioBuffer | null = null;

  private silenciado = false;
  private vinculado = false;

  /** Drone de ambiente; se apaga al salir de los niveles. */
  private ambienteNodos: { osciladores: OscillatorNode[]; ganancia: GainNode } | null = null;
  /** La Lluvia Tibia: un ruido filtrado en bucle y su volumen. */
  private lluviaNodos: { fuente: AudioBufferSourceNode; ganancia: GainNode } | null = null;

  /** Volumen general. Sobrio, pero tiene que oirse por encima de la musica. */
  private static readonly VOLUMEN = 0.55;

  // -- Ciclo de vida -------------------------------------------------------

  /**
   * Los navegadores crean el AudioContext suspendido y no dejan sonar nada
   * hasta que el usuario interactua. Enganchamos la reanudacion al primer
   * teclazo o clic, una sola vez.
   */
  vincularActivacion(): void {
    if (this.vinculado || typeof window === 'undefined') return;
    this.vinculado = true;

    const activar = () => {
      this.obtenerContexto()
        ?.resume()
        .catch(() => {
          /* si el navegador lo rechaza, el juego sigue sin audio */
        });
    };

    // En fase de captura, para que ningun preventDefault de Phaser se
    // interponga, y tambien en tactil.
    window.addEventListener('keydown', activar, { capture: true });
    window.addEventListener('pointerdown', activar, { capture: true });
    window.addEventListener('touchstart', activar, { capture: true });
  }

  /**
   * Comparte el AudioContext de Phaser en vez de crear otro. Asi hay un solo
   * contexto que desbloquear, y Phaser ya lo hace con la primera interaccion.
   */
  adoptarContexto(ctx: AudioContext): void {
    if (this.ctx === ctx) return;
    this.ctx = ctx;
    this.maestro = ctx.createGain();
    this.maestro.gain.value = this.ganancia;
    this.maestro.connect(ctx.destination);
    this.bufferRuido = this.crearBufferRuido(ctx);
  }

  /** false mientras el navegador tenga el audio bloqueado (antes del primer clic). */
  get estaActivo(): boolean {
    return this.ctx?.state === 'running';
  }

  private obtenerContexto(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined' || !window.AudioContext) return null;

    try {
      this.ctx = new AudioContext();
      this.maestro = this.ctx.createGain();
      this.maestro.gain.value = this.ganancia;
      this.maestro.connect(this.ctx.destination);
      this.bufferRuido = this.crearBufferRuido(this.ctx);
    } catch {
      // Sin audio disponible: el juego debe seguir siendo jugable igual.
      this.ctx = null;
    }

    return this.ctx;
  }

  /** El volumen del maestro: el ajuste de efectos (#151), o nada si esta silenciado. */
  private get ganancia(): number {
    return this.silenciado ? 0 : Sonido.VOLUMEN * ajustes.volumenSonido;
  }

  /** Vuelve a leer el ajuste de volumen. Lo llama Ajustes al cambiar. */
  aplicarVolumen(): void {
    if (this.maestro) this.maestro.gain.value = this.ganancia;
  }

  get estaSilenciado(): boolean {
    return this.silenciado;
  }

  alternarSilencio(): boolean {
    this.silenciado = !this.silenciado;
    if (this.maestro) {
      this.maestro.gain.value = this.ganancia;
    }
    return this.silenciado;
  }

  // -- Primitivas ----------------------------------------------------------

  /** Un segundo de ruido blanco, reutilizado por todos los impactos. */
  private crearBufferRuido(ctx: AudioContext): AudioBuffer {
    const muestras = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = buffer.getChannelData(0);

    for (let i = 0; i < muestras; i += 1) {
      datos[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Tono con barrido de frecuencia y caida exponencial.
   * Es la base de casi todo: golpes, campanas y avisos.
   */
  private tono(opciones: {
    desde: number;
    hasta?: number;
    onda?: Onda;
    duracion: number;
    volumen?: number;
    retardo?: number;
  }): void {
    const ctx = this.obtenerContexto();
    if (!ctx || !this.maestro) return;

    const inicio = ctx.currentTime + (opciones.retardo ?? 0);
    const fin = inicio + opciones.duracion;
    const volumen = opciones.volumen ?? 0.5;

    const osc = ctx.createOscillator();
    osc.type = opciones.onda ?? 'sine';
    osc.frequency.setValueAtTime(opciones.desde, inicio);
    if (opciones.hasta !== undefined) {
      // exponentialRamp no admite el cero, de ahi el minimo.
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opciones.hasta), fin);
    }

    const ganancia = ctx.createGain();
    // Ataque muy corto en vez de instantaneo: evita el chasquido del click.
    ganancia.gain.setValueAtTime(0.0001, inicio);
    ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + 0.006);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, fin);

    osc.connect(ganancia);
    ganancia.connect(this.maestro);
    osc.start(inicio);
    osc.stop(fin + 0.02);
  }

  /** Ruido filtrado: la parte "carnosa" de los impactos. */
  private ruido(opciones: {
    duracion: number;
    frecuencia: number;
    tipo?: BiquadFilterType;
    volumen?: number;
    barridoHasta?: number;
    retardo?: number;
  }): void {
    const ctx = this.obtenerContexto();
    if (!ctx || !this.maestro || !this.bufferRuido) return;

    const inicio = ctx.currentTime + (opciones.retardo ?? 0);
    const fin = inicio + opciones.duracion;
    const volumen = opciones.volumen ?? 0.4;

    const fuente = ctx.createBufferSource();
    fuente.buffer = this.bufferRuido;

    const filtro = ctx.createBiquadFilter();
    filtro.type = opciones.tipo ?? 'lowpass';
    filtro.frequency.setValueAtTime(opciones.frecuencia, inicio);
    if (opciones.barridoHasta !== undefined) {
      filtro.frequency.exponentialRampToValueAtTime(Math.max(20, opciones.barridoHasta), fin);
    }

    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(volumen, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, fin);

    fuente.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(this.maestro);
    fuente.start(inicio);
    fuente.stop(fin + 0.02);
  }

  // -- Combate -------------------------------------------------------------

  /**
   * Golpe conectado. Cada clase de enemigo responde con su propia materia:
   * el Devoto es carne y hueso, el Vestal es tela y metal fino, el Reformado
   * es carne humeda sobre algo que ya no es del todo hueso.
   */
  golpe(cargado = false, clase: ClaseEnemigo = 'devoto'): void {
    const fuerza = cargado ? 1.45 : 1;

    switch (clase) {
      case 'vestal':
        // Tela que se rasga y un tintineo de sello: agudo y seco.
        this.ruido({ duracion: 0.1 * fuerza, frecuencia: 3200, tipo: 'bandpass', volumen: 0.32 });
        this.tono({ desde: 1320, hasta: 880, onda: 'triangle', duracion: 0.09, volumen: 0.14 });
        this.tono({ desde: 240, hasta: 120, onda: 'triangle', duracion: 0.1, volumen: 0.2 });
        break;

      case 'zarza':
        // Tallo seco que se parte, y debajo algo que sangra.
        this.ruido({ duracion: 0.08, frecuencia: 2600, tipo: 'highpass', volumen: 0.3 });
        this.ruido({
          duracion: 0.14,
          frecuencia: 800,
          barridoHasta: 200,
          volumen: 0.22,
          retardo: 0.04,
        });
        break;

      case 'alfombra':
        // Filamentos cortados: un rasgado corto y blando.
        this.ruido({ duracion: 0.12, frecuencia: 1800, tipo: 'bandpass', volumen: 0.26 });
        break;

      case 'serpiente':
        // Escama dura: el golpe rebota antes de entrar.
        this.ruido({ duracion: 0.08, frecuencia: 2600, tipo: 'bandpass', volumen: 0.24 });
        this.ruido({
          duracion: 0.16,
          frecuencia: 900,
          barridoHasta: 200,
          volumen: 0.3,
          retardo: 0.03,
        });
        break;

      case 'remedo':
      case 'cerdo':
        // Blando: carne sin hueso que la sostenga.
        this.ruido({ duracion: 0.1, frecuencia: 1100, barridoHasta: 260, volumen: 0.3 });
        this.tono({ desde: 160, hasta: 90, onda: 'sine', duracion: 0.1, volumen: 0.2 });
        break;

      case 'reformado':
        // Humedo y hondo, con un crujido debajo.
        this.ruido({ duracion: 0.2 * fuerza, frecuencia: 900, barridoHasta: 120, volumen: 0.45 });
        this.tono({
          desde: 110,
          hasta: 40,
          onda: 'sawtooth',
          duracion: 0.24 * fuerza,
          volumen: 0.38,
        });
        this.ruido({
          duracion: 0.05,
          frecuencia: 2400,
          tipo: 'highpass',
          volumen: 0.18,
          retardo: 0.03,
        });
        break;

      default:
        // Carne primero, hueso despues.
        if (cargado) {
          this.ruido({ duracion: 0.22, frecuencia: 1400, barridoHasta: 180, volumen: 0.5 });
          this.tono({ desde: 150, hasta: 45, onda: 'sawtooth', duracion: 0.26, volumen: 0.4 });
        } else {
          this.ruido({ duracion: 0.12, frecuencia: 1800, barridoHasta: 300, volumen: 0.35 });
          this.tono({ desde: 190, hasta: 80, onda: 'triangle', duracion: 0.13, volumen: 0.28 });
        }
    }
  }

  /** El golpe no encuentra nada: solo el aire que corta el arco. */
  golpeAlAire(): void {
    this.ruido({
      duracion: 0.09,
      frecuencia: 1200,
      barridoHasta: 3000,
      tipo: 'bandpass',
      volumen: 0.14,
    });
  }

  /**
   * Parry. Es el unico sonido metalico y limpio del juego: tiene que
   * distinguirse de todo lo demas incluso en mitad de una pelea.
   */
  parry(): void {
    this.tono({ desde: 1760, hasta: 1200, onda: 'triangle', duracion: 0.28, volumen: 0.3 });
    // Una quinta por encima, con un pelin de retardo: suena a campana, no a pitido.
    this.tono({
      desde: 2640,
      hasta: 1900,
      onda: 'sine',
      duracion: 0.34,
      volumen: 0.18,
      retardo: 0.012,
    });
    this.ruido({ duracion: 0.07, frecuencia: 5200, tipo: 'highpass', volumen: 0.22 });
  }

  /** El Cirujano encaja un golpe. Sordo y hacia abajo. */
  dano(): void {
    this.tono({ desde: 220, hasta: 60, onda: 'square', duracion: 0.3, volumen: 0.3 });
    this.ruido({ duracion: 0.28, frecuencia: 700, barridoHasta: 120, volumen: 0.4 });
  }

  /**
   * Dano por caida (issue #39). Distinto del golpe de un enemigo: es el
   * cuerpo entero contra la piedra. Un golpe sordo y grave, algo que cruje, y
   * si la caida fue mala, el aire que se escapa.
   */
  danoPorCaida(dano: number): void {
    this.tono({ desde: 95, hasta: 28, onda: 'sine', duracion: 0.32, volumen: 0.55 });
    this.ruido({ duracion: 0.16, frecuencia: 260, barridoHasta: 60, volumen: 0.5 });
    // El crujido: corto y agudo, encima del golpe.
    this.ruido({ duracion: 0.05, frecuencia: 3200, tipo: 'highpass', volumen: 0.3, retardo: 0.02 });
    this.ruido({
      duracion: 0.04,
      frecuencia: 2600,
      tipo: 'highpass',
      volumen: 0.22,
      retardo: 0.09,
    });
    if (dano >= 2) {
      this.tono({
        desde: 150,
        hasta: 70,
        onda: 'sawtooth',
        duracion: 0.38,
        volumen: 0.14,
        retardo: 0.12,
      });
    }
  }

  /** Cada enemigo cae a su manera. */
  muerteEnemigo(clase: ClaseEnemigo = 'devoto'): void {
    switch (clase) {
      case 'serpiente':
        // Larga y humeda, sin campana: es un animal, no un sacramento.
        this.tono({ desde: 100, hasta: 25, onda: 'sawtooth', duracion: 1.2, volumen: 0.35 });
        this.ruido({ duracion: 1.1, frecuencia: 700, barridoHasta: 60, volumen: 0.35 });
        break;
      case 'zarza':
        // Se abre y suelta su savia, que es sangre: un chorro corto y humedo.
        this.ruido({ duracion: 0.35, frecuencia: 600, barridoHasta: 120, volumen: 0.3 });
        this.tono({ desde: 120, hasta: 70, onda: 'sine', duracion: 0.3, volumen: 0.18 });
        break;
      case 'alfombra':
        this.ruido({
          duracion: 0.4,
          frecuencia: 2000,
          barridoHasta: 300,
          tipo: 'bandpass',
          volumen: 0.2,
        });
        break;
      case 'remedo':
        // Un bicho del tamano de un dedo: un chasquido pequeno.
        this.ruido({ duracion: 0.07, frecuencia: 3000, tipo: 'highpass', volumen: 0.22 });
        this.tono({ desde: 400, hasta: 120, onda: 'triangle', duracion: 0.12, volumen: 0.14 });
        break;
      case 'cerdo':
        // Un chillido corto que se apaga. Sin regodeo.
        this.tono({ desde: 900, hasta: 300, onda: 'sawtooth', duracion: 0.35, volumen: 0.16 });
        this.ruido({ duracion: 0.3, frecuencia: 700, barridoHasta: 100, volumen: 0.22 });
        break;
      case 'vestal':
        // Se quiebra como un objeto de vidrio y suena una campanilla al caer.
        this.ruido({ duracion: 0.25, frecuencia: 4200, tipo: 'highpass', volumen: 0.3 });
        this.tono({
          desde: 1760,
          hasta: 1500,
          onda: 'sine',
          duracion: 0.5,
          volumen: 0.16,
          retardo: 0.08,
        });
        this.tono({ desde: 220, hasta: 60, onda: 'triangle', duracion: 0.4, volumen: 0.25 });
        break;

      case 'reformado':
        // Largo, hondo, y al final una campana: se acaba un sacramento.
        this.tono({ desde: 90, hasta: 24, onda: 'sawtooth', duracion: 1.6, volumen: 0.45 });
        this.ruido({ duracion: 1.4, frecuencia: 600, barridoHasta: 40, volumen: 0.4 });
        this.tono({
          desde: 320,
          hasta: 300,
          onda: 'sine',
          duracion: 2.2,
          volumen: 0.22,
          retardo: 0.9,
        });
        this.tono({
          desde: 160,
          hasta: 150,
          onda: 'sine',
          duracion: 2.6,
          volumen: 0.2,
          retardo: 1.0,
        });
        break;

      default:
        this.tono({ desde: 260, hasta: 40, onda: 'sawtooth', duracion: 0.55, volumen: 0.32 });
        this.ruido({ duracion: 0.5, frecuencia: 900, barridoHasta: 90, volumen: 0.35 });
    }
  }

  /** El Reformado abre los ojos que no tiene: un rugido bajo y ronco. */
  jefeDespierta(): void {
    this.tono({ desde: 60, hasta: 110, onda: 'sawtooth', duracion: 1.2, volumen: 0.4 });
    this.ruido({ duracion: 1.1, frecuencia: 300, barridoHasta: 1400, volumen: 0.35 });
    this.tono({ desde: 45, hasta: 30, onda: 'sine', duracion: 1.6, volumen: 0.4 });
  }

  /** Cambio de fase del jefe: un golpe seco y una subida. */
  jefeFase(): void {
    this.tono({ desde: 80, hasta: 30, onda: 'square', duracion: 0.3, volumen: 0.35 });
    this.tono({
      desde: 220,
      hasta: 440,
      onda: 'sawtooth',
      duracion: 0.5,
      volumen: 0.18,
      retardo: 0.1,
    });
  }

  /** Piedra que cae del techo y se rompe. */
  escombro(): void {
    this.ruido({ duracion: 0.18, frecuencia: 1600, barridoHasta: 200, volumen: 0.4 });
    this.tono({ desde: 140, hasta: 50, onda: 'triangle', duracion: 0.16, volumen: 0.3 });
  }

  /**
   * Aviso de la Marea del Hambre: el Latido se acelera (dos golpes graves cada
   * vez mas juntos) y algo grande se mueve en los ductos.
   */
  mareaAviso(): void {
    for (const [i, retardo] of [0, 0.42, 0.74, 0.98].entries()) {
      this.tono({
        desde: 70,
        hasta: 40,
        onda: 'sine',
        duracion: 0.18,
        volumen: 0.3 + i * 0.06,
        retardo,
      });
    }
    this.ruido({ duracion: 1.6, frecuencia: 220, barridoHasta: 600, volumen: 0.18, retardo: 0.4 });
  }

  // -- Fauna y flora del Vientre Humedo (#108) ------------------------------
  //
  // Cada una suena a su materia, y ninguna es metalica y limpia: eso es solo
  // del parry. Son cortas y bajas, porque se repiten mientras se juega.

  /** Serpiente: el silbido grave que anuncia que va a embestir. */
  serpienteSilba(): void {
    this.ruido({
      duracion: 0.6,
      frecuencia: 2400,
      barridoHasta: 900,
      tipo: 'bandpass',
      volumen: 0.16,
    });
    this.tono({ desde: 70, hasta: 55, onda: 'sawtooth', duracion: 0.6, volumen: 0.1 });
  }

  /** Serpiente: escamas duras contra la piedra, al embestir. */
  serpienteEmbiste(): void {
    this.ruido({
      duracion: 0.5,
      frecuencia: 600,
      barridoHasta: 1800,
      tipo: 'bandpass',
      volumen: 0.22,
    });
  }

  /** Serpiente: la boca que se abre mas de lo que deberia, rompiendose. */
  serpienteBoca(): void {
    this.ruido({ duracion: 0.08, frecuencia: 2000, tipo: 'highpass', volumen: 0.2 });
    this.tono({
      desde: 140,
      hasta: 50,
      onda: 'sawtooth',
      duracion: 0.5,
      volumen: 0.2,
      retardo: 0.05,
    });
  }

  /** Serpiente: tragar, y escupir. */
  serpienteTraga(): void {
    this.tono({ desde: 90, hasta: 40, onda: 'sine', duracion: 0.4, volumen: 0.3 });
    this.ruido({ duracion: 0.4, frecuencia: 400, barridoHasta: 120, volumen: 0.25 });
  }

  /** Serpiente: el choque contra el muro y el aturdimiento. */
  serpienteAturdida(): void {
    this.ruido({ duracion: 0.2, frecuencia: 900, barridoHasta: 120, volumen: 0.4 });
    this.tono({ desde: 120, hasta: 45, onda: 'square', duracion: 0.3, volumen: 0.25 });
  }

  /** Remedo: el tick humedo de algo blando que se retuerce. */
  remedoTiembla(): void {
    this.ruido({ duracion: 0.05, frecuencia: 1400, tipo: 'bandpass', volumen: 0.12 });
    this.ruido({ duracion: 0.04, frecuencia: 1700, tipo: 'bandpass', volumen: 0.1, retardo: 0.08 });
  }

  /** Remedo: una mordida pequena y la huida. */
  remedoMuerde(): void {
    this.ruido({ duracion: 0.05, frecuencia: 3200, tipo: 'highpass', volumen: 0.24 });
    this.tono({ desde: 700, hasta: 300, onda: 'triangle', duracion: 0.08, volumen: 0.12 });
    this.ruido({
      duracion: 0.25,
      frecuencia: 900,
      barridoHasta: 2000,
      tipo: 'bandpass',
      volumen: 0.08,
      retardo: 0.08,
    });
  }

  /** Mondador: un ronroneo seco mientras come. */
  mondadorRonronea(): void {
    for (let i = 0; i < 6; i += 1) {
      this.tono({
        desde: 38,
        hasta: 34,
        onda: 'sawtooth',
        duracion: 0.07,
        volumen: 0.1,
        retardo: i * 0.09,
      });
    }
  }

  /** Mondador: garras en la piedra al salir corriendo. */
  mondadorHuye(): void {
    for (let i = 0; i < 4; i += 1) {
      this.ruido({
        duracion: 0.03,
        frecuencia: 2800,
        tipo: 'highpass',
        volumen: 0.14,
        retardo: i * 0.07,
      });
    }
  }

  /** Buitre: alas secas, como pergamino sacudido. */
  buitreAlas(): void {
    for (let i = 0; i < 3; i += 1) {
      this.ruido({
        duracion: 0.12,
        frecuencia: 500,
        barridoHasta: 1400,
        tipo: 'bandpass',
        volumen: 0.16,
        retardo: i * 0.16,
      });
    }
  }

  /** Buitre: un clac de hueso al posarse. */
  buitreClac(): void {
    this.tono({ desde: 1100, hasta: 700, onda: 'triangle', duracion: 0.05, volumen: 0.12 });
    this.ruido({ duracion: 0.03, frecuencia: 2400, tipo: 'bandpass', volumen: 0.1 });
  }

  /** Cerdo: un grunido y los tubos que burbujean. */
  cerdoGrune(): void {
    this.tono({ desde: 110, hasta: 85, onda: 'sawtooth', duracion: 0.22, volumen: 0.12 });
    for (let i = 0; i < 3; i += 1) {
      this.tono({
        desde: 600 + i * 90,
        hasta: 900,
        onda: 'sine',
        duracion: 0.04,
        volumen: 0.05,
        retardo: 0.25 + i * 0.07,
      });
    }
  }

  /** Cuervo: graznido con resonancia de cable, un zumbido que se queda. */
  cuervoGrazna(alarma = false): void {
    const f = alarma ? 1.8 : 1;
    this.tono({ desde: 700, hasta: 520, onda: 'sawtooth', duracion: 0.16, volumen: 0.1 * f });
    this.ruido({ duracion: 0.14, frecuencia: 1600, tipo: 'bandpass', volumen: 0.12 * f });
    this.tono({
      desde: 120,
      hasta: 118,
      onda: 'square',
      duracion: 0.3,
      volumen: 0.03,
      retardo: 0.05,
    });
  }

  /** Alfombra: un susurro de filamentos que se ponen de pie. */
  alfombraSusurra(): void {
    this.ruido({
      duracion: 0.25,
      frecuencia: 4000,
      barridoHasta: 2500,
      tipo: 'highpass',
      volumen: 0.06,
    });
  }

  /** Alfombra: el chasquido al cerrarse sobre el pie. */
  alfombraCierra(): void {
    this.ruido({ duracion: 0.06, frecuencia: 2200, tipo: 'bandpass', volumen: 0.3 });
    this.tono({ desde: 200, hasta: 90, onda: 'triangle', duracion: 0.12, volumen: 0.18 });
  }

  /** Mata: la contraccion humeda del fruto y el desprenderse. */
  mataCosecha(): void {
    this.ruido({ duracion: 0.12, frecuencia: 700, barridoHasta: 300, volumen: 0.2 });
    this.tono({
      desde: 300,
      hasta: 520,
      onda: 'sine',
      duracion: 0.05,
      volumen: 0.1,
      retardo: 0.12,
    });
  }

  /** Vena: un pulso humedo, al ritmo del Latido. */
  venaPulso(): void {
    this.tono({ desde: 60, hasta: 42, onda: 'sine', duracion: 0.16, volumen: 0.2 });
    this.ruido({ duracion: 0.1, frecuencia: 400, volumen: 0.08 });
  }

  /** Hongo: un pop suave y la nube de esporas. */
  hongoPop(): void {
    this.tono({ desde: 420, hasta: 240, onda: 'sine', duracion: 0.07, volumen: 0.14 });
    this.ruido({ duracion: 0.4, frecuencia: 5000, tipo: 'highpass', volumen: 0.04, retardo: 0.05 });
  }

  /** Puente de tejido: carne que se estira y se cierra. */
  tejidoCrece(): void {
    this.ruido({ duracion: 0.6, frecuencia: 300, barridoHasta: 900, volumen: 0.18 });
    this.tono({ desde: 80, hasta: 140, onda: 'sawtooth', duracion: 0.6, volumen: 0.06 });
  }

  /** Marea: el agua que sube por los ductos. */
  mareaSube(): void {
    this.ruido({ duracion: 3.5, frecuencia: 160, barridoHasta: 500, volumen: 0.16 });
  }

  /** Marea: el agua que se retira, mas suave. */
  mareaBaja(): void {
    this.ruido({ duracion: 3, frecuencia: 450, barridoHasta: 120, volumen: 0.1 });
  }

  /** Reja de la arena cayendo: hierro contra piedra, y el eco. */
  reja(): void {
    this.ruido({ duracion: 0.35, frecuencia: 900, barridoHasta: 120, volumen: 0.5 });
    this.tono({ desde: 110, hasta: 40, onda: 'square', duracion: 0.42, volumen: 0.38 });
    this.tono({
      desde: 1800,
      hasta: 900,
      onda: 'triangle',
      duracion: 0.5,
      volumen: 0.12,
      retardo: 0.05,
    });
  }

  // -- La cinematica del sacramento (#147) -----------------------------------

  /**
   * Un latido: dos golpes graves, el segundo mas flojo. Es el pulso de toda
   * la cinematica; la escena decide el ritmo, aqui solo suena uno.
   */
  latido(fuerza = 1): void {
    this.tono({ desde: 62, hasta: 36, onda: 'sine', duracion: 0.2, volumen: 0.36 * fuerza });
    this.ruido({ duracion: 0.12, frecuencia: 140, volumen: 0.16 * fuerza });
    this.tono({
      desde: 54,
      hasta: 34,
      onda: 'sine',
      duracion: 0.18,
      volumen: 0.24 * fuerza,
      retardo: 0.24,
    });
  }

  /**
   * El bisturi contra la piedra: el golpe, un rebote y el metal que se queda
   * sonando. La decision del Cirujano se cuenta solo con esto, a oscuras, asi
   * que tiene que ser limpio y reconocible.
   */
  bisturiCae(): void {
    this.ruido({ duracion: 0.05, frecuencia: 5200, tipo: 'highpass', volumen: 0.3 });
    this.tono({ desde: 2900, hasta: 2500, onda: 'triangle', duracion: 0.08, volumen: 0.2 });
    this.ruido({
      duracion: 0.04,
      frecuencia: 4800,
      tipo: 'highpass',
      volumen: 0.16,
      retardo: 0.17,
    });
    this.tono({
      desde: 2700,
      hasta: 2600,
      onda: 'triangle',
      duracion: 0.06,
      volumen: 0.1,
      retardo: 0.17,
    });
    this.tono({
      desde: 3320,
      hasta: 3300,
      onda: 'sine',
      duracion: 1.4,
      volumen: 0.07,
      retardo: 0.02,
    });
  }

  /** La misma reja subiendo: cadena y contrapeso. */
  rejaAbre(): void {
    this.ruido({ duracion: 0.6, frecuencia: 500, barridoHasta: 1500, volumen: 0.2 });
    this.tono({ desde: 60, hasta: 90, onda: 'triangle', duracion: 0.6, volumen: 0.18 });
  }

  /** Sello devuelto con el parry: el mismo tintineo, mas brillante. */
  selloDevuelto(): void {
    this.tono({ desde: 1500, hasta: 2200, onda: 'triangle', duracion: 0.14, volumen: 0.18 });
  }

  /** Onda de la caida del Reformado: subgrave y largo. */
  ondaJefe(): void {
    this.tono({ desde: 90, hasta: 28, onda: 'sine', duracion: 0.8, volumen: 0.55 });
    this.ruido({ duracion: 0.7, frecuencia: 400, barridoHasta: 60, volumen: 0.45 });
  }

  /** Sello del diezmo saliendo despedido. */
  /**
   * La Injertadora: un golpe de presion, no un disparo.
   *
   * Ruido corto y seco con un tono grave debajo — aire soltado de golpe y
   * metal saliendo. Si sonara a arma de fuego, el arma dejaria de ser el
   * instrumento del oficio y se convertiria en una pistola con otro nombre.
   */
  injertadora(): void {
    this.ruido({ duracion: 0.07, frecuencia: 2400, barridoHasta: 600, volumen: 0.16 });
    this.tono({ desde: 320, hasta: 120, onda: 'square', duracion: 0.09, volumen: 0.1 });
  }

  /** Sin munición: el mecanismo se arma y no sale nada. */
  injertadoraVacia(): void {
    this.tono({ desde: 190, hasta: 150, onda: 'square', duracion: 0.05, volumen: 0.07 });
  }

  selloLanzado(): void {
    this.tono({ desde: 900, hasta: 1500, onda: 'triangle', duracion: 0.1, volumen: 0.14 });
  }

  // -- Movimiento ----------------------------------------------------------

  salto(): void {
    this.tono({ desde: 300, hasta: 520, onda: 'sine', duracion: 0.11, volumen: 0.13 });
  }

  /** Los pies tocan piedra. Solo tras una caida real, no a cada paso. */
  aterrizaje(fuerte = false): void {
    this.ruido({
      duracion: fuerte ? 0.14 : 0.08,
      frecuencia: 500,
      barridoHasta: 120,
      volumen: fuerte ? 0.3 : 0.16,
    });
    this.tono({
      desde: 120,
      hasta: 60,
      onda: 'sine',
      duracion: 0.08,
      volumen: fuerte ? 0.22 : 0.1,
    });
  }

  /** Las manos se agarran a un borde: un raspado corto. */
  agarre(): void {
    this.ruido({
      duracion: 0.12,
      frecuencia: 900,
      barridoHasta: 2200,
      tipo: 'bandpass',
      volumen: 0.22,
    });
  }

  /** Trepar desde el borde: un impulso de tela. */
  trepar(): void {
    this.ruido({
      duracion: 0.16,
      frecuencia: 400,
      barridoHasta: 1600,
      tipo: 'bandpass',
      volumen: 0.2,
    });
    this.tono({ desde: 200, hasta: 360, onda: 'sine', duracion: 0.12, volumen: 0.1 });
  }

  /** Beber la Pocion de Carne: un trago espeso. */
  pocion(): void {
    this.tono({ desde: 180, hasta: 90, onda: 'sine', duracion: 0.16, volumen: 0.22 });
    this.tono({ desde: 160, hasta: 80, onda: 'sine', duracion: 0.16, volumen: 0.2, retardo: 0.18 });
    this.tono({ desde: 140, hasta: 70, onda: 'sine', duracion: 0.2, volumen: 0.18, retardo: 0.36 });
    this.ruido({ duracion: 0.5, frecuencia: 700, tipo: 'lowpass', volumen: 0.12 });
  }

  /** Frasco vacio: un chasquido seco, nada que beber. */
  pocionVacia(): void {
    this.tono({ desde: 900, hasta: 600, onda: 'square', duracion: 0.05, volumen: 0.12 });
  }

  dash(): void {
    this.ruido({
      duracion: 0.19,
      frecuencia: 300,
      barridoHasta: 2600,
      tipo: 'bandpass',
      volumen: 0.3,
    });
  }

  // -- Mundo ---------------------------------------------------------------

  /** Rezar en un Altar: campana liturgica, grave y con cola. */
  altar(): void {
    this.tono({ desde: 320, hasta: 300, onda: 'sine', duracion: 1.6, volumen: 0.3 });
    this.tono({
      desde: 480,
      hasta: 450,
      onda: 'sine',
      duracion: 1.3,
      volumen: 0.16,
      retardo: 0.04,
    });
    this.tono({ desde: 160, hasta: 152, onda: 'sine', duracion: 2.2, volumen: 0.22 });
  }

  /** Fragmento del Codice: dos notas discretas. El lore no interrumpe. */
  codice(): void {
    this.tono({ desde: 660, onda: 'sine', duracion: 0.16, volumen: 0.15 });
    this.tono({ desde: 990, onda: 'sine', duracion: 0.22, volumen: 0.12, retardo: 0.11 });
  }

  /** Recoger una ofrenda del suelo: corto, humedo si es carne, tintineo si es sello. */
  ofrenda(tipo: 'carne' | 'carne-engastada' | 'sello' | 'injerto'): void {
    if (tipo === 'sello') {
      this.tono({ desde: 1320, hasta: 1760, onda: 'triangle', duracion: 0.12, volumen: 0.16 });
      return;
    }
    if (tipo === 'injerto') {
      // Metal contra metal: la pieza entra en la recamara.
      this.tono({ desde: 980, hasta: 1240, onda: 'square', duracion: 0.05, volumen: 0.1 });
      this.tono({
        desde: 1600,
        hasta: 1400,
        onda: 'triangle',
        duracion: 0.07,
        volumen: 0.08,
        retardo: 0.05,
      });
      return;
    }
    this.ruido({ duracion: 0.08, frecuencia: 700, barridoHasta: 200, volumen: 0.2 });
    this.tono({ desde: 260, hasta: 180, onda: 'sine', duracion: 0.1, volumen: 0.18 });
  }

  /** Reliquia recogida: un acorde de campanas, mas que un fragmento. */
  reliquia(): void {
    this.tono({ desde: 440, onda: 'sine', duracion: 0.9, volumen: 0.2 });
    this.tono({ desde: 660, onda: 'sine', duracion: 0.9, volumen: 0.16, retardo: 0.08 });
    this.tono({ desde: 880, onda: 'sine', duracion: 1.2, volumen: 0.14, retardo: 0.16 });
    this.tono({ desde: 220, hasta: 210, onda: 'sine', duracion: 1.6, volumen: 0.18 });
  }

  /** El jefe cae: campanas largas, sin alegria. Se acaba un sacramento. */
  victoria(): void {
    this.tono({ desde: 330, hasta: 320, onda: 'sine', duracion: 2.4, volumen: 0.24 });
    this.tono({ desde: 495, hasta: 480, onda: 'sine', duracion: 2.0, volumen: 0.16, retardo: 0.3 });
    this.tono({
      desde: 165,
      hasta: 158,
      onda: 'sine',
      duracion: 3.2,
      volumen: 0.22,
      retardo: 0.15,
    });
  }

  /** Abrir o cerrar la pausa y el Codice. */
  interfazAbrir(): void {
    this.tono({ desde: 520, hasta: 660, onda: 'sine', duracion: 0.1, volumen: 0.12 });
  }

  interfazCerrar(): void {
    this.tono({ desde: 660, hasta: 520, onda: 'sine', duracion: 0.1, volumen: 0.12 });
  }

  /** Moverse por un menu. */
  interfazMover(): void {
    this.tono({ desde: 880, onda: 'sine', duracion: 0.04, volumen: 0.08 });
  }

  /** Bajar un nivel del Vientre. */
  descenso(): void {
    this.tono({ desde: 260, hasta: 70, onda: 'sine', duracion: 1.1, volumen: 0.3 });
    this.ruido({ duracion: 1.0, frecuencia: 600, barridoHasta: 70, volumen: 0.25 });
  }

  /** Muerte del Cirujano. */
  muerteJugador(): void {
    this.tono({ desde: 180, hasta: 35, onda: 'triangle', duracion: 1.3, volumen: 0.35 });
    this.ruido({ duracion: 1.1, frecuencia: 500, barridoHasta: 50, volumen: 0.3 });
  }

  // -- Ambiente ------------------------------------------------------------

  /**
   * Drone de fondo: dos graves desafinados entre si.
   *
   * El batido lento que producen es lo que da la sensacion de estar dentro de
   * algo vivo y enorme. Va muy bajo: se nota cuando se apaga, no cuando suena.
   */
  ambienteEncendido(frecuenciaBase = 55): void {
    const ctx = this.obtenerContexto();
    if (!ctx || !this.maestro || this.ambienteNodos) return;

    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2.5);
    ganancia.connect(this.maestro);

    const osciladores = [frecuenciaBase, frecuenciaBase * 1.007, frecuenciaBase * 1.5].map(
      (frecuencia) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = frecuencia;
        osc.connect(ganancia);
        osc.start();
        return osc;
      },
    );

    this.ambienteNodos = { osciladores, ganancia };
  }

  /**
   * La Lluvia Tibia (#96, #108): un siseo agudo y muy bajo, en bucle, sobre el
   * mismo ruido de los golpes. Las gotas sueltas las pone la escena (`gota`).
   */
  lluviaEncendida(): void {
    const ctx = this.obtenerContexto();
    if (!ctx || !this.maestro || !this.bufferRuido || this.lluviaNodos) return;

    const fuente = ctx.createBufferSource();
    fuente.buffer = this.bufferRuido;
    fuente.loop = true;
    const agudos = ctx.createBiquadFilter();
    agudos.type = 'highpass';
    agudos.frequency.value = 2800;
    const graves = ctx.createBiquadFilter();
    graves.type = 'lowpass';
    graves.frequency.value = 7000;
    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(LLUVIA_CALMA, ctx.currentTime + 2);

    fuente.connect(agudos);
    agudos.connect(graves);
    graves.connect(ganancia);
    ganancia.connect(this.maestro);
    fuente.start();
    this.lluviaNodos = { fuente, ganancia };
  }

  /** Arrecia mientras la Marea avisa y sube: la lluvia es una de sus senales. */
  lluviaArrecia(arrecia: boolean): void {
    const ctx = this.obtenerContexto();
    if (!ctx || !this.lluviaNodos) return;
    const g = this.lluviaNodos.ganancia.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(Math.max(0.0001, g.value), ctx.currentTime);
    g.exponentialRampToValueAtTime(arrecia ? LLUVIA_FUERTE : LLUVIA_CALMA, ctx.currentTime + 1.2);
  }

  lluviaApagada(): void {
    const ctx = this.obtenerContexto();
    const nodos = this.lluviaNodos;
    if (!ctx || !nodos) return;
    this.lluviaNodos = null;
    nodos.ganancia.gain.cancelScheduledValues(ctx.currentTime);
    nodos.ganancia.gain.setValueAtTime(
      Math.max(0.0001, nodos.ganancia.gain.value),
      ctx.currentTime,
    );
    nodos.ganancia.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    nodos.fuente.stop(ctx.currentTime + 0.7);
  }

  /** Una gota que cae en un charco: corta, aguda y cada una distinta. */
  gota(): void {
    const altura = 900 + Math.random() * 900;
    this.tono({ desde: altura, hasta: altura * 0.6, onda: 'sine', duracion: 0.06, volumen: 0.05 });
  }

  ambienteApagado(): void {
    const ctx = this.obtenerContexto();
    const nodos = this.ambienteNodos;
    if (!ctx || !nodos) return;

    this.ambienteNodos = null;

    nodos.ganancia.gain.cancelScheduledValues(ctx.currentTime);
    nodos.ganancia.gain.setValueAtTime(
      Math.max(0.0001, nodos.ganancia.gain.value),
      ctx.currentTime,
    );
    nodos.ganancia.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    for (const osc of nodos.osciladores) {
      osc.stop(ctx.currentTime + 0.7);
    }
  }
}

/**
 * Instancia unica. Se importa donde haga falta en vez de ir pasandola por los
 * constructores: el audio no es estado de juego y no merece ese cableado.
 */
export const sonido = new Sonido();
ajustes.alCambiar(() => sonido.aplicarVolumen());
