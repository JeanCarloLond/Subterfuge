## Una pieza del decorado (#184) con vida propia, para que la sala no parezca
## una foto: la llama de la vela titila, el exvoto se mece, la pantalla muerta
## parpadea. Cada una a su ritmo, sacado de su sitio, para que no vayan a la vez.
extends Sprite2D

enum Vida { NINGUNA, LLAMA, VAIVEN, PARPADEO }

@export var vida := Vida.NINGUNA

var _periodo := 1.0
var _fase := 0.0


func _ready() -> void:
	var azar := RandomNumberGenerator.new()
	azar.seed = hash(position)
	_fase = azar.randf() * TAU
	match vida:
		Vida.LLAMA:
			_periodo = azar.randf_range(0.26, 0.42)
		Vida.VAIVEN:
			_periodo = azar.randf_range(1.8, 2.6)
		Vida.PARPADEO:
			_periodo = azar.randf_range(0.9, 1.7)
	set_process(vida != Vida.NINGUNA)


func _process(_delta: float) -> void:
	var onda := sin(Time.get_ticks_msec() / 1000.0 * TAU / (_periodo * 2.0) + _fase)
	match vida:
		Vida.LLAMA:
			modulate.a = 0.875 + 0.125 * onda
		Vida.VAIVEN:
			rotation = deg_to_rad(3.0 * onda)
		Vida.PARPADEO:
			modulate.a = 0.775 + 0.225 * onda
