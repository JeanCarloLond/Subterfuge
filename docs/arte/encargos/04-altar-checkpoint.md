---
title: "[ARTE] Altar (punto de guardado) + animación de reposo"
labels: arte, fase-2, prioridad-media
---

## Contexto

Los **Altares** son los checkpoints del teaser. Narrativamente no son un descanso
neutro: son el punto donde el Cirujano-Sacerdote **reafirma su fe** para poder
seguir. Guardar la partida es, en el mundo, un acto litúrgico.

Es una de las piezas donde el lore entra sin texto expositivo: el jugador debe
entender qué es y qué significa por cómo se ve y cómo el personaje se comporta ante
él, no por un cartel.

## Qué se necesita

### 1. Sprite del Altar
- Estado **inactivo** (aún no descubierto): apagado, casi confundido con el decorado
- Estado **activo** (ya usado): la luz litúrgica prendida
- Transición inactivo → activo (4-6 frames)
- Bucle de reposo activo (4 frames): la llama, el latido, algo que respire

### 2. Animación del Cirujano en el Altar
Se pedirá junto con el spritesheet del personaje (issue #2), pero conviene diseñarla
aquí porque depende de la composición del altar:
- Pose de arrodillado / ofrenda (4-6 frames)

**Nota de tono:** que no se lea como devoción serena. Se lea como necesidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tamaño del altar | **16 × 20 px** (placeholder actual en código) |
| Formato fuente | `.aseprite` con tags por estado |
| Formato entrega | `.png` horizontal, sin padding |
| Ruta destino | `public/assets/sprites/altar.png` |

Si la composición pide más espacio (por ejemplo 32×32 para que el Cirujano quepa
arrodillado en la misma escena), avísame y ajusto el placeholder en código.

## Criterios de aceptación

- [ ] Los estados inactivo y activo se distinguen a simple vista, sin leer texto
- [ ] El estado inactivo NO grita "interactúa conmigo" — debe descubrirse
- [ ] El bucle activo no tiene salto visible al reiniciar
- [ ] Se entrega el `.aseprite` fuente

## Restricción del equipo

Sin IA. Pixel art hecho a mano en Aseprite.
