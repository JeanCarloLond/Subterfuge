## El Cirujano (#182): lee los controles, le pasa a movimiento.gd lo que toca y
## mueve el cuerpo con la velocidad que le devuelve.
##
## El origen esta en los pies. La caja que choca es la del original, 10x22: la
## mascara y la mitra no chocan, porque un pico que tocara los techos volveria
## el salto impredecible.
extends CharacterBody2D

signal vitalidad_cambio(actual: int, maxima: int)

const Movimiento := preload("res://scripts/movimiento.gd")
const Sacramento := preload("res://scripts/sacramento.gd")

var movimiento: Movimiento
var vitalidad: int = Sacramento.VITALIDAD["maxima"]

var _inicio := Vector2.ZERO

@onready var _figura: Node2D = $Figura


func _ready() -> void:
	_inicio = position
	_empezar()


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


func _empezar() -> void:
	position = _inicio
	velocity = Vector2.ZERO
	vitalidad = Sacramento.VITALIDAD["maxima"]
	movimiento = Movimiento.new(position.y)
	movimiento.caida.connect(_al_caer)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])


func _al_caer(dano: int, _altura: float) -> void:
	vitalidad = maxi(0, vitalidad - dano)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	if vitalidad == 0:
		# Sin Altar todavia: vuelve al principio de la sala. Diferido, porque
		# esto se llama en mitad del paso del movimiento que se va a cambiar.
		_empezar.call_deferred()
