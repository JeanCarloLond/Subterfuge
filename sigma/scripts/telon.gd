## El telon de arcadas (#184): el fondo de todo el Vientre, que recuerda que es
## una catedral y no unas cuevas. Dos capas a distinta velocidad: la lejana casi
## no se mueve y la cercana acompana; esa diferencia se lee como profundidad.
##
## Es el mismo dibujo que fondoArcos() en ArteProvisional.ts, pintado aqui en
## una imagen de 96x96 que se repite. Va fijo a la pantalla y se desplaza con la
## camara, no con el reloj.
extends CanvasLayer

const BALDOSA := 96

## [factor de desplazamiento x, y, escala del dibujo, opacidad]
const CAPAS := [
	[0.08, 0.05, 2, 0.5],
	[0.25, 0.18, 1, 0.75],
]

var _capas: Array[Sprite2D] = []


func _ready() -> void:
	layer = -10
	var textura := ImageTexture.create_from_image(_dibujar())
	for capa in CAPAS:
		var sprite := Sprite2D.new()
		sprite.texture = textura
		sprite.centered = false
		sprite.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
		sprite.region_enabled = true
		sprite.scale = Vector2.ONE * capa[2]
		sprite.modulate.a = capa[3]
		add_child(sprite)
		_capas.append(sprite)


func _process(_delta: float) -> void:
	var camara := get_viewport().get_camera_2d()
	var mirada := camara.get_screen_center_position() if camara else Vector2.ZERO
	var pantalla := get_viewport().get_visible_rect().size
	for i in _capas.size():
		var capa: Array = CAPAS[i]
		var escala: float = capa[2]
		_capas[i].region_rect = Rect2(
			Vector2(mirada.x * capa[0], mirada.y * capa[1]) / escala,
			pantalla / escala + Vector2.ONE
		)


## Dos arcadas por baldosa, desfasadas para que la repeticion no salte, y una
## linea de imposta que da una horizontal que leer.
static func _dibujar() -> Image:
	var imagen := Image.create(BALDOSA, BALDOSA, false, Image.FORMAT_RGBA8)
	imagen.fill(Color8(0x0f, 0x0c, 0x0f))
	for arco in [[24, 74, 15], [72, 82, 19]]:
		var centro: int = arco[0]
		var base: int = arco[1]
		var radio: int = arco[2]
		_arco(imagen, centro, base, radio, Color8(0x18, 0x13, 0x20))
		_arco(imagen, centro, base, radio - 4, Color8(0x0b, 0x09, 0x0e), radio)
	imagen.fill_rect(Rect2i(0, 86, BALDOSA, 2), Color8(0x1d, 0x17, 0x26))
	return imagen


## Un arco de medio punto: un rectangulo de `radio` de alto con un semicirculo
## encima, apoyado en `base`. `alto` es la altura del rectangulo (la del arco
## de fuera, para el hueco).
static func _arco(imagen: Image, centro: int, base: int, radio: int, color: Color, alto := -1) -> void:
	var alto_recto := radio if alto < 0 else alto
	var arranque := base - alto_recto
	imagen.fill_rect(Rect2i(centro - radio, arranque, radio * 2, alto_recto), color)
	for y in range(arranque - radio, arranque + 1):
		for x in range(centro - radio, centro + radio + 1):
			if Vector2(x - centro, y - arranque).length() <= radio and x >= 0 and x < BALDOSA and y >= 0:
				imagen.set_pixel(x, y, color)
