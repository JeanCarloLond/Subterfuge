## El Devoto (#185): ronda, persecucion y un golpe que se avisa con tiempo.
## Se prueba su cabeza (pensar) sin fisica ni escena en marcha.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/devoto.tscn")
const Devoto := preload("res://scripts/devoto.gd")
const DT := 1.0 / 60.0
const LEJOS := Vector2(2000, 0)


func _devoto() -> Devoto:
	var devoto: Devoto = ESCENA.instantiate()
	devoto.ronda_izquierda = -50.0
	devoto.ronda_derecha = 50.0
	return devoto


func _pensar(devoto: Devoto, pasos: int, hacia: Vector2) -> void:
	for i in pasos:
		devoto.pensar(DT, hacia)
		devoto.position.x += devoto.velocity.x * DT


func test_patrulla_a_40_y_da_la_vuelta_en_el_extremo() -> void:
	var devoto := _devoto()
	_pensar(devoto, 1, LEJOS)
	afirmar_igual(devoto.velocity.x, 40.0, "patrulla hacia la derecha")
	_pensar(devoto, 120, LEJOS)
	afirmar(devoto.position.x <= 51.0, "no se pasa de su ronda")
	afirmar_igual(devoto.mirando, -1, "ha dado la vuelta")
	devoto.free()


func test_te_ve_a_130_px_y_te_persigue_a_80() -> void:
	var devoto := _devoto()
	_pensar(devoto, 1, Vector2(140, 0))
	afirmar_igual(devoto.estado, Devoto.Estado.PATRULLA, "a 140 no te ve")
	_pensar(devoto, 1, Vector2(120, 0))
	_pensar(devoto, 1, Vector2(120, 0))
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "a 120 si")
	afirmar_igual(devoto.velocity.x, 80.0, "va a por ti")
	devoto.free()


func test_avisa_420_ms_y_golpea_120() -> void:
	var devoto := _devoto()
	var cerca := Vector2(20, 0)
	_pensar(devoto, 2, cerca)
	afirmar_igual(devoto.estado, Devoto.Estado.ANTICIPANDO, "a 20 px se prepara")
	_pensar(devoto, 24, cerca) # 400 ms de aviso
	afirmar_igual(devoto.estado, Devoto.Estado.ANTICIPANDO, "aun avisando a los 400 ms")
	_pensar(devoto, 2, cerca)
	afirmar_igual(devoto.estado, Devoto.Estado.ATACANDO, "golpea pasados los 420")
	afirmar(devoto.zona_golpe().intersects(Rect2(15, -22, 10, 22)), "el golpe llega a quien tiene delante")
	_pensar(devoto, 8, cerca)
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "a los 120 ms ha acabado")
	devoto.free()


func test_entre_golpe_y_golpe_descansa() -> void:
	var devoto := _devoto()
	var cerca := Vector2(20, 0)
	_pensar(devoto, 40, cerca) # aviso y golpe
	_pensar(devoto, 60, cerca) # 1 s despues
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "no vuelve a golpear antes de 1,1 s")
	_pensar(devoto, 10, cerca)
	afirmar_igual(devoto.estado, Devoto.Estado.ANTICIPANDO, "pasado el descanso, otro aviso")
	devoto.free()


func test_si_te_pierde_vuelve_a_su_ronda_a_los_2_s() -> void:
	var devoto := _devoto()
	_pensar(devoto, 2, Vector2(100, 0))
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "te ha visto")
	_pensar(devoto, 115, LEJOS) # 1,9 s
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "aun te busca")
	_pensar(devoto, 10, LEJOS)
	afirmar_igual(devoto.estado, Devoto.Estado.PATRULLA, "se olvida")
	devoto.free()


func test_cuatro_golpes_lo_tumban() -> void:
	var devoto := _devoto()
	for i in 3:
		devoto.recibir_dano(2, -20.0)
	afirmar(devoto.vivo(), "con 6 de dano sigue en pie")
	afirmar_igual(devoto.estado, Devoto.Estado.PERSECUCION, "y un golpe lo pone en alerta")
	afirmar_igual(devoto.mirando, -1, "mirando a quien le pega")
	devoto.recibir_dano(2, -20.0)
	afirmar(not devoto.vivo(), "el cuarto lo tumba")
	devoto.free()


func test_parado_se_queda_aturdido_900_ms_sin_golpear() -> void:
	var devoto := _devoto()
	var cerca := Vector2(20, 0)
	_pensar(devoto, 2, cerca)
	devoto.aturdir()
	_pensar(devoto, 50, cerca) # 833 ms
	afirmar_igual(devoto.estado, Devoto.Estado.ATURDIDO, "aun aturdido a los 833 ms")
	afirmar_igual(devoto.velocity.x, 0.0, "quieto")
	_pensar(devoto, 6, cerca)
	afirmar(devoto.estado != Devoto.Estado.ATURDIDO, "a los 933 ms ya no")
	devoto.free()


func test_aturdido_se_ejecuta_y_cae_al_rematar() -> void:
	var devoto := _devoto()
	var cerca := Vector2(20, 0)
	_pensar(devoto, 2, cerca)
	afirmar(not devoto.ejecutable(), "en pie no se le ejecuta")
	devoto.aturdir()
	afirmar(devoto.ejecutable(), "aturdido si")
	devoto.ejecutar(30.0)
	afirmar_igual(devoto.estado, Devoto.Estado.EJECUTADO, "de rodillas")
	afirmar_igual(devoto.mirando, 1, "mirando al Cirujano")
	afirmar(not devoto.ejecutable(), "no se le ejecuta dos veces")
	_pensar(devoto, 60, cerca) # 1 s: el aturdimiento ya habria acabado
	afirmar_igual(devoto.estado, Devoto.Estado.EJECUTADO, "espera el tajo, no se levanta")
	afirmar_igual(devoto.velocity.x, 0.0, "quieto")
	devoto.rematar()
	afirmar(not devoto.vivo(), "el tajo lo mata con la vida que tenga")
	devoto.free()
