## Los niveles (#218, #190): que cada sala se pueda pisar y que los pasos
## casen. Cada paso lleva a una sala que existe y a una entrada que existe; cada
## entrada esta sobre piedra (o cae a ella) y fuera de su propio paso, para no
## rebotar.
extends "res://tests/caso.gd"

const DIR := "res://escenas/"
const SALAS := [
	"nivel1/pabellon", "nivel1/claustro", "nivel1/nave", "nivel1/pozo", "nivel1/capilla",
	"nivel1/muro", "nivel1/escalera", "nivel1/umbral",
	"nivel2/registro", "nivel2/escribania", "nivel2/sorteos", "nivel2/archivo",
	"nivel2/pasillo", "nivel2/ala", "nivel2/laboratorio", "nivel2/nave_libro",
]


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


func test_empieza_en_el_pabellon_y_lo_hecho_acaba_tras_el_laboratorio() -> void:
	var intro: GDScript = load("res://scripts/intro.gd")
	afirmar_igual(intro.SIGUIENTE, DIR + "nivel1/pabellon.tscn", "la intro lleva al Pabellón")
	var finales := 0
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		for paso in sala.get_node("Pasos").get_children():
			if paso.destino == "":
				finales += 1
				afirmar_igual(nombre, "nivel2/nave_libro", "el final está tras el Prior")
				afirmar_igual(paso.pide_marca, "prior-vencido", "y pide haberlo vencido")
		sala.free()
	afirmar_igual(finales, 1, "un solo final")
	var ala: Node = load(DIR + "nivel2/ala.tscn").instantiate()
	afirmar_igual(ala.get_node("Pasos/Laboratorio").pide_objetivo, "registros", "la puerta del laboratorio pide los registros")
	ala.free()


## El laboratorio (#225): el Pulmon en su pedestal dispara la primera vision,
## que deja un objetivo de la nina; el cartel del Impulso sale despues de ella,
## y la salida esta donde solo llega el doble salto.
func test_el_laboratorio_da_el_pulmon_y_la_primera_vision() -> void:
	var Objetivos: GDScript = load("res://scripts/objetivos.gd")
	var Sacramento: GDScript = load("res://scripts/sacramento.gd")
	var lab: Node = load(DIR + "nivel2/laboratorio.tscn").instantiate()
	var pulmon: Node = lab.get_node("Reliquias/Pulmon")
	afirmar_igual(pulmon.id, "pulmon", "el artefacto es el Pulmón Vacío")
	var vision: Node = lab.get_node("Visiones/Primera")
	afirmar_igual(vision.get_node(vision.tras), pulmon, "la visión la dispara el Pulmón")
	afirmar(Objetivos.de_la_nina(vision.objetivo), "y deja un objetivo de la niña")
	for texto in vision.lineas:
		for prohibida in ["NPC", "boss", "HP", "mana", "checkpoint", "stamina"]:
			afirmar(not (" %s " % prohibida) in (" %s " % texto), "«%s» en: %s" % [prohibida, texto])
	afirmar_igual(lab.get_node("Carteles/Impulso").despues_de, "vision-laboratorio", "el cartel del Impulso, tras la visión")
	var salida: Node = lab.get_node("Pasos/Nave")
	var suelo := 25 * 16.0
	var alto: float = suelo - (salida.position.y + salida.zona.y)
	afirmar(alto > Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_salto"]), "la salida no se alcanza de un salto (%s px)" % alto)
	lab.free()


## El cierre del Pasillo (#190): sella de verdad (sus techos cubren el pasillo
## de lado a lado, sin hueco por arriba) y no deja encerrado (del lado bueno
## hay un Altar y un atajo de vuelta, y el Registro solo lo abre desde alli).
func test_el_cierre_sella_y_no_deja_encerrado() -> void:
	var pasillo: Node = load(DIR + "nivel2/pasillo.tscn").instantiate()
	var capa: TileMapLayer = pasillo.get_node("Silleria")
	var primero: Node = pasillo.get_node("Muros/Techo0")
	var cerrado := Rect2(primero.position + primero.direccion * primero.recorrido, Vector2(primero.tiles * 16))
	# Encima y debajo del muro cerrado, piedra: no se pasa por arriba ni por abajo.
	afirmar(capa.get_cell_source_id(Vector2i(int(cerrado.position.x / 16), int(cerrado.end.y / 16))) != -1, "suelo bajo el cierre")
	afirmar_igual(cerrado.position.y, 8.0 * 16, "baja hasta el techo del pasillo")
	afirmar_igual(cerrado.end.y, 14.0 * 16, "y llega al suelo")
	afirmar(pasillo.get_node("Cierre").marca != "", "el cierre se recuerda")
	pasillo.free()
	var ala: Node = load(DIR + "nivel2/ala.tscn").instantiate()
	afirmar(ala.get_node("Altares").get_child_count() > 0, "el Ala tiene Altar")
	afirmar_igual(ala.marca_al_entrar, "pasillo-sellado", "y se sella al llegar a ella")
	ala.free()
	var registro: Node = load(DIR + "nivel2/registro.tscn").instantiate()
	# Lo que abre el atajo es lo mismo que sella el pasillo: no hay un momento en
	# que el pasillo este sellado y el atajo cerrado (#227).
	afirmar_igual(registro.get_node("Pasos/Atajo").pide_marca, "pasillo-sellado", "el atajo se abre al sellarse el pasillo")
	afirmar_igual(registro.get_node("Pasos/Pasillo").sellado_por, "pasillo-sellado", "el pasillo, sellado, ya no se abre")
	registro.free()


func test_los_tres_registros_cuentan() -> void:
	var cuentan := 0
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		for nota in sala.get_node("Notas").get_children():
			if nota.cuenta == "registros":
				cuentan += 1
		sala.free()
	afirmar_igual(cuentan, 3, "tres registros de Génesis")


func test_sin_reliquias_en_el_nivel_1() -> void:
	for nombre in SALAS.filter(func(s: String) -> bool: return s.begins_with("nivel1")):
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


## Los carteles de controles (#221): sobre piedra, con todas las acciones que
## nombran escritas bien (si no, saldria «{saltr}» en pantalla) y con id unico.
func test_los_carteles_nombran_acciones_que_existen() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	var ids := {}
	for nombre in SALAS:
		var sala: Node = load(DIR + nombre + ".tscn").instantiate()
		if not sala.has_node("Carteles"):
			sala.free()
			continue
		var capa: TileMapLayer = sala.get_node("Silleria")
		for cartel in sala.get_node("Carteles").get_children():
			afirmar(_solido_bajo(capa, cartel.position), "%s: el cartel %s" % [nombre, cartel.name])
			var leido: String = Controles.rellenar(cartel.texto)
			afirmar(not "{" in leido and not "?" in leido, "%s: el cartel %s dice «%s»" % [nombre, cartel.name, leido])
			for accion in cartel.aprende.split(",", false):
				afirmar(InputMap.has_action(accion.strip_edges()), "%s: %s aprende con %s, que no existe" % [nombre, cartel.name, accion])
			afirmar(not ids.has(cartel.id), "el cartel %s esta repetido" % cartel.id)
			ids[cartel.id] = true
		sala.free()
