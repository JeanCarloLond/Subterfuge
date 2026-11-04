## Las visiones de la nina (#188): cada una tiene que decir algo y saltar en
## su sitio. Lo que dicen, con sus dos lecturas, esta en docs/visiones.md.
extends "res://tests/caso.gd"

const PROHIBIDAS := ["NPC", "boss", "HP", "mana", "checkpoint", "stamina"]


func _visiones() -> Array:
	var halladas := []
	for carpeta in ["res://escenas/nivel1", "res://escenas/nivel2"]:
		for archivo in DirAccess.get_files_at(carpeta):
			if not archivo.ends_with(".tscn"):
				continue
			var sala: Node = load(carpeta.path_join(archivo)).instantiate()
			if sala.has_node("Visiones"):
				for vision in sala.get_node("Visiones").get_children():
					var disparo: Node = vision.get_node_or_null(vision.tras)
					# La senal se mira aqui: al liberar la sala, el nodo se va.
					var con_senal := disparo != null and disparo.has_signal(vision.senal)
					halladas.append([archivo, vision.id, vision.lineas, vision.zona, con_senal])
			sala.free()
	return halladas


func test_cada_vision_dice_algo_y_tiene_con_que_saltar() -> void:
	var ids := {}
	for v in _visiones():
		var archivo: String = v[0]
		var id: String = v[1]
		afirmar(not ids.has(id), "la visión «%s» no se repite" % id)
		ids[id] = true
		afirmar(not v[2].is_empty(), "%s/%s dice algo" % [archivo, id])
		for texto in v[2]:
			for prohibida in PROHIBIDAS:
				afirmar(not (" %s " % prohibida) in (" %s " % texto), "«%s» en: %s" % [prohibida, texto])
		var zona: Rect2 = v[3]
		afirmar(zona.has_area() or v[4], "%s/%s salta con algo" % [archivo, id])
	for id in ["laboratorio", "prior", "antesala", "tras-prior", "atajo"]:
		afirmar(ids.has(id), "está la visión «%s»" % id)


func test_la_de_la_antesala_salta_antes_de_la_pelea_y_la_del_atajo_en_su_entrada() -> void:
	var nave_libro: Node = load("res://escenas/nivel2/nave_libro.tscn").instantiate()
	var antesala: Rect2 = nave_libro.get_node("Visiones/Antesala").zona
	afirmar(antesala.end.x < nave_libro.inicio_x, "la antesala, antes de que empiece la pelea")
	afirmar(antesala.has_point(Vector2(antesala.get_center().x, nave_libro.get_node("Entradas/oeste").position.y)), "a la altura del suelo")
	nave_libro.free()
	var nave: Node = load("res://escenas/nivel1/nave.tscn").instantiate()
	var atajo: Node = nave.get_node("Visiones/Atajo")
	afirmar(atajo.zona.has_point(nave.get_node("Entradas/libro").position), "el atajo, donde se llega por él")
	afirmar_igual(atajo.pide_marca, "prior-vencido", "y solo tras vencer al Prior")
	nave.free()
