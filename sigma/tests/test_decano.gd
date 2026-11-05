## El Decano de las Manos (#256): pelea de espejo. Para de frente y responde; si
## se le para la respuesta, se tambalea. Es ciego y oye: si miras, te encuentra.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/decano.tscn")
const CIRUJANO := preload("res://escenas/cirujano.tscn")
const Decano := preload("res://scripts/decano.gd")
const Sacramento := preload("res://scripts/sacramento.gd")
const Eslabon := preload("res://scripts/eslabon.gd")
const D := Sacramento.DECANO
const DT := 1.0 / 60.0
const LEJOS := Vector2(2000, 0)


func _despierto() -> Decano:
	var decano: Decano = ESCENA.instantiate()
	decano.despertar()
	decano.ahora = 5000.0
	decano._fin_enfriamiento = 0.0
	return decano


func _pensar(decano: Decano, pasos: int, hacia: Vector2) -> void:
	for i in pasos:
		decano.pensar(DT, hacia)
		decano.position.x += decano.velocity.x * DT


func test_dormido_no_hace_nada_ni_recibe() -> void:
	var decano: Decano = ESCENA.instantiate()
	_pensar(decano, 60, Vector2(10, 0))
	afirmar_igual(decano.estado, Decano.Estado.DORMIDO, "duerme")
	decano.recibir_dano(5, 10.0)
	afirmar_igual(decano.vida, D["vida"], "ni le entra el golpe")
	decano.free()


func test_de_cerca_tajo_y_de_lejos_estocada() -> void:
	var decano := _despierto()
	_pensar(decano, 1, Vector2(D["tajo"]["alcance"] - 4.0, 0))
	afirmar_igual(decano.estado, Decano.Estado.TAJO, "de cerca, el tajo")
	decano.free()
	decano = _despierto()
	_pensar(decano, 1, Vector2(D["estocada"]["alcance"] - 4.0, 0))
	afirmar_igual(decano.estado, Decano.Estado.ESTOCADA, "a media distancia, la estocada")
	decano.free()
	decano = _despierto()
	_pensar(decano, 1, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.ANDAR, "de lejos, anda hacia ti")
	afirmar_igual(decano.velocity.x, D["velocidad"], "a su paso")
	decano.free()


func test_para_de_frente_y_responde_con_el_contragolpe() -> void:
	var decano := _despierto()
	decano.mirando = 1
	var vida := decano.vida
	afirmar(decano.cubre(20.0), "de frente, para")
	decano.recibir_dano(3, 20.0)
	afirmar_igual(decano.vida, vida, "no le entra")
	afirmar_igual(decano.estado, Decano.Estado.CONTRA, "y responde")
	afirmar(decano._fin_accion - decano.ahora < D["tajo"]["anticipacion_ms"], "más rápido que un tajo")
	decano.free()


func test_por_la_espalda_y_abierto_le_entra() -> void:
	var decano := _despierto()
	decano.mirando = 1
	afirmar(not decano.cubre(-20.0), "por la espalda no para")
	decano.recibir_dano(3, -20.0)
	afirmar_igual(decano.vida, D["vida"] - 3, "le entra")
	for estado in [Decano.Estado.TAJO, Decano.Estado.ESTOCADA, Decano.Estado.RECUPERA, Decano.Estado.ATURDIDO]:
		decano.estado = estado
		afirmar(not decano.cubre(20.0), "abierto en el estado %d" % estado)
	decano.free()


func test_si_miras_te_encuentra() -> void:
	var decano := _despierto()
	var cirujano := CIRUJANO.instantiate()
	decano.objetivo = cirujano
	decano._fin_enfriamiento = INF
	cirujano.mirando = false
	_pensar(decano, 120, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.ANDAR, "sin mirar, anda")
	cirujano.mirando = true
	_pensar(decano, int(D["acude_tras_ms"] / (DT * 1000.0)) + 2, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.ACUDE, "mirando un rato, acude")
	decano.pensar(DT, LEJOS)
	afirmar_igual(decano.velocity.x, D["velocidad_acude"], "corriendo")
	afirmar(D["velocidad_acude"] > D["velocidad"] * 3.0, "mucho más rápido que andando")
	decano.position = Vector2(0, 0)
	decano.pensar(DT, Vector2(10, 0))
	afirmar_igual(decano.estado, Decano.Estado.TAJO, "al llegar, tajo")
	afirmar(decano._fin_accion - decano.ahora < D["tajo"]["anticipacion_ms"], "con menos aviso")
	decano.free()
	cirujano.free()


func test_mirar_un_momento_no_lo_trae() -> void:
	var decano := _despierto()
	var cirujano := CIRUJANO.instantiate()
	decano.objetivo = cirujano
	decano._fin_enfriamiento = INF
	cirujano.mirando = true
	_pensar(decano, 10, LEJOS)
	cirujano.mirando = false
	_pensar(decano, 1, LEJOS)
	cirujano.mirando = true
	_pensar(decano, 10, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.ANDAR, "a ratos cortos no acude")
	decano.free()
	cirujano.free()


func test_en_la_fase_dos_el_tajo_viene_doble() -> void:
	var decano := _despierto()
	decano.en_fase_dos = true
	decano._empezar(Decano.Estado.TAJO, 10.0)
	_pensar(decano, 2, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.TAJO, "viene otro")
	_pensar(decano, int(D["tajo"]["anticipacion_segundo_ms"] / (DT * 1000.0)) + 2, LEJOS)
	afirmar_igual(decano.estado, Decano.Estado.RECUPERA, "y al segundo descansa")
	decano.free()


func test_a_la_mitad_cambia_y_vencido_se_arrodilla() -> void:
	var decano := _despierto()
	decano.mirando = -1
	decano.recibir_dano(int(D["vida"] * D["fase_dos"]), 20.0)
	afirmar(decano.en_fase_dos, "por debajo de la mitad, la fase dos")
	decano.mirando = -1
	decano.recibir_dano(9999, 20.0)
	afirmar_igual(decano.estado, Decano.Estado.VENCIDO, "se arrodilla")
	afirmar(decano.vivo() and decano.ejecutable(), "y se le remata")
	var caido := [false]
	decano.cae.connect(func() -> void: caido[0] = true)
	decano.rematar()
	afirmar(caido[0], "rematado, cae")
	afirmar(not decano.vivo(), "y ya no está")
	decano.free()


func test_habla_como_el_mundo_y_es_un_eslabon() -> void:
	var todas: Array = Decano.FRASES.values() + Decano.CORRECCIONES
	for frase: String in todas:
		afirmar(frase.length() <= 28, "«%s» no cabe sobre la cabeza" % frase)
	var decano: Decano = ESCENA.instantiate()
	afirmar_igual(Eslabon.tipo_de(decano), "decano", "su tipo")
	afirmar(not Eslabon.ULTIMAS["decano"].is_empty(), "tiene últimas palabras")
	decano.free()
