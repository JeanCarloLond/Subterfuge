## El guardado (#193 lo dejo pendiente): las reliquias y el ultimo Altar
## sobreviven a cerrar el juego, y «Empezar» los borra.
extends "res://tests/caso.gd"

const Progreso := preload("res://scripts/progreso.gd")
const RUTA_PRUEBA := "user://partida-de-prueba.cfg"


func _progreso() -> Node:
	var progreso: Node = Progreso.new()
	progreso.ruta = RUTA_PRUEBA
	progreso.nueva()
	return progreso


func test_lo_ganado_se_guarda_y_se_vuelve_a_leer() -> void:
	var antes := _progreso()
	antes.ganar("pulmon")
	antes.rezar_en("res://escenas/atrio.tscn", "Bajada")
	var despues: Node = Progreso.new()
	despues.ruta = RUTA_PRUEBA
	despues.cargar()
	afirmar(despues.tiene("pulmon"), "la reliquia sigue")
	afirmar(not despues.tiene("tendon"), "la que no se tomo, no")
	afirmar(despues.hay_partida(), "hay partida")
	afirmar_igual(despues.sala, "res://escenas/atrio.tscn", "la sala del ultimo rezo")
	afirmar_igual(despues.altar, "Bajada", "y su Altar")
	antes.nueva()
	antes.free()
	despues.free()


func test_empezar_borra_la_partida() -> void:
	var progreso := _progreso()
	progreso.ganar("tendon")
	progreso.rezar_en("res://escenas/atrio.tscn", "Entrada")
	progreso.nueva()
	afirmar(not progreso.hay_partida(), "sin partida")
	afirmar(not progreso.tiene("tendon"), "sin reliquias")
	afirmar(not FileAccess.file_exists(RUTA_PRUEBA), "y sin archivo")
	progreso.free()


func test_sin_archivo_no_hay_partida() -> void:
	var progreso := _progreso()
	progreso.cargar()
	afirmar(not progreso.hay_partida(), "nada guardado")
	progreso.free()
