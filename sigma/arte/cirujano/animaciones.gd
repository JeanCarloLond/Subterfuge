## Generado por scripts/nico-sigma.mjs con el arte de Nico: no se edita a mano.
## Cuantos fotogramas tiene cada animacion del Cirujano.
extends RefCounted

## El pie de la figura dentro del fotograma (64x67).
const ORIGEN := Vector2i(31, 67)

const RECUENTO := {
	"reposo": 4,
	"correr": 8,
	"andar": 8,
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
	"intro-andar": 8,
	"intro-reposo": 4,
	"intro-alza": 2,
}

## Donde cae el ojo rojo en cada fotograma, en pixeles del fotograma.
const OJOS := {
	"reposo": [Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18)],
	"correr": [Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17), Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17)],
	"andar": [Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17), Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17)],
	"salto": [Vector2i(36, 18)],
	"caida": [Vector2i(36, 18), Vector2i(36, 18)],
	"aterrizaje": [Vector2i(36, 19)],
	"dash": [Vector2i(35, 16)],
	"agarre": [Vector2i(36, 18)],
	"agarre-girado": [Vector2i(36, 18)],
	"herido": [Vector2i(40, 20)],
	"rezar": [Vector2i(37, 25)],
	"guardia": [Vector2i(30, 19), Vector2i(30, 19)],
	"golpe": [Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18), Vector2i(32, 18), Vector2i(39, 17), Vector2i(35, 18)],
	"cargado": [Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18), Vector2i(32, 18), Vector2i(39, 17), Vector2i(35, 18)],
	"arriba": [Vector2i(35, 18), Vector2i(32, 18), Vector2i(32, 18), Vector2i(39, 17)],
	"abajo": [Vector2i(39, 17), Vector2i(35, 18), Vector2i(35, 18)],
	"contragolpe": [Vector2i(35, 18), Vector2i(34, 18), Vector2i(34, 18), Vector2i(35, 18)],
	"bebe": [Vector2i(37, 21), Vector2i(37, 25), Vector2i(37, 25)],
	"alza": [Vector2i(32, 18), Vector2i(32, 18)],
	"tajo": [Vector2i(32, 18), Vector2i(39, 17), Vector2i(35, 18)],
	"muerte": [Vector2i(39, 19), Vector2i(40, 20), Vector2i(40, 20), Vector2i(40, 20)],
	"intro-andar": [Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17), Vector2i(35, 18), Vector2i(35, 17), Vector2i(35, 16), Vector2i(35, 17)],
	"intro-reposo": [Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18), Vector2i(35, 18)],
	"intro-alza": [Vector2i(32, 18), Vector2i(32, 18)],
}
