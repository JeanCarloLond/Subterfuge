## El plano del mapa (scripts/plano.gd), sacado de las salas: su tamaño (los
## limites de la camara), sus pasos y sus Altares. Cada sala se coloca junto a
## la anterior por el lado del paso que las une, empezando por el Pabellon, asi
## que el plano sigue a las salas: si se mueve un paso o se hace una sala nueva,
## se vuelve a correr y ya.
##
##   godot --headless --path sigma -s res://herramientas/crear_plano.gd
##
## Los atajos que abre la compactacion (la Nave del Libro con el Atrio, la N.º 7
## con el Pabellon, el Ala con el Registro) no colocan salas: unen dos que ya
## estan en su sitio, lejos.
extends SceneTree

const SALIDA := "res://scripts/plano.gd"
const NIVELES := ["nivel1", "nivel2", "nivel3"]
const INICIO := "res://escenas/nivel1/pabellon.tscn"
## Los pasos que son atajos: no colocan la sala de destino.
const ATAJOS := ["Atajo", "Libro", "Sala7", "Pabellon"]
## La escala del plano: un pixel del mapa son tantos de la sala.
const ESCALA := 12.0


func _initialize() -> void:
	var salas := {}
	for nivel in NIVELES:
		for archivo in DirAccess.get_files_at("res://escenas/" + nivel):
			if archivo.ends_with(".tscn"):
				var ruta := "res://escenas/%s/%s" % [nivel, archivo]
				salas[ruta] = _leer(ruta, nivel)
	var sitio := {INICIO: Vector2.ZERO}
	var cola := [INICIO]
	while not cola.is_empty():
		var ruta: String = cola.pop_front()
		var sala: Dictionary = salas[ruta]
		for paso in sala["pasos"]:
			var destino: String = paso["destino"]
			if destino == "" or sitio.has(destino) or paso["nombre"] in ATAJOS or not salas.has(destino):
				continue
			var lado := _lado(sala["tam"], paso["centro"])
			var junto := _junto(sitio[ruta], sala, paso, salas[destino], ruta)
			# Si cae encima de otra ya puesta, se aparta por ese mismo lado: en un
			# mapa dos salas no se pisan.
			while _pisa(Rect2(junto, salas[destino]["tam"]), sitio, salas):
				junto += lado * ESCALA
			sitio[destino] = junto
			cola.append(destino)
	var faltan := salas.keys().filter(func(r: String) -> bool: return not sitio.has(r))
	if not faltan.is_empty():
		push_error("Salas sin colocar (ningun paso llega a ellas): %s" % [faltan])
	_escribir(salas, sitio)
	quit()


static func _pisa(rect: Rect2, sitio: Dictionary, salas: Dictionary) -> bool:
	for otra in sitio:
		if rect.grow(-1.0).intersects(Rect2(sitio[otra], salas[otra]["tam"])):
			return true
	return false


func _leer(ruta: String, nivel: String) -> Dictionary:
	var escena: Node = (load(ruta) as PackedScene).instantiate()
	var camara: Camera2D = escena.get_node("Cirujano/Camara")
	var tam := Vector2(camara.limit_right - camara.limit_left, camara.limit_bottom - camara.limit_top)
	var pasos := []
	if escena.has_node("Pasos"):
		for paso in escena.get_node("Pasos").get_children():
			pasos.append({
				"nombre": String(paso.name),
				"centro": paso.position + paso.zona / 2.0,
				"destino": paso.destino,
				"con_e": paso.con_e,
				"escondido": paso.escondido_hasta_abrir,
				"pide_marca": paso.pide_marca,
			})
	var altares := []
	if escena.has_node("Altares"):
		for altar in escena.get_node("Altares").get_children():
			altares.append(altar.position)
	escena.free()
	return {"tam": tam, "pasos": pasos, "altares": altares, "nivel": nivel}


## El lado de la sala mas cercano a un punto: el paso sale por ahi.
static func _lado(tam: Vector2, punto: Vector2) -> Vector2:
	var distancias := {
		Vector2.LEFT: punto.x, Vector2.RIGHT: tam.x - punto.x,
		Vector2.UP: punto.y, Vector2.DOWN: tam.y - punto.y,
	}
	var lado := Vector2.LEFT
	for candidato in distancias:
		if distancias[candidato] < distancias[lado]:
			lado = candidato
	return lado


## Donde va la sala `b` si se llega a ella desde `a` por `paso`: pegada al lado
## por el que sale el paso, con su paso de vuelta a la altura del de ida.
static func _junto(sitio_a: Vector2, a: Dictionary, paso: Dictionary, b: Dictionary, ruta_a: String) -> Vector2:
	var ida: Vector2 = paso["centro"]
	var vuelta: Vector2 = b["tam"] / 2.0
	for otro in b["pasos"]:
		if otro["destino"] == ruta_a:
			vuelta = otro["centro"]
			break
	var lado := _lado(a["tam"], ida)
	var sitio := sitio_a + ida - vuelta
	match lado:
		Vector2.RIGHT:
			sitio.x = sitio_a.x + a["tam"].x
		Vector2.LEFT:
			sitio.x = sitio_a.x - b["tam"].x
		Vector2.DOWN:
			sitio.y = sitio_a.y + a["tam"].y
		Vector2.UP:
			sitio.y = sitio_a.y - b["tam"].y
	return sitio


func _escribir(salas: Dictionary, sitio: Dictionary) -> void:
	var texto := "## El plano del mapa: generado por herramientas/crear_plano.gd. No se edita a\n"
	texto += "## mano: se vuelve a correr la herramienta.\n\n"
	texto += "## La escala: un pixel del mapa son tantos de la sala.\nconst ESCALA := %s\n\n" % ESCALA
	texto += "## Sala -> su rectangulo en el mundo, su nivel, sus Altares y sus pasos\n"
	texto += "## (en el mundo; con su destino, para saber si ya se cruzo).\nconst SALAS := {\n"
	var rutas := sitio.keys()
	rutas.sort()
	for ruta in rutas:
		var sala: Dictionary = salas[ruta]
		var origen: Vector2 = sitio[ruta]
		var altares := ", ".join(sala["altares"].map(func(p: Vector2) -> String: return _v(origen + p)))
		var pasos := ", ".join(sala["pasos"].map(func(p: Dictionary) -> String:
			return "{\"centro\": %s, \"destino\": \"%s\", \"escondido\": %s}" % [_v(origen + p["centro"]), p["destino"], p["escondido"]]
		))
		texto += "\t\"%s\": {\n" % ruta
		texto += "\t\t\"rect\": Rect2(%s, %s),\n" % [_v(origen), _v(sala["tam"])]
		texto += "\t\t\"nivel\": \"%s\",\n" % sala["nivel"]
		texto += "\t\t\"altares\": [%s],\n" % altares
		texto += "\t\t\"pasos\": [%s],\n" % pasos
		texto += "\t},\n"
	texto += "}\n"
	var archivo := FileAccess.open(SALIDA, FileAccess.WRITE)
	archivo.store_string(texto)
	print("%d salas -> %s" % [sitio.size(), SALIDA])


static func _v(v: Vector2) -> String:
	return "Vector2(%d, %d)" % [roundi(v.x), roundi(v.y)]
