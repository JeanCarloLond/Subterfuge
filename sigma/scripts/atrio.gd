## El Atrio (#185): la primera sala de Sigma, el mismo trazado que en Phaser
## para comparar la sensacion. La silleria es un TileMapLayer: se edita en el
## editor de Godot (la saco una vez herramientas/importar_atrio.gd).
##
## El nivel solo une las piezas: le dice a los Devotos, a los Altares y a los
## muros quien es el Cirujano, lleva la interfaz y mira la caida al vacio y el
## umbral.
##
## Las reliquias: el Pulmon Vacio (doble salto) a media bajada, en el camino y
## lejos del Altar (una E no debe rezar y tomar a la vez), y el Tendon del
## Mil (dash) en el nicho del fondo, al que solo se llega con el doble salto.
## Con las dos se abre el camino alto de la derecha: el Atrio se vuelve a
## recorrer, como un metroidvania.
##
## La compactacion (#189): un techo que late bajo el segundo Altar. Avisa y
## baja, pero siempre deja sitio: aqui se aprende el aviso sin pagarlo. Los
## cierres van a los Pasillos: el Atrio es abierto, en zigzag, y en un sitio
## abierto no hay pasillo que cerrar.
extends Node2D

const PORTADA := "res://escenas/principal.tscn"
## Lo cerca del umbral que hay que estar para descender.
const ALCANCE_UMBRAL := 20.0

## Por debajo de esta y se ha caido del nivel: vuelve al Altar.
@export var limite_caida := 1060.0

var _terminado := false

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _umbral: Marker2D = $Umbral
@onready var _interfaz: CanvasLayer = $Interfaz
@onready var _aviso_umbral: Label = $Umbral/Aviso
@onready var _fin: CanvasLayer = $Fin


func _ready() -> void:
	for devoto in $Devotos.get_children():
		devoto.objetivo = _cirujano
	for muro in $Muros.get_children():
		muro.objetivo = _cirujano
		muro.aplasto.connect(_interfaz.avisar.bind("Aplastado: vuelves al Altar"))
		muro.cerrado.connect(_interfaz.avisar.bind("El camino de vuelta se ha cerrado"))
	for altar in $Altares.get_children():
		altar.cirujano = _cirujano
		altar.rezado.connect(_al_rezar.bind(altar))
	for reliquia in $Reliquias.get_children():
		reliquia.cirujano = _cirujano
		reliquia.recogida.connect(func(nombre: String, efecto: String) -> void:
			_interfaz.avisar("%s. %s" % [nombre, efecto])
		)
	_interfaz.conectar(_cirujano)
	var musica := get_node_or_null("/root/Musica")
	if musica:
		musica.poner("atrio-redoble")


func _physics_process(_delta: float) -> void:
	if _cirujano.position.y > limite_caida:
		_cirujano.caer_al_vacio()
		_interfaz.avisar("Caída al vacío: vuelves al Altar")

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
	_interfaz.avisar("Altar: aquí volverás")
