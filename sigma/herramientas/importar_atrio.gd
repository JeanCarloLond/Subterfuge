## Pasa la silleria del Atrio de Phaser (src/scenes/AtrioScene.ts) a la escena
## de Sigma (#185). Se corrio UNA vez; desde entonces escenas/atrio.tscn se
## edita en el editor de Godot. Volver a correrlo pisa la piedra pintada a mano:
##
##   godot --headless --path sigma -s res://herramientas/importar_atrio.gd
##
## Tambien crea el TileSet de la silleria del equipo (arte/silleria/vientre.png,
## de agr-23): ocho variantes de 16x16, todas solidas.
##
## En Phaser cada bloque iba en cualquier x; un TileMap va en rejilla de 16.
## Por eso el trazado esta redondeado a mano, y cada cambio que toca una regla
## del nivel esta comprobado al lado: la ruta de vuelta sigue solapando y los
## huecos de dash siguen pidiendo dash (un salto plano llega a 112 px; con dash,
## a unos 169).
extends SceneTree

const ESCENA := "res://escenas/atrio.tscn"
const TILESET := "res://arte/silleria/vientre.tres"
const TEXTURA := "res://arte/silleria/vientre.png"
const VARIANTES := 8

## [columna, fila, ancho en tiles]. Entre parentesis, el original en px.
const PLATAFORMAS := [
	[0, 18, 22], # suelo inicial (0, 288)
	# Campanario: las dos repisas bajan 8 px y siguen a 80 px una de otra.
	[3, 13, 4], # (48, 200): ahora a 80 px del suelo
	[0, 8, 3], # (0, 120)
	# Ruta alta.
	[25, 15, 5], # (400, 240)
	[34, 8, 5], # (540, 128): 112 px, doble salto
	[48, 8, 4], # (760, 128): hueco de 144 (era 140), sigue pidiendo dash
	# Descenso y ruta de vuelta: cada tramo solapa con el de arriba.
	[21, 23, 6], # (330, 368): solapa 16 px con el suelo (eran 22)
	[16, 28, 6], # (250, 448)
	[21, 33, 6], # (330, 528)
	[16, 38, 6], # (250, 608)
	[4, 43, 16], # (60, 688)
	[19, 48, 8], # (300, 768)
	[11, 53, 12], # (180, 848)
	[21, 58, 12], # (340, 928)
	[8, 63, 20], # (120, 1008): el fondo, con el umbral
	# Capilla lateral: hueco de 128 (era 134), con dash.
	[35, 33, 7], # (560, 528)
	# Nicho del fondo: hueco de 144 (era 150), con dash.
	[37, 63, 7], # (590, 1008)
]

## [columna, primera fila, fila final sin incluir]. Superficies de agarre.
const PAREDES := [
	[59, 23, 59], # (944, 360..940)
	[35, 38, 49], # (560, 600..780)
	[0, 9, 13], # (0, 136..200): la que se trepa al campanario
	[44, 59, 63], # (704, 940..1010): cierra el nicho por detras
]


func _initialize() -> void:
	var silleria := _crear_tileset()
	var escena: Node = (load(ESCENA) as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE)
	var capa: TileMapLayer = escena.get_node("Silleria")
	capa.tile_set = silleria
	capa.clear()

	for p in PLATAFORMAS:
		for i in p[2]:
			_poner(capa, p[0] + i, p[1])
	for p in PAREDES:
		for fila in range(p[1], p[2]):
			_poner(capa, p[0], fila)

	var empaquetada := PackedScene.new()
	empaquetada.pack(escena)
	var error := ResourceSaver.save(empaquetada, ESCENA)
	print("Atrio: %d tiles, guardado: %s" % [capa.get_used_cells().size(), error_string(error)])
	escena.free()
	quit(0 if error == OK else 1)


func _crear_tileset() -> TileSet:
	var silleria := TileSet.new()
	silleria.tile_size = Vector2i(16, 16)
	silleria.add_physics_layer()
	silleria.set_physics_layer_collision_layer(0, 1)

	var fuente := TileSetAtlasSource.new()
	fuente.texture = load(TEXTURA)
	fuente.texture_region_size = Vector2i(16, 16)
	silleria.add_source(fuente, 0)

	var cuadrado := PackedVector2Array([Vector2(-8, -8), Vector2(8, -8), Vector2(8, 8), Vector2(-8, 8)])
	for i in VARIANTES:
		fuente.create_tile(Vector2i(i, 0))
		var datos := fuente.get_tile_data(Vector2i(i, 0), 0)
		datos.add_collision_polygon(0)
		datos.set_collision_polygon_points(0, 0, cuadrado)

	ResourceSaver.save(silleria, TILESET)
	silleria.take_over_path(TILESET)
	return silleria


## La variante sale de la posicion y no al azar: rompe la repeticion y sale
## igual cada vez. El mismo hash que EscenaNivel.ts.
func _poner(capa: TileMapLayer, columna: int, fila: int) -> void:
	var variante := _ruido(columna * 16, fila * 16, 1) % VARIANTES
	capa.set_cell(Vector2i(columna, fila), 0, Vector2i(variante, 0))


func _ruido(x: int, y: int, sal: int) -> int:
	var n := ((x * 73856093) ^ (y * 19349663) ^ (sal * 83492791)) & 0xFFFFFFFF
	n = ((n ^ (n >> 15)) * 0x2c1b3c6d) & 0xFFFFFFFF
	n = ((n ^ (n >> 12)) * 0x297a2d39) & 0xFFFFFFFF
	return n ^ (n >> 15)
