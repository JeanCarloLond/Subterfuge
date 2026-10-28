## Una figura del decorado que habla (#239): los fieles de la Capilla, las
## registradoras, la honguera. Feedback de Jean: estaban por el mapa sin hacer
## nada. Ahora, cuando el Cirujano pasa cerca, dicen una frase en un bocadillo
## (bocadillo.gd): lo que se dice en la Diocesis de lo que esta pasando. No
## paran el juego ni piden E; cada vez, la siguiente frase.
extends Sprite2D

const Bocadillo := preload("res://scripts/bocadillo.gd")
## Lo cerca que tiene que pasar el Cirujano para que hable.
const ALCANCE := 56.0
## Lo que calla despues de hablar, aunque se vuelva a pasar.
const ESPERA_MS := 6000.0
## Con un enemigo a esta distancia, calla: tiene miedo (y sus frases se
## pisarian con las del Devoto).
const MIEDO := 120.0

@export_multiline var lineas: PackedStringArray = []

var _vez := 0
var _proxima := 0.0
var _cerca_antes := false


func _process(_delta: float) -> void:
	if lineas.is_empty():
		return
	var cirujano := get_tree().get_first_node_in_group("cirujano") as Node2D
	if cirujano == null:
		return
	var cerca := global_position.distance_to(cirujano.global_position) < ALCANCE
	var ahora := float(Time.get_ticks_msec())
	if cerca and not _cerca_antes and ahora >= _proxima and not _con_miedo():
		var cabeza := -float(texture.get_height()) - 20.0 if texture else Bocadillo.ALTURA
		Bocadillo.decir(self, lineas[_vez % lineas.size()], cabeza)
		_vez += 1
		_proxima = ahora + ESPERA_MS
	_cerca_antes = cerca


func _con_miedo() -> bool:
	for enemigo in get_tree().get_nodes_in_group("enemigos"):
		if enemigo.vivo() and global_position.distance_to(enemigo.global_position) < MIEDO:
			return true
	return false
