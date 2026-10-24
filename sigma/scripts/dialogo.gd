## Un dialogo a lo Stardew Valley (#216), sin la caja: el texto que se escribe
## letra a letra, las pausas en la puntuacion y que hace la E. La caja la
## pinta la interfaz. Va aparte para probarlo sin pantalla, como el combate.
##
## La E: con la linea a medias, la termina de golpe; con la linea entera, pasa
## a la siguiente; tras la ultima, se acaba.
extends RefCounted

## Letras por segundo: se lee comodo sin esperar.
const LETRAS_S := 42.0
## Lo que se detiene tras cada signo: el texto respira donde lo haria la voz.
const PAUSAS_S := {",": 0.1, ";": 0.14, ":": 0.14, ".": 0.24, "?": 0.24, "!": 0.24, "…": 0.3}

## Las lineas que quedan: [{quien, texto}].
var lineas: Array = []
var indice := 0
## Cuantas letras de la linea de ahora se ven.
var visibles := 0
var terminado := false

var _espera := 0.0


func _init(nuevas: Array = []) -> void:
	lineas = nuevas
	terminado = lineas.is_empty()


func quien() -> String:
	return "" if terminado else lineas[indice]["quien"]


func texto() -> String:
	return "" if terminado else lineas[indice]["texto"]


## Lo que se ve ahora de la linea.
func texto_visible() -> String:
	return texto().substr(0, visibles)


func linea_completa() -> bool:
	return visibles >= texto().length()


## Si quedan lineas despues de esta: para la flecha de «hay mas».
func hay_mas() -> bool:
	return indice < lineas.size() - 1


## Avanza el tiempo. Devuelve cuantas letras nuevas han salido (la interfaz
## suena una voz por ellas).
func paso(delta: float) -> int:
	if terminado or linea_completa():
		return 0
	_espera -= delta
	var salidas := 0
	while _espera <= 0.0 and not linea_completa():
		var letra := texto()[visibles]
		visibles += 1
		salidas += 1
		_espera += 1.0 / LETRAS_S + PAUSAS_S.get(letra, 0.0)
	return salidas


## La E. Devuelve true si el dialogo se ha acabado con ella.
func pulsar() -> bool:
	if terminado:
		return true
	if not linea_completa():
		visibles = texto().length()
		return false
	if hay_mas():
		indice += 1
		visibles = 0
		_espera = 0.0
		return false
	terminado = true
	return true
