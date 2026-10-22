## Le da proposito al techo que late del Atrio (feedback de Jean: «ese bloque
## moviendose no tiene sentido dentro del gameplay; deberia darsele algun
## proposito: alcanzar algun pergamino, documento, nota»). Se corrio UNA vez.
##
##   godot --headless --path sigma -s res://herramientas/nota_del_techo.gd
##
## A la izquierda del techo, bajo la plataforma del segundo Altar, una repisa
## con una nota, a ras de una columna que le cierra el paso desde abajo: solo
## se llega subido al techo cuando esta abajo, y si uno se queda encima cuando
## vuelve a subir, lo aplasta contra la plataforma.
extends SceneTree

const ESCENA := "res://escenas/atrio.tscn"
const NOTA := preload("res://escenas/nota.tscn")
## La repisa (fila 47: su cara de arriba en y = 752, a ras de la columna) y la
## columna, en tiles.
const REPISA := [Vector2i(8, 47), Vector2i(9, 47)]
const COLUMNA := Vector2i(10, 47)
const COLUMNA_HASTA_FILA := 53

const ID := "registro-pabellon-7"
const TITULO := "Registro del Pabellón N.º 7"
const TEXTO := """«Las Manos operan sin mirar. No es crueldad: es cuidado.
Lo que mira, abre. Lo que se abre no se vuelve a cerrar.
Si una Mano mira, córtese la Mano.»

Al margen, con otra letra: «¿Abre a qué?»"""


func _initialize() -> void:
	var escena: Node = (load(ESCENA) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	var silleria: TileMapLayer = escena.get_node("Silleria")
	for celda in REPISA:
		silleria.set_cell(celda, 0, Vector2i.ZERO)
	for fila in range(COLUMNA.y, COLUMNA_HASTA_FILA + 1):
		silleria.set_cell(Vector2i(COLUMNA.x, fila), 0, Vector2i.ZERO)

	if not escena.has_node("Notas"):
		var notas := Node2D.new()
		notas.name = "Notas"
		escena.add_child(notas)
		notas.owner = escena
	var nota: Node2D = NOTA.instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	nota.name = "Pabellon7"
	nota.position = Vector2(144, REPISA[0].y * 16)
	nota.id = ID
	nota.titulo = TITULO
	nota.texto = TEXTO
	escena.get_node("Notas").add_child(nota)
	nota.owner = escena

	var empaquetada := PackedScene.new()
	empaquetada.pack(escena)
	var error := ResourceSaver.save(empaquetada, ESCENA)
	print("Nota del techo: %s" % error_string(error))
	escena.free()
	quit(0 if error == OK else 1)
