# El Portal de la Diócesis · recorrido y canon

> Qué hay en la web, qué representa dentro del universo y qué se añadió en la revisión que
> recuperó `Subterfuge.docx` y puso Sigma en su sitio. No es una transcripción de la biblia:
> es la versión que la Diócesis publicaría.

## Qué es el Portal

El Portal no es una wiki del juego. Es una **obra de ficción que se presenta como la web
oficial de la Diócesis de la Carne**: doctrina, Registro, plano del Vientre, linaje,
sacramentos y avisos. Su voz es la de una institución que atiende al público —parroquia y
hospital a la vez—, amable y administrativa, y que nunca siente que lo que cuenta sea
violencia.

La web tiene dos capas de lectura:

1. **Lo que la Diócesis publica.** Horarios, trámites, fichas, láminas, avisos, formularios.
2. **Lo que se gana bajando.** Márgenes del Códice, fichas con nombre, capas cerradas,
   expedientes del Linaje y el expediente del asentamiento de Sigma. Se abre con lo que el
   jugador descubre en el mismo navegador (`localStorage`, clave `diocesis.memoria`) o
   presentando una clave al pie de la página.

**Sigma no sustituye al teaser.** El Portal sigue siendo el de la Diócesis del juego
original. Sigma tiene su propia capa, la VI, con el «asentamiento» del templo y su demo. Los
datos están separados para que los dos mundos no se pisen:

| Dónde              | Qué guarda                                                            |
| ------------------ | --------------------------------------------------------------------- |
| `src/lore/`        | El lore jugable del teaser: Códice, Registro, Vientre, Linaje, voces. |
| `web/src/mundo.ts` | El material de la biblia que el Portal publica fuera de Sigma.        |
| `web/src/sigma.ts` | El lore propio de Sigma: capas, juntas, nombres y avisos.             |

## Cómo se navega

- **Rutas por hash.** `#/doctrina`, `#/registro`, `#/vientre`, `#/linaje`,
  `#/sacramentos`, `#/avisos`. La portada es `#/`.
- **Bajar es degradarse.** Cada sección tiene una profundidad (`data-profundidad` en el
  `<body>`). Al bajar cambian el muro, el polvo, la luz y la música; el sitio se oscurece.
  `prefers-reduced-motion` desactiva el polvo, la vela que sigue al puntero y las
  transiciones.
- **Dos menús, las mismas paradas.** El menú superior y el riel lateral comparten Portal,
  Pabellón y las capas I–VI:

  `⌂ Portal · 0 Pabellón · I Doctrina · II Registro · III El Vientre · IV Linaje ·
V Sacramentos · VI Asentamiento`

- **El Portal no es una capa.** Lleva el símbolo `⌂`; el `0` es el Pabellón, la primera
  parada de la superficie. El Asentamiento es la capa VI.
- **La sección activa se marca por ruta, no solo por profundidad.** Portal y Pabellón
  comparten cota (0 m), pero cada uno tiene su parada. Los trámites `#/examen` y
  `#/sacramento` marcan Sacramentos.

## Recorrido sección por sección

### 1. La portada · `#/`

**Qué se ve.** La fachada institucional: el Atrio montado con los sprites del juego, el
comunicado del asentamiento, las tarjetas de consulta, los horarios y trámites, el
expediente del visitante y la mancha de los sacramentos fallidos.

**Qué representa.** La cara que la Diócesis enseña. Todo está en orden: el diezmo «ya está
en buenas manos», el reparto de carne se retrasa «mientras el templo se asienta», la Sala
N.º 7 solo se cierra «hasta nuevo aviso». La burocracia es la primera capa del horror.

**Qué esconde.** Que la carne es cuerpo, que el sorteo decide quién desaparece y que la
Sala N.º 7 se quedó vacía. La portada no lo dice: lo deja en los avisos y en el expediente.

### 2. Pabellón 9 · `#/pabellon`

**Qué se ve.** El Libro de Diezmos de un pabellón del Atrio: cuarenta casas, una cuota, una
camilla por casa. Se puede abrir la ficha de cada casa, leer la capilla, el Muro de los
Dientes y la Oficina del Decano, y recorrer la jornada de Tomás el cerero. Después, el
«Libro de costumbres»: leyes, calendario, oficios, clases, artes, leyendas, parentesco y
cronología.

**Qué representa.** El universo desde el suelo. La unidad no es el individuo sino la casa;
la deuda se hereda; si una casa falla, deben todas. El horror no está en un monstruo sino en
una cuota compartida, en una vela que se pellizca y en una Cena de la Ausencia.

**La camilla 22.** Es la casa de la niña. Sus asientos se completan con lo jugado: con el
cierre del juego, la deuda queda saldada; con el hito `nina`, el Colegio suspende el saldo y
el pabellón entero vuelve a figurar como no cubierto.

### 3. Doctrina · `#/doctrina`

**Qué se ve.** El Códice como libro que se hojea: diez hojas, versículos, márgenes y el
manual técnico que se trasluce al apagar la vela de la Vigilia. Debajo, los tres Libros, los
otros relatos de la misma historia y la lengua de la Diócesis.

**Qué representa.** El mito fundacional y su tecnología. El Códice es un informe de
incidentes reescrito como escritura sagrada: el Don, los Mil, el Diezmo y el Sacramento son
un protocolo de contención convertido en liturgia.

**Lo que añade la revisión.**

- **Los tres Libros:** _El Don y el Silencio_, _La Venda de la Madre_ y _El Día de la
  Mirada_.
- **Otros relatos:** Anatomistas («El Protocolo»), Ayunantes («La Rehusada»), Rebaño Hueco
  («El Lugar Vacío») y Reformados («Los Ojos Prestados»).
- **La lengua:** los tres registros (Códice, Pabellón, Palmario), las cuatro reglas, las
  cuatro expresiones y el glosario completo.

### 4. Registro · `#/registro`

**Qué se ve.** Las fichas del juego y del Portal con su lámina: fieles, oficio, fauna, flora
y aparato. Lo que el visitante no ha visto sale como silueta y sin texto. Al final, «El
aparato de Génesis»: quince piezas con su origen real, su uso en la Diócesis y lo que el
pueblo cree que son.

**Qué representa.** La manía de catalogar del poder. El Registro sabe que algo existe, pero
solo lo muestra a quien ya lo ha visto. Los dioses no ven; la institución sí, y anota.

**La tecnología.** El Don, los ductos, las terminales, los tanques, el Palmario, los
injertos, la Injertadora, la Poción de Carne, el Hongo de Lámpara, las velas de cera humana,
la armería de la Cruzada y los manuales técnicos. Cada pieza tiene dos lecturas: la técnica
y la teológica.

### 5. El Vientre · `#/vientre`

**Qué se ve.** El plano de catorce salas y veinte pasos, con sus atajos, capas y salas
selladas. Se puede pulsar cada sala y seguir sus salidas. Debajo, **La Intemperie**: la
superficie que casi nadie conoce.

**Qué representa.** Un solo edificio cerrado, construido hacia abajo, donde el mundo entero
cabe. Los atajos no son un adorno: son tubería de Génesis que nadie ha cerrado y que salta
el trámite. Bajar es deshumanizar; el mapa lo dice antes que cualquier texto.

**Lo que añade la revisión.** La Boca, el Suelo de Arriba, la Ciudad Apagada, el Isar Seco,
el Bosque de Ceniza, las Ermitas, el Monte Vestal, la Senda de los porteadores y la
fauna/flora de fuera: Ciervo Velado, Alondra de Antena, Ganado Engastado, Musgo de Pantalla
y Abeto Ceniciento.

### 6. Linaje · `#/linaje`

**Qué se ve.** El organigrama interactivo de la Diócesis: Génesis Vestal, los Mil, las
advocaciones, el clero, el oficio, los fieles, la ofrenda y el destino de la carne. Debajo,
las cuatro herencias, el linaje de la Capucha, las Manos del Siete, las cuatro escuelas y la
cronología.

**Qué representa.** Quién manda y por qué. La autoridad no sigue la antigüedad: los que
mandan son las Vestales, que interpretan; los que cortan son las Manos, que ejecutan; los
que sostienen el sistema son los fieles, que pagan. El cuerpo es el rango.

**Lo que añade la revisión.** La Madre Escriba y las primeras Vestales, la Vestal Mayor
Walburga, la Primera Mano, las tres Manos de la Sala 7, la Mano Mayor, las escuelas
(Diócesis, Anatomistas, Ayunantes, Rebaño Hueco) y la cronología de la Carne.

### 7. Sacramentos · `#/sacramentos`

**Qué se ve.** El **Examen de Pureza**, que se rellena a tinta en un expediente del Registro
y termina sellado con lacre; y **El Sacramento**, una práctica quirúrgica a pixel: cubrir el
rostro, pesar, apartar el bisturí que se mueve, incidir, abrir, injertar y sellar.

**Qué representa.** La liturgia como procedimiento. El visitante cree que está haciendo un
trámite, pero está repitiendo el sacramento. El Examen no mide lo que sabes: mide cuánto te
pareces a un rango. El Sacramento siempre termina igual: el tejido no acepta el injerto y el
ofrendado queda Reformado.

### 8. El Asentamiento · `#/avisos`

**Qué se ve.** El expediente de Sigma contado por la Diócesis: el parte oficial, el plano de
las seis capas que se juntan al pulsar sus juntas, los nombres que constan y los avisos a
los fieles.

**Qué representa.** La compactación del templo, llamada «asentamiento» por la institución.
Los Mil son el templo; las paredes se mueven; la carne no llega y la Diócesis dice que
«falta camino». El plano se cierra capa a capa, y el jugador ve el efecto sin que la página
le cuente la causa.

**Lo que no se cuenta.** Ni que la niña son los ojos de los dioses, ni que el Cirujano es el
villano que los lleva puestos. La página da pistas —la ley de la Mano que mira, el Cegado,
Génesis Vestal, el Último Sacramento, el Primer Ojo— y deja la verdad para el juego. Un test
vigila que el contenido publicado no mencione a la niña ni al villano.

### Fuera del Portal · `/sigma/`

La entrada de Sigma es una página aparte: el retrato del Cirujano de Mariana, qué es el
asentamiento, qué hay en la demo (Nivel I, Pasillos, laboratorio, Prior, combate y
reliquias), el plano de las seis capas, los controles y los créditos. Enlaza al Portal y al
expediente.

## Qué se añadió en esta revisión

| Sección      | Lo que ya estaba                                  | Lo que se añadió                                                               |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Portada      | Atrio, tarjetas, trámites, expediente, comunicado | Enlace al expediente, tarjeta de Sigma con el Cirujano de Mariana, capa VI.    |
| Pabellón 9   | Libro de casas, jornada, capilla, Oficina         | Leyes, calendario, oficios, clases, artes, leyendas, parentesco, arquitectura. |
| Doctrina     | 10 hojas, márgenes, manual, Vigilia               | Tres Libros, otros relatos, lengua, reglas, expresiones y glosario.            |
| Registro     | 31 fichas, siluetas, familias                     | El aparato de Génesis y su entrada en el índice.                               |
| El Vientre   | 14 salas, 20 pasos, capas, atajos                 | La Intemperie y su fauna/flora.                                                |
| Linaje       | Organigrama, facciones, oficios, ofrenda          | Cuatro herencias, Capucha, Manos del Siete, escuelas y cronología.             |
| Asentamiento | Avisos de #236                                    | Expediente completo, plano interactivo, nombres, capa VI y avisos nuevos.      |
| Navegación   | Menú superior y riel con paradas distintas        | Portal y Pabellón en ambos; Portal con `⌂`, Pabellón con `0`, Asentamiento VI. |

Lo que ya existía —las diez hojas del Códice, las 31 fichas, el plano del Vientre, los
Sacramentos, la Vigilia, el Pabellón— no se duplicó: se dejó como estaba y se completó con
el material de la biblia que faltaba.

## Qué representa cada sección en el universo

| Sección      | Institución o lugar       | Lo que muestra                                         | Lo que oculta                                               |
| ------------ | ------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| Portada      | La Diócesis en su fachada | Orden, trámites, horarios, «su diezmo en buenas manos» | Que el diezmo es cuerpo y que la Sala 7 se vació.           |
| Pabellón 9   | La casa y el pabellón     | La vida diaria, la deuda compartida, la capilla        | Que la niña se ofreció sola y qué pasa con su casa.         |
| Doctrina     | El Códice y el Colegio    | El mito, la Regla, los márgenes, la Vigilia            | El manual técnico, los otros relatos, la verdad.            |
| Registro     | La Oficina del Registro   | Fichas, láminas, especies, aparato                     | Lo que el visitante no ha visto; el uso real.               |
| El Vientre   | El edificio               | Capas, salas, atajos, la Intemperie                    | Qué hay en las capas selladas y por qué se mueven.          |
| Linaje       | El poder                  | Dioses, clero, oficios, herejías, cronología           | La manipulación de los Cerebrales, el papel de la niña.     |
| Sacramentos  | La liturgia               | El Examen y la práctica del Sacramento                 | Que el Sacramento nunca completa a nadie.                   |
| Asentamiento | Sigma                     | El asentamiento, las juntas, los nombres, los avisos   | El giro: la niña, el Cirujano, la causa de la compactación. |

## Lo que se publica y lo que se guarda

- **Se publica:** el mundo tal como la Diócesis lo cuenta, con sus fisuras en los márgenes.
- **Se guarda para el juego:** el giro de la niña y del Cirujano, la causa final de la
  compactación y los dos finales.
- **Se abre con memoria o claves:** los márgenes del Códice, las fichas no vistas, las capas
  cerradas, los expedientes del Linaje y el rastro de la Sala N.º 7.
- **No se publica la biblia entera:** se publica lo que el Portal puede contar. Lo que no
  está aquí sigue en `Subterfuge.docx` o en los documentos de Sigma.

## Cómo se mantiene

- `web/src/mundo.ts` reúne el material de la biblia: Intemperie, Libros, relatos, lengua,
  leyes, calendario, oficios, clases, artes, tecnología, leyendas, escuelas, linajes,
  parentesco y cronología.
- `web/src/sigma.ts` reúne el material de Sigma: capas, juntas, nombres y avisos.
- Las páginas de `web/src/paginas/` solo renderizan. Si cambia el canon, se cambia el dato,
  no el marcado.
- `tests/mundo-web.test.ts` y `tests/sigma-web.test.ts` comprueban que no se pierdan
  capítulos, fichas ni términos, que las juntas no pierdan capas y que el contenido de Sigma
  no adelante el giro.
- Antes de tocar la web: `npm run verificar`. Incluye formato, lint, tipos, tests,
  verificaciones del juego y build.

## Para verlo en local

```bash
npm run dev
```

- Portal: `http://localhost:5173/web/`
- Asentamiento: `http://localhost:5173/web/#/avisos`
- Entrada de Sigma: `http://localhost:5173/sigma/index.html`
- Juego: `http://localhost:5173/`

> En el servidor de desarrollo, `/sigma/` puede caer en la portada del juego; la entrada de
> Sigma es `/sigma/index.html`. En el despliegue de Pages, `/sigma/` sirve su `index.html`.
