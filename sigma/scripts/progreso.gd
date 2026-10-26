## Lo que el Cirujano lleva ganado en la partida: las reliquias, las notas
## leidas y el ultimo Altar en el que rezo. Es un autoload para que sobreviva a
## cambiar de sala, y se guarda en disco cada vez que cambia: al tomar una
## reliquia, al leer una nota y al rezar. Asi funcionaba el original: rezar es
## guardar, y «Continuar» vuelve a ese Altar. Tambien el objetivo (#215) y lo
## que lleva contado.
extends Node

signal reliquia_ganada(id: String)
## Hay objetivo nuevo, o su cuenta ha avanzado: la interfaz lo muestra.
signal objetivo_cambio(id: String)

const Objetivos := preload("res://scripts/objetivos.gd")

const RUTA := "user://partida.cfg"

## Donde se guarda. Los tests la cambian para no pisar la partida de verdad.
var ruta := RUTA
## La sala (la ruta de su escena) y el Altar (su nombre en la escena) del
## ultimo rezo. Vacios: no hay partida.
var sala := ""
var altar := ""

var _reliquias := {}
var _notas := {}
## La deuda de carne pendiente: {"sala": ruta, "sitio": Vector2}, o vacia.
var deuda := {}
## Por que entrada se aparece en la sala que se carga (paso.gd). No se
## guarda: «Continuar» vuelve al Altar.
var entrada := ""
## Lo que lleva el cuerpo al cruzar un paso (Cirujano.estado_cuerpo). No se
## guarda: al morir o al continuar se vuelve al Altar, lleno.
var cuerpo := {}
## El objetivo de ahora (su id en Objetivos), o vacio.
var objetivo := ""
## Lo contado para cada objetivo que cuenta: id -> [lo hallado]. Se cuenta
## aunque el objetivo aun no toque: un registro hallado antes de saber que se
## buscaba sigue valiendo.
var _cuentas := {}
## Los carteles de controles ya aprendidos (#221): no vuelven a salir.
var _aprendido := {}


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


func leida(id: String) -> bool:
	return _notas.has(id)


func leer(id: String) -> void:
	if leida(id):
		return
	_notas[id] = true
	guardar()


## Ha rezado en el Altar `nombre` de la sala `escena`: ahi vuelve al continuar.
func rezar_en(escena: String, nombre: String) -> void:
	sala = escena
	altar = nombre
	guardar()


## Muere en `sitio` de la sala `escena`: ahi queda su carne. Solo una a la vez.
func endeudar(escena: String, sitio: Vector2) -> void:
	deuda = {"sala": escena, "sitio": sitio}
	guardar()


func saldar() -> void:
	deuda = {}
	guardar()


## Toca el objetivo `id`. Si ya tenia su cuenta completa, pasa al siguiente.
func fijar_objetivo(id: String) -> void:
	if id == objetivo or not Objetivos.existe(id):
		return
	objetivo = id
	if Objetivos.total(id) > 0 and cuenta(id) >= Objetivos.total(id) and Objetivos.siguiente(id) != "":
		fijar_objetivo(Objetivos.siguiente(id))
		return
	guardar()
	objetivo_cambio.emit(id)


## Se ha hallado `que` (un registro, por su id) para el objetivo `id`. Cada cosa
## cuenta una vez. Al completar la cuenta del objetivo de ahora, pasa al siguiente.
func contar(id: String, que: String) -> void:
	var hallado: Array = _cuentas.get(id, [])
	if hallado.has(que):
		return
	hallado.append(que)
	_cuentas[id] = hallado
	guardar()
	if id != objetivo:
		return
	if cuenta(id) >= Objetivos.total(id) and Objetivos.siguiente(id) != "":
		fijar_objetivo(Objetivos.siguiente(id))
	else:
		objetivo_cambio.emit(id)


func cuenta(id: String) -> int:
	return _cuentas.get(id, []).size()


## El objetivo de ahora tal como se lee, con su contador; vacio si no hay.
func texto_objetivo() -> String:
	return Objetivos.texto(objetivo, cuenta(objetivo))


func aprendido(id: String) -> bool:
	return _aprendido.has(id)


func aprender(id: String) -> void:
	if aprendido(id):
		return
	_aprendido[id] = true
	guardar()


func hay_partida() -> bool:
	return sala != ""


## Una partida nueva: sin reliquias y sin Altar. Borra la guardada.
func nueva() -> void:
	_reliquias.clear()
	_notas.clear()
	sala = ""
	altar = ""
	deuda = {}
	objetivo = ""
	_cuentas.clear()
	_aprendido.clear()
	if FileAccess.file_exists(ruta):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(ruta))


func guardar() -> void:
	var partida := ConfigFile.new()
	partida.set_value("partida", "reliquias", _reliquias.keys())
	partida.set_value("partida", "notas", _notas.keys())
	partida.set_value("partida", "sala", sala)
	partida.set_value("partida", "altar", altar)
	partida.set_value("partida", "deuda", deuda)
	partida.set_value("partida", "objetivo", objetivo)
	partida.set_value("partida", "cuentas", _cuentas)
	partida.set_value("partida", "aprendido", _aprendido.keys())
	partida.save(ruta)


func cargar() -> void:
	_reliquias.clear()
	_notas.clear()
	sala = ""
	altar = ""
	deuda = {}
	objetivo = ""
	_cuentas.clear()
	_aprendido.clear()
	var partida := ConfigFile.new()
	if partida.load(ruta) != OK:
		return
	for id in partida.get_value("partida", "reliquias", []):
		_reliquias[id] = true
	for id in partida.get_value("partida", "notas", []):
		_notas[id] = true
	sala = partida.get_value("partida", "sala", "")
	altar = partida.get_value("partida", "altar", "")
	deuda = partida.get_value("partida", "deuda", {})
	objetivo = partida.get_value("partida", "objetivo", "")
	_cuentas = partida.get_value("partida", "cuentas", {})
	for id in partida.get_value("partida", "aprendido", []):
		_aprendido[id] = true
