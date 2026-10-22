## Corre todos los tests de Sigma (#180), sin plugins:
##
##   godot --headless --path sigma -s res://tests/ejecutar.gd
##
## Busca los archivos tests/test_*.gd, crea cada uno y llama a sus funciones
## test_*. Sale con codigo 1 si algo falla: el CI se pone en rojo.
extends SceneTree

const CARPETA := "res://tests"


func _initialize() -> void:
	var total := 0
	var fallidos := 0
	var archivos := DirAccess.get_files_at(CARPETA)
	archivos.sort()

	for archivo in archivos:
		if not (archivo.begins_with("test_") and archivo.ends_with(".gd")):
			continue
		var script: GDScript = load("%s/%s" % [CARPETA, archivo])
		var caso: Object = script.new()
		for metodo in caso.get_method_list():
			var nombre: String = metodo["name"]
			if not nombre.begins_with("test_"):
				continue
			total += 1
			caso.fallos.clear()
			caso.call(nombre)
			if caso.fallos.is_empty():
				print("  OK     %s · %s" % [archivo.get_basename(), nombre])
			else:
				fallidos += 1
				print("  FALLO  %s · %s" % [archivo.get_basename(), nombre])
				for fallo in caso.fallos:
					print("         %s" % fallo)

	print("\n%d tests, %d fallidos" % [total, fallidos])
	quit(1 if fallidos > 0 or total == 0 else 0)
