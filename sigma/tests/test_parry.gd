## El parry logrado (#234): un sonido que da gusto (choque, metal que vibra y se
## apaga, peso). El destello necesita el arbol, que aqui no esta: se prueba
## jugando.
extends "res://tests/caso.gd"

const Sonidos := preload("res://scripts/sonidos.gd")
const Efectos := preload("res://scripts/efectos.gd")


func _muestras(wav: AudioStreamWAV) -> PackedFloat32Array:
	var muestras := PackedFloat32Array()
	muestras.resize(wav.data.size() / 2)
	for i in muestras.size():
		muestras[i] = wav.data.decode_s16(i * 2) / 32768.0
	return muestras


## El volumen (RMS) entre `desde` y `hasta` segundos, en dB.
func _db(muestras: PackedFloat32Array, tasa: int, desde: float, hasta: float) -> float:
	var suma := 0.0
	var primera := int(desde * tasa)
	var ultima := mini(int(hasta * tasa), muestras.size())
	for i in range(primera, ultima):
		suma += muestras[i] * muestras[i]
	return linear_to_db(sqrt(suma / maxi(1, ultima - primera)))


func test_las_tres_versiones_pegan_y_se_apagan() -> void:
	for variante in Sonidos.PARADAS.size():
		var wav := Sonidos.parada(variante)
		var muestras := _muestras(wav)
		var tasa := wav.mix_rate
		var dura: float = Sonidos.PARADAS[variante]["dura"]
		afirmar_cerca(muestras.size() / float(tasa), dura, 0.01, "versión %d: dura lo suyo" % variante)
		var tope := 0.0
		for m in muestras:
			tope = maxf(tope, absf(m))
		afirmar(tope <= 0.91, "versión %d: no satura (tope %s)" % [variante, tope])
		# El choque esta al principio: el golpe se oye en el acto.
		var inicio := _db(muestras, tasa, 0.0, 0.05)
		afirmar(inicio > -12.0, "versión %d: suena fuerte al empezar (%s dB)" % [variante, inicio])
		# Y se apaga: a 0,6 s el metal ya es una cola, y acaba en silencio.
		afirmar(_db(muestras, tasa, 0.55, 0.65) < inicio - 15.0, "versión %d: a 0,6 s ya se apaga" % variante)
		afirmar(_db(muestras, tasa, dura - 0.05, dura) < -40.0, "versión %d: acaba en silencio" % variante)


func test_las_versiones_guardadas_existen_y_la_elegida_es_una_de_ellas() -> void:
	for variante in Sonidos.PARADAS.size():
		afirmar(ResourceLoader.exists(Efectos.RUTA_PARRY % variante), "parry-%d.wav guardado" % variante)
	afirmar(Efectos.PARRY >= 0 and Efectos.PARRY < Sonidos.PARADAS.size(), "la versión elegida existe")


func test_el_parry_suena_con_su_sonido_y_no_con_el_de_la_injertadora() -> void:
	var efectos := Efectos.new()
	efectos._ready()
	var tomas: Array = efectos._tomas["parry"]
	afirmar_igual(tomas.size(), 1, "una toma de parry")
	afirmar_igual(tomas[0].resource_path, Efectos.RUTA_PARRY % Efectos.PARRY, "la versión elegida")
	afirmar(efectos._tomas.has("parada"), "la Injertadora conserva su metal")
	efectos.free()
