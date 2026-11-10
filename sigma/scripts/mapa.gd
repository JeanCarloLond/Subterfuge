## El mapa, como en Blasphemous: con N (Back, con mando) se abre a pantalla
## completa y el juego se para. Cada sala aparece la primera vez que se pisa
## (Progreso.visitar): no hay que comprar ni encontrar nada, se descubre
## andando. Se ve donde esta el Cirujano (su ojo rojo), los Altares, la carne
## que quedo tras morir y las salidas que aun no se han cruzado.
##
## El plano sale de las salas mismas (scripts/plano.gd, que genera
## herramientas/crear_plano.gd): si cambia una sala, se vuelve a generar.
extends CanvasLayer

const Plano := preload("res://scripts/plano.gd")
const Controles := preload("res://scripts/controles.gd")

## Donde se dibujan las salas: entre las dos lineas del marco. Lo que sale de
## ahi se recorta.
const AREA := Rect2(16, 40, 608, 276)
## Un pixel del mapa son tantos de la sala.
const ESCALA := Plano.ESCALA
## Lo que se desplaza con las flechas, en pixeles del mapa por segundo.
const DESPLAZAMIENTO := 180.0

const ORO := Color(0.89, 0.663, 0.251)
const ORO_APAGADO := Color(0.55, 0.4, 0.17)
const HUESO := Color(0.78, 0.71, 0.58)
const FONDO := Color(0.035, 0.027, 0.031)
const SALA := Color(0.24, 0.09, 0.08)
const SALA_AQUI := Color(0.46, 0.14, 0.11)
const OJO := Color(0.95, 0.16, 0.12)
const CARNE := Color(0.62, 0.08, 0.07)

const NIVELES := {
	"nivel1": "Nivel I · El Atrio",
	"nivel2": "Nivel II · Pasillos de Preparación",
	"nivel3": "Nivel III · Las Salas de Sacramento",
}
const NOMBRES := {
	"pabellon": "Pabellón N.º 7",
	"claustro": "El Claustro",
	"nave": "La Nave del Atrio",
	"pozo": "El Pozo de la Sillería",
	"capilla": "La Capilla de la Vestal",
	"muro": "El Muro de los Dientes",
	"escalera": "La Escalera de los Ciegos",
	"umbral": "El Umbral de los Pasillos",
	"registro": "El Registro de Diezmos",
	"sorteos": "La Sala de Sorteos",
	"archivo": "El Archivo",
	"escribania": "La Escribanía",
	"pasillo": "El Pasillo que se cierra",
	"ala": "El Ala sellada de Génesis",
	"laboratorio": "El Laboratorio",
	"nave_libro": "La Nave del Libro",
	"bajada": "La Bajada del Libro",
	"sala_1": "Sala N.º 1",
	"lavatorio": "El Lavatorio",
	"sala_3": "Sala N.º 3",
	"sala_5": "Sala N.º 5",
	"sala_6": "Sala N.º 6",
	"antesala": "La antesala de la N.º 7",
	"sala_7": "La Sala N.º 7",
}

## Quien se marca en el mapa. Lo pone la sala.
var cirujano: Node2D
## La sala donde se esta (su escena).
var sala := ""

var _abierto := false
## El centro de lo que se ve, en el mundo.
var _vista := Vector2.ZERO
var _lienzo: Control
var _titulo: Label
var _nombre: Label
var _pie: Label
var _tiempo := 0.0


## Si la sala esta en el plano (las de prueba y la demo, no).
static func en_plano(escena: String) -> bool:
	return Plano.SALAS.has(escena)


static func nombre_de(escena: String) -> String:
	return NOMBRES.get(escena.get_file().get_basename(), "")


## Las salas del plano que se dibujan: las visitadas.
static func visibles(progreso: Node) -> Array:
	return Plano.SALAS.keys().filter(func(ruta: String) -> bool: return progreso.visitada(ruta))


func _ready() -> void:
	layer = 12
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	var fondo := ColorRect.new()
	fondo.color = FONDO
	fondo.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(fondo)
	var recorte := Control.new()
	recorte.position = AREA.position
	recorte.size = AREA.size
	recorte.clip_contents = true
	add_child(recorte)
	_lienzo = Control.new()
	_lienzo.size = AREA.size
	_lienzo.draw.connect(_dibujar)
	recorte.add_child(_lienzo)
	var marco := Control.new()
	marco.set_anchors_preset(Control.PRESET_FULL_RECT)
	marco.draw.connect(_marco.bind(marco))
	add_child(marco)
	_titulo = _etiqueta(ORO, HORIZONTAL_ALIGNMENT_CENTER)
	_titulo.position = Vector2(0, 14)
	_nombre = _etiqueta(HUESO, HORIZONTAL_ALIGNMENT_LEFT)
	_nombre.position = Vector2(26, 322)
	_pie = _etiqueta(Color(0.6, 0.55, 0.5), HORIZONTAL_ALIGNMENT_RIGHT)
	_pie.position = Vector2(-26, 322)


func _etiqueta(color: Color, alineado: HorizontalAlignment) -> Label:
	var etiqueta := Label.new()
	etiqueta.size = Vector2(640, 20)
	etiqueta.horizontal_alignment = alineado
	etiqueta.add_theme_color_override("font_color", color)
	add_child(etiqueta)
	return etiqueta


func abierto() -> bool:
	return _abierto


## Se abre si la sala esta en el plano y nada mas tiene el juego parado (un
## dialogo, una nota, la pausa).
func puede_abrir() -> bool:
	return en_plano(sala) and not get_tree().paused and _progreso() != null


func abrir() -> void:
	_abierto = true
	visible = true
	get_tree().paused = true
	_vista = _donde_esta()
	var datos: Dictionary = Plano.SALAS[sala]
	_titulo.text = NIVELES.get(datos["nivel"], "")
	_nombre.text = nombre_de(sala)
	# Al abrir, con los botones del mando que se este usando.
	_pie.text = Controles.rellenar("{mapa} cerrar · {izquierda} {derecha} {arriba} {abajo} mover")
	_lienzo.queue_redraw()


func cerrar() -> void:
	_abierto = false
	visible = false
	get_tree().paused = false


func _unhandled_input(evento: InputEvent) -> void:
	if not _abierto:
		if evento.is_action_pressed("mapa") and puede_abrir():
			abrir()
			get_viewport().set_input_as_handled()
		return
	if evento.is_action_pressed("mapa") or evento.is_action_pressed("pausa"):
		cerrar()
	# Abierto, el mapa se queda con todo: que no se cuele un salto al cerrar.
	get_viewport().set_input_as_handled()


func _process(delta: float) -> void:
	if not _abierto:
		return
	_tiempo += delta
	var mover := Input.get_vector("izquierda", "derecha", "arriba", "abajo")
	_vista += mover * DESPLAZAMIENTO * ESCALA * delta
	_vista = _vista.clamp(_limites().position, _limites().end)
	_lienzo.queue_redraw()


## Donde esta el Cirujano en el mundo del plano.
func _donde_esta() -> Vector2:
	var origen: Vector2 = Plano.SALAS[sala]["rect"].position
	return origen + (cirujano.position if cirujano else Plano.SALAS[sala]["rect"].size / 2.0)


## Lo que abarca lo visitado: no se puede desplazar mas alla.
func _limites() -> Rect2:
	var progreso := _progreso()
	var caja: Rect2 = Plano.SALAS[sala]["rect"]
	if progreso:
		for ruta in visibles(progreso):
			caja = caja.merge(Plano.SALAS[ruta]["rect"])
	return caja


## Del mundo a la pantalla, con `_vista` en el centro, a pixel entero.
func _a_pantalla(punto: Vector2) -> Vector2:
	return ((punto - _vista) / ESCALA + AREA.size / 2.0).round()


func _dibujar() -> void:
	var progreso := _progreso()
	if progreso == null:
		return
	var rutas := visibles(progreso)
	# Primero las salas, luego sus puertas encima: la puerta corta el borde.
	for ruta in rutas:
		var caja: Rect2 = Plano.SALAS[ruta]["rect"]
		var arriba := _a_pantalla(caja.position)
		var r := Rect2(arriba, _a_pantalla(caja.end) - arriba)
		var aqui: bool = ruta == sala
		var relleno := SALA_AQUI.lerp(SALA, 0.35 + 0.35 * sin(_tiempo * 3.0)) if aqui else SALA
		_lienzo.draw_rect(r, relleno)
		_lienzo.draw_rect(r.grow(-0.5), ORO if aqui else ORO_APAGADO, false, 1.0)
	for ruta in rutas:
		for paso in Plano.SALAS[ruta]["pasos"]:
			var destino: String = paso["destino"]
			var cruzado: bool = destino != "" and progreso.visitada(destino)
			# Una puerta escondida (la de la N.º 7) no se delata en el mapa.
			if paso["escondido"] and not cruzado:
				continue
			var punto := _a_pantalla(paso["centro"])
			if cruzado:
				_lienzo.draw_rect(Rect2(punto - Vector2(1, 1), Vector2(3, 3)), SALA)
			else:
				# Una salida que aun no se ha cruzado: lo que falta por ver.
				_lienzo.draw_rect(Rect2(punto - Vector2(1, 1), Vector2(3, 3)), HUESO)
		for altar in Plano.SALAS[ruta]["altares"]:
			_rombo(_lienzo, _a_pantalla(altar) - Vector2(0, 3), 3.0, ORO)
	# La carne que quedo al morir.
	var deuda: Dictionary = progreso.deuda
	if deuda.get("sala", "") in Plano.SALAS and progreso.visitada(deuda["sala"]):
		var sitio: Vector2 = Plano.SALAS[deuda["sala"]]["rect"].position + deuda.get("sitio", Vector2.ZERO)
		_gota(_a_pantalla(sitio) - Vector2(0, 2), CARNE)
	# El Cirujano: un ojo abierto, con el iris rojo, que late. Es lo que el
	# lleva puesto, y lo unico del mapa que mira.
	var ojo := _a_pantalla(_donde_esta()) - Vector2(0, 3)
	var brillo := 0.5 + 0.5 * sin(_tiempo * 6.0)
	_lienzo.draw_circle(ojo, 6.0, Color(OJO, 0.22 * brillo))
	_lienzo.draw_colored_polygon(PackedVector2Array([
		ojo + Vector2(-4, 0), ojo + Vector2(-2, -2), ojo + Vector2(2, -2),
		ojo + Vector2(4, 0), ojo + Vector2(2, 2), ojo + Vector2(-2, 2),
	]), HUESO)
	_lienzo.draw_rect(Rect2(ojo - Vector2(1, 1), Vector2(3, 3)), OJO)


func _rombo(lienzo: Control, centro: Vector2, radio: float, color: Color) -> void:
	lienzo.draw_colored_polygon(PackedVector2Array([
		centro + Vector2(0, -radio), centro + Vector2(radio, 0),
		centro + Vector2(0, radio), centro + Vector2(-radio, 0),
	]), color)


func _gota(centro: Vector2, color: Color) -> void:
	var forma := func(k: float) -> PackedVector2Array:
		return PackedVector2Array([
			centro + Vector2(0, -4) * k, centro + Vector2(3, 0) * k, centro + Vector2(2, 3) * k,
			centro + Vector2(-2, 3) * k, centro + Vector2(-3, 0) * k,
		])
	_lienzo.draw_colored_polygon(forma.call(1.4), Color(0.05, 0.02, 0.02))
	_lienzo.draw_colored_polygon(forma.call(1.0), color)


## El marco de oro, doble, como el de la interfaz.
func _marco(lienzo: Control) -> void:
	var fuera := Rect2(Vector2(10, 10), Vector2(620, 340))
	lienzo.draw_rect(fuera, ORO_APAGADO, false, 1.0)
	lienzo.draw_rect(fuera.grow(-3), Color(ORO_APAGADO, 0.5), false, 1.0)
	lienzo.draw_line(Vector2(40, AREA.position.y - 2), Vector2(600, AREA.position.y - 2), Color(ORO_APAGADO, 0.6))
	lienzo.draw_line(Vector2(40, AREA.end.y + 2), Vector2(600, AREA.end.y + 2), Color(ORO_APAGADO, 0.6))
	for esquina in [Vector2(10, 10), Vector2(630, 10), Vector2(10, 350), Vector2(630, 350)]:
		_rombo(lienzo, esquina, 4.0, ORO)


func _progreso() -> Node:
	return get_node_or_null("/root/Progreso")
