## El Asistente de las Salas de Sacramento (#254): un Devoto con bata, que
## reparte bandejas y pega con ellas. La bandeja para el golpe de frente: hay que
## entrarle por la espalda, pegarle mientras alza el brazo o pararle el suyo.
## Es lo que prepara la pelea de espejo del Decano. Tambien es un eslabon.
extends "res://scripts/devoto.gd"

const FRASES_ASISTENTE := [
	"Perdone, Mano. Perdone.",
	"La Sala está ocupada.",
	"Vuelva a la suya, por favor.",
	"Traigo lo de la N.º 5.",
	"¡Cuidado, que está limpia!",
]
const CHAPA_DB := -8.0

var _chapa: AudioStreamPlayer2D


func _frases() -> Array:
	return FRASES_ASISTENTE


func _variante_de() -> String:
	return "asistente"


## Si la bandeja para un golpe que viene de `origen_x`: de frente y con el brazo
## abajo. Mientras alza el brazo, golpea o esta aturdido, no cubre nada.
func cubre(origen_x: float) -> bool:
	if estado in [Estado.ANTICIPANDO, Estado.ATACANDO, Estado.ATURDIDO, Estado.EJECUTADO, Estado.MUERTO]:
		return false
	return (origen_x > position.x) == (mirando > 0)


## La bandeja ha parado un golpe: suena a chapa y se gira hacia quien ha sido.
func topar(origen_x: float) -> void:
	mirando = 1 if origen_x > position.x else -1
	_ultimo_avistamiento = ahora
	if estado == Estado.PATRULLA:
		estado = Estado.PERSECUCION
	if not is_inside_tree():
		return
	if _chapa == null:
		_chapa = AudioStreamPlayer2D.new()
		_chapa.stream = load("res://scripts/sonidos.gd").chapa()
		_chapa.volume_db = CHAPA_DB
		add_child(_chapa)
	_chapa.play()


## Los injertos y los sellos devueltos llegan por aqui: tambien los para.
func recibir_dano(cantidad: int, origen_x: float) -> void:
	if cubre(origen_x):
		topar(origen_x)
		return
	super(cantidad, origen_x)
