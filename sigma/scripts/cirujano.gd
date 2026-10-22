## El Cirujano (#182): lee los controles, le pasa a movimiento.gd y a
## combate.gd lo que toca y mueve el cuerpo con lo que devuelven. Lleva su
## vitalidad y el sitio donde reaparece (#185), y resuelve sus golpes contra
## los enemigos (#183).
##
## El origen esta en los pies. La caja que choca es la del original, 10x22: la
## mascara y la mitra no chocan, porque un pico que tocara los techos volveria
## el salto impredecible. Esta en la capa 2 y solo choca con la 1, el mundo:
## los enemigos lo atraviesan y el dano se resuelve con las cajas.
extends CharacterBody2D

signal vitalidad_cambio(actual: int, maxima: int)
signal fervor_cambio(actual: int, maximo: int)
signal pociones_cambio(cargas: int, maximas: int)

enum Resultado { PARADO, HERIDO, IGNORADO }

const Movimiento := preload("res://scripts/movimiento.gd")
const Combate := preload("res://scripts/combate.gd")
const Sacramento := preload("res://scripts/sacramento.gd")

## El bisturi es de oro: el tajo tiene que leerse como esa herramienta. El
## cargado, mas claro, al filo del blanco.
const COLOR_TAJO := Color(0.988, 0.816, 0.22)
const COLOR_TAJO_CARGADO := Color(0.957, 0.929, 0.576)

var movimiento: Movimiento
var combate: Combate
var vitalidad: int = Sacramento.VITALIDAD["maxima"]
## Donde vuelve al morir o al caer al vacio: el ultimo Altar, o donde empezo.
var punto_reaparicion := Vector2.ZERO

@onready var _figura: Node2D = $Figura
@onready var _tajo: Polygon2D = $Tajo


func _ready() -> void:
	punto_reaparicion = position
	movimiento = Movimiento.new(position.y)
	movimiento.caida.connect(_al_caer)
	combate = Combate.new()


func _physics_process(delta: float) -> void:
	var lucha := Combate.Entrada.new()
	lucha.golpe_pulsado = Input.is_action_just_pressed("golpear")
	lucha.golpe_soltado = Input.is_action_just_released("golpear")
	lucha.parry_pulsado = Input.is_action_just_pressed("parry")
	lucha.pocion_pulsada = Input.is_action_just_pressed("pocion")
	lucha.arriba = Input.is_action_pressed("arriba")
	lucha.abajo = Input.is_action_pressed("abajo")

	var fervor_antes := combate.fervor
	var cargas_antes := combate.cargas_pocion
	combate.paso(delta, lucha, movimiento.libre(), is_on_floor())
	if combate.bloqueo_ms > 0.0:
		movimiento.bloquear(combate.bloqueo_ms)
	if combate.curar > 0:
		_curar(combate.curar)

	var entrada := Movimiento.Entrada.new()
	entrada.eje_x = int(signf(Input.get_axis("izquierda", "derecha")))
	entrada.saltar_pulsado = Input.is_action_just_pressed("saltar")
	entrada.saltar_mantenido = Input.is_action_pressed("saltar")
	entrada.dash_pulsado = Input.is_action_just_pressed("dash")
	entrada.arriba = lucha.arriba
	entrada.abajo = lucha.abajo

	# La normal de la pared apunta hacia fuera: una pared a la derecha da -1.
	var pared := -int(signf(get_wall_normal().x)) if is_on_wall() else 0

	movimiento.velocidad = velocity
	movimiento.paso(delta, entrada, is_on_floor(), pared, position.y)
	velocity = movimiento.velocidad
	move_and_slide()

	if combate.zona_activa():
		_golpear_enemigos()
	if combate.fervor != fervor_antes:
		fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
	if combate.cargas_pocion != cargas_antes:
		pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
	_pintar()


## La caja que choca, en coordenadas del mundo.
func caja() -> Rect2:
	return Rect2(position.x - 5.0, position.y - 22.0, 10.0, 22.0)


## Un golpe de un enemigo desde `origen_x`. Si la ventana del parry esta
## abierta lo para; si no, hiere, salvo en un dash o con i-frames.
func recibir_golpe(origen_x: float, dano: int) -> Resultado:
	if combate.parar():
		fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
		_pausa_de_impacto(Sacramento.IMPACTO["parry_ms"])
		return Resultado.PARADO
	var retroceso := Vector2(Sacramento.VITALIDAD["retroceso_x"], Sacramento.VITALIDAD["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return Resultado.IGNORADO
	combate.cancelar()
	_perder(dano)
	return Resultado.HERIDO


## Rozar a un enemigo: el mismo dano que un golpe, con otro empujon. El parry
## no lo para: lee golpes, no evita chocarse.
func recibir_contacto(origen_x: float) -> bool:
	var retroceso := Vector2(Sacramento.CONTACTO["retroceso_x"], Sacramento.CONTACTO["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return false
	combate.cancelar()
	_perder(Sacramento.CONTACTO["dano"])
	return true


## Caer al vacio: cuesta un punto y devuelve al Altar, pero no es morir.
func caer_al_vacio() -> void:
	_perder(1)
	if vitalidad > 0:
		_volver()


## Aplastado entre un muro que avanza y la piedra (#186): cuesta vitalidad y
## devuelve al Altar. El muro ya ha avisado antes de moverse.
func aplastar(dano: int) -> void:
	_perder(dano)
	if vitalidad > 0:
		_volver()


## Rezar en un Altar: se arrodilla, se cura del todo, llena el frasco y ese
## Altar es el nuevo sitio donde vuelve. Devuelve false si no puede.
func rezar(altar: Vector2) -> bool:
	if not movimiento.rezar():
		return false
	punto_reaparicion = altar
	vitalidad = Sacramento.VITALIDAD["maxima"]
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	combate.reponer_pociones()
	pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
	return true


func _golpear_enemigos() -> void:
	var zona := combate.zona(position, movimiento.mirando)
	for enemigo in get_tree().get_nodes_in_group("enemigos"):
		if not enemigo.vivo() or not zona.intersects(enemigo.caja()):
			continue
		var dano := combate.registrar_golpe(enemigo.get_instance_id())
		if dano == 0:
			continue
		enemigo.recibir_dano(dano, position.x)
		var cargado := combate.tipo == Combate.Tipo.CARGADO
		_pausa_de_impacto(Sacramento.IMPACTO["cargado_ms" if cargado else "golpe_ms"])
		if combate.direccion == Combate.Direccion.ABAJO:
			combate.rebotar()
			movimiento.rebotar()
			velocity = movimiento.velocidad


## La pausa al conectar (hitstop): el mundo se para un instante. El temporizador
## no se para con el, o no acabaria nunca.
func _pausa_de_impacto(ms: float) -> void:
	Engine.time_scale = 0.0
	await get_tree().create_timer(ms / 1000.0, true, false, true).timeout
	Engine.time_scale = 1.0


func _curar(puntos: int) -> void:
	vitalidad = mini(Sacramento.VITALIDAD["maxima"], vitalidad + puntos)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])


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
	combate.cancelar()


## Figura provisional hasta que llegue el arte (#184).
func _pintar() -> void:
	var estado := movimiento.estado
	_figura.scale.x = movimiento.mirando
	_figura.modulate.a = 0.5 if movimiento.invulnerable else 1.0
	_figura.position.y = 6.0 if estado == Movimiento.Estado.REZANDO else 0.0
	# Parar: un destello frio. Beber: rojo de carne.
	if combate.accion == Combate.Accion.PARRY:
		_figura.modulate = Color(0.75, 0.85, 1.0, _figura.modulate.a)
	elif combate.accion == Combate.Accion.POCION:
		_figura.modulate = Color(1.0, 0.6, 0.6, _figura.modulate.a)
	else:
		_figura.modulate = Color(1, 1, 1, _figura.modulate.a)

	_tajo.visible = combate.zona_activa()
	if _tajo.visible:
		var zona := combate.zona(position, movimiento.mirando)
		zona.position -= position
		var cargado := combate.tipo == Combate.Tipo.CARGADO
		_tajo.color = COLOR_TAJO_CARGADO if cargado else COLOR_TAJO
		_tajo.polygon = _media_luna(zona, combate.direccion, movimiento.mirando)


## Una media luna dentro de `zona`, con la panza hacia donde va el golpe: el
## arco del bisturi. Sin el, el golpe no se ve hasta que toca algo.
static func _media_luna(zona: Rect2, direccion: Combate.Direccion, mirando: int) -> PackedVector2Array:
	var puntos: Array[Vector2] = [
		Vector2(0.0, 0.0), Vector2(0.7, 0.12), Vector2(1.0, 0.5),
		Vector2(0.7, 0.88), Vector2(0.0, 1.0), Vector2(0.45, 0.5),
	]
	var forma := PackedVector2Array()
	for p in puntos:
		var q := p
		match direccion:
			Combate.Direccion.ARRIBA:
				q = Vector2(p.y, 1.0 - p.x)
			Combate.Direccion.ABAJO:
				q = Vector2(p.y, p.x)
			_:
				if mirando < 0:
					q = Vector2(1.0 - p.x, p.y)
		forma.append(zona.position + q * zona.size)
	return forma
