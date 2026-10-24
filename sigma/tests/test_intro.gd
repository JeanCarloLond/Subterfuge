## La escena inicial: que se monte y que la portada empiece por ella.
extends "res://tests/caso.gd"


func test_la_portada_empieza_por_la_intro() -> void:
	var principal := preload("res://scripts/principal.gd")
	afirmar_igual(principal.INTRO, "res://escenas/intro.tscn", "Empezar lleva a la intro")


func test_la_intro_lleva_al_atrio() -> void:
	var intro := preload("res://scripts/intro.gd")
	afirmar_igual(intro.SIGUIENTE, "res://escenas/nivel1/pabellon.tscn", "y de la intro, al Pabellón N.º 7")
	afirmar(ResourceLoader.exists("res://escenas/intro.tscn"), "la escena existe")


func test_las_laminas_de_la_intro_son_mayores_que_la_pantalla() -> void:
	# Se panean: si fueran del tamano de la pantalla, se veria el borde.
	for nombre in ["manos", "rostro"]:
		var lamina: Texture2D = load("res://arte/cinematica/%s.png" % nombre)
		afirmar(lamina.get_width() > 640 and lamina.get_height() > 360, "%s cubre la pantalla al desplazarse" % nombre)
