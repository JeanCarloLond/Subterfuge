## Viste las salas del Nivel II (#190), como vestir_nivel_1.gd el I: va detras
## de crear_nivel_2.gd.
##
##   godot --headless --path sigma -s res://herramientas/vestir_nivel_2.gd
##
## Los Pasillos son la burocracia de la Diocesis: registradoras, codices, el
## Libro. El Ala de Genesis es otra cosa: tanques, maquinas, radiografias y una
## luz fria que no es de vela. Lo primero que el jugador ve de antes.
extends "res://herramientas/vestir_nivel_1.gd"

const DIR_2 := "res://escenas/nivel2/"
const SALAS_2 := {
	"registro": {
		"penumbra": Color(0.68, 0.62, 0.6),
		"decorado": [
			[90, 384, "registradora"], [760, 384, "registradora"], [420, 384, "charco"],
			[200, 32, "exvoto"], [400, 32, "exvoto"], [700, 32, "exvoto"],
			[600, 384, "codice"], [880, 384, "vela"], [904, 384, "vela"],
		],
	},
	"escribania": {
		"penumbra": Color(0.64, 0.6, 0.6),
		"decorado": [
			[336, 256, "codice"], [488, 256, "codice"], [616, 256, "codice"], [710, 176, "placa"],
			[352, 256, "vela"], [504, 256, "vela"], [200, 32, "exvoto"], [500, 32, "exvoto"],
			[420, 304, "charco"],
		],
	},
	"sorteos": {
		"penumbra": Color(0.64, 0.6, 0.6),
		"decorado": [
			[520, 192, "registradora"], [240, 304, "columna"], [720, 304, "columna"],
			[200, 32, "exvoto"], [380, 32, "exvoto"], [820, 32, "exvoto"], [560, 304, "charco"],
		],
	},
	"archivo": {
		"penumbra": Color(0.58, 0.55, 0.58),
		"decorado": [
			[200, 80, "codice"], [500, 160, "codice"], [150, 240, "codice"], [560, 320, "codice"],
			[200, 400, "codice"], [520, 480, "codice"], [300, 560, "charco"], [120, 80, "vela"],
		],
	},
	"pasillo": {
		"penumbra": Color(0.58, 0.5, 0.52),
		"decorado": [
			[100, 224, "reja"], [300, 224, "charco"], [700, 224, "charco"], [1300, 224, "cadaver"],
		],
	},
	"ala": {
		"penumbra": Color(0.6, 0.66, 0.74),
		"decorado": [
			[520, 304, "tanque"], [740, 304, "maquina"], [620, 240, "pantalla"], [680, 240, "radiografia"],
			[280, 304, "holograma"], [880, 304, "holograma"], [60, 304, "vela"], [150, 304, "vela"],
		],
	},
}


func _initialize() -> void:
	dir = DIR_2
	super()


func _salas() -> Dictionary:
	return SALAS_2
