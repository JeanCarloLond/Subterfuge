## La sala de la compactacion (#186): las medidas que hacen que funcione. Si
## alguien mueve un muro en el editor, que no deje de aplastar ni de dejar
## pasar sin darse cuenta.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/sala_compactacion.tscn")
const Sala := preload("res://scripts/sala_compactacion.gd")
## El Cirujano: 10 de ancho, 22 de alto.
const CAJA := Vector2(10, 22)


func _rect(muro: Node, avance: float) -> Rect2:
	return Rect2(muro.position + muro.direccion * avance, Vector2(muro.tiles * 16))


func test_el_techo_deja_pasar_en_reposo_y_aplasta_al_bajar() -> void:
	var sala := ESCENA.instantiate()
	var techo := sala.get_node("Muros/Techo")
	var suelo := 18 * 16.0
	afirmar(suelo - _rect(techo, 0.0).end.y > CAJA.y, "en reposo cabe debajo")
	afirmar(suelo - _rect(techo, techo.recorrido).end.y < CAJA.y - 2.0, "abajo del todo no cabe")
	sala.free()


func test_el_muro_llega_al_pilar_pero_no_a_su_cima() -> void:
	var sala := ESCENA.instantiate()
	var muro := sala.get_node("Muros/Muro")
	var pilar: Array = Sala.PIEDRA[4]
	var pilar_rect := Rect2(pilar[0] * 16, pilar[1] * 16, pilar[2] * 16, pilar[3] * 16)
	var cerrado := _rect(muro, muro.recorrido)
	afirmar(cerrado.position.x - pilar_rect.end.x < CAJA.x - 2.0, "entre muro y pilar no cabe")
	afirmar(not cerrado.intersects(pilar_rect), "no se mete en el pilar")
	afirmar(cerrado.position.x >= pilar_rect.end.x, "encima del pilar se esta a salvo")
	afirmar(pilar_rect.size.y < 88.0, "el pilar se sube con un salto simple")
	sala.free()
