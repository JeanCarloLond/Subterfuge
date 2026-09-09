---
title: "[ARTE] Sprite y animaciones del Cirujano-Sacerdote"
labels: arte, fase-2, prioridad-alta
---

## Contexto

El personaje jugable es **"Manos del Sacramento N.º 7"** — el Cirujano-Sacerdote.
No tiene nombre propio: la Diócesis lo nombra por su función. Fue entrenado desde
niño para heredar el oficio de un progenitor que murió (o fue "reformado") en un
sacramento fallido.

**Lectura de silueta que debe transmitir:** no es un guerrero, es un **técnico**.
Sus manos son su oficio y su condena — deben ser el elemento más legible de la
silueta. No es acrobático; su doble salto en el código es deliberadamente más débil
que el primero. Sus movimientos deben leerse como precisos, no como heroicos.

Cree en la Diócesis no por ingenuidad sino porque **necesita** creer: es lo único
que hace soportable lo que hace con sus manos cada día. Que la pose de reposo tenga
algo de cansancio contenido, no de bravuconería.

## Qué se necesita

Spritesheet con el set de animaciones de **Fase 1 (solo locomoción)**. El combate
llega en Fase 2 y se pedirá en un issue aparte.

| Animación | Frames sugeridos | Notas |
|---|---|---|
| `reposo` | 4 | Respiración lenta. Cansancio, no heroísmo. |
| `caminar` | 6 | Velocidad 130 px/s |
| `salto_ascenso` | 2 | |
| `salto_descenso` | 2 | |
| `aterrizaje` | 2 | Absorbe con las rodillas |
| `dash` | 3 | Dura 160 ms — debe leerse en muy poco tiempo |
| `agarre_borde` | 2 | **Colgado de las manos.** Es su oficio: son manos que sostienen. |
| `trepar` | 4 | |

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Caja de colisión en código | **10 × 22 px** |
| Tamaño de frame recomendado | **16 × 24 px** (deja aire para tela/capucha) |
| Origen | Centro-abajo (los pies apoyan en el borde inferior) |
| Orientación | Dibujar **solo mirando a la derecha** — el código hace flip horizontal |
| Formato fuente | `.aseprite` con cada animación en su propio tag |
| Formato entrega | `.png` horizontal, sin padding entre frames |
| Ruta destino | `public/assets/sprites/cirujano.png` |

**Sobre el tamaño:** si 16×24 resulta apretado para leer las manos, súbelo a 24×32
y avísame — ajusto el offset de la caja de colisión en
`src/entities/CirujanoSacerdote.ts`. Lo que **no** puede cambiar sin avisar es el
origen centro-abajo.

## Criterios de aceptación

- [ ] Las manos son legibles a 1x, sin zoom (el juego escala 3x, pero el arte se
      produce a 1x)
- [ ] La silueta se distingue del fondo del Atrio a contraluz
- [ ] Todos los frames comparten el mismo punto de apoyo (no "flota" entre frames)
- [ ] Cada animación tiene su tag en el `.aseprite`
- [ ] Se entrega el `.aseprite` fuente además del PNG

## Restricción del equipo — NO NEGOCIABLE

**Prohibida la IA en este asset.** Decisión ya tomada por el equipo: los sprites de
personajes son pixel art hecho a mano en Aseprite, sin excepción.
