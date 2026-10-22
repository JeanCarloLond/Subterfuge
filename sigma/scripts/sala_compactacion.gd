## Sala de prueba de la compactacion (#186): un techo que late y un muro que
## empuja contra un pilar. Sirve para ajustar el aviso, la velocidad y el dano
## antes de meter muros en los niveles.
##
## La piedra quieta va en codigo, como en la sala del movimiento; los muros son
## nodos de la escena, para tocarlos en el editor.
extends Node2D

const PORTADA := "res://escenas/principal.tscn"
const SILLERIA := preload("res://arte/silleria/vientre.tres")
const AVISO_S := 2.5

## [columna, fila, ancho, alto], en tiles de 16 px.
const PIEDRA := [
	[0, 18, 30, 2], # suelo
	[0, 0, 30, 2], # techo
	[0, 2, 2, 16], # pared izquierda
	[28, 2, 2, 16], # pared derecha
	# El pilar: 48 px, se salta. Encima, el muro no llega.
	[15, 15, 1, 3],
]

## [x, y, texto], en px.
const CARTELES := [
	[96, 300, "el techo baja: pasa cuando suba"],
	[264, 300, "el muro empuja: súbete al pilar"],
]

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _vitalidad: Label = $Interfaz/Vitalidad
@onready var _aviso: Label = $Interfaz/Aviso


func _ready() -> void:
	var capa := TileMapLayer.new()
	capa.tile_set = SILLERIA
	for p in PIEDRA:
		for x in range(p[0], p[0] + p[2]):
			for y in range(p[1], p[1] + p[3]):
				capa.set_cell(Vector2i(x, y), 0, Vector2i((x * 3 + y * 5) % 8, 0))
	add_child(capa)
	move_child(capa, 0)

	for cartel in CARTELES:
		var etiqueta := Label.new()
		etiqueta.text = cartel[2]
		etiqueta.add_theme_font_size_override("font_size", 8)
		etiqueta.add_theme_color_override("font_color", Color(0.929, 0.894, 0.847))
		etiqueta.position = Vector2(cartel[0], cartel[1])
		add_child(etiqueta)

	for muro in $Muros.get_children():
		muro.objetivo = _cirujano
		muro.aplasto.connect(_avisar.bind("Aplastado: vuelves al Altar"))
	for altar in $Altares.get_children():
		altar.cirujano = _cirujano
		altar.rezado.connect(_avisar.bind("Altar: aquí volverás"))
	_cirujano.vitalidad_cambio.connect(_al_cambiar_vitalidad)
	_al_cambiar_vitalidad(_cirujano.vitalidad, _cirujano.vitalidad)


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		get_tree().change_scene_to_file(PORTADA)


func _al_cambiar_vitalidad(actual: int, maxima: int) -> void:
	_vitalidad.text = "Vitalidad %d/%d" % [actual, maxima]


func _avisar(texto: String) -> void:
	_aviso.text = texto
	_aviso.visible = true
	get_tree().create_timer(AVISO_S).timeout.connect(func() -> void:
		if _aviso.text == texto:
			_aviso.visible = false
	)
