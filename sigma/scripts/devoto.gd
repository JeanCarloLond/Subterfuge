## El Devoto (#185): fiel de la Diocesis y el primer eslabon del Atrio.
## Patrulla su ronda, persigue al Cirujano si lo tiene cerca y avisa del golpe
## 420 ms antes de darlo, para que se pueda leer.
##
## Se le hiere con el bisturi (#183), y si se le para el golpe con el parry se
## queda aturdido 900 ms: abierto, para castigarlo. Aturdido se le puede
## ejecutar (Blasphemous): un bisturi sobre la cabeza lo avisa.
##
## Esta en la capa 3 y solo choca con el mundo. El dano al Cirujano se mira con
## las cajas, no con la fisica.
extends CharacterBody2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Texturas := preload("res://scripts/texturas.gd")
const Herida := preload("res://scripts/herida.gd")
const Bocadillo := preload("res://scripts/bocadillo.gd")
## Lo que grita al verlo: cumple la ley de la Mano que mira (canon). Mas
## adentro, cuando haya mas niveles, hablaran del Ultimo Sacramento.
const FRASES := [
	"¡La Mano que mira!",
	"Cierra los ojos, Mano.",
	"Sin turno no se baja.",
	"¡Ha mirado!",
	"La Mano que mira, se corta.",
]
## Entre frase y frase: que no repita al perderlo y volver a verlo.
const PAUSA_FRASES_MS := 9000.0
const Cirujano := preload("res://scripts/cirujano.gd")
const D := Sacramento.DEVOTO
const M := Sacramento.MOVIMIENTO

## Al final del aviso, el tinte rojo se va un instante: el golpe es ya.
const DESTELLO_MS := 110.0
const COLOR_AVISO := Color(0.898, 0.541, 0.502)
const COLOR_DESTELLO := Color(1.6, 1.6, 1.6)
## Aturdido: amarillo palido, para ver de un vistazo que esta abierto.
const COLOR_ATURDIDO := Color(0.91, 0.851, 0.627)
## El Devoto de Sigma, en tres cuartos (scripts/devoto-sigma.mjs). Dos
## variantes, como en el original: al de un sitio le pusieron un aparato de
## metal y al del otro un brazo de carne injertada.
const ARTE := "res://arte/devoto/%s-%s-%d.png"
const ARTE_DE := {"devoto": "aparato", "devoto-b": "carne"}
const CUADROS := {"andar": 4, "aviso": 2, "golpe": 2, "aturdido": 1, "ejecutado": 1}
## El brazo se queda abajo un poco despues del golpe: da tiempo a ver con que.
const POSE_GOLPE_MS := 160.0
## Un cuadro de andar cada tantos pixeles: con la distancia, no con el reloj.
const PX_POR_CUADRO := 6.0

## La marca de que se le puede ejecutar: el bisturi, encima de la cabeza.
const MARCA := preload("res://arte/provisional/bisturi.png")
const COLOR_SANGRE := Color(0.62, 0.08, 0.07)

## Lo que dura el destello de un golpe recibido, y lo que tarda en irse al caer.
## El reculon al recibir un golpe: velocidad y lo que dura (unos 9 px).
const RETROCESO := 100.0
const RETROCESO_MS := 90.0
const CAIDA_MS := 400.0

enum Estado { PATRULLA, PERSECUCION, ANTICIPANDO, ATACANDO, ATURDIDO, EJECUTADO, MUERTO }

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
## Cuando le entro el ultimo golpe: de ahi salen el blanco y la sangre.
var _herido_en := -INF
var _proxima_frase := 0.0
var _fin_retroceso := -INF
var _retroceso_x := 0.0
var _fin_pose_golpe := -INF
var _figura_de := "devoto"
var _cayendo := false
var _cuadros := {}
var _recorrido := 0.0
var _marca: Sprite2D

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite


func _ready() -> void:
	Herida.preparar($Figura/Sprite)
	add_to_group("enemigos")
	_figura_de = variante(position)
	for nombre in CUADROS:
		var lista: Array[Texture2D] = []
		for i in CUADROS[nombre]:
			lista.append(Texturas.con_normales(ARTE % [ARTE_DE[_figura_de], nombre, i]))
		_cuadros[nombre] = lista
	_marca = Sprite2D.new()
	_marca.texture = MARCA
	_marca.position = Vector2(0, -44)
	_marca.rotation = PI / 2.0 # de punta, hacia la cabeza
	_marca.visible = false
	add_child(_marca)


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
	if ahora < _fin_retroceso:
		velocity.x = _retroceso_x
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	move_and_slide()
	_herir_si_toca()
	_pintar(delta)


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
		Estado.EJECUTADO:
			velocity.x = 0.0


func vivo() -> bool:
	return estado != Estado.MUERTO


## Un golpe del bisturi. Lo pone en alerta aunque no hubiera visto al Cirujano.
func recibir_dano(cantidad: int, origen_x: float) -> void:
	if estado == Estado.MUERTO:
		return
	vida = maxi(0, vida - cantidad)
	_herido_en = ahora
	var hacia := -1.0 if origen_x > position.x else 1.0
	Herida.salpicar(get_parent(), position + Vector2(0, -16), hacia, 22 if vida == 0 else 8)
	if vida == 0:
		_voz("muerte")
		_morir()
		return
	_voz("herida")
	# Recula un palmo: el golpe se nota tambien en el cuerpo.
	_retroceso_x = hacia * RETROCESO
	_fin_retroceso = ahora + RETROCESO_MS
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


func _voz(voz: String) -> void:
	if not is_inside_tree():
		return
	var voces := get_node_or_null("/root/Voces")
	if voces:
		voces.enemigo("devoto", voz, self)


## Si se le puede ejecutar: solo aturdido, abierto tras un parry.
func ejecutable() -> bool:
	return estado == Estado.ATURDIDO


## El Cirujano empieza a ejecutarlo: se queda de rodillas, mirandolo, hasta
## que baja el bisturi (`rematar`). Ya no golpea ni hiere al rozarlo.
func ejecutar(desde_x: float) -> void:
	if not ejecutable():
		return
	estado = Estado.EJECUTADO
	mirando = 1 if desde_x > position.x else -1
	velocity.x = 0.0


## El tajo de la ejecucion: muere, sea cual sea su vida, y sangra.
func rematar() -> void:
	if estado == Estado.MUERTO:
		return
	vida = 0
	_herido_en = ahora
	_voz("muerte")
	_salpicar()
	_morir()


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
		_al_verlo()
		_ultimo_avistamiento = ahora
		estado = Estado.PERSECUCION
		return
	# Rebote en los extremos de la ronda.
	if position.x <= ronda_izquierda:
		mirando = 1
	if position.x >= ronda_derecha:
		mirando = -1
	velocity.x = mirando * D["velocidad_patrulla"]


func _al_verlo() -> void:
	if ahora < _proxima_frase:
		return
	_proxima_frase = ahora + PAUSA_FRASES_MS
	Bocadillo.decir(self, FRASES.pick_random())


func _perseguir(hacia: Vector2) -> void:
	if _detecta(hacia):
		_ultimo_avistamiento = ahora
	elif ahora - _ultimo_avistamiento > D["memoria_ms"]:
		estado = Estado.PATRULLA
		return

	var distancia := hacia.x - position.x
	var a_su_altura := absf(hacia.y - position.y) <= D["alcance_vertical"]
	mirando = 1 if distancia > 0.0 else -1
	if absf(distancia) <= D["rango_ataque"] and a_su_altura and ahora >= _fin_enfriamiento:
		estado = Estado.ANTICIPANDO
		_voz("ataque")
		_fin_accion = ahora + D["anticipacion_ataque_ms"]
		_ya_golpeo = false
		velocity.x = 0.0
		return
	# Si esta encima, espera debajo mirandolo en vez de dar vueltas bajo el.
	if absf(distancia) <= D["rango_ataque"]:
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
	Herida.charco(get_parent(), position)


## La sangre del tajo: un golpe de gotas que salta hacia donde va el bisturi.
func _salpicar() -> void:
	if not is_inside_tree():
		return
	var gotas := CPUParticles2D.new()
	# Al mundo, no al Devoto: el Devoto se va y la sangre tiene que quedarse.
	gotas.position = position + Vector2(0, -16)
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


## Cae de lado y se va.
func _caer() -> void:
	_cayendo = true
	_sprite.texture = _cuadros["aturdido"][0]
	var caida := create_tween()
	caida.tween_property(_figura, "rotation", -mirando * PI / 2.0, CAIDA_MS / 1000.0)
	caida.parallel().tween_property(_figura, "modulate:a", 0.0, CAIDA_MS / 1000.0)
	caida.tween_callback(queue_free)


func _herir_si_toca() -> void:
	if estado == Estado.EJECUTADO:
		return
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
func _pintar(delta: float) -> void:
	_sprite.texture = _cuadro(delta)
	# La marca late: tiene que verse en mitad de una pelea.
	_marca.visible = estado == Estado.ATURDIDO
	if _marca.visible:
		_marca.scale = Vector2.ONE * (1.0 + 0.15 * sin(ahora / 80.0))
	_figura.scale = Vector2(mirando, 1.0)
	# Aturdido se tambalea: abierto, para castigarlo.
	_figura.rotation = sin(ahora / 50.0) * 0.06 if estado == Estado.ATURDIDO else 0.0

	# El tinte rojo del aviso y su destello final son el tell: se quedan.
	Herida.pintar(_sprite, ahora - _herido_en)
	if estado == Estado.ATURDIDO or estado == Estado.EJECUTADO:
		_figura.modulate = COLOR_ATURDIDO
	elif estado != Estado.ANTICIPANDO:
		_figura.modulate = Color.WHITE
	elif _fin_accion - ahora <= DESTELLO_MS:
		_figura.modulate = COLOR_DESTELLO
	else:
		_figura.modulate = COLOR_AVISO


func _cuadro(delta: float) -> Texture2D:
	match estado:
		Estado.ANTICIPANDO:
			var hecho := 1.0 - (_fin_accion - ahora) / D["anticipacion_ataque_ms"]
			return _cuadros["aviso"][0 if hecho < 0.5 else 1]
		Estado.ATACANDO:
			# El smear, solo al principio del golpe; luego el impacto.
			var hecho := 1.0 - (_fin_accion - ahora) / D["duracion_ataque_ms"]
			return _cuadros["golpe"][0 if hecho < 0.4 else 1]
		Estado.ATURDIDO:
			return _cuadros["aturdido"][0]
		Estado.EJECUTADO:
			return _cuadros["ejecutado"][0]
	if ahora < _fin_pose_golpe:
		return _cuadros["golpe"][1]
	if absf(velocity.x) > 1.0:
		_recorrido += absf(velocity.x) * delta
		return _cuadros["andar"][int(_recorrido / PX_POR_CUADRO) % CUADROS["andar"]]
	return _cuadros["andar"][0]
