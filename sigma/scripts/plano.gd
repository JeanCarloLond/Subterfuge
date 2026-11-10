## El plano del mapa: generado por herramientas/crear_plano.gd. No se edita a
## mano: se vuelve a correr la herramienta.

## La escala: un pixel del mapa son tantos de la sala.
const ESCALA := 12.0

## Sala -> su rectangulo en el mundo, su nivel, sus Altares y sus pasos
## (en el mundo; con su destino, para saber si ya se cruzo).
const SALAS := {
	"res://escenas/nivel1/capilla.tscn": {
		"rect": Rect2(Vector2(1212, 1832), Vector2(960, 368)),
		"nivel": "nivel1",
		"altares": [],
		"pasos": [{"centro": Vector2(2156, 2104), "destino": "res://escenas/nivel1/pozo.tscn", "escondido": false}, {"centro": Vector2(1276, 2184), "destino": "res://escenas/nivel1/escalera.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/claustro.tscn": {
		"rect": Rect2(Vector2(640, 88), Vector2(1280, 544)),
		"nivel": "nivel1",
		"altares": [],
		"pasos": [{"centro": Vector2(656, 280), "destino": "res://escenas/nivel1/pabellon.tscn", "escondido": false}, {"centro": Vector2(1904, 504), "destino": "res://escenas/nivel1/nave.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/escalera.tscn": {
		"rect": Rect2(Vector2(1180, 2200), Vector2(960, 544)),
		"nivel": "nivel1",
		"altares": [Vector2(1588, 2680)],
		"pasos": [{"centro": Vector2(1660, 2656), "destino": "res://escenas/nivel1/umbral.tscn", "escondido": false}, {"centro": Vector2(1276, 2232), "destino": "res://escenas/nivel1/capilla.tscn", "escondido": false}, {"centro": Vector2(2044, 2232), "destino": "res://escenas/nivel1/muro.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/muro.tscn": {
		"rect": Rect2(Vector2(2812, 1832), Vector2(1120, 368)),
		"nivel": "nivel1",
		"altares": [],
		"pasos": [{"centro": Vector2(2828, 2104), "destino": "res://escenas/nivel1/pozo.tscn", "escondido": false}, {"centro": Vector2(3868, 2184), "destino": "res://escenas/nivel1/escalera.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/nave.tscn": {
		"rect": Rect2(Vector2(1920, 248), Vector2(960, 1120)),
		"nivel": "nivel1",
		"altares": [Vector2(2040, 536), Vector2(2020, 936)],
		"pasos": [{"centro": Vector2(1926, 504), "destino": "res://escenas/nivel1/claustro.tscn", "escondido": false}, {"centro": Vector2(2300, 1240), "destino": "res://escenas/nivel1/pozo.tscn", "escondido": false}, {"centro": Vector2(2080, 1240), "destino": "res://escenas/nivel2/nave_libro.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/pabellon.tscn": {
		"rect": Rect2(Vector2(0, 0), Vector2(640, 368)),
		"nivel": "nivel1",
		"altares": [Vector2(88, 304)],
		"pasos": [{"centro": Vector2(624, 280), "destino": "res://escenas/nivel1/claustro.tscn", "escondido": false}, {"centro": Vector2(480, 280), "destino": "res://escenas/nivel3/sala_7.tscn", "escondido": true}],
	},
	"res://escenas/nivel1/pozo.tscn": {
		"rect": Rect2(Vector2(2172, 1368), Vector2(640, 960)),
		"nivel": "nivel1",
		"altares": [],
		"pasos": [{"centro": Vector2(2300, 1448), "destino": "res://escenas/nivel1/nave.tscn", "escondido": false}, {"centro": Vector2(2188, 2104), "destino": "res://escenas/nivel1/capilla.tscn", "escondido": false}, {"centro": Vector2(2796, 2104), "destino": "res://escenas/nivel1/muro.tscn", "escondido": false}],
	},
	"res://escenas/nivel1/umbral.tscn": {
		"rect": Rect2(Vector2(1596, 2744), Vector2(640, 368)),
		"nivel": "nivel1",
		"altares": [],
		"pasos": [{"centro": Vector2(1660, 3024), "destino": "res://escenas/nivel1/escalera.tscn", "escondido": false}, {"centro": Vector2(2108, 3024), "destino": "res://escenas/nivel2/registro.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/ala.tscn": {
		"rect": Rect2(Vector2(4244, 3924), Vector2(960, 368)),
		"nivel": "nivel2",
		"altares": [Vector2(4348, 4228)],
		"pasos": [{"centro": Vector2(4420, 4204), "destino": "res://escenas/nivel2/registro.tscn", "escondido": false}, {"centro": Vector2(5124, 4204), "destino": "res://escenas/nivel2/laboratorio.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/archivo.tscn": {
		"rect": Rect2(Vector2(3596, 4224), Vector2(640, 640)),
		"nivel": "nivel2",
		"altares": [],
		"pasos": [{"centro": Vector2(3916, 4240), "destino": "res://escenas/nivel2/sorteos.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/escribania.tscn": {
		"rect": Rect2(Vector2(2092, 3560), Vector2(800, 368)),
		"nivel": "nivel2",
		"altares": [],
		"pasos": [{"centro": Vector2(2252, 3600), "destino": "res://escenas/nivel2/registro.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/laboratorio.tscn": {
		"rect": Rect2(Vector2(5204, 3828), Vector2(800, 480)),
		"nivel": "nivel2",
		"altares": [],
		"pasos": [{"centro": Vector2(5252, 4204), "destino": "res://escenas/nivel2/ala.tscn", "escondido": false}, {"centro": Vector2(5924, 4076), "destino": "res://escenas/nivel2/nave_libro.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/nave_libro.tscn": {
		"rect": Rect2(Vector2(6004, 3796), Vector2(1024, 368)),
		"nivel": "nivel2",
		"altares": [Vector2(6108, 4100)],
		"pasos": [{"centro": Vector2(6052, 4076), "destino": "res://escenas/nivel2/laboratorio.tscn", "escondido": false}, {"centro": Vector2(6980, 4076), "destino": "res://escenas/nivel1/nave.tscn", "escondido": false}, {"centro": Vector2(6916, 4076), "destino": "res://escenas/nivel3/bajada.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/pasillo.tscn": {
		"rect": Rect2(Vector2(2684, 3932), Vector2(1440, 288)),
		"nivel": "nivel2",
		"altares": [],
		"pasos": [{"centro": Vector2(2732, 4132), "destino": "res://escenas/nivel2/registro.tscn", "escondido": false}, {"centro": Vector2(4108, 4108), "destino": "res://escenas/nivel2/ala.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/registro.tscn": {
		"rect": Rect2(Vector2(2092, 3112), Vector2(960, 448)),
		"nivel": "nivel2",
		"altares": [Vector2(2388, 3496)],
		"pasos": [{"centro": Vector2(2108, 3464), "destino": "res://escenas/nivel1/umbral.tscn", "escondido": false}, {"centro": Vector2(2252, 3544), "destino": "res://escenas/nivel2/escribania.tscn", "escondido": false}, {"centro": Vector2(3036, 3288), "destino": "res://escenas/nivel2/sorteos.tscn", "escondido": false}, {"centro": Vector2(2732, 3472), "destino": "res://escenas/nivel2/pasillo.tscn", "escondido": false}, {"centro": Vector2(2556, 3472), "destino": "res://escenas/nivel2/ala.tscn", "escondido": false}],
	},
	"res://escenas/nivel2/sorteos.tscn": {
		"rect": Rect2(Vector2(3052, 3016), Vector2(960, 368)),
		"nivel": "nivel2",
		"altares": [],
		"pasos": [{"centro": Vector2(3068, 3288), "destino": "res://escenas/nivel2/registro.tscn", "escondido": false}, {"centro": Vector2(3916, 3368), "destino": "res://escenas/nivel2/archivo.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/antesala.tscn": {
		"rect": Rect2(Vector2(11300, 3764), Vector2(576, 288)),
		"nivel": "nivel3",
		"altares": [Vector2(11436, 3988)],
		"pasos": [{"centro": Vector2(11764, 3964), "destino": "res://escenas/nivel3/sala_7.tscn", "escondido": false}, {"centro": Vector2(11316, 3956), "destino": "res://escenas/nivel3/sala_6.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/bajada.tscn": {
		"rect": Rect2(Vector2(6852, 4164), Vector2(704, 416)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(6916, 4300), "destino": "res://escenas/nivel2/nave_libro.tscn", "escondido": false}, {"centro": Vector2(7540, 4500), "destino": "res://escenas/nivel3/sala_1.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/lavatorio.tscn": {
		"rect": Rect2(Vector2(8292, 4244), Vector2(832, 352)),
		"nivel": "nivel3",
		"altares": [Vector2(8428, 4532)],
		"pasos": [{"centro": Vector2(8308, 4500), "destino": "res://escenas/nivel3/sala_1.tscn", "escondido": false}, {"centro": Vector2(9108, 4500), "destino": "res://escenas/nivel3/sala_3.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/sala_1.tscn": {
		"rect": Rect2(Vector2(7556, 4276), Vector2(736, 320)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(7572, 4500), "destino": "res://escenas/nivel3/bajada.tscn", "escondido": false}, {"centro": Vector2(8276, 4500), "destino": "res://escenas/nivel3/lavatorio.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/sala_3.tscn": {
		"rect": Rect2(Vector2(9124, 3860), Vector2(480, 736)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(9140, 4500), "destino": "res://escenas/nivel3/lavatorio.tscn", "escondido": false}, {"centro": Vector2(9588, 4004), "destino": "res://escenas/nivel3/sala_5.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/sala_5.tscn": {
		"rect": Rect2(Vector2(9604, 3684), Vector2(736, 416)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(9620, 4004), "destino": "res://escenas/nivel3/sala_3.tscn", "escondido": false}, {"centro": Vector2(10324, 4004), "destino": "res://escenas/nivel3/sala_6.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/sala_6.tscn": {
		"rect": Rect2(Vector2(10340, 3812), Vector2(960, 416)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(10356, 4004), "destino": "res://escenas/nivel3/sala_5.tscn", "escondido": false}, {"centro": Vector2(11284, 3956), "destino": "res://escenas/nivel3/antesala.tscn", "escondido": false}],
	},
	"res://escenas/nivel3/sala_7.tscn": {
		"rect": Rect2(Vector2(11716, 4052), Vector2(768, 320)),
		"nivel": "nivel3",
		"altares": [],
		"pasos": [{"centro": Vector2(11764, 4284), "destino": "res://escenas/nivel3/antesala.tscn", "escondido": false}, {"centro": Vector2(12388, 4284), "destino": "res://escenas/nivel1/pabellon.tscn", "escondido": false}, {"centro": Vector2(12436, 4284), "destino": "", "escondido": false}],
	},
}
