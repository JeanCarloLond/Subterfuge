## Una nota (un pergamino, un registro, un margen escrito): lore que se
## encuentra, no que se cuenta. Flota con su luz, y con E se lee en un panel
## de la interfaz, con el juego parado. Las leidas se guardan en Progreso.
extends Node2D

## Se ha leido: la sala la pasa a la interfaz.
signal leida(titulo: String, texto: String)

const ALCANCE := Vector2(16.0, 26.0)

@export var id := ""
@export var titulo := ""
@export_multiline var texto := ""
## Al leerla, el objetivo que toca (vacio: ninguno).
@export var objetivo := ""
## Al leerla, cuenta para este objetivo (los registros de Genesis).
@export var cuenta := ""

## Quien la lee: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D

@onready var _sprite: Sprite2D = $Sprite
@onready var _luz: PointLight2D = $Luz
@onready var _aviso: Label = $Aviso


func _ready() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.leida(id):
		_sprite.modulate = Color(0.7, 0.66, 0.62)


func _process(_delta: float) -> void:
	# Flota y respira, como las reliquias: se tiene que ver desde lejos.
	var t := Time.get_ticks_msec() / 1000.0
	_sprite.position.y = -12.0 + sin(t * 2.0) * 1.5
	_luz.energy = 0.7 + 0.2 * sin(t * 2.6)
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	# Con un aturdido al alcance, la E es para ejecutarlo.
	if cerca and Input.is_action_just_pressed("interactuar") and cirujano.e_libre():
		var progreso := get_node_or_null("/root/Progreso")
		if progreso:
			progreso.leer(id)
			if cuenta != "":
				progreso.contar(cuenta, id)
			if objetivo != "":
				progreso.fijar_objetivo(objetivo)
		_sprite.modulate = Color(0.7, 0.66, 0.62)
		leida.emit(titulo, texto)
