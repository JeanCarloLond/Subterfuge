## Lo que comparten los tests de Sigma: las comprobaciones y la lista de fallos.
##
## Cada archivo tests/test_*.gd extiende este y cada funcion test_* es un test.
## Los corre tests/ejecutar.gd, sin plugins (ver README.md).
extends RefCounted

var fallos: Array[String] = []


func afirmar(condicion: bool, mensaje: String) -> void:
	if not condicion:
		fallos.append(mensaje)


func afirmar_igual(obtenido: Variant, esperado: Variant, mensaje: String) -> void:
	if obtenido != esperado:
		fallos.append("%s: se esperaba %s y salio %s" % [mensaje, str(esperado), str(obtenido)])


func afirmar_cerca(obtenido: float, esperado: float, margen: float, mensaje: String) -> void:
	if absf(obtenido - esperado) > margen:
		fallos.append("%s: se esperaba %s (±%s) y salio %s" % [mensaje, esperado, margen, obtenido])
