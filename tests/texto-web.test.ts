import { describe, expect, it } from 'vitest';
import { acentuar, html, parrafos } from '../web/src/texto';

/**
 * Utilidades de texto del portal. `html()` es lo que se interpone entre el
 * lore (y lo que escribe el visitante, como las claves) y el `innerHTML`.
 */
describe('html()', () => {
  it('escapa lo que podria romper el marcado', () => {
    expect(html('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('escapa el & primero, sin escapar dos veces', () => {
    expect(html('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });
});

describe('acentuar()', () => {
  it('devuelve las tildes que el texto del juego no lleva', () => {
    expect(acentuar('La nina entro sola')).toBe('La niña entró sola');
  });

  it('respeta mayusculas y no toca palabras ambiguas', () => {
    expect(acentuar('CODICE')).toBe('CÓDICE');
    expect(acentuar('Codice')).toBe('Códice');
    expect(acentuar('esta noche')).toBe('esta noche');
  });

  it('parrafos() acentua y escapa a la vez', () => {
    expect(parrafos(['La nina <dijo> algo'])).toBe('<p>La niña &lt;dijo&gt; algo</p>');
  });
});
