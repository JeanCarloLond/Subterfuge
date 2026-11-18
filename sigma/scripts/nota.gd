## Una nota (un pergamino, un registro, un margen escrito): lore que se
## encuentra, no que se cuenta. Flota con su luz, y con E se lee en un panel
## de la interfaz, con el juego parado. Las leidas se guardan en Progreso.
extends Node2D

## Se ha leido: la sala la pasa a la interfaz. `nueva`, si es la primera vez.
signal leida(titulo: String, texto: String, nueva: bool)

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

var _ya_recogida := false

@onready var _sprite: Sprite2D = $Sprite
@onready var _luz: PointLight2D = $Luz
@onready var _aviso: Label = $Aviso


func _ready() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.leida(id):
		_sprite.modulate = Color(0.7, 0.66, 0.62)
		_ya_recogida = true


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
			# El objetivo, solo la primera vez: releer el Libro tras el
			# laboratorio hacia retroceder el objetivo (#232).
			var primera: bool = not progreso.leida(id)
			progreso.leer(id)
			if cuenta != "":
				progreso.contar(cuenta, id)
			if objetivo != "" and primera:
				progreso.fijar_objetivo(objetivo)
		var nueva := progreso != null and not _ya_recogida
		_ya_recogida = true
		_sprite.modulate = Color(0.7, 0.66, 0.62)
		if nueva:
			_recogida()
		leida.emit(titulo, texto, nueva)


## La primera vez que se lee, se ve que se ha recogido (feedback de Jean): un
## destello de su luz y una copia dorada que sube y se deshace. Con el juego
## parado mientras se lee, se ve al cerrar, ya de vuelta en la sala.
func _recogida() -> void:
	var copia := Sprite2D.new()
	copia.texture = _sprite.texture
	copia.position = _sprite.position
	copia.modulate = Color(1.0, 0.85, 0.45, 0.9)
	var brillo := CanvasItemMaterial.new()
	brillo.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	copia.material = brillo
	add_child(copia)
	var vuelo := create_tween().set_parallel()
	vuelo.tween_property(copia, "position:y", copia.position.y - 22.0, 0.7).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
	vuelo.tween_property(copia, "scale", Vector2(1.8, 1.8), 0.7)
	vuelo.tween_property(copia, "modulate:a", 0.0, 0.7)
	vuelo.tween_property(_luz, "energy", 2.4, 0.12)
	vuelo.chain().tween_callback(copia.queue_free)
