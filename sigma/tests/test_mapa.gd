## El mapa: el plano sigue a las salas (si no, hay que volver a correr
## herramientas/crear_plano.gd), las salas no se pisan, y lo explorado se
## guarda.
extends "res://tests/caso.gd"

const Plano := preload("res://scripts/plano.gd")
const Mapa := preload("res://scripts/mapa.gd")
const Progreso := preload("res://scripts/progreso.gd")
const RUTA_PRUEBA := "user://partida-de-prueba-mapa.cfg"
const NIVELES := ["nivel1", "nivel2", "nivel3"]


func _salas() -> Array[String]:
	var rutas: Array[String] = []
	for nivel in NIVELES:
		for archivo in DirAccess.get_files_at("res://escenas/" + nivel):
			if archivo.ends_with(".tscn"):
				rutas.append("res://escenas/%s/%s" % [nivel, archivo])
	return rutas


func test_cada_sala_esta_en_el_plano_con_su_tamano() -> void:
	for ruta in _salas():
		afirmar(Plano.SALAS.has(ruta), "%s no esta en el plano: corre herramientas/crear_plano.gd" % ruta)
		if not Plano.SALAS.has(ruta):
			continue
		var escena: Node = (load(ruta) as PackedScene).instantiate()
		var camara: Camera2D = escena.get_node("Cirujano/Camara")
		var tam := Vector2(camara.limit_right - camara.limit_left, camara.limit_bottom - camara.limit_top)
		afirmar_igual(Plano.SALAS[ruta]["rect"].size, tam, "el tamaño de %s en el plano" % ruta)
		escena.free()
	afirmar_igual(Plano.SALAS.size(), _salas().size(), "ni salas de mas en el plano")


func test_las_salas_no_se_pisan() -> void:
	var rutas := Plano.SALAS.keys()
	for i in rutas.size():
		for j in range(i + 1, rutas.size()):
			var a: Rect2 = Plano.SALAS[rutas[i]]["rect"]
			var b: Rect2 = Plano.SALAS[rutas[j]]["rect"]
			afirmar(not a.grow(-1.0).intersects(b), "%s pisa a %s" % [rutas[i], rutas[j]])


func test_cada_sala_tiene_nombre() -> void:
	for ruta in Plano.SALAS:
		afirmar(Mapa.nombre_de(ruta) != "", "%s sin nombre en el mapa" % ruta)


func test_lo_explorado_se_guarda() -> void:
	var antes: Node = Progreso.new()
	antes.ruta = RUTA_PRUEBA
	antes.nueva()
	antes.visitar("res://escenas/nivel1/pabellon.tscn")
	var despues: Node = Progreso.new()
	despues.ruta = RUTA_PRUEBA
	despues.cargar()
	afirmar(despues.visitada("res://escenas/nivel1/pabellon.tscn"), "la sala pisada sigue en el mapa")
	afirmar(not despues.visitada("res://escenas/nivel1/claustro.tscn"), "la que no, no")
	afirmar_igual(Mapa.visibles(despues), ["res://escenas/nivel1/pabellon.tscn"], "solo se dibuja lo visitado")
	antes.nueva()
	afirmar(not antes.visitada("res://escenas/nivel1/pabellon.tscn"), "una partida nueva empieza sin mapa")
	antes.free()
	despues.free()
