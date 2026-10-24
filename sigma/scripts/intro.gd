## La escena inicial: el contexto, en planos fijos con un texto corto y
## movimiento lento, como las de Blasphemous. Sale del canon de Sigma
## (docs/canon.md): un dios nuevo que no llega, la duda en la Sala N.º 7, el
## hambre y las paredes que se mueven. Se salta con cualquier boton.
##
## Los planos se montan aqui, con el arte que ya hay (el Cirujano, los fondos,
## el atrezo del original): no hay ilustraciones aparte que mantener.
extends Node2D

const SIGUIENTE := "res://escenas/nivel1/pabellon.tscn"
const Sonidos := preload("res://scripts/sonidos.gd")
const FONDO := Color(0.04, 0.03, 0.04)
const TEXTO := Color(0.85, 0.8, 0.72)
const TITULO := Color(0.62, 0.17, 0.15)
## Lo que tarda en escribirse cada letra, y lo que se queda la frase entera.
const LETRA_S := 0.035
const LECTURA_S := 1.8
## Las fuentes: Jacquard, pixel gotica (SIL OFL, arte/fuentes/OFL.txt).
const FUENTE_TITULO := preload("res://arte/fuentes/Jacquard12-Regular.ttf")

var _plano: Node2D
var _texto: Label
var _cortina: ColorRect
var _hecho := false


func _ready() -> void:
	RenderingServer.set_default_clear_color(FONDO)
	var capa := CanvasLayer.new()
	capa.layer = 10
	add_child(capa)
	_cortina = ColorRect.new()
	_cortina.color = FONDO
	_cortina.set_anchors_preset(Control.PRESET_FULL_RECT)
	_cortina.mouse_filter = Control.MOUSE_FILTER_IGNORE
	capa.add_child(_cortina)
	_texto = Label.new()
	_texto.anchor_right = 1.0
	_texto.anchor_top = 1.0
	_texto.anchor_bottom = 1.0
	# La narracion en la letra legible (VT323) a 32 px, el doble de su tamano:
	# nitida y con presencia. En gotica no se entendia (feedback de Jean). Las
	# frases largas parten en dos lineas.
	_texto.offset_left = 24.0
	_texto.offset_right = -24.0
	_texto.offset_top = -104.0
	_texto.offset_bottom = -24.0
	_texto.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_texto.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_texto.add_theme_font_size_override("font_size", 32)
	_texto.add_theme_color_override("font_color", TEXTO)
	_texto.add_theme_color_override("font_outline_color", FONDO)
	_texto.add_theme_constant_override("outline_size", 4)
	capa.add_child(_texto)
	var salto := Label.new()
	salto.text = "Espacio: saltar"
	salto.anchor_left = 1.0
	salto.anchor_right = 1.0
	salto.offset_left = -110.0
	salto.offset_right = -8.0
	salto.offset_top = 6.0
	salto.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	salto.add_theme_color_override("font_color", Color(0.45, 0.4, 0.38))
	capa.add_child(salto)
	var musica := get_node_or_null("/root/Musica")
	if musica:
		musica.poner("portada-arcanos")
	_secuencia()


func _unhandled_input(evento: InputEvent) -> void:
	for accion in ["saltar", "interactuar", "pausa", "golpear"]:
		if evento.is_action_pressed(accion):
			_ir()


func _secuencia() -> void:
	for plano in [_vidriera, _sala_siete, _manos, _rostro, _pabellon, _paredes, _titulo]:
		if _hecho:
			return
		await plano.call()
	_ir()


func _ir() -> void:
	if _hecho:
		return
	_hecho = true
	RenderingServer.set_default_clear_color(Color(0.0784, 0.0627, 0.0784))
	get_tree().change_scene_to_file(SIGUIENTE)


# -- Los planos ---------------------------------------------------------------

## La vidriera, de lejos, bajando despacio: el sitio.
func _vidriera() -> void:
	_nuevo_plano()
	var lejos := _sprite("res://arte/fondos/vidriera.png", Vector2(0, -40), Vector2.ONE, Color(0.8, 0.75, 0.8))
	var boveda := _sprite("res://arte/fondos/boveda.png", Vector2(-80, -60), Vector2.ONE)
	_mover(lejos, Vector2(0, -10), 7.0)
	_mover(boveda, Vector2(-40, -10), 7.0)
	await _abrir()
	await _decir("Hace tres generaciones que no aparece un dios nuevo.")
	await _decir("El Vientre los venera igual.")
	await _cerrar()


## La Sala N.º 7: el Cirujano ante la camilla, con el bisturi en alto. Lo baja.
func _sala_siete() -> void:
	_nuevo_plano()
	_sprite("res://arte/fondos/columnas.png", Vector2(-40, -140), Vector2.ONE, Color(0.55, 0.5, 0.55))
	_suelo(268)
	var camilla := _sprite("res://arte/provisional/camilla.png", Vector2(300, 232), Vector2(3, 3))
	# Un cuerpo bajo la sabana: no se sabe quien es.
	var sabana := Polygon2D.new()
	sabana.color = Color(0.72, 0.66, 0.57)
	sabana.polygon = PackedVector2Array([
		Vector2(306, 232), Vector2(316, 220), Vector2(340, 218), Vector2(362, 222),
		Vector2(378, 216), Vector2(392, 224), Vector2(394, 232),
	])
	_plano.add_child(sabana)
	_sprite("res://arte/provisional/vela.png", Vector2(420, 218), Vector2(2, 2))
	_luz(Vector2(425, 220), Color(1, 0.7, 0.4), 1.1)
	var cirujano := _sprite("res://arte/cirujano/alza-1.png", Vector2(194, 152), Vector2(2, 2))
	await _abrir()
	await _decir("En la Sala N.º 7, las Manos del Sacramento operan sin mirar.")
	await _cerrar()
	camilla.queue_free()
	cirujano.queue_free()


## Primer plano: las manos con el bisturi sobre la sabana. Una ilustracion
## (scripts/cinematica-sigma.mjs), con mas detalle que el juego, como las
## escenas de Blasphemous; las de Mariana la sustituyen con el mismo nombre.
func _manos() -> void:
	_nuevo_plano()
	var manos := _ilustracion("res://arte/cinematica/manos.png", Vector2(-24, -10), 4.0)
	_luz(Vector2(600, 90), Color(1, 0.7, 0.4), 0.9)
	await _abrir()
	# El bisturi se detiene sobre la sabana: un instante sin texto.
	await get_tree().create_timer(2.2).timeout
	await _cerrar()
	manos.queue_free()


## Primer plano: el rostro vendado. Aqui duda: «Hoy miro».
func _rostro() -> void:
	_nuevo_plano()
	var rostro := _ilustracion("res://arte/cinematica/rostro.png", Vector2(28, -14), 8.0)
	_luz(Vector2(600, 150), Color(1, 0.68, 0.38), 1.0)
	await _abrir()
	await _decir("Hoy miró.")
	# La ley de la Mano que mira (canon, «Por que lo atacan»): sin esto, que lo
	# persigan los suyos no se entiende.
	await _decir("La ley es antigua: la Mano que mira, se corta.")
	await _cerrar()
	rostro.queue_free()


## El pabellon: la bandeja del diezmo, vacia.
func _pabellon() -> void:
	_nuevo_plano()
	_suelo(250)
	var bandeja := _sprite("res://arte/provisional/bandeja.png", Vector2(272, 196), Vector2(6, 6))
	_luz(Vector2(320, 210), Color(0.9, 0.55, 0.4), 0.9)
	var carne := _sprite("res://arte/provisional/carne.png", Vector2(300, 178), Vector2(4, 4))
	await _abrir()
	# Lo ultimo que quedaba se va.
	var irse := carne.create_tween()
	irse.tween_property(carne, "modulate:a", 0.0, 2.5)
	await _decir("Desde entonces, la carne no llega a los pabellones.")
	await _cerrar()
	bandeja.queue_free()


## Las paredes: dos muros que avanzan con el temblor.
func _paredes() -> void:
	_nuevo_plano()
	_sprite("res://arte/fondos/columnas.png", Vector2(120, -200), Vector2.ONE, Color(0.7, 0.65, 0.7))
	var izquierda := _muro(Vector2(-60, 0))
	var derecha := _muro(Vector2(460, 0))
	await _abrir()
	var sonido := AudioStreamPlayer.new()
	sonido.stream = Sonidos.retumbo()
	add_child(sonido)
	sonido.play()
	_mover(izquierda, Vector2(70, 0), 2.2)
	_mover(derecha, Vector2(-70, 0), 2.2)
	_temblar(2.2)
	await _decir("Y las paredes, quietas desde hace milenios, se mueven.")
	await _cerrar()


func _titulo() -> void:
	_nuevo_plano()
	var titulo := Label.new()
	# En gotica, las mayusculas seguidas no se leen: va en minusculas.
	titulo.text = "Subterfuge Sigma"
	titulo.position = Vector2(0, 140)
	titulo.size = Vector2(640, 32)
	titulo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	titulo.add_theme_color_override("font_color", TITULO)
	titulo.add_theme_font_override("font", FUENTE_TITULO)
	titulo.add_theme_font_size_override("font_size", 24)
	_plano.add_child(titulo)
	await _abrir()
	await _decir("El templo se está compactando.")
	await _cerrar()


# -- Herramientas -------------------------------------------------------------

func _nuevo_plano() -> void:
	if _plano:
		_plano.queue_free()
	_plano = Node2D.new()
	add_child(_plano)
	var penumbra := CanvasModulate.new()
	penumbra.color = Color(0.7, 0.66, 0.7)
	_plano.add_child(penumbra)
	_texto.text = ""


func _sprite(ruta: String, sitio: Vector2, escala: Vector2, tinte := Color.WHITE) -> Sprite2D:
	var sprite := Sprite2D.new()
	sprite.texture = load(ruta)
	sprite.centered = false
	sprite.position = sitio
	sprite.scale = escala
	sprite.modulate = tinte
	_plano.add_child(sprite)
	return sprite


## Una lamina a pantalla completa (algo mayor que la pantalla) que se desplaza
## despacio `deriva` px en `segundos`, empezando en el lado contrario. Se panea,
## no se hace zoom: un zoom que no sea entero deforma los pixeles.
func _ilustracion(ruta: String, deriva: Vector2, segundos: float) -> Sprite2D:
	var lamina := Sprite2D.new()
	lamina.texture = load(ruta)
	lamina.position = Vector2(320, 180) - deriva / 2.0
	_plano.add_child(lamina)
	var panear := lamina.create_tween()
	panear.tween_property(lamina, "position", lamina.position + deriva, segundos).set_trans(Tween.TRANS_SINE)
	return lamina


func _suelo(y: float) -> void:
	var suelo := ColorRect.new()
	suelo.color = Color(0.13, 0.09, 0.1)
	suelo.position = Vector2(0, y)
	suelo.size = Vector2(640, 360 - y)
	_plano.add_child(suelo)


## Un muro de la silleria de Sigma, vestido como los del juego.
func _muro(sitio: Vector2) -> Node2D:
	var muro := TileMapLayer.new()
	muro.tile_set = preload("res://arte/silleria/vientre.tres")
	muro.collision_enabled = false
	for x in 15:
		for y in 23:
			muro.set_cell(Vector2i(x, y), 0, Vector2i.ZERO)
	preload("res://scripts/silleria.gd").vestir(muro)
	muro.position = sitio
	muro.modulate = Color(0.75, 0.66, 0.66)
	_plano.add_child(muro)
	return muro


func _luz(sitio: Vector2, color: Color, energia: float) -> void:
	var gradiente := Gradient.new()
	gradiente.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0)])
	var textura := GradientTexture2D.new()
	textura.gradient = gradiente
	textura.width = 256
	textura.height = 256
	textura.fill = GradientTexture2D.FILL_RADIAL
	textura.fill_from = Vector2(0.5, 0.5)
	textura.fill_to = Vector2(1, 0.5)
	var luz := PointLight2D.new()
	luz.texture = textura
	luz.position = sitio
	luz.color = color
	luz.energy = energia
	_plano.add_child(luz)


func _mover(nodo: Node2D, cuanto: Vector2, segundos: float) -> void:
	var movimiento := nodo.create_tween()
	movimiento.tween_property(nodo, "position", nodo.position + cuanto, segundos).set_trans(Tween.TRANS_SINE)


func _temblar(segundos: float) -> void:
	var temblor := _plano.create_tween()
	for i in int(segundos / 0.05):
		temblor.tween_property(_plano, "position", Vector2(randf_range(-2, 2), randf_range(-1.5, 1.5)), 0.05)
	temblor.tween_property(_plano, "position", Vector2.ZERO, 0.05)


func _abrir() -> void:
	var abrir := create_tween()
	abrir.tween_property(_cortina, "modulate:a", 0.0, 0.9)
	await abrir.finished


func _cerrar() -> void:
	var cerrar := create_tween()
	cerrar.tween_property(_cortina, "modulate:a", 1.0, 0.8)
	await cerrar.finished


## Escribe la frase letra a letra y la deja leer.
func _decir(frase: String) -> void:
	_texto.text = frase
	_texto.visible_ratio = 0.0
	var escribir := create_tween()
	escribir.tween_property(_texto, "visible_ratio", 1.0, frase.length() * LETRA_S)
	await escribir.finished
	await get_tree().create_timer(LECTURA_S).timeout
