## Los peligros (#217): el ritmo del rayo y el vaiven de la sierra.
extends "res://tests/caso.gd"

const Peligros := preload("res://scripts/peligros.gd")
const R := preload("res://scripts/sacramento.gd").RAYO


func test_el_rayo_avisa_antes_de_quemar() -> void:
	afirmar_igual(Peligros.fase_rayo(0.0)[0], Peligros.Fase.APAGADO, "empieza apagado")
	var aviso: float = R["apagado_ms"] + 1.0
	afirmar_igual(Peligros.fase_rayo(aviso)[0], Peligros.Fase.AVISO, "luego avisa")
	var activo: float = R["apagado_ms"] + R["aviso_ms"] + 1.0
	afirmar_igual(Peligros.fase_rayo(activo)[0], Peligros.Fase.ACTIVO, "y luego quema")
	afirmar_igual(Peligros.fase_rayo(Peligros.ciclo_rayo_ms() + 1.0)[0], Peligros.Fase.APAGADO, "y vuelve a empezar")


func test_nunca_quema_sin_haber_avisado() -> void:
	var antes: int = Peligros.Fase.APAGADO
	var ms := 0.0
	while ms < Peligros.ciclo_rayo_ms() * 3.0:
		var fase: int = Peligros.fase_rayo(ms, 333.0)[0]
		if fase == Peligros.Fase.ACTIVO and antes != Peligros.Fase.ACTIVO:
			afirmar_igual(antes, Peligros.Fase.AVISO, "a los %d ms quema sin aviso" % ms)
		antes = fase
		ms += 16.0


func test_el_aviso_se_puede_leer() -> void:
	afirmar(R["aviso_ms"] >= 700.0, "el aviso dura lo bastante para cruzar pensando")


func test_el_desfase_mueve_el_ritmo() -> void:
	var desfase: float = R["apagado_ms"]
	afirmar_igual(Peligros.fase_rayo(0.0, desfase)[0], Peligros.Fase.AVISO, "desfasado, ya avisa")


func test_la_sierra_va_y_vuelve_por_su_rail() -> void:
	afirmar_cerca(Peligros.vaiven(0.0, 100.0, 50.0), 0.0, 0.01, "sale del principio")
	afirmar_cerca(Peligros.vaiven(1.0, 100.0, 50.0), 50.0, 0.01, "a su velocidad")
	afirmar_cerca(Peligros.vaiven(2.0, 100.0, 50.0), 100.0, 0.01, "llega al final")
	afirmar_cerca(Peligros.vaiven(3.0, 100.0, 50.0), 50.0, 0.01, "y vuelve")
	afirmar_cerca(Peligros.vaiven(5.0, 0.0, 50.0), 0.0, 0.01, "sin rail, quieta")


func test_la_sierra_toca_la_caja() -> void:
	var caja := Rect2(-5, -22, 10, 22)
	afirmar(Peligros.circulo_toca(Vector2(10, -10), 6.0, caja), "a 5 px del borde con radio 6, toca")
	afirmar(not Peligros.circulo_toca(Vector2(20, -10), 6.0, caja), "a 15, no")
	afirmar(not Peligros.circulo_toca(Vector2(9, 4), 4.0, caja), "por la esquina, no")
