## El aviso de la ejecucion, como en Blasphemous: tras un parry, sobre el
## enemigo aturdido aparece el boton para ejecutarlo (E, o △ con un mando de
## PlayStation), y late. Encendido sobre el que se ejecutaria ya; tenue sobre
## los aturdidos que aun estan lejos. Lo pone la sala.
extends Node2D

const Controles := preload("res://scripts/controles.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const ORO := Color(0.89, 0.663, 0.251)
## Por encima de la cabeza del enemigo y del bisturi que marca el aturdido.
const ALTO_PX := 30.0
## Lo tenue: un aturdido que aun no esta al alcance.
const LEJOS_ALFA := 0.4

var cirujano: CharacterBody2D

## Enemigo -> su aviso.
var _avisos := {}


func _ready() -> void:
	z_index = 30
	var controles := get_node_or_null("/root/Controles")
	if controles:
		controles.dispositivo_cambio.connect(_reescribir)


func _process(_delta: float) -> void:
	if cirujano == null:
		return
	var enemigos := get_tree().get_nodes_in_group("enemigos")
	var objetivo: Node2D = null
	if not cirujano.muerto and cirujano.movimiento.libre():
		objetivo = Cirujano.elegir_ejecutable(cirujano.position, enemigos)
	var vistos := {}
	for enemigo in enemigos:
		if not is_instance_valid(enemigo) or not enemigo.has_method("ejecutable") or not enemigo.ejecutable():
			continue
		vistos[enemigo] = true
		var aviso: PanelContainer = _avisos.get(enemigo)
		if aviso == null:
			aviso = _nuevo()
			_avisos[enemigo] = aviso
		var cabeza: float = enemigo.caja().position.y - enemigo.position.y
		var sitio := to_local(enemigo.global_position) + Vector2(0, cabeza - ALTO_PX)
		var latido := roundf(sin(Time.get_ticks_msec() / 140.0) * 1.5)
		aviso.position = (sitio - aviso.size / 2.0 + Vector2(0, latido)).round()
		aviso.modulate.a = 1.0 if enemigo == objetivo else LEJOS_ALFA
	for enemigo in _avisos.keys():
		if not vistos.has(enemigo):
			_avisos[enemigo].queue_free()
			_avisos.erase(enemigo)


func _nuevo() -> PanelContainer:
	var panel := PanelContainer.new()
	var estilo := StyleBoxFlat.new()
	estilo.bg_color = Color(0.06, 0.04, 0.045, 0.9)
	estilo.border_color = ORO
	estilo.set_border_width_all(1)
	estilo.set_content_margin_all(2)
	estilo.content_margin_left = 4
	estilo.content_margin_right = 4
	panel.add_theme_stylebox_override("panel", estilo)
	var letra := Label.new()
	letra.text = Controles.rellenar("{interactuar}")
	letra.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	letra.add_theme_color_override("font_color", ORO)
	panel.add_child(letra)
	add_child(panel)
	panel.reset_size()
	return panel


## Se cambio de teclado a mando o al reves: el boton tambien.
func _reescribir() -> void:
	for aviso in _avisos.values():
		aviso.get_child(0).text = Controles.rellenar("{interactuar}")
		aviso.reset_size()
