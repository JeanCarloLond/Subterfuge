# Subterfuge Sigma

El remake de Subterfuge en **Godot 4.7**, con el lore nuevo: el templo se está
compactando. El canon está en [docs/canon.md](docs/canon.md).

> En construcción. Se enseña al equipo cuando haya una base sólida. Las tareas son las
> issues con la etiqueta
> [`sigma`](https://github.com/JeanCarloLond/Subterfuge/issues?q=label%3Asigma).

## Jugarlo

Hace falta [Godot 4.7](https://godotengine.org/download), la versión estándar (no la de
.NET). En Windows: `winget install GodotEngine.GodotEngine`; en macOS:
`brew install --cask godot`. Luego, desde la raíz del repo:

```bash
npm run sigma                # la portada: ↑↓ elige, Espacio entra
npm run sigma -- atrio       # directo a una escena de escenas/ (atrio,
                             # sala_prueba, sala_compactacion)
npm run sigma:editor         # el proyecto en el editor de Godot
npm run sigma:tests          # los tests
```

El script (`scripts/sigma.mjs`) encuentra Godot solo. Si lo tienes en otro sitio, pon su
ruta en la variable `GODOT`. En el juego, Esc vuelve a la portada.

**Lo que hay:**

- **El Atrio** (#185): el mismo trazado que en Phaser, con la sillería del equipo, los
  cinco Devotos, los dos Altares, un techo que late y el umbral del final.
- **El combate** (#183): J golpea (mantenido carga un golpe más fuerte que gasta 30 de
  Fervor), con ↑ o ↓ golpea hacia arriba o hacia abajo (en el aire, y al conectar rebota),
  K para el golpe enemigo si se pulsa a tiempo (140 ms) y Q bebe la Poción de Carne. El
  Fervor se gana golpeando y parando; los Altares llenan el frasco.
- **Lo de _Blasphemous_**: tras un parry, J en los 400 ms siguientes saca el
  **contragolpe** (se adelanta y pega como el cargado, sin gastar Fervor). El parado
  queda aturdido con un bisturí encima: con E se le **ejecuta** (alza el bisturí, la
  cámara se acerca, tajo y sangre), muere sea cual sea su vida y da 25 de Fervor.
- **La sala del movimiento** (#182): una repisa a cada altura que importa para el
  movimiento.
- **La sala de la compactación** (#186): un techo que late y un muro que empuja contra un
  pilar. Avisan antes de moverse (dos latidos, polvo, temblor) y, si aplastan, cuestan 2
  puntos y devuelven al Altar.

## Probarlo

Los tests están en `tests/` y corren sin abrir el editor y sin plugins:

```bash
godot --headless --path sigma --import              # la primera vez, o tras añadir archivos
godot --headless --path sigma -s res://tests/ejecutar.gd
```

Cada `tests/test_*.gd` extiende `tests/caso.gd`, y cada función `test_*` es un test. El
CI los pasa en cada push y cada PR.

## El arte

**El Cirujano** es el de Sigma, no el del original: en tres cuartos, de unos 50 px de
alto (lo que mide el Penitente de _Blasphemous_ a 640×360), con la cara vendada, la
paleta de carne y óxido y 53 fotogramas en 18 animaciones (reposo, carrera, salto,
caída, aterrizaje, dash, agarre, herido, rezar, guardia, golpe, cargado, arriba, abajo,
contragolpe, poción y ejecución). Cada golpe tiene aviso sostenido, un fotograma de
_smear_ (el arco del bisturí), impacto y recuperación.

No se dibuja cuadro a cuadro: `scripts/cirujano-sigma.mjs` describe cada fotograma como
una pose (cadera, inclinación, ángulos de los brazos, zancada) y pinta las piezas del
cuerpo píxel a píxel en esa pose, sin girar imágenes, así que no se emborronan. Luego
sombrea por bandas y contornea. Una animación nueva es una lista de poses:

```bash
npm run sigma:cirujano   # vuelve a sacar sigma/arte/cirujano/ (y hoja.png, para revisar)
```

Es provisional hasta que llegue el de Mariana: sus PNG pisan a estos con el mismo nombre
(`golpe-2.png`…). El lienzo es de 48×58 con la cadera en la columna 21 y los pies en la
fila 56.

El resto del arte es pixel art hecho a mano. Mientras llega el de Mariana, Sigma usa el arte
provisional del original: las figuras de `src/systems/ArteProvisional.ts`, escritas píxel a
píxel, y la sillería del equipo (`public/assets/tilesets/`).

```bash
npm run sigma:arte    # vuelve a sacar los PNG a sigma/arte/ si cambia el original
```

- `arte/provisional/<clave>.png`: una figura por pose, con el mismo nombre que su clave de
  textura en Phaser (`cirujano.png`, `cirujano-paso-a.png`, `devoto-alza.png`…).
- `arte/silleria/`: la piedra (`vientre.png`, ocho variantes de 16×16), las grietas (16×16)
  y el musgo (24×24), y el `TileSet` de Godot.

**Cómo entra un `.aseprite` de Mariana.** Godot no abre `.aseprite` por sí solo, así que
se exporta a PNG, una imagen por pose, con el nombre de la figura provisional a la que
sustituye:

```bash
aseprite -b cirujano.aseprite --save-as "sigma/arte/provisional/cirujano-{tag}.png"
```

Con los tags de Aseprite llamados como las poses (`paso-a`, `paso-b`, `guardia`, `bebe`…), cada
PNG pisa al provisional y el juego lo usa sin tocar código. El `.aseprite` se guarda en
`sigma/arte/fuentes/` para poder retocarlo. Dos cosas a respetar:

- **El lienzo**: el Cirujano mide 24×40 y el Devoto 22×34, con los pies en la fila de abajo.
  Si cambia el tamaño, cambia el `offset` de su `Sprite2D` (`escenas/cirujano.tscn`).
- **La paleta**: los colores del boceto del equipo, los mismos que la figura provisional.

Cuando haya animaciones de verdad (más cuadros por pose), el paso siguiente es el plugin
[Aseprite Wizard](https://github.com/viniciusgerevini/godot-aseprite-wizard) (libre, MIT),
que importa los tags como animaciones.

**Lo que no es arte sino ambiente**, y está en el motor: el telón de arcadas con parallax
(`scripts/telon.gd`), la luz de velas y Altares (`PointLight2D`), la penumbra del nivel, el
polvo, la viñeta (`arte/vineta.gdshader`) y el pulso de carne de los muros vivos.

## Cómo está hecho

| Carpeta         | Qué hay                                                              |
| --------------- | -------------------------------------------------------------------- |
| `escenas/`      | Las escenas (`.tscn`).                                               |
| `scripts/`      | El código. `sacramento.gd` tiene los números del original, tal cual. |
| `arte/`         | El arte: el provisional, la sillería, el `TileSet` y los shaders.    |
| `tests/`        | Los tests y su ejecutor.                                             |
| `herramientas/` | Scripts de un solo uso: pasar el Atrio de Phaser y vestirlo.         |
| `docs/`         | El canon de Sigma.                                                   |

- **Resolución** lógica de 640×360, la de _Blasphemous_, escalada a un múltiplo entero
  y con filtro nearest: pixel art nítido en cualquier pantalla (1080p es justo 3×). La
  interfaz y los velos van anclados a la pantalla, no a medidas fijas.
- **Controles**: los mismos del original, registrados en `scripts/controles.gd`, con
  teclado, ratón y mando.
- **Los números** del Cirujano (salto, dash, agarre…) vienen de `src/config/Sacramento.ts`
  y no se cambian sin motivo: la sensación del juego está ajustada con ellos.
- **El movimiento** está en `scripts/movimiento.gd`, aparte del nodo: recibe lo que se
  pulsa y lo que se toca y devuelve la velocidad, así que se prueba sin física.
  `scripts/cirujano.gd` solo lee los controles y llama a `move_and_slide`.
- **Los niveles van en rejilla de 16 px** con un `TileMapLayer` y se editan en el editor.
  El Atrio lo pasó `herramientas/importar_atrio.gd` una vez, redondeando el trazado de
  Phaser a la rejilla; no se vuelve a correr, porque pisaría lo pintado a mano.
- **Capas de colisión**: 1 el mundo, 2 el Cirujano, 3 los enemigos. Los cuerpos solo
  chocan con el mundo; el daño se resuelve con las cajas.
- **El combate** va como el movimiento: `scripts/combate.gd` es la lógica (ventanas,
  Fervor, cargado, parry, Poción), sin física; `cirujano.gd` resuelve los golpes contra los
  nodos del grupo `enemigos` y hace la pausa al conectar. `escenas/interfaz.tscn` es la
  interfaz de todas las salas.
- **La compactación**: `scripts/compactacion.gd` es el ciclo, sin física (latido: reposo,
  aviso, avance, cerrado, retroceso; o cierre: quieto hasta que se dispara y luego cerrado
  para siempre). `scripts/muro.gd` es el muro: piedra de la capa 1 que se pisa y se agarra.
  Los sonidos los calcula `scripts/sonidos.gd`, sin muestras, hasta que haya foley.
- **La gravedad es 1000 de verdad**: el salto sube 92 px en continuo (88,9 a 60 Hz). En
  Phaser se sumaba dos veces y el salto real era de unos 43 px (#182).
- Los archivos `.uid` que crea Godot se suben; la carpeta `.godot/` no.

## Commits

La misma convención que el resto del repo, con el componente `sigma`:

```
✨ feat(sigma): el Cirujano salta con los números del original
```
