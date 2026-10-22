## El Altar (#185): rezando en el, el Cirujano recupera la vitalidad y ese Altar
## pasa a ser donde vuelve. Hay que estar delante, de pie, y pulsar interactuar.
extends Node2D

signal rezado

## Lo cerca que hay que estar de su centro, en x y en y.
const ALCANCE := Vector2(18.0, 24.0)

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


func _ready() -> void:
	_pintar()


func _process(_delta: float) -> void:
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	# La llama respira: un parpadeo lento, no un fallo de luz.
	_luz.energy = 0.85 + 0.1 * sin(Time.get_ticks_msec() / 140.0)
	if cerca and Input.is_action_just_pressed("interactuar") and cirujano.rezar(position):
		encendido = true
		# Rezar es guardar: al continuar, se vuelve a este Altar.
		var progreso := get_node_or_null("/root/Progreso")
		if progreso and get_tree().current_scene:
			progreso.rezar_en(get_tree().current_scene.scene_file_path, name)
		rezado.emit()


func _pintar() -> void:
	_luz.visible = encendido
	_sprite.modulate = Color.WHITE if encendido else Color(0.6, 0.58, 0.6)
