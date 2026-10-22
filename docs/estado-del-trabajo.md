# Estado del trabajo

> **Léelo antes de seguir.** Es el traspaso entre sesiones (de Claude o de quien sea): qué
> reglas mandan, qué está hecho, qué sigue y qué trampas ya se han pisado. Lo que no esté
> aquí ni en el repo, **no se da por hecho**: se comprueba (`git log`, `gh issue list`) o se
> pregunta. Última actualización: 22 de octubre de 2026.

## Reglas que no se discuten

- **Nada de coautorías de IA** en commits ni PR. Es rechazo inmediato para el equipo.
- **El arte es pixel art a mano, sin IA.** El provisional se escribe en código; el
  definitivo (Aseprite, de Mariana Echeverri) entra con la misma clave.
- **Los Primigenios son ciegos y nunca se muestran.** Nada dice que «miren» o «vean».
- **Léxico del mundo** en lo que se lee: nunca «checkpoint», «HP», «boss», «mana», «NPC»
  ni «stamina». Lo visible lleva tildes; identificadores y comentarios, no.
- **Sin cruces cristianas** en el arte ni en los textos.
- **Solo herramientas libres y open source.**
- **No tocar los archivos locales de Jean** que no están en el repo: `docs/Subterfuge.docx`,
  `docs/Subterfuge.pdf`, los dos `.pptx` de `docs/presentacion/` y los borrados de
  `docs/entrega/*` y `docs/presentacion/*.pdf|.html`. Nunca se suben.
- **No pasar Prettier** por `docs/historico/propuesta-inicial.md` ni `docs/arte/encargos/`:
  son textos del equipo, tal como se escribieron.

## Cómo se trabaja

- **Personas:** JeanCarloLond (líder, admin, único revisor); Alejo (Alejandro Garcés, dev
  principal); agr-23 y Figs0203 (devs); Mariana Echeverri (arte).
- **Flujo:** cada cambio sale de una issue (asignada a JeanCarloLond) → se implementa → se
  comprueba → commit con `Closes #N` → `git pull --rebase --autostash` → push a `main`.
- **`main` está protegida.** Los demás devs entran por PR con la aprobación de
  JeanCarloLond (CODEOWNERS), el CI en verde y las conversaciones resueltas; se fusiona con
  squash. JeanCarloLond es admin y sube directo: así se trabaja en las sesiones con Claude.
- **Commits:** `<gitmoji> <tipo>(<componente>): <descripción>`, cabecera de **72 caracteres
  como mucho**. Tipos y componentes en `CONTRIBUTING.md` y `scripts/convencion.mjs`. El hook
  `.githooks/commit-msg` lo comprueba (se activa con `npm install`).
- **Antes de cada commit:** `npm run verificar` (formato, lint, tipos, tests, verificaciones
  del juego y build). Si se toca el juego Phaser, además `npm run probar-tactil` (necesita
  el preview en el puerto 4173: `npx vite preview --port 4173 --strictPort`).
- **Tests:** toda lógica nueva de `src/systems`, `src/input` o `web/src` trae su test en
  `tests/` (Vitest). Lo que necesita Phaser se separa en un módulo puro y se prueba ese.

## Subterfuge (Phaser): congelado en funciones nuevas

Desde el 22 de octubre de 2026 **no se le añaden funciones**: el trabajo nuevo va a Sigma.
Se arreglan fallos si aparecen. Está todo subido y en verde.

**Lo último hecho (Nivel 2, todo cerrado):**

- #156 estructura en tres zonas (Desagüe, Galería, Ductos) y cierre ante la Puerta.
- #160 sin bisturí y el conteo del instrumental; #157 la niña sigue tu rastro.
- #163 mareas por tramos; #165 Devoto vendado; #173 arreglo de la E en la Galería.
- #174 vida y pociones entre zonas; #175 frases sobre la cabeza; #176 charlas con la niña.
- #177 un fondo por zona; #178 la Injertadora se gana al vencer al primer jefe.
- #179 revisión obligatoria y convención de commits.
- #167 la Serpiente se vence con el parry; #161 trepar membranas; #166 guardia de la
  Cruzada; #164 cazarrecompensas con garfio; #162 persecuciones.

**Abierto y congelado:** #158 (la niña que mira), #159 (gateras), #168–#170 (contenido de las
tres zonas), #171 (textos y canon del Nivel 2), #172 (arte), y los antiguos de la fase 4
(#88, #99–#108, #116, #120–#122, #125, #126, #130–#132, #134). #155 (prueba con jugadores)
sigue pendiente del equipo.

## Subterfuge Sigma: el remake en Godot

- **Qué:** el juego en **Godot 4.7.2** (GDScript, versión estándar), con el **lore nuevo**.
  Vive en `sigma/` dentro de este repo; issues con la etiqueta `sigma`; componente `sigma` en
  los commits.
- **Quién lo sabe:** Jean y Alejo. No es secreto, pero **no se presenta** al profesor ni al
  resto del equipo hasta que haya una base sólida.
- **El lore nuevo** está en [`sigma/docs/canon.md`](../sigma/docs/canon.md): los dioses (ciegos;
  corazones, cerebros, estómagos) son el templo y se compactan para ser un solo sistema; la
  niña son sus ojos y manipula al Cirujano; él es el villano sin saberlo; los «enemigos» son
  los últimos eslabones. **Abierto:** el apodo del Cirujano, los finales (uno o varios) y por
  qué los eslabones no tocan a la niña.
- **Godot en la máquina de Jean:** instalado con winget en
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_*\`. Para la consola y
  los tests, el `Godot_v4.7.2-stable_win64_console.exe` (no hay alias en el PATH).
- **Comandos** (desde la raíz del repo):

  ```bash
  godot --headless --path sigma --import
  godot --headless --path sigma -s res://tests/ejecutar.gd
  ```

- **El CI** importa el proyecto y pasa los tests (job «Subterfuge Sigma (Godot)», obligatorio
  en `main`).

**Hecho:** #180 proyecto base (resolución 480×320 pixel-perfect, controles del original con
teclado y mando, los números del original en `scripts/sacramento.gd`, 8 tests). #181 el
canon está escrito; sigue abierto hasta que **Jean y Alejo lo lean**.

**Lo siguiente, en orden:**

1. #182 el Cirujano con `CharacterBody2D` y los números del original (salto 92 px, doble
   salto, dash 54 px con invulnerabilidad, agarre de un uso por salto, coyote, buffer, salto
   variable, daño por caída).
2. #183 combate: golpe, cargado, arriba/abajo con rebote, parry de 140 ms.
3. #184 arte: exportar las figuras provisionales a PNG (`scripts/exportar-arte.mjs` ya las
   saca a `web/generado`) e importarlas; flujo de Aseprite.
4. #185 prototipo del Atrio con TileMaps, para comparar la sensación con Phaser.
5. #186 la compactación (paredes que se mueven), #187 los eslabones, #188 la niña que guía.

## Trampas ya pisadas

- **Phaser `JustDown` consume la tecla** al leerla: leer la E en cada fotograma dejó sin E
  a toda una zona (#173). Leerla solo cuando hay algo a tiro.
- **Arcade se engancha en las juntas** entre tiles al moverse pegado a una pared: separar
  el cuerpo un píxel (#161).
- **El corte del salto variable** se comía cualquier impulso hacia arriba (trepar, salir de
  la pared): hay que eximirlos un momento (`sinCorteHasta`).
- **El origen de la caída empezaba en y=0** y costaba vida al entrar en algunas zonas: se
  inicializa donde aparece el Cirujano (#174).
- **Un enemigo dentro de la arena** se comía las escamas devueltas a la Serpiente: el nido es
  solo de ella (#167).
- **Python con heredoc en Windows** rompe tildes y barras: escribir los scripts con la
  herramienta Write en el scratchpad y ejecutarlos.
- **Git Bash reescribe rutas** que empiezan por `/`: `MSYS_NO_PATHCONV=1` si hace falta.
- **Pruebas en Chrome headless:** el banco está en el scratchpad (`ataque.mjs` con pasos
  separados por `;;` y `SHOT:nombre`). `?tactil` expone `window.juego`, `?nivel=2` empieza en
  el Desagüe, `?cinematica` va al cierre. Para mover al Cirujano, `sprite.body.reset(x, y)`;
  para cerrar diálogos o pausa, parar esas escenas desde el código, no con Escape.
- **Godot:** los `.uid` se suben; `sigma/.godot/` no. Los tests no usan `class_name`
  (heredan por ruta) para no depender de la caché de clases.
