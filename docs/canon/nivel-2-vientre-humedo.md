# Acta de canon · Fase 4: dos niveles y la escapatoria

> **Estado: borrador para aprobación del equipo narrativo.** Lo pide la issue #126
> (`F4-01`): esta acta se aprueba antes de empezar la geometría del Nivel 2 (`F4-05`,
> #128). Hasta entonces, nada de lo que fija se da por cerrado.
>
> **Fuente.** Las issues de la fase 4, contrastadas con la biblia del mundo en su versión
> del 16 de octubre de 2026, que es la que hay en `docs/Subterfuge-world-bible.docx`. La
> copia anterior, del 9 de septiembre, no tenía nada de esta fase y se sustituyó. Donde el
> acta y la biblia no coincidan, **manda la biblia** y el acta se corrige; donde la biblia
> calla, decide la fase 4 y aquí se dice.

## 1. Los tres niveles

| Nivel       | Nombre                             | Qué cubre                                                     | Estado                           |
| ----------- | ---------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| **Nivel 1** | El Sacramento                      | Atrio → Pasillos → Criptas → Salas → cierre (capas I-IV)      | Existe. Jugabilidad intacta.     |
| **Nivel 2** | El Vientre Húmedo · La escapatoria | Capa V: desagüe de la Sala 7 → ecosistema → Puerta del Cuerpo | Nuevo. Esta fase.                |
| **Nivel 3** | El Vientre Profundo · El templo    | Capa VI: el santuario de los Primigenios                      | No se construye. Solo la puerta. |

## Dónde termina la biblia y dónde empieza esta fase

La biblia cuenta la noche del Sacramento hasta **«El instante — Por primera vez, el
Cirujano-Sacerdote mira lo que hace. Aquí empieza la historia.»** Ahí se detiene. Su
situación deja el desenlace abierto: el Cirujano _«empieza a dudar si lo que hace es
salvación o carnicería»_.

**Lo que sigue a ese instante lo decide la fase 4, no la biblia:** que baje el bisturí, no
la entregue y huya con ella. Es una continuación compatible —la biblia no dice lo
contrario—, pero es una decisión nueva del equipo y tiene que constar como tal, no como
algo que la biblia ya fijaba.

**Es la decisión que el equipo narrativo tiene que aprobar** antes de construir el Nivel
2: la estructura (#129), la niña (#134), la geometría (#128) y el cierre (#132) dependen
de ella.

La geografía sí viene de la biblia: la capa V son los **Niveles Reformados** («pasillos de
hospital vueltos santuario», con la Serpiente de Tejido y la Zarza Cosedora como peligros)
y la capa VI el **Vientre Profundo**, donde «solo entran Vestales».

## 2. Nivel 1: jugabilidad intacta, cierre con decisión

- `SalasScene` sigue apuntando a `Final`.
- No cambian el combate contra el Reformado, la reja, los Altares, los 8 fragmentos ni el
  recuento del cierre.
- **Cambia el cierre narrativo.** La niña despierta, el tejido responde y el Cirujano
  **baja el bisturí**. No la entrega. La toma y busca el desagüe detrás de la Sala.
- Se cuenta en `Pensamientos.ts` (clave `cierre`) y en `FinalScene`. No hace falta una
  cinemática nueva (`F4-43`).

## 3. Nivel 2: la huida

- El Cirujano y la niña escapan por el desagüe de servicio de la Sala 7.
- El desagüe baja a los Niveles Reformados y al Vientre Húmedo.
- La Diócesis descubre la Sala vacía; el Latido se acelera y empieza la persecución.
- El camino **no lleva a la superficie**: lleva a la **Puerta del Cuerpo**, el acceso de
  servicio al templo. Es la única salida que la Diócesis no vigila.
- El Nivel 2 termina en la puerta. El templo es el Nivel 3.
- La niña viaja con el Cirujano. Es una **compañera narrativa**: no es una segunda
  protagonista ni una escolta con fracaso (`F4-43`).

**La ironía del nivel:** el desagüe no es una salida al exterior. Es una salida **hacia
dentro**, hacia el templo.

## 4. Lo que el jugador aprende en el Nivel 2

- Que el Vientre tiene un servicio de limpieza, y que ese servicio se está extinguiendo
  (el Mondador).
- Que la Serpiente de Tejido es el depredador de los ductos y el emblema del Rebaño Hueco.
- Que los Reformados no son un almacén: son parte del ciclo de lo que no se completa.
- Que las Mareas del Hambre son un fenómeno natural del edificio, no un castigo.
- Que la única salida pasa por el templo, y que el Cirujano ya no puede volver atrás.

## 5. Lo que no se muestra

- Ningún Primigenio. Ningún dios nuevo. Ninguna magia.
- Nadie ve a los dioses; el templo se muestra solo como puerta y umbral.
- El Mondador es un animal sagrado por costumbre, no una divinidad.
- La niña no se convierte en objeto de poder ni en una «elegida» obvia. Su tejido
  responde; el resto se insinúa.

## 6. Nombres

- **Vientre Húmedo** es el nombre del bioma y del Nivel 2. **Niveles Reformados** es el
  nombre oficial de la capa V. En la interfaz van juntos: «El Vientre Húmedo · Niveles
  Reformados».
- **El templo** es el Vientre Profundo (capa VI): no la Diócesis entera ni la Sala 7.
- La biblia enumera las Salas antes que las Criptas; el juego pone las Criptas antes. El
  Nivel 1 se queda como está: esta acta solo deja constancia de la diferencia.
- El Mondador tiene depredadores naturales (la Zarza Cosedora y la Serpiente de Tejido) y
  cazadores humanos (las Vestales, por el caparazón). Las dos cosas son verdad, y juntas
  explican su casi extinción.
- El Nivel 2 no es un desvío dentro del Nivel 1: es un nivel nuevo que empieza con la
  decisión del Cirujano.

## 7. Vocabulario

**Permitido en textos visibles:** Altar, sacramento, diezmo, Registro, Reformado, Fervor,
Poción de Carne, Injertadora, Mondador, Mareas del Hambre, Latido.

**Prohibido en textos visibles:** «checkpoint», «mana», «HP», «boss».

## 8. Las escenas del Nivel 2

Seis momentos que el jugador tiene que poder contar al terminar. Cada uno cita la issue
que lo desarrolla; el acta fija **qué pasa**, no cómo se implementa.

| #   | Escena                   | Qué pasa                                                                                                                                                                                                                                                       | Dónde se desarrolla                      |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | **La decisión**          | En el cierre del Nivel 1 la niña despierta y el tejido responde. El Cirujano baja el bisturí y no la entrega. Tiene que sentirse como un acto: el texto, la pausa y el fundido bastan.                                                                         | `F4-43` #134, `F4-03` #87                |
| 2   | **El desagüe**           | Primera sala del Nivel 2. El Cirujano y la niña bajan por el servicio de la Sala 7. Primer Altar, Lluvia Tibia, una inscripción. La Diócesis descubre la Sala vacía y el Latido se acelera: no hace falta ver guardias, basta el sonido, el aviso y una placa. | `F4-05` #128, `F4-43` #134, `F4-39` #131 |
| 3   | **El Mondador**          | En la Galería de limpieza, un animal sagrado se come la carne que los dioses rechazaron. No se le puede matar. Quien lo sigue encuentra un paso seguro o una reliquia. Una Vestal con máscara de caparazón explica, sin decirlo, por qué casi no quedan.       | `F4-15` #99                              |
| 4   | **La Serpiente**         | En el nido, el depredador de los ductos cierra el paso. Es el mini-jefe del nivel y el emblema del Rebaño Hueco: su injerto promete «volverse dios» sin permiso del clero. La niña se esconde durante el combate.                                              | `F4-14` #98, `F4-43` #134                |
| 5   | **La Marea**             | Cuando los Viscerales digieren, los ductos expulsan fluido tibio que inunda lo bajo. No es un castigo: es el edificio. Obliga a ganar altura. Nunca cubre el único Altar ni la única salida.                                                                   | `F4-07` #91                              |
| 6   | **La Puerta del Cuerpo** | Al final del ducto de subida, la puerta de servicio del templo. Sellada; no se cruza. El Cirujano y la niña delante de ella, con el recuento del viaje. El templo queda para el Nivel 3.                                                                       | `F4-40` #132, `F4-08` #129               |

## 9. Decidido

### La Puerta del Cuerpo es una puerta, y los herejes tenían razón

En la biblia (Mitología → Otros pueblos), la Puerta del Cuerpo es una idea del **Rebaño
Hueco**: _«existe un Mil Uno que nunca llegó y la Diócesis cerró la "Puerta del Cuerpo"
por miedo»_. Es teología herética: la vía por la que deberían llegar dioses nuevos, y que
el clero mantiene cerrada.

Las issues la usan para la **puerta de servicio física** del templo. **Se mantiene así, y
se hace a propósito:** la metáfora de los herejes resulta ser literal. Hay una puerta, la
Diócesis la cerró, y es la única salida que no vigila.

Para que no se lea como una contradicción, **una inscripción del Nivel 2 tiene que
enlazar la puerta con la creencia del Rebaño Hueco**. Va en las placas del Nivel 2
(`F4-39`, #131), en el tramo final del ducto de subida, antes del umbral.

## 10. Pendiente de decidir

### Issues escritas con el plan anterior

Dos issues se escribieron con el plan anterior —el Vientre Húmedo **entre** las Criptas y
las Salas— y dicen cosas que ya no encajan con la huida. No se tocan hasta que narrativa
decida:

1. **#98 (`F4-14`)** dice que la Serpiente «bloquea el ducto de subida **a la Sala 7**».
   En la huida se sale **desde** la Sala 7 hacia abajo, y según #128 el nido está antes
   del ducto que lleva a la **Puerta del Cuerpo**. Propuesta: la Serpiente bloquea el
   ducto de subida **hacia la Puerta del Cuerpo**.
2. **#91 (`F4-07`)** dice que el Nivel 2 existe «porque el Cirujano **sigue a la niña**
   hacia el templo». #126 y #134 dicen que el Cirujano la **toma y huye con ella**: es
   él quien decide, y ella va con él. Propuesta: alinear #91 con #134.

### Lo que sale al contrastar con la biblia

3. **Por qué se acelera el Latido.** La biblia lo acelera _durante_ el sacramento, porque
   el tejido de la niña responde («El Latido se acelera en todos los niveles»). #126 lo
   acelera porque **la Diócesis descubre la Sala vacía**. Las dos cosas pueden ser
   verdad a la vez, pero el texto del juego tiene que elegir cuál cuenta primero.

## 11. Trazabilidad

Los 43 códigos de la fase y la issue que desarrolla cada uno. Las marcadas como
**sustituida** son del plan anterior y se cerraron por duplicado al reformular la fase.

| Código | Issue | Tema                                              | Sustituye a |
| ------ | ----- | ------------------------------------------------- | ----------- |
| F4-01  | #126  | Canon de la fase 4 (esta acta)                    | #85         |
| F4-02  | #127  | Hojas IX y X del Códice y recuento por nivel      | #86         |
| F4-03  | #87   | Voces, pensamientos y fichas de los habitantes    |             |
| F4-04  | #88   | Bestiario: fichas de fauna y flora                |             |
| F4-05  | #128  | Geometría, rutas y secretos de la huida           | #89         |
| F4-06  | #90   | Sistema de criaturas y peligros                   |             |
| F4-07  | #91   | Mareas del Hambre y Latido                        |             |
| F4-08  | #129  | Estructura de dos niveles                         | #92         |
| F4-09  | #130  | Mapas del juego y del portal                      | #93         |
| F4-10  | #94   | Contadores dinámicos y memoria del Nivel 2        |             |
| F4-11  | #95   | Puentes de tejido: la Injertadora como llave      |             |
| F4-12  | #96   | Hongo de Lámpara, Lluvia Tibia y luz              |             |
| F4-13  | #97   | Remedo                                            |             |
| F4-14  | #98   | Serpiente de Tejido                               |             |
| F4-15  | #99   | Mondador                                          |             |
| F4-16  | #100  | Buitre ritual y Cerdo de Protocolo                |             |
| F4-17  | #101  | Cuervo de Ermita y Vena Trepadora                 |             |
| F4-18  | #102  | Zarza Cosedora                                    |             |
| F4-19  | #103  | Alfombra Devota                                   |             |
| F4-20  | #104  | Mata de Retazos                                   |             |
| F4-21  | #105  | Tileset y decals                                  |             |
| F4-22  | #106  | Sprites de fauna                                  |             |
| F4-23  | #107  | Sprites de flora y peligros                       |             |
| F4-24  | #108  | SFX y música                                      |             |
| F4-25  | #109  | Web · Registro: fauna y flora                     |             |
| F4-26  | #110  | Web · Linaje: la frontera porosa                  |             |
| F4-27  | #111  | Web · Portada y navegación                        |             |
| F4-28  | #112  | Web · Doctrina: diez folios                       |             |
| F4-29  | #113  | Web · Minijuegos                                  |             |
| F4-30  | #114  | Web · Índice del Códice y del Registro            |             |
| F4-31  | #115  | Web · Exportar las figuras nuevas                 |             |
| F4-32  | #116  | Índice funcional de la biblia (Drive)             |             |
| F4-33  | #117  | Unificar la biblia                                | retirada    |
| F4-34  | #118  | Índice de materias de la biblia                   | retirada    |
| F4-35  | #119  | README y DESARROLLO a la fase 4                   |             |
| F4-36  | #120  | QA · verificar-rutas, verificar-arte y build      |             |
| F4-37  | #121  | QA · Playtest y balance                           |             |
| F4-38  | #122  | QA · Canon, tono y accesibilidad                  |             |
| F4-39  | #131  | Inscripciones y placas del Nivel 2                | #123        |
| F4-40  | #132  | Cierre del Nivel 2: la Puerta del Cuerpo          | #124        |
| F4-41  | #125  | Flor de Hueso y objetos culturales                |             |
| F4-42  | #133  | Continuidad entre niveles                         |             |
| F4-43  | #134  | La decisión del Cirujano y la niña como compañera |             |

`F4-33` y `F4-34` se retiraron: la biblia canónica vive en el Drive del equipo y no se
mantiene una copia en el repositorio (ver el cierre de #117).

## Referencias

- Biblia del mundo (Drive): **Capítulo VI, Naturaleza → El Vientre Húmedo**, **Fauna**,
  **Flora**, **Otras especies**, **Red de relaciones**, **Funciones narrativas**; y
  **Capítulo III, Mapas → Los seis niveles** (capas V y VI).
- Código: `src/scenes/SalasScene.ts`, `src/scenes/FinalScene.ts`,
  `src/lore/Pensamientos.ts`, `src/lore/Vientre.ts`.
