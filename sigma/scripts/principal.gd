## La portada: un menu con lo que hay para jugar. Arriba y abajo eligen; saltar
## o interactuar entran. Si hay una partida guardada, «Continuar» vuelve al
## ultimo Altar; «Empezar» abre una nueva.
extends Node2D

const INTRO := "res://escenas/intro.tscn"
## [nombre, escena]. Las salas de prueba, para quien desarrolla.
const SALAS := [
	["El Atrio", "res://escenas/atrio.tscn"],
	["Sala del movimiento", "res://escenas/sala_prueba.tscn"],
	["Sala de la compactación", "res://escenas/sala_compactacion.tscn"],
]

var _destinos := []
var _elegido := 0

@onready var _menu: Label = $Menu


func _ready() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.hay_partida():
		_destinos.append(["Continuar", progreso.sala])
	_destinos.append(["Empezar", INTRO])
	_destinos.append_array(SALAS)
	_pintar()
	var musica := get_node_or_null("/root/Musica")
	if musica:
		musica.poner("vientre-humedo-mazmorra")


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("abajo"):
		_elegido = (_elegido + 1) % _destinos.size()
		_pintar()
	elif evento.is_action_pressed("arriba"):
		_elegido = (_elegido - 1 + _destinos.size()) % _destinos.size()
		_pintar()
	elif evento.is_action_pressed("saltar") or evento.is_action_pressed("interactuar"):
		var destino: Array = _destinos[_elegido]
		var progreso := get_node_or_null("/root/Progreso")
		if destino[0] == "Empezar" and progreso:
			progreso.nueva()
		get_tree().change_scene_to_file(destino[1])


func _pintar() -> void:
	var lineas := PackedStringArray()
	for i in _destinos.size():
		lineas.append(("›  %s  ‹" if i == _elegido else "%s") % _destinos[i][0])
	_menu.text = "\n".join(lineas)
