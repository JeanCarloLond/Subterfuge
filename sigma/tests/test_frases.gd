## Lo que dicen los enemigos al verlo (canon, «Por que lo atacan»): frases que
## caben sobre la cabeza y hablan como el mundo, no como un videojuego.
extends "res://tests/caso.gd"

const QUIENES := ["res://scripts/devoto.gd", "res://scripts/vestal.gd"]
const PROHIBIDAS := ["checkpoint", "hp", "boss", "mana", "npc", "stamina"]


func test_las_frases_caben_y_hablan_como_el_mundo() -> void:
	for ruta in QUIENES:
		var frases: Array = load(ruta).FRASES
		afirmar(frases.size() >= 3, "%s tiene con que variar" % ruta.get_file())
		for frase in frases:
			afirmar(frase.length() <= 28, "«%s» no cabe sobre la cabeza" % frase)
			for palabra in PROHIBIDAS:
				afirmar(not (" %s " % frase.to_lower()).contains(" %s " % palabra), "«%s» usa «%s»" % [frase, palabra])


## Las figuras del decorado que hablan al pasar (#239): lo mismo que los
## enemigos, que quepan y hablen como el mundo. Y que ninguna se quede muda.
func test_las_figuras_que_hablan_caben_y_hablan_como_el_mundo() -> void:
	var vistas := 0
	for carpeta in ["res://escenas/nivel1", "res://escenas/nivel2"]:
		for archivo in DirAccess.get_files_at(carpeta):
			if not archivo.ends_with(".tscn"):
				continue
			var escena: Node = load(carpeta.path_join(archivo)).instantiate()
			for nodo in escena.find_children("*", "Sprite2D", true, false):
				if nodo.get_script() == null or not nodo.get_script().resource_path.ends_with("figura.gd"):
					continue
				vistas += 1
				afirmar(not nodo.lineas.is_empty(), "%s/%s tiene qué decir" % [archivo, nodo.name])
				for frase in nodo.lineas:
					afirmar(frase.length() <= 28, "«%s» no cabe sobre la cabeza" % frase)
					for palabra in PROHIBIDAS:
						afirmar(not (" %s " % frase.to_lower()).contains(" %s " % palabra), "«%s» usa «%s»" % [frase, palabra])
			escena.free()
	afirmar(vistas >= 8, "las figuras que hablan siguen ahí (%d)" % vistas)
