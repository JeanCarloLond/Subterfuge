---
title: "[ARTE] HUD: Fervor, salud y Poción de Carne"
labels: arte, fase-3, prioridad-media
---

## Contexto

El HUD es el lugar donde el sistema del mundo se vuelve mecánica visible. En
Blasphemous, el "Fervor" convierte la devoción en recurso jugable; aquí hacemos lo
mismo con el vocabulario de la Diócesis.

**Regla de escritura para toda la UI:** el juego nunca usa términos genéricos. No
hay "mana", "stamina" ni "health potion". Hay **Fervor**, **Poción de Carne**,
**Altares**. Esto también aplica a los nombres de archivo y a cualquier copy.

## Qué se necesita

### 1. Indicador de salud
El cuerpo del Cirujano es, como el de todos en la Diócesis, **moneda**. Que el
indicador no se lea como una barra de videojuego neutra sino como algo corporal —
tejido, sutura, marca en la piel.

### 2. Indicador de Fervor
- Recurso que se acumula (máximo 100 en código)
- Debe leerse como devoción acumulada, no como energía mágica
- Estados: vacío, parcial, lleno (lleno = habilitación del ataque cargado en Fase 2)

### 3. Frasco de Poción de Carne
- Icono del consumible + contador de cargas
- Estados: disponible / agotado

### 4. Marcador de fragmento del Códice de la Carne
Notificación **discreta** al recoger un coleccionable de lore. Requisito del brief:
el lore entra de forma **no intrusiva**. Nada de pop-up modal que corte el juego —
un destello en la esquina y sigue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Resolución interna del juego | **480 × 320 px** (el HUD se diseña a esta escala) |
| Escala de presentación | 3x (diseñar a 1x, se escala solo) |
| Formato fuente | `.aseprite` |
| Formato entrega | `.png` con transparencia |
| Ruta destino | `public/assets/sprites/hud/` |

**Ojo con el espacio:** a 480×320 el HUD tiene muy poco sitio. Prioriza legibilidad
sobre ornamento; el ornamento va en el nivel, no en la interfaz.

## Criterios de aceptación

- [ ] Legible a 1x sin ampliar
- [ ] No usa vocabulario genérico (nada de "HP", "MP", "stamina")
- [ ] La notificación de Códice no bloquea ni oscurece la acción
- [ ] Los estados de cada indicador se distinguen sin color únicamente
      (accesibilidad para daltonismo)
- [ ] Se entrega el `.aseprite` fuente

## Restricción del equipo

Sin IA. Pixel art hecho a mano en Aseprite.
