## Lo que el mapa tiene que decir sin palabras (#240): donde se cae al vacio y
## donde una caida es camino. Feedback de Jean: para llegar a una nota habia
## que dejarse caer, y nada distinguia esa bajada de un vacio.
##
## Lo saca de la silleria de la sala, sin tocar las escenas:
## - el vacio son las columnas sin suelo al fondo: de ahi sube una niebla
##   oscura con ceniza;
## - una bajada es un borde desde el que se cae lejos (MIN_BAJADA) a un suelo:
##   de ese borde cuelga una cadena hasta abajo, y abajo hay una luz.
extends RefCounted

const TILE := 16
## Desde cuantas baldosas una caida a suelo se marca como bajada. Las de 7 son
## el zigzag del Pozo: plataformeo, se ven enteras.
const MIN_BAJADA := 8
const CADENA := preload("res://arte/provisional/cadena.png")
const COLOR_NIEBLA := Color(0.05, 0.02, 0.03, 0.92)
const COLOR_CENIZA := Color(0.55, 0.38, 0.36, 0.55)
## Lo que sube la niebla desde el fondo de la sala.
const ALTO_NIEBLA := 80.0


## Las capas que se pisan.
static func capas(sala: Node) -> Array[TileMapLayer]:
	var halladas: Array[TileMapLayer] = []
	for nombre in ["Silleria", "Membranas"]:
		var capa := sala.get_node_or_null(nombre) as TileMapLayer
		if capa:
			halladas.append(capa)
	return halladas


static func _solido(lista: Array[TileMapLayer], celda: Vector2i) -> bool:
	for capa in lista:
		if capa.get_cell_source_id(celda) != -1:
			return true
	return false


## Los tramos del fondo sin suelo, como [x0, x1] en baldosas (x1 incluida):
## por ahi se cae al vacio.
static func huecos(sala: Node) -> Array[Vector2i]:
	var lista := capas(sala)
	var tramos: Array[Vector2i] = []
	if lista.is_empty():
		return tramos
	var r := lista[0].get_used_rect()
	var fondo := r.end.y - 1
	var desde := -1
	for x in range(r.position.x, r.end.x + 1):
		var hueco := x < r.end.x and not _solido(lista, Vector2i(x, fondo)) and not _solido(lista, Vector2i(x, fondo - 1))
		if hueco and desde == -1:
			desde = x
		elif not hueco and desde != -1:
			tramos.append(Vector2i(desde, x - 1))
			desde = -1
	return tramos


## Las bajadas: {columna, desde, hasta, lado}. `columna` es la baldosa vacia
## junto al borde, `desde` la fila del borde, `hasta` la del suelo de abajo y
## `lado` hacia donde se baja. Las entradas desde la sala de arriba (el borde
## en la primera fila) no cuentan: por ahi ya se llega cayendo.
static func bajadas(sala: Node) -> Array[Dictionary]:
	var lista := capas(sala)
	var halladas: Array[Dictionary] = []
	if lista.is_empty():
		return halladas
	var r := lista[0].get_used_rect()
	var vistas := {}
	for y in range(r.position.y + 1, r.end.y):
		for x in range(r.position.x, r.end.x):
			if not _solido(lista, Vector2i(x, y)) or _solido(lista, Vector2i(x, y - 1)):
				continue
			for lado in [-1, 1]:
				var columna: int = x + lado
				if _solido(lista, Vector2i(columna, y)) or _solido(lista, Vector2i(columna, y - 1)):
					continue
				var abajo := y
				while abajo < r.end.y and not _solido(lista, Vector2i(columna, abajo)):
					abajo += 1
				if abajo >= r.end.y or abajo - y < MIN_BAJADA or vistas.has(Vector2i(columna, abajo)):
					continue
				vistas[Vector2i(columna, abajo)] = true
				halladas.append({"columna": columna, "desde": y, "hasta": abajo, "lado": lado})
	return halladas


## Pone en la sala la niebla del vacio y las cadenas de las bajadas.
static func marcar(sala: Node2D) -> void:
	var lista := capas(sala)
	if lista.is_empty():
		return
	var fondo_px := float(lista[0].get_used_rect().end.y * TILE)
	for tramo in huecos(sala):
		_niebla(sala, float(tramo.x * TILE), float((tramo.y - tramo.x + 1) * TILE), fondo_px)
	for bajada in bajadas(sala):
		_cadena(sala, bajada)


## El vacio: una niebla que se oscurece hacia el fondo y ceniza que sube.
static func _niebla(sala: Node2D, x: float, ancho: float, fondo: float) -> void:
	var degradado := Gradient.new()
	degradado.set_color(0, Color(COLOR_NIEBLA, 0.0))
	degradado.set_color(1, COLOR_NIEBLA)
	var textura := GradientTexture2D.new()
	textura.gradient = degradado
	textura.fill_from = Vector2(0, 0)
	textura.fill_to = Vector2(0, 1)
	textura.width = 4
	textura.height = 64
	var niebla := Sprite2D.new()
	niebla.name = "Vacio"
	niebla.texture = textura
	niebla.centered = false
	niebla.position = Vector2(x, fondo - ALTO_NIEBLA)
	niebla.scale = Vector2(ancho / 4.0, ALTO_NIEBLA / 64.0)
	niebla.z_index = 3
	sala.add_child(niebla)
	var ceniza := CPUParticles2D.new()
	ceniza.position = Vector2(x + ancho / 2.0, fondo)
	ceniza.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	ceniza.emission_rect_extents = Vector2(ancho / 2.0, 2.0)
	ceniza.amount = maxi(2, int(ancho / 12.0))
	ceniza.lifetime = 3.0
	ceniza.direction = Vector2(0, -1)
	ceniza.spread = 15.0
	ceniza.gravity = Vector2.ZERO
	ceniza.initial_velocity_min = 10.0
	ceniza.initial_velocity_max = 22.0
	ceniza.color = COLOR_CENIZA
	ceniza.z_index = 3
	sala.add_child(ceniza)


## Una bajada: una cadena colgada del borde hasta el suelo de abajo, y una luz
## tenue donde se cae.
static func _cadena(sala: Node2D, bajada: Dictionary) -> void:
	var columna: int = bajada["columna"]
	var lado: int = bajada["lado"]
	# Pegada al borde del que cuelga.
	var x := columna * TILE + (2 if lado == 1 else TILE - 5)
	var arriba: float = bajada["desde"] * TILE
	var abajo: float = bajada["hasta"] * TILE - 6.0
	var cadena := TextureRect.new()
	cadena.name = "Bajada"
	cadena.texture = CADENA
	cadena.stretch_mode = TextureRect.STRETCH_TILE
	cadena.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	cadena.position = Vector2(x, arriba)
	cadena.size = Vector2(CADENA.get_width(), abajo - arriba)
	cadena.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cadena.z_index = -1
	sala.add_child(cadena)
	var degradado := Gradient.new()
	degradado.set_color(0, Color.WHITE)
	degradado.set_color(1, Color(1, 1, 1, 0))
	var mancha := GradientTexture2D.new()
	mancha.gradient = degradado
	mancha.fill = GradientTexture2D.FILL_RADIAL
	mancha.fill_from = Vector2(0.5, 0.5)
	mancha.fill_to = Vector2(1.0, 0.5)
	mancha.width = 96
	mancha.height = 96
	var luz := PointLight2D.new()
	luz.texture = mancha
	luz.color = Color(1.0, 0.75, 0.5)
	luz.energy = 0.55
	luz.position = Vector2(columna * TILE + TILE / 2.0, abajo - 6.0)
	sala.add_child(luz)
