## La musica de Sigma: una pista por sala, con fundido cruzado al cambiar.
## Son las pistas del original (sigma/audio/LICENCIAS.md). Es un autoload para
## que la pista no se corte al cambiar de escena si es la misma.
extends Node

const RUTA := "res://audio/musica/%s.ogg"
const FUNDIDO_S := 1.2
const VOLUMEN_DB := -9.0
const SILENCIO_DB := -60.0

var _actual: AudioStreamPlayer
var _nombre := ""


func poner(nombre: String) -> void:
	if nombre == _nombre:
		return
	_nombre = nombre
	var pista: AudioStreamOggVorbis = load(RUTA % nombre)
	pista.loop = true
	var nuevo := AudioStreamPlayer.new()
	nuevo.stream = pista
	nuevo.volume_db = SILENCIO_DB
	add_child(nuevo)
	nuevo.play()
	var fundido := create_tween()
	fundido.tween_property(nuevo, "volume_db", VOLUMEN_DB, FUNDIDO_S)
	if _actual:
		var viejo := _actual
		fundido.parallel().tween_property(viejo, "volume_db", SILENCIO_DB, FUNDIDO_S)
		fundido.tween_callback(viejo.queue_free)
	_actual = nuevo
