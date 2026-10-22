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
