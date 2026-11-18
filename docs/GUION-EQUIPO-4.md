# Guión de presentación en equipo (4 personas) — Subterfuge

Guión para presentar y **vender** Subterfuge como ejercicio de clase, repartido
entre cuatro ponentes. Los otros documentos (`GUION-PRESENTACION.md`,
`GUION-ORAL.md`) son para un solo presentador; este divide el mismo material en
cuatro voces, con turnos de palabra, responsabilidades técnicas y un cierre que
pide nota.

Duración total: **12–14 minutos + preguntas.** Si el profesor aprieta el tiempo,
los recortes están marcados con ✂.

---

## Reparto (quién es quién)

| Ponente             | Rol en la charla                    | Se hace cargo de                                        |
| ------------------- | ----------------------------------- | ------------------------------------------------------- |
| **P1 — Agustín**    | Apertura y tesis. Conduce el juego. | El encuadre (libro de arte jugable), arranque técnico.  |
| **P2 — Alejandro**  | Mythos y narrativa.                 | El Códice, la voz del Cirujano, el jefe, el final.      |
| **P3 — Mariana**    | Arte, ethos y topos. Público.       | Estética, paleta, jerarquía de cuerpos, el Vientre.     |
| **P4 — Jean Carlo** | Sistemas, ingeniería y cierre.      | Combate, CI, web del universo, conclusión y venta.      |

**Regla de oro:** solo habla quien no está jugando en ese momento. P1 juega
durante la apertura y el combate; P4 toma el teclado para la demostración
técnica. Ningún ponente habla encima de otro: cada bloque tiene un dueño.

**Antes de empezar (checklist de todo el equipo):**

- [ ] Abrir <https://jeancarlolond.github.io/Subterfuge/> en Chrome, pantalla
      completa (`F11`). Plan B: `npm run preview` en local.
- [ ] **Un clic dentro del juego** antes de empezar (el navegador no permite
      audio sin interacción). Volumen alto: la música cambia por zona.
- [ ] Recargar para empezar con partida limpia en el Atrio.
- [ ] Segunda pestaña: el repositorio en GitHub, por si preguntan por el código.
- [ ] Tercera pestaña: el portal <https://jeancarlolond.github.io/Subterfuge/web/>.
- [ ] Ensayar una vez el relevo de teclado entre P1 y P4: es lo que más se nota
      si sale mal.

---

## Bloque 1 — Apertura y tesis (P1 · 2 min)

**En pantalla:** nada todavía. El juego está cargado pero no se toca.

**P1 dice:**

> Profe, la entrega era un libro de arte. Y un libro de arte es una cosa muy
> concreta: fichas de personajes, un mapa del mundo, la jerarquía de la
> sociedad, documentos del universo, una guía de estilo con su paleta y, si hay
> suerte, una banda sonora. Es el objeto donde un mundo se enseña antes de
> existir.
>
> Nosotros hicimos todo eso. Pero lo metimos dentro de algo que se juega. Un
> libro de arte se mira desde fuera; el nuestro se atraviesa. El lector no lee
> que el Vientre tiene seis capas: baja por ellas. No lee que el estatus se mide
> en cuánto cuerpo te queda: se lo cruza en cada enemigo.
>
> Se llama **Subterfuge**. Es un teaser de quince a treinta minutos, en 2D, en
> el navegador, del universo "La Diócesis de la Carne". Somos cuatro y cada uno
> va a defender una parte: Alejandro el mito, Mariana el arte y el mundo, Jean
> Carlo los sistemas. Yo abro y conduzco.
>
> Los tres ejes del mundo, en una línea cada uno:
>
> - **Mythos:** Genesis Vestal prometió el fin de la muerte. Los mil sujetos no
>   murieron: mutaron. Los científicos reescribieron el fracaso como escritura
>   sagrada. Los dioses no miran.
> - **Ethos:** el cuerpo es moneda. Cuanto más transformado, más arriba. Nadie
>   ahí abajo llama violencia a lo que pasa.
> - **Topos:** el Vientre, una catedral-hospital de seis capas bajo tierra.
>   Descender es degradarse.

**Transición a P2:** "Empieza el juego. El protagonista habla."

✂ Si falta tiempo: leer solo los tres ejes, sin la introducción larga.

---

## Bloque 2 — El Atrio: el mito en la primera pantalla (P2 · 3 min)

**En pantalla (P1 juega):** dejar hablar al Cirujano (avanzar con `E`). Moverse
y saltar. Pelear con el primer Devoto: un golpe (`J`), un **parry** (`K` o clic
derecho), y si sale, un golpe cargado. Rezar en el Altar (`E`). Recoger el
primer fragmento y abrir el libro con `L`.

**P2 dice (sobre la voz del Cirujano):**

> El protagonista no tiene nombre: es "Manos del Sacramento número siete".
> Heredó el oficio de su padre. Hoy tiene una ofrenda de casa: una deuda vieja
> que se salda en carne. No la sortearon; la niña vino sola y firmó. Para él es
> un buen día.
>
> Y fíjense en cómo habla. Dice que cuadra sin que nadie llore, que esos son los
> buenos días. No se horroriza, porque dentro de este mundo nadie se horroriza.
> El horror lo pone el que escucha. Ese es el mythos contado sin una sola
> cinemática.

**P2 dice (sobre el Códice, ya con el libro abierto):**

> Esto es un folio del Códice de la Carne, la escritura sagrada del mundo. Está
> hecho en capas: debajo, casi invisible, hay un formulario técnico —"GENESIS
> VESTAL · PROTOCOLO"—; encima, la escritura, con rúbrica roja y versículos
> numerados; y al margen, a lápiz, la otra mano: lo que el Cirujano piensa y no
> dice. El documento del bible dice que los manuales técnicos se volvieron
> escritura sagrada, y el folio lo tiene en capas, como un palimpsesto.
>
> Y hay algo que un libro impreso no puede hacer: la anotación a lápiz aparece
> medio segundo **después** del versículo. Primero se lee lo oficial; luego
> llega la duda.

**P2 dice (sobre el jefe, sin llegar aún):**

> Y el mito culmina en el jefe: el Reformado son las Manos anteriores de la Sala
> 7. El padre del Cirujano, que el bible deja "muerto, o reformado, en un
> sacramento fallido". El jugador pelea contra el resultado de su propio oficio.
> Y la regla que atraviesa el mundo: los dioses son ciegos. Por eso en el juego
> no aparece ni un solo dios, y eso no es una limitación: es el mundo
> funcionando.

✂ Si falta tiempo: saltar el combate del Devoto, ir directo a hablar con el
Cirujano y abrir el libro.

**Relevo:** P1 suelta el teclado y pasa a hablar de arte.

---

## Bloque 3 — Ethos, topos y el libro de arte (P3 · 4 min)

**En pantalla:** el libro abierto, sección **Jerarquía**. Después **El Vientre**
(el corte en seis capas). Al final, el **Registro**.

**P3 dice (ethos — la jerarquía de los cuerpos):**

> El ethos del mundo es una sola idea: el cuerpo es moneda. Se paga con carne,
> se asciende entregando carne, y el estatus se mide por cuánto te pareces a un
> dios-carne.
>
> Aquí está, ordenado: Devoto, casi entero, un brazo sustituido y una venda en
> los ojos —sigue siendo una persona, y eso es lo que da miedo. Manos del
> Sacramento, intacto: la excepción, vale más entero, cortando. Vestal, de
> cintura para arriba. Reformado, a medias. Primigenio, ninguno. **Subir es
> dejar de ser persona.** Un juego normal mataría más al enemigo más fuerte;
> aquí el más transformado es el que llegó más arriba.

**P3 dice (topos — el corte del Vientre):**

> El topos es un solo edificio: el Vientre, seis capas verticales. Atrio,
> Pasillos de Preparación, Criptas de Espera, Salas de Sacramento, Niveles
> Reformados, Vientre Profundo. El teaser baja cuatro; las dos del fondo salen
> cerradas, porque los Mil viven ahí y el pueblo no los ha visto jamás.
>
> Y bajar se nota en las paredes. En el Atrio todavía es arquitectura: sillería,
> ventanas con luz. En los Pasillos la burocracia parcheó la piedra con chapa
> remachada. En las Criptas la vena ya se abrió paso por las juntas. En las
> Salas no queda piedra: es máquina y carne.

**P3 dice (el color, el sello de identidad visual):**

> Y el detalle que hace único a este mundo: el bible lo llama "futuro
> sedimentado bajo lo medieval". En el juego eso tiene un color: el **turquesa**.
> Es el único color que no es carne, sangre, oro ni piedra, y solo lo llevan las
> cosas que fueron tecnología de Genesis Vestal: el filo del bisturí, las
> cánulas de los Devotos, las terminales muertas, los tanques de cultivo. Cuanto
> más hondo, más turquesa. El Cirujano toca ese futuro todos los días y no sabe
> que lo es.
>
> Todo esto —la jerarquía, el mapa, las fichas— es lo que tendría un libro de
> arte. Aquí está dentro del juego, y la lámina de cada ficha es el sprite que
> el jugador acaba de ver moverse.

✂ Si falta tiempo: solo la Jerarquía y el Vientre.

**Relevo:** P3 devuelve a P1/P4 y pasa a preguntas del público.

---

## Bloque 4 — Sistemas e ingeniería (P4 · 3 min)

**En pantalla (P4 toma el teclado):** bajar a los Pasillos (`E` en el umbral),
pelear con una Vestal, lanzar un injerto (`F`), abrir la pausa (`Esc`) para
mostrar la lista de controles. Si hay tiempo, la pestaña del repositorio con
`npm run verificar`.

**P4 dice (diseño de sistemas):**

> Aquí está la parte que casi nadie ve desde fuera, y es la que más nos costó.
>
> El juego no tiene maná: el recurso se llama **Fervor** y se gana golpeando y
> parando, con el cuerpo. La curación es una **Poción de Carne**. Guardar la
> partida es **rezar en un Altar**: el juego no tiene checkpoints, tiene liturgia.
> No hay una sola palabra de videojuego en pantalla. No dice "game over": dice
> "la carne cede".
>
> El **parry** es la mecánica central: el enemigo se tensa y se tiñe para avisar
> de que va a golpear, y contra la Vestal no solo se para el sello —se le
> devuelve con el triple de daño—. La Injertadora, el arma a distancia, es el
> instrumento con el que se encajaban las prótesis, usado al revés.

**P4 dice (ingeniería y proceso):**

> Todo esto está hecho con herramientas gratuitas y de código abierto, como pedía
> la propuesta: Phaser 3 y TypeScript, publicado en GitHub Pages, con integración
> continua en cada cambio.
>
> Y el CI no comprueba solo formato y tipos. Tenemos comprobadores propios que
> ningún linter trae: uno verifica que en cada nivel se pueda **volver a subir**
> —el Atrio llegó a publicarse con un salto imposible y el jugador quedaba
> encallado abajo—, otro verifica que el pixel art cuadre y que el decorado no
> flote. Ese tipo de control es lo que separa un prototipo de un proyecto.
>
> Y luego está la web del universo, el portal de la Diócesis: la doctrina, el
> Registro con sus láminas, el corte del Vientre, el Linaje y dos minijuegos.
> Es lo que en el bible es la obra madre: lo que el jugador descubre bajando se
> abre también fuera del juego, si juega en el mismo navegador.

**Relevo:** P1 retoma para el cierre en pantalla.

---

## Bloque 5 — El cierre y la venta (P1 + todo el equipo · 2 min)

**En pantalla:** llegar a las Salas, dejar despertar al Reformado y, si el tiempo
aprieta, no pelear: la aparición ya cumple. Cerrar en la pantalla final con el
recuento del libro.

**P1 dice (leyendo el cierre del juego):**

> La niña está despierta, y nadie entra despierto. Le pone la mano encima y el
> tejido responde: no se aparta. "Los dioses no miran. Ella sí." Levanta el
> bisturí y, por primera vez, se para a mirarla. El teaser acaba ahí, justo
> antes de que decida, que es donde el bible deja la historia.

**P1 dice (la venta, volviendo a los tres ejes):**

> Profe, para cerrar: el **mythos** lo leyó en el Códice y lo oyó en el
> Cirujano. El **ethos** lo vio en los cuerpos: cuanto más arriba, menos persona,
> y nadie ahí abajo lo llama violencia. El **topos** lo recorrió capa a capa, y
> en cada una la piedra es menos piedra.
>
> Un libro de arte describe un mundo para que alguien lo imagine. Nosotros
> preferimos que lo recorra, y que pueda morir en él. Todo lo que tendría el
> libro está dentro del juego —el Registro, el Vientre, la Jerarquía, el
> Códice— y además se puede jugar. Por eso creemos que esto no es un libro de
> arte que además es un juego: es el libro de arte de la Diócesis de la Carne,
> con la diferencia de que en este se sangra.

**Cierre coral (alguien distinto de P1, mirando al público):**

> Subterfuge. La Diócesis de la Carne. Gracias.

---

## Reparto de preguntas (para que nadie improvise)

| Pregunta probable                                    | Responde                                             |
| ---------------------------------------------------- | ---------------------------------------------------- |
| ¿Por qué un juego y no el libro?                     | P1                                                   |
| ¿Es Blasphemous / qué es original?                    | P2 (tono) + P3 (diseño propio)                       |
| ¿Dónde está lo futurista, si todo parece medieval?   | P3 (el turquesa)                                     |
| ¿Usaron IA para el arte?                             | P3 (no, píxel a píxel; IA solo para referencias)     |
| ¿Cómo está hecho técnicamente?                       | P4 (Phaser, TS, Vite, CI)                            |
| ¿Cómo se repartió el trabajo entre los cuatro?       | P4 (ver abajo)                                       |
| ¿Qué sigue / qué falta?                              | P2 (las dos capas cerradas) + P4 (la web como obra madre) |
| ¿Cuánto dura?                                        | P1 (15 a 30 min según cuánto se lea)                 |
| ¿Cómo evitan que un nivel quede injugable?           | P4 (`verificar-rutas` y el caso real del Atrio)      |

---

## Cómo se repartió el trabajo (respuesta honesta y concreta)

Si preguntan quién hizo qué, esta es la respuesta defendible, alineada con el
repositorio y los encargos de `docs/issues/`:

- **Agustín Figueroa** — encuadre del proyecto, guion de la presentación y
  conducción; apoyo en escenas y en la web del universo.
- **Alejandro Garcés Ramírez** — narrativa y lore: `src/lore/` (Códice,
  Cronología, Jerarquía, Linaje, Registro, Voz y Pensamientos), textos del
  mundo y del jefe.
- **Mariana Echeverri Ramírez** — arte y dirección visual: la sillería del
  Vientre (`docs/arte/piezas/`), diseño del Cirujano, guía de estilo y paleta,
  encargos de `docs/issues/`.
- **Jean Carlo Londoño Ocampo** — ingeniería y sistemas: motor de juego y
  escenas, entidades y combate, audio, integración continua, publicación y
  portal web.

---

## Plan B (imprimirlo y tenerlo a mano)

- **No suena:** hacer clic dentro del juego. El HUD lo avisa arriba.
- **La página no carga:** `npm run preview` desde el repositorio.
- **Se muere mucho:** no pasa nada. El aviso dice "LA CARNE CEDE" y se vuelve al
  último Altar.
- **Se acaba el tiempo:** saltar Criptas y Pasillos, no pelear con el jefe; lo
  que no puede faltar es el Códice, el Vientre, la aparición del jefe y el
  cierre.
- **Se cae todo:** el PDF `docs/presentacion/Subterfuge-presentacion.pdf` y los
  guiones anteriores cubren la charla sin demo.
