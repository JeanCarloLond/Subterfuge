import Phaser from 'phaser';

/**
 * Lo que se ve en el aire cuando ataca un enemigo (issue #146).
 *
 * Antes el ataque enemigo era un cambio de color: el jugador veia al Devoto
 * ponerse rojo y le llegaba el dano sin que nada saliera de su cuerpo. Aqui
 * viven los rastros del golpe: el tajo del brazo, las garras del Reformado y
 * el polvo de los pies. La pose (el cuerpo) la pone cada enemigo con sus
 * propios fotogramas; esto es solo lo que deja el golpe al pasar.
 *
 * Nunca en oro. El oro es el bisturi del Cirujano: si el tajo enemigo brillara
 * igual, el jugador no sabria de un vistazo quien ha golpeado a quien.
 */

/** Por debajo del tajo del Cirujano (58): si coinciden, manda el suyo. */
const PROFUNDIDAD = 57;

export interface OpcionesTajo {
  /** Hasta donde llega el arco, desde el hombro (px). */
  radio: number;
  /** Alto de la zona que hiere: abre o cierra el arco para que coincidan. */
  alto: number;
  color: number;
  duracionMs: number;
}

/**
 * Media luna que cae de arriba abajo por delante del enemigo: un golpe de
 * arriba, no un barrido. Sin hoja dentro, a diferencia de la del Cirujano: un
 * fiel golpea con lo que tiene pegado al cuerpo, no con una herramienta.
 */
export function tajoEnemigo(
  escena: Phaser.Scene,
  x: number,
  y: number,
  direccion: number,
  opciones: OpcionesTajo,
): void {
  const { radio, alto, color, duracionMs } = opciones;
  const apertura = Phaser.Math.Clamp(alto / radio, 0.6, 1.3);

  const arco = escena.add.graphics({ x, y }).setDepth(PROFUNDIDAD);
  arco.fillStyle(color, 0.28);
  arco.slice(0, 0, radio, -apertura, apertura, false);
  arco.fillPath();
  arco.lineStyle(2, color, 1);
  arco.beginPath();
  arco.arc(0, 0, radio, -apertura, apertura, false);
  arco.strokePath();

  // Empieza alto y detras del hombro, acaba bajo y delante: cae.
  arco.setScale(direccion * 0.6, 0.6);
  arco.setAngle(-50 * direccion);
  escena.tweens.add({
    targets: arco,
    scaleX: direccion,
    scaleY: 1,
    angle: 35 * direccion,
    // Se queda entero casi todo el barrido y se apaga al final: con el mismo
    // frenado que el giro, a los 80 ms ya no se veia.
    alpha: { value: 0, ease: 'Quad.easeIn' },
    duration: duracionMs,
    ease: 'Cubic.easeOut',
    onComplete: () => arco.destroy(),
  });
}

/**
 * Tres zarpas paralelas que bajan en diagonal por delante. Es el golpe del
 * Reformado: lo que tiene por mano son unas, y se tienen que contar.
 */
export function garras(
  escena: Phaser.Scene,
  x: number,
  y: number,
  direccion: number,
  color: number,
  duracionMs: number,
): void {
  const zarpas = escena.add.graphics({ x, y }).setDepth(PROFUNDIDAD);
  // Cada zarpa es una cuna: gruesa arriba, afilada abajo, un poco curvada.
  for (let i = 0; i < 3; i += 1) {
    const dx = (i - 1) * 7;
    const dy = (i - 1) * -3;
    zarpas.fillStyle(color, 1);
    zarpas.beginPath();
    zarpas.moveTo(dx - 7, dy - 14);
    zarpas.lineTo(dx - 3, dy - 15);
    zarpas.lineTo(dx + 5, dy + 2);
    zarpas.lineTo(dx + 8, dy + 15);
    zarpas.lineTo(dx + 2, dy + 3);
    zarpas.closePath();
    zarpas.fillPath();
  }

  // Aparecen de golpe y se estiran hacia abajo mientras se apagan.
  zarpas.setScale(direccion, 0.4);
  escena.tweens.add({
    targets: zarpas,
    scaleY: 1.05,
    y: y + 4,
    alpha: { value: 0, ease: 'Quad.easeIn' },
    duration: duracionMs,
    ease: 'Cubic.easeOut',
    onComplete: () => zarpas.destroy(),
  });
}

export interface OpcionesPolvo {
  color?: number;
  cantidad?: number;
  /** Si se da, el polvo sale hacia atras de esa direccion (un pie que empuja). */
  direccion?: number;
}

/** Una nube corta a ras de suelo: un pie que planta, un cuerpo que cae. */
export function polvo(
  escena: Phaser.Scene,
  x: number,
  y: number,
  opciones: OpcionesPolvo = {},
): void {
  const { color = 0x8a7a66, cantidad = 6, direccion } = opciones;
  const angulo =
    direccion === undefined
      ? { min: 190, max: 350 }
      : direccion > 0
        ? { min: 185, max: 225 }
        : { min: 315, max: 355 };

  const nube = escena.add.particles(x, y - 1, 'chispa-placeholder', {
    speed: { min: 18, max: 48 },
    angle: angulo,
    lifespan: { min: 220, max: 380 },
    scale: { start: 1.6, end: 0.4 },
    alpha: { start: 0.8, end: 0 },
    gravityY: -20,
    tint: color,
    emitting: false,
  });
  nube.setDepth(PROFUNDIDAD - 1);
  nube.explode(cantidad);
  escena.time.delayedCall(420, () => nube.destroy());
}
