## Las piezas del Nivel III (#254): el Remedo y el Asistente.
extends "res://tests/caso.gd"

const Sacramento := preload("res://scripts/sacramento.gd")
const Remedo := preload("res://scripts/remedo.gd")
const Pieza := preload("res://scripts/remedo_pieza.gd")
const ASISTENTE := preload("res://escenas/asistente.tscn")
const Asistente := preload("res://scripts/asistente.gd")
const Eslabon := preload("res://scripts/eslabon.gd")
const R := Sacramento.REMEDO
const DT := 1.0 / 60.0


func test_el_remedo_no_salta_si_no_pasas_cerca() -> void:
	var remedo := Remedo.new()
	for i in 120:
		afirmar(not remedo.pensar(DT, Vector2(R["rango_x"] + 40.0, 0)), "lejos, quieto")
	afirmar_igual(remedo.estado, Remedo.Estado.QUIETO, "sigue quieto")
	for i in 60:
		remedo.pensar(DT, Vector2(0, -(R["rango_y"] + 20.0)))
	afirmar_igual(remedo.estado, Remedo.Estado.QUIETO, "ni si pasas muy por encima")
	remedo.free()


func test_el_remedo_avisa_salta_una_vez_y_recarga() -> void:
	var remedo := Remedo.new()
	var cerca := Vector2(30, 0)
	afirmar(not remedo.pensar(DT, cerca), "al verte no salta aún")
	afirmar_igual(remedo.estado, Remedo.Estado.AVISO, "avisa")
	var saltos := 0
	var hasta_saltar := 0.0
	while saltos == 0 and hasta_saltar < 2000.0:
		hasta_saltar += DT * 1000.0
		if remedo.pensar(DT, cerca):
			saltos += 1
	afirmar(hasta_saltar >= R["aviso_ms"] - 20.0, "el aviso dura lo suyo (%d ms)" % hasta_saltar)
	afirmar_igual(remedo.estado, Remedo.Estado.RECARGA, "la bandeja se queda vacía")
	for i in int(R["recarga_ms"] / (DT * 1000.0)) - 5:
		afirmar(not remedo.pensar(DT, cerca), "mientras recarga no salta")
	for i in 10:
		remedo.pensar(DT, Vector2(1000, 0))
	afirmar_igual(remedo.estado, Remedo.Estado.QUIETO, "y vuelve a estar lista")
	remedo.free()


func test_el_instrumento_llega_a_donde_estabas() -> void:
	var desde := Vector2(0, -8)
	var hacia := Vector2(60, -14)
	var v := Pieza.lanzamiento(desde, hacia, R["vuelo_s"], R["gravedad"])
	var t: float = R["vuelo_s"]
	var llega := desde + v * t + Vector2(0, 0.5 * R["gravedad"] * t * t)
	afirmar(llega.distance_to(hacia) < 0.5, "llega al sitio (%s)" % llega)
	afirmar(v.y < 0.0, "y sale hacia arriba, en arco")


func test_la_bandeja_para_de_frente_y_no_por_la_espalda() -> void:
	var asistente: Asistente = ASISTENTE.instantiate()
	asistente.mirando = 1
	afirmar(asistente.cubre(30.0), "de frente, para")
	afirmar(not asistente.cubre(-30.0), "por la espalda, no")
	var vida: int = asistente.vida
	asistente.recibir_dano(2, 30.0)
	afirmar_igual(asistente.vida, vida, "el golpe de frente no hiere")
	asistente.recibir_dano(2, -30.0)
	afirmar_igual(asistente.vida, vida - 2, "por la espalda, sí")
	asistente.free()


func test_con_el_brazo_alzado_o_aturdido_no_cubre() -> void:
	var asistente: Asistente = ASISTENTE.instantiate()
	asistente.mirando = 1
	for estado in [Asistente.Estado.ANTICIPANDO, Asistente.Estado.ATACANDO, Asistente.Estado.ATURDIDO]:
		asistente.estado = estado
		afirmar(not asistente.cubre(30.0), "en el estado %d, abierto" % estado)
	asistente.free()


func test_el_asistente_es_un_eslabon_con_sus_palabras() -> void:
	var asistente: Asistente = ASISTENTE.instantiate()
	afirmar_igual(Eslabon.tipo_de(asistente), "asistente", "su tipo")
	afirmar(not Eslabon.ULTIMAS["asistente"].is_empty(), "tiene últimas palabras")
	asistente.free()
