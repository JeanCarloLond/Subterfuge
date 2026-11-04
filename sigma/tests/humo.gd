## La prueba de humo (#249): abre cada escena de verdad, la deja correr unos
## segundos sin nadie a los mandos y falla si algo da error. Los tests prueban
## piezas sueltas; esto prueba que el juego arranca entero. No vieron, por
## ejemplo, que el Cegado hablaba vacio en la web (#237).
##
##   godot --headless --path sigma -s res://tests/humo.gd
##   godot --headless --main-pack index.pck -s <ruta a este archivo>   (lo exportado)
##
## Es autonomo (no carga nada de tests/): asi corre tambien contra el paquete
## exportado, que no lleva los tests.
extends SceneTree

## Lo que corre cada escena, en fotogramas (a 60 por segundo).
const FOTOGRAMAS := 180
const FIJAS := ["res://escenas/principal.tscn", "res://escenas/intro.tscn", "res://escenas/atrio.tscn"]
const CARPETAS := ["res://escenas/nivel1", "res://escenas/nivel2"]


class Escucha:
	extends Logger

	var errores: Array[String] = []
	var _cerrojo := Mutex.new()

	func _log_error(_funcion: String, archivo: String, linea: int, codigo: String, motivo: String,
			_editor: bool, tipo: int, _pila: Array[ScriptBacktrace]) -> void:
		if tipo != ERROR_TYPE_ERROR and tipo != ERROR_TYPE_SCRIPT:
			return
		_cerrojo.lock()
		errores.append("%s (%s:%d)" % [motivo if motivo != "" else codigo, archivo, linea])
		_cerrojo.unlock()

	func _log_message(_mensaje: String, _error: bool) -> void:
		pass

	func vaciar() -> Array[String]:
		_cerrojo.lock()
		var vistos := errores.duplicate()
		errores.clear()
		_cerrojo.unlock()
		return vistos


func _initialize() -> void:
	_correr.call_deferred()


func _correr() -> void:
	var progreso := root.get_node_or_null("Progreso")
	if progreso:
		# Una partida aparte: la prueba no toca la de quien juega.
		progreso.ruta = "user://partida-humo.cfg"
		progreso.nueva()
	var escucha := Escucha.new()
	OS.add_logger(escucha)
	var fallidas := 0
	var escenas := _escenas()
	for ruta in escenas:
		escucha.vaciar()
		if change_scene_to_file(ruta) != OK:
			print("  FALLO  %s · no abre" % ruta)
			fallidas += 1
			continue
		for i in FOTOGRAMAS:
			await physics_frame
		var errores := escucha.vaciar()
		if errores.is_empty():
			print("  OK     %s" % ruta)
		else:
			fallidas += 1
			print("  FALLO  %s" % ruta)
			for error in errores.slice(0, 5):
				print("         %s" % error)
	OS.remove_logger(escucha)
	if progreso:
		progreso.nueva()
	print("\n%d escenas, %d con errores" % [escenas.size(), fallidas])
	quit(1 if fallidas > 0 or escenas.is_empty() else 0)


func _escenas() -> Array[String]:
	var todas: Array[String] = []
	todas.append_array(FIJAS)
	for carpeta in CARPETAS:
		var archivos := ResourceLoader.list_directory(carpeta)
		for archivo in archivos:
			if archivo.ends_with(".tscn"):
				todas.append(carpeta.path_join(archivo))
	return todas
