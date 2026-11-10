## Las acciones del juego y sus teclas y botones (#180), las mismas del
## original: ver README.md del repo, "Controles".
##
## Se registran en codigo y no en project.godot: asi se leen de un vistazo, se
## prueban (tests/test_controles.gd) y no hace falta abrir el editor para
## cambiar una tecla.
##
## El mando: cualquiera que Godot reconozca (Xbox, PlayStation 4 y 5, Switch
## Pro...), en escritorio y en la web. Los carteles ensenan los botones del que
## se esta usando: con un mando de PlayStation, ✕ ○ □ △; con el teclado, las
## teclas. Cambian en cuanto se toca el otro. Y el mando vibra (`vibrar`).
extends Node

## Se paso del teclado al mando o al reves, o de un mando a otro: los carteles
## se vuelven a escribir.
signal dispositivo_cambio

const XBOX := "xbox"
const PLAYSTATION := "playstation"
## Lo que delata un mando de Sony en su nombre: en escritorio, el de SDL
## («PS5 Controller», «DualSense Wireless Controller», «Sony Interactive
## Entertainment Wireless Controller»); en la web, el del navegador, que lleva
## el fabricante («Vendor: 054c»).
const PISTAS_PLAYSTATION := ["ps5", "ps4", "ps3", "dualsense", "dualshock", "playstation", "sony", "054c"]

## Accion -> teclas, botones del raton y del mando.
const ACCIONES := {
	"izquierda": {"teclas": [KEY_A, KEY_LEFT], "mando": [JOY_BUTTON_DPAD_LEFT], "eje": [JOY_AXIS_LEFT_X, -1.0]},
	"derecha": {"teclas": [KEY_D, KEY_RIGHT], "mando": [JOY_BUTTON_DPAD_RIGHT], "eje": [JOY_AXIS_LEFT_X, 1.0]},
	"arriba": {"teclas": [KEY_W, KEY_UP], "mando": [JOY_BUTTON_DPAD_UP], "eje": [JOY_AXIS_LEFT_Y, -1.0]},
	"abajo": {"teclas": [KEY_S, KEY_DOWN], "mando": [JOY_BUTTON_DPAD_DOWN], "eje": [JOY_AXIS_LEFT_Y, 1.0]},
	"saltar": {"teclas": [KEY_SPACE, KEY_Z], "mando": [JOY_BUTTON_A]},
	"dash": {"teclas": [KEY_SHIFT, KEY_X], "mando": [JOY_BUTTON_B]},
	"golpear": {"teclas": [KEY_J, KEY_C], "raton": [MOUSE_BUTTON_LEFT], "mando": [JOY_BUTTON_X]},
	"parry": {"teclas": [KEY_K, KEY_V], "raton": [MOUSE_BUTTON_RIGHT], "mando": [JOY_BUTTON_LEFT_SHOULDER]},
	"injertadora": {"teclas": [KEY_F, KEY_R], "mando": [JOY_BUTTON_RIGHT_SHOULDER]},
	"pocion": {"teclas": [KEY_Q], "eje": [JOY_AXIS_TRIGGER_LEFT, 1.0]},
	"interactuar": {"teclas": [KEY_E], "mando": [JOY_BUTTON_Y]},
	"codice": {"teclas": [KEY_L], "mando": [JOY_BUTTON_LEFT_STICK]},
	# El mapa: con Back, como en Blasphemous. N, porque la M ya silencia.
	"mapa": {"teclas": [KEY_N], "mando": [JOY_BUTTON_BACK]},
	"pausa": {"teclas": [KEY_ESCAPE, KEY_P], "mando": [JOY_BUTTON_START]},
	"ayuda": {"teclas": [KEY_H, KEY_TAB]},
	# Mirar con el ojo de los Mil (#243): se mantiene. O de ojo.
	"mirar": {"teclas": [KEY_O], "mando": [JOY_BUTTON_RIGHT_STICK]},
	"silencio": {"teclas": [KEY_M]},
}


## Como se llama cada tecla en pantalla (#221). Las que no estan, por su
## nombre de Godot (las letras salen tal cual).
const NOMBRES_TECLA := {
	KEY_SPACE: "Espacio", KEY_SHIFT: "Mayús", KEY_ESCAPE: "Esc", KEY_TAB: "Tab",
	KEY_LEFT: "←", KEY_RIGHT: "→", KEY_UP: "↑", KEY_DOWN: "↓",
}
const NOMBRES_MANDO := {
	JOY_BUTTON_A: "A", JOY_BUTTON_B: "B", JOY_BUTTON_X: "X", JOY_BUTTON_Y: "Y",
	JOY_BUTTON_LEFT_SHOULDER: "LB", JOY_BUTTON_RIGHT_SHOULDER: "RB",
	JOY_BUTTON_DPAD_LEFT: "←", JOY_BUTTON_DPAD_RIGHT: "→", JOY_BUTTON_DPAD_UP: "↑", JOY_BUTTON_DPAD_DOWN: "↓",
	JOY_BUTTON_START: "Start", JOY_BUTTON_BACK: "Back", JOY_BUTTON_RIGHT_STICK: "R3",
	JOY_BUTTON_LEFT_STICK: "L3",
}
## Los mismos, en un mando de PlayStation. Los simbolos los dibuja la fuente
## de reserva (herramientas/crear_flechas.py), como las flechas.
const NOMBRES_PLAYSTATION := {
	JOY_BUTTON_A: "✕", JOY_BUTTON_B: "○", JOY_BUTTON_X: "□", JOY_BUTTON_Y: "△",
	JOY_BUTTON_LEFT_SHOULDER: "L1", JOY_BUTTON_RIGHT_SHOULDER: "R1",
	JOY_BUTTON_DPAD_LEFT: "←", JOY_BUTTON_DPAD_RIGHT: "→", JOY_BUTTON_DPAD_UP: "↑", JOY_BUTTON_DPAD_DOWN: "↓",
	JOY_BUTTON_START: "Options", JOY_BUTTON_BACK: "Create", JOY_BUTTON_RIGHT_STICK: "R3",
	JOY_BUTTON_LEFT_STICK: "L3",
}
## Lo que hay que mover un eje para que cuente como usar el mando: el stick
## en reposo tiembla un poco y no debe quitarle el cartel al teclado.
const EJE_CUENTA := 0.5

## Lo ultimo que se toco: mando o teclado (y raton).
static var _usa_mando := false
## Si ya se toco algo: hasta entonces, con un mando enchufado se ensena el mando.
static var _tocado := false
static var _familia := XBOX
static var _dispositivo := 0


## El nombre de la tecla (o del boton, con mando) de `accion`, para
## ensenarlo. Para moverse, las flechas: se leen mejor que WASD.
static func nombre(accion: String, con_mando := false, familia := XBOX) -> String:
	var def: Dictionary = ACCIONES.get(accion, {})
	if con_mando:
		var nombres: Dictionary = NOMBRES_PLAYSTATION if familia == PLAYSTATION else NOMBRES_MANDO
		if def.has("mando"):
			return nombres.get(def["mando"][0], "?")
		if def.has("eje") and def["eje"][0] == JOY_AXIS_TRIGGER_LEFT:
			return "L2" if familia == PLAYSTATION else "LT"
	var teclas: Array = def.get("teclas", [])
	if teclas.is_empty():
		return "?"
	for tecla in teclas:
		if tecla in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN]:
			return NOMBRES_TECLA[tecla]
	return NOMBRES_TECLA.get(teclas[0], OS.get_keycode_string(teclas[0]))


## Cambia cada {accion} de `texto` por su tecla, o por su boton si lo ultimo
## que se toco fue el mando.
static func rellenar(texto: String) -> String:
	var con_mando := usa_mando()
	for accion in ACCIONES:
		texto = texto.replace("{%s}" % accion, nombre(accion, con_mando, _familia))
	return texto


## Si se esta jugando con mando: lo ultimo que se toco. Antes de tocar nada,
## si hay uno enchufado.
static func usa_mando() -> bool:
	if _tocado:
		return _usa_mando
	return not Input.get_connected_joypads().is_empty()


## Que mando es, por su nombre: PlayStation o el resto (que se ensenan como
## uno de Xbox, la disposicion que Godot usa para todos).
static func familia_de(nombre_mando: String) -> String:
	var bajo := nombre_mando.to_lower()
	for pista in PISTAS_PLAYSTATION:
		if bajo.contains(pista):
			return PLAYSTATION
	return XBOX


static func familia_actual() -> String:
	return _familia


## Hace vibrar el mando que se esta usando: `debil` y `fuerte` son los dos
## motores (0 a 1). Con teclado, nada.
static func vibrar(debil: float, fuerte: float, segundos: float) -> void:
	if usa_mando():
		Input.start_joy_vibration(_dispositivo, debil, fuerte, segundos)


func _ready() -> void:
	# Tambien en pausa y en los menus: alli tambien se cambia de mando.
	process_mode = Node.PROCESS_MODE_ALWAYS
	Input.joy_connection_changed.connect(_al_conectar)
	var mandos := Input.get_connected_joypads()
	if not mandos.is_empty():
		_dispositivo = mandos[0]
		_familia = familia_de(Input.get_joy_name(_dispositivo))


func _input(evento: InputEvent) -> void:
	if evento is InputEventJoypadButton and evento.pressed:
		_usar(true, evento.device)
	elif evento is InputEventJoypadMotion and absf(evento.axis_value) > EJE_CUENTA:
		_usar(true, evento.device)
	elif (evento is InputEventKey or evento is InputEventMouseButton) and evento.pressed:
		_usar(false, _dispositivo)


func _usar(con_mando: bool, dispositivo: int) -> void:
	var familia_nueva := familia_de(Input.get_joy_name(dispositivo)) if con_mando else _familia
	var cambia := not _tocado or con_mando != _usa_mando or familia_nueva != _familia
	_tocado = true
	_usa_mando = con_mando
	_familia = familia_nueva
	if con_mando:
		_dispositivo = dispositivo
	if cambia:
		dispositivo_cambio.emit()


## Se enchufa un mando: se pasa a el. Se quita el ultimo: al teclado.
func _al_conectar(dispositivo: int, conectado: bool) -> void:
	if conectado:
		_usar(true, dispositivo)
	elif Input.get_connected_joypads().is_empty():
		_usar(false, _dispositivo)


## Las flechas de las teclas (#237): ninguna fuente del juego las tiene. En
## escritorio salian de las del sistema; en la web no hay sistema y salian
## cajas con el codigo. Van de reserva en todas (herramientas/crear_flechas.py).
const FLECHAS := preload("res://arte/fuentes/FlechasSigma.ttf")
const FUENTES := [
	"res://arte/fuentes/VT323-Regular.ttf",
	"res://arte/fuentes/Jacquard12-Regular.ttf",
	"res://arte/fuentes/JacquardaBastarda9-Regular.ttf",
]
## Las fuentes ya con sus flechas. Sin quien las sujete, Godot suelta la que
## nadie usa y la siguiente carga llega sin reserva.
static var _con_flechas: Array[Font] = []


func _enter_tree() -> void:
	registrar()
	poner_flechas()


## Pone las flechas de reserva en las fuentes del juego. Se puede llamar mas
## de una vez.
static func poner_flechas() -> void:
	for ruta in FUENTES:
		var fuente: Font = load(ruta)
		if not _con_flechas.has(fuente):
			_con_flechas.append(fuente)
		if fuente.fallbacks.has(FLECHAS):
			continue
		var reservas := fuente.fallbacks.duplicate()
		reservas.append(FLECHAS)
		fuente.fallbacks = reservas


## Da de alta todas las acciones. Se puede llamar mas de una vez.
static func registrar() -> void:
	for accion in ACCIONES:
		if InputMap.has_action(accion):
			InputMap.erase_action(accion)
		InputMap.add_action(accion, 0.3)
		var def: Dictionary = ACCIONES[accion]
		for tecla in def.get("teclas", []):
			var evento := InputEventKey.new()
			evento.physical_keycode = tecla
			InputMap.action_add_event(accion, evento)
		for boton in def.get("raton", []):
			var evento := InputEventMouseButton.new()
			evento.button_index = boton
			InputMap.action_add_event(accion, evento)
		for boton in def.get("mando", []):
			var evento := InputEventJoypadButton.new()
			evento.button_index = boton
			InputMap.action_add_event(accion, evento)
		if def.has("eje"):
			var evento := InputEventJoypadMotion.new()
			evento.axis = def["eje"][0]
			evento.axis_value = def["eje"][1]
			InputMap.action_add_event(accion, evento)
