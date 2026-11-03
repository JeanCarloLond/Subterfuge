## La nina, donde solo el ojo la ve (#243): fuera de las visiones tambien esta,
## esperando donde quiere que vaya. Mirando, aparece de pie, en el blanco frio
## de las visiones; sin mirar, no hay nada. No habla ni hace: senala el camino
## estando ahi. Nunca actua sobre el mundo (canon).
extends Sprite2D

const Sacramento := preload("res://scripts/sacramento.gd")
const FIGURA := preload("res://arte/nina/figura.png")
const BLANCO := Color(0.78, 0.88, 0.96, 0.85)

var _visto := false


func _ready() -> void:
	texture = FIGURA
	centered = false
	offset = Vector2(-FIGURA.get_width() / 2.0, -FIGURA.get_height())
	modulate = Color(BLANCO, 0.0)
	add_to_group("a_la_vista")


func _process(_delta: float) -> void:
	var cirujano := get_tree().get_first_node_in_group("cirujano")
	var visto: bool = cirujano != null and cirujano.mirando
	if visto == _visto:
		return
	_visto = visto
	var fundido := create_tween()
	fundido.tween_property(self, "modulate:a", BLANCO.a if visto else 0.0, Sacramento.MIRADA["fundido_s"] * 2.0)
