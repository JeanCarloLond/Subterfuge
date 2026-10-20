# Prueba con jugadores

Guía para hacer una sesión de prueba de _Subterfuge_ con gente que no conoce el
juego (#155). Las pruebas automáticas (`npm run verificar`, `npm run
probar-tactil`) dicen si algo se rompe. Esto sirve para lo que una máquina no
ve: dónde se pierde la gente, dónde muere, qué entiende y qué no.

## Lo que necesitas

- **3 personas** que no hayan jugado ni visto el juego. Una sesión por persona,
  de unos 40 minutos.
- El juego publicado: <https://jeancarlolond.github.io/Subterfuge/>.
- Una ventana de incógnito (o un navegador limpio) para que empiece sin partida
  guardada ni nada descubierto.
- Una copia de la **hoja de notas** de abajo por persona.
- Si se puede, grabar la pantalla (con permiso).

## Cómo se hace

1. **No expliques nada.** Ni los controles, ni la historia, ni qué es el
   Códice. Solo: «Es un juego. Juega como jugarías en tu casa. Piensa en voz
   alta si puedes».
2. **No ayudes.** Si se atasca, espera. Si lleva más de 3 minutos sin avanzar,
   anota dónde y pregunta «¿qué crees que tienes que hacer?». Solo entonces,
   una pista.
3. **Anota lo que hace, no lo que crees que piensa.** «Saltó tres veces hacia
   la repisa y no llegó» sirve; «no entendió el salto» no.
4. Para a los **30 minutos** de juego o al llegar al cierre, lo que pase antes.
5. **Cinco preguntas al final**, en este orden y sin sugerir respuestas:
   1. ¿De qué va el juego?
   2. ¿Quién es la niña?
   3. ¿Qué te ha frustrado?
   4. ¿Qué es lo que más te ha gustado?
   5. ¿Jugarías el siguiente nivel?
6. Después, pídele que abra **el portal** (desde «El portal de la Diócesis» en
   la pantalla de inicio) y que lo explore 5 minutos. Anota qué abre primero y
   si nota que el portal sabe lo que ha jugado.

## Qué mirar

| Momento                      | Pregunta para la hoja                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Pantalla de inicio           | ¿Entra sin dudar? ¿Mira las opciones?                             |
| Primeros 2 minutos del Atrio | ¿Descubre saltar, golpear y el dash solo? ¿Abre la ayuda (H)?     |
| Primer Devoto                | ¿Lee la carga del golpe? ¿Prueba el parry?                        |
| Primer Altar                 | ¿Reza? ¿Entiende que ahí vuelve si cae?                           |
| Fragmentos del Códice        | ¿Los recoge? ¿Los lee (L)? ¿Lee los márgenes?                     |
| Fieles con bocadillo         | ¿Habla con ellos? ¿Los confunde con enemigos?                     |
| Muertes                      | Dónde, cuántas veces y de qué                                     |
| El Reformado                 | ¿Cuántos intentos? ¿Entiende que estrellarlo contra el muro abre? |
| La cinemática                | ¿La ve entera o la salta? ¿Qué dice al acabar?                    |
| El cierre                    | ¿Lee «Nivel 2 en desarrollo»? ¿Vuelve al Atrio o cierra?          |

## Hoja de notas

Copia este bloque por persona.

```
Persona:            (iniciales)       Fecha:
Aparato:            (PC / móvil · navegador)
¿Juega a videojuegos?   nunca / a veces / mucho
¿Conoce metroidvanias?  no / sí, cuáles:

Tiempo hasta el primer Altar:
Tiempo hasta el Reformado:
Muertes (zona · causa):

Se perdió en:
Se frustró con:
Se rió / se sorprendió con:
Habló con los fieles:        sí / no
Leyó el Códice:              nada / algo / todo
Cinemática:                  entera / la saltó
Llegó al cierre:             sí / no

Respuestas:
1. ¿De qué va el juego?
2. ¿Quién es la niña?
3. ¿Qué te ha frustrado?
4. ¿Qué es lo que más te ha gustado?
5. ¿Jugarías el siguiente nivel?

Portal: qué abrió primero, si notó que sabía lo jugado:
```

## Móviles reales

Hay cosas que solo pasan en un teléfono de verdad. Hay que probar en **un
iPhone (Safari)** y **un Android (Chrome)**, como mínimo una vez cada uno:

- [ ] La pantalla de inicio se ve entera en horizontal, y en vertical pide girar.
- [ ] El primer toque desbloquea el sonido: en la partida suena la música.
- [ ] La botonera responde: correr y saltar a la vez, golpear, el dash.
- [ ] No hace zoom con un doble toque ni se desplaza la página al arrastrar.
- [ ] La pausa, las opciones, el Códice y los diálogos se manejan con el dedo.
- [ ] La cinemática se salta manteniendo pulsado.
- [ ] Bloquear el teléfono a mitad de partida y volver: con «Continuar» se sigue
      desde el último Altar.
- [ ] Añadir el juego a la pantalla de inicio sale con el icono del Cirujano.
- [ ] El portal se lee sin desplazarse de lado, y el Vientre y el Linaje se
      arrastran dentro de su marco.

## Después

- Guarda las hojas en esta carpeta (`docs/qa/sesion-AAAA-MM-DD-iniciales.md`).
- Abre **una issue por cada problema** que se repita en dos personas o más, con
  la etiqueta `qa`. Lo que solo le pasó a una persona va como comentario en
  #155, por si vuelve a salir.
