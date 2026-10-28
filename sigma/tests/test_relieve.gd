## El vacio y las bajadas (#240): lo que el mapa dice sin palabras. Una caida
## que es camino lleva cadena; el vacio, niebla.
extends "res://tests/caso.gd"

const Relieve := preload("res://scripts/relieve.gd")


func _sala(ruta: String) -> Node:
	return load(ruta).instantiate()


func test_el_zigzag_del_pozo_es_plataformeo_sin_cadenas_ni_vacio() -> void:
	var pozo := _sala("res://escenas/nivel1/pozo.tscn")
	afirmar_igual(Relieve.bajadas(pozo).size(), 0, "sin cadenas")
	afirmar_igual(Relieve.huecos(pozo).size(), 0, "sin vacío")
	pozo.free()


func test_la_nave_tiene_su_vacio_y_sus_bajadas() -> void:
	var nave := _sala("res://escenas/nivel1/nave.tscn")
	afirmar(Relieve.huecos(nave).size() > 0, "hay vacío al fondo")
	afirmar(Relieve.bajadas(nave).size() > 0, "hay bajadas")
	nave.free()


func test_cada_bajada_acaba_en_suelo_y_no_en_el_vacio() -> void:
	for carpeta in ["res://escenas/nivel1", "res://escenas/nivel2"]:
		for archivo in DirAccess.get_files_at(carpeta):
			if not archivo.ends_with(".tscn"):
				continue
			var sala := _sala(carpeta.path_join(archivo))
			var capas := Relieve.capas(sala)
			for b in Relieve.bajadas(sala):
				var suelo := Vector2i(b["columna"], b["hasta"])
				afirmar(capas.any(func(c: TileMapLayer) -> bool: return c.get_cell_source_id(suelo) != -1), "%s: la bajada de la columna %d acaba en suelo" % [archivo, b["columna"]])
				afirmar(b["hasta"] - b["desde"] >= Relieve.MIN_BAJADA, "%s: solo las largas" % archivo)
				afirmar(b["hasta"] * Relieve.TILE < sala.limite_caida, "%s: por encima del límite de caída" % archivo)
			sala.free()
