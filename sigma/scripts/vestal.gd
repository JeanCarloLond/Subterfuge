## La Vestal: clero de la Diocesis (scripts/vestal-sigma.mjs para su figura).
## No pelea, administra. Mantiene la distancia y lanza sellos del diezmo; si el
## Cirujano se le acerca, retrocede en vez de plantarle cara. Tiene poca vida:
## el problema no es matarla, es llegar hasta ella.
##
## Su lanzamiento se avisa 520 ms (el sello se enciende en la mano) porque la
## respuesta interesante no es esquivar, es PARAR el sello y devolverselo: su
## propio sello la deja aturdida, y aturdida se la puede ejecutar.
##
## Como el Devoto: capa 3, solo choca con el mundo, y la cabeza (pensar) va
## aparte de la fisica para probarla sin ella.
extends CharacterBody2D

## Lanza un sello desde `sitio` hacia `direccion` (-1 o 1).
signal lanzo(sitio: Vector2, direccion: int)

const Sacramento := preload("res://scripts/sacramento.gd")
const Texturas := preload("res://scripts/texturas.gd")
const Bocadillo := preload("res://scripts/bocadillo.gd")
## Lo que dice al verlo: administra el diezmo, y la ley de la Mano que mira
## tambien es suya (canon).
const FRASES := [
	"Mirar no es tu oficio.",
	"Vuelve a tu sala, Mano.",
	"El diezmo no perdona.",
	"Lo que mira, se sella.",
]
const PAUSA_FRASES_MS := 9000.0
const Herida := preload("res://scripts/herida.gd")
const Sello := preload("res://scripts/sello.gd")
const V := Sacramento.VESTAL
const M := Sacramento.MOVIMIENTO
const ARTE := "res://arte/vestal/%s-%d.png"
const CUADROS := {"reposo": 2, "andar": 4, "alza": 2, "lanza": 1, "aturdido": 1, "ejecutado": 1}
const MARCA := preload("res://arte/provisional/bisturi.png")
const COLOR_DESTELLO := Color(1.6, 1.6, 1.6)
const COLOR_ATURDIDO := Color(0.91, 0.851, 0.627)
const COLOR_SANGRE := Color(0.62, 0.08, 0.07)
const LANZA_MS := 220.0
const CAIDA_MS := 500.0
const PX_POR_CUADRO := 6.0

enum Estado { ESPERA, REPOSICION, INVOCANDO, ATURDIDO, EJECUTADO, MUERTO }

## Los extremos del tramo por el que se mueve, en x del mundo.
@export var ronda_izquierda := 0.0
@export var ronda_derecha := 0.0

## A quien vigila: el Cirujano. Lo pone el nivel.
var objetivo: CharacterBody2D

var estado := Estado.ESPERA
var mirando := 1
var ahora := 0.0
var vida: int = V["vida"]

var _fin_accion := -INF
var _fin_enfriamiento := -INF
var _ultimo_avistamiento := -INF
## Cuando le entro el ultimo golpe: de ahi salen el blanco y la sangre.
var _herido_en := -INF
var _proxima_frase := 0.0
var _fin_lanza := -INF
var _cayendo := false
## Aturdida por su propio sello: la unica forma de que se la pueda ejecutar.
var _abierta := false
var _recorrido := 0.0
var _cuadros := {}
var _marca: Sprite2D

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite


func _ready() -> void:
	Herida.preparar($Figura/Sprite)
	add_to_group("enemigos")
	for nombre in CUADROS:
		var lista: Array[Texture2D] = []
		for i in CUADROS[nombre]:
			lista.append(Texturas.con_normales(ARTE % [nombre, i]))
		_cuadros[nombre] = lista
	_marca = Sprite2D.new()
	_marca.texture = MARCA
	_marca.position = Vector2(0, -56)
	_marca.rotation = PI / 2.0
	_marca.visible = false
	add_child(_marca)
	lanzo.connect(_soltar_sello)


func _physics_process(delta: float) -> void:
	if objetivo == null:
		return
	if estado == Estado.MUERTO:
		if not _cayendo:
			_caer()
		return
	pensar(delta, objetivo.position)
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	move_and_slide()
	_pintar(delta)


## Decide que hacer este paso. Va aparte de la fisica para probarlo sin ella.
func pensar(delta: float, hacia: Vector2) -> void:
	ahora += delta * 1000.0
	match estado:
		Estado.ATURDIDO:
			velocity.x = move_toward(velocity.x, 0.0, 600.0 * delta)
			if ahora >= _fin_accion:
				estado = Estado.ESPERA
				_abierta = false
		Estado.INVOCANDO:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				estado = Estado.ESPERA
				_fin_enfriamiento = ahora + V["enfriamiento_ms"]
				_fin_lanza = ahora + LANZA_MS
				# A la altura del pecho del Cirujano (su caja mide 22): mas alto, le
				# pasaria por encima.
				lanzo.emit(position + Vector2(mirando * 10, -14), mirando)
		Estado.EJECUTADO:
			velocity.x = 0.0
		_:
			_situarse(hacia)


func vivo() -> bool:
	return estado != Estado.MUERTO


func caja() -> Rect2:
	return Rect2(position.x - 6.0, position.y - 26.0, 12.0, 26.0)


func recibir_dano(cantidad: int, origen_x: float) -> void:
	if estado == Estado.MUERTO:
		return
	vida = maxi(0, vida - cantidad)
	_herido_en = ahora
	var hacia := -1.0 if origen_x > position.x else 1.0
	Herida.salpicar(get_parent(), position + Vector2(0, -20), hacia, 22 if vida == 0 else 8)
	if vida == 0:
		_voz("muerte")
		_morir()
		return
	_voz("herida")
	# Herida mientras invoca, el sello se apaga y tarda menos en volver a probar.
	if estado == Estado.INVOCANDO:
		_fin_enfriamiento = ahora + V["enfriamiento_ms"] * 0.6
	estado = Estado.ATURDIDO
	_abierta = false
	_fin_accion = ahora + V["aturdimiento_ms"]
	_ultimo_avistamiento = ahora
	velocity.x = (-1.0 if position.x < origen_x else 1.0) * V["retroceso"]


## Su propio sello devuelto: aturdida lo que un parado, y ejecutable.
func aturdir() -> void:
	if estado == Estado.MUERTO:
		return
	estado = Estado.ATURDIDO
	_abierta = true
	_fin_accion = ahora + Sacramento.COMBATE["parry"]["aturdimiento_ms"]
	velocity.x = 0.0


func ejecutable() -> bool:
	return estado == Estado.ATURDIDO and _abierta


func ejecutar(desde_x: float) -> void:
	if not ejecutable():
		return
	estado = Estado.EJECUTADO
	mirando = 1 if desde_x > position.x else -1
	velocity.x = 0.0


func rematar() -> void:
	if estado == Estado.MUERTO:
		return
	vida = 0
	_herido_en = ahora
	_voz("muerte")
	_salpicar()
	_morir()


func _situarse(hacia: Vector2) -> void:
	var distancia := position.distance_to(hacia)
	if distancia > V["rango_deteccion"]:
		if ahora - _ultimo_avistamiento > V["memoria_ms"]:
			velocity.x = 0.0
			estado = Estado.ESPERA
			return
	else:
		if ahora - _ultimo_avistamiento > V["memoria_ms"] and ahora >= _proxima_frase:
			_proxima_frase = ahora + PAUSA_FRASES_MS
			Bocadillo.decir(self, FRASES.pick_random())
		_ultimo_avistamiento = ahora
	var hacia_el := 1 if hacia.x >= position.x else -1
	mirando = hacia_el

	# Demasiado cerca: retrocede, si su tramo la deja.
	if distancia < V["rango_huida"]:
		var destino: float = position.x - hacia_el * 10.0
		var puede := destino > ronda_izquierda and destino < ronda_derecha
		estado = Estado.REPOSICION
		velocity.x = -hacia_el * V["velocidad"] if puede else 0.0
		return
	# Lejos: se acerca hasta su distancia, sin salir de su tramo.
	if distancia > V["rango_preferido"] + 25.0:
		var destino: float = position.x + hacia_el * 10.0
		estado = Estado.REPOSICION
		velocity.x = hacia_el * V["velocidad"] if destino > ronda_izquierda and destino < ronda_derecha else 0.0
		return
	velocity.x = 0.0
	estado = Estado.ESPERA
	if ahora >= _fin_enfriamiento:
		estado = Estado.INVOCANDO
		_fin_accion = ahora + V["anticipacion_ms"]
		_voz("ataque")


func _soltar_sello(sitio: Vector2, direccion: int) -> void:
	if not is_inside_tree():
		return
	var sello := Sello.new()
	sello.position = sitio
	sello.direccion = direccion
	sello.dueno = self
	sello.objetivo = objetivo
	get_parent().add_child(sello)


func _morir() -> void:
	estado = Estado.MUERTO
	velocity = Vector2.ZERO
	$Caja.set_deferred("disabled", true)
	Herida.charco(get_parent(), position)


func _caer() -> void:
	_cayendo = true
	_marca.visible = false
	_sprite.texture = _cuadros["aturdido"][0]
	var caida := create_tween()
	caida.tween_property(_figura, "rotation", -mirando * PI / 2.0, CAIDA_MS / 1000.0)
	caida.parallel().tween_property(_figura, "modulate:a", 0.0, CAIDA_MS / 1000.0)
	caida.tween_callback(queue_free)


func _salpicar() -> void:
	if not is_inside_tree():
		return
	var gotas := CPUParticles2D.new()
	gotas.position = position + Vector2(0, -20)
	gotas.one_shot = true
	gotas.explosiveness = 0.9
	gotas.amount = 22
	gotas.lifetime = 0.6
	gotas.direction = Vector2(-mirando, -0.6)
	gotas.spread = 50.0
	gotas.initial_velocity_min = 60.0
	gotas.initial_velocity_max = 150.0
	gotas.gravity = Vector2(0, 420)
	gotas.scale_amount_min = 1.0
	gotas.scale_amount_max = 2.0
	gotas.color = COLOR_SANGRE
	get_parent().add_child(gotas)
	gotas.emitting = true
	get_tree().create_timer(1.0).timeout.connect(gotas.queue_free)


func _voz(voz: String) -> void:
	if not is_inside_tree():
		return
	var voces := get_node_or_null("/root/Voces")
	if voces:
		voces.enemigo("vestal", voz, self)


func _pintar(delta: float) -> void:
	_sprite.texture = _cuadro(delta)
	_figura.scale = Vector2(mirando, 1.0)
	_marca.visible = ejecutable()
	if _marca.visible:
		_marca.scale = Vector2.ONE * (1.0 + 0.15 * sin(ahora / 80.0))
	_figura.rotation = sin(ahora / 50.0) * 0.06 if estado == Estado.ATURDIDO else 0.0
	Herida.pintar(_sprite, ahora - _herido_en)
	if estado == Estado.ATURDIDO or estado == Estado.EJECUTADO:
		_figura.modulate = COLOR_ATURDIDO
	else:
		_figura.modulate = Color.WHITE


func _cuadro(delta: float) -> Texture2D:
	match estado:
		Estado.INVOCANDO:
			var hecho := 1.0 - (_fin_accion - ahora) / V["anticipacion_ms"]
			return _cuadros["alza"][0 if hecho < 0.5 else 1]
		Estado.ATURDIDO:
			return _cuadros["aturdido"][0]
		Estado.EJECUTADO:
			return _cuadros["ejecutado"][0]
	if ahora < _fin_lanza:
		return _cuadros["lanza"][0]
	if absf(velocity.x) > 1.0:
		_recorrido += absf(velocity.x) * delta
		return _cuadros["andar"][int(_recorrido / PX_POR_CUADRO) % CUADROS["andar"]]
	return _cuadros["reposo"][int(ahora / 400.0) % CUADROS["reposo"]]
