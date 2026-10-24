## Las ofrendas: lo que deja cada eslabon al caer, con las probabilidades del
## original. El injerto, solo con la Injertadora.
extends "res://tests/caso.gd"

const Ofrenda := preload("res://scripts/ofrenda.gd")


func test_el_devoto_deja_carne_sello_o_nada() -> void:
	afirmar_igual(Ofrenda.sortear("devoto", 0.1), "carne", "40 % carne")
	afirmar_igual(Ofrenda.sortear("devoto", 0.5), "sello", "28 % sello")
	afirmar_igual(Ofrenda.sortear("devoto", 0.8), "", "sin Injertadora, el injerto no cae")
	afirmar_igual(Ofrenda.sortear("devoto", 0.8, true), "injerto", "con ella, si")
	afirmar_igual(Ofrenda.sortear("devoto", 0.99, true), "", "y a veces nada")


func test_la_vestal_siempre_lleva_algo() -> void:
	afirmar_igual(Ofrenda.sortear("vestal", 0.1), "carne", "20 % carne")
	afirmar_igual(Ofrenda.sortear("vestal", 0.3, true), "injerto", "32 % injerto, con la Injertadora")
	afirmar_igual(Ofrenda.sortear("vestal", 0.9), "sello", "el clero siempre lleva sellos")


func test_quien_no_es_eslabon_no_deja_nada() -> void:
	afirmar_igual(Ofrenda.sortear("cuervo", 0.1), "", "clase desconocida")


func test_a_la_larga_salen_las_proporciones() -> void:
	var azar := RandomNumberGenerator.new()
	azar.seed = 7
	var cuenta := {"carne": 0, "sello": 0, "": 0}
	for i in 4000:
		cuenta[Ofrenda.sortear("devoto", azar.randf())] += 1
	afirmar_cerca(cuenta["carne"] / 4000.0, 0.4, 0.03, "carne")
	afirmar_cerca(cuenta["sello"] / 4000.0, 0.28, 0.03, "sello")
