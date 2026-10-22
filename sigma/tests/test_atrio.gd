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
	for reliquia in atrio.get_node("Reliquias").get_children():
		afirmar(_solido_bajo(capa, reliquia.position), "la reliquia %s" % reliquia.name)
	for vestal in atrio.get_node("Vestales").get_children():
		afirmar(_solido_bajo(capa, vestal.position), "la Vestal %s" % vestal.name)
		for x in [vestal.ronda_izquierda, vestal.ronda_derecha]:
			afirmar(_solido_bajo(capa, Vector2(x, vestal.position.y)), "el tramo de %s llega a %s" % [vestal.name, x])
	for pieza in atrio.get_node("Atrezo").piezas:
		afirmar(_solido_bajo(capa, Vector2(pieza[1], pieza[2])), "el atrezo %s en %s,%s" % pieza)
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


## Lo que ocupa un muro con este avance, sin escena en marcha.
func _rect(muro: Node, avance: float) -> Rect2:
	return Rect2(muro.position + muro.direccion * avance, Vector2(muro.tiles * 16))


## La primera fila de piedra por debajo de `y` en la columna de `x`.
func _suelo_bajo(capa: TileMapLayer, x: float, y: float) -> float:
	var celda := capa.local_to_map(Vector2(x, y))
	for fila in range(celda.y, 80):
		if capa.get_cell_source_id(Vector2i(celda.x, fila)) != -1:
			return fila * 16.0
	return INF


func test_el_techo_que_late_avisa_pero_no_aplasta() -> void:
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	var techo := atrio.get_node("Muros/Techo")
	afirmar(techo.ciclico, "late")
	var abajo := _rect(techo, techo.recorrido)
	for x in [abajo.position.x + 1.0, abajo.end.x - 1.0]:
		var hueco := _suelo_bajo(capa, x, abajo.end.y) - abajo.end.y
		# Si debajo cabe el Cirujano con holgura, ni aplasta ni corta el paso.
		afirmar(hueco > 22.0 + 4.0, "en x=%d deja %d px: el Cirujano cabe de sobra" % [x, hueco])
	atrio.free()



func test_el_decorado_se_apoya_en_la_piedra() -> void:
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	for pieza in atrio.get_node("Decorado").get_children():
		if not pieza is Sprite2D:
			continue
		# Lo que cuelga tiene el origen arriba; lo demas, abajo.
		var cuelga: bool = pieza.offset.y >= 0.0
		var apoyo: Vector2 = pieza.position + (Vector2(0, -8) if cuelga else Vector2(0, 8))
		afirmar(capa.get_cell_source_id(capa.local_to_map(apoyo)) != -1, "%s en %s flota" % [pieza.name, pieza.position])
	atrio.free()


func test_la_silleria_pone_la_cara_clara_arriba() -> void:
	const Silleria := preload("res://scripts/silleria.gd")
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	Silleria.vestir(capa)
	# El suelo inicial (fila 18) tiene el aire encima; la repisa alta (fila 8),
	# tambien, y su primera piedra, ademas, el canto de la izquierda.
	afirmar(capa.get_cell_atlas_coords(Vector2i(4, 18)).x & 1, "el suelo, con su cara de arriba")
	afirmar_igual(capa.get_cell_atlas_coords(Vector2i(59, 30)).x & 1, 0, "un muro por dentro no tiene cara arriba")
	afirmar(capa.get_cell_source_id(Vector2i(4, 18)) != -1, "y sigue siendo piedra")
	atrio.free()
