import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/**
 * Configuración de Vite.
 *
 * `base` decide desde qué ruta se piden los archivos del juego, y cambia según
 * dónde se publique:
 *
 *   - local y por defecto  -> '/'              (http://localhost:5173/)
 *   - GitHub Pages         -> '/Subterfuge/'   (el repo cuelga de un subdirectorio)
 *   - itch.io              -> './'             (rutas relativas dentro del zip)
 *
 * Se controla con la variable BASE_URL para no tener que tocar este archivo:
 *
 *   BASE_URL=/Subterfuge/ npm run build   # lo que hace el workflow de Pages
 *   BASE_URL=./ npm run build             # para empaquetar y subir a itch.io
 */
export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  build: {
    // Dos paginas en un solo despliegue: el juego en la raiz y la web de la
    // Diocesis en /web/. Comparten dominio a proposito: la web lee del
    // localStorage lo que el jugador descubrio bajando (ver src/systems/Memoria.ts).
    rollupOptions: {
      input: {
        juego: fileURLToPath(new URL('./index.html', import.meta.url)),
        diocesis: fileURLToPath(new URL('./web/index.html', import.meta.url)),
      },
    },
    // Phaser entero son ~1,2 MB y va en un único chunk a propósito: partirlo
    // no acelera nada aquí, porque el juego necesita el motor completo antes
    // de mostrar el primer fotograma.
    chunkSizeWarningLimit: 1600,
  },
});
