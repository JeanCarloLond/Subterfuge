## El Prior del Diezmo (#219): cada golpe se avisa, de lejos alterna injertos
## y sello, la fase dos llega a la mitad y trae el diezmo, y vencido se
## arrodilla para que lo rematen. La cabeza (pensar), sin fisica.
extends "res://tests/caso.gd"

const P := preload("res://scripts/sacramento.gd").PRIOR
const ESCENA := preload("res://escenas/prior.tscn")


func _prior() -> CharacterBody2D:
	var prior: CharacterBody2D = ESCENA.instantiate()
	prior.position = Vector2(400, 300)
	# En el arbol, para que esten sus nodos; sin fotogramas, no se mueve solo.
	Engine.get_main_loop().root.add_child(prior)
	prior.set_physics_process(false)
	return prior


func _hasta_que_ataque(prior: CharacterBody2D, hacia: Vector2) -> int:
	for i in 300:
		prior.pensar(0.016, hacia)
		if prior.estado in [prior.Estado.BACULO, prior.Estado.INJERTOS, prior.Estado.SELLO, prior.Estado.DIEZMO]:
			return prior.estado
	return -1


func test_dormido_no_ataca_hasta_que_despierta() -> void:
	var prior := _prior()
	for i in 200:
		prior.pensar(0.016, Vector2(380, 300))
	afirmar_igual(prior.estado, prior.Estado.DORMIDO, "dormido")
	prior.despertar()
	afirmar(_hasta_que_ataque(prior, Vector2(380, 300)) != -1, "despierto, ataca")
	prior.free()


func test_de_cerca_el_baculo_con_aviso_largo() -> void:
	var prior := _prior()
	prior.despertar()
	afirmar_igual(_hasta_que_ataque(prior, Vector2(370, 300)), prior.Estado.BACULO, "de cerca, el báculo")
	afirmar(P["baculo"]["anticipacion_ms"] >= 600.0, "con un aviso que se lee")
	prior.free()


func test_de_lejos_alterna_injertos_y_sello() -> void:
	var prior := _prior()
	prior.despertar()
	var vistos := []
	for i in 4:
		vistos.append(_hasta_que_ataque(prior, Vector2(150, 300)))
		prior.estado = prior.Estado.ANDAR
		prior._fin_enfriamiento = -INF
	afirmar(vistos.has(prior.Estado.INJERTOS) and vistos.has(prior.Estado.SELLO), "injertos y sello: %s" % [vistos])
	prior.free()


func test_la_fase_dos_llega_a_la_mitad_y_trae_el_diezmo() -> void:
	var prior := _prior()
	prior.despertar()
	var avisos := []
	prior.fase_dos.connect(func() -> void: avisos.append(1))
	prior.recibir_dano(int(P["vida"] * P["fase_dos"]) - 1, 0.0)
	afirmar(avisos.is_empty(), "por encima de la mitad, aún no")
	prior.recibir_dano(2, 0.0)
	prior.recibir_dano(2, 0.0)
	afirmar_igual(avisos.size(), 1, "la fase dos, una sola vez")
	var diezmo := false
	for i in 6:
		if _hasta_que_ataque(prior, Vector2(150, 300)) == prior.Estado.DIEZMO:
			diezmo = true
		prior.estado = prior.Estado.ANDAR
		prior._fin_enfriamiento = -INF
	afirmar(diezmo, "en la fase dos sale el diezmo")
	prior.free()


func test_vencido_se_arrodilla_y_se_le_remata() -> void:
	var prior := _prior()
	prior.despertar()
	var caido := []
	prior.cae.connect(func() -> void: caido.append(1))
	prior.recibir_dano(P["vida"], 0.0)
	afirmar_igual(prior.estado, prior.Estado.VENCIDO, "vencido, no muerto")
	afirmar(prior.ejecutable(), "se le puede ejecutar")
	afirmar_igual(_hasta_que_ataque(prior, Vector2(380, 300)), -1, "y ya no ataca")
	prior.recibir_dano(10, 0.0)
	afirmar(prior.vivo(), "los golpes ya no le hacen nada")
	prior.ejecutar(370.0)
	prior.rematar()
	afirmar(not prior.vivo(), "rematado")
	afirmar_igual(caido.size(), 1, "y cae, una vez")
	prior.free()


func test_parado_se_tambalea() -> void:
	var prior := _prior()
	prior.despertar()
	prior.aturdir()
	afirmar_igual(prior.estado, prior.Estado.ATURDIDO, "aturdido")
	afirmar(not prior.ejecutable(), "pero no ejecutable: eso, solo vencido")
	prior.free()


## Antes de pelear hablan los dos (#242): cada uno con su retrato, y la pelea
## tiene su musica.
func test_antes_de_pelear_hablan_los_dos_y_suena_su_musica() -> void:
	var NaveLibro: GDScript = load("res://scripts/nave_libro.gd")
	var quienes := {}
	for palabra: Array in NaveLibro.PALABRAS:
		quienes[palabra[0]] = true
		afirmar(not String(palabra[1]).is_empty(), "ninguna línea vacía")
	afirmar_igual(quienes.size(), 2, "hablan el Prior y el Cirujano")
	for quien: String in quienes:
		afirmar(NaveLibro.RETRATOS.get(quien) is Texture2D, "%s tiene retrato" % quien)
	afirmar(ResourceLoader.exists("res://audio/musica/%s.ogg" % NaveLibro.MUSICA_PELEA), "la música de la pelea existe")
