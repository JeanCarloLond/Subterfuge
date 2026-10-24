## Una ofrenda: lo que deja un enemigo al caer, como en el original. Sale
## despedida del cuerpo, rebota, y se recoge pasando por encima. Parpadea al
## final y se va: no se acumula basura en el suelo.
##
##   - La carne del diezmo cura un punto; con el cuerpo entero, va al frasco.
##   - El sello del diezmo da Fervor.
##   - El injerto de metal carga la Injertadora (#191): sin ella no cae.
##
## Es lo que en la Diocesis se le saca a un cuerpo, asi que tiene sentido que
## sea lo que deja un eslabon. Esta en la capa 0 y solo choca con el mundo.
extends CharacterBody2D

const Sacramento := preload("res://scripts/sacramento.gd")
const O := Sacramento.OFRENDA
const M := Sacramento.MOVIMIENTO
const FIGURAS := {
	"carne": preload("res://arte/provisional/carne.png"),
	"sello": preload("res://arte/provisional/sello.png"),
	"injerto": preload("res://arte/provisional/injerto.png"),
}
const REBOTE := 0.45
const FRICCION := 220.0

var tipo := "carne"
## Quien la recoge: el Cirujano.
var cirujano: CharacterBody2D

var _vida_ms := 0.0
var _recogida := false
var _sprite: Sprite2D


## Que deja un enemigo de `clase` con una `tirada` de 0 a 1, o "" si nada.
## Aparte del azar, para probarlo.
static func sortear(clase: String, tirada: float, con_injertadora := false) -> String:
	match clase:
		"vestal":
			# El clero siempre lleva sellos encima; de vez en cuando, algo mas.
			if tirada < O["vestal_carne"]:
				return "carne"
			if tirada < O["vestal_carne"] + O["vestal_injerto"]:
				return "injerto" if con_injertadora else ""
			return "sello"
		"devoto":
			if tirada < O["devoto_carne"]:
				return "carne"
			if tirada < O["devoto_carne"] + O["devoto_sello"]:
				return "sello"
			if tirada < O["devoto_carne"] + O["devoto_sello"] + O["devoto_injerto"]:
				return "injerto" if con_injertadora else ""
	return ""


## Tira los dados por un enemigo de `clase` que cae en `sitio` y, si le toca,
## deja la ofrenda en `nivel`.
static func soltar(nivel: Node, sitio: Vector2, clase: String, quien_recoge: CharacterBody2D) -> void:
	if nivel == null or not nivel.is_inside_tree():
		return
	var que := sortear(clase, randf())
	if que == "":
		return
	var ofrenda: CharacterBody2D = load("res://scripts/ofrenda.gd").new()
	ofrenda.tipo = que
	ofrenda.cirujano = quien_recoge
	ofrenda.position = sitio
	nivel.add_child.call_deferred(ofrenda)


func _ready() -> void:
	collision_layer = 0
	collision_mask = 1
	var forma := RectangleShape2D.new()
	forma.size = Vector2(8, 8)
	var caja := CollisionShape2D.new()
	caja.shape = forma
	caja.position = Vector2(0, -4)
	add_child(caja)
	_sprite = Sprite2D.new()
	_sprite.texture = FIGURAS[tipo]
	_sprite.position = Vector2(0, -4)
	add_child(_sprite)
	# Sale despedida hacia arriba, un poco al azar: que no caiga siempre igual.
	velocity = Vector2(randf_range(-60.0, 60.0), -randf_range(140.0, 200.0))


func _physics_process(delta: float) -> void:
	if _recogida:
		return
	_vida_ms += delta * 1000.0
	if _vida_ms >= O["vida_ms"]:
		queue_free()
		return
	# Parpadea al final: se va a ir.
	if _vida_ms >= O["vida_ms"] - O["parpadeo_ms"]:
		_sprite.visible = int(_vida_ms / 160.0) % 2 == 0

	var cayendo := velocity.y
	velocity.y = minf(velocity.y + M["gravedad"] * delta, M["velocidad_caida_max"])
	velocity.x = move_toward(velocity.x, 0.0, FRICCION * delta)
	move_and_slide()
	if is_on_floor() and cayendo > 60.0:
		velocity.y = -cayendo * REBOTE

	if cirujano and not cirujano.muerto and Rect2(position + Vector2(-4, -8), Vector2(8, 8)).intersects(cirujano.caja()):
		_recoger()


func _recoger() -> void:
	_recogida = true
	cirujano.recoger_ofrenda(tipo)
	var irse := create_tween()
	irse.tween_property(_sprite, "position:y", _sprite.position.y - 10.0, 0.26)
	irse.parallel().tween_property(_sprite, "modulate:a", 0.0, 0.26)
	irse.tween_callback(queue_free)
