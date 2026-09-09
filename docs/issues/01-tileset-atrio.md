---
title: "[ARTE] Tileset del Atrio (nivel 1 - superficie)"
labels: arte, fase-2, prioridad-alta
---

## Contexto

El Atrio es la **superficie de El Vientre**: la ciudad visible donde vive la mayoría
de la población de la Diócesis. Es el primer espacio que ve el jugador y el **más
luminoso de todo el teaser** — cada nivel posterior (Pasillos de Preparación →
Salas de Sacramento → Criptas → Niveles Reformados → Vientre Profundo) debe leerse
como más oscuro, más orgánico y más peligroso que este.

Clave de dirección de arte: el Atrio todavía parece **arquitectura**. La carne
asoma solo en los bordes — una juntura demasiado húmeda, una cañería que parece
vena. No es todavía body horror explícito; es la promesa de él.

## Qué se necesita

Un tileset jugable para construir la geometría del Atrio en Tiled.

**Contenido mínimo:**
- Suelo y plataformas (superficie, relleno, esquinas izquierda/derecha)
- Muros verticales con borde superior definido (el jugador se agarra de los bordes,
  así que la "boca" del borde debe leerse claramente)
- Transiciones suelo↔muro (esquinas internas y externas)
- 2 variantes de desgaste para romper la repetición visual
- Tiles de fondo (capa no colisionable): sillería, arcos, conductos

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tamaño de tile | **16 × 16 px** |
| Formato fuente | `.aseprite` (con capas separadas) |
| Formato entrega | `.png`, PNG-8 o PNG-24, fondo transparente |
| Organización | Un solo PNG en rejilla, sin padding ni espaciado |
| Paleta | Máx. 32 colores, coherente con la guía (issue #3) |
| Ruta destino | `public/assets/tilesets/atrio.png` |

**Importante sobre el espaciado:** el tileset debe exportarse **sin margin ni
spacing** entre tiles. Phaser lo carga con `frameWidth: 16, frameHeight: 16` y
cualquier padding rompe la alineación.

## Criterios de aceptación

- [ ] El PNG se importa en Tiled con rejilla de 16×16 sin desalineación
- [ ] Los bordes superiores de los muros son visualmente distinguibles del relleno
- [ ] Colocados en secuencia, los tiles de suelo no muestran costuras
- [ ] La paleta no introduce colores fuera de la guía de estilo
- [ ] Se entrega el `.aseprite` fuente además del PNG

## Referencias

- Blasphemous — sillería de Cvstodia, iconografía católica en piedra
- Bioshock — arquitectura vertical decadente, Art Decó degradado
- Francis Bacon, *Figure with Meat* (1954) — fusión carne/institución

## Restricción del equipo

**Sin IA para este asset.** Pixel art hecho a mano en Aseprite. (Si en algún momento
se autoriza IA será solo para *bocetos* de tileset o fondos, nunca para la entrega
final ni para personajes.)
