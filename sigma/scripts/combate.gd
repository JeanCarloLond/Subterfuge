## El combate del Cirujano (#183): golpe, golpe cargado, arriba y abajo con
## rebote, parry, Fervor y la Pocion de Carne, con los numeros del original.
## Y lo de Blasphemous: el contragolpe tras un parry y la ejecucion de un
## aturdido.
##
## Como el movimiento, va aparte del nodo para probarlo sin fisica: recibe lo
## que se pulsa y deja dicho que ha empezado (`bloqueo_ms`, `curar`). El
## Cirujano se lo pasa al movimiento y a la vitalidad.
extends RefCounted

const Sacramento := preload("res://scripts/sacramento.gd")
const C := Sacramento.COMBATE
const F := Sacramento.FERVOR
const P := Sacramento.POCION
const E := Sacramento.EJECUCION

enum Accion { NINGUNA, GOLPE, PARRY, POCION, EJECUCION }
enum Tipo { BASICO, CARGADO, CONTRAGOLPE }
enum Direccion { LATERAL, ARRIBA, ABAJO }


## Lo que el jugador pulsa en este fotograma.
class Entrada:
	var golpe_pulsado := false
	var golpe_soltado := false
	var parry_pulsado := false
	var pocion_pulsada := false
	var arriba := false
	var abajo := false


var accion := Accion.NINGUNA
var tipo := Tipo.BASICO
var direccion := Direccion.LATERAL
var fervor: int = F["inicial"]
var cargas_pocion: int = P["cargas_maximas"]
var ahora := 0.0

## Lo que ha empezado en este paso, para el Cirujano: cuanto se queda quieto
## el movimiento y cuanto hay que curar. Se vacia en cada paso.
var bloqueo_ms := 0.0
var curar := 0

var _inicio_zona := INF
var _inicio_accion := -INF
var _fin_accion := -INF
var _fin_enfriamiento_golpe := -INF
var _fin_ventana_parry := -INF
var _fin_enfriamiento_parry := -INF
## Tras un parry logrado: golpear antes de esto saca el contragolpe.
var _fin_ventana_contragolpe := -INF
var _inicio_carga := -INF
## A quien ha dado ya este golpe: uno por enemigo y golpe.
var _golpeados := {}


## `libre` es si el cuerpo puede actuar (no esta en un dash, colgado ni
## aturdido). `en_suelo` decide si el golpe hacia abajo tiene sentido.
func paso(delta: float, entrada: Entrada, libre: bool, en_suelo: bool) -> void:
	ahora += delta * 1000.0
	bloqueo_ms = 0.0
	curar = 0
	if accion != Accion.NINGUNA and ahora >= _fin_accion:
		accion = Accion.NINGUNA

	# La suelta se mira ANTES que el bloqueo: el cargado se decide al soltar, y
	# eso suele pasar durante el enfriamiento del basico. Si se perdiera ahi,
	# el cargado no saldria nunca.
	if entrada.golpe_soltado:
		var listo := carga_completa() and fervor >= C["cargado"]["coste_fervor"]
		_inicio_carga = -INF
		if listo and libre and accion == Accion.NINGUNA:
			_golpear(Tipo.CARGADO, entrada, en_suelo)
			return

	# El contragolpe va antes del bloqueo: el parry deja al cuerpo quieto lo
	# que dura su ventana, y el contragolpe tiene que poder cortarla. Fuera del
	# parry, solo con el cuerpo libre: en un dash o colgado no sale.
	if entrada.golpe_pulsado and ahora < _fin_ventana_contragolpe:
		if accion == Accion.PARRY or (libre and accion == Accion.NINGUNA):
			_fin_ventana_contragolpe = -INF
			_golpear(Tipo.CONTRAGOLPE, entrada, en_suelo)
			return

	if not libre or accion != Accion.NINGUNA:
		return

	if entrada.parry_pulsado and ahora >= _fin_enfriamiento_parry:
		accion = Accion.PARRY
		_inicio_accion = ahora
		_fin_ventana_parry = ahora + C["parry"]["ventana_ms"]
		_fin_accion = _fin_ventana_parry
		_fin_enfriamiento_parry = _fin_ventana_parry + C["parry"]["enfriamiento_ms"]
		bloqueo_ms = C["parry"]["ventana_ms"]
		return

	if entrada.pocion_pulsada:
		if cargas_pocion > 0:
			cargas_pocion -= 1
			accion = Accion.POCION
			_inicio_accion = ahora
			_fin_accion = ahora + P["duracion_ms"]
			bloqueo_ms = P["duracion_ms"]
			curar = P["curacion"]
		return

	# El golpe sale AL PULSAR: la respuesta tiene que ser inmediata. Seguir
	# manteniendo acumula carga para un segundo golpe, el cargado.
	if entrada.golpe_pulsado and ahora >= _fin_enfriamiento_golpe:
		_golpear(Tipo.BASICO, entrada, en_suelo)
		_inicio_carga = ahora


## Mantenido el boton lo bastante, el cargado esta listo para soltarse. Sin
## carga empezada no: soltar tras un golpe recibido no saca un cargado.
func carga_completa() -> bool:
	return _inicio_carga > -INF and ahora - _inicio_carga >= C["cargado"]["tiempo_carga_ms"]


## Lo que lleva la accion en curso, en ms: para elegir el fotograma.
func ms_de_accion() -> float:
	return ahora - _inicio_accion


## Lo que dura el aviso del golpe en curso, en ms.
func anticipacion_ms() -> float:
	return _perfil()["anticipacion_ms"]


## Si el golpe se esta preparando: aun no corta.
func anticipando() -> bool:
	return accion == Accion.GOLPE and ahora < _inicio_zona


## Si el golpe en curso hace dano ahora mismo.
func zona_activa() -> bool:
	return accion == Accion.GOLPE and ahora >= _inicio_zona and ahora < _fin_accion


## Donde hace dano el golpe, para un Cirujano con los pies en `pies` que mira
## hacia `mirando`. Lateral: delante, a la altura del torso. Arriba: sobre la
## mitra. Abajo: bajo los pies. En vertical la caja se gira.
func zona(pies: Vector2, mirando: int) -> Rect2:
	var perfil := _perfil()
	var alcance: float = perfil["alcance"]
	var alto: float = perfil["alto"]
	match direccion:
		Direccion.ARRIBA:
			return _centrada(Vector2(pies.x, pies.y - 40.0 - alcance / 2.0 + 4.0), Vector2(alto, alcance))
		Direccion.ABAJO:
			return _centrada(Vector2(pies.x, pies.y + alcance / 2.0 - 2.0), Vector2(alto, alcance))
	return _centrada(Vector2(pies.x + mirando * (alcance / 2.0 + 4.0), pies.y - 14.0), Vector2(alcance, alto))


## El golpe ha tocado a `enemigo` (cualquier cosa que lo identifique). Devuelve
## el dano que le toca, o 0 si este golpe ya le habia dado.
func registrar_golpe(enemigo: Variant) -> int:
	if _golpeados.has(enemigo):
		return 0
	_golpeados[enemigo] = true
	_ganar_fervor(F["por_golpe_asestado"])
	return _perfil()["dano"]


## Tras un golpe hacia abajo que conecta: cierra el golpe y deja un
## enfriamiento minimo, para encadenar rebotes. El impulso lo pone el movimiento.
func rebotar() -> void:
	accion = Accion.NINGUNA
	_fin_accion = ahora
	_fin_enfriamiento_golpe = ahora + C["rebote"]["enfriamiento_ms"]


## Un golpe enemigo llega. Si la ventana del parry esta abierta, lo para,
## gana Fervor y la cierra: devuelve true.
func parar() -> bool:
	if ahora >= _fin_ventana_parry:
		return false
	_fin_ventana_parry = -INF
	_fin_ventana_contragolpe = ahora + C["contragolpe"]["ventana_ms"]
	_ganar_fervor(F["por_parry"])
	return true


## Si golpear ahora sacaria el contragolpe.
func contragolpe_listo() -> bool:
	return ahora < _fin_ventana_contragolpe


## Rematar a un aturdido. El Cirujano decide si hay a quien: aqui solo se
## mira que el cuerpo este libre. Devuelve true si empieza.
func ejecutar(libre: bool) -> bool:
	if not libre or accion != Accion.NINGUNA:
		return false
	accion = Accion.EJECUCION
	_inicio_accion = ahora
	_fin_ventana_contragolpe = -INF
	_inicio_carga = -INF
	_fin_accion = ahora + E["duracion_ms"]
	bloqueo_ms = E["duracion_ms"]
	_ganar_fervor(E["fervor"])
	return true


## Si la ejecucion en curso ya ha bajado el bisturi: el cuerpo cae entonces.
func ejecucion_golpea() -> bool:
	return accion == Accion.EJECUCION and ahora >= _fin_accion - E["duracion_ms"] + E["alza_ms"]


## Herido: se corta lo que estuviera haciendo, y la carga.
func cancelar() -> void:
	accion = Accion.NINGUNA
	_fin_ventana_parry = -INF
	_fin_ventana_contragolpe = -INF
	_inicio_carga = -INF


## Rezar en un Altar llena el frasco (el Fervor no vuelve).
func reponer_pociones() -> void:
	cargas_pocion = P["cargas_maximas"]


func _golpear(nuevo: Tipo, entrada: Entrada, en_suelo: bool) -> void:
	if nuevo == Tipo.CARGADO:
		fervor -= C["cargado"]["coste_fervor"]
	tipo = nuevo
	# El contragolpe va siempre de frente: es contra quien acaba de golpear.
	# Abajo solo tiene sentido en el aire: en el suelo golpearia la piedra.
	if nuevo == Tipo.CONTRAGOLPE:
		direccion = Direccion.LATERAL
	elif entrada.abajo and not en_suelo:
		direccion = Direccion.ABAJO
	elif entrada.arriba:
		direccion = Direccion.ARRIBA
	else:
		direccion = Direccion.LATERAL

	var perfil := _perfil()
	accion = Accion.GOLPE
	_inicio_accion = ahora
	_golpeados.clear()
	_inicio_zona = ahora + perfil["anticipacion_ms"]
	_fin_accion = _inicio_zona + perfil["duracion_ms"]
	_fin_enfriamiento_golpe = _fin_accion + perfil["enfriamiento_ms"]
	bloqueo_ms = _fin_accion - ahora


func _perfil() -> Dictionary:
	match tipo:
		Tipo.CARGADO:
			return C["cargado"]
		Tipo.CONTRAGOLPE:
			return C["contragolpe"]
	return C["ataque"]


func _ganar_fervor(cantidad: int) -> void:
	fervor = mini(F["maximo"], fervor + cantidad)


static func _centrada(centro: Vector2, tamano: Vector2) -> Rect2:
	return Rect2(centro - tamano / 2.0, tamano)
