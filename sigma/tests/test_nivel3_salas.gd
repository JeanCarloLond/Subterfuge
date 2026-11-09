## Las Salas de Sacramento (#255): lo que cada una tiene que tener. Que se pueda
## pisar y que los pasos casen lo mira test_niveles.gd.
extends "res://tests/caso.gd"

const DIR := "res://escenas/nivel3/"
const Sacramento := preload("res://scripts/sacramento.gd")
const Objetivos := preload("res://scripts/objetivos.gd")
const TILE := 16.0


func _sala(nombre: String) -> Node:
	return load(DIR + nombre + ".tscn").instantiate()


func test_de_la_nave_se_baja_y_de_la_bajada_se_vuelve() -> void:
	var nave: Node = load("res://escenas/nivel2/nave_libro.tscn").instantiate()
	afirmar(nave.has_node("Entradas/abajo"), "la Nave tiene por donde volver")
	afirmar_igual(nave.fin, load("res://scripts/sala.gd").FIN, "la Nave ya no es el final")
	nave.free()
	var bajada := _sala("bajada")
	afirmar_igual(bajada.get_node("Pasos/Arriba").destino, "res://escenas/nivel2/nave_libro.tscn", "vuelve a la Nave")
	afirmar_igual(bajada.get_node("Pasos/Arriba").entrada, "abajo", "a su puerta")
	bajada.free()


func test_la_puerta_de_la_7_se_ve_y_no_se_alcanza_en_la_bajada() -> void:
	var bajada := _sala("bajada")
	var suelo := 23 * TILE
	var repisa := 8 * TILE
	afirmar(suelo - repisa > Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_salto"]) * 2.0, "ni con el Impulso")
	afirmar(bajada.has_node("Rotulo"), "lleva su número")
	bajada.free()


func test_el_pulmon_esta_en_la_5_y_ella_aparece_al_tomarlo() -> void:
	var sala := _sala("sala_5")
	afirmar_igual(sala.get_node("Reliquias/Pulmon").id, "pulmon", "el Pulmón")
	var vision: Node = sala.get_node("Visiones/Pulmon")
	afirmar_igual(vision.tras, NodePath("../../Reliquias/Pulmon"), "salta al tomarlo")
	afirmar_igual(vision.senal, "recogida", "con su señal")
	afirmar(sala.get_node("Atrezo").piezas.any(func(p: Array) -> bool: return p[0] == "relicario"), "en su relicario")
	sala.free()


func test_la_6_pide_los_dos_puentes_de_carne() -> void:
	var sala := _sala("sala_6")
	var puentes: Array = sala.get_node("Mirada").get_children().filter(func(n: Node) -> bool: return n is StaticBody2D)
	afirmar_igual(puentes.size(), 2, "dos puentes")
	sala.free()


func test_hay_asistentes_y_remedos_por_el_camino() -> void:
	var asistentes := 0
	var remedos := 0
	for nombre in ["bajada", "sala_1", "lavatorio", "sala_3", "sala_5", "sala_6", "antesala", "sala_7"]:
		var sala := _sala(nombre)
		for hijo in sala.get_node("Devotos").get_children():
			if hijo.get_script().resource_path.ends_with("asistente.gd"):
				asistentes += 1
		for hijo in sala.get_node("Peligros").get_children():
			if hijo.get_script().resource_path.ends_with("remedo.gd"):
				remedos += 1
		sala.free()
	afirmar(asistentes >= 4, "Asistentes: %d" % asistentes)
	afirmar(remedos >= 5, "Remedos: %d" % remedos)


func test_la_antesala_lleva_a_la_7_y_deja_su_objetivo() -> void:
	var sala := _sala("antesala")
	afirmar_igual(sala.get_node("Pasos/Adelante").destino, DIR + "sala_7.tscn", "a la N.º 7")
	var vision: Node = sala.get_node("Visiones/Antesala")
	afirmar_igual(vision.objetivo, "sala7", "el objetivo es suyo")
	afirmar(Objetivos.de_la_nina("sala7"), "y va en su color")
	sala.free()


func test_la_7_se_funde_con_el_pabellon_al_caer_el_decano() -> void:
	var sala := _sala("sala_7")
	afirmar(sala.has_node("Guardianes/Decano"), "el Decano espera")
	afirmar(sala.has_node("Decorado"), "vestida")
	var pabellon: Node = sala.get_node("Pasos/Pabellon")
	afirmar_igual(pabellon.destino, "res://escenas/nivel1/pabellon.tscn", "lleva al Pabellón")
	afirmar_igual(pabellon.pide_marca, "decano-vencido", "cuando cae el Decano")
	var vision: Node = sala.get_node("Visiones/TrasDecano")
	afirmar_igual(vision.senal, "cae", "ella habla al caer")
	sala.free()
	var casa: Node = load("res://escenas/nivel1/pabellon.tscn").instantiate()
	afirmar_igual(casa.get_node("Pasos/Sala7").destino, DIR + "sala_7.tscn", "y del Pabellón se vuelve")
	afirmar_igual(casa.get_node("Pasos/Sala7").pide_marca, "decano-vencido", "cerrado hasta entonces")
	afirmar(casa.get_node("Pasos/Sala7").escondido_hasta_abrir, "y escondido: no se toma por la salida")
	afirmar(casa.get_node("Pasos/Sala7").get_node_or_null(casa.get_node("Pasos/Sala7").puerta) != null, "con su umbral")
	afirmar_igual(casa.get_node("Visiones/Sala7").pide_marca, "decano-vencido", "ella solo habla después")
	casa.free()


func test_las_hojas_del_codice_esperan_al_doble_salto() -> void:
	var impulso: float = Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_salto"])
	for dato in [["res://escenas/nivel2/registro.tscn", "Notas/HojaCodiceRegistro", 24], ["res://escenas/nivel2/archivo.tscn", "Notas/HojaCodiceArchivo", 35]]:
		var sala: Node = load(dato[0]).instantiate()
		var nota: Node2D = sala.get_node(dato[1])
		var alto: float = dato[2] * TILE - nota.position.y
		afirmar(alto > impulso, "%s: con un salto no se llega (%d px)" % [dato[1], alto])
		afirmar(alto <= 150.0, "%s: con dos, sí (%d px)" % [dato[1], alto])
		sala.free()
