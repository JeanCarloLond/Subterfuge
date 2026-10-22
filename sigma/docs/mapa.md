# Subterfuge Sigma · El mapa

> **Propuesta para Jean y Alejo.** Cómo planificar las zonas y los niveles de Sigma
> mirando a los metroidvanias que funcionan. Nada de esto está construido salvo el
> Atrio; lo marcado como **propuesta** está por decidir.

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
                 │  Pulmón (doble salto)   Tendón (dash)           │
                 └───────┬───────────────────────────────┬────────┘
                         │                               │ ducto (se abre desde abajo)
              II · PASILLOS ── cierre (#190) ──┐         │
                         │                     │         │
              III · SALAS DE SACRAMENTO (Sala 7) ────────┤
                         │                               │
              IV · CRIPTAS ── Mareas: hace falta ? ──────┤
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

Las habilidades son restos de los Primigenios (ya hechas: el **Pulmón Vacío** da el doble
salto y el **Tendón del Mil** el dash). La regla para cada una:

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

1. **Decidir el mapa de arriba**, con Jean: qué salas tiene cada zona y por dónde se
   conectan, en una hoja de rejilla (una casilla, una pantalla).
2. **Rehacer el Atrio como zona**: de 1,5×3 pantallas a unas 8 salas, con el Atrio de hoy
   como su sala central.
3. **Los Pasillos (#190)**, ya con el tamaño y los atajos de esta propuesta.

[meowdb]: https://meowdb.com/db/blasphemous/zones
[plat]: https://platprices.com/ie/game/6701-blasphemous
[pcgamer]: https://pcgamer.com/how-to-design-a-great-metroidvania-map
[hk]: https://amara.org/videos/stk1ABNP63rg/en/4403643
