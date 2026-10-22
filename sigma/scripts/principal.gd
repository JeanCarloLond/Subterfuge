## La portada: saltar entra en el Atrio (#185) e interactuar en la sala de
## prueba del movimiento (#182).
extends Node2D

const ATRIO := "res://escenas/atrio.tscn"
const SALA := "res://escenas/sala_prueba.tscn"


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("saltar"):
		get_tree().change_scene_to_file(ATRIO)
	elif evento.is_action_pressed("interactuar"):
		get_tree().change_scene_to_file(SALA)
