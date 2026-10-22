## Los temblores: de vez en cuando el templo se encoge un poco, lejos (el canon
## de Sigma: los dioses se compactan). La camara tiembla, cae polvo y alguna
## piedra del techo y se oye un retumbo grave. No hace dano: es el aviso de
## fondo de que todo se esta moviendo, mientras el jugador aun no sabe por que.
extends Node2D

signal temblo

const Sacramento := preload("res://scripts/sacramento.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const T := Sacramento.TEMBLOR
const COLOR_POLVO := Color(0.7, 0.62, 0.52, 0.85)
const COLOR_PIEDRA := Color(0.32, 0.25, 0.24)

var _azar := RandomNumberGenerator.new()
var _ahora := 0.0
var _proximo: float = T["primero_s"]
var _fin := -INF
var _sonido: AudioStreamPlayer


func _ready() -> void:
	_azar.randomize()
	_sonido = AudioStreamPlayer.new()
	_sonido.stream = Sonidos.retumbo()
	_sonido.volume_db = -4.0
	add_child(_sonido)


func _process(delta: float) -> void:
	_ahora += delta
	var camara := get_viewport().get_camera_2d()
	if _ahora >= _proximo:
		_proximo = _ahora + _azar.randf_range(T["cada_min_s"], T["cada_max_s"])
		temblar()
	if camara == null:
		return
	if _ahora < _fin:
		# Crece y se apaga: un temblor no arranca de golpe.
		var amplitud: float = T["amplitud_px"] * sin((_fin - _ahora) / T["dura_s"] * PI)
		camara.offset = Vector2(_azar.randf_range(-amplitud, amplitud), _azar.randf_range(-amplitud, amplitud) * 0.6)
	elif _fin > -INF:
		_fin = -INF
		camara.offset = Vector2.ZERO


## Tiembla ya (lo usa tambien la escena inicial).
func temblar() -> void:
	_fin = _ahora + T["dura_s"]
	_sonido.play()
	temblo.emit()
	var camara := get_viewport().get_camera_2d()
	var centro := camara.get_screen_center_position() if camara else Vector2(320, 180)
	var mitad := get_viewport().get_visible_rect().size / 2.0
	# Polvo por todo lo ancho de la pantalla y unas pocas piedras.
	_caer(centro + Vector2(0, -mitad.y), mitad.x, 140, COLOR_POLVO, 90.0, 1.8, 2.0)
	_caer(centro + Vector2(0, -mitad.y), mitad.x, 14, COLOR_PIEDRA, 420.0, 1.2, 3.0)


func _caer(desde: Vector2, ancho: float, cuantas: int, color: Color, gravedad: float, vida: float, tamano: float) -> void:
	var p := CPUParticles2D.new()
	p.position = desde
	p.one_shot = true
	p.explosiveness = 0.15
	p.amount = cuantas
	p.lifetime = vida
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.emission_rect_extents = Vector2(ancho, 4.0)
	p.direction = Vector2(0, 1)
	p.spread = 15.0
	p.initial_velocity_min = 5.0
	p.initial_velocity_max = 30.0
	p.gravity = Vector2(0, gravedad)
	p.scale_amount_min = tamano * 0.6
	p.scale_amount_max = tamano
	p.color = color
	p.z_index = 30
	get_parent().add_child(p)
	p.emitting = true
	get_tree().create_timer(vida + 0.5).timeout.connect(p.queue_free)
