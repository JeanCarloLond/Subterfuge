import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Lo que el navegador da y Node no: un `localStorage` en memoria y un
 * `matchMedia` que nunca coincide. Se rehacen antes de cada test, asi que
 * ninguno hereda lo que guardo el anterior.
 */
class AlmacenEnMemoria implements Storage {
  private datos = new Map<string, string>();

  get length(): number {
    return this.datos.size;
  }
  clear(): void {
    this.datos.clear();
  }
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  key(indice: number): string | null {
    return [...this.datos.keys()][indice] ?? null;
  }
  removeItem(clave: string): void {
    this.datos.delete(clave);
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, String(valor));
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new AlmacenEnMemoria());
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
