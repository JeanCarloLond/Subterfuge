## El Prior del Diezmo (#219): el primer guardian, el clerigo que injerta el
## metal del diezmo en los fieles (scripts/prior-sigma.mjs para su figura).
## Un eslabon: sostiene la Nave del Libro, y al caer el Atrio y la Nave se
## funden.
##
## Pelea con lo que el Cirujano conoce y le ensena lo que va a tener:
## - De lejos, injertos en arco (la Injertadora que se quedara el Cirujano) o
##   un sello del diezmo, que se devuelve con el parry como el de la Vestal.
## - De cerca, el baculo, con un aviso largo: parado, se tambalea y llega el
##   contragolpe.
## - Por debajo de la mitad (fase dos), la nave se compacta y aparece el
##   diezmo: alza el baculo con las dos manos y golpea el suelo; la onda se
##   salta. La nina avisa de el una vez.
## Vencido no muere: se arrodilla, y se le remata con la E.
##
## Como los demas enemigos: capa 3, solo choca con el mundo, y la cabeza
## (pensar) va aparte de la fisica para probarla sin ella.
extends CharacterBody2D

## Empieza la pelea: la sala cierra la puerta y pone su barra.
signal despierta
## Cruza la mitad de su vida: la nave se compacta (y la nina avisa).
signal fase_dos
signal vida_cambio(actual: int, maxima: int)
## Rematado: la sala abre el camino y deja la Injertadora.
signal cae
## El diezmo golpea el suelo: la sala hace temblar la nave.
signal golpea_suelo

const Sacramento := preload("res://scripts/sacramento.gd")
const Cirujano := preload("res://scripts/cirujano.gd")
const Herida := preload("res://scripts/herida.gd")
const Sello := preload("res://scripts/sello.gd")
const Injerto := preload("res://scripts/injerto.gd")
const Onda := preload("res://scripts/onda.gd")
const Bocadillo := preload("res://scripts/bocadillo.gd")
const P := Sacramento.PRIOR
const M := Sacramento.MOVIMIENTO
const ARTE := "res://arte/prior/%s.png"
const POSES := ["reposo", "alza", "golpe", "lanza", "diezmo", "aturdido", "arrodillado"]
const MARCA := preload("res://arte/provisional/bisturi.png")
const COLOR_ATURDIDO := Color(0.91, 0.851, 0.627)
## Lo que dice: la ley, la de la Mano que mira (canon).
const FRASES := {
	"despierta": "La Mano que mira no pasa de aquí.",
	"fase_dos": "El diezmo se cobra entero.",
	"vencido": "Tú no sabes lo que abres.",
}
## Lo que dura la pose del golpe despues de dar.
const RECUPERACION_MS := 380.0

enum Estado { DORMIDO, ANDAR, BACULO, INJERTOS, SELLO, DIEZMO, RECUPERA, ATURDIDO, VENCIDO, EJECUTADO, MUERTO }

## A quien pelea: el Cirujano. Lo pone la sala.
var objetivo: CharacterBody2D
## Hasta donde llegan las ondas del diezmo (x del mundo): las paredes.
var limite_izquierdo := 0.0
var limite_derecho := 10000.0

var estado := Estado.DORMIDO
var mirando := -1
var ahora := 0.0
var vida: int = P["vida"]
var en_fase_dos := false

var _fin_accion := -INF
var _fin_enfriamiento := -INF
var _herido_en := -INF
## Cuantos ataques lleva: el diezmo sale uno de cada tres en la fase dos, y
## de lejos se alternan injertos y sello.
var _ataques := 0
var _golpe_dado := false
var _texturas := {}
var _marca: Sprite2D

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite


func _ready() -> void:
	Herida.preparar(_sprite)
	add_to_group("enemigos")
	for pose in POSES:
		_texturas[pose] = load(ARTE % pose)
	_marca = Sprite2D.new()
	_marca.texture = MARCA
	_marca.position = Vector2(0, -60)
	_marca.rotation = PI / 2.0
	_marca.visible = false
	add_child(_marca)


func _physics_process(delta: float) -> void:
	if objetivo == null or estado == Estado.MUERTO:
		return
	pensar(delta, objetivo.position)
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	move_and_slide()
	_rozar()
	_pintar()


## Empieza la pelea (la sala lo llama al entrar el Cirujano en la nave).
func despertar() -> void:
	if estado != Estado.DORMIDO:
		return
	estado = Estado.ANDAR
	_fin_enfriamiento = ahora + 800.0
	Bocadillo.decir(self, FRASES["despierta"])
	despierta.emit()


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
		Estado.BACULO:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_baculazo()
		Estado.INJERTOS:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_lanzar_injertos(hacia)
		Estado.SELLO:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_lanzar_sello()
		Estado.DIEZMO:
			velocity.x = 0.0
			if ahora >= _fin_accion:
				_diezmo()
		Estado.ANDAR:
			_andar(hacia)


## Elige el siguiente ataque, o se coloca a su distancia.
func _andar(hacia: Vector2) -> void:
	mirando = 1 if hacia.x >= position.x else -1
	var distancia := absf(hacia.x - position.x)
	if ahora >= _fin_enfriamiento:
		_ataques += 1
		if en_fase_dos and _ataques % 3 == 0:
			_empezar(Estado.DIEZMO, P["diezmo"]["anticipacion_ms"])
		elif distancia <= P["rango_baculo"]:
			_empezar(Estado.BACULO, P["baculo"]["anticipacion_ms"])
		elif _ataques % 2 == 0:
			_empezar(Estado.SELLO, P["sello"]["anticipacion_ms"])
		else:
			_empezar(Estado.INJERTOS, P["injertos"]["anticipacion_ms"])
		return
	# Entre ataque y ataque, a su distancia: ni pegado ni lejos.
	if distancia > P["distancia_preferida"] + 20.0:
		velocity.x = mirando * P["velocidad"]
	elif distancia < P["distancia_preferida"] - 40.0 and distancia > P["rango_baculo"]:
		velocity.x = -mirando * P["velocidad"]
	else:
		velocity.x = 0.0


func _empezar(nuevo: Estado, anticipacion_ms: float) -> void:
	estado = nuevo
	_fin_accion = ahora + anticipacion_ms
	_golpe_dado = false
	velocity.x = 0.0
	_voz("ataque")


func _terminar_ataque() -> void:
	estado = Estado.RECUPERA
	_fin_accion = ahora + RECUPERACION_MS
	var espera: float = P["enfriamiento_fase_dos_ms"] if en_fase_dos else P["enfriamiento_ms"]
	_fin_enfriamiento = ahora + RECUPERACION_MS + espera


## El baculo por delante. Se para con el parry: entonces se tambalea.
func _baculazo() -> void:
	var B: Dictionary = P["baculo"]
	var zona := Rect2(position.x + (0.0 if mirando > 0 else -B["alcance"]), position.y - 40.0, B["alcance"], 40.0)
	_terminar_ataque()
	if objetivo == null or not zona.intersects(objetivo.caja()):
		return
	var resultado: Cirujano.Resultado = objetivo.recibir_golpe(position.x, B["dano"])
	if resultado == Cirujano.Resultado.PARADO:
		aturdir()


## Tres injertos en arco hacia el Cirujano, cada uno un poco mas largo.
func _lanzar_injertos(hacia: Vector2) -> void:
	var I: Dictionary = P["injertos"]
	for i in I["cuantos"]:
		var injerto := Injerto.new()
		injerto.del_cirujano = false
		injerto.objetivo = objetivo
		injerto.dano = I["dano"]
		injerto.gravedad = I["gravedad"]
		injerto.vida_ms = 2600.0
		injerto.position = position + Vector2(mirando * 16.0, -44.0)
		var alcance: float = clampf(absf(hacia.x - position.x), 60.0, 360.0) * (0.75 + 0.25 * i)
		# Un arco que cae a `alcance`: sube a 1/3 de la velocidad horizontal.
		var t: float = alcance / I["velocidad"]
		injerto.velocidad = Vector2(mirando * I["velocidad"], -0.5 * I["gravedad"] * t)
		_soltar(injerto)
	_terminar_ataque()


func _lanzar_sello() -> void:
	var sello := Sello.new()
	sello.position = position + Vector2(mirando * 18.0, -14.0)
	sello.direccion = mirando
	sello.dueno = self
	sello.objetivo = objetivo
	_soltar(sello)
	_terminar_ataque()


## El diezmo: golpea el suelo y salen dos ondas, una a cada lado.
func _diezmo() -> void:
	for lado in [-1, 1]:
		var onda := Onda.new()
		onda.position = position + Vector2(lado * 20.0, 0.0)
		onda.direccion = lado
		onda.objetivo = objetivo
		onda.hasta = limite_derecho if lado > 0 else limite_izquierdo
		_soltar(onda)
	golpea_suelo.emit()
	_terminar_ataque()


func _soltar(cosa: Node2D) -> void:
	if is_inside_tree():
		get_parent().add_child(cosa)


## Rozarlo hiere, como a cualquier eslabon.
func _rozar() -> void:
	if objetivo == null or not vivo() or estado == Estado.VENCIDO or estado == Estado.EJECUTADO:
		return
	if caja().intersects(objetivo.caja()):
		objetivo.recibir_contacto(position.x, P["contacto"])


func vivo() -> bool:
	return estado != Estado.MUERTO


func caja() -> Rect2:
	return Rect2(position.x - 12.0, position.y - 60.0, 24.0, 60.0)


func recibir_dano(cantidad: int, origen_x: float) -> void:
	if estado in [Estado.DORMIDO, Estado.VENCIDO, Estado.EJECUTADO, Estado.MUERTO]:
		return
	vida = maxi(0, vida - cantidad)
	_herido_en = ahora
	vida_cambio.emit(vida, P["vida"])
	var hacia := -1.0 if origen_x > position.x else 1.0
	Herida.salpicar(get_parent(), position + Vector2(0, -36), hacia, 8)
	if vida == 0:
		_vencer()
		return
	_voz("herida")
	if not en_fase_dos and vida <= P["vida"] * P["fase_dos"]:
		en_fase_dos = true
		Bocadillo.decir(self, FRASES["fase_dos"])
		fase_dos.emit()


## Su baculo parado, o su sello devuelto: se tambalea.
func aturdir() -> void:
	if estado in [Estado.DORMIDO, Estado.VENCIDO, Estado.EJECUTADO, Estado.MUERTO]:
		return
	estado = Estado.ATURDIDO
	_fin_accion = ahora + P["aturdimiento_ms"]
	velocity.x = 0.0


func _vencer() -> void:
	estado = Estado.VENCIDO
	velocity.x = 0.0
	_voz("herida")
	Bocadillo.decir(self, FRASES["vencido"])


func ejecutable() -> bool:
	return estado == Estado.VENCIDO


func ejecutar(desde_x: float) -> void:
	if not ejecutable():
		return
	estado = Estado.EJECUTADO
	mirando = 1 if desde_x > position.x else -1


func rematar() -> void:
	if estado == Estado.MUERTO:
		return
	estado = Estado.MUERTO
	cae.emit()
	# Lo que se ve, solo con el nodo listo (en los tests no lo esta).
	if not is_node_ready():
		return
	_voz("muerte")
	Herida.salpicar(get_parent(), position + Vector2(0, -30), -mirando, 30)
	Herida.charco(get_parent(), position)
	$Caja.set_deferred("disabled", true)
	_marca.visible = false
	var caida := create_tween()
	caida.tween_property(_figura, "rotation", -mirando * PI / 2.0, 0.7)
	caida.parallel().tween_property(_figura, "modulate:a", 0.0, 1.4)
	caida.tween_callback(queue_free)


func _voz(voz: String) -> void:
	if not is_inside_tree():
		return
	var voces := get_node_or_null("/root/Voces")
	if voces:
		voces.enemigo("prior", voz, self)


func _pintar() -> void:
	_sprite.texture = _texturas[_pose()]
	_figura.scale = Vector2(mirando, 1.0)
	_marca.visible = ejecutable()
	if _marca.visible:
		_marca.scale = Vector2.ONE * (1.0 + 0.15 * sin(ahora / 80.0))
	Herida.pintar(_sprite, ahora - _herido_en)
	_figura.modulate = COLOR_ATURDIDO if estado == Estado.ATURDIDO else Color.WHITE
	# El aviso del diezmo: tiembla con el baculo en alto.
	_figura.position.x = sin(ahora / 25.0) * 1.5 if estado == Estado.DIEZMO else 0.0


func _pose() -> String:
	match estado:
		Estado.BACULO:
			return "alza"
		Estado.INJERTOS, Estado.SELLO:
			return "lanza"
		Estado.DIEZMO:
			return "diezmo"
		Estado.RECUPERA:
			return "golpe"
		Estado.ATURDIDO:
			return "aturdido"
		Estado.VENCIDO, Estado.EJECUTADO:
			return "arrodillado"
	return "reposo"
