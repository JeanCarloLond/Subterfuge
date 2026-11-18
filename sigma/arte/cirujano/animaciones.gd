## Generado por scripts/nico-sigma.mjs con el arte de Nico: no se edita a mano.
## Cuantos fotogramas tiene cada animacion del Cirujano.
extends RefCounted

## El pie de la figura dentro del fotograma (51x54).
const ORIGEN := Vector2i(25, 54)

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
	"reposo": [Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15)],
	"correr": [Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14), Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14)],
	"andar": [Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14), Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14)],
	"salto": [Vector2i(28, 15)],
	"caida": [Vector2i(28, 15), Vector2i(28, 15)],
	"aterrizaje": [Vector2i(28, 15)],
	"dash": [Vector2i(28, 13)],
	"agarre": [Vector2i(28, 15)],
	"agarre-girado": [Vector2i(28, 15)],
	"herido": [Vector2i(32, 16)],
	"rezar": [Vector2i(29, 20)],
	"guardia": [Vector2i(24, 15), Vector2i(24, 15)],
	"golpe": [Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15), Vector2i(25, 15), Vector2i(31, 14), Vector2i(28, 15)],
	"cargado": [Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15), Vector2i(25, 15), Vector2i(31, 14), Vector2i(28, 15)],
	"arriba": [Vector2i(28, 15), Vector2i(25, 15), Vector2i(25, 15), Vector2i(31, 14)],
	"abajo": [Vector2i(31, 14), Vector2i(28, 15), Vector2i(28, 15)],
	"contragolpe": [Vector2i(28, 15), Vector2i(27, 15), Vector2i(27, 15), Vector2i(28, 15)],
	"bebe": [Vector2i(29, 17), Vector2i(29, 20), Vector2i(29, 20)],
	"alza": [Vector2i(25, 15), Vector2i(25, 15)],
	"tajo": [Vector2i(25, 15), Vector2i(31, 14), Vector2i(28, 15)],
	"muerte": [Vector2i(31, 16), Vector2i(32, 16), Vector2i(32, 16), Vector2i(32, 16)],
	"intro-andar": [Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14), Vector2i(28, 15), Vector2i(28, 14), Vector2i(28, 13), Vector2i(28, 14)],
	"intro-reposo": [Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15), Vector2i(28, 15)],
	"intro-alza": [Vector2i(25, 15), Vector2i(25, 15)],
}
