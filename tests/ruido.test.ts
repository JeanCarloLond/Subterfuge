import { describe, expect, it } from 'vitest';
import { DESNIVEL_MAXIMO, seOye } from '../src/systems/Ruido';
import { RUIDO } from '../src/config/Sacramento';

/**
 * Lo que oye el Devoto vendado (#165). Si esto se rompe, o se le pasa por al
 * lado haciendo lo que sea, o se entera de todo y deja de ser un vendado.
 */
describe('Ruido', () => {
  const devoto = { x: 300, y: 288 };

  it('se oye dentro del radio, en el mismo suelo', () => {
    expect(seOye({ x: 300 + RUIDO.dash - 1, y: 288 }, devoto, RUIDO.dash)).toBe(true);
    expect(seOye({ x: 300 + RUIDO.dash + 1, y: 288 }, devoto, RUIDO.dash)).toBe(false);
  });

  it('el suelo de por medio se lo traga', () => {
    const arriba = { x: 300, y: 288 - DESNIVEL_MAXIMO - 1 };
    expect(seOye(arriba, devoto, RUIDO.golpe)).toBe(false);
  });

  it('un golpe se oye mas lejos que un dash, y andar no suena', () => {
    expect(RUIDO.golpe).toBeGreaterThan(RUIDO.dash);
    expect(Object.keys(RUIDO)).not.toContain('andar');
  });
});
