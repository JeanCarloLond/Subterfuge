## Viste el Atrio (#184) con lo que tenia en Phaser (src/scenes/AtrioScene.ts y
## EscenaNivel.ts): el telon, el atrezo lejano, el decorado, la ruina (grietas
## y musgo del equipo), el polvo, la luz y la vineta. Se corrio UNA vez; desde
## entonces se retoca en el editor. Volver a correrlo rehace esos nodos:
##
##   godot --headless --path sigma -s res://herramientas/vestir_atrio.gd
##
## El decorado va donde estaba, salvo lo que apoyaba en una repisa que se movio
## al pasar a la rejilla (ver importar_atrio.gd): esas coordenadas estan
## corregidas y marcadas.
extends SceneTree

const ESCENA := "res://escenas/atrio.tscn"
const Pieza := preload("res://scripts/pieza.gd")
const Telon := preload("res://scripts/telon.gd")
const VINETA := preload("res://arte/vineta.gdshader")
const GRIETAS := preload("res://arte/silleria/vientre-grietas.png")
const MUSGO := preload("res://arte/silleria/vientre-musgo.png")

## La piedra del Atrio va casi a su color: es el punto de comparacion con el
## que el jugador medira lo oscuro que se pone todo mas abajo.
const TINTE := Color8(0xe8, 0xe4, 0xe0)
## El atrezo lejano: mas oscuro, y a 0,6 de la camara. Es el tinte de Phaser
## (0x5a4c58) aclarado por la penumbra, que en Phaser no habia: con los dos se
## perdia contra el telon.
const TINTE_LEJOS := Color(0.48, 0.41, 0.47, 0.8)
const POLVO := Color8(0xc9, 0xb4, 0x8a)

## Lo que cuelga se apoya por arriba; el resto, por abajo.
const COLGANTES := ["exvoto", "goteo"]

## [x, y, tipo]. Entre parentesis, lo que cambio respecto a Phaser.
const DECORADO := [
	[590, 528, "charco"],
	[799, 128, "charco"],
	[299, 448, "charco"],
	[24, 128, "pila-carne"], # (y 120: la repisa alta bajo 8 px)
	[120, 704, "goteo"], # (x 206: ahi esta ahora el techo que late)
	[232, 288, "pantalla"],
	[40, 288, "columna"],
	[200, 288, "columna"],
	[340, 288, "columna"],
	[104, 288, "vela"],
	[136, 288, "vela"],
	[262, 288, "charco"],
	[556, 144, "exvoto"],
	[596, 144, "exvoto"],
	[16, 144, "exvoto"], # (y 136)
	[36, 144, "exvoto"], # (y 136)
	[84, 688, "vela"],
	[116, 688, "vela"],
	[130, 688, "columna"],
	[300, 688, "columna"],
	[576, 528, "vela"],
	[604, 528, "vela"],
	[664, 528, "columna"],
	[160, 1008, "columna"],
	[400, 1008, "columna"],
	[300, 1008, "charco"],
	[620, 1008, "vela"],
	[680, 1008, "vela"],
]

## La ciudad-catedral al fondo: ventanas ojivales y columnas que se pierden.
const FONDO := [
	[180, 250, "ventana"], [420, 210, "ventana"], [700, 260, "ventana"], [880, 230, "ventana"],
	[100, 300, "columna"], [300, 300, "columna"], [520, 300, "columna"], [760, 300, "columna"],
	[240, 640, "ventana"], [560, 600, "ventana"], [80, 720, "columna"], [460, 720, "columna"],
	[660, 720, "columna"], [360, 980, "ventana"], [620, 1000, "columna"], [200, 1040, "columna"],
]

## La ruina: cuanta, y a que distancia minima una de otra para no apelotonarse.
const DENSIDAD_GRIETAS := 0.05
const DENSIDAD_MUSGO := 0.05
const SEPARACION := 44.0

var _escena: Node


func _initialize() -> void:
	_escena = (load(ESCENA) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	for viejo in ["Telon", "Lejos", "Decorado", "Ruina", "Penumbra", "Polvo", "Vineta"]:
		if _escena.has_node(viejo):
			var nodo := _escena.get_node(viejo)
			_escena.remove_child(nodo)
			nodo.free()

	var silleria: TileMapLayer = _escena.get_node("Silleria")
	_poner(_telon(), 0)
	_poner(_lejos(), 1)
	_poner(_decorado(silleria), silleria.get_index())
	_poner(_ruina(silleria), silleria.get_index() + 1)
	_poner(_penumbra(), -1)
	_poner(_polvo(), -1)
	_poner(_vineta(), _escena.get_node("Interfaz").get_index())

	var empaquetada := PackedScene.new()
	empaquetada.pack(_escena)
	var error := ResourceSaver.save(empaquetada, ESCENA)
	print("Atrio vestido: %s" % error_string(error))
	_escena.free()
	quit(0 if error == OK else 1)


## Anade `nodo` a la escena en la posicion `indice` (-1: al final) y lo hace
## suyo, con todos sus hijos, para que se guarde.
func _poner(nodo: Node, indice: int) -> void:
	_escena.add_child(nodo)
	if indice >= 0:
		_escena.move_child(nodo, indice)
	_adoptar(nodo)


func _adoptar(nodo: Node) -> void:
	nodo.owner = _escena
	for hijo in nodo.get_children():
		_adoptar(hijo)


func _telon() -> Node:
	var telon := CanvasLayer.new()
	telon.name = "Telon"
	telon.set_script(Telon)
	return telon


func _lejos() -> Node:
	var lejos := Parallax2D.new()
	lejos.name = "Lejos"
	lejos.scroll_scale = Vector2(0.6, 0.6)
	lejos.z_index = -8
	for i in FONDO.size():
		var p: Array = FONDO[i]
		var pieza := _sprite(p[2], Vector2(p[0], p[1]), false, i)
		pieza.modulate = TINTE_LEJOS
		lejos.add_child(pieza)
	return lejos


func _decorado(silleria: TileMapLayer) -> Node:
	var decorado := Node2D.new()
	decorado.name = "Decorado"
	decorado.z_index = -5
	for i in DECORADO.size():
		var p: Array = DECORADO[i]
		var tipo: String = p[2]
		var sitio := Vector2(p[0], p[1])
		var cuelga := tipo in COLGANTES
		var apoyo := sitio + (Vector2(0, -8) if cuelga else Vector2(0, 8))
		if silleria.get_cell_source_id(silleria.local_to_map(apoyo)) == -1:
			push_warning("%s en %s no se apoya en piedra" % [tipo, sitio])

		var pieza := _sprite(tipo, sitio, cuelga, i)
		pieza.set_script(Pieza)
		match tipo:
			"vela":
				pieza.vida = Pieza.Vida.LLAMA
				pieza.add_child(_luz(Vector2(0, -8), 0.55, Color(1.0, 0.7, 0.38), 0.7))
			"exvoto":
				pieza.vida = Pieza.Vida.VAIVEN
			"pantalla":
				# Lo unico del Vientre que no es de la Diocesis: ni se tine con
				# la zona ni se calienta con las velas.
				pieza.vida = Pieza.Vida.PARPADEO
				pieza.z_index = -1
			"columna":
				pieza.modulate = Color(TINTE, 0.85)
		decorado.add_child(pieza)

	# El umbral tambien alumbra: es la salida.
	var umbral: Node2D = _escena.get_node("Umbral")
	decorado.add_child(_luz(umbral.position + Vector2(0, -16), 0.7, Color(0.85, 0.45, 0.4), 0.6))
	return decorado


## Grietas y musgo sobre la piedra ya puesta. La grieta va DENTRO del muro y
## nunca asoma al vacio; el musgo crece hacia fuera y se planta a caballo del
## canto, colgando por el borde, y solo donde da el aire (sin piedra encima).
func _ruina(silleria: TileMapLayer) -> Node:
	var ruina := Node2D.new()
	ruina.name = "Ruina"
	var puestas: Array[Vector2] = []
	var celdas := silleria.get_used_cells()
	for clase in [[GRIETAS, DENSIDAD_GRIETAS, 7, false, 16], [MUSGO, DENSIDAD_MUSGO, 13, true, 24]]:
		var hoja: Texture2D = clase[0]
		var arriba: bool = clase[3]
		var lado: int = clase[4]
		var cuadros := (hoja.get_width() / lado) * (hoja.get_height() / lado)
		for celda in celdas:
			var x := celda.x * 16
			var y := celda.y * 16
			if _ruido(x, y, clase[2]) / 4294967296.0 >= clase[1]:
				continue
			if arriba and silleria.get_cell_source_id(celda + Vector2i.UP) != -1:
				continue
			var centro := Vector2(x + 8, y if arriba else y + 8)
			if puestas.any(func(p: Vector2) -> bool: return absf(p.x - centro.x) < SEPARACION and absf(p.y - centro.y) < SEPARACION):
				continue
			puestas.append(centro)

			var cuadro := _ruido(x, y, clase[2] + 1) % cuadros
			var columnas := hoja.get_width() / lado
			var calco := Sprite2D.new()
			calco.texture = hoja
			calco.region_enabled = true
			calco.region_rect = Rect2((cuadro % columnas) * lado, (cuadro / columnas) * lado, lado, lado)
			calco.position = centro
			calco.modulate = TINTE
			ruina.add_child(calco)
	return ruina


## La luz del Atrio: el unico sitio del Vientre donde aun entra, asi que la
## penumbra es leve. Lo justo para que las velas y los Altares se noten.
func _penumbra() -> Node:
	var penumbra := CanvasModulate.new()
	penumbra.name = "Penumbra"
	penumbra.color = Color(0.74, 0.7, 0.74)
	return penumbra


## Motas de polvo que flotan delante del telon y detras de la piedra.
func _polvo() -> Node:
	var capa := CanvasLayer.new()
	capa.name = "Polvo"
	capa.layer = -1
	var motas := CPUParticles2D.new()
	motas.name = "Motas"
	motas.amount = 34
	motas.lifetime = 9.0
	motas.lifetime_randomness = 0.4
	motas.preprocess = 9.0
	motas.position = Vector2(240, 160)
	motas.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	motas.emission_rect_extents = Vector2(240, 160)
	motas.direction = Vector2(0, 1)
	motas.spread = 40.0
	motas.gravity = Vector2.ZERO
	motas.initial_velocity_min = 2.0
	motas.initial_velocity_max = 9.0
	motas.scale_amount_min = 1.0
	motas.scale_amount_max = 1.0
	var vida := Gradient.new()
	vida.set_color(0, Color(POLVO, 0.0))
	vida.set_color(1, Color(POLVO, 0.0))
	vida.add_point(0.5, Color(POLVO, 0.35))
	motas.color_ramp = vida
	capa.add_child(motas)
	return capa


func _vineta() -> Node:
	var capa := CanvasLayer.new()
	capa.name = "Vineta"
	var velo := ColorRect.new()
	velo.name = "Velo"
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	velo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var material := ShaderMaterial.new()
	material.shader = VINETA
	velo.material = material
	capa.add_child(velo)
	return capa


func _sprite(tipo: String, sitio: Vector2, cuelga: bool, numero: int) -> Sprite2D:
	var pieza := Sprite2D.new()
	pieza.name = "%s%d" % [tipo.to_pascal_case(), numero]
	pieza.texture = load("res://arte/provisional/%s.png" % tipo)
	pieza.centered = false
	var tamano := pieza.texture.get_size()
	pieza.offset = Vector2(-tamano.x / 2.0, 0.0 if cuelga else -tamano.y).round()
	pieza.position = sitio
	return pieza


func _luz(sitio: Vector2, escala: float, color: Color, energia: float) -> PointLight2D:
	var degradado := Gradient.new()
	degradado.set_color(0, Color.WHITE)
	degradado.set_color(1, Color(1, 1, 1, 0))
	var textura := GradientTexture2D.new()
	textura.gradient = degradado
	textura.width = 160
	textura.height = 160
	textura.fill = GradientTexture2D.FILL_RADIAL
	textura.fill_from = Vector2(0.5, 0.5)
	textura.fill_to = Vector2(1.0, 0.5)
	var luz := PointLight2D.new()
	luz.name = "Luz"
	luz.position = sitio
	luz.texture = textura
	luz.texture_scale = escala
	luz.color = color
	luz.energy = energia
	return luz


## El mismo hash que EscenaNivel.ts: la ruina sale igual cada vez.
func _ruido(x: int, y: int, sal: int) -> int:
	var n := ((x * 73856093) ^ (y * 19349663) ^ (sal * 83492791)) & 0xFFFFFFFF
	n = ((n ^ (n >> 15)) * 0x2c1b3c6d) & 0xFFFFFFFF
	n = ((n ^ (n >> 12)) * 0x297a2d39) & 0xFFFFFFFF
	return n ^ (n >> 15)
