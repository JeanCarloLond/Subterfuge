## La interfaz de las salas, ornamentada como la de Blasphemous
## (scripts/hud-sigma.mjs): arriba a la izquierda, el medallon con el rostro
## del Cirujano, la vida en seis segmentos de sangre, el Fervor en ambar y los
## frascos de Pocion. Los avisos, en el centro; la ayuda de los controles,
## abajo, plegada: con H se abre y se cierra (el texto fijo en pantalla
## estorbaba y no se leia). Todo en la letra legible del tema (arte/tema.tres).
## Cada sala la conecta a su Cirujano y pone su propia ayuda.
extends CanvasLayer

const Sacramento := preload("res://scripts/sacramento.gd")
const FRASCO_LLENO := preload("res://arte/hud/frasco-lleno.png")
const FRASCO_VACIO := preload("res://arte/hud/frasco-vacio.png")
## Lo que dura un aviso en pantalla.
const AVISO_S := 2.5
## Lo que se ve con la ayuda plegada.
const AYUDA_PLEGADA := "H  controles"
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


func _unhandled_input(evento: InputEvent) -> void:
	if _lectura.visible:
		if evento.is_action_pressed("interactuar") or evento.is_action_pressed("pausa"):
			_lectura.visible = false
			get_tree().paused = false
			get_viewport().set_input_as_handled()
		return
	if evento.is_action_pressed("ayuda"):
		_ayuda_abierta = not _ayuda_abierta
		_pintar_ayuda()


func _pintar_ayuda() -> void:
	_ayuda.text = ayuda if _ayuda_abierta else AYUDA_PLEGADA


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
