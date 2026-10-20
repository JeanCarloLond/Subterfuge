import { defineConfig } from 'vitest/config';

/**
 * Tests unitarios (`npm test`).
 *
 * Corren en Node, sin navegador: prueban la logica que no depende de Phaser
 * (guardado, ajustes, memoria del portal, integridad del lore, utilidades de
 * la web). Lo que necesita el motor se prueba jugando y con
 * `npm run probar-tactil`.
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/preparar.ts'],
  },
});
