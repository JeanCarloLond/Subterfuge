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
## La pista de la sala (musica.gd) y lo que tarda en entrar.
@export var musica := "atrio-santuario"
@export var fundido_musica := 4.0

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _interfaz: CanvasLayer = $Interfaz


func _ready() -> void:
	for grupo in ["Devotos", "Vestales", "Muros", "Reliquias", "Notas", "Charlas", "Pasos"]:
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
	_deuda_guardada()
	_primer_objetivo()
	var pista := get_node_or_null("/root/Musica")
	if pista and musica != "":
		pista.poner(musica, fundido_musica)


func _conectar(grupo: String, pieza: Node) -> void:
	match grupo:
		"Devotos", "Vestales", "Muros":
			pieza.objetivo = _cirujano
			if grupo == "Muros":
				pieza.cerrado.connect(_interfaz.avisar.bind("El camino de vuelta se ha cerrado"))
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
		"Pasos":
			pieza.cirujano = _cirujano
			pieza.cruzado.connect(_salir)


## Si se viene de otra sala por un paso, se aparece en su entrada. Devuelve si
## habia entrada.
func _entrar() -> bool:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.entrada == "":
		return false
	var entrada := get_node_or_null("Entradas/" + progreso.entrada)
	progreso.entrada = ""
	if entrada == null:
		return false
	_cirujano.colocar(entrada.position)
	_cirujano.mirar(entrada.get_meta("mirando", 1))
	_interfaz.abrir(ENTRADA_S)
	return true


## Si la partida guardada rezo en un Altar de esta sala, se empieza en el.
func _continuar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.sala != scene_file_path or not has_node("Altares/" + progreso.altar):
		return
	var altar: Node2D = get_node("Altares/" + progreso.altar)
	altar.encendido = true
	_cirujano.colocar(altar.position)


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
	_interfaz.cerrar(ENTRADA_S)
	get_tree().create_timer(ENTRADA_S).timeout.connect(get_tree().change_scene_to_file.bind(destino))


## El final de lo hecho hasta ahora: un velo y lo que viene.
func _terminar() -> void:
	var fin := CanvasLayer.new()
	fin.layer = 10
	var velo := ColorRect.new()
	velo.color = Color(0.078, 0.063, 0.078, 0.92)
	velo.set_anchors_preset(Control.PRESET_FULL_RECT)
	var texto := Label.new()
	texto.text = FIN
	texto.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	texto.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	texto.set_anchors_preset(Control.PRESET_FULL_RECT)
	fin.add_child(velo)
	fin.add_child(texto)
	add_child(fin)


## Muerto: la carne queda donde pisaba por ultima vez, y si el Altar esta en
## otra sala, se vuelve alli con la pantalla ya a negro.
func _al_morir() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.endeudar(scene_file_path, _cirujano.ultimo_suelo)
	_poner_deuda(_cirujano.ultimo_suelo)
	if progreso and progreso.sala != "" and progreso.sala != scene_file_path:
		var antes: float = (Sacramento.MUERTE["reaparecer_ms"] - 60.0) / 1000.0
		get_tree().create_timer(antes).timeout.connect(get_tree().change_scene_to_file.bind(progreso.sala))


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
	if _cirujano.position.y > limite_caida:
		_cirujano.caer_al_vacio()
		_interfaz.avisar("Caída al vacío")


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		get_tree().change_scene_to_file(PORTADA)


func _al_rezar(altar: Node2D) -> void:
	for otro in $Altares.get_children():
		if otro != altar:
			otro.encendido = false
	_interfaz.avisar("Altar: aquí volverás")
