# Subterfuge

[![CI](https://github.com/JeanCarloLond/Subterfuge/actions/workflows/ci.yml/badge.svg)](https://github.com/JeanCarloLond/Subterfuge/actions/workflows/ci.yml)

Teaser jugable 2D del universo narrativo **"La Diócesis de la Carne"**.

### ▶ [Jugar ahora](https://jeancarlolond.github.io/Subterfuge/)

Se juega en el navegador, sin instalar nada. Se publica solo en cada cambio que
llega a `main`.

> ¿Prefieres levantarlo en tu máquina? [Ejecutar en local](#ejecutar-en-local),
> son tres comandos.

## Descripción

Subterfuge es un teaser jugable en formato de videojuego 2D ambientado en el universo narrativo de " Subterfuge -- La Diócesis de la Carne". El proyecto surge como una evolución del ArtBook tradicional, transformando la entrega visual en una experiencia interactiva que permite al jugador sumergirse en el mundo de forma orgánica y visceral.

El teaser funciona como una puerta de entrada al universo, presentando el mythos, ethos y topos del mundo a través de la jugabilidad misma, no mediante textos extensos o cinemáticas pasivas. La inspiración principal es Blasphemous, referente directo en la fusión de horror religioso, body horror y acción 2D.

## Sinopsis del Universo

En las profundidades de El Vientre, una catedral-hospital construida en capas verticales bajo tierra, la humanidad rinde culto a los Primigenios: masas de carne mutada nacidas de un experimento de modificación genética que prometía el fin de la muerte y terminó creando dioses hambrientos e indiferentes. Generación tras generación, la sociedad entrega diezmos de carne para mantenerlos calmados, mientras el Cirujano-Sacerdote, heredero de un oficio que nunca eligió, ejecuta los sacramentos que transforman a los Elegidos, hasta que una niña voluntaria lo obliga a preguntarse si lo que hace es salvación o carnicería.

## El Teaser Jugable

El jugador asume el rol del Cirujano-Sacerdote en una sección del Vientre, explorando sus pasillos y enfrentándose a las criaturas que habitan sus niveles. A través de la exploración, el combate y la interacción con el entorno, el jugador descubre fragmentos de la historia del mundo, sus rituales y sus horrores.

### Características Principales

- Exploración en 2D de estilo Metroidvania
- Sistema de combate basado en precisión y ritmo
- Mecánicas de parkour y movimiento fluido
- Narrativa ambiental integrada en el escenario
- Estética pixel art de inspiración gótica y religiosa

---

## Ejecutar en local

### Requisitos

Solo necesitas **Node.js 20 o superior**. Nada más: ni Unity, ni Godot, ni
ningún editor especial. El juego corre en el navegador.

- Descárgalo en [nodejs.org](https://nodejs.org) (la versión LTS sirve).
- Comprueba que quedó instalado:

  ```bash
  node --version   # debe decir v20.x.x o superior
  npm --version
  ```

### Puesta en marcha

```bash
git clone https://github.com/JeanCarloLond/Subterfuge.git
cd Subterfuge
npm install
npm run dev
```

El último comando imprime una dirección como esta:

```
➜  Local:   http://localhost:5173/
```

Ábrela en el navegador y el juego arranca. Mientras `npm run dev` siga
corriendo, cualquier cambio que guardes en el código se recarga solo. Para
pararlo, `Ctrl + C` en la terminal.

> `npm install` solo hace falta la primera vez, o cuando alguien añada una
> dependencia nueva.

### Controles

| Acción                | Teclas                     |
| --------------------- | -------------------------- |
| Mover                 | `A` / `D` o flechas        |
| Saltar / doble saltar | `Espacio` o `Z`            |
| Dash (esquiva)        | `Shift` o `X`              |
| Atacar                | `J` o `C`                  |
| Ataque cargado        | mantener `J` / `C`, soltar |
| Parry                 | `K` o `V`                  |
| Poción de Carne       | `Q`                        |
| Rezar / descender     | `E`                        |
| Trepar (colgado)      | `W` / flecha arriba        |
| Soltarse (colgado)    | `S` / flecha abajo         |

El **parry** es la mecánica central. Cuando un enemigo se tensa y se tiñe,
te está avisando de que va a golpear: pulsa `K` en ese momento. Contra el
Vestal, además, no solo paras su sello — se lo devuelves con el triple de daño.

### Si algo falla

| Síntoma                            | Qué hacer                                                        |
| ---------------------------------- | ---------------------------------------------------------------- |
| `npm: command not found`           | Node no está instalado o falta reiniciar la terminal.            |
| El puerto 5173 está ocupado        | Vite elige otro solo; usa la dirección que imprima.              |
| Pantalla en negro                  | Abre la consola del navegador (`F12`) y pasa el error al equipo. |
| Errores raros tras cambiar de rama | `rm -rf node_modules && npm install`                             |

---

## Estado del Proyecto

Subterfuge se encuentra en fase de desarrollo. El equipo está trabajando en la definición de mecánicas, el diseño de niveles y la producción de arte.

**Fase 3 (Pulido y contenido) — en curso.** El bucle del teaser ya cierra de
principio a fin:

- **Movimiento completo**: salto, doble salto, dash con invulnerabilidad y
  agarre de bordes.
- **Combate**: ataque, ataque cargado (gasta Fervor) y parry que aturde.
- **Sistemas**: Fervor, Poción de Carne, Altares de guardado y fragmentos del
  Códice de la Carne.
- **Tres enemigos**: el Devoto (cuerpo a cuerpo), el Vestal (a distancia, y sus
  sellos se le pueden devolver con el parry) y el Reformado, el jefe, con tres
  fases.
- **Tres zonas**: El Atrio, los Pasillos de Preparación y las Salas de
  Sacramento, más una pantalla de cierre.

Pendiente: el arte definitivo, el audio, y escribir el gancho final.

> **Sobre el arte que se ve ahora:** es provisional. Es pixel art escrito a mano
> en código (`src/systems/ArteProvisional.ts`), sin ninguna imagen generada por
> IA, y existe solo para que el prototipo no fueran cuadrados de colores
> mientras el equipo produce los sprites definitivos en Aseprite.

## Tecnologías

El proyecto se desarrolla utilizando herramientas de código abierto y gratuitas, priorizando la accesibilidad y la sostenibilidad del desarrollo:

| Área              | Herramienta            |
| ----------------- | ---------------------- |
| Motor de juego    | Phaser 3.90            |
| Lenguaje          | TypeScript             |
| Bundler           | Vite                   |
| Calidad           | ESLint + Prettier      |
| Diseño de niveles | Tiled Map Editor       |
| Arte y animación  | Aseprite / LibreSprite |
| Edición de audio  | Audacity               |
| Publicación       | Itch.io / GitHub Pages |

## Filosofía del Proyecto

El desarrollo de Subterfuge se guía por los siguientes principios:

- La narrativa se integra en la jugabilidad, no se añade como un extra
- El mundo cuenta su propia historia a través de su arquitectura y detalles
- El arte es creado manualmente, sin uso de inteligencia artificial para el diseño de personajes
- La experiencia debe ser inmersiva y coherente con el tono del universo

## Cómo Contribuir

Este es un proyecto académico del equipo conformado por:

- Agustin Figueroa
- Alejandro Garces Ramirez
- Jean Carlo Londoño Ocampo
- Mariana Echeverri Ramirez

Para consultas o comentarios, contactar a los integrantes del equipo.

### Flujo de trabajo

1. Crea una rama para tu cambio: `git checkout -b mi-cambio`
2. Antes de subir, pasa todas las comprobaciones:

   ```bash
   npm run verificar
   ```

   Esto ejecuta formato, linter, tipos, las verificaciones del juego y el build
   —lo mismo que corre el CI—. Si pasa aquí, pasa allí.

3. Si el formato se queja, se arregla solo: `npm run format`
4. Abre un Pull Request. El CI vuelve a comprobarlo todo.

### Comandos disponibles

| Comando                   | Para qué sirve                                         |
| ------------------------- | ------------------------------------------------------ |
| `npm run dev`             | Servidor local con recarga automática                  |
| `npm run build`           | Build de producción en `dist/`                         |
| `npm run preview`         | Sirve el build de producción para probarlo             |
| `npm run verificar`       | **Todas** las comprobaciones del CI, de una vez        |
| `npm run format`          | Aplica el formato de Prettier                          |
| `npm run lint`            | Reglas de código (ESLint)                              |
| `npm run typecheck`       | Comprobación de tipos sin generar build                |
| `npm run verificar-arte`  | Comprueba que las figuras del pixel art sean correctas |
| `npm run verificar-rutas` | Comprueba que en cada nivel se pueda volver a subir    |

Los dos últimos son propios del juego y no los cubre ningún linter.
`verificar-rutas` existe porque el Atrio llegó a publicarse sin ruta de vuelta, y
al caer al fondo el jugador quedaba encallado; ahora eso no puede colarse.

### Documentación

- **[docs/DESARROLLO.md](docs/DESARROLLO.md)** — estructura del proyecto, flujo
  de escenas, arquitectura del combate, convenciones y ajuste de sensación.
- **[docs/issues/](docs/issues/)** — encargos de arte pendientes, con formatos y
  criterios de aceptación.

## Licencia

Todos los derechos reservados. Este proyecto es de uso académico y no está autorizado para distribución comercial sin el consentimiento expreso del equipo.
