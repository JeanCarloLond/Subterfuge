---
title: "[ARTE] Props narrativos del Atrio (arquitectura que cuenta historia)"
labels: arte, fase-3, prioridad-baja
---

## Contexto

Requisito explícito del brief: **el lore se cuenta por arquitectura y objetos, nunca
por bloques de texto expositivo.** Estos props son el vehículo principal de ese
requisito en el primer nivel.

El jugador debe poder deducir, sin que nadie se lo explique:
1. Que aquí se ofrenda cuerpo de forma **rutinaria y burocrática**
2. Que la gente lo hace **con esperanza**, no bajo coacción visible
3. Que el sistema lleva **generaciones** funcionando

El horror del mundo no es que sea cruel — es que es **normal**. Nadie en la Diócesis
es "el malo"; todos son engranajes. Los props deben transmitir esa normalidad
administrativa, que es lo que lo vuelve insoportable.

## Qué se necesita

**Set de props de fondo y decorado del Atrio:**

- **Tablón de sorteos del diezmo** — listas de nombres, algunos tachados. La
  burocracia de la carne.
- **Cola de ofrendantes** (silueta de fondo, no interactuable) — gente esperando
  su turno. Esperando **con ganas**.
- **Exvotos colgantes** — ofrendas de agradecimiento por sacramentos "exitosos"
- **Iconografía de los Primigenios** en relieve o vitral
- **Conductos y cañerías** que ya empiezan a parecer vasculares
- **Fragmento del Códice de la Carne** — sprite del coleccionable de lore

## Regla de consistencia — CRÍTICA

En cualquier representación de un Primigenio (relieve, vitral, estatua, icono):

**Todos los Primigenios son ciegos.** Dogma: *"los dioses no miran, son mirados"*.
Conocen el mundo por tacto e ingesta.

- Sin ojos, ni siquiera vestigiales o estilizados
- La iconografía enfatiza **manos, bocas, superficies de contacto**
- Ninguna imagen sagrada de la Diócesis representa un dios que observa al fiel

Si un relieve parece "mirar" al jugador, está mal y se rechaza en revisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Rejilla base | Múltiplos de **16 px** |
| Formato fuente | `.aseprite` |
| Formato entrega | `.png` con transparencia, un archivo por prop o atlas |
| Ruta destino | `public/assets/sprites/props/` |
| Paleta | La de la guía (issue #3) |

## Criterios de aceptación

- [ ] Ningún Primigenio representado tiene ojos
- [ ] Los props se leen como decorado, no compiten con la geometría jugable
- [ ] El fragmento del Códice es distinguible como recogible sin brillo estridente
- [ ] Un jugador que solo mire el fondo puede deducir los 3 puntos del contexto
- [ ] Se entrega el `.aseprite` fuente

## Restricción del equipo

Sin IA para props de personajes o criaturas. Si en algún momento se autoriza IA
para *bocetar* fondos o tilesets, será con petición explícita y el resultado final
igualmente se redibuja a mano.
