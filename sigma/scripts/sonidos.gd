## Sonidos hechos con numeros (#186) mientras no hay foley del equipo: el
## Latido, el crujido de la piedra, la campana, la voz, la sierra y el rayo. Ni muestras grabadas ni generadas: ondas
## y ruido calculados aqui.
extends RefCounted

const MEZCLA := 22050


## El Latido: "lub-dub", dos golpes graves; el segundo, mas corto y mas agudo.
## Es como suena la compactacion antes de que se vea.
static func latido() -> AudioStreamWAV:
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * 0.45))
	_golpe(muestras, 0.0, 0.12, 50.0, 0.9)
	_golpe(muestras, 0.17, 0.09, 62.0, 0.6)
	return _wav(muestras)


## Piedra que se arrastra: ruido grave con chasquidos sueltos. Siempre el
## mismo, para que se reconozca.
static func crujido() -> AudioStreamWAV:
	var azar := RandomNumberGenerator.new()
	azar.seed = 186
	var duracion := 0.35
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * duracion))
	var grave := 0.0
	for i in muestras.size():
		var t := float(i) / MEZCLA
		var envolvente := minf(1.0, t / 0.03) * exp(-t / (duracion * 0.45))
		# Ruido pasado por un filtro de un polo: se queda con lo grave.
		grave += (azar.randf_range(-1.0, 1.0) - grave) * 0.08
		var chasquido := azar.randf_range(-1.0, 1.0) if azar.randf() < 0.004 else 0.0
		muestras[i] = (grave * 2.2 + chasquido * 0.5) * envolvente * 0.7
	return _wav(muestras)


## El retumbo de un temblor: lo mas grave posible, que crece, se sostiene y se
## apaga, con piedrecitas que caen. Se oye mas con el cuerpo que con el oido.
static func retumbo() -> AudioStreamWAV:
	var azar := RandomNumberGenerator.new()
	azar.seed = 77
	var duracion := 1.8
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * duracion))
	var grave := 0.0
	var fase := 0.0
	for i in muestras.size():
		var t := float(i) / MEZCLA
		var envolvente := minf(1.0, t / 0.35) * minf(1.0, (duracion - t) / 0.7)
		grave += (azar.randf_range(-1.0, 1.0) - grave) * 0.015
		# Un seno de 34 Hz que late lento debajo del ruido: el templo entero.
		fase += TAU * 34.0 / MEZCLA
		var fondo := sin(fase) * (0.6 + 0.4 * sin(t * TAU * 3.0))
		var piedra := azar.randf_range(-1.0, 1.0) * 0.35 if azar.randf() < 0.0015 else 0.0
		muestras[i] = (grave * 5.0 + fondo * 0.45 + piedra) * envolvente * 0.6
	return _wav(muestras)


## El trago de la Pocion de Carne: dos «glug» espesos, un seno grave que sube de
## tono en cada uno (el liquido que pasa), con algo de burbuja. No habia uno
## libre que convenciera: calculado, como el Latido.
static func trago() -> AudioStreamWAV:
	var azar := RandomNumberGenerator.new()
	azar.seed = 9
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * 0.55))
	for inicio in [0.0, 0.24]:
		var primera := int(inicio * MEZCLA)
		var fase := 0.0
		var dura := 0.13
		for i in int(dura * MEZCLA):
			var t := float(i) / MEZCLA
			var envolvente := minf(1.0, t / 0.01) * exp(-t / (dura * 0.35))
			fase += TAU * (110.0 + 900.0 * t) / MEZCLA
			var burbuja := azar.randf_range(-1.0, 1.0) * 0.18
			muestras[primera + i] += (sin(fase) * 0.8 + burbuja) * envolvente * 0.7
	return _wav(muestras)


## Una campana lejana, para el objetivo nuevo (#215): parciales que no son
## armonicos, como en una campana de verdad, y una cola larga.
static func campana() -> AudioStreamWAV:
	var duracion := 2.2
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * duracion))
	# [relacion con la fundamental, volumen, lo que dura].
	var parciales := [[1.0, 0.5, 1.6], [2.0, 0.25, 0.9], [2.76, 0.2, 0.6], [5.4, 0.08, 0.3]]
	for i in muestras.size():
		var t := float(i) / MEZCLA
		var valor := 0.0
		for p in parciales:
			valor += sin(TAU * 196.0 * p[0] * t) * p[1] * exp(-t / p[2])
		muestras[i] = valor * minf(1.0, t / 0.005) * 0.55
	return _wav(muestras)


## La voz de un dialogo (#216): un toque corto y apagado por letra, de tono
## `hz`. No es una voz: es el ritmo del texto que se escribe.
static func voz(hz: float) -> AudioStreamWAV:
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * 0.045))
	var fase := 0.0
	for i in muestras.size():
		var t := float(i) / MEZCLA
		fase += TAU * hz / MEZCLA
		# Un seno con su tercer armonico, apagado: de madera, no de pitido.
		muestras[i] = (sin(fase) + sin(fase * 3.0) * 0.2) * minf(1.0, t / 0.003) * exp(-t / 0.012) * 0.45
	return _wav(muestras)


## La sierra de hueso (#217), en bucle: un diente de sierra que vibra, con
## limadura de ruido. Se oye antes de verla.
static func sierra() -> AudioStreamWAV:
	var azar := RandomNumberGenerator.new()
	azar.seed = 217
	var muestras := PackedFloat32Array()
	# Un numero entero de ciclos del vaiven, para que el bucle no salte.
	muestras.resize(int(MEZCLA * 0.5))
	var fase := 0.0
	for i in muestras.size():
		var t := float(i) / MEZCLA
		fase += 150.0 * (1.0 + 0.03 * sin(TAU * 8.0 * t)) / MEZCLA
		var diente := fmod(fase, 1.0) * 2.0 - 1.0
		muestras[i] = (diente * 0.35 + azar.randf_range(-1.0, 1.0) * 0.12) * 0.6
	return _bucle(_wav(muestras))


## El rayo de Genesis (#217), en bucle: un zumbido limpio, electrico. Ninguna
## otra cosa del templo suena asi: es otra tecnologia.
static func zumbido() -> AudioStreamWAV:
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * 0.5))
	for i in muestras.size():
		var t := float(i) / MEZCLA
		var valor := sin(TAU * 120.0 * t) * 0.5 + sin(TAU * 240.0 * t) * 0.25 + sin(TAU * 1200.0 * t) * 0.05
		muestras[i] = valor * (0.85 + 0.15 * sin(TAU * 10.0 * t)) * 0.5
	return _bucle(_wav(muestras))


## El rayo que se carga: un tono que sube, fino.
static func carga() -> AudioStreamWAV:
	var duracion := 0.6
	var muestras := PackedFloat32Array()
	muestras.resize(int(MEZCLA * duracion))
	var fase := 0.0
	for i in muestras.size():
		var t := float(i) / MEZCLA
		fase += TAU * (300.0 + 900.0 * t / duracion) / MEZCLA
		muestras[i] = sin(fase) * (t / duracion) * 0.3
	return _wav(muestras)


## El parry logrado (#234): parar un golpe tiene que dar gusto. Cuatro capas a
## la vez: el chasquido del choque, el timbre del metal que vibra y se apaga
## (parciales inarmonicos, como una hoja; dos casi iguales para que bata), el
## peso grave por debajo y una cola corta de nave. A 44,1 kHz: el brillo del
## metal vive por encima de lo que da la mezcla de los demas.
const PARADAS := [
	# Parciales: [relacion con la fundamental, volumen, lo que tarda en apagarse].
	# 0, acero: brillante y seco.
	{"hz": 1240.0, "dura": 0.9, "chasquido": 0.9, "peso": 0.7, "siseo": 0.0, "eco": 0.12,
		"parciales": [[1.0, 0.5, 0.2], [1.007, 0.3, 0.28], [1.503, 0.35, 0.13], [2.09, 0.3, 0.09],
			[2.83, 0.22, 0.06], [3.71, 0.15, 0.04]]},
	# 1, hueso: mas grave y con mas cuerpo, una campana pequena.
	{"hz": 520.0, "dura": 1.2, "chasquido": 0.7, "peso": 0.9, "siseo": 0.0, "eco": 0.15,
		"parciales": [[1.0, 0.6, 0.3], [0.995, 0.35, 0.4], [1.58, 0.4, 0.2], [2.24, 0.3, 0.14],
			[3.1, 0.2, 0.09], [4.4, 0.12, 0.05]]},
	# 2, hoja: el «shing» de una espada, agudo y con siseo.
	{"hz": 2100.0, "dura": 1.0, "chasquido": 1.0, "peso": 0.6, "siseo": 0.35, "eco": 0.12,
		"parciales": [[1.0, 0.55, 0.25], [1.004, 0.4, 0.33], [1.33, 0.3, 0.16], [1.98, 0.25, 0.1],
			[2.71, 0.18, 0.06]]},
]
const TASA_PARADA := 44100


static func parada(variante := 0) -> AudioStreamWAV:
	var V: Dictionary = PARADAS[variante]
	var azar := RandomNumberGenerator.new()
	azar.seed = 234 + variante
	var tasa := TASA_PARADA
	var muestras := PackedFloat32Array()
	muestras.resize(int(tasa * float(V["dura"])))
	var parciales: Array = V["parciales"]
	var fases := PackedFloat32Array()
	fases.resize(parciales.size())
	var ruido_lento := 0.0
	var fase_peso := 0.0
	for i in muestras.size():
		var t := float(i) / tasa
		# El timbre: cada parcial con su volumen y lo que tarda en apagarse.
		var timbre := 0.0
		for p in parciales.size():
			fases[p] += TAU * float(V["hz"]) * float(parciales[p][0]) / tasa
			timbre += sin(fases[p]) * float(parciales[p][1]) * exp(-t / float(parciales[p][2]))
		timbre *= minf(1.0, t / 0.0015)
		# El chasquido: ruido sin lo grave (ruido menos su media lenta), un instante.
		var ruido := azar.randf_range(-1.0, 1.0)
		ruido_lento += (ruido - ruido_lento) * 0.2
		var chasquido := (ruido - ruido_lento) * exp(-t / 0.004) * float(V["chasquido"])
		# El peso: un seno que cae de 120 a 55 Hz.
		fase_peso += TAU * (55.0 + 65.0 * exp(-t / 0.03)) / tasa
		var peso := sin(fase_peso) * minf(1.0, t / 0.002) * exp(-t / 0.06) * float(V["peso"])
		# El siseo de la hoja: ruido agudo que se apaga despacio.
		var siseo := (ruido - ruido_lento) * exp(-t / 0.15) * float(V["siseo"]) * 0.3
		muestras[i] = timbre + chasquido + peso + siseo
	_nave(muestras, tasa, float(V["eco"]))
	# Saturacion suave y al tope: que pegue sin romperse. Con mas ganancia, la
	# saturacion levantaba la cola y el metal no se apagaba nunca. El ultimo
	# cuarto se funde a cero: ni un clic al cortar.
	var tope := 0.0
	var fundido := muestras.size() * 3 / 4
	for i in muestras.size():
		muestras[i] = tanh(muestras[i])
		if i > fundido:
			muestras[i] *= float(muestras.size() - i) / (muestras.size() - fundido)
		tope = maxf(tope, absf(muestras[i]))
	for i in muestras.size():
		muestras[i] *= 0.9 / tope
	return _wav(muestras, tasa)


## El disparo de la Injertadora (#241): un arma, no una lata. Un golpe grave que
## cae (el peso), la detonacion seca, el cuerpo de metal de un cerrojo que
## golpea (parciales graves e inarmonicos, cortos) y el aire que corta el
## injerto al salir. Con una cola corta de nave.
static func disparo() -> AudioStreamWAV:
	var azar := RandomNumberGenerator.new()
	azar.seed = 241
	var tasa := TASA_PARADA
	var muestras := PackedFloat32Array()
	muestras.resize(int(tasa * 0.6))
	var cerrojo := [[310.0, 0.5, 0.05], [467.0, 0.35, 0.04], [742.0, 0.25, 0.03], [1130.0, 0.15, 0.02]]
	var fases := PackedFloat32Array()
	fases.resize(cerrojo.size())
	var fase_peso := 0.0
	var ruido_lento := 0.0
	var aire := 0.0
	for i in muestras.size():
		var t := float(i) / tasa
		var ruido := azar.randf_range(-1.0, 1.0)
		ruido_lento += (ruido - ruido_lento) * 0.2
		# El peso: de 150 a 45 Hz, rapido, y se queda un poco.
		fase_peso += TAU * (45.0 + 105.0 * exp(-t / 0.025)) / tasa
		var peso := sin(fase_peso) * minf(1.0, t / 0.001) * exp(-t / 0.09) * 1.1
		# La detonacion: ruido sin graves, un instante.
		var detonacion := (ruido - ruido_lento) * exp(-t / 0.006) * 1.2
		# El cerrojo: metal grave que golpea y se calla.
		var metal := 0.0
		for p in cerrojo.size():
			fases[p] += TAU * float(cerrojo[p][0]) / tasa
			metal += sin(fases[p]) * float(cerrojo[p][1]) * exp(-t / float(cerrojo[p][2]))
		# El aire: ruido apagado (filtro de un polo) que sube y se va.
		aire += (ruido - aire) * 0.06
		var soplido := aire * minf(1.0, t / 0.02) * exp(-t / 0.12) * 1.6
		muestras[i] = peso + detonacion + metal * 0.8 + soplido
	_nave(muestras, tasa, 0.15)
	var tope := 0.0
	var fundido := muestras.size() * 3 / 4
	for i in muestras.size():
		muestras[i] = tanh(muestras[i])
		if i > fundido:
			muestras[i] *= float(muestras.size() - i) / (muestras.size() - fundido)
		tope = maxf(tope, absf(muestras[i]))
	for i in muestras.size():
		muestras[i] *= 0.9 / tope
	return _wav(muestras, tasa)


## Una cola de nave: cuatro ecos que se realimentan (filtros peine, de
## Schroeder) y se mezclan con `cuanto` de lo seco.
static func _nave(muestras: PackedFloat32Array, tasa: int, cuanto: float) -> void:
	var cola := PackedFloat32Array()
	cola.resize(muestras.size())
	for ms in [29.7, 37.1, 41.1, 43.7]:
		var retardo := int(ms / 1000.0 * tasa)
		var linea := PackedFloat32Array()
		linea.resize(muestras.size())
		for i in muestras.size():
			var atras := linea[i - retardo] if i >= retardo else 0.0
			linea[i] = muestras[i] + atras * 0.6
			cola[i] += linea[i] * 0.25
	for i in muestras.size():
		muestras[i] += cola[i] * cuanto


static func _bucle(wav: AudioStreamWAV) -> AudioStreamWAV:
	wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
	wav.loop_begin = 0
	wav.loop_end = wav.data.size() / 2
	return wav


## Un golpe de bombo: un seno que cae de tono, con ataque rapido y cola corta.
static func _golpe(muestras: PackedFloat32Array, inicio_s: float, dura_s: float, hz: float, volumen: float) -> void:
	var primera := int(inicio_s * MEZCLA)
	var fase := 0.0
	for i in mini(int(dura_s * MEZCLA), muestras.size() - primera):
		var t := float(i) / MEZCLA
		var envolvente := minf(1.0, t / 0.004) * exp(-t / (dura_s * 0.3))
		fase += TAU * hz * (1.0 + 0.6 * exp(-t / 0.02)) / MEZCLA
		muestras[primera + i] += sin(fase) * envolvente * volumen


static func _wav(muestras: PackedFloat32Array, tasa := MEZCLA) -> AudioStreamWAV:
	var datos := PackedByteArray()
	datos.resize(muestras.size() * 2)
	for i in muestras.size():
		datos.encode_s16(i * 2, int(clampf(muestras[i], -1.0, 1.0) * 32767.0))
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = tasa
	wav.data = datos
	return wav
