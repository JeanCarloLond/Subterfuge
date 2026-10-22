## El Cirujano (#182): lee los controles, le pasa a movimiento.gd y a
## combate.gd lo que toca y mueve el cuerpo con lo que devuelven. Lleva su
## vitalidad y el sitio donde reaparece (#185), y resuelve sus golpes contra
## los enemigos (#183): tambien el contragolpe tras un parry y la ejecucion de
## un aturdido, como en Blasphemous.
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
## El contragolpe, al blanco: es el golpe mas limpio. La ejecucion, con sangre.
const COLOR_TAJO_CONTRAGOLPE := Color(1.0, 0.97, 0.86)
const COLOR_TAJO_EJECUCION := Color(0.86, 0.24, 0.18)
## Lo que se ve el tajo de la ejecucion, y cuanto tiembla la camara con el.
const TAJO_EJECUCION_MS := 160.0
const SACUDIDA_PX := 3.0

## El arte provisional del original (#184), hasta que llegue el de Mariana.
const POSES := {
	"quieto": preload("res://arte/provisional/cirujano.png"),
	"paso_a": preload("res://arte/provisional/cirujano-paso-a.png"),
	"paso_b": preload("res://arte/provisional/cirujano-paso-b.png"),
	"guardia": preload("res://arte/provisional/cirujano-guardia.png"),
	"bebe": preload("res://arte/provisional/cirujano-bebe.png"),
	"alza": preload("res://arte/provisional/cirujano-alza.png"),
}
## Contacto, paso, contacto al reves, paso: la pose quieta hace de contacto.
const CICLO_PASO := ["quieto", "paso_a", "paso_b", "paso_a"]
## Un cuadro cada tantos pixeles andados. Menos, y tiembla; mas, y patina.
const PX_POR_CUADRO := 9.0

var movimiento: Movimiento
var combate: Combate
var vitalidad: int = Sacramento.VITALIDAD["maxima"]
## Donde vuelve al morir o al caer al vacio: el ultimo Altar, o donde empezo.
var punto_reaparicion := Vector2.ZERO

## Lo andado en el suelo: el paso va con la distancia, no con el reloj.
## Contra una pared no se avanza, y las piernas no deben moverse.
var _recorrido := 0.0
## A quien esta ejecutando, y si ya bajo el bisturi.
var _victima: Node2D
var _rematada := false
var _fin_tajo_ejecucion := -INF

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite
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
		if combate.accion == Combate.Accion.GOLPE and combate.tipo == Combate.Tipo.CONTRAGOLPE:
			_embestir()
	if combate.curar > 0:
		_curar(combate.curar)
	if Input.is_action_just_pressed("interactuar"):
		_intentar_ejecutar()
	if combate.accion == Combate.Accion.EJECUCION:
		if combate.ejecucion_golpea() and not _rematada:
			_rematar()
	elif _victima != null:
		_victima = null

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
	_pintar(delta)


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
		_pausa_de_impacto(_pausa_del_golpe())
		if combate.direccion == Combate.Direccion.ABAJO:
			combate.rebotar()
			movimiento.rebotar()
			velocity = movimiento.velocidad


func _pausa_del_golpe() -> float:
	match combate.tipo:
		Combate.Tipo.CARGADO:
			return Sacramento.IMPACTO["cargado_ms"]
		Combate.Tipo.CONTRAGOLPE:
			return Sacramento.IMPACTO["contragolpe_ms"]
	return Sacramento.IMPACTO["golpe_ms"]


## El contragolpe se adelanta un palmo hacia quien acaba de golpear: con
## colision, para no meterse en la piedra.
func _embestir() -> void:
	move_and_collide(Vector2(movimiento.mirando * Sacramento.COMBATE["contragolpe"]["embestida_px"], 0.0))


## Interactuar junto a un aturdido lo ejecuta. Si hay varios, el mas cercano.
func _intentar_ejecutar() -> void:
	var E: Dictionary = Sacramento.EJECUCION
	var mejor: Node2D = null
	for enemigo in get_tree().get_nodes_in_group("enemigos"):
		if not enemigo.has_method("ejecutable") or not enemigo.ejecutable():
			continue
		var dx: float = absf(enemigo.position.x - position.x)
		if dx > E["alcance_x"] or absf(enemigo.position.y - position.y) > E["alcance_y"]:
			continue
		if mejor == null or dx < absf(mejor.position.x - position.x):
			mejor = enemigo
	if mejor == null or not combate.ejecutar(movimiento.libre()):
		return

	_victima = mejor
	_rematada = false
	movimiento.mirando = 1 if mejor.position.x >= position.x else -1
	# Se coloca a un palmo, de frente: la ejecucion no se hace desde lejos.
	var sitio: float = mejor.position.x - movimiento.mirando * 16.0
	move_and_collide(Vector2(sitio - position.x, 0.0))
	mejor.ejecutar(position.x)
	movimiento.bloquear(E["duracion_ms"])
	movimiento.blindar(E["duracion_ms"])
	fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
	_acercar_camara(E["duracion_ms"])


## Baja el bisturi: el aturdido cae, el mundo se para y la camara tiembla.
func _rematar() -> void:
	_rematada = true
	if is_instance_valid(_victima):
		_victima.rematar()
	_fin_tajo_ejecucion = combate.ahora + TAJO_EJECUCION_MS
	_sacudir()
	_pausa_de_impacto(Sacramento.EJECUCION["pausa_ms"])


## La camara se acerca mientras dura la ejecucion y vuelve despues.
func _acercar_camara(ms: float) -> void:
	var camara := get_viewport().get_camera_2d()
	if camara == null:
		return
	var zoom: float = Sacramento.EJECUCION["zoom"]
	var acercar := create_tween()
	acercar.tween_property(camara, "zoom", Vector2.ONE * zoom, 0.18).set_ease(Tween.EASE_OUT)
	acercar.tween_interval(ms / 1000.0 - 0.18)
	acercar.tween_property(camara, "zoom", Vector2.ONE, 0.25).set_ease(Tween.EASE_IN_OUT)


func _sacudir() -> void:
	var camara := get_viewport().get_camera_2d()
	if camara == null:
		return
	var sacudida := create_tween()
	for i in 4:
		var lado := 1.0 if i % 2 == 0 else -1.0
		sacudida.tween_property(camara, "offset", Vector2(lado * SACUDIDA_PX, -lado * SACUDIDA_PX / 2.0), 0.03)
	sacudida.tween_property(camara, "offset", Vector2.ZERO, 0.04)


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


## La figura: la pose, y como se estira y se aplasta. Es lo del original:
## quita la rigidez de un dibujo quieto mientras no hay animaciones de verdad.
func _pintar(delta: float) -> void:
	var estado := movimiento.estado
	var en_suelo := is_on_floor()

	var pose := "quieto"
	var ejecutando := combate.accion == Combate.Accion.EJECUCION
	if ejecutando:
		pose = "quieto" if combate.ejecucion_golpea() else "alza"
	elif combate.accion == Combate.Accion.PARRY:
		pose = "guardia"
	elif combate.accion == Combate.Accion.POCION:
		pose = "bebe"
	elif en_suelo and absf(velocity.x) > 20.0:
		_recorrido += absf(velocity.x) * delta
		pose = CICLO_PASO[int(_recorrido / PX_POR_CUADRO) % CICLO_PASO.size()]
	_sprite.texture = POSES[pose]

	var escala := Vector2.ONE
	if estado == Movimiento.Estado.REZANDO:
		escala = Vector2(1.1, 0.78) # arrodillado
	elif ejecutando:
		# Se estira con el bisturi en alto; al bajarlo, se aplasta en el tajo.
		escala = Vector2(1.2, 0.85) if combate.ejecucion_golpea() else Vector2(0.9, 1.12)
	elif combate.anticipando():
		escala = Vector2(0.9, 1.08) # se recoge antes del golpe
	elif combate.accion == Combate.Accion.GOLPE:
		match combate.tipo: # y se lanza
			Combate.Tipo.CARGADO:
				escala = Vector2(1.22, 0.86)
			Combate.Tipo.CONTRAGOLPE:
				escala = Vector2(1.28, 0.84)
			_:
				escala = Vector2(1.14, 0.92)
	elif estado == Movimiento.Estado.DASH:
		escala = Vector2(1.18, 0.86)
	elif not en_suelo:
		# Subiendo estira; cayendo, menos, para no parecer de goma.
		var vertical := clampf(velocity.y / Sacramento.MOVIMIENTO["velocidad_caida_max"], -1.0, 1.0)
		var intensidad := 0.14 if vertical < 0.0 else 0.09
		escala = Vector2(1.0 - absf(vertical) * intensidad * 0.7, 1.0 + absf(vertical) * intensidad)
	elif absf(velocity.x) > 20.0:
		var paso := sin(Time.get_ticks_msec() / 90.0)
		escala = Vector2(1.0 - paso * 0.025, 1.0 + paso * 0.035) # cabeceo al andar
	_figura.scale = Vector2(escala.x * movimiento.mirando, escala.y)

	# La ejecucion blinda, pero no es un golpe recibido: no parpadea.
	var alfa := 0.5 if movimiento.invulnerable and not ejecutando else 1.0
	_figura.modulate = Color(1, 1, 1, alfa)

	var tajo_ejecucion := ejecutando and combate.ahora < _fin_tajo_ejecucion
	_tajo.visible = combate.zona_activa() or tajo_ejecucion
	if tajo_ejecucion:
		var zona := Rect2(Vector2(movimiento.mirando * 18.0 - 18.0, -32.0), Vector2(36.0, 30.0))
		_tajo.color = COLOR_TAJO_EJECUCION
		_tajo.polygon = _media_luna(zona, Combate.Direccion.LATERAL, movimiento.mirando)
	elif _tajo.visible:
		var zona := combate.zona(position, movimiento.mirando)
		zona.position -= position
		match combate.tipo:
			Combate.Tipo.CARGADO:
				_tajo.color = COLOR_TAJO_CARGADO
			Combate.Tipo.CONTRAGOLPE:
				_tajo.color = COLOR_TAJO_CONTRAGOLPE
			_:
				_tajo.color = COLOR_TAJO
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
