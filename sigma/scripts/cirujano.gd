## El Cirujano (#182): lee los controles, le pasa a movimiento.gd y a
## combate.gd lo que toca y mueve el cuerpo con lo que devuelven. Lleva su
## vitalidad y el sitio donde reaparece (#185), y resuelve sus golpes contra
## los enemigos (#183): tambien el contragolpe tras un parry y la ejecucion de
## un aturdido, como en Blasphemous.
##
## El origen esta en los pies. La caja que choca es la del original, 10x22: la
## mascara y la mitra no chocan, porque un pico que tocara los techos volveria
## el salto impredecible. Esta en la capa 2 y solo choca con la 1, el mundo:
## los enemigos lo atraviesan y el dano se resuelve con las cajas.
extends CharacterBody2D

signal vitalidad_cambio(actual: int, maxima: int)
## Se ha quedado sin vitalidad: la interfaz pone el aviso de la muerte.
signal murio
## Algo que contar en la interfaz (una ofrenda recogida).
signal aviso(texto: String)
signal fervor_cambio(actual: int, maximo: int)
signal pociones_cambio(cargas: int, maximas: int)
## Cuantos injertos lleva la Injertadora (#191); -1 en maximas: no la tiene.
signal injertos_cambio(cargas: int, maximas: int)

enum Resultado { PARADO, HERIDO, IGNORADO }

const Movimiento := preload("res://scripts/movimiento.gd")
const Combate := preload("res://scripts/combate.gd")
const Injertadora := preload("res://scripts/injertadora.gd")
const Injerto := preload("res://scripts/injerto.gd")
const Sacramento := preload("res://scripts/sacramento.gd")

## El Cirujano de Sigma, en tres cuartos y fotograma a fotograma
## (scripts/cirujano-sigma.mjs): una animacion por cosa que hace.
const ARTE := "res://arte/cirujano/"
const Animaciones := preload("res://arte/cirujano/animaciones.gd")
const Texturas := preload("res://scripts/texturas.gd")
## Las fases de cada golpe, como en Blasphemous: los fotogramas de aviso, el del
## smear (el arco del bisturi), el del impacto, que se sostiene, y los de la
## recuperacion, que se ven ya con el cuerpo libre.
const FASES := {
	"golpe": {"aviso": [0, 1], "smear": 2, "impacto": 3, "recuperacion": [4, 5]},
	"cargado": {"aviso": [0, 1], "smear": 2, "impacto": 3, "recuperacion": [4, 5]},
	"arriba": {"aviso": [0], "smear": 1, "impacto": 2, "recuperacion": [3]},
	"abajo": {"aviso": [0], "smear": 1, "impacto": 2, "recuperacion": []},
	"contragolpe": {"aviso": [0], "smear": 1, "impacto": 2, "recuperacion": [3]},
}
## El smear dura un par de fotogramas de juego: si dura mas, se lee como un
## escudo y no como un tajo.
const SMEAR_MS := 40.0
const RECUPERACION_MS := 70.0
const REPOSO_MS := 220.0
const ATERRIZAJE_MS := 90.0
## La ejecucion: el bisturi en alto cambia de cuadro a mitad; el tajo, cada 60.
const ALZA_MS := 140.0
const TAJO_MS := 60.0
## Un cuadro de carrera cada tantos pixeles andados. Menos, y tiembla; mas, y
## patina.
const PX_POR_CUADRO := 7.0
const SACUDIDA_PX := 3.0
## La estela del dash y del contragolpe: una copia del fotograma cada tantos ms,
## que se apaga. Es lo que en pixel art hace de desenfoque de movimiento.
const ESTELA_CADA_MS := 35.0
const ESTELA_DURA := 0.22
const COLOR_ESTELA := Color(0.85, 0.75, 0.6, 0.55)
## Lo que tiene que caer para levantar polvo al aterrizar (px/s).
const CAIDA_CON_POLVO := 260.0
## Lo que tiene que caer para que el aterrizaje suene (px/s).
const CAIDA_QUE_SUENA := 120.0
const COLOR_POLVO := Color(0.55, 0.47, 0.4, 0.8)
const COLOR_CHISPA := Color(1.0, 0.93, 0.7)
## La carga del golpe con Fervor: el cuerpo se calienta hacia el ambar del
## Fervor mientras carga, suben brasas, y al completarse da un destello.
const AMBAR := Color(1.45, 1.05, 0.45)
const COLOR_BRASA := Color(1.0, 0.66, 0.22)

## En las salas de prueba el cuerpo viene entero; en los niveles, el doble
## salto y el dash esperan a sus reliquias.
@export var reliquias_libres := false

var movimiento: Movimiento
var combate: Combate
var injertadora: Injertadora
## Si la tiene: se gana al vencer al Prior del Diezmo (#219).
var tiene_injertadora := false
var vitalidad: int = Sacramento.VITALIDAD["maxima"]
## Donde vuelve al morir o al caer al vacio: el ultimo Altar, o donde empezo.
var punto_reaparicion := Vector2.ZERO
## Sin vitalidad, hasta volver al Altar.
var muerto := false
## El fotograma en que la E empezo una ejecucion (ver puede_ejecutar).
var _e_ejecuto_en := -1
## Lo ultimo que piso: ahi queda la deuda de carne si muere (en un pozo, en el
## borde del que cayo, y no en el fondo, donde no se podria recuperar).
var ultimo_suelo := Vector2.ZERO
## La ultima piedra quieta que piso (no un muro que se mueve): ahi vuelve al
## caer al vacio, como en Hollow Knight. Cero: aun ninguna.
var suelo_seguro := Vector2.ZERO

## Lo andado en el suelo: el paso va con la distancia, no con el reloj.
## Contra una pared no se avanza, y las piernas no deben moverse.
var _recorrido := 0.0
## A quien esta ejecutando, y si ya bajo el bisturi.
var _victima: Node2D
var _rematada := false
## Los fotogramas de cada animacion.
var _cuadros := {}
## El golpe que acaba de terminar, para su recuperacion, y hasta cuando dura.
var _recuperacion := ""
var _fin_recuperacion := -INF
var _en_suelo_antes := true
var _fin_aterrizaje := -INF
var _proxima_estela := -INF
var _caida_antes := 0.0
var _colgado_antes := false
## Brasas que suben mientras carga el golpe con Fervor.
var _brasas: CPUParticles2D
var _cargado_avisado := false
var _paso_antes := -1

@onready var _figura: Node2D = $Figura
@onready var _sprite: Sprite2D = $Figura/Sprite


func _ready() -> void:
	punto_reaparicion = position
	movimiento = Movimiento.new(position.y)
	movimiento.caida.connect(_al_caer)
	combate = Combate.new()
	injertadora = Injertadora.new()
	_aplicar_reliquias()
	_brasas = CPUParticles2D.new()
	_brasas.emitting = false
	_brasas.amount = 20
	_brasas.lifetime = 0.6
	_brasas.position = Vector2(0, -8)
	_brasas.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	_brasas.emission_rect_extents = Vector2(9, 4)
	_brasas.direction = Vector2.UP
	_brasas.spread = 15.0
	_brasas.gravity = Vector2(0, -40)
	_brasas.initial_velocity_min = 20.0
	_brasas.initial_velocity_max = 45.0
	_brasas.color = COLOR_BRASA
	add_child(_brasas)
	for nombre in Animaciones.RECUENTO:
		var lista: Array[Texture2D] = []
		for i in Animaciones.RECUENTO[nombre]:
			lista.append(Texturas.con_normales("%s%s-%d.png" % [ARTE, nombre, i]))
		_cuadros[nombre] = lista


func _physics_process(delta: float) -> void:
	if is_on_floor() and not muerto:
		ultimo_suelo = position
		if _pisa_piedra_quieta():
			suelo_seguro = position
	if muerto:
		# El cuerpo cae donde estaba, sin control, hasta volver al Altar.
		velocity.x = 0.0
		velocity.y = minf(velocity.y + Sacramento.MOVIMIENTO["gravedad"] * delta, Sacramento.MOVIMIENTO["velocidad_caida_max"])
		move_and_slide()
		return
	var lucha := Combate.Entrada.new()
	lucha.golpe_pulsado = Input.is_action_just_pressed("golpear")
	lucha.golpe_soltado = Input.is_action_just_released("golpear")
	lucha.parry_pulsado = Input.is_action_just_pressed("parry")
	# K en el aire pegado a una membrana no es un parry: clava el bisturi en
	# ella. En la piedra no entra, y K sigue siendo el parry.
	var pared_al_lado := 0 if is_on_floor() else _pared_al_lado()
	var clavar := lucha.parry_pulsado and pared_al_lado != 0 and _clavable(pared_al_lado)
	if clavar:
		lucha.parry_pulsado = false
	lucha.pocion_pulsada = Input.is_action_just_pressed("pocion")
	lucha.arriba = Input.is_action_pressed("arriba")
	lucha.abajo = Input.is_action_pressed("abajo")

	var fervor_antes := combate.fervor
	var cargas_antes := combate.cargas_pocion
	combate.paso(delta, lucha, movimiento.libre(), is_on_floor())
	if combate.bloqueo_ms > 0.0:
		movimiento.bloquear(combate.bloqueo_ms)
		if combate.accion == Combate.Accion.GOLPE:
			_voz("ataque")
			_sonar("tajo")
		elif combate.accion == Combate.Accion.PARRY:
			_sonar("guardia")
		if combate.accion == Combate.Accion.GOLPE and combate.tipo == Combate.Tipo.CONTRAGOLPE:
			_embestir()
	if combate.curar > 0:
		_curar(combate.curar)
		_sonar("trago")
	if Input.is_action_just_pressed("interactuar"):
		_intentar_ejecutar()
	injertadora.paso(delta)
	if Input.is_action_just_pressed("injertadora"):
		_disparar_injerto()
	if combate.accion == Combate.Accion.EJECUCION:
		if combate.ejecucion_golpea() and not _rematada:
			_rematar()
	elif _victima != null:
		_victima = null

	var entrada := Movimiento.Entrada.new()
	entrada.eje_x = int(signf(Input.get_axis("izquierda", "derecha")))
	entrada.saltar_pulsado = Input.is_action_just_pressed("saltar")
	entrada.saltar_mantenido = Input.is_action_pressed("saltar")
	entrada.dash_pulsado = Input.is_action_just_pressed("dash")
	entrada.arriba = lucha.arriba
	entrada.abajo = lucha.abajo
	entrada.clavar = clavar

	# La normal de la pared apunta hacia fuera: una pared a la derecha da -1.
	var pared := -int(signf(get_wall_normal().x)) if is_on_wall() else 0
	if clavar and pared == 0:
		pared = pared_al_lado

	movimiento.velocidad = velocity
	var subia := velocity.y
	movimiento.paso(delta, entrada, is_on_floor(), pared, position.y)
	velocity = movimiento.velocidad
	# Un salto: la velocidad pasa de golpe a subir.
	if entrada.saltar_pulsado and velocity.y < -250.0 and velocity.y < subia - 200.0:
		_voz("salto")
		_sonar("salto")
	_caida_antes = velocity.y
	move_and_slide()
	_efectos_de_movimiento()

	if combate.zona_activa():
		_golpear_enemigos()
	if combate.fervor != fervor_antes:
		fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
	if combate.cargas_pocion != cargas_antes:
		pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
	_pintar(delta)


## Si hay una pared pegada a un lado (primero hacia donde mira): -1, 1 o 0.
## Sin empujar contra ella, is_on_wall no la ve.
func _pared_al_lado() -> int:
	for lado in [movimiento.mirando, -movimiento.mirando]:
		if test_move(global_transform, Vector2(lado * 3.0, 0.0)):
			return lado
	return 0


## Si la pared de ese lado es membrana (o algo del grupo «clavable»): solo en
## ella entra el bisturi (feedback de Jean: engancharse a cualquier pared era
## confuso). Se mira el punto donde entraria la hoja, a media altura.
func _clavable(lado: int) -> bool:
	var consulta := PhysicsPointQueryParameters2D.new()
	consulta.position = global_position + Vector2(lado * 7.0, -12.0)
	consulta.collision_mask = 1
	for choque in get_world_2d().direct_space_state.intersect_point(consulta, 4):
		if choque["collider"] is Node and choque["collider"].is_in_group("clavable"):
			return true
	return false


## Un efecto del cuerpo o del combate (autoload Efectos).
func _sonar(efecto: String, volumen_db := 0.0) -> void:
	if not is_inside_tree():
		return
	var efectos := get_node_or_null("/root/Efectos")
	if efectos:
		efectos.sonar(efecto, volumen_db)


func _voz(voz: String) -> void:
	if not is_inside_tree():
		return
	var voces := get_node_or_null("/root/Voces")
	if voces:
		voces.cirujano(voz)


## La caja que choca, en coordenadas del mundo.
func caja() -> Rect2:
	return Rect2(position.x - 5.0, position.y - 22.0, 10.0, 22.0)


## Toma una reliquia: la habilidad queda para toda la partida.
func ganar_reliquia(id: String) -> void:
	var progreso := get_node_or_null("/root/Progreso")
	if progreso:
		progreso.ganar(id)
	_aplicar_reliquias(id)
	_chispas(position + Vector2(0, -30))


func _aplicar_reliquias(recien := "") -> void:
	var progreso := get_node_or_null("/root/Progreso")
	var tiene := func(id: String) -> bool:
		return reliquias_libres or id == recien or (progreso != null and progreso.tiene(id))
	movimiento.puede_doble_salto = tiene.call("pulmon")
	var la_tenia := tiene_injertadora
	tiene_injertadora = tiene.call("injertadora")
	# Se gana llena (#178 del original).
	if tiene_injertadora and (recien == "injertadora" or (reliquias_libres and recien == "")):
		injertadora.recargar(Sacramento.INJERTADORA["carga_maxima"])
	if tiene_injertadora != la_tenia or recien == "injertadora":
		injertos_cambio.emit(injertadora.cargas, Sacramento.INJERTADORA["carga_maxima"])
	movimiento.puede_dash = tiene.call("tendon")


## Un golpe de un enemigo desde `origen_x`. Si la ventana del parry esta
## abierta lo para; si no, hiere, salvo en un dash o con i-frames.
func recibir_golpe(origen_x: float, dano: int) -> Resultado:
	if muerto:
		return Resultado.IGNORADO
	if combate.parar():
		_sonar("parada")
		fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
		_chispas(position + Vector2(movimiento.mirando * 8.0, -26.0))
		_pausa_de_impacto(Sacramento.IMPACTO["parry_ms"])
		return Resultado.PARADO
	var retroceso := Vector2(Sacramento.VITALIDAD["retroceso_x"], Sacramento.VITALIDAD["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return Resultado.IGNORADO
	# El empujon, ya: si no, el paso siguiente lo pisaba con la velocidad de
	# antes y el Cirujano se quedaba clavado (#231).
	velocity = movimiento.velocidad
	combate.cancelar()
	_voz("herida")
	_perder(dano)
	return Resultado.HERIDO


## Rozar a un enemigo o a un peligro: el dano de CONTACTO, o `dano` si se da,
## con otro empujon. El parry no lo para: lee golpes, no evita chocarse.
func recibir_contacto(origen_x: float, dano: int = Sacramento.CONTACTO["dano"]) -> bool:
	if muerto:
		return false
	var retroceso := Vector2(Sacramento.CONTACTO["retroceso_x"], Sacramento.CONTACTO["retroceso_y"])
	if not movimiento.herir(position.x, origen_x, retroceso):
		return false
	velocity = movimiento.velocidad
	combate.cancelar()
	_voz("herida")
	_perder(dano)
	return true


## Caer al vacio: cuesta un punto y devuelve al Altar, pero no es morir.
## Caer al vacio cuesta (Sacramento.DANO_VACIO) y devuelve a la ultima piedra
## quieta que piso: fallar un salto duele, pero no obliga a repetir la sala.
func caer_al_vacio() -> void:
	if muerto:
		return
	_perder(Sacramento.DANO_VACIO)
	if vitalidad <= 0:
		return
	if suelo_seguro == Vector2.ZERO:
		_volver()
		return
	position = suelo_seguro
	velocity = Vector2.ZERO
	movimiento.reaparecer(position.y)
	combate.cancelar()


## Si lo que pisa es silleria (un TileMapLayer), no un muro que se mueve.
func _pisa_piedra_quieta() -> bool:
	for i in get_slide_collision_count():
		var choque := get_slide_collision(i)
		if choque.get_normal().y < -0.5 and choque.get_collider() is TileMapLayer:
			return true
	return false


## Aplastado entre un muro y la piedra (#186): muere. El muro ya ha avisado
## antes de moverse, y un cuerpo aplastado no se levanta con un punto menos.
func aplastar() -> void:
	if muerto:
		return
	_perder(vitalidad)


## Rezar en un Altar: se arrodilla, se cura del todo, llena el frasco y ese
## Altar es el nuevo sitio donde vuelve. Devuelve false si no puede.
func rezar(altar: Vector2) -> bool:
	if puede_ejecutar() or not movimiento.rezar():
		return false
	punto_reaparicion = altar
	vitalidad = Sacramento.VITALIDAD["maxima"]
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	combate.reponer_pociones()
	pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
	return true


func _golpear_enemigos() -> void:
	var zona := combate.zona(position, movimiento.mirando)
	for enemigo in get_tree().get_nodes_in_group("enemigos"):
		if not enemigo.vivo() or not zona.intersects(enemigo.caja()):
			continue
		var dano := combate.registrar_golpe(enemigo.get_instance_id())
		if dano == 0:
			continue
		enemigo.recibir_dano(dano, position.x)
		_sonar("golpe" if combate.tipo == Combate.Tipo.BASICO else "golpe-fuerte")
		_pausa_de_impacto(_pausa_del_golpe())
		if combate.tipo != Combate.Tipo.BASICO:
			_sacudir()
		if combate.direccion == Combate.Direccion.ABAJO:
			combate.rebotar()
			movimiento.rebotar()
			velocity = movimiento.velocidad


func _pausa_del_golpe() -> float:
	match combate.tipo:
		Combate.Tipo.CARGADO:
			return Sacramento.IMPACTO["cargado_ms"]
		Combate.Tipo.CONTRAGOLPE:
			return Sacramento.IMPACTO["contragolpe_ms"]
	return Sacramento.IMPACTO["golpe_ms"]


## El contragolpe se adelanta un palmo hacia quien acaba de golpear: con
## colision, para no meterse en la piedra.
func _embestir() -> void:
	move_and_collide(Vector2(movimiento.mirando * Sacramento.COMBATE["contragolpe"]["embestida_px"], 0.0))


## Interactuar junto a un aturdido lo ejecuta. Si hay varios, el mas cercano.
func _intentar_ejecutar() -> void:
	var E: Dictionary = Sacramento.EJECUCION
	var mejor := _a_quien_ejecutar()
	if mejor == null or not combate.ejecutar(movimiento.libre()):
		return
	_e_ejecuto_en = Engine.get_process_frames()

	_victima = mejor
	_rematada = false
	movimiento.mirando = 1 if mejor.position.x >= position.x else -1
	# Se coloca a un palmo, de frente: la ejecucion no se hace desde lejos.
	var sitio: float = mejor.position.x - movimiento.mirando * 16.0
	move_and_collide(Vector2(sitio - position.x, 0.0))
	mejor.ejecutar(position.x)
	movimiento.bloquear(E["duracion_ms"])
	movimiento.blindar(E["duracion_ms"])
	fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
	_acercar_camara(E["duracion_ms"])


## Si la E de ahora es para ejecutar: hay un aturdido al alcance y el cuerpo
## esta libre, o la E de este mismo fotograma ya empezo una ejecucion. Entonces
## la E no reza, ni toma, ni lee: con un Altar al lado, una pulsacion hacia dos
## cosas. Lo segundo hace falta porque el Altar, la reliquia y la nota miran la
## E en _process, despues de la fisica: para entonces el Cirujano ya no esta
## libre y el aturdido ya no es ejecutable.
## Si la E de ahora es para lo que hay al lado (leer, hablar, tomar): vivo y sin
## nadie a quien ejecutar. Muerto, una nota abierta pausaba el arbol y la
## pausa pasaba a la sala del Altar (#228).
func e_libre() -> bool:
	return not muerto and not puede_ejecutar()


func puede_ejecutar() -> bool:
	if _e_ejecuto_en == Engine.get_process_frames():
		return true
	return movimiento.libre() and _a_quien_ejecutar() != null


func _a_quien_ejecutar() -> Node2D:
	if not is_inside_tree():
		return null
	return elegir_ejecutable(position, get_tree().get_nodes_in_group("enemigos"))


## De `enemigos`, el aturdido mas cercano a `desde` al alcance de una
## ejecucion, o null. Aparte del arbol, para probarlo sin escena en marcha.
static func elegir_ejecutable(desde: Vector2, enemigos: Array) -> Node2D:
	var E: Dictionary = Sacramento.EJECUCION
	var mejor: Node2D = null
	for enemigo in enemigos:
		if not enemigo.has_method("ejecutable") or not enemigo.ejecutable():
			continue
		var dx: float = absf(enemigo.position.x - desde.x)
		if dx > E["alcance_x"] or absf(enemigo.position.y - desde.y) > E["alcance_y"]:
			continue
		if mejor == null or dx < absf(mejor.position.x - desde.x):
			mejor = enemigo
	return mejor


## Baja el bisturi: el aturdido cae, el mundo se para y la camara tiembla.
func _rematar() -> void:
	_rematada = true
	if is_instance_valid(_victima):
		_victima.rematar()
	_sonar("golpe-fuerte")
	_sacudir()
	_pausa_de_impacto(Sacramento.EJECUCION["pausa_ms"])


## Polvo al aterrizar de una caida larga, chispas al clavarse en la pared y
## estela en el dash y el contragolpe.
func _efectos_de_movimiento() -> void:
	# Al clavar el bisturi en la pared salta un chispazo donde entra la hoja.
	var colgado := movimiento.estado == Movimiento.Estado.AGARRE
	if colgado and not _colgado_antes:
		_chispas(position + Vector2(movimiento.mirando * 9.0, -40.0))
	_colgado_antes = colgado
	if is_on_floor() and not _en_suelo_antes and _caida_antes > CAIDA_QUE_SUENA:
		# Al tocar suelo: mas fuerte cuanto mas cae.
		_sonar("caida", -8.0 if _caida_antes < CAIDA_CON_POLVO else 0.0)
	if is_on_floor() and not _en_suelo_antes and _caida_antes > CAIDA_CON_POLVO:
		_polvo(position, 10)
	var rapido := movimiento.estado == Movimiento.Estado.DASH or (
		combate.accion == Combate.Accion.GOLPE and combate.tipo == Combate.Tipo.CONTRAGOLPE)
	if rapido and combate.ahora >= _proxima_estela:
		_proxima_estela = combate.ahora + ESTELA_CADA_MS
		_estela()


## Una copia del fotograma de ahora, quieta donde estaba, que se apaga.
func _estela() -> void:
	var copia := Sprite2D.new()
	copia.texture = _sprite.texture
	copia.centered = false
	copia.offset = _sprite.offset
	copia.scale = _figura.scale
	copia.position = position
	copia.modulate = COLOR_ESTELA
	copia.z_index = -1
	get_parent().add_child(copia)
	var apagar := copia.create_tween()
	apagar.tween_property(copia, "modulate:a", 0.0, ESTELA_DURA)
	apagar.tween_callback(copia.queue_free)


func _polvo(donde: Vector2, cuantas: int) -> void:
	_rafaga(donde, cuantas, COLOR_POLVO, Vector2(0, -1), 80.0, 20.0, 60.0, Vector2(0, 60), 0.45)


## Las chispas del parry: el metal contra el metal, lo unico limpio del juego.
func _chispas(donde: Vector2) -> void:
	_rafaga(donde, 14, COLOR_CHISPA, Vector2(movimiento.mirando, -0.3), 70.0, 60.0, 160.0, Vector2(0, 300), 0.3)


func _rafaga(donde: Vector2, cuantas: int, color: Color, direccion: Vector2, abertura: float,
		v_min: float, v_max: float, gravedad: Vector2, vida: float) -> void:
	var r := CPUParticles2D.new()
	r.position = donde
	r.one_shot = true
	r.explosiveness = 0.95
	r.amount = cuantas
	r.lifetime = vida
	r.direction = direccion
	r.spread = abertura
	r.initial_velocity_min = v_min
	r.initial_velocity_max = v_max
	r.gravity = gravedad
	r.color = color
	get_parent().add_child(r)
	r.emitting = true
	get_tree().create_timer(vida + 0.2).timeout.connect(r.queue_free)


## La camara se acerca mientras dura la ejecucion y vuelve despues.
func _acercar_camara(ms: float) -> void:
	var camara := get_viewport().get_camera_2d()
	if camara == null:
		return
	var zoom: float = Sacramento.EJECUCION["zoom"]
	var acercar := create_tween()
	acercar.tween_property(camara, "zoom", Vector2.ONE * zoom, 0.18).set_ease(Tween.EASE_OUT)
	acercar.tween_interval(ms / 1000.0 - 0.18)
	acercar.tween_property(camara, "zoom", Vector2.ONE, 0.25).set_ease(Tween.EASE_IN_OUT)


func _sacudir() -> void:
	var camara := get_viewport().get_camera_2d()
	if camara == null:
		return
	var sacudida := create_tween()
	for i in 4:
		var lado := 1.0 if i % 2 == 0 else -1.0
		sacudida.tween_property(camara, "offset", Vector2(lado * SACUDIDA_PX, -lado * SACUDIDA_PX / 2.0), 0.03)
	sacudida.tween_property(camara, "offset", Vector2.ZERO, 0.04)


## La pausa al conectar (hitstop): el mundo se para un instante. El temporizador
## no se para con el, o no acabaria nunca.
func _pausa_de_impacto(ms: float) -> void:
	Engine.time_scale = 0.0
	await get_tree().create_timer(ms / 1000.0, true, false, true).timeout
	Engine.time_scale = 1.0


## Recoge una ofrenda (ofrenda.gd). La carne cura; con el cuerpo entero va al
## frasco como una carga de Pocion, y con todo lleno se pierde (#174 en el
## original). El sello da Fervor.
func recoger_ofrenda(tipo: String) -> void:
	match tipo:
		"carne":
			_sonar("salto", 4.0)
			if vitalidad < Sacramento.VITALIDAD["maxima"]:
				_curar(Sacramento.OFRENDA["curacion_carne"])
				aviso.emit("Carne del diezmo")
			elif combate.cargas_pocion < Sacramento.POCION["cargas_maximas"]:
				combate.cargas_pocion += 1
				pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
				aviso.emit("Carne del diezmo: al frasco")
		"sello":
			_sonar("guardia")
			combate.sumar_fervor(Sacramento.OFRENDA["fervor_sello"])
			fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])
			aviso.emit("Sello del diezmo")
		"injerto":
			_sonar("guardia", -4.0)
			if injertadora.recargar(1) > 0:
				injertos_cambio.emit(injertadora.cargas, Sacramento.INJERTADORA["carga_maxima"])
				aviso.emit("Injerto de metal")


func _curar(puntos: int) -> void:
	vitalidad = mini(Sacramento.VITALIDAD["maxima"], vitalidad + puntos)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])


func _al_caer(dano: int, _altura: float) -> void:
	_voz("caida")
	_perder(dano)


func _perder(dano: int) -> void:
	if muerto:
		return
	vitalidad = maxi(0, vitalidad - dano)
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	if vitalidad == 0:
		# Diferido: esto puede llegar en mitad de un paso del movimiento.
		_morir.call_deferred()


## Se desploma a la vista (como en el original: se aplasta, se tine de carne
## y se apaga), la interfaz pone el aviso, y al rato vuelve al Altar entero.
## Mientras, no hay control ni golpes que valgan.
func _morir() -> void:
	if muerto:
		return
	muerto = true
	_voz("muerte")
	combate.cancelar()
	movimiento.blindar(Sacramento.MUERTE["reaparecer_ms"])
	# Se desploma con su animacion: el golpe lo echa atras, se le doblan las
	# rodillas y cae postrado. Despues se tine de carne y se apaga.
	var duracion: float = Sacramento.MUERTE["desplome_ms"] / 1000.0
	var cuadros: Array = _cuadros["muerte"]
	var desplome := create_tween()
	for cuadro in cuadros:
		desplome.tween_callback(func() -> void: _sprite.texture = cuadro)
		desplome.tween_interval(duracion / cuadros.size())
	desplome.tween_property(_figura, "modulate", Color(0.55, 0.18, 0.18, 0.35), 0.5)
	murio.emit()
	get_tree().create_timer(Sacramento.MUERTE["reaparecer_ms"] / 1000.0).timeout.connect(_revivir)


func _revivir() -> void:
	muerto = false
	vitalidad = Sacramento.VITALIDAD["maxima"]
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	_figura.scale = Vector2(movimiento.mirando, 1.0)
	_figura.modulate = Color.WHITE
	_volver()


## Lo pone en `sitio` como si volviera de rezar alli: al continuar una partida.
func colocar(sitio: Vector2) -> void:
	punto_reaparicion = sitio
	_volver()


## La Injertadora (#191): un injerto recto a la altura del pecho. Solo con el
## cuerpo libre y sin otra accion; la presion lo empuja un poco atras.
func _disparar_injerto() -> void:
	if not tiene_injertadora or not movimiento.libre() or combate.accion != Combate.Accion.NINGUNA:
		return
	if not injertadora.disparar():
		return
	var I: Dictionary = Sacramento.INJERTADORA
	var injerto := Injerto.new()
	injerto.position = position + Vector2(movimiento.mirando * 12.0, -14.0)
	injerto.velocidad = Vector2(movimiento.mirando * I["velocidad"], 0.0)
	injerto.dano = I["dano"]
	get_parent().add_child(injerto)
	velocity.x -= movimiento.mirando * I["retroceso"]
	_sonar("parada", -6.0)
	injertos_cambio.emit(injertadora.cargas, I["carga_maxima"])


## Lo que lleva el cuerpo de una sala a otra (#226): cada sala crea su
## Cirujano, y sin esto cruzar un paso curaba del todo.
func estado_cuerpo() -> Dictionary:
	return {
		"vitalidad": vitalidad,
		"pociones": combate.cargas_pocion,
		"fervor": combate.fervor,
		"injertos": injertadora.cargas,
	}


func restaurar_cuerpo(cuerpo: Dictionary) -> void:
	if cuerpo.is_empty():
		return
	vitalidad = maxi(1, cuerpo["vitalidad"])
	combate.cargas_pocion = cuerpo["pociones"]
	combate.fervor = mini(cuerpo["fervor"], combate.fervor_tope)
	injertadora.cargas = cuerpo.get("injertos", 0)
	if tiene_injertadora:
		injertos_cambio.emit(injertadora.cargas, Sacramento.INJERTADORA["carga_maxima"])
	vitalidad_cambio.emit(vitalidad, Sacramento.VITALIDAD["maxima"])
	pociones_cambio.emit(combate.cargas_pocion, Sacramento.POCION["cargas_maximas"])
	fervor_cambio.emit(combate.fervor, Sacramento.FERVOR["maximo"])


## Hacia donde mira al aparecer: 1 derecha, -1 izquierda.
func mirar(lado: int) -> void:
	movimiento.mirando = lado


func _volver() -> void:
	suelo_seguro = Vector2.ZERO
	position = punto_reaparicion
	velocity = Vector2.ZERO
	movimiento.reaparecer(position.y)
	combate.cancelar()


## La figura: el fotograma de lo que esta haciendo, mirando hacia donde va.
func _pintar(delta: float) -> void:
	if muerto:
		_brasas.emitting = false
		return
	var cuadro := _cuadro(delta)
	var lista: Array = _cuadros[cuadro[0]]
	_sprite.texture = lista[clampi(cuadro[1], 0, lista.size() - 1)]
	_figura.scale = Vector2(movimiento.mirando, 1.0)
	# La ejecucion blinda, pero no es un golpe recibido: no parpadea.
	var ejecutando := combate.accion == Combate.Accion.EJECUCION
	var alfa := 0.5 if movimiento.invulnerable and not ejecutando else 1.0
	_figura.modulate = Color(1, 1, 1, alfa)
	_pintar_carga()


## La carga con Fervor (feedback de Jean): mientras se mantiene J y hay Fervor
## para el cargado, el cuerpo se calienta y suben brasas; completa, destella y
## late. Sin Fervor no se enciende nada: asi se sabe que no saldra.
func _pintar_carga() -> void:
	var carga := combate.progreso_carga() if combate.carga_posible() else 0.0
	_brasas.emitting = carga > 0.0
	if carga <= 0.0:
		_cargado_avisado = false
		return
	var calor := carga * 0.8
	if carga >= 1.0:
		if not _cargado_avisado:
			_cargado_avisado = true
			_rafaga(position + Vector2(0, -26), 18, COLOR_BRASA, Vector2.UP, 180.0, 40.0, 110.0, Vector2.ZERO, 0.35)
		calor = 0.75 + 0.25 * sin(Time.get_ticks_msec() / 60.0)
	_figura.modulate = Color(1, 1, 1, _figura.modulate.a).lerp(Color(AMBAR, _figura.modulate.a), calor)


## Que animacion y que fotograma: [nombre, indice]. Primero lo que hace con el
## bisturi, luego lo que hace el cuerpo.
func _cuadro(delta: float) -> Array:
	var en_suelo := is_on_floor()
	if en_suelo and not _en_suelo_antes:
		_fin_aterrizaje = combate.ahora + ATERRIZAJE_MS
	_en_suelo_antes = en_suelo
	var ms := combate.ms_de_accion()

	match combate.accion:
		Combate.Accion.EJECUCION:
			if not combate.ejecucion_golpea():
				return ["alza", 0 if ms < ALZA_MS else 1]
			return ["tajo", int((ms - Sacramento.EJECUCION["alza_ms"]) / TAJO_MS)]
		Combate.Accion.PARRY:
			return ["guardia", 0 if ms < 70.0 else 1]
		Combate.Accion.POCION:
			return ["bebe", 0 if ms < 150.0 else (1 if ms < 450.0 else 2)]
		Combate.Accion.GOLPE:
			return _cuadro_de_golpe(ms)

	var recuperando := _cuadro_de_recuperacion(en_suelo)
	if not recuperando.is_empty():
		return recuperando

	match movimiento.estado:
		Movimiento.Estado.REZANDO:
			return ["rezar", 0]
		Movimiento.Estado.ATURDIDO:
			return ["herido", 0]
		Movimiento.Estado.DASH:
			return ["dash", 0]
		Movimiento.Estado.AGARRE:
			return ["agarre-girado" if movimiento.agarre_girado else "agarre", 0]
	if not en_suelo:
		if velocity.y < -40.0:
			return ["salto", 0]
		return ["caida", int(Time.get_ticks_msec() / 120.0) % 2]
	if combate.ahora < _fin_aterrizaje:
		return ["aterrizaje", 0]
	if absf(velocity.x) > 20.0:
		_recorrido += absf(velocity.x) * delta
		var paso: int = int(_recorrido / PX_POR_CUADRO) % _cuadros["correr"].size()
		# Un paso cada vez que apoya un pie: el primer cuadro de cada zancada.
		if paso != _paso_antes and paso % (_cuadros["correr"].size() / 2) == 0:
			_sonar("paso")
		_paso_antes = paso
		return ["correr", paso]
	return ["reposo", int(Time.get_ticks_msec() / REPOSO_MS) % _cuadros["reposo"].size()]


func _cuadro_de_golpe(ms: float) -> Array:
	var nombre := "golpe"
	match combate.tipo:
		Combate.Tipo.CARGADO:
			nombre = "cargado"
		Combate.Tipo.CONTRAGOLPE:
			nombre = "contragolpe"
	if combate.direccion == Combate.Direccion.ARRIBA:
		nombre = "arriba"
	elif combate.direccion == Combate.Direccion.ABAJO:
		nombre = "abajo"
	var fases: Dictionary = FASES[nombre]
	_recuperacion = nombre
	_fin_recuperacion = -INF
	var aviso := combate.anticipacion_ms()
	if ms < aviso:
		var avisos: Array = fases["aviso"]
		return [nombre, avisos[mini(avisos.size() - 1, int(ms / aviso * avisos.size()))]]
	if ms < aviso + SMEAR_MS:
		return [nombre, fases["smear"]]
	return [nombre, fases["impacto"]]


## La recuperacion del golpe que acaba de terminar, si el cuerpo sigue quieto
## en el suelo; si se mueve o salta, se corta: el control manda.
func _cuadro_de_recuperacion(en_suelo: bool) -> Array:
	if _recuperacion == "":
		return []
	var cuadros: Array = FASES[_recuperacion]["recuperacion"]
	if _fin_recuperacion == -INF:
		_fin_recuperacion = combate.ahora + RECUPERACION_MS * cuadros.size()
	if cuadros.is_empty() or combate.ahora >= _fin_recuperacion or not en_suelo or absf(velocity.x) > 20.0:
		_recuperacion = ""
		return []
	var hecho := cuadros.size() - 1 - int((_fin_recuperacion - combate.ahora) / RECUPERACION_MS)
	return [_recuperacion, cuadros[clampi(hecho, 0, cuadros.size() - 1)]]
