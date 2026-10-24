## Un cartel de controles (#221): ensena una mecanica justo donde hace falta,
## como en Hollow Knight. Sale al acercarse, con la tecla (o el boton del mando)
## y lo que hace; al hacerlo, se va y no vuelve (se guarda en Progreso).
##
## `texto` lleva las acciones entre llaves ({saltar}) y se cambian por su tecla.
## `aprende`: las acciones que lo dan por aprendido al pulsarlas con el cartel a
## la vista (separadas por comas). Vacio: basta con haberlo leido y alejarse.
extends Node2D

const Controles := preload("res://scripts/controles.gd")
const ORO := Color(0.89, 0.663, 0.251)
## Lo que tarda en irse una vez aprendido: que se vea que ha servido.
const ADIOS_S := 0.8

@export var id := ""
@export_multiline var texto := ""
@export var aprende := ""
## Otro cartel que tiene que estar aprendido antes (vacio: ninguno): dos que
## estan cerca salen de uno en uno.
@export var despues_de := ""
## La zona donde se ve: ancho y alto en px, con los pies del cartel abajo en
## el centro.
@export var zona := Vector2(160, 96)

## Quien lo lee: el Cirujano. Si la sala no lo pone, se busca.
var cirujano: CharacterBody2D

var _panel: PanelContainer
var _visto := false
var _hecho := false


func _ready() -> void:
	if cirujano == null:
		cirujano = get_tree().get_first_node_in_group("cirujano")
	if _progreso() and _progreso().aprendido(id):
		queue_free()
		return
	_panel = PanelContainer.new()
	var estilo := StyleBoxFlat.new()
	estilo.bg_color = Color(0.06, 0.04, 0.045, 0.88)
	estilo.border_color = ORO.darkened(0.3)
	estilo.set_border_width_all(1)
	estilo.set_content_margin_all(5)
	_panel.add_theme_stylebox_override("panel", estilo)
	var letra := Label.new()
	letra.text = Controles.rellenar(texto)
	letra.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_panel.add_child(letra)
	_panel.z_index = 30
	_panel.modulate.a = 0.0
	add_child(_panel)


func _process(delta: float) -> void:
	if cirujano == null or _hecho:
		return
	# Los pies del cartel van en el suelo, como los del Cirujano: la zona baja
	# un poco mas, o quien esta de pie en el se quedaria fuera por el borde.
	var toca: bool = despues_de == "" or (_progreso() != null and _progreso().aprendido(despues_de))
	var dentro: bool = toca and Rect2(position - Vector2(zona.x / 2.0, zona.y), zona + Vector2(0, 8)).has_point(cirujano.position)
	# Centrado sobre el cartel, por encima de la cabeza.
	_panel.position = Vector2(-_panel.size.x / 2.0, -64.0 - _panel.size.y)
	_panel.modulate.a = move_toward(_panel.modulate.a, 1.0 if dentro else 0.0, delta * 4.0)
	if dentro and _panel.modulate.a > 0.5:
		_visto = true
		for accion in aprende.split(",", false):
			if Input.is_action_just_pressed(accion.strip_edges()):
				_aprendido()
				return
	elif not dentro and _visto and aprende == "":
		_aprendido()


func _aprendido() -> void:
	_hecho = true
	if _progreso():
		_progreso().aprender(id)
	var adios := create_tween()
	adios.tween_interval(ADIOS_S)
	adios.tween_property(_panel, "modulate:a", 0.0, 0.4)
	adios.tween_callback(queue_free)


func _progreso() -> Node:
	return get_node_or_null("/root/Progreso")
