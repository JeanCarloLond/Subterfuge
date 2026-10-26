## Crea las salas del Nivel I (#218), el Atrio de bajada del plano de
## docs/mapa.md. Se corrio UNA vez; desde entonces las salas se editan en el
## editor de Godot. Volver a correrlo pisa lo pintado a mano:
##
##   godot --headless --path sigma -s res://herramientas/crear_nivel_1.gd
##
## La Nave del Atrio (la sala 3) no sale de aqui: es el Atrio de siempre, sin
## sus reliquias, copiado a escenas/nivel1/nave.tscn.
##
## Todo va en tiles de 16 px: [columna, fila, ancho, alto]. Un salto sube 92
## px (casi 6 tiles) y llega a 112 en llano (7); caer mas de 160 px (10 tiles)
## duele. Por eso las bajadas son de 7 u 8 tiles y cada subida de vuelta tiene
## un escalon o una membrana.
extends SceneTree

const DIR := "res://escenas/nivel1/"
const SILLERIA := preload("res://arte/silleria/vientre.tres")
const MEMBRANA := preload("res://arte/silleria/membrana.tres")
const UMBRAL := preload("res://arte/provisional/umbral.png")
const VINETA := preload("res://arte/vineta.gdshader")

## Donde van las salas. crear_nivel_2.gd extiende este y la cambia.
var dir := DIR
var _raiz: Node2D
var _silleria: TileMapLayer
var _membranas: TileMapLayer


func _initialize() -> void:
	if not _scripts_cargan():
		quit(1)
		return
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
	var errores := 0
	# Una a una: cada sala se arma y se guarda antes de empezar la siguiente.
	for crear in [_pabellon, _claustro, _pozo, _capilla, _muro, _escalera, _umbral]:
		errores += _guardar(crear.call())
	quit(errores)


## Si un script no carga (un error de sintaxis), set_script deja el nodo sin
## el y la sala se guarda rota sin avisar: mejor no generar nada.
func _scripts_cargan() -> bool:
	for script in ["sala", "paso", "sierra", "rayo", "cierre", "cartel", "vision", "reliquia", "prior", "onda", "injerto", "nave_libro", "atrezo", "ambiente", "temblor", "muro", "nave", "telon", "silleria"]:
		# Con un error de sintaxis, load no da null: da un script que no se
		# puede instanciar.
		var cargado: GDScript = load("res://scripts/%s.gd" % script)
		if cargado == null or not cargado.can_instantiate():
			push_error("%s.gd no carga: no se genera nada" % script)
			return false
	return true


# --- Las salas ----------------------------------------------------------------


## 1 · El Pabellon N.º 7: donde empieza. Se aprende a andar y a saltar; el
## Altar de casa. La carne no llega: las bandejas vuelven vacias.
func _pabellon() -> Dictionary:
	_empezar("Pabellon", 40, 23)
	_piedra([[0, 0, 40, 2], [0, 0, 2, 23], [38, 0, 2, 16], [0, 19, 40, 4]])
	# Una tarima que se salta y una repisa con el parte del pabellon.
	_piedra([[14, 17, 4, 2], [22, 15, 5, 1]])
	_altar("Pabellon", 5, 19)
	_cirujano(7, 19)
	_cartel("moverse", 8, 19, "{izquierda} {derecha}  moverse", "izquierda,derecha")
	_cartel("saltar", 12, 19, "{saltar}  saltar", "saltar", "moverse")
	_nota("parte-pabellon-7", 24, 15, "Parte del Pabellón N.º 7", "«Tercer día sin carne. Las bandejas vuelven vacías del ducto. Los Elegidos preguntan, y las Manos no contestan: no es nuestro oficio contestar.

Anoche la pared del fondo se movió un palmo. Nadie la ha tocado en mil años.»")
	_paso("Este", 38, 16, 2, 3, "claustro", "oeste")
	_entrada("este", 35, 19, -1)
	_atrezo([["candelabro", 56, 304], ["candelabro", 136, 304], ["hongos", 420, 240]])
	_ambiente([[200, 32, 60], [500, 32, 48]], [[32, 304, 576]])
	return {"nombre": "pabellon", "ancho": 40, "alto": 23}


## 2 · El Claustro: la primera bajada, en tres tramos, con las sierras de
## hueso, y cada uno pide mas que el anterior. Arriba, un foso de sierras que
## se salta con carrerilla y una sierra en el suelo y otra en la repisa: hay
## que elegir por donde y cuando. En medio, tres sierras que suben y bajan
## desfasadas: se pasa leyendo el ritmo. Abajo, pilares sobre el vacio con
## sierras que cruzan los saltos.
func _claustro() -> Dictionary:
	_empezar("Claustro", 80, 34)
	_piedra([[0, 0, 80, 2], [0, 0, 2, 10]])
	# Tramo alto (suelo en la fila 14) con el foso, 3 filas mas hondo.
	_piedra([[0, 14, 10, 20], [10, 17, 6, 17], [16, 14, 24, 20]])
	_sierra(11, 17, Vector2.ZERO)
	_sierra(14, 17, Vector2.ZERO)
	_piedra([[21, 10, 11, 1]])
	_sierra(20, 14, Vector2(208, 0), 0.0, -2.0)
	_sierra(21, 10, Vector2(160, 0), 1.7, -2.0)
	# Tramo medio (fila 21), con su escalon de vuelta.
	_piedra([[40, 21, 20, 13], [40, 18, 3, 1]])
	for i in 3:
		_sierra(45 + i * 5, 21, Vector2(0, -80), i * 0.6, -8.0)
	# Tramo bajo (fila 28): pilares sobre el vacio hasta la salida.
	# Un salto a toda carrera llega a 112 px: hueco y pilar suman eso, para
	# que caer en el pilar no pida frenar en el aire, solo saltar a tiempo.
	_piedra([[60, 28, 3, 6], [60, 24, 3, 1], [66, 28, 4, 6], [72, 26, 3, 8], [77, 28, 3, 6], [78, 0, 2, 24]])
	_sierra(63, 24, Vector2(96, 0), 0.0)
	_sierra(75, 25, Vector2(0, 48), 0.8)
	_cirujano(4, 14)
	_cartel("salto-alto", 6, 14, "Mantén {saltar}: saltas más alto
Suéltalo antes: más corto", "")
	_paso("Oeste", 0, 10, 2, 4, "pabellon", "este")
	_paso("Este", 78, 24, 2, 4, "nave", "oeste")
	_entrada("oeste", 4, 14, 1)
	_entrada("este", 77, 28, -1)
	_atrezo([["candelabro", 104, 224], ["hongos", 470, 160], ["candelabro", 760, 336], ["hongos", 1000, 448]])
	_ambiente([[300, 32, 70], [700, 32, 90], [1100, 32, 120]], [[640, 336, 320]])
	return {"nombre": "claustro", "ancho": 80, "alto": 34}


## 4 · El Pozo de la Silleria: dos tramos de escalera gigante, uno que baja a
## la derecha y otro que vuelve a la izquierda por debajo. Cada peldano es un
## bloque de 7 filas: bajar es dejarse caer 112 px; subir, no, el salto llega a
## 92. El canto de cada peldano es membrana: se salta pegado a el, se clava el
## bisturi (K) y se trepa al borde (arriba), unos 137 px. Aqui se aprende a
## clavarse. Encima de cada canto no hay nada: si lo hubiera, no se podria
## trepar. Las sierras corren por el rellano y por el suelo.
func _pozo() -> Dictionary:
	_empezar("Pozo", 40, 60)
	_piedra([[0, 0, 40, 2], [0, 0, 6, 44], [0, 48, 6, 12], [34, 0, 6, 44], [34, 48, 6, 12], [6, 55, 28, 5]])
	# Antes de la salida al Muro, un bloque que solo se sube clavandose: aqui
	# se aprende, no a la vuelta.
	_piedra([[28, 48, 6, 7]])
	_membrana([[28, 48, 1, 7]])
	# [columna, fila de arriba, ancho, alto, columna del canto]. Bajando a la
	# derecha, el rellano y bajando a la izquierda. Los que tienen debajo el
	# canto del otro tramo miden 5 filas, no 7: dejan dos libres por donde
	# trepar a ese canto (con 7, las dos esquinas se tocarian y no se pasa).
	for peldano in [[6, 6, 6, 7, 11], [12, 13, 6, 7, 17], [18, 20, 6, 5, 23], [24, 27, 10, 7, 24], [18, 34, 6, 7, 18], [12, 41, 6, 5, 12], [6, 48, 6, 7, 11]]:
		_piedra([[peldano[0], peldano[1], peldano[2], peldano[3]]])
		_membrana([[peldano[4], peldano[1], 1, peldano[3]]])
	_sierra(25, 27, Vector2(128, 0), 0.0, -2.0)
	_sierra(13, 13, Vector2(64, 0), 0.5, -2.0)
	_sierra(21, 31, Vector2(0, 50), 1.2)
	_sierra(13, 55, Vector2(208, 0), 1.0, -2.0)
	_cartel("membrana", 9, 6, "La piedra roja es membrana:
en ella se clava el bisturí", "")
	_cartel("clavarse", 25, 55, "Salta pegado a la membrana
{parry}  clávate · {arriba}  trepa", "parry")
	_paso("Arriba", 7, 4, 2, 2, "nave", "abajo", true, "E  subir")
	_puerta(8, 6)
	_paso("Oeste", 0, 44, 2, 4, "capilla", "este")
	_paso("Este", 38, 44, 2, 4, "muro", "oeste")
	_entrada("arriba", 10, 6, 1)
	_entrada("oeste", 7, 48, 1)
	_entrada("este", 32, 48, -1)
	_cirujano(10, 6)
	_atrezo([["candelabro", 120, 96], ["hongos", 230, 208], ["hongos", 330, 320], ["candelabro", 500, 432], ["hongos", 230, 656], ["piedra-tibia", 440, 880]])
	_ambiente([[200, 32, 120], [460, 32, 160]], [[192, 880, 256]])
	return {"nombre": "pozo", "ancho": 40, "alto": 60}


## 5 · La Capilla de la Vestal: se aprende a devolverle el sello. Un Devoto
## al otro lado de los bancos. Se sale por el hueco del suelo.
func _capilla() -> Dictionary:
	_empezar("Capilla", 60, 23)
	_piedra([[0, 0, 60, 2], [0, 0, 2, 23], [58, 0, 2, 15], [0, 19, 2, 4], [6, 19, 54, 4]])
	# Los bancos.
	_piedra([[12, 16, 6, 1], [24, 16, 6, 1], [36, 16, 6, 1]])
	_cirujano(55, 19)
	# Lejos de las entradas: con el jugador quieto al llegar, le pegaban a
	# los 2 s (#232).
	_vestal(26, 19, 360.0, 480.0)
	_cartel("sello", 52, 19, "{parry}  para el sello:
vuelve contra quien lo lanzó", "parry")
	_devoto(42, 19, 600.0, 740.0)
	_paso("Este", 58, 15, 2, 4, "pozo", "oeste")
	_paso("Hueco", 2, 21, 4, 2, "escalera", "noroeste")
	_entrada("este", 55, 19, -1)
	_entrada("hueco", 8, 19, 1)
	_atrezo([["candelabro", 184, 256], ["candelabro", 376, 256], ["candelabro", 568, 256], ["hongos", 900, 304]])
	_ambiente([[300, 32, 80], [620, 32, 80]], [[96, 304, 800]])
	return {"nombre": "capilla", "ancho": 60, "alto": 23}


## 6 · El Muro de los Dientes: la compactacion. Un pasillo bajo con cinco
## techos que laten y bajan hasta el suelo, desfasados: se pasa de hueco en
## hueco en su reposo. Aplastan: avisan antes, con dos latidos. Y una sierra
## al salir.
func _muro() -> Dictionary:
	_empezar("Muro", 70, 23)
	_piedra([[0, 0, 70, 2], [0, 0, 2, 15], [68, 0, 2, 23], [0, 19, 64, 4]])
	# El techo bajo del pasillo: deja 6 tiles.
	_piedra([[20, 2, 30, 11]])
	# Ya en marcha al entrar, y alternos: los impares bajan mientras los pares
	# suben. Simulado: se cruza siempre, pero casi nunca sin esperar en un
	# hueco (con todos en reposo al llegar, se pasaba corriendo).
	for i in 5:
		_techo_que_baja(21 + i * 6, 13, -3800.0 if i % 2 == 0 else -1000.0)
	_sierra(51, 19, Vector2(128, 0), 0.0, -2.0)
	_cartel("latido", 6, 19, "Escucha el Latido: el techo
avisa dos veces antes de bajar", "")
	_cirujano(4, 19)
	_paso("Oeste", 0, 15, 2, 4, "pozo", "este")
	_paso("Hueco", 64, 21, 4, 2, "escalera", "noreste")
	_entrada("oeste", 4, 19, 1)
	_entrada("hueco", 61, 19, -1)
	_atrezo([["muro-dientes", 200, 304], ["candelabro", 264, 304], ["candelabro", 850, 304]])
	_ambiente([[140, 32, 70], [960, 32, 70]], [[32, 304, 1000]])
	return {"nombre": "muro", "ancho": 70, "alto": 23}


## 7 · La Escalera de los Ciegos: dos escaleras que bajan a un rellano, con el
## Altar, el Cegado y la puerta a los Pasillos. Se llega por arriba, por la
## Capilla o por el Muro; se vuelve saltando por los mismos huecos.
func _escalera() -> Dictionary:
	_empezar("Escalera", 60, 34)
	_piedra([[0, 0, 4, 2], [8, 0, 44, 2], [56, 0, 4, 2], [0, 0, 2, 34], [58, 0, 2, 34], [0, 30, 60, 4]])
	# Los rellanos de llegada y los escalones, macizos hasta el suelo.
	_piedra([[2, 9, 8, 21], [50, 9, 8, 21]])
	for i in 6:
		var fila := 12 + i * 3
		_piedra([[10 + i * 2, fila, 2, 30 - fila], [48 - i * 2, fila, 2, 30 - fila]])
	_altar("Escalera", 25, 30)
	_puerta(30, 30)
	_paso("Puerta", 29, 27, 2, 3, "umbral", "oeste", true, "E  entrar")
	# Los huecos de arriba: se cae desde ellos y se vuelve saltando a ellos.
	_paso("Noroeste", 4, 0, 4, 4, "capilla", "hueco")
	_paso("Noreste", 52, 0, 4, 4, "muro", "hueco")
	_entrada("noroeste", 6, 7, 1)
	_entrada("noreste", 54, 7, -1)
	_entrada("puerta", 30, 30, -1)
	var cegado: Node2D = load("res://escenas/cegado.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	cegado.position = _pie(35, 30)
	_poner(cegado, "Charlas")
	_cirujano(6, 9)
	_atrezo([["candelabro", 376, 480], ["candelabro", 440, 480], ["candelabro", 600, 480], ["hongos", 100, 144], ["hongos", 860, 144]])
	_ambiente([[480, 32, 140]], [[352, 480, 256]])
	return {"nombre": "escalera", "ancho": 60, "alto": 34}


## 8 · El Umbral de los Pasillos: el final del Nivel I. Una sierra en el
## suelo, un hueco al vacio con otra que sube y baja, y la puerta grande;
## detras empiezan los Pasillos (#190).
func _umbral() -> Dictionary:
	_empezar("Umbral", 40, 23)
	_piedra([[0, 0, 40, 2], [0, 0, 2, 23], [38, 0, 2, 23], [0, 19, 18, 4], [23, 19, 17, 4]])
	_sierra(8, 19, Vector2(128, 0), 0.0, -2.0)
	# El hueco al vacio, con una sierra que sube y baja por el.
	_sierra(20, 18, Vector2(0, -96), 0.5)
	_puerta(4, 19)
	_paso("Vuelta", 3, 16, 2, 3, "escalera", "puerta", true, "E  subir")
	_puerta(32, 19)
	_paso("Pasillos", 31, 16, 2, 3, "res://escenas/nivel2/registro.tscn", "oeste", true, "E  entrar")
	_entrada("oeste", 6, 19, 1)
	_entrada("pasillos", 32, 19, -1)
	_cirujano(6, 19)
	_atrezo([["candelabro", 472, 304], ["candelabro", 568, 304]])
	_ambiente([[320, 32, 100]], [[32, 304, 576]])
	return {"nombre": "umbral", "ancho": 40, "alto": 23}


# --- Las piezas ---------------------------------------------------------------


func _empezar(nombre: String, ancho: int, alto: int) -> void:
	_raiz = Node2D.new()
	_raiz.name = nombre
	_raiz.set_script(load("res://scripts/sala.gd"))
	_raiz.set("limite_caida", alto * 16.0 + 120.0)
	var telon := CanvasLayer.new()
	telon.set_script(load("res://scripts/telon.gd"))
	_poner(telon, "", "Telon")
	var nave := Node2D.new()
	nave.set_script(load("res://scripts/nave.gd"))
	_poner(nave, "", "Nave")
	_silleria = TileMapLayer.new()
	_silleria.tile_set = SILLERIA
	_silleria.set_script(load("res://scripts/silleria.gd"))
	_poner(_silleria, "", "Silleria")
	_membranas = TileMapLayer.new()
	_membranas.tile_set = MEMBRANA
	_membranas.add_to_group("clavable", true)
	_poner(_membranas, "", "Membranas")
	for grupo in ["Atrezo", "Ambiente", "Temblor", "Devotos", "Vestales", "Altares", "Muros", "Peligros", "Notas", "Charlas", "Reliquias", "Visiones", "Carteles", "Pasos", "Entradas"]:
		var nodo := Node2D.new()
		match grupo:
			"Atrezo":
				nodo.set_script(load("res://scripts/atrezo.gd"))
			"Ambiente":
				nodo.set_script(load("res://scripts/ambiente.gd"))
			"Temblor":
				nodo.set_script(load("res://scripts/temblor.gd"))
		_poner(nodo, "", grupo)
	_raiz.get_node("Ambiente").set("silleria", NodePath("../Silleria"))
	_raiz.set_meta("tamano", Vector2i(ancho, alto))


## Lo que va encima de todo: el Cirujano con su camara, la vineta, la
## interfaz, la penumbra y el polvo. Al final, para que tape lo demas.
func _cerrar(ancho: int, alto: int) -> void:
	var camara := Camera2D.new()
	camara.name = "Camara"
	camara.limit_left = 0
	camara.limit_top = 0
	camara.limit_right = ancho * 16
	camara.limit_bottom = alto * 16
	camara.position_smoothing_enabled = true
	camara.position_smoothing_speed = 7.2
	camara.drag_horizontal_enabled = true
	camara.drag_vertical_enabled = true
	for margen in ["drag_left_margin", "drag_top_margin", "drag_right_margin", "drag_bottom_margin"]:
		camara.set(margen, 0.125)
	_raiz.get_node("Cirujano").add_child(camara)
	camara.owner = _raiz
	var vineta := CanvasLayer.new()
	_poner(vineta, "", "Vineta")
	var velo := ColorRect.new()
	velo.name = "Velo"
	var material := ShaderMaterial.new()
	material.shader = VINETA
	velo.material = material
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	velo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_poner(velo, "Vineta")
	var interfaz: CanvasLayer = load("res://escenas/interfaz.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	_poner(interfaz, "", "Interfaz")
	var penumbra := CanvasModulate.new()
	penumbra.color = Color(0.74, 0.7, 0.74)
	_poner(penumbra, "", "Penumbra")
	var polvo := CanvasLayer.new()
	polvo.layer = -1
	_poner(polvo, "", "Polvo")
	var motas := CPUParticles2D.new()
	motas.name = "Motas"
	motas.position = Vector2(320, 180)
	motas.amount = 34
	motas.lifetime = 9.0
	motas.preprocess = 9.0
	motas.lifetime_randomness = 0.4
	motas.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	motas.emission_rect_extents = Vector2(320, 180)
	motas.direction = Vector2(0, 1)
	motas.spread = 40.0
	motas.gravity = Vector2.ZERO
	motas.initial_velocity_min = 2.0
	motas.initial_velocity_max = 9.0
	var rampa := Gradient.new()
	rampa.offsets = PackedFloat32Array([0.0, 0.5, 1.0])
	rampa.colors = PackedColorArray([Color(0.79, 0.71, 0.54, 0), Color(0.79, 0.71, 0.54, 0.35), Color(0.79, 0.71, 0.54, 0)])
	motas.color_ramp = rampa
	_poner(motas, "Polvo")


func _poner(nodo: Node, padre: String, nombre := "") -> void:
	if nombre != "":
		nodo.name = nombre
	var donde: Node = _raiz if padre == "" else _raiz.get_node(padre)
	donde.add_child(nodo, true)
	nodo.owner = _raiz


func _piedra(rects: Array) -> void:
	for r in rects:
		for x in range(r[0], r[0] + r[2]):
			for y in range(r[1], r[1] + r[3]):
				_silleria.set_cell(Vector2i(x, y), 0, Vector2i.ZERO)


## La membrana va en su capa y quita la piedra que hubiera debajo.
func _membrana(rects: Array) -> void:
	for r in rects:
		for x in range(r[0], r[0] + r[2]):
			for y in range(r[1], r[1] + r[3]):
				_silleria.erase_cell(Vector2i(x, y))
				_membranas.set_cell(Vector2i(x, y), 0, Vector2i.ZERO)


## Los pies sobre el suelo de la fila `fila`, en el centro de la columna.
func _pie(columna: int, fila: int) -> Vector2:
	return Vector2(columna * 16 + 8, fila * 16)


func _cirujano(columna: int, fila: int) -> void:
	var cirujano: Node2D = load("res://escenas/cirujano.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	cirujano.position = _pie(columna, fila)
	_poner(cirujano, "", "Cirujano")


func _altar(nombre: String, columna: int, fila: int) -> void:
	var altar: Node2D = load("res://escenas/altar.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	altar.position = _pie(columna, fila)
	_poner(altar, "Altares", nombre)


## Con su ronda, en x del mundo: nunca hasta un hueco ni hasta una entrada.
func _devoto(columna: int, fila: int, desde: float, hasta: float) -> void:
	var devoto: Node2D = load("res://escenas/devoto.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	devoto.position = _pie(columna, fila)
	devoto.set("ronda_izquierda", desde)
	devoto.set("ronda_derecha", hasta)
	_poner(devoto, "Devotos", "Devoto")


func _vestal(columna: int, fila: int, desde: float, hasta: float) -> void:
	var vestal: Node2D = load("res://escenas/vestal.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	vestal.position = _pie(columna, fila)
	vestal.set("ronda_izquierda", desde)
	vestal.set("ronda_derecha", hasta)
	_poner(vestal, "Vestales", "Vestal")


func _nota(id: String, columna: int, fila: int, titulo: String, texto: String) -> void:
	var nota: Node2D = load("res://escenas/nota.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	nota.position = _pie(columna, fila)
	nota.set("id", id)
	nota.set("titulo", titulo)
	nota.set("texto", texto)
	_poner(nota, "Notas", id.to_pascal_case())


## Una sierra con el centro sobre el suelo de la fila (medio hundida), mas
## `alto` px; con `recorrido`, en un rail.
func _sierra(columna: int, fila: int, recorrido: Vector2, desfase := 0.0, alto := 0.0) -> void:
	var sierra := Node2D.new()
	sierra.set_script(load("res://scripts/sierra.gd"))
	sierra.position = _pie(columna, fila) + Vector2(0, alto)
	sierra.set("recorrido", recorrido)
	sierra.set("desfase", desfase)
	_poner(sierra, "Peligros", "Sierra")


## Un techo que baja hasta el suelo del pasillo (aplasta): 3x2 tiles.
func _techo_que_baja(columna: int, fila: int, desfase_ms: float) -> void:
	var muro := AnimatableBody2D.new()
	muro.set_script(load("res://scripts/muro.gd"))
	muro.position = Vector2(columna * 16, fila * 16)
	muro.set("tiles", Vector2i(3, 2))
	muro.set("direccion", Vector2(0, 1))
	muro.set("recorrido", 64.0)
	muro.set("desfase_ms", desfase_ms)
	_poner(muro, "Muros", "Techo")


## Un cartel de controles (#221) de pie en el suelo de la fila.
func _cartel(id: String, columna: int, fila: int, texto: String, aprende: String, despues_de := "") -> void:
	var cartel := Node2D.new()
	cartel.set_script(load("res://scripts/cartel.gd"))
	cartel.position = _pie(columna, fila)
	cartel.set("id", id)
	cartel.set("texto", texto)
	cartel.set("aprende", aprende)
	cartel.set("despues_de", despues_de)
	_poner(cartel, "Carteles", id.to_pascal_case())


## Un paso a otra sala: la zona en tiles. Destino vacio: el final del nivel.
## El destino es el nombre de una sala de este nivel o una ruta entera (res://)
## de otro. Devuelve el paso, para pedirle algo (pide_objetivo, abre...).
func _paso(nombre: String, columna: int, fila: int, ancho: int, alto: int, destino: String, entrada: String, con_e := false, aviso := "E  descender") -> Node2D:
	var paso := Node2D.new()
	paso.set_script(load("res://scripts/paso.gd"))
	paso.position = Vector2(columna * 16, fila * 16)
	paso.set("zona", Vector2(ancho * 16, alto * 16))
	if destino == "" or destino.begins_with("res://"):
		paso.set("destino", destino)
	else:
		paso.set("destino", dir + destino + ".tscn")
	paso.set("entrada", entrada)
	paso.set("con_e", con_e)
	paso.set("aviso", aviso)
	_poner(paso, "Pasos", nombre)
	return paso


## Por donde se aparece al venir de otra sala, y hacia donde mira.
func _entrada(nombre: String, columna: int, fila: int, mirando: int) -> void:
	var marca := Marker2D.new()
	marca.position = _pie(columna, fila)
	marca.set_meta("mirando", mirando)
	_poner(marca, "Entradas", nombre)


## El umbral de una puerta (arte provisional), de pie en el suelo de la fila.
func _puerta(columna: int, fila: int) -> void:
	var sprite := Sprite2D.new()
	sprite.texture = UMBRAL
	sprite.centered = false
	sprite.offset = Vector2(-10, -34)
	sprite.position = _pie(columna, fila)
	sprite.z_index = -1
	_poner(sprite, "", "Puerta")


func _atrezo(piezas: Array) -> void:
	_raiz.get_node("Atrezo").set("piezas", piezas)


func _ambiente(cadenas: Array, nieblas: Array) -> void:
	var ambiente := _raiz.get_node("Ambiente")
	ambiente.set("cadenas", cadenas)
	ambiente.set("nieblas", nieblas)


func _guardar(sala: Dictionary) -> int:
	_cerrar(sala["ancho"], sala["alto"])
	var escena := PackedScene.new()
	var error := escena.pack(_raiz)
	if error == OK:
		error = ResourceSaver.save(escena, dir + sala["nombre"] + ".tscn")
	print("%s: %d tiles, %s" % [sala["nombre"], _silleria.get_used_cells().size(), error_string(error)])
	_raiz.free()
	_raiz = null
	return 0 if error == OK else 1
