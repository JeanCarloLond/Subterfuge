## La portada: con saltar se entra en la sala de prueba (#182) mientras no
## haya un nivel de verdad.
extends Node2D

const SALA := "res://escenas/sala_prueba.tscn"


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("saltar"):
		get_tree().change_scene_to_file(SALA)
