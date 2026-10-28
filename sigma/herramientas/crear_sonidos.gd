## Los sonidos calculados que van como archivo (#234, #241): las tres
## versiones del parry (Sonidos.parada) y el disparo de la Injertadora
## (Sonidos.disparo), en audio/efectos/. Calcularlos al arrancar el juego
## costaba 0,2 s cada uno (mas en la web). Se corre de nuevo si se cambian;
## la version del parry que suena la elige Efectos.PARRY.
##
##   godot --headless --path sigma -s res://herramientas/crear_sonidos.gd
extends SceneTree

const Sonidos := preload("res://scripts/sonidos.gd")


func _init() -> void:
	for variante in Sonidos.PARADAS.size():
		_guardar(Sonidos.parada(variante), "res://audio/efectos/parry-%d.wav" % variante)
	_guardar(Sonidos.disparo(), "res://audio/efectos/disparo-0.wav")
	quit()


func _guardar(wav: AudioStreamWAV, ruta: String) -> void:
	var error := wav.save_to_wav(ProjectSettings.globalize_path(ruta))
	print("%s: %s" % [ruta, "ok" if error == OK else error_string(error)])
