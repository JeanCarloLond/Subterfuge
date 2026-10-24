## Sala de prueba de los peligros (#217): las sierras de la Diocesis y los rayos
## de Genesis, para probar a mano su ritmo antes de ponerlos en los niveles.
## Como la del movimiento, los bloques van en codigo: son medidas.
extends "res://scripts/sala_prueba.gd"

const Sierra := preload("res://scripts/sierra.gd")
const Rayo := preload("res://scripts/rayo.gd")


func _ready() -> void:
	super()
	# Una sierra quieta, medio hundida en el suelo: se salta.
	_sierra(Vector2(120, SUELO), Vector2.ZERO, 0.0)
	# Una que corre por el suelo: se espera a que vuelva.
	_sierra(Vector2(200, SUELO - 2.0), Vector2(110, 0), 0.0)
	# Tres rayos bajo la repisa, desfasados: se cruzan leyendo el ritmo.
	for i in 3:
		var rayo := Rayo.new()
		rayo.position = Vector2(380 + i * 36, 112)
		rayo.largo = SUELO - 112.0
		rayo.desfase_ms = i * 500.0
		add_child(rayo)


## Solo el suelo, las paredes y una repisa para mirar los rayos desde arriba.
func _bloques() -> Array:
	return [
		[-16, SUELO, 672, 16, ""],
		[-16, -64, 16, 368, ""],
		[640, -64, 16, 368, ""],
		[300, 96, 200, 16, ""],
	]


func _sierra(sitio: Vector2, recorrido: Vector2, desfase: float) -> void:
	var sierra := Sierra.new()
	sierra.position = sitio
	sierra.recorrido = recorrido
	sierra.desfase = desfase
	add_child(sierra)
