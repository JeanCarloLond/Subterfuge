---
title: "[ARTE] Guía de estilo y paleta cromática de El Vientre"
labels: arte, fase-1, prioridad-alta, bloqueante
---

## Contexto

Este issue **bloquea a los demás**: el tileset y los sprites deben salir de una
paleta común o el nivel se verá como un collage. Conviene resolverlo primero.

El Vientre es un complejo hospitalario-catedral construido en capas verticales bajo
tierra. La estética es **horror gótico-religioso + body horror biotecnológico**.

## Qué se necesita

### 1. Paleta maestra

Máximo **32 colores** para todo el teaser, organizada en rampas:
- **Piedra / arquitectura** — la base fría del Atrio
- **Carne** — rosados enfermos, no rojos vivos. La carne aquí está *viva*, no
  sangrando.
- **Metal quirúrgico** — el único elemento que refleja luz limpia
- **Luz litúrgica** — cirios, no bombillas. Cálida y escasa.

### 2. Progresión cromática por nivel

Cada nivel del descenso debe tener su desviación de la paleta maestra, más oscura y
más orgánica que la anterior:

| Nivel | Dirección cromática |
|---|---|
| El Atrio | Piedra fría dominante. La carne apenas asoma. |
| Pasillos de Preparación | Burocracia: papel, sellos, luz de archivo |
| Salas de Sacramento | Metal quirúrgico + carne. Máximo contraste. |
| Criptas de Espera | Penumbra sedada, casi monocromo |
| Niveles Reformados | La arquitectura ya es carne |
| Vientre Profundo | Sin referencia arquitectónica reconocible |

### 3. Regla de consistencia del mundo — CRÍTICA

**Todos los Primigenios son ciegos.** De ahí el dogma *"los dioses no miran, son
mirados"*. Conocen el mundo por **tacto e ingesta** — la carne del diezmo es su
único sentido del mundo.

Consecuencias para el arte, cuando llegue el momento de diseñarlos:
- **Ningún Primigenio tiene ojos funcionales**, ni ojos vestigiales que "miren"
- Su anatomía privilegia superficies de contacto: bocas, poros, membranas, tejido
  receptor
- No pueden reaccionar visualmente a nada — nada de "girarse hacia" el jugador
- El estatus social en el mundo es **performativo**, no visual: se demuestra con el
  cuerpo ofrendado, no con insignias que alguien deba ver

Esta regla aplica también a iconografía, vitrales y relieves: la Diócesis no
representa dioses que observan.

## Entrega

| Parámetro | Valor |
|---|---|
| Formato | `.gpl` (paleta GIMP/Aseprite) + `.png` de muestra |
| Documento | Una lámina PNG con las rampas etiquetadas |
| Ruta destino | `docs/arte/paleta-vientre.gpl` y `docs/arte/guia-estilo.png` |

## Criterios de aceptación

- [ ] Paleta de ≤32 colores exportada en `.gpl` importable en Aseprite
- [ ] Cada rampa etiquetada por función (piedra, carne, metal, luz)
- [ ] Lámina de progresión con los 6 niveles
- [ ] La regla de los Primigenios ciegos queda escrita en la guía

## Referencias

- Blasphemous — iconografía católica española, "Fervor" como recurso
- Bioshock — Rapture, verticalidad decadente
- Francis Bacon — *Figure with Meat* (1954), influencia documentada de Blasphemous
