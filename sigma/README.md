# Subterfuge Sigma

El remake de Subterfuge en **Godot 4.7**, con el lore nuevo: el templo se está
compactando. El canon está en [docs/canon.md](docs/canon.md).

> En construcción. Se enseña al equipo cuando haya una base sólida. Las tareas son las
> issues con la etiqueta
> [`sigma`](https://github.com/JeanCarloLond/Subterfuge/issues?q=label%3Asigma).

## Abrirlo

1. Instala [Godot 4.7](https://godotengine.org/download) (la versión estándar, no la de
   .NET). En Windows: `winget install GodotEngine.GodotEngine`.
2. En Godot: **Importar** → elige `sigma/project.godot`.
3. F5 para jugar. Con Espacio se entra en la sala de prueba del movimiento.

## Probarlo

Los tests están en `tests/` y corren sin abrir el editor y sin plugins:

```bash
godot --headless --path sigma --import              # la primera vez, o tras añadir archivos
godot --headless --path sigma -s res://tests/ejecutar.gd
```

Cada `tests/test_*.gd` extiende `tests/caso.gd`, y cada función `test_*` es un test. El
CI los pasa en cada push y cada PR.

## Cómo está hecho

| Carpeta    | Qué hay                                                              |
| ---------- | -------------------------------------------------------------------- |
| `escenas/` | Las escenas (`.tscn`).                                               |
| `scripts/` | El código. `sacramento.gd` tiene los números del original, tal cual. |
| `tests/`   | Los tests y su ejecutor.                                             |
| `docs/`    | El canon de Sigma.                                                   |

- **Resolución** lógica de 480×320, escalada a un múltiplo entero y con filtro nearest:
  pixel art nítido en cualquier pantalla.
- **Controles**: los mismos del original, registrados en `scripts/controles.gd`, con
  teclado, ratón y mando.
- **Los números** del Cirujano (salto, dash, agarre…) vienen de `src/config/Sacramento.ts`
  y no se cambian sin motivo: la sensación del juego está ajustada con ellos.
- **El movimiento** está en `scripts/movimiento.gd`, aparte del nodo: recibe lo que se
  pulsa y lo que se toca y devuelve la velocidad, así que se prueba sin física.
  `scripts/cirujano.gd` solo lee los controles y llama a `move_and_slide`.
- **La gravedad es 1000 de verdad**: el salto sube 92 px en continuo (88,9 a 60 Hz). En
  Phaser se sumaba dos veces y el salto real era de unos 43 px (#182).
- Los archivos `.uid` que crea Godot se suben; la carpeta `.godot/` no.

## Commits

La misma convención que el resto del repo, con el componente `sigma`:

```
✨ feat(sigma): el Cirujano salta con los números del original
```
