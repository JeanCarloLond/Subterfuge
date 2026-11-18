# Fase 4 — El Vientre Húmedo · Nivel 2: La escapatoria

**Plan de issues para GitHub · Subterfuge — La Diócesis de la Carne**

Este documento reúne los encargos de la segunda fase del proyecto: construir el **Nivel 2 — El Vientre Húmedo**, la escapatoria del Cirujano-Sacerdote y la niña por el desagüe de la Sala 7. Todo lo que existe hoy en el juego —Atrio, Pasillos, Criptas, Salas y cierre— se cuenta como **Nivel 1** y no se toca en su jugabilidad.

Cada bloque tiene frontmatter (`title`, `labels`) y cuerpo listo para pegar en GitHub o publicar con `gh issue create`. Los códigos `F4-xx` sirven para referirse a un issue antes de que GitHub le asigne número.

---

## 1. Estructura de niveles

```
NIVEL 1 — El Sacramento (existente; jugabilidad intacta)
  Atrio → Pasillos de Preparación → Criptas de Espera → Salas de Sacramento
  → Cierre del Nivel 1 (el Cirujano baja el bisturí y decide no entregarla)

NIVEL 2 — El Vientre Húmedo · La escapatoria (nuevo)
  Desagüe de la Sala 7 → Galería de limpieza → Zarzal → Mata de Retazos
  → Corral de Protocolo → Nido de la Serpiente → Pozo de las Mareas
  → Ducto de subida → Puerta del Cuerpo (umbral del templo)

NIVEL 3 — El Vientre Profundo · El templo (no se construye en esta fase)
  Solo se ve su puerta al final del Nivel 2.
```

**La idea central:** el Nivel 1 termina con la niña despierta y el Cirujano detenido. Esta fase decide el gesto que el teaser dejaba abierto: **el Cirujano baja el bisturí y no la entrega**. La Diócesis descubrirá la sala vacía; el único camino que queda es el desagüe de servicio detrás de la Sala 7. El Nivel 2 es la huida: el Cirujano y la niña bajan por los Niveles Reformados y el Vientre Húmedo, con la Diócesis detrás y las Mareas, la Serpiente y la fauna del ecosistema delante. El desagüe no lleva a la superficie: lleva a la **Puerta del Cuerpo**, el acceso de servicio al templo. Es la única salida que la Diócesis no vigila. El Nivel 2 termina en esa puerta; el templo es el Nivel 3 y no se cruza en esta fase.

**Nombre y claves técnicas:**

- Nombre visible del Nivel 2: **El Vientre Húmedo · La escapatoria**
- Clave de escena del Nivel 2: `VientreHumedo`
- Clave del cierre del Nivel 2: `FinalNivel2`
- Archivos nuevos: `src/scenes/VientreHumedoScene.ts`, `src/scenes/FinalNivel2Scene.ts`
- Capa del Vientre: **V · Niveles Reformados** (el Nivel 1 cubre las capas I-IV; el Nivel 3 es la capa VI, el templo)

---

## 2. Cómo usar este documento

- **Para publicar en GitHub:** cada bloque empieza con `---` y trae `title` y `labels`. Se puede copiar el cuerpo a *New issue* o publicar con `gh issue create --title "..." --body-file ... --label ...`.
- **Para trabajar:** respetar el orden de dependencias de la tabla. Los issues marcados como `bloqueante` impiden empezar el resto.
- **Para revisar:** los criterios de aceptación son verificables. Si un issue no los cumple, no está cerrado.
- **Para el equipo narrativo:** el issue `F4-01` es el acta de canon. Cualquier texto o mecánica nueva debe poder rastrearse hasta él y hasta la biblia.
- **Regla de oro de esta fase:** el Nivel 1 no se toca en su jugabilidad. Solo cambia el cierre narrativo: el Cirujano decide no sacrificar a la niña y huye con ella por el desagüe. El Nivel 2 se añade después y tiene su propio cierre.

---

## 3. Mapa de dependencias

```
F4-01 Canon de los dos niveles
  ├── F4-02 Códice IX-X y recuento por nivel
  ├── F4-03 Voces y pensamientos
  ├── F4-04 Bestiario del Registro
  ├── F4-05 Geometría del Nivel 2
  │     ├── F4-06 Sistema de criaturas y peligros
  │     ├── F4-07 Mareas del Hambre y Latido
  │     ├── F4-08 Estructura de dos niveles y transición
  │     ├── F4-11 Puentes de tejido
  │     └── F4-12 Hongo, lluvia y luz
  ├── F4-09 Mapas del juego y del portal
  ├── F4-10 Contadores y memoria por nivel
  ├── F4-13 … F4-20 Criaturas y peligros
  ├── F4-21 … F4-24 Arte y audio
  ├── F4-25 … F4-31 Web
  ├── F4-32 y F4-35 Documentación e índice
  ├── F4-36 … F4-38 QA, canon y accesibilidad
  ├── F4-39 Inscripciones
  ├── F4-40 Cierre del Nivel 2: la Puerta del Cuerpo
  ├── F4-41 Flor de Hueso
  ├── F4-42 Continuidad entre niveles
  └── F4-43 La decisión y la niña como compañera
```

**Ruta crítica recomendada:**

1. `F4-01` (canon) y `F4-02`/`F4-03`/`F4-04` (contenido narrativo).
2. `F4-05`/`F4-06` (esqueleto del Nivel 2 y sistema de criaturas).
3. `F4-07`/`F4-08` (Mareas y estructura de dos niveles).
4. `F4-13` a `F4-20` (criaturas y peligros).
5. `F4-21` a `F4-24` (arte y audio) en paralelo con lo anterior.
6. `F4-25` a `F4-31` (web) cuando el contenido esté estable.
7. `F4-32` y `F4-35` (índice y documentación) y `F4-36` a `F4-43` (QA, cierre, continuidad y compañera).

---

## 4. Índice de issues

| Código | GitHub | Título | Etiquetas principales | Prioridad |
| --- | --- | --- | --- | --- |
| F4-01 | #126 | Canon de la Fase 4: dos niveles y la escapatoria | narrativa, zona-vientre-humedo | alta |
| F4-02 | #127 | Dos nuevas hojas del Códice (IX y X) y recuento por nivel | narrativa, gameplay, web | alta |
| F4-03 | #87 | Voces, pensamientos y fichas de los habitantes | narrativa, gameplay | media |
| F4-04 | #88 | Bestiario del Vientre Húmedo en el Registro | narrativa, web | alta |
| F4-05 | #128 | Geometría, rutas y secretos de la huida | gameplay, zona-vientre-humedo | alta |
| F4-06 | #90 | Sistema de criaturas y peligros del Nivel 2 | tecnico, gameplay | bloqueante |
| F4-07 | #91 | Mareas del Hambre y Latido | gameplay, tecnico | alta |
| F4-08 | #129 | Estructura de dos niveles: la decisión y la huida | tecnico, gameplay | bloqueante |
| F4-09 | #130 | Mapas del juego y del portal: Nivel 1, Nivel 2 y templo | gameplay, web | alta |
| F4-10 | #94 | Contadores y memoria por nivel | tecnico, web | media |
| F4-11 | #95 | Puentes de tejido y la Injertadora | gameplay, tecnico | media |
| F4-12 | #96 | Hongo de Lámpara, Lluvia Tibia y luz | gameplay, arte | media |
| F4-13 | #97 | Remedo: el instrumento tibio | gameplay, zona-vientre-humedo | media |
| F4-14 | #98 | Serpiente de Tejido: mini-jefe de los ductos | gameplay, zona-vientre-humedo | alta |
| F4-15 | #99 | Mondador: el limpiador sagrado | gameplay, narrativa | alta |
| F4-16 | #100 | Buitre ritual y Cerdo de Protocolo | gameplay, narrativa | media |
| F4-17 | #101 | Cuervo de Ermita y Vena Trepadora | gameplay, zona-vientre-humedo | media |
| F4-18 | #102 | Zarza Cosedora: barrera viva | gameplay, zona-vientre-humedo | media |
| F4-19 | #103 | Alfombra Devota: la trampa litúrgica | gameplay, accesibilidad | alta |
| F4-20 | #104 | Mata de Retazos: cosecha con riesgo | gameplay, narrativa | media |
| F4-21 | #105 | Tileset y decals del Vientre Húmedo | arte | alta |
| F4-22 | #106 | Sprites de fauna del Vientre Húmedo | arte | alta |
| F4-23 | #107 | Sprites de flora y peligros | arte | media |
| F4-24 | #108 | SFX y música del Vientre Húmedo | audio | media |
| F4-25 | #109 | Registro web: familias fauna y flora | web, narrativa | alta |
| F4-26 | #110 | Linaje web: la frontera porosa | web, narrativa | media |
| F4-27 | #111 | Portada y navegación del portal: dos niveles | web | media |
| F4-28 | #112 | Doctrina web: diez folios e índices | web, narrativa | alta |
| F4-29 | #113 | Minijuegos: Remedo y nuevas preguntas | web, gameplay | media |
| F4-30 | #114 | Índice funcional del Códice y del Registro en la web | web, indice | alta |
| F4-31 | #115 | Exportar las nuevas figuras a la web | web, arte | media |
| F4-32 | #116 | Índice funcional de la biblia del mundo (Drive) | documentacion, indice | alta |
| F4-35 | #119 | Actualizar README y DESARROLLO a la fase 4 | documentacion | media |
| F4-36 | #120 | `verificar-rutas`, `verificar-arte` y build | qa, tecnico | bloqueante |
| F4-37 | #121 | Playtest y balance del Nivel 2 | qa, gameplay | alta |
| F4-38 | #122 | Revisión de canon, tono y accesibilidad | qa, narrativa, accesibilidad | alta |
| F4-39 | #131 | Inscripciones y placas del Nivel 2 | narrativa, gameplay | media |
| F4-40 | #132 | Cierre del Nivel 2: la Puerta del Cuerpo | narrativa, gameplay | alta |
| F4-41 | #125 | Flor de Hueso y objetos culturales | narrativa, gameplay, web | media |
| F4-42 | #133 | Continuidad entre niveles: progreso, desbloqueo y selección | gameplay, tecnico | media |
| F4-43 | #134 | La decisión del Cirujano y la niña como compañera | narrativa, gameplay | alta |

> **Nota:** los códigos `F4-33` y `F4-34` se retiraron. La biblia del mundo canónica y actualizada vive en el **Drive del equipo**; no se mantiene una copia canónica en el repositorio ni se hará un índice de materias separado. El único encargo de índice es `F4-32` (#116).

---

## 5. Issues

<!-- ==================== F4-01 ==================== -->
---
title: "[NARRATIVA] Canon de la Fase 4: dos niveles y la escapatoria"
labels: fase-4, zona-vientre-humedo, narrativa, prioridad-alta
depende: —
bloquea: F4-02, F4-03, F4-04, F4-05, F4-06, F4-08, F4-09, F4-40, F4-42, F4-43
---

**Código:** `F4-01` · **GitHub:** #126 · **Prioridad:** alta · **Depende de:** — · **Bloquea:** F4-02, F4-03, F4-04, F4-05, F4-06, F4-08, F4-09, F4-40, F4-42, F4-43

## Contexto

Todo lo que existe hoy en el juego —Atrio, Pasillos, Criptas, Salas y el cierre— se cuenta como **Nivel 1**. La fase 4 añade un **Nivel 2** independiente: **El Vientre Húmedo · La escapatoria**. El Cirujano decide no sacrificar a la niña y huye con ella por el desagüe de la Sala 7. El desagüe baja a los Niveles Reformados y al Vientre Húmedo; el único camino que queda es la **Puerta del Cuerpo**, el acceso de servicio al templo (el Vientre Profundo, capa VI). El Nivel 2 termina en esa puerta. El templo es el Nivel 3 y no se cruza en esta fase.

La biblia sostiene esta lectura: el Nivel 1 cubre las capas I-IV; la capa V son los **Niveles Reformados**, donde la arquitectura ya es carne; la capa VI es el **Vientre Profundo**, el santuario de los Primigenios.

## Qué se necesita

Un **acta de canon** breve en `docs/canon/nivel-2-vientre-humedo.md` o como sección nueva de `docs/DESARROLLO.md`, que fije:

| Nivel | Nombre | Qué cubre | Estado |
| --- | --- | --- | --- |
| **Nivel 1** | El Sacramento | Atrio → Pasillos → Criptas → Salas → cierre | Existente; jugabilidad intacta |
| **Nivel 2** | El Vientre Húmedo · La escapatoria | Capa V: desagüe de la Sala 7 → ecosistema → Puerta del Cuerpo | Nuevo; esta fase |
| **Nivel 3** | El Vientre Profundo · El templo | Capa VI: el santuario | No se construye; solo se ve la puerta |

### 1. Nivel 1: jugabilidad intacta, cierre con decisión

- `SalasScene` sigue apuntando a `Final`.
- El combate contra el Reformado, la reja, los Altares, los 8 fragmentos y el recuento del cierre no cambian.
- **El cierre narrativo sí cambia:** la niña despierta, el tejido responde y el Cirujano **baja el bisturí**. No la entrega. Toma a la niña y busca el desagüe detrás de la Sala.
- El cambio se cuenta en `Pensamientos.ts` (clave `cierre`) y en `FinalScene`; no requiere una cinemática nueva. Ver `F4-43`.

### 2. Nivel 2: la huida

- El Cirujano y la niña escapan por el desagüe de servicio de la Sala 7.
- El desagüe baja a los Niveles Reformados y al Vientre Húmedo.
- La Diócesis descubre la Sala vacía; el Latido se acelera y comienza la persecución.
- El camino no lleva a la superficie: lleva a la **Puerta del Cuerpo**, el acceso de servicio al templo. Es la única salida que la Diócesis no vigila.
- El Nivel 2 termina en la puerta. El templo es el Nivel 3.
- La niña viaja con el Cirujano. Es una **compañera narrativa**, no una segunda protagonista ni una mecánica de escolta con fracaso. Ver `F4-43`.

### 3. Lo que el jugador aprende en el Nivel 2

- Que el Vientre tiene un servicio de limpieza y que ese servicio se está extinguiendo (el Mondador).
- Que la Serpiente de Tejido es el depredador de los ductos y el emblema del Rebaño Hueco.
- Que los Reformados no son un almacén: son parte del ciclo de lo que no se completa.
- Que las Mareas del Hambre son un fenómeno natural del edificio, no un castigo.
- Que la única salida pasa por el templo, y que el Cirujano ya no puede volver atrás.

### 4. Lo que no se muestra

- Ningún Primigenio. Ningún dios nuevo. Ninguna magia.
- Nadie ve a los dioses; el templo se muestra solo como puerta y umbral.
- El Mondador es un animal sagrado por costumbre, no una divinidad.
- La niña no se convierte en un objeto de poder ni en una «elegida» obvia. Su tejido responde; el resto se insinúa.

### 5. Nombres y contradicciones resueltas

- **Vientre Húmedo** es el nombre del bioma y del Nivel 2; **Niveles Reformados** es el nombre oficial de la capa V. En la UI se usan juntos: «El Vientre Húmedo · Niveles Reformados».
- **El templo** es el Vientre Profundo (capa VI), no la Diócesis entera ni la Sala 7.
- El desagüe no es una salida al exterior: es una salida **hacia dentro**, hacia el templo. Es la ironía del nivel.
- La biblia enumera Salas antes de Criptas; el juego usa Criptas antes de Salas. El Nivel 1 se queda como está; el acta no reordena el Nivel 1, solo documenta la diferencia.
- El Mondador tiene depredadores naturales (Zarza Cosedora y Serpiente de Tejido) y cazadores humanos (las Vestales, por el caparazón). Las dos cosas son verdad y explican su casi extinción.
- El Nivel 2 no es un desvío dentro del Nivel 1: es un nivel nuevo que empieza con la decisión del Cirujano al final del Nivel 1.

### 6. Vocabulario permitido

Altar, sacramento, diezmo, Registro, Reformado, Fervor, Poción de Carne, Injertadora, Mondador, Mareas del Hambre, Latido. Nunca «checkpoint», «mana», «HP», «boss» en textos visibles.

## Criterios de aceptación

- [ ] Existe el acta de canon y está enlazada desde `docs/DESARROLLO.md`.
- [ ] El Nivel 1 conserva su jugabilidad y su recuento de 8/8; solo cambia el cierre narrativo.
- [ ] El Nivel 2 es una huida, no una procesión: el Cirujano decide no sacrificar a la niña.
- [ ] La niña viaja con el Cirujano como compañera narrativa.
- [ ] El Nivel 2 termina en la Puerta del Cuerpo; el templo no se cruza.
- [ ] Los 41 issues de esta fase pueden rastrearse hasta el acta.
- [ ] El equipo narrativo la aprueba antes de empezar `F4-05`.
- [ ] El acta incluye las escenas narrativas del Nivel 2: decisión, desagüe, Mondador, Serpiente, Marea, Puerta del Cuerpo.

## Referencias

- Biblia del mundo: **Capítulo VI, Naturaleza → El Vientre Húmedo**, **Fauna**, **Flora**, **Otras especies**, **Red de relaciones**, **Funciones narrativas**.
- Biblia del mundo: **Capítulo III, Mapas → Los seis niveles** (capas V y VI).
- `src/scenes/SalasScene.ts`, `src/scenes/FinalScene.ts`, `src/lore/Pensamientos.ts`, `src/lore/Vientre.ts`.

<!-- ==================== F4-02 ==================== -->
---
title: "[NARRATIVA] Dos nuevas hojas del Códice (IX y X) y recuento por nivel"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, web, prioridad-alta
depende: F4-01
bloquea: F4-10, F4-28, F4-30
---

**Código:** `F4-02` · **GitHub:** #127 · **Prioridad:** alta · **Depende de:** F4-01 · **Bloquea:** F4-10, F4-28, F4-30

## Contexto

El Nivel 1 tiene ocho hojas del Códice y su cierre premia haberlas leído todas. El Nivel 2 añade dos hojas nuevas, una sobre lo que se hace con lo que el sacramento rechaza y otra sobre lo que pasa con lo que no se completa. El total global pasa a 10, pero **el Nivel 1 debe seguir mostrando 8/8 y conservar su línea oculta**. Para eso cada fragmento declara a qué nivel pertenece y el recuento se hace por nivel.

## Qué se necesita

### 1. Dos fragmentos nuevos

Añadir a `src/lore/Codice.ts`:

```ts
{
  id: 'codice-09',
  nivel: 2,
  cita: 'Códice VI, 6',
  titulo: 'De la limpieza',
  versiculo: [
    'Lo que el dios rechaza no se devuelve.',
    'Se aparta, se pesa y se deja abajo.',
    'Nada de lo ofrecido sale del Vientre.',
    'El que limpia el altar no recibe nombre.',
  ],
  margen: [
    'El que limpia el altar se llama Mondador.',
    'Nació el último en el año 62. Ya no cría arriba.',
    'Si se extingue, alguien tendrá que hacer su trabajo.',
    'Y ese alguien no va a tener dientes de bisturí.',
  ],
},
{
  id: 'codice-10',
  nivel: 2,
  cita: 'Códice V, 12',
  titulo: 'De lo que no se completa',
  versiculo: [
    'El Reformado no se traslada.',
    'Se le deja donde fue hecho, y allí sirve.',
    'Lo que no sube alimenta lo que baja.',
    'La cuenta del Vientre no se publica.',
  ],
  margen: [
    'Los niveles de abajo no son un depósito.',
    'Son un estómago. La Diócesis nunca ha limpiado nada:',
    'se lo come el Vientre. Y el Vientre se está quedando sin dientes.',
  ],
},
```

Los ocho fragmentos existentes reciben `nivel: 1`.

### 2. Recuento por nivel

Ampliar `FragmentoCodice` con `nivel: 1 | 2` y `Progreso` con:

```ts
fragmentosDelNivel(nivel: 1 | 2): number
fragmentosTotalesDelNivel(nivel: 1 | 2): number
```

- Nivel 1: 8 fragmentos. `FinalScene` sigue usando 8/8 para su línea oculta.
- Nivel 2: 2 fragmentos. `FinalNivel2` muestra el total global 10/10.
- La web muestra 10 hojas (todas).

### 3. Actualizaciones obligatorias

- `src/lore/Codice.ts`: `nivel` en todos los fragmentos y los dos nuevos.
- `src/systems/Progreso.ts`: recuentos por nivel.
- `src/scenes/FinalScene.ts`: usar el recuento del Nivel 1, no el global, para la línea del Códice completo.
- `src/scenes/FinalNivel2Scene.ts`: usar el recuento global y la línea de cierre del Nivel 2.
- `src/ui/CodiceScene.ts`: el índice muestra los 10 folios; los del Nivel 2 aparecen como no recogidos si no se ha jugado el Nivel 2.
- `web/src/paginas/doctrina.ts`: `MANUAL` para `codice-09` y `codice-10`; romanos hasta X; textos «ocho» → dinámicos.
- `web/src/paginas/portada.ts`: el contador de hojas usa `CODICE.length`.
- `README.md` y `docs/DESARROLLO.md`: 10 hojas totales, 8 en el Nivel 1 y 2 en el Nivel 2.

Propuesta de manuales:

```ts
'codice-09': [
  'GV·RES-04 §9  Residuo tisular no apto: retirar de la sala y evacuar por el desagüe inferior.',
  '§9.1  No se registra el destino final del residuo. No es competencia del operador.',
],
'codice-10': [
  'GV·PROT-07 §5.2  Alojamiento de reformados en niveles inferiores. Sin visitas.',
  '§5.3  El nivel inferior no requiere limpieza: el lote se encarga. (Sin datos posteriores.)',
],
```

## Criterios de aceptación

- [ ] El Códice tiene 10 fragmentos: 8 del Nivel 1 y 2 del Nivel 2.
- [ ] El Nivel 1 sigue mostrando 8/8 y su línea oculta al completarlo.
- [ ] El Nivel 2 muestra 10/10 al completar el Códice global.
- [ ] La web muestra 10 hojas y los manuales nuevos.
- [ ] Los textos caben en el folio y respetan la voz.
- [ ] Ningún texto usa «mirar» para los Primigenios.
- [ ] `npm run typecheck` y `format:check` pasan.

## Referencias

- `src/lore/Codice.ts`, `src/systems/Progreso.ts`, `src/scenes/FinalScene.ts`, `src/ui/CodiceScene.ts`.
- `web/src/paginas/doctrina.ts`.
- Biblia: **Cronología** (año 62 A.E.), **Fauna** (Mondador), **Niveles Reformados**.

<!-- ==================== F4-03 ==================== -->
---
title: "[NARRATIVA] Voces, pensamientos y fichas de los habitantes del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, web, prioridad-media
depende: F4-01
bloquea: F4-05, F4-25, F4-30
---

**Código:** `F4-03` · **GitHub:** #87 · **Prioridad:** media · **Depende de:** F4-01 · **Bloquea:** F4-05, F4-25, F4-30

## Contexto

El Vientre Húmedo no puede ser solo un pasillo de bichos. La biblia dice que allí abajo viven los Reformados y que el ecosistema sostiene al edificio. Hacen falta dos voces humanas que expliquen las reglas sin convertir la zona en una exposición: un **Tanteador** que golpea el suelo antes de cruzar y una **Honguera** que cultiva el Hongo de Lámpara y conoce al Mondador. Además, el cierre del Nivel 1 y la llegada al Nivel 2 deben contar la decisión del Cirujano: no entregar a la niña.

## Qué se necesita

### 0. El cierre del Nivel 1 (`cierre`)

Actualizar la secuencia `cierre` de `src/lore/Pensamientos.ts` para que la decisión sea explícita. Propuesta:

```ts
cierre: {
  cuadros: [
    'Está despierta. Nadie entra despierto.',
    'Le pongo la mano encima y el tejido responde. No se aparta.',
    'Los dioses no miran. Ella sí.',
    'Bajo el bisturí. No la entrego.',
    'Hay un desagüe detrás de la Sala. No sé adónde lleva.',
  ],
},
```

El `FinalScene` sigue lanzando `Dialogo` con `clave: 'cierre'`; no hace falta una cinemática nueva.

### 1. Pensamientos del Nivel 2 (`vientre-humedo`)

Añadir la clave `vientre-humedo` y una secuencia de llegada. Propuesta:

```ts
'vientre-humedo': {
  cuadros: [
    'No la he entregado.',
    'El desagüe baja. Detrás queda la Sala.',
    'Aquí abajo se tira lo que el sacramento rechaza.',
    'Y algo lo come.',
  ],
},
```

Añadir también una clave para la caída de la Serpiente (o para el momento en que se abre el ducto), por ejemplo `serpiente`:

```ts
serpiente: {
  cuadros: [
    'No es un dios. Es un animal que aprendió a comer aquí.',
    'El ducto está abierto. La Puerta del Cuerpo, delante.',
  ],
},
```

### 2. Voces (`src/lore/Voces.ts`)

Añadir `ClaveVoz` `'tanteador'` y `'honguera'`, con `rotulo`, `textura` y `cuadros`. Se pueden reutilizar texturas existentes (`devoto-b-placeholder`, `vestal-placeholder`) o usar las nuevas de `F4-22`/`F4-23`; el arte definitivo puede llegar después.

**Tanteador.** Un hombre ciego que golpea el suelo con una vara de hierro. No es un sabio: es un trabajador que ha perdido la vista y el oficio le da de comer. Su función es explicar la Alfombra Devota y la regla de no pisar alfombra.

```ts
tanteador: {
  rotulo: 'E  hablar',
  textura: 'devoto-b-placeholder',
  quien: 'TANTEADOR',
  cuadros: [
    'No pise la alfombra. Ninguna.',
    'La de verdad tiene fleco. La otra respira.',
    'Yo golpeo el suelo antes de cruzar. Usted tiene ojos:',
    'úsemelos, que a mí me quedan las manos.',
    'Si pisa, no tire del pie. Corte los hilos y salte.',
  ],
},
```

**Honguera.** Una mujer que cultiva hongo de lámpara en una grieta y deja comida al Mondador. Habla del animal como de un compañero de trabajo, no como de una mascota. Si ve a la niña, no pregunta: ya sabe lo que es una casa que debe carne.

```ts
honguera: {
  rotulo: 'E  hablar',
  textura: 'vestal-placeholder',
  quien: 'HONGUERA',
  cuadros: [
    'El hongo es lo único de aquí que no debe nada a los dioses.',
    'Alumbra y cuenta el tiempo. Por eso lo cultivamos.',
    'El Mondador come lo que el sacramento rechaza.',
    'No lo espante. Mientras coma, la impureza no sube.',
    'Cuando muera el último, alguien tendrá que limpiar.',
    'La niña puede quedarse. Aquí abajo nadie la busca todavía.',
  ],
},
```

### 3. Fichas humanas (`src/lore/Registro.ts`)

Añadir dos fichas en la familia `fieles`, con la voz del Registro:

- `tanteador`, textura reutilizada, hallazgo «visto en el Vientre Húmedo», descripción de 3-4 líneas sobre el oficio de golpear el suelo y la Alfombra.
- `honguera`, textura reutilizada, hallazgo «vista en el Vientre Húmedo», descripción de 3-4 líneas sobre el cultivo del hongo y el Mondador.

### 4. Colocación

`F4-05` los coloca como `fieles` en el nivel. Deben estar de pie sobre una plataforma (lo comprueba `verificar-rutas`). No atacan, no huyen, no dan misiones: hablan y siguen con lo suyo.

## Criterios de aceptación

- [ ] El cierre del Nivel 1 incluye la decisión de no entregar a la niña.
- [ ] `ClavePensamiento` y `ClaveVoz` amplían sus uniones sin romper las existentes.
- [ ] Los textos nuevos se leen en español correcto, con tildes y enes.
- [ ] Ningún NPC explica el mundo como un narrador: habla desde su oficio.
- [ ] Las conversaciones son saltables; no bloquean el nivel.
- [ ] Las dos fichas humanas aparecen en el Registro del juego y de la web.
- [ ] `verificar-rutas` confirma que los fieles están de pie.

## Referencias

- `src/lore/Pensamientos.ts`, `src/lore/Voces.ts`, `src/lore/Registro.ts`, `src/scenes/FinalScene.ts`.
- Biblia: **Flora → Alfombra Devota**, **Fauna → Mondador**, **Otras especies → Hongo de Lámpara**, **Profesiones → Tanteadores, Hongueros**.
- `F4-43` (la decisión y la niña).

<!-- ==================== F4-04 ==================== -->
---
title: "[NARRATIVA] Bestiario del Vientre Húmedo: fichas de fauna y flora en el Registro"
labels: fase-4, zona-vientre-humedo, narrativa, web, prioridad-alta
depende: F4-01
bloquea: F4-22, F4-23, F4-25
---

**Código:** `F4-04` · **GitHub:** #88 · **Prioridad:** alta · **Depende de:** F4-01 · **Bloquea:** F4-22, F4-23, F4-25

## Contexto

El Registro es la sección del libro que cataloga lo que existe en el Vientre. Hoy tiene tres familias: `fieles`, `oficio`, `aparato`. El Vientre Húmedo introduce once especies que el jugador debe poder descubrir y que la web debe mostrar como fichas con lámina.

## Qué se necesita

Extender `src/lore/Registro.ts`:

1. Ampliar `Familia` con `'fauna'` y `'flora'`.
2. Ampliar `FAMILIAS` con `FAUNA: 'LA FAUNA'` y `FLORA: 'LA FLORA'`.
3. Añadir las fichas de la tabla. Los textos son propuesta; el equipo narrativo puede reescribirlos, pero deben conservar la voz del Registro: una institución que cataloga, no un narrador que se horroriza.

| id | familia | nombre | hallazgo | claves de la ficha |
| --- | --- | --- | --- | --- |
| `mondador` | fauna | Mondador | visto en el Vientre Húmedo | Come lo que el sacramento rechaza; caparazón dorado; las Vestales lo cazan para máscaras; casi extinto; el último del Atrio nació en el 62. |
| `remedo` | fauna | Remedo | visto entre el instrumental | Bicho blando que imita instrumentos; la imitación no da calor; «un bisturí tibio es un Remedo»; muerde si se agarra. |
| `serpiente` | fauna | Serpiente de Tejido | vista en los ductos | Sin esqueleto; abre la boca rompiéndose; depredador de los ductos; emblema del Rebaño Hueco. |
| `buitre` | fauna | Buitre ritual | visto en el altar | Músculo expuesto y ornamento de catedral; si se posa en el altar-camilla, la ofrenda sale Reformada; heraldo de la Quietud. |
| `cerdo` | fauna | Cerdo de Protocolo | visto en los corrales | Descendiente de los cerdos del primer diezmo; vive con tubos e injertos; carne de los linajes injertados. |
| `cuervo` | fauna | Cuervo de Ermita | visto en las bóvedas | Alas de carne y plumas trenzadas con cable; mensajero; el pueblo lo cree heraldo del culto. |
| `zarza` | flora | Zarza Cosedora | vista en el zarzal | Púas ganchudas; clava y seca; muralla de las Vestales; sus púas son agujas de sutura; refugio de Remedos. |
| `mata` | flora | Mata de Retazos | vista en los desagües | Frutos que son partes humanas; raíces junto al tejido rechazado; alimento de pobres y «diezmo vegetal». |
| `alfombra` | flora | Alfombra Devota | vista en los pasillos | Filamentos que imitan la alfombra litúrgica; trampa de emboscada; prohibido pisar alfombra; oficio de tanteador. |
| `vena` | flora | Vena Trepadora | vista en los muros | Enredadera de carne que late con el Latido; las Vestales leen su pulso para anunciar un Hambre. |
| `hongo` | flora | Hongo de Lámpara | visto en la oscuridad | Hongo bioluminiscente; luz y reloj; lo cultivan los hongueros; crece sobre lo que nadie barrió. |

### Textos propuestos

Los siguientes textos respetan el formato de 4 líneas y la voz del Registro. Se pueden ajustar, pero no romper las invariantes: los Primigenios son ciegos, nadie dentro del mundo percibe el horror como horror, y el estatus se mide por la carne.

```ts
// -- Fauna ---------------------------------------------------------------
{
  id: 'mondador',
  familia: 'fauna',
  nombre: 'Mondador',
  textura: 'mondador-placeholder',
  hallazgo: 'visto en el Vientre Húmedo',
  descripcion: [
    'El limpiador del altar. Come solo la carne que los dioses',
    'rechazaron, y por eso el culto lo tiene por sagrado.',
    'Su caparazón vale una máscara de Vestal; quedan pocos,',
    'y ya no crían arriba. El último del Atrio nació en el 62.',
  ],
},
{
  id: 'remedo',
  familia: 'fauna',
  nombre: 'Remedo',
  textura: 'remedo-placeholder',
  hallazgo: 'visto entre el instrumental',
  descripcion: [
    'Bicho blando del tamaño de un dedo que se endurece y',
    'copia la forma de un instrumento. La imitación no da',
    'calor: por eso el dicho «un bisturí tibio es un Remedo».',
    'Si se agarra por error, se retuerce y muerde.',
  ],
},
{
  id: 'serpiente',
  familia: 'fauna',
  nombre: 'Serpiente de Tejido',
  textura: 'serpiente-placeholder',
  hallazgo: 'vista en los ductos',
  descripcion: [
    'Sin esqueleto. Se traga la presa de un bocado y, si no',
    'cabe, rompe su propio tejido para abrirse más.',
    'Es el depredador de los ductos y el emblema del Rebaño',
    'Hueco: promete ascender sin permiso del clero.',
  ],
},
{
  id: 'buitre',
  familia: 'fauna',
  nombre: 'Buitre ritual',
  textura: 'buitre-placeholder',
  hallazgo: 'visto en el altar',
  descripcion: [
    'Músculo expuesto y ornamento de catedral. Si se posa',
    'sobre el altar-camilla, la ofrenda saldrá Reformada.',
    'El pueblo lo llama Buitre de la Quietud y no lo espanta:',
    'espera su veredicto.',
  ],
},
{
  id: 'cerdo',
  familia: 'fauna',
  nombre: 'Cerdo de Protocolo',
  textura: 'cerdo-placeholder',
  hallazgo: 'visto en los corrales',
  descripcion: [
    'Descendiente de los cerdos del primer diezmo. Vive con',
    'tubos e injertos y solo lo comen los linajes injertados.',
    'Su carne se cree más cercana a la de los dioses; por eso',
    'es alimento de lujo y marca de clase.',
  ],
},
{
  id: 'cuervo',
  familia: 'fauna',
  nombre: 'Cuervo de Ermita',
  textura: 'cuervo-placeholder',
  hallazgo: 'visto en las bóvedas',
  descripcion: [
    'Alas de carne y plumas trenzadas con cable. Anida en las',
    'pantallas muertas y repite los zumbidos de las máquinas.',
    'Los porteadores lo siguen para orientarse; el pueblo lo',
    'tiene por heraldo del culto.',
  ],
},

// -- Flora ---------------------------------------------------------------
{
  id: 'zarza',
  familia: 'flora',
  nombre: 'Zarza Cosedora',
  textura: 'zarza-placeholder',
  hallazgo: 'vista en el zarzal',
  descripcion: [
    'Trepadora de tallos oscuros y púas ganchudas. Clava a lo',
    'que la roza y lo seca despacio. Las Vestales la dejan',
    'crecer como muralla; los suturadores le sacan agujas.',
    'Los Remedos se esconden entre sus púas.',
  ],
},
{
  id: 'mata',
  familia: 'flora',
  nombre: 'Mata de Retazos',
  textura: 'mata-placeholder',
  hallazgo: 'vista en los desagües',
  descripcion: [
    'Arbusto de frutos que son manos, dedos, orejas y labios.',
    'Echa raíces junto a los desagües y absorbe el tejido que',
    'el sacramento rechaza. Los pobres la comen; las Vestales',
    'la toleran solo para ofrendas menores.',
  ],
},
{
  id: 'alfombra',
  familia: 'flora',
  nombre: 'Alfombra Devota',
  textura: 'alfombra-placeholder',
  hallazgo: 'vista en los pasillos',
  descripcion: [
    'Filamentos cortos y suaves, del color de las alfombras',
    'litúrgicas. No se mueve hasta que la pisan: entonces se',
    'eriza y digiere despacio. Por eso el pueblo no pisa',
    'alfombra y los tanteadores golpean el suelo antes de cruzar.',
  ],
},
{
  id: 'vena',
  familia: 'flora',
  nombre: 'Vena Trepadora',
  textura: 'vena-placeholder',
  hallazgo: 'vista en los muros',
  descripcion: [
    'Enredadera de carne que late al ritmo del Latido. Las',
    'Vestales leen su pulso para anunciar un Hambre; el pueblo',
    'la mira de reojo. Crece sobre la piedra como si la piedra',
    'tuviera venas.',
  ],
},
{
  id: 'hongo',
  familia: 'flora',
  nombre: 'Hongo de Lámpara',
  textura: 'hongo-placeholder',
  hallazgo: 'visto en la oscuridad',
  descripcion: [
    'Hongo bioluminiscente que ilumina y mide el tiempo. Los',
    'hongueros lo cultivan en terrazas; en el Vientre Húmedo',
    'crece solo, sobre lo que nadie barrió. Su luz es lo único',
    'que no debe nada a los dioses.',
  ],
},
```

## Actualizaciones obligatorias

- `web/src/paginas/registro.ts`: añadir las dos familias a `FAMILIAS` y a la rejilla (ver `F4-25`).
- `src/ui/CodiceScene.ts`: el Registro se construye recorriendo `REGISTRO`; las familias nuevas aparecen solas si `FAMILIAS` está completo.
- `F4-06`: la detección de criaturas debe llamar a `progreso.descubrir(id)` con estos ids.
- `F4-22`/`F4-23`: las texturas `*-placeholder` deben existir.

## Criterios de aceptación

- [ ] Las once fichas existen con id único y familia correcta.
- [ ] Todas se pueden descubrir en el nivel y desbloquean su lámina en la web.
- [ ] Ninguna ficha revela a un Primigenio ni usa «mirar» para los dioses.
- [ ] Los textos respetan 4 líneas de hasta ~62 caracteres.
- [ ] El Registro del juego muestra las cabeceras FAUNA y FLORA en orden.
- [ ] El recuento de fichas es dinámico (`REGISTRO.length`), no un número escrito a mano.

## Referencias

- Biblia: **Capítulo VI, Naturaleza** completo.
- `src/lore/Registro.ts`, `src/ui/CodiceScene.ts`, `web/src/paginas/registro.ts`.

<!-- ==================== F4-05 ==================== -->
---
title: "[NIVEL] Geometría, rutas y secretos de la huida"
labels: fase-4, zona-vientre-humedo, gameplay, prioridad-alta, bloqueante
depende: F4-01, F4-06, F4-43
bloquea: F4-07, F4-09, F4-13, F4-14, F4-15, F4-18, F4-19, F4-20, F4-36, F4-37
---

**Código:** `F4-05` · **GitHub:** #128 · **Prioridad:** alta · **Depende de:** F4-01, F4-06, F4-43 · **Bloquea:** F4-07, F4-09, F4-13, F4-14, F4-15, F4-18, F4-19, F4-20, F4-36, F4-37

## Contexto

Es el Nivel 2 completo. No es una zona dentro del Nivel 1: es la **huida** que empieza en el desagüe de la Sala 7, con la niña, y termina en la puerta del templo. Debe transmitir persecución: la Diócesis detrás, el ecosistema delante. Debe usar la misma lógica de `EscenaNivel` (combate, altares, fragmentos, reliquias, umbral) y la geometría descrita por código hasta que llegue el tileset.

## Qué se necesita

Crear `src/scenes/VientreHumedoScene.ts` extendiendo `EscenaNivel`, con `definirNivel()` completo.

### Recorrido propuesto

| Sala | Función | Contenido obligatorio |
| --- | --- | --- |
| **El desagüe de la Sala 7** | Entrada de la huida | El Cirujano y la niña; Primer Altar; Lluvia Tibia; inscripción del desagüe; salida a la galería. |
| **Galería de limpieza** | Centro del nivel | Mondador en ruta; pilas de carne rechazada; Hongo de Lámpara; Buitre sobre un altar-camilla; una Vestal cazadora opcional en una repisa. |
| **El zarzal** | Barrera y desvío | Zarza Cosedora que bloquea un paso; Remedos escondidos; púas de sutura; puente de tejido opcional (`F4-11`). |
| **La mata** | Riesgo/recompensa | Mata de Retazos; cosecha con `E`; un fragmento escondido entre las raíces; Remedo entre los frutos. |
| **Corral de Protocolo** | Respiro y clase social | Cerdos de Protocolo; Cuervo de Ermita; inscripción de propiedad; salida al nido. |
| **El nido** | Arena de la Serpiente | Serpiente de Tejido; Marea del Hambre; repisas altas; segundo Altar antes de la arena. |
| **Pozo de las Mareas** | Plataformas y secreto | Subida vertical; Vena Trepadora que abre un paso durante el Latido; reliquia escondida. |
| **Ducto de subida** | Salida | Pasillo final; inscripción de la Puerta del Cuerpo; umbral a `FinalNivel2`. |
| **La Puerta del Cuerpo** | Umbral del templo | Puerta sellada; no se cruza; el `FinalNivel2` muestra el templo al otro lado, con la niña junto al Cirujano. |

### La niña en el nivel

- La niña **viaja con el Cirujano** desde la primera sala hasta la Puerta del Cuerpo.
- Es una **compañera narrativa**: sigue al jugador a distancia, no tiene barra de vida, no ataca y no puede fracasar. Si se queda atrás, se recoloca; si hay combate o Marea, se esconde.
- No es una segunda protagonista ni una mecánica de escolta con penalización. El jugador no tiene que protegerla con un botón ni curarla.
- Su presencia es la razón por la que el Cirujano no puede volver atrás. Ver `F4-43`.

### Datos del nivel

- `mundo`: ancho suficiente para que la cámara respire; alto que permita la subida final. Sugerencia: 1200 × 960, ajustable.
- `colorFondo`: más cálido y húmedo que las Salas, pero más oscuro que las Criptas. Sugerencia: `#0a0d0b` con tinte verdoso, o `#0d0b0a` con tinte rojizo.
- `musica`: `'vientre-humedo'` (nueva pista, `F4-24`).
- `llegada`: `'vientre-humedo'`.
- `tinte`: verdoso/amarillento para la piedra mojada; `muro`: nuevas claves o `muro-salas` tintado; `desgaste`: grietas altas y musgo alto (aquí sí hay vida).
- `polvo`: verde pálido o ceniza húmeda.
- `altares`: 2 (entrada y antesala del nido).
- `fragmentos`: `codice-09` y `codice-10` en dos desvíos distintos.
- `reliquias`: 2 (`relicario` y `frasco`) en rutas opcionales.
- `fieles`: `tanteador` y `honguera` (`F4-03`).
- `companera`: `nina` (`F4-43`); aparece en el desagüe y se recoloca si se queda atrás.
- `inscripciones`: las de `F4-39`.
- `umbral`: destino `'FinalNivel2'`, etiqueta «llegar al templo» o «cruzar la Puerta del Cuerpo».
- `limiteCaida`: por debajo del último pozo.
- `criaturas`: las de `F4-13` a `F4-20`.
- `tejidos`: el puente opcional de `F4-11`.
- `mareas`: la configuración de `F4-07`.

### Continuidad con el Nivel 1

- El Nivel 2 se juega después del cierre del Nivel 1; el jugador conserva los fragmentos y reliquias que ganó (`F4-08`, `F4-42`).
- Si se empieza el Nivel 2 directamente desde un selector o un atajo de prueba, el Cirujano arranca con el equipo base. El nivel debe ser jugable en ambos casos, pero se balancea para el recorrido normal (Nivel 1 → Nivel 2).
- La niña viaja con el Cirujano; su presencia es narrativa y no una escolta con fracaso (`F4-43`).
- El templo no se cruza: la última sala es la puerta.

### Reglas de trazado

- La ruta de vuelta debe cumplir `verificar-rutas`: los tramos altos solapan en x con los bajos. Salto simple 92 px, doble 157 px, dash +54 px.
- Ninguna plataforma alta debe colgar sobre la que se usa para subir a ella.
- El puente de tejido no puede ser obligatorio: si el jugador no tiene injertos, debe poder terminar el nivel.
- La Serpiente bloquea el ducto, pero la arena debe tener espacio para esquivar y castigar.
- La Marea no puede cubrir el único Altar ni la única salida.
- El Mondador no puede quedar encerrado por una puerta que se cierre.

## Criterios de aceptación

- [ ] El Nivel 2 se juega de principio a fin con el moveset actual (salto, doble, dash, agarre, ataque, cargado, parry, injerto, poción).
- [ ] El Nivel 1 conserva su jugabilidad; solo cambia el cierre narrativo.
- [ ] `npm run verificar-rutas` pasa con la nueva escena incluida.
- [ ] Los 2 fragmentos y las 2 reliquias son alcanzables.
- [ ] Hay 2 Altares y la muerte devuelve al último sin soft lock.
- [ ] El Mondador puede completar su ruta sin atascarse.
- [ ] La Marea y la Serpiente no hacen imposible la subida.
- [ ] La niña sigue al Cirujano sin bloquear la ruta ni crear un estado de fracaso.
- [ ] El nivel termina en `FinalNivel2` y no entra en el templo.
- [ ] El decorado no flota (lo comprueba `verificar-rutas`).
- [ ] No aparece ningún Primigenio ni se insinúa que alguien los vea.

## Referencias

- `src/scenes/EscenaNivel.ts`, `src/scenes/CriptasScene.ts`, `src/scenes/SalasScene.ts`, `src/scenes/FinalScene.ts`.
- `F4-43` (la niña como compañera).
- `docs/DESARROLLO.md` → «Añadir una zona nueva» y «Diseño de niveles».
- Biblia: **Capítulo VI, Naturaleza → Condiciones físicas** (Lluvia Tibia, Latido, Mareas del Hambre, gradiente de calor).

<!-- ==================== F4-06 ==================== -->
---
title: "[TÉCNICO] Sistema de criaturas y peligros del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, tecnico, gameplay, bloqueante
depende: F4-01
bloquea: F4-05, F4-07, F4-13, F4-14, F4-15, F4-16, F4-17, F4-18, F4-19, F4-20
---

**Código:** `F4-06` · **GitHub:** #90 · **Prioridad:** bloqueante · **Depende de:** F4-01 · **Bloquea:** F4-05, F4-07, F4-13 a F4-20

## Contexto

`DefinicionNivel` solo conoce `devotos`, `vestales` y `jefe`. Añadir once especies con campos propios convertiría la interfaz en una lista interminable y obligaría a tocar `EscenaNivel` con cada bicho. Hace falta una abstracción pequeña y tipada.

## Qué se necesita

### 1. Un tipo común para lo que habita el nivel

```ts
export type CriaturaDef =
  | { tipo: 'remedo'; x: number; y: number; ronda?: RangoPatrulla }
  | { tipo: 'serpiente'; x: number; y: number; arena: { izquierda: number; derecha: number } }
  | { tipo: 'mondador'; ruta: readonly [number, number][] }
  | { tipo: 'buitre'; x: number; y: number }
  | { tipo: 'cerdo'; x: number; y: number; ronda: RangoPatrulla }
  | { tipo: 'cuervo'; posaderos: readonly [number, number][] }
  | { tipo: 'zarza'; x: number; y: number; altoTiles: number; anchoTiles?: number }
  | { tipo: 'alfombra'; x: number; y: number; anchoTiles: number }
  | { tipo: 'mata'; x: number; y: number }
  | { tipo: 'vena'; x: number; y: number; altoTiles: number }
  | { tipo: 'hongo'; x: number; y: number };
```

`DefinicionNivel` gana un campo opcional:

```ts
criaturas?: readonly CriaturaDef[];
```

### 2. Dos contratos, no uno

- **Hostil** (`Enemigo` actual): se le puede golpear, tiene vida, puede morir. Remedo y Serpiente.
- **Habitante/peligro:** no se le puede matar o no debe ser atacado. Mondador, Buitre, Cerdo, Cuervo, Zarza, Alfombra, Mata, Vena, Hongo.

Para no mezclar la `Zona` de daño del jugador con criaturas que no deben recibir daño:

- `grupoHostiles`: sprites que entran en el overlap del ataque y en el daño por contacto.
- `grupoNeutrales`: sprites que no reciben el ataque; pueden tener su propio overlap (Buitre, Cerdo, Mondador).
- `grupoPeligros`: zonas estáticas que hacen daño por contacto (Zarza, Alfombra, Vena).

No metas al Mondador en `grupoHostiles`: el jugador no debe poder matarlo por accidente.

### 3. Fábrica y población

En `EscenaNivel.poblarNivel()`:

```ts
for (const def of this.definicion.criaturas ?? []) {
  switch (def.tipo) {
    case 'remedo': /* new Remedo(...) */ break;
    case 'serpiente': /* new SerpienteDeTejido(...) */ break;
    // ...
  }
}
```

Cada criatura implementa:

```ts
interface Habitante {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly clase: ClaseEnemigo;
  readonly hiereAlContacto: boolean;
  actualizar(xJugador: number, yJugador: number): void;
}
```

La Serpiente y el Remedo implementan además `Enemigo` (`recibirDano`, `estaMuerto`).

### 4. Catálogo

Ampliar `catalogarLoQueSeVe()` para recorrer `criaturas` y, si el jugador está a menos de 170 px, llamar a `progreso.descubrir(idFicha)` y emitir el aviso del HUD. Cada `CriaturaDef` debe llevar su `idFicha` o derivarlo del `tipo`.

### 5. Limpieza

`reiniciarEstado()` debe vaciar los arrays nuevos y destruir los grupos. `limpiarDevotosMuertos()` debe limpiar también los hostiles nuevos.

### 6. Sonido

Ampliar `ClaseEnemigo` en `src/systems/Sonido.ts` con `'remedo' | 'serpiente' | 'mondador' | 'buitre' | 'cerdo' | 'cuervo' | 'zarza' | 'alfombra' | 'mata' | 'vena' | 'hongo'` (ver `F4-24`).

## Criterios de aceptación

- [ ] Añadir una criatura nueva requiere su clase y una entrada en `CriaturaDef`, no un campo nuevo en `DefinicionNivel`.
- [ ] El ataque del jugador no puede herir al Mondador, al Buitre, al Cerdo, al Cuervo ni a la Mata.
- [ ] La Zarza sí se puede cortar; la Alfombra no se puede matar, solo cortar los filamentos.
- [ ] Los habitantes se catalogan al verlos y la ficha se abre en la web.
- [ ] `reiniciarEstado()` no deja arrays ni grupos viejos.
- [ ] `npm run typecheck`, `lint` y `format:check` pasan.

## Referencias

- `src/scenes/EscenaNivel.ts` (`DefinicionNivel`, `poblarNivel`, `catalogarLoQueSeVe`, `reiniciarEstado`).
- `src/entities/Enemigo.ts`.
- `src/systems/Sonido.ts` (`ClaseEnemigo`).

<!-- ==================== F4-07 ==================== -->
---
title: "[TÉCNICO] Mareas del Hambre y Latido como peligro temporal"
labels: fase-4, zona-vientre-humedo, gameplay, tecnico, prioridad-alta
depende: F4-05, F4-06
bloquea: F4-14, F4-17, F4-19, F4-37
---

**Código:** `F4-07` · **GitHub:** #91 · **Prioridad:** alta · **Depende de:** F4-05, F4-06 · **Bloquea:** F4-14, F4-17, F4-19, F4-37

## Contexto

La biblia describe las **Mareas del Hambre**: cuando los Viscerales digieren, los ductos expulsan fluidos tibios que inundan las criptas bajas, fertilizan todo y arrastran a quien esté abajo. En el Nivel 2 es un fenómeno natural del edificio —no un castigo ni un desvío— y la amenaza ambiental que obliga a ganar altura. El Nivel 2 existe porque el Cirujano sigue a la niña hacia el templo, no porque la Marea cierre una puerta.

## Qué se necesita

Un sistema de marea temporal, no una simulación de fluido.

### Constantes en `src/config/Sacramento.ts`

```ts
export const MAREAS = {
  periodoMs: 18000,
  avisoMs: 2600,
  subidaMs: 4200,
  crecidaMs: 6200,
  bajadaMs: 4200,
  alturaMaxima: 220,
  danoPorContacto: 1,
  empuje: 44,
  retornoAlAltarSiSeAhoga: true,
} as const;
```

### Estados

`reposo → aviso → subiendo → crecida → bajando → reposo`

- **Aviso:** la Vena Trepadora se contrae, la Lluvia Tibia arrecía, el Latido acelera y el HUD avisa «sube el agua». Mínimo 2,5 s.
- **Subiendo:** el agua asciende visualmente; el jugador puede ganar altura.
- **Crecida:** daño por contacto y empuje suave; no muerte instantánea.
- **Bajando:** vuelve el paso; se puede cruzar.

### Implementación

- Una `TileSprite` o `Rectangle` semitransparente con un `Zone`/cuerpo estático que cambia de altura.
- `overlap` con el Cirujano: aplicar `MAREAS.danoPorContacto` con i-frames y empujar hacia la plataforma segura más cercana.
- Si el agua cubre al Cirujano por completo, devolverlo al último Altar con 1 de daño (como la caída al vacío de `EscenaNivel`), no matarlo.
- La marea se detiene con la pausa y con el Códice; usar `this.time`/`this.tweens` de la escena, no `setTimeout`.
- Emitir eventos para que Vena, Buitre, Hongo y sonido reaccionen.
- No mojar el Altar de la entrada ni el umbral de salida.

### Configuración por zona

`DefinicionNivel` puede llevar `mareas?: { activa: boolean; alturaMaxima?: number; periodoMs?: number }`. Si no existe, la zona no tiene marea.

## Criterios de aceptación

- [ ] La marea avisa antes de subir y el aviso se entiende sin leer texto.
- [ ] Ningún punto del nivel queda inaccesible durante la crecida.
- [ ] El daño es justo: no hay muerte instantánea ni daño sin i-frames.
- [ ] La marea se sincroniza con la Vena Trepadora y el Latido.
- [ ] Funciona con pausa, Códice y muerte.
- [ ] No hay fugas de temporizadores ni de cuerpos físicos al cambiar de escena.
- [ ] `npm run verificar-rutas` no se ve afectado por la marea (la ruta seca sigue existiendo).

## Referencias

- Biblia: **Condiciones físicas → Mareas del Hambre**, **Vena Trepadora**, **Latido**.
- `src/scenes/EscenaNivel.ts` (`comprobarCaidaAlVacio`, `reapareciendo`).
- `src/systems/Sonido.ts`, `src/systems/Musica.ts`.

<!-- ==================== F4-08 ==================== -->
---
title: "[TÉCNICO] Estructura de dos niveles: la decisión y la huida"
labels: fase-4, zona-vientre-humedo, tecnico, gameplay, bloqueante
depende: F4-01, F4-03, F4-05, F4-43
bloquea: F4-36, F4-37, F4-42
---

**Código:** `F4-08` · **GitHub:** #129 · **Prioridad:** bloqueante · **Depende de:** F4-01, F4-03, F4-05, F4-43 · **Bloquea:** F4-36, F4-37, F4-42

## Contexto

El Nivel 1 termina con la decisión del Cirujano: baja el bisturí y no entrega a la niña. El desagüe detrás de la Sala 7 es la escapatoria. `FinalScene` deja de ser el final del juego y pasa a ser la puerta del **Nivel 2**. `SalasScene` debe seguir apuntando a `Final`; lo que cambia es lo que ofrece `FinalScene` después del diálogo de cierre.

## Qué se necesita

1. **`src/main.ts`:** registrar `VientreHumedoScene` y `FinalNivel2Scene`. No tocar el orden de las escenas del Nivel 1.
2. **`src/scenes/FinalScene.ts`:**
   - Mantener el diálogo `cierre` (actualizado en `F4-03`) y el recuento del Nivel 1 (8/8, ver `F4-02`).
   - Añadir una opción principal: **«Huir por el desagüe»**.
   - Esa opción hace fundido a `VientreHumedo` **sin** llamar a `progreso.reiniciar()`: el jugador conserva fragmentos, reliquias y fichas.
   - Mantener **«Volver al Atrio»** como reinicio del Nivel 1 (con `progreso.reiniciar()`).
   - Registrar el hito `'final'` como hoy; al entrar al Nivel 2, registrar `'nivel-2'` (`F4-42`).
   - La niña sale de la Sala con el Cirujano: `VientreHumedoScene` la recibe como compañera (`F4-43`).
3. **`src/scenes/SalasScene.ts`:** no tocar su jugabilidad. Su `umbral.destino` sigue siendo `'Final'`. El cierre narrativo se actualiza en `Pensamientos.ts`/`FinalScene`, no en la arena.
4. **`src/scenes/VientreHumedoScene.ts`:**
   - `umbral.destino = 'FinalNivel2'`.
   - Etiqueta «llegar al templo» o «cruzar la Puerta del Cuerpo».
   - `llegada: 'vientre-humedo'`.
   - La niña aparece en la primera sala y sigue al Cirujano (`F4-43`).
5. **`src/scenes/FinalNivel2Scene.ts`:** escena nueva de cierre del Nivel 2.
   - Muestra la Puerta del Cuerpo y a la niña junto al Cirujano.
   - Muestra el recuento global (10 fragmentos, 9 reliquias, fichas).
   - Anuncia «Nivel 3 — El Vientre Profundo» sin mostrarlo.
   - Opciones: «Volver al Atrio» (reinicia) y «Rejugar el Nivel 2» (si se implementa).
6. **`Progreso`:** no se reinicia al pasar del Nivel 1 al Nivel 2. Se reinicia solo al volver al Atrio desde `FinalNivel2` o desde `FinalScene`.
7. **Prueba:** añadir un atajo `?nivel=2` (o similar) para iniciar el Nivel 2 sin jugar el Nivel 1, documentado y sin afectar la build pública. Ver `F4-42`.

## Criterios de aceptación

- [ ] El Nivel 1 se juega igual hasta el cierre; solo cambia el texto de la decisión.
- [ ] `SalasScene` no cambia.
- [ ] Desde `FinalScene` se puede huir por el desagüe al Nivel 2 sin perder el progreso.
- [ ] «Volver al Atrio» sigue reiniciando el Nivel 1.
- [ ] El Nivel 2 termina en `FinalNivel2`, no en `Salas` ni en el templo.
- [ ] La niña aparece en el Nivel 2 y llega con el Cirujano a la Puerta del Cuerpo.
- [ ] `FinalNivel2` muestra el recuento global y el anuncio del Nivel 3.
- [ ] Una partida completa Nivel 1 → Nivel 2 funciona sin recargar.
- [ ] `npm run typecheck`, `lint` y `build` pasan.

## Referencias

- `src/main.ts`, `src/scenes/FinalScene.ts`, `src/scenes/SalasScene.ts`, `src/scenes/VientreHumedoScene.ts`.
- `docs/DESARROLLO.md` → «Flujo de escenas».
- `F4-02`, `F4-03`, `F4-40`, `F4-42`, `F4-43`.

<!-- ==================== F4-09 ==================== -->
---
title: "[MAPA] Mapas del juego y del portal: Nivel 1, Nivel 2 y templo"
labels: fase-4, zona-vientre-humedo, gameplay, web, prioridad-alta
depende: F4-01, F4-05
bloquea: F4-27, F4-30, F4-37
---

**Código:** `F4-09` · **GitHub:** #130 · **Prioridad:** alta · **Depende de:** F4-01, F4-05 · **Bloquea:** F4-27, F4-30, F4-37

## Contexto

Hay dos mapas que deben contar la misma verdad:

- `src/lore/Mapa.ts` y `src/ui/CodiceScene.ts`: el croquis que el Cirujano dibuja al bajar.
- `src/lore/Vientre.ts` y `web/src/paginas/vientre.ts`: el corte de las seis capas y el plano de salas del portal.

Con la fase 4, el Nivel 1 ocupa las capas I-IV, el Nivel 2 ocupa la capa V y el templo (capa VI) solo se ve como puerta. El mapa del Nivel 1 no debe cambiar.

## Qué se necesita

### 1. Mapa del juego (`src/lore/Mapa.ts`)

Añadir la zona del Nivel 2:

```ts
{ escena: 'VientreHumedo', nombre: 'El Vientre Húmedo', nivel: 2 },
```

Añadir `nivel: 1 | 2` a `ZONAS_MAPA`:

- Nivel 1: Atrio, Pasillos, Criptas, Salas (sin cambios).
- Nivel 2: Vientre Húmedo.

`CodiceScene` debe mostrar solo las zonas del nivel actual (`progreso.nivelActual` o el `scene.key` de la escena que abre el libro). El Nivel 1 debe seguir mostrando exactamente sus cuatro zonas; el Nivel 2, su croquis.

### 2. Vientre del juego (`src/lore/Vientre.ts`)

- Capa 5 (`Niveles Reformados`): `escena: 'VientreHumedo'` en vez de `null`.
- Actualizar la descripción: es el ecosistema que limpia lo que el sacramento rechaza y la escapatoria hacia el templo.
- Capa 6 (`El Vientre Profundo`): `escena: null`; descripción «El templo. Se ve su puerta al final del Nivel 2; no se cruza.»
- Corregir el comentario de cabecera «Las dos últimas no se visitan en el teaser».

### 3. Página web del Vientre (`web/src/paginas/vientre.ts`)

- Añadir salas de la capa 4 (Niveles Reformados) al array `SALAS`:
  - `desague` · «El desagüe de la Sala 7» · glifo de tubería/goteo · principal.
  - `limpieza` · «Galería de limpieza» · glifo del Mondador · principal.
  - `zarzal` · «El zarzal» · glifo de zarza · desvío.
  - `mata` · «La mata» · glifo de frutos · desvío.
  - `corral` · «Corral de Protocolo» · glifo de cerdo · desvío.
  - `nido` · «El nido» · glifo de serpiente · principal.
  - `pozo` · «Pozo de las Mareas» · glifo de agua · desvío.
  - `ducto` · «Ducto de subida» · glifo de conducto · principal.
  - `puerta` · «La Puerta del Cuerpo» · glifo de puerta/umbral · principal.
- Cambiar la capa 4 de `tipo: 'sellada'` a salas visitables.
- Añadir los pasos:
  - `sala7 → desague` (pozo/desagüe; «lo que no se completa baja»).
  - `desague → limpieza`.
  - `limpieza → zarzal` y `limpieza → corral`.
  - `zarzal → mata`.
  - `mata → nido` y `corral → nido`.
  - `nido → pozo`.
  - `pozo → ducto`.
  - `ducto → puerta`.
  - `puerta → santuario` (conducto; «la Puerta del Cuerpo; no se cruza en el Nivel 2»).
- Eliminar cualquier paso `espera → desague` o ruta Criptas → Nivel 2: el Nivel 2 no se entra desde el Nivel 1 en el mapa del edificio, sino desde el cierre del Nivel 1 (el desagüe de la Sala 7).
- Mantener `santuario` como `tipo: 'sellada'`.
- Añadir los glifos nuevos a `Glifo` y `GLIFOS`; si no hay glifo, usar uno existente y dejar el definitivo para `F4-30`.
- Actualizar la leyenda y la nota de «no se visita»: ahora solo la capa VI (el templo).
- Revisar que los rótulos no se pisen y que el panel lateral siga funcionando.

### 4. Textos que dicen «las dos inferiores»

- `web/src/paginas/portada.ts`: «Las dos inferiores no admiten visitas» → «La capa VI es el templo; se ve su puerta al final del Nivel 2».
- `README.md` y `docs/DESARROLLO.md`: actualizar la estructura de dos niveles y el flujo.

## Criterios de aceptación

- [ ] El mapa del Nivel 1 sigue mostrando exactamente sus cuatro zonas.
- [ ] El mapa del Nivel 2 muestra su croquis cuando se juega el Nivel 2.
- [ ] La capa V del portal es visitable y la VI sigue sellada.
- [ ] `sala7 → desague` es la entrada del Nivel 2; no hay ruta desde Criptas.
- [ ] `ducto → puerta` y `puerta → santuario` cuentan el umbral del templo.
- [ ] Las salas nuevas se pueden pulsar y sus salidas navegan.
- [ ] No hay rótulos superpuestos ni scroll horizontal en escritorio.
- [ ] En móvil el diagrama se arrastra y la ficha queda legible.
- [ ] Los textos ya no dicen que las dos capas inferiores están cerradas.

## Referencias

- `src/lore/Mapa.ts`, `src/lore/Vientre.ts`, `src/ui/CodiceScene.ts`.
- `web/src/paginas/vientre.ts`, `web/src/paginas/portada.ts`.
- Biblia: **Mapas → Los seis niveles**, **Niveles Reformados**, **El Vientre Profundo**.

<!-- ==================== F4-10 ==================== -->
---
title: "[TÉCNICO] Contadores dinámicos y memoria del Nivel 2"
labels: fase-4, zona-vientre-humedo, tecnico, web, prioridad-media
depende: F4-02, F4-04, F4-05
bloquea: F4-25, F4-27, F4-28, F4-35
---

**Código:** `F4-10` · **GitHub:** #94 · **Prioridad:** media · **Depende de:** F4-02, F4-04, F4-05 · **Bloquea:** F4-25, F4-27, F4-28, F4-35

## Contexto

Hay números escritos a mano por todo el proyecto: ocho hojas, siete reliquias, seis capas, «las ocho hojas». Al añadir dos fragmentos y dos reliquias, esos números mienten. Además, la web necesita saber cuántas reliquias existen sin importar `Progreso` (que es estado de partida).

## Qué se necesita

### 1. Fuente única de reliquias

Crear `src/lore/Reliquias.ts` con una lista de metadatos:

```ts
export interface ReliquiaLore {
  id: string;
  zona: string;
  tipo: 'relicario' | 'frasco';
}

export const RELIQUIAS: readonly ReliquiaLore[] = [
  // las 7 actuales + las 2 del Vientre Húmedo
];
```

`Progreso.reliquiasTotales` debe devolver `RELIQUIAS.length`, no `7`. Las definiciones de nivel siguen colocando las reliquias; la lista es la fuente de conteo y de la web.

### 2. Contadores derivados

- `CODICE.length` para hojas.
- `REGISTRO.length` para fichas.
- `VIENTRE.length` para capas.
- `RELIQUIAS.length` para reliquias.
- Exportar constantes si hace falta: `HOJAS_TOTALES`, `FICHAS_TOTALES`, `CAPAS_TOTALES`, `RELIQUIAS_TOTALES`.

### 3. Recuento por nivel

El total global no basta: el Nivel 1 debe seguir mostrando **8/8** y su línea oculta, y el Nivel 2 debe mostrar **10/10** al completar todo el Códice.

- `Progreso.nivelActual: 1 | 2` (lo fija cada escena al arrancar).
- `Progreso.fragmentosDelNivel(1)` = 8; `fragmentosDelNivel(2)` = 2.
- `Progreso.reliquiasDelNivel(1)` = 7; `reliquiasDelNivel(2)` = 2.
- `FinalScene` usa el recuento del Nivel 1 (8/8).
- `FinalNivel2Scene` usa el recuento global (10/10).
- La web usa el total global (10 hojas, 9 reliquias) porque muestra el universo completo.
- `RELIQUIAS` lleva `nivel: 1 | 2` ademas de `zona` y `tipo`.

### 4. Sustituir números a mano

- `web/src/paginas/portada.ts`: `8`, `7`, `6` y cualquier «ocho».
- `web/src/paginas/doctrina.ts`: «ocho hojas», «las ocho hojas», lista de romanos.
- `README.md`: «ocho fragmentos», «cinco reliquias», «cuatro zonas».
- `docs/DESARROLLO.md`: «Ocho fragmentos», «Cinco en total», «cuatro zonas».
- `FinalScene`: ya usa `progreso.fragmentosTotales`; comprobar reliquias y fichas.
- `src/ui/CodiceScene.ts`: cualquier texto con «ocho».

### 5. Memoria

El Nivel 2 se registra solo con `progreso.pisarCapa('VientreHumedo')` y `recordar('capas', ...)`. Comprobar que la web la lee (`capaPisada('VientreHumedo')`). No hace falta una categoría nueva de memoria.

El hito `'nivel-2'` se registra al entrar o al terminar el Nivel 2 (`F4-42`). La web puede usarlo para abrir el expediente del templo. Si se añade, ampliar `hitoAbierto` y la documentación.

## Criterios de aceptación

- [ ] Ningún contador visible está escrito a mano.
- [ ] La web muestra 10 hojas, 9 reliquias, 6 capas y el total real de fichas.
- [ ] `Progreso.reliquiasTotales` coincide con las reliquias colocadas.
- [ ] El Nivel 1 muestra 8/8 y el Nivel 2 muestra 10/10.
- [ ] La capa nueva se guarda en `localStorage` y la web la reconoce.
- [ ] `README` y `DESARROLLO` no tienen cifras obsoletas.
- [ ] `npm run typecheck` y `build` pasan.

## Referencias

- `src/systems/Progreso.ts`, `src/systems/Memoria.ts`, `web/src/memoria.ts`.
- `web/src/paginas/portada.ts`, `web/src/paginas/doctrina.ts`.
- `README.md`, `docs/DESARROLLO.md`.

<!-- ==================== F4-11 ==================== -->
---
title: "[TÉCNICO] Puentes de tejido: la Injertadora como llave del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, gameplay, tecnico, prioridad-media
depende: F4-05, F4-06
bloquea: F4-36, F4-37
---

**Código:** `F4-11` · **GitHub:** #95 · **Prioridad:** media · **Depende de:** F4-05, F4-06 · **Bloquea:** F4-36, F4-37

## Contexto

La biblia dice que en el Vientre Húmedo la frontera entre especies es porosa: el vector de Genesis Vestal permite que un tejido se injerte en otro. La Injertadora ya existe y gasta injertos de metal. El nivel nuevo puede darle un uso distinto del combate: **coser un puente de tejido** sobre un hueco.

## Qué se necesita

1. Un objeto `NoduloTejido` o `PuenteTejido` en `src/objetos/`:
   - Sprite de tejido pulsante en el borde de un hueco.
   - Aviso `E  injertar` cuando el jugador está cerca.
   - Si `progreso.injertos > 0`: gasta 1 injerto, reproduce una animación de tejido que crece y crea una plataforma estática transitable.
   - Si no hay injertos: muestra «sin injertos» en el HUD y no consume nada.
2. `DefinicionNivel` gana `tejidos?: readonly [x, y, anchoTiles][]` o una entrada en `criaturas` de tipo `'tejido'`.
3. La plataforma creada debe ser parte de `suelos` para que el Cirujano colisione y para que `verificar-rutas` no la ignore (si el script lee solo el código, el puente no aparecerá; documentar que es una ruta opcional).
4. El puente debe ser **opcional**: no puede gatear la ruta principal ni un fragmento obligatorio. Se usa para un atajo o para una reliquia escondida.
5. Persistencia: si el jugador muere y reaparece en el Altar, el puente sigue hecho. Si se reinicia la escena, se vuelve a construir.
6. Sonido: tejido que se estira y se cierra; el mismo tipo de sonido que el injerto del arma.

## Criterios de aceptación

- [ ] Con 1 injerto, el puente se construye y se puede cruzar.
- [ ] Sin injertos, no se puede construir y el HUD lo dice.
- [ ] El puente no es necesario para terminar el nivel.
- [ ] No se puede construir dos veces ni gastar dos injertos en el mismo nódulo.
- [ ] La plataforma creada colisiona correctamente y no deja al jugador atrapado.
- [ ] El puente no rompe `verificar-rutas` (la ruta principal sigue siendo válida sin él).

## Referencias

- Biblia: **Ley alterada: la frontera entre especies es porosa**, **Injertos**, **La Injertadora**.
- `src/entities/Injerto.ts`, `src/config/Sacramento.ts` (`INJERTADORA`), `src/systems/Progreso.ts`.

<!-- ==================== F4-12 ==================== -->
---
title: "[TÉCNICO] Hongo de Lámpara, Lluvia Tibia y luz del nivel"
labels: fase-4, zona-vientre-humedo, gameplay, arte, prioridad-media
depende: F4-05
bloquea: F4-21, F4-23, F4-37
---

**Código:** `F4-12` · **GitHub:** #96 · **Prioridad:** media · **Depende de:** F4-05 · **Bloquea:** F4-21, F4-23, F4-37

## Contexto

El Vientre Húmedo no tiene sol. La luz viene de hongos bioluminiscentes, velas y vidrieras moribundas. La Lluvia Tibia cae constantemente desde las bóvedas. Sin luz y sin lluvia, la zona se lee como otra versión de las Criptas.

## Qué se necesita

### 1. Hongo de Lámpara

- `Hongo` como decorado/interactable (`criaturas` tipo `'hongo'` o `decorado` con lógica).
- Emite luz con el sistema de `brillo-placeholder` que ya usa `EscenaNivel` para las velas y los Altares.
- Interacción `E  cosechar`: cura 1 o da +1 Fervor (elegir una sola cosa y documentarla), y el hongo se apaga durante el resto de la partida en esa zona. No es una fuente infinita.
- Los hongos marcan el camino seguro y las repisas altas; no deben iluminar todo el nivel.
- El HUD no necesita un medidor de luz.

### 2. Lluvia Tibia

- Partículas de goteo desde arriba, fijas a la cámara o al mundo según lo que ya hace `crearPolvo()`.
- Sonido de gotas y charcos (`F4-24`).
- Charcos en el suelo con reflejo tenue; no cambian la física.
- La lluvia arrecía durante el aviso de la Marea (`F4-07`), como señal.

### 3. Luz del nivel

- No implementar un motor de oscuridad completo. Usar:
  - `colorFondo` oscuro.
  - Luces aditivas de hongos, velas y Altares.
  - Viñeta existente.
  - Un `Rectangle` oscuro semitransparente si hace falta, con un agujero de luz alrededor del Cirujano, pero solo si no cuesta rendimiento.
- El nivel debe ser legible a 480×320 sin subir el brillo del monitor.

## Criterios de aceptación

- [ ] El nivel se lee sin linterna y sin adivinar dónde está el suelo.
- [ ] Los hongos iluminan y se pueden cosechar una vez.
- [ ] La lluvia se ve y se oye, y arrecía con la Marea.
- [ ] No hay un sistema de oscuridad que oculte hazards injustamente.
- [ ] El rendimiento se mantiene (sin cientos de partículas).
- [ ] La paleta respeta la guía de estilo del proyecto.

## Referencias

- Biblia: **Condiciones físicas → Luz, Lluvia Tibia**, **Flora → Hongo de Lámpara**.
- `src/scenes/EscenaNivel.ts` (`crearLuces`, `crearPolvo`, `crearVineta`).
- `docs/issues/03-guia-estilo-paleta.md`.

<!-- ==================== F4-13 ==================== -->
---
title: "[ENEMIGO] Remedo: el instrumento tibio"
labels: fase-4, zona-vientre-humedo, gameplay, prioridad-media
depende: F4-06, F4-04
bloquea: F4-22, F4-24, F4-37
---

**Código:** `F4-13` · **GitHub:** #97 · **Prioridad:** media · **Depende de:** F4-06, F4-04 · **Bloquea:** F4-22, F4-24, F4-37

## Contexto

El Remedo es el bicho blando que se hace pasar por instrumental. Es la amenaza cotidiana de baja escala y el origen cultural del conteo del instrumental y del dicho «un bisturí tibio es un Remedo». No debe ser un enemigo de pasillo: debe ser una emboscada que enseñe a mirar dos veces.

## Qué se necesita

Una clase `Remedo` en `src/entities/Remedo.ts` que implemente `Enemigo`:

- **Aspecto:** 8×8 o 10×10 px; piel de pigmentos cambiantes; cuando está quieto imita un objeto (bandeja, injerto, relicario, fruta de Mata). La imitación es de forma y color, no de temperatura ni de filo.
- **Estados:** `oculto` (inmóvil, parece decorado), `descubierto` (se retuerce), `mordiendo`, `huyendo`, `muerto`.
- **Detección:** si el jugador se acerca a menos de 20 px o pulsa `E` para recoger lo que cree que es un objeto, el Remedo muerde (1 de daño), se descubre y huye.
- **Combate:** 2 de vida; muere de un golpe normal; no persigue lejos; se esconde en una bandeja, una Mata o un rincón.
- **Tell:** un temblor sutil y un sonido de succión; no depender solo del color. El jugador debe poder aprender a distinguirlo.
- **Spots:** 3-4 en el nivel, al menos uno entre las bandejas de la Galería de limpieza y otro entre los frutos de la Mata.
- **Drop:** nada, o una carne de +1 vida con probabilidad baja. No debe ser una granja.
- **Catálogo:** `progreso.descubrir('remedo')` al verlo.
- **Sonido:** `ClaseEnemigo` `'remedo'`.

## Criterios de aceptación

- [ ] El Remedo se distingue de un objeto real por animación/sonido, no solo por color.
- [ ] Muerde una vez y huye; no acosa.
- [ ] No se puede confundir con un ítem recogible hasta que el jugador aprende el tell.
- [ ] Muere con un golpe y no da una recompensa desproporcionada.
- [ ] Se cataloga en el Registro al verlo.
- [ ] No rompe el conteo del instrumental ni la lógica de la Injertadora.

## Referencias

- Biblia: **Fauna → El Remedo**, **Funciones narrativas**, **Objetos rituales**.
- `src/entities/Devoto.ts` (patrón de enemigo), `src/entities/Enemigo.ts`.

<!-- ==================== F4-14 ==================== -->
---
title: "[ENEMIGO] Serpiente de Tejido: mini-jefe de los ductos"
labels: fase-4, zona-vientre-humedo, gameplay, prioridad-alta
depende: F4-05, F4-06, F4-07
bloquea: F4-17, F4-22, F4-24, F4-37
---

**Código:** `F4-14` · **GitHub:** #98 · **Prioridad:** alta · **Depende de:** F4-05, F4-06, F4-07 · **Bloquea:** F4-17, F4-22, F4-24, F4-37

## Contexto

La Serpiente de Tejido es el depredador cumbre de los ductos y el símbolo de la tentación herética: el Rebaño Hueco la busca porque su injerto promete «volverse dios» sin permiso del clero. Es la amenaza principal de la exploración y el cierre natural del nivel: bloquea el ducto de subida a la Sala 7.

## Qué se necesita

Una clase `SerpienteDeTejido` en `src/entities/SerpienteDeTejido.ts` que implemente `Enemigo` y el contrato de mini-jefe.

### Comportamiento

- **Fase 1 (100-50% de vida):**
  - Patrulla/acecha desde un ducto; telegrafía con silbido grave, polvo y la Vena Trepadora contrayéndose.
  - Embestida horizontal; si falla y choca con un muro/ducto, queda aturdida 900 ms (ventana de castigo).
  - El cuerpo tiene escamas duras: recibe menos daño; la cabeza y la boca abierta son el punto débil.
- **Fase 2 (50-0%):**
  - La boca se abre deformándose (body horror, sin gore realista).
  - Intenta tragar: si atrapa al Cirujano, lo retiene, le hace 1 de daño y lo escupe; no es muerte instantánea.
  - La Marea del Hambre sube durante la fase 2: la arena gana verticalidad y el jugador debe pelear desde las repisas.
  - Puede usar el parry: si el jugador para la embestida, la Serpiente queda aturdida y expuesta.
- **Muerte:** abre el ducto; suelta 2 injertos y permite el paso. No da Fervor extra.
- **Presentación:** `SERPIENTE DE TEJIDO` / `la que asciende sin permiso`, con barra de vida propia. Sin diálogo; es un animal.
- **No es un Primigenio:** no tiene ojos, no habla, no «mira». Su boca es tejido, no magia.

### Arena

- La sala «El nido» con:
  - Suelo amplio.
  - 2-3 repisas altas para escapar de la marea y castigar desde arriba.
  - Ductos por los que entra y sale.
  - El Altar en la antesala, fuera de la arena, para reintentar.
- La pelea debe poder ganarse con la vida y el equipo iniciales; no exigir la Injertadora.

## Criterios de aceptación

- [ ] La Serpiente telegrafía todas sus maniobras con al menos 500 ms.
- [ ] Se puede esquivar con dash/salto y castigar tras el choque o el parry.
- [ ] La fase 2 no hace la pelea imposible por la marea.
- [ ] El ataque de tragar no mata de un golpe y se puede escapar.
- [ ] Al morir el jugador, el combate se reinicia completo (como el Reformado).
- [ ] Al vencer, el ducto a Sala 7 se abre y el umbral funciona.
- [ ] No hay soft lock si el jugador cae al agua o al vacío.
- [ ] Sonido y barra de vida diferenciados.

## Referencias

- Biblia: **Fauna → La Serpiente de Tejido**, **Mitología → La Serpiente de Tejido, la Tentadora Sin Permiso**.
- `src/entities/Reformado.ts` (patrón de jefe), `src/scenes/SalasScene.ts` (arena y reja).
- `F4-07` (Mareas).

<!-- ==================== F4-15 ==================== -->
---
title: "[CRIATURA] Mondador: el limpiador sagrado"
labels: fase-4, zona-vientre-humedo, gameplay, narrativa, prioridad-alta
depende: F4-05, F4-06, F4-04
bloquea: F4-16, F4-22, F4-24, F4-37, F4-38
---

**Código:** `F4-15` · **GitHub:** #99 · **Prioridad:** alta · **Depende de:** F4-05, F4-06, F4-04 · **Bloquea:** F4-16, F4-22, F4-24, F4-37, F4-38

## Contexto

El Mondador es el corazón narrativo del nivel. La biblia lo describe como un felino omnívoro que come solo la carne que los dioses rechazaron; el culto lo considera sagrado y teme, sin saberlo, el día en que se extinga. Las Vestales lo cazan por su caparazón dorado. En el año 62 A.E. nació el último del Atrio y la especie quedó relegada a las Criptas y a los niveles bajos.

No es un enemigo. Es un animal sagrado por costumbre, y el jugador debe poder seguirlo, no matarlo.

## Qué se necesita

Una clase `Mondador` en `src/entities/Mondador.ts`:

- **Aspecto:** felino del tamaño de un guepardo; pelaje dorado y escaso; huesos en la espalda; dientes finos como bisturís. 32×24 px aproximados.
- **Ruta:** recorre una lista de puntos (`ruta: [x, y][]`) por la Galería de limpieza y el zarzal. Se detiene a comer en las `pila-carne`/residuos.
- **Estados:** `caminando`, `comiendo`, `huyendo`, `oculto`.
- **No hace daño al contacto** y **no se puede matar**. `recibirDano()` devuelve `false`; si el jugador insiste, el Mondador huye y se pierde el secreto de la ruta.
- **Seguirlo** durante un tramo revela un paso seguro entre la Zarza/Alfombra o una repisa con una reliquia. No es un NPC con diálogo: es un animal que conoce el terreno.
- **Huye de la Serpiente** y de los ataques; si huye, no bloquea la ruta principal.
- **Vestal cazadora opcional:** una Vestal en una repisa alta con una máscara de caparazón de Mondador. Es un enemigo existente; su presencia explica por qué la especie casi no existe. Si el jugador la derrota, no recupera al Mondador.
- **Catálogo:** `progreso.descubrir('mondador')` al verlo.
- **Inscripción/registro:** la ficha `F4-04` y la inscripción de `F4-39`.
- **Sonido:** paso de garras, ronroneo seco, mordida fina.

## Criterios de aceptación

- [ ] El Mondador no se puede matar ni herir.
- [ ] No hace daño por contacto.
- [ ] Su ruta no se atasca con la geometría ni con la Marea.
- [ ] Seguirlo lleva a un secreto alcanzable; no es obligatorio.
- [ ] Si huye, el nivel sigue siendo completable.
- [ ] Se cataloga al verlo y su ficha se abre en la web.
- [ ] La Vestal cazadora, si se incluye, no impide completar el nivel.
- [ ] No se usa el lenguaje de «los dioses miran» para describirlo.

## Referencias

- Biblia: **Fauna → El Mondador**, **Mitología → El Mondador, el limpiador del altar**, **Cronología** (año 62 A.E.).
- `src/entities/Devoto.ts` (patrón de movimiento), `src/entities/Enemigo.ts`.

<!-- ==================== F4-16 ==================== -->
---
title: "[CRIATURA] Buitre ritual y Cerdo de Protocolo"
labels: fase-4, zona-vientre-humedo, gameplay, narrativa, prioridad-media
depende: F4-05, F4-06
bloquea: F4-22, F4-24, F4-37
---

**Código:** `F4-16` · **GitHub:** #100 · **Prioridad:** media · **Depende de:** F4-05, F4-06 · **Bloquea:** F4-22, F4-24, F4-37

## Contexto

El Buitre de la Quietud es el heraldo del sacramento: si se posa sobre el altar-camilla, la ofrenda saldrá Reformada. El Cerdo de Protocolo desciende de los cerdos del primer diezmo y es carne de los linajes injertados. Los dos son especies de la biblia que faltan en el juego.

## Qué se necesita

### 1. Buitre ritual

- `Buitre` en `src/entities/Buitre.ts`.
- Se posa en un altar-camilla o en una viga de la Galería de limpieza. No ataca y no se puede matar.
- **Omen:** si el jugador reza en el Altar mientras el Buitre está posado, el Altar funciona normal; si el Buitre se va (porque la Marea va a subir), el Altar muestra un aviso de «ofrenda en duda» y la Marea está por llegar. No cambia el guardado; es una señal.
- Si el jugador lo espanta, vuela a otra percha y vuelve al cabo de un tiempo. No bloquea nada.
- Catálogo: `progreso.descubrir('buitre')`.
- Sonido: alas secas, clac de hueso.

### 2. Cerdo de Protocolo

- `Cerdo` en `src/entities/Cerdo.ts`.
- Vive en un corral pequeño de la Galería/Corral. Camina, come, gruñe; huye si el jugador se acerca rápido.
- No ataca. Se puede matar con el ataque; si muere, suelta carne que cura 2 (una sola vez) y el HUD avisa «propiedad del linaje». Es opcional; no hay penalización mecánica.
- Si no se mata, sigue vivo y ambienta el corral.
- Catálogo: `progreso.descubrir('cerdo')`.
- Sonido: gruñido, tubos burbujeando.

## Criterios de aceptación

- [ ] El Buitre no se puede matar y no bloquea el Altar.
- [ ] El omen del Buitre se entiende sin texto o con una línea breve.
- [ ] El Cerdo es pasivo y opcional; matarlo no rompe ninguna ruta.
- [ ] La carne del Cerdo no sustituye a los Altares ni rompe el balance.
- [ ] Ambos se catalogan y aparecen en el Registro web.
- [ ] No hay gore gratuito: el horror es institucional.

## Referencias

- Biblia: **Otras especies del Vientre → Buitre ritual, Cerdo de Protocolo**, **Mitología → El Buitre de la Quietud**.
- `src/scenes/EscenaNivel.ts` (Altares, `Ofrenda`).

<!-- ==================== F4-17 ==================== -->
---
title: "[CRIATURA] Cuervo de Ermita y Vena Trepadora"
labels: fase-4, zona-vientre-humedo, gameplay, prioridad-media
depende: F4-05, F4-06, F4-07
bloquea: F4-22, F4-23, F4-24, F4-37
---

**Código:** `F4-17` · **GitHub:** #101 · **Prioridad:** media · **Depende de:** F4-05, F4-06, F4-07 · **Bloquea:** F4-22, F4-23, F4-24, F4-37

## Contexto

El Cuervo de Ermita es mensajero y guía; la Vena Trepadora late con el Latido y las Vestales leen su pulso para anunciar un Hambre. Son las dos especies que convierten el nivel en un sitio que se puede leer, no solo recorrer.

## Qué se necesita

### 1. Cuervo de Ermita

- `Cuervo` en `src/entities/Cuervo.ts`.
- Vuela entre posaderos (`posaderos: [x, y][]`), grazna y se posa cerca de secretos o de la Serpiente.
- **Guía:** si el jugador lo sigue, lo lleva a una repisa con una reliquia o a la salida segura. No es obligatorio.
- **Aviso:** grazna más fuerte cuando la Serpiente está cerca o cuando la Marea va a subir.
- No se puede matar (o si se ataca, huye y desaparece; elegir una y documentarla).
- Catálogo: `progreso.descubrir('cuervo')`.
- Sonido: graznido con resonancia de cable.

### 2. Vena Trepadora

- `Vena` como peligro/decor interactivo.
- Crece en los muros y late al ritmo del Latido; su pulso cambia de color/intensidad con la fase de la Marea.
- **Compuerta temporal:** en el Pozo de las Mareas, una cortina de venas cubre un paso; se contrae durante el pico del Latido y deja pasar al jugador. Fuera de ese momento, bloquea.
- No hace daño si se toca; solo bloquea. Si el jugador insiste, no pasa.
- Catálogo: `progreso.descubrir('vena')`.
- Sonido: pulso húmedo, sincronizado con el Latido.

## Criterios de aceptación

- [ ] El Cuervo no es un enemigo y no bloquea el paso.
- [ ] Su guía lleva a un secreto alcanzable sin él; no es la única forma.
- [ ] La Vena se sincroniza con la Marea/Latido y el paso se entiende.
- [ ] La compuerta no deja al jugador atrapado si falla el timing.
- [ ] Ambas especies se catalogan y tienen ficha.
- [ ] El sonido no se convierte en spam.

## Referencias

- Biblia: **Otras especies → Cuervo de Ermita, Vena Trepadora**, **Condiciones físicas → Latido**.
- `src/scenes/EscenaNivel.ts` (`crearAtrezoLejano`, luces, decorado).

<!-- ==================== F4-18 ==================== -->
---
title: "[PELIGRO] Zarza Cosedora: barrera viva y púas de sutura"
labels: fase-4, zona-vientre-humedo, gameplay, prioridad-media
depende: F4-05, F4-06
bloquea: F4-21, F4-23, F4-37
---

**Código:** `F4-18` · **GitHub:** #102 · **Prioridad:** media · **Depende de:** F4-05, F4-06 · **Bloquea:** F4-21, F4-23, F4-37

## Contexto

La Zarza Cosedora es una trepadora de púas ganchudas que clava a lo que la roza, absorbe sus fluidos y deja secar el cuerpo. Las Vestales la dejan crecer como muralla; los suturadores usan sus púas como agujas; los Remedos se esconden entre ellas. Es la barrera natural del nivel.

## Qué se necesita

- `Zarza` en `src/entities/Zarza.ts` o como peligro estático.
- **Bloquea** un paso con una cortina de tallos; el jugador no puede atravesarla caminando.
- **Contacto:** 1 de daño y una animación de enganche breve; no retiene al jugador más de ~0,3 s para no ser injusta.
- **Corte:** se puede atacar; cada segmento tiene 2-3 de vida; al cortarlo, la zarza sangra y se abre el paso. No vuelve a crecer en la partida.
- **Refugio:** un Remedo escondido entre las púas; al cortar la zarza, sale.
- **Recompensa:** una púa de sutura (lore/Registro) o +1 Fervor; no crear un inventario nuevo.
- **Muralla opcional:** una segunda zarza protege un secreto; se puede cortar o rodear con el puente de tejido.
- Catálogo: `progreso.descubrir('zarza')`.
- Sonido: roce de púas, corte, savia.

## Criterios de aceptación

- [ ] La zarza bloquea de verdad y se puede cortar.
- [ ] El daño por contacto es breve y no encadena sin escape.
- [ ] No hay soft lock si el jugador no encuentra el punto de corte.
- [ ] El Remedo escondido no aparece si la zarza no se corta.
- [ ] La zarza no flota ni se sale de la plataforma.
- [ ] Se cataloga y tiene ficha.

## Referencias

- Biblia: **Flora → La Zarza Cosedora**, **Glosario → Coserse**.
- `src/scenes/EscenaNivel.ts` (geometría, decorado), `src/entities/Enemigo.ts`.

<!-- ==================== F4-19 ==================== -->
---
title: "[PELIGRO] Alfombra Devota: la trampa que parece liturgia"
labels: fase-4, zona-vientre-humedo, gameplay, accesibilidad, prioridad-alta
depende: F4-05, F4-06
bloquea: F4-21, F4-23, F4-37, F4-38
---

**Código:** `F4-19` · **GitHub:** #103 · **Prioridad:** alta · **Depende de:** F4-05, F4-06 · **Bloquea:** F4-21, F4-23, F4-37, F4-38

## Contexto

La Alfombra Devota es un tapiz vegetal de filamentos cortos y suaves, del color de las alfombras litúrgicas. No se mueve hasta que algo la pisa: entonces se eriza, se cierra sobre la extremidad y digiere despacio. Las Vestales la cultivan frente a puertas vedadas; el pueblo aprendió a no pisar alfombra y los tanteadores golpean el suelo antes de cruzar. Es una trampa de emboscada y una regla cultural al mismo tiempo.

## Qué se necesita

- `Alfombra` como peligro estático (`criaturas` tipo `'alfombra'`).
- **Aspecto calmado:** idéntico a una alfombra litúrgica (color vino, fleco, trama). **Aspecto activo:** filamentos erizados, animación de cierre.
- **Tell:** no depender solo del color. Usar:
  - Animación sutil de respiración cuando el jugador está cerca.
  - Sonido de filamentos.
  - Ausencia de fleco real o un borde húmedo.
  - Un texto de inscripción y el Tanteador (`F4-03`) que lo explica.
- **Al pisar:** el jugador queda atrapado; recibe 1 de daño cada ~1,2 s; puede salir con dash, salto o atacando los filamentos (2 golpes). No matar instantáneamente.
- **Recorrido:** se puede cruzar saltando o con dash; no es obligatorio pisarla.
- **Accesibilidad:** el tell debe funcionar sin distinguir rojo/verde; el sonido y la animación son la pista principal.
- **Puertas vedadas:** una alfombra frente a una puerta lateral; el jugador puede rodearla o cortarla.
- Catálogo: `progreso.descubrir('alfombra')`.
- Sonido: susurro de filamentos, chasquido al cerrarse.

## Criterios de aceptación

- [ ] La alfombra viva se distingue de la decorativa por animación/sonido, no solo por color.
- [ ] Al pisarla, el jugador puede escapar con dash, salto o ataque.
- [ ] No hay daño inevitable ni muerte instantánea.
- [ ] La inscripción y el Tanteador explican la regla sin un tutorial modal.
- [ ] La trampa no bloquea la ruta principal de forma injusta.
- [ ] Se cataloga y tiene ficha.
- [ ] Cumple la revisión de accesibilidad (`F4-38`).

## Referencias

- Biblia: **Flora → La Alfombra Devota**, **Profesiones → Tanteadores**, **Cultura → tabú de la alfombra**.
- `docs/issues/03-guia-estilo-paleta.md` (contraste y paleta).

<!-- ==================== F4-20 ==================== -->
---
title: "[CRIATURA] Mata de Retazos: cosecha con riesgo"
labels: fase-4, zona-vientre-humedo, gameplay, narrativa, prioridad-media
depende: F4-05, F4-06, F4-04
bloquea: F4-21, F4-23, F4-37
---

**Código:** `F4-20` · **GitHub:** #104 · **Prioridad:** media · **Depende de:** F4-05, F4-06, F4-04 · **Bloquea:** F4-21, F4-23, F4-37

## Contexto

La Mata de Retazos es un arbusto bajo de ramas carnosas y frutos que son partes humanas: manos, dedos, orejas, labios. Echa raíces junto a los desagües y absorbe el tejido que el sacramento rechazó. Los Remedos se esconden entre sus frutos y se llevan sus semillas. Los pobres la comen; las Vestales la toleran solo para ofrendas menores. Es alimento y «diezmo vegetal», no un monstruo.

## Qué se necesita

- `Mata` como criatura interactiva (`criaturas` tipo `'mata'`).
- **Cosecha:** cerca de un fruto, `E  cosechar`. Resultados:
  - 60-70%: fruto comestible, cura 1 de vida.
  - 20-30%: fruto amargo, no cura; el arbusto se estremece.
  - 10%: un Remedo estaba escondido y muerde (1 de daño) o huye.
- **Tell:** los frutos se contraen al tocarlos; las manos se cierran por reflejo; algunas palmas tienen líneas que recuerdan a alguien. No es gore gratuito: es inquietante y triste.
- **Límite:** 2-3 frutos por mata; no es una fuente infinita de curación.
- **Secreto:** una de las matas esconde un fragmento o una reliquia entre las raíces; se descubre al cosechar o al cortar la mata (decisión del nivel).
- **No ataca** y no bloquea el paso; puede podarse para abrir un hueco.
- Catálogo: `progreso.descubrir('mata')`.
- Sonido: contracción húmeda, fruto que se desprende.

## Criterios de aceptación

- [ ] La cosecha es clara y no requiere un menú.
- [ ] El riesgo del Remedo se entiende y no es injusto.
- [ ] La curación no sustituye a los Altares ni rompe el balance.
- [ ] Los frutos se leen como partes humanas sin caer en gore explícito.
- [ ] La mata no bloquea la ruta principal.
- [ ] Se cataloga y tiene ficha.

## Referencias

- Biblia: **Flora → La Mata de Retazos**, **Clases sociales y alimentación** (casas deudoras), **Ayunantes**.
- `src/objetos/Ofrenda.ts` (curación), `src/scenes/EscenaNivel.ts` (interacción `E`).

<!-- ==================== F4-21 ==================== -->
---
title: "[ARTE] Tileset y decals del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, arte, prioridad-alta
depende: F4-01, F4-05
bloquea: F4-05, F4-23, F4-36
---

**Código:** `F4-21` · **GitHub:** #105 · **Prioridad:** alta · **Depende de:** F4-01, F4-05 · **Bloquea:** F4-05, F4-23, F4-36

## Contexto

El nivel necesita una sillería que se lea como el mismo Vientre, pero más húmeda y orgánica. La regla de la biblia es clara: no es piedra nueva, es la misma piedra con carne, raíces, agua y membranas encima. No se debe reescalar pixel art ni generar arte con IA.

## Qué se necesita

Un set de tiles y decals para construir la geometría y el ambiente del Vientre Húmedo.

**Contenido mínimo:**

- Muro/sillería mojada: variantes limpia, con grieta, con vena, con musgo, con membrana.
- Suelo/plataforma: superficie, relleno, esquinas; charcos y juntas.
- Raíces colgantes y raíces que cruzan el suelo.
- Membranas/tejido que cubren boquetes.
- Hongo de Lámpara (patches de 16×16 y 32×16).
- Alfombra Devota calmada y activa (tileable).
- Zarza Cosedora (segmentos y puntas).
- Mata de Retazos (arbusto, frutos, estados).
- Vena Trepadora (tileable vertical, frames de pulso).
- Nido/ducto de la Serpiente (boca de ducto, huevo/saco si aplica).

## Especificaciones técnicas

| Parámetro | Valor |
| --- | --- |
| Tamaño de tile | **16 × 16 px** |
| Formato fuente | `.aseprite` con capas separadas |
| Formato entrega | `.png` con alfa, PNG-8 o PNG-24 |
| Organización | Rejilla sin padding ni spacing |
| Paleta | Coherente con `docs/arte/piezas/` y la guía de estilo; máximo 32 colores por set |
| Destino | `docs/arte/piezas/` para el origen y `public/assets/tilesets/` para el juego |
| Nombres | `vientre-humedo.png`, `vientre-humedo-grietas.png`, `vientre-humedo-musgo.png`, `vientre-humedo-venas.png` |

**Importante:** las grietas, el musgo, las venas y las membranas van en hojas aparte, no horneadas en el tile que se repite; si no, reaparecen cada 16 px y la pared se lee como papel pintado. La siembra debe ser reproducible por hash, como en las otras zonas.

## Criterios de aceptación

- [ ] El PNG se importa en Tiled con rejilla de 16×16 sin desalineación.
- [ ] Los bordes de plataforma se leen y el jugador sabe dónde agarrarse.
- [ ] La sillería se reconoce como la misma del Vientre, solo más húmeda.
- [ ] Las grietas y el musgo van sueltos y se siembran sin patrón visible.
- [ ] La paleta no introduce colores fuera de la guía.
- [ ] Se entrega el `.aseprite` fuente además del PNG.
- [ ] Sin IA: pixel art hecho a mano.

## Referencias

- `docs/DESARROLLO.md` → «La sillería del Vientre».
- `docs/issues/01-tileset-atrio.md`, `docs/issues/03-guia-estilo-paleta.md`.
- Biblia: **Condiciones físicas**, **Flora**, **Otras especies**.

<!-- ==================== F4-22 ==================== -->
---
title: "[ARTE] Sprites de fauna del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, arte, prioridad-alta
depende: F4-04, F4-13, F4-14, F4-15, F4-16, F4-17
bloquea: F4-25, F4-31, F4-36
---

**Código:** `F4-22` · **GitHub:** #106 · **Prioridad:** alta · **Depende de:** F4-04, F4-13…F4-17 · **Bloquea:** F4-25, F4-31, F4-36

## Contexto

Las seis especies de fauna necesitan sprites legibles a 480×320 y animaciones que las distingan. La lámina del Registro web es el mismo sprite del juego, así que este arte sirve para las dos cosas.

## Qué se necesita

| Especie | Tamaño sugerido | Animaciones mínimas | Notas de diseño |
| --- | --- | --- | --- |
| **Mondador** | 32×24 | idle, caminar, comer, huir | Felino dorado y escaso; huesos en la espalda; dientes finos; sagrado, no monstruoso. |
| **Remedo** | 10×10 | oculto (objeto), temblor, morder, huir | Bicho blando; piel de pigmentos cambiantes; no dibujar 20 imitaciones: una base + tinte/overlay. |
| **Serpiente de Tejido** | 48×24 (cabeza 16×16) | acecho, embestida, boca abierta, aturdida, muerte | Sin esqueleto; escamas duras; boca que se abre más de lo posible; sin ojos de dios. |
| **Buitre ritual** | 16×20 | posado, volar, clac | Músculo expuesto y ornamento de catedral; no gore gratuito. |
| **Cerdo de Protocolo** | 20×14 | idle, caminar, comer, huir, muerte | Tubos e injertos; descendiente de los cerdos del primer diezmo. |
| **Cuervo de Ermita** | 12×10 | posado, volar, graznar | Alas de carne y plumas trenzadas con cable; heraldo del culto. |

## Especificaciones técnicas

- Pixel art a mano en Aseprite, sin IA.
- Fondo transparente, PNG-8/24.
- Una hoja por especie, con frames del mismo tamaño y sin padding.
- Paleta de la biblia: carne, sangre, oro litúrgico, hueso, óxido, cable.
- Nombres de textura para el juego: `mondador-placeholder`, `remedo-placeholder`, etc. (mientras sean provisionales); cuando llegue el arte final, se cargan en `PreloadScene` con la misma clave sin `-placeholder`.
- Para la web, `scripts/exportar-arte.mjs` lee `ArteProvisional.ts`; si el arte final reemplaza las figuras, la web debe seguir recibiendo una lámina (ver `F4-31`).

## Criterios de aceptación

- [ ] Cada especie se reconoce por silueta a 1×.
- [ ] Las animaciones cubren los estados que pide el gameplay.
- [ ] El Mondador no parece un enemigo genérico: se lee como animal sagrado.
- [ ] La Serpiente no parece un dragón ni un Primigenio.
- [ ] No hay ojos robados ni guiños visuales a los dioses.
- [ ] Se entrega `.aseprite` y PNG.
- [ ] `npm run verificar-arte` sigue pasando.

## Referencias

- Biblia: **Fauna**, **Otras especies**, **Mitología**.
- `docs/issues/02-sprite-cirujano.md` (formato de encargo).
- `src/systems/ArteProvisional.ts`, `scripts/exportar-arte.mjs`.

<!-- ==================== F4-23 ==================== -->
---
title: "[ARTE] Sprites de flora y peligros del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, arte, prioridad-media
depende: F4-04, F4-12, F4-18, F4-19, F4-20
bloquea: F4-25, F4-31, F4-36
---

**Código:** `F4-23` · **GitHub:** #107 · **Prioridad:** media · **Depende de:** F4-04, F4-12, F4-18…F4-20 · **Bloquea:** F4-25, F4-31, F4-36

## Contexto

La flora del Vientre Húmedo es el escenario que ataca. Necesita sprites tileables y estados legibles, sobre todo la Alfombra Devota, que debe parecer una alfombra litúrgica hasta que se mueve.

## Qué se necesita

| Especie | Formato | Estados | Notas |
| --- | --- | --- | --- |
| **Zarza Cosedora** | Segmentos 16×16 y puntas | calmada, enganchando, cortada | Tallos oscuros, púas ganchudas; al cortar, savia. |
| **Mata de Retazos** | 32×24 | calmada, fruto tocado, cosechada | Frutos que son manos/dedos/orejas/labios; contracción al tocar. |
| **Alfombra Devota** | Tileable 16×16 | calmada, erizada, atrapando, cortada | Debe confundirse con una alfombra real en estado calmado. |
| **Vena Trepadora** | Tileable vertical 16×16 | pulso bajo, pulso alto | Late con el Latido; frames sincronizados. |
| **Hongo de Lámpara** | 16×16 y 32×16 | encendido, apagado/cosechado | Bioluminiscencia; luz que no debe nada a los dioses. |

## Especificaciones técnicas

- Pixel art a mano, sin IA.
- Tileable sin costuras; los estados deben encajar en la misma rejilla.
- La Alfombra calmada debe tener el mismo lenguaje visual que las alfombras del culto; la activa debe usar animación, no solo cambio de color.
- Paleta coherente con la guía; la bioluminiscencia puede usar un acento frío/verdoso.
- Nombres de textura: `zarza-placeholder`, `mata-placeholder`, `alfombra-placeholder`, `vena-placeholder`, `hongo-placeholder`.
- Para la web, la lámina del Registro usa el sprite calmado.

## Criterios de aceptación

- [ ] La Alfombra calmada se confunde con una alfombra real; la activa se distingue por animación/sonido.
- [ ] La Zarza se puede cortar en segmentos sin costuras.
- [ ] La Mata se lee como parte humana sin gore explícito.
- [ ] La Vena se puede sincronizar con el Latido.
- [ ] El Hongo ilumina sin quemar la escena.
- [ ] Se entrega `.aseprite` y PNG.
- [ ] `npm run verificar-arte` sigue pasando.

## Referencias

- Biblia: **Flora**, **Otras especies → Vena Trepadora, Hongo de Lámpara**.
- `docs/issues/03-guia-estilo-paleta.md`.

<!-- ==================== F4-24 ==================== -->
---
title: "[AUDIO] SFX y música del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, audio, prioridad-media
depende: F4-13, F4-14, F4-15, F4-16, F4-17, F4-18, F4-19, F4-20
bloquea: F4-37, F4-38
---

**Código:** `F4-24` · **GitHub:** #108 · **Prioridad:** media · **Depende de:** F4-13…F4-20 · **Bloquea:** F4-37, F4-38

## Contexto

El audio del proyecto se sintetiza en tiempo real con la Web Audio API (`src/systems/Sonido.ts`) y la música es CC0 (`src/systems/Musica.ts`). El Vientre Húmedo necesita sonar distinto: más húmedo, más lento, con el Latido y la lluvia como reloj.

## Qué se necesita

### 1. Efectos sintetizados

Ampliar `ClaseEnemigo` y `Sonido.ts` con recetas para:

- **Remedo:** tick húmedo, mordida pequeña, huida.
- **Serpiente:** silbido grave, roce de escamas, embestida, boca que se abre, tragar, aturdida, muerte.
- **Mondador:** garras en la piedra, ronroneo seco, mordida fina, huida.
- **Buitre:** alas secas, clac de hueso.
- **Cerdo:** gruñido, tubos burbujeando.
- **Cuervo:** graznido con resonancia de cable.
- **Zarza:** roce de púas, corte, savia.
- **Alfombra:** susurro de filamentos, chasquido al cerrarse.
- **Mata:** contracción húmeda, fruto al desprenderse.
- **Vena:** pulso húmedo sincronizado con el Latido.
- **Hongo:** pop suave, esporas.
- **Marea:** retumbe lejano, subida de agua, bajada.
- **Lluvia Tibia:** gotas y charcos, en bucle suave.

Reglas: cada clase de enemigo suena a su materia; el parry sigue siendo lo único metálico y limpio; no usar samples con licencias dudosas.

### 2. Música

- Añadir una pista para `VientreHumedo` en `src/systems/Musica.ts` (`Pista`, `PISTAS`, `musica.poner`).
- Opcional: una pista para la Serpiente que entre al empezar la pelea y vuelva a la de la zona al vencerla, como el jefe.
- Pista CC0 de OpenGameArt; documentar autoría, título y enlace en `public/assets/audio/musica/LICENCIAS.md`.
- Formatos `.ogg` y `.mp3` (Safari no lee Ogg).
- `VITE_SIN_AUDIO=1` debe seguir funcionando.

## Criterios de aceptación

- [ ] Cada criatura y peligro tiene un sonido distinto y reconocible.
- [ ] La lluvia y el Latido no se convierten en ruido constante insoportable.
- [ ] La Marea avisa con sonido antes de subir.
- [ ] La música cambia con la zona y con la pelea de la Serpiente.
- [ ] Las licencias están documentadas.
- [ ] El botón de silencio y la pausa siguen funcionando.
- [ ] No hay clipping ni bucles mal cortados.

## Referencias

- `docs/DESARROLLO.md` → «Audio».
- `public/assets/audio/musica/LICENCIAS.md`.
- `src/systems/Sonido.ts`, `src/systems/Musica.ts`.

<!-- ==================== F4-25 ==================== -->
---
title: "[WEB] Registro: familias fauna y flora del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, web, narrativa, prioridad-alta
depende: F4-04, F4-10, F4-22, F4-23
bloquea: F4-30, F4-31
---

**Código:** `F4-25` · **GitHub:** #109 · **Prioridad:** alta · **Depende de:** F4-04, F4-10, F4-22, F4-23 · **Bloquea:** F4-30, F4-31

## Contexto

El Registro web es la sección donde el visitante ve las fichas con su lámina. Hoy solo tiene `fieles`, `oficio` y `aparato`. Las once especies nuevas deben aparecer ahí, con silueta si no se han descubierto y con lámina y texto si sí.

## Qué se necesita

1. En `web/src/paginas/registro.ts`:
   - Añadir `fauna` y `flora` al array `FAMILIAS` con títulos y notas en la voz del Registro.
   - Ordenar las familias: fieles, oficio, fauna, flora, aparato (o el orden que decida el equipo; debe ser estable).
   - Las tarjetas ya se generan recorriendo `REGISTRO`; comprobar que las nuevas fichas se pintan.
   - La lámina usa `ficha.textura`; si no existe la figura, mostrar un placeholder de silueta y no romper la página.
2. Notas de cada familia:
   - **Fauna:** «Especies que comen de lo que el Sacramento rechaza. No se alimentan a mano.»
   - **Flora:** «Vegetación de residuo. Se tolera mientras no invada una sala de turno.»
3. El contador del expediente debe usar `REGISTRO.length`, no un número fijo.
4. La ficha cerrada debe seguir mostrando «Pendiente de habilitar» y la pista de hallazgo.
5. Comprobar el layout en móvil y escritorio; las tarjetas nuevas no deben romper la rejilla.

## Criterios de aceptación

- [ ] El Registro muestra las familias FAUNA y FLORA con sus fichas.
- [ ] Las fichas no descubiertas salen como silueta y sin texto.
- [ ] Al descubrirlas en el juego, se abren en la web (misma clave de `localStorage`).
- [ ] El contador de fichas es correcto y dinámico.
- [ ] La sección es legible en móvil.
- [ ] No se duplican ids ni se rompe el orden.

## Referencias

- `web/src/paginas/registro.ts`, `src/lore/Registro.ts`, `web/src/arte.ts`.
- `docs/DESARROLLO.md` → «La web de la Diócesis».

<!-- ==================== F4-26 ==================== -->
---
title: "[WEB] Linaje: la frontera porosa y las especies del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, web, narrativa, prioridad-media
depende: F4-01, F4-04
bloquea: F4-30, F4-37
---

**Código:** `F4-26` · **GitHub:** #110 · **Prioridad:** media · **Depende de:** F4-01, F4-04 · **Bloquea:** F4-30, F4-37

## Contexto

El Linaje cuenta de dónde viene cada cosa. La biblia dice que el vector de Genesis Vestal se filtró a los desagües y volvió porosa la frontera entre especies: de ahí salen el Mondador, la Serpiente, los Remedos y las plantas. Es una rama del mismo tronco, no un bestiario aparte.

## Qué se necesita

1. **`src/lore/Linaje.ts`** (juego): añadir una rama «La frontera porosa» o «Las especies del Vientre Húmedo», con `viene: 'de Genesis Vestal'` y una descripción de 3 líneas que nombre el vector, los desagües y las especies. Se abre al descubrir `mondador` o al pisar `VientreHumedo`.
2. **`web/src/paginas/linaje.ts`**:
   - Añadir el nodo `frontera` con `tipo: 'margen'` o `'origen'`, `nivel` y `x` que no pisen los existentes.
   - Añadir aristas: `genesis → frontera` («el vector se filtró»), `frontera → diezmado` («de ahí sale el limpiador»), `frontera → reformado` («la carne que no se completa también sirve»).
   - Renombrar «El Diezmado» a «El Mondador» o mantener el alias en la descripción, para que el visitante relacione el nombre del juego con el de la biblia.
   - La ficha del nodo debe nombrar las especies sin listar las once: «Mondador, Serpiente, Remedos, Zarzas, Matas, Alfombras…».
3. **`src/ui/CodiceScene.ts`**: la página LINAJE se genera desde `LINAJE`; comprobar que la nueva rama aparece y no desborda.

## Criterios de aceptación

- [ ] La rama nueva aparece en el Linaje del juego y del portal.
- [ ] No se pisan nodos ni aristas.
- [ ] La ficha explica la frontera porosa y su origen.
- [ ] El Mondador queda relacionado con Genesis Vestal y con los Reformados.
- [ ] La rama se abre con el descubrimiento de la zona o del Mondador.
- [ ] El diagrama sigue siendo navegable en móvil.

## Referencias

- Biblia: **Ley alterada: la frontera entre especies es porosa**, **Árbol de pueblos y dioses**.
- `src/lore/Linaje.ts`, `web/src/paginas/linaje.ts`, `src/ui/CodiceScene.ts`.

<!-- ==================== F4-27 ==================== -->
---
title: "[WEB] Portada y navegación del portal: dos niveles"
labels: fase-4, zona-vientre-humedo, web, prioridad-media
depende: F4-09, F4-10, F4-25
bloquea: F4-30, F4-37
---

**Código:** `F4-27` · **GitHub:** #111 · **Prioridad:** media · **Depende de:** F4-09, F4-10, F4-25 · **Bloquea:** F4-30, F4-37

## Contexto

La portada es la fachada institucional. Debe reflejar que el juego tiene dos niveles —el Nivel 1, El Sacramento, y el Nivel 2, El Vientre Húmedo, la escapatoria— sin dejar de parecer la web de una diócesis. No se añade una sección nueva: el material nuevo aparece donde corresponde. La Diócesis no publicaría una fuga: la portada puede hablar del descenso y del Vientre Húmedo, pero no debe anunciar que el Cirujano huye con la niña.

## Qué se necesita

1. Añadir una tarjeta o lámina del **Vientre Húmedo** en la rejilla de consulta:
   - Título: «El Vientre Húmedo» o «Bestiario».
   - Lámina: `mondador` (o `serpiente`).
   - Enlace: `#/registro` o `#/vientre`.
   - Texto en la voz del portal: «Especies de residuo. No se alimentan a mano. No se espantan.»
2. Actualizar la tarjeta «El Vientre»: «Las dos inferiores no admiten visitas» → «La capa VI es el templo; se ve su puerta al final del Nivel 2».
3. Los contadores del expediente deben usar los totales reales (`F4-10`).
4. Actualizar la descripción de `web/index.html` si menciona las secciones o el número de capas.
5. No cambiar la escena de la portada (sigue siendo el Atrio). Si se quiere un guiño, usar una lámina, no meter un Mondador en el Atrio: la cronología dice que la especie ya no cría arriba.

## Criterios de aceptación

- [ ] La portada muestra el Vientre Húmedo/Bestiario con lámina.
- [ ] La tarjeta enlaza a una sección existente y funciona.
- [ ] Los contadores son correctos.
- [ ] El texto suena a institución, no a narrador.
- [ ] No se muestra un Mondador en el Atrio.
- [ ] La rejilla sigue viéndose bien en móvil.

## Referencias

- `web/src/paginas/portada.ts`, `web/index.html`.
- `docs/DESARROLLO.md` → «La web de la Diócesis».

<!-- ==================== F4-28 ==================== -->
---
title: "[WEB] Doctrina: diez folios, índices y manuales nuevos"
labels: fase-4, zona-vientre-humedo, web, narrativa, prioridad-alta
depende: F4-02, F4-10
bloquea: F4-30, F4-37
---

**Código:** `F4-28` · **GitHub:** #112 · **Prioridad:** alta · **Depende de:** F4-02, F4-10 · **Bloquea:** F4-30, F4-37

## Contexto

La web de Doctrina presenta el Códice como un libro que se hojea. Con 10 folios, el libro y sus textos deben actualizarse para no mentir: hoy dice «ocho hojas» y la lista de romanos se corta en VIII.

## Qué se necesita

1. `web/src/paginas/doctrina.ts`:
   - La lista de romanos debe cubrir 10 (o generarse desde `CODICE.length`).
   - «ocho hojas», «las ocho hojas» y cualquier texto fijo → valor dinámico (`CODICE.length`).
   - Añadir las entradas de `MANUAL` para `codice-09` y `codice-10` (ver `F4-02`).
   - Comprobar que `montarLibro` maneja 10 folios: las cintas de navegación no deben desbordar; si hacen falta dos filas o un scroll horizontal, implementarlo.
   - El índice de folios (ver `F4-30`) debe listar los 10.
2. `web/src/libro.ts`: revisar el cálculo de `cuenta`, las cintas y los botones con 10 elementos.
3. `web/src/paginas/portada.ts`: cualquier «ocho folios» debe pasar a dinámico.
4. `README.md` y `docs/DESARROLLO.md`: actualizar el número de hojas.

## Criterios de aceptación

- [ ] La Doctrina muestra 10 folios navegables.
- [ ] Las cintas/índice no se desbordan en escritorio ni en móvil.
- [ ] Los manuales nuevos aparecen al abrir el margen.
- [ ] Los textos no dicen «ocho».
- [ ] La Vigilia sigue funcionando con el folio nuevo.
- [ ] `prefers-reduced-motion` sigue respetándose.

## Referencias

- `web/src/paginas/doctrina.ts`, `web/src/libro.ts`, `src/lore/Codice.ts`.

<!-- ==================== F4-29 ==================== -->
---
title: "[WEB] Minijuegos: el Remedo en El Sacramento y nuevas preguntas del Examen"
labels: fase-4, zona-vientre-humedo, web, gameplay, prioridad-media
depende: F4-04, F4-13
bloquea: F4-30, F4-37
---

**Código:** `F4-29` · **GitHub:** #113 · **Prioridad:** media · **Depende de:** F4-04, F4-13 · **Bloquea:** F4-30, F4-37

## Contexto

Los dos minijuegos del portal son del bible y ya existen. El Vientre Húmedo puede aparecer en ellos sin inventar otro: un Remedo entre el instrumental de El Sacramento y dos preguntas del Examen que el Registro no debería saber.

## Qué se necesita

### 1. El Sacramento (`web/src/paginas/sacramento.ts`)

- Añadir un paso `'revisar'` después de `'pesar'` (o antes de `'incidir'`):
  - En la bandeja hay tres instrumentos; uno está «tibio» y es un Remedo.
  - El jugador debe pulsar el instrumento tibio para apartarlo; si elige uno frío, el Remedo muerde y el paso falla.
  - El texto del paso: «Un bisturí tibio es un Remedo. Apártelo antes de cortar.»
  - Actualizar el texto «Seis pasos» → «Siete pasos» y la lista `PASOS`, `mensajes` y el dibujo.
  - No hace falta arte nuevo: usar `bisturi`/`injerto`/`bandeja` existentes o una forma simple.
- El fallo debe dejar la mancha del portal como los demás.

### 2. El Examen de Pureza (`web/src/paginas/examen.ts`)

- Añadir 2 preguntas (de 10 a 12) con opciones que sumen a los perfiles existentes:
  - «Encuentra un bisturí tibio sobre la bandeja. ¿Qué hace?» → opciones: usarlo / apartarlo y devolverlo al altar / probarlo en el ofendado / anotar la temperatura.
  - «¿Cuántos Mondadores quedan en el Vientre?» → opciones: los que el Registro diga / ninguno / los suficientes / no es asunto del fiel.
- Las preguntas no deben spoilear el nivel más allá de lo que la biblia publica.
- Actualizar `ROMANOS` si no llega a XII y el texto «Diez preguntas» → «Doce preguntas».
- Los veredictos y el cálculo de perfiles deben seguir funcionando.

## Criterios de aceptación

- [ ] El Sacramento tiene un paso de Remedo y se puede completar/fail como los demás.
- [ ] El Examen tiene 12 preguntas y el veredicto sigue funcionando.
- [ ] Los textos nuevos están en la voz del trámite, no en la del narrador.
- [ ] Funciona en móvil y con teclado.
- [ ] No se rompe la mancha ni el expediente.
- [ ] No se spoilea el final ni la niña.

## Referencias

- `web/src/paginas/sacramento.ts`, `web/src/paginas/examen.ts`.
- Biblia: **Fauna → Remedo**, **El Sacramento**, **El Examen de Pureza**.

<!-- ==================== F4-30 ==================== -->
---
title: "[WEB] Índice funcional del Códice y del Registro en el portal"
labels: fase-4, zona-vientre-humedo, web, indice, prioridad-alta
depende: F4-25, F4-27, F4-28
bloquea: F4-37, F4-38
---

**Código:** `F4-30` · **GitHub:** #114 · **Prioridad:** alta · **Depende de:** F4-25, F4-27, F4-28 · **Bloquea:** F4-37, F4-38

## Contexto

La web tiene cintas de folios y una navegación por secciones, pero no un **índice funcional** que permita ir a un folio o a una ficha concreta. Con 10 folios y 25 fichas, el visitante necesita un índice de verdad, no solo pasar páginas.

## Qué se necesita

### 1. Índice del Códice

- En `web/src/paginas/doctrina.ts`, antes del libro, añadir un bloque «Índice» con:
  - Cita, título y número romano de cada folio.
  - Un botón/enlace por folio que salte a esa doble página.
  - Estado `aria-current` en el folio activo.
  - Los folios no ganados pueden aparecer como «Margen no disponible» pero deben ser navegables (la escritura es pública; el margen no).
- `web/src/libro.ts` necesita una API para saltar a un folio (`irA(i)` o un evento), no solo `data-paso` y `data-folio`.

### 2. Índice del Registro

- En `web/src/paginas/registro.ts`, añadir un índice por familia al principio:
  - Fieles, oficio, fauna, flora, aparato.
  - Enlaces a las secciones y, si se quiere, a cada ficha.
  - Un contador de fichas habilitadas/total.
- La búsqueda no es necesaria; un índice claro y accesible sí.

### 3. Índice en el juego (`src/ui/CodiceScene.ts`)

- La página del Códice ya tiene un índice de fragmentos; comprobar que los 10 aparecen con su cita y que se puede navegar con las flechas.
- La página del Registro ya agrupa por familias; comprobar que FAUNA y FLORA aparecen.

## Criterios de aceptación

- [ ] El índice del Códice lista los 10 folios y salta a cada uno.
- [ ] El índice del Registro lista las 5 familias y lleva a sus secciones.
- [ ] Funciona con teclado, ratón y táctil.
- [ ] El foco y `aria-current` son correctos.
- [ ] No se rompe con `prefers-reduced-motion`.
- [ ] El índice no duplica el texto del folio: solo cita, título y número.
- [ ] Es legible en móvil.

## Referencias

- `web/src/paginas/doctrina.ts`, `web/src/libro.ts`, `web/src/paginas/registro.ts`.
- `src/ui/CodiceScene.ts`.
- `F4-32` (índice equivalente en la biblia DOCX).

<!-- ==================== F4-31 ==================== -->
---
title: "[WEB] Exportar las nuevas figuras a la web"
labels: fase-4, zona-vientre-humedo, web, arte, prioridad-media
depende: F4-22, F4-23, F4-25
bloquea: F4-36, F4-37
---

**Código:** `F4-31` · **GitHub:** #115 · **Prioridad:** media · **Depende de:** F4-22, F4-23, F4-25 · **Bloquea:** F4-36, F4-37

## Contexto

La web no dibuja sprites propios: `scripts/exportar-arte.mjs` lee las figuras de `src/systems/ArteProvisional.ts` y escribe `web/generado/arte.json`. Las fichas del Registro usan exactamente el sprite del juego. Si las figuras nuevas no entran en ese mapa, la web mostrará huecos.

## Qué se necesita

1. Añadir a `src/systems/ArteProvisional.ts` las figuras provisionales de:
   - Fauna: `mondador`, `remedo`, `serpiente`, `buitre`, `cerdo`, `cuervo`.
   - Flora/peligros: `zarza`, `mata`, `alfombra`, `vena`, `hongo`.
   - NPCs: reutilizar `devoto-b`/`vestal` o crear `tanteador`/`honguera`.
   - Decorado nuevo: `membrana`, `raiz`, `nido`, `charco-vivo` si se usan.
2. Añadir las claves al mapa `FIGURAS` con el sufijo `-placeholder` (el generador lo añade solo).
3. Ejecutar `npm run exportar-arte` y comprobar que `web/generado/arte.json` contiene las claves.
4. Comprobar que `web/src/arte.ts` encuentra las figuras y que `pintarFigura` no devuelve `false`.
5. Si el arte final reemplaza los placeholders, cargar los PNG en `PreloadScene` con las mismas claves y borrar la figura provisional; la web debe seguir recibiendo la lámina. Documentar el paso.

## Criterios de aceptación

- [ ] `npm run exportar-arte` incluye todas las figuras nuevas.
- [ ] Las tarjetas del Registro pintan la lámina, no un hueco.
- [ ] Las siluetas de fichas no descubiertas se pintan con el color de silueta.
- [ ] `npm run verificar-arte` pasa (filas rectangulares).
- [ ] No se rompe ninguna figura existente.
- [ ] La web no importa Phaser ni código del juego que dependa del navegador.

## Referencias

- `scripts/exportar-arte.mjs`, `web/src/arte.ts`, `src/systems/ArteProvisional.ts`.
- `docs/DESARROLLO.md` → «Las láminas».

<!-- ==================== F4-32 ==================== -->
---
title: "[DOCS] Índice funcional de la biblia del mundo (Drive)"
labels: fase-4, documentacion, indice, prioridad-alta
depende: F4-01
bloquea: F4-35
---

**Código:** `F4-32` · **GitHub:** #116 · **Prioridad:** alta · **Depende de:** F4-01 · **Bloquea:** F4-35

## Contexto

La biblia del mundo actualizada es la fuente de verdad del universo y vive en el **Drive del equipo**. Tiene una hoja que dice **ÍNDICE** y debajo empieza el Capítulo I: no hay tabla de contenido real, no se puede saltar a un capítulo, no hay números de página y el PDF no tiene marcadores. Sin índice funcional, el equipo no puede consultarla ni citarla.

**Dónde se hacen los cambios:** en la biblia del mundo actualizada que está en el Drive. Los `.docx` que haya en el repositorio (`Subterfuge.docx`, `docs/Subterfuge-world-bible.docx`) son copias de consulta o exportaciones; **no se editan**. El encargo se cierra cuando el índice funciona en el documento del Drive y en su exportación a PDF.

## Qué se necesita

Convertir el índice en una **tabla de contenido automática de Word**:

1. Abrir la biblia del mundo actualizada en el Drive y aplicar los estilos **Título 1, 2 y 3** a todos los capítulos y secciones (el documento ya usa algunos; completar los que falten y unificar).
2. Sustituir el rótulo «ÍNDICE» por una tabla de contenido:
   - `Referencias → Tabla de contenido → Tabla automática 1` o campo `TOC \o "1-3" \h \z \u`.
   - Niveles 1-3.
   - Números de página a la derecha.
   - Entradas con hipervínculo (`\h`).
   - Marcadores (`\u`) para que Word actualice sin errores.
3. Configurar `w:updateFields` para que Word pregunte/actualice el índice al abrir.
4. Añadir un encabezado de sección «Índice» con una línea de uso: «Las entradas son enlaces. Para actualizar, Ctrl+clic derecho → Actualizar campo».
5. Exportar a PDF desde el documento del Drive y comprobar que los marcadores coinciden con la tabla.
6. Comprobar que no hay «Error! Bookmark not defined» ni entradas vacías.
7. No modificar los `.docx` del repositorio: si hace falta una copia de consulta, se exporta desde el Drive y se marca como tal.

## Criterios de aceptación

- [ ] El documento del Drive abre en Word con una tabla de contenido con todos los capítulos y secciones.
- [ ] `Ctrl+clic` en una entrada salta al capítulo correcto.
- [ ] `F9` / «Actualizar campo» recalcula páginas sin errores.
- [ ] El PDF exportado tiene marcadores navegables.
- [ ] La numeración de páginas coincide con la tabla.
- [ ] Ya no queda el rótulo «ÍNDICE» vacío.
- [ ] El índice incluye el capítulo de Naturaleza y el Vientre Húmedo.
- [ ] Los `.docx` del repositorio no se han editado.

## Referencias

- Biblia del mundo actualizada, en el Drive del equipo (fuente canónica).
- `docs/DESARROLLO.md` → «Documentación».
- Exportación de consulta en el repositorio, si existe; no se edita.

<!-- ==================== F4-35 ==================== -->
---
title: "[DOCS] Actualizar README y DESARROLLO a la fase 4"
labels: fase-4, documentacion, prioridad-media
depende: F4-02, F4-09, F4-10, F4-32
bloquea: F4-36, F4-38
---

**Código:** `F4-35` · **GitHub:** #119 · **Prioridad:** media · **Depende de:** F4-02, F4-09, F4-10, F4-32 · **Bloquea:** F4-36, F4-38

## Contexto

`README.md` y `docs/DESARROLLO.md` son la puerta de entrada al proyecto. Hoy describen un solo nivel con cuatro zonas, ocho fragmentos, cinco reliquias y tres enemigos. Con la fase 4, el juego pasa a tener **dos niveles**: el Nivel 1 existente y el Nivel 2 nuevo, la escapatoria por el Vientre Húmedo hacia el templo.

## Qué se necesita

### `README.md`

- Estado del proyecto: fase 4 en curso, Nivel 2 — El Vientre Húmedo.
- Estructura de niveles: Nivel 1 (Atrio, Pasillos, Criptas, Salas + cierre) y Nivel 2 (El Vientre Húmedo, la escapatoria). El templo es el Nivel 3, no jugable.
- Enemigos: Devoto, Vestal, Reformado + Remedo, Serpiente de Tejido y las criaturas del Vientre Húmedo.
- Fragmentos: 10; reliquias: 9; fichas: las que resulten.
- Controles: `E` sigue siendo interactuar/rear; no hay teclas nuevas.
- Enlace a `docs/FASE-4-VIENTRE-HUMEDO.md`.
- Nota sobre el Nivel 2, la Marea y la Puerta del Cuerpo.

### `docs/DESARROLLO.md`

- Flujo de escenas: dejar el Nivel 1 intacto (Atrio → Pasillos → Criptas → Salas → Final) y añadir el Nivel 2 (Final → VientreHumedo → FinalNivel2).
- Estructura: `VientreHumedoScene.ts`, nuevas entidades y objetos.
- «Añadir una zona nueva»: usar el nivel nuevo como ejemplo.
- «Diseño de los enemigos»: añadir Remedo, Serpiente y criaturas neutrales.
- «Diseño de niveles»: Mareas, Alfombra, Zarza, Mata, Mondador.
- «Estado actual»: marcar la fase 4 y sus issues.
- «La sillería del Vientre»: nuevo tileset/decal set.
- «La web de la Diócesis»: nuevas familias, 10 folios, índice.
- «Documentación»: la biblia canónica actualizada está en el Drive del equipo; el repositorio solo guarda una exportación de consulta y no se edita.
- Cualquier «ocho», «siete», «cuatro zonas» → valor real.

## Criterios de aceptación

- [ ] `README` y `DESARROLLO` no tienen cifras obsoletas.
- [ ] El flujo de escenas incluye `VientreHumedo`.
- [ ] Los enlaces a la biblia y a este documento funcionan.
- [ ] Los controles nuevos (si los hay) están documentados.
- [ ] La documentación menciona la Marea y las criaturas nuevas.
- [ ] `npm run verificar` no se rompe por cambios de documentación.

## Referencias

- `README.md`, `docs/DESARROLLO.md`, `docs/FASE-4-VIENTRE-HUMEDO.md`.

<!-- ==================== F4-36 ==================== -->
---
title: "[QA] verificar-rutas, verificar-arte y build con el Nivel 2"
labels: fase-4, zona-vientre-humedo, qa, tecnico, prioridad-alta
depende: F4-05, F4-08, F4-21, F4-22, F4-23, F4-31, F4-35
bloquea: F4-37, F4-38
---

**Código:** `F4-36` · **GitHub:** #120 · **Prioridad:** alta · **Depende de:** F4-05, F4-08, F4-21…F4-23, F4-31, F4-35 · **Bloquea:** F4-37, F4-38

## Contexto

El proyecto tiene verificaciones propias que ningún linter cubre: `verificar-rutas` comprueba que se pueda volver a subir y que el decorado no flote; `verificar-arte` comprueba figuras rectangulares y tilesets. El Nivel 2 debe entrar en ambas.

## Qué se necesita

1. `scripts/verificar-rutas.mjs`:
   - Añadir `['VientreHumedo', 'src/scenes/VientreHumedoScene.ts']` al array `zonas`.
   - Añadir los nuevos tipos de decorado a `EN_MURO` y `COLGANTES` según corresponda (`hongo`, `zarza`, `mata`, `alfombra`, `vena`, `membrana`, `raiz`, `nido`, `charco-vivo`).
   - Comprobar que `leerPlataformas` y `leerTuplas` encuentran los bloques del nivel nuevo (mantener el formato).
   - Verificar placas y fieles nuevos.
2. `scripts/verificar-arte.mjs`:
   - Las figuras nuevas deben ser rectangulares.
   - Los tilesets nuevos deben dividirse en frames de 16×16.
   - `npm run verificar-arte` debe pasar.
3. `scripts/exportar-arte.mjs`:
   - Debe exportar las figuras nuevas a `web/generado/arte.json`.
4. `npm run verificar` completo (format, lint, typecheck, arte, rutas, build).
5. CI (`.github/workflows/ci.yml`) debe seguir pasando sin cambios, o con los cambios mínimos si el script necesita algo.

## Criterios de aceptación

- [ ] `npm run verificar-rutas` incluye el Vientre Húmedo y pasa.
- [ ] `npm run verificar-arte` pasa con las figuras y tilesets nuevos.
- [ ] `npm run exportar-arte` exporta las figuras nuevas.
- [ ] `npm run verificar` pasa de principio a fin.
- [ ] CI pasa en el PR.
- [ ] No se ha relajado ninguna comprobación para que pase.

## Referencias

- `scripts/verificar-rutas.mjs`, `scripts/verificar-arte.mjs`, `scripts/exportar-arte.mjs`.
- `package.json` → `verificar`.
- `.github/workflows/ci.yml`.

<!-- ==================== F4-37 ==================== -->
---
title: "[QA] Playtest y balance del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, qa, gameplay, prioridad-alta
depende: F4-05, F4-07, F4-08, F4-13…F4-20, F4-24, F4-36
bloquea: F4-38
---

**Código:** `F4-37` · **GitHub:** #121 · **Prioridad:** alta · **Depende de:** F4-05, F4-07, F4-08, F4-13…F4-20, F4-24, F4-36 · **Bloquea:** F4-38

## Contexto

Un nivel nuevo puede pasar todos los linters y seguir siendo injusto: una Marea que no avisa, una Serpiente que no se puede esquivar, una Alfombra que no se distingue, un Remedo que muerde sin tell. El playtest es parte del encargo, no un extra.

## Qué se necesita

Una sesión de prueba con al menos tres personas que no hayan diseñado el nivel, más una prueba en móvil.

### Lista de comprobación

- [ ] Se puede completar el nivel sin leer ningún texto.
- [ ] La llegada desde Criptas se entiende: la puerta cerrada y el desagüe.
- [ ] La Marea avisa y se puede sobrevivir sin perder más de 2 de vida por error.
- [ ] La Serpiente se puede esquivar, castigar y vencer con el equipo inicial.
- [ ] La fase 2 de la Serpiente no es imposible con la Marea.
- [ ] La Alfombra se distingue por animación/sonido, no solo por color.
- [ ] El Remedo se distingue de un objeto real tras un par de encuentros.
- [ ] La Zarza se puede cortar y no deja soft lock.
- [ ] El Mondador se puede seguir y no se puede matar.
- [ ] El Buitre y el Cerdo no bloquean ni confunden.
- [ ] El Cuervo guía sin ser obligatorio.
- [ ] La Vena se entiende y no atrapa.
- [ ] Los 2 fragmentos y las 2 reliquias son alcanzables.
- [ ] Los 2 Altares funcionan y la muerte no rompe la Marea ni la Serpiente.
- [ ] La pausa, el Códice y el diálogo funcionan en el nivel.
- [ ] El mando táctil funciona; no hay acciones nuevas sin botón.
- [ ] El rendimiento se mantiene en un portátil modesto.
- [ ] No hay clipping de cámara, decorado flotante ni sprites fuera de pantalla.
- [ ] El nivel no dura más de lo que el equipo considere razonable para un teaser (medir tiempo).

## Criterios de aceptación

- [ ] Tres personas externas completan el nivel.
- [ ] No hay soft locks ni bugs bloqueantes.
- [ ] El balance se ajusta en `src/config/Sacramento.ts` si hace falta.
- [ ] Los bugs encontrados se convierten en issues con reproduce pasos.
- [ ] La versión móvil se prueba con `?tactil` y en un teléfono real si hay.
- [ ] Se firma el visto bueno del playtest.

## Referencias

- `src/config/Sacramento.ts` (todos los valores de ajuste).
- `docs/DESARROLLO.md` → «Ajuste de sensación».
- `scripts/probar-tactil.mjs`.

<!-- ==================== F4-38 ==================== -->
---
title: "[QA] Revisión de canon, tono y accesibilidad del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, qa, narrativa, accesibilidad, prioridad-alta
depende: F4-03, F4-04, F4-24, F4-25, F4-30, F4-35, F4-37
bloquea: —
---

**Código:** `F4-38` · **GitHub:** #122 · **Prioridad:** alta · **Depende de:** F4-03, F4-04, F4-24, F4-25, F4-30, F4-35, F4-37 · **Bloquea:** —

## Contexto

El universo tiene reglas duras. Un texto nuevo puede contradecir la ceguera de los Primigenios, usar «mirar» donde no toca, convertir el horror en gore o meter vocabulario de videojuego. Esta revisión es la última puerta antes de publicar.

## Qué se necesita

### Canon y tono

- [ ] El Nivel 1 conserva su jugabilidad: mismo flujo, mismo jefe, mismo recuento de 8/8. El cierre narrativo incluye la decisión de no entregar a la niña.
- [ ] El Nivel 2 empieza después del cierre del Nivel 1 y termina en la puerta del templo.
- [ ] El templo (Vientre Profundo) no se cruza ni se muestra por dentro.
- [ ] Ningún Primigenio aparece, mira, ve ni reacciona visualmente.
- [ ] No se usa «mirar» para los dioses; se usa tocar, conocer, ingerir.
- [ ] «Tibio» se usa con su doble valor (sagrado/peligroso).
- [ ] «Subir» se usa como eufemismo de ser Elegido; «bajar» es el descenso físico.
- [ ] Nadie dentro del mundo percibe el sacramento como violencia.
- [ ] El Mondador es sagrado por costumbre, no una divinidad.
- [ ] La niña aparece como compañera, pero su trama no se adelanta ni se explica de más.
- [ ] Los Reformados no son «zombis» ni «monstruos»; son personas a medias.
- [ ] No hay magia, viajes espaciales ni humor paródico.
- [ ] No se usa IA para el arte ni para los textos.

### Léxico

- [ ] No aparece «checkpoint», «mana», «HP», «stamina», «boss», «NPC» en textos visibles.
- [ ] Se usa Altar, Fervor, Poción de Carne, Injertadora, Sacramento, Diezmo, Registro, Reformado.
- [ ] Los textos visibles llevan tildes y enes; los identificadores no.

### Accesibilidad

- [ ] La Alfombra Devota se distingue sin depender del color.
- [ ] El Remedo se distingue sin depender del color.
- [ ] La Marea avisa con sonido y con imagen.
- [ ] La Serpiente telegrafía con formas y movimiento, no solo con color.
- [ ] Los textos del HUD son legibles a 480×320.
- [ ] El nivel no depende de audio para completarse.
- [ ] El mando táctil tiene todas las acciones necesarias.
- [ ] `prefers-reduced-motion` se respeta en la web.

### Web

- [ ] Las fichas nuevas no spoilean lo que el jugador no ha visto.
- [ ] El índice del Códice y del Registro funciona.
- [ ] La Doctrina tiene 10 folios y no dice «ocho».
- [ ] Las nuevas familias del Registro se leen en móvil.
- [ ] La biblia tiene índice funcional y una sola copia canónica.

## Criterios de aceptación

- [ ] La lista se revisa en una sesión con narrativa, arte y QA.
- [ ] No queda ninguna violación de canon abierta.
- [ ] Las violaciones de accesibilidad se corrigen o se documentan con una alternativa.
- [ ] Se actualiza el acta de canon si alguna decisión cambia.
- [ ] Se firma el visto bueno final.

## Referencias

- `docs/DESARROLLO.md` → «Convenciones».
- `src/lore/Codice.ts`, `src/lore/Registro.ts`, `src/lore/Pensamientos.ts`.
- Biblia: **Regla de oro del tono**, **Consistencia y género**, **Filosofía**.

<!-- ==================== F4-39 ==================== -->
---
title: "[NARRATIVA] Inscripciones y placas del Nivel 2"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, prioridad-media
depende: F4-05
bloquea: F4-37, F4-38
---

**Código:** `F4-39` · **GitHub:** #131 · **Prioridad:** media · **Depende de:** F4-05 · **Bloquea:** F4-37, F4-38

## Contexto

Las placas del Registro son la forma más barata de profundidad narrativa: una línea de burocracia diegética que se lee con `E` sin abrir nada. El Nivel 2 necesita sus propias placas para explicar el tránsito de la Sala 7 al templo sin tutoriales.

## Qué se necesita

Colocar 9 inscripciones en el nivel (`DefinicionNivel.inscripciones`) con textos de una línea, en la voz del Registro. Propuesta:

1. **El desagüe de la Sala 7 (entrada):** `REGISTRO. Desagüe de la Sala 7. Salida no autorizada. La Sala queda cerrada.`
2. **El desagüe, junto a la niña:** `REGISTRO. Menor sin número. No consta salida.`
3. **Galería de limpieza:** `MONDADOR. Especie protegida por costumbre. No se mata. No se espanta. Se deja comer.`
4. **El zarzal:** `ZARZA COSEDORA. Muralla viva. No se poda sin orden de Vestal. Las púas se devuelven al altar.`
5. **La mata:** `MATA DE RETAZOS. Fruto menor. Se tolera para ofrendas de casa. No sustituye la carne.`
6. **Corral de Protocolo:** `CERDO DE PROTOCOLO. Propiedad del linaje. Alimento de mesa alta. No se dispone sin registro.`
7. **El nido:** `DUCTO N.º 7. Conducto de servicio. Obstruido. No se autoriza el paso a Reformados.`
8. **Pozo de las Mareas:** `MAREAS DEL HAMBRE. No se cruza durante la crecida. El Latido avisa. El que no oye, baja.`
9. **La Puerta del Cuerpo (final):** `PUERTA DEL CUERPO. Acceso al Templo. Solo el Colegio y las Manos. El que entra no sale.`

Reglas:

- Una línea, mayúsculas de cartel, tildes cuando correspondan, como las placas existentes.
- Deben estar de pie, apoyadas en una plataforma, y `verificar-rutas` debe confirmar que se pueden leer.
- No explicar el lore completo: insinuar.
- No usar «mirar» para los dioses.
- La primera y la última placa marcan el tránsito: de la Sala 7 al templo. El Nivel 2 no se siente como una zona del Nivel 1, sino como un nivel aparte.

## Criterios de aceptación

- [ ] Las 9 placas están colocadas y se leen con `E`.
- [ ] Ninguna flota ni queda dentro de una pared.
- [ ] `verificar-rutas` las acepta.
- [ ] Los textos son de una línea y caben en el aviso.
- [ ] No contradicen el acta de canon.
- [ ] Al menos una placa menciona al Mondador, otra a la Marea, otra a la niña y otra a la Puerta del Cuerpo.
- [ ] La primera placa deja claro que se sale del Nivel 1 y la última que se llega al templo.

## Referencias

- `src/scenes/EscenaNivel.ts` (`inscripciones`, `RADIO_PLACA`).
- `src/scenes/SalasScene.ts` (ejemplos de placas).
- `F4-01`, `F4-04`, `F4-07`.

<!-- ==================== F4-40 ==================== -->
---
title: "[NARRATIVA] Cierre del Nivel 2: la Puerta del Cuerpo"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, prioridad-alta
depende: F4-01, F4-02, F4-03, F4-15, F4-39, F4-43
bloquea: F4-42
---

**Código:** `F4-40` · **GitHub:** #132 · **Prioridad:** alta · **Depende de:** F4-01, F4-02, F4-03, F4-15, F4-39, F4-43 · **Bloquea:** F4-42

## Contexto

El Nivel 2 termina en la puerta del templo, no dentro del templo. El cierre del Nivel 1 (`FinalScene`) sigue siendo el final del Nivel 1, pero ahora incluye la decisión de no entregar a la niña. Hace falta un cierre propio del Nivel 2 que muestre la Puerta del Cuerpo, con la niña junto al Cirujano, y deje el templo para el Nivel 3.

## Qué se necesita

Crear `src/scenes/FinalNivel2Scene.ts`:

1. **Imagen de cierre:** la Puerta del Cuerpo, cerrada, con el Latido detrás. Se puede componer con la sillería, la reja y una luz roja; no hace falta arte nuevo.
2. **Texto de cierre:** una o dos líneas del Cirujano, en la voz de `Pensamientos.ts`. Propuesta:
   ```ts
   'puerta-del-cuerpo': {
     cuadros: [
       'La puerta no se abre desde fuera.',
       'Al otro lado está el templo.',
       'La niña sigue conmigo.',
       'Si el templo es la salida, tendremos que cruzarlo.',
       'Los dioses no miran. Alguien tendrá que hacerlo.',
     ],
   },
   ```
   La última línea puede ajustarse para no repetir el cierre del Nivel 1.
3. **Recuento global:** 10 fragmentos, 9 reliquias, las fichas descubiertas. Es el recuento de toda la partida (Nivel 1 + Nivel 2).
4. **Anuncio:** «Nivel 3 — El Vientre Profundo» con la puerta como imagen. No mostrar a los Primigenios ni el interior del templo.
5. **Opciones:** «Volver al Atrio» (reinicia la partida) y, si se implementa, «Rejugar el Nivel 2».
6. **Memoria:** registrar el hito `'nivel-2'` al llegar al cierre. La web puede usar ese hito para abrir el expediente del templo.
7. **No cambiar la jugabilidad del Nivel 1:** el cierre narrativo se actualiza en `F4-03`/`F4-43`; el recuento de 8/8 y la opción de huir se definen en `F4-08`.

## Criterios de aceptación

- [ ] `FinalNivel2Scene` existe y está registrada en `main.ts`.
- [ ] Se llega a ella desde el umbral del Nivel 2.
- [ ] Muestra la Puerta del Cuerpo y a la niña junto al Cirujano, y anuncia el Nivel 3.
- [ ] No muestra a los Primigenios ni el interior del templo.
- [ ] El recuento global es correcto (10 fragmentos, 9 reliquias).
- [ ] «Volver al Atrio» reinicia la partida.
- [ ] El hito `'nivel-2'` se registra.
- [ ] La jugabilidad del Nivel 1 no se modifica; su cierre narrativo incluye la decisión.
- [ ] Funciona en móvil y con teclado.

## Referencias

- `src/scenes/FinalScene.ts` (patrón de cierre).
- `src/lore/Pensamientos.ts`, `src/systems/Memoria.ts`.
- `F4-08`, `F4-09`, `F4-42`, `F4-43`.

<!-- ==================== F4-41 ==================== -->
---
title: "[NARRATIVA] Flor de Hueso y objetos culturales del Vientre Húmedo"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, web, prioridad-media
depende: F4-01, F4-04, F4-05
bloquea: F4-25, F4-37, F4-38
---

**Código:** `F4-41` · **GitHub:** #125 · **Prioridad:** media · **Depende de:** F4-01, F4-04, F4-05 · **Bloquea:** F4-25, F4-37, F4-38

## Contexto

La biblia enumera, entre los artefactos culturales del Vientre Húmedo, el caparazón del Mondador, la **Flor de Hueso**, las púas de sutura, las varas de tanteo y el conteo del instrumental. El plan ya cubre el caparazón (`F4-15`), las púas (`F4-18`), las varas (`F4-03`) y el conteo (`F4-13`). Falta la Flor de Hueso, que la cultura usa en la **Cena de la Ausencia**: cuando alguien es Elegido, su casa celebra un banquete con su lugar vacío y deposita una flor de hueso sobre el asiento.

En el Vientre Húmedo, la flor puede crecer de lo que el sacramento rechaza: un hueso con pétalos pálidos, casi una reliquia. No es un arma ni una mejora permanente; es un objeto que dice quién falta.

## Qué se necesita

1. **Objeto `FlorDeHueso`** en `src/objetos/` o como `decorado` interactivo:
   - Crece en una grieta de hueso, sobre una camilla vacía o junto a una pila de residuos.
   - Se lee/cosecha con `E`; al interactuar, muestra una línea y da +1 Fervor (no una reliquia permanente).
   - Solo hay una en el nivel; no reaparece si se recoge.
   - No bloquea el paso ni es necesaria para terminar.
2. **Escena de la Cena de la Ausencia:** una camilla vacía con una flor de hueso y una inscripción. Es el momento humano del nivel: alguien de esa casa fue subido y no vuelve. No hace falta cinemática.
3. **Ficha del Registro** en `src/lore/Registro.ts`, familia `oficio` o `aparato`:
   - `id: 'flor-de-hueso'`, nombre «Flor de Hueso», hallazgo «vista en el Vientre Húmedo».
   - Descripción de 3-4 líneas: se deja en el asiento vacío del Elegido; crece de hueso y tejido rechazado; la Diócesis la considera un adorno menor, no un sacramento.
   - Textura: `flor-hueso-placeholder` (`F4-23`).
4. **Web:** la ficha aparece en el Registro (`F4-25`) y, si se quiere, una línea en la portada o en la Doctrina sobre la Cena de la Ausencia. No crear una sección nueva.
5. **Inscripción** (`F4-39`): `CENA DE LA AUSENCIA. Se deja una flor de hueso en el asiento del que sube. No se retira hasta que la casa deja de deber carne.`
6. **Tubérculos y comida del nivel:** si `F4-12` necesita una lista de alimentos, añadir «hongos, tubérculos pálidos y frutos de Mata» como ambientación, sin nueva mecánica.

## Criterios de aceptación

- [ ] La Flor de Hueso aparece una vez en el nivel y se puede interactuar.
- [ ] No es una reliquia permanente ni rompe el balance de Fervor.
- [ ] La camilla vacía y la inscripción cuentan la Cena de la Ausencia sin explicarla de más.
- [ ] La ficha existe en el Registro del juego y de la web.
- [ ] No se usa «mirar» para los dioses ni se revela el origen biológico.
- [ ] La flor no flota ni bloquea una ruta.
- [ ] `verificar-rutas` la acepta si se coloca como decorado.

## Referencias

- Biblia: **Funciones narrativas → Artefacto cultural**, **Cultura → La Cena de la Ausencia**, **Clases sociales y alimentación**.
- `src/lore/Registro.ts`, `src/objetos/Ofrenda.ts`, `src/scenes/EscenaNivel.ts`.

<!-- ==================== F4-42 ==================== -->
---
title: "[NIVEL] Continuidad entre niveles: progreso, desbloqueo y selección"
labels: fase-4, zona-vientre-humedo, gameplay, tecnico, prioridad-media
depende: F4-08, F4-40
bloquea: F4-37
---

**Código:** `F4-42` · **GitHub:** #133 · **Prioridad:** media · **Depende de:** F4-08, F4-40 · **Bloquea:** F4-37

## Contexto

El juego pasa de tener un solo nivel a tener dos. El Nivel 1 conserva su jugabilidad (solo cambia el cierre narrativo con la decisión del Cirujano), pero la transición entre ambos necesita reglas claras: qué se conserva, cómo se desbloquea el Nivel 2, cómo se vuelve a jugar y cómo se prueba sin recorrer el Nivel 1 entero.

## Qué se necesita

### 1. Progreso entre niveles

- Al elegir «Huir por el desagüe» en `FinalScene`, **no** llamar a `progreso.reiniciar()`.
- El Nivel 2 conserva fragmentos, reliquias, fichas y carga de la Injertadora del Nivel 1.
- La niña viaja con el Cirujano y no se pierde al cambiar de nivel; su estado vive en la escena, no en `Progreso`.
- Al volver al Atrio desde `FinalNivel2` o desde `FinalScene`, sí se reinicia la partida.
- Si el jugador empieza el Nivel 2 directamente (selector o atajo), arranca con el equipo base. El nivel debe ser jugable, pero se balancea para el recorrido Nivel 1 → Nivel 2.

### 2. Desbloqueo y memoria

- `Memoria` registra el hito `'nivel-2'` al entrar o al terminar el Nivel 2.
- La web puede usar `'nivel-2'` para abrir el expediente del templo o una línea de la portada.
- El Nivel 1 sigue registrando `'final'` como hoy.
- No borrar la memoria del descenso al cambiar de nivel: es la unión de todas las partidas.

### 3. Selección de nivel

- Opción mínima: `FinalScene` ofrece «Huir por el desagüe» y «Volver al Atrio»; `FinalNivel2` ofrece «Volver al Atrio» y «Rejugar el Nivel 2».
- Opción de prueba: `?nivel=2` (o un parámetro equivalente) inicia `VientreHumedo` directamente. Debe estar documentado y no afectar la experiencia normal.
- Si se añade un selector visible, que sea diegético (una puerta, un registro) y no un menú de videojuego genérico. No es obligatorio para esta fase.

### 4. Balance

- El Nivel 2 asume que el jugador llega con las reliquias del Nivel 1. Si se prueba en frío, anotar la diferencia y ajustar `Sacramento.ts` si hace falta.
- No duplicar reliquias entre niveles: las 7 del Nivel 1 y las 2 del Nivel 2 son las 9 totales.
- El Nivel 2 no debe regalar una reliquia que el jugador ya tenga; `Progreso.tieneReliquia` lo evita.

### 5. Documentación

- `README` y `DESARROLLO` explican la estructura de dos niveles y cómo entrar al Nivel 2.
- `docs/FASE-4-VIENTRE-HUMEDO.md` es la referencia.

## Criterios de aceptación

- [ ] Se puede jugar Nivel 1 → Nivel 2 sin recargar y sin perder progreso.
- [ ] La niña sigue al Cirujano en el Nivel 2 y llega a la Puerta del Cuerpo.
- [ ] «Volver al Atrio» reinicia la partida.
- [ ] El hito `'nivel-2'` se registra y la web lo puede leer.
- [ ] El atajo `?nivel=2` funciona y está documentado.
- [ ] El Nivel 1 sigue siendo jugable y no cambia.
- [ ] El balance del Nivel 2 se prueba con y sin reliquias del Nivel 1.
- [ ] `npm run typecheck`, `lint` y `build` pasan.

## Referencias

- `src/scenes/FinalScene.ts`, `src/scenes/FinalNivel2Scene.ts`, `src/scenes/VientreHumedoScene.ts`.
- `src/systems/Progreso.ts`, `src/systems/Memoria.ts`, `web/src/memoria.ts`.
- `F4-08`, `F4-40`.

<!-- ==================== F4-43 ==================== -->
---
title: "[NARRATIVA] La decisión del Cirujano y la niña como compañera"
labels: fase-4, zona-vientre-humedo, narrativa, gameplay, prioridad-alta
depende: F4-01, F4-03
bloquea: F4-05, F4-08, F4-40, F4-42
---

**Código:** `F4-43` · **GitHub:** #134 · **Prioridad:** alta · **Depende de:** F4-01, F4-03 · **Bloquea:** F4-05, F4-08, F4-40, F4-42

## Contexto

El giro central de la fase 4: el Cirujano **no sacrifica a la niña**. Baja el bisturí, la toma y huye por el desagüe de la Sala 7. El Nivel 2 no es una procesión al templo: es una **escapatoria** con la niña. La Diócesis los buscará; el único camino es el Vientre Húmedo y, al final, la Puerta del Cuerpo.

## Qué se necesita

### 1. La decisión en el cierre del Nivel 1

- Actualizar la secuencia `cierre` de `src/lore/Pensamientos.ts` (`F4-03`) para que el Cirujano baje el bisturí y diga que no la entrega.
- No hace falta una cinemática nueva: `FinalScene` sigue lanzando `Dialogo` con `clave: 'cierre'`.
- La decisión debe sentirse como un acto, no como una frase: el texto, la pausa y el fundido bastan.

### 2. La niña como compañera

Implementación mínima, sin escolta con fracaso:

- `Nina` en `src/entities/Nina.ts` (o un `Fiel` especializado):
  - Sigue al Cirujano a una distancia corta.
  - Usa las mismas colisiones de plataformas; si se queda atrás o atascada, se recoloca en la última posición segura.
  - No tiene barra de vida, no recibe daño, no ataca y no puede morir.
  - Durante el combate de la Serpiente o la crecida de la Marea, se esconde detrás de una repisa/altar y no estorba.
  - No añade botones ni acciones nuevas.
- La niña aparece en la primera sala (desagüe) y en el cierre (`FinalNivel2`).
- Si el equipo prefiere una presencia solo narrativa, sin sprite que siga, debe documentarlo; el mínimo es que la huida se cuente con ella y que el jugador sepa que está con él.

### 3. La persecución

- La Diócesis descubre la Sala vacía; el Latido se acelera. No hace falta mostrar guardias: basta con el sonido, el aviso del HUD y una inscripción.
- La niña es la razón por la que el Cirujano no puede volver atrás. No es un objeto de poder ni una «elegida» obvia.
- El Mondador puede mostrarse tranquilo cerca de ella (opcional); no convertirla en una domadora de criaturas.

### 4. El final del Nivel 2

- `FinalNivel2` muestra a la niña junto al Cirujano delante de la Puerta del Cuerpo.
- El templo es el Nivel 3; no se cruza.
- La decisión de entrar o no se deja para el Nivel 3.

## Criterios de aceptación

- [ ] El cierre del Nivel 1 deja claro que el Cirujano decide no sacrificar a la niña.
- [ ] La niña aparece en el Nivel 2 y sigue al Cirujano sin bloquear la ruta.
- [ ] No tiene barra de vida, no recibe daño y no puede fracasar.
- [ ] No añade botones ni una mecánica de escolta con penalización.
- [ ] Se esconde durante la Serpiente y la Marea.
- [ ] Llega con el Cirujano a la Puerta del Cuerpo.
- [ ] La huida se entiende sin leer ningún texto.
- [ ] El Nivel 1 conserva su jugabilidad.
- [ ] No se usa IA para el arte de la niña.

## Referencias

- `src/lore/Pensamientos.ts` (`cierre`, `vientre-humedo`).
- `src/scenes/FinalScene.ts`, `src/scenes/VientreHumedoScene.ts`, `src/scenes/FinalNivel2Scene.ts`.
- `src/entities/Fiel.ts` (patrón de NPC), `src/scenes/EscenaNivel.ts`.
- `F4-01`, `F4-03`, `F4-05`, `F4-08`, `F4-40`, `F4-42`.

---

## 6. Publicación

### 6.1. Etiquetas necesarias

Antes de publicar, crear (o comprobar) estas etiquetas en el repositorio:

| Etiqueta | Color sugerido | Uso |
| --- | --- | --- |
| `fase-4` | `#4a4038` | Fase actual |
| `zona-vientre-humedo` | `#3f5a4a` | Todo lo del nivel |
| `narrativa` | `#8a6d3b` | Textos, canon, lore |
| `gameplay` | `#2e6b8a` | Mecánicas y balance |
| `tecnico` | `#4a4a5a` | Arquitectura y sistemas |
| `arte` | `#8c2f2f` | Sprites y tilesets |
| `audio` | `#6a4a7a` | SFX y música |
| `web` | `#2f6b6b` | Portal de la Diócesis |
| `documentacion` | `#0075ca` | Biblia, README, guías |
| `indice` | `#5a5a8a` | Índices y navegación |
| `qa` | `#7a5a2a` | Pruebas y verificación |
| `accesibilidad` | `#f143ab` | Contraste, color, táctil |

Las etiquetas `prioridad-alta`, `prioridad-media`, `prioridad-baja` y `bloqueante` ya existen.

### 6.2. Publicación automática

Con GitHub CLI autenticado:

```bash
gh auth status
gh label create fase-4 --color 4a4038 --force
# ... crear el resto de etiquetas ...
```

Para publicar un issue concreto:

```bash
gh issue create \
  --repo JeanCarloLond/Subterfuge \
  --title "[NARRATIVA] Canon y encaje del Vientre Húmedo en el descenso" \
  --body-file /ruta/al/cuerpo.md \
  --label fase-4,zona-vientre-humedo,narrativa,prioridad-alta
```

Los issues se crean **abiertos y sin asignar**, como los de `docs/issues/`.

### 6.3. Seguimiento

- Mover a «En curso» solo cuando se cumplan las dependencias.
- Un issue `bloqueante` no se cierra hasta que el QA correspondiente pase.
- Si cambia el canon, actualizar `F4-01` y avisar en los issues afectados.
- Este documento es la referencia; si GitHub y este archivo divergen, manda GitHub y se actualiza este archivo.

## 6.4. Issues publicados

| Código | GitHub | Título |
| --- | --- | --- |
| F4-01 | #126 | [[NARRATIVA] Canon de la Fase 4: dos niveles y la escapatoria](https://github.com/JeanCarloLond/Subterfuge/issues/126) |
| F4-02 | #127 | [[NARRATIVA] Dos nuevas hojas del Códice (IX y X) y recuento por nivel](https://github.com/JeanCarloLond/Subterfuge/issues/127) |
| F4-03 | #87 | [[NARRATIVA] Voces, pensamientos y fichas de los habitantes del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/87) |
| F4-04 | #88 | [[NARRATIVA] Bestiario del Vientre Húmedo: fichas de fauna y flora en el Registro](https://github.com/JeanCarloLond/Subterfuge/issues/88) |
| F4-05 | #128 | [[NIVEL] Geometría, rutas y secretos de la huida](https://github.com/JeanCarloLond/Subterfuge/issues/128) |
| F4-06 | #90 | [[TÉCNICO] Sistema de criaturas y peligros del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/90) |
| F4-07 | #91 | [[TÉCNICO] Mareas del Hambre y Latido como peligro temporal](https://github.com/JeanCarloLond/Subterfuge/issues/91) |
| F4-08 | #129 | [[TÉCNICO] Estructura de dos niveles: la decisión y la huida](https://github.com/JeanCarloLond/Subterfuge/issues/129) |
| F4-09 | #130 | [[MAPA] Mapas del juego y del portal: Nivel 1, Nivel 2 y templo](https://github.com/JeanCarloLond/Subterfuge/issues/130) |
| F4-10 | #94 | [[TÉCNICO] Contadores dinámicos y memoria del Nivel 2](https://github.com/JeanCarloLond/Subterfuge/issues/94) |
| F4-11 | #95 | [[TÉCNICO] Puentes de tejido: la Injertadora como llave del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/95) |
| F4-12 | #96 | [[TÉCNICO] Hongo de Lámpara, Lluvia Tibia y luz del nivel](https://github.com/JeanCarloLond/Subterfuge/issues/96) |
| F4-13 | #97 | [[ENEMIGO] Remedo: el instrumento tibio](https://github.com/JeanCarloLond/Subterfuge/issues/97) |
| F4-14 | #98 | [[ENEMIGO] Serpiente de Tejido: mini-jefe de los ductos](https://github.com/JeanCarloLond/Subterfuge/issues/98) |
| F4-15 | #99 | [[CRIATURA] Mondador: el limpiador sagrado](https://github.com/JeanCarloLond/Subterfuge/issues/99) |
| F4-16 | #100 | [[CRIATURA] Buitre ritual y Cerdo de Protocolo](https://github.com/JeanCarloLond/Subterfuge/issues/100) |
| F4-17 | #101 | [[CRIATURA] Cuervo de Ermita y Vena Trepadora](https://github.com/JeanCarloLond/Subterfuge/issues/101) |
| F4-18 | #102 | [[PELIGRO] Zarza Cosedora: barrera viva y púas de sutura](https://github.com/JeanCarloLond/Subterfuge/issues/102) |
| F4-19 | #103 | [[PELIGRO] Alfombra Devota: la trampa que parece liturgia](https://github.com/JeanCarloLond/Subterfuge/issues/103) |
| F4-20 | #104 | [[CRIATURA] Mata de Retazos: cosecha con riesgo](https://github.com/JeanCarloLond/Subterfuge/issues/104) |
| F4-21 | #105 | [[ARTE] Tileset y decals del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/105) |
| F4-22 | #106 | [[ARTE] Sprites de fauna del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/106) |
| F4-23 | #107 | [[ARTE] Sprites de flora y peligros del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/107) |
| F4-24 | #108 | [[AUDIO] SFX y música del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/108) |
| F4-25 | #109 | [[WEB] Registro: familias fauna y flora del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/109) |
| F4-26 | #110 | [[WEB] Linaje: la frontera porosa y las especies del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/110) |
| F4-27 | #111 | [[WEB] Portada y navegación del portal: dos niveles](https://github.com/JeanCarloLond/Subterfuge/issues/111) |
| F4-28 | #112 | [[WEB] Doctrina: diez folios, índices y manuales nuevos](https://github.com/JeanCarloLond/Subterfuge/issues/112) |
| F4-29 | #113 | [[WEB] Minijuegos: el Remedo en El Sacramento y nuevas preguntas del Examen](https://github.com/JeanCarloLond/Subterfuge/issues/113) |
| F4-30 | #114 | [[WEB] Índice funcional del Códice y del Registro en el portal](https://github.com/JeanCarloLond/Subterfuge/issues/114) |
| F4-31 | #115 | [[WEB] Exportar las nuevas figuras a la web](https://github.com/JeanCarloLond/Subterfuge/issues/115) |
| F4-32 | #116 | [[DOCS] Índice funcional de la biblia del mundo (Drive)](https://github.com/JeanCarloLond/Subterfuge/issues/116) |
| F4-35 | #119 | [[DOCS] Actualizar README y DESARROLLO a la fase 4](https://github.com/JeanCarloLond/Subterfuge/issues/119) |
| F4-36 | #120 | [[QA] verificar-rutas, verificar-arte y build con el Nivel 2](https://github.com/JeanCarloLond/Subterfuge/issues/120) |
| F4-37 | #121 | [[QA] Playtest y balance del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/121) |
| F4-38 | #122 | [[QA] Revisión de canon, tono y accesibilidad del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/122) |
| F4-39 | #131 | [[NARRATIVA] Inscripciones y placas del Nivel 2](https://github.com/JeanCarloLond/Subterfuge/issues/131) |
| F4-40 | #132 | [[NARRATIVA] Cierre del Nivel 2: la Puerta del Cuerpo](https://github.com/JeanCarloLond/Subterfuge/issues/132) |
| F4-41 | #125 | [[NARRATIVA] Flor de Hueso y objetos culturales del Vientre Húmedo](https://github.com/JeanCarloLond/Subterfuge/issues/125) |
| F4-42 | #133 | [[NIVEL] Continuidad entre niveles: progreso, desbloqueo y selección](https://github.com/JeanCarloLond/Subterfuge/issues/133) |
| F4-43 | #134 | [[NARRATIVA] La decisión del Cirujano y la niña como compañera](https://github.com/JeanCarloLond/Subterfuge/issues/134) |

## 7. Lo que esta fase no incluye

Para no confundir el alcance:

- No se construye el **Vientre Profundo** (capa VI): es el **Nivel 3** y solo se ve su puerta al final del Nivel 2.
- No se añaden armas nuevas. La Injertadora gana un uso, no un reemplazo.
- No se reescribe el combate del Reformado. El Nivel 1 conserva su jugabilidad; solo cambia el cierre narrativo con la decisión del Cirujano.
- No se implementa un motor de oscuridad ni fluidos reales.
- No se usan imágenes generadas por IA.
- No se mantiene una copia canónica de la biblia en el repositorio: la fuente se edita en el Drive del equipo.
- No se promete una fecha: los issues son el plan, no el calendario.

---

*Documento de planificación de la fase 4. Todos los textos de lore son propuestas sujetas a la aprobación del equipo narrativo y a la biblia del mundo.*
