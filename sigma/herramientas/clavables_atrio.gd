## Las paredes donde se clava el bisturi (feedback de Jean: «poder engancharse a
## cualquier pared es un poco complejo; deberiamos hacer secciones especiales»).
## Como en el original (#161): la membrana, tejido vivo sobre la piedra. Se ve
## distinta de la piedra, y solo en ella se clava el bisturi.
##
## Pasa a una capa propia, «Membranas», las paredes que el original marcaba
## como superficies de agarre (importar_atrio.gd, PAREDES): asi el Atrio se
## sigue pudiendo recorrer igual. Se corrio UNA vez; desde entonces se pinta en
## el editor, en la capa Membranas.
##
##   godot --headless --path sigma -s res://herramientas/clavables_atrio.gd
extends SceneTree

const ESCENA := "res://escenas/atrio.tscn"
const TILESET := "res://arte/silleria/membrana.tres"
const TEXTURA := "res://arte/provisional/membrana-muro.png"

## [columna, primera fila, fila final sin incluir], las de importar_atrio.gd.
const PAREDES := [
	[59, 23, 59],
	[35, 38, 49],
	[0, 9, 13],
	[44, 59, 63],
]


func _initialize() -> void:
	var membrana := _crear_tileset()
	var escena: Node = (load(ESCENA) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	var silleria: TileMapLayer = escena.get_node("Silleria")
	if escena.has_node("Membranas"):
		var vieja := escena.get_node("Membranas")
		escena.remove_child(vieja)
		vieja.free()

	var capa := TileMapLayer.new()
	capa.name = "Membranas"
	capa.tile_set = membrana
	capa.modulate = silleria.modulate
	capa.add_to_group("clavable", true)
	escena.add_child(capa)
	escena.move_child(capa, silleria.get_index() + 1)
	capa.owner = escena

	var movidas := 0
	for p in PAREDES:
		for fila in range(p[1], p[2]):
			var celda := Vector2i(p[0], fila)
			if silleria.get_cell_source_id(celda) == -1:
				push_warning("En %s no hay piedra que volver membrana" % celda)
				continue
			silleria.erase_cell(celda)
			capa.set_cell(celda, 0, Vector2i.ZERO)
			movidas += 1

	var empaquetada := PackedScene.new()
	empaquetada.pack(escena)
	var error := ResourceSaver.save(empaquetada, ESCENA)
	print("Membranas: %d tiles, guardado: %s" % [movidas, error_string(error)])
	escena.free()
	quit(0 if error == OK else 1)


func _crear_tileset() -> TileSet:
	var membrana := TileSet.new()
	membrana.tile_size = Vector2i(16, 16)
	membrana.add_physics_layer()
	membrana.set_physics_layer_collision_layer(0, 1)
	var fuente := TileSetAtlasSource.new()
	fuente.texture = load(TEXTURA)
	fuente.texture_region_size = Vector2i(16, 16)
	membrana.add_source(fuente, 0)
	fuente.create_tile(Vector2i.ZERO)
	var datos := fuente.get_tile_data(Vector2i.ZERO, 0)
	datos.add_collision_polygon(0)
	datos.set_collision_polygon_points(0, 0, PackedVector2Array([Vector2(-8, -8), Vector2(8, -8), Vector2(8, 8), Vector2(-8, 8)]))
	ResourceSaver.save(membrana, TILESET)
	membrana.take_over_path(TILESET)
	return membrana
