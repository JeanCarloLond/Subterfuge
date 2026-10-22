## Los numeros del original siguen dando lo que daban: si cambian sin querer,
## el Cirujano deja de sentirse igual y nada mas lo avisa.
extends "res://tests/caso.gd"

const Sacramento := preload("res://scripts/sacramento.gd")


func test_el_salto_sube_92_px() -> void:
	afirmar_cerca(Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_salto"]), 92.45, 0.1, "salto")


func test_con_el_doble_salto_sube_unos_157() -> void:
	var simple := Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_salto"])
	var doble := Sacramento.altura_de_salto(Sacramento.MOVIMIENTO["impulso_doble_salto"])
	afirmar_cerca(simple + doble, 157.25, 0.1, "salto con doble salto")


func test_la_gravedad_del_proyecto_es_la_del_original() -> void:
	afirmar_igual(
		ProjectSettings.get_setting("physics/2d/default_gravity"),
		Sacramento.MOVIMIENTO["gravedad"],
		"gravedad de project.godot"
	)


func test_el_dash_avanza_unos_54_px() -> void:
	var avance: float = Sacramento.DASH["velocidad"] * Sacramento.DASH["duracion_ms"] / 1000.0
	afirmar_cerca(avance, 54.4, 0.1, "avance del dash")
