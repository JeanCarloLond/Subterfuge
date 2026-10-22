## La nave: los fondos grandes del Vientre (scripts/fondos-sigma.mjs), en capas
## a distinta profundidad, como en Blasphemous y Hollow Knight. Lo lejano casi
## no se mueve y el primer plano pasa por delante del Cirujano, mas rapido que
## el: esa diferencia es lo que hace que el sitio se sienta enorme.
##
## Cada capa es un Parallax2D que se repite en horizontal. En vertical no se
## repite (una boveda repetida hacia arriba seria absurda): se coloca para que
## la parte de arriba de la imagen se vea con la camara arriba del nivel y
## suba lo que le toca al bajar.
extends Node2D

## [imagen, desplazamiento (0 = quieta, 1 = el mundo), z, tinte]
const CAPAS := [
	# La vidriera, apagada: es la luz del fondo, no lo que hay que mirar.
	["vidriera", Vector2(0.04, 0.04), -30, Color(0.6, 0.55, 0.6)],
	["boveda", Vector2(0.12, 0.12), -28, Color(1, 1, 1)],
	["columnas", Vector2(0.3, 0.3), -26, Color(0.85, 0.82, 0.85)],
	# Un velo, no un muro: no debe tapar donde se pisa.
	["primer-plano", Vector2(1.35, 1.0), 40, Color(1, 1, 1, 0.8)],
]
const ARTE := "res://arte/fondos/%s.png"

## El centro de la pantalla con la camara arriba del todo: la mitad del alto
## de la vista.
@export var cima_camara := 180.0


func _ready() -> void:
	for capa in CAPAS:
		var textura: Texture2D = load(ARTE % capa[0])
		var escala: Vector2 = capa[1]
		var parallax := Parallax2D.new()
		parallax.name = String(capa[0]).to_pascal_case()
		parallax.scroll_scale = escala
		parallax.repeat_size = Vector2(textura.get_width(), 0)
		parallax.repeat_times = 3
		parallax.z_index = capa[2]
		# Con la camara arriba, la imagen empieza arriba de la pantalla.
		parallax.scroll_offset = Vector2(0, cima_camara * escala.y - cima_camara)
		var sprite := Sprite2D.new()
		sprite.texture = textura
		sprite.centered = false
		sprite.modulate = capa[3]
		parallax.add_child(sprite)
		add_child(parallax)
