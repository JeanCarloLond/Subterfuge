* **DOCUMENTO TÉCNICO: PROPUESTA DE DESARROLLO PARA "SUBTERFUGE"**

   Fecha: 9 de septiembre de 2026

   Versión: 1.1 (Actualización con herramientas gratuitas)

   Estado: Propuesta para aprobación del equipo

   **1\. INTRODUCCIÓN**

   El presente documento establece la propuesta técnica para el desarrollo de "Subterfuge", un teaser jugable en formato de videojuego 2D alojado en la web. Este proyecto nace de la decisión de transformar la entrega del ArtBook en una experiencia interactiva que permita al público sumergirse en el universo narrativo de "La Diócesis de la Carne" de una manera orgánica, visceral y divertida.

   El teaser funcionará como una puerta de entrada al mundo, introduciendo al jugador en el *mythos*, *ethos* y *topos* del universo a través de la jugabilidad misma, no mediante textos extensos o cinemáticas pasivas. La principal inspiración estética y narrativa es Blasphemous (The Game Kitchen, 2019), un referente directo que demuestra cómo el horror religioso, el body horror y la acción 2D pueden fusionarse en una experiencia coherente y memorable.

   Consideración presupuestaria: Todas las herramientas y tecnologías propuestas en este documento son completamente gratuitas (open source o con pruebas gratuitas funcionales), permitiendo el desarrollo sin necesidad de inversión económica.

    

   **2\. VISIÓN DEL TEASER**

   **2.1. Objetivo General**

   Crear un teaser jugable que sirva como:

  * Vitrina del universo narrativo: Introducir al jugador en el *mythos*, *ethos* y *topos* de "La Diócesis de la Carne".  
  * Demostración técnica: Probar las mecánicas centrales del juego (combate, exploración, parkour, sistemas de progresión).  
  * Herramienta de marketing: Generar interés y comunidad alrededor del proyecto.  
* **2.2. Alcance**

  * Duración estimada: 15-30 minutos de juego.  
  * Contenido: Un nivel completo (o fragmento significativo) de "El Vientre" que incluya:  
  * Zona de inicio (El Atrio o Los Pasillos de Preparación).  
  * Zona de combate y exploración.  
  * Encuentro con un jefe o evento narrativo clave.  
  * Final que deje al jugador con ganas de más.  
* **2.3. Público Objetivo**

  * Jugadores de action-platformers / Metroidvania (16-30 años).  
  * Consumidores de horror religioso y body horror.  
  * Fans de Blasphemous, Dark Souls, Hollow Knight, etc.  
  * Comunidades de ARG y lore-hunting (público digital).  
*  

   **3\. ARQUITECTURA TÉCNICA PROPUESTA (100% GRATUITA)**

   **3.1. Motor de Juego: Phaser 3**

   Phaser 3 es el framework de juegos HTML5 más maduro y utilizado en la industria para juegos 2D web. Es completamente gratuito y open source, sin restricciones de uso comercial.

   Ventajas:

  * Renderizado WebGL y Canvas: Compatibilidad con todos los navegadores modernos.  
  * Sistema de físicas integrado: Arcade Physics (simple y eficiente) y Matter.js (más avanzado).  
  * Gestión de assets: Carga y manejo de sprites, audio, mapas, etc.  
  * Sistema de escenas: Ideal para gestionar menús, niveles, cinemáticas.  
  * Comunidad activa: Documentación extensa, tutoriales y ejemplos.  
  * Manifiesto de gratuidad: El framework siempre será gratuito, incluso para proyectos comerciales.  
* Versión recomendada: Phaser 3.90.0 o superior.

   **3.2. Lenguaje de Programación: TypeScript**

   TypeScript es la elección natural para proyectos profesionales con Phaser 3:

  * Tipado estático: Reduce errores y mejora la mantenibilidad del código.  
  * Mejor experiencia de desarrollo: Autocompletado, refactoring, etc.  
  * Soporte oficial: Phaser 3 tiene definiciones de tipos (@types/phaser).  
  * Escalabilidad: Facilita el crecimiento del proyecto.  
  * Gratuito: TypeScript es open source y completamente gratuito.  
* **3.3. Herramientas de Desarrollo (Todas Gratuitas)**

| Herramienta | Función | Costo | Justificación |
| :---- | :---- | :---- | :---- |
| Visual Studio Code | Editor de código | Gratuito | El estándar de la industria, con excelente soporte para TypeScript y Phaser. |
| Vite | Bundler / Dev server | Gratuito (open source) | Builds rápidas, hot-reloading, excelente para desarrollo web. |
| Tiled Map Editor | Diseño de niveles | Gratuito (open source) | Herramienta visual estándar para tilemaps, con integración nativa en Phaser. |
| LibreSprite | Arte y animación pixel art | Gratuito (open source) | Fork de Aseprite, misma funcionalidad para edición y animación de sprites. |
| GIMP | Edición de imágenes | Gratuito (open source) | Alternativa a Photoshop para texturas y gráficos. |
| Audacity | Edición de audio | Gratuito (open source) | Creación y edición de efectos de sonido. |
| Bosca Ceoil | Creación de música | Gratuito | Herramienta simple para crear música chiptune/atmosférica. |

* 

    

   **4\. HERRAMIENTAS Y MCPs GRATUITOS PARA ACELERAR EL DESARROLLO**

   **4.1. Phaser Editor (Visual Scene Editor)**

   Phaser Editor es una herramienta visual que permite diseñar escenas, niveles y objetos sin escribir código. Existen versiones gratuitas:

  * Keolot Phaser Editor: Aplicación gratuita que funciona como entorno de desarrollo visual para juegos 2D en el motor Phaser, con integración de físicas Matter.js. Permite crear y editar escenas, objetos, animaciones, audio y teclas de forma visual.  
  * Beneficio: Reduce drásticamente el tiempo de iteración en diseño de niveles y objetos.  
  * Costo: Gratuito.  
* **4.2. Phaser Game Agent MCP**

   Phaser Game Agent es un servidor MCP (Model Context Protocol) que permite a asistentes de IA (Claude, Cursor, Copilot, etc.) interactuar directamente con tu proyecto de Phaser:

  * Integración con editores: Se conecta con Claude Desktop, Cursor, VS Code y Copilot.  
  * Sandbox en la nube: Espacio de trabajo privado asociado a tu cuenta de Phaser.  
  * Compatible con: Claude Code, Cursor, Copilot, Codex, Gemini CLI, Windsurf.  
  * Costo: Gratuito (con límites en la capa gratuita).  
* **4.3. Otras Herramientas y MCPs Gratuitos Recomendados**

| Herramienta | Tipo | Costo | Beneficio |
| :---- | :---- | :---- | :---- |
| Open-Godot-MCP | MCP Server | Gratuito (MIT) | Servidor MCP para desarrollo autónomo de juegos en Godot. Incluye playtesting, debugging, LSP. |
| Unity-MCP | MCP Tools | Gratuito (open source) | Asistente de desarrollo para Unity. Funciona con Claude, Gemini, Copilot y Cursor. |
| microStudio | Game Engine Online | Gratuito (open source) | Entorno completo online: editor de sprites, mapas, código y exportación a HTML5. |
| GDevelop | Game Engine | Gratuito (open source) | Motor no-code para juegos 2D, alternativa gratuita a Construct 3\. |
| TexturePacker (gratuito) | Optimización de assets | Gratuito | Empaqueta sprites en hojas de textura optimizadas (versión gratuita funcional). |
| [itch.io](https://itch.io/) | Publicación | Gratuito | Plataforma de publicación de juegos indie con alojamiento gratuito. |
| GitHub Pages | Alojamiento web | Gratuito | Alojamiento gratuito para el sitio web del juego. |

* 

   **4.4. Alternativa: Godot Engine (Opción de Respaldo)**

   Si el equipo prefiere un motor con editor visual completo, Godot es una alternativa gratuita y open source que permite exportar a HTML5. Ofrece:

  * Editor visual integrado.  
  * Soporte nativo para 2D y 3D.  
  * Exportación a Web (HTML5) con soporte para WebAssembly y WebGL 2.0.  
  * Comunidad activa y documentación extensa.  
  * Costo: Completamente gratuito, sin regalías ni costos ocultos.  
* Nota: La versión gratuita de Construct 3 tiene limitaciones significativas (número de eventos, capas y efectos por proyecto), por lo que no se recomienda para este proyecto.

    

   **5\. FLUJO DE TRABAJO RECOMENDADO**

   **5.1. Fase 0: Configuración del Entorno**

  * Inicializar proyecto (gratuito):  
     bash  
     npm create vite@latest subterfuge \-- \--template vanilla-ts  
     cd subterfuge  
     npm install phaser  
  * Instalar dependencias de desarrollo:  
     bash  
     npm install \-D @types/phaser  
  * Configurar Vite para servir assets.  
* **5.2. Fase 1: Prototipo Base (MVP)**

  * Escena principal: Crear una escena básica con un personaje controlable.  
  * Movimiento y físicas: Implementar movimiento (WASD/teclado), salto, gravedad.  
  * Carga de assets: Configurar el sistema de carga de sprites y mapas.  
* **5.3. Fase 2: Núcleo Jugable**

  * Diseño de niveles con Tiled: Crear el primer nivel del teaser.  
  * Sistema de combate: Implementar ataque básico, hitboxes, daño.  
  * Enemigos básicos: IA simple (patrullar, perseguir, atacar).  
  * Sistema de salud y UI: Barra de vida, indicadores.  
* **5.4. Fase 3: Pulido y Contenido**

  * Mecánicas avanzadas: Parkour, dash, sistemas de pociones.  
  * Narrativa integrada: Diálogos, objetos de lore, eventos.  
  * Jefe final: Encuentro con un enemigo significativo.  
  * Optimización y testing: Rendimiento en diferentes navegadores.  
*  

   **6\. INTEGRACIÓN ORGÁNICA DE MYTHOS, ETHOS Y TOPOS**

   **6.1. Principios de Diseño Narrativo**

   Siguiendo el enfoque de Blasphemous, donde la narrativa se construye a través de "pequeñas historias que viven juntas en un mundo", la integración del lore debe ser:

  * No intrusiva: El jugador nunca debe sentarse a leer bloques de texto.  
  * Descubrible: El lore se encuentra explorando, interactuando y observando.  
  * Ambiental: El mundo mismo cuenta la historia.  
  * Recompensante: Cuanto más profundiza el jugador, más lore descubre.  
* **6.2. Mythos (La historia fundacional)**

   Estrategia de integración:

| Mecánica | Implementación | Ejemplo en Subterfuge |
| :---- | :---- | :---- |
| Objetos de lore | Items coleccionables con descripciones breves | Fragmentos del "Códice de la Carne" esparcidos por el nivel. Al recogerlos, se muestra un breve texto críptico. |
| Ambientación visual | El entorno muestra la historia | Carteles de "Genesis Vestal" oxidados, altares con ofrendas de carne, máquinas médicas convertidas en relicarios. |
| Diálogos crípticos | NPCs que hablan con ambigüedad | Un Devoto murmura: *"Los dioses no miran... pero ella llegó con ojos"* —refiriéndose a la Niña Ofrenda. |
| Eventos guionados | Secuencias que revelan lore | Al llegar al final del nivel, el jugador presencia un "Sacramento" fallido, viendo cómo un Elegido se convierte en Reformado. |

* 

   **6.3. Ethos (Los valores y código de conducta)**

   Estrategia de integración:

| Mecánica | Implementación | Ejemplo en Subterfuge |
| :---- | :---- | :---- |
| Sistema de "Fervor" | Recurso que se gana con acciones devotas | Inspirado en Blasphemous. El jugador gana "Fervor" al realizar acciones piadosas (rezar ante altares, no dañar a ciertos NPCs). |
| Decisiones morales | Elecciones que afectan el juego | El jugador puede optar por ofrecer su propia carne (perder vida) para obtener una recompensa, o negarse y enfrentar consecuencias. |
| Reacciones de NPCs | Los personajes responden a las acciones del jugador | Si el jugador ataca a un Devoto, otros NPCs huyen o se vuelven hostiles. |
| Estética de la devoción | El arte y sonido reflejan el ethos | Coros gregorianos en zonas sagradas, ruidos biomecánicos en zonas profanas. |

* 

   **6.4. Topos (El espacio y la geografía simbólica)**

   Estrategia de integración:

| Mecánica | Implementación | Ejemplo en Subterfuge |
| :---- | :---- | :---- |
| Descenso vertical | La progresión es hacia abajo | El nivel comienza en el Atrio (superficie) y desciende hacia el Vientre Profundo. Cada nivel es más oscuro, más orgánico y más peligroso. |
| Arquitectura narrativa | Los espacios cuentan historias | Pasillos de Preparación: oficinas burocráticas con formularios de diezmo. Salas de Sacramento: quirófanos convertidos en altares con velas y sangre. |
| Transiciones significativas | Cambios visuales y sonoros al descender | Al pasar de un nivel a otro, la música cambia, los colores se vuelven más rojos y la arquitectura más orgánica. |
| Puntos de interés | Lugares clave con lore asociado | Un tanque de cultivo de Genesis Vestal abandonado, donde el jugador puede leer sobre el origen de los Primigenios. |

* 

    

   **7\. MECÁNICAS DE JUEGO PROPUESTAS**

   **7.1. Parkour y Movimiento**

| Mecánica | Descripción | Inspiración |
| :---- | :---- | :---- |
| Salto | Salto básico con arco parabólico | Clásico de plataformas |
| Doble salto | Segundo salto en el aire (desbloqueable) | Hollow Knight |
| Dash / Esquiva | Movimiento rápido en dirección horizontal con invulnerabilidad breve | Blasphemous |
| Agarrarse a bordes | El personaje puede colgarse de bordes y trepar | Metroidvania |
| Paredes resbaladizas | Deslizarse por paredes con control | Celeste |

* 

   **7.2. Combate**

| Mecánica | Descripción | Inspiración |
| :---- | :---- | :---- |
| Ataque básico | Golpe con el Bisturí Ceremonial (cuerpo a cuerpo) | Blasphemous |
| Ataque cargado | Mantener presionado para un golpe más potente | Blasphemous |
| Parry / Defensa | Bloquear en el momento justo para contraatacar | Sekiro / Blasphemous |
| Ataque en el aire | Golpear mientras se está en el aire | Hollow Knight |
| Ejecución | Finalizar enemigos debilitados con una animación visceral | Blasphemous |

* 

   **7.3. Sistema de Pociones y Recursos**

| Mecánica | Descripción | Justificación narrativa |
| :---- | :---- | :---- |
| Poción de Carne | Restaura vida. Se obtiene de enemigos o se compra con "diezmos". | El jugador consume carne para sanar, reflejando la economía del mundo. |
| Frasco de Fervor | Restaura "Fervor" (recurso para habilidades especiales). | La devoción es un recurso jugable, como en Blasphemous. |
| Ofrendas | Items que se pueden dejar en altares para obtener bendiciones. | Refleja la práctica de los diezmos. |
| Reliquias | Objetos pasivos que otorgan beneficios (más daño, más vida, etc.). | Inspirado en los rosarios de Blasphemous. |

* 

   **7.4. Progresión y Exploración**

| Mecánica | Descripción |
| :---- | :---- |
| Habilidad de "Ojo Cerrado" | Permite ver secretos ocultos (inspirado en la ceguera de los Primigenios). |
| Puertas de Sacramento | Puertas que solo se abren con ciertos items o después de derrotar a ciertos enemigos. |
| Atajos | Puertas que se abren desde el otro lado, incentivando la exploración. |
| Checkpoints (Altares) | Puntos de guardado y descanso que también ofrecen lore. |

* 

    

   **8\. PLAN DE IMPLEMENTACIÓN**

   **8.1. Fases y Entregables**

| Fase | Duración estimada | Entregable |
| :---- | :---- | :---- |
| Fase 0: Setup | 1 semana | Entorno de desarrollo configurado, proyecto inicial con Phaser \+ TypeScript. |
| Fase 1: Prototipo | 2-3 semanas | Personaje controlable, movimiento, salto, cámara, carga de assets. |
| Fase 2: Núcleo | 3-4 semanas | Combate básico, enemigos simples, sistema de salud, UI, primer nivel diseñado en Tiled. |
| Fase 3: Contenido | 4-6 semanas | Nivel completo, enemigos variados, jefe final, sistema de pociones, objetos de lore. |
| Fase 4: Pulido | 2-3 semanas | Optimización, testing, corrección de bugs, integración de audio. |
| Fase 5: Lanzamiento | 1 semana | Publicación en [itch.io](https://itch.io/) / GitHub Pages, campaña de marketing. |

* 

   Total estimado: 13-18 semanas (3-4 meses).

   **8.2. Roles del Equipo**

| Rol | Responsabilidades |
| :---- | :---- |
| Director de Arte | Supervisar la estética, diseño de personajes (sin IA), paleta de colores, consistencia visual. |
| Artista de Pixel Art | Crear sprites, animaciones, tilesets y assets visuales (LibreSprite / Aseprite). |
| Diseñador de Niveles | Diseñar y construir niveles en Tiled. |
| Programador Principal | Implementar lógica de juego, físicas, IA, sistemas (Phaser \+ TypeScript). |
| Narrative Designer | Integrar lore, escribir diálogos, diseñar objetos de lore. |
| Sound Designer | Crear o seleccionar música y efectos de sonido (Audacity, Bosca Ceoil). |

* 

    

   **9\. RECOMENDACIONES FINALES**

   **9.1. Arte sin IA**

   El equipo ha decidido que el diseño de personajes no utilizará IA. Esto es una decisión acertada que garantiza:

  * Originalidad: Cada personaje tendrá una identidad única y coherente.  
  * Control creativo: El equipo tendrá control total sobre la expresión artística.  
  * Calidad: El arte hecho a mano (especialmente en pixel art) tiene una calidez y personalidad que la IA aún no puede replicar.  
* Flujo de trabajo de arte recomendado (con herramientas gratuitas):

  * Bocetos en papel o tableta gráfica.  
  * Arte final en LibreSprite (alternativa gratuita a Aseprite).  
  * Exportación a spritesheets con JSON para Phaser.  
  * Integración directa en Phaser usando createFromAseprite().  
* **9.2. Prioridades de Desarrollo**

  * Jugabilidad primero: Asegurar que el juego sea divertido antes de añadir contenido.  
  * Lore integrado: La narrativa debe ser parte de la jugabilidad, no un añadido.  
  * Iteración rápida: Usar herramientas visuales (Keolot Phaser Editor, Tiled) para prototipar rápido.  
  * Consistencia estética: Mantener la paleta de colores, el tono y la coherencia visual en todo momento.  
* **9.3. Próximos Pasos**

  * Aprobar este documento por el equipo.  
  * Configurar el entorno de desarrollo (repositorio, herramientas gratuitas).  
  * Crear el primer prototipo jugable (personaje \+ movimiento).  
  * Definir el diseño del primer nivel (storyboard, mapa en Tiled).  
  * Comenzar la producción de arte (personajes, tilesets en LibreSprite).  
*  

   **10\. REFERENCIAS Y RECURSOS (Todos Gratuitos)**

   **10.1. Documentación Oficial**

  * [Phaser 3 Documentation](https://phasedocs.com/) — Gratuito  
  * [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Gratuito  
  * [Tiled Map Editor Manual](https://doc.mapeditor.org/) — Gratuito  
  * [LibreSprite Documentation](https://github.com/LibreSprite/LibreSprite) — Gratuito  
* **10.2. Tutoriales y Cursos (Gratuitos)**

  * [Full Course: How To Make A Zelda-Like Game With Phaser 3](https://phaser.io/news/2025/04/full-course-how-to-make-a-zelda-like-game-with-phaser-3)  
  * [Phaser Tilemap Tutorial: Tile-Based Maps & Level Design](https://generalistprogrammer.com/)  
  * [Phaser Game Agent MCP Setup Guide](https://phaser.io/)  
* **10.3. Inspiración**

  * Blasphemous (The Game Kitchen) \- Estética, narrativa, tono  
  * Hollow Knight (Team Cherry) \- Exploración, combate, atmósfera  
  * Dark Souls (FromSoftware) \- Narrativa ambiental, dificultad  
  * Bioshock (Irrational Games) \- Worldbuilding, decadencia tecnológica

 

 **11\. CONCLUSIÓN**

 La propuesta técnica presentada establece un camino claro y viable para el desarrollo de "Subterfuge" como un teaser jugable de alta calidad, sin necesidad de inversión económica. La combinación de Phaser 3 como motor, TypeScript como lenguaje, y herramientas gratuitas como Tiled y LibreSprite para el diseño de niveles y arte, proporciona un ecosistema maduro y profesional que permitirá al equipo crear una experiencia inmersiva y fiel al universo de "La Diócesis de la Carne".

 La integración orgánica del *mythos*, *ethos* y *topos* a través de la jugabilidad misma —no mediante textos pasivos— asegura que el jugador experimente el mundo de una manera visceral y memorable, tal como lo logra Blasphemous con su "teología lúdica".

 Con un enfoque en la iteración rápida, el control artístico total (sin IA para personajes) y el uso de herramientas gratuitas que aceleran el desarrollo (Keolot Phaser Editor, Phaser Game Agent MCP, Open-Godot-MCP), el equipo está en una posición excelente para entregar un teaser que no solo cumpla con los requisitos académicos, sino que se convierta en una pieza de portfolio y marketing de primer nivel.

