# Guía de desarrollo — Subterfuge

Documentación técnica del teaser. Para la descripción del proyecto y del universo,
ver el [README](../README.md).

## Stack

| Componente | Elección | Notas |
|---|---|---|
| Motor | **Phaser 3.90.0** | Fijado a 3.x a propósito (ver más abajo) |
| Lenguaje | TypeScript | |
| Bundler | Vite 8 | |
| Física | Arcade Physics | Suficiente para plataformas; Matter.js solo si el combate lo exige |
| Mapas | Tiled (`.tmj`) | Entra en Fase 2 |

### Por qué Phaser 3 y no Phaser 4

`npm install phaser` instala hoy Phaser **4.x**, que es un salto mayor con API
distinta y mucha menos documentación, tutoriales y ejemplos que Phaser 3. La
propuesta técnica especifica 3.90.0 y el equipo va a aprender el stack, así que la
dependencia está **fijada a `^3.90.0`**. No actualizar a 4 sin una migración
planificada.

### `@types/phaser` NO se instala

Phaser 3 incluye sus propias definiciones de tipos en `node_modules/phaser/types/`.
El paquete `@types/phaser` de DefinitelyTyped está obsoleto y provoca conflictos.
La propuesta técnica se equivoca en ese punto.

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo con hot-reload
npm run build    # comprobación de tipos + build de producción en dist/
npm run preview  # sirve el build de producción
```

## Estructura

```
src/
  main.ts                        Configuración del juego y registro de escenas
  style.css
  config/
    Sacramento.ts                Constantes de diseño (movimiento, dash, agarre, Fervor)
  input/
    Controles.ts                 Mapa de entrada centralizado
  entities/
    CirujanoSacerdote.ts         Personaje jugable: locomoción y físicas
  scenes/
    BootScene.ts                 Arranque mínimo
    PreloadScene.ts              Carga de assets + placeholders generados por código
    AtrioScene.ts                Nivel 1: el Atrio
public/assets/
  tilesets/  sprites/  audio/  maps/
docs/
  DESARROLLO.md                  Este archivo
  Propuesta-inicial.md           Propuesta técnica original
  Subterfuge-world-bible.docx    Biblia del universo
  issues/                        Encargos de arte listos para publicar
  arte/                          Paleta y guía de estilo (pendiente)
scripts/
  crear-issues.ps1               Publica docs/issues/*.md como issues de GitHub
```

## Flujo de escenas

```
Boot ──► Preload ──► Atrio
```

- **Boot**: arranque mínimo, sin carga pesada.
- **Preload**: carga de assets y barra de progreso. Hoy genera *placeholders* por
  código (rectángulos de color) porque aún no hay arte.
- **Atrio**: el primer nivel. Geometría provisional por código; en Fase 2 se
  sustituye por un tilemap de Tiled.

## Estado actual — Fase 1 (Prototipo)

Implementado:

- [x] Movimiento horizontal con aceleración/fricción diferenciada en suelo y aire
- [x] Salto con **coyote time** (90 ms) y **buffer de salto** (120 ms)
- [x] Salto variable (soltar el botón recorta la altura)
- [x] Doble salto (deliberadamente más débil: el Cirujano es técnico, no acróbata)
- [x] Dash con **i-frames** (160 ms de dash, 130 ms de invulnerabilidad)
- [x] Agarre de bordes y trepado
- [x] Cámara con seguimiento suave y deadzone

Pendiente (Fase 2 en adelante):

- [ ] Tilemap de Tiled para el Atrio
- [ ] Combate cuerpo a cuerpo, ataque cargado y parry
- [ ] Fervor como recurso gastable (hoy solo existe como constante)
- [ ] Poción de Carne
- [ ] Altares (checkpoints)
- [ ] Fragmentos del Códice de la Carne
- [ ] Enemigos y jefe / evento narrativo
- [ ] Retirar el HUD de depuración de `AtrioScene`

## Controles

| Acción | Teclas |
|---|---|
| Mover | `A` / `D` o flechas |
| Saltar / doble saltar | `Espacio` o `Z` |
| Dash | `Shift` o `X` |
| Trepar (colgado) | `W` / flecha arriba |
| Soltarse (colgado) | `S` / flecha abajo |

## Convenciones

**Léxico del mundo.** El código usa el vocabulario de la Diócesis, no términos
genéricos de videojuego. Es *Fervor*, no "mana". Es *Poción de Carne*, no "health
potion". Es *Altar*, no "checkpoint". Esto aplica a nombres de clases, variables,
archivos y a cualquier texto visible.

**Regla de consistencia del universo.** Todos los Primigenios son **ciegos** — de
ahí el dogma *"los dioses no miran, son mirados"*. Conocen el mundo por tacto e
ingesta. Ninguna mecánica, diálogo, descripción o pieza de arte puede mostrar a un
Primigenio viendo o reaccionando visualmente a algo. Aplica también a iconografía,
relieves y vitrales.

**Arte sin IA.** Decisión del equipo: los sprites de personajes son pixel art hecho
a mano en Aseprite, sin excepción. Los *placeholders* actuales son rectángulos
generados por código y deben sustituirse por arte del equipo, nunca por imágenes
generadas.

## Servidores MCP configurados

Ambos son MIT y están dados de alta a nivel de proyecto:

| Servidor | Uso |
|---|---|
| `tiled` (`tiled-mcp-server`) | Inspeccionar y editar mapas `.tmx`/`.tmj` sin abrir Tiled. **Versión 0.0.2 — trátalo como experimental.** |
| `image-tiler` (`image-tiler-mcp-server`) | Analizar capturas de referencia grandes a resolución completa sin degradarlas |

Comprobar estado con `claude mcp list`.

## Encargos de arte

Los encargos viven en [`docs/issues/`](issues/) como Markdown con frontmatter.
Para publicarlos en GitHub:

```powershell
gh auth login              # una sola vez
.\scripts\crear-issues.ps1 -DryRun   # revisar qué se va a crear
.\scripts\crear-issues.ps1           # crearlos de verdad
```

Se crean **abiertos y sin asignar**.
