## El Atrio (#185): la primera sala de Sigma, el mismo trazado que en Phaser
## para comparar la sensacion. La silleria es un TileMapLayer: se edita en el
## editor de Godot (la saco una vez herramientas/importar_atrio.gd).
##
## Es la demostracion: una sala sola con las dos reliquias, que se juega desde
## la portada. Lo comun a todas las salas va en sala.gd; aqui, el umbral del
## final del prototipo. En el juego, el Atrio es la Nave del Nivel I (#218).
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
extends "res://scripts/sala.gd"

## Lo cerca del umbral que hay que estar para descender.
const ALCANCE_UMBRAL := 20.0

var _terminado := false

@onready var _umbral: Marker2D = $Umbral
@onready var _aviso_umbral: Label = $Umbral/Aviso
@onready var _fin: CanvasLayer = $Fin


func _physics_process(delta: float) -> void:
	super(delta)
	var cerca := _cirujano.position.distance_to(_umbral.position) <= ALCANCE_UMBRAL
	_aviso_umbral.visible = cerca and not _terminado
	if cerca and not _terminado and Input.is_action_just_pressed("interactuar") and not _cirujano.puede_ejecutar():
		_terminado = true
		_fin.visible = true
