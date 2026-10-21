<!--
  El título de la PR sigue la convención de los commits, porque al fusionar con
  squash es el mensaje que queda en main:
    <gitmoji> <tipo>(<componente>): <descripción>
    ✨ feat(juego): la niña sigue al Cirujano por el Nivel 2
  Tipos, componentes y gitmojis en CONTRIBUTING.md. El CI lo comprueba.
-->

## Qué hace

<!-- En dos o tres frases: qué cambia para quien juega o para quien lee el código. -->

Closes #

## Cómo se ha probado

<!-- Qué has hecho para saber que funciona: jugado en qué zona, con teclado o dedo, qué test cubre qué. -->

## Comprobaciones

- [ ] El título y los commits siguen la convención (`<gitmoji> <tipo>(<componente>): …`).
- [ ] `npm run verificar` pasa en local (formato, lint, tipos, tests, verificaciones del juego y build).
- [ ] Si toco lógica de `src/systems/`, `src/input/` o los módulos de `web/src/`, he añadido o actualizado su test en `tests/`. Si no hace falta, el PR lleva la etiqueta `sin-tests` y lo explico aquí arriba.
- [ ] Si cambia algo que se ve, hay una captura.
- [ ] El arte es pixel art hecho a mano, sin IA.
- [ ] Los textos visibles usan el léxico del mundo y llevan tildes.
