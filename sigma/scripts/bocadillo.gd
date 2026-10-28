## Lo que dicen los enemigos al ver al Cirujano: una frase corta sobre la
## cabeza que aparece, se queda un momento y se va. Es como se cuenta por que
## lo atacan (canon, «Por que lo atacan»): cumplen la ley de la Mano que mira.
extends RefCounted

## Por encima de la cabeza de una figura de unos 50 px.
const ALTURA := -66.0
const COLOR := Color(0.88, 0.82, 0.74)
const ENTRA_S := 0.15
const QUEDA_S := 1.8
const SALE_S := 0.4


## Pone `texto` sobre `quien`, a `altura` de sus pies (por defecto, la de una
## figura de unos 50 px). Si no esta en una escena (en los tests), nada.
static func decir(quien: Node2D, texto: String, altura := ALTURA) -> void:
	if not quien.is_inside_tree():
		return
	var frase := Label.new()
	frase.text = texto
	frase.z_index = 20
	frase.add_theme_color_override("font_color", COLOR)
	frase.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	frase.size = Vector2(200.0, 18.0)
	frase.position = Vector2(-100.0, altura)
	frase.modulate.a = 0.0
	quien.add_child(frase)
	var vida := frase.create_tween()
	vida.tween_property(frase, "modulate:a", 1.0, ENTRA_S)
	vida.tween_interval(QUEDA_S)
	vida.tween_property(frase, "modulate:a", 0.0, SALE_S)
	vida.tween_callback(frase.queue_free)
