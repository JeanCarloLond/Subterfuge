## Lo que se ve cuando un enemigo recibe un golpe (feedback de Jean): la silueta
## en blanco un instante y un chorro de sangre que sale hacia donde va el
## bisturi. Sin esto no se sabia si el golpe habia entrado.
extends RefCounted

const SHADER := preload("res://arte/herida.gdshader")
const COLOR_SANGRE := Color(0.62, 0.08, 0.07)
## Lo que dura la silueta en blanco.
const DESTELLO_MS := 120.0


## Le pone a `sprite` el material del destello. Uno por figura: si lo
## compartieran, al herir a uno se encenderian todos.
static func preparar(sprite: Sprite2D) -> void:
	var material := ShaderMaterial.new()
	material.shader = SHADER
	sprite.material = material


## Cuanto blanco toca ahora, de 1 (recien herido) a 0.
static func pintar(sprite: Sprite2D, ms_desde_golpe: float) -> void:
	if sprite.material is ShaderMaterial:
		var blanco := clampf(1.0 - ms_desde_golpe / DESTELLO_MS, 0.0, 1.0)
		sprite.material.set_shader_parameter("blanco", blanco)


## Un chorro de sangre en `sitio`, hacia `hacia` (-1 o 1). Va al nivel, no a la
## figura: la figura se mueve o se va, y la sangre tiene que quedarse.
static func salpicar(nivel: Node, sitio: Vector2, hacia: float, gotas: int) -> void:
	if nivel == null or not nivel.is_inside_tree():
		return
	var chorro := CPUParticles2D.new()
	chorro.position = sitio
	chorro.one_shot = true
	chorro.explosiveness = 0.95
	chorro.amount = gotas
	chorro.lifetime = 0.55
	chorro.direction = Vector2(hacia, -0.5)
	chorro.spread = 40.0
	chorro.initial_velocity_min = 50.0
	chorro.initial_velocity_max = 140.0
	chorro.gravity = Vector2(0, 420)
	chorro.scale_amount_min = 1.0
	chorro.scale_amount_max = 2.0
	chorro.color = COLOR_SANGRE
	nivel.add_child(chorro)
	chorro.emitting = true
	nivel.get_tree().create_timer(1.0).timeout.connect(chorro.queue_free)


## El charco que se queda en el suelo donde muere: la pelea deja rastro. Una
## mancha irregular, pegada al suelo en `pies`, siempre la misma para el mismo
## sitio.
static func charco(nivel: Node, pies: Vector2) -> void:
	if nivel == null or not nivel.is_inside_tree():
		return
	var azar := RandomNumberGenerator.new()
	azar.seed = hash(Vector2i(pies))
	var mancha := Polygon2D.new()
	var puntos := PackedVector2Array()
	var lados := 10
	for i in lados:
		var a := TAU * i / lados
		var r := azar.randf_range(5.0, 11.0)
		# Aplastada contra el suelo: mucho mas ancha que alta.
		puntos.append(Vector2(cos(a) * r, minf(0.0, sin(a) * r * 0.22)))
	mancha.polygon = puntos
	mancha.color = Color(0.36, 0.05, 0.05, 0.9)
	mancha.position = pies + Vector2(0, -0.5)
	mancha.z_index = -1
	nivel.add_child(mancha)
