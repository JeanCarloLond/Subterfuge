## La Vestal: guarda la distancia, avisa largo, lanza y solo su propio sello
## la deja abierta para ejecutarla. Se prueba su cabeza (pensar) sin fisica.
extends "res://tests/caso.gd"

const ESCENA := preload("res://escenas/vestal.tscn")
const Vestal := preload("res://scripts/vestal.gd")
const DT := 1.0 / 60.0


func _vestal() -> Vestal:
	var vestal: Vestal = ESCENA.instantiate()
	vestal.ronda_izquierda = -200.0
	vestal.ronda_derecha = 200.0
	return vestal


func _pensar(vestal: Vestal, pasos: int, hacia: Vector2) -> void:
	for i in pasos:
		vestal.pensar(DT, hacia)
		vestal.position.x += vestal.velocity.x * DT


func test_se_acerca_si_estas_lejos_y_retrocede_si_te_acercas() -> void:
	var vestal := _vestal()
	_pensar(vestal, 1, Vector2(190, 0))
	afirmar(vestal.velocity.x > 0.0, "a 190 px se acerca")
	vestal.position.x = 0.0
	_pensar(vestal, 1, Vector2(40, 0))
	afirmar(vestal.velocity.x < 0.0, "a 40 px retrocede")
	vestal.free()


func test_a_su_distancia_avisa_520_ms_y_lanza() -> void:
	var vestal := _vestal()
	var lanzados := []
	vestal.lanzo.connect(func(_sitio: Vector2, direccion: int) -> void: lanzados.append(direccion))
	var a_su_distancia := Vector2(110, 0)
	_pensar(vestal, 1, a_su_distancia)
	afirmar_igual(vestal.estado, Vestal.Estado.INVOCANDO, "a 110 px se queda y alza el sello")
	_pensar(vestal, 30, a_su_distancia) # 500 ms
	afirmar(lanzados.is_empty(), "a los 500 ms aun no ha lanzado")
	_pensar(vestal, 2, a_su_distancia)
	afirmar_igual(lanzados, [1], "a los 520, un sello hacia el Cirujano")
	vestal.free()


func test_solo_su_sello_la_deja_ejecutable() -> void:
	var vestal := _vestal()
	vestal.recibir_dano(1, 20.0)
	afirmar(not vestal.ejecutable(), "un tajo la aturde un instante, pero no la abre")
	vestal.aturdir()
	afirmar(vestal.ejecutable(), "su propio sello devuelto, si")
	_pensar(vestal, 50, Vector2(500, 0)) # 833 ms
	afirmar(vestal.ejecutable(), "abierta casi un segundo, como un parado")
	vestal.ejecutar(30.0)
	afirmar_igual(vestal.estado, Vestal.Estado.EJECUTADO, "de rodillas")
	vestal.rematar()
	afirmar(not vestal.vivo(), "y el tajo la mata")
	vestal.free()
