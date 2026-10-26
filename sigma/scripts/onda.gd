## La onda del diezmo (#219): el Prior golpea el suelo con el baculo y una ola
## de piedra corre por el, a un lado y al otro. Hiere a quien esta pisando
## el suelo cuando pasa: se salta.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const D := Sacramento.PRIOR["diezmo"]
const ALTO := 14.0
const COLOR := Color(0.62, 0.5, 0.42)

var direccion := 1
var objetivo: CharacterBody2D
## Hasta donde llega (x del mundo): las paredes de la nave.
var hasta := 0.0

var _tocado := false
var _t := 0.0


func _ready() -> void:
	z_index = 4


func _physics_process(delta: float) -> void:
	_t += delta
	position.x += direccion * D["velocidad"] * delta
	if (position.x - hasta) * direccion >= 0.0:
		queue_free()
		return
	if not _tocado and objetivo and objetivo.is_on_floor():
		var caja := Rect2(position.x - 6.0, position.y - ALTO, 12.0, ALTO)
		if caja.intersects(objetivo.caja()):
			_tocado = true
			objetivo.recibir_contacto(position.x - direccion * 8.0, D["dano"])
	queue_redraw()


func _draw() -> void:
	# Un tumulto de piedra que se levanta y cae, con polvo.
	var alto := ALTO * (0.7 + 0.3 * sin(_t * 30.0))
	draw_colored_polygon(PackedVector2Array([Vector2(-10, 0), Vector2(-4, -alto), Vector2(2, -alto * 0.7), Vector2(10, 0)]), COLOR)
	draw_line(Vector2(-12, 0), Vector2(12, 0), COLOR.darkened(0.4), 2.0)
