## Lo que el Cirujano lleva ganado en la partida: las reliquias y el ultimo
## Altar en el que rezo. Es un autoload para que sobreviva a cambiar de sala, y
## se guarda en disco cada vez que cambia: al tomar una reliquia y al rezar. Asi
## funcionaba el original: rezar es guardar, y «Continuar» vuelve a ese Altar.
extends Node

signal reliquia_ganada(id: String)

const RUTA := "user://partida.cfg"

## Donde se guarda. Los tests la cambian para no pisar la partida de verdad.
var ruta := RUTA
## La sala (la ruta de su escena) y el Altar (su nombre en la escena) del
## ultimo rezo. Vacios: no hay partida.
var sala := ""
var altar := ""

var _reliquias := {}


func _ready() -> void:
	cargar()


func tiene(id: String) -> bool:
	return _reliquias.has(id)


func ganar(id: String) -> void:
	if tiene(id):
		return
	_reliquias[id] = true
	guardar()
	reliquia_ganada.emit(id)


## Ha rezado en el Altar `nombre` de la sala `escena`: ahi vuelve al continuar.
func rezar_en(escena: String, nombre: String) -> void:
	sala = escena
	altar = nombre
	guardar()


func hay_partida() -> bool:
	return sala != ""


## Una partida nueva: sin reliquias y sin Altar. Borra la guardada.
func nueva() -> void:
	_reliquias.clear()
	sala = ""
	altar = ""
	if FileAccess.file_exists(ruta):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(ruta))


func guardar() -> void:
	var partida := ConfigFile.new()
	partida.set_value("partida", "reliquias", _reliquias.keys())
	partida.set_value("partida", "sala", sala)
	partida.set_value("partida", "altar", altar)
	partida.save(ruta)


func cargar() -> void:
	_reliquias.clear()
	sala = ""
	altar = ""
	var partida := ConfigFile.new()
	if partida.load(ruta) != OK:
		return
	for id in partida.get_value("partida", "reliquias", []):
		_reliquias[id] = true
	sala = partida.get_value("partida", "sala", "")
	altar = partida.get_value("partida", "altar", "")
