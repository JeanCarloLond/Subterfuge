## El atrezo de una zona (scripts/atrezo-sigma.mjs): lo que la hace parecer
## habitada, cada pieza con su luz. Velas que titilan, hongos que respiran
## despacio y la Piedra Tibia, que echa vapor. Va detras del Cirujano: se mira,
## no se pisa.
extends Node2D

const ARTE := "res://arte/atrezo/%s.png"
## Lo que da cada pieza: [color de la luz, energia, latido (s), vapor].
const LUCES := {
	"candelabro": [Color(1.0, 0.7, 0.4), 0.8, 0.0, false],
	"hongos": [Color(0.4, 0.9, 0.8), 0.55, 3.0, false],
	"piedra-tibia": [Color(1.0, 0.55, 0.25), 0.9, 2.0, true],
	"muro-dientes": [null, 0.0, 0.0, false],
}

## [pieza, x, y]: x en el centro, y en el suelo donde se apoya.
@export var piezas: Array = []

var _luces: Array[Array] = []
var _azar := RandomNumberGenerator.new()


func _ready() -> void:
	_azar.randomize()
	for pieza in piezas:
		var nombre: String = pieza[0]
		var sitio := Vector2(pieza[1], pieza[2])
		var textura: Texture2D = load(ARTE % nombre)
		var sprite := Sprite2D.new()
		sprite.texture = textura
		sprite.centered = false
		sprite.offset = Vector2(-textura.get_width() / 2.0, -textura.get_height())
		sprite.position = sitio
		sprite.z_index = -2
		add_child(sprite)
		var luz_de: Array = LUCES[nombre]
		if luz_de[0] != null:
			var luz := _luz(sitio + Vector2(0, -textura.get_height() * 0.7), luz_de[0], luz_de[1])
			_luces.append([luz, luz_de[1], luz_de[2], _azar.randf() * TAU])
		if luz_de[3]:
			_vapor(sitio + Vector2(0, -textura.get_height() * 0.6))


func _process(_delta: float) -> void:
	var t := Time.get_ticks_msec() / 1000.0
	for l in _luces:
		var luz: PointLight2D = l[0]
		if l[2] == 0.0:
			# Una vela titila: rapido y sin ritmo.
			luz.energy = l[1] * (0.85 + 0.15 * sin(t * 13.0 + l[3]) * sin(t * 7.3 + l[3]))
		else:
			luz.energy = l[1] * (0.8 + 0.2 * sin(t * TAU / l[2] + l[3]))


func _luz(sitio: Vector2, color: Color, energia: float) -> PointLight2D:
	var gradiente := Gradient.new()
	gradiente.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0)])
	var textura := GradientTexture2D.new()
	textura.gradient = gradiente
	textura.width = 160
	textura.height = 160
	textura.fill = GradientTexture2D.FILL_RADIAL
	textura.fill_from = Vector2(0.5, 0.5)
	textura.fill_to = Vector2(1, 0.5)
	var luz := PointLight2D.new()
	luz.texture = textura
	luz.position = sitio
	luz.color = color
	luz.energy = energia
	add_child(luz)
	return luz


## La Piedra Tibia echa vapor: el calor de los dioses sube por el ducto.
func _vapor(sitio: Vector2) -> void:
	var vapor := CPUParticles2D.new()
	vapor.position = sitio
	vapor.amount = 12
	vapor.lifetime = 2.2
	vapor.direction = Vector2(0, -1)
	vapor.spread = 20.0
	vapor.initial_velocity_min = 8.0
	vapor.initial_velocity_max = 16.0
	vapor.gravity = Vector2(0, -6)
	vapor.scale_amount_min = 1.5
	vapor.scale_amount_max = 3.0
	vapor.color = Color(0.85, 0.8, 0.75, 0.25)
	vapor.z_index = -1
	add_child(vapor)
