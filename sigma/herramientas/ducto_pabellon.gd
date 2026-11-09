## La compactacion del Nivel III (#256): la puerta del Pabellon N.º 7 que lleva a
## su Sala, cerrada hasta que cae el Decano, y lo que dice ella al cruzarla. Se
## corrio UNA vez sobre la sala ya hecha:
##
##   godot --headless --path sigma -s res://herramientas/ducto_pabellon.gd
extends SceneTree

const RUTA := "res://escenas/nivel1/pabellon.tscn"
const PASO := preload("res://scripts/paso.gd")
const VISION := preload("res://scripts/vision.gd")
const UMBRAL := preload("res://arte/provisional/umbral.png")
const COLUMNA := 30
const FILA := 19


func _initialize() -> void:
	var escena: Node = (load(RUTA) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	var paso := Node2D.new()
	paso.name = "Sala7"
	paso.set_script(PASO)
	paso.position = Vector2((COLUMNA - 1) * 16, (FILA - 3) * 16)
	paso.set("zona", Vector2(32, 48))
	paso.set("destino", "res://escenas/nivel3/sala_7.tscn")
	paso.set("entrada", "pabellon")
	paso.set("con_e", true)
	paso.set("aviso", "E  a tu Sala")
	paso.set("pide_marca", "decano-vencido")
	# Cerrada, ni se ve: se tomaba por la salida del Pabellon.
	paso.set("escondido_hasta_abrir", true)
	paso.set("puerta", NodePath("../../PuertaSala7"))
	escena.get_node("Pasos").add_child(paso)
	paso.owner = escena
	var entrada := Marker2D.new()
	entrada.name = "sala7"
	entrada.position = Vector2(COLUMNA * 16 + 8, FILA * 16)
	entrada.set_meta("mirando", -1)
	escena.get_node("Entradas").add_child(entrada)
	entrada.owner = escena
	var puerta := Sprite2D.new()
	puerta.name = "PuertaSala7"
	puerta.texture = UMBRAL
	puerta.centered = false
	puerta.offset = Vector2(-10, -34)
	puerta.position = entrada.position
	puerta.z_index = -1
	escena.add_child(puerta)
	puerta.owner = escena
	var vision := Node2D.new()
	vision.name = "Sala7"
	vision.set_script(VISION)
	vision.set("id", "pabellon-sala-7")
	vision.set("zona", Rect2((COLUMNA - 6) * 16, (FILA - 5) * 16, 96, 96))
	vision.set("pide_marca", "decano-vencido")
	vision.set("objetivo", "criptas")
	vision.set("lineas", PackedStringArray([
		"Mira, tu Sala y tu cama. Antes tardabas un turno entero en bajar.",
		"Ahora se tocan. Puedes ir descalzo.",
		"Ya casi no queda abajo. Queda un poco, y luego estoy yo.",
	]))
	if not escena.has_node("Visiones"):
		var grupo := Node2D.new()
		grupo.name = "Visiones"
		escena.add_child(grupo)
		grupo.owner = escena
	escena.get_node("Visiones").add_child(vision)
	vision.owner = escena
	var empaquetada := PackedScene.new()
	var error := empaquetada.pack(escena)
	if error == OK:
		error = ResourceSaver.save(empaquetada, RUTA)
	print("%s: %s" % [RUTA, error_string(error)])
	escena.free()
	quit(0 if error == OK else 1)
