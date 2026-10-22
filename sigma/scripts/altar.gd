## El Altar (#185): rezando en el, el Cirujano recupera la vitalidad y ese Altar
## pasa a ser donde vuelve. Hay que estar delante, de pie, y pulsar interactuar.
extends Node2D

signal rezado

## Lo cerca que hay que estar de su centro, en x y en y.
const ALCANCE := Vector2(18.0, 24.0)

## Quien reza: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D
var encendido := false:
	set(valor):
		encendido = valor
		if is_node_ready():
			_llama.visible = valor

@onready var _aviso: Label = $Aviso
@onready var _llama: Node2D = $Llama


func _ready() -> void:
	_llama.visible = encendido


func _process(_delta: float) -> void:
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	if cerca and Input.is_action_just_pressed("interactuar") and cirujano.rezar(position):
		encendido = true
		rezado.emit()
