## La Nave del Libro (#219): donde espera el Prior del Diezmo. Una antesala
## con su Altar (siempre antes de un guardian) y la nave. Al entrar en ella la
## puerta cae detras y el Prior despierta; en su fase dos, los muros de los
## lados se cierran y la pelea se estrecha.
##
## El muro izquierdo no esta en la fase uno: iria de suelo a techo junto a la
## puerta y taparia la entrada (#227). Brota en la fase dos, pegado a la
## puerta ya cerrada, y al vencer vuelve y se hunde.
##
## Rematado, la nave se abre: la puerta sube, los muros vuelven y el del fondo
## se hunde, y aparecen el atajo al Atrio (la Nave del Libro y el Atrio se
## funden: el mapa se compacta cuando cae un eslabon) y el camino adelante.
## Queda la Injertadora donde cayo. Morir en la pelea la reinicia desde el
## Altar, como en Dark Souls (lo hace sala.gd con cualquier muerte).
extends "res://scripts/sala.gd"

const RELIQUIA := preload("res://escenas/reliquia.tscn")
const NOMBRE := "El Prior del Diezmo"
const CIRUJANO := "El Cirujano"
## Lo que se dicen antes de pelear (#242): no se pelea porque si. Solo la
## primera vez; al volver tras morir, el Prior ya no tiene nada que hablar.
const PALABRAS := [
	[NOMBRE, "Una Mano fuera de su Sala. Sin turno. Con la máscara abierta."],
	[CIRUJANO, "Los muros se mueven, Prior. La carne no llega a los pabellones. Quiero saber por qué."],
	[NOMBRE, "Por qué. Las Manos no preguntan por qué: cortan y callan. Así se ha sostenido siempre el templo."],
	[CIRUJANO, "¿Sostenido?"],
	[NOMBRE, "Cada diezmo que cobro es un nudo. Mientras yo cobre, esta nave aguanta."],
	[NOMBRE, "Y tú bajas soltando nudos. En los Pasillos ya te dan un nombre."],
	[CIRUJANO, "No sé de qué nombre me hablas."],
	[NOMBRE, "Lo sabrás. Pero no de aquí en adelante, y no con los ojos abiertos."],
]
const RETRATOS := {
	NOMBRE: preload("res://arte/prior/retrato.png"),
	CIRUJANO: preload("res://arte/cirujano/retrato.png"),
}
## La musica de la pelea (#242), y lo que tarda en entrar y en irse.
const MUSICA_PELEA := "guardian-colossus"
const FUNDIDO_PELEA_S := 1.5
const FUNDIDO_FIN_S := 5.0
## Lo que dice al caer.
const CAIDO := "El Prior del Diezmo ha caído"
## Lo que tarda la puerta en caer.
const PUERTA_S := 0.35
## Pasado esto (x del mundo), la pelea empieza.
@export var inicio_x := 304.0

var _empezada := false

@onready var _prior: CharacterBody2D = get_node_or_null("Guardianes/Prior")
@onready var _puerta: Node2D = $Muros/Puerta
@onready var _izquierdo: Node2D = $Compactacion/Izquierdo
@onready var _derecho: Node2D = $Compactacion/Derecho


func _ready() -> void:
	super()
	for muro in [_izquierdo, _derecho]:
		muro.objetivo = _cirujano
	_esconder(_izquierdo)
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.aprendido("prior-vencido"):
		_ya_vencido()
		return
	_prior.objetivo = _cirujano
	_prior.limite_izquierdo = _izquierdo.position.x + _izquierdo.tiles.x * 16.0
	_prior.limite_derecho = _derecho.position.x
	_prior.despierta.connect(func() -> void:
		_interfaz.guardian(NOMBRE, _prior.vida, Sacramento.PRIOR["vida"])
	)
	_prior.vida_cambio.connect(_interfaz.guardian_vida)
	_prior.fase_dos.connect(_compactar)
	_prior.golpea_suelo.connect($Temblor.temblar)
	_prior.cae.connect(_vencido)


func _physics_process(delta: float) -> void:
	super(delta)
	if not _empezada and is_instance_valid(_prior) and _cirujano.position.x > inicio_x:
		_empezada = true
		_cerrar_puerta()
		# Primero cae la puerta (con el juego parado se quedaria a medias), y
		# luego hablan: la pelea empieza al acabar.
		get_tree().create_timer(PUERTA_S + 0.3).timeout.connect(_hablar)


func _hablar() -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso and progreso.aprendido("prior-hablado"):
		_pelear()
		return
	var lineas := []
	for palabra in PALABRAS:
		lineas.append({"quien": palabra[0], "texto": palabra[1]})
	_interfaz.hablar(lineas, RETRATOS, func() -> void:
		if progreso:
			progreso.aprender("prior-hablado")
		_pelear()
	)


## Despierta el Prior y entra la musica de la pelea.
func _pelear() -> void:
	if not is_instance_valid(_prior):
		return
	_prior.despertar()
	var pista := get_node_or_null("/root/Musica")
	if pista:
		pista.poner(MUSICA_PELEA, FUNDIDO_PELEA_S)


## La puerta cae de golpe, no al ritmo de la compactacion: con 6 s, un golpe
## podia echar al Cirujano fuera y la pelea seguia con el en la antesala.
func _cerrar_puerta() -> void:
	# Los muros son cuerpos que se mueven con la fisica: sus tweens, tambien.
	var cae := create_tween().set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)
	cae.tween_property(_puerta, "position:y", _puerta.position.y + _puerta.recorrido, PUERTA_S).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	cae.tween_callback($Temblor.temblar)
	_interfaz.avisar("La puerta se ha cerrado")


## La fase dos: los muros de los lados avanzan, y las ondas llegan hasta ellos.
func _compactar() -> void:
	_brotar(_izquierdo)
	_izquierdo.disparar()
	_derecho.disparar()
	_prior.limite_izquierdo += _izquierdo.recorrido
	_prior.limite_derecho -= _derecho.recorrido
	$Temblor.temblar()


## Fuera del juego: sin verse ni chocar.
func _esconder(muro: Node2D) -> void:
	muro.visible = false
	muro.collision_layer = 0


## Brota donde estaba escondido. Si el Cirujano esta en su sitio, sale a un lado.
func _brotar(muro: Node2D) -> void:
	muro.visible = true
	muro.collision_layer = 1
	var sitio: Rect2 = muro.rect()
	if sitio.intersects(_cirujano.caja()):
		_cirujano.position.x = sitio.end.x + 8.0


func _vencido() -> void:
	_interfaz.guardian_fuera()
	_interfaz.avisar(CAIDO)
	# La pelea se acaba: su musica se va despacio y vuelve la de la nave.
	var pista := get_node_or_null("/root/Musica")
	if pista:
		pista.poner(musica, FUNDIDO_FIN_S)
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.aprender("prior-vencido")
		progreso.fijar_objetivo("adentro")
	# La Injertadora, donde cayo.
	_dejar_injertadora(_prior.position)
	# La nave se abre: sube la puerta, vuelven los muros y el del fondo se hunde.
	$Temblor.temblar()
	var abre := create_tween().set_parallel().set_process_mode(Tween.TWEEN_PROCESS_PHYSICS)
	abre.tween_property(_puerta, "position:y", _puerta.position.y - _puerta.recorrido, 1.6).set_delay(1.0)
	for muro in [_izquierdo, _derecho]:
		# Que su ciclo no siga avanzando por debajo del tween (#229).
		muro.ciclo.estado = muro.ciclo.Estado.CERRADO
		muro.ciclo._fin_estado = INF
		var vuelta: float = muro.direccion.x * muro.ciclo.avance
		abre.tween_property(muro, "position:x", muro.position.x - vuelta, 1.6).set_delay(1.0)
	abre.chain().tween_property(_derecho, "position:y", _derecho.position.y + _derecho.tiles.y * 16.0, 2.0)
	abre.tween_callback(_esconder.bind(_izquierdo))


## Ya vencido (se vuelve a la nave): sin Prior, abierta.
func _ya_vencido() -> void:
	if is_instance_valid(_prior):
		# Si no se recogio la Injertadora (murio, salio...), sigue donde cayo
		# el Prior (#229): sin esto se perdia para siempre.
		var progreso := get_node_or_null("/root/Progreso")
		if progreso and not progreso.tiene("injertadora"):
			_dejar_injertadora(_prior.position)
		_prior.queue_free()
	_derecho.queue_free()


func _dejar_injertadora(sitio: Vector2) -> void:
	var injertadora := RELIQUIA.instantiate()
	injertadora.id = "injertadora"
	injertadora.position = sitio
	$Reliquias.add_child(injertadora)
	_conectar("Reliquias", injertadora)

