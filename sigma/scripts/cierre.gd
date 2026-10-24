## Un cierre (#190): al pasar por su zona, dispara sus muros (que no laten:
## esperan, avisan y se mueven una sola vez). Asi se sella el camino de vuelta
## y, si hay un segundo muro, empieza la persecucion. Si la `marca` ya esta en
## Progreso, el cierre ya ocurrio: los muros aparecen donde acabaron.
extends Node2D

## La zona que lo dispara, desde la posicion (esquina de arriba a la izquierda).
@export var zona := Vector2(32, 96)
## Los muros que dispara (muro.gd, con ciclico = false).
@export var muros: Array[NodePath] = []
## La marca que dice que ya se cerro (vacio: no se recuerda).
@export var marca := ""
## Lo que espera cada muro tras el anterior (s): con varios, una ola.
@export var cada_s := 0.0

## Quien lo dispara: el Cirujano. Si la sala no lo pone, se busca.
var cirujano: CharacterBody2D

var _disparado := false


func _ready() -> void:
	if cirujano == null:
		cirujano = get_tree().get_first_node_in_group("cirujano")
	var progreso := get_node_or_null("/root/Progreso")
	if marca != "" and progreso and progreso.aprendido(marca):
		_disparado = true
		for ruta in muros:
			var muro := get_node(ruta)
			muro.position += muro.direccion * muro.recorrido


func _physics_process(_delta: float) -> void:
	if _disparado or cirujano == null:
		return
	if Rect2(global_position, zona).has_point(cirujano.global_position):
		_disparado = true
		for i in muros.size():
			var muro := get_node(muros[i])
			if i == 0 or cada_s <= 0.0:
				muro.disparar()
			else:
				get_tree().create_timer(cada_s * i).timeout.connect(muro.disparar)
