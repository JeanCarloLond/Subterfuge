# Estado del trabajo

> **Léelo antes de seguir.** Es el traspaso entre sesiones (de Claude o de quien sea): qué
> reglas mandan, qué está hecho, qué sigue y qué trampas ya se han pisado. Lo que no esté
> aquí ni en el repo, **no se da por hecho**: se comprueba (`git log`, `gh issue list`) o se
> pregunta. Última actualización: 23 de octubre de 2026.

## Reglas que no se discuten

- **Nada de coautorías de IA** en commits ni PR. Es rechazo inmediato para el equipo.
- **El arte es pixel art a mano, sin IA.** El provisional se escribe en código (en Sigma,
  también por poses de un esqueleto, `scripts/*-sigma.mjs`); el definitivo (Aseprite, de
  Mariana Echeverri) entra con el mismo nombre.
- **Los Primigenios son ciegos y nunca se muestran.** Nada dice que «miren» o «vean». La
  única excepción, decidida por Jean en #192: en Sigma, el cuerpo a medio formar detrás de
  la Puerta, al final.
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
  los últimos eslabones. Decidido: la niña **no es parte activa del juego**; solo se le
  aparece al Cirujano en **visiones**, desde que toca un artefacto en un laboratorio de
  Génesis Vestal mientras investiga la compactación; no ha nacido, por eso los eslabones no
  la atacan. El apodo es **el Último Sacramento**. Hay **dos finales**: la unión egoísta con
  la niña (fin de la carne) o el sacrificio de él, que acaba con ella. Decidido en #192 (Jean
  y Alejo): **la unión es el final canónico**; al Cirujano lo mueven la **duda** en el altar
  y el **hambre** (la carne deja de llegar); la niña es **perfecta** en las visiones y solo
  al final se la ve como es. **Sigma, por la desviación estándar.** **Abierto:** qué es el
  artefacto, cómo nota el jugador que solo él la ve, qué pide el final B y la niña del altar
  del original.
- **La dirección:** que se vea y se sienta como _Blasphemous_, con identidad propia de
  catedral-hospital. Jean aprobó el **rediseño del Cirujano** de Alejo (tres cuartos, hábito
  de hueso, mitra, cara vendada, carne y óxido) en lugar del médico de la peste del teaser.
- **Godot en la máquina de Jean:** instalado con winget en
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_*\`. Para la consola y
  los tests, el `Godot_v4.7.2-stable_win64_console.exe` (no hay alias en el PATH).
- **Comandos** (desde la raíz del repo):

  ```bash
  npm run sigma             # jugar (la portada es un menú)
  npm run sigma -- atrio    # directo a una escena
  npm run sigma:editor      # el editor de Godot
  npm run sigma:tests       # importar y pasar los tests
  ```

  `scripts/sigma.mjs` encuentra Godot solo (variable `GODOT`, PATH, winget o la app de macOS).

- **El CI** importa el proyecto y pasa los tests (job «Subterfuge Sigma (Godot)», obligatorio
  en `main`).

**Hecho:** #180 proyecto base (resolución 480×320 pixel-perfect, controles del original con
teclado y mando, los números del original en `scripts/sacramento.gd`). #181 el canon está
escrito; sigue abierto hasta que **Jean y Alejo lo lean**. #182 el Cirujano se mueve: la
lógica en `scripts/movimiento.gd` (sin física, probada paso a paso en
`tests/test_movimiento.gd`), el cuerpo en `escenas/cirujano.tscn` y una sala de prueba en
`escenas/sala_prueba.tscn` (se entra desde la portada con Espacio). Sin el clavado en
membranas todavía: llega con el bisturí.

**Decidido en #182: la gravedad es la de diseño, 1000.** En Phaser se aplica dos veces (la del
mundo en `main.ts` y la del cuerpo con `setGravityY`), así que allí cae con 2000 y el salto
real sube unos 43 px, no los 92 que dicen los comentarios y `verificar-rutas`. Sigma usa
1000 de verdad: a 60 Hz el salto sube 88,9 px y con el doble 150,7. Phaser no se toca
(congelado).

#185 el **Atrio** jugable de principio a fin: el trazado de Phaser redondeado a la rejilla de
16 px en un `TileMapLayer` con la sillería de agr-23 (`sigma/arte/silleria/`), un Devoto que
patrulla, persigue y avisa del golpe (aún no se le puede herir), los dos Altares (E reza,
cura y fija la vuelta), la caída al vacío y el umbral con el fin del prototipo. Se pasó con
`sigma/herramientas/importar_atrio.gd` **una sola vez**: desde entonces se edita en el
editor.

#186 la **compactación**: el ciclo en `sigma/scripts/compactacion.gd` (latido o cierre; nunca
se mueve sin avisar, y hay test de eso), los muros en `muro.gd` (empujan; si aplastan contra
la piedra cuestan 2 puntos y devuelven al Altar) y una sala de prueba
(`sala_compactacion.tscn`). El aviso son dos latidos, polvo y temblor; los sonidos se
calculan en `sonidos.gd`.

#189 un **techo que late** en el Atrio, bajo el segundo Altar: avisa y baja, pero deja 32 px
debajo, así que se aprende el aviso sin pagarlo.

#183 el **combate**: `sigma/scripts/combate.gd` (golpe con anticipación, cargado con Fervor,
arriba y abajo con rebote, parry de 140 ms, Poción de Carne), el Devoto se puede herir (8 de
vida) y el parry lo aturde 900 ms, pausa al conectar (hitstop) y una interfaz común
(`escenas/interfaz.tscn`). El Atrio tiene ya los cinco Devotos del original. La Injertadora va
aparte (#191): en el original se gana al vencer al primer jefe y aquí aún no hay jefe.

#184 el **arte**: `npm run sigma:arte` saca las figuras de `ArteProvisional.ts` a PNG
(`sigma/arte/provisional/`) y copia la sillería; el Cirujano (con ciclo de paso y estirar y
aplastar), los Devotos (dos variantes y sus poses), el Altar y el umbral ya usan ese arte. El
Atrio está **vestido** como en Phaser (`herramientas/vestir_atrio.gd`, corrido una vez):
telón de arcadas con parallax, atrezo lejano, decorado con vida, grietas y musgo, penumbra,
luz de velas, polvo y viñeta. Arreglado de paso un fallo viejo del lector de arte: la columna
y la cadena salían mal (también en la web).

**#192–#196, de Alejo** (revisadas, arregladas y fusionadas en orden el 22 de octubre): el
canon decidido; **640×360**; el Cirujano en tres cuartos con 19 animaciones; **contragolpe**
tras el parry y **ejecución** del aturdido (E); el doble salto y el dash se ganan con
**reliquias** (el Pulmón Vacío y el Tendón del Mil); colgarse es **clavar el bisturí con K**;
fondos grandes en capas (`nave.gd`); temblores de fondo; una **intro** de 30 s; música y voces
del original; fuentes góticas (OFL); interfaz con medallón; la piedra por vecinas
(`silleria.gd`) y la **Vestal**, que se vence devolviéndole el sello. Arreglado al revisar: el
contragolpe en un dash dejaba al Cirujano flotando. Una **propuesta de mapa** en
`sigma/docs/mapa.md`, por decidir.

**Las rondas de feedback de Jean** (22 y 23 de octubre), cada punto en su issue y cerrado:

- **Legibilidad:** un tema común (`arte/tema.tres`, VT323 16 con contorno) para toda la
  interfaz, con test que lo vigila (`test_letra.gd`); la narración de la intro en VT323 32.
- **Daño visible:** destello blanco, sangre y retroceso del Devoto al recibir (`herida.gd`).
- **Partida guardada** (`progreso.gd`): rezar guarda; la portada ofrece «Continuar».
- **Muerte a lo Dark Souls:** el cuerpo se desploma y sale «Diezmado» (`MUERTE` en
  `sacramento.gd`). La **deuda de carne** de Alejo (#211): la carne queda donde murió y,
  mientras no se recupera, el Fervor no pasa de 70.
- **Portada:** logo tipográfico provisional con una σ en medallón (`logo.gd`, #201 abierta
  hasta que Jean lo vea), **sin lema**, por decisión de Jean.
- **Música:** «Dark souls type boss theme» de ProjectHelmet (**CC-BY 4.0, el crédito es
  obligatorio**) en la portada y la intro; «Dark Shrine Loop» en el Atrio con fundido de 4 s;
  «Cathedral in the forest» guardada para el siguiente nivel. Créditos en
  `sigma/audio/LICENCIAS.md`.
- **Sonidos** (`efectos.gd`, Kenney CC0): pasos, salto, caída, tajo, golpe, parry y trago.
- **Por qué lo atacan** (en el canon): la ley de la Mano que mira, la mentira de la niña y la
  verdad de que la ley era una salvaguarda. Frases sobre la cabeza (`bocadillo.gd`).
- **Solo se clava en la membrana** (capa `Membranas`, grupo `clavable`), no en cualquier pared.
- **Aplastado se muere**, y caer al vacío cuesta 2. El techo que late **lleva a una nota**
  escondida (las notas: `nota.gd`, se leen con E y pausan).
- **La carga del golpe se ve** cuando hay Fervor para soltarla.
- **Las ofrendas** (#212): el Devoto y la Vestal sueltan carne (cura) o sello (Fervor) con
  las probabilidades del original; el injerto espera a la Injertadora.
- **#210 y #211, de Alejo:** primeros planos en la intro, luz que modela con normales y el
  Atrio vivo. Arreglado al revisar: la E ejecutaba y tomaba la reliquia a la vez
  (`_e_ejecuto_en` en el Cirujano).
- **El rostro del Cirujano** (#199): la máscara ciega con un solo ojo abierto, la Mano que
  mira. Lo hacen Jean y Alejo.

**El arranque, decidido por Jean el 23 de octubre** (en `sigma/docs/mapa.md` y el canon):
el Nivel I de bajada hasta el **Cegado**, Génesis Vestal y sus tres registros, el
laboratorio **antes** del primer guardián (el **Prior del Diezmo**, que suelta la
Injertadora), las reliquias repartidas (Pulmón en el III, Tendón en el IV), los
**objetivos** (de la niña desde la primera visión), los **diálogos a lo Stardew Valley** y
**sierras o rayos** en las salas sin enemigos. Hecho: #215 objetivos, #216 diálogos y el
Cegado, #217 sierras y rayos (y la «Sala de los peligros»), #218 el **Nivel I** en ocho
salas (`escenas/nivel1/`, creadas una vez con `herramientas/crear_nivel_1.gd`; ahora se
editan en el editor). «Empezar» va ya al Pabellón N.º 7; el Atrio con reliquias queda como
demostración.

**Presentación de Sigma** para los compañeros y el profesor, en el tono de la conversación:
https://claude.ai/artifact/Baab66uQRQbBX6qXmFtW91 (privada hasta que Jean la comparta).

**Lo siguiente, en orden:**

1. #185 sigue abierta hasta que **Jean y Alejo comparen** el Atrio de Sigma con el de Phaser y
   anoten qué se siente mejor y qué peor (en la issue).
2. **Decidir el mapa** (`sigma/docs/mapa.md`) antes de rehacer niveles, y rehacer el Atrio a
   640×360: el salto al nicho del Tendón aterriza 4 px pasado el borde; la caja de 10×22 se
   queda corta con un sprite de 50 px.
3. Que Jean juegue el Nivel I y diga qué cambia. Después, el **Nivel II** del plano: #190
   los Pasillos (con el primer cierre), los tres registros de Génesis, el laboratorio y la
   primera visión (#188) y el Prior del Diezmo (#219), que suelta la Injertadora (#191; las
   ofrendas ya sortean el injerto con `con_injertadora`).
4. El nombre del Cegado (abierto en el canon: Casiano, Ulpiano).
5. Vestir las salas de prueba y los niveles que lleguen como el Atrio, y el arte de Mariana
   cuando se le cuente (el flujo de `.aseprite` está en `sigma/README.md`).
6. #187 los eslabones, #188 las visiones de la niña.

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
- **La gravedad de Arcade se suma:** la del mundo más la del cuerpo. En Phaser el Cirujano cae
  con 2000 (ver #182). En Godot, `movimiento.gd` pone la suya y no usa la del proyecto.
- **Guardar una escena desde un script** con `PackedScene.pack` necesita instanciarla con
  `GEN_EDIT_STATE_INSTANCE`: si no, las instancias se guardan con todas sus propiedades
  copiadas y dejan de seguir a su escena original.
- **Leer código con expresiones regulares pierde casos**: el lector de `ArteProvisional.ts` no
  entendía `.fill('...').slice(...)` ni `.map(...)`, y la columna y la cadena salían mal en la
  web durante meses. Ahora evalúa las filas como JS en `node:vm`.
- **PR apiladas con squash**: al fusionar la de abajo, las de encima siguen llevando sus
  commits viejos. Para cada una: `git rebase --onto origin/main <punta vieja de la de abajo>`,
  **cambiar primero la base a `main`** (`gh pr edit N --base main`) y después subir con
  `--force-with-lease`. Al revés, el CI corre dos veces, una se cancela y GitHub bloquea la
  fusión hasta relanzarla.
- **Push con 403 desde un worktree**: el gestor de credenciales de git puede coger otra
  cuenta. `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push`.
- **`ahora - (-INF)` es infinito**: un «desde cuándo» sin empezar (`-INF`) da por cumplida
  cualquier espera. Pasó con la carga del golpe: soltar sin haber cargado sacaba el cargado.
  Comprobar que el inicio existe antes de restar.
- **La pausa al conectar para el tiempo** (`Engine.time_scale = 0`): los pasos de física
  siguen llegando, pero con delta 0. En un script de prueba que cuenta fotogramas, pulsar
  durante esa pausa no hace nada.
- **`MainLoop._physics_process` devuelve `bool`** en un script de `-s`: sin `-> bool` y
  `return false` no compila.
- **Python con heredoc en Windows** rompe tildes y barras: escribir los scripts con la
  herramienta Write en el scratchpad y ejecutarlos.
- **Git Bash reescribe rutas** que empiezan por `/`: `MSYS_NO_PATHCONV=1` si hace falta.
- **Pruebas en Chrome headless:** el banco está en el scratchpad (`ataque.mjs` con pasos
  separados por `;;` y `SHOT:nombre`). `?tactil` expone `window.juego`, `?nivel=2` empieza en
  el Desagüe, `?cinematica` va al cierre. Para mover al Cirujano, `sprite.body.reset(x, y)`;
  para cerrar diálogos o pausa, parar esas escenas desde el código, no con Escape.
- **Godot:** los `.uid` se suben; `sigma/.godot/` no. Los tests no usan `class_name`
  (heredan por ruta) para no depender de la caché de clases.
- **Un test que revienta no fallaba:** el ejecutor de Sigma no veía los errores de script. Ahora
  `tests/ejecutar.gd` registra un `Logger` (`OS.add_logger`) y cualquier error hace fallar.
- **La física va antes que `_process`:** la E que empieza una ejecución en `_physics_process`
  la leía después un Altar o una reliquia en `_process`, y hacía las dos cosas. El Cirujano
  apunta el fotograma (`_e_ejecuto_en`) y los demás lo miran con `puede_ejecutar()`.
- **Worktrees en el scratchpad:** `git -c core.longpaths=true` o «could not write index».
  Y nada de `git stash push -- rutas` en mitad de un rebase: se llevó lo ya preparado de esas
  rutas.
- **Clavarse es una vez por salto**: el Cirujano se clava una sola vez hasta volver a pisar
  suelo, y desde ahí trepa unos 45 px. Una pared de membrana larga **no se sube**; lo que se
  sube es un canto de hasta ~137 px (salto, clavarse, trepar), y solo si encima de su arista
  hay dos tiles libres también en la columna de al lado. El primer Pozo los tenía tapados
  por el tramo de arriba; `test_nivel_1.gd` lo vigila ahora.
- **`Input.is_action_just_pressed` sigue siendo cierto** en el fotograma de la pulsación aunque
  se suelte la acción (Godot 4.3+): la E que cierra un panel lo volvía a abrir. La interfaz
  apunta el fotograma en que cierra y en él no abre nada.
- **Un script de prueba con `change_scene_to_file`**: `current_scene` es null unos fotogramas;
  esperar a que exista antes de tocar la sala.
