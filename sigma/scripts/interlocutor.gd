## Alguien con quien hablar (#216): el Cegado y los que vengan. Con E, habla en
## la caja de la interfaz, a lo Stardew Valley. La primera vez dice lo suyo y
## puede cambiar el objetivo; despues, `otra_vez`, una linea suelta cada vez.
## Lo hablado se guarda en Progreso.
extends Node2D

## Habla: la sala se lo pasa a la interfaz (hablar).
signal habla(lineas: Array, retratos: Dictionary, al_terminar: Callable)

const ALCANCE := Vector2(26.0, 30.0)

@export var id := ""
@export var nombre := ""
@export var retrato: Texture2D
## Lo que dice la primera vez, una linea por entrada.
@export_multiline var lineas: PackedStringArray = []
## Lo que dice si se le vuelve a hablar: una, por turno.
@export_multiline var otra_vez: PackedStringArray = []
## El objetivo que toca al acabar la primera charla (vacio: ninguno).
@export var objetivo := ""

## Quien le habla: el Cirujano. Lo pone el nivel.
var cirujano: CharacterBody2D

var _vez := 0

@onready var _aviso: Label = $Aviso


func _process(_delta: float) -> void:
	if cirujano == null:
		return
	var distancia := (cirujano.position - position).abs()
	var cerca := distancia.x <= ALCANCE.x and distancia.y <= ALCANCE.y
	_aviso.visible = cerca
	# Con un aturdido al alcance, la E es para ejecutarlo.
	if cerca and Input.is_action_just_pressed("interactuar") and cirujano.e_libre():
		# Mientras habla, el «E  hablar» sobra (y con el juego parado se quedaba).
		_aviso.visible = false
		habla.emit(_que_dice(), {nombre: retrato}, _termino)


func hablado() -> bool:
	var progreso := get_node_or_null("/root/Progreso")
	return progreso != null and progreso.leida(_clave())


## La primera vez, todo; despues, una de `otra_vez`, por turno.
func _que_dice() -> Array:
	var textos := lineas
	if hablado() and not otra_vez.is_empty():
		textos = [otra_vez[_vez % otra_vez.size()]]
		_vez += 1
	var dichas := []
	for texto in textos:
		dichas.append({"quien": nombre, "texto": texto})
	return dichas


func _termino() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.leida(_clave()):
		return
	# Lo hablado se guarda como una nota leida: es lo mismo, algo que ya se sabe.
	progreso.leer(_clave())
	if objetivo != "":
		progreso.fijar_objetivo(objetivo)


func _clave() -> String:
	return "charla-" + id
