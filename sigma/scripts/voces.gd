## Las voces del cuerpo, como en el original (src/systems/Esfuerzo.ts): el
## grunido al atacar, el resoplido al saltar, el quejido al recibir un golpe o
## al caer. Grabaciones CC0 (sigma/audio/LICENCIAS.md): una voz sintetizada
## suena a robot.
##
## Una voz que se repite en cada tajo cansa enseguida: el ataque grita uno de
## cada dos y el salto uno de cada tres, con un descanso minimo entre voces del
## mismo cuerpo. El golpe recibido y la muerte, siempre. Los Devotos usan la
## voz del Cirujano mas grave, y las Vestales, mas aguda.
extends Node

const RUTA := "res://audio/voces/%s.mp3"
const DESCANSO_MS := 450.0
const VOLUMEN_DB := -5.0
## Cuantas tomas tiene cada voz.
const TOMAS := {
	"cirujano-ataque": 3,
	"cirujano-salto": 3,
	"cirujano-herida": 3,
	"cirujano-caida": 2,
	"cirujano-muerte": 1,
	"monstruo-ataque": 3,
	"monstruo-herida": 3,
	"monstruo-muerte": 2,
}
## La voz y el tono de cada enemigo.
const ENEMIGOS := {"devoto": ["cirujano", 0.8], "vestal": ["cirujano", 1.3], "prior": ["cirujano", 0.62]}

var _ultima := {}
var _azar := RandomNumberGenerator.new()


func _ready() -> void:
	_azar.randomize()


func cirujano(voz: String) -> void:
	if voz == "ataque" and _azar.randf() > 0.5:
		return
	if voz == "salto" and _azar.randf() > 0.35:
		return
	_sonar("cirujano", voz, 1.0, "cirujano", voz == "herida" or voz == "muerte")


func enemigo(clase: String, voz: String, cuerpo: Object) -> void:
	if not ENEMIGOS.has(clase):
		return
	if voz == "ataque" and _azar.randf() > 0.6:
		return
	var perfil: Array = ENEMIGOS[clase]
	# La voz del Cirujano no tiene muerte de otro: muere con un quejido.
	var disponible := "herida" if voz == "muerte" and perfil[0] == "cirujano" else voz
	_sonar(perfil[0], disponible, perfil[1], str(cuerpo.get_instance_id()), voz == "muerte")


func _sonar(quien: String, voz: String, tono: float, cuerpo: String, siempre: bool) -> void:
	var ahora := Time.get_ticks_msec()
	if not siempre and ahora - _ultima.get(cuerpo, -INF) < DESCANSO_MS:
		return
	var base := "%s-%s" % [quien, voz]
	var tomas: int = TOMAS.get(base, 0)
	if tomas == 0:
		return
	_ultima[cuerpo] = ahora
	var clave := base if tomas == 1 else "%s-%d" % [base, _azar.randi_range(1, tomas)]
	var reproductor := AudioStreamPlayer.new()
	reproductor.stream = load(RUTA % clave)
	reproductor.volume_db = VOLUMEN_DB
	reproductor.pitch_scale = tono * _azar.randf_range(0.94, 1.06)
	add_child(reproductor)
	reproductor.play()
	reproductor.finished.connect(reproductor.queue_free)
