## Los ultimos eslabones (#187): lo que el jugador llama enemigos sostiene el
## templo para que no se una. Cada uno, una pieza: el Devoto, la boveda (su
## hilo sube al techo); la Vestal, los muros (al mas cercano); el Prior, toda
## su nave (al techo y a los dos muros).
##
## Los hilos de carne solo se ven mirando con el ojo (#243): es como se
## ensena, sin decirlo, lo que son. Cuando cae uno, algo se suelta, y eso si
## se ve siempre: el hilo se recoge de golpe, la piedra cruje y cae polvo de
## donde estaba atado. Y dice sus ultimas palabras, que se releen al final.
##
## La sala lo ata a cada enemigo al empezar (atar), leyendo su silleria: no
## hace falta colocarlos a mano.
extends Node2D

const Relieve := preload("res://scripts/relieve.gd")
const Bocadillo := preload("res://scripts/bocadillo.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const Sacramento := preload("res://scripts/sacramento.gd")

const TILE := 16
## Hasta donde se busca a que esta atado, en baldosas. El Prior, que sostiene
## su nave entera, llega a sus muros aunque la nave sea ancha.
const ALCANCE := 24
const ALCANCE_PRIOR := 64
## De donde sale el hilo: el pecho, no los pies.
const PECHO := Vector2(0, -28)
const COLOR_HILO := Color(0.7, 0.17, 0.15)
const COLOR_POLVO := Color(0.5, 0.45, 0.42, 0.9)
## Lo que tarda el hilo en recogerse al soltarse.
const RECOGER_S := 0.25
## Lo que dicen al caer: que soltaban algo. Se releen tras la revelacion.
const ULTIMAS := {
	"devoto": ["Se suelta…", "Aguantaba la bóveda…", "Ya no la sostengo."],
	"vestal": ["El muro… se va.", "Ya baja todo.", "Lo dejo caer, Mano."],
	"prior": ["La nave… se suelta."],
}

## El enemigo que sostiene, que tipo es y a donde esta atado (en el mundo).
var eslabon: Node2D
var tipo := "devoto"
var anclas: Array[Vector2] = []

var _hilos: Array[Line2D] = []
var _desde := Vector2.ZERO
var _alfa := 0.0
var _recogido := 0.0
var _suelto := false


## Ata a `enemigo` a la silleria de `sala`. Si no encuentra a que, nada.
static func atar(sala: Node2D, enemigo: Node2D) -> void:
	var capas := Relieve.capas(sala)
	if capas.is_empty():
		return
	var de := tipo_de(enemigo)
	var halladas := buscar_anclas(capas, enemigo.global_position, de)
	if halladas.is_empty():
		return
	var nudo: Node2D = load("res://scripts/eslabon.gd").new()
	nudo.eslabon = enemigo
	nudo.tipo = de
	nudo.anclas = halladas
	sala.add_child(nudo)


static func tipo_de(enemigo: Node) -> String:
	var ruta: String = enemigo.get_script().resource_path if enemigo.get_script() else ""
	if ruta.ends_with("vestal.gd"):
		return "vestal"
	if ruta.ends_with("prior.gd"):
		return "prior"
	return "devoto"


## A donde esta atado quien tiene los pies en `pies`, segun lo que sostiene.
static func buscar_anclas(capas: Array[TileMapLayer], pies: Vector2, de: String) -> Array[Vector2]:
	var pecho := pies + PECHO
	var halladas: Array[Vector2] = []
	var arriba = _arriba(capas, pecho)
	var izquierda = _lado(capas, pecho, -1)
	var derecha = _lado(capas, pecho, 1)
	match de:
		"devoto":
			if arriba != null:
				halladas.append(arriba)
		"vestal":
			var lados := [izquierda, derecha].filter(func(a) -> bool: return a != null)
			if not lados.is_empty():
				lados.sort_custom(func(a, b) -> bool: return a.distance_to(pecho) < b.distance_to(pecho))
				halladas.append(lados[0])
		"prior":
			for a in [_arriba(capas, pecho, ALCANCE_PRIOR), _lado(capas, pecho, -1, ALCANCE_PRIOR), _lado(capas, pecho, 1, ALCANCE_PRIOR)]:
				if a != null:
					halladas.append(a)
	# Sin su sitio (una nave muy alta, un pasillo muy ancho), a lo mas cercano
	# que haya: todos sostienen algo.
	if halladas.is_empty():
		var cerca := [arriba, izquierda, derecha].filter(func(a) -> bool: return a != null)
		if not cerca.is_empty():
			cerca.sort_custom(func(a, b) -> bool: return a.distance_to(pecho) < b.distance_to(pecho))
			halladas.append(cerca[0])
	# Ni eso en linea recta (la Nave, abierta): la piedra mas cercana por
	# encima del pecho, una repisa o un pilar; y si no, la de debajo.
	if halladas.is_empty():
		var piedra = _cercana(capas, pecho, true)
		if piedra == null:
			piedra = _cercana(capas, pecho, false)
		if piedra != null:
			halladas.append(piedra)
	return halladas


## La baldosa mas cercana a `desde` (solo por encima, con `arriba`), en el
## punto de su borde mas cercano.
static func _cercana(capas: Array[TileMapLayer], desde: Vector2, arriba: bool) -> Variant:
	var celda := capas[0].local_to_map(desde)
	var mejor = null
	for dy in range(-ALCANCE, ALCANCE + 1):
		for dx in range(-ALCANCE, ALCANCE + 1):
			var c := celda + Vector2i(dx, dy)
			if (arriba and dy > 0) or not _solido(capas, c):
				continue
			var caja := Rect2(Vector2(c) * TILE, Vector2.ONE * TILE)
			var punto := Vector2(clampf(desde.x, caja.position.x, caja.end.x), clampf(desde.y, caja.position.y, caja.end.y))
			if mejor == null or punto.distance_to(desde) < mejor.distance_to(desde):
				mejor = punto
	if mejor != null and mejor.distance_to(desde) > ALCANCE * TILE:
		return null
	return mejor


static func _solido(capas: Array[TileMapLayer], celda: Vector2i) -> bool:
	for capa in capas:
		if capa.get_cell_source_id(celda) != -1:
			return true
	return false


## El techo sobre `desde`: el borde de abajo de la primera baldosa.
static func _arriba(capas: Array[TileMapLayer], desde: Vector2, alcance := ALCANCE) -> Variant:
	var celda := capas[0].local_to_map(desde)
	for k in range(1, alcance):
		var c := celda + Vector2i(0, -k)
		if _solido(capas, c):
			return Vector2(desde.x, (c.y + 1) * TILE)
	return null


## El muro a un lado de `desde`: la cara de la primera baldosa.
static func _lado(capas: Array[TileMapLayer], desde: Vector2, hacia: int, alcance := ALCANCE) -> Variant:
	var celda := capas[0].local_to_map(desde)
	for k in range(1, alcance):
		var c := celda + Vector2i(hacia * k, 0)
		if _solido(capas, c):
			return Vector2((c.x + (1 if hacia < 0 else 0)) * TILE, desde.y)
	return null


func _ready() -> void:
	z_index = -1
	for ancla in anclas:
		var hilo := Line2D.new()
		hilo.width = 2.0
		hilo.default_color = COLOR_HILO
		hilo.modulate.a = 0.0
		add_child(hilo)
		_hilos.append(hilo)
	add_to_group("a_la_vista")


func _process(delta: float) -> void:
	if not _suelto:
		if not is_instance_valid(eslabon) or not eslabon.vivo():
			_soltar()
		else:
			_desde = eslabon.global_position + PECHO
	var cirujano := get_tree().get_first_node_in_group("cirujano")
	var mira: bool = cirujano != null and cirujano.mirando
	_alfa = move_toward(_alfa, 1.0 if mira else 0.0, delta / Sacramento.MIRADA["fundido_s"])
	var t := Time.get_ticks_msec() / 1000.0
	for i in _hilos.size():
		var hilo := _hilos[i]
		hilo.modulate.a = _alfa
		# Al soltarse, el cabo del eslabon sube hasta donde estaba atado.
		var cabo := _desde.lerp(anclas[i], _recogido)
		hilo.points = _curva(cabo, anclas[i], t + i * 1.7)
	if _suelto and _recogido >= 1.0:
		queue_free()


## Un hilo de carne de `a` a `b` que cuelga un poco y respira.
func _curva(a: Vector2, b: Vector2, t: float) -> PackedVector2Array:
	var puntos := PackedVector2Array()
	var normal := (b - a).orthogonal().normalized()
	if normal.y < 0.0:
		normal = -normal
	var comba := 5.0 + 2.0 * sin(t * 1.6)
	for k in 9:
		var s := k / 8.0
		puntos.append(a.lerp(b, s) + normal * comba * sin(PI * s) * (1.0 - _recogido))
	return puntos


## Cae: el hilo se recoge, la piedra cruje y cae polvo de donde estaba atado.
func _soltar() -> void:
	_suelto = true
	var recoger := create_tween()
	recoger.tween_property(self, "_recogido", 1.0, RECOGER_S).set_ease(Tween.EASE_IN)
	for ancla in anclas:
		_polvo(ancla)
	var crujido := AudioStreamPlayer2D.new()
	crujido.stream = Sonidos.crujido()
	crujido.volume_db = -6.0
	crujido.position = anclas[0]
	# En la sala: el nudo se va antes de que acabe de crujir.
	get_parent().add_child(crujido)
	crujido.play()
	get_tree().create_timer(1.0).timeout.connect(crujido.queue_free)
	# Sus ultimas palabras, donde cayo: el cuerpo se va, la frase se queda.
	var donde := Node2D.new()
	donde.position = _desde - PECHO
	get_parent().add_child(donde)
	Bocadillo.decir(donde, ULTIMAS[tipo].pick_random())
	get_tree().create_timer(3.0).timeout.connect(donde.queue_free)


func _polvo(sitio: Vector2) -> void:
	var polvo := CPUParticles2D.new()
	polvo.position = sitio
	polvo.one_shot = true
	polvo.explosiveness = 0.8
	polvo.amount = 14
	polvo.lifetime = 0.9
	polvo.direction = Vector2(0, 1)
	polvo.spread = 35.0
	polvo.initial_velocity_min = 10.0
	polvo.initial_velocity_max = 40.0
	polvo.gravity = Vector2(0, 260)
	polvo.color = COLOR_POLVO
	get_parent().add_child(polvo)
	polvo.emitting = true
	get_tree().create_timer(1.5).timeout.connect(polvo.queue_free)
