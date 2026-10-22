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

## Cómo está hecho

| Carpeta         | Qué hay                                                              |
| --------------- | -------------------------------------------------------------------- |
| `escenas/`      | Las escenas (`.tscn`).                                               |
| `scripts/`      | El código. `sacramento.gd` tiene los números del original, tal cual. |
| `arte/`         | El arte del equipo que usa Sigma, y sus recursos de Godot.           |
| `tests/`        | Los tests y su ejecutor.                                             |
| `herramientas/` | Scripts de un solo uso, como el que pasó el Atrio de Phaser.         |
| `docs/`         | El canon de Sigma.                                                   |

- **Resolución** lógica de 480×320, escalada a un múltiplo entero y con filtro nearest:
  pixel art nítido en cualquier pantalla.
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
