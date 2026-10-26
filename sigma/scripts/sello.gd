## El sello del diezmo: el proyectil de la Vestal. Vuela recto; si toca al
## Cirujano le hiere, salvo que lo pare con el parry: entonces sale rebotado,
## mas rapido, y hiere a quien lo lanzo (y la deja aturdida). Se deshace contra
## la piedra o al cabo de un rato, para no dejar basura volando.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const S := Sacramento.SELLO
const TEXTURA := preload("res://arte/vestal/sello.png")

var direccion := 1
var dueno: Node2D
var objetivo: CharacterBody2D
var devuelto := false

var _vida_ms: float = S["vida_ms"]
var _sprite: Sprite2D
var _consulta: PhysicsPointQueryParameters2D


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.texture = TEXTURA
	add_child(_sprite)
	z_index = 5


func _physics_process(delta: float) -> void:
	var velocidad: float = S["velocidad_devuelto"] if devuelto else S["velocidad"]
	position.x += direccion * velocidad * delta
	_sprite.rotation += direccion * 8.0 * delta
	_vida_ms -= delta * 1000.0
	if _vida_ms <= 0.0 or _choca_con_piedra():
		_deshacer()
		return
	if devuelto:
		_herir_enemigos()
	elif objetivo != null and objetivo.caja().has_point(position):
		var resultado: Cirujano.Resultado = objetivo.recibir_golpe(position.x, S["dano"])
		if resultado == Cirujano.Resultado.PARADO:
			devolver()
		elif resultado == Cirujano.Resultado.HERIDO:
			_deshacer()


## Parado: vuelve por donde vino, mas rapido.
func devolver() -> void:
	devuelto = true
	direccion = -direccion
	_vida_ms = S["vida_ms"]
	_sprite.modulate = Color(1.4, 1.3, 1.0)


func _herir_enemigos() -> void:
	for enemigo in get_tree().get_nodes_in_group("enemigos"):
		if enemigo.vivo() and enemigo.caja().has_point(position):
			enemigo.recibir_dano(S["dano_devuelto"], position.x - direccion)
			if enemigo == dueno and enemigo.has_method("aturdir") and enemigo.vivo():
				enemigo.aturdir()
			_deshacer()
			return


func _choca_con_piedra() -> bool:
	# Una consulta para todo el vuelo, no una por fotograma (#232).
	if _consulta == null:
		_consulta = PhysicsPointQueryParameters2D.new()
		_consulta.collision_mask = 1
	_consulta.position = global_position
	return not get_world_2d().direct_space_state.intersect_point(_consulta, 1).is_empty()


func _deshacer() -> void:
	set_physics_process(false)
	var irse := create_tween()
	irse.tween_property(self, "scale", Vector2(1.6, 1.6), 0.12)
	irse.parallel().tween_property(self, "modulate:a", 0.0, 0.12)
	irse.tween_callback(queue_free)
