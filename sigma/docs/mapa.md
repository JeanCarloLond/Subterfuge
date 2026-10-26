# Subterfuge Sigma · El mapa

> **Para Jean y Alejo.** Cómo planificar las zonas y los niveles de Sigma mirando a los
> metroidvanias que funcionan. El arranque (los dos primeros niveles) está **decidido**
> por Jean el 23 de octubre de 2026; lo marcado como **propuesta** sigue por decidir.

## Decidido: el arranque

El hilo de los dos primeros niveles. El Cirujano sale a buscar por qué se mueven los
muros, baja, conoce al Cegado, busca Génesis Vestal, toca el artefacto y vence al primer
guardián:

1. **Arriba.** Sale del Pabellón N.º 7: las paredes se mueven y la carne no llega.
2. **Nivel I, de bajada.** El plataformeo se siente **descendente**: una caída controlada
   hasta la Escalera de los Ciegos, donde **el Cegado** le cuenta qué fue Génesis Vestal.
3. **Nivel II.** Reúne los **tres registros de Génesis**, que abren el ala sellada.
4. **El laboratorio.** Toca el artefacto: **la primera visión** de la niña.
5. **El primer guardián, el Prior del Diezmo.** Va **después** del laboratorio, para que
   la niña lo «salve» en esa pelea (le avisa de un golpe): así se gana su confianza. Al
   caer suelta **la Injertadora**, y la Nave del Libro se funde con el Atrio: la primera
   vez que el jugador ve que **el mapa se compacta cuando cae un eslabón**.

### Nivel I · El Atrio, de bajada (8 salas)

El Atrio de hoy pasa a ser **una sala** de este nivel (la 3), sin reliquias. Mientras no
esté hecho, se juega en la portada como «El Atrio (demostración)».

```
 [1 Pabellón N.º 7]──[2 Claustro]           inicio; sierras
                          │
                     [3 Nave del Atrio]      Altar, Devotos
                          │
                     [4 Pozo de la Sillería] 1×3 pantallas: membranas, sierras, techo que late
                     ╱              ╲
   [5 Capilla de la Vestal]   [6 Muro de los Dientes]   la Vestal / un muro que empuja
                     ╲              ╱
                     [7 La Escalera de los Ciegos]   Altar y el Cegado
                          │
                     [8 Umbral de los Pasillos] → Nivel II
```

Cada sala enseña **una cosa**: 1 moverse, 2 las sierras, 3 pelear, 4 clavarse en la
membrana, 5 devolver el sello, 6 la compactación, 7 la historia. Las 5 y 6 son dos caminos
que se vuelven a juntar: uno se elige, el otro queda para la vuelta.

### Nivel II · Pasillos de Preparación (10 salas)

```
[Umbral]──[Registro de Diezmos]──────────[Sala de Sorteos]
    │      el Libro colosal (hito)              │
    │              │                     [Archivo]: registro 2/3
[Pasillo que se cierra (#190)]   [Escribanía]: registro 1/3
    │
[Ala sellada de Génesis] ── registro 3/3, tras un cierre; rayos
    │   (la puerta pide los tres registros)
[Laboratorio]: el artefacto, primera visión; rayos
    │
[Altar]──[Nave del Libro]: el Prior del Diezmo → la Injertadora
                │
          los muros se mueven: atajo al Atrio
```

### Las salas sin enemigos tienen obstáculos

Decidido por Jean: **una sala sin enemigos lleva sierras o rayos**. Las salas de
descanso (las del Altar y la del Cegado) son la excepción.

- **Las sierras** son instrumental de la Diócesis: sierras de hueso, de amputar, que el
  Latido hace girar. Van fijas o en un raíl, se ven y se oyen; tocarlas cuesta 1 punto y
  empuja. En el Nivel I, que es la Diócesis.
- **Los rayos** son de Génesis Vestal: bisturís de luz de los laboratorios, de antes de
  que los manuales fueran escritura. Avisan (un hilo fino que tiembla), queman y se
  apagan, con un ritmo que se aprende. Aparecen donde hay Génesis: el ala sellada y el
  laboratorio. Que el jugador vea **otra tecnología** es la primera pista de que Génesis
  fue otra cosa.

### El primer guardián: el Prior del Diezmo

El clérigo que injerta el metal del diezmo en los fieles: la Injertadora es su
herramienta, y por eso, al caer, es del Cirujano. El jugador la ve funcionar antes de
tenerla.

- **Fase 1:** dispara injertos, lanza sellos que se devuelven con el parry (como la
  Vestal) y da un golpe de báculo con aviso largo.
- **Fase 2:** golpea el suelo y **la nave se compacta**: los muros del ring se cierran y
  la pelea se estrecha (`muro.gd`).
- **El final:** se remata con la ejecución (E).
- **La niña** aparece una vez, en una visión breve, para avisar del golpe más fuerte.

### Las reliquias, repartidas

El doble salto y el dash en el primer nivel eran demasiado pronto para un juego entero.

| Nivel                     | Qué se gana                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| I · Atrio                 | Nada: el bisturí y la membrana bastan para bajar                                                                            |
| II · Pasillos             | El **Pulmón Vacío** (doble salto, el Impulso cárnico): el artefacto del laboratorio; y la Injertadora (el Prior del Diezmo) |
| III · Salas de Sacramento | Por decidir                                                                                                                 |
| IV · Criptas              | El **Tendón del Mil** (dash), que ayuda en las Mareas                                                                       |

Con las dos se abre el camino alto del Atrio, y volver tiene premio (un secreto, una
nota).

### Los objetivos

El juego dice qué se busca: aparece al cambiar (entra, se queda un momento y se va, con
un sonido) y está siempre en la ayuda (H). No va fijo en pantalla. Los contadores, como
«Reúne los registros de Génesis (1/3)», avanzan solos.

1. «Averigua por qué se mueven los muros»
2. «Busca el laboratorio de Génesis Vestal» (tras hablar con el Cegado)
3. «Reúne los registros de Génesis (0/3)»
4. «Entra en el laboratorio»

**El giro:** después del laboratorio, **los objetivos los pone la niña** («Ve hacia
dentro», «Él no debe caer») y cambian de color. El jugador sigue el texto de la pantalla
como si fuera neutral; al final entiende que llevaba medio juego obedeciéndola.

### Los diálogos, a lo Stardew Valley

Una caja abajo, con el **retrato** del que habla en su marco y su **nombre** en una placa.
El texto se escribe letra a letra; E lo termina de golpe y, con la línea entera, pasa a
la siguiente. Una flecha avisa de que hay más. El juego se para mientras se habla.

## Lo que hacen los grandes

- **_Blasphemous_**: Cvstodia son **14 distritos con 42 zonas** ([meowdb][meowdb]), unas
  **14 h** de historia principal y 31 h al 100 % ([HowLongToBeat vía Plat
  Prices][plat]). Pantalla de 640×360.
- **_Hollow Knight_**: las salas son **cajas de tamaños distintos** sobre un mapa casi en
  rejilla ("98 % puro", según Ari Gibson), y cada sala se decora en **capas de
  parallax** a distinta profundidad ([PC Gamer][pcgamer], [análisis del mapa][hk]).
- Lo que comparten, y es la base del género: un **centro** del que salen ramas, **bucles**
  que vuelven a él por **atajos** que se abren desde el otro lado, **puertas que se ven
  antes de poder abrirlas** (y se abren con una habilidad nueva), un **hito** por zona
  que se reconoce de lejos, y puntos de guardado cada pocas salas.

## La unidad: la pantalla

Una pantalla de Sigma son **640×360 px = 40×22,5 tiles** de 16 px. Las salas se miden
en pantallas, como en _Hollow Knight_: de 1×1 (un pasillo, un rellano) a 4×2 (una nave)
o 1×4 (un pozo).

El Atrio de hoy mide 960×1120 px: **1,5×3,1 pantallas**. Es una sala, no una zona. Una
zona de _Blasphemous_ son varias salas así.

## El alcance de Sigma

Un indie **pequeño pero detallado**: los **seis niveles del canon**, de 8 a 12 salas cada
uno, unas **60 salas** en total. Del orden de 1,5 a 2 h, y cada sala trabajada.

## Las zonas

Son los seis niveles del corte vertical de la biblia, de arriba abajo, con sus
habitantes y sus peligros. Cada una tiene **su hito**, que se ve desde la anterior:

| Nivel                        | Qué es                                  | Hito (se ve de lejos)               | Peligro propio               |
| ---------------------------- | --------------------------------------- | ----------------------------------- | ---------------------------- |
| I · El Atrio                 | La ciudad visible: pabellones, capillas | La vidriera, el Muro de los Dientes | Alfombra Devota, Remedos     |
| II · Pasillos de Preparación | Registro de diezmos y sorteos           | El Libro de Diezmos, colosal        | Guardias; los cierres (#190) |
| III · Salas de Sacramento    | Quirófanos-altar, siete salas numeradas | La puerta de la Sala N.º 7          | Remedos en el instrumental   |
| IV · Criptas de Espera       | Los Elegidos, sedados, esperando turno  | Las hileras de durmientes           | Las Mareas del Hambre        |
| V · Niveles Reformados       | Pasillos de hospital vueltos santuario  | El hospital entero, inclinado       | Serpiente de Tejido, Zarza   |
| VI · El Vientre Profundo     | El santuario de los dioses              | El Latido: una pared que late       | Oscuridad total, calor       |

**El Atrio es el centro.** Es la ciudad, con los Altares y los fieles, y de él se baja
por dos caminos.

**Los ductos son la columna vertebral.** La biblia los llama "las arterias del templo".
Son pozos verticales que unen todos los niveles y hacen de **atajos**: se abren desde
abajo, al llegar, y a partir de ahí devuelven al Atrio en un momento.

```
                 ┌────────────── I · ATRIO (centro) ──────────────┐
                 │  de bajada: el Cegado, sin reliquias           │
                 └───────┬───────────────────────────────┬────────┘
                         │                               │ ducto (se abre desde abajo)
              II · PASILLOS (Pulmón Vacío, Injertadora) ─┤
                         │                               │
              III · SALAS DE SACRAMENTO ─────────────────┤
                         │                               │
              IV · CRIPTAS (Tendón del Mil, las Mareas) ─┤
                         │                               │
              V · NIVELES REFORMADOS ────────────────────┤
                         │                               │
              VI · VIENTRE PROFUNDO (la Puerta del Cuerpo)
```

## Lo propio de Sigma: el mapa se compacta

En un metroidvania los atajos se abren con llaves. En Sigma **los abre la historia**:
cada vez que cae un eslabón (el guardián de una zona), las paredes que sostenía se
mueven y **dos zonas se funden**. Donde había un muro aparece un paso, y el mapa
literalmente encoge. El jugador cree que se abre camino; en realidad está compactando
el templo, que es el giro del canon.

Así cada atajo cuenta la historia, y el mapa del final es más pequeño que el del
principio.

## Las puertas: reliquias

Las habilidades son restos de los Primigenios (hechas: el **Pulmón Vacío** da el doble
salto y el **Tendón del Mil** el dash; se ganan en los niveles II y IV, ver arriba). La
regla para cada una:

1. **Se ve la puerta antes que la llave.** Una repisa alta, un hueco largo: el jugador
   tiene que pensar "aquí volveré".
2. **La llave abre camino en su zona y en las anteriores**, para que volver merezca la
   pena (en el Atrio, las dos abren el camino alto de la derecha).
3. **Propuesta** para las Criptas: una reliquia que deje cruzar las Mareas del Hambre
   (una branquia, por ejemplo). El nombre y lo que da, por decidir.

## Reglas para cada sala

- **Un Altar cada 3 o 4 salas**, y siempre antes de un guardián.
- **Una cosa nueva por sala**: un enemigo, un peligro, un truco de movimiento o una
  vista. Si no hay nada nuevo, la sala sobra.
- **Lo que se pisa, claro; el fondo, grande y oscuro**: las capas de `nave.gd` van
  detrás y la piedra jugable delante, con más luz.
- **Cada zona con su paleta, su música y sus enemigos**, para saber dónde se está sin
  mirar el mapa.
- **Secretos que paguen**: una pared falsa o un rincón alto llevan a una reliquia, un
  frasco o un texto del Códice, nunca a nada.

## Lo que sigue

1. Los objetivos, los diálogos, las sierras y los rayos: las piezas del arranque.
2. **El Nivel I de bajada**, con el Atrio de hoy como su sala 3, y el Cegado.
3. **Los Pasillos (#190)**, Génesis y el Prior del Diezmo.
4. Los niveles III a VI, cuando el arranque se sienta bien.

[meowdb]: https://meowdb.com/db/blasphemous/zones
[plat]: https://platprices.com/ie/game/6701-blasphemous
[pcgamer]: https://pcgamer.com/how-to-design-a-great-metroidvania-map
[hk]: https://amara.org/videos/stk1ABNP63rg/en/4403643
