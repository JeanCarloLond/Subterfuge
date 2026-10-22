# Subterfuge Sigma

El remake de Subterfuge en **Godot 4.7**, con el lore nuevo: el templo se está
compactando. El canon está en [docs/canon.md](docs/canon.md) y la propuesta de mapa,
en [docs/mapa.md](docs/mapa.md).

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

- **La escena inicial**: «Empezar» en la portada abre el contexto en cinco planos,
  como las de _Blasphemous_: un dios nuevo que no llega, la duda en la Sala N.º 7, la
  carne que no llega y las paredes que se mueven, y el título. Se salta con Espacio.
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
- **Las reliquias**: el doble salto y el dash ya no vienen de serie. Son restos que los
  Primigenios dejan al compactarse, órganos sueltos que aún funcionan: **el Pulmón
  Vacío** (doble salto), a media bajada del Atrio, y **el Tendón del Mil** (dash), en el
  nicho del fondo, al que solo se llega con el doble salto. Con los dos se abre el
  camino alto de la derecha. Se toman con E y duran toda la partida. En las salas de
  prueba el cuerpo viene entero (`reliquias_libres`).
- **Las notas**: lore que se encuentra. Con E se leen en un panel, con el juego parado, y
  quedan guardadas como leídas. La primera, el _Registro del Pabellón N.º 7_, está en una
  repisa junto al techo que late del Atrio: solo se llega subido al techo cuando baja, y si
  uno se queda encima cuando vuelve a subir (avisa con un latido), lo aplasta.
- **El guardado** (#202): como en el original, rezar es guardar. El autoload `Progreso`
  escribe en `user://partida.cfg` las reliquias y el último Altar al tomar una reliquia y
  al rezar; en la portada, «Continuar» vuelve a ese Altar y «Empezar» abre una partida
  nueva (borra la guardada).
- **Trepar**: no es automático, y no en cualquier pared. En el aire, pegado a una
  **membrana** (tejido vivo sobre la piedra, se ve distinta), K clava el bisturí y el
  Cirujano queda colgado; en la piedra no entra, y K sigue siendo el parry. En el Atrio,
  las membranas son la capa `Membranas` (grupo `clavable`): se pintan en el editor con
  `arte/silleria/membrana.tres`. Empujar hacia fuera lo
  gira de espaldas a la pared, y saltar así lo despega hacia fuera; de cara, saltar o ↑
  trepan al borde.
- **Los temblores**: cada medio minuto, más o menos, el templo se encoge un poco, lejos:
  la cámara tiembla, cae polvo y alguna piedra y suena un retumbo grave
  (`scripts/temblor.gd`). No hacen daño; son el aviso de fondo de que todo se mueve.
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

**El Devoto** también es de Sigma (`npm run sigma:devoto`, el mismo títere): en tres
cuartos, más bajo y ancho que el Cirujano (~42 px), con sayo, mandil de cuero, la venda en
los ojos y una cicatriz de oro (la biblia: casi enteros, marcas menores). Dos variantes,
como en el original: con un aparato de metal (brazo con garra y pierna) o con un brazo de
carne injertada. Anda, avisa alzando el brazo, golpea con su smear, se tambalea aturdido
y se arrodilla para la ejecución.

**La Vestal** (`npm run sigma:vestal`): clero, no pelea, administra. Alba de hueso, toca
alta con velo, la venda roja de las intérpretes y el sello del diezmo en la mano.
Mantiene la distancia, huye si te acercas y lanza sellos con un aviso largo (el sello
se enciende al alzarlo). Parado con K, el sello vuelve más rápido, le quita 3 y la deja
aturdida como un parado: entonces, y solo entonces, se la puede ejecutar. Hay dos en el
Atrio: una abajo, junto al umbral, y otra en el camino alto de las reliquias.

**Los fondos** son grandes y en capas, como en _Blasphemous_ y _Hollow Knight_
(`scripts/nave.gd`): la vidriera-pantalla moribunda con sus haces de luz, una bóveda de
costillas (los dioses son el templo), columnas colosales con venas y una jaula colgada,
y un primer plano de siluetas que pasa por delante del Cirujano. Cada capa va a otra
velocidad. Las saca `npm run sigma:fondos` a `sigma/arte/fondos/`, con colores planos,
sombreado por bandas y trama ordenada en vez de degradados.

**El atrezo** (`npm run sigma:atrezo`, `scripts/atrezo.gd`) sale del canon del Atrio
("pabellones, talleres, terrazas de hongos, capillas con su Piedra Tibia"): el **Muro de
los Dientes** (los dientes de leche engastados en oro, el hito del Atrio), la **Piedra
Tibia** que echa vapor, candelabros que titilan y hongos de lámpara que respiran. Cada
pieza con su luz; se colocan en `piezas` del nodo `Atrezo`, y un test comprueba que
se apoyan en piedra.

**El audio**: una pista por escena con fundido cruzado (el autoload `Musica`; si la
siguiente escena usa la misma, sigue sin cortarse). La portada y la intro, un tema
orquestal y trágico de ProjectHelmet (CC-BY 4.0: el crédito es obligatorio); el Atrio,
_Dark Shrine Loop_ (CC0); el siguiente nivel tendrá _Cathedral in the forest_ (CC0), que
mientras suena en las salas de prueba. Los efectos (pasos, tajo, golpe, guardia, parry logrado, salto, caída y trago) los pone el autoload `Efectos`, con sonidos CC0 de Kenney y el trago calculado. Las voces del Cirujano y los Devotos al atacar,
saltar, recibir y morir son las del original (el autoload `Voces`). Autoría y licencias de
todo en `sigma/audio/LICENCIAS.md`: **una pista nueva no entra sin su línea ahí**.

**La piedra** (`npm run sigma:silleria`) es de Sigma: una baldosa por cada combinación de
lados al aire, en cuatro variantes, con la cara de arriba clara, los cantos con bisel y
el interior en sombra (y vetas de carne en una de cada cuatro). `scripts/silleria.gd`
la viste al cargar según las vecinas de cada piedra: el mapa se sigue pintando con
cualquier baldosa en el editor. La usan el Atrio, los muros que se mueven, la sala de
compactación y la intro.

**La interfaz** (`npm run sigma:hud`, `escenas/interfaz.tscn`) es ornamentada, como la
de _Blasphemous_: arriba a la izquierda, un medallón con el rostro vendado del Cirujano
(destella en rojo al recibir), la vida en seis segmentos de sangre y el Fervor en ámbar
dentro de un marco de oro con remate, y los frascos de Poción. La ayuda de controles,
abajo.

**Las fuentes.** Las góticas son para leer despacio: _Jacquard 12_ en los títulos (24 px) y
_Jacquarda Bastarda 9_ en la narración de la intro (18 px), de The Soft Type Project (SIL
OFL 1.1, `arte/fuentes/OFL.txt`). Todo lo que se lee jugando (menú, avisos, «E rezar»,
carteles, la ayuda) va en _VT323_ a 16 px (SIL OFL 1.1, `arte/fuentes/OFL-VT323.txt`), que es
la fuente por defecto del proyecto: `arte/tema.tres`, con contorno oscuro. Un texto nuevo no
necesita nada para leerse bien; si se le pone otra fuente o tamaño, que sea a propósito. Las
tres solo son nítidas a esos tamaños y sin suavizado (ya está en sus `.import`). La ayuda de
controles va plegada: H la abre y la cierra.

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
