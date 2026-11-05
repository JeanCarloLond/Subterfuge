## La cortina del Lavatorio (#255): agua de carne que cae del techo a ratos. Gotea
## antes de caer y se cruza a tiempo, con el mismo ritmo que el rayo de Genesis,
## pero es de otro mundo: espesa, roja y sin luz propia.
##
## Arte provisional dibujado aqui, como la sierra.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Peligros := preload("res://scripts/peligros.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const ANCHO := 12.0
const CARNE := Color(0.5, 0.11, 0.1)
const CARNE_LUZ := Color(0.72, 0.24, 0.2)
const CARNE_SOMBRA := Color(0.27, 0.05, 0.05)
const CANO := Color(0.3, 0.24, 0.13)

@export var largo := 96.0
## Para que dos seguidas no caigan a la par (ms).
@export var desfase_ms := 0.0

## A quien moja: el Cirujano. Si el nivel no lo pone, se busca.
var objetivo: CharacterBody2D

var _ms := 0.0
var _fase: int = Peligros.Fase.APAGADO
var _avance := 0.0
var _chorro: AudioStreamPlayer2D


func _ready() -> void:
	z_index = 3
	if objetivo == null:
		objetivo = get_tree().get_first_node_in_group("cirujano")
	_chorro = AudioStreamPlayer2D.new()
	_chorro.stream = Sonidos.crujido()
	_chorro.volume_db = -8.0
	_chorro.max_distance = 320.0
	_chorro.position = Vector2(0, largo / 2.0)
	add_child(_chorro)


func _physics_process(delta: float) -> void:
	_ms += delta * 1000.0
	var antes := _fase
	var fase := Peligros.fase_rayo(_ms, desfase_ms)
	_fase = fase[0]
	_avance = fase[1]
	if _fase != antes and _fase == Peligros.Fase.ACTIVO:
		_chorro.play()
	if _fase == Peligros.Fase.ACTIVO and objetivo and zona().intersects(objetivo.caja()):
		objetivo.recibir_contacto(global_position.x)
	queue_redraw()


## Lo que moja, en el mundo.
func zona() -> Rect2:
	return Rect2(global_position.x - ANCHO / 2.0, global_position.y, ANCHO, largo)


func cayendo() -> bool:
	return _fase == Peligros.Fase.ACTIVO


func _draw() -> void:
	match _fase:
		Peligros.Fase.AVISO:
			# Las gotas: pocas al principio, y cada vez mas seguidas.
			for i in 2 + int(_avance * 5.0):
				var y := fposmod(_ms * 0.35 + i * 53.0, largo)
				draw_rect(Rect2(-4.0 + (i * 37) % 9, y, 1, 3), CARNE_LUZ)
		Peligros.Fase.ACTIVO:
			var mitad := ANCHO / 2.0
			draw_rect(Rect2(-mitad, 0, ANCHO, largo), CARNE)
			draw_rect(Rect2(-mitad, 0, 2, largo), CARNE_SOMBRA)
			draw_rect(Rect2(mitad - 2.0, 0, 2, largo), CARNE_SOMBRA)
			for i in 3:
				var y := fposmod(_ms * 0.5 + i * largo / 3.0, largo)
				draw_rect(Rect2(-2.0 + i * 2.0, y, 1, minf(14.0, largo - y)), CARNE_LUZ)
			draw_rect(Rect2(-mitad - 3.0, largo - 3.0, ANCHO + 6.0, 3), CARNE)
	# El cano de laton por donde sale.
	draw_rect(Rect2(-8, -2, 16, 5), CANO)
