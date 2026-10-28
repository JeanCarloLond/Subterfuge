## Estirar y aplastar (#235): cada gesto empieza en su escala, vuelve a la
## normal en su tiempo y no se pasa de largo.
extends "res://tests/caso.gd"

const Gesto := preload("res://scripts/gesto.gd")


func test_cada_gesto_empieza_en_su_escala_y_acaba_en_la_normal() -> void:
	for tipo in Gesto.GESTOS:
		var G: Dictionary = Gesto.GESTOS[tipo]
		afirmar_igual(Gesto.escala(tipo, 0.0), G["escala"], "gesto %d: empieza en su escala" % tipo)
		afirmar_igual(Gesto.escala(tipo, G["ms"]), Vector2.ONE, "gesto %d: acaba en la normal" % tipo)
		afirmar_igual(Gesto.giro(tipo, G["ms"]), 0.0, "gesto %d: acaba derecho" % tipo)


func test_vuelve_sin_pasarse() -> void:
	for tipo in Gesto.GESTOS:
		var G: Dictionary = Gesto.GESTOS[tipo]
		var antes := 1.0
		for ms in range(0, int(G["ms"]) + 20, 10):
			var r := Gesto.resto(tipo, ms)
			afirmar(r <= antes and r >= 0.0, "gesto %d: a los %d ms solo baja (%s)" % [tipo, ms, r])
			antes = r


func test_aplastarse_conserva_mas_o_menos_el_cuerpo() -> void:
	# Lo que se ensancha se achata: si no, parece que crece o que encoge.
	for tipo in Gesto.GESTOS:
		var e: Vector2 = Gesto.GESTOS[tipo]["escala"]
		afirmar_cerca(e.x * e.y, 1.0, 0.06, "gesto %d: área parecida" % tipo)


func test_la_fuerza_suaviza_y_sin_gesto_no_cambia_nada() -> void:
	var fuerte := Gesto.escala(Gesto.Tipo.ATERRIZAJE, 0.0, 1.0)
	var suave := Gesto.escala(Gesto.Tipo.ATERRIZAJE, 0.0, 0.4)
	afirmar(suave.y > fuerte.y and suave.y < 1.0, "una caída corta aplasta menos")
	afirmar_igual(Gesto.escala(Gesto.Tipo.NINGUNO, 0.0), Vector2.ONE, "sin gesto")
	afirmar_igual(Gesto.escala(Gesto.Tipo.HERIDA, -5.0), Vector2.ONE, "antes de empezar, nada")


func test_herido_se_echa_atras() -> void:
	afirmar(Gesto.giro(Gesto.Tipo.HERIDA, 0.0) < 0.0, "inclinado contra donde mira")
