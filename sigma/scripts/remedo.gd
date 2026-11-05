## El Remedo (#254): instrumental de las Salas de Sacramento que salta de su
## bandeja cuando el Cirujano pasa cerca. Tiembla antes, y salta a donde estaba:
## quien sigue andando no se lleva nada, y quien se para lo puede devolver con el
## parry. Luego la bandeja queda vacia un rato.
##
## Arte provisional dibujado aqui, como la sierra.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const Pieza := preload("res://scripts/remedo_pieza.gd")
const R := Sacramento.REMEDO
const LATON := Color(0.72, 0.6, 0.29)
const LATON_LUZ := Color(0.93, 0.84, 0.54)
const LATON_SOMBRA := Color(0.36, 0.28, 0.11)
const ACERO := Color(0.79, 0.81, 0.83)

enum Estado { QUIETO, AVISO, RECARGA }

## A quien salta: el Cirujano. Si el nivel no lo pone, se busca.
var objetivo: CharacterBody2D
var estado := Estado.QUIETO
var ahora := 0.0

var _fin := 0.0
var _sonido: AudioStreamPlayer2D


func _ready() -> void:
	z_index = 2
	if objetivo == null:
		objetivo = get_tree().get_first_node_in_group("cirujano")
	_sonido = AudioStreamPlayer2D.new()
	_sonido.stream = Sonidos.traqueteo()
	_sonido.volume_db = -6.0
	add_child(_sonido)


func _physics_process(delta: float) -> void:
	if objetivo == null:
		return
	var antes := estado
	var salta := pensar(delta, objetivo.global_position)
	if antes == Estado.QUIETO and estado == Estado.AVISO:
		_sonido.play()
	if salta:
		_saltar(objetivo.global_position + Vector2(0, -14))
	if estado == Estado.AVISO or antes != estado:
		queue_redraw()


## Un paso: devuelve true cuando el instrumento salta. Va aparte para probarlo.
func pensar(delta: float, hacia: Vector2) -> bool:
	ahora += delta * 1000.0
	match estado:
		Estado.QUIETO:
			if cerca(hacia):
				estado = Estado.AVISO
				_fin = ahora + R["aviso_ms"]
		Estado.AVISO:
			if ahora >= _fin:
				estado = Estado.RECARGA
				_fin = ahora + R["recarga_ms"]
				return true
		Estado.RECARGA:
			if ahora >= _fin:
				estado = Estado.QUIETO
	return false


func cerca(hacia: Vector2) -> bool:
	var distancia := (hacia - global_position).abs() if is_inside_tree() else (hacia - position).abs()
	return distancia.x <= R["rango_x"] and distancia.y <= R["rango_y"]


func _saltar(hacia: Vector2) -> void:
	var pieza: Node2D = Pieza.new()
	pieza.position = position + Vector2(0, -16)
	pieza.velocidad = Pieza.lanzamiento(pieza.position, hacia - global_position + position, R["vuelo_s"], R["gravedad"])
	pieza.objetivo = objetivo
	get_parent().add_child(pieza)


func _draw() -> void:
	var tiembla := Vector2(sin(ahora / 18.0), absf(sin(ahora / 31.0)) * -2.0) if estado == Estado.AVISO else Vector2.ZERO
	# El pie de la bandeja y la bandeja.
	draw_rect(Rect2(-2, -10, 4, 10), LATON_SOMBRA)
	draw_rect(Rect2(-7, -2, 14, 2), LATON_SOMBRA)
	draw_rect(Rect2(-14, -14, 28, 1), LATON_LUZ)
	draw_rect(Rect2(-14, -13, 28, 2), LATON)
	draw_rect(Rect2(-12, -11, 24, 1), LATON_SOMBRA)
	if estado == Estado.RECARGA:
		return
	# Lo que lleva: un bisturi y una pinza. Tiemblan antes de saltar.
	draw_rect(Rect2(Vector2(-11, -16) + tiembla, Vector2(5, 2)), LATON)
	draw_rect(Rect2(Vector2(-6, -16) + tiembla, Vector2(7, 2)), ACERO)
	draw_rect(Rect2(Vector2(3, -17) - tiembla, Vector2(8, 1)), LATON_LUZ)
	draw_rect(Rect2(Vector2(3, -15) - tiembla, Vector2(8, 1)), LATON_LUZ)
