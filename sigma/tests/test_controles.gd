## Las acciones del juego existen y tienen las teclas del original.
extends "res://tests/caso.gd"

const Controles := preload("res://scripts/controles.gd")


func _teclas_de(accion: String) -> Array[int]:
	var teclas: Array[int] = []
	for evento in InputMap.action_get_events(accion):
		if evento is InputEventKey:
			teclas.append(evento.physical_keycode)
	return teclas


func test_todas_las_acciones_quedan_registradas() -> void:
	Controles.registrar()
	for accion in Controles.ACCIONES:
		afirmar(InputMap.has_action(accion), "falta la accion %s" % accion)


func test_las_teclas_son_las_del_original() -> void:
	Controles.registrar()
	afirmar(KEY_SPACE in _teclas_de("saltar"), "saltar con espacio")
	afirmar(KEY_J in _teclas_de("golpear"), "golpear con J")
	afirmar(KEY_K in _teclas_de("parry"), "parry con K")
	afirmar(KEY_E in _teclas_de("interactuar"), "interactuar con E")


func test_registrar_dos_veces_no_duplica() -> void:
	Controles.registrar()
	Controles.registrar()
	afirmar_igual(_teclas_de("saltar").size(), 2, "teclas de saltar")


func test_cada_accion_se_puede_hacer_con_mando() -> void:
	Controles.registrar()
	var solo_teclado := ["ayuda", "silencio"]
	for accion in Controles.ACCIONES:
		if accion in solo_teclado:
			continue
		var con_mando := false
		for evento in InputMap.action_get_events(accion):
			if evento is InputEventJoypadButton or evento is InputEventJoypadMotion:
				con_mando = true
		afirmar(con_mando, "%s no se puede hacer con mando" % accion)


## Los carteles (#221) nombran las teclas en castellano, y las flechas para
## moverse; con mando, sus botones.
func test_los_nombres_de_las_teclas() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	afirmar_igual(Controles.nombre("saltar"), "Espacio", "saltar")
	afirmar_igual(Controles.nombre("izquierda"), "←", "moverse, con flechas")
	afirmar_igual(Controles.nombre("golpear"), "J", "golpear")
	afirmar_igual(Controles.nombre("saltar", true), "A", "saltar con mando")
	afirmar_igual(Controles.nombre("pocion", true), "LT", "la poción va en el gatillo")
	afirmar_igual(Controles.nombre("nada"), "?", "una que no existe")


func test_rellenar_cambia_las_acciones_por_sus_teclas() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	if not Input.get_connected_joypads().is_empty():
		return
	afirmar_igual(Controles.rellenar("{parry}  clávate · {arriba}  trepa"), "K  clávate · ↑  trepa", "las dos")


## En la web no hay fuentes del sistema (#237): lo que no tenga la fuente del
## juego, ni su reserva de flechas, sale como una caja.
func test_los_nombres_de_teclas_y_botones_se_pueden_dibujar() -> void:
	Controles.poner_flechas()
	var fuente: Font = load("res://arte/tema.tres").default_font
	var nombres: Array = Controles.NOMBRES_TECLA.values() + Controles.NOMBRES_MANDO.values()
	for nombre: String in nombres:
		for i in nombre.length():
			var c := nombre.unicode_at(i)
			var dibujable := fuente.has_char(c) or fuente.fallbacks.any(func(f: Font) -> bool: return f.has_char(c))
			afirmar(dibujable, "«%s» de «%s» no está en la fuente ni en su reserva" % [nombre[i], nombre])


func test_las_flechas_van_de_reserva_una_sola_vez() -> void:
	Controles.poner_flechas()
	Controles.poner_flechas()
	for ruta in Controles.FUENTES:
		var fuente: Font = load(ruta)
		afirmar_igual(fuente.fallbacks.count(Controles.FLECHAS), 1, "%s: flechas de reserva" % ruta.get_file())


## Un mando de PlayStation se reconoce por su nombre: el de SDL en escritorio y
## el del navegador en la web, que lleva el fabricante (054c, Sony).
func test_se_reconoce_un_mando_de_playstation() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	for nombre in [
		"PS5 Controller",
		"DualSense Wireless Controller",
		"Sony Interactive Entertainment Wireless Controller",
		"PS4 Controller",
		"DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
	]:
		afirmar_igual(Controles.familia_de(nombre), Controles.PLAYSTATION, nombre)
	for nombre in ["Xbox Series Controller", "XInput Gamepad (Xbox 360)", "Nintendo Switch Pro Controller", ""]:
		afirmar_igual(Controles.familia_de(nombre), Controles.XBOX, nombre)


## Con un mando de PlayStation, los carteles dicen sus botones.
func test_los_botones_de_playstation() -> void:
	var Controles: GDScript = load("res://scripts/controles.gd")
	var ps: String = Controles.PLAYSTATION
	afirmar_igual(Controles.nombre("saltar", true, ps), "✕", "saltar")
	afirmar_igual(Controles.nombre("golpear", true, ps), "□", "golpear")
	afirmar_igual(Controles.nombre("interactuar", true, ps), "△", "interactuar")
	afirmar_igual(Controles.nombre("dash", true, ps), "○", "dash")
	afirmar_igual(Controles.nombre("parry", true, ps), "L1", "parry")
	afirmar_igual(Controles.nombre("pocion", true, ps), "L2", "la poción, en el gatillo")
	afirmar_igual(Controles.nombre("pausa", true, ps), "Options", "pausa")
	afirmar_igual(Controles.nombre("mapa", true, ps), "Create", "mapa")
	afirmar_igual(Controles.nombre("saltar", false, ps), "Espacio", "sin mando, la tecla")


## La fuente de reserva tiene los simbolos: si no, en la web salen cajas.
func test_la_fuente_tiene_los_simbolos() -> void:
	var fuente: Font = load("res://arte/fuentes/FlechasSigma.ttf")
	for simbolo in ["✕", "○", "□", "△", "←", "→", "↑", "↓"]:
		afirmar(fuente.has_char(simbolo.unicode_at(0)), "falta %s en la fuente" % simbolo)
