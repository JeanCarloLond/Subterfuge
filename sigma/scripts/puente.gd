## Un puente de carne (#243): lo que el templo ya esta formando al unirse, y
## que solo se ve, y solo sostiene, mirando con el ojo de los Mil. Se pisa
## desde arriba y se atraviesa desde abajo, como una repisa. Si se deja de
## mirar encima de el, se cae.
extends StaticBody2D

const Sacramento := preload("res://scripts/sacramento.gd")
const TEXTURA := preload("res://arte/mirada/puente.png")

## Cuantas baldosas mide de ancho. `position` es su borde de arriba a la
## izquierda, donde se pisa.
@export var ancho := 3

var _figura: Sprite2D
var _caja: CollisionShape2D
var _visto := false


func _ready() -> void:
	_figura = Sprite2D.new()
	_figura.texture = TEXTURA
	_figura.centered = false
	_figura.region_enabled = true
	_figura.region_rect = Rect2(0, 0, ancho * 16, TEXTURA.get_height())
	_figura.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	_figura.position = Vector2(0, -1)
	_figura.modulate.a = 0.0
	add_child(_figura)
	_caja = CollisionShape2D.new()
	var forma := RectangleShape2D.new()
	forma.size = Vector2(ancho * 16, 6)
	_caja.shape = forma
	_caja.position = Vector2(ancho * 8, 3)
	_caja.one_way_collision = true
	_caja.disabled = true
	add_child(_caja)
	add_to_group("a_la_vista")


func _physics_process(_delta: float) -> void:
	var cirujano := get_tree().get_first_node_in_group("cirujano")
	var visto: bool = cirujano != null and cirujano.mirando
	if visto == _visto:
		return
	_visto = visto
	_caja.set_deferred("disabled", not visto)
	var fundido := create_tween()
	fundido.tween_property(_figura, "modulate:a", 1.0 if visto else 0.0, Sacramento.MIRADA["fundido_s"])


## Si ahora sostiene: para los tests y para quien lo mire desde fuera.
func solido() -> bool:
	return _visto
