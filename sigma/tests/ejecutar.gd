## Corre todos los tests de Sigma (#180), sin plugins:
##
##   godot --headless --path sigma -s res://tests/ejecutar.gd
##
## Busca los archivos tests/test_*.gd, crea cada uno y llama a sus funciones
## test_*. Sale con codigo 1 si algo falla: el CI se pone en rojo.
##
## Un error de script en mitad de un test (una propiedad que ya no existe, un
## nulo) corta la funcion sin dejar ningun fallo apuntado, y el test pasaba en
## verde. Por eso se escuchan los errores mientras corre cada uno: si salta
## alguno, ese test falla con el mensaje.
extends SceneTree

const CARPETA := "res://tests"


## Apunta los errores de script y de motor que salen mientras corre un test.
## Los avisos (push_warning) no cuentan. Godot puede llamarlo desde otros
## hilos, de ahi el cerrojo.
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
	var escucha := Escucha.new()
	OS.add_logger(escucha)
	var total := 0
	var fallidos := 0
	var archivos := DirAccess.get_files_at(CARPETA)
	archivos.sort()

	for archivo in archivos:
		if not (archivo.begins_with("test_") and archivo.ends_with(".gd")):
			continue
		var script: GDScript = load("%s/%s" % [CARPETA, archivo])
		# Un archivo que no compila es un fallo, no un cuelgue: sin esto, el
		# ejecutor se quedaba parado y el CI esperaba hasta agotar el tiempo.
		if script == null or not script.can_instantiate():
			total += 1
			fallidos += 1
			print("  FALLO  %s · no compila" % archivo.get_basename())
			for error in escucha.vaciar():
				print("         %s" % error)
			continue
		var caso: Object = script.new()
		for metodo in caso.get_method_list():
			var nombre: String = metodo["name"]
			if not nombre.begins_with("test_"):
				continue
			total += 1
			caso.fallos.clear()
			escucha.vaciar()
			caso.call(nombre)
			for error in escucha.vaciar():
				caso.fallos.append("error durante el test: %s" % error)
			if caso.fallos.is_empty():
				print("  OK     %s · %s" % [archivo.get_basename(), nombre])
			else:
				fallidos += 1
				print("  FALLO  %s · %s" % [archivo.get_basename(), nombre])
				for fallo in caso.fallos:
					print("         %s" % fallo)

	OS.remove_logger(escucha)
	print("\n%d tests, %d fallidos" % [total, fallidos])
	quit(1 if fallidos > 0 or total == 0 else 0)
