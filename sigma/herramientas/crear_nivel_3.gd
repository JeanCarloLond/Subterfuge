## Crea las salas del Nivel III (#255), las Salas de Sacramento de
## docs/nivel3.md, hasta la puerta de la Sala N.º 7. Usa las piezas de
## crear_nivel_1.gd. Se corre UNA vez; desde entonces se editan en el editor (y
## se visten con vestir_nivel_3.gd):
##
##   godot --headless --path sigma -s res://herramientas/crear_nivel_3.gd
##
## Las medidas: el salto llega a 92 px (casi 6 tiles) y con el Impulso a 150 (9).
## Hasta el Pulmon, de la Sala N.º 5, todo se pasa con el salto y la membrana.
## Despues, la Sala N.º 6 pide el segundo salto y mirar a la vez.
extends "res://herramientas/crear_nivel_1.gd"

const DIR_3 := "res://escenas/nivel3/"
const NAVE_LIBRO := "res://escenas/nivel2/nave_libro.tscn"
const SALA_PABELLON := "res://escenas/nivel1/pabellon.tscn"
const FIN_SALA_7 := "Más abajo, las Criptas de Espera.
Hasta aquí está hecho.

Esc para volver a la portada"


func _initialize() -> void:
	dir = DIR_3
	if not _scripts_cargan():
		quit(1)
		return
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
	var errores := 0
	for crear in [_bajada, _sala_1, _lavatorio, _sala_3, _sala_5, _sala_6, _antesala, _sala_7]:
		errores += _guardar(crear.call())
	quit(errores)


## 1 · La Bajada del Libro: se entra arriba, por la puerta de la Nave, y se baja
## por los escalones. Al fondo, en lo alto, la puerta de la N.º 7, que aun no se
## puede alcanzar: el hito del nivel.
func _bajada() -> Dictionary:
	_empezar("Bajada", 44, 26)
	_nivel_3()
	_piedra([[0, 0, 44, 2], [0, 0, 2, 26], [42, 0, 2, 19], [42, 23, 2, 3]])
	_piedra([[2, 10, 12, 16], [14, 13, 4, 13], [18, 16, 4, 10], [22, 19, 4, 7], [26, 23, 16, 3]])
	_piedra([[33, 8, 9, 1]])
	_puerta(37, 8)
	_rotulo(37, 8, "N.º 7")
	_cirujano(6, 10)
	_devoto(34, 23, 470.0, 640.0)
	_paso("Arriba", 3, 7, 2, 3, NAVE_LIBRO, "abajo", true, "E  subir")
	_puerta(4, 10)
	_paso("Este", 42, 19, 2, 4, "sala_1", "oeste")
	_entrada("arriba", 6, 10, 1)
	_entrada("este", 39, 23, -1)
	_atrezo([["candelabro", 180, 160], ["candelabro", 340, 256], ["candelabro", 620, 368]])
	_ambiente([[250, 32, 100], [500, 32, 200]], [[416, 368, 256]])
	return {"nombre": "bajada", "ancho": 44, "alto": 26}


## 2 · La Sala N.º 1: el Remedo. Uno solo, con espacio, y luego dos seguidos: se
## aprende que salta a donde estabas.
func _sala_1() -> Dictionary:
	_empezar("Sala1", 46, 20)
	_nivel_3()
	_piedra([[0, 0, 46, 2], [0, 0, 2, 12], [44, 0, 2, 12], [0, 16, 46, 4], [24, 13, 3, 3]])
	_cirujano(4, 16)
	_remedo(15, 16)
	_remedo(31, 16)
	_remedo(37, 16)
	_cartel("remedo", 10, 16, "Lo de las bandejas tiembla y salta\na donde estabas: no te pares", "")
	_nota("inventario-sala-1", 41, 16, "Inventario de la Sala N.º 1", "«Bisturís, 14. Pinzas, 30. Sierras, 3.

Faltan al recuento de la noche dos pinzas, que luego aparecieron donde no estaban. Que nadie las toque con la mano desnuda. El turno de mañana dice que las oyó.»")
	_paso("Oeste", 0, 12, 2, 4, "bajada", "este")
	_paso("Este", 44, 12, 2, 4, "lavatorio", "oeste")
	_entrada("oeste", 4, 16, 1)
	_entrada("este", 42, 16, -1)
	_atrezo([["candelabro", 150, 256], ["candelabro", 560, 256]])
	_ambiente([[300, 32, 90]], [[32, 256, 672]])
	return {"nombre": "sala_1", "ancho": 46, "alto": 20}


## 3 · El Lavatorio: fuente con santo, y el agua de carne que cae en cortinas.
## Se cruza a tiempo. Al otro lado, el primer Asistente.
func _lavatorio() -> Dictionary:
	_empezar("Lavatorio", 52, 22)
	_nivel_3()
	_piedra([[0, 0, 52, 2], [0, 0, 2, 14], [50, 0, 2, 14], [0, 18, 52, 4]])
	_altar("Lavatorio", 8, 18)
	_cirujano(4, 18)
	for i in 3:
		_cortina(20 + i * 5, 2, 256.0, i * 500.0)
	_asistente(40, 18, 560.0, 760.0)
	_cartel("asistente", 36, 18, "La bandeja para el golpe de frente:\npor la espalda, o {parry} justo antes del suyo", "")
	_nota("aviso-lavatorio", 13, 18, "Aviso del Lavatorio", "«Lávense hasta el codo. El agua viene de arriba, y últimamente viene espesa.

No la prueben. Ya se lo dijimos a los de la N.º 3.»")
	_paso("Oeste", 0, 14, 2, 4, "sala_1", "este")
	_paso("Este", 50, 14, 2, 4, "sala_3", "oeste")
	_entrada("oeste", 3, 18, 1)
	_entrada("este", 48, 18, -1)
	_atrezo([["candelabro", 90, 288], ["candelabro", 240, 288], ["candelabro", 700, 288]])
	_ambiente([[340, 32, 60], [430, 32, 60]], [[32, 288, 768]])
	return {"nombre": "lavatorio", "ancho": 52, "alto": 22}


## 4 · La Sala N.º 3: el plataformeo del nivel, de subida. Repisas de 4 tiles en
## 4 tiles, con sierras, y un canto de membrana a media altura: 7 tiles, como los
## del Pozo, porque solo se clava una vez por salto.
func _sala_3() -> Dictionary:
	_empezar("Sala3", 30, 46)
	_nivel_3()
	_piedra([[0, 0, 30, 2], [0, 0, 2, 38], [0, 42, 2, 4], [28, 0, 2, 7], [28, 11, 2, 35], [0, 42, 30, 4]])
	_piedra([[6, 38, 6, 1], [14, 34, 6, 1], [20, 30, 6, 1], [18, 19, 8, 1], [10, 15, 6, 1], [18, 11, 10, 1]])
	_piedra([[26, 23, 2, 7]])
	_membrana([[26, 23, 2, 7]])
	_cirujano(3, 42)
	_devoto(18, 42, 200.0, 420.0)
	_sierra(14, 34, Vector2(80, 0), 0.0, -2.0)
	_sierra(19, 19, Vector2(72, 0), 0.0, -2.0)
	_remedo(13, 15)
	_nota("parte-sala-3", 24, 11, "Parte de la Sala N.º 3", "«Hoy ha entrado agua por el techo y nadie ha querido limpiarla.

La Mano de turno dice que las paredes de esta sala están más cerca que cuando la formaron a ella. Se la ha mandado a descansar. Mañana mediremos.»")
	_paso("Oeste", 0, 38, 2, 4, "lavatorio", "este")
	_paso("Este", 28, 7, 2, 4, "sala_5", "oeste")
	_entrada("oeste", 3, 42, 1)
	_entrada("este", 26, 11, -1)
	_atrezo([["candelabro", 90, 672], ["candelabro", 400, 672], ["candelabro", 340, 176]])
	_ambiente([[240, 32, 90]], [[32, 672, 416]])
	return {"nombre": "sala_3", "ancho": 30, "alto": 46}


## 5 · La Sala N.º 5: el Pulmon Vacio, en su relicario, sobre la repisa que se
## alcanza trepando el pilar de membrana. Abajo, dos Asistentes. Al tomarlo, ella
## vuelve a aparecer.
func _sala_5() -> Dictionary:
	_empezar("Sala5", 46, 26)
	_nivel_3()
	_piedra([[0, 0, 46, 2], [0, 0, 2, 18], [44, 0, 2, 18], [0, 22, 46, 4], [18, 15, 12, 1]])
	_piedra([[16, 15, 2, 7]])
	_membrana([[16, 15, 2, 7]])
	_cirujano(4, 22)
	_asistente(9, 22, 80.0, 240.0)
	_asistente(34, 22, 480.0, 660.0)
	var atrezo := [["relicario", 24 * 16 + 8, 240], ["candelabro", 340, 240], ["candelabro", 460, 240], ["candelabro", 620, 352]]
	var pulmon: Node2D = load("res://escenas/reliquia.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	pulmon.position = _pie(24, 15) + Vector2(0, -8)
	pulmon.set("id", "pulmon")
	_poner(pulmon, "Reliquias", "Pulmon")
	var vision := Node2D.new()
	vision.set_script(load("res://scripts/vision.gd"))
	vision.set("id", "pulmon")
	vision.set("tras", NodePath("../../Reliquias/Pulmon"))
	vision.set("lineas", PackedStringArray([
		"Ese también era de alguien. Respira despacio, que no te asustes.",
		"Salta. Y en el aire, otra vez. ¿Ves? No te dejan caer.",
		"Tampoco me dejaban a mí.",
	]))
	_poner(vision, "Visiones", "Pulmon")
	_cartel("impulso", 21, 15, "En el aire, {saltar} otra vez:\nel Impulso cárnico", "saltar", "vision-pulmon")
	_nota("parte-sala-5", 28, 15, "Parte de la Sala N.º 5", "«Retirado el pulmón a las seis. Estaba vacío y seguía respirando en la bandeja. Se ha guardado en el relicario por orden del Decano.

Nadie firma este parte. Lo firmo yo: Teodora, Mano de la N.º 5. Que conste que me lo han mandado.»")
	_paso("Oeste", 0, 18, 2, 4, "sala_3", "este")
	_paso("Este", 44, 18, 2, 4, "sala_6", "oeste")
	_entrada("oeste", 3, 22, 1)
	_entrada("este", 42, 22, -1)
	_atrezo(atrezo)
	_ambiente([[200, 32, 110], [600, 32, 200]], [[32, 352, 672]])
	return {"nombre": "sala_5", "ancho": 46, "alto": 26}


## 6 · La Sala N.º 6: doble salto y mirar a la vez. Los puentes de carne solo se
## ven mirando, y solo se alcanzan con el segundo salto: 5 tiles por encima y 6
## de hueco. Quien cae, cae.
func _sala_6() -> Dictionary:
	_empezar("Sala6", 60, 26)
	_nivel_3()
	_piedra([[0, 0, 60, 2], [0, 0, 2, 10], [58, 0, 2, 7], [2, 14, 10, 12], [28, 13, 6, 13], [48, 11, 12, 15]])
	_piedra([[0, 14, 2, 12]])
	_cirujano(4, 14)
	_puente(18, 9, 4)
	_puente(38, 8, 3)
	_remedo(31, 13)
	_asistente(53, 11, 790.0, 900.0)
	_nota("carta-al-decano", 33, 13, "Al Decano de las Manos", "«La Mano de la N.º 7 lleva tres semanas pidiendo que le cambien la máscara. Dice que le aprieta.»

Debajo, con otra letra, de trazo muy seguro: «Las máscaras no aprietan.»")
	_paso("Oeste", 0, 10, 2, 4, "sala_5", "este")
	_paso("Este", 58, 7, 2, 4, "antesala", "oeste")
	_entrada("oeste", 4, 14, 1)
	_entrada("este", 56, 11, -1)
	_aparicion(55, 11)
	_atrezo([["candelabro", 100, 224], ["candelabro", 512, 208], ["candelabro", 800, 176]])
	_ambiente([[300, 32, 160], [600, 32, 110]], [[192, 400, 576]])
	return {"nombre": "sala_6", "ancho": 60, "alto": 26}


## 7 · La antesala de la N.º 7: fuente con santo y una vision. La puerta, por
## fin, a pie llano.
func _antesala() -> Dictionary:
	_empezar("Antesala", 36, 18)
	_nivel_3()
	_piedra([[0, 0, 36, 2], [0, 0, 2, 10], [34, 0, 2, 18], [0, 14, 36, 4]])
	_altar("Antesala", 8, 14)
	_cirujano(4, 14)
	var vision := Node2D.new()
	vision.set_script(load("res://scripts/vision.gd"))
	vision.set("id", "antesala-7")
	vision.set("zona", Rect2(14 * 16, 8 * 16, 4 * 16, 6 * 16))
	vision.set("objetivo", "sala7")
	vision.set("lineas", PackedStringArray([
		"Aquí es. Todavía huele igual.",
		"Aquel día hacía frío, ¿te acuerdas? La sábana pesaba muy poco.",
		"El de dentro te enseñó a coser. Te va a decir que lo dejes.",
		"Tú no lo dejes.",
	]))
	_poner(vision, "Visiones", "Antesala")
	_paso("Adelante", 28, 11, 2, 3, "sala_7", "oeste", true, "E  entrar")
	_puerta(29, 14)
	_rotulo(29, 14, "N.º 7")
	_paso("Oeste", 0, 10, 2, 4, "sala_6", "este")
	_entrada("oeste", 3, 14, 1)
	_entrada("sala7", 26, 14, -1)
	_atrezo([["candelabro", 90, 224], ["candelabro", 400, 224], ["candelabro", 540, 224]])
	_ambiente([], [[32, 224, 512]])
	return {"nombre": "antesala", "ancho": 36, "alto": 18}


## 8 · La Sala N.º 7 (#256): donde miro. La camilla, en medio. Una antesala de
## techo bajo; la puerta que cae al entrar; el Decano. Tras el muro del fondo, la
## puerta del Pabellon N.º 7, que se abre al caer, y el camino adelante.
func _sala_7() -> Dictionary:
	_empezar("Sala7", 48, 20)
	_raiz.set_script(load("res://scripts/sala_siete.gd"))
	_nivel_3()
	_raiz.set("fin", FIN_SALA_7)
	_piedra([[0, 0, 8, 10], [8, 0, 2, 1], [10, 0, 38, 2], [0, 0, 2, 20], [46, 0, 2, 20], [0, 16, 48, 4]])
	_cirujano(4, 16)
	var puerta := AnimatableBody2D.new()
	puerta.set_script(load("res://scripts/muro.gd"))
	puerta.position = Vector2(8 * 16, 1 * 16)
	puerta.set("tiles", Vector2i(2, 9))
	puerta.set("direccion", Vector2(0, 1))
	puerta.set("recorrido", 96.0)
	puerta.set("ciclico", false)
	puerta.set("blanca", true)
	_poner(puerta, "Muros", "Puerta")
	var compactacion := Node2D.new()
	_poner(compactacion, "", "Compactacion")
	var fondo := AnimatableBody2D.new()
	fondo.set_script(load("res://scripts/muro.gd"))
	fondo.position = Vector2(38 * 16, 2 * 16)
	fondo.set("tiles", Vector2i(3, 14))
	fondo.set("direccion", Vector2.LEFT)
	fondo.set("recorrido", 0.0)
	fondo.set("ciclico", false)
	fondo.set("blanca", true)
	_poner(fondo, "Compactacion", "Fondo")
	var guardianes := Node2D.new()
	_poner(guardianes, "", "Guardianes")
	var decano: Node2D = load("res://escenas/decano.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	decano.position = _pie(30, 16)
	_poner(decano, "Guardianes", "Decano")
	var vision := Node2D.new()
	vision.set_script(load("res://scripts/vision.gd"))
	vision.set("id", "tras-decano")
	vision.set("tras", NodePath("../../Guardianes/Decano"))
	vision.set("senal", "cae")
	vision.set("objetivo", "criptas")
	vision.set("lineas", PackedStringArray([
		"No te preocupes, no oía tanto como decía.",
		"¿Notas la pared? Detrás está tu cama.",
		"Te lo dije. Cada vez hay menos vueltas.",
	]))
	_poner(vision, "Visiones", "TrasDecano")
	_paso("Oeste", 2, 13, 2, 3, "antesala", "sala7", true, "E  volver")
	_puerta(3, 16)
	var pabellon := _paso("Pabellon", 41, 13, 2, 3, SALA_PABELLON, "sala7", true, "E  a tu Pabellón")
	pabellon.set("pide_marca", "decano-vencido")
	_puerta(42, 16)
	var abajo := _paso("Abajo", 44, 13, 2, 3, "", "", true, "E  descender")
	abajo.set("pide_marca", "decano-vencido")
	abajo.set("negado_texto", "No hasta que caiga el Decano")
	_puerta(45, 16)
	_entrada("oeste", 5, 16, 1)
	_entrada("pabellon", 42, 16, -1)
	_atrezo([["candelabro", 56, 256], ["candelabro", 300, 256], ["candelabro", 520, 256]])
	_ambiente([[400, 32, 110]], [[176, 256, 416]])
	return {"nombre": "sala_7", "ancho": 48, "alto": 20}


# --- Las piezas del Nivel III -------------------------------------------------


## Lo de todo el nivel. La musica es por ahora la de los Pasillos (docs/nivel3.md).
func _nivel_3() -> void:
	_raiz.set("musica", "catedral-bosque")
	_silleria.tile_set = load("res://arte/silleria/salas.tres")


func _remedo(columna: int, fila: int) -> void:
	var remedo := Node2D.new()
	remedo.set_script(load("res://scripts/remedo.gd"))
	remedo.position = _pie(columna, fila)
	_poner(remedo, "Peligros", "Remedo")


func _asistente(columna: int, fila: int, desde: float, hasta: float) -> void:
	var asistente: Node2D = load("res://escenas/asistente.tscn").instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	asistente.position = _pie(columna, fila)
	asistente.set("ronda_izquierda", desde)
	asistente.set("ronda_derecha", hasta)
	_poner(asistente, "Devotos", "Asistente")


func _cortina(columna: int, fila: int, largo: float, desfase_ms: float) -> void:
	var cortina := Node2D.new()
	cortina.set_script(load("res://scripts/cortina.gd"))
	cortina.position = Vector2(columna * 16 + 8, fila * 16)
	cortina.set("largo", largo)
	cortina.set("desfase_ms", desfase_ms)
	_poner(cortina, "Peligros", "Cortina")


## Un puente de carne: solo existe mientras se mira.
func _puente(columna: int, fila: int, ancho: int) -> void:
	var puente := StaticBody2D.new()
	puente.set_script(load("res://scripts/puente.gd"))
	puente.position = Vector2(columna * 16, fila * 16)
	puente.set("ancho", ancho)
	_mirada().add_child(puente)
	puente.owner = _raiz


## Ella, de pie donde quiere que vaya: solo se ve mirando.
func _aparicion(columna: int, fila: int) -> void:
	var nina := Sprite2D.new()
	nina.name = "Nina"
	nina.set_script(load("res://scripts/aparicion.gd"))
	nina.position = _pie(columna, fila)
	_mirada().add_child(nina)
	nina.owner = _raiz


func _mirada() -> Node2D:
	if _raiz.has_node("Mirada"):
		return _raiz.get_node("Mirada")
	var mirada := Node2D.new()
	_poner(mirada, "", "Mirada")
	return mirada


## El numero de una puerta, pintado encima.
func _rotulo(columna: int, fila: int, texto: String) -> void:
	var rotulo := Label.new()
	rotulo.text = texto
	rotulo.position = _pie(columna, fila) + Vector2(-20, -52)
	rotulo.size = Vector2(40, 16)
	rotulo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rotulo.add_theme_color_override("font_color", Color(0.85, 0.62, 0.25))
	rotulo.z_index = -1
	_poner(rotulo, "", "Rotulo")
