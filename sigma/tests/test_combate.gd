## El combate (#183): las ventanas del golpe y del parry, el Fervor, el golpe
## cargado y la Pocion, paso a paso como en el juego.
##
## Los tiempos se comparan con un paso de margen: los pasos de 1/60 s no caen
## justo en los milisegundos redondos.
extends "res://tests/caso.gd"

const Combate := preload("res://scripts/combate.gd")
const DT := 1.0 / 60.0


func _entrada(golpe := false, soltar := false, parry := false, pocion := false, arriba := false, abajo := false) -> Combate.Entrada:
	var e := Combate.Entrada.new()
	e.golpe_pulsado = golpe
	e.golpe_soltado = soltar
	e.parry_pulsado = parry
	e.pocion_pulsada = pocion
	e.arriba = arriba
	e.abajo = abajo
	return e


func _pasos(combate: Combate, n: int, entrada := _entrada(), en_suelo := true) -> void:
	for i in n:
		combate.paso(DT, entrada, combate.accion == Combate.Accion.NINGUNA, en_suelo)


## Milisegundos (en pasos) hasta que `condicion` se cumple, o -1.
func _ms_hasta(combate: Combate, condicion: Callable, maximo := 120) -> float:
	var inicio := combate.ahora
	for i in maximo:
		if condicion.call():
			return combate.ahora - inicio
		_pasos(combate, 1)
	return -1.0


func test_el_golpe_hace_dano_de_60_a_170_ms() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), true, true)
	afirmar_cerca(combate.bloqueo_ms, 170.0, 0.01, "el cuerpo se queda quieto lo que dura el golpe")
	afirmar(not combate.zona_activa(), "al pulsar aun no corta: anticipacion")
	afirmar_cerca(_ms_hasta(combate, combate.zona_activa), 60.0, 17.0, "empieza a cortar a los 60 ms")
	afirmar_cerca(_ms_hasta(combate, func() -> bool: return not combate.zona_activa()), 110.0, 17.0, "corta 110 ms")


func test_entre_golpe_y_golpe_hay_300_ms() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 25) # 433 ms: 170 de golpe y 263 de enfriamiento
	combate.paso(DT, _entrada(true), true, true)
	afirmar_igual(combate.accion, Combate.Accion.NINGUNA, "a los 450 ms aun no sale otro")
	_pasos(combate, 2)
	combate.paso(DT, _entrada(true), true, true)
	afirmar_igual(combate.accion, Combate.Accion.GOLPE, "pasados los 470, si")


func test_cada_golpe_da_una_vez_a_cada_enemigo() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), true, true)
	afirmar_igual(combate.registrar_golpe(1), 2, "el basico quita 2")
	afirmar_igual(combate.registrar_golpe(1), 0, "el mismo golpe no repite")
	afirmar_igual(combate.registrar_golpe(2), 2, "a otro si le da")
	afirmar_igual(combate.fervor, 12, "6 de Fervor por golpe asestado")


func test_el_parry_para_durante_140_ms() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(false, false, true), true, true)
	afirmar_igual(combate.accion, Combate.Accion.PARRY, "sale al pulsar")
	_pasos(combate, 7) # 117 ms
	afirmar(combate.parar(), "a los 117 ms para")
	afirmar_igual(combate.fervor, 20, "y paga 20 de Fervor")
	afirmar(not combate.parar(), "una vez: la ventana se cierra al parar")

	combate = Combate.new()
	combate.paso(DT, _entrada(false, false, true), true, true)
	_pasos(combate, 9) # 150 ms
	afirmar(not combate.parar(), "a los 150 ms ya no")


func test_tras_el_parry_hay_que_esperar_480_ms() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(false, false, true), true, true)
	_pasos(combate, 35) # 583 ms, la ventana acabo a los 140
	combate.paso(DT, _entrada(false, false, true), true, true)
	afirmar(combate.accion != Combate.Accion.PARRY, "a los 600 ms aun no")
	_pasos(combate, 2)
	combate.paso(DT, _entrada(false, false, true), true, true)
	afirmar_igual(combate.accion, Combate.Accion.PARRY, "pasados los 620, si")


func test_el_cargado_pide_450_ms_y_30_de_fervor() -> void:
	var combate := Combate.new()
	combate.fervor = 40
	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 28) # 483 ms mantenido
	combate.paso(DT, _entrada(false, true), true, true)
	afirmar_igual(combate.tipo, Combate.Tipo.CARGADO, "al soltar sale el cargado")
	afirmar_igual(combate.fervor, 10, "cuesta 30")
	afirmar_cerca(combate.bloqueo_ms, 260.0, 0.01, "110 de anticipacion y 150 de corte")
	afirmar_igual(combate.registrar_golpe(1), 6, "quita 6")


func test_sin_fervor_o_soltando_pronto_no_hay_cargado() -> void:
	var combate := Combate.new()
	combate.fervor = 20
	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 28)
	combate.paso(DT, _entrada(false, true), true, true)
	afirmar(combate.accion != Combate.Accion.GOLPE, "con 20 de Fervor no sale")
	afirmar_igual(combate.fervor, 20, "y no lo gasta")

	combate = Combate.new()
	combate.fervor = 40
	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 20) # 350 ms
	combate.paso(DT, _entrada(false, true), true, true)
	afirmar(combate.accion != Combate.Accion.GOLPE, "soltando a los 350 ms no sale")


func test_el_fervor_no_pasa_de_100() -> void:
	var combate := Combate.new()
	for i in 10:
		combate.paso(DT, _entrada(false, false, true), true, true)
		combate.parar()
		_pasos(combate, 40)
	afirmar_igual(combate.fervor, 100, "diez parrys: tope en 100")


func test_abajo_solo_en_el_aire() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true, false, false, false, false, true), true, true)
	afirmar_igual(combate.direccion, Combate.Direccion.LATERAL, "en el suelo, abajo es un golpe normal")
	combate = Combate.new()
	combate.paso(DT, _entrada(true, false, false, false, false, true), true, false)
	afirmar_igual(combate.direccion, Combate.Direccion.ABAJO, "en el aire, hacia abajo")
	var zona := combate.zona(Vector2.ZERO, 1)
	afirmar(zona.position.y >= -2.0 and zona.end.y > 20.0, "bajo los pies")


func test_el_rebote_deja_volver_a_golpear_en_90_ms() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true, false, false, false, false, true), true, false)
	_pasos(combate, 5, _entrada(), false)
	combate.rebotar()
	afirmar_igual(combate.accion, Combate.Accion.NINGUNA, "el rebote cierra el golpe")
	_pasos(combate, 6, _entrada(), false) # 100 ms
	combate.paso(DT, _entrada(true, false, false, false, false, true), true, false)
	afirmar_igual(combate.accion, Combate.Accion.GOLPE, "y en 100 ms sale otro")


func test_la_pocion_cura_3_tres_veces() -> void:
	var combate := Combate.new()
	for i in 3:
		combate.paso(DT, _entrada(false, false, false, true), true, true)
		afirmar_igual(combate.curar, 3, "cura 3")
		afirmar_cerca(combate.bloqueo_ms, 600.0, 0.01, "el trago deja quieto 600 ms")
		_pasos(combate, 40)
	combate.paso(DT, _entrada(false, false, false, true), true, true)
	afirmar_igual(combate.curar, 0, "la cuarta no hay")
	combate.reponer_pociones()
	afirmar_igual(combate.cargas_pocion, 3, "el Altar llena el frasco")


func test_herido_se_corta_el_golpe() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 5)
	combate.cancelar()
	afirmar(not combate.zona_activa(), "ya no corta")


func test_ocupado_no_empieza_nada() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), false, true)
	afirmar_igual(combate.accion, Combate.Accion.NINGUNA, "en un dash o colgado no se golpea")


func test_soltar_sin_haber_cargado_no_saca_el_cargado() -> void:
	var combate := Combate.new()
	combate.fervor = 40
	_pasos(combate, 40)
	combate.paso(DT, _entrada(false, true), true, true)
	afirmar(combate.accion != Combate.Accion.GOLPE, "soltar sin haber pulsado no hace nada")

	combate.paso(DT, _entrada(true), true, true)
	_pasos(combate, 5)
	combate.cancelar() # le dan mientras carga
	_pasos(combate, 30)
	combate.paso(DT, _entrada(false, true), true, true)
	afirmar(combate.accion != Combate.Accion.GOLPE, "si lo hieren cargando, la carga se pierde")
	afirmar_igual(combate.fervor, 40, "y el Fervor no se gasta")


# -- Lo de Blasphemous: contragolpe y ejecucion --------------------------------

## Para un golpe con el parry y devuelve el combate justo despues.
func _tras_parry() -> Combate:
	var combate := Combate.new()
	combate.paso(DT, _entrada(false, false, true), true, true)
	_pasos(combate, 3)
	afirmar(combate.parar(), "el parry para")
	return combate


func test_golpear_tras_un_parry_saca_el_contragolpe() -> void:
	var combate := _tras_parry()
	afirmar(combate.contragolpe_listo(), "la ventana se abre al parar")
	# El parry aun tiene quieto al cuerpo: el contragolpe tiene que cortarlo.
	combate.paso(DT, _entrada(true), false, true)
	afirmar_igual(combate.accion, Combate.Accion.GOLPE, "sale aunque el parry no haya acabado")
	afirmar_igual(combate.tipo, Combate.Tipo.CONTRAGOLPE, "y es el contragolpe")
	afirmar(not combate.contragolpe_listo(), "uno por parry")
	afirmar_cerca(_ms_hasta(combate, combate.zona_activa), 30.0, 17.0, "casi sin aviso: 30 ms")
	afirmar_igual(combate.registrar_golpe(1), 6, "pega como el cargado")
	afirmar_igual(combate.fervor, 26, "sin gastar Fervor: 20 del parry y 6 del golpe")


func test_el_contragolpe_caduca_a_los_400_ms() -> void:
	var combate := _tras_parry()
	_pasos(combate, 25) # 417 ms
	afirmar(not combate.contragolpe_listo(), "a los 417 ms ya no")
	combate.paso(DT, _entrada(true), true, true)
	afirmar_igual(combate.tipo, Combate.Tipo.BASICO, "sale el golpe de siempre")


func test_sin_parry_no_hay_contragolpe() -> void:
	var combate := Combate.new()
	combate.paso(DT, _entrada(true), true, true)
	afirmar_igual(combate.tipo, Combate.Tipo.BASICO, "golpear sin parar antes es el basico")


func test_el_contragolpe_va_siempre_de_frente() -> void:
	var combate := _tras_parry()
	combate.paso(DT, _entrada(true, false, false, false, true), false, true)
	afirmar_igual(combate.direccion, Combate.Direccion.LATERAL, "aunque se pulse arriba")


func test_herido_se_pierde_el_contragolpe() -> void:
	var combate := _tras_parry()
	combate.cancelar()
	afirmar(not combate.contragolpe_listo(), "un golpe recibido cierra la ventana")


func test_la_ejecucion_dura_720_ms_y_paga_25_de_fervor() -> void:
	var combate := Combate.new()
	afirmar(combate.ejecutar(true), "libre, empieza")
	afirmar_igual(combate.accion, Combate.Accion.EJECUCION, "ejecutando")
	afirmar_cerca(combate.bloqueo_ms, 720.0, 0.01, "quieto lo que dura")
	afirmar_igual(combate.fervor, 25, "paga 25 de Fervor")
	afirmar(not combate.ejecucion_golpea(), "primero alza el bisturi")
	afirmar_cerca(_ms_hasta(combate, combate.ejecucion_golpea), 280.0, 17.0, "lo baja a los 280 ms")
	afirmar_cerca(
		_ms_hasta(combate, func() -> bool: return combate.accion == Combate.Accion.NINGUNA),
		440.0, 17.0, "y acaba a los 720")


func test_ocupado_no_ejecuta() -> void:
	var combate := Combate.new()
	afirmar(not combate.ejecutar(false), "con el cuerpo ocupado, no")
	combate.paso(DT, _entrada(true), true, true)
	afirmar(not combate.ejecutar(true), "en mitad de un golpe, tampoco")
