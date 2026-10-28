## Una sala de un nivel (#218): une sus piezas y la une a las demas. Como en
## Hollow Knight, un nivel son salas separadas, cada una su escena, y se pasa
## de una a otra por sus pasos (paso.gd). Al entrar se aparece en la entrada
## por la que se viene; con «Continuar», en el Altar donde se rezo.
##
## Le dice a los Devotos, las Vestales, los Altares, los muros, las reliquias,
## las notas y con quien se habla quien es el Cirujano, lleva la interfaz, la
## deuda de carne y la caida al vacio. Si se muere y el Altar esta en otra sala,
## se vuelve a esa sala.
extends Node2D

const PORTADA := "res://escenas/principal.tscn"
const Sacramento := preload("res://scripts/sacramento.gd")
## Lo que tarda en aparecer el primer objetivo de una partida nueva.
const PRIMER_OBJETIVO_S := 2.0
## Lo que tarda la pantalla en abrirse al entrar por un paso.
const ENTRADA_S := 0.35
const FIN := "Aquí empiezan los Pasillos de Preparación.
Fin del Nivel I.

Esc para volver a la portada"

## Por debajo de esta y se ha caido de la sala: vuelve atras, y cuesta.
@export var limite_caida := 1060.0
## Lo que dice el final de lo hecho hasta ahora (un paso sin destino).
@export_multiline var fin := FIN
## La marca que deja entrar en esta sala (vacio: ninguna): asi un cierre se
## sella para siempre solo cuando ya se esta del lado bueno.
@export var marca_al_entrar := ""
## Si la carne quedo en esta sala (una que la marca sella), pasa aqui, a la
## entrada `oeste`: si no, quedaria donde ya no se puede volver.
@export_file("*.tscn") var rescata_deuda_de := ""
## La pista de la sala (musica.gd) y lo que tarda en entrar.
@export var musica := "atrio-santuario"
@export var fundido_musica := 4.0

## Lo que traia el cuerpo de la sala anterior, si se entro por un paso.
var _cuerpo_al_entrar := {}
var _cierre_avisado := false

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _interfaz: CanvasLayer = $Interfaz


func _ready() -> void:
	# Lo que una sala anterior pudo dejar a medias al irse (#228): la pausa de
	# un panel abierto, o un hitstop cortado. Con eso, la sala nueva nacia
	# congelada.
	get_tree().paused = false
	Engine.time_scale = 1.0
	for grupo in ["Devotos", "Vestales", "Muros", "Reliquias", "Notas", "Charlas", "Visiones", "Pasos"]:
		if not has_node(grupo):
			continue
		for pieza in get_node(grupo).get_children():
			_conectar(grupo, pieza)
	if has_node("Altares"):
		for altar in $Altares.get_children():
			altar.cirujano = _cirujano
			altar.rezado.connect(_al_rezar.bind(altar))
	_interfaz.conectar(_cirujano)
	_cirujano.murio.connect(_al_morir)
	# Las luces, a su altura: con los mapas de normales modelan la figura.
	for luz in find_children("*", "PointLight2D", true, false):
		luz.height = Sacramento.ALTURA_LUZ
	if not _entrar():
		_continuar()
	_encender_altar()
	_deuda_guardada()
	_cirujano.restaurar_cuerpo(_cuerpo_al_entrar)
	_primer_objetivo()
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and marca_al_entrar != "":
		progreso.aprender(marca_al_entrar)
	if progreso and rescata_deuda_de != "" and progreso.deuda.get("sala", "") == rescata_deuda_de and has_node("Entradas/oeste"):
		var sitio: Vector2 = get_node("Entradas/oeste").position
		progreso.endeudar(scene_file_path, sitio)
		_poner_deuda(sitio)
	var pista := get_node_or_null("/root/Musica")
	if pista and musica != "":
		pista.poner(musica, fundido_musica)


func _conectar(grupo: String, pieza: Node) -> void:
	match grupo:
		"Devotos", "Vestales", "Muros":
			pieza.objetivo = _cirujano
			if grupo == "Muros":
				pieza.cerrado.connect(_avisar_cierre)
		"Reliquias":
			pieza.cirujano = _cirujano
			pieza.recogida.connect(func(nombre: String, efecto: String) -> void:
				_interfaz.avisar("%s. %s" % [nombre, efecto])
			)
		"Notas":
			pieza.cirujano = _cirujano
			pieza.leida.connect(_interfaz.leer)
		"Charlas":
			pieza.cirujano = _cirujano
			pieza.habla.connect(_interfaz.hablar)
		"Visiones":
			pieza.cirujano = _cirujano
			pieza.aparece.connect(_interfaz.vision)
		"Pasos":
			pieza.cirujano = _cirujano
			pieza.cruzado.connect(_salir)
			pieza.negado.connect(_interfaz.avisar)


## Si se viene de otra sala por un paso, se aparece en su entrada. Devuelve si
## habia entrada.
func _entrar() -> bool:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.entrada == "":
		return false
	var entrada := get_node_or_null("Entradas/" + progreso.entrada)
	progreso.entrada = ""
	var cuerpo: Dictionary = progreso.cuerpo
	progreso.cuerpo = {}
	if entrada == null:
		return false
	_cirujano.colocar(entrada.position)
	_cirujano.mirar(entrada.get_meta("mirando", 1))
	# Despues de la deuda (que baja el tope del Fervor): ver _ready.
	_cuerpo_al_entrar = cuerpo
	_interfaz.abrir(ENTRADA_S)
	return true


## Si la partida guardada rezo en un Altar de esta sala, se empieza en el.
func _continuar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.sala != scene_file_path or not has_node("Altares/" + progreso.altar):
		return
	_cirujano.colocar(get_node("Altares/" + progreso.altar).position)


## El Altar donde se rezo, encendido, se entre como se entre en la sala.
func _encender_altar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.sala == scene_file_path and has_node("Altares/" + progreso.altar):
		get_node("Altares/" + progreso.altar).encendido = true


## Una partida que empieza aqui no tiene objetivo: el primero llega cuando el
## Cirujano ya esta en pie, no encima de la entrada en la sala.
func _primer_objetivo() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.objetivo != "":
		return
	get_tree().create_timer(PRIMER_OBJETIVO_S).timeout.connect(progreso.fijar_objetivo.bind("muros"))


## Cruza un paso: la pantalla se cierra y se carga la otra sala. Sin destino,
## es el final de lo que hay hecho.
func _salir(destino: String, entrada: String) -> void:
	if destino == "":
		_terminar()
		return
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.entrada = entrada
		progreso.cuerpo = _cirujano.estado_cuerpo()
	_interfaz.cerrar(ENTRADA_S)
	get_tree().create_timer(ENTRADA_S).timeout.connect(_ir_a.bind(destino))


## Un cierre se avisa una vez por sala: el Pasillo tiene diecinueve techos, y
## salian diecinueve avisos seguidos (#232).
func _avisar_cierre() -> void:
	if _cierre_avisado:
		return
	_cierre_avisado = true
	_interfaz.avisar("El camino de vuelta se ha cerrado")


## Cambia de sala. Va atado a esta sala, no al arbol: si antes se sale a la
## portada, el temporizador ya no tiene a quien llamar y no saca de ella (#228).
func _ir_a(ruta: String) -> void:
	get_tree().change_scene_to_file(ruta)


## El final de lo hecho hasta ahora: un velo y lo que viene.
func _terminar() -> void:
	# Detras del velo, el Cirujano ya no se mueve.
	_cirujano.velocity = Vector2.ZERO
	_cirujano.set_physics_process(false)
	var capa := CanvasLayer.new()
	capa.layer = 10
	var velo := ColorRect.new()
	velo.color = Color(0.078, 0.063, 0.078, 0.92)
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	var texto := Label.new()
	texto.text = fin
	texto.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	texto.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	texto.set_anchors_preset(Control.PRESET_FULL_RECT)
	capa.add_child(velo)
	capa.add_child(texto)
	add_child(capa)


## Muerto: la carne queda donde pisaba por ultima vez y, con la pantalla ya a
## negro, se carga la sala del Altar, aunque sea esta: se vuelve siempre igual,
## al Altar, con la sala entera y el frasco lleno (#229). Antes, en la sala del
## Altar se reaparecia en la puerta por la que se habia entrado. Sin Altar
## rezado aun, se recarga la sala.
func _al_morir() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.endeudar(scene_file_path, _cirujano.ultimo_suelo)
	_poner_deuda(_cirujano.ultimo_suelo)
	var destino: String = progreso.sala if progreso and progreso.sala != "" else scene_file_path
	var antes: float = (Sacramento.MUERTE["reaparecer_ms"] - 60.0) / 1000.0
	get_tree().create_timer(antes).timeout.connect(_ir_a.bind(destino))


## Si la partida guardada dejo su carne en esta sala, ahi sigue.
func _deuda_guardada() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.deuda.get("sala", "") == scene_file_path:
		_poner_deuda(progreso.deuda["sitio"])
	elif progreso and not progreso.deuda.is_empty():
		# La carne esta en otra sala: el tope del Fervor sigue bajo.
		_cirujano.combate.fijar_tope(Sacramento.DEUDA["fervor_tope"])
		_interfaz.marcar_tope(Sacramento.DEUDA["fervor_tope"])


func _poner_deuda(sitio: Vector2) -> void:
	# Solo una a la vez: morir otra vez la cambia de sitio.
	for vieja in get_tree().get_nodes_in_group("deuda"):
		vieja.queue_free()
	var deuda := preload("res://scripts/deuda.gd").new()
	deuda.position = sitio
	deuda.cirujano = _cirujano
	deuda.add_to_group("deuda")
	add_child(deuda)
	_cirujano.combate.fijar_tope(Sacramento.DEUDA["fervor_tope"])
	_interfaz.marcar_tope(Sacramento.DEUDA["fervor_tope"])
	deuda.saldada.connect(_saldar)


func _saldar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.saldar()
	_cirujano.combate.fijar_tope(Sacramento.FERVOR["maximo"])
	_interfaz.marcar_tope(Sacramento.FERVOR["maximo"])
	_interfaz.avisar("Recuperas tu carne")


func _physics_process(_delta: float) -> void:
	# Muerto y cayendo, no: se avisaba en cada fotograma, encima de «Diezmado».
	if _cirujano.position.y > limite_caida and not _cirujano.muerto:
		_cirujano.caer_al_vacio()
		_interfaz.avisar("Caída al vacío")


## Esc abre la pausa (#230): salir a la portada es una de sus opciones, y
## pregunta antes, porque se pierde lo hecho desde el ultimo Altar.
func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		_interfaz.pausar()
		get_viewport().set_input_as_handled()


func _al_rezar(altar: Node2D) -> void:
	for otro in $Altares.get_children():
		if otro != altar:
			otro.encendido = false
	_interfaz.avisar("La fuente te llena el frasco. Aquí volverás")
