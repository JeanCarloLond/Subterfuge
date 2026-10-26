## Crea las salas del Nivel II (#190), los Pasillos de Preparacion del plano
## de docs/mapa.md, hasta la puerta del laboratorio. Usa las piezas de
## crear_nivel_1.gd. Se corrio UNA vez; desde entonces se editan en el editor
## (y se visten con vestir_nivel_2.gd):
##
##   godot --headless --path sigma -s res://herramientas/crear_nivel_2.gd
##
## El hilo: del Umbral se llega al Registro de Diezmos, donde el Libro pide
## los tres registros de Genesis. Uno en la Escribania, otro en el Archivo
## (por la Sala de Sorteos) y el tercero en el Ala sellada, al otro lado del
## Pasillo que se cierra. En el Ala, la puerta del laboratorio pide los tres, y
## un atajo devuelve al Registro: el cierre nunca deja encerrado (#190).
extends "res://herramientas/crear_nivel_1.gd"

const DIR_2 := "res://escenas/nivel2/"
const SALA_UMBRAL := "res://escenas/nivel1/umbral.tscn"
## Lo que tarda cada techo del pasillo en caer tras el anterior: la ola va a
## unos 115 px/s, y el Cirujano anda a 130. Probado: corriendo y saltando bien
## se llega con unos 4 s de margen; quien se para o cae al vacio, la oye
## encima.
const CIERRE_CADA_S := 0.55
const FIN_NAVE := "Más abajo, las Salas de Sacramento.
Fin de lo hecho hasta ahora.

Esc para volver a la portada"
const SALA_NAVE := "res://escenas/nivel1/nave.tscn"


func _initialize() -> void:
	dir = DIR_2
	if not _scripts_cargan():
		quit(1)
		return
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
	var errores := 0
	for crear in [_registro, _escribania, _sorteos, _archivo, _pasillo, _ala, _laboratorio, _nave_libro]:
		errores += _guardar(crear.call())
	quit(errores)


## 1 · El Registro de Diezmos: la sala de en medio. El Libro colosal (el hito
## de la zona), el Altar, y cuatro salidas: el hueco a la Escribania, la
## galeria alta a los Sorteos, la puerta del Pasillo y la del atajo, que solo
## se abre desde el Ala.
func _registro() -> Dictionary:
	_empezar("Registro", 60, 28)
	_nivel_2()
	_piedra([[0, 0, 60, 2], [0, 0, 2, 20], [0, 24, 8, 4], [12, 24, 48, 4], [58, 0, 2, 9], [58, 13, 2, 15]])
	# Las estanterias hasta la galeria alta, separadas: ninguna encima de
	# otra, para que cada subida sea un salto con carrerilla y no un apuro.
	_piedra([[41, 20, 5, 1], [49, 16, 4, 1], [55, 13, 3, 1]])
	_altar("Registro", 18, 24)
	_cirujano(5, 24)
	_libro(34, 24)
	var nota := _registro_nota("libro-de-diezmos", 36, 24, "Libro de Diezmos, tomo DCCXL", "«Casa 31: un brazo. Casa 32: un riñón. Casa 33: nada que dar; se toma a la hija.»

En la última hoja, con otra letra, más antigua que el libro: «Los registros de Génesis Vestal no se queman. Se reparten, para que nadie los lea juntos. Uno a la Escribanía, otro al Archivo, el último se queda con ellos, detrás.»")
	nota.set("objetivo", "registros")
	_paso("Oeste", 0, 20, 2, 4, SALA_UMBRAL, "pasillos")
	_paso("Hueco", 8, 26, 4, 2, "escribania", "arriba")
	_paso("Este", 58, 9, 2, 4, "sorteos", "oeste")
	var pasillo := _paso("Pasillo", 39, 21, 2, 3, "pasillo", "oeste", true, "E  entrar")
	pasillo.set("sellado_por", "pasillo-sellado")
	pasillo.set("negado_texto", "Sellado: el pasillo se cerró a tu espalda")
	_puerta(40, 24)
	var atajo := _paso("Atajo", 28, 21, 2, 3, "ala", "atajo", true, "E  abrir")
	atajo.set("pide_marca", "atajo-ala")
	atajo.set("negado_texto", "No cede: está atrancada desde el otro lado")
	_puerta(29, 24)
	_entrada("oeste", 4, 24, 1)
	_entrada("hueco", 14, 24, -1)
	_entrada("este", 55, 13, -1)
	_entrada("pasillo", 40, 24, -1)
	_entrada("atajo", 29, 24, 1)
	_atrezo([["candelabro", 264, 384], ["candelabro", 328, 384], ["candelabro", 600, 384], ["hongos", 860, 208]])
	_ambiente([[200, 32, 90], [700, 32, 110]], [[192, 384, 640]])
	return {"nombre": "registro", "ancho": 60, "alto": 28}


## 2 · La Escribania: escritorios, dos Devotos y una Vestal. El primer
## registro, en la estanteria alta del fondo. Se entra cayendo por el hueco y
## se vuelve saltando a el desde las repisas.
func _escribania() -> Dictionary:
	_empezar("Escribania", 50, 23)
	_nivel_2()
	_piedra([[0, 0, 8, 2], [12, 0, 38, 2], [0, 0, 2, 23], [48, 0, 2, 23], [0, 19, 50, 4]])
	# Dos escalones de 64 px hasta el hueco, con aire entre ellos.
	_piedra([[9, 11, 3, 1], [14, 15, 3, 1]])
	# Los escritorios, apartados del escalon: entre ellos se salta sin darse
	# con la cabeza.
	_piedra([[20, 16, 5, 1], [29, 16, 5, 1], [37, 16, 3, 1], [43, 11, 5, 1]])
	_cirujano(10, 11)
	_devoto(24, 19, 260.0, 440.0)
	_vestal(33, 19, 480.0, 600.0)
	_devoto(44, 19, 640.0, 760.0)
	_registro_nota("registro-genesis-1", 45, 11, "Génesis Vestal · Protocolo 7, revisión 3", "«El sujeto no presenta órganos de visión. Responde al tacto, al calor y a lo que se le da de comer. Hipótesis: los Mil no perciben el mundo; lo digieren.

Nota del turno de noche: anoche, la pared del pabellón 7 se movió hacia la del 8. Medido: un palmo.»").set("cuenta", "registros")
	_paso("Arriba", 8, 0, 4, 5, "registro", "hueco")
	_entrada("arriba", 10, 7, 1)
	_atrezo([["candelabro", 360, 256], ["candelabro", 600, 256], ["candelabro", 740, 176], ["hongos", 60, 304]])
	_ambiente([[260, 32, 70], [560, 32, 80]], [[32, 304, 736]])
	return {"nombre": "escribania", "ancho": 50, "alto": 23}


## 3 · La Sala de Sorteos: donde se echa a suertes que casa paga. Dos Devotos
## abajo y una Vestal en el balcon, lanzando sellos desde arriba. Se baja al
## Archivo por el hueco del fondo.
func _sorteos() -> Dictionary:
	_empezar("Sorteos", 60, 23)
	_nivel_2()
	_piedra([[0, 0, 60, 2], [0, 0, 2, 15], [58, 0, 2, 23], [0, 19, 52, 4], [56, 19, 4, 4]])
	_piedra([[20, 16, 4, 1], [26, 12, 14, 1]])
	_cirujano(4, 19)
	_devoto(12, 19, 150.0, 330.0)
	_devoto(44, 19, 620.0, 800.0)
	_vestal(33, 12, 440.0, 600.0)
	_paso("Oeste", 0, 15, 2, 4, "registro", "este")
	_paso("Hueco", 52, 21, 4, 2, "archivo", "arriba")
	_entrada("oeste", 4, 19, 1)
	_entrada("hueco", 50, 19, -1)
	_atrezo([["candelabro", 440, 192], ["candelabro", 600, 192], ["candelabro", 100, 304], ["hongos", 900, 304]])
	_ambiente([[300, 32, 90], [760, 32, 80]], [[32, 304, 800]])
	return {"nombre": "sorteos", "ancho": 60, "alto": 23}


## 4 · El Archivo: una torre de estanterias, sin enemigos y con sierras. Cada
## piso es media sala; se baja dejandose caer por el borde al de debajo y se
## sube saltando al de encima (80 px, sin membrana). El segundo registro, en el
## suelo del fondo.
func _archivo() -> Dictionary:
	_empezar("Archivo", 40, 40)
	_nivel_2()
	_piedra([[0, 0, 18, 2], [22, 0, 18, 2], [0, 0, 2, 40], [38, 0, 2, 40], [0, 35, 40, 5]])
	for i in 6:
		var fila := 5 + i * 5
		if i % 2 == 0:
			_piedra([[2, fila, 19, 1]])
		else:
			_piedra([[21, fila, 17, 1]])
	_sierra(4, 15, Vector2(192, 0), 0.0, -2.0)
	_sierra(24, 20, Vector2(160, 0), 1.0, -2.0)
	_sierra(4, 25, Vector2(192, 0), 2.0, -2.0)
	_sierra(26, 35, Vector2.ZERO)
	_cirujano(19, 5)
	_registro_nota("registro-genesis-2", 33, 35, "Génesis Vestal · Informe de campo", "«Los corazones laten a la vez cuando se acercan. Medido en cuatro salas: cuanto más juntos, más rápido. Si llegan a tocarse, el sistema estará completo salvo en una cosa.»

Al margen: «¿Cuál?». Debajo, tachado tres veces, algo que ya no se lee.").set("cuenta", "registros")
	_paso("Arriba", 18, 0, 4, 2, "sorteos", "hueco")
	_entrada("arriba", 19, 4, 1)
	_atrezo([["candelabro", 100, 80], ["hongos", 560, 160], ["candelabro", 600, 320], ["hongos", 150, 400], ["piedra-tibia", 440, 560]])
	_ambiente([[160, 32, 60], [480, 32, 60]], [[32, 560, 576]])
	return {"nombre": "archivo", "ancho": 40, "alto": 40}


## 5 · El Pasillo que se cierra (#190): el primer cierre. Al pasar, el techo
## cae a tu espalda y sella el camino de vuelta; y no se queda ahi: el pasillo
## entero se viene abajo detras de ti, techo a techo, en ola. Corriendo se
## gana. Dos huecos al vacio y tres sierras por medio. Ningun enemigo.
func _pasillo() -> Dictionary:
	_empezar("Pasillo", 90, 18)
	_nivel_2()
	# El techo del pasillo, de la fila 2 a la 7, son los muros que caen.
	_piedra([[0, 0, 90, 2], [0, 2, 6, 6], [82, 2, 8, 6], [0, 8, 2, 6]])
	# Los dos huecos, de 3 tiles: con el techo a 96 px el salto choca y llega
	# a unos 75; uno de 4 no se salvaba.
	_piedra([[0, 14, 26, 4], [29, 14, 23, 4], [55, 14, 35, 4]])
	var muros: Array[NodePath] = []
	for k in 19:
		var muro := AnimatableBody2D.new()
		muro.set_script(load("res://scripts/muro.gd"))
		muro.position = Vector2((6 + k * 4) * 16, 2 * 16)
		muro.set("tiles", Vector2i(4, 6))
		muro.set("direccion", Vector2(0, 1))
		muro.set("recorrido", 96.0)
		muro.set("ciclico", false)
		_poner(muro, "Muros", "Techo%d" % k)
		muros.append(NodePath("../Muros/" + muro.name))
	var cierre := Node2D.new()
	cierre.set_script(load("res://scripts/cierre.gd"))
	cierre.position = Vector2(12 * 16, 8 * 16)
	cierre.set("zona", Vector2(32, 96))
	cierre.set("muros", muros)
	cierre.set("marca", "pasillo-sellado")
	cierre.set("cada_s", CIERRE_CADA_S)
	_poner(cierre, "", "Cierre")
	_sierra(38, 14, Vector2.ZERO)
	_sierra(64, 14, Vector2.ZERO)
	_sierra(72, 14, Vector2.ZERO)
	_cirujano(5, 14)
	_paso("Oeste", 2, 11, 2, 3, "registro", "pasillo", true, "E  volver")
	_puerta(3, 14)
	_paso("Este", 88, 8, 2, 6, "ala", "oeste")
	_entrada("oeste", 5, 14, 1)
	_atrezo([["candelabro", 160, 224], ["candelabro", 700, 224], ["candelabro", 1200, 224]])
	_ambiente([], [[32, 224, 1376]])
	return {"nombre": "pasillo", "ancho": 90, "alto": 18}


## 6 · El Ala sellada de Genesis: los rayos. El Altar, a la entrada, del lado
## bueno del cierre; la puerta del atajo, que se abre desde aqui y lleva al
## Registro. El tercer registro, en un estrado que barre un rayo. Al fondo, la
## puerta del laboratorio, que pide los tres.
func _ala() -> Dictionary:
	_empezar("Ala", 60, 23)
	_nivel_2()
	_raiz.set("marca_al_entrar", "pasillo-sellado")
	_piedra([[0, 0, 60, 2], [0, 0, 2, 23], [58, 0, 2, 23], [0, 19, 60, 4]])
	_piedra([[36, 15, 8, 1]])
	_altar("Ala", 6, 19)
	_cirujano(3, 19)
	_cartel("rayo", 15, 19, "Los rayos de Génesis avisan con un hilo:\ncruza cuando se apagan", "")
	for i in 4:
		_rayo(18 + i * 3, 2, Vector2.DOWN, 272.0, i * 350.0)
	# El que barre el estrado del registro, de lado.
	_rayo(45, 14, Vector2.LEFT, 144.0, 0.0, -2.0)
	_rayo(48, 2, Vector2.DOWN, 272.0, 200.0)
	_rayo(51, 2, Vector2.DOWN, 272.0, 900.0)
	_registro_nota("registro-genesis-3", 40, 15, "Génesis Vestal · Orden de cierre", "«Se sella el laboratorio 7. El artefacto queda dentro: no se destruye, porque nadie sabe cómo.

A partir de hoy, los protocolos se leerán en voz alta, como oraciones, y ninguna Mano mirará lo que corta. Que lo llamen fe. Que no pregunten.»").set("cuenta", "registros")
	var atajo := _paso("Atajo", 10, 16, 2, 3, "registro", "atajo", true, "E  abrir el atajo")
	atajo.set("abre", "atajo-ala")
	_puerta(11, 19)
	var laboratorio := _paso("Laboratorio", 54, 16, 2, 3, "laboratorio", "oeste", true, "E  entrar")
	laboratorio.set("pide_objetivo", "registros")
	laboratorio.set("negado_texto", "La puerta de Génesis pide los tres registros (%d/%d)")
	_puerta(55, 19)
	_entrada("oeste", 3, 19, 1)
	_entrada("atajo", 11, 19, 1)
	_entrada("laboratorio", 55, 19, -1)
	_atrezo([["candelabro", 72, 304], ["candelabro", 136, 304]])
	_ambiente([], [[32, 304, 896]])
	return {"nombre": "ala", "ancho": 60, "alto": 23}


## 7 · El laboratorio 7 de Genesis (#225): lo que se sello con el artefacto
## dentro. Dos rayos a la entrada y, en su pedestal, el Pulmon Vacio: el primer
## objeto divino. Al tomarlo, el Impulso carnico (el doble salto) y la primera
## vision de la nina. La salida esta en lo alto: solo se llega con el
## Impulso, que se aprende aqui mismo.
func _laboratorio() -> Dictionary:
	_empezar("Laboratorio", 50, 30)
	_nivel_2()
	_piedra([[0, 0, 50, 2], [0, 0, 2, 30], [48, 0, 2, 30], [0, 25, 50, 5]])
	# El pedestal del artefacto y la repisa alta de la salida (128 px: el salto
	# llega a 92; con el Impulso, a 150).
	_piedra([[22, 22, 4, 3], [40, 17, 8, 1]])
	_cirujano(4, 25)
	_rayo(12, 2, Vector2.DOWN, 368.0, 0.0)
	_rayo(16, 2, Vector2.DOWN, 368.0, 600.0)
	var pulmon: Node2D = load("res://escenas/reliquia.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	pulmon.position = _pie(24, 22)
	pulmon.set("id", "pulmon")
	_poner(pulmon, "Reliquias", "Pulmon")
	var vision := Node2D.new()
	vision.set_script(load("res://scripts/vision.gd"))
	vision.set("id", "laboratorio")
	vision.set("tras", NodePath("../../Reliquias/Pulmon"))
	vision.set("objetivo", "puerta")
	vision.set("lineas", PackedStringArray([
		"¿Me ves?",
		"Nadie me ve. Nadie mira. Tú sí.",
		"Por eso te persiguen, Mano: te temen porque ya ves lo que ellos no.",
		"Esos pulmones eran de alguien muy grande. Ahora respiran contigo. Salta: no te van a dejar caer.",
		"Los muros no se mueven para hacerte daño. Se buscan. Como yo te he buscado a ti.",
		"Más adentro hay uno que guarda la puerta. Te dirá que es la ley.",
		"No le escuches. Pasa. Yo te enseño el camino.",
	]))
	_poner(vision, "Visiones", "Primera")
	_cartel("impulso", 36, 25, "En el aire, {saltar} otra vez:
el Impulso cárnico", "saltar", "vision-laboratorio")
	_paso("Ala", 2, 22, 2, 3, "ala", "laboratorio", true, "E  volver")
	_puerta(3, 25)
	_paso("Nave", 44, 14, 2, 3, "nave_libro", "oeste", true, "E  entrar")
	_puerta(45, 17)
	_entrada("oeste", 5, 25, 1)
	_entrada("nave", 44, 17, -1)
	_atrezo([["candelabro", 280, 400], ["candelabro", 520, 400]])
	_ambiente([], [[32, 400, 736]])
	return {"nombre": "laboratorio", "ancho": 50, "alto": 30}


## 8 · La Nave del Libro (#219): el Prior del Diezmo. La antesala, con su
## Altar bajo un techo bajo; la puerta que cae al empezar; la nave, entre dos
## muros de piedra viva que se cierran en la fase dos. Tras el muro del fondo,
## el atajo al Atrio y el camino adelante, que se abren al caer el Prior. Ver
## scripts/nave_libro.gd.
func _nave_libro() -> Dictionary:
	_empezar("NaveLibro", 64, 23)
	_raiz.set_script(load("res://scripts/nave_libro.gd"))
	_nivel_2()
	_raiz.set("fin", FIN_NAVE)
	_piedra([[0, 0, 14, 10], [14, 0, 2, 1], [16, 0, 48, 2], [0, 0, 2, 23], [62, 0, 2, 23], [0, 19, 64, 4]])
	_altar("Antesala", 6, 19)
	_cirujano(4, 19)
	var puerta := AnimatableBody2D.new()
	puerta.set_script(load("res://scripts/muro.gd"))
	puerta.position = Vector2(14 * 16, 1 * 16)
	puerta.set("tiles", Vector2i(2, 9))
	puerta.set("direccion", Vector2(0, 1))
	puerta.set("recorrido", 144.0)
	puerta.set("ciclico", false)
	_poner(puerta, "Muros", "Puerta")
	var compactacion := Node2D.new()
	_poner(compactacion, "", "Compactacion")
	for lado in [["Izquierdo", 16, Vector2.RIGHT], ["Derecho", 59, Vector2.LEFT]]:
		var muro := AnimatableBody2D.new()
		muro.set_script(load("res://scripts/muro.gd"))
		muro.position = Vector2(lado[1] * 16, 2 * 16)
		muro.set("tiles", Vector2i(3, 17))
		muro.set("direccion", lado[2])
		muro.set("recorrido", 96.0)
		muro.set("ciclico", false)
		_poner(muro, "Compactacion", lado[0])
	var guardianes := Node2D.new()
	_poner(guardianes, "", "Guardianes")
	var prior: Node2D = load("res://escenas/prior.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	prior.position = _pie(46, 19)
	_poner(prior, "Guardianes", "Prior")
	var aviso := Node2D.new()
	aviso.set_script(load("res://scripts/vision.gd"))
	aviso.set("id", "prior")
	aviso.set("tras", NodePath("../../Guardianes/Prior"))
	aviso.set("senal", "fase_dos")
	aviso.set("lineas", PackedStringArray(["Cuando alce el báculo con las dos manos, salta. El suelo no es tuyo."]))
	_poner(aviso, "Visiones", "Aviso")
	_paso("Laboratorio", 2, 16, 2, 3, "laboratorio", "nave", true, "E  volver")
	_puerta(3, 19)
	var atajo := _paso("Atajo", 60, 16, 2, 3, SALA_NAVE, "libro", true, "E  al Atrio")
	atajo.set("pide_marca", "prior-vencido")
	_puerta(61, 19)
	var adelante := _paso("Adelante", 56, 16, 2, 3, "", "", true, "E  descender")
	adelante.set("pide_marca", "prior-vencido")
	adelante.set("negado_texto", "No se abre mientras el Prior guarde la nave")
	_puerta(57, 19)
	_entrada("oeste", 5, 19, 1)
	_entrada("atajo", 59, 19, -1)
	_atrezo([["candelabro", 56, 304], ["candelabro", 152, 304], ["candelabro", 400, 304], ["candelabro", 840, 304]])
	_ambiente([[480, 32, 120], [640, 32, 100]], [[256, 304, 720]])
	return {"nombre": "nave_libro", "ancho": 64, "alto": 23}


# --- Las piezas del Nivel II --------------------------------------------------


## Lo de todo el nivel: la musica del siguiente nivel (decidido por Jean).
func _nivel_2() -> void:
	_raiz.set("musica", "catedral-bosque")


## Una nota que lleva objetivo o cuenta: la devuelve para ponerselo.
func _registro_nota(id: String, columna: int, fila: int, titulo: String, texto: String) -> Node2D:
	_nota(id, columna, fila, titulo, texto)
	return _raiz.get_node("Notas/" + id.to_pascal_case())


## El Libro colosal, el hito de la zona: un codice enorme detras de su nota.
func _libro(columna: int, fila: int) -> void:
	var libro := Sprite2D.new()
	libro.texture = load("res://arte/provisional/codice.png")
	libro.scale = Vector2(6, 6)
	libro.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	libro.centered = false
	libro.offset = Vector2(-4, -10)
	libro.position = _pie(columna, fila)
	libro.z_index = -3
	_poner(libro, "", "Libro")


## Un rayo de Genesis desde la fila (su emisor), hacia `direccion`.
func _rayo(columna: int, fila: int, direccion: Vector2, largo: float, desfase_ms: float, alto := 0.0) -> void:
	var rayo := Node2D.new()
	rayo.set_script(load("res://scripts/rayo.gd"))
	rayo.position = _pie(columna, fila) + Vector2(0, alto)
	rayo.set("direccion", direccion)
	rayo.set("largo", largo)
	rayo.set("desfase_ms", desfase_ms)
	_poner(rayo, "Peligros", "Rayo")
