## El logo provisional de Subterfuge Sigma (#201), hasta que haya uno de
## Mariana: tipografico, con la gotica del juego, y dibujado en el motor. Nada
## de imagenes generadas.
##
## Arriba, un medallon de oro con la σ: Sigma va por la desviacion estandar.
## Ninguna de las fuentes tiene la letra griega, asi que esta puesta a mano,
## pixel a pixel, como el arte provisional. Debajo, «Subterfuge» en Jacquard,
## rojo sangre, y «Sigma» entre dos filetes con rombos.
##
## El origen es el centro de arriba del logo.
extends Node2D

const FUENTE_TITULO := preload("res://arte/fuentes/Jacquard12-Regular.ttf")
const FUENTE_NARRACION := preload("res://arte/fuentes/JacquardaBastarda9-Regular.ttf")

const ORO := Color(0.85, 0.62, 0.25)
const ORO_OSCURO := Color(0.42, 0.27, 0.1)
const SANGRE := Color(0.7, 0.14, 0.12)
const NEGRO := Color(0.03, 0.015, 0.02)

## La σ: un cuenco con el trazo de arriba que sale hacia la derecha.
const SIGMA := [
	"..########",
	".##...##..",
	"##.....##.",
	"##.....##.",
	"##.....##.",
	".##...##..",
	"..#####...",
]
## Cada pixel de la σ mide esto en pantalla.
const ESCALA_SIGMA := 2
const RADIO_MEDALLON := 17.0
const CENTRO_MEDALLON := Vector2(0, 18)
## Los filetes: a que altura, cuanto miden y el hueco para «Sigma».
const ALTURA_FILETE := 112.0
const LARGO_FILETE := 150.0
const HUECO_FILETE := 46.0


func _ready() -> void:
	var titulo := _texto("Subterfuge", FUENTE_TITULO, 48, SANGRE, 40.0)
	titulo.add_theme_color_override("font_shadow_color", Color(0.25, 0.03, 0.03))
	titulo.add_theme_constant_override("shadow_offset_x", 2)
	titulo.add_theme_constant_override("shadow_offset_y", 2)
	_texto("Sigma", FUENTE_NARRACION, 18, ORO, ALTURA_FILETE - 12.0)


func _draw() -> void:
	# El medallon: un aro de oro con su sombra, y la σ dentro.
	draw_circle(CENTRO_MEDALLON, RADIO_MEDALLON + 2.0, NEGRO, true, -1.0, false)
	draw_circle(CENTRO_MEDALLON, RADIO_MEDALLON, Color(0.1, 0.05, 0.05), true, -1.0, false)
	draw_arc(CENTRO_MEDALLON, RADIO_MEDALLON, 0.0, TAU, 64, ORO, 2.0, false)
	draw_arc(CENTRO_MEDALLON, RADIO_MEDALLON - 3.0, 0.0, TAU, 64, ORO_OSCURO, 1.0, false)
	var ancho: int = SIGMA[0].length() * ESCALA_SIGMA
	var alto: int = SIGMA.size() * ESCALA_SIGMA
	var esquina := (CENTRO_MEDALLON - Vector2(ancho, alto) / 2.0).round()
	for y in SIGMA.size():
		for x in SIGMA[y].length():
			if SIGMA[y][x] == "#":
				draw_rect(Rect2(esquina + Vector2(x, y) * ESCALA_SIGMA, Vector2.ONE * ESCALA_SIGMA), ORO)

	# Los filetes, a cada lado de «Sigma», con un rombo en cada punta.
	for lado in [-1.0, 1.0]:
		var desde := Vector2(lado * HUECO_FILETE, ALTURA_FILETE)
		var hasta := Vector2(lado * LARGO_FILETE, ALTURA_FILETE)
		draw_line(desde, hasta, ORO, 1.0, false)
		draw_line(desde + Vector2(0, 2), hasta + Vector2(0, 2), ORO_OSCURO, 1.0, false)
		_rombo(desde + Vector2(lado * -4.0, 1.0), 3.0)
		_rombo(hasta + Vector2(lado * 4.0, 1.0), 4.0)


func _rombo(centro: Vector2, radio: float) -> void:
	draw_colored_polygon(PackedVector2Array([
		centro + Vector2(0, -radio), centro + Vector2(radio, 0),
		centro + Vector2(0, radio), centro + Vector2(-radio, 0),
	]), ORO)


func _texto(texto: String, fuente: Font, tamano: int, color: Color, arriba: float) -> Label:
	var etiqueta := Label.new()
	etiqueta.text = texto
	etiqueta.add_theme_font_override("font", fuente)
	etiqueta.add_theme_font_size_override("font_size", tamano)
	etiqueta.add_theme_color_override("font_color", color)
	etiqueta.add_theme_color_override("font_outline_color", NEGRO)
	etiqueta.add_theme_constant_override("outline_size", 6)
	etiqueta.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	etiqueta.position = Vector2(-200.0, arriba)
	etiqueta.size = Vector2(400.0, tamano + 12.0)
	add_child(etiqueta)
	return etiqueta
