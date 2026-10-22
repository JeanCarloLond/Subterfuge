## El Devoto (#185): fiel de la Diocesis y el primer eslabon del Atrio.
## Patrulla su ronda, persigue al Cirujano si lo tiene cerca y avisa del golpe
## 420 ms antes de darlo, para que se pueda leer.
##
## Se le hiere con el bisturi (#183), y si se le para el golpe con el parry se
## queda aturdido 900 ms: abierto, para castigarlo.
##
## Esta en la capa 3 y solo choca con el mundo. El dano al Cirujano se mira con
## las cajas, no con la fisica.
extends CharacterBody2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const D := Sacramento.DEVOTO
const M := Sacramento.MOVIMIENTO

## Al final del aviso, el tinte rojo se va un instante: el golpe es ya.
const DESTELLO_MS := 110.0
const COLOR_AVISO := Color(0.898, 0.541, 0.502)
const COLOR_DESTELLO := Color(1.6, 1.6, 1.6)
## Aturdido: amarillo palido, para ver de un vistazo que esta abierto.
const COLOR_ATURDIDO := Color(0.91, 0.851, 0.627)
## El arte provisional del original (#184): dos variantes, a cada una le falta
## otra cosa, y las poses del aviso (el brazo en alto) y del golpe.
const FIGURAS := {
	"devoto": [
		preload("res://arte/provisional/devoto.png"),
		preload("res://arte/provisional/devoto-alza.png"),
		preload("res://arte/provisional/devoto-golpe.png"),
	],
	"devoto-b": [
		preload("res://arte/provisional/devoto-b.png"),
		preload("res://arte/provisional/devoto-b-alza.png"),
		preload("res://arte/provisional/devoto-b-golpe.png"),
	],
}
## El tajo, del color de lo que golpea: el aparato de la A, la carne de la B.
const COLOR_TAJO := {"devoto": Color(0.788, 0.82, 0.769, 0.85), "devoto-b": Color(0.831, 0.337, 0.29, 0.85)}
## El brazo se queda abajo un poco despues del golpe: da tiempo a ver con que.
const POSE_GOLPE_MS := 160.0

## Lo que dura el destello de un golpe recibido, y lo que tarda en irse al caer.
const HERIDO_MS := 90.0
const CAIDA_MS := 400.0

enum Estado { PATRULLA, PERSECUCION, ANTICIPANDO, ATACANDO, ATURDIDO, MUERTO }

## Los extremos de la ronda, en x del mundo.
@export var ronda_izquierda := 0.0
@export var ronda_derecha := 0.0

## A quien persigue: el Cirujano. Lo pone el nivel.
var objetivo: CharacterBody2D

var estado := Estado.PATRULLA
var mirando := 1
var ahora := 0.0
var vida: int = D["vida"]

var _fin_accion := -INF
var _fin_enfriamiento := -INF
var _ultimo_avistamiento := -INF
## Un golpe hiere una vez por ventana.
var _ya_golpeo := false
var _fin_destello := -INF
var _fin_pose_golpe := -INF
var _figura_de := "devoto"
var _cayendo := false

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite
@onready var _tajo: Polygon2D = $Figura/Tajo


func _ready() -> void:
	add_to_group("enemigos")
	_figura_de = variante(position)
	_tajo.color = COLOR_TAJO[_figura_de]


## Que variante le toca por su sitio en el nivel, no al azar: el mismo Devoto
## sale igual cada partida, porque el jugador se orienta tambien por ellos. El
## mismo hash que Devoto.ts: con solo el bit bajo salian todos iguales, porque
## las rondas estan en coordenadas pares.
static func variante(sitio: Vector2) -> String:
	var h := ((roundi(sitio.x) * 73856093) ^ (roundi(sitio.y) * 19349663)) & 0xFFFFFFFF
	h = ((h ^ (h >> 15)) * 0x2c1b3c6d) & 0xFFFFFFFF
	h = ((h ^ (h >> 12)) * 0x297a2d39) & 0xFFFFFFFF
	return "devoto" if (h ^ (h >> 15)) % 2 == 0 else "devoto-b"


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
		Estado.ATURDIDO:
			_esperar_aturdido()


func vivo() -> bool:
	return estado != Estado.MUERTO


## Un golpe del bisturi. Lo pone en alerta aunque no hubiera visto al Cirujano.
func recibir_dano(cantidad: int, origen_x: float) -> void:
	if estado == Estado.MUERTO:
		return
	vida = maxi(0, vida - cantidad)
	_fin_destello = ahora + HERIDO_MS
	if vida == 0:
		_morir()
		return
	_ultimo_avistamiento = ahora
	mirando = 1 if origen_x > position.x else -1
	if estado == Estado.PATRULLA:
		estado = Estado.PERSECUCION


## El parry le ha parado el golpe: se queda abierto un rato, sin golpear.
func aturdir() -> void:
	if estado == Estado.MUERTO:
		return
	estado = Estado.ATURDIDO
	_fin_accion = ahora + Sacramento.COMBATE["parry"]["aturdimiento_ms"]
	_fin_enfriamiento = _fin_accion
	velocity.x = 0.0


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
	_fin_pose_golpe = _fin_accion + POSE_GOLPE_MS
	_fin_enfriamiento = _fin_accion + D["enfriamiento_ataque_ms"]


func _atacar() -> void:
	velocity.x = 0.0
	if ahora >= _fin_accion:
		estado = Estado.PERSECUCION


func _esperar_aturdido() -> void:
	velocity.x = 0.0
	if ahora >= _fin_accion:
		_ultimo_avistamiento = ahora
		estado = Estado.PERSECUCION


## Ya no estorba ni hace dano. La caida se dibuja en el paso siguiente.
func _morir() -> void:
	estado = Estado.MUERTO
	velocity = Vector2.ZERO
	$Caja.set_deferred("disabled", true)


## Cae de lado y se va.
func _caer() -> void:
	_cayendo = true
	_tajo.visible = false
	_sprite.texture = FIGURAS[_figura_de][0]
	var caida := create_tween()
	caida.tween_property(_figura, "rotation", -mirando * PI / 2.0, CAIDA_MS / 1000.0)
	caida.parallel().tween_property(_figura, "modulate:a", 0.0, CAIDA_MS / 1000.0)
	caida.tween_callback(queue_free)


func _herir_si_toca() -> void:
	var suya: Rect2 = objetivo.caja()
	if estado == Estado.ATACANDO and not _ya_golpeo and zona_golpe().intersects(suya):
		var resultado: Cirujano.Resultado = objetivo.recibir_golpe(position.x, D["dano"])
		_ya_golpeo = resultado != Cirujano.Resultado.IGNORADO
		if resultado == Cirujano.Resultado.PARADO:
			aturdir()
	elif caja().intersects(suya):
		objetivo.recibir_contacto(position.x)


## La figura, con el arte provisional (#184): el brazo en alto y el
## tinte rojo son el aviso; el tajo, el golpe; el amarillo y el vaiven, que
## esta aturdido.
func _pintar() -> void:
	var poses: Array = FIGURAS[_figura_de]
	var pose := 0
	if estado == Estado.ANTICIPANDO:
		pose = 1
	elif estado == Estado.ATACANDO or ahora < _fin_pose_golpe:
		pose = 2
	_sprite.texture = poses[pose]
	_tajo.visible = estado == Estado.ATACANDO

	# El aviso: se echa hacia atras y se estira mientras levanta el brazo. Al
	# golpear, la tension se suelta hacia delante.
	var atras := 0.0
	var estirado := 1.0
	if estado == Estado.ANTICIPANDO:
		var hecho := 1.0 - (_fin_accion - ahora) / D["anticipacion_ataque_ms"]
		var curva := 1.0 - pow(1.0 - clampf(hecho / 0.75, 0.0, 1.0), 2.0)
		atras = -3.0 * curva
		estirado = 1.0 + 0.12 * curva
	elif estado == Estado.ATACANDO:
		atras = 5.0
	_figura.position.x = atras * mirando
	_figura.scale = Vector2(mirando, estirado)
	_figura.rotation = sin(ahora / 50.0) * 0.1 if estado == Estado.ATURDIDO else 0.0

	if ahora < _fin_destello:
		_figura.modulate = COLOR_DESTELLO
	elif estado == Estado.ATURDIDO:
		_figura.modulate = COLOR_ATURDIDO
	elif estado != Estado.ANTICIPANDO:
		_figura.modulate = Color.WHITE
	elif _fin_accion - ahora <= DESTELLO_MS:
		_figura.modulate = COLOR_DESTELLO
	else:
		_figura.modulate = COLOR_AVISO
