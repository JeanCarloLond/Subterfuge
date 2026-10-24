## Los efectos del cuerpo y del combate (feedback de Jean): pasos, tajo, golpe
## que entra, guardia del parry, parry logrado, salto, caida y trago. Sonidos
## CC0 de Kenney (sigma/audio/LICENCIAS.md), salvo el trago, calculado en
## sonidos.gd. Cada vez se elige una toma al azar y el tono varia un poco: veinte
## pasos iguales seguidos suenan a maquina.
extends Node

const Sonidos := preload("res://scripts/sonidos.gd")
const RUTA := "res://audio/efectos/%s-%d.ogg"
## Efecto -> [tomas, volumen en dB].
const EFECTOS := {
	"paso": [10, -16.0],
	"tajo": [3, -9.0],
	"golpe": [2, -4.0],
	"golpe-fuerte": [1, -2.0],
	"guardia": [1, -8.0],
	"parada": [3, -1.0],
	"salto": [4, -13.0],
	"caida": [1, -6.0],
}
const VOLUMEN_TRAGO_DB := -3.0
const VARIACION_TONO := 0.06
## Cuantos pueden sonar a la vez.
const VOCES := 8

var _tomas := {}
var _volumen := {}
var _reproductores: Array[AudioStreamPlayer] = []
var _siguiente := 0
var _azar := RandomNumberGenerator.new()


func _ready() -> void:
	_azar.randomize()
	for nombre in EFECTOS:
		var lista: Array[AudioStream] = []
		for i in EFECTOS[nombre][0]:
			lista.append(load(RUTA % [nombre, i]))
		_tomas[nombre] = lista
		_volumen[nombre] = EFECTOS[nombre][1]
	_tomas["trago"] = [Sonidos.trago()]
	_volumen["trago"] = VOLUMEN_TRAGO_DB
	# Calculados tambien: la campana del objetivo, la voz de los dialogos (dos
	# tonos, para que no suene a maquina) y la carga del rayo.
	_tomas["campana"] = [Sonidos.campana()]
	_volumen["campana"] = -10.0
	_tomas["voz"] = [Sonidos.voz(330.0), Sonidos.voz(370.0)]
	_volumen["voz"] = -14.0
	_tomas["carga"] = [Sonidos.carga()]
	_volumen["carga"] = -14.0
	for i in VOCES:
		var reproductor := AudioStreamPlayer.new()
		add_child(reproductor)
		_reproductores.append(reproductor)


## Suena `nombre`, una toma al azar. `volumen_db` se suma al suyo.
func sonar(nombre: String, volumen_db := 0.0) -> void:
	if not _tomas.has(nombre):
		return
	var reproductor := _reproductores[_siguiente]
	_siguiente = (_siguiente + 1) % _reproductores.size()
	var tomas: Array = _tomas[nombre]
	reproductor.stream = tomas[_azar.randi() % tomas.size()]
	reproductor.volume_db = _volumen[nombre] + volumen_db
	reproductor.pitch_scale = 1.0 + _azar.randf_range(-VARIACION_TONO, VARIACION_TONO)
	reproductor.play()
