## El Atrio (#185): que lo importante este sobre piedra y que el trazado
## conserve las reglas de Phaser al pasar a la rejilla.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/atrio.tscn")


func _solido_bajo(capa: TileMapLayer, pies: Vector2) -> bool:
	return capa.get_cell_source_id(capa.local_to_map(pies + Vector2(0, 8))) != -1


func test_todo_lo_que_se_pisa_esta_sobre_piedra() -> void:
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	afirmar(_solido_bajo(capa, atrio.get_node("Cirujano").position), "el Cirujano empieza de pie")
	afirmar(_solido_bajo(capa, atrio.get_node("Umbral").position), "el umbral")
	for altar in atrio.get_node("Altares").get_children():
		afirmar(_solido_bajo(capa, altar.position), "el Altar %s" % altar.name)
	for devoto in atrio.get_node("Devotos").get_children():
		afirmar(_solido_bajo(capa, devoto.position), "el Devoto %s" % devoto.name)
		for x in [devoto.ronda_izquierda, devoto.ronda_derecha]:
			afirmar(_solido_bajo(capa, Vector2(x, devoto.position.y)), "la ronda de %s llega a %s" % [devoto.name, x])
	atrio.free()


func test_las_repisas_del_campanario_estan_a_80_px() -> void:
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	# Suelo (fila 18), repisa baja (13) y alta (8): 80 px cada salto, que el
	# salto simple (88,9) supera.
	afirmar(capa.get_cell_source_id(Vector2i(4, 18)) != -1, "suelo")
	afirmar(capa.get_cell_source_id(Vector2i(4, 13)) != -1, "repisa baja")
	afirmar(capa.get_cell_source_id(Vector2i(1, 8)) != -1, "repisa alta")
	atrio.free()
