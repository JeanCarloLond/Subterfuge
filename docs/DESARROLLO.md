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
npm run dev              # servidor de desarrollo con hot-reload
npm run build            # comprobación de tipos + build de producción en dist/
npm run preview          # sirve el build de producción
npm run verificar-rutas  # comprueba que todos los niveles se puedan desandar
```

### `verificar-rutas` — léelo antes de tocar un nivel

Comprueba que desde el fondo de cada nivel se pueda **volver a subir**. Es un
error fácil de cometer y difícil de ver leyendo datos: el Atrio se publicó con
tramos separados 432 px cuando el salto sube 92, y el jugador quedaba encallado
abajo sin forma de regresar.

La trampa está en el alcance horizontal. El salto sube 92 px, pero el tiempo que
el Cirujano pasa **por encima** de una altura `h` es `2·√(v²−2gh)/g`: subiendo
80 px son 0,32 s, o sea unos **41 px** de avance. Por eso los tramos de la ruta
de vuelta **solapan en x** en vez de separarse. Ejecuta el comando después de
cambiar la geometría de cualquier zona, o los valores de salto.

## Estructura

```
src/
  main.ts                        Configuración del juego y registro de escenas
  style.css
  config/
    Sacramento.ts                Constantes de diseño (movimiento, combate, Fervor…)
  input/
    Controles.ts                 Mapa de entrada centralizado
  systems/
    Vitalidad.ts                 Puntos de vida, daño y curación (jugador y enemigos)
    Fervor.ts                    Recurso de devoción
  entities/
    CirujanoSacerdote.ts         Personaje jugable: locomoción y combate
    Devoto.ts                    Enemigo del Atrio con IA de patrulla/persecución
  objetos/
    Altar.ts                     Punto de guardado
    FragmentoCodice.ts           Coleccionable de lore
    Impacto.ts                   Game feel: hitstop, sacudida, chispas, destellos
    ArteProvisional.ts           Pixel art de relleno escrito a mano en código
  ui/
    HudScene.ts                  HUD como escena paralela, alimentada por eventos
  scenes/
    BootScene.ts                 Arranque mínimo
    PreloadScene.ts              Carga de assets + placeholders generados por código
    EscenaNivel.ts               Lógica común a todos los niveles del descenso
    AtrioScene.ts                Zona 1: el Atrio (solo datos)
    PasillosScene.ts             Zona 2: Pasillos de Preparación (solo datos)
    FinalScene.ts                Cierre del teaser con gancho
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
Boot ──► Preload ──► Atrio ──► Pasillos ──► Final
                       │          │
                       └──────────┴──► Hud  (escena paralela)
```

### Añadir una zona nueva

`EscenaNivel` contiene toda la lógica (combate, altares, muerte, umbrales). Una
zona nueva **solo describe su contenido**:

```ts
export class SalasScene extends EscenaNivel {
  constructor() { super({ key: 'Salas' }); }

  protected definirNivel(): DefinicionNivel {
    return { mundo, colorFondo, inicio, plataformas, paredes,
             devotos, altares, fragmentos, umbral };
  }
}
```

Luego regístrala en `main.ts` y apunta el `umbral` de la zona anterior a su
clave. El descenso del Vientre continúa: Salas de Sacramento → Criptas de Espera
→ Niveles Reformados → Vientre Profundo. **Cada una debe ser más oscura, más
orgánica y más peligrosa que la anterior** — empezando por su `colorFondo`.

- **Boot**: arranque mínimo, sin carga pesada.
- **Preload**: carga de assets y barra de progreso. Hoy genera *placeholders* por
  código (rectángulos de color) porque aún no hay arte.
- **Atrio**: el primer nivel. Geometría provisional por código; se sustituye por un
  tilemap de Tiled cuando lleguen los tilesets.
- **Hud**: corre en paralelo al Atrio. **No conoce a las entidades**: se alimenta
  solo de los eventos de `EVENTOS_HUD`, para poder cambiar la interfaz sin tocar la
  lógica de juego.

## Arquitectura del combate

Las hitboxes son `Zone` con cuerpo Arcade que se activan solo durante la ventana
de daño, no sprites permanentes. Cada golpe lleva:

- **anticipación** → retardo antes de que la hitbox exista (telegrafía)
- **duración** → ventana en la que hiere
- **enfriamiento** → tiempo muerto tras el golpe

El ataque del Devoto se telegrafía **420 ms a propósito**: el parry tiene una
ventana de 140 ms, así que debe ser una lectura justa y no un reflejo imposible. Si
tocas uno de los dos valores, revisa el otro.

Un swing solo puede herir una vez a cada objetivo (`registrarGolpe` en el Cirujano,
`consumirGolpe` en el Devoto).

## Estado actual — Fase 2 (Núcleo jugable)

**Fase 1 — Prototipo (completa):**

- [x] Movimiento horizontal con aceleración/fricción diferenciada en suelo y aire
- [x] Salto con **coyote time** (90 ms) y **buffer de salto** (120 ms)
- [x] Salto variable (soltar el botón recorta la altura)
- [x] Doble salto (deliberadamente más débil: el Cirujano es técnico, no acróbata)
- [x] Dash con **i-frames** (160 ms de dash, 130 ms de invulnerabilidad)
- [x] Agarre de bordes y trepado
- [x] Cámara con seguimiento suave y deadzone

**Fase 2 — Núcleo jugable (completa salvo Tiled):**

- [x] Ataque cuerpo a cuerpo con hitbox por ventanas
- [x] Ataque cargado (mantener 450 ms, cuesta 30 de Fervor)
- [x] Parry con ventana de 140 ms que aturde al enemigo 900 ms
- [x] Fervor gastable: se gana golpeando (+6) y con parry (+20)
- [x] Vitalidad, i-frames al ser herido y retroceso
- [x] Poción de Carne (3 cargas, cura 3, deja vulnerable 600 ms)
- [x] Devotos con IA: patrulla → persecución → telegrafía → golpe, con memoria
- [x] Altares: guardado, reposición y reaparición al morir
- [x] Fragmentos del Códice con aviso no intrusivo
- [x] HUD desacoplado por eventos
- [ ] **Tilemap de Tiled** — bloqueado hasta que lleguen los tilesets

**Fase 3 — Pulido y contenido (en curso):**

- [x] Sensación de impacto: hitstop, sacudida, chispas y anillos (`Impacto.ts`)
- [x] Arco visible del golpe (sin él, el ataque es invisible hasta que toca algo)
- [x] Telegrafía del Devoto: se tensa y se tiñe antes de golpear
- [x] Segunda zona: Pasillos de Preparación
- [x] Umbrales de transición entre zonas
- [x] Final con gancho y recuento del Códice
- [ ] Sustituir placeholders por el arte del equipo
- [ ] **Escribir el gancho real** de `FinalScene` (hoy es un marcador de posición)
- [ ] Segundo tipo de enemigo
- [ ] Jefe o evento narrativo clave
- [ ] Audio
- [ ] Retirar la ayuda de controles antes de una build pública

## Controles

| Acción | Teclas |
|---|---|
| Mover | `A` / `D` o flechas |
| Saltar / doble saltar | `Espacio` o `Z` |
| Dash | `Shift` o `X` |
| Atacar | `J` o `C` |
| Ataque cargado | mantener `J` / `C` y soltar |
| Parry | `K` o `V` |
| Poción de Carne | `Q` |
| Rezar en un Altar | `E` |
| Trepar (colgado) | `W` / flecha arriba |
| Soltarse (colgado) | `S` / flecha abajo |

## Ajuste de sensación (game feel)

Todos los valores viven en `src/config/Sacramento.ts`. Es el único sitio que hay que
tocar para afinar el juego; ninguna cifra está incrustada en la lógica.

Al ajustar, ten en cuenta las dependencias:

- `COMBATE.parry.ventanaMs` ↔ `DEVOTO.anticipacionAtaqueMs`
- `COMBATE.cargado.costeFervor` ↔ `FERVOR.porGolpeAsestado` y `porParry`
  (define cada cuántos golpes el jugador puede permitirse un cargado)
- `VITALIDAD.maxima` ↔ `DEVOTO.dano` (hoy: 6 golpes de Devoto matan)

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
a mano en Aseprite, sin excepción.

El arte que se ve hoy vive en `src/systems/ArteProvisional.ts` y es **provisional**:
pixel art escrito a mano en código con un mapa de caracteres, un píxel por
carácter. No hay ninguna imagen generada. Existe solo para que el prototipo deje
de ser cubos mientras el equipo produce el arte definitivo.

Para sustituirlo: carga los `.png` del equipo en `PreloadScene` con las **mismas
claves de textura** (`cirujano-placeholder`, `piedra-placeholder`…) y borra
`ArteProvisional.ts` entero. Nada más depende de él. Mientras el sufijo
`-placeholder` siga apareciendo, es que el arte final no ha entrado.

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
