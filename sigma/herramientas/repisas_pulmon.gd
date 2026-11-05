## Las repisas que esperan al Pulmon Vacio (#255): volver hacia arriba con el
## doble salto tiene premio. Una en el Registro y otra en el Archivo, cada una con
## una hoja arrancada del Codice. Se corrio UNA vez sobre las salas ya hechas:
##
##   godot --headless --path sigma -s res://herramientas/repisas_pulmon.gd
##
## La repisa del Registro esta a 144 px del suelo y la del Archivo a 112: el salto
## llega a 92 y el Impulso a 150.
extends SceneTree

const NOTA := preload("res://escenas/nota.tscn")
const REPISAS := [
	{
		"sala": "res://escenas/nivel2/registro.tscn",
		"piedra": [22, 15, 5, 1],
		"id": "hoja-codice-registro",
		"nota": [24, 15],
		"texto": "«De las Manos. La Mano no mira ni pregunta. La Mano que cumple entra en el Vientre con el oficio limpio.»

Al margen, con la letra de «No vengas.»: «Cumplí veinte años. No entré en ninguna parte.»",
	},
	{
		"sala": "res://escenas/nivel2/archivo.tscn",
		"piedra": [3, 28, 4, 1],
		"id": "hoja-codice-archivo",
		"nota": [4, 28],
		"texto": "«De los Mil. No tienen ojos porque no les hacen falta: todo lo que hay les pertenece.»

Al margen, con la letra de «No vengas.»: «Entonces, ¿para qué quieren uno?»",
	},
]


func _initialize() -> void:
	var errores := 0
	for repisa: Dictionary in REPISAS:
		errores += _poner(repisa)
	quit(errores)


func _poner(repisa: Dictionary) -> int:
	var escena: Node = (load(repisa["sala"]) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	var silleria: TileMapLayer = escena.get_node("Silleria")
	var r: Array = repisa["piedra"]
	for x in range(r[0], r[0] + r[2]):
		for y in range(r[1], r[1] + r[3]):
			silleria.set_cell(Vector2i(x, y), 0, Vector2i.ZERO)
	var nota: Node2D = NOTA.instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	nota.name = String(repisa["id"]).to_pascal_case()
	nota.position = Vector2(repisa["nota"][0] * 16 + 8, repisa["nota"][1] * 16)
	nota.set("id", repisa["id"])
	nota.set("titulo", "Hoja del Códice, arrancada")
	nota.set("texto", repisa["texto"])
	escena.get_node("Notas").add_child(nota)
	nota.owner = escena
	var empaquetada := PackedScene.new()
	var error := empaquetada.pack(escena)
	if error == OK:
		error = ResourceSaver.save(empaquetada, repisa["sala"])
	print("%s: %s" % [repisa["sala"], error_string(error)])
	escena.free()
	return 0 if error == OK else 1
