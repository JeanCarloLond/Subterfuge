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

Hace falta **Node.js 22.12 o superior**.

```bash
npm install
npm run dev              # servidor de desarrollo: el juego en / y el portal en /web/
npm test                 # tests unitarios (Vitest), en menos de un segundo
npm run verificar        # todo lo que corre el CI: formato, lint, tipos, tests, verificaciones y build
npm run build            # comprobación de tipos + build de producción en dist/
npm run preview          # sirve el build de producción
```

La lista completa de comandos está en el [README](../README.md#comandos-disponibles)
y el flujo de trabajo, con los tests que se piden a cada PR, en
[CONTRIBUTING](../CONTRIBUTING.md).

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

Por carpeta, con los archivos que conviene conocer antes de tocar nada. El resto
se explica solo con su nombre y su comentario de cabecera.

```
src/
  main.ts                 Configuración de Phaser y orden de las escenas
  config/Sacramento.ts    Todas las constantes de diseño: movimiento, combate, Fervor, especies
  input/                  Entrada: Controles (teclado y ratón), Tactil y Toques (dedos), Mando
  systems/                Lo que no es una escena ni una entidad
    Progreso.ts             La partida en curso: lo recogido, lo descubierto, la Injertadora
    Guardado.ts             El descenso guardado en los Altares (#149)
    Memoria.ts              Lo descubierto alguna vez, para el portal; no se borra nunca
    Ajustes.ts              Opciones: sacudidas y destellos, volúmenes, velocidad del texto
    Impacto.ts              Game feel: hitstop, sacudida, chispas
    Sonido.ts · Musica.ts   Efectos sintetizados y banda sonora
    ArteProvisional.ts      Pixel art provisional escrito a mano (y los retratos y la cinemática)
  entities/               El Cirujano, los enemigos, el jefe y las especies del Vientre
  objetos/                Altar, fragmento del Códice, reliquia, ofrenda
  lore/                   Textos y datos del mundo: Códice, Registro, voces, cinemática…
  scenes/                 Inicio, las cuatro zonas (sobre EscenaNivel), el cierre y la cinemática
  ui/                     HUD, pausa, opciones, diálogo, Códice y botonera táctil
web/
  index.html              El portal de la Diócesis
  src/paginas/            Una página por sección: portada, pabellón, doctrina, registro…
  src/*.ts                Módulos del portal: memoria, texto, láminas, ambiente
tests/                    Tests unitarios (Vitest); `preparar.ts` simula el navegador
scripts/                  verificar-*, exigir-tests, exportar-arte, probar-tactil, generar-tileset
public/                   Lo que se sirve tal cual: audio, tilesets, iconos, vistas previas
docs/                     Documentación: ver docs/README.md
```

## Flujo de escenas

> **Fase 4 en curso.** El juego pasa a tener dos niveles: lo que hay hoy es el **Nivel 1**,
> y el **Nivel 2 — El Vientre Húmedo · La escapatoria** empieza con la decisión del
> Cirujano en el cierre. Antes de tocar escenas, niveles o lore de esta fase, lee el
> [acta de canon](canon/nivel-2-vientre-humedo.md): fija qué cubre cada nivel, qué no se
> muestra y qué queda pendiente de decidir.

```
Boot ──► Preload ──► Inicio ──► Atrio ──► Pasillos ──► Criptas ──► Salas ──► Final ──► Cinematica
                       │  Continuar  │          │            │          │
                       └─────────────┴──────────┴────────────┴──────────┴──► Hud  (escena paralela)

Nivel 2 (#156):
Final ──«Huir por el desagüe»──► Desague ──► Galeria ──► Ductos ──► FinalNivel2
  └──«Volver al Atrio» (partida nueva)                              (la Puerta del Cuerpo)
```

**De un nivel al otro (#156).** El cierre del Nivel 1 ofrece dos salidas:
huir por el desagüe, que lleva al Nivel 2 **sin** reiniciar el `Progreso`, o
volver al Atrio, que empieza de cero. Los dos cierres comparten `EscenaCierre`
(salidas, recuento y vuelta al Atrio). Las zonas que existen, su nombre y su
nivel están en `ZONAS_MAPA` (`lore/Mapa.ts`): de esa lista salen el mapa del
libro y las zonas que se pueden continuar, y `verificar-rutas` comprueba que
coincide con la suya. Las tres zonas del Nivel 2 forman una sola capa del
Vientre, la V (`escenas` en `lore/Vientre.ts`).

**Sin bisturí (#160).** En la cinemática el Cirujano suelta el bisturí, y el
Nivel 2 empieza con las manos vacías: `progreso.tieneBisturi` es falso desde el
cierre del Nivel 1 (y con `?nivel=2`). Sin él no hay golpe ni cargado ni
rebote; el parry se queda, como un empujón con el antebrazo que aturde sin
herir. La ayuda lo refleja quitando esas líneas (`ayudaDeControles(conDedos,
armado)`) y la botonera esconde el botón de golpear: no se dice «bloqueado».
Lo devuelve el **conteo del instrumental** de la Galería (`conteo` en la
definición del nivel, `objetos/ConteoInstrumental.ts`): bandejas con un
bisturí de verdad entre Remedos, que tiemblan. Coger un Remedo muerde (nunca
mata) y la bandeja se vuelve a contar con una pieza menos; la lógica, sin
Phaser, está en `systems/Conteo.ts`, con sus tests.

**La niña (#157).** Huye con el Cirujano en las zonas con `nina: true`
(`entities/Nina.ts`). No tiene vida, ni cuerpo de física, ni entra en ningún
grupo: nada puede tocarla, y no puede fracasar. No decide por dónde ir: repite
el camino del Cirujano a 20 px de camino por detrás (`systems/Rastro.ts`), así
que salta donde él saltó y nunca se queda atrás. Si él aparece lejos de golpe
(vuelve al Altar, se continúa una partida), el camino empieza de nuevo a su
lado en cuanto pisa suelo. En los rectángulos `aCuestas` de la definición va a
su espalda: en los Ductos, toda la trepa.

**Lo que hablan (#175, #176).** Las frases cortas salen sobre la cabeza sin
parar el juego (`ui/Bocadillos.ts`) y se turnan con un respiro
(`systems/Turnos.ts`): así dice el Cirujano que va sin bisturí, y así habla
ella al rezar, al recuperar el bisturí o si se quedan quietos un rato. Los
diálogos admiten dos voces: `voces` en un `Pensamiento` dice quién dice cada
cuadro, y el retrato y la placa cambian. Al llegar a cada zona del Nivel 2
hablan los dos (`desague`, `galeria`, `ductos` en `Pensamientos.ts`), y con E
se habla con ella (`lore/Charlas.ts`): el «E hablar» sale solo con el
Cirujano quieto y nada más a tiro de la E, y cada conversación se oye una vez
por partida.

**El Devoto vendado (#165).** `vendado: true` en la ronda de un Devoto. No ve:
solo nota al Cirujano si lo tiene pegado. Lo que suena sí le llega
(`hacerRuido` en la escena, radios en `RUIDO`): caer desde alto, el dash, los
golpes y los parry (a través de `Impacto.alRuido`) y la Injertadora. Andar no
suena. Al oír algo se para, ladea la cabeza hacia el sonido (el aviso que se
aprende) y va a ese sitio; si no encuentra nada, vuelve a su ronda. Quién oye
qué lo decide `systems/Ruido.ts`: un suelo de por medio se traga el ruido.

**Inicio y guardado (#149, #150).** Se entra por `InicioScene`: Descender,
Continuar (si hay un descenso guardado), Opciones y el portal. El descenso se
guarda (`systems/Guardado.ts`) al rezar en un Altar y al entrar en una zona:
la zona, el Altar encendido y el `Progreso` entero. Continuar restaura el
Progreso y arranca la zona con `{ altar }`. El cierre del Nivel 1 guarda el
principio del Nivel 2; volver al Atrio o llegar a la Puerta del Cuerpo lo borra.

**La vida y las Pociones viajan (#174).** Cada zona construye un Cirujano
nuevo, pero con la vida y las cargas de la Poción que traía
(`progreso.apuntarCirujano`, que la escena llama cada vez que cambian): bajar
de zona no cura, y se guardan con el descenso. Las reponen rezar en un Altar y
empezar otra partida; morir devuelve la vida pero no el frasco (#54). Lo que
cura con el cuerpo entero (carne, frutos de la Mata, Hongos) **va al frasco**
como una carga, si falta alguna (`systems/Frasco.ts`). Solo el Fervor empieza
de cero en cada zona.

Bancos de pruebas: `?tactil` va directo al Atrio, `?tactil&inicio` pasa por la
pantalla de inicio, `?cinematica` va directo al cierre del Nivel 1 y `?nivel=2`
al principio del Nivel 2.

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

## Tests

`npm test` corre los tests unitarios de `tests/` con Vitest, en Node y sin
navegador. Cubren la lógica que se puede probar sin Phaser: el guardado y el
Progreso, los ajustes, la memoria entre juego y portal (y sus claves), el mando,
la integridad del lore y las utilidades de texto de la web.

- `tests/preparar.ts` da un `localStorage` en memoria y `matchMedia`, y descarga
  los módulos entre tests: los singletons (`progreso`, `ajustes`) no arrastran
  estado de un test a otro.
- Un módulo que importa Phaser no se puede cargar en Node. Por eso `Ajustes`
  solo importa sus tipos: si un sistema nuevo necesita tests, que no dependa del
  motor más que lo justo.
- En cada PR, `scripts/exigir-tests.mjs` pide un test si cambia
  `src/systems/`, `src/input/` o los módulos de `web/src/`. Ver
  [CONTRIBUTING](../CONTRIBUTING.md#tests).

Lo que necesita el motor se prueba de otra forma: `verificar-rutas` (que cada
nivel se pueda desandar), `verificar-arte`, `verificar-textos` y
`probar-tactil`, que juega con dedos de verdad en Chrome.

## Estado actual

- **Nivel 1 — El Sacramento: completo.** Las cuatro zonas, el jefe, el cierre
  con la cinemática, la pantalla de inicio, el guardado en Altares, las opciones
  de accesibilidad, el mando y los dedos. El README lo cuenta para quien juega.
- **Nivel 2 — El Vientre Húmedo: en construcción.** Ya se juega de punta a
  punta: tres zonas (Desagüe, Galería de limpieza, Ductos) y el cierre ante la
  Puerta del Cuerpo, con lo recogido en el Nivel 1 (#156). Falta lo que hace de
  él una huida —la niña, el arranque sin bisturí, las persecuciones, los
  enemigos nuevos y la Serpiente en su nido—: issues #157 a #172.
- **Arte definitivo:** el de la sillería es del equipo; el resto sigue siendo
  provisional. Los encargos están en [`arte/encargos/`](arte/encargos/) y en las
  issues #105 a #107.

Lo que falta se sigue en las [issues](https://github.com/JeanCarloLond/Subterfuge/issues),
no aquí: una lista en un documento se queda vieja en cuanto se cierra una.

## Controles

| Acción                | Teclas                        | Mando (#152)            |
| --------------------- | ----------------------------- | ----------------------- |
| Mover                 | `A` / `D` o flechas           | stick o cruceta         |
| Saltar / doble saltar | `Espacio` o `Z`               | A                       |
| Dash                  | `Shift` o `X`                 | B                       |
| Atacar                | `J`, `C` o clic izquierdo     | X                       |
| Golpe arriba / abajo  | mantener `W` / `S` al atacar  | mantener arriba / abajo |
| Ataque cargado        | mantener y soltar (30 Fervor) | mantener X              |
| Parry                 | `K`, `V` o clic derecho       | LB                      |
| Lanzar un injerto     | `F` o `R`                     | RB                      |
| Poción de Carne       | `Q`                           | LT o RT                 |
| Silenciar el audio    | `M`                           | —                       |
| Ayuda de controles    | `H` o `Tab`                   | —                       |
| Pausa                 | `Esc` o `P`                   | Start                   |
| Rezar en un Altar     | `E`                           | Y                       |
| Leer el Códice        | `L`                           | Select                  |
| Trepar (colgado)      | `W` / flecha arriba           | arriba                  |
| Soltarse (colgado)    | `S` / flecha abajo            | abajo                   |

El mando entra como teclado (`input/Mando.ts`): cada botón se traduce en la
tecla que ya hace eso, así que vale en la partida y en todos los menús sin que
ninguna escena lo sepa. Rezar va en Y y no en la cruceta, que ya apunta y trepa.

### Opciones (#151)

Desde la pausa, **Opciones** abre una escena encima (`OpcionesScene`) con lo que
se recuerda en el navegador (`systems/Ajustes.ts`):

- **Sacudidas y destellos:** normal, suaves (sin destellos y sacudidas a un
  tercio) o apagados. Arranca en suaves si el sistema pide menos movimiento.
- **Música** y **efectos**, por separado, en cinco pasos.
- **Texto:** normal, rápido o al instante.
- **Sonido** (silencio) y **cursor**, que antes estaban sueltos en la pausa.

Toda sacudida de cámara pasa por `sacudir()` y todo destello a pantalla
completa por `destellar()`: un efecto nuevo que llame a `camera.shake` o
`camera.flash` directamente se salta el ajuste.

### El cursor es el bisturí

El ratón no es un accesorio aquí: el clic izquierdo corta y el derecho para. La
flecha del navegador encima de eso decía "esto es una página web", así que
`src/ui/Cursor.ts` la sustituye por el bisturí dorado del Cirujano, con la punta
del filo como punto caliente.

Es un cursor de **CSS**, no un sprite que persigue al puntero: un sprite va
siempre un fotograma por detrás del ratón de verdad, y eso se nota cuando el
ratón es un arma. A cambio, el navegador no sabe nada del zoom del juego, así
que el dibujo se reescala a mano contra el tamaño del lienzo y se rehace cuando
cambia la ventana.

**No uses `useHandCursor: true`.** Devuelve la manita del sistema justo encima
de los menús, que es el problema que esto vino a resolver. Para lo que se pueda
pulsar:

```ts
texto.setInteractive({ cursor: cursorActivo() });
```

`cursorActivo()` es el mismo bisturí con el filo encendido: misma silueta, para
que no dé un salto al pasar por encima de un botón.

Lo que devuelve **no es el dibujo, es `var(--cursor-diocesis-activo)`**. Los
objetos interactivos de Phaser se quedan con la cadena que se les dio al
crearlos, así que una cadena literal se congelaría: al cambiar de escala, o al
apagar el cursor desde el menú, el libro seguiría enseñando el cursor viejo
hasta que su escena se reconstruyera. Apuntando a una variable de CSS basta con
cambiarla en la raíz y cambia hasta el último.

Se puede **apagar desde el menú de pausa**, y la preferencia se guarda en
`localStorage`. Quien juega con teclado no mira el ratón en toda la partida:
para esa persona el bisturí solo es un dibujo que estorba.

## Diseño de los enemigos

Los tres se resuelven con la misma regla: **telegrafiar largo y castigar el
error**. Ninguno pide reflejos; todos piden leer.

| Enemigo   | Papel           | Aviso                          | Cómo se castiga                   |
| --------- | --------------- | ------------------------------ | --------------------------------- |
| Devoto    | Cuerpo a cuerpo | 420 ms con el brazo en alto    | Parry → 900 ms aturdido           |
| Vestal    | A distancia     | 520 ms alzando el sello        | Parry al sello → se lo devuelve   |
| Reformado | Jefe, 3 fases   | 380-620 ms, gesto por maniobra | Embestida fallida → 1,1 s abierto |

**Atacan con el cuerpo** (issue #146). El color solo ya no avisa: cada ataque
tiene una pose de carga, que es la ventana del parry y se tiene que leer de
lejos, y una de golpe, más un rastro en el aire (`systems/GolpeEnemigo.ts`).

| Enemigo   | Carga                                                     | Golpe                                    |
| --------- | --------------------------------------------------------- | ---------------------------------------- |
| Devoto    | `devoto[-b]-alza`: brazo sobre la cabeza                  | `devoto[-b]-golpe` + tajo en media luna  |
| Vestal    | `vestal[-cazadora]-alza`: sello en la mano, encendiéndose | `-lanza`: el sello sale de la mano       |
| Reformado | `reformado-zarpa-alza`: pata junto a la cabeza            | `reformado-zarpa` + tres garras de hueso |

La embestida baja la cabeza (el cuerpo entero se inclina) y deja polvo; el salto
levanta polvo al despegar y al caer. Las poses miden lo mismo que su figura base
porque la caja de física se calcula sobre el cuadro, y la pose de golpe se queda
un poco más que el daño: solo se ve, la ventana no cambia. El tajo enemigo
**nunca es dorado**: el oro es el bisturí del Cirujano. Al arte final le bastan
PNG con esas claves; si falta una pose, el enemigo usa su figura base.

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

**Quién es** (issue #33): la biblia deja al progenitor del Cirujano "muerto, o
reformado, en un sacramento fallido". El teaser toma lo segundo: el Reformado
de la Sala 7 es lo que queda de las **Manos anteriores** de esa misma Sala,
dejadas donde fueron hechas. Se cuenta sin cinemáticas, con lo que ya existe:
el margen del Códice V ("Mi padre está allí"), dos placas del Registro en la
antesala, un pensamiento del Cirujano al entrar (`DefinicionNivel.llegada`), la
**presentación** centrada al despertar (`Jefe.presentacion`: cargo y subtítulo)
y dos pensamientos más al despertar y al caer (`alDespertar`, `alCaer`). Sin
nombre propio: nadie lo tiene en la Diócesis; se le llama por su cargo.

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

## Las criaturas del Vientre: tres contratos (#90)

El Vientre Húmedo trae once especies y casi ninguna es un enemigo. Si todas
entraran en el grupo de enemigos, un tajo al aire mataría al Mondador —el animal
sagrado, casi extinto— por accidente. Por eso cada especie declara un
**contrato**, y la escena la mete en un grupo distinto:

| Contrato                              | Especies                 | Tajo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Injerto | Hiere al rozar |
| ------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------- |
| `hostil`                              | Remedo, Serpiente, Cerdo | sí                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | sí      | sí             |
| `neutral`                             | Serpiente                | Mini-jefe (#98). Duerme hasta que entras en su arena; se presenta y saca su barra. Telegrafía cada embestida (≥ 500 ms); si falla, se estrella en el borde y queda aturdida 900 ms (el tajo entra entero; fuera de ahí, las escamas paran la mitad). Bajo la mitad de vida abre la boca y traga: te retiene y te escupe con 1 menos, salvo que salgas con dash. El parry también la aturde. Si mueres, el combate se reinicia; al morir suelta 2 injertos y emite `serpiente-vencida` para que el nivel abra el ducto. |
| Mondador, Buitre, Cuervo, Mata, Hongo | no                       | no                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | no      |
| `peligro`                             | Zarza, Alfombra, Vena    | si se corta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | no      | sí             |

Un nivel las declara en un solo campo, `criaturas`, con un `tipo` por entrada
(`src/entities/Criatura.ts`). **Añadir una especie no toca `EscenaNivel`**: su
entrada en `CriaturaDef`, su clase (cumple `Habitante`, y `Enemigo` si se puede
herir) y su fábrica en `FABRICAS`.

Tienen ya su clase todas las especies: Remedo, Serpiente, Mondador, Buitre,
Cerdo, Cuervo, Zarza, Alfombra, Mata, Vena, Hongo y la Flor de hueso (#96 a
#104, #125). Las colocan los niveles en su campo `criaturas`. Un nivel que
declare una criatura sin clase **falla al cargar**: un nivel al que le falta su
depredador sin que nadie lo note es peor que uno que no arranca.

| Especie  | Qué hace                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Remedo   | Quieto y gris, parece instrumental. Tiembla si te acercas (el tell). Pegado, muerde 1 y huye; no acosa.                                                                              |
| Mondador | Recorre su ruta y se para a comer. Si le lanzas un tajo cerca, huye y no vuelve en esa visita.                                                                                       |
| Buitre   | Posado. Si llegas corriendo o le tiras un tajo, se va y vuelve al rato.                                                                                                              |
| Cerdo    | Pasea y come en su corral; se asusta si llegas corriendo. No ataca, pero se puede matar (#100): deja carne engastada que cura 2 y el HUD dice «propiedad del linaje».                |
| Cuervo   | Salta al siguiente posadero cuando te acercas: seguirlo lleva a donde el nivel quiera.                                                                                               |
| Zarza    | Muro: no se atraviesa. Rozarla hiere. Se corta a tajos (2 por tile), da Fervor y no vuelve a crecer.                                                                                 |
| Alfombra | Respira si te acercas. Pisarla atrapa y quita 1 cada 1,2 s, sin empujón. Se sale saltando, con dash o cortándola.                                                                    |
| Mata     | `E` para cosechar: 3 frutos; casi siempre cura 1, a veces es amargo y a veces muerde un Remedo.                                                                                      |
| Hongo    | Luz fría (un brillo aditivo, como velas y Altares, pero verde) que sube y baja a la vez en toda la zona: el reloj de la ciudad. `E` lo come: cura 1 y se apaga para la partida.      |
| Flor     | La de la Cena de la Ausencia (#125). `E` la recoge: 10 de Fervor y una línea. Una por nivel; no vuelve.                                                                              |
| Vena     | Cortina de carne que cierra un paso (#101). No hiere: bloquea. Se abre en el pico del Latido (0,8 s de cada 2,6 s), con un golpe que lo anuncia; con la Marea, 0,45 s de cada 1,5 s. |
| Tejido   | Nódulo al borde de un hueco (#95). `E` gasta un injerto y crece un puente de carne que pasa a ser suelo. Sin injertos, avisa y no gasta. Siempre opcional.                           |

Las criaturas no reciben la escena entera, sino un **contexto** con lo justo
(`ContextoCriatura`): dónde está el Cirujano, herirlo, curarlo, avisar en el
HUD, hacerse sólidas para él. Así ninguna especie acaba tocando la cámara o el
HUD por su cuenta.

Un nivel con `lluvia: true` tiene **Lluvia Tibia** (#96): gotas finas de agua
oxidada, fijas a la cámara como el polvo y detrás de todo. Es ambiente, no moja.
Arrecia mientras la Marea avisa y sube.

Un nivel con `mareas` tiene **Mareas del Hambre** (#91), el fenómeno de la
biblia: "cuando los Viscerales digieren, los ductos expulsan fluidos tibios que
inundan las criptas bajas". Es un temporizador (`src/systems/Marea.ts`):
reposo → aviso → subiendo → crecida → bajando. El aviso se oye (el Latido que
se acelera), se lee ("sube el agua"), se ve (arrecia la lluvia) y lo anuncian
los animales: el **Buitre se va** y no vuelve hasta que baja el agua, y el
**Cuervo grazna** tres veces. Tocar el agua hiere y empuja hacia arriba; si
cubre al Cirujano entero, lo devuelve al último Altar con un punto menos, como
la caída al vacío. Nunca mata de golpe. Se para sola con la pausa y el Códice.

**El nivel decide hasta dónde sube** (`alturaMaxima`): nunca hasta el Altar de
la entrada ni el umbral de salida, y siempre con una repisa a salvo por encima.
La **Vena** late más rápido mientras dura: la ventana para cruzarla se acorta.

**Por tramos (#163).** `mareas` es una lista: cada una inunda su región
(`x0`..`x1`; sin indicar, todo el ancho) y puede llevar `desfaseMs` para no subir
a la vez que otra. Solo hiere la que inunda donde está el Cirujano. Cada una
deja en la pared una **raya de sedimento** a la altura de su cresta: como se
dibuja con el mismo número con el que sube, no puede mentir. El ciclo, la
región y la cresta van sin Phaser en `systems/CicloMarea.ts`, con sus tests, y
`verificar-rutas` comprueba cada marea solo contra los Altares de su región.

**Fieles del Vientre Húmedo (#87).** El Tanteador explica la Alfombra («la de
verdad tiene fleco; la otra respira») y la Honguera habla del Mondador como de
un compañero de oficio. Los dos tienen ficha en LOS FIELES, que se abre al
hablar con ellos. Sus frases sobre la niña y la huida esperan al acta.

**Sonido (#108).** Cada especie suena a su materia, sintetizado como el resto:
la Serpiente silba antes de embestir, el Cuervo grazna con resonancia de cable,
la Alfombra susurra y chasquea, la Marea retumba al subir y al bajar. Lo que se
repite solo (graznidos, ronroneos, el pulso de la Vena) suena únicamente si la
criatura está a menos de 260 px del Cirujano. La música del Vientre Húmedo
espera a elegir una pista CC0.

**Detalles que unen unas especies con otras.** La Zarza puede llevar un Remedo
escondido (`remedo: true`): solo sale si se corta, y sale huyendo. La Serpiente,
al despertar, pone la música de combate y la devuelve al vencerla o si se
reinicia el combate; y el Cuervo que esté cerca grazna en alarma. La Vestal
puede ser **cazadora** (`cazadora: true` en `vestales`): lleva la máscara de
caparazón de Mondador. La Lluvia Tibia se oye: un siseo en bucle con gotas
sueltas, que arrecia con la Marea.

Una criatura puede poner otra en el nivel (`ctx.crear`). Entra en su grupo como
las del principio; los solapes de neutrales y peligros se registran después de
colocar las iniciales, así que una criatura nueva de esos dos contratos solo
funciona si el nivel ya tenía alguna de su contrato. Hoy solo aparece el Remedo,
que es hostil.

**Ojo con los grupos de Arcade.** `group.add` le reaplica al cuerpo los valores
por defecto del grupo: lo vuelve movible, le devuelve la gravedad y lo
reactiva. Por eso las criaturas entran con `meterSinPisar`, que los conserva.
Sin eso la Zarza dejaba de ser un muro y lo posado se caía del mundo.

Se catalogan al verlas (a menos de 170 px), como los Devotos, pero solo si su
ficha del Registro ya está escrita (#88): un id sin ficha contaría en la web
como algo descubierto sin texto que leer.

## La Injertadora: un arma a distancia que no se come al bisturí

El mecanismo con el que se encajaban las prótesis a presión, en pocos
instantes, sin que al ofrendado le diera tiempo a moverse. Sigue funcionando;
lo único que ha cambiado es hacia dónde apunta. Se carga con los **injertos de
metal** que sueltan algunos fieles al caer: el Cirujano le saca la pieza a un
cuerpo y se la mete a otro.

El riesgo de meter un arma a distancia en un juego cuyo combate se sostiene en
acercarse es que la distancia se vuelva la respuesta a todo. Tres reglas lo
impiden, y están en `INJERTADORA` y `OFRENDA` (`src/config/Sacramento.ts`):

1. **La munición solo cae peleando de cerca.** Para disparar hay que haber
   cortado antes. No hay Altar que la reponga: el metal no se fabrica, se
   hereda.
2. **No da Fervor al acertar.** El Fervor se gana con el cuerpo, así que el
   golpe cargado y las Pociones siguen dependiendo de entrar a rango. Si el
   injerto diera Fervor, dispararlo sería la forma óptima de cargar el golpe
   cuerpo a cuerpo, que es justo lo contrario de lo que se quiere.
3. **El enfriamiento no deja vaciar la carga de golpe.**

Daño 3: entre el golpe normal (2) y el cargado (6). Útil, no resolutivo. Es
para lo que el bisturí no alcanza — un Vestal en una repisa —, no para
sustituirlo.

La carga vive en `Progreso`, no en el Cirujano: cada zona construye un Cirujano
nuevo, y si viviera en la entidad, bajar un piso vaciaría el arma y la munición
que costó pelear se perdería en la puerta.

Se empieza con **un injerto cargado**, y no con cero. Cero era la idea original
—que el jugador descubriera de dónde sale la munición en el momento en que le
importa—, pero escondía el arma entera: pulsabas `F` y no pasaba nada, el
indicador del HUD no aparecía, y la Injertadora solo existía si tenías la
suerte de que un Devoto soltara metal. Con uno cargado se ve y se prueba en el
primer minuto, y a partir de ahí ya es escasa de verdad.

Pulsar `F` sin munición **suena y lo dice en el HUD**. Un botón que no hace
nada visible se lee como un botón roto, no como un arma vacía.

## Diseño de niveles: por qué hay desvíos

Un nivel sin nada que ganar explorando es un pasillo, por muy largo que sea.
Cada zona sigue la misma regla: **el camino principal enseña, los desvíos
premian**. Cada desvío exige una mecánica (doble salto, dash, agarre) y guarda
una de dos cosas:

- **Fragmento del Códice** — premio de lectura. Ocho en el Nivel 1 (`Codice.ts`).
- **Reliquia** — premio de cuerpo. `Relicario de Carne` (+1 vitalidad máxima)
  y `Frasco Consagrado` (+1 Poción). Siete en el Nivel 1, persistentes entre
  zonas (`Progreso.ts`).

**Ningún total se escribe a mano (#94).** Las hojas salen de `Codice.ts`, las
fichas de `Registro.ts`, las capas de `Vientre.ts` y las reliquias de
`src/lore/Reliquias.ts`, una lista con su zona y su nivel. Los niveles colocan
las reliquias y la lista las cuenta; `verificar-rutas` comprueba que coinciden.
Cada cierre cuenta las de su nivel (`reliquiasDelNivel`), como con el Códice;
la web cuenta el total.

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

## El folio del Códice

La lectura (`L`) no es un panel: es una **hoja del Códice tal como existe en el
mundo** (issues #34 y #35). El world bible lo describe como escritura sagrada
reescrita sobre los manuales técnicos de Genesis Vestal, con "anotaciones al
margen hechas por alguien que intentó advertir algo", y el folio tiene esas
tres capas:

1. **Debajo**, casi invisible, el manual: una cabecera técnica ("GENESIS VESTAL
   · PROTOCOLO") y una rejilla de formulario que asoman a través del pergamino.
   Es para quien mira dos veces, como el resto del universo.
2. **Encima**, la escritura: rúbrica en rojo, inicial versal, versículos
   numerados, filete doble de oro, cabecera con capítulo y folio en romanos. Lo
   que la Diócesis enseña, en tinta.
3. **Al margen**, a lápiz: la otra mano. Gris (nada oficial en el Códice es
   gris), en cursiva, inclinada tres grados y con su corchete. Llega medio
   segundo **después** del versículo, para que primero se lea lo oficial y
   luego la duda. Antes las dos voces compartían panel y tipografía y se leían
   como un solo texto.

   **Sin etiqueta que lo anuncie.** Llevó un rótulo _"al margen, a lápiz:"_ y
   se quitó: un folio del Vientre no se anota a sí mismo, y quien escribió eso
   lo hizo a escondidas, no iba a ponerle título. El lápiz, la inclinación, el
   corchete y el retraso bastan para leerlo como otra mano. Si alguna vez
   quedara flojo, la respuesta es reforzar lo visual —más inclinación, un
   tachón, una línea que una el margen con el versículo—, nunca volver a poner
   texto que explique lo que el ojo ya entendió.

Y la materia del mundo sobre el papel: cera de vela en el borde, una huella de
sangre abajo a la derecha, los filos rotos y los bordes oscurecidos por el uso.
Paleta del bible: carne, sangre, oro litúrgico, hueso. Todo con `Graphics`; no
hace falta arte nuevo, aunque una textura de pergamino de la artista lo
mejoraría. Las hojas que faltan aparecen como _arrancadas_ en el índice.

## La web de la Diócesis (`web/`)

El profesor pidió tres cosas tras la presentación: una web externa al juego
para profundizar en el universo (#63), minijuegos complementarios (#64) y una
genealogía o jerarquía de personajes y entidades (#62). Viven en `web/`, en
este mismo repositorio, y se publican con el juego en el mismo despliegue de
GitHub Pages: el juego en `/Subterfuge/` y el portal en `/Subterfuge/web/`.
Vite compila las dos páginas (`build.rollupOptions.input`).

**Qué es.** El bible lo describe en el Taller 4: "el sitio no se presenta como
ficción; se presenta como el portal oficial de la Diócesis de la Carne". Es una
sola página con rutas por hash (`web/src/main.ts`) y **la navegación es un
descenso**: cada sección tiene una profundidad (`data-profundidad` en `<body>`)
y el sitio se oscurece y se desordena al bajar. La portada parece la web de una
iglesia; los Sacramentos ya no.

| Sección     | Profundidad | Qué enseña                                                                   |
| ----------- | ----------- | ---------------------------------------------------------------------------- |
| Portada     | 0           | La fachada institucional: horarios, trámites, tu expediente.                 |
| Pabellón 9  | 0           | El Atrio por dentro: un pabellón, su Libro de Diezmos y una jornada (#79).   |
| Doctrina    | 1           | El Códice como libro que se hojea (`libro.ts`), y la **Vigilia**.            |
| Registro    | 2           | Las fichas del juego con su lámina: el sprite real, pintado en un canvas.    |
| El Vientre  | 3           | El plano: salas, pasos y atajos, del Atrio a la Puerta del Cuerpo.           |
| Linaje      | 4           | El esquema de #62: dioses, clero, oficio, fieles, ofrenda y destinos (SVG).  |
| Sacramentos | 5           | El **Examen de Pureza** y **El Sacramento** (canvas). Los minijuegos de #64. |

**Lo que se gana bajando.** El juego apunta en `localStorage` (clave
`diocesis.memoria`, ver `src/systems/Memoria.ts`) lo que el jugador ha
descubierto alguna vez: fragmentos, fichas, capas, reliquias y tres hitos (el
jefe, el cierre y la cinemática del sacramento, `nina`). Es la unión de todas las partidas y nunca se borra desde el
juego. Como juego y web comparten dominio, la web lo lee y abre lo que la
Diócesis no publica: los márgenes del Códice y el manual de Genesis Vestal
debajo, las fichas con nombre, las capas cerradas, y los expedientes del Linaje
(la corporación, las herejías, las Manos anteriores, la niña). Para quien no ha
jugado en ese navegador hay **claves**: frases del mundo que se presentan al pie
de la página o vienen en la URL (`#/doctrina?clave=...`, pensado para un código
QR). Una está en el código fuente de la web, que es donde el bible dice que
debe estar.

**Las láminas.** `scripts/exportar-arte.mjs` lee las figuras de
`ArteProvisional.ts` (mapa de caracteres + paleta) y escribe
`web/generado/arte.json`, que no se versiona; corre antes de `dev` y de
`build`. Así la web nunca dibuja un sprite distinto del que dibuja el juego.

**Los textos** salen de `src/lore/*` sin duplicarlos. Van sin tildes por la
fuente del juego; `web/src/texto.ts` devuelve las que se pueden devolver sin
ambigüedad y deja en paz las demás.

**Los minijuegos** son los del bible, no otros: el Examen de Pureza ("un test
que responde cosas que no deberías saber de ti": sabe cuántas veces lo has
hecho, hasta dónde has bajado y qué hora es; se rellena a tinta en un expediente
del Registro y la resolución se sella con lacre), el Sacramento ("precisión
quirúrgica, tipo Operation pero litúrgico"; a pixel, siete pasos —uno es apartar
de la bandeja el bisturí que tiembla, porque es un Remedo (#113)— que acaban a
corazón abierto, con el injerto dado entre latido y latido; fallar deja una
mancha en el portal que persiste) y la Vigilia ("mantén encendida una vela mientras lees el Códice";
al apagarse se ve lo que la luz tapaba; la vela vive en la esquina, a pixel, y se
aviva con un fósforo: `web/src/vela.ts`). El Sacramento hecho perfecto también
termina en Reformado: ningún Elegido ha llegado entero en tres generaciones.

**Despliegue gratuito.** GitHub Pages, sin servidor: todo es estático y el
estado vive en el navegador de cada visitante. No hay cuentas ni base de datos
que pagar ni mantener.

## Diálogos con retrato

Desde #145 cada diálogo enseña la cara de quien habla, al estilo de Stardew
Valley: el texto a la izquierda y, a la derecha, un nicho con filete de oro, el
retrato y una placa con el nombre.

- **Quién habla.** Las voces de `src/lore/Voces.ts` llevan su `retrato`; los
  pensamientos de `Pensamientos.ts` son del Cirujano salvo que digan otra cosa.
  El nombre de la placa y los fotogramas que usa cada uno están en
  `src/lore/Retratos.ts`.
- **Cómo se mueve.** Mientras se escribe la línea, la boca alterna los
  fotogramas de habla cada dos letras y se cierra en los espacios y los signos.
  Con la línea entera, la cara se queda quieta y parpadea de vez en cuando. El
  Cirujano no habla con la boca: lleva la máscara de pico, así que solo respira
  y la luz le corre por el pico. La Vestal de Registro y la auxiliar mueven la
  mascarilla; el tanteador lleva venda y no parpadea; el Reformado respira.
- **El arte.** Los retratos son de 32×32 y se ven al doble. Ahora son
  provisionales y están escritos a mano en `src/systems/RetratosProvisionales.ts`
  (base y fotogramas que solo reescriben las filas que cambian). Las texturas se
  llaman `retrato-<clave>` y `retrato-<clave>-<fotograma>`: si PreloadScene
  carga un PNG con esa clave, se usa el PNG y no se pinta el provisional. Así el
  arte del equipo entra sin tocar código.

## La cinemática del sacramento (#147)

Al caer el Reformado y cruzar el umbral, `FinalScene` se pone en pausa y lanza
`CinematicaScene`: la primera vez que se ve a la niña. No es gameplay —ni HUD,
ni botonera, ni control del Cirujano— y las **bandas panorámicas** que entran
deslizándose son la señal de que ahora no se juega. Al acabar, el cierre sigue
con su línea, el título y el recuento.

- **El guion** vive en `lore/Cinematicas.ts`: orden de los planos, cuánto dura
  cada uno, el subtítulo y cuándo entra, y el ritmo del Latido (fijo, o un par
  `[desde, hasta]` que lo acelera). Narrativa ajusta ahí sin tocar la escena.
  Los subtítulos son los cuatro pensamientos que antes salían sobre negro en el
  diálogo `cierre`, que ya no existe.
- **Lo que hay dentro de cada plano** está en `CinematicaScene`, una función por
  plano. Cada corte vacía la capa entera: son cortes, no transiciones.
- **Cortes, no zoom.** El arte se ve a escala entera (Nitidez) y un zoom
  fraccionario hace temblar el pixel. Un plano general es el arte del juego a
  x2; un primer plano es otro dibujo, más grande, a x5.
- **Dos actos.** El I es el instante (abre los ojos, el tejido va hacia el
  filo, el bisturí en alto). El II es la decisión: a oscuras se oye caer el
  bisturí, ella baja de la camilla y huyen por el desagüe de la Sala 7.
  `ACTO_II` lo apaga con un solo cambio y la cinemática acaba con el bisturí en
  alto.
- **El sonido manda**: un solo bucle de Latido para toda la escena (un corte no
  reinicia el corazón), silencio en el contraplano de la máscara y
  `sonido.bisturiCae()` como único sonido de la decisión.
- **Saltar** es mantener pulsado un segundo (ESC, ratón o dedo), con un aro que
  se llena. Un toque suelto no la corta. La primera vez el aviso espera cuatro
  segundos; si ya se vio (hito `nina` en `Memoria`), sale desde el principio.
  El dedo que la salta no puede, al levantarse, devolver al Atrio: el cierre no
  acepta toques hasta que vuelve.
- **El arte** es provisional y a mano, en `systems/CinematicaProvisional.ts`
  (texturas `cine-<clave>` y `cine-<clave>-<fotograma>`), más tres poses del
  Cirujano en `ArteProvisional` (`cirujano-alza` y `cirujano-sin-bisturi`, con
  sus pasos). La niña sale del arte conceptual del equipo: melena corta, túnica
  blanca, descalza, con el anillo de luz detrás. **Sin cruces**: los rayos del
  anillo van desfasados de los ejes. Un PNG con la misma clave sustituye al
  dibujo sin tocar código.
- **Para verla sin jugar**: `?cinematica` en la URL arranca directamente en el
  cierre.

### Pabellón 9: el universo desde el suelo (#79)

El resto del portal mira el Vientre desde arriba. `#/pabellon` baja a donde vive
la gente: cuarenta casas que comparten cuota, con el Libro de Diezmos que lleva
su Decano. Lo que el bible cuenta como "prácticas culturales" no se enumera: se
usa.

- **El plano** es la sala de hospital que fue: cuarenta alvéolos a los lados de
  un pasillo, con la capilla (el Muro de los Dientes, la Piedra Tibia) a un
  extremo y la Oficina del Decano al otro. Cada camilla abre su línea del Libro.
  Las que tienen nota son una ley o una costumbre puesta en una dirección: la
  casa cosida, el Primer Tacto, la que subió, la que está en seguimiento.
- **La camilla 22 es la casa de la niña.** Sus asientos cuentan la noche del
  Sacramento como la escribiría un Decano, y se completan con lo jugado: con el
  cierre, el Registro da la deuda por saldada; con el hito `nina`, el Colegio la
  suspende, la cuota del pabellón entero vuelve a no estar cubierta y aparece el
  aviso de la Sala vacía. Si una casa falla, deben todas.
- **La jornada** es la de Tomás, cerero de la 14, la víspera del sacramento, en
  seis momentos que cambian la luz del plano y tienen su gesto: moldear velas y
  entregarlas, apoyar la palma en la Piedra Tibia, dejar el bocado del Hambre,
  apagar la vela (soplarla es falta y queda anotado) y rezar la Letanía.
- **Lo que deja en el resto del portal:** el plano del Vientre gana el Vientre
  Húmedo y la Puerta del Cuerpo, y tras el hito `nina` dibuja el rastro de la
  Sala N.º 7 por el desagüe; la ficha de la niña en el Linaje lleva a su casa
  (`#/pabellon/22`); la portada anuncia la Sala N.º 7 cerrada.

## El mando de los dedos

`src/ui/TactilScene.ts` dibuja la botonera y `src/input/Tactil.ts` guarda el
estado; `Controles` lee ese estado junto a las teclas, así que para el resto
del juego un botón y una tecla son lo mismo.

**Los dedos se leen del navegador, no de Phaser** (`src/input/Toques.ts`,
#72 y #75). Un `Pointer` de Phaser pasa por demasiadas manos: se reparte entre
escenas y la de arriba puede quedárselo, guarda en caché los límites del lienzo
(y esa caché envejece al entrar en pantalla completa, así que los toques caen
desplazados), y su `isDown` se queda encendido si se pierde un `touchend`. Las
tres cosas dejaron el mando muerto en el móvil de un probador. `TouchEvent.touches`,
en cambio, es la lista **autoritativa** de dedos puestos: se copia entera en
cada evento, así que no hay estado que pueda desincronizarse, y el rectángulo
del lienzo se lee en el momento del evento, nunca antes.

Sobre eso, **la entrada se deriva, no se acumula**: cada fotograma se mira qué
botón tiene cada dedo debajo (el más cercano dentro de su alcance) y se manda
el conjunto entero con `tactil.fijar()`. Nada se queda pulsado sin dedo encima,
arrastrar el pulgar de un botón a otro cambia de acción, y volver de una
pantalla deja el mando limpio.

**Un dedo no es un clic izquierdo** (#75). Phaser marca `buttons = 1` en cada
toque, así que para `leftButtonDown()` cualquier dedo en la pantalla —la
cruceta incluida— era el botón de atacar: el Cirujano encadenaba golpes solo,
el estado `atacando` le bloqueaba el movimiento y parecía que el juego se había
colgado. `Controles` ignora los botones del ratón cuando el aparato es táctil.

**Un botón no atiende a un dedo anterior a él** (#75). Abrir el libro con el
botón `L` dejaba el dedo justo encima de la cruz de cerrar, que nacía debajo y
se quedaba con su suelta: el libro se abría y se cerraba en el mismo gesto.
`toques` entrega, con cada suelta, el instante en que ese dedo se posó, y los
botones descartan los que son anteriores a su propia creación.

**El tamaño sale de la pantalla, no del lienzo** (#73). 44 px CSS es el mínimo
de un objetivo táctil; se traduce a píxeles internos con
`displaySize.width`, así que en un teléfono pequeño los botones salen
proporcionalmente más grandes, que es justo lo que hace falta. Las posiciones
van en unidades de radio desde su esquina (`BOTONES`), de modo que la botonera
entera crece y encoge sin solaparse. Los márgenes de la muesca y la barra de
gestos se leen de `--seguro-*`, que `style.css` copia de `env(safe-area-inset-*)`.

**Cómo se prueba esto sin un teléfono.** `?tactil` fuerza el modo dedos en un
ordenador y expone `window.juego`; `npm run probar-tactil` (con el juego
servido en `localhost:4173`) abre Chrome sin ventana, manda toques de verdad
por el protocolo de DevTools y comprueba doce cosas: que la cruceta mueva, que
mover no ataque, que soltar pare, que un toque cancelado no se quede pegado,
que se pueda correr y saltar a la vez, que el libro se abra y se cierre **dos
veces seguidas**, y que tras morir el mando siga respondiendo. Los fallos de
móvil no los caza ningún linter ni se ven en una captura: son de
comportamiento, y esta es la forma de que no vuelvan.

**Las pantallas tienen salida** (#74). El libro, el diálogo y la pausa se
escribieron para teclado, y sus cierres eran textos de 7 px en una esquina.
`src/ui/BotonTactil.ts` es el botón redondo que usan las tres: el área que
responde es 1,5 veces el círculo dibujado, y se actúa al **levantar** el dedo,
para poder corregir un toque arrastrando fuera.

## El portal está hecho del juego (#80)

La primera versión del portal era una web institucional limpia sobre papel
claro que se oscurecía al bajar: se leía bien, pero como una página
informativa cualquiera. La revisión pidió la identidad del juego, y la
respuesta fue no inventar una estética nueva sino **construir la web con las
piezas del juego**:

| Pieza                         | De dónde sale                                                                                                                                                                                                            | Dónde vive                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| **El muro de cada sección**   | La sillería del equipo (`vientre.png`) en el Atrio; las figuras `muro-pasillos-*`, `muro-criptas-*` y `muro-salas-*` en el resto, en damero. Al bajar de sección cambia la pared: descender es degradarse, como jugando. | `web/src/ambiente.ts` (`ponerMuro`) |
| **La escena de la portada**   | El Atrio montado con los sprites del juego: sillería, ventanas con haces de luz, cadenas, el Altar entre dos velas, el Cirujano y un Devoto. Solo se anima la luz.                                                       | `web/src/escena.ts`                 |
| **Las láminas de las placas** | Cada placa lleva el sprite de lo que enlaza (el Códice, un Devoto, el Reformado, la camilla…). Se declaran en el marcado con `<canvas class="lamina" data-figura="...">` y `pintarLaminas()` las rellena.                | `web/src/arte.ts`                   |
| **El polvo**                  | Las motas del juego, cuadradas, del color de la capa.                                                                                                                                                                    | `ambiente.ts` (`arrancarPolvo`)     |
| **La vela del visitante**     | Un resplandor que sigue al puntero: el Vientre está a oscuras y se lee con lo que se lleva en la mano.                                                                                                                   | `ambiente.ts` (`arrancarLuz`)       |
| **La música**                 | Las pistas CC0 del juego, una por capa, con fundido. **Solo suena si se pide** (botón Sonido); la preferencia se recuerda pero no arranca sin un gesto.                                                                  | `ambiente.ts` (`ponerPista`)        |
| **La marca**                  | La vela del juego en lugar del círculo con cruz, que se leía como cristiana.                                                                                                                                             | `index.html`, `pintarMarca()`       |

Y tres decisiones de composición:

- **Documentos clavados al muro.** Lo que se lee va en pergamino sobre piedra
  (folios, fichas, placas, la ficha del explorador), como el Códice y las
  placas dentro del juego. En CSS es un ámbito: dentro de `.tarjeta`,
  `.ficha`, `.linaje-panel`… los tokens `--tinta`, `--oro`, `--sangre` se
  redefinen para pergamino y todo lo de dentro les sigue sin una regla más.
- **La voz del HUD.** Etiquetas, números y botones en Silkscreen (pixel), los
  botones biselados como los del juego. Los títulos en Cinzel y el cuerpo en
  Crimson Pro. Dentro de los diagramas SVG no se usa pixel: a 8 px escalado
  deja de leerse.
- **Cambiar de sección es bajar o subir.** El contenido sale, el muro cambia
  mientras no se ve nada y lo nuevo entra desde abajo si la capa es más honda
  y desde arriba si se vuelve. Un riel a la izquierda (pantallas anchas)
  marca la capa y la cota en metros.

Con `prefers-reduced-motion` no hay polvo animado, la vela no sigue al
puntero y no hay transiciones. En un teléfono la escena se encuadra solo en
sus figuras y el título va debajo.

### Cuando llegue el arte final, la web no puede quedarse sin láminas (#115)

La web no carga PNG del juego: `npm run exportar-arte` lee las figuras de
`ArteProvisional.ts` y las vuelca en `web/generado/arte.json`, y de ahí pinta
cada lámina (`pintarFigura`). Las once especies del Vientre Húmedo ya están
ahí con su clave (`mondador`, `remedo`, `serpiente`, `buitre`, `cerdo`,
`cuervo`, `zarza`, `mata`, `alfombra`, `vena`, `hongo`).

El día que el equipo entregue el PNG definitivo de una especie:

1. Se carga en `PreloadScene` con la **misma clave** (sin `-placeholder`) y el
   juego lo usa.
2. **La figura provisional no se borra hasta que la web tenga otra fuente**:
   si se borra, `pintarFigura` devuelve `false` y el Registro enseña la vitrina
   con la cruz de lámina pendiente. No se rompe, pero se pierde el dibujo.
3. Para pasar la web al PNG, `exportar-arte` tiene que aprender a copiar ese
   PNG a `web/generado/` y `pintarFigura` a dibujarlo como imagen. Es un cambio
   pequeño, pero va en su propio PR, no colado con el arte.

## Linaje y El Vientre: dos exploradores, no dos posters

Las dos secciones con diagrama (`web/src/paginas/linaje.ts` y `vientre.ts`)
comparten el mismo patrón, y comparten los dos fallos que señaló la revisión:

**Los rótulos se pisaban** (#77). El Linaje dibujaba el verbo de las
veintiocho relaciones a la vez, y se cruzaban entre sí y con los nodos hasta
ser ilegibles. Ahora las aristas guardan **dónde iría** su rótulo
(`sitios`, una función del punto del recorrido) y solo se pintan los de la
entrada seleccionada: como mucho cinco, y salen en direcciones distintas. Al
colocarlos se prueban varios puntos de la curva (0,5 · 0,36 · 0,64 · …) hasta
dar con uno que no pise a otro rótulo ya puesto.

**Había que desplazarse para verlo todo** (#78). El diagrama ocupaba el ancho
entero y la ficha quedaba debajo, así que leer una entrada era bajar, leer,
subir a buscar la siguiente y volver a bajar. Ahora es un explorador: el
diagrama a la izquierda —escalado para caber entero en el hueco que deja la
ventana, `height: clamp(340px, calc(100vh - 400px), 620px)`— y la ficha a la
derecha. Y **las relaciones de la ficha son botones**: pulsar una salta a esa
entrada y el diagrama la sigue, de modo que el linaje se recorre de nombre en
nombre sin volver al dibujo a buscar. Lo mismo con las salidas de cada sala en
el plano del Vientre.

En un teléfono no hay forma de que un grafo de siete niveles quepa legible, así
que ahí el diagrama vuelve a arrastrarse (`overflow: auto`, `min-width: 860px`)
y la ficha va debajo. El `min-width: 0` del contenedor es lo que impide que ese
ancho mínimo estire la rejilla y desplace la página entera de lado.

## La voz del portal

Los textos propios de `web/` (no los que vienen de `src/lore`) hablan como
habla una institución que atiende al público: parroquia y hospital a la vez,
amable, administrativa, un poco anticuada. "Se recuerda a los fieles", "consta
en su expediente", "gracias por su paciencia". Es lo que pide el bible para la
web como obra madre: "burocracia religiosa normal hasta que empiezas a hurgar",
como Welcome Home parece una empresa de restauración (#71).

Las grietas van en lo pequeño y nunca se subrayan: un trámite que no debería
existir ("Reclamaciones sobre el peso: no se admiten"), una nota interna que
se coló en una ficha, un "no hace falta que nos cuente lo que vio". Fuera los
remates aforísticos y las estructuras "no es X, es Y" salvo en el lema, que es
del bible. Si un texto nuevo suena a narrador literario, está en la voz
equivocada.

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

**Diez hojas, contadas por nivel (#127).** Cada fragmento declara su `nivel`: ocho
son del Nivel 1 y dos (IX y X) del Nivel 2. Cada cierre cuenta **hasta su
nivel** (`progreso.fragmentosHasta`, igual con las reliquias y las fichas): el
del Nivel 1 sigue premiando su 8/8 con la línea oculta aunque el Códice entero
tenga más, y el del Nivel 2 cuenta el descenso entero, 10/10.

El juego solo enseña las hojas de los niveles que se pueden jugar
(`NIVEL_MAS_HONDO` en `Codice.ts`, hoy 2): una hoja de un nivel sin construir
saldría «arrancada», imposible de conseguir. La web publica todas: allí los
versículos son doctrina pública y el margen se sigue ganando como siempre.

Las **fichas del Registro** también se cuentan por nivel: la que solo vive abajo
lleva `nivel: 2`, y el cierre del Nivel 1 no la cuenta (`progreso.fichasHasta`).
`verificar-rutas` comprueba que cada hoja, cada reliquia y cada ficha está de
verdad en una zona de su nivel.

## Audio

Dos capas, con criterios distintos:

**Efectos** (`src/systems/Sonido.ts`) se **sintetizan en tiempo real** con la
Web Audio API. Cada clase de enemigo tiene su materia — el Devoto es carne y
hueso, el Vestal tela y metal fino, el Reformado carne húmeda sobre algo que ya
no es hueso — y cada uno cae a su manera. El golpe al aire suena siempre (el
impacto se suma encima si conecta), y hay sonido para aterrizar, agarrarse,
trepar, beber, el frasco vacío, el daño por caída (grave y con crujido, distinto
del golpe de un enemigo), reliquias, menús, el despertar del jefe, sus fases,
la reja de la arena, los escombros y la victoria. Sin archivos, por tres razones:

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

**Voces de esfuerzo** (`src/systems/Esfuerzo.ts`): la única excepción a «todo
se sintetiza». Una voz sintetizada suena a robot, y el gruñido al atacar, el
resoplido al saltar o el quejido al recibir un golpe tienen que sonar a alguien
(revisión del equipo). Son grabaciones **CC0** de OpenGameArt (qubodup para el
Cirujano, Ogrebane para el Reformado), recortadas y en MP3 mono: 20 tomas, 96 KB.
Los Devotos y las Vestales usan la voz del Cirujano más grave o más aguda. Para
no cansar, el ataque y el salto no siempre gritan y hay un descanso mínimo entre
voces; el golpe recibido y la muerte, siempre. Autoría en
`public/assets/audio/voces/LICENCIAS.md`.

**Música** (`src/systems/Musica.ts`) son pistas **de OpenGameArt, CC0 y CC-BY
4.0**, una por zona (`musica:` en cada definición de nivel), más un tema para el jefe — entra al
despertar y vuelve la de la zona al vencerlo — y otro para el cierre. Cambiar de
pista es un fundido cruzado hecho con un temporizador propio, **no con tweens de
escena**: un tween muere cuando su escena se detiene, y cambiar de zona detiene
la escena justo mientras la pista saliente se apaga. En pausa y en el Códice la
música se atenúa, no se corta. Cada pista va en `.ogg` y `.mp3` porque Safari no
reproduce Ogg Vorbis; el navegador carga solo el formato que sabe leer (~5 MB).
Autoría y licencia de cada pista: `public/assets/audio/musica/LICENCIAS.md`.

Las pistas de zona **tienen ritmo** desde la revisión del equipo, que encontró
sosas las ambientales de antes. Se eligieron **midiendo el pulso** (la
autocorrelación de los ataques de cada pista): las de antes daban entre 0,03 y
0,11; las de ahora, entre 0,3 y 0,8. El descenso va a más —un redoble en el
Atrio, un latido en los Pasillos, un redoble ominoso en las Criptas, urgencia en
las Salas, tambores para el jefe— y el cierre se queda con su piano. La web usa
las mismas, una por capa. Las de North Fantasy Music son **CC-BY 4.0** y obligan
a acreditar: está en `LICENCIAS.md` y en el README.

Nota de navegador: el `AudioContext` nace suspendido y no suena nada hasta que
el usuario interactúa. Los efectos comparten el contexto de Phaser (un solo
contexto que desbloquear) y el HUD muestra _"pulsa cualquier tecla para activar
el sonido"_ mientras siga bloqueado, para que nadie crea que el juego es mudo.

## Nitidez: el lienzo mide lo que mide la pantalla

El juego se diseña en **480×320 lógicos** (`RESOLUCION`), pero el lienzo ya no
mide eso. Antes sí, y `Scale.FIT` lo estiraba con CSS ×3 o ×4: el pixel art
aguanta eso; la tipografía no, y los diálogos se leían como bloques (#69).

`src/systems/Nitidez.ts` calcula al arrancar una **escala entera** `ESCALA`
(cuántas veces cabe 480×320 en la ventana, contando `devicePixelRatio`, entre
1 y 6), y a partir de ahí:

- El lienzo mide `480·ESCALA × 320·ESCALA` (`LIENZO`).
- Un plugin de escena (`NitidezPlugin`) pone `setZoom(ESCALA)` y
  `centerOn(240, 160)` en la cámara de **cada** escena al arrancar. El mundo se
  ve igual y las escenas siguen colocando todo en coordenadas lógicas.
- `this.add.text` se registra de nuevo (`registrarTextoNitido`) para que todo
  texto nazca con `resolution = ESCALA`: se rasteriza a tamaño real.
- El contenedor `#juego` se pone **exactamente** del tamaño del lienzo en
  píxeles de pantalla (`dimensionarContenedor`), para que FIT no tenga nada
  que escalar. En una 1080p eso deja un marco de 240 px a los lados: es el
  precio de que cada píxel del arte caiga en un píxel del monitor. Si la
  ventana se encoge después, FIT vuelve a actuar (con escala no entera).
- Ese marco no es negro (#70): `enmarcar()` pone en `<body>` la sillería del
  Vientre repetida a la escala del juego, una viñeta encima para dejarla en
  penumbra y un filete de oro alrededor del lienzo (clase `enmarcado` en
  `style.css`). El juego queda dentro de un nicho de piedra.
- En un **aparato táctil** no se ajusta el contenedor: FIT llena la pantalla
  aunque la escala no sea entera. Los controles de dedo necesitan sitio, y el
  lienzo ya viene a 2× o 3×, así que lo que FIT estira de más es poco.
  La escala se calcula con las medidas del teléfono **en horizontal** (lado
  largo × lado corto), se arranque como se arranque: así el texto sale nítido
  también cuando se gira, que es como se juega.
- **Al girar el teléfono** (#75) Phaser se quedaba con el tamaño de antes: su
  `refresh()` corre antes de que el contenedor `100dvw × 100dvh` se recoloque,
  calcula con las medidas viejas y, peor, las guarda como buenas, así que ya
  no vuelve a enterarse. `vigilarGiro()` escucha `resize`, `orientationchange`,
  `visualViewport` y `fullscreenchange`, espera dos fotogramas y entonces
  pide a Phaser que vuelva a medir. En horizontal el juego llena el alto; las
  franjas a los lados son la proporción 3:2 del juego, no un fallo.

**Lo que hay que saber para no romperlo:**

- Un objeto con `scrollFactor 0` en un nivel (telón, polvo, viñeta, panel de
  ayuda) no cae en su `(x, y)` lógico con la cámara acercada: hay que
  colocarlo en `fijo(x, y)`. Las escenas de interfaz no lo necesitan porque
  `centerOn` ya deja el `(0, 0)` lógico en la esquina.
- No usar `this.scale.width/height` para colocar cosas: eso es el lienzo.
  Usar `RESOLUCION`.
- `Cursor.ts` mide su escala contra `RESOLUCION`, no contra el lienzo.
- `VITE_SIN_AUDIO=1 npm run build` salta la carga de música: un Chrome sin
  cabeza (capturas automáticas) nunca termina de decodificar audio y se queda
  en la barra de carga. Con esa variable se puede fotografiar el juego.

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

### El Vientre Húmedo (#105)

Provisional, a mano en `ArteProvisional.ts`, como los muros de Pasillos,
Criptas y Salas: `muro-humedo-a` y `muro-humedo-b`. La biblia dice que la capa V
son «pasillos de hospital vueltos santuario» y que el suelo es «hormigón,
azulejo, acero, cera, óxido y hueso»: azulejo de quirófano con la junta negra y
mojada, una mancha de agua, óxido, y en la variante una vena que cruza las
juntas y una gota de cera. Un nivel lo usa con
`muro: ['muro-humedo-a-placeholder', 'muro-humedo-b-placeholder']`.

Decorado nuevo, con su sitio en `verificar-rutas`: `membrana` (embutida en el
muro), `raiz` (cuelga), `nido` (la boca del ducto entre huesos) y `charco-vivo`
(en el suelo). El set definitivo en Aseprite sigue siendo del equipo y entra con
las mismas claves.

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

## Encargos de arte

Los encargos de arte pendientes viven en [`docs/arte/encargos/`](arte/encargos/)
como Markdown con frontmatter.
Para publicarlos en GitHub:

```powershell
gh auth login              # una sola vez
.\scripts\crear-issues.ps1 -DryRun   # revisar qué se va a crear
.\scripts\crear-issues.ps1           # crearlos de verdad
```

Se crean **abiertos y sin asignar**.
