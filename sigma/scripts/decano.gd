## El Decano de las Manos (#256): el guardian de la Sala N.º 7, el que formo al
## Cirujano. Otra Mano con su mascara ciega: una pelea de espejo (docs/nivel3.md).
##
## - Para el golpe de frente, y responde con un contragolpe rapido. Si se le para
##   ese, se tambalea: parry contra parry, como el Cirujano le ha visto hacer.
## - De cerca, el tajo, que se ve venir. A media distancia, una estocada que solo
##   avisa con un hilo rojo, y el hilo solo se ve mirando. Sin mirar, se oye.
## - Es ciego y oye: si el Cirujano mira un rato, lo encuentra. Acude corriendo y
##   golpea con menos aviso. Mirar sirve, y cuesta.
## - Por debajo de la mitad encadena dos tajos.
## Vencido no muere: se arrodilla, y se le remata con la E.
##
## Como los demas enemigos: capa 3, solo choca con el mundo, y la cabeza (pensar)
## va aparte de la fisica para probarla sin ella.
extends CharacterBody2D

## Empieza la pelea: la sala pone su barra.
signal despierta
signal vida_cambio(actual: int, maxima: int)
## Rematado: la sala abre el camino.
signal cae

const Sacramento := preload("res://scripts/sacramento.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const Herida := preload("res://scripts/herida.gd")
const Gesto := preload("res://scripts/gesto.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const Bocadillo := preload("res://scripts/bocadillo.gd")
const D := Sacramento.DECANO
const M := Sacramento.MOVIMIENTO
const ARTE := "res://arte/decano/%s.png"
const POSES := ["reposo", "andar", "alza", "tajo", "estocada", "guardia", "aturdido", "arrodillado"]
const MARCA := preload("res://arte/provisional/bisturi.png")
const COLOR_ATURDIDO := Color(0.91, 0.851, 0.627)
const COLOR_HILO := Color(0.86, 0.14, 0.1)
## Lo que dice: corrige. Le enseno el oficio y sigue en ello.
const FRASES := {
	"despierta": "Te oigo.",
	"mirar": "Te he oído mirar.",
	"fase_dos": "Ya no te corrijo.",
	"vencido": "Ahora ciérralo tú.",
}
const CORRECCIONES := ["La muñeca.", "Otra vez.", "Esa mano, más baja."]
## Al menos este rato entre frase y frase.
const PAUSA_FRASES_MS := 2600.0

enum Estado { DORMIDO, ANDAR, ACUDE, TAJO, ESTOCADA, CONTRA, RECUPERA, ATURDIDO, VENCIDO, EJECUTADO, MUERTO }

## A quien pelea: el Cirujano. Lo pone la sala.
var objetivo: CharacterBody2D

var estado := Estado.DORMIDO
var mirando := -1
var ahora := 0.0
var vida: int = D["vida"]
var en_fase_dos := false

var _fin_accion := -INF
var _fin_enfriamiento := -INF
var _herido_en := -INF
var _proxima_frase := 0.0
## Lo que lleva oyendolo mirar.
var _oyendo_ms := 0.0
## En la fase dos, el segundo tajo del par.
var _segundo_tajo := false
var _texturas := {}
var _marca: Sprite2D
var _tic: AudioStreamPlayer2D
var _chapa: AudioStreamPlayer2D

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite


func _ready() -> void:
	Herida.preparar(_sprite)
	add_to_group("enemigos")
	for pose in POSES:
		_texturas[pose] = load(ARTE % pose)
	_marca = Sprite2D.new()
	_marca.texture = MARCA
	_marca.position = Vector2(0, -56)
	_marca.rotation = PI / 2.0
	_marca.visible = false
	add_child(_marca)
	_tic = AudioStreamPlayer2D.new()
	_tic.stream = Sonidos.traqueteo()
	_tic.volume_db = -4.0
	add_child(_tic)
	_chapa = AudioStreamPlayer2D.new()
	_chapa.stream = Sonidos.chapa()
	_chapa.volume_db = -6.0
	add_child(_chapa)


func _physics_process(delta: float) -> void:
	if objetivo == null or estado == Estado.MUERTO:
		return
	pensar(delta, objetivo.position)
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	move_and_slide()
	_pintar()


## Empieza la pelea: la sala lo llama cuando acaban de hablar.
func despertar() -> void:
	if estado != Estado.DORMIDO:
		return
	estado = Estado.ANDAR
	_fin_enfriamiento = ahora + 700.0
	_decir(FRASES["despierta"])
	despierta.emit()


## Si el Cirujano esta mirando: lo oye.
func lo_oye_mirar() -> bool:
	return objetivo != null and objetivo.mirando


## Decide que hacer este paso. Va aparte de la fisica para probarlo sin ella.
func pensar(delta: float, hacia: Vector2) -> void:
	ahora += delta * 1000.0
	match estado:
		Estado.DORMIDO, Estado.VENCIDO, Estado.EJECUTADO:
			velocity.x = 0.0
		Estado.ATURDIDO, Estado.RECUPERA:
			velocity.x = move_toward(velocity.x, 0.0, 600.0 * delta)
			if ahora >= _fin_accion:
				estado = Estado.ANDAR
		Estado.TAJO, Estado.CONTRA:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_golpear(D["tajo"])
		Estado.ESTOCADA:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_golpear(D["estocada"])
		Estado.ACUDE:
			_acudir(hacia)
		Estado.ANDAR:
			_andar(delta, hacia)


func _andar(delta: float, hacia: Vector2) -> void:
	var dx := hacia.x - position.x
	mirando = 1 if dx > 0.0 else -1
	var distancia := absf(dx)
	if lo_oye_mirar():
		_oyendo_ms += delta * 1000.0
		if _oyendo_ms >= D["acude_tras_ms"]:
			_oyendo_ms = 0.0
			_decir(FRASES["mirar"])
			estado = Estado.ACUDE
			_fin_accion = ahora + D["acude_max_ms"]
			return
	else:
		_oyendo_ms = 0.0
	if ahora >= _fin_enfriamiento:
		if distancia <= D["tajo"]["alcance"]:
			_empezar(Estado.TAJO, D["tajo"]["anticipacion_ms"])
			return
		if distancia <= D["estocada"]["alcance"]:
			_empezar(Estado.ESTOCADA, D["estocada"]["anticipacion_ms"])
			return
	velocity.x = mirando * D["velocidad"]


## Lo ha oido mirar: va hacia el, y al llegar golpea con menos aviso.
func _acudir(hacia: Vector2) -> void:
	var dx := hacia.x - position.x
	mirando = 1 if dx > 0.0 else -1
	velocity.x = mirando * D["velocidad_acude"]
	if absf(dx) <= D["tajo"]["alcance"] * 0.8 or ahora >= _fin_accion:
		_empezar(Estado.TAJO, D["tajo"]["anticipacion_ms"] * D["aviso_al_acudir"])


func _empezar(nuevo: Estado, anticipacion_ms: float) -> void:
	estado = nuevo
	_fin_accion = ahora + anticipacion_ms
	velocity.x = 0.0
	_voz("ataque")
	if nuevo == Estado.ESTOCADA and is_node_ready() and is_inside_tree():
		_tic.play()


## El golpe de ahora, por delante. Si lo paran, se tambalea.
func _golpear(golpe: Dictionary) -> void:
	var alcance: float = golpe["alcance"]
	var zona := Rect2(position.x + (0.0 if mirando > 0 else -alcance), position.y - 30.0, alcance, 30.0)
	var fue_tajo := estado == Estado.TAJO
	_terminar_ataque()
	if objetivo != null and objetivo.is_inside_tree() and zona.intersects(objetivo.caja()):
		var resultado: Cirujano.Resultado = objetivo.recibir_golpe(position.x, golpe["dano"])
		if resultado == Cirujano.Resultado.PARADO:
			aturdir()
			_segundo_tajo = false
			return
	# En la fase dos, el tajo viene de dos en dos.
	if fue_tajo and en_fase_dos and not _segundo_tajo:
		_segundo_tajo = true
		_empezar(Estado.TAJO, D["tajo"]["anticipacion_segundo_ms"])
		return
	_segundo_tajo = false


func _terminar_ataque() -> void:
	estado = Estado.RECUPERA
	_fin_accion = ahora + D["recuperacion_ms"]
	var espera: float = D["enfriamiento_fase_dos_ms"] if en_fase_dos else D["enfriamiento_ms"]
	_fin_enfriamiento = ahora + D["recuperacion_ms"] + espera


## Si para un golpe que viene de `origen_x`: de frente, sin estar atacando.
func cubre(origen_x: float) -> bool:
	if estado not in [Estado.ANDAR, Estado.ACUDE]:
		return false
	return (origen_x > position.x) == (mirando > 0)


## Ha parado un golpe: suena, corrige y responde enseguida.
func topar(origen_x: float) -> void:
	mirando = 1 if origen_x > position.x else -1
	_decir(CORRECCIONES[hash(int(ahora)) % CORRECCIONES.size()])
	if is_node_ready() and is_inside_tree():
		_chapa.play()
	_empezar(Estado.CONTRA, D["contra_ms"])


func vivo() -> bool:
	return estado != Estado.MUERTO


func caja() -> Rect2:
	return Rect2(position.x - 7.0, position.y - 26.0, 14.0, 26.0)


func recibir_dano(cantidad: int, origen_x: float) -> void:
	if estado in [Estado.DORMIDO, Estado.VENCIDO, Estado.EJECUTADO, Estado.MUERTO]:
		return
	# Los injertos llegan por aqui: tambien los para.
	if cubre(origen_x):
		topar(origen_x)
		return
	vida = maxi(0, vida - cantidad)
	_herido_en = ahora
	vida_cambio.emit(vida, D["vida"])
	if is_inside_tree():
		Herida.salpicar(get_parent(), position + Vector2(0, -20), -1.0 if origen_x > position.x else 1.0, 8)
	if vida == 0:
		_vencer()
		return
	_voz("herida")
	mirando = 1 if origen_x > position.x else -1
	if not en_fase_dos and vida <= D["vida"] * D["fase_dos"]:
		en_fase_dos = true
		_decir(FRASES["fase_dos"])


## Su golpe parado: se tambalea, abierto.
func aturdir() -> void:
	if estado in [Estado.DORMIDO, Estado.VENCIDO, Estado.EJECUTADO, Estado.MUERTO]:
		return
	estado = Estado.ATURDIDO
	_fin_accion = ahora + D["aturdimiento_ms"]
	velocity.x = 0.0


func _vencer() -> void:
	estado = Estado.VENCIDO
	velocity.x = 0.0
	_voz("herida")
	_decir(FRASES["vencido"], true)


func ejecutable() -> bool:
	return estado == Estado.VENCIDO


func ejecutar(desde_x: float) -> void:
	if not ejecutable():
		return
	estado = Estado.EJECUTADO
	mirando = 1 if desde_x > position.x else -1


## La ejecucion se corto antes del tajo: vuelve a estar de rodillas.
func soltar() -> void:
	if estado == Estado.EJECUTADO:
		estado = Estado.VENCIDO


func rematar() -> void:
	if estado == Estado.MUERTO:
		return
	estado = Estado.MUERTO
	cae.emit()
	# Lo que se ve, solo con el nodo listo (en los tests no lo esta).
	if not is_node_ready():
		return
	_voz("muerte")
	Herida.salpicar(get_parent(), position + Vector2(0, -20), -mirando, 30)
	Herida.charco(get_parent(), position)
	$Caja.set_deferred("disabled", true)
	_marca.visible = false
	queue_redraw()
	var caida := create_tween()
	caida.tween_property(_figura, "rotation", -mirando * PI / 2.0, 0.7)
	caida.parallel().tween_property(_figura, "modulate:a", 0.0, 1.4)
	caida.tween_callback(queue_free)


func _decir(frase: String, siempre := false) -> void:
	if not is_inside_tree() or (ahora < _proxima_frase and not siempre):
		return
	_proxima_frase = ahora + PAUSA_FRASES_MS
	Bocadillo.decir(self, frase)


func _voz(voz: String) -> void:
	if not is_inside_tree():
		return
	var voces := get_node_or_null("/root/Voces")
	if voces:
		voces.enemigo("prior", voz, self)


func _pintar() -> void:
	_sprite.texture = _texturas[_pose()]
	_figura.scale = Vector2(mirando, 1.0) * Gesto.escala(Gesto.Tipo.GOLPEADO, ahora - _herido_en)
	_marca.visible = ejecutable()
	if _marca.visible:
		_marca.scale = Vector2.ONE * (1.0 + 0.15 * sin(ahora / 80.0))
	Herida.pintar(_sprite, ahora - _herido_en)
	_figura.modulate = COLOR_ATURDIDO if estado == Estado.ATURDIDO else Color.WHITE
	queue_redraw()


## El hilo de la estocada: solo lo ve el ojo.
func _draw() -> void:
	if estado != Estado.ESTOCADA or not lo_oye_mirar():
		return
	var alcance: float = D["estocada"]["alcance"]
	var hecho := 1.0 - clampf((_fin_accion - ahora) / D["estocada"]["anticipacion_ms"], 0.0, 1.0)
	draw_line(Vector2(0, -16), Vector2(mirando * alcance, -16), Color(COLOR_HILO, 0.35 + 0.65 * hecho), 1.0)


func _pose() -> String:
	match estado:
		Estado.TAJO, Estado.CONTRA:
			return "alza"
		Estado.ESTOCADA:
			return "guardia"
		Estado.RECUPERA:
			return "tajo" if ahora < _fin_accion - D["recuperacion_ms"] * 0.5 else "estocada"
		Estado.ATURDIDO:
			return "aturdido"
		Estado.VENCIDO, Estado.EJECUTADO:
			return "arrodillado"
		Estado.ACUDE:
			return "andar"
	return "andar" if absf(velocity.x) > 1.0 and int(ahora / 180.0) % 2 == 0 else "reposo"
