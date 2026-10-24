## Viste las salas del Nivel I (#224), como vestir_atrio.gd vistio el Atrio:
## el fondo lejano, el decorado de cada sala, las columnas que sostienen lo que
## flota, la ruina (grietas y musgo del equipo) y una penumbra que oscurece al
## bajar. Feedback de Jean: las salas recien hechas se veian desnudas, piedra
## lisa y repisas en el aire.
##
## Va despues de crear_nivel_1.gd; si se vuelve a crear una sala, se vuelve a
## vestir. Rehace solo lo suyo (Lejos, Decorado, Ruina y la penumbra):
##
##   godot --headless --path sigma -s res://herramientas/vestir_nivel_1.gd
##
## Cada sala tiene su caracter: el Pabellon, camillas y bandejas vacias (la
## carne no llega); el Claustro, su arcada; la Capilla, fieles y exvotos; el
## Muro, lo que aplasto; el Umbral, la primera cosa de Genesis que se ve.
extends SceneTree

const DIR := "res://escenas/nivel1/"
const Pieza := preload("res://scripts/pieza.gd")
const GRIETAS := preload("res://arte/silleria/vientre-grietas.png")
const MUSGO := preload("res://arte/silleria/vientre-musgo.png")
const TINTE_LEJOS := Color(0.48, 0.41, 0.47, 0.8)
## Lo que cuelga se apoya por arriba; el resto, por abajo.
const COLGANTES := ["exvoto", "goteo", "cadena"]
const DENSIDAD_GRIETAS := 0.05
const DENSIDAD_MUSGO := 0.05
const SEPARACION := 44.0
## Hasta donde baja una columna a buscar suelo bajo lo que flota (tiles).
const SOSTEN_MAX := 6

## Sala -> penumbra y decorado [x, y, tipo]. Mas abajo, mas oscuro.
const SALAS := {
	"pabellon": {
		"penumbra": Color(0.76, 0.72, 0.74),
		"decorado": [
			[328, 304, "camilla"], [400, 304, "camilla"], [472, 304, "camilla"], [544, 304, "camilla"],
			[300, 304, "bandeja"], [508, 304, "bandeja"], [372, 240, "bandeja"],
			[180, 32, "exvoto"], [260, 32, "exvoto"], [450, 32, "exvoto"],
			[74, 304, "vela"], [104, 304, "vela"], [600, 304, "charco"],
		],
	},
	"claustro": {
		"penumbra": Color(0.72, 0.68, 0.72),
		"decorado": [
			[56, 224, "columna"], [296, 224, "columna"], [392, 224, "columna"], [488, 224, "columna"], [600, 224, "columna"],
			[650, 336, "columna"], [940, 336, "columna"],
			[300, 32, "exvoto"], [520, 32, "exvoto"], [700, 32, "exvoto"], [1100, 32, "exvoto"],
			[120, 224, "charco"], [700, 336, "charco"], [400, 176, "goteo"], [990, 448, "charco"],
		],
	},
	"pozo": {
		"penumbra": Color(0.64, 0.6, 0.66),
		"decorado": [
			[120, 208, "goteo"], [330, 400, "goteo"], [460, 544, "goteo"],
			[480, 432, "honguera"], [220, 656, "flor-hueso"], [230, 208, "relicario"],
			[300, 880, "charco"], [400, 880, "charco"], [500, 768, "vela"], [520, 768, "vela"],
		],
	},
	"capilla": {
		"penumbra": Color(0.7, 0.64, 0.68),
		"decorado": [
			[330, 304, "fiel"], [530, 304, "fiel"], [730, 304, "fiel"],
			[240, 32, "exvoto"], [430, 32, "exvoto"], [620, 32, "exvoto"], [820, 32, "exvoto"],
			[440, 256, "relicario"], [632, 256, "vela"], [244, 256, "vela"],
			[930, 304, "reja"], [150, 304, "charco"],
		],
	},
	"muro": {
		"penumbra": Color(0.66, 0.56, 0.58),
		"decorado": [
			[408, 304, "cadaver"], [420, 304, "charco"], [600, 304, "charco"], [120, 304, "reja"],
			[100, 32, "exvoto"], [250, 32, "exvoto"], [900, 32, "exvoto"], [1000, 32, "exvoto"],
			[880, 304, "columna"], [950, 304, "columna"],
		],
	},
	"escalera": {
		"penumbra": Color(0.66, 0.62, 0.64),
		"decorado": [
			[300, 32, "exvoto"], [500, 32, "exvoto"], [660, 32, "exvoto"],
			[600, 480, "flor-hueso"], [508, 480, "relicario"], [632, 480, "charco"],
			[60, 144, "vela"], [140, 144, "vela"], [820, 144, "vela"], [900, 144, "vela"],
		],
	},
	"umbral": {
		"penumbra": Color(0.64, 0.6, 0.66),
		"decorado": [
			[460, 304, "holograma"], [580, 304, "pantalla"], [40, 304, "reja"],
			[200, 32, "exvoto"], [420, 32, "exvoto"], [150, 304, "charco"], [400, 304, "columna"],
		],
	},
}

var _escena: Node
var _avisos := 0


func _initialize() -> void:
	var errores := 0
	for nombre in SALAS:
		errores += _vestir(nombre, SALAS[nombre])
	print("avisos: %d" % _avisos)
	quit(errores)


func _vestir(nombre: String, sala: Dictionary) -> int:
	var ruta := DIR + nombre + ".tscn"
	_escena = (load(ruta) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	for viejo in ["Lejos", "Decorado", "Ruina"]:
		if _escena.has_node(viejo):
			var nodo := _escena.get_node(viejo)
			_escena.remove_child(nodo)
			nodo.free()
	var silleria: TileMapLayer = _escena.get_node("Silleria")
	var tamano := _tamano(silleria)
	_poner(_lejos(tamano), _escena.get_node("Nave").get_index() + 1)
	_poner(_decorado(silleria, sala["decorado"]), silleria.get_index())
	_poner(_ruina(silleria), silleria.get_index() + 1)
	_escena.get_node("Penumbra").color = sala["penumbra"]

	var empaquetada := PackedScene.new()
	var error := empaquetada.pack(_escena)
	if error == OK:
		error = ResourceSaver.save(empaquetada, ruta)
	print("%s vestida: %s" % [nombre, error_string(error)])
	_escena.free()
	return 0 if error == OK else 1


## El tamano de la sala en px, por la piedra usada.
func _tamano(silleria: TileMapLayer) -> Vector2:
	var usado := silleria.get_used_rect()
	return Vector2(usado.end * 16)


func _poner(nodo: Node, indice: int) -> void:
	_escena.add_child(nodo)
	_escena.move_child(nodo, indice)
	_adoptar(nodo)


func _adoptar(nodo: Node) -> void:
	nodo.owner = _escena
	for hijo in nodo.get_children():
		_adoptar(hijo)


## La ciudad-catedral al fondo: ventanas y columnas que se pierden, repartidas
## por toda la sala (por el ruido, siempre igual).
func _lejos(tamano: Vector2) -> Node:
	var lejos := Parallax2D.new()
	lejos.name = "Lejos"
	lejos.scroll_scale = Vector2(0.6, 0.6)
	lejos.z_index = -8
	var i := 0
	var y := 220.0
	while y < tamano.y:
		var x := 80.0 + float(_ruido(int(y), 3, 41) % 120)
		while x < tamano.x * 0.7 + 200.0:
			var tipo := "ventana" if (i % 3) != 2 else "columna"
			var pieza := _sprite(tipo, Vector2(x, y + float(_ruido(int(x), int(y), 43) % 60)), false, i)
			pieza.modulate = TINTE_LEJOS
			lejos.add_child(pieza)
			x += 180.0 + float(_ruido(int(x), int(y), 47) % 90)
			i += 1
		y += 360.0
	return lejos


func _decorado(silleria: TileMapLayer, piezas: Array) -> Node:
	var decorado := Node2D.new()
	decorado.name = "Decorado"
	decorado.z_index = -5
	for i in piezas.size():
		var p: Array = piezas[i]
		var tipo: String = p[2]
		var sitio := Vector2(p[0], p[1])
		var cuelga := tipo in COLGANTES
		var apoyo := sitio + (Vector2(0, -8) if cuelga else Vector2(0, 8))
		if silleria.get_cell_source_id(silleria.local_to_map(apoyo)) == -1:
			push_warning("%s en %s no se apoya en piedra" % [tipo, sitio])
			_avisos += 1
		var pieza := _sprite(tipo, sitio, cuelga, i)
		pieza.set_script(Pieza)
		match tipo:
			"vela":
				pieza.vida = Pieza.Vida.LLAMA
				pieza.add_child(_luz(Vector2(0, -8), 0.55, Color(1.0, 0.7, 0.38), 0.7))
			"exvoto":
				pieza.vida = Pieza.Vida.VAIVEN
			"pantalla", "holograma":
				# Lo de Genesis: ni se tine con la zona ni se calienta con las
				# velas. Parpadea, con su luz fria.
				pieza.vida = Pieza.Vida.PARPADEO
				pieza.z_index = -1
				pieza.add_child(_luz(Vector2(0, -8), 0.5, Color(0.78, 0.88, 0.96), 0.5))
			"columna":
				pieza.modulate = Color(0.91, 0.89, 0.88, 0.85)
		decorado.add_child(pieza)
	_sostenes(silleria, decorado)
	return decorado


## Lo que flota no flota: bajo cada extremo de una repisa con suelo a pocos
## tiles, una columna estirada hasta la repisa. Va detras, no se pisa.
func _sostenes(silleria: TileMapLayer, decorado: Node) -> void:
	var n := 0
	for celda in silleria.get_used_cells():
		var debajo := celda + Vector2i.DOWN
		if silleria.get_cell_source_id(debajo) != -1:
			continue
		var izquierda := silleria.get_cell_source_id(celda + Vector2i.LEFT) == -1
		var derecha := silleria.get_cell_source_id(celda + Vector2i.RIGHT) == -1
		# Solo los extremos de una repisa, y de una que sea repisa (con piedra
		# al otro lado), no la punta de un muro.
		if izquierda == derecha:
			continue
		var al_lado := celda + (Vector2i.RIGHT if izquierda else Vector2i.LEFT)
		if silleria.get_cell_source_id(al_lado + Vector2i.DOWN) != -1:
			continue
		var suelo := -1
		for k in range(2, SOSTEN_MAX + 1):
			if silleria.get_cell_source_id(celda + Vector2i(0, k)) != -1:
				suelo = k
				break
		if suelo == -1:
			continue
		var arriba := (celda.y + 1) * 16.0
		var abajo := (celda.y + suelo) * 16.0
		var columna := _sprite("columna", Vector2(celda.x * 16 + 8, abajo), false, 900 + n)
		columna.scale.y = (abajo - arriba) / columna.texture.get_height()
		columna.modulate = Color(0.85, 0.82, 0.82, 0.9)
		decorado.add_child(columna)
		n += 1


## Grietas y musgo sobre la piedra (como vestir_atrio.gd).
func _ruina(silleria: TileMapLayer) -> Node:
	var ruina := Node2D.new()
	ruina.name = "Ruina"
	var puestas: Array[Vector2] = []
	for clase in [[GRIETAS, DENSIDAD_GRIETAS, 7, false, 16], [MUSGO, DENSIDAD_MUSGO, 13, true, 24]]:
		var hoja: Texture2D = clase[0]
		var arriba: bool = clase[3]
		var lado: int = clase[4]
		var columnas := hoja.get_width() / lado
		var cuadros := columnas * (hoja.get_height() / lado)
		for celda in silleria.get_used_cells():
			var x := celda.x * 16
			var y := celda.y * 16
			if _ruido(x, y, clase[2]) / 4294967296.0 >= clase[1]:
				continue
			if arriba and silleria.get_cell_source_id(celda + Vector2i.UP) != -1:
				continue
			# La grieta, dentro del muro: con piedra a los cuatro lados.
			if not arriba and _al_aire(silleria, celda):
				continue
			var centro := Vector2(x + 8, y if arriba else y + 8)
			if puestas.any(func(p: Vector2) -> bool: return absf(p.x - centro.x) < SEPARACION and absf(p.y - centro.y) < SEPARACION):
				continue
			puestas.append(centro)
			var cuadro := _ruido(x, y, clase[2] + 1) % cuadros
			var calco := Sprite2D.new()
			calco.texture = hoja
			calco.region_enabled = true
			calco.region_rect = Rect2((cuadro % columnas) * lado, (cuadro / columnas) * lado, lado, lado)
			calco.position = centro
			calco.modulate = Color8(0xe8, 0xe4, 0xe0)
			ruina.add_child(calco)
	return ruina


func _al_aire(silleria: TileMapLayer, celda: Vector2i) -> bool:
	for lado in [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]:
		if silleria.get_cell_source_id(celda + lado) == -1:
			return true
	return false


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


## El mismo hash que vestir_atrio.gd: la ruina sale igual cada vez.
func _ruido(x: int, y: int, sal: int) -> int:
	var n := ((x * 73856093) ^ (y * 19349663) ^ (sal * 83492791)) & 0xFFFFFFFF
	n = ((n ^ (n >> 15)) * 0x2c1b3c6d) & 0xFFFFFFFF
	n = ((n ^ (n >> 12)) * 0x297a2d39) & 0xFFFFFFFF
	return n ^ (n >> 15)
