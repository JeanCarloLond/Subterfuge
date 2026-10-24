## Los objetivos (#215): como se leen, como cuentan y que se guardan.
extends "res://tests/caso.gd"

const Objetivos := preload("res://scripts/objetivos.gd")
const Progreso := preload("res://scripts/progreso.gd")
const RUTA_PRUEBA := "user://partida-de-objetivos.cfg"


func _progreso() -> Node:
	var progreso: Node = Progreso.new()
	progreso.ruta = RUTA_PRUEBA
	progreso.nueva()
	return progreso


func test_el_texto_lleva_su_contador() -> void:
	afirmar_igual(Objetivos.texto("muros"), "Averigua por qué se mueven los muros", "sin contador")
	afirmar_igual(Objetivos.texto("registros", 1), "Reúne los registros de Génesis (1/3)", "con contador")
	afirmar_igual(Objetivos.texto("registros", 7), "Reúne los registros de Génesis (3/3)", "no pasa del total")
	afirmar_igual(Objetivos.texto("nada"), "", "uno que no existe")


func test_los_de_la_nina_tienen_otro_color() -> void:
	afirmar(Objetivos.de_la_nina("adentro"), "«Ve hacia dentro» es de ella")
	afirmar(not Objetivos.de_la_nina("muros"), "el primero es del Cirujano")
	afirmar(Objetivos.color("adentro") != Objetivos.color("muros"), "y se pinta distinto")


func test_cada_objetivo_tiene_texto_y_su_siguiente_existe() -> void:
	for id in Objetivos.CATALOGO:
		afirmar(Objetivos.texto(id) != "", "%s sin texto" % id)
		var siguiente := Objetivos.siguiente(id)
		afirmar(siguiente == "" or Objetivos.existe(siguiente), "%s lleva a uno que no existe" % id)


func test_contar_avanza_y_al_completar_pasa_al_siguiente() -> void:
	var progreso := _progreso()
	var avisos := []
	progreso.objetivo_cambio.connect(func(id: String) -> void: avisos.append(id))
	progreso.fijar_objetivo("registros")
	progreso.contar("registros", "escribania")
	progreso.contar("registros", "escribania")
	afirmar_igual(progreso.texto_objetivo(), "Reúne los registros de Génesis (1/3)", "cada registro cuenta una vez")
	progreso.contar("registros", "archivo")
	progreso.contar("registros", "ala")
	afirmar_igual(progreso.objetivo, "laboratorio", "con los tres, al laboratorio")
	afirmar_igual(avisos, ["registros", "registros", "registros", "laboratorio"], "cada avance se avisa")
	progreso.nueva()
	progreso.free()


func test_lo_hallado_antes_de_tiempo_cuenta() -> void:
	var progreso := _progreso()
	progreso.fijar_objetivo("muros")
	for registro in ["escribania", "archivo", "ala"]:
		progreso.contar("registros", registro)
	afirmar_igual(progreso.objetivo, "muros", "contar no cambia el objetivo de ahora")
	progreso.fijar_objetivo("registros")
	afirmar_igual(progreso.objetivo, "laboratorio", "ya estaban todos: se salta al siguiente")
	progreso.nueva()
	progreso.free()


func test_el_objetivo_se_guarda_y_empezar_lo_borra() -> void:
	var antes := _progreso()
	antes.fijar_objetivo("registros")
	antes.contar("registros", "archivo")
	var despues: Node = Progreso.new()
	despues.ruta = RUTA_PRUEBA
	despues.cargar()
	afirmar_igual(despues.objetivo, "registros", "el objetivo sigue")
	afirmar_igual(despues.cuenta("registros"), 1, "y lo contado")
	despues.nueva()
	afirmar_igual(despues.objetivo, "", "empezar lo borra")
	afirmar_igual(despues.cuenta("registros"), 0, "y la cuenta")
	antes.free()
	despues.free()
