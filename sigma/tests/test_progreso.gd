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


func test_las_notas_leidas_se_guardan() -> void:
	var antes := _progreso()
	antes.leer("registro-pabellon-7")
	var despues: Node = Progreso.new()
	despues.ruta = RUTA_PRUEBA
	despues.cargar()
	afirmar(despues.leida("registro-pabellon-7"), "la nota sigue leida")
	afirmar(not despues.leida("otra"), "la que no se leyo, no")
	antes.nueva()
	antes.free()
	despues.free()


## La demo y las salas de prueba juegan aparte (#230): lo que se toma en ellas
## no llega a la partida, y al volver a la portada vuelve la de verdad.
func test_la_demo_no_toca_la_partida() -> void:
	var progreso: Node = Progreso.new()
	progreso.ruta = Progreso.RUTA_DEMO
	progreso.nueva()
	progreso.ganar("pulmon")
	afirmar_igual(progreso.ruta, Progreso.RUTA_DEMO, "la demo guarda en su archivo")
	progreso.usar_demo()
	afirmar(not progreso.tiene("pulmon"), "cada demo empieza en blanco")
	progreso.nueva()
	progreso.free()
