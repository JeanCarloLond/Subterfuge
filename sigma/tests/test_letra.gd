## La letra legible (feedback de Jean: «la letra es ilegible en la mayoria de
## situaciones»). Lo que se lee jugando va en VT323 a 16 px por el tema del
## proyecto; si alguien lo quita, todo vuelve a la fuente de Godot a 8 px.
extends "res://tests/caso.gd"


func test_el_proyecto_usa_el_tema_legible() -> void:
	afirmar_igual(ProjectSettings.get_setting("gui/theme/custom"), "res://arte/tema.tres", "tema del proyecto")
	var tema: Theme = load("res://arte/tema.tres")
	afirmar_igual(tema.default_font.resource_path, "res://arte/fuentes/VT323-Regular.ttf", "fuente por defecto")
	afirmar(tema.default_font_size >= 16, "a 16 px o mas")


func test_ningun_texto_vuelve_a_8_px() -> void:
	for carpeta in ["res://escenas", "res://scripts"]:
		for archivo in DirAccess.get_files_at(carpeta):
			if not (archivo.ends_with(".tscn") or archivo.ends_with(".gd")):
				continue
			var texto := FileAccess.get_file_as_string("%s/%s" % [carpeta, archivo])
			afirmar(not texto.contains("font_size = 8\n"), "%s pone texto a 8 px" % archivo)
			afirmar(not texto.contains("\"font_size\", 8)"), "%s pone texto a 8 px" % archivo)
