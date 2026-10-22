# Documentación

Qué hay en esta carpeta y para quién es.

## Para desarrollar

- **[estado-del-trabajo.md](estado-del-trabajo.md)**: el traspaso entre sesiones. Qué
  reglas mandan, qué está hecho, qué sigue (también en Subterfuge Sigma) y qué trampas ya
  se han pisado. Para retomar el trabajo, primero esto.
- **[DESARROLLO.md](DESARROLLO.md)**: cómo está hecho el juego y el portal. La
  estructura, el flujo de escenas, el combate, los tests, cada sistema y por qué
  se decidió así. Es lo primero que hay que leer antes de tocar código.
- **[CONTRIBUTING](../CONTRIBUTING.md)**: el flujo de trabajo, los tests que se
  piden a cada PR y las reglas de arte, textos y canon.
- **[qa/](qa/)**: la guía para la prueba con jugadores y en móviles reales.

## El mundo

- **[canon/](canon/)**: el acta de canon de la fase 4, que fija qué cubre cada
  nivel, qué no se muestra y qué queda por decidir.
- **Subterfuge-world-bible.docx**: la biblia del mundo, versión del Drive del
  16 de octubre. La versión de trabajo vive en el Drive del equipo.

## Arte

- **[arte/piezas/](arte/piezas/)**: las piezas de sillería del equipo, de donde
  sale el tileset (`node scripts/generar-tileset.mjs`, ver DESARROLLO → La
  sillería del Vientre).
- **[arte/encargos/](arte/encargos/)**: los encargos de arte pendientes, con
  formatos y criterios de aceptación. Se publican como issues con
  `scripts/crear-issues.ps1`.

## Difusión y entregas

- **[qr/](qr/)**: los códigos QR del portal y del cartel.
- **[presentacion/](presentacion/)**: los guiones de la presentación en clase
  (el oral y el de diapositivas).
- **[historico/](historico/)**: la propuesta técnica inicial, tal como se
  planteó antes de empezar. Se conserva como registro; ya no describe el juego.
