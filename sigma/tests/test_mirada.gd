## Mirar con el ojo de los Mil (#243): se ve lo que los demas no, y la ley se
## cumple sola. Los eslabones lo sienten de mas lejos.
extends "res://tests/caso.gd"

const Sacramento := preload("res://scripts/sacramento.gd")
const DEVOTO := preload("res://escenas/devoto.tscn")
const CIRUJANO := preload("res://escenas/cirujano.tscn")


func test_mirando_el_devoto_lo_siente_de_mas_lejos() -> void:
	var devoto := DEVOTO.instantiate()
	var cirujano := CIRUJANO.instantiate()
	devoto.position = Vector2(0, 0)
	devoto.objetivo = cirujano
	var lejos := Vector2(Sacramento.DEVOTO["rango_deteccion"] * 1.5, 0)
	cirujano.mirando = false
	afirmar(not devoto._detecta(lejos), "sin mirar, a 1,5 veces no lo ve")
	cirujano.mirando = true
	afirmar(devoto._detecta(lejos), "mirando, sí")
	afirmar(not devoto._detecta(lejos * 1.3), "pero no sin límite")
	devoto.free()
	cirujano.free()


func test_mirar_cuesta_y_no_regala() -> void:
	afirmar(Sacramento.MIRADA["vista"] > 1.0, "lo sienten de más lejos")
	afirmar(Sacramento.MIRADA["muros"] > 1.0, "los muros se adelantan")


func test_mirar_es_la_o() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	afirmar(Controles.ACCIONES.has("mirar"), "hay acción de mirar")
	afirmar(KEY_O in Controles.ACCIONES["mirar"]["teclas"], "con la O")


## Lo que ella pide se lee del rojo de su venda, no del blanco de sus visiones.
func test_los_objetivos_de_la_nina_van_en_rojo() -> void:
	var Objetivos: GDScript = load("res://scripts/objetivos.gd")
	var Interfaz: GDScript = load("res://scripts/interfaz.gd")
	var rojo: Color = Objetivos.COLOR_NINA
	afirmar(rojo.r > rojo.g and rojo.r > rojo.b, "rojo")
	afirmar(rojo != Interfaz.BLANCO_VISION, "distinto del tinte de las visiones")
