## La interfaz de las salas (#183): vitalidad, Fervor y pociones arriba a la
## derecha, la ayuda de los controles arriba a la izquierda y los avisos en el
## centro. Cada sala la conecta a su Cirujano y pone su propia ayuda.
extends CanvasLayer

const Sacramento := preload("res://scripts/sacramento.gd")
## Lo que dura un aviso en pantalla.
const AVISO_S := 2.5

@export_multiline var ayuda := "":
	set(valor):
		ayuda = valor
		if is_node_ready():
			_ayuda.text = valor

@onready var _ayuda: Label = $Ayuda
@onready var _vitalidad: Label = $Vitalidad
@onready var _recursos: Label = $Recursos
@onready var _aviso: Label = $Aviso

var _fervor := 0
var _pociones := 0


func _ready() -> void:
	_ayuda.text = ayuda


func conectar(cirujano: CharacterBody2D) -> void:
	cirujano.vitalidad_cambio.connect(_al_cambiar_vitalidad)
	cirujano.fervor_cambio.connect(func(actual: int, _maximo: int) -> void:
		_fervor = actual
		_pintar_recursos()
	)
	cirujano.pociones_cambio.connect(func(cargas: int, _maximas: int) -> void:
		_pociones = cargas
		_pintar_recursos()
	)
	_al_cambiar_vitalidad(cirujano.vitalidad, Sacramento.VITALIDAD["maxima"])
	_fervor = cirujano.combate.fervor
	_pociones = cirujano.combate.cargas_pocion
	_pintar_recursos()


func avisar(texto: String) -> void:
	_aviso.text = texto
	_aviso.visible = true
	get_tree().create_timer(AVISO_S).timeout.connect(func() -> void:
		if _aviso.text == texto:
			_aviso.visible = false
	)


func _al_cambiar_vitalidad(actual: int, maxima: int) -> void:
	_vitalidad.text = "Vitalidad %d/%d" % [actual, maxima]


func _pintar_recursos() -> void:
	_recursos.text = "Fervor %d · Pociones %d" % [_fervor, _pociones]
