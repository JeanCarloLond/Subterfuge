## El ciclo de un muro que se mueve (#186): que toca hacer y cuanto avanza.
## Va aparte del nodo (muro.gd) para probarlo sin fisica.
##
## Dos modos:
##   - Latido: reposo -> aviso -> avance -> cerrado -> retroceso -> reposo, sin fin.
##     Los organos se contraen y se sueltan.
##   - Cierre: quieto hasta que algo lo dispara; entonces avisa, avanza y se
##     queda cerrado para siempre. El pasillo que se cierra detras.
##
## La regla: nunca se mueve sin avisar antes. Es como se ve a los dioses sin
## verlos.
extends RefCounted

const Sacramento := preload("res://scripts/sacramento.gd")
const C := Sacramento.COMPACTACION

enum Estado { REPOSO, AVISO, AVANCE, CERRADO, RETROCESO }

var estado := Estado.REPOSO
## Cuanto ha avanzado, de 0 (en reposo) a `recorrido` (cerrado).
var avance := 0.0
var recorrido: float
var ciclico: bool
var ahora := 0.0

var _fin_estado := INF


## `desfase_ms` alarga el primer reposo: dos muros que laten a la vez se leen
## como uno solo.
func _init(recorrido_px: float, es_ciclico := true, desfase_ms := 0.0) -> void:
	recorrido = recorrido_px
	ciclico = es_ciclico
	if ciclico:
		_fin_estado = C["reposo_ms"] + desfase_ms


## Lo que le queda al estado de ahora, en ms (INF si espera a que lo disparen o
## si se esta moviendo).
func ms_restantes() -> float:
	return _fin_estado - ahora


## Para un cierre: empieza a avisar. Si ya se ha disparado, no hace nada.
func disparar() -> void:
	if estado == Estado.REPOSO and not ciclico:
		_entrar(Estado.AVISO, C["aviso_ms"])


## Avanza un paso y devuelve cuanto se ha movido el muro en este paso: positivo
## hacia delante, negativo al retirarse.
func paso(delta: float) -> float:
	ahora += delta * 1000.0
	var antes := avance

	match estado:
		Estado.AVANCE:
			avance = minf(recorrido, avance + C["velocidad_avance"] * delta)
			if avance >= recorrido:
				if ciclico:
					_entrar(Estado.CERRADO, C["cerrado_ms"])
				else:
					_entrar(Estado.CERRADO, INF)
		Estado.RETROCESO:
			avance = maxf(0.0, avance - C["velocidad_retroceso"] * delta)
			if avance <= 0.0:
				_entrar(Estado.REPOSO, C["reposo_ms"])
		_:
			if ahora >= _fin_estado:
				_siguiente()

	return avance - antes


func _siguiente() -> void:
	match estado:
		Estado.REPOSO:
			_entrar(Estado.AVISO, C["aviso_ms"])
		Estado.AVISO:
			_entrar(Estado.AVANCE, INF)
		Estado.CERRADO:
			_entrar(Estado.RETROCESO, INF)


func _entrar(nuevo: Estado, dura_ms: float) -> void:
	estado = nuevo
	_fin_estado = ahora + dura_ms


## Lo que hay que mover una caja para sacarla de un muro que avanza en
## `direccion` (un eje: (1, 0), (-1, 0), (0, 1) o (0, -1)). Cero si no se tocan.
static func empuje(caja: Rect2, muro: Rect2, direccion: Vector2) -> Vector2:
	if not caja.intersects(muro):
		return Vector2.ZERO
	if direccion.x > 0.0:
		return Vector2(muro.end.x - caja.position.x, 0.0)
	if direccion.x < 0.0:
		return Vector2(muro.position.x - caja.end.x, 0.0)
	if direccion.y > 0.0:
		return Vector2(0.0, muro.end.y - caja.position.y)
	return Vector2(0.0, muro.position.y - caja.end.y)
