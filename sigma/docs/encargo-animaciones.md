# Encargo: animaciones del Cirujano (Sigma)

> Para Mariana, con Alejo (#235). El Cirujano que se ve hoy en Sigma es **provisional**:
> dibujado en código para poder jugar. Esta lista dice qué animaciones hacen falta, cuántos
> fotogramas y a qué velocidad, para que el arte definitivo encaje sin tocar el juego.

## Cómo entregarlo

- **El diseño**: el rediseño de Alejo (tres cuartos, hábito de hueso, mitra, cara vendada,
  bisturí en la derecha). La referencia de pose y tamaño son los provisionales de
  `sigma/arte/cirujano/` (un PNG por fotograma).
- **Tamaño**: 48 × 58 px por fotograma, fondo transparente. Si alguna pose necesita más
  (el tajo, el contragolpe), se puede: avisa y lo ajustamos.
- **Los pies**: siempre en el mismo punto, x = 21, y = 57. Ahí está el origen del cuerpo:
  si los pies se mueven entre fotogramas, el personaje patina.
- **Mirando a la derecha**. El juego lo voltea para la izquierda.
- **Nombres**: `animacion-N.png`, empezando en 0 (`correr-0.png` … `correr-7.png`).
- **Los mapas de normales** (`_n.png`, para la luz de las velas) los sacamos nosotros.
- **Lo que ya hace el código, y no hace falta dibujar**: estirarse al saltar, aplastarse al
  aterrizar, echarse atrás al recibir un golpe, el polvo, las chispas, la estela del dash,
  el arco de luz del tajo y el destello del parry. Son tiempos y efectos encima del dibujo.
  Si el dibujo ya exagera una pose, lo bajamos en el código.

## Primero: la lista de Alejo

| Animación               | Hoy | Pide | Velocidad                                                     | Poses                                                                                                                                       |
| ----------------------- | --- | ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `correr`                | 8   | 8    | Un fotograma cada 7 px recorridos (a 130 px/s, unos 18 por s) | Contacto, paso, apoyo e impulso, de cada pie. El hábito y la mitra van con retraso: pesan.                                                  |
| `golpe` (atacar)        | 6   | 6    | Aviso 60 ms, estela 40, impacto 110, recuperación 70 + 70     | 0–1 aviso (el brazo atrás), 2 **estela** (el bisturí hecho una mancha), 3 **impacto** (brazo extendido, la pose que más se ve), 4–5 volver. |
| `agarre` (colgado)      | 1   | 3    | 0 al clavar; 1–2 respirando, lentos                           | Clava el bisturí en la membrana con una mano y cuelga de él. Es su oficio: la mano que sostiene.                                            |
| `trepar`                | —   | 4    | Sube y baja a 70 px/s, colgado del bisturí                    | Ciclo de brazos y rodillas contra la pared.                                                                                                 |
| `impulso` (de la pared) | —   | 2    | Sale a 380 px/s hacia arriba                                  | Arranca el bisturí y se separa de la pared.                                                                                                 |
| `salto` (despegue)      | 1   | 2    | 1 frame al pulsar, 1 subiendo                                 | Agachado y estirado.                                                                                                                        |
| `cumbre`                | —   | 1    | En lo más alto                                                | El hábito flota un instante.                                                                                                                |
| `caida`                 | 2   | 2    | En bucle mientras cae                                         | El hábito sube por el aire.                                                                                                                 |
| `aterrizaje`            | 1   | 2    | 90 ms en total                                                | Absorbe con las rodillas y se levanta.                                                                                                      |
| `doble-salto` (Pulmón)  | —   | 2    | Al saltar en el aire                                          | El pecho se hincha: respira por él lo que lleva dentro.                                                                                     |
| `herido` (lo golpean)   | 1   | 3    | Dura el empujón; después parpadea 700 ms                      | Golpe (cabeza atrás), retroceso, recuperar el equilibrio.                                                                                   |

**Cuando él golpea**, lo que más se ve es el fotograma de **impacto** del `golpe`, porque el
juego se para un instante en él (55 ms; 90 el cargado; 120 el contragolpe). Esa pose tiene
que ser la más clara de todas.

Las variantes del golpe siguen la misma estructura (aviso, estela, impacto, volver):

| Animación     | Hoy | Velocidad                                                       |
| ------------- | --- | --------------------------------------------------------------- |
| `cargado`     | 6   | Aviso 110 ms, impacto 150. Más amplio y más pesado que el golpe |
| `arriba`      | 4   | Tajo por encima de la mitra                                     |
| `abajo`       | 3   | En el aire, hacia los pies; rebota en lo que golpea             |
| `contragolpe` | 4   | Aviso 30 ms: casi sin aviso, tras un parry. Una estocada        |

## Después: el resto

| Animación                   | Hoy   | Pide  | Velocidad                         | Poses                                                        |
| --------------------------- | ----- | ----- | --------------------------------- | ------------------------------------------------------------ |
| `reposo`                    | 4     | 4     | 220 ms cada uno                   | Respira. Cansancio contenido, no bravuconería.               |
| `dash`                      | 1     | 3     | 160 ms en total                   | Tiene que leerse en muy poco tiempo.                         |
| `guardia` (parry)           | 2     | 2     | 70 ms alzar; la ventana es 140 ms | El bisturí cruzado delante.                                  |
| `bebe` (Poción)             | 3     | 3     | 150, 300 y 150 ms                 | Alza el frasco, bebe, lo baja. Queda quieto y vulnerable.    |
| `rezar`                     | 1     | 2     | Mientras reza en el Altar         | De rodillas.                                                 |
| `alza` + `tajo` (ejecución) | 2 + 3 | 2 + 3 | Alza 140 ms; tajo 60 ms cada uno  | Levanta el bisturí sobre el aturdido y lo baja.              |
| `muerte`                    | 4     | 4     | Repartidos en el desplome         | El golpe lo echa atrás, se le doblan las rodillas, postrado. |

## Los enemigos

Cuando el Cirujano golpea, el enemigo destella en blanco, se encoge, recula y sangra: eso lo
hace el código. Para que se lea mejor, a cada uno (Devoto, Vestal, Prior) le vendría bien
**un fotograma de herido**. Se pedirá con su propio encargo.
