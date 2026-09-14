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
npm run verificar-arte   # comprueba figuras y tilesets
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
    Ofrenda.ts                   Lo que suelta un enemigo al caer: carne o sello
    Impacto.ts                   Game feel: hitstop, sacudida, chispas, destellos
    Sonido.ts                    Efectos sintetizados con la Web Audio API
    Musica.ts                    Banda sonora: pistas por zona con fundido cruzado
    ArteProvisional.ts           Pixel art de relleno escrito a mano en código
    Progreso.ts                  Estado que sobrevive al cambio de zona (Códice)
  lore/
    Codice.ts                    Textos de los fragmentos, derivados del world bible
  ui/
    HudScene.ts                  HUD como escena paralela, alimentada por eventos
    PausaScene.ts                Menú de pausa sobre el juego detenido
    TextoControles.ts            Texto de la ayuda, compartido por el panel y la pausa
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
  tilesets/
    vientre.png                  Sillería 16x16 que embaldosa sin costura
    vientre-grietas.png          Calcomanías de grieta
    vientre-musgo.png            Calcomanías de musgo
  sprites/  audio/  maps/        Vacíos hasta que llegue el resto del arte
docs/
  DESARROLLO.md                  Este archivo
  Propuesta-inicial.md           Propuesta técnica original
  Subterfuge-world-bible.docx    Biblia del universo
  issues/                        Encargos de arte listos para publicar
  arte/                          Paleta y guía de estilo (pendiente)
    piezas/                      Piezas de muro del equipo (origen del tileset)
scripts/
  generar-tileset.mjs            Convierte docs/arte/piezas/ en el tileset
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
- **Preload**: carga de assets y barra de progreso. Carga la sillería del equipo
  desde `public/assets/tilesets/` y genera por código los _placeholders_ que aún
  faltan (personajes, objetos, decorado).
- **Atrio**: el primer nivel. Geometría descrita por código; se sustituye por un
  tilemap de Tiled cuando lleguen los tilesets completos de zona.
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
- [x] Rezar como acto: el Cirujano se arrodilla, el Altar responde, el aviso explica
- [x] Menú de pausa (`Esc`/`P`): continuar, controles, sonido, volver al Atrio
- [x] Menú contextual del navegador bloqueado en toda la página
- [x] Efectos diferenciados por enemigo y por acción (aterrizar, agarre, poción…)
- [x] Banda sonora por zona, tema de jefe y de cierre (CC0, con fundidos)
- [x] Aviso en pantalla mientras el navegador tenga el audio bloqueado
- [x] Daño por caída proporcional a la altura, con umbral por encima del doble salto
- [x] Alcance del golpe ampliado: banda segura frente al zarpazo del jefe
- [x] Reliquias que también curan al recogerse, y el HUD enseña la tecla de la Poción
- [x] Campanario del Atrio sin voladizo: la primera reliquia se alcanza con doble salto
- [x] Ofrendas: los enemigos sueltan carne (+1 vida) o sellos (+20 Fervor) al caer
- [x] Panel de controles a todo el ancho, con líneas acotadas para que no se pisen
- [x] Menús con ratón: pasar por encima selecciona, clic confirma
- [x] Ambiente de fondo: atrezo lejano con parallax, luz de velas, polvo y viñeta
- [x] Campanario a 80 px: el secreto es verlo, no una prueba de precisión
- [x] Jefe: azar ponderado por fase, embestida doble, escombros del techo
- [x] Arena del jefe con tres alturas y pedestal que la embestida pasa por debajo
- [x] Sillería del equipo en las cuatro zonas, con tinte y desgaste por nivel
- [ ] Sustituir el resto de placeholders por el arte del equipo
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
| Pausa                 | `Esc` o `P`                   |
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

**Ofrendas.** Un enemigo derrotado suelta algo con cierta probabilidad
(`OFRENDA` en `Sacramento.ts`): carne del diezmo (+1 vida) o un sello (+20
Fervor). Los Vestales siempre sueltan sello. Cura poco a propósito: pelear tiene
que compensar frente a rodear, pero matar enemigos no puede sustituir a los
Altares como forma de curarse. El jefe no suelta nada: su recompensa es la
salida que se abre.

**El Reformado** usa el mismo repertorio en sus tres fases y acelera (×0,85 y
×0,7), pero a partir de la fase 2 **deja de ser predecible**: a distancia
sortea entre embestida, salto y **embestida doble** (ida y vuelta, con la mitad
de aviso en la vuelta) según pesos por fase (`REFORMADO.pesosFaseN`). La fase 1
es determinista a propósito: se aprende.

Cada maniobra tiene su color y su gesto —la embestida se echa atrás en rojo, la
doble en granate, el salto se agacha en ámbar, el zarpazo es rosa y corto— y
estrellarse contra un muro lo deja expuesto: esa es la ventana de castigo.

**Escombros**: en fase 2+, al aterrizar de un salto caen piedras del techo sobre
posiciones marcadas alrededor del Cirujano (2 en fase 2, 3 en fase 3, con 560 ms
de aviso). Es la amenaza vertical que le faltaba a una arena plana.

**Reintentar** (issue #32): las Salas tienen una antesala con el Altar _antes_
de la arena, y una reja (`DefinicionNivel.reja`) que cae cuando el Reformado
despierta. Morir dentro devuelve al Altar de la antesala; la reja sube y el jefe
vuelve a su sitio dormido y con toda la vida (`reiniciarCombateDeJefe`). Antes
se reaparecía dentro con el jefe donde se dejó, y la pelea era desgaste, no
aprendizaje. La reja es un muro para los dos: al Cirujano lo encierra y al
Reformado le sirve para estrellarse, igual que la pared del fondo.

**Presencia** (issue #31): el Reformado mide 44×40 (un Devoto, 16×32) y lleva
lo que cuenta lo que es: instrumental del quirófano fundido en el lomo, la
cabeza vendada **sin ojos** y el sello dorado del Elegido en el pecho. Respira
en dos cuadros, tiene un latido de luz que se acelera con cada fase, sombra
propia que se encoge al saltar y carne que gotea mientras está despierto. El
cuerpo físico sigue siendo 20×28: la banda segura del zarpazo y el paso bajo el
pedestal están afinados sobre esas medidas.

**La arena** tiene tres alturas: suelo, repisas a 80 px y esquinas altas a
136 px, más un pedestal central a 56 px con la camilla encima. El pedestal está
calculado para que el cuerpo del jefe (28 px) **pase por debajo** al embestir:
es refugio de la embestida y blanco de los saltos y los escombros. Subirse es
una decisión. El drone de ambiente sube de tono con cada fase.

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

**Capas de ambiente** (`EscenaNivel`): detrás de todo, el telón de arcadas con
parallax; encima, el **atrezo lejano** (`fondo:` en cada zona — ventanas
ojivales, columnas, cadenas, rejas) a 0,6 de la velocidad de la cámara y
oscurecido, que es lo que se lee como distancia; luego el decorado que el
jugador roza; **luz** aditiva y parpadeante en velas, Altares y umbrales;
**polvo** en suspensión fijo a la cámara (color por zona: cálido arriba, gris
en las Criptas, rojizo en las Salas); y una **viñeta** encima de todo. Ninguna
capa cuesta física: son sprites, un emisor de 34 partículas y dos texturas de
degradado generadas con canvas.

**Regla de trazado de repisas**: una plataforma alta no debe **colgar sobre** la
que se usa para subir a ella. Si lo hace, al saltar te das con su techo y solo
queda un resquicio por el borde. Pasó con el campanario del Atrio (#24): la
repisa alta iba de x 0 a 96 sobre una baja de 40 a 104. Ahora la alta acaba
donde empieza la baja, y se sube derivando hacia el muro.

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

## Rezar en un Altar

Rezar es el punto de guardado, y tiene que **parecerlo**. Tres cosas ocurren a
la vez para que no quede duda: el Cirujano se arrodilla 1,1 s (estado
`rezando`, sin control), el Altar responde con un halo, luz y campana, y el
aviso dice con palabras qué acaba de pasar — _"ALTAR: descenso guardado"_ y
luego _"cuerpo y frasco repuestos · aquí volverás si caes"_. El propio letrero
del Altar ya anuncia _"E rezar (guarda el descenso)"_. Una acción que parece no
hacer nada no se vuelve a intentar.

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

Dos capas, con criterios distintos:

**Efectos** (`src/systems/Sonido.ts`) se **sintetizan en tiempo real** con la
Web Audio API. Cada clase de enemigo tiene su materia — el Devoto es carne y
hueso, el Vestal tela y metal fino, el Reformado carne húmeda sobre algo que ya
no es hueso — y cada uno cae a su manera. El golpe al aire suena siempre (el
impacto se suma encima si conecta), y hay sonido para aterrizar, agarrarse,
trepar, beber, el frasco vacío, reliquias, menús, el despertar del jefe, sus
fases, la reja de la arena, los escombros y la victoria. Sin archivos, por tres razones:

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

**Música** (`src/systems/Musica.ts`) son pistas **CC0 de OpenGameArt**, una por
zona (`musica:` en cada definición de nivel), más un tema para el jefe — entra al
despertar y vuelve la de la zona al vencerlo — y otro para el cierre. Cambiar de
pista es un fundido cruzado hecho con un temporizador propio, **no con tweens de
escena**: un tween muere cuando su escena se detiene, y cambiar de zona detiene
la escena justo mientras la pista saliente se apaga. En pausa y en el Códice la
música se atenúa, no se corta. Cada pista va en `.ogg` y `.mp3` porque Safari no
reproduce Ogg Vorbis; el navegador carga solo el formato que sabe leer (~5 MB).
Autoría y licencia de cada pista: `public/assets/audio/musica/LICENCIAS.md`.

Nota de navegador: el `AudioContext` nace suspendido y no suena nada hasta que
el usuario interactúa. Los efectos comparten el contexto de Phaser (un solo
contexto que desbloquear) y el HUD muestra _"pulsa cualquier tecla para activar
el sonido"_ mientras siga bloqueado, para que nadie crea que el juego es mudo.

## Ajuste de sensación (game feel)

Todos los valores viven en `src/config/Sacramento.ts`. Es el único sitio que hay que
tocar para afinar el juego; ninguna cifra está incrustada en la lógica.

Al ajustar, ten en cuenta las dependencias:

- `COMBATE.parry.ventanaMs` ↔ `DEVOTO.anticipacionAtaqueMs`
- `COMBATE.cargado.costeFervor` ↔ `FERVOR.porGolpeAsestado` y `porParry`
  (define cada cuántos golpes el jugador puede permitirse un cargado)
- `VITALIDAD.maxima` ↔ `DEVOTO.dano` (hoy: 6 golpes de Devoto matan)
- `COMBATE.ataque.alcance` ↔ `REFORMADO.zarpazo.alcance + margenDisparo`: el
  golpe llega a `alcance + 4` del centro del Cirujano y toca el cuerpo del jefe
  (semiancho 10) hasta a 48 px; el zarpazo salta a 36. **Esos 12 px son la
  banda segura**; si desaparece, el jefe no se puede golpear sin recibir daño.
- `DANO_POR_CAIDA.sinDanoHasta` debe quedar por encima de la altura del doble
  salto (157 px) y de cualquier escalón de las rutas de retorno (80 px). La caída
  se mide desde el punto más alto de la trayectoria; dash y agarre la reinician.

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

El resto del arte vive en `src/systems/ArteProvisional.ts` y es **provisional**:
pixel art escrito a mano en código con un mapa de caracteres, un píxel por
carácter. No hay ninguna imagen generada. Existe solo para que el prototipo deje
de ser cubos mientras el equipo produce el arte definitivo.

Para sustituirlo: carga los `.png` del equipo en `PreloadScene` con las **mismas
claves de textura** (`cirujano-placeholder`, `devoto-placeholder`…) y borra su
figura de `ArteProvisional.ts`. Nada más depende de él. Mientras el sufijo
`-placeholder` siga apareciendo en una clave, es que ese arte final no ha entrado.

## La sillería del Vientre

La piedra **ya no es provisional**: es arte del equipo. Las piezas originales
están en [`docs/arte/piezas/`](arte/piezas/) y el juego carga lo que sale de
ellas, en `public/assets/tilesets/`.

### Por qué hay un paso de conversión

Las piezas están dibujadas sobre un ladrillo de **19 × 10 px** (18 de cuerpo + 1
de mortero, y 9 + 1 en vertical). El juego trabaja a `T = 16`, y 19 no divide a
16: a tamaño original, cada borde de plataforma cortaría un ladrillo por la
mitad.

`scripts/generar-tileset.mjs` lo resuelve **sin reescalar** —reescalar pixel art
lo emborrona e inventa píxeles que nadie dibujó—. Lo que hace es **quitar
relleno**: borra tres columnas y dos filas del centro plano de cada ladrillo y
deja intactos el brillo de arriba, la sombra de abajo y el mortero, que es donde
se lee la forma. El ladrillo queda en 15 + 1 = 16 de ancho y 7 + 1 = 8 de alto,
así que **un tile del juego es un ladrillo de ancho por dos hiladas de alto**.

Que encaje no es casualidad: tras la conversión, las piezas de dos hiladas miden
exactamente un tile de alto —lo que miden las plataformas del juego— y las de
cuatro hiladas, dos.

### Por qué las grietas y el musgo van sueltos

Horneadas dentro del tile que se repite, **reaparecen cada 16 px y la pared se
lee como papel pintado**. Van en hojas aparte y se siembran esparcidas, con una
separación mínima entre ellas.

Se pueden separar porque la artista dibujó cada variante encima de la misma base,
así que restar la pieza limpia de la agrietada deja exactamente la grieta. Las dos
se comportan al revés y por un motivo: la **grieta está dentro del muro**, así que
nunca puede asomar al vacío y se limita a un tile; el **musgo crece hacia fuera** y
se planta a caballo del canto, colgando por el borde, que es como está dibujado en
la lámina de referencia.

La siembra es **reproducible**, no aleatoria: sale del hash de la posición. El
jugador se orienta por la pared agrietada igual que por las columnas, y si el
desgaste cambiara al morir perdería esos puntos de referencia.

### Ajustes por zona

Cada nivel declara `tinte` y `desgaste` en su `DefinicionNivel`, al lado de
`colorFondo`. Es lo que mantiene la regla del descenso con un solo tileset: la
misma piedra baja de tono y se agrieta más según se cierra el Vientre, y el musgo
se apaga del todo en las Criptas, donde ya no llega nada vivo.

### Si el arte cambia

Se reemplazan los PNG de `docs/arte/piezas/` y se vuelve a ejecutar:

```bash
node scripts/generar-tileset.mjs
```

Si cambia el tamaño de fotograma, hay que tocarlo **también** en `PreloadScene`.
`npm run verificar-arte` comprueba que las dos cifras cuadren, porque cuando no
cuadran Phaser no protesta: recorta los fotogramas donde le parece.

**Pendiente con el equipo de arte:** las piezas llegaron por WhatsApp, en JPEG y
con el fondo aplastado a negro. Están reconstruidas a su resolución nativa y el
negro recortado por umbral, pero conviene una reentrega en **PNG con alfa** y, si
existen, los `.aseprite` fuente.

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
