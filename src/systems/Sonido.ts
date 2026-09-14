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
export type ClaseEnemigo = 'devoto' | 'vestal' | 'reformado';

class Sonido {
  private ctx: AudioContext | null = null;
  private maestro: GainNode | null = null;
  private bufferRuido: AudioBuffer | null = null;

  private silenciado = false;
  private vinculado = false;

  /** Drone de ambiente; se apaga al salir de los niveles. */
  private ambienteNodos: { osciladores: OscillatorNode[]; ganancia: GainNode } | null = null;

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
    this.maestro.gain.value = this.silenciado ? 0 : Sonido.VOLUMEN;
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
      this.maestro.gain.value = this.silenciado ? 0 : Sonido.VOLUMEN;
      this.maestro.connect(this.ctx.destination);
      this.bufferRuido = this.crearBufferRuido(this.ctx);
    } catch {
      // Sin audio disponible: el juego debe seguir siendo jugable igual.
      this.ctx = null;
    }

    return this.ctx;
  }

  get estaSilenciado(): boolean {
    return this.silenciado;
  }

  alternarSilencio(): boolean {
    this.silenciado = !this.silenciado;
    if (this.maestro) {
      this.maestro.gain.value = this.silenciado ? 0 : Sonido.VOLUMEN;
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
  ofrenda(tipo: 'carne' | 'sello'): void {
    if (tipo === 'sello') {
      this.tono({ desde: 1320, hasta: 1760, onda: 'triangle', duracion: 0.12, volumen: 0.16 });
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
