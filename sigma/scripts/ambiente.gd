## El ambiente vivo de una sala: lo que se mueve aunque el jugador este quieto.
##
## - La Lluvia Tibia (la biblia: "la condensacion es constante y llueve por
##   dentro"): gotas que caen de los techos y salpican al llegar. Los puntos de
##   goteo se buscan solos en la silleria: piedra con aire debajo y suelo mas
##   abajo.
## - Polvo en suspension que sigue a la camara y brilla con la luz.
## - Cadenas que cuelgan de los techos y se mecen.
## - Niebla baja que se desliza despacio sobre los suelos que se digan.
extends Node2D

const COLOR_GOTA := Color(0.78, 0.72, 0.62, 0.9)
const COLOR_POLVO := Color(1.0, 0.9, 0.75, 0.35)
const COLOR_CADENA := Color(0.24, 0.2, 0.2)
const COLOR_CADENA_LUZ := Color(0.4, 0.34, 0.32)
const GRAVEDAD_GOTA := 520.0
## Una gota de cada tantas celdas candidatas, y como mucho estas.
const GOTEOS_MAX := 14

## La silleria donde buscar techos.
@export var silleria: NodePath
## [x, y, largo]: cadenas colgadas desde (x, y).
@export var cadenas: Array = []
## [x, y, ancho]: franjas de niebla sobre el suelo en y.
@export var nieblas: Array = []

var _cadenas: Array[Array] = []
var _nieblas: Array[Sprite2D] = []
var _polvo: CPUParticles2D


func _ready() -> void:
	var capa := get_node_or_null(silleria) as TileMapLayer
	if capa:
		for sitio in puntos_de_goteo(capa):
			_goteo(sitio[0], sitio[1])
	for c in cadenas:
		_cadenas.append([Vector2(c[0], c[1]), float(c[2]), randf() * TAU])
	for n in nieblas:
		_niebla(Vector2(n[0], n[1]), n[2])
	_polvo = _crear_polvo()
	add_child(_polvo)


func _process(delta: float) -> void:
	var camara := get_viewport().get_camera_2d()
	if camara:
		_polvo.global_position = camara.get_screen_center_position()
	for niebla in _nieblas:
		niebla.region_rect.position.x += delta * 6.0
	queue_redraw()


## Donde gotea: piedra con aire debajo, y suelo entre 48 y 320 px mas abajo.
## Devuelve [sitio de la gota, distancia hasta el suelo]. Se elige por el sitio
## (sale igual siempre) y espaciado, para que no llueva de todo el techo.
static func puntos_de_goteo(capa: TileMapLayer) -> Array:
	var puntos := []
	for celda in capa.get_used_cells():
		if capa.get_cell_source_id(celda + Vector2i.DOWN) != -1:
			continue
		if absi((celda.x * 7919) ^ (celda.y * 104729)) % 5 != 0:
			continue
		for caida in range(3, 21):
			if capa.get_cell_source_id(celda + Vector2i(0, caida)) != -1:
				# Del borde de abajo del techo a la cara de arriba del suelo.
				var sitio := capa.map_to_local(celda) + Vector2(0, 8)
				puntos.append([sitio, (caida - 1) * 16.0])
				break
		if puntos.size() >= GOTEOS_MAX:
			break
	return puntos


func _goteo(sitio: Vector2, altura: float) -> void:
	var gota := CPUParticles2D.new()
	gota.position = sitio
	gota.amount = 1
	# Lo que tarda en caer esa altura: la gota se apaga justo al llegar.
	gota.lifetime = sqrt(2.0 * altura / GRAVEDAD_GOTA)
	gota.preprocess = randf() * 2.0
	gota.gravity = Vector2(0, GRAVEDAD_GOTA)
	gota.direction = Vector2(0, 1)
	gota.spread = 0.0
	gota.initial_velocity_min = 0.0
	gota.initial_velocity_max = 0.0
	gota.scale_amount_min = 1.0
	gota.scale_amount_max = 1.0
	gota.color = COLOR_GOTA
	gota.z_index = -1
	add_child(gota)
	# Y salpica en el suelo, al ritmo de la gota.
	var salpica := CPUParticles2D.new()
	salpica.position = sitio + Vector2(0, altura)
	salpica.amount = 3
	salpica.lifetime = gota.lifetime
	salpica.explosiveness = 1.0
	salpica.direction = Vector2(0, -1)
	salpica.spread = 60.0
	salpica.initial_velocity_min = 20.0
	salpica.initial_velocity_max = 40.0
	salpica.gravity = Vector2(0, 300)
	salpica.color = COLOR_GOTA
	salpica.z_index = -1
	add_child(salpica)


func _crear_polvo() -> CPUParticles2D:
	var polvo := CPUParticles2D.new()
	polvo.amount = 36
	polvo.lifetime = 8.0
	polvo.preprocess = 8.0
	polvo.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	polvo.emission_rect_extents = Vector2(340, 200)
	polvo.direction = Vector2(1, -0.2)
	polvo.spread = 180.0
	polvo.initial_velocity_min = 2.0
	polvo.initial_velocity_max = 6.0
	polvo.gravity = Vector2(0, 0.5)
	polvo.color = COLOR_POLVO
	polvo.local_coords = false
	polvo.z_index = 20
	var mezcla := CanvasItemMaterial.new()
	mezcla.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	polvo.material = mezcla
	return polvo


func _niebla(sitio: Vector2, ancho: float) -> void:
	var niebla := Sprite2D.new()
	niebla.texture = preload("res://arte/fondos/niebla.png")
	niebla.centered = false
	niebla.region_enabled = true
	niebla.region_rect = Rect2(0, 0, ancho, 32)
	niebla.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	niebla.position = sitio + Vector2(0, -26)
	niebla.z_index = 3
	add_child(niebla)
	_nieblas.append(niebla)


## Las cadenas: eslabones alternos, de canto y de frente, que se mecen como un
## pendulo lento. Se dibujan, no son sprites: asi el largo se dice en el nivel.
func _draw() -> void:
	var t := Time.get_ticks_msec() / 1000.0
	for c in _cadenas:
		var arriba: Vector2 = c[0]
		var largo: float = c[1]
		var angulo := sin(t * 0.9 + c[2]) * 0.06
		var hacia := Vector2(sin(angulo), cos(angulo))
		var eslabones := int(largo / 5.0)
		for i in eslabones:
			var p := arriba + hacia * (i * 5.0 + 2.5)
			if i % 2 == 0:
				draw_rect(Rect2(p - Vector2(1.5, 2.5), Vector2(3, 5)), COLOR_CADENA, false, 1.0)
			else:
				draw_line(p - hacia * 2.5, p + hacia * 2.5, COLOR_CADENA_LUZ, 1.0)
		# Un garfio al final.
		var fin := arriba + hacia * largo
		draw_arc(fin + Vector2(2, 2), 3.0, PI * 0.2, PI * 1.2, 6, COLOR_CADENA_LUZ, 1.0)
