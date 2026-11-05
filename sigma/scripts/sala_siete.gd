## La Sala N.º 7 (#256): donde miro. La camilla sigue ahi. Al entrar cae la puerta,
## hablan y el Decano de las Manos despierta.
##
## Rematado, la sala se abre: sube la puerta y el muro del fondo se hunde. Detras
## esta la puerta del Pabellon N.º 7, del Nivel I, donde empezo: su lugar de
## trabajo y su casa se han juntado. Es lo que se ve cuando cae un eslabon grande.
extends "res://scripts/sala.gd"

const NOMBRE := "El Decano"
const CIRUJANO := "El Cirujano"
const TITULO := "El Decano de las Manos"
## Lo que se dicen antes de pelear. Solo la primera vez.
const PALABRAS := [
	[NOMBRE, "Pisas primero con el izquierdo. Te lo dije a los doce años."],
	[CIRUJANO, "Decano."],
	[NOMBRE, "Te oigo el ojo, ¿sabes? Hace un ruido húmedo cuando miras."],
	[CIRUJANO, "Había una niña en esa camilla."],
	[NOMBRE, "En todas las camillas hay alguien. Para eso es la máscara."],
	[CIRUJANO, "Ella me habla."],
	[NOMBRE, "Claro que te habla. ¿Le has preguntado qué ve con esa venda?"],
	[NOMBRE, "Coge el bisturí como te enseñé. Que por lo menos esto lo hagas bien."],
]
const RETRATOS := {
	NOMBRE: preload("res://arte/decano/retrato.png"),
	CIRUJANO: preload("res://arte/retratos/cirujano.png"),
}
const MUSICA_PELEA := "guardian-colossus"
const FUNDIDO_PELEA_S := 1.5
const FUNDIDO_FIN_S := 5.0
const PUERTA_S := 0.35
## Lo que dice al caer.
const CAIDO := "Sala N.º 7 sin turno"

## Pasado esto (x del mundo), la pelea empieza.
@export var inicio_x := 200.0

var _empezada := false

@onready var _decano: CharacterBody2D = get_node_or_null("Guardianes/Decano")
@onready var _puerta: Node2D = $Muros/Puerta
@onready var _fondo: Node2D = $Compactacion/Fondo


func _ready() -> void:
	super()
	_fondo.objetivo = _cirujano
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.aprendido("decano-vencido"):
		_ya_vencido()
		return
	_decano.objetivo = _cirujano
	_decano.despierta.connect(func() -> void:
		_interfaz.guardian(TITULO, _decano.vida, Sacramento.DECANO["vida"])
	)
	_decano.vida_cambio.connect(_interfaz.guardian_vida)
	_decano.cae.connect(_vencido)


func _physics_process(delta: float) -> void:
	super(delta)
	if not _empezada and is_instance_valid(_decano) and _cirujano.position.x > inicio_x:
		_empezada = true
		_cerrar_puerta()
		# Primero cae la puerta (con el juego parado se quedaria a medias), y
		# luego hablan: la pelea empieza al acabar.
		get_tree().create_timer(PUERTA_S + 0.3).timeout.connect(_hablar)


func _hablar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.aprendido("decano-hablado"):
		_pelear()
		return
	var lineas := []
	for palabra in PALABRAS:
		lineas.append({"quien": palabra[0], "texto": palabra[1]})
	_interfaz.hablar(lineas, RETRATOS, func() -> void:
		if progreso:
			progreso.aprender("decano-hablado")
		_pelear()
	)


func _pelear() -> void:
	if not is_instance_valid(_decano):
		return
	_decano.despertar()
	var pista := get_node_or_null("/root/Musica")
	if pista:
		pista.poner(MUSICA_PELEA, FUNDIDO_PELEA_S)


func _cerrar_puerta() -> void:
	# Los muros son cuerpos que se mueven con la fisica: sus tweens, tambien.
	var cae := create_tween().set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)
	cae.tween_property(_puerta, "position:y", _puerta.position.y + _puerta.recorrido, PUERTA_S).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	cae.tween_callback($Temblor.temblar)
	_interfaz.avisar("Ya no se sale por ahí")


func _vencido() -> void:
	_interfaz.guardian_fuera()
	_interfaz.avisar(CAIDO)
	var pista := get_node_or_null("/root/Musica")
	if pista:
		pista.poner(musica, FUNDIDO_FIN_S)
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.aprender("decano-vencido")
	# Sube la puerta y el muro del fondo se hunde: detras, el Pabellon.
	$Temblor.temblar()
	var abre := create_tween().set_parallel().set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)
	abre.tween_property(_puerta, "position:y", _puerta.position.y - _puerta.recorrido, 1.6).set_delay(1.0)
	abre.chain().tween_property(_fondo, "position:y", _fondo.position.y + _fondo.tiles.y * 16.0, 2.2)


## Ya vencido (se vuelve a la sala): sin Decano, abierta.
func _ya_vencido() -> void:
	if is_instance_valid(_decano):
		_decano.queue_free()
	_fondo.queue_free()
