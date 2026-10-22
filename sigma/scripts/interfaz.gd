## La interfaz de las salas, ornamentada como la de Blasphemous
## (scripts/hud-sigma.mjs): arriba a la izquierda, el medallon con el rostro
## del Cirujano, la vida en seis segmentos de sangre, el Fervor en ambar y los
## frascos de Pocion. Los avisos, en el centro; la ayuda de los controles,
## abajo, plegada: con H se abre y se cierra (el texto fijo en pantalla
## estorbaba y no se leia). Todo en la letra legible del tema (arte/tema.tres).
## Cada sala la conecta a su Cirujano y pone su propia ayuda.
extends CanvasLayer

const Sacramento := preload("res://scripts/sacramento.gd")
const FRASCO_LLENO := preload("res://arte/hud/frasco-lleno.png")
const FRASCO_VACIO := preload("res://arte/hud/frasco-vacio.png")
## Lo que dura un aviso en pantalla.
const AVISO_S := 2.5
## Lo que se ve con la ayuda plegada.
const AYUDA_PLEGADA := "H  controles"

@export_multiline var ayuda := "":
	set(valor):
		ayuda = valor
		if is_node_ready():
			_pintar_ayuda()

var _ayuda_abierta := false

@onready var _ayuda: Label = $Ayuda
@onready var _vida: TextureProgressBar = $Vida
@onready var _fervor: TextureProgressBar = $Fervor
@onready var _frascos: HBoxContainer = $Frascos
@onready var _medallon: TextureRect = $Medallon
@onready var _aviso: Label = $Aviso


func _ready() -> void:
	_pintar_ayuda()


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("ayuda"):
		_ayuda_abierta = not _ayuda_abierta
		_pintar_ayuda()


func _pintar_ayuda() -> void:
	_ayuda.text = ayuda if _ayuda_abierta else AYUDA_PLEGADA


func conectar(cirujano: CharacterBody2D) -> void:
	cirujano.vitalidad_cambio.connect(_al_cambiar_vitalidad)
	cirujano.fervor_cambio.connect(_al_cambiar_fervor)
	cirujano.pociones_cambio.connect(_pintar_frascos)
	_vida.value = 100.0 * cirujano.vitalidad / Sacramento.VITALIDAD["maxima"]
	_al_cambiar_fervor(cirujano.combate.fervor, Sacramento.FERVOR["maximo"])
	_pintar_frascos(cirujano.combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])


func avisar(texto: String) -> void:
	_aviso.text = texto
	_aviso.visible = true
	get_tree().create_timer(AVISO_S).timeout.connect(func() -> void:
		if _aviso.text == texto:
			_aviso.visible = false
	)


func _al_cambiar_vitalidad(actual: int, maxima: int) -> void:
	var antes := _vida.value
	_vida.value = 100.0 * actual / maxima
	# Al perder vida, el medallon destella en rojo: el golpe se siente arriba.
	if _vida.value < antes:
		_medallon.modulate = Color(1.6, 0.5, 0.45)
		create_tween().tween_property(_medallon, "modulate", Color.WHITE, 0.35)


func _al_cambiar_fervor(actual: int, maximo: int) -> void:
	_fervor.value = 100.0 * actual / maximo


func _pintar_frascos(cargas: int, maximas: int) -> void:
	for hijo in _frascos.get_children():
		hijo.queue_free()
	for i in maximas:
		var frasco := TextureRect.new()
		frasco.texture = FRASCO_LLENO if i < cargas else FRASCO_VACIO
		_frascos.add_child(frasco)
