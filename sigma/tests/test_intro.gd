## La escena inicial: que se monte y que la portada empiece por ella.
extends "res://tests/caso.gd"


func test_la_portada_empieza_por_la_intro() -> void:
	var principal := preload("res://scripts/principal.gd")
	afirmar_igual(principal.DESTINOS[0][1], "res://escenas/intro.tscn", "Empezar lleva a la intro")


func test_la_intro_lleva_al_atrio() -> void:
	var intro := preload("res://scripts/intro.gd")
	afirmar_igual(intro.SIGUIENTE, "res://escenas/atrio.tscn", "y de la intro, al Atrio")
	afirmar(ResourceLoader.exists("res://escenas/intro.tscn"), "la escena existe")
