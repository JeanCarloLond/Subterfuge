## Generado por scripts/cirujano-sigma.mjs: no se edita a mano.
## Cuantos fotogramas tiene cada animacion del Cirujano.
extends RefCounted

const RECUENTO := {
	"reposo": 4,
	"correr": 8,
	"salto": 1,
	"caida": 2,
	"aterrizaje": 1,
	"dash": 1,
	"agarre": 1,
	"agarre-girado": 1,
	"herido": 1,
	"rezar": 1,
	"guardia": 2,
	"golpe": 6,
	"cargado": 6,
	"arriba": 4,
	"abajo": 3,
	"contragolpe": 4,
	"bebe": 3,
	"alza": 2,
	"tajo": 3,
	"muerte": 4,
}

## Donde cae el ojo rojo en cada fotograma, en pixeles del fotograma.
const OJOS := {
	"reposo": [Vector2i(23, 18), Vector2i(23, 18), Vector2i(23, 19), Vector2i(23, 19)],
	"correr": [Vector2i(26, 18), Vector2i(26, 19), Vector2i(26, 19), Vector2i(26, 19), Vector2i(26, 18), Vector2i(26, 19), Vector2i(26, 19), Vector2i(26, 19)],
	"salto": [Vector2i(23, 16)],
	"caida": [Vector2i(22, 18), Vector2i(21, 17)],
	"aterrizaje": [Vector2i(25, 22)],
	"dash": [Vector2i(33, 23)],
	"agarre": [Vector2i(25, 18)],
	"agarre-girado": [Vector2i(20, 18)],
	"herido": [Vector2i(14, 19)],
	"rezar": [Vector2i(27, 26)],
	"guardia": [Vector2i(21, 18), Vector2i(20, 19)],
	"golpe": [Vector2i(20, 19), Vector2i(18, 19), Vector2i(24, 18), Vector2i(28, 18), Vector2i(26, 18), Vector2i(24, 18)],
	"cargado": [Vector2i(17, 21), Vector2i(15, 22), Vector2i(24, 19), Vector2i(31, 21), Vector2i(28, 19), Vector2i(24, 18)],
	"arriba": [Vector2i(23, 21), Vector2i(21, 17), Vector2i(21, 16), Vector2i(22, 18)],
	"abajo": [Vector2i(23, 17), Vector2i(24, 18), Vector2i(24, 18)],
	"contragolpe": [Vector2i(20, 19), Vector2i(33, 23), Vector2i(33, 22), Vector2i(26, 19)],
	"bebe": [Vector2i(22, 18), Vector2i(19, 17), Vector2i(20, 17)],
	"alza": [Vector2i(20, 16), Vector2i(19, 15)],
	"tajo": [Vector2i(27, 20), Vector2i(32, 24), Vector2i(32, 24)],
	"muerte": [Vector2i(12, 20), Vector2i(26, 24), Vector2i(32, 30), Vector2i(37, 37)],
}
