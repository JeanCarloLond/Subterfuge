## Comprueba un Sigma ya exportado (#237): abre cada escena del paquete y mira
## que todo lo que habla (el Cegado, las visiones) tenga sus lineas. Convertidas
## a binario, Godot las perdia sin avisar y en la web se hablaba vacio. Lo corre
## deploy.yml contra el .pck antes de publicar; sale con 1 si algo falla.
##
##   godot --headless --main-pack dist/sigma/juego/index.pck -s <ruta a este archivo>
extends SceneTree

const CARPETA := "res://escenas"


func _initialize() -> void:
	var fallos: Array[String] = []
	var vistas := 0
	for ruta in _escenas(CARPETA):
		var escena: PackedScene = load(ruta)
		if escena == null:
			fallos.append("%s no carga" % ruta)
			continue
		var raiz := escena.instantiate()
		for nodo in _todos(raiz):
			for propiedad in ["lineas", "otra_vez"]:
				if not propiedad in nodo or not nodo.get(propiedad) is PackedStringArray:
					continue
				vistas += 1
				if nodo.get(propiedad).is_empty():
					fallos.append("%s: %s sin %s" % [ruta, raiz.get_path_to(nodo), propiedad])
		raiz.free()
	for fallo in fallos:
		printerr("  FALLO  ", fallo)
	print("Exportación: %d listas de texto, %d vacías" % [vistas, fallos.size()])
	quit(1 if not fallos.is_empty() or vistas == 0 else 0)


## Las escenas del paquete, buscadas por su nombre: exportadas, el .tscn puede
## estar remapeado, y se cargan igual por su ruta original.
func _escenas(carpeta: String) -> Array[String]:
	var halladas: Array[String] = []
	for archivo in ResourceLoader.list_directory(carpeta):
		var ruta := carpeta.path_join(archivo)
		if archivo.ends_with("/"):
			halladas.append_array(_escenas(ruta.trim_suffix("/")))
		elif archivo.ends_with(".tscn"):
			halladas.append(ruta)
	return halladas


func _todos(nodo: Node) -> Array[Node]:
	var lista: Array[Node] = [nodo]
	for hijo in nodo.get_children():
		lista.append_array(_todos(hijo))
	return lista
