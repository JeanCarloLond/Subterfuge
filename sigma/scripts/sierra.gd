## La sierra de hueso (#217): instrumental de la Diocesis que el Latido hace
## girar. Quieta o en un rail, de ida y vuelta. Se oye antes de verla y tocarla
## cuesta dos puntos y empuja.
##
## Arte provisional dibujado aqui: un disco de acero con dientes, oxido y
## sangre seca, y el rail como una ranura en la piedra.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Peligros := preload("res://scripts/peligros.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const S := Sacramento.SIERRA
const DIENTES := 14
const ACERO := Color(0.62, 0.6, 0.58)
const ACERO_LUZ := Color(0.85, 0.83, 0.8)
const OXIDO := Color(0.42, 0.2, 0.1)
const SANGRE := Color(0.42, 0.08, 0.07)
const RANURA := Color(0.05, 0.03, 0.04)

## Donde acaba el rail, desde donde empieza (cero: quieta).
@export var recorrido := Vector2.ZERO
@export var velocidad: float = S["velocidad"]
## Para que dos sierras seguidas no vayan a la par (s).
@export var desfase := 0.0

## A quien corta: el Cirujano. Si el nivel no lo pone, se busca.
var objetivo: CharacterBody2D

var _disco: Node2D
var _segundos := 0.0
var _sonido: AudioStreamPlayer2D


func _ready() -> void:
	z_index = 3
	if objetivo == null:
		objetivo = get_tree().get_first_node_in_group("cirujano")
	_segundos = desfase
	_disco = Node2D.new()
	_disco.draw.connect(_pintar_disco)
	add_child(_disco)
	_sonido = AudioStreamPlayer2D.new()
	_sonido.stream = Sonidos.sierra()
	_sonido.volume_db = -12.0
	_sonido.max_distance = 360.0
	_sonido.autoplay = true
	_disco.add_child(_sonido)
	_colocar()


func _physics_process(delta: float) -> void:
	_segundos += delta
	_colocar()
	_disco.rotation += TAU * S["giro"] * delta
	if objetivo and Peligros.circulo_toca(global_position + _disco.position, S["radio"], objetivo.caja()):
		objetivo.recibir_contacto(global_position.x + _disco.position.x, S["dano"])


func _colocar() -> void:
	var largo := recorrido.length()
	if largo > 0.0:
		_disco.position = recorrido.normalized() * Peligros.vaiven(_segundos, largo, velocidad)


func _draw() -> void:
	# La ranura del rail, con sus dos topes.
	if recorrido != Vector2.ZERO:
		draw_line(Vector2.ZERO, recorrido, RANURA, 4.0)
		draw_line(Vector2.ZERO, recorrido, Color(0.2, 0.14, 0.12), 1.0)
		for punta in [Vector2.ZERO, recorrido]:
			draw_rect(Rect2(punta - Vector2(3, 3), Vector2(6, 6)), OXIDO)


func _pintar_disco() -> void:
	var radio: float = S["radio"]
	var dientes := PackedVector2Array()
	for i in DIENTES * 2:
		var angulo := TAU * i / (DIENTES * 2)
		dientes.append(Vector2.from_angle(angulo) * (radio if i % 2 == 0 else radio - 3.0))
	_disco.draw_colored_polygon(dientes, ACERO)
	_disco.draw_circle(Vector2.ZERO, radio - 3.5, ACERO_LUZ.darkened(0.2))
	# Un brillo y la sangre seca: que se vea girar.
	_disco.draw_arc(Vector2.ZERO, radio - 5.0, -2.4, -1.2, 6, ACERO_LUZ, 1.5)
	_disco.draw_arc(Vector2.ZERO, radio - 4.5, 0.4, 1.5, 6, SANGRE, 2.0)
	_disco.draw_circle(Vector2.ZERO, 3.0, OXIDO)
	_disco.draw_circle(Vector2.ZERO, 1.2, RANURA)
