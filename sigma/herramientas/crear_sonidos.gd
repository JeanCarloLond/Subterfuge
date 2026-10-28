## El sonido del parry logrado (#234): calcula las tres versiones de
## Sonidos.parada() y las guarda en audio/efectos/parry-N.wav. Calcularlas al
## arrancar el juego costaba 0,2 s cada una (mas en la web). Se corre de nuevo
## si se cambia Sonidos.PARADAS; la que suena la elige Efectos.PARRY.
##
##   godot --headless --path sigma -s res://herramientas/crear_parry.gd
extends SceneTree

const Sonidos := preload("res://scripts/sonidos.gd")
const RUTA := "res://audio/efectos/parry-%d.wav"


func _init() -> void:
	for variante in Sonidos.PARADAS.size():
		var ruta := RUTA % variante
		var error := Sonidos.parada(variante).save_to_wav(ProjectSettings.globalize_path(ruta))
		print("%s: %s" % [ruta, "ok" if error == OK else error_string(error)])
	quit()
