## Alturas, alcances y tiempos del Cirujano (#182), medidos paso a paso como
## los da el juego y no con la formula: a 60 Hz un salto de 92 px en continuo
## sube 88,9, igual que en Arcade.
extends "res://tests/caso.gd"

const Movimiento := preload("res://scripts/movimiento.gd")
const Sacramento := preload("res://scripts/sacramento.gd")
const DT := 1.0 / 60.0


## Un mundo de mentira para probar sin fisica: suelo en `suelo_y` (hacia abajo
## es positivo, como en Godot) y, si se pide, una pared a la derecha en
## `pared_x`. El Cirujano mide 10 px de ancho.
class Mundo:
	var mov: Movimiento
	var pos := Vector2.ZERO
	var en_suelo := true
	var pared := 0
	var suelo_y := 0.0
	var pared_x := INF

	func _init(y := 0.0) -> void:
		pos.y = y
		en_suelo = y >= suelo_y
		mov = Movimiento.new(y)

	func paso(entrada: Movimiento.Entrada) -> void:
		mov.paso(DT, entrada, en_suelo, pared, pos.y)
		pos += mov.velocidad * DT
		en_suelo = false
		pared = 0
		if pos.y >= suelo_y and mov.velocidad.y >= 0.0:
			pos.y = suelo_y
			mov.velocidad.y = 0.0
			en_suelo = true
		if pos.x + 5.0 >= pared_x and mov.velocidad.x > 0.0:
			pos.x = pared_x - 5.0
			mov.velocidad.x = 0.0
			pared = 1

	func pasos(n: int, entrada: Movimiento.Entrada) -> void:
		for i in n:
			paso(entrada)


func _entrada(eje := 0, saltar := false, mantener := false, dash := false, arriba := false, abajo := false) -> Movimiento.Entrada:
	var e := Movimiento.Entrada.new()
	e.eje_x = eje
	e.saltar_pulsado = saltar
	e.saltar_mantenido = saltar or mantener
	e.dash_pulsado = dash
	e.arriba = arriba
	e.abajo = abajo
	return e


## Salta desde el suelo y devuelve lo mas alto que llegan los pies.
func _altura_de_salto(mantener: bool) -> float:
	var mundo := Mundo.new()
	mundo.paso(_entrada(0, true))
	var cima := mundo.pos.y
	while not mundo.en_suelo:
		mundo.paso(_entrada(0, false, mantener))
		cima = minf(cima, mundo.pos.y)
	return -cima


## Salta y espera a la cima, con el salto mantenido.
func _en_la_cima() -> Mundo:
	var mundo := Mundo.new()
	mundo.paso(_entrada(0, true))
	while mundo.mov.velocidad.y < 0.0:
		mundo.paso(_entrada(0, false, true))
	return mundo


## Deja caer al Cirujano desde `altura` y devuelve los danos que se avisaron.
func _caer_desde(altura: float) -> Array:
	var danos := []
	var mundo := Mundo.new(-altura)
	mundo.mov.caida.connect(func(dano: int, _altura: float) -> void: danos.append(dano))
	mundo.pasos(120, _entrada())
	return danos


func test_la_fisica_va_a_60_hz() -> void:
	afirmar_igual(Engine.physics_ticks_per_second, 60, "los numeros estan ajustados a 60 pasos por segundo")


func test_camina_hasta_130_y_no_mas() -> void:
	var mundo := Mundo.new()
	mundo.pasos(6, _entrada(1))
	afirmar_cerca(mundo.mov.velocidad.x, 130.0, 0.01, "en una decima de segundo ya va a tope")
	mundo.pasos(30, _entrada(1))
	afirmar_cerca(mundo.mov.velocidad.x, 130.0, 0.01, "no pasa de la velocidad de caminar")


func test_al_soltar_frena_en_un_instante() -> void:
	var mundo := Mundo.new()
	mundo.pasos(30, _entrada(1))
	mundo.pasos(5, _entrada())
	afirmar_igual(mundo.mov.velocidad.x, 0.0, "la friccion del suelo lo para en menos de 0,1 s")


func test_el_salto_mantenido_sube_unos_89_px() -> void:
	afirmar_cerca(_altura_de_salto(true), 88.9, 0.1, "salto mantenido")


func test_un_toque_da_un_saltito() -> void:
	var altura := _altura_de_salto(false)
	afirmar(altura > 5.0 and altura < 20.0, "soltar enseguida recorta el salto (salio %.1f px)" % altura)


func test_el_doble_salto_llega_a_unos_151_px() -> void:
	var mundo := _en_la_cima()
	mundo.paso(_entrada(0, true))
	var cima := mundo.pos.y
	while mundo.mov.velocidad.y < 0.0:
		mundo.paso(_entrada(0, false, true))
		cima = minf(cima, mundo.pos.y)
	afirmar_cerca(-cima, 150.7, 0.2, "salto y doble salto en la cima")


func test_no_hay_tercer_salto() -> void:
	var mundo := _en_la_cima()
	mundo.paso(_entrada(0, true))
	while mundo.mov.velocidad.y < 0.0:
		mundo.paso(_entrada(0, false, true))
	mundo.paso(_entrada(0, true))
	afirmar(mundo.mov.velocidad.y >= 0.0, "un tercer salto en el aire no hace nada")


func test_el_coyote_deja_saltar_justo_despues_de_salirse() -> void:
	var mundo := Mundo.new()
	mundo.pasos(10, _entrada(1))
	mundo.suelo_y = INF # se acaba el suelo
	mundo.pasos(4, _entrada(1)) # 67 ms en el aire
	mundo.paso(_entrada(1, true))
	afirmar_cerca(mundo.mov.velocidad.y, -430.0 + 1000.0 * DT, 0.01, "salto completo y no el doble")


func test_pasado_el_coyote_el_salto_es_el_doble() -> void:
	var mundo := Mundo.new()
	mundo.pasos(10, _entrada(1))
	mundo.suelo_y = INF
	mundo.pasos(8, _entrada(1)) # 133 ms en el aire
	mundo.paso(_entrada(1, true))
	afirmar_cerca(mundo.mov.velocidad.y, -360.0 + 1000.0 * DT, 0.01, "ya solo queda el doble salto")


## Cuantos pasos tarda en aterrizar tras saltar y gastar el doble salto.
func _pasos_hasta_aterrizar(pulsar_en := -1) -> Array:
	var mundo := _en_la_cima()
	mundo.paso(_entrada(0, true))
	var n := 0
	var salto_al_aterrizar := false
	while true:
		mundo.paso(_entrada(0, n == pulsar_en, true))
		n += 1
		if mundo.en_suelo:
			mundo.paso(_entrada(0, false, true))
			salto_al_aterrizar = mundo.mov.velocidad.y < 0.0
			break
	return [n, salto_al_aterrizar]


func test_el_salto_pulsado_poco_antes_de_aterrizar_se_guarda() -> void:
	var aterriza: int = _pasos_hasta_aterrizar()[0]
	# Se pulsa 5 pasos antes de tocar suelo (83 ms, dentro de los 120).
	afirmar(_pasos_hasta_aterrizar(aterriza - 5)[1], "salta en cuanto toca el suelo")


func test_el_salto_pulsado_demasiado_pronto_se_pierde() -> void:
	var aterriza: int = _pasos_hasta_aterrizar()[0]
	# 10 pasos antes (167 ms): ya no cuenta.
	afirmar(not _pasos_hasta_aterrizar(aterriza - 10)[1], "no salta al tocar el suelo")


func test_el_dash_avanza_unos_57_px_sin_caer() -> void:
	var mundo := _en_la_cima()
	var inicio := mundo.pos
	mundo.paso(_entrada(1, false, false, true))
	while mundo.mov.estado == Movimiento.Estado.DASH:
		mundo.paso(_entrada(1))
	# El ultimo paso ya va a velocidad de caminar.
	var avance := mundo.pos.x - inicio.x - 130.0 * DT
	afirmar_cerca(avance, 340.0 * 10 * DT, 0.01, "10 pasos a 340 px/s")
	afirmar_cerca(mundo.pos.y, inicio.y + 1000.0 * DT * DT, 0.01, "plano: no cae mientras dura")


func test_el_dash_es_invulnerable_sus_primeros_130_ms() -> void:
	var mundo := Mundo.new()
	mundo.paso(_entrada(0, false, false, true))
	afirmar(mundo.mov.invulnerable, "invulnerable al salir")
	mundo.pasos(7, _entrada()) # 117 ms
	afirmar(mundo.mov.invulnerable, "aun invulnerable a los 117 ms")
	mundo.paso(_entrada()) # 133 ms
	afirmar(not mundo.mov.invulnerable, "ya no a los 133 ms")


func test_solo_un_dash_en_el_aire() -> void:
	var mundo := Mundo.new(-500.0)
	mundo.paso(_entrada(1, false, false, true))
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.DASH, "el primero sale")
	mundo.pasos(40, _entrada()) # 667 ms: pasado el enfriamiento
	afirmar(not mundo.en_suelo, "sigue en el aire")
	mundo.paso(_entrada(1, false, false, true))
	afirmar(mundo.mov.estado != Movimiento.Estado.DASH, "el segundo no")


## Salta pegado a una pared y empuja contra ella hasta engancharse.
func _agarrado() -> Mundo:
	var mundo := Mundo.new()
	mundo.pared_x = 20.0
	mundo.pos.x = 10.0
	mundo.paso(_entrada(1, true))
	for i in 60:
		if mundo.mov.estado == Movimiento.Estado.AGARRE:
			break
		mundo.paso(_entrada(1, false, true))
	return mundo


func test_al_caer_contra_una_pared_se_agarra_y_no_resbala() -> void:
	var mundo := _agarrado()
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.AGARRE, "se engancha")
	var y := mundo.pos.y
	mundo.pasos(60, _entrada(1))
	afirmar_igual(mundo.pos.y, y, "un segundo colgado sin moverse")


func test_un_solo_agarre_por_salto() -> void:
	var mundo := _agarrado()
	mundo.paso(_entrada(0, false, false, false, false, true)) # abajo: se suelta
	mundo.pasos(15, _entrada()) # 250 ms: pasado el bloqueo
	mundo.pasos(5, _entrada(1))
	afirmar(mundo.mov.estado != Movimiento.Estado.AGARRE, "no se vuelve a enganchar")
	afirmar(not mundo.en_suelo, "sin haber tocado el suelo")


func test_al_tocar_suelo_vuelve_el_agarre() -> void:
	var mundo := _agarrado()
	mundo.paso(_entrada(0, false, false, false, false, true))
	while not mundo.en_suelo:
		mundo.paso(_entrada())
	mundo.paso(_entrada(1, true))
	for i in 60:
		if mundo.mov.estado == Movimiento.Estado.AGARRE:
			break
		mundo.paso(_entrada(1, false, true))
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.AGARRE, "en el salto siguiente se engancha otra vez")


func test_trepar_desde_el_agarre_sube_unos_42_px() -> void:
	var mundo := _agarrado()
	var y := mundo.pos.y
	mundo.paso(_entrada(0, false, false, false, true))
	var cima := mundo.pos.y
	while mundo.mov.velocidad.y < 0.0:
		mundo.paso(_entrada())
		cima = minf(cima, mundo.pos.y)
	afirmar_cerca(y - cima, 42.5, 0.1, "el tiron de trepar no se corta al soltar")


func test_caer_160_px_no_hace_dano() -> void:
	afirmar_igual(_caer_desde(150.0), [], "caida corta")


func test_caer_200_px_cuesta_un_punto() -> void:
	afirmar_igual(_caer_desde(200.0), [1], "caida de 200")


func test_caer_300_px_cuesta_dos() -> void:
	afirmar_igual(_caer_desde(300.0), [2], "caida de 300")


func test_una_caida_enorme_cuesta_tres_como_mucho() -> void:
	afirmar_igual(_caer_desde(800.0), [3], "caida de 800")


func test_tras_una_mala_caida_no_puede_saltar_un_rato() -> void:
	var mundo := Mundo.new(-300.0)
	while not mundo.en_suelo:
		mundo.paso(_entrada())
	mundo.paso(_entrada(0, true))
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.ATURDIDO, "aturdido al aterrizar")
	afirmar(mundo.mov.velocidad.y >= 0.0, "el salto no sale")
	mundo.pasos(20, _entrada()) # 333 ms
	mundo.paso(_entrada(0, true))
	afirmar(mundo.mov.velocidad.y < 0.0, "pasados 320 ms ya salta")


func test_un_golpe_empuja_hacia_el_otro_lado_y_deja_sin_control() -> void:
	var mundo := Mundo.new()
	afirmar(mundo.mov.herir(0.0, 10.0, Vector2(140, 180)), "el golpe entra")
	afirmar(mundo.mov.velocidad.x < 0.0 and mundo.mov.velocidad.y < 0.0, "sale hacia atras y hacia arriba")
	mundo.paso(_entrada(1, true))
	afirmar(mundo.mov.velocidad.x < 0.0, "durante el golpe no se controla")
	mundo.pasos(14, _entrada()) # 250 ms
	afirmar(mundo.mov.estado != Movimiento.Estado.ATURDIDO, "a los 220 ms vuelve el control")


func test_tras_un_golpe_es_invulnerable_700_ms() -> void:
	var mundo := Mundo.new()
	mundo.mov.herir(0.0, 10.0, Vector2(140, 180))
	mundo.pasos(41, _entrada()) # 683 ms
	afirmar(not mundo.mov.herir(0.0, 10.0, Vector2(140, 180)), "a los 683 ms no entra")
	mundo.pasos(2, _entrada()) # 717 ms
	afirmar(mundo.mov.herir(0.0, 10.0, Vector2(140, 180)), "pasados los 700 ms ya si")


func test_el_dash_atraviesa_los_golpes() -> void:
	var mundo := Mundo.new()
	mundo.paso(_entrada(1, false, false, true))
	mundo.pasos(8, _entrada(1)) # 133 ms: pasados los i-frames, aun en dash
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.DASH, "sigue en dash")
	afirmar(not mundo.mov.herir(0.0, 10.0, Vector2(140, 180)), "en dash no entra")


func test_rezar_solo_de_pie_y_lo_deja_quieto_1100_ms() -> void:
	var mundo := _en_la_cima()
	afirmar(not mundo.mov.rezar(), "en el aire no se reza")
	mundo = Mundo.new()
	mundo.paso(_entrada())
	afirmar(mundo.mov.rezar(), "de pie si")
	mundo.pasos(65, _entrada(1, true)) # 1083 ms
	afirmar_igual(mundo.pos.x, 0.0, "arrodillado no anda")
	mundo.pasos(2, _entrada()) # 1117 ms
	mundo.paso(_entrada(1))
	afirmar(mundo.mov.velocidad.x > 0.0, "acabado el rezo, anda")


func test_reaparecer_no_cuenta_como_caida() -> void:
	var danos := []
	var mundo := Mundo.new(-400.0)
	mundo.mov.caida.connect(func(dano: int, _altura: float) -> void: danos.append(dano))
	mundo.pasos(20, _entrada()) # cayendo deprisa
	mundo.pos.y = 0.0
	mundo.en_suelo = true
	mundo.mov.reaparecer(0.0)
	mundo.pasos(5, _entrada())
	afirmar_igual(danos, [], "aparecer en el Altar no hace dano")


func test_una_accion_deja_quieto_y_luego_suelta() -> void:
	var mundo := Mundo.new()
	mundo.paso(_entrada())
	afirmar(mundo.mov.libre(), "de pie puede actuar")
	mundo.mov.bloquear(170.0)
	afirmar(not mundo.mov.libre(), "golpeando no empieza otra cosa")
	mundo.pasos(9, _entrada(1, true)) # 150 ms
	afirmar_igual(mundo.pos.x, 0.0, "en el suelo no anda mientras golpea")
	mundo.pasos(3, _entrada(1))
	afirmar(mundo.mov.velocidad.x > 0.0, "acabado el golpe, anda")


func test_el_rebote_sube_unos_80_px_sin_mantener_saltar() -> void:
	var mundo := _en_la_cima()
	var y := mundo.pos.y
	mundo.mov.rebotar()
	var cima := y
	mundo.paso(_entrada())
	while mundo.mov.velocidad.y < 0.0:
		mundo.paso(_entrada())
		cima = minf(cima, mundo.pos.y)
	afirmar(y - cima > 70.0, "no se corta al no mantener saltar (subio %.1f)" % (y - cima))
	mundo.paso(_entrada(0, true))
	afirmar(mundo.mov.velocidad.y < 0.0, "y recupera el doble salto")


func test_empujar_hacia_fuera_gira_y_no_suelta() -> void:
	var mundo := _agarrado()
	mundo.pasos(5, _entrada(-1))
	afirmar_igual(mundo.mov.estado, Movimiento.Estado.AGARRE, "sigue colgado del bisturi")
	afirmar(mundo.mov.agarre_girado, "de espaldas a la pared")
	afirmar_igual(mundo.mov.mirando, -1, "mirando hacia fuera")
	mundo.pasos(2, _entrada(1))
	afirmar(not mundo.mov.agarre_girado, "empujar otra vez contra la pared lo vuelve de cara")


func test_saltar_de_espaldas_despega_hacia_fuera() -> void:
	var mundo := _agarrado()
	mundo.pasos(3, _entrada(-1))
	mundo.paso(_entrada(-1, true))
	afirmar(mundo.mov.estado != Movimiento.Estado.AGARRE, "se suelta")
	afirmar(mundo.mov.velocidad.x < 0.0, "hacia fuera")
	afirmar(mundo.mov.velocidad.y < -300.0, "y hacia arriba, con fuerza")
