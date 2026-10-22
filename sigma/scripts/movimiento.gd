## El movimiento del Cirujano (#182): correr, saltar, doble salto, dash,
## agarre y dano por caida, con los numeros del original. Tambien lo que lo
## para: un golpe, una mala caida, rezar en un Altar (#185) o sus propias
## acciones de combate, y el rebote de un golpe hacia abajo (#183).
##
## Va aparte del nodo para poder probarlo sin escena ni fisica: recibe lo que
## se pulsa y lo que se toca, y deja la velocidad en `velocidad`. cirujano.gd
## hace el resto con move_and_slide.
##
## Integra como Arcade en Phaser, a pasos fijos de 60 Hz: primero la logica
## pone los impulsos, luego se suman gravedad, aceleracion y friccion, y por
## ultimo se recorta a la velocidad maxima.
##
## Una diferencia a proposito: en Phaser la gravedad del Cirujano se sumaba dos
## veces (la del mundo y la de su cuerpo) y el salto real subia unos 43 px.
## Aqui cae con la de diseno, 1000, y sube los 92 px con los que se trazaron
## los niveles.
extends RefCounted

## Una caida larga: cuantos puntos de vitalidad cuesta y desde que altura.
signal caida(dano: int, altura: float)

const Sacramento := preload("res://scripts/sacramento.gd")
const M := Sacramento.MOVIMIENTO
const D := Sacramento.DASH
const A := Sacramento.AGARRE
const DC := Sacramento.DANO_POR_CAIDA

## Trepar y saltar desde la pared no son saltos: durante este rato no se
## cortan al soltar el boton.
const SIN_CORTE_MS := 350.0
## Al trepar, cuanto de la velocidad de caminar empuja hacia el borde.
const EMPUJE_TREPAR := 0.6
## Por debajo de esta velocidad de caida, tocar suelo no es aterrizar.
const CAIDA_QUE_CUENTA := 120.0
## Lo que dura sin control tras un golpe o un roce.
const HERIDO_MS := 220.0

## ATURDIDO, REZANDO y ACCION son "quieto": sin control hasta que pasa el rato.
## ACCION es golpear, parar o beber: lo decide el combate.
enum Estado { SUELO, AIRE, DASH, AGARRE, ATURDIDO, REZANDO, ACCION }


## Lo que el jugador pulsa en este fotograma.
class Entrada:
	var eje_x := 0
	var saltar_pulsado := false
	var saltar_mantenido := false
	var dash_pulsado := false
	var arriba := false
	var abajo := false
	## Clavar el bisturi en la pared: K en el aire, pegado a una pared.
	var clavar := false


var velocidad := Vector2.ZERO
var estado := Estado.AIRE
## 1 mira a la derecha, -1 a la izquierda.
var mirando := 1
## Milisegundos desde que empezo, contados con los pasos.
var ahora := 0.0

var invulnerable: bool:
	get:
		return ahora < _fin_invulnerable

var _salto_encolado := -INF
var _ultimo_en_suelo := -INF
var _saltos_restantes := 1
var _dashes_en_aire: int = D["usos_en_aire"]
var _fin_dash := -INF
var _fin_enfriamiento_dash := -INF
var _fin_invulnerable := -INF
var _fin_bloqueo_agarre := -INF
## Un agarre por salto: se gasta al engancharse y vuelve al tocar suelo.
var _agarre_gastado := false
var _direccion_agarre := 1
## Lo que da cada reliquia (sigma/scripts/reliquia.gd). De serie, si: los tests
## del movimiento prueban el cuerpo entero; el Cirujano los apaga hasta que
## encuentra la reliquia.
var puede_doble_salto := true
var puede_dash := true
## Colgado de espaldas a la pared, listo para saltar hacia fuera.
var agarre_girado := false
var _sin_corte_hasta := -INF
var _fin_quieto := -INF
var _en_suelo_antes := false
var _caida_previa := 0.0
var _inicio_caida_y := 0.0

var _gravedad := true
var _velocidad_max_x: float = M["velocidad_caminar"]
var _aceleracion_x := 0.0
var _friccion_x := 0.0


## `y` es donde aparece: la caida se mide desde ahi y no desde lo alto del mundo.
func _init(y := 0.0) -> void:
	_inicio_caida_y = y


## Avanza un paso. `pared` es -1 o 1 si empuja contra una pared por ese lado,
## y 0 si no; `y` es la altura de los pies.
func paso(delta: float, entrada: Entrada, en_suelo: bool, pared: int, y: float) -> void:
	ahora += delta * 1000.0

	if en_suelo:
		_ultimo_en_suelo = ahora
		_agarre_gastado = false
		_dashes_en_aire = D["usos_en_aire"]
		if not _quieto():
			_saltos_restantes = 1
		if not _en_suelo_antes and _caida_previa > CAIDA_QUE_CUENTA:
			_resolver_caida(y)
		_inicio_caida_y = y
	elif velocidad.y <= 0.0 or estado == Estado.AGARRE or estado == Estado.DASH:
		# Mientras sube, cuelga o hace dash, la caida aun no ha empezado: el
		# dash y el agarre "perdonan" lo caido.
		_inicio_caida_y = y
	_en_suelo_antes = en_suelo
	_caida_previa = velocidad.y

	if entrada.saltar_pulsado:
		_salto_encolado = ahora
	if entrada.dash_pulsado:
		_intentar_dash(entrada, en_suelo)

	match estado:
		Estado.DASH:
			_actualizar_dash()
		Estado.AGARRE:
			_actualizar_agarre(entrada)
		Estado.ATURDIDO, Estado.REZANDO, Estado.ACCION:
			_actualizar_quieto(en_suelo)
		_:
			_actualizar_locomocion(entrada, en_suelo, pared)

	_integrar(delta)


# -- Locomocion ----------------------------------------------------------------

func _actualizar_locomocion(entrada: Entrada, en_suelo: bool, pared: int) -> void:
	estado = Estado.SUELO if en_suelo else Estado.AIRE

	if entrada.eje_x != 0:
		var aceleracion: float = M["aceleracion_suelo"] if en_suelo else M["aceleracion_aire"]
		_aceleracion_x = entrada.eje_x * aceleracion
		_friccion_x = 0.0
		mirando = entrada.eje_x
	else:
		_aceleracion_x = 0.0
		_friccion_x = M["friccion_suelo"] if en_suelo else M["friccion_aire"]

	_resolver_salto(en_suelo)
	_recortar_salto(entrada)

	if not en_suelo:
		_intentar_agarre(entrada, pared)


func _resolver_salto(en_suelo: bool) -> void:
	if ahora - _salto_encolado > M["buffer_salto_ms"]:
		return

	if en_suelo or ahora - _ultimo_en_suelo <= M["coyote_ms"]:
		_saltar(M["impulso_salto"])
		_saltos_restantes = 1
	elif _saltos_restantes > 0 and puede_doble_salto:
		_saltar(M["impulso_doble_salto"])
		_saltos_restantes -= 1


func _saltar(impulso: float) -> void:
	velocidad.y = -impulso
	_salto_encolado = -INF
	_ultimo_en_suelo = -INF
	estado = Estado.AIRE


## Salto variable: soltar el boton mientras sube recorta la altura.
func _recortar_salto(entrada: Entrada) -> void:
	if ahora < _sin_corte_hasta:
		return
	if velocidad.y < 0.0 and not entrada.saltar_mantenido:
		velocidad.y *= M["factor_corte_salto"]


# -- Dash ----------------------------------------------------------------------

func _intentar_dash(entrada: Entrada, en_suelo: bool) -> void:
	if not puede_dash:
		return
	if ahora < _fin_enfriamiento_dash:
		return
	if estado == Estado.DASH or estado == Estado.AGARRE or _quieto():
		return
	if not en_suelo:
		if _dashes_en_aire <= 0:
			return
		_dashes_en_aire -= 1

	var direccion := entrada.eje_x if entrada.eje_x != 0 else mirando
	mirando = direccion
	estado = Estado.DASH
	_fin_dash = ahora + D["duracion_ms"]
	_fin_invulnerable = ahora + D["invulnerabilidad_ms"]
	_fin_enfriamiento_dash = ahora + D["duracion_ms"] + D["enfriamiento_ms"]

	# Dash plano: sin gravedad mientras dura.
	_velocidad_max_x = D["velocidad"]
	_aceleracion_x = 0.0
	_friccion_x = 0.0
	_gravedad = false
	velocidad = Vector2(direccion * D["velocidad"], 0.0)


func _actualizar_dash() -> void:
	if ahora < _fin_dash:
		return
	_gravedad = true
	_velocidad_max_x = M["velocidad_caminar"]
	estado = Estado.AIRE


# -- Agarre --------------------------------------------------------------------

func _intentar_agarre(entrada: Entrada, pared: int) -> void:
	if ahora < _fin_bloqueo_agarre:
		return
	# No es automatico: hay que estar pegado a la pared y clavar el bisturi
	# (K). Subiendo tambien: el gesto ya es una decision.
	if pared == 0 or not entrada.clavar:
		return
	if _agarre_gastado:
		return

	_agarre_gastado = true
	_direccion_agarre = pared
	estado = Estado.AGARRE
	_gravedad = false
	_aceleracion_x = 0.0
	_friccion_x = 0.0
	velocidad = Vector2(0.0, A["deslizamiento"])
	_saltos_restantes = 1
	_dashes_en_aire = D["usos_en_aire"]
	mirando = pared
	agarre_girado = false


## Colgado del bisturi clavado en la pared. Empujar hacia fuera no suelta: el
## cuerpo se gira de espaldas a la pared, y saltar asi lo despega hacia fuera
## (como en el original, #161). De cara a la pared, saltar o arriba trepan al
## borde. Abajo suelta.
func _actualizar_agarre(entrada: Entrada) -> void:
	if entrada.eje_x == -_direccion_agarre:
		agarre_girado = true
	elif entrada.eje_x == _direccion_agarre:
		agarre_girado = false
	mirando = -_direccion_agarre if agarre_girado else _direccion_agarre

	var salto := ahora - _salto_encolado <= M["buffer_salto_ms"]
	if salto and agarre_girado:
		_soltar_agarre()
		# Hacia fuera a la velocidad de andar: mas, y el tope de velocidad lo
		# recortaria igual en el paso siguiente.
		velocidad = Vector2(-_direccion_agarre * M["velocidad_caminar"], -Sacramento.CLAVADO["salto_pared_y"])
		_sin_corte_hasta = ahora + SIN_CORTE_MS
		_salto_encolado = -INF
		return

	# Trepar: arriba o saltar impulsa hacia el borde.
	if entrada.arriba or salto:
		_soltar_agarre()
		velocidad = Vector2(
			_direccion_agarre * M["velocidad_caminar"] * EMPUJE_TREPAR,
			-A["impulso_trepar"]
		)
		_sin_corte_hasta = ahora + SIN_CORTE_MS
		_salto_encolado = -INF
		return

	if entrada.abajo:
		_soltar_agarre()
		return

	velocidad = Vector2(0.0, A["deslizamiento"])


func _soltar_agarre() -> void:
	agarre_girado = false
	_gravedad = true
	_fin_bloqueo_agarre = ahora + A["bloqueo_tras_soltar_ms"]
	estado = Estado.AIRE


# -- Caida ---------------------------------------------------------------------

## Golpe contra el suelo tras una caida larga: cuesta vitalidad segun la altura
## y deja al Cirujano clavado un instante, sin invulnerabilidad.
func _resolver_caida(y: float) -> void:
	var altura := y - _inicio_caida_y
	if altura <= DC["sin_dano_hasta"]:
		return

	var dano := mini(DC["dano_maximo"], ceili((altura - DC["sin_dano_hasta"]) / DC["px_por_punto"]))
	estado = Estado.ATURDIDO
	_fin_quieto = ahora + DC["aturdimiento_ms"]
	velocidad.x = 0.0
	caida.emit(dano, altura)


# -- Golpes, rezo y vuelta -----------------------------------------------------

## Un golpe o un roce desde `origen_x`: empujon hacia el otro lado, un instante
## sin control e invulnerable un rato. Devuelve false si no entra: el dash y
## los i-frames lo evitan.
func herir(x: float, origen_x: float, retroceso: Vector2) -> bool:
	if estado == Estado.DASH or invulnerable:
		return false

	var direccion := -1.0 if x < origen_x else 1.0
	estado = Estado.ATURDIDO
	_fin_quieto = ahora + HERIDO_MS
	_fin_invulnerable = ahora + Sacramento.VITALIDAD["invulnerabilidad_ms"]
	_gravedad = true
	_velocidad_max_x = M["velocidad_caminar"]
	velocidad = Vector2(direccion * retroceso.x, -retroceso.y)
	return true


## Arrodillarse ante un Altar. Solo de pie en el suelo: es un acto, no un boton.
func rezar() -> bool:
	if estado != Estado.SUELO:
		return false
	estado = Estado.REZANDO
	_fin_quieto = ahora + Sacramento.REZO_MS
	velocidad.x = 0.0
	return true


## Vuelve a aparecer en otro sitio (un Altar, tras caer al vacio o morir): la
## caida se mide desde ahi y la llegada no cuenta como aterrizaje.
func reaparecer(y: float) -> void:
	estado = Estado.AIRE
	velocidad = Vector2.ZERO
	_gravedad = true
	_velocidad_max_x = M["velocidad_caminar"]
	_inicio_caida_y = y
	_en_suelo_antes = true
	_caida_previa = 0.0
	_fin_invulnerable = ahora + Sacramento.VITALIDAD["invulnerabilidad_ms"]


## Invulnerable durante `ms` sin haber sido herido: la ejecucion (Blasphemous)
## no se interrumpe. No acorta unos i-frames que ya estuvieran corriendo.
func blindar(ms: float) -> void:
	_fin_invulnerable = maxf(_fin_invulnerable, ahora + ms)


## Si el cuerpo puede empezar una accion de combate.
func libre() -> bool:
	return estado == Estado.SUELO or estado == Estado.AIRE


## Una accion de combate: sin control durante `ms`. En el suelo se queda
## clavado; en el aire conserva la inercia y cae. Si llegara en mitad de un
## dash o de un agarre, que le quitan la gravedad, se la devuelve: si no,
## quedaria flotando para siempre.
func bloquear(ms: float) -> void:
	estado = Estado.ACCION
	_fin_quieto = ahora + ms
	_gravedad = true
	_velocidad_max_x = M["velocidad_caminar"]


## Un golpe hacia abajo ha conectado: sale despedido hacia arriba y recupera el
## doble salto y el dash, para seguir peleando desde el aire. No es un salto:
## no se corta al soltar (en Phaser si, y el rebote se quedaba en nada si no se
## mantenia saltar).
func rebotar() -> void:
	estado = Estado.AIRE
	velocidad.y = -Sacramento.COMBATE["rebote"]["impulso"]
	_saltos_restantes = 1
	_dashes_en_aire = D["usos_en_aire"]
	_sin_corte_hasta = ahora + SIN_CORTE_MS


func _quieto() -> bool:
	return estado == Estado.ATURDIDO or estado == Estado.REZANDO or estado == Estado.ACCION


func _actualizar_quieto(en_suelo: bool) -> void:
	# En suelo se queda clavado; en el aire conserva la inercia.
	if en_suelo:
		_aceleracion_x = 0.0
		_friccion_x = M["friccion_suelo"] * 2.0
	if ahora >= _fin_quieto:
		estado = Estado.SUELO if en_suelo else Estado.AIRE


# -- Integracion ---------------------------------------------------------------

func _integrar(delta: float) -> void:
	if _gravedad:
		velocidad.y += M["gravedad"] * delta

	if _aceleracion_x != 0.0:
		velocidad.x += _aceleracion_x * delta
	elif _friccion_x > 0.0:
		var friccion := _friccion_x * delta
		if velocidad.x > friccion:
			velocidad.x -= friccion
		elif velocidad.x < -friccion:
			velocidad.x += friccion
		else:
			velocidad.x = 0.0

	velocidad.x = clampf(velocidad.x, -_velocidad_max_x, _velocidad_max_x)
	velocidad.y = clampf(velocidad.y, -M["velocidad_caida_max"], M["velocidad_caida_max"])
