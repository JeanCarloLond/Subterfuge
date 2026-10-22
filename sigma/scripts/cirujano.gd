## El Cirujano (#182): lee los controles, le pasa a movimiento.gd lo que toca y
## mueve el cuerpo con la velocidad que le devuelve. Lleva su vitalidad y el
## sitio donde reaparece (#185).
##
## El origen esta en los pies. La caja que choca es la del original, 10x22: la
## mascara y la mitra no chocan, porque un pico que tocara los techos volveria
## el salto impredecible. Esta en la capa 2 y solo choca con la 1, el mundo:
## los enemigos lo atraviesan y el dano se resuelve aparte.
extends CharacterBody2D

signal vitalidad_cambio(actual: int, maxima: int)

const Movimiento := preload("res://scripts/movimiento.gd")
const Sacramento := preload("res://scripts/sacramento.gd")

var movimiento: Movimiento
var vitalidad: int = Sacramento.VITALIDAD["maxima"]
## Donde vuelve al morir o al caer al vacio: el ultimo Altar, o donde empezo.
var punto_reaparicion := Vector2.ZERO

@onready var _figura: Node2D = $Figura


func _ready() -> void:
	punto_reaparicion = position
	movimiento = Movimiento.new(position.y)
	movimiento.caida.connect(_al_caer)


func _physics_process(delta: float) -> void:
	var entrada := Movimiento.Entrada.new()
	entrada.eje_x = int(signf(Input.get_axis("izquierda", "derecha")))
	entrada.saltar_pulsado = Input.is_action_just_pressed("saltar")
	entrada.saltar_mantenido = Input.is_action_pressed("saltar")
	entrada.dash_pulsado = Input.is_action_just_pressed("dash")
	entrada.arriba = Input.is_action_pressed("arriba")
	entrada.abajo = Input.is_action_pressed("abajo")

	# La normal de la pared apunta hacia fuera: una pared a la derecha da -1.
	var pared := -int(signf(get_wall_normal().x)) if is_on_wall() else 0

	movimiento.velocidad = velocity
	movimiento.paso(delta, entrada, is_on_floor(), pared, position.y)
	velocity = movimiento.velocidad
	move_and_slide()

	_figura.scale.x = movimiento.mirando
	_figura.modulate.a = 0.5 if movimiento.invulnerable else 1.0
	_figura.position.y = 6.0 if movimiento.estado == Movimiento.Estado.REZANDO else 0.0


## La caja que choca, en coordenadas del mundo.
func caja() -> Rect2:
	return Rect2(position.x - 5.0, position.y - 22.0, 10.0, 22.0)


## Un golpe de un enemigo desde `origen_x`. Devuelve false si no entra.
func recibir_golpe(origen_x: float, dano: int) -> bool:
	var retroceso := Vector2(Sacramento.VITALIDAD["retroceso_x"], Sacramento.VITALIDAD["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return false
	_perder(dano)
	return true


## Rozar a un enemigo: el mismo dano que un golpe, con otro empujon.
func recibir_contacto(origen_x: float) -> bool:
	var retroceso := Vector2(Sacramento.CONTACTO["retroceso_x"], Sacramento.CONTACTO["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return false
	_perder(Sacramento.CONTACTO["dano"])
	return true


## Caer al vacio: cuesta un punto y devuelve al Altar, pero no es morir.
func caer_al_vacio() -> void:
	_perder(1)
	if vitalidad > 0:
		_volver()


## Rezar en un Altar: se arrodilla, se cura del todo y ese Altar es el nuevo
## sitio donde vuelve. Devuelve false si no puede (en el aire, en un dash...).
func rezar(altar: Vector2) -> bool:
	if not movimiento.rezar():
		return false
	punto_reaparicion = altar
	vitalidad = Sacramento.VITALIDAD["maxima"]
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	return true


func _al_caer(dano: int, _altura: float) -> void:
	_perder(dano)


func _perder(dano: int) -> void:
	vitalidad = maxi(0, vitalidad - dano)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	if vitalidad == 0:
		# Todavia no hay pantalla de muerte: vuelve al Altar entero. Diferido,
		# porque esto puede llegar en mitad de un paso del movimiento.
		_morir.call_deferred()


func _morir() -> void:
	vitalidad = Sacramento.VITALIDAD["maxima"]
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	_volver()


func _volver() -> void:
	position = punto_reaparicion
	velocity = Vector2.ZERO
	movimiento.reaparecer(position.y)
