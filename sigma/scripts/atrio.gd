## El Atrio (#185): la primera sala de Sigma, el mismo trazado que en Phaser
## para comparar la sensacion. La silleria es un TileMapLayer: se edita en el
## editor de Godot (la saco una vez herramientas/importar_atrio.gd).
##
## El nivel solo une las piezas: le dice a los Devotos y a los Altares quien es
## el Cirujano, lleva la interfaz y mira la caida al vacio y el umbral.
extends Node2D

const PORTADA := "res://escenas/principal.tscn"
## Lo que dura un aviso en pantalla.
const AVISO_S := 2.5
## Lo cerca del umbral que hay que estar para descender.
const ALCANCE_UMBRAL := 20.0

## Por debajo de esta y se ha caido del nivel: vuelve al Altar.
@export var limite_caida := 1060.0

var _terminado := false

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _umbral: Marker2D = $Umbral
@onready var _vitalidad: Label = $Interfaz/Vitalidad
@onready var _aviso: Label = $Interfaz/Aviso
@onready var _aviso_umbral: Label = $Umbral/Aviso
@onready var _fin: Control = $Interfaz/Fin


func _ready() -> void:
	for devoto in $Devotos.get_children():
		devoto.objetivo = _cirujano
	for altar in $Altares.get_children():
		altar.cirujano = _cirujano
		altar.rezado.connect(_al_rezar.bind(altar))
	_cirujano.vitalidad_cambio.connect(_al_cambiar_vitalidad)
	_al_cambiar_vitalidad(_cirujano.vitalidad, _cirujano.vitalidad)


func _physics_process(_delta: float) -> void:
	if _cirujano.position.y > limite_caida:
		_cirujano.caer_al_vacio()
		_avisar("Caída al vacío: vuelves al Altar")

	var cerca := _cirujano.position.distance_to(_umbral.position) <= ALCANCE_UMBRAL
	_aviso_umbral.visible = cerca and not _terminado
	if cerca and not _terminado and Input.is_action_just_pressed("interactuar"):
		_terminado = true
		_fin.visible = true


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		get_tree().change_scene_to_file(PORTADA)


func _al_rezar(altar: Node2D) -> void:
	for otro in $Altares.get_children():
		if otro != altar:
			otro.encendido = false
	_avisar("Altar: aquí volverás")


func _al_cambiar_vitalidad(actual: int, maxima: int) -> void:
	_vitalidad.text = "Vitalidad %d/%d" % [actual, maxima]


func _avisar(texto: String) -> void:
	_aviso.text = texto
	_aviso.visible = true
	get_tree().create_timer(AVISO_S).timeout.connect(func() -> void:
		if _aviso.text == texto:
			_aviso.visible = false
	)
