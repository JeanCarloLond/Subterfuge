import { describe, expect, it } from 'vitest';
import {
  COMPONENTES,
  TIPOS,
  ayuda,
  validarCabecera,
  validarMensaje,
} from '../scripts/convencion.mjs';

/**
 * La convencion de commits (#179). Si el validador deja pasar lo que no debe,
 * la historia deja de leerse; si rechaza lo que esta bien, nadie puede
 * commitear y acaban saltandose el hook.
 */
describe('Convencion de commits', () => {
  it('acepta la forma buena, con uno o dos componentes', () => {
    expect(validarCabecera('✨ feat(juego): la niña sigue al Cirujano')).toEqual([]);
    expect(validarCabecera('🐛 fix(ui,juego): la E llega al umbral de la Galería')).toEqual([]);
    expect(validarCabecera('♻️ refactor(tecnico)!: el guardado cambia de forma')).toEqual([]);
  });

  it('el selector de variacion del emoji es opcional', () => {
    expect(validarCabecera('♻ refactor(tecnico): separa la Marea en dos módulos')).toEqual([]);
  });

  it('cada tipo tiene su gitmoji, y no otro', () => {
    expect(validarCabecera('🐛 feat(juego): la niña sigue al Cirujano')).not.toEqual([]);
  });

  it('rechaza tipos, componentes y formas que no existen', () => {
    expect(validarCabecera('✨ feature(juego): la niña sigue al Cirujano')).not.toEqual([]);
    expect(validarCabecera('✨ feat(Juego): la niña sigue al Cirujano')).not.toEqual([]);
    expect(validarCabecera('✨ feat(gameplay): la niña sigue al Cirujano')).not.toEqual([]);
    expect(validarCabecera('feat(juego): la niña sigue al Cirujano')).not.toEqual([]);
    expect(validarCabecera('La niña sigue al Cirujano')).not.toEqual([]);
    expect(validarCabecera('✨ feat(juego,ui,web): la niña sigue al Cirujano')).not.toEqual([]);
  });

  it('pide una descripcion de verdad, sin punto final y que quepa', () => {
    expect(validarCabecera('✨ feat(juego): niña')).not.toEqual([]);
    expect(validarCabecera('✨ feat(juego): la niña sigue al Cirujano.')).not.toEqual([]);
    expect(validarCabecera(`✨ feat(juego): ${'x'.repeat(80)}`)).not.toEqual([]);
  });

  it('no comprueba lo que escribe Git', () => {
    expect(validarCabecera("Merge branch 'main' into rama")).toEqual([]);
    expect(validarCabecera('fixup! ✨ feat(juego): la niña sigue')).toEqual([]);
  });

  it('el cuerpo va tras una linea en blanco, y los comentarios de Git no cuentan', () => {
    const bien = '✨ feat(juego): la niña sigue al Cirujano\n\nCloses #157\n# comentario';
    expect(validarMensaje(bien)).toEqual([]);
    expect(validarMensaje('✨ feat(juego): la niña sigue al Cirujano\nCloses #157')).not.toEqual(
      [],
    );
  });

  it('la ayuda nombra todos los tipos y componentes', () => {
    const texto = ayuda();
    for (const tipo of Object.keys(TIPOS)) expect(texto).toContain(tipo);
    for (const componente of Object.keys(COMPONENTES)) expect(texto).toContain(componente);
  });
});
