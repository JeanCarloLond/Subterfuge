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
