## Las cuentas de los peligros (#217), sin nodos, para probarlas: en que fase
## esta un rayo y por donde va una sierra en su rail.
extends RefCounted

const Sacramento := preload("res://scripts/sacramento.gd")
const R := Sacramento.RAYO

enum Fase { APAGADO, AVISO, ACTIVO }


static func ciclo_rayo_ms() -> float:
	return R["apagado_ms"] + R["aviso_ms"] + R["activo_ms"]


## La fase del rayo a los `ms`, desplazado `desfase_ms` (para que dos rayos
## seguidos no vayan a la par), y lo que lleva de ella, de 0 a 1.
static func fase_rayo(ms: float, desfase_ms := 0.0) -> Array:
	var t := fposmod(ms + desfase_ms, ciclo_rayo_ms())
	if t < R["apagado_ms"]:
		return [Fase.APAGADO, t / R["apagado_ms"]]
	t -= R["apagado_ms"]
	if t < R["aviso_ms"]:
		return [Fase.AVISO, t / R["aviso_ms"]]
	t -= R["aviso_ms"]
	return [Fase.ACTIVO, t / R["activo_ms"]]


## Lo que lleva recorrido una sierra a los `segundos` en un rail de `largo` px,
## de ida y vuelta: de 0 a `largo` y otra vez a 0.
static func vaiven(segundos: float, largo: float, velocidad: float) -> float:
	if largo <= 0.0:
		return 0.0
	return pingpong(segundos * velocidad, largo)


## Si un circulo toca un rectangulo: la sierra y la caja del Cirujano.
static func circulo_toca(centro: Vector2, radio: float, caja: Rect2) -> bool:
	var cerca := Vector2(clampf(centro.x, caja.position.x, caja.end.x), clampf(centro.y, caja.position.y, caja.end.y))
	return centro.distance_squared_to(cerca) < radio * radio
