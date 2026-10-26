## La deuda de carne: lo que el Cirujano deja donde muere, como la culpa de
## Blasphemous. En la Diocesis la deuda se mide en cuerpo ("mi casa debe
## carne"). Mientras no vuelve a por ella, el Fervor no pasa de su tope
## (DEUDA en sacramento.gd). Se recupera con E; morir otra vez la cambia de
## sitio. Se guarda con la partida.
extends Node2D

signal saldada

const ALCANCE := Vector2(18.0, 26.0)

## Quien la recupera: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D

var _sprite: Sprite2D
var _luz: PointLight2D
var _aviso: Label


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.texture = preload("res://arte/atrezo/deuda.png")
	_sprite.offset = Vector2(0, -9)
	add_child(_sprite)
	var gradiente := Gradient.new()
	gradiente.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0)])
	var textura := GradientTexture2D.new()
	textura.gradient = gradiente
	textura.width = 96
	textura.height = 96
	textura.fill = GradientTexture2D.FILL_RADIAL
	textura.fill_from = Vector2(0.5, 0.5)
	textura.fill_to = Vector2(1, 0.5)
	_luz = PointLight2D.new()
	_luz.texture = textura
	_luz.color = Color(0.9, 0.2, 0.15)
	_luz.position = Vector2(0, -10)
	# A la altura de las demas luces del Atrio: la deuda se crea despues de que
	# el nivel las suba, y a ras de suelo no modelaria la figura.
	_luz.height = preload("res://scripts/sacramento.gd").ALTURA_LUZ
	add_child(_luz)
	_aviso = Label.new()
	# Con la letra del tema del proyecto (legible), como los demas avisos.
	_aviso.text = "E  recuperar tu carne"
	_aviso.position = Vector2(-80, -46)
	_aviso.size = Vector2(160, 18)
	_aviso.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_aviso.add_theme_color_override("font_color", Color(0.929, 0.894, 0.847))
	_aviso.visible = false
	add_child(_aviso)


func _process(_delta: float) -> void:
	# Late como un corazon: es carne y todavia es tuya.
	var t := Time.get_ticks_msec() / 1000.0
	var latido := pow(maxf(0.0, sin(t * 3.4)), 6.0)
	_sprite.scale = Vector2.ONE * (1.0 + 0.08 * latido)
	_luz.energy = 0.6 + 0.6 * latido
	if cirujano == null or cirujano.muerto:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	if cerca and Input.is_action_just_pressed("interactuar") and cirujano.e_libre():
		set_process(false)
		saldada.emit()
		var irse := create_tween()
		irse.tween_property(self, "modulate:a", 0.0, 0.3)
		irse.tween_callback(queue_free)
