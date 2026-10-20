# Cómo trabajar en Subterfuge

Reglas cortas para que `main` se pueda jugar siempre.

## El flujo

1. Cada cambio sale de una **issue**. Si no la hay, se crea primero.
2. Una **rama** por cambio: `git checkout -b nivel2/geometria`.
3. Antes de subir:

   ```bash
   npm run verificar
   ```

   Es lo mismo que corre el CI: formato, lint, tipos, **tests**, las
   verificaciones del juego y el build. Si pasa en local, pasa allí.

4. Un **PR** contra `main`, con la plantilla rellena y `Closes #N` si cierra la
   issue. Si la deja a medias, `Refs #N` y un comentario en la issue con lo que
   falta.

## Tests

Hay tests unitarios con [Vitest](https://vitest.dev) en `tests/`. Corren en
Node, sin navegador, en menos de un segundo:

```bash
npm test             # una vez
npm run test:vigilar # se repiten al guardar
```

**Si tu PR toca lógica que se puede probar sin Phaser, tiene que traer su
test.** Son los archivos de:

- `src/systems/` (guardado, ajustes, progreso, memoria…)
- `src/input/` (controles, mando, toques)
- `web/src/*.ts` (los módulos del portal, no sus páginas)

El CI lo comprueba en cada PR (`scripts/exigir-tests.mjs`). Si de verdad no hace
falta test (un refactor que no cambia nada, un comentario), pon la etiqueta
**`sin-tests`** en el PR y explica por qué en la descripción.

Las escenas y las entidades necesitan el motor y no se piden: se prueban
jugando, con `npm run verificar-rutas` y con `npm run probar-tactil`.

### Escribir un test

Mira `tests/guardado.test.ts`: importa el módulo, haz lo que haría el juego y
comprueba el resultado. Lo que el navegador da y Node no (`localStorage`,
`matchMedia`) ya está preparado en `tests/preparar.ts` y se vacía entre tests.

Un buen test falla si rompes el código que prueba. Compruébalo una vez:
estropea a propósito la línea que cubre y mira que se ponga en rojo.

## Arte, textos y canon

- **Sin IA en el arte.** El provisional es pixel art escrito a mano en código
  (`src/systems/ArteProvisional.ts`); el definitivo, de Aseprite, entra con la
  misma clave de textura.
- **Léxico del mundo** en todo lo que se lee en pantalla: Altar, sacramento,
  diezmo, Fervor, Poción de Carne… Nunca «checkpoint», «HP», «boss» ni «mana».
  `npm run verificar-textos` lo comprueba, y también las tildes.
- **Los Primigenios son ciegos.** Nada dice que «miren» o «vean».
- El canon de la fase 4 está en [docs/canon/](docs/canon/); la biblia del
  mundo, en `docs/`.

## Más

- [README](README.md): qué es, cómo se juega y cómo se levanta.
- [docs/](docs/README.md): toda la documentación, por tema.
