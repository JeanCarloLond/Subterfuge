## La interfaz de las salas, ornamentada como la de Blasphemous
## (scripts/hud-sigma.mjs): arriba a la izquierda, el medallon con el rostro
## del Cirujano, la vida en seis segmentos de sangre, el Fervor en ambar y los
## frascos de Pocion. Los avisos, en el centro; la ayuda de los controles,
## abajo, plegada: con H se abre y se cierra (el texto fijo en pantalla
## estorbaba y no se leia), y con ella el objetivo. El objetivo nuevo entra
## arriba a la derecha, se queda un momento y se va (#215). Los dialogos, a lo
## Stardew Valley (#216): una caja abajo con el retrato y el nombre de quien
## habla, y el texto que se escribe letra a letra. Todo en la letra legible del tema (arte/tema.tres).
## Cada sala la conecta a su Cirujano y pone su propia ayuda.
extends CanvasLayer

const Sacramento := preload("res://scripts/sacramento.gd")
const Objetivos := preload("res://scripts/objetivos.gd")
const Dialogo := preload("res://scripts/dialogo.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const ORO := Color(0.89, 0.663, 0.251)
## Cada cuantas letras suena la voz: en todas, ametralla.
const VOZ_CADA := 2
const FRASCO_LLENO := preload("res://arte/hud/frasco-lleno.png")
const FRASCO_VACIO := preload("res://arte/hud/frasco-vacio.png")
## Lo que dura un aviso en pantalla.
const AVISO_S := 2.5
## Lo que se ve con la ayuda plegada.
const AYUDA_PLEGADA := "H  controles y objetivo"
## Lo que se queda en pantalla un objetivo nuevo, entre entrar y salir.
const OBJETIVO_S := 4.5
## El aviso de la muerte, a lo Dark Souls pero con el mundo: en la Diocesis el
## diezmo es la carne que se cobra a cada casa, y morir es pagar el tuyo.
const TEXTO_MUERTE := "Diezmado"
const FUENTE_MUERTE := preload("res://arte/fuentes/Jacquard12-Regular.ttf")
const COLOR_MUERTE := Color(0.66, 0.1, 0.09)

@export_multiline var ayuda := "":
	set(valor):
		ayuda = valor
		if is_node_ready():
			_pintar_ayuda()

var _ayuda_abierta := false
var _velo: ColorRect
var _banda: ColorRect
var _muerte: Label
var _lectura: PanelContainer
var _lectura_titulo: Label
var _lectura_texto: Label
var _objetivo: VBoxContainer
var _objetivo_texto: Label
var _objetivo_tween: Tween
var _dialogo: Dialogo
var _al_terminar := Callable()
var _retratos := {}
var _caja: Control
var _caja_texto: Label
var _caja_retrato: TextureRect
var _caja_nombre: Label
var _caja_flecha: Polygon2D
var _voz: AudioStreamPlayer
var _voces: Array[AudioStream] = []
var _letras := 0
## El fotograma en que se cerro una lectura o un dialogo (ver _soltar_e).
var _cerrado_en := -1

@onready var _ayuda: Label = $Ayuda
@onready var _vida: TextureProgressBar = $Vida
@onready var _fervor: TextureProgressBar = $Fervor
@onready var _frascos: HBoxContainer = $Frascos
@onready var _medallon: TextureRect = $Medallon
@onready var _aviso: Label = $Aviso


func _ready() -> void:
	# La lectura para el juego, y la interfaz tiene que seguir oyendo la E.
	process_mode = Node.PROCESS_MODE_ALWAYS
	_pintar_ayuda()
	_preparar_muerte()
	_preparar_lectura()
	_preparar_objetivo()
	_preparar_caja()
	var progreso := _progreso()
	if progreso:
		progreso.objetivo_cambio.connect(mostrar_objetivo)


func _unhandled_input(evento: InputEvent) -> void:
	if _dialogo:
		if evento.is_action_pressed("interactuar"):
			if _dialogo.pulsar():
				_cerrar_dialogo()
			else:
				_pintar_dialogo()
		get_viewport().set_input_as_handled()
		return
	if _lectura.visible:
		if evento.is_action_pressed("interactuar") or evento.is_action_pressed("pausa"):
			_lectura.visible = false
			get_tree().paused = false
			_soltar_e()
			get_viewport().set_input_as_handled()
		return
	if evento.is_action_pressed("ayuda"):
		_ayuda_abierta = not _ayuda_abierta
		_pintar_ayuda()


func _process(delta: float) -> void:
	if _dialogo == null:
		return
	var nuevas := _dialogo.paso(delta)
	if nuevas > 0:
		var antes := _letras
		_letras += nuevas
		var letra := _dialogo.texto_visible().right(1)
		if _letras / VOZ_CADA != antes / VOZ_CADA and letra.strip_edges() != "":
			_voz.stream = _voces[randi() % _voces.size()]
			_voz.pitch_scale = randf_range(0.94, 1.06)
			_voz.play()
		_pintar_dialogo()
	# La flecha de «hay mas» respira cuando la linea esta entera.
	_caja_flecha.position.y = _caja_flecha.get_meta("y") + roundf(sin(Time.get_ticks_msec() / 160.0) * 1.5)


## Habla alguien: `lineas` son [{quien, texto}], `retratos` da el retrato de
## cada quien (si no hay, solo el nombre). El juego se para hasta el final, y
## entonces se llama a `al_terminar`.
func hablar(lineas: Array, retratos: Dictionary, al_terminar := Callable()) -> void:
	if _recien_cerrado():
		return
	_dialogo = Dialogo.new(lineas)
	_retratos = retratos
	_al_terminar = al_terminar
	_letras = 0
	_caja.visible = true
	get_tree().paused = true
	_pintar_dialogo()


func hablando() -> bool:
	return _dialogo != null


func _cerrar_dialogo() -> void:
	_dialogo = null
	_caja.visible = false
	get_tree().paused = false
	_soltar_e()
	if _al_terminar.is_valid():
		_al_terminar.call()


## La E que cierra no puede abrir otra vez: lo que se lee o con quien se habla
## mira la E en su _process, en este mismo fotograma y con el juego ya en
## marcha, y la ve recien pulsada (soltarla no basta: Godot la sigue dando por
## pulsada en ese fotograma). Se apunta el fotograma y en el no se abre nada.
func _soltar_e() -> void:
	_cerrado_en = Engine.get_process_frames()


func _recien_cerrado() -> bool:
	return _cerrado_en == Engine.get_process_frames()


func _pintar_dialogo() -> void:
	var quien := _dialogo.quien()
	_caja_texto.text = _dialogo.texto_visible()
	_caja_nombre.text = quien
	_caja_retrato.texture = _retratos.get(quien)
	_caja_flecha.visible = _dialogo.linea_completa()


## La caja: el texto a la izquierda y, a la derecha, el retrato en su marco con
## el nombre en una placa debajo, como en Stardew Valley. Oro viejo sobre
## negro, como el resto de la interfaz.
func _preparar_caja() -> void:
	_caja = Control.new()
	_caja.name = "Dialogo"
	_caja.set_anchors_preset(Control.PRESET_FULL_RECT)
	_caja.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var texto := _panel(Rect2(16, 222, 472, 128))
	var retrato := _panel(Rect2(496, 222, 128, 128))
	_caja_texto = Label.new()
	_caja_texto.position = Vector2(14, 10)
	_caja_texto.size = Vector2(444, 108)
	_caja_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_caja_texto.add_theme_font_size_override("font_size", 20)
	texto.add_child(_caja_texto)
	_caja_flecha = Polygon2D.new()
	_caja_flecha.polygon = PackedVector2Array([Vector2(-5, 0), Vector2(5, 0), Vector2(0, 6)])
	_caja_flecha.color = ORO
	_caja_flecha.position = Vector2(456, 112)
	_caja_flecha.set_meta("y", 112.0)
	texto.add_child(_caja_flecha)
	_caja_retrato = TextureRect.new()
	_caja_retrato.position = Vector2(16, 6)
	_caja_retrato.size = Vector2(96, 96)
	_caja_retrato.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_caja_retrato.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_caja_retrato.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	retrato.add_child(_caja_retrato)
	var placa := ColorRect.new()
	placa.color = Color(0.16, 0.1, 0.07)
	placa.position = Vector2(6, 104)
	placa.size = Vector2(116, 18)
	retrato.add_child(placa)
	_caja_nombre = Label.new()
	_caja_nombre.position = Vector2(0, -2)
	_caja_nombre.size = Vector2(116, 20)
	_caja_nombre.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_caja_nombre.add_theme_color_override("font_color", ORO)
	placa.add_child(_caja_nombre)
	_caja.add_child(texto)
	_caja.add_child(retrato)
	_caja.visible = false
	add_child(_caja)
	_voz = AudioStreamPlayer.new()
	_voz.volume_db = -14.0
	add_child(_voz)
	# Dos tonos, para que no suene a maquina.
	_voces = [Sonidos.voz(330.0), Sonidos.voz(370.0)]


## Un panel de la caja: fondo casi negro, doble filete de oro.
func _panel(rect: Rect2) -> Panel:
	var panel := Panel.new()
	panel.position = rect.position
	panel.size = rect.size
	var estilo := StyleBoxFlat.new()
	estilo.bg_color = Color(0.06, 0.04, 0.045, 0.96)
	estilo.border_color = ORO.darkened(0.25)
	estilo.set_border_width_all(2)
	estilo.shadow_color = Color(0, 0, 0, 0.5)
	estilo.shadow_size = 4
	panel.add_theme_stylebox_override("panel", estilo)
	# El filete de dentro: oxido, a dos pixeles del de fuera.
	var filete := ReferenceRect.new()
	filete.border_color = Color(0.48, 0.23, 0.12)
	filete.editor_only = false
	filete.position = Vector2(4, 4)
	filete.size = rect.size - Vector2(8, 8)
	filete.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(filete)
	return panel


func _pintar_ayuda() -> void:
	if not _ayuda_abierta:
		_ayuda.text = AYUDA_PLEGADA
		return
	var progreso := _progreso()
	var objetivo: String = progreso.texto_objetivo() if progreso else ""
	_ayuda.text = ayuda if objetivo == "" else "Objetivo: %s
%s" % [objetivo, ayuda]


func _progreso() -> Node:
	return get_node_or_null("/root/Progreso")


## El objetivo `id` (nuevo, o su cuenta que avanza): entra arriba a la
## derecha con una campana, se queda y se va. En su color: el de la nina es
## otro.
func mostrar_objetivo(id: String) -> void:
	var progreso := _progreso()
	if progreso == null or progreso.objetivo != id:
		return
	_objetivo_texto.text = progreso.texto_objetivo()
	_objetivo_texto.add_theme_color_override("font_color", Objetivos.color(id))
	if _ayuda_abierta:
		_pintar_ayuda()
	var efectos := get_node_or_null("/root/Efectos")
	if efectos:
		efectos.sonar("campana")
	if _objetivo_tween:
		_objetivo_tween.kill()
	# El ancho del texto nuevo, ya: si no, llega al fotograma siguiente.
	_objetivo.reset_size()
	_objetivo.visible = true
	_objetivo.modulate.a = 0.0
	_objetivo.position.x = _objetivo_x() + 24.0
	_objetivo_tween = create_tween()
	_objetivo_tween.tween_property(_objetivo, "modulate:a", 1.0, 0.5)
	_objetivo_tween.parallel().tween_property(_objetivo, "position:x", _objetivo_x(), 0.5).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
	_objetivo_tween.tween_interval(OBJETIVO_S)
	_objetivo_tween.tween_property(_objetivo, "modulate:a", 0.0, 0.9)
	_objetivo_tween.tween_callback(func() -> void: _objetivo.visible = false)


## Donde se queda el aviso del objetivo: pegado al borde derecho.
func _objetivo_x() -> float:
	return get_viewport().get_visible_rect().size.x - _objetivo.size.x - 14.0


func _preparar_objetivo() -> void:
	_objetivo = VBoxContainer.new()
	_objetivo.name = "Objetivo"
	_objetivo.add_theme_constant_override("separation", 0)
	_objetivo.position = Vector2(0, 12)
	var cabecera := Label.new()
	cabecera.text = "Objetivo"
	cabecera.add_theme_color_override("font_color", Color(0.6, 0.55, 0.5))
	cabecera.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_objetivo_texto = Label.new()
	_objetivo_texto.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_objetivo.add_child(cabecera)
	_objetivo.add_child(_objetivo_texto)
	_objetivo.visible = false
	add_child(_objetivo)
	# Al cambiar de texto cambia de ancho: que siga pegado a la derecha.
	_objetivo.resized.connect(func() -> void:
		if _objetivo_tween == null or not _objetivo_tween.is_running():
			_objetivo.position.x = _objetivo_x()
	)


func conectar(cirujano: CharacterBody2D) -> void:
	cirujano.murio.connect(morir)
	cirujano.aviso.connect(avisar)
	cirujano.vitalidad_cambio.connect(_al_cambiar_vitalidad)
	cirujano.fervor_cambio.connect(_al_cambiar_fervor)
	cirujano.pociones_cambio.connect(_pintar_frascos)
	_vida.value = 100.0 * cirujano.vitalidad / Sacramento.VITALIDAD["maxima"]
	_al_cambiar_fervor(cirujano.combate.fervor, Sacramento.FERVOR["maximo"])
	_pintar_frascos(cirujano.combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])


## La parte del Fervor que la deuda de carne no deja llenar, tachada en
## sangre. Con el tope entero, desaparece.
func marcar_tope(tope: int) -> void:
	if not has_node("Deuda"):
		var tachado := ColorRect.new()
		tachado.name = "Deuda"
		tachado.color = Color(0.4, 0.06, 0.05, 0.85)
		tachado.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(tachado)
	var tachado: ColorRect = get_node("Deuda")
	var maximo: int = Sacramento.FERVOR["maximo"]
	tachado.visible = tope < maximo
	tachado.position = _fervor.position + Vector2(_fervor.size.x * tope / maximo, 0)
	tachado.size = Vector2(_fervor.size.x * (maximo - tope) / maximo, _fervor.size.y)


func avisar(texto: String) -> void:
	_aviso.text = texto
	_aviso.visible = true
	get_tree().create_timer(AVISO_S).timeout.connect(func() -> void:
		if _aviso.text == texto:
			_aviso.visible = false
	)


func _al_cambiar_vitalidad(actual: int, maxima: int) -> void:
	var antes := _vida.value
	_vida.value = 100.0 * actual / maxima
	# Al perder vida, el medallon destella en rojo: el golpe se siente arriba.
	if _vida.value < antes:
		_medallon.modulate = Color(1.6, 0.5, 0.45)
		create_tween().tween_property(_medallon, "modulate", Color.WHITE, 0.35)


func _al_cambiar_fervor(actual: int, maximo: int) -> void:
	_fervor.value = 100.0 * actual / maximo


func _pintar_frascos(cargas: int, maximas: int) -> void:
	for hijo in _frascos.get_children():
		hijo.queue_free()
	for i in maximas:
		var frasco := TextureRect.new()
		frasco.texture = FRASCO_LLENO if i < cargas else FRASCO_VACIO
		_frascos.add_child(frasco)


## El aviso de la muerte: entra despacio una banda oscura con el texto, el
## Vientre se apaga a negro con el aviso aun encima, y la luz vuelve ya en el
## Altar. Los tiempos van con los del Cirujano (Sacramento.MUERTE).
func morir() -> void:
	var M: Dictionary = Sacramento.MUERTE
	for nodo in [_banda, _muerte, _velo]:
		nodo.modulate.a = 0.0
		nodo.visible = true
	_muerte.scale = Vector2.ONE
	var aviso := create_tween()
	aviso.tween_interval(M["aviso_desde_ms"] / 1000.0)
	aviso.tween_property(_banda, "modulate:a", 1.0, M["aviso_entrada_ms"] / 1000.0)
	aviso.parallel().tween_property(_muerte, "modulate:a", 1.0, M["aviso_entrada_ms"] / 1000.0)
	# Crece un poco mientras se lee: el aviso pesa, no parpadea.
	aviso.parallel().tween_property(_muerte, "scale", Vector2.ONE * 1.06, (M["reaparecer_ms"] - M["aviso_desde_ms"]) / 1000.0)
	var negro := create_tween()
	negro.tween_interval(M["fundido_desde_ms"] / 1000.0)
	negro.tween_property(_velo, "modulate:a", 1.0, M["fundido_ms"] / 1000.0)
	negro.tween_interval((M["reaparecer_ms"] - M["fundido_desde_ms"] - M["fundido_ms"]) / 1000.0)
	negro.tween_callback(func() -> void:
		_banda.visible = false
		_muerte.visible = false
	)
	negro.tween_property(_velo, "modulate:a", 0.0, M["vuelta_ms"] / 1000.0)
	negro.tween_callback(func() -> void: _velo.visible = false)


func _preparar_muerte() -> void:
	_velo = ColorRect.new()
	_velo.name = "Velo"
	_velo.color = Color(0.02, 0.01, 0.015)
	_velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	_velo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_banda = ColorRect.new()
	_banda.name = "Banda"
	_banda.color = Color(0.03, 0.015, 0.02, 0.8)
	_banda.set_anchors_preset(Control.PRESET_CENTER_LEFT)
	_banda.anchor_right = 1.0
	_banda.offset_top = -34.0
	_banda.offset_bottom = 34.0
	_banda.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_muerte = Label.new()
	_muerte.name = "Muerte"
	_muerte.text = TEXTO_MUERTE
	_muerte.add_theme_font_override("font", FUENTE_MUERTE)
	_muerte.add_theme_font_size_override("font_size", 48)
	_muerte.add_theme_color_override("font_color", COLOR_MUERTE)
	_muerte.add_theme_color_override("font_outline_color", Color(0.02, 0.01, 0.015))
	_muerte.add_theme_constant_override("outline_size", 6)
	_muerte.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_muerte.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_muerte.set_anchors_preset(Control.PRESET_FULL_RECT)
	# El velo debajo: el aviso se queda un momento sobre el negro.
	for nodo in [_velo, _banda, _muerte]:
		nodo.visible = false
		add_child(nodo)
	# Que crezca desde el centro de la pantalla, no desde la esquina.
	_muerte.resized.connect(func() -> void: _muerte.pivot_offset = _muerte.size / 2.0)


## Una nota abierta: su titulo y su texto en un panel, con el juego parado
## hasta cerrarla con E.
func leer(titulo: String, texto: String) -> void:
	if _recien_cerrado():
		return
	_lectura_titulo.text = titulo
	_lectura_texto.text = texto
	_lectura.visible = true
	get_tree().paused = true


func _preparar_lectura() -> void:
	_lectura = PanelContainer.new()
	_lectura.name = "Lectura"
	var fondo := StyleBoxFlat.new()
	fondo.bg_color = Color(0.06, 0.04, 0.045, 0.94)
	fondo.border_color = Color(0.55, 0.4, 0.2)
	fondo.set_border_width_all(1)
	fondo.set_content_margin_all(14)
	_lectura.add_theme_stylebox_override("panel", fondo)
	_lectura.set_anchors_preset(Control.PRESET_CENTER)
	_lectura.custom_minimum_size = Vector2(420, 0)
	_lectura.grow_horizontal = Control.GROW_DIRECTION_BOTH
	_lectura.grow_vertical = Control.GROW_DIRECTION_BOTH
	var columna := VBoxContainer.new()
	columna.add_theme_constant_override("separation", 8)
	_lectura_titulo = Label.new()
	_lectura_titulo.add_theme_color_override("font_color", Color(0.89, 0.663, 0.251))
	_lectura_titulo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_lectura_texto = Label.new()
	_lectura_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_lectura_texto.custom_minimum_size = Vector2(392, 0)
	var cerrar := Label.new()
	cerrar.text = "E  cerrar"
	cerrar.add_theme_color_override("font_color", Color(0.6, 0.55, 0.5))
	cerrar.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	columna.add_child(_lectura_titulo)
	columna.add_child(_lectura_texto)
	columna.add_child(cerrar)
	_lectura.add_child(columna)
	_lectura.visible = false
	add_child(_lectura)
