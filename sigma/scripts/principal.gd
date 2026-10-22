## La portada: un menu con lo que hay para jugar. Arriba y abajo eligen; saltar
## o interactuar entran.
extends Node2D

## [nombre, escena].
const DESTINOS := [
	["Empezar", "res://escenas/intro.tscn"],
	["El Atrio", "res://escenas/atrio.tscn"],
	["Sala del movimiento", "res://escenas/sala_prueba.tscn"],
	["Sala de la compactación", "res://escenas/sala_compactacion.tscn"],
]

var _elegido := 0

@onready var _menu: Label = $Menu


func _ready() -> void:
	_pintar()


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("abajo"):
		_elegido = (_elegido + 1) % DESTINOS.size()
		_pintar()
	elif evento.is_action_pressed("arriba"):
		_elegido = (_elegido - 1 + DESTINOS.size()) % DESTINOS.size()
		_pintar()
	elif evento.is_action_pressed("saltar") or evento.is_action_pressed("interactuar"):
		get_tree().change_scene_to_file(DESTINOS[_elegido][1])


func _pintar() -> void:
	var lineas := PackedStringArray()
	for i in DESTINOS.size():
		lineas.append(("›  %s  ‹" if i == _elegido else "%s") % DESTINOS[i][0])
	_menu.text = "\n".join(lineas)
