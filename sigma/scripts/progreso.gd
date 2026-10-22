## Lo que el Cirujano lleva ganado en la partida: las reliquias. Es un autoload
## para que sobreviva a cambiar de sala; todavia no se guarda en disco.
extends Node

signal reliquia_ganada(id: String)

var _reliquias := {}


func tiene(id: String) -> bool:
	return _reliquias.has(id)


func ganar(id: String) -> void:
	if tiene(id):
		return
	_reliquias[id] = true
	reliquia_ganada.emit(id)
