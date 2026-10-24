## Sala de prueba del movimiento (#182): una repisa a cada altura que importa,
## para comprobar a mano que el Cirujano salta, se agarra y cae como debe.
##
## Los bloques van en codigo y no dibujados en el editor porque son medidas,
## no un nivel: cada uno esta a la altura de un numero de sacramento.gd. Los
## niveles de verdad se haran con tiles (#185).
extends Node2D

const SUELO := 304.0

## [x, y, ancho, alto, cartel]. La altura del cartel es la de la cara de
## arriba sobre el suelo.
const BLOQUES := [
	[-16, SUELO, 512, 16, ""],
	[-16, -64, 16, 368, ""],
	[480, -64, 16, 368, ""],
	# Salto simple: llega con holgura a 80 px.
	[24, 224, 64, 16, "80 px"],
	# 140 px desde el suelo: doble salto; desde la de 80, salto simple.
	[128, 164, 56, 16, "140 px"],
	# A la misma altura, con 80 px de hueco: salto con carrerilla.
	[264, 164, 48, 16, "hueco de 80"],
	# La torre: 100 px por encima de la anterior. Doble salto, o salto,
	# clavarse en ella (es membrana) y trepar. Bajar por el otro lado duele.
	[344, 64, 48, 240, "240 px: duele"],
]
## Los bloques de membrana: en ellos se clava el bisturi (K en el aire).
const MEMBRANAS := [Rect2(344, 64, 48, 240)]

const COLOR_PIEDRA := Color(0.227, 0.18, 0.188)
const COLOR_MEMBRANA := Color(0.5, 0.2, 0.22)
const COLOR_CARTEL := Color(0.541, 0.49, 0.439)

@onready var _cirujano: CharacterBody2D = $Cirujano


func _ready() -> void:
	for bloque in _bloques():
		_poner_bloque(Rect2(bloque[0], bloque[1], bloque[2], bloque[3]), bloque[4])
	$Interfaz.conectar(_cirujano)
	# La pista del siguiente nivel suena aqui mientras no hay siguiente nivel.
	var musica := get_node_or_null("/root/Musica")
	if musica:
		musica.poner("catedral-bosque")


## Los bloques de la sala. Otra sala de prueba puede poner los suyos.
func _bloques() -> Array:
	return BLOQUES


func _poner_bloque(rect: Rect2, cartel: String) -> void:
	var cuerpo := StaticBody2D.new()
	var membrana := rect in MEMBRANAS
	if membrana:
		cuerpo.add_to_group("clavable")
	cuerpo.position = rect.get_center()
	var forma := RectangleShape2D.new()
	forma.size = rect.size
	var colision := CollisionShape2D.new()
	colision.shape = forma
	cuerpo.add_child(colision)
	var dibujo := ColorRect.new()
	dibujo.color = COLOR_MEMBRANA if membrana else COLOR_PIEDRA
	dibujo.position = -rect.size / 2.0
	dibujo.size = rect.size
	cuerpo.add_child(dibujo)
	add_child(cuerpo)

	if cartel != "":
		var etiqueta := Label.new()
		etiqueta.text = cartel
		etiqueta.add_theme_color_override("font_color", COLOR_CARTEL)
		etiqueta.position = Vector2(rect.position.x, rect.position.y + 2.0)
		add_child(etiqueta)


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		get_tree().change_scene_to_file("res://escenas/principal.tscn")
