# Guía de desarrollo — Subterfuge

Documentación técnica del teaser. Para la descripción del proyecto y del universo,
ver el [README](../README.md).

## Stack

| Componente | Elección          | Notas                                                              |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| Motor      | **Phaser 3.90.0** | Fijado a 3.x a propósito (ver más abajo)                           |
| Lenguaje   | TypeScript        |                                                                    |
| Bundler    | Vite 8            |                                                                    |
| Física     | Arcade Physics    | Suficiente para plataformas; Matter.js solo si el combate lo exige |
| Mapas      | Tiled (`.tmj`)    | Entra en Fase 2                                                    |

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
    Enemigo.ts                   Interfaz común a todos los enemigos
    CirujanoSacerdote.ts         Personaje jugable: locomoción y combate
    Devoto.ts                    Enemigo cuerpo a cuerpo (Atrio)
    Vestal.ts                    Enemigo a distancia, lanza sellos (Pasillos)
    Sello.ts                     Proyectil del Vestal; el parry lo devuelve
    Reformado.ts                 Jefe del teaser, tres fases (Salas)
  objetos/
    Altar.ts                     Punto de guardado
    FragmentoCodice.ts           Coleccionable de lore
    Reliquia.ts                  Mejora permanente escondida (vida o pociones)
    Impacto.ts                   Game feel: hitstop, sacudida, chispas, destellos
    Sonido.ts                    Audio sintetizado con la Web Audio API
    ArteProvisional.ts           Pixel art de relleno escrito a mano en código
    Progreso.ts                  Estado que sobrevive al cambio de zona (Códice)
  lore/
    Codice.ts                    Textos de los fragmentos, derivados del world bible
  ui/
    HudScene.ts                  HUD como escena paralela, alimentada por eventos
    BarraVida.ts                 Barra flotante de los enemigos normales
    CodiceScene.ts               Lectura del Códice sobre el juego en pausa
  scenes/
    BootScene.ts                 Arranque mínimo
    PreloadScene.ts              Carga de assets + placeholders generados por código
    EscenaNivel.ts               Lógica común a todos los niveles del descenso
    AtrioScene.ts                Zona 1: el Atrio (solo datos)
    PasillosScene.ts             Zona 2: Pasillos de Preparación (solo datos)
    CriptasScene.ts              Zona 3: Criptas de Espera (solo datos)
    SalasScene.ts                Zona 4: Salas de Sacramento, el jefe (solo datos)
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
Boot ──► Preload ──► Atrio ──► Pasillos ──► Criptas ──► Salas ──► Final
                       │          │            │          │
                       └──────────┴────────────┴──────────┴──► Hud  (escena paralela)
```

### Añadir una zona nueva

`EscenaNivel` contiene toda la lógica (combate, altares, muerte, umbrales). Una
zona nueva **solo describe su contenido**:

```ts
export class SalasScene extends EscenaNivel {
  constructor() {
    super({ key: 'Salas' });
  }

  protected definirNivel(): DefinicionNivel {
    return {
      mundo,
      colorFondo,
      inicio,
      plataformas,
      paredes,
      devotos,
      altares,
      fragmentos,
      umbral,
    };
  }
}
```

Luego regístrala en `main.ts` y apunta el `umbral` de la zona anterior a su
clave. El descenso del Vientre continúa: Salas de Sacramento → Criptas de Espera
→ Niveles Reformados → Vientre Profundo. **Cada una debe ser más oscura, más
orgánica y más peligrosa que la anterior** — empezando por su `colorFondo`.

- **Boot**: arranque mínimo, sin carga pesada.
- **Preload**: carga de assets y barra de progreso. Hoy genera _placeholders_ por
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

**El golpe sale al pulsar, no al soltar.** Es una regla de respuesta: si la
tecla no hace nada hasta que se levanta el dedo, el jugador cree que no
funciona. El cargado se decide después, al soltar tras mantener 450 ms, y
salta por encima del enfriamiento del básico porque suele soltarse durante él.

**Golpes direccionales.** Mantener `W` al atacar golpea arriba; mantener `S`
en el aire golpea abajo. La caja de daño se gira (alto por ancho) y el arco se
rota ±90°. El golpe hacia abajo que conecta **rebota**: impulso hacia arriba,
devuelve el doble salto y el dash, y deja un enfriamiento de 90 ms para que los
pogos se encadenen. Es lo que convierte el aire en un sitio desde el que pelear
y lo que permite castigar desde arriba sin pagar el daño por contacto.

**El arco del golpe se dibuja siempre, acierte o falle.** La confirmación de
"he golpeado" no puede depender de que hubiera un enemigo delante. Va con dos
poses del personaje (se recoge en la anticipación, se lanza en el impacto) y un
impulso visual de unos píxeles hecho moviendo el origen del sprite, no su
posición, para que las colisiones no se enteren.

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
- [x] Segundo tipo de enemigo: el Vestal, a distancia
- [x] Sellos del diezmo: proyectiles que el parry **devuelve** al remitente
- [x] Jefe: el Reformado, tres fases (`SalasScene`)
- [x] Tercera zona: Salas de Sacramento
- [x] Audio: efectos y drone de ambiente, sintetizados sin archivos
- [x] Daño por contacto: rozar a un enemigo hiere (el dash lo atraviesa)
- [x] Barras de vida flotantes en enemigos
- [x] Lectura del Códice (`L`) con estado persistente entre zonas
- [x] Reliquias en rutas secretas: +vitalidad máxima, +pociones
- [x] Decorado por zona: columnas, velas, exvotos, charcos, altar-camilla
- [x] Cierre con línea oculta al completar el Códice
- [x] Golpes hacia arriba y hacia abajo; el de abajo rebota al conectar
- [x] Cuarta zona: Criptas de Espera
- [x] Placas del Registro: lore de una línea con `E`
- [x] Ocho fragmentos del Códice
- [ ] Sustituir placeholders por el arte del equipo
- [ ] **Escribir el gancho real** de `FinalScene` (hoy es un marcador de posición)
- [ ] Segundo tipo de enemigo
- [ ] Jefe o evento narrativo clave
- [ ] Audio
- [ ] Retirar la ayuda de controles antes de una build pública

## Controles

| Acción                | Teclas                        |
| --------------------- | ----------------------------- |
| Mover                 | `A` / `D` o flechas           |
| Saltar / doble saltar | `Espacio` o `Z`               |
| Dash                  | `Shift` o `X`                 |
| Atacar                | `J`, `C` o clic izquierdo     |
| Golpe arriba / abajo  | mantener `W` / `S` al atacar  |
| Ataque cargado        | mantener y soltar (30 Fervor) |
| Parry                 | `K`, `V` o clic derecho       |
| Poción de Carne       | `Q`                           |
| Silenciar el audio    | `M`                           |
| Ayuda de controles    | `H` o `Tab`                   |
| Rezar en un Altar     | `E`                           |
| Leer el Códice        | `L`                           |
| Trepar (colgado)      | `W` / flecha arriba           |
| Soltarse (colgado)    | `S` / flecha abajo            |

## Diseño de los enemigos

Los tres se resuelven con la misma regla: **telegrafiar largo y castigar el
error**. Ninguno pide reflejos; todos piden leer.

| Enemigo   | Papel           | Aviso                          | Cómo se castiga                   |
| --------- | --------------- | ------------------------------ | --------------------------------- |
| Devoto    | Cuerpo a cuerpo | 420 ms tensándose en rojo      | Parry → 900 ms aturdido           |
| Vestal    | A distancia     | 520 ms irguiéndose en dorado   | Parry al sello → se lo devuelve   |
| Reformado | Jefe, 3 fases   | 380-620 ms, color por maniobra | Embestida fallida → 1,1 s abierto |

**El Vestal** no es un Devoto que dispara: tiene la mitad de vida y retrocede si
te acercas, así que el problema no es matarlo sino llegar hasta él. Su sello
**no se destruye con el parry**, cambia de dueño y sale rebotado más rápido y
con 3 de daño en vez de 1. Es la razón de que exista como enemigo.

**El Reformado** usa el mismo repertorio en sus tres fases y solo acelera
(×0,85 y ×0,7). Se aprende leyendo, no memorizando. Cada maniobra tiene su
color y su gesto —la embestida se echa atrás en rojo, el salto se agacha en
ámbar, el zarpazo es rosa y corto— y estrellarse contra un muro lo deja
expuesto: esa es la ventana de castigo y el pulso del combate.

Duerme hasta que el Cirujano se acerca, y mientras siga vivo el umbral de
salida no existe.

## Diseño de niveles: por qué hay desvíos

Un nivel sin nada que ganar explorando es un pasillo, por muy largo que sea.
Cada zona sigue la misma regla: **el camino principal enseña, los desvíos
premian**. Cada desvío exige una mecánica (doble salto, dash, agarre) y guarda
una de dos cosas:

- **Fragmento del Códice** — premio de lectura. Seis en total.
- **Reliquia** — premio de cuerpo. `Relicario de Carne` (+1 vitalidad máxima)
  y `Frasco Consagrado` (+1 Poción). Cinco en total, persistentes entre zonas
  (`Progreso.ts`).

El decorado (`decorado:` en cada definición) no es adorno: da **puntos de
referencia** para que el jugador sepa dónde ha estado. Cada zona tiene su
vocabulario — el Atrio columnas y exvotos, los Pasillos cera de archivo y
techos bajos, las Salas la camilla y la sangre — y ninguna pieza representa a
un Primigenio.

**Placas del Registro** (`inscripciones:` en cada definición): una línea de
burocracia diegética que se lee con `E` sin abrir nada. Son la forma más barata
de profundidad narrativa: el sistema se cuenta a sí mismo en sus carteles.

Rejugabilidad: el cierre cuenta fragmentos y reliquias, y **con el Códice
completo aparece una última línea al margen** que no se ve de otra forma.

## El Códice de la Carne

Los textos viven en `src/lore/Codice.ts` y son **borrador derivado del world
bible**, para que el equipo narrativo los apruebe o reescriba. Siguen la
estructura que el propio documento describe para el Códice: un versículo de la
escritura que Genesis Vestal reescribió sobre su fracaso, y debajo, en otra
tinta, **una anotación al margen de alguien que intentó advertir**. Leídos en
orden, los márgenes dejan ver la verdad debajo de la doctrina.

Lo que ninguna versión futura puede romper: los Primigenios son ciegos y nunca
"miran"; fueron mil; la niña no fue sorteada, vino a pagar una deuda de su casa;
y nadie dentro del mundo percibe el sacramento como violencia — el horror está
en la distancia entre lo que ellos creen y lo que el jugador lee.

Recoger un fragmento **no abre nada**: solo un aviso. Se lee con `L` cuando el
jugador quiere, sobre el juego en pausa. El índice muestra los huecos de lo que
falta, así que se sabe cuántos hay sin saber dónde. Lo recogido sobrevive al
cambio de zona (`Progreso.ts`) y se reinicia al volver al Atrio desde el cierre.

## Audio

Todo el sonido se **sintetiza en tiempo real** con la Web Audio API
(`src/systems/Sonido.ts`). No hay ni un solo archivo de audio en el repo, por
tres razones:

- **Licencias**: todo lo que suena es original. Cero riesgo de arrastrar un
  sample con condiciones raras a un proyecto que se publica.
- **Peso**: el build ya carga 1,2 MB de Phaser; unos cuantos `.ogg` sumarían
  varios MB más para un teaser que se juega en el navegador.
- **Ajuste**: se afina cambiando números, igual que el resto del game feel.

Dos primitivas lo componen todo: `tono()` (oscilador con barrido y caída
exponencial) y `ruido()` (ruido blanco filtrado). Los golpes son ruido grave
"de carne"; el parry es lo **único** metálico y limpio del juego, para que se
distinga en mitad de una pelea; los Altares son campana litúrgica con cola.

El drone de ambiente son tres graves ligeramente desafinados entre sí: el
batido lento que producen es lo que da la sensación de estar dentro de algo
vivo. Va muy bajo — se nota cuando se apaga, no cuando suena.

**Cuando el equipo grabe audio propio en Audacity**, se sustituye llamada por
llamada: la interfaz pública (`golpe`, `parry`, `altar`…) puede quedarse igual
y cargar samples por dentro.

Nota de navegador: el `AudioContext` nace suspendido y no suena nada hasta que
el usuario interactúa. `BootScene` engancha la reanudación al primer teclazo o
clic, así que el primer sonido llega con la primera acción del jugador.

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
genéricos de videojuego. Es _Fervor_, no "mana". Es _Poción de Carne_, no "health
potion". Es _Altar_, no "checkpoint". Esto aplica a nombres de clases, variables,
archivos y a cualquier texto visible.

**Regla de consistencia del universo.** Todos los Primigenios son **ciegos** — de
ahí el dogma _"los dioses no miran, son mirados"_. Conocen el mundo por tacto e
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

| Servidor                                 | Uso                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `tiled` (`tiled-mcp-server`)             | Inspeccionar y editar mapas `.tmx`/`.tmj` sin abrir Tiled. **Versión 0.0.2 — trátalo como experimental.** |
| `image-tiler` (`image-tiler-mcp-server`) | Analizar capturas de referencia grandes a resolución completa sin degradarlas                             |

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
