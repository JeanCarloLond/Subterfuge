# Audio de Sigma — autoría y licencias

Todo el audio de Sigma es libre. Lo que pide crédito (CC-BY) lo lleva aquí, con su enlace;
lo que es CC0 no lo pide, pero lo damos igual.

## Música

| Archivo                      | Título original                                          | Autor                          | Licencia  | Dónde suena                                |
| ---------------------------- | -------------------------------------------------------- | ------------------------------ | --------- | ------------------------------------------ |
| `musica/portada-arcanos.ogg` | Arcanos, Sorcerer of the Old Banished Woods (boss theme) | ProjectHelmet (Philémon Weber) | CC-BY 4.0 | La portada y la intro                      |
| `musica/atrio-santuario.ogg` | Dark Shrine Loop                                         | qubodup, sobre «Shrine» de yd  | CC0       | El Atrio                                   |
| `musica/catedral-bosque.ogg` | Cathedral in the forest (ambient loop)                   | congusbongus                   | CC0       | El siguiente nivel (y las salas de prueba) |

**Crédito obligatorio (CC-BY 4.0):** «Arcanos, Sorcerer of the Old Banished Woods», tema de
jefe de _Quest of the Elf's Scrolls_, de **ProjectHelmet (Philémon Weber)**
(https://opengameart.org/node/155832; su proyecto: https://helmet2.bandcamp.com/music), bajo
licencia https://creativecommons.org/licenses/by/4.0/. Convertida de MP3 a OGG sin más
cambios. El autor pide que se le enlace el proyecto que la use.

Las otras dos, CC0 (https://creativecommons.org/publicdomain/zero/1.0/):

- «Dark Shrine Loop», de qubodup (https://opengameart.org/content/dark-shrine-loop), una
  remezcla de «Shrine», de yd (https://opengameart.org/content/shrine).
- «Cathedral in the forest (ambient loop)», de congusbongus
  (https://opengameart.org/content/cathedral-in-the-forest-ambient-loop).

## Efectos

Del pack «50 RPG sound effects» de **Kenney** (www.kenney.nl,
https://opengameart.org/content/50-rpg-sound-effects), CC0: el autor dice que el crédito
no es obligatorio, pero lo damos. Renombrados al uso que tienen aquí:

| Archivo                      | Original              | Uso                              |
| ---------------------------- | --------------------- | -------------------------------- |
| `efectos/paso-0..9.ogg`      | `footstep00..09.ogg`  | Los pasos                        |
| `efectos/tajo-0..2.ogg`      | `drawKnife1..3.ogg`   | El bisturí cortando el aire      |
| `efectos/golpe-0..1.ogg`     | `knifeSlice.ogg`, `2` | Un golpe que entra               |
| `efectos/golpe-fuerte-0.ogg` | `chop.ogg`            | Cargado, contragolpe y ejecución |
| `efectos/guardia-0.ogg`      | `metalClick.ogg`      | Alzar la guardia (parry)         |
| `efectos/salto-0..3.ogg`     | `cloth1..4.ogg`       | El salto                         |
| `efectos/caida-0.ogg`        | `dropLeather.ogg`     | Tocar suelo                      |

El trago de la Poción no es un archivo: se calcula en `scripts/sonidos.gd`, como el Latido y
el crujido de los muros.

El parry logrado (#234) también se calcula ahí (`Sonidos.parada()`: choque, metal que vibra
y se apaga, peso grave y cola de nave), pero se guarda como archivo para no calcularlo al
arrancar: `efectos/parry-0..2.wav`, tres versiones (acero, hueso, hoja). Suena la que elige
`Efectos.PARRY`. Igual el disparo de la Injertadora (#241, `Sonidos.disparo()`: peso grave,
detonación, cerrojo de metal y aire), en `efectos/disparo-0.wav`. Los escribe
`herramientas/crear_sonidos.gd`. Ni grabados ni generados por IA: ondas y ruido.

## Voces

Los mismos archivos que usa el juego original, copiados aquí porque Godot solo carga lo que
está dentro de su proyecto. La autoría completa, con enlaces, está en
`public/assets/audio/voces/LICENCIAS.md`.

| Archivo                | Título original                            | Autor    | Licencia |
| ---------------------- | ------------------------------------------ | -------- | -------- |
| `voces/cirujano-*.mp3` | 15 vocal male strain/hurt/pain/jump sounds | qubodup  | CC0      |
| `voces/monstruo-*.mp3` | Monster Sound Effects Pack                 | Ogrebane | CC0      |
