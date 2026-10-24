## El Atrio (#185): la primera sala de Sigma, el mismo trazado que en Phaser
## para comparar la sensacion. La silleria es un TileMapLayer: se edita en el
## editor de Godot (la saco una vez herramientas/importar_atrio.gd).
##
## El nivel solo une las piezas: le dice a los Devotos, a los Altares y a los
## muros quien es el Cirujano, lleva la interfaz y mira la caida al vacio y el
## umbral.
##
## Las reliquias: el Pulmon Vacio (doble salto) a media bajada, en el camino y
## lejos del Altar (una E no debe rezar y tomar a la vez), y el Tendon del
## Mil (dash) en el nicho del fondo, al que solo se llega con el doble salto.
## Con las dos se abre el camino alto de la derecha: el Atrio se vuelve a
## recorrer, como un metroidvania.
##
## La compactacion (#189): un techo que late bajo el segundo Altar. Avisa y
## baja, pero siempre deja sitio: aqui se aprende el aviso sin pagarlo. Los
## cierres van a los Pasillos: el Atrio es abierto, en zigzag, y en un sitio
## abierto no hay pasillo que cerrar.
extends Node2D

const PORTADA := "res://escenas/principal.tscn"
const Sacramento := preload("res://scripts/sacramento.gd")
## Lo cerca del umbral que hay que estar para descender.
const ALCANCE_UMBRAL := 20.0
## Lo que tarda en aparecer el primer objetivo.
const PRIMER_OBJETIVO_S := 2.0

## Por debajo de esta y se ha caido del nivel: vuelve al Altar.
@export var limite_caida := 1060.0

var _terminado := false

@onready var _cirujano: CharacterBody2D = $Cirujano
@onready var _umbral: Marker2D = $Umbral
@onready var _interfaz: CanvasLayer = $Interfaz
@onready var _aviso_umbral: Label = $Umbral/Aviso
@onready var _fin: CanvasLayer = $Fin


func _ready() -> void:
	for devoto in $Devotos.get_children():
		devoto.objetivo = _cirujano
	for vestal in $Vestales.get_children():
		vestal.objetivo = _cirujano
	for muro in $Muros.get_children():
		muro.objetivo = _cirujano
		muro.cerrado.connect(_interfaz.avisar.bind("El camino de vuelta se ha cerrado"))
	for altar in $Altares.get_children():
		altar.cirujano = _cirujano
		altar.rezado.connect(_al_rezar.bind(altar))
	for reliquia in $Reliquias.get_children():
		reliquia.cirujano = _cirujano
		reliquia.recogida.connect(func(nombre: String, efecto: String) -> void:
			_interfaz.avisar("%s. %s" % [nombre, efecto])
		)
	if has_node("Notas"):
		for nota in $Notas.get_children():
			nota.cirujano = _cirujano
			nota.leida.connect(_interfaz.leer)
	if has_node("Charlas"):
		for alguien in $Charlas.get_children():
			alguien.cirujano = _cirujano
			alguien.habla.connect(_interfaz.hablar)
	_interfaz.conectar(_cirujano)
	_cirujano.murio.connect(_endeudar)
	# Las luces, a su altura: con los mapas de normales modelan la figura.
	for luz in find_children("*", "PointLight2D", true, false):
		luz.height = Sacramento.ALTURA_LUZ
	_continuar()
	_deuda_guardada()
	_primer_objetivo()
	var musica := get_node_or_null("/root/Musica")
	if musica:
		# Desde la portada y la intro (el tema epico): fundido largo, que la
		# epica se apague mientras el santuario entra por debajo.
		musica.poner("atrio-santuario", 4.0)


## Si la partida guardada rezo en un Altar de esta sala, se empieza en el.
func _continuar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.sala != scene_file_path or not $Altares.has_node(progreso.altar):
		return
	var altar: Node2D = $Altares.get_node(progreso.altar)
	altar.encendido = true
	_cirujano.colocar(altar.position)


## Una partida que empieza aqui no tiene objetivo: el primero llega cuando el
## Cirujano ya esta en pie, no encima de la entrada en la sala.
func _primer_objetivo() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso == null or progreso.objetivo != "":
		return
	get_tree().create_timer(PRIMER_OBJETIVO_S).timeout.connect(progreso.fijar_objetivo.bind("muros"))


## La deuda de carne: al morir, la carne queda donde pisaba por ultima vez.
func _endeudar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.endeudar(scene_file_path, _cirujano.ultimo_suelo)
	_poner_deuda(_cirujano.ultimo_suelo)


## Si la partida guardada dejo su carne en esta sala, ahi sigue.
func _deuda_guardada() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.deuda.get("sala", "") == scene_file_path:
		_poner_deuda(progreso.deuda["sitio"])


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
		_interfaz.avisar("Caída al vacío: vuelves al Altar")

	var cerca := _cirujano.position.distance_to(_umbral.position) <= ALCANCE_UMBRAL
	_aviso_umbral.visible = cerca and not _terminado
	if cerca and not _terminado and Input.is_action_just_pressed("interactuar") and not _cirujano.puede_ejecutar():
		_terminado = true
		_fin.visible = true


func _unhandled_input(evento: InputEvent) -> void:
	if evento.is_action_pressed("pausa"):
		get_tree().change_scene_to_file(PORTADA)


func _al_rezar(altar: Node2D) -> void:
	for otro in $Altares.get_children():
		if otro != altar:
			otro.encendido = false
	_interfaz.avisar("Altar: aquí volverás")
