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
	# Un muro por dentro: dos piedras apiladas en una capa de prueba (en el
	# Atrio los muros de agarre son membrana, en otra capa).
	var muro := TileMapLayer.new()
	muro.tile_set = capa.tile_set
	muro.set_cell(Vector2i(0, 0), 0, Vector2i.ZERO)
	muro.set_cell(Vector2i(0, 1), 0, Vector2i.ZERO)
	Silleria.vestir(muro)
	afirmar_igual(muro.get_cell_atlas_coords(Vector2i(0, 1)).x & 1, 0, "un muro por dentro no tiene cara arriba")
	muro.free()
	afirmar(capa.get_cell_source_id(Vector2i(4, 18)) != -1, "y sigue siendo piedra")
	atrio.free()


func test_solo_las_paredes_de_agarre_son_membrana() -> void:
	var atrio := ESCENA.instantiate()
	var membranas: TileMapLayer = atrio.get_node("Membranas")
	var silleria: TileMapLayer = atrio.get_node("Silleria")
	afirmar(membranas.is_in_group("clavable"), "en la membrana se clava el bisturi")
	afirmar(not silleria.is_in_group("clavable"), "en la piedra, no")
	# La pared del campanario, la de la derecha y la que cierra el nicho.
	for celda in [Vector2i(0, 10), Vector2i(59, 30), Vector2i(44, 60)]:
		afirmar(membranas.get_cell_source_id(celda) != -1, "%s es membrana" % celda)
		afirmar_igual(silleria.get_cell_source_id(celda), -1, "%s ya no es piedra" % celda)
	atrio.free()


func test_la_nota_del_techo_solo_se_alcanza_con_el_techo() -> void:
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	var nota: Node2D = atrio.get_node("Notas/Pabellon7")
	afirmar(nota.texto.contains("Mano"), "cuenta la ley de la Mano que mira")
	afirmar(_solido_bajo(capa, nota.position), "la nota esta sobre su repisa")
	# La columna, de la repisa al suelo de abajo: desde abajo no se llega.
	for fila in range(47, 54):
		afirmar(capa.get_cell_source_id(Vector2i(10, fila)) != -1, "la columna cierra en la fila %d" % fila)
	# Y el techo, en reposo, tapa el paso por arriba: su base queda a ras de la
	# columna.
	var techo: Node2D = atrio.get_node("Muros/Techo")
	afirmar_igual(techo.position.y + techo.tiles.y * 16, 47 * 16.0, "el techo en reposo baja hasta la columna")
	atrio.free()


func test_la_lluvia_tibia_gotea_de_techos_sobre_suelo() -> void:
	const Ambiente := preload("res://scripts/ambiente.gd")
	var atrio := ESCENA.instantiate()
	var capa: TileMapLayer = atrio.get_node("Silleria")
	var puntos := Ambiente.puntos_de_goteo(capa)
	afirmar(puntos.size() >= 4, "gotea en varios sitios (%d)" % puntos.size())
	for p in puntos:
		# Donde se apaga la gota tiene que estar justo la cara del suelo.
		afirmar(_solido_bajo(capa, p[0] + Vector2(0, p[1])), "la gota de %s cae sobre piedra" % p[0])
	atrio.free()
