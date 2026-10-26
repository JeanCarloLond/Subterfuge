## Un muro que se mueve (#186): piedra viva del templo que avanza, empuja y, si
## late, vuelve. Antes de moverse avisa con el Latido, polvo y un temblor; si
## aplasta al Cirujano contra la piedra, le cuesta vitalidad y lo devuelve al
## Altar.
##
## Es piedra del mundo (capa 1): se pisa y se agarra como cualquier pared. El
## origen es su esquina de arriba a la izquierda, como en una rejilla de tiles.
extends AnimatableBody2D

signal aplasto
## Un cierre ha terminado de cerrarse: ya no hay vuelta.
signal cerrado

const Compactacion := preload("res://scripts/compactacion.gd")
const Sacramento := preload("res://scripts/sacramento.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const SILLERIA := preload("res://arte/silleria/vientre.tres")
const Silleria := preload("res://scripts/silleria.gd")

## La piedra viva tira a carne: se distingue de la quieta.
const TINTE := Color(0.95, 0.76, 0.74)
## Con cada latido del aviso la piedra se enciende de carne y se apaga.
const TINTE_LATIDO := Color(1.35, 0.62, 0.6)
const LATIDO_MS := 140.0
## El segundo latido del aviso.
const SEGUNDO_LATIDO_MS := 750.0
## Antes de volver tambien late, una vez: quien va encima tiene que saber que
## lo va a subir contra el techo.
const AVISO_VUELTA_MS := 700.0
const CADA_CRUJIDO_MS := 420.0

## Su tamano, en tiles de 16 px.
@export var tiles := Vector2i(3, 16)
## Hacia donde avanza: (1, 0), (-1, 0), (0, 1) o (0, -1).
@export var direccion := Vector2.LEFT
## Cuanto avanza, en px.
@export var recorrido := 96.0
## Si late sin fin; si no, es un cierre y espera a que lo disparen.
@export var ciclico := true
@export var desfase_ms := 0.0

## A quien empuja: el Cirujano. Lo pone el nivel.
var objetivo: CharacterBody2D
var ciclo: Compactacion

var _estado_antes := -1
var _segundo_latido := INF
var _proximo_crujido := INF
var _ultimo_latido := -INF
var _vuelta_avisada := false
var _figura: TileMapLayer
var _polvo: CPUParticles2D
var _latido: AudioStreamPlayer2D
var _crujido: AudioStreamPlayer2D
var _consulta: PhysicsShapeQueryParameters2D


func _ready() -> void:
	ciclo = Compactacion.new(recorrido, ciclico, desfase_ms)
	var tamano := Vector2(tiles * 16)

	var forma := RectangleShape2D.new()
	forma.size = tamano
	var caja := CollisionShape2D.new()
	caja.shape = forma
	caja.position = tamano / 2.0
	add_child(caja)

	_figura = TileMapLayer.new()
	_figura.tile_set = SILLERIA
	_figura.collision_enabled = false
	_figura.modulate = TINTE
	for x in tiles.x:
		for y in tiles.y:
			_figura.set_cell(Vector2i(x, y), 0, Vector2i.ZERO)
	Silleria.vestir(_figura)
	add_child(_figura)

	_polvo = _crear_polvo(tamano)
	add_child(_polvo)

	_latido = AudioStreamPlayer2D.new()
	_latido.stream = Sonidos.latido()
	add_child(_latido)
	_crujido = AudioStreamPlayer2D.new()
	_crujido.stream = Sonidos.crujido()
	_crujido.volume_db = -6.0
	add_child(_crujido)


## Para un cierre: empieza a avisar.
func disparar() -> void:
	ciclo.disparar()


## Lo que ocupa, en coordenadas del mundo.
func rect() -> Rect2:
	return Rect2(global_position, Vector2(tiles * 16))


func _physics_process(delta: float) -> void:
	var movido := ciclo.paso(delta)
	position += direccion * movido
	_avisar()
	if movido != 0.0 and objetivo != null:
		_empujar(direccion * signf(movido))


## Empuja al Cirujano hacia donde se mueve el muro, avance o vuelva: al volver
## tambien arrastra a quien va encima, y lo puede aplastar contra el techo.
func _empujar(hacia: Vector2) -> void:
	var empuje := Compactacion.empuje(objetivo.caja(), rect(), hacia)
	if empuje == Vector2.ZERO:
		return
	objetivo.position += empuje
	if _contra_la_piedra():
		objetivo.aplastar()
		aplasto.emit()


## Tras empujarlo, mira si se ha quedado metido en otra piedra, con la caja un
## pixel mas pequena, para que pisar el suelo o rozar una pared no cuente.
func _contra_la_piedra() -> bool:
	# La consulta se hace una vez y se reutiliza: crear la forma en cada paso
	# reservaba un recurso de fisica por fotograma de empuje (#232).
	if _consulta == null:
		var forma := RectangleShape2D.new()
		forma.size = Vector2(8, 20)
		_consulta = PhysicsShapeQueryParameters2D.new()
		_consulta.shape = forma
		_consulta.collision_mask = 1
	_consulta.transform = Transform2D(0.0, objetivo.global_position + Vector2(0, -11))
	_consulta.exclude = [get_rid(), objetivo.get_rid()]
	return not get_world_2d().direct_space_state.intersect_shape(_consulta, 1).is_empty()


## El aviso y lo que acompana al movimiento: dos latidos, polvo que cae de la
## cara que avanza, temblor y crujidos mientras se arrastra.
func _avisar() -> void:
	var estado := ciclo.estado
	if estado != _estado_antes:
		_estado_antes = estado
		if estado == Compactacion.Estado.AVISO:
			_latido.play()
			_ultimo_latido = ciclo.ahora
			_segundo_latido = ciclo.ahora + SEGUNDO_LATIDO_MS
		elif estado == Compactacion.Estado.AVANCE:
			_proximo_crujido = ciclo.ahora
		elif estado == Compactacion.Estado.CERRADO and not ciclico:
			cerrado.emit()

	if estado == Compactacion.Estado.CERRADO and ciclo.ciclico:
		if not _vuelta_avisada and ciclo.ms_restantes() <= AVISO_VUELTA_MS:
			_vuelta_avisada = true
			_latido.play()
			_ultimo_latido = ciclo.ahora
	else:
		_vuelta_avisada = false
	if estado == Compactacion.Estado.AVISO and ciclo.ahora >= _segundo_latido:
		_latido.play()
		_ultimo_latido = ciclo.ahora
		_segundo_latido = INF
	if estado == Compactacion.Estado.AVANCE and ciclo.ahora >= _proximo_crujido:
		_crujido.play()
		_proximo_crujido = ciclo.ahora + CADA_CRUJIDO_MS

	var vivo := estado == Compactacion.Estado.AVISO or estado == Compactacion.Estado.AVANCE
	_polvo.emitting = vivo
	# El temblor es solo de la figura: la caja que choca no se mueve.
	_figura.position = Vector2(randi_range(-1, 1), randi_range(-1, 1)) if vivo else Vector2.ZERO
	var pulso := exp(-(ciclo.ahora - _ultimo_latido) / LATIDO_MS)
	_figura.modulate = TINTE.lerp(TINTE_LATIDO, pulso)


## Polvo que cae de la cara que avanza.
func _crear_polvo(tamano: Vector2) -> CPUParticles2D:
	var polvo := CPUParticles2D.new()
	polvo.emitting = false
	polvo.amount = 18
	polvo.lifetime = 0.7
	polvo.position = tamano / 2.0 + direccion * tamano / 2.0
	polvo.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	polvo.emission_rect_extents = Vector2(absf(direccion.y), absf(direccion.x)) * tamano / 2.0 + Vector2.ONE
	polvo.direction = direccion
	polvo.spread = 50.0
	polvo.initial_velocity_min = 4.0
	polvo.initial_velocity_max = 18.0
	polvo.gravity = Vector2(0, 240)
	polvo.scale_amount_min = 1.0
	polvo.scale_amount_max = 2.0
	polvo.color = Color(0.62, 0.56, 0.5)
	return polvo
