import Phaser from 'phaser';

/**
 * Barra de vida flotante para enemigos normales (el jefe usa la del HUD).
 *
 * Aparece con el primer golpe y se retira sola al cabo de unos segundos sin
 * recibir dano, para no empapelar la pantalla de barras sobre enemigos que el
 * jugador aun no ha tocado.
 *
 * Ensena dos cosas a la vez: cuanta vida QUEDA (relleno) y cuanta se acaba de
 * QUITAR (un tramo mas claro que se vacia despacio). Lo segundo es lo que
 * permite planificar: se ve de un vistazo si el proximo golpe remata.
 */
export class BarraVida {
  private readonly grafico: Phaser.GameObjects.Graphics;
  private readonly escena: Phaser.Scene;
  private readonly ancho: number;

  private maximo = 1;
  private actual = 1;
  /** Valor que se muestra con retraso: el tramo entre este y `actual` es el dano reciente. */
  private mostrado = 1;
  private visibleHasta = -Infinity;
  private tweenRetraso?: Phaser.Tweens.Tween;

  /** Tiempo que permanece visible tras el ultimo dano (ms). */
  private static readonly PERMANENCIA_MS = 2400;
  private static readonly ALTO = 3;

  constructor(escena: Phaser.Scene, ancho = 18) {
    this.escena = escena;
    this.ancho = ancho;

    this.grafico = escena.add.graphics();
    this.grafico.setDepth(45);
    this.grafico.setVisible(false);
  }

  /** Llamar cuando cambie la vitalidad. Hace visible la barra. */
  registrar(actual: number, maximo: number): void {
    const primeraVez = this.visibleHasta === -Infinity;

    this.maximo = Math.max(1, maximo);
    this.actual = Math.max(0, actual);
    this.visibleHasta = this.escena.time.now + BarraVida.PERMANENCIA_MS;
    this.grafico.setVisible(true);

    if (primeraVez) {
      // La primera vez no hay "antes" que mostrar: arranca ya en el valor real.
      this.mostrado = this.actual;
      return;
    }

    // El tramo claro se vacia despacio hasta alcanzar el valor real.
    this.tweenRetraso?.remove();
    this.tweenRetraso = this.escena.tweens.addCounter({
      from: this.mostrado,
      to: this.actual,
      duration: 380,
      delay: 120,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        this.mostrado = tween.getValue() ?? this.actual;
      },
    });
  }

  /** Llamar cada fotograma con el punto sobre el que debe flotar. */
  actualizar(x: number, y: number): void {
    if (!this.grafico.visible) return;

    const ahora = this.escena.time.now;
    if (ahora >= this.visibleHasta) {
      this.grafico.setVisible(false);
      return;
    }

    // Se desvanece en el ultimo tramo de su permanencia.
    const restante = this.visibleHasta - ahora;
    this.grafico.setAlpha(Phaser.Math.Clamp(restante / 500, 0, 1));

    this.dibujar(Math.round(x - this.ancho / 2), Math.round(y));
  }

  private dibujar(x: number, y: number): void {
    const g = this.grafico;
    const alto = BarraVida.ALTO;
    const proporcion = Phaser.Math.Clamp(this.actual / this.maximo, 0, 1);
    const proporcionRetraso = Phaser.Math.Clamp(this.mostrado / this.maximo, 0, 1);

    g.clear();

    // Fondo y borde.
    g.fillStyle(0x1d1418, 1);
    g.fillRect(x - 1, y - 1, this.ancho + 2, alto + 2);

    // Dano reciente: mas claro, se va vaciando.
    if (proporcionRetraso > proporcion) {
      g.fillStyle(0xe8d9a0, 1);
      g.fillRect(x, y, Math.round(this.ancho * proporcionRetraso), alto);
    }

    // Vida que queda.
    g.fillStyle(0x8c2f2f, 1);
    g.fillRect(x, y, Math.round(this.ancho * proporcion), alto);
  }

  /** Al morir el enemigo la barra no tiene nada que decir. */
  ocultar(): void {
    this.tweenRetraso?.remove();
    this.grafico.setVisible(false);
  }

  destruir(): void {
    this.tweenRetraso?.remove();
    this.grafico.destroy();
  }
}
