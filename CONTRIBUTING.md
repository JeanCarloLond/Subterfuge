# Cómo trabajar en Subterfuge

Reglas cortas para que `main` se pueda jugar siempre.

## El flujo

1. Cada cambio sale de una **issue**. Si no la hay, se crea primero.
2. Una **rama** por cambio, con el tipo delante: `git checkout -b feat/nivel2-geometria`,
   `fix/umbral-galeria`.
3. **Commits con nombre** (ver abajo). Tras clonar, `npm install` activa el hook
   que lo comprueba al hacer `git commit`.
4. Antes de subir:

   ```bash
   npm run verificar
   ```

   Es lo mismo que corre el CI: formato, lint, tipos, **tests**, las
   verificaciones del juego y el build. Si pasa en local, pasa allí.

5. Un **PR** contra `main`, con la plantilla rellena y `Closes #N` si cierra la
   issue. Si la deja a medias, `Refs #N` y un comentario en la issue con lo que
   falta. El título de la PR sigue la misma convención que los commits.
6. **Revisión.** `main` está protegida: no se sube directo. Cada PR pide revisión
   al líder del proyecto (@JeanCarloLond, en `.github/CODEOWNERS`) y solo se
   fusiona con **su aprobación**, el **CI en verde** y las conversaciones
   resueltas. Si subes cambios después de aprobada, la aprobación se anula y hay
   que volver a pedirla. Se fusiona con **squash**: el título de la PR es el
   commit que queda en `main`.

## Commits

Cada commit (y cada título de PR) se nombra así:

```
<gitmoji> <tipo>(<componente>): <descripción>

✨ feat(juego): la niña sigue al Cirujano por el Nivel 2
🐛 fix(ui): la E vuelve a llegar al umbral de la Galería
📝 docs(repo): explica la convención de commits
```

- **El tipo dice qué clase de cambio es**, y cada uno lleva siempre el mismo
  gitmoji, para que la lista de commits se lea de un vistazo:

  | Gitmoji | Tipo       | Para                                                 |
  | ------- | ---------- | ---------------------------------------------------- |
  | ✨      | `feat`     | algo nuevo para quien juega o lee la web             |
  | 🐛      | `fix`      | arreglar un fallo                                    |
  | 📝      | `docs`     | solo documentación                                   |
  | 🎨      | `style`    | formato o estilo del código, sin cambiar lo que hace |
  | ♻️      | `refactor` | reordenar código sin cambiar lo que hace             |
  | ⚡️      | `perf`     | que vaya más rápido o gaste menos                    |
  | ✅      | `test`     | añadir o arreglar tests                              |
  | 👷      | `ci`       | el CI y sus comprobaciones                           |
  | 📦️      | `build`    | el build y las dependencias                          |
  | 🔧      | `chore`    | mantenimiento y configuración que no cambia el juego |
  | 🍱      | `assets`   | añadir o cambiar arte, audio u otros recursos        |
  | ⏪️      | `revert`   | deshacer un commit anterior                          |

- **El componente dice dónde**: `juego` (jugabilidad), `niveles` (diseño de
  niveles), `ui` (HUD, menús, diálogos), `lore` (textos y canon), `arte`,
  `audio`, `web` (el portal), `tecnico` (guardado, entrada, motor), `tests`,
  `ci`, `repo` (configuración, scripts, plantillas) y `docs`. Uno, o dos
  separados por coma (`fix(ui,juego): …`); si son más, son dos commits.
- **La descripción**, en español, dice qué cambia en una frase: sin punto final,
  y la cabecera entera en 72 caracteres como mucho.
- Un cambio que rompe algo (un guardado que deja de valer) lleva `!`:
  `♻️ refactor(tecnico)!: el guardado cambia de forma`.
- Debajo, tras una línea en blanco, el porqué si hace falta, y `Closes #N`.
- **Sin coautorías de IA** en los commits.

Las reglas viven en `scripts/convencion.mjs`, con sus tests. Si un commit no
pasa, el error dice qué falla y cómo se escribe. Para comprobar un mensaje a
mano: `npm run verificar-commit -- --titulo "✨ feat(juego): …"`.

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
