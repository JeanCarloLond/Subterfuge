## Viste las salas del Nivel III (#255), como vestir_nivel_1.gd el I: va detras
## de crear_nivel_3.gd.
##
##   godot --headless --path sigma -s res://herramientas/vestir_nivel_3.gd
##
## Las Salas de Sacramento son quirofanos que se volvieron altares: el blanco de
## las paredes, manchado; camillas, bandejas y la luz de las lamparas. Es el nivel
## del oficio, y el mas limpio de todos: por eso lo que lo mancha se ve.
extends "res://herramientas/vestir_nivel_1.gd"

const DIR_3 := "res://escenas/nivel3/"
const Figura := preload("res://scripts/figura.gd")
## Las figuras que hablan: [x, y, tipo, lineas]. Lo que dicen, en docs/voz.md.
const SALAS_3 := {
	"bajada": {
		"penumbra": Color(0.78, 0.76, 0.74),
		"decorado": [
			[120, 160, "vela"], [300, 256, "charco"], [460, 368, "camilla"], [560, 368, "bandeja"],
			[250, 32, "exvoto"], [500, 32, "exvoto"], [640, 368, "charco"],
		],
	},
	"sala_1": {
		"penumbra": Color(0.8, 0.78, 0.76),
		"decorado": [
			[100, 256, "camilla"], [340, 256, "camilla"], [560, 256, "camilla"], [640, 256, "charco"],
			[300, 32, "exvoto"], [600, 32, "exvoto"], [460, 256, "charco"],
			[190, 256, "auxiliar", ["¿Viene a relevarme?", "Llevo aquí dos turnos."]],
		],
	},
	"lavatorio": {
		"penumbra": Color(0.74, 0.72, 0.72),
		"decorado": [
			[330, 288, "charco"], [410, 288, "charco"], [490, 288, "charco"], [60, 288, "vela"],
			[600, 288, "camilla"], [660, 288, "bandeja"], [700, 32, "exvoto"],
			[250, 288, "auxiliar", ["No la pruebe. Ya sabe.", "Hasta el codo, Mano."]],
		],
	},
	"sala_3": {
		"penumbra": Color(0.72, 0.68, 0.7),
		"decorado": [
			[280, 672, "camilla"], [200, 672, "charco"], [120, 608, "bandeja"], [340, 480, "charco"],
			[200, 32, "exvoto"], [400, 32, "exvoto"], [340, 176, "vela"], [420, 32, "goteo"],
		],
	},
	"sala_5": {
		"penumbra": Color(0.76, 0.72, 0.72),
		"decorado": [
			[200, 352, "camilla"], [420, 352, "camilla"], [520, 352, "camilla"], [120, 352, "bandeja"],
			[300, 352, "charco"], [620, 352, "charco"], [200, 32, "exvoto"], [640, 32, "exvoto"],
			[340, 352, "auxiliar", ["¿Usted también las oye?", "Las pinzas, de noche."]],
		],
	},
	"sala_6": {
		"penumbra": Color(0.68, 0.62, 0.64),
		"decorado": [
			[60, 224, "bandeja"], [130, 224, "charco"], [470, 208, "bandeja"], [880, 176, "camilla"],
			[300, 32, "exvoto"], [600, 32, "exvoto"],
		],
	},
	"antesala": {
		"penumbra": Color(0.74, 0.68, 0.66),
		"decorado": [
			[60, 224, "vela"], [300, 224, "camilla"], [370, 224, "bandeja"], [420, 224, "charco"],
			[200, 32, "exvoto"], [400, 32, "exvoto"],
			[230, 224, "auxiliar", ["El Decano ha preguntado.", "Por usted. Hace años."]],
		],
	},
	"sala_7": {
		"penumbra": Color(0.7, 0.66, 0.66),
		"decorado": [
			[380, 256, "camilla"], [420, 256, "bandeja"], [340, 256, "charco"], [640, 256, "charco"],
			[300, 32, "exvoto"], [460, 32, "exvoto"], [720, 256, "vela"],
		],
	},
}


func _initialize() -> void:
	dir = DIR_3
	super()


func _salas() -> Dictionary:
	return SALAS_3


## Lo de vestir al uso, y encima las figuras que hablan.
func _decorado(silleria: TileMapLayer, piezas: Array) -> Node:
	var mudas := piezas.filter(func(p: Array) -> bool: return p.size() == 3)
	var decorado: Node = super(silleria, mudas)
	var i := 0
	for p: Array in piezas:
		if p.size() == 3:
			continue
		var figura := _sprite(p[2], Vector2(p[0], p[1]), false, 100 + i)
		figura.set_script(Figura)
		figura.set("lineas", PackedStringArray(p[3]))
		decorado.add_child(figura)
		i += 1
	return decorado
