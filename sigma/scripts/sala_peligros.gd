## Sala de prueba de los peligros (#217): las sierras de la Diocesis, los rayos
## de Genesis y las piezas del Nivel III (#254), para probar a mano su ritmo antes
## de ponerlos en los niveles.
## Como la del movimiento, los bloques van en codigo: son medidas.
extends "res://scripts/sala_prueba.gd"

const Sierra := preload("res://scripts/sierra.gd")
const Rayo := preload("res://scripts/rayo.gd")
const Remedo := preload("res://scripts/remedo.gd")
const Atrezo := preload("res://scripts/atrezo.gd")
const ASISTENTE := preload("res://escenas/asistente.tscn")
const RELIQUIA := preload("res://escenas/reliquia.tscn")
const FINAL := 1240


func _ready() -> void:
	super()
	# La sala ya no cabe en una pantalla: la camara lo sigue.
	var camara := Camera2D.new()
	camara.limit_left = 0
	camara.limit_right = FINAL
	camara.limit_top = 0
	camara.limit_bottom = 360
	_cirujano.add_child(camara)
	camara.make_current()
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
	# El Nivel III: dos Remedos seguidos, un Asistente y el relicario del Pulmon.
	for x in [560.0, 680.0]:
		var remedo := Remedo.new()
		remedo.position = Vector2(x, SUELO)
		add_child(remedo)
	var asistente: Node2D = ASISTENTE.instantiate()
	asistente.position = Vector2(900, SUELO)
	asistente.ronda_izquierda = 800.0
	asistente.ronda_derecha = 1020.0
	asistente.objetivo = _cirujano
	add_child(asistente)
	var atrezo := Atrezo.new()
	atrezo.piezas = [["relicario", 1160, SUELO]]
	add_child(atrezo)
	var reliquia: Node2D = RELIQUIA.instantiate()
	reliquia.id = "pulmon"
	reliquia.position = Vector2(1160, SUELO - 8.0)
	reliquia.cirujano = _cirujano
	add_child(reliquia)


## Solo el suelo, las paredes y una repisa para mirar los rayos desde arriba.
func _bloques() -> Array:
	return [
		[-16, SUELO, FINAL + 32, 16, ""],
		[-16, -64, 16, 368, ""],
		[FINAL, -64, 16, 368, ""],
		[300, 96, 200, 16, ""],
	]


func _sierra(sitio: Vector2, recorrido: Vector2, desfase: float) -> void:
	var sierra := Sierra.new()
	sierra.position = sitio
	sierra.recorrido = recorrido
	sierra.desfase = desfase
	add_child(sierra)
