import { RESOLUCION } from '../config/Sacramento';
import { guardado } from '../systems/Guardado';
import { musica } from '../systems/Musica';
import { sonido } from '../systems/Sonido';
import { EscenaCierre } from './EscenaCierre';

/** Lo que pasa ante la Puerta. El texto definitivo llega con #171. */
const ANTE_LA_PUERTA = [
  'La Puerta del Cuerpo no se abre desde este lado.',
  'Ella ofrece la palma, y no baja los ojos.',
];

/**
 * Cierre del Nivel 2: la Puerta del Cuerpo (#156, #132).
 *
 * La huida no lleva a la superficie: lleva a la puerta de servicio del templo,
 * la unica que la Diocesis no vigila. El nivel acaba ante ella; lo de dentro
 * es el Vientre Profundo y no se juega. Aqui el descenso si termina, asi que
 * el guardado se borra y solo queda volver al Atrio.
 */
export class FinalNivel2Scene extends EscenaCierre {
  constructor() {
    super({ key: 'FinalNivel2' });
  }

  create(): void {
    this.empezarCierre();
    guardado.borrar();

    this.cameras.main.setBackgroundColor('#0b090b');
    this.cameras.main.fadeIn(900, 11, 9, 11);
    if (this.scene.isActive('Hud')) this.scene.stop('Hud');
    if (this.scene.isActive('Tactil')) this.scene.stop('Tactil');
    sonido.ambienteApagado();
    musica.poner('final');

    // Se llega andando, no saltando una cinematica: basta un respiro para que
    // la tecla con la que se cruzo el umbral no elija ya una salida.
    this.listoDesde = performance.now() + 1200;

    const centroX = RESOLUCION.ancho / 2;
    const texto = (y: number, linea: string, tamano: string, color: string) =>
      this.add
        .text(centroX, y, linea, {
          fontFamily: 'monospace',
          fontSize: tamano,
          color,
          align: 'center',
          lineSpacing: 6,
          wordWrap: { width: RESOLUCION.ancho - 80 },
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0);

    this.aparecer(texto(110, ANTE_LA_PUERTA.join('\n'), '10px', '#d6cfc4'), 700);
    this.aparecer(texto(168, 'SUBTERFUGE', '16px', '#8c2f2f'), 2000);
    this.aparecer(
      texto(186, 'Nivel 3 · El Vientre Profundo · al otro lado', '7px', '#8a7d70'),
      2400,
    );
    this.aparecer(texto(208, this.textoRecuento(2), '8px', '#6b5f55'), 2800);

    this.crearSalidas([{ etiqueta: 'Volver al Atrio', elegir: () => this.volverAlAtrio() }], 3600);
  }
}
