import Phaser from 'phaser';

/** Algo sobre lo que se habla: el sprite de quien dice la frase. */
type Hablante = Phaser.GameObjects.Sprite;

interface Bocadillo {
  texto: Phaser.GameObjects.Text;
  hasta: number;
}

/** Margen con el borde de la vista (px): la frase no se sale de la pantalla. */
const MARGEN = 6;
/** Encima de casi todo, pero debajo del HUD y de la vineta. */
const PROFUNDIDAD = 90;

/**
 * Frases sobre la cabeza que no paran el juego (#175).
 *
 * Una por hablante: si vuelve a hablar, la nueva sustituye a la anterior. Se
 * quedan el tiempo de leerlas (mas cuanto mas largas) y se apagan solas. Van
 * pegadas a quien habla, pero sin salirse de la vista: junto a un muro, la
 * frase se corre hacia dentro en vez de cortarse.
 */
export class Bocadillos {
  private readonly escena: Phaser.Scene;
  private readonly activos = new Map<Hablante, Bocadillo>();

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
  }

  decir(quien: Hablante, frase: string, color = '#d6cfc4'): void {
    this.callar(quien);
    const texto = this.escena.add
      .text(quien.x, quien.y, frase, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color,
        backgroundColor: '#0b090bcc',
        padding: { x: 3, y: 2 },
        align: 'center',
      })
      .setOrigin(0.5, 1)
      .setDepth(PROFUNDIDAD);
    const dura = 2200 + frase.length * 45;
    this.activos.set(quien, { texto, hasta: this.escena.time.now + dura });
    this.colocar(quien, texto);
  }

  /** Sigue a quien habla y apaga lo que ha durado bastante. */
  actualizar(): void {
    const ahora = this.escena.time.now;
    for (const [quien, bocadillo] of this.activos) {
      if (!quien.active || ahora >= bocadillo.hasta) {
        this.apagar(quien, bocadillo);
        continue;
      }
      this.colocar(quien, bocadillo.texto);
    }
  }

  callar(quien: Hablante): void {
    const bocadillo = this.activos.get(quien);
    if (!bocadillo) return;
    bocadillo.texto.destroy();
    this.activos.delete(quien);
  }

  private apagar(quien: Hablante, bocadillo: Bocadillo): void {
    this.activos.delete(quien);
    this.escena.tweens.add({
      targets: bocadillo.texto,
      alpha: 0,
      duration: 280,
      onComplete: () => bocadillo.texto.destroy(),
    });
  }

  private colocar(quien: Hablante, texto: Phaser.GameObjects.Text): void {
    const vista = this.escena.cameras.main.worldView;
    const mitad = texto.width / 2;
    const x = Phaser.Math.Clamp(
      quien.x,
      vista.left + MARGEN + mitad,
      Math.max(vista.left + MARGEN + mitad, vista.right - MARGEN - mitad),
    );
    // Encima de la cabeza: el sprite tiene el origen en los pies.
    const y = Math.max(vista.top + MARGEN + texto.height, quien.y - quien.displayHeight - 4);
    texto.setPosition(Math.round(x), Math.round(y));
  }
}
