## Una reliquia: un resto que los Primigenios dejan al compactarse, un organo
## suelto que aun funciona. El Pulmon Vacio es el artefacto del laboratorio de
## Genesis (#225), el primer objeto divino del juego: al tomarlo llega la
## primera vision. Cada una le da al Cirujano una habilidad del cuerpo
## que no es suya, como en Blasphemous: el doble salto y el dash ya no vienen
## de serie, se encuentran.
##
## Como el Altar: hay que estar delante y pulsar interactuar. Flota y late con
## su luz para verse desde lejos. Si ya se tiene, no aparece.
extends Node2D

signal recogida(nombre: String, efecto: String)

## Que reliquia es, y lo que hace. Los nombres son una propuesta: restos de
## organos, como los dioses (corazones, cerebros, estomagos).
const RELIQUIAS := {
	"pulmon": {
		"nombre": "El Pulmón Vacío",
		"efecto": "Impulso cárnico: un segundo salto en el aire",
		"textura": "res://arte/reliquias/pulmon.png",
	},
	"injertadora": {
		"nombre": "La Injertadora",
		"efecto": "Dispara injertos de metal",
		"textura": "res://arte/provisional/injertadora.png",
	},
	"tendon": {
		"nombre": "El Tendón del Mil",
		"efecto": "Shift: un impulso de golpe (dash)",
		"textura": "res://arte/reliquias/tendon.png",
	},
}
const ALCANCE := Vector2(16.0, 26.0)

@export_enum("pulmon", "tendon", "injertadora") var id := "pulmon"

## Quien la toma: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D

@onready var _sprite: Sprite2D = $Sprite
@onready var _luz: PointLight2D = $Luz
@onready var _aviso: Label = $Aviso


func _ready() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.tiene(id):
		queue_free()
		return
	_sprite.texture = load(RELIQUIAS[id]["textura"])


func _process(_delta: float) -> void:
	# Flota y respira: tiene que llamar la atencion sin parpadear.
	var t := Time.get_ticks_msec() / 1000.0
	_sprite.position.y = -14.0 + sin(t * 2.2) * 2.0
	_luz.energy = 0.9 + 0.25 * sin(t * 3.0)
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	# Con un aturdido al alcance, la E es para ejecutarlo.
	if cerca and Input.is_action_just_pressed("interactuar") and not cirujano.puede_ejecutar():
		_tomar()


func _tomar() -> void:
	set_process(false)
	# Si llega una vision, el juego se para con la reliquia aun a la vista.
	_aviso.visible = false
	cirujano.ganar_reliquia(id)
	recogida.emit(RELIQUIAS[id]["nombre"], RELIQUIAS[id]["efecto"])
	var irse := create_tween()
	irse.tween_property(_sprite, "scale", Vector2(1.8, 1.8), 0.25)
	irse.parallel().tween_property(self, "modulate:a", 0.0, 0.25)
	irse.tween_callback(queue_free)
