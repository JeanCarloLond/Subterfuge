## Un paso entre salas (#218): una zona en el borde de la sala (una puerta, el
## hueco de un suelo) que lleva a otra. Al cruzarla se carga `destino` y se
## aparece en su entrada `entrada` (un Marker2D bajo «Entradas»). Con `con_e`,
## no basta con pasar: hay que pulsar E, como en un umbral.
extends Node2D

## Lo ha cruzado: la sala carga la otra.
signal cruzado(destino: String, entrada: String)

## La zona, desde la posicion del paso (su esquina de arriba a la izquierda).
@export var zona := Vector2(16, 48)
@export_file("*.tscn") var destino := ""
@export var entrada := ""
@export var con_e := false
## Lo que se lee al lado cuando hace falta E.
@export var aviso := "E  descender"

## Quien cruza: el Cirujano. Lo pone la sala.
var cirujano: CharacterBody2D

var _cruzado := false
var _cartel: Label


func _ready() -> void:
	if con_e:
		_cartel = Label.new()
		_cartel.text = aviso
		_cartel.z_index = 20
		_cartel.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		_cartel.position = Vector2(zona.x / 2.0 - 48.0, -22.0)
		_cartel.size = Vector2(96, 16)
		_cartel.visible = false
		add_child(_cartel)


func caja() -> Rect2:
	return Rect2(global_position, zona)


func _physics_process(_delta: float) -> void:
	if cirujano == null or _cruzado or cirujano.muerto:
		return
	var dentro := caja().intersects(cirujano.caja())
	if con_e:
		_cartel.visible = dentro
		# Con un aturdido al alcance, la E es para ejecutarlo.
		if not (dentro and Input.is_action_just_pressed("interactuar") and not cirujano.puede_ejecutar()):
			return
	elif not dentro:
		return
	_cruzado = true
	cruzado.emit(destino, entrada)
