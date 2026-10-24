## El Nivel I (#218): que cada sala se pueda pisar y que los pasos casen. Cada
## paso lleva a una sala que existe y a una entrada que existe; cada entrada
## esta sobre piedra (o cae a ella) y fuera de su propio paso, para no rebotar.
extends "res://tests/caso.gd"

const DIR := "res://escenas/nivel1/"
const SALAS := ["pabellon", "claustro", "nave", "pozo", "capilla", "muro", "escalera", "umbral"]


func _solido_bajo(capa: TileMapLayer, pies: Vector2) -> bool:
	return capa.get_cell_source_id(capa.local_to_map(pies + Vector2(0, 8))) != -1


## Si cayendo desde `pies` se llega a piedra antes de 10 tiles (sin dano).
func _cae_a_piedra(capa: TileMapLayer, pies: Vector2) -> bool:
	for i in 10:
		if _solido_bajo(capa, pies + Vector2(0, i * 16)):
			return true
	return false


func _caja(pies: Vector2) -> Rect2:
	return Rect2(pies.x - 5.0, pies.y - 22.0, 10.0, 22.0)


func test_cada_paso_lleva_a_una_entrada_que_existe() -> void:
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		for paso in sala.get_node("Pasos").get_children():
			if paso.destino == "":
				continue
			afirmar(ResourceLoader.exists(paso.destino), "%s/%s lleva a %s, que no existe" % [nombre, paso.name, paso.destino])
			if not ResourceLoader.exists(paso.destino):
				continue
			var otra: Node = load(paso.destino).instantiate()
			afirmar(otra.has_node("Entradas/" + paso.entrada), "%s/%s: %s no tiene la entrada %s" % [nombre, paso.name, paso.destino, paso.entrada])
			otra.free()
		sala.free()


func test_lo_que_se_pisa_esta_sobre_piedra() -> void:
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		var capa: TileMapLayer = sala.get_node("Silleria")
		afirmar(_solido_bajo(capa, sala.get_node("Cirujano").position), "%s: el Cirujano empieza de pie" % nombre)
		for grupo in ["Altares", "Devotos", "Vestales", "Charlas", "Notas"]:
			if not sala.has_node(grupo):
				continue
			for pieza in sala.get_node(grupo).get_children():
				afirmar(_solido_bajo(capa, pieza.position), "%s: %s/%s" % [nombre, grupo, pieza.name])
		for grupo in ["Devotos", "Vestales"]:
			for pieza in sala.get_node(grupo).get_children():
				for x in [pieza.ronda_izquierda, pieza.ronda_derecha]:
					afirmar(_solido_bajo(capa, Vector2(x, pieza.position.y)), "%s: la ronda de %s llega a %s" % [nombre, pieza.name, x])
		sala.free()


func test_cada_entrada_cae_a_piedra_y_no_esta_en_su_paso() -> void:
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		var capa: TileMapLayer = sala.get_node("Silleria")
		for entrada in sala.get_node("Entradas").get_children():
			afirmar(_cae_a_piedra(capa, entrada.position), "%s: la entrada %s no tiene suelo debajo" % [nombre, entrada.name])
			for paso in sala.get_node("Pasos").get_children():
				if paso.con_e:
					continue
				afirmar(not paso.caja().intersects(_caja(entrada.position)), "%s: la entrada %s esta en el paso %s" % [nombre, entrada.name, paso.name])
		sala.free()


func test_el_nivel_empieza_en_el_pabellon_y_termina_en_el_umbral() -> void:
	var intro: GDScript = load("res://scripts/intro.gd")
	afirmar_igual(intro.SIGUIENTE, DIR + "pabellon.tscn", "la intro lleva al Pabellón")
	var umbral: Node = load(DIR + "umbral.tscn").instantiate()
	var finales := umbral.get_node("Pasos").get_children().filter(func(p: Node) -> bool: return p.destino == "")
	afirmar_igual(finales.size(), 1, "el Umbral tiene el final")
	umbral.free()


func test_sin_reliquias_en_el_nivel_1() -> void:
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		afirmar(not sala.has_node("Reliquias") or sala.get_node("Reliquias").get_child_count() == 0, "%s tiene reliquias" % nombre)
		sala.free()


## Cada canto de membrana se puede trepar: encima de su arista, y en la columna
## de al lado por donde se sube, dos tiles libres. Si una piedra de otro tramo
## toca esa esquina, el cuerpo no pasa (asi fallo el Pozo la primera vez).
func test_cada_canto_de_membrana_se_puede_trepar() -> void:
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		var piedra: TileMapLayer = sala.get_node("Silleria")
		var membrana: TileMapLayer = sala.get_node("Membranas")
		var lleno := func(celda: Vector2i) -> bool:
			return piedra.get_cell_source_id(celda) != -1 or membrana.get_cell_source_id(celda) != -1
		for celda in membrana.get_used_cells():
			# Solo las aristas: una membrana con piedra encima es una pared bajo
			# un saliente (el campanario de la Nave), no un canto que trepar.
			if lleno.call(celda + Vector2i.UP):
				continue
			# La arista de arriba del canto. Se trepa desde el lado con aire.
			for lado in [-1, 1]:
				if lleno.call(celda + Vector2i(lado, 0)):
					continue
				for alto in [1, 2]:
					for dx in [0, lado]:
						var encima: Vector2i = celda + Vector2i(dx, -alto)
						afirmar(not lleno.call(encima), "%s: el canto de %s no se trepa, %s esta lleno" % [nombre, celda, encima])
		sala.free()
