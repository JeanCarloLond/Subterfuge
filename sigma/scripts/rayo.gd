## El rayo de Genesis Vestal (#217): un bisturi de luz de los laboratorios, de
## antes de que los manuales fueran escritura. Avisa con un hilo que tiembla,
## quema y se apaga, con un ritmo que se aprende. Ninguna otra cosa del templo
## es de este color ni suena asi: es otra tecnologia, y esa es la pista.
##
## Sale del emisor hacia `direccion` y llega `largo` px. Arte provisional
## dibujado aqui.
extends Node2D

const Sacramento := preload("res://scripts/sacramento.gd")
const Peligros := preload("res://scripts/peligros.gd")
const Sonidos := preload("res://scripts/sonidos.gd")
const R := Sacramento.RAYO
## El blanco frio de Genesis: el mismo de los objetivos de la nina.
const LUZ := Color(0.78, 0.88, 0.96)
const NUCLEO := Color(1.0, 1.0, 1.0)
const METAL := Color(0.22, 0.24, 0.27)
const METAL_LUZ := Color(0.42, 0.46, 0.5)

@export var direccion := Vector2.DOWN
@export var largo := 96.0
## Para que dos rayos seguidos no vayan a la par (ms).
@export var desfase_ms := 0.0

## A quien quema: el Cirujano. Si el nivel no lo pone, se busca.
var objetivo: CharacterBody2D

var _ms := 0.0
var _fase: int = Peligros.Fase.APAGADO
var _avance := 0.0
var _zumbido: AudioStreamPlayer2D
var _carga: AudioStreamPlayer2D
var _luz: PointLight2D


func _ready() -> void:
	z_index = 3
	if objetivo == null:
		objetivo = get_tree().get_first_node_in_group("cirujano")
	_zumbido = _altavoz(Sonidos.zumbido(), -10.0)
	_carga = _altavoz(Sonidos.carga(), -12.0)
	_luz = PointLight2D.new()
	var degradado := GradientTexture2D.new()
	degradado.gradient = Gradient.new()
	degradado.gradient.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0)])
	degradado.fill = GradientTexture2D.FILL_RADIAL
	degradado.fill_from = Vector2(0.5, 0.5)
	degradado.fill_to = Vector2(1.0, 0.5)
	_luz.texture = degradado
	_luz.color = LUZ
	_luz.position = direccion.normalized() * largo / 2.0
	_luz.texture_scale = maxf(1.0, largo / 48.0)
	_luz.height = Sacramento.ALTURA_LUZ
	_luz.energy = 0.0
	add_child(_luz)


func _altavoz(sonido: AudioStream, volumen: float) -> AudioStreamPlayer2D:
	var altavoz := AudioStreamPlayer2D.new()
	altavoz.stream = sonido
	altavoz.volume_db = volumen
	altavoz.max_distance = 320.0
	altavoz.position = direccion.normalized() * largo / 2.0
	add_child(altavoz)
	return altavoz


func _physics_process(delta: float) -> void:
	_ms += delta * 1000.0
	var antes := _fase
	var fase := Peligros.fase_rayo(_ms, desfase_ms)
	_fase = fase[0]
	_avance = fase[1]
	if _fase != antes:
		match _fase:
			Peligros.Fase.AVISO:
				_carga.play()
			Peligros.Fase.ACTIVO:
				_zumbido.play()
			Peligros.Fase.APAGADO:
				_zumbido.stop()
	_luz.energy = 0.9 if _fase == Peligros.Fase.ACTIVO else (0.15 * _avance if _fase == Peligros.Fase.AVISO else 0.0)
	if _fase == Peligros.Fase.ACTIVO and objetivo and haz().intersects(objetivo.caja()):
		objetivo.recibir_contacto(global_position.x)
	queue_redraw()


## Lo que quema, en el mundo.
func haz() -> Rect2:
	var fin := global_position + direccion.normalized() * largo
	var caja := Rect2(global_position, Vector2.ZERO).expand(fin)
	return caja.grow(R["ancho"] / 2.0)


func activo() -> bool:
	return _fase == Peligros.Fase.ACTIVO


func _draw() -> void:
	var fin := direccion.normalized() * largo
	match _fase:
		Peligros.Fase.AVISO:
			# El hilo: fino, temblando, cada vez mas firme.
			var temblor := Vector2(direccion.y, -direccion.x) * randf_range(-0.6, 0.6)
			draw_line(temblor, fin + temblor, Color(LUZ, 0.25 + 0.55 * _avance), 1.0)
		Peligros.Fase.ACTIVO:
			var ancho: float = R["ancho"] * (0.85 + 0.15 * sin(_ms / 30.0))
			draw_line(Vector2.ZERO, fin, Color(LUZ, 0.35), ancho + 4.0)
			draw_line(Vector2.ZERO, fin, LUZ, ancho)
			draw_line(Vector2.ZERO, fin, NUCLEO, ancho * 0.35)
			# Donde quema la piedra.
			draw_circle(fin, ancho * 0.7, Color(LUZ, 0.6))
	# El emisor: una caja de metal que no es de la Diocesis, con su lente.
	var lado := Vector2(direccion.y, -direccion.x)
	var cuerpo := PackedVector2Array([lado * 7.0 - direccion * 6.0, lado * 7.0 + direccion * 3.0, -lado * 7.0 + direccion * 3.0, -lado * 7.0 - direccion * 6.0])
	draw_colored_polygon(cuerpo, METAL)
	draw_polyline(PackedVector2Array([cuerpo[0], cuerpo[1], cuerpo[2], cuerpo[3], cuerpo[0]]), METAL_LUZ, 1.0)
	var lente := LUZ if _fase != Peligros.Fase.APAGADO else LUZ.darkened(0.6)
	draw_circle(direccion * 2.0, 2.2, lente)
