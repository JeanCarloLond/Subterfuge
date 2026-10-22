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
