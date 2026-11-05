## Lo que salta de la bandeja de un Remedo (#254): vuela en arco, hiere si da y
## se puede devolver con el parry. Contra la piedra se queda clavada un momento.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const R := Sacramento.REMEDO
const ACERO := Color(0.79, 0.81, 0.83)
const ACERO_LUZ := Color(0.95, 0.96, 0.97)
const LATON := Color(0.72, 0.6, 0.29)
const DURA_S := 2.0
const CLAVADA_S := 0.6

var velocidad := Vector2.ZERO
var objetivo: CharacterBody2D

var _vida := DURA_S
var _clavada := false
var _devuelta := false
var _consulta: PhysicsPointQueryParameters2D


## La velocidad con la que sale para llegar de `desde` a `hacia` en `vuelo` s.
static func lanzamiento(desde: Vector2, hacia: Vector2, vuelo: float, gravedad: float) -> Vector2:
	var d := hacia - desde
	return Vector2(d.x / vuelo, (d.y - 0.5 * gravedad * vuelo * vuelo) / vuelo)


func _ready() -> void:
	z_index = 5
	_consulta = PhysicsPointQueryParameters2D.new()
	_consulta.collision_mask = 1
	rotation = velocidad.angle()


func _physics_process(delta: float) -> void:
	_vida -= delta
	if _vida <= 0.0:
		queue_free()
		return
	if _clavada:
		modulate.a = minf(1.0, _vida / 0.3)
		return
	velocidad.y += R["gravedad"] * delta
	position += velocidad * delta
	rotation = velocidad.angle()
	if _toca_piedra():
		_clavada = true
		_vida = CLAVADA_S
		return
	if _devuelta or objetivo == null or not objetivo.caja().has_point(global_position):
		return
	var resultado: int = objetivo.recibir_golpe(global_position.x, R["dano"])
	if resultado == Cirujano.Resultado.PARADO:
		_devuelta = true
		velocidad = Vector2(-velocidad.x, -abs(velocidad.y) - 120.0)
	elif resultado == Cirujano.Resultado.HERIDO:
		queue_free()


func _toca_piedra() -> bool:
	if not is_inside_tree():
		return false
	_consulta.position = global_position
	return not get_world_2d().direct_space_state.intersect_point(_consulta, 1).is_empty()


func _draw() -> void:
	# Se tiene que ver en el aire: mango de laton y hoja, con su contorno.
	draw_rect(Rect2(-7, -2, 15, 4), Color(0.08, 0.05, 0.05))
	draw_rect(Rect2(-6, -1, 5, 2), LATON)
	draw_rect(Rect2(-1, -1, 6, 2), ACERO)
	draw_rect(Rect2(5, -1, 2, 1), ACERO_LUZ)
