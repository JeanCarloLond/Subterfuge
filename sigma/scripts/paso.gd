## Un paso entre salas (#218): una zona en el borde de la sala (una puerta, el
## hueco de un suelo) que lleva a otra. Al cruzarla se carga `destino` y se
## aparece en su entrada `entrada` (un Marker2D bajo «Entradas»). Con `con_e`,
## no basta con pasar: hay que pulsar E, como en un umbral.
##
## Una puerta puede pedir algo (#190): una cuenta de un objetivo (la del
## laboratorio, los tres registros) o una marca de Progreso (un atajo que solo
## se abre desde el otro lado). Sin ello, dice por que no se abre. Y puede
## dejar una marca al cruzarla (`abre`): asi se abre el atajo.
extends Node2D

const Objetivos := preload("res://scripts/objetivos.gd")

## Lo ha cruzado: la sala carga la otra.
signal cruzado(destino: String, entrada: String)
## No se abre: la sala lo avisa.
signal negado(texto: String)

## La zona, desde la posicion del paso (su esquina de arriba a la izquierda).
@export var zona := Vector2(16, 48)
@export_file("*.tscn") var destino := ""
@export var entrada := ""
@export var con_e := false
## Lo que se lee al lado cuando hace falta E.
@export var aviso := "E  descender"
## Lo que pide: un objetivo con su cuenta entera (vacio: nada).
@export var pide_objetivo := ""
## O una marca de Progreso (vacio: nada).
@export var pide_marca := ""
## Con esta marca en Progreso ya no se abre: lo que hay detras se sello.
@export var sellado_por := ""
## Lo que dice si no se abre. %d y %d: lo contado y el total del objetivo.
@export var negado_texto := ""
## La marca que deja al cruzarlo (vacio: ninguna).
@export var abre := ""

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
	if not _se_abre():
		if con_e:
			negado.emit(_negado())
		return
	var progreso := get_node_or_null("/root/Progreso")
	if abre != "" and progreso:
		progreso.aprender(abre)
	_cruzado = true
	cruzado.emit(destino, entrada)


func _se_abre() -> bool:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null:
		return pide_objetivo == "" and pide_marca == ""
	if pide_objetivo != "" and progreso.cuenta(pide_objetivo) < Objetivos.total(pide_objetivo):
		return false
	if sellado_por != "" and progreso.aprendido(sellado_por):
		return false
	return pide_marca == "" or progreso.aprendido(pide_marca)


func _negado() -> String:
	var progreso := get_node_or_null("/root/Progreso")
	if pide_objetivo != "" and negado_texto.contains("%d"):
		var cuenta: int = progreso.cuenta(pide_objetivo) if progreso else 0
		return negado_texto % [cuenta, Objetivos.total(pide_objetivo)]
	return negado_texto
