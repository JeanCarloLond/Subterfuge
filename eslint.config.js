import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Reglas de calidad del proyecto.
 *
 * `eslint-config-prettier` va SIEMPRE el último: desactiva las reglas de estilo
 * que chocarían con Prettier, para que formato y lógica no se peleen.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Código del juego: corre en el navegador.
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Un argumento sin usar con guion bajo delante es intencionado
      // (los callbacks de overlap de Phaser reciben parámetros que no usamos).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // El juego no debe dejar rastros por consola en producción; avisar por
      // pantalla de una textura mal formada sí es legítimo.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Utilidades de desarrollo: corren en Node y sí imprimen por consola.
  {
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },

  prettier,
);
