## Los fotogramas del Cirujano (scripts/cirujano-sigma.mjs): cada uno sabe donde
## le cae el ojo rojo (#252), y ese sitio esta dentro del fotograma.
extends "res://tests/caso.gd"

const Animaciones := preload("res://arte/cirujano/animaciones.gd")


func test_cada_fotograma_sabe_donde_cae_el_ojo() -> void:
	for nombre in Animaciones.RECUENTO:
		var ojos: Array = Animaciones.OJOS[nombre]
		afirmar_igual(ojos.size(), Animaciones.RECUENTO[nombre], "«%s», un ojo por fotograma" % nombre)
		for ojo: Vector2i in ojos:
			afirmar(ojo.x > 0 and ojo.x < 47 and ojo.y > 0 and ojo.y < 57, "«%s»: %s, dentro del fotograma" % [nombre, ojo])
