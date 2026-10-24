## Las acciones del juego y sus teclas y botones (#180), las mismas del
## original: ver README.md del repo, "Controles".
##
## Se registran en codigo y no en project.godot: asi se leen de un vistazo, se
## prueban (tests/test_controles.gd) y no hace falta abrir el editor para
## cambiar una tecla.
extends Node

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
	"codice": {"teclas": [KEY_L], "mando": [JOY_BUTTON_BACK]},
	"pausa": {"teclas": [KEY_ESCAPE, KEY_P], "mando": [JOY_BUTTON_START]},
	"ayuda": {"teclas": [KEY_H, KEY_TAB]},
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
	JOY_BUTTON_START: "Start", JOY_BUTTON_BACK: "Back",
}


## El nombre de la tecla (o del boton, con mando) de `accion`, para
## ensenarlo. Para moverse, las flechas: se leen mejor que WASD.
static func nombre(accion: String, con_mando := false) -> String:
	var def: Dictionary = ACCIONES.get(accion, {})
	if con_mando:
		if def.has("mando"):
			return NOMBRES_MANDO.get(def["mando"][0], "?")
		if def.has("eje") and def["eje"][0] == JOY_AXIS_TRIGGER_LEFT:
			return "LT"
	var teclas: Array = def.get("teclas", [])
	if teclas.is_empty():
		return "?"
	for tecla in teclas:
		if tecla in [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN]:
			return NOMBRES_TECLA[tecla]
	return NOMBRES_TECLA.get(teclas[0], OS.get_keycode_string(teclas[0]))


## Cambia cada {accion} de `texto` por su tecla (o su boton si hay mando).
static func rellenar(texto: String) -> String:
	var con_mando := not Input.get_connected_joypads().is_empty()
	for accion in ACCIONES:
		texto = texto.replace("{%s}" % accion, nombre(accion, con_mando))
	return texto


func _enter_tree() -> void:
	registrar()


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
