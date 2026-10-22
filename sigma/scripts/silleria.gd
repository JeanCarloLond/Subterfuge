## Viste la silleria al cargar (scripts/silleria-sigma.mjs): a cada piedra le
## pone la baldosa de sus lados al aire, como en Blasphemous. La cara de
## arriba, la que se pisa, sale clara; los cantos, con bisel; lo de dentro, en
## sombra. El mapa se pinta con cualquier baldosa de piedra: aqui se elige la
## que toca, asi que pintar en el editor no cambia.
extends TileMapLayer

## Las columnas del atlas son la mascara de lados al aire (1 arriba,
## 2 derecha, 4 abajo, 8 izquierda); las filas, las variantes.
const VARIANTES := 4


func _ready() -> void:
	vestir(self)


static func vestir(capa: TileMapLayer) -> void:
	for celda in capa.get_used_cells():
		capa.set_cell(celda, 0, Vector2i(mascara(capa, celda), variante(celda)))


static func mascara(capa: TileMapLayer, celda: Vector2i) -> int:
	var al_aire := 0
	for lado in [[Vector2i.UP, 1], [Vector2i.RIGHT, 2], [Vector2i.DOWN, 4], [Vector2i.LEFT, 8]]:
		if capa.get_cell_source_id(celda + lado[0]) == -1:
			al_aire |= lado[1]
	return al_aire


## La variante, por el sitio y no al azar: la misma piedra sale igual siempre.
static func variante(celda: Vector2i) -> int:
	return absi((celda.x * 73856093) ^ (celda.y * 19349663)) % VARIANTES
