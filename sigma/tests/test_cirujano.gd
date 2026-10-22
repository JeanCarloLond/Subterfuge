## La escena del Cirujano (#182): la caja que choca es la del original.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/cirujano.tscn")


func test_la_caja_mide_10_por_22_con_los_pies_en_el_origen() -> void:
	var cirujano := ESCENA.instantiate()
	var caja: CollisionShape2D = cirujano.get_node("Caja")
	afirmar_igual(caja.shape.size, Vector2(10, 22), "tamano de la caja")
	afirmar_igual(caja.position.y + caja.shape.size.y / 2.0, 0.0, "el borde de abajo en los pies")
	cirujano.free()


func test_empieza_con_la_vitalidad_entera() -> void:
	var cirujano := ESCENA.instantiate()
	afirmar_igual(cirujano.vitalidad, 6, "vitalidad al empezar")
	cirujano.free()
