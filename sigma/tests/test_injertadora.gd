## La Injertadora (#191): tres injertos, enfriamiento, recarga con tope y que
## el injerto de metal solo caiga si hay Injertadora.
extends "res://tests/caso.gd"

const Injertadora := preload("res://scripts/injertadora.gd")
const Ofrenda := preload("res://scripts/ofrenda.gd")
const I := preload("res://scripts/sacramento.gd").INJERTADORA


func test_sin_injertos_no_dispara() -> void:
	var arma := Injertadora.new()
	afirmar(not arma.disparar(), "vacía no dispara")


func test_tres_disparos_con_su_enfriamiento() -> void:
	var arma := Injertadora.new()
	arma.recargar(I["carga_maxima"])
	afirmar(arma.disparar(), "el primero sale")
	afirmar(not arma.disparar(), "en el enfriamiento, no")
	arma.paso(I["enfriamiento_ms"] / 1000.0)
	afirmar(arma.disparar(), "pasado, el segundo")
	arma.paso(I["enfriamiento_ms"] / 1000.0)
	afirmar(arma.disparar(), "el tercero")
	arma.paso(I["enfriamiento_ms"] / 1000.0)
	afirmar(not arma.disparar(), "y se acabó")
	afirmar_igual(arma.cargas, 0, "sin injertos")


func test_recargar_no_pasa_del_tope() -> void:
	var arma := Injertadora.new()
	afirmar_igual(arma.recargar(1), 1, "cabe uno")
	afirmar_igual(arma.recargar(5), 2, "de cinco caben dos")
	afirmar(arma.llena(), "llena")
	afirmar_igual(arma.recargar(1), 0, "llena no cabe más")


func test_pega_casi_como_el_cargado_y_sale_mas_rapido_que_el_sello() -> void:
	var S: GDScript = load("res://scripts/sacramento.gd")
	afirmar(I["dano"] >= S.COMBATE["cargado"]["dano"] - 1, "casi como el cargado")
	afirmar(I["velocidad"] > S.SELLO["velocidad"], "más rápido que un sello")


func test_el_injerto_solo_cae_con_injertadora() -> void:
	var sin := 0
	var con := 0
	for i in 200:
		var tirada := i / 200.0
		if Ofrenda.sortear("devoto", tirada) == "injerto":
			sin += 1
		if Ofrenda.sortear("devoto", tirada, true) == "injerto":
			con += 1
	afirmar_igual(sin, 0, "sin Injertadora, ningún injerto")
	afirmar(con > 0, "con ella, sí")
