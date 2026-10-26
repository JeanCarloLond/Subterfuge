## Una vision de la nina (#225, #188): solo el Cirujano la ve. La pantalla se
## tine del blanco frio de Genesis, ella aparece a su lado, perfecta, y habla
## en la caja de los dialogos con su retrato. Al acabar se va y deja su
## objetivo (desde la primera, los objetivos son suyos: ver el canon).
##
## Se dispara con la senal `recogida` del nodo `tras` (una reliquia), una sola
## vez por partida: queda aprendida en Progreso como «vision-<id>».
extends Node2D

## Aparece: la sala se lo pasa a la interfaz (vision).
signal aparece(lineas: Array, retratos: Dictionary, al_terminar: Callable)

const NOMBRE := "La niña"
const RETRATO := preload("res://arte/nina/retrato.png")
const FIGURA := preload("res://arte/nina/figura.png")
const BLANCO := Color(0.78, 0.88, 0.96)
## Donde se le aparece, respecto al Cirujano: delante, a un paso.
const AL_LADO := 30.0

@export var id := ""
## Lo que la dispara (una reliquia, con su senal recogida).
@export var tras: NodePath
@export_multiline var lineas: PackedStringArray = []
## El objetivo que deja (de los suyos).
@export var objetivo := ""

## A quien se le aparece. Lo pone la sala, o se busca.
var cirujano: CharacterBody2D

var _figura: Sprite2D


func _ready() -> void:
	# La vision para el juego (como un dialogo), y ella tiene que aparecer
	# igual: su fundido corre con el juego parado.
	process_mode = Node.PROCESS_MODE_ALWAYS
	if cirujano == null:
		cirujano = get_tree().get_first_node_in_group("cirujano")
	if vista():
		return
	var disparo := get_node_or_null(tras)
	if disparo and disparo.has_signal("recogida"):
		disparo.recogida.connect(func(_nombre: String, _efecto: String) -> void: mostrar())


func vista() -> bool:
	var progreso := get_node_or_null("/root/Progreso")
	return progreso != null and progreso.aprendido("vision-" + id)


## Empieza la vision: ella aparece al lado del Cirujano, y habla.
func mostrar() -> void:
	if vista():
		return
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.aprender("vision-" + id)
	_figura = Sprite2D.new()
	_figura.texture = FIGURA
	_figura.centered = false
	_figura.offset = Vector2(-FIGURA.get_width() / 2.0, -FIGURA.get_height())
	var lado: int = cirujano.movimiento.mirando if cirujano.movimiento else 1
	_figura.global_position = cirujano.global_position + Vector2(lado * AL_LADO, 0)
	_figura.scale.x = -lado
	_figura.modulate = Color(BLANCO, 0.0)
	_figura.z_index = 15
	# Ella no la tine la penumbra: no esta en la sala, esta en el.
	var material := CanvasItemMaterial.new()
	material.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	_figura.material = material
	get_parent().add_child(_figura)
	create_tween().tween_property(_figura, "modulate", Color(1.15, 1.2, 1.25, 0.92), 0.8)
	var dichas := []
	for texto in lineas:
		dichas.append({"quien": NOMBRE, "texto": texto})
	aparece.emit(dichas, {NOMBRE: RETRATO}, _termino)


func _termino() -> void:
	var irse := create_tween()
	irse.tween_property(_figura, "modulate:a", 0.0, 0.9)
	irse.tween_callback(_figura.queue_free)
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and objetivo != "":
		progreso.fijar_objetivo(objetivo)
