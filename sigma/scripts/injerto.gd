## Un injerto de metal en vuelo (#191, #219). El del Cirujano sale recto de la
## Injertadora y hiere a los enemigos; el del Prior sale en arco, con gravedad,
## y hiere al Cirujano (no se para con el parry: es metal, no un sello). Se
## deshace contra la piedra o al cabo de un rato.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const TEXTURA := preload("res://arte/provisional/injerto.png")

var velocidad := Vector2.ZERO
var gravedad := 0.0
var dano := 1
var vida_ms: float = Sacramento.INJERTADORA["vida_ms"]
## Del Cirujano (hiere a los enemigos) o contra el (lo lleva el Prior).
var del_cirujano := true
## A quien hiere si no es del Cirujano.
var objetivo: CharacterBody2D

var _sprite: Sprite2D


func _ready() -> void:
	z_index = 5
	_sprite = Sprite2D.new()
	_sprite.texture = TEXTURA
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	add_child(_sprite)


func _physics_process(delta: float) -> void:
	velocidad.y += gravedad * delta
	position += velocidad * delta
	_sprite.rotation = velocidad.angle()
	vida_ms -= delta * 1000.0
	if vida_ms <= 0.0 or _choca_con_piedra():
		queue_free()
		return
	if del_cirujano:
		for enemigo in get_tree().get_nodes_in_group("enemigos"):
			if enemigo.vivo() and enemigo.caja().has_point(position):
				enemigo.recibir_dano(dano, position.x - signf(velocidad.x))
				queue_free()
				return
	elif objetivo and objetivo.caja().has_point(position):
		objetivo.recibir_contacto(position.x - signf(velocidad.x), dano)
		queue_free()


func _choca_con_piedra() -> bool:
	var consulta := PhysicsPointQueryParameters2D.new()
	consulta.position = global_position
	consulta.collision_mask = 1
	return not get_world_2d().direct_space_state.intersect_point(consulta, 1).is_empty()
