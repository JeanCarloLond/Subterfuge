## Sonidos hechos con numeros (#186) mientras no hay foley del equipo: el
## Latido y el crujido de la piedra. Ni muestras grabadas ni generadas: ondas
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


## Un golpe de bombo: un seno que cae de tono, con ataque rapido y cola corta.
static func _golpe(muestras: PackedFloat32Array, inicio_s: float, dura_s: float, hz: float, volumen: float) -> void:
	var primera := int(inicio_s * MEZCLA)
	var fase := 0.0
	for i in mini(int(dura_s * MEZCLA), muestras.size() - primera):
		var t := float(i) / MEZCLA
		var envolvente := minf(1.0, t / 0.004) * exp(-t / (dura_s * 0.3))
		fase += TAU * hz * (1.0 + 0.6 * exp(-t / 0.02)) / MEZCLA
		muestras[primera + i] += sin(fase) * envolvente * volumen


static func _wav(muestras: PackedFloat32Array) -> AudioStreamWAV:
	var datos := PackedByteArray()
	datos.resize(muestras.size() * 2)
	for i in muestras.size():
		datos.encode_s16(i * 2, int(clampf(muestras[i], -1.0, 1.0) * 32767.0))
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = MEZCLA
	wav.data = datos
	return wav
