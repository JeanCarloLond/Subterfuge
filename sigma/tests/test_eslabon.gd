## Los ultimos eslabones (#187): cada enemigo de los niveles esta atado a lo
## que sostiene, y sus ultimas palabras caben y hablan como el mundo.
extends "res://tests/caso.gd"

const Eslabon := preload("res://scripts/eslabon.gd")
const Relieve := preload("res://scripts/relieve.gd")
const PROHIBIDAS := ["checkpoint", "hp", "boss", "mana", "npc", "stamina"]


func test_cada_eslabon_de_los_niveles_esta_atado() -> void:
	var vistos := {"devoto": 0, "vestal": 0, "prior": 0, "asistente": 0, "decano": 0}
	for carpeta in ["res://escenas/nivel1", "res://escenas/nivel2", "res://escenas/nivel3"]:
		for archivo in DirAccess.get_files_at(carpeta):
			if not archivo.ends_with(".tscn"):
				continue
			var sala: Node = load(carpeta.path_join(archivo)).instantiate()
			var capas := Relieve.capas(sala)
			for grupo in ["Devotos", "Vestales", "Guardianes"]:
				if not sala.has_node(grupo):
					continue
				for enemigo in sala.get_node(grupo).get_children():
					var de := Eslabon.tipo_de(enemigo)
					var anclas := Eslabon.buscar_anclas(capas, enemigo.position, de)
					vistos[de] += 1
					afirmar(not anclas.is_empty(), "%s/%s está atado" % [archivo, enemigo.name])
					if de == "prior":
						afirmar_igual(anclas.size(), 3, "el Prior, a su nave entera")
					for ancla in anclas:
						var pecho: Vector2 = enemigo.position + Eslabon.PECHO
						var alcance: int = Eslabon.ALCANCE_PRIOR if de == "prior" else Eslabon.ALCANCE
						afirmar(ancla.distance_to(pecho) <= alcance * Eslabon.TILE, "%s: el nudo, cerca" % enemigo.name)
			sala.free()
	afirmar(vistos["devoto"] > 0 and vistos["vestal"] > 0 and vistos["prior"] == 1, "hay de los tres: %s" % vistos)


func test_el_devoto_sostiene_la_boveda_y_la_vestal_el_muro() -> void:
	# En el Pozo hay techo cerca y muros a los lados: cada uno, a lo suyo.
	var pozo: Node = load("res://escenas/nivel1/pozo.tscn").instantiate()
	var capas := Relieve.capas(pozo)
	var pies := Vector2(240, 432)
	var techo: Vector2 = Eslabon.buscar_anclas(capas, pies, "devoto")[0]
	afirmar(techo.y < pies.y and absf(techo.x - pies.x) < 1.0, "el del Devoto sube recto al techo")
	var muro: Vector2 = Eslabon.buscar_anclas(capas, pies, "vestal")[0]
	afirmar(absf(muro.y - (pies.y + Eslabon.PECHO.y)) < 1.0, "el de la Vestal va recto al muro")
	pozo.free()


func test_sus_ultimas_palabras_caben_y_hablan_como_el_mundo() -> void:
	for de in Eslabon.ULTIMAS:
		for frase: String in Eslabon.ULTIMAS[de]:
			afirmar(frase.length() <= 28, "«%s» no cabe sobre la cabeza" % frase)
			for palabra in PROHIBIDAS:
				afirmar(not (" %s " % frase.to_lower()).contains(" %s " % palabra), "«%s» usa «%s»" % [frase, palabra])
