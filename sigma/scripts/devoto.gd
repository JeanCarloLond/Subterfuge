## El Devoto (#185): fiel de la Diocesis y el primer eslabon del Atrio.
## Patrulla su ronda, persigue al Cirujano si lo tiene cerca y avisa del golpe
## 420 ms antes de darlo, para que se pueda leer.
##
## Todavia no se le puede pegar: eso llega con el combate (#183). De momento se
## esquiva, o se le pasa a traves con el dash.
##
## Esta en la capa 3 y solo choca con el mundo. El dano al Cirujano se mira con
## las cajas, no con la fisica.
extends CharacterBody2D

const Sacramento := preload("res://scripts/sacramento.gd")
const D := Sacramento.DEVOTO
const M := Sacramento.MOVIMIENTO

## Al final del aviso, el tinte rojo se va un instante: el golpe es ya.
const DESTELLO_MS := 110.0
const COLOR_AVISO := Color(0.898, 0.541, 0.502)
const COLOR_DESTELLO := Color(1.6, 1.6, 1.6)

enum Estado { PATRULLA, PERSECUCION, ANTICIPANDO, ATACANDO }

## Los extremos de la ronda, en x del mundo.
@export var ronda_izquierda := 0.0
@export var ronda_derecha := 0.0

## A quien persigue: el Cirujano. Lo pone el nivel.
var objetivo: CharacterBody2D

var estado := Estado.PATRULLA
var mirando := 1
var ahora := 0.0

var _fin_accion := -INF
var _fin_enfriamiento := -INF
var _ultimo_avistamiento := -INF
## Un golpe hiere una vez por ventana.
var _ya_golpeo := false

@onready var _figura: Node2D = $Figura
@onready var _brazo_alto: Node2D = $Figura/BrazoAlto
@onready var _tajo: Node2D = $Figura/Tajo


func _physics_process(delta: float) -> void:
	if objetivo == null:
		return
	pensar(delta, objetivo.position)
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	move_and_slide()
	_herir_si_toca()
	_pintar()


## Decide que hacer este paso. Va aparte de la fisica para probarlo sin ella.
func pensar(delta: float, hacia: Vector2) -> void:
	ahora += delta * 1000.0
	match estado:
		Estado.PATRULLA:
			_patrullar(hacia)
		Estado.PERSECUCION:
			_perseguir(hacia)
		Estado.ANTICIPANDO:
			_anticipar()
		Estado.ATACANDO:
			_atacar()


## La caja que choca, 12x22 con los pies en el origen, en coordenadas del mundo.
func caja() -> Rect2:
	return Rect2(position.x - 6.0, position.y - 22.0, 12.0, 22.0)


## Donde hace dano el golpe: delante, a la altura del pecho.
func zona_golpe() -> Rect2:
	var centro: float = position.x + mirando * (D["rango_ataque"] / 2.0 + 4.0)
	return Rect2(centro - D["rango_ataque"] / 2.0, position.y - 21.0, D["rango_ataque"], 20.0)


func _detecta(hacia: Vector2) -> bool:
	return position.distance_to(hacia) <= D["rango_deteccion"]


func _patrullar(hacia: Vector2) -> void:
	if _detecta(hacia):
		_ultimo_avistamiento = ahora
		estado = Estado.PERSECUCION
		return
	# Rebote en los extremos de la ronda.
	if position.x <= ronda_izquierda:
		mirando = 1
	if position.x >= ronda_derecha:
		mirando = -1
	velocity.x = mirando * D["velocidad_patrulla"]


func _perseguir(hacia: Vector2) -> void:
	if _detecta(hacia):
		_ultimo_avistamiento = ahora
	elif ahora - _ultimo_avistamiento > D["memoria_ms"]:
		estado = Estado.PATRULLA
		return

	var distancia := hacia.x - position.x
	mirando = 1 if distancia > 0.0 else -1
	if absf(distancia) <= D["rango_ataque"] and ahora >= _fin_enfriamiento:
		estado = Estado.ANTICIPANDO
		_fin_accion = ahora + D["anticipacion_ataque_ms"]
		_ya_golpeo = false
		velocity.x = 0.0
		return
	velocity.x = signf(distancia) * D["velocidad_persecucion"]


func _anticipar() -> void:
	velocity.x = 0.0
	if ahora < _fin_accion:
		return
	estado = Estado.ATACANDO
	_fin_accion = ahora + D["duracion_ataque_ms"]
	_fin_enfriamiento = _fin_accion + D["enfriamiento_ataque_ms"]


func _atacar() -> void:
	velocity.x = 0.0
	if ahora >= _fin_accion:
		estado = Estado.PERSECUCION


func _herir_si_toca() -> void:
	var suya: Rect2 = objetivo.caja()
	if estado == Estado.ATACANDO and not _ya_golpeo and zona_golpe().intersects(suya):
		_ya_golpeo = objetivo.recibir_golpe(position.x, D["dano"])
	elif caja().intersects(suya):
		objetivo.recibir_contacto(position.x)


## Figura provisional hasta que llegue el arte (#184): el brazo en alto y el
## tinte rojo son el aviso; el tajo, el golpe.
func _pintar() -> void:
	_figura.scale.x = mirando
	_brazo_alto.visible = estado == Estado.ANTICIPANDO
	_tajo.visible = estado == Estado.ATACANDO
	if estado != Estado.ANTICIPANDO:
		_figura.modulate = Color.WHITE
	elif _fin_accion - ahora <= DESTELLO_MS:
		_figura.modulate = COLOR_DESTELLO
	else:
		_figura.modulate = COLOR_AVISO
