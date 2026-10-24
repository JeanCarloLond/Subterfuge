## Los dialogos a lo Stardew Valley (#216): el texto sale letra a letra, la E
## lo termina y luego pasa, y se para en la puntuacion.
extends "res://tests/caso.gd"

const Dialogo := preload("res://scripts/dialogo.gd")


func _dos_lineas() -> Dialogo:
	return Dialogo.new([
		{"quien": "El Cegado", "texto": "No vengas."},
		{"quien": "El Cegado", "texto": "Sigues aquí."},
	])


func test_el_texto_sale_letra_a_letra() -> void:
	var dialogo := _dos_lineas()
	afirmar_igual(dialogo.texto_visible(), "", "empieza vacio")
	# La primera sale al momento; luego, una cada 1/LETRAS_S.
	var salidas := dialogo.paso(2.0 / Dialogo.LETRAS_S + 0.001)
	afirmar_igual(dialogo.texto_visible(), "No ", "a su ritmo")
	afirmar_igual(salidas, 3, "y dice cuantas han salido, para la voz")
	afirmar_igual(dialogo.quien(), "El Cegado", "con quien habla")


func test_la_e_completa_la_linea_y_luego_pasa() -> void:
	var dialogo := _dos_lineas()
	dialogo.paso(0.05)
	afirmar(not dialogo.pulsar(), "la primera E no acaba")
	afirmar(dialogo.linea_completa(), "termina la linea de golpe")
	afirmar(dialogo.hay_mas(), "y queda otra: la flecha")
	afirmar(not dialogo.pulsar(), "la segunda E pasa")
	afirmar_igual(dialogo.texto_visible(), "", "la nueva empieza vacia")
	dialogo.pulsar()
	afirmar(not dialogo.hay_mas(), "la ultima no tiene flecha de «hay mas»")
	afirmar(dialogo.pulsar(), "y tras la ultima se acaba")
	afirmar(dialogo.terminado, "terminado")


func test_se_para_en_la_puntuacion() -> void:
	var con_coma := Dialogo.new([{"quien": "", "texto": "a, b"}])
	var sin_coma := Dialogo.new([{"quien": "", "texto": "aa b"}])
	var paso := 1.0 / Dialogo.LETRAS_S
	for i in 3:
		con_coma.paso(paso)
		sin_coma.paso(paso)
	afirmar(con_coma.visibles < sin_coma.visibles, "la coma retiene un momento")


func test_sin_lineas_esta_terminado() -> void:
	var dialogo := Dialogo.new([])
	afirmar(dialogo.terminado, "nada que decir")
	afirmar(dialogo.pulsar(), "la E lo da por acabado")
	afirmar_igual(dialogo.paso(1.0), 0, "y no sale nada")


func test_el_cegado_cambia_el_objetivo_y_no_usa_lexico_prohibido() -> void:
	var cegado: Node = load("res://escenas/cegado.tscn").instantiate()
	afirmar_igual(cegado.objetivo, "genesis", "tras hablar, a buscar Genesis")
	afirmar(cegado.lineas.size() > 3 and cegado.otra_vez.size() > 0, "tiene que decir")
	for texto in cegado.lineas + cegado.otra_vez:
		for prohibida in ["NPC", "boss", "HP", "mana", "checkpoint", "stamina"]:
			afirmar(not (" %s " % prohibida) in (" %s " % texto), "«%s» en: %s" % [prohibida, texto])
	cegado.free()
