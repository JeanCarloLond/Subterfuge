## La Injertadora (#191), sin el nodo: cuantos injertos quedan y cuando se
## puede volver a disparar. El Cirujano la lleva y crea el injerto.
extends RefCounted

const I := preload("res://scripts/sacramento.gd").INJERTADORA

var cargas := 0
var ahora := 0.0
var _fin_enfriamiento := -INF


func paso(delta: float) -> void:
	ahora += delta * 1000.0


func lista() -> bool:
	return cargas > 0 and ahora >= _fin_enfriamiento


## Dispara si puede: gasta un injerto y empieza el enfriamiento.
func disparar() -> bool:
	if not lista():
		return false
	cargas -= 1
	_fin_enfriamiento = ahora + I["enfriamiento_ms"]
	return true


## Recarga `cuantos`; devuelve los que han cabido.
func recargar(cuantos: int) -> int:
	var caben := mini(cuantos, I["carga_maxima"] - cargas)
	cargas += caben
	return caben


func llena() -> bool:
	return cargas >= I["carga_maxima"]
