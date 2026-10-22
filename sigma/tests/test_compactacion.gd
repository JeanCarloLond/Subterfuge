## El ciclo de la compactacion (#186): cuando avisa, cuanto avanza y que nunca
## se mueve sin avisar.
extends "res://tests/caso.gd"

const Compactacion := preload("res://scripts/compactacion.gd")
const DT := 1.0 / 60.0


## Pasos hasta que el ciclo entra en `estado`, o -1 si no llega en `maximo`.
## Los tiempos se comparan con un paso de margen: 240 pasos de 1/60 s suman
## 3999,99 ms y el cambio cae en el siguiente.
func _pasos_hasta(ciclo: Compactacion, estado: Compactacion.Estado, maximo := 2000) -> int:
	for n in maximo:
		if ciclo.estado == estado:
			return n
		ciclo.paso(DT)
	return -1


func test_reposa_4_s_y_avisa_1_5_s_antes_de_moverse() -> void:
	var ciclo := Compactacion.new(96.0)
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.AVISO), 240, 1, "4 s de reposo")
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.AVANCE), 90, 1, "1,5 s de aviso")


func test_nunca_se_mueve_sin_avisar() -> void:
	var ciclo := Compactacion.new(96.0)
	var aviso_visto := false
	for n in 1500: # 25 s: varios ciclos completos
		var antes := ciclo.estado
		var movido := ciclo.paso(DT)
		if antes == Compactacion.Estado.AVISO:
			aviso_visto = true
		if movido > 0.0:
			afirmar(aviso_visto, "avanzo en el paso %d sin haber avisado" % n)
		if antes == Compactacion.Estado.REPOSO:
			afirmar_igual(movido, 0.0, "en reposo no se mueve")
		if ciclo.estado == Compactacion.Estado.REPOSO:
			aviso_visto = false


func test_avanza_a_32_px_por_segundo_hasta_su_recorrido() -> void:
	var ciclo := Compactacion.new(96.0)
	_pasos_hasta(ciclo, Compactacion.Estado.AVANCE)
	var movido := 0.0
	for n in 60:
		movido += ciclo.paso(DT)
	afirmar_cerca(movido, 32.0, 0.01, "un segundo de avance")
	_pasos_hasta(ciclo, Compactacion.Estado.CERRADO)
	afirmar_igual(ciclo.avance, 96.0, "se para justo en su recorrido")


func test_cerrado_2_s_y_vuelve_a_su_sitio() -> void:
	var ciclo := Compactacion.new(96.0)
	_pasos_hasta(ciclo, Compactacion.Estado.CERRADO)
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.RETROCESO), 120, 1, "2 s cerrado")
	# 96 px a 48 px/s: 2 s.
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.REPOSO), 120, 1, "2 s volviendo")
	afirmar_igual(ciclo.avance, 0.0, "en su sitio")


func test_el_desfase_retrasa_el_primer_aviso() -> void:
	var ciclo := Compactacion.new(96.0, true, 1000.0)
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.AVISO), 300, 1, "4 s mas 1 s de desfase")


func test_un_cierre_no_se_mueve_hasta_que_lo_disparan() -> void:
	var ciclo := Compactacion.new(64.0, false)
	afirmar_igual(_pasos_hasta(ciclo, Compactacion.Estado.AVISO, 600), -1, "10 s quieto")
	ciclo.disparar()
	afirmar_igual(ciclo.estado, Compactacion.Estado.AVISO, "al dispararlo avisa")
	afirmar_cerca(_pasos_hasta(ciclo, Compactacion.Estado.AVANCE), 90, 1, "1,5 s de aviso")


func test_un_cierre_se_queda_cerrado() -> void:
	var ciclo := Compactacion.new(64.0, false)
	ciclo.disparar()
	_pasos_hasta(ciclo, Compactacion.Estado.CERRADO)
	afirmar_igual(_pasos_hasta(ciclo, Compactacion.Estado.RETROCESO, 1200), -1, "20 s despues sigue cerrado")
	afirmar_igual(ciclo.avance, 64.0, "del todo")
	ciclo.disparar()
	afirmar_igual(ciclo.estado, Compactacion.Estado.CERRADO, "dispararlo otra vez no lo reabre")


func test_el_empuje_saca_la_caja_por_delante_del_muro() -> void:
	var caja := Rect2(95, 0, 10, 22)
	afirmar_igual(Compactacion.empuje(caja, Rect2(0, 0, 100, 50), Vector2(1, 0)), Vector2(5, 0), "hacia la derecha")
	afirmar_igual(Compactacion.empuje(caja, Rect2(100, 0, 50, 50), Vector2(-1, 0)), Vector2(-5, 0), "hacia la izquierda")
	afirmar_igual(Compactacion.empuje(caja, Rect2(0, -40, 200, 50), Vector2(0, 1)), Vector2(0, 10), "un techo que baja")
	afirmar_igual(Compactacion.empuje(caja, Rect2(0, 200, 200, 50), Vector2(0, 1)), Vector2.ZERO, "si no se tocan, nada")
	afirmar_igual(Compactacion.empuje(caja, Rect2(105, 0, 50, 50), Vector2(-1, 0)), Vector2.ZERO, "rozar el borde no es tocar")


func test_el_retumbo_del_temblor_dura_lo_que_el_temblor() -> void:
	var retumbo := preload("res://scripts/sonidos.gd").retumbo()
	var segundos := retumbo.data.size() / 2.0 / retumbo.mix_rate
	var dura: float = preload("res://scripts/sacramento.gd").TEMBLOR["dura_s"]
	afirmar(segundos >= dura, "suena al menos lo que tiembla (%.2f s)" % segundos)
