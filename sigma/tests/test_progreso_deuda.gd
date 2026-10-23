## La deuda de carne se guarda con la partida y se salda.
extends "res://tests/caso.gd"

const Progreso := preload("res://scripts/progreso.gd")
const RUTA := "user://prueba-deuda.cfg"


func test_la_deuda_se_guarda_y_se_salda() -> void:
	var progreso := Progreso.new()
	progreso.ruta = RUTA
	progreso.endeudar("res://escenas/atrio.tscn", Vector2(120, 288))
	var otro := Progreso.new()
	otro.ruta = RUTA
	otro.cargar()
	afirmar_igual(otro.deuda.get("sala", ""), "res://escenas/atrio.tscn", "la sala se guarda")
	afirmar_igual(otro.deuda.get("sitio", Vector2.ZERO), Vector2(120, 288), "y el sitio")
	otro.saldar()
	progreso.cargar()
	afirmar(progreso.deuda.is_empty(), "saldada, no queda")
	progreso.nueva()
	progreso.free()
	otro.free()
