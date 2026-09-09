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

class Sonido {
  private ctx: AudioContext | null = null;
  private maestro: GainNode | null = null;
  private bufferRuido: AudioBuffer | null = null;

  private silenciado = false;
  private vinculado = false;

  /** Drone de ambiente; se apaga al salir de los niveles. */
  private ambienteNodos: { osciladores: OscillatorNode[]; ganancia: GainNode } | null = null;

  /** Volumen general. Bajo a proposito: el juego es sobrio, no estridente. */
  private static readonly VOLUMEN = 0.35;

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

    window.addEventListener('keydown', activar, { once: false });
    window.addEventListener('pointerdown', activar, { once: false });
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

  /** Golpe conectado. Carne primero, hueso despues. */
  golpe(cargado = false): void {
    if (cargado) {
      this.ruido({ duracion: 0.22, frecuencia: 1400, barridoHasta: 180, volumen: 0.5 });
      this.tono({ desde: 150, hasta: 45, onda: 'sawtooth', duracion: 0.26, volumen: 0.4 });
      return;
    }

    this.ruido({ duracion: 0.12, frecuencia: 1800, barridoHasta: 300, volumen: 0.35 });
    this.tono({ desde: 190, hasta: 80, onda: 'triangle', duracion: 0.13, volumen: 0.28 });
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

  muerteEnemigo(): void {
    this.tono({ desde: 260, hasta: 40, onda: 'sawtooth', duracion: 0.55, volumen: 0.32 });
    this.ruido({ duracion: 0.5, frecuencia: 900, barridoHasta: 90, volumen: 0.35 });
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
