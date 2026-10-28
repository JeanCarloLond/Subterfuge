## El Altar (#185): rezando en el, el Cirujano recupera la vitalidad y ese Altar
## pasa a ser donde vuelve. Hay que estar delante, de pie, y pulsar interactuar.
##
## Es una fuente con un santo (#238, feedback de Jean): la Pocion de Carne sale
## de aqui, por eso rezar llena el frasco. Se ve de lejos: su luz no se apaga y
## la carne gotea siempre. Rezada, se enciende del todo y rebosa.
extends Node2D

signal rezado

## Lo cerca que hay que estar de su centro, en x y en y.
const ALCANCE := Vector2(20.0, 24.0)
const COLOR_CARNE := Color(0.66, 0.22, 0.18)
## La luz: tenue sin rezar (que se vea que esta ahi) y viva una vez rezada.
const LUZ_APAGADA := 0.35
const LUZ_ENCENDIDA := 0.9
## Donde rebosa la carne de las manos del santo, a los dos lados.
const MANOS := [Vector2(-5, -34), Vector2(5, -34)]

## Quien reza: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D
## Encendido: es donde se vuelve. Se ve a lo lejos por su luz.
var encendido := false:
	set(valor):
		encendido = valor
		if is_node_ready():
			_pintar()

@onready var _aviso: Label = $Aviso
@onready var _sprite: Sprite2D = $Sprite
@onready var _luz: PointLight2D = $Luz

var _goteo: Array[CPUParticles2D] = []
## El destello de la luz al rezar: se suma a la de base y se va.
var _destello := 0.0


func _ready() -> void:
	for mano in MANOS:
		var gotas := CPUParticles2D.new()
		gotas.position = mano
		gotas.amount = 3
		gotas.lifetime = 0.45
		gotas.direction = Vector2(signf(mano.x) * 0.15, 1)
		gotas.spread = 6.0
		gotas.initial_velocity_min = 4.0
		gotas.initial_velocity_max = 10.0
		gotas.gravity = Vector2(0, 160)
		gotas.color = COLOR_CARNE
		add_child(gotas)
		_goteo.append(gotas)
	_pintar()


func _process(_delta: float) -> void:
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	# La luz respira: un latido lento, no un fallo de luz.
	var base := LUZ_ENCENDIDA if encendido else LUZ_APAGADA
	_luz.energy = base + _destello + 0.08 * sin(Time.get_ticks_msec() / 140.0)
	if cerca and Input.is_action_just_pressed("interactuar") and not cirujano.muerto and cirujano.rezar(position):
		encendido = true
		_rebosar()
		# Rezar es guardar: al continuar, se vuelve a este Altar.
		var progreso := get_node_or_null("/root/Progreso")
		if progreso and get_tree().current_scene:
			progreso.rezar_en(get_tree().current_scene.scene_file_path, name)
		rezado.emit()


## Rezar se nota: la pila rebosa, la luz destella y se queda viva.
func _rebosar() -> void:
	var rebose := CPUParticles2D.new()
	rebose.position = Vector2(0, -18)
	rebose.one_shot = true
	rebose.explosiveness = 0.9
	rebose.amount = 24
	rebose.lifetime = 0.7
	rebose.direction = Vector2(0, -1)
	rebose.spread = 70.0
	rebose.initial_velocity_min = 40.0
	rebose.initial_velocity_max = 90.0
	rebose.gravity = Vector2(0, 300)
	rebose.color = COLOR_CARNE
	add_child(rebose)
	rebose.emitting = true
	get_tree().create_timer(1.2).timeout.connect(rebose.queue_free)
	_destello = 1.6
	create_tween().tween_property(self, "_destello", 0.0, 0.8)


func _pintar() -> void:
	_sprite.modulate = Color.WHITE if encendido else Color(0.72, 0.7, 0.72)
	# Rezada gotea mas: la fuente esta viva.
	for gotas in _goteo:
		gotas.amount = 6 if encendido else 3
